param(
  [switch]$Detached,
  [int]$MongoPort = 27017,
  [string]$DBName = 'pattasu',
  [switch]$UseDockerRun
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Write-Log($msg){ Write-Host "[info] $msg" -ForegroundColor Cyan }

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker CLI not found. Install Docker Desktop and try again."
  exit 1
}

# detect compose command
$composeCmd = $null
try {
  & docker compose version > $null 2>&1
  $composeCmd = 'docker compose'
} catch {
  if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeCmd = 'docker-compose'
  } else {
    Write-Error "Neither 'docker compose' nor 'docker-compose' available. Ensure Docker Compose is installed."
    exit 1
  }
}

Write-Log "Using compose command: $composeCmd"

# decide whether to use docker compose or docker run
$useDockerRun = $false
if ($UseDockerRun) { $useDockerRun = $true }
if ($MongoPort -ne 27017 -or $DBName -ne 'pattasu') { $useDockerRun = $true }

if ($useDockerRun) {
  Write-Log "Starting MongoDB with 'docker run' (port $MongoPort, db '$DBName')..."
  # remove any existing container named pattasu-mongo
  try { & docker rm -f pattasu-mongo > $null 2>&1 } catch {}

  $hostDataDir = Join-Path $root 'mongo-data'
  if (-not (Test-Path $hostDataDir)) { New-Item -ItemType Directory -Path $hostDataDir | Out-Null }

  & docker run -d --name pattasu-mongo -p ${MongoPort}:27017 -v "${hostDataDir}:/data/db" -e MONGO_INITDB_DATABASE=$DBName mongo:6
} else {
  # use docker compose if available
  if (-not (Test-Path "$root\docker-compose.yml")) {
    Write-Error "docker-compose.yml not found in $root"
    exit 1
  }

  Write-Log "Bringing up MongoDB container via docker compose..."
  if ($composeCmd -eq 'docker compose') {
    & docker compose up -d
  } else {
    & docker-compose up -d
  }
}

# prepare .env
$envFile = Join-Path $root '.env'
$example = Join-Path $root '.env.example'
if (-not (Test-Path $example)) {
  Write-Log ".env.example not found; creating minimal .env.example"
  Set-Content -Path $example -Value "MONGO_URI=mongodb://localhost:27017/pattasu`nMIGRATE_JSON=1`nJWT_SECRET=crackers-shop-super-secret-key"
}

if (-not (Test-Path $envFile)) {
  Copy-Item $example $envFile
  Write-Log "Created .env from .env.example"
} else {
  function Upsert-EnvVar($file, $key, $value) {
    $text = Get-Content $file -Raw
    if ($text -match "(?m)^[ \t]*$key=") {
      $newText = $text -replace "(?m)^[ \t]*$key=.*", "$key=$value"
      Set-Content -Path $file -Value $newText
    } else {
      Add-Content -Path $file -Value "$key=$value"
    }
  }

  Upsert-EnvVar $envFile 'MONGO_URI' "mongodb://localhost:${MongoPort}/$DBName"
  Upsert-EnvVar $envFile 'MIGRATE_JSON' '1'
  Write-Log "Updated .env (MONGO_URI and MIGRATE_JSON ensured)"
}

# npm install if needed
if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Log "Installing npm dependencies..."
  npm install
}

# Start server
if ($Detached) {
  $logsDir = Join-Path $root 'logs'
  if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }
  $outLog = Join-Path $logsDir 'server.log'
  $errLog = Join-Path $logsDir 'server.err'
  Write-Log "Starting server detached; logs -> $outLog"
  Start-Process -FilePath "node" -ArgumentList "-r dotenv/config server.js" -WorkingDirectory $root -RedirectStandardOutput $outLog -RedirectStandardError $errLog -WindowStyle Hidden | Out-Null
  Write-Log "Server started in background. Use 'Get-Content -Wait $outLog' to tail logs."
} else {
  Write-Log "Starting server (foreground). Press Ctrl+C to stop."
  node -r dotenv/config server.js
}
