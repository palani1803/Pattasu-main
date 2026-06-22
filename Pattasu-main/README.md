<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/68d0cea6-9a04-46ed-8776-de1b405e669b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## MongoDB (optional)

This project supports an optional MongoDB data layer. For development you can run MongoDB locally with Docker, or use MongoDB Atlas for a managed DB.

- Local (Docker):
   1. Ensure Docker Desktop is installed and running.
   2. Start MongoDB: `docker-compose up -d` (runs the `mongo` service defined in `docker-compose.yml`).
   3. Copy the example env: `copy .env.example .env` and verify `MONGO_URI=mongodb://localhost:27017/pattasu` and `MIGRATE_JSON=1` are set.
   4. Start the server (migration will import `server/data/db.json` into MongoDB):
       `node server.js`

- Local (helper script):
   - Run `.\start-with-mongo.ps1` from the project root to start Docker, ensure `.env`, install deps, and run the server. Use `-Detached` to run the server in background; logs are written to `logs/server.log`.

- Atlas (managed):
   1. Create a cluster on MongoDB Atlas.
   2. Add a DB user and whitelist your IP.
   3. Copy the connection string (example):
       `mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/pattasu?retryWrites=true&w=majority`
   4. Set `MONGO_URI` in `.env` to the Atlas URI and set `MIGRATE_JSON=1` if you want to import existing JSON data on startup.

If `MONGO_URI` is not set, the app uses the built-in file-based JSON store at `server/data/db.json`.

### Helper script options

The included helper script `start-with-mongo.ps1` can automate Docker, .env, install and server start. It accepts these optional parameters:

- `-MongoPort <port>`: start Mongo on a custom host port (default `27017`). Example: `-MongoPort 37017`.
- `-DBName <name>`: set the database name used in the connection URI (default `pattasu`). Example: `-DBName mydb`.
- `-UseDockerRun`: force the script to use `docker run` instead of `docker compose`.
- `-Detached`: run the Node server in the background (logs written to `logs/server.log`).

Examples:

Run with custom port and DB name (uses `docker run`):
```powershell
.\start-with-mongo.ps1 -MongoPort 37017 -DBName mypattasu
```

Run using docker-compose and keep server in background:
```powershell
.\start-with-mongo.ps1 -Detached
```

