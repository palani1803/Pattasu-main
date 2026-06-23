import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import * as fileDB from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// start with file-based DB as default; may be replaced at runtime with MongoDB layer
let collections = fileDB.collections;
let verifyUserPassword = fileDB.verifyUserPassword;
let initDB = fileDB.initDB;
let getDB = fileDB.getDB;
let saveDB = fileDB.saveDB;

// Setup Server
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "crackers-shop-super-secret-key";

// Database layer will be prepared before server start (file-based by default)

app.use(express.json());

// Logger / Debug Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    res.status(403).json({ error: "Access denied. Admin role required." });
    return;
  }
  next();
};

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const users = await collections.users.findMany();
  const user = users.find((u) => u.email === email);
  if (!user) {
    res.status(401).json({ error: "Invalid email credentials" });
    return;
  }

  const isValid = verifyUserPassword(user, password);
  if (!isValid) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
 
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await collections.users.findById(req.user.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// ==========================================
// 2. PRODUCTS MODULE
// ==========================================
app.get("/api/products", authenticateToken, async (req, res) => {
  const products = await collections.products.findMany();
  res.json(products);
});

app.post("/api/products", authenticateToken, async (req, res) => {
  const { productName, category, netPrice, wholesalePrice, retailPrice, stock, discountAvailable, status } = req.body;

  if (!productName || !category) {
    res.status(400).json({ error: "Product Name and Category are required" });
    return;
  }

  const newProduct = await collections.products.insert({
    productName,
    category,
    netPrice: Number(netPrice) || 0,
    wholesalePrice: Number(wholesalePrice) || 0,
    retailPrice: Number(retailPrice) || 0,
    stock: Number(stock) || 0,
    discountAvailable: !!discountAvailable,
    status: status === 'inactive' ? 'inactive' : 'active'
  });

  res.status(201).json(newProduct);
});

app.put("/api/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { productName, category, netPrice, wholesalePrice, retailPrice, stock, discountAvailable, status } = req.body;

  const updated = await collections.products.update(id, {
    productName,
    category,
    netPrice: Number(netPrice),
    wholesalePrice: Number(wholesalePrice),
    retailPrice: Number(retailPrice),
    stock: Number(stock),
    discountAvailable: !!discountAvailable,
    status
  });

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(updated);
});

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const deleted = await collections.products.delete(id);
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ success: true, message: "Product deleted successfully" });
});

// ==========================================
// 3. CUSTOMER MODULE
// ==========================================
app.get("/api/customers", authenticateToken, async (req, res) => {
  const customers = await collections.customers.findMany();
  res.json(customers);
});

app.post("/api/customers", authenticateToken, async (req, res) => {
  const { customerName, mobile, address, city, gstNumber, customerType, balanceAmount } = req.body;

  if (!customerName || !mobile) {
    res.status(400).json({ error: "Customer Name and Mobile are required" });
    return;
  }

  const newCustomer = await collections.customers.insert({
    customerName,
    mobile,
    address: address || "",
    city: city || "",
    gstNumber: gstNumber || "",
    customerType: customerType === 'wholesale' ? 'wholesale' : 'retail',
    balanceAmount: Number(balanceAmount) || 0
  });

  res.status(201).json(newCustomer);
});


app.put("/api/customers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { customerName, mobile, address, city, gstNumber, customerType, balanceAmount } = req.body;
  const updated = await collections.customers.update(id, {
    customerName,
    mobile,
    address,
    city,
    gstNumber,
    customerType,
    balanceAmount: Number(balanceAmount)
  });

  if (!updated) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(updated);
});

app.delete("/api/customers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const deleted = await collections.customers.delete(id);
  if (!deleted) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json({ success: true, message: "Customer deleted successfully" });
});

// ==========================================
// 4. RETAIL BILLS MODULE
// ==========================================
app.get("/api/retail-bills", authenticateToken, async (req, res) => {
  const bills = await collections.retailBills.findMany();
  res.json(bills);
});

app.post("/api/retail-bills", authenticateToken, async (req, res) => {
  const { customer, items, subtotal, discount, grandTotal, paymentMode, paidAmount, balanceAmount } = req.body;

  if (!customer || !items || !items.length) {
    res.status(400).json({ error: "Customer name and bill items are required" });
    return;
  }

  const newBill = await collections.retailBills.insert({
    customer,
    items,
    subtotal: Number(subtotal) || 0,
    discount: Number(discount) || 0,
    grandTotal: Number(grandTotal) || 0,
    paymentMode: paymentMode || 'Cash',
    paidAmount: Number(paidAmount) || 0,
    balanceAmount: Number(balanceAmount) || 0
  });

  res.status(201).json(newBill);
});

// ==========================================
// 5. SUPPLIERS MODULE
// ==========================================
app.get("/api/suppliers", authenticateToken, async (req, res) => {
  const suppliers = await collections.suppliers.findMany();
  res.json(suppliers);
});

app.post("/api/suppliers", authenticateToken, async (req, res) => {
  const { supplierName, mobile, address, gstNumber } = req.body;

  if (!supplierName || !mobile) {
    res.status(400).json({ error: "Supplier Name and Mobile are required" });
    return;
  }

  const newSupplier = await collections.suppliers.insert({
    supplierName,
    mobile,
    address: address || "",
    gstNumber: gstNumber || ""
  });

  res.status(201).json(newSupplier);
});

app.put("/api/suppliers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { supplierName, mobile, address, gstNumber } = req.body;
  const updated = await collections.suppliers.update(id, {
    supplierName,
    mobile,
    address,
    gstNumber
  });

  if (!updated) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }

  res.json(updated);
});

app.delete("/api/suppliers/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const deleted = await collections.suppliers.delete(id);
  if (!deleted) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }
  res.json({ success: true, message: "Supplier deleted successfully" });
});

// ==========================================
// 6. PURCHASES MODULE
// ==========================================
app.get("/api/purchases", authenticateToken, async (req, res) => {
  const purchases = await collections.purchases.findMany();
  res.json(purchases);
});

app.post("/api/purchases", authenticateToken, async (req, res) => {
  const { supplier, products, totalAmount } = req.body;

  if (!supplier || !products || !products.length) {
    res.status(400).json({ error: "Supplier and products list are required" });
    return;
  }

  const newPurchase = await collections.purchases.insert({
    supplier,
    products,
    totalAmount: Number(totalAmount) || 0
  });

  res.status(201).json(newPurchase);
});

// ==========================================
// 7. TRANSPORT BILLS MODULE
// ==========================================
app.get("/api/transport-bills", authenticateToken, async (req, res) => {
  const tBills = await collections.transportBills.findMany();
  res.json(tBills);
});

app.post("/api/transport-bills", authenticateToken, async (req, res) => {
  const { customer, transportName, vehicleNumber, destination, items, transportCharge, totalAmount, dispatchDate, status } = req.body;

  if (!customer || !transportName) {
    res.status(400).json({ error: "Customer name and Transport company name are required" });
    return;
  }

  const newTBill = await collections.transportBills.insert({
    customer,
    transportName,
    vehicleNumber: vehicleNumber || "",
    destination: destination || "",
    items: items || [],
    transportCharge: Number(transportCharge) || 0,
    totalAmount: Number(totalAmount) || 0,
    dispatchDate: dispatchDate || new Date().toISOString(),
    status: status || 'Pending'
  });

  res.status(201).json(newTBill);
});

app.put("/api/transport-bills/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, vehicleNumber, transportName, destination, transportCharge } = req.body;
  const updated = await collections.transportBills.update(id, {
    status,
    vehicleNumber,
    transportName,
    destination,
    transportCharge: transportCharge !== undefined ? Number(transportCharge) : undefined
  });

  if (!updated) {
    res.status(404).json({ error: "Transport order not found" });
    return;
  }

  res.json(updated);
});

// ==========================================
// 8. REPORTS MODULE
// ==========================================
app.get("/api/reports", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999); // absolute end of today

  const retailBills = await collections.retailBills.findMany();
  const transportBills = await collections.transportBills.findMany();
  const products = await collections.products.findMany();
  const purchases = await collections.purchases.findMany();
  const customers = await collections.customers.findMany();

  // Filter bills in date range
  const filteredRetail = retailBills.filter(b => {
    const d = new Date(b.billDate);
    return d >= start && d <= end;
  });

  const filteredPurchases = purchases.filter(p => {
    const d = new Date(p.purchaseDate);
    return d >= start && d <= end;
  });

  const filteredTransport = transportBills.filter(t => {
    const d = new Date(t.dispatchDate);
    return d >= start && d <= end;
  });

  // Calculations
  const salesCount = filteredRetail.length;
  const salesTotal = filteredRetail.reduce((sum, b) => sum + b.grandTotal, 0);
  const purchaseTotal = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Outstanding Customers
  const customerOutstanding = customers.filter(c => c.balanceAmount > 0).map(c => ({
    customerId: c.id,
    customerName: c.customerName,
    mobile: c.mobile,
    outstandingAmount: c.balanceAmount,
    city: c.city,
    customerType: c.customerType
  }));

  // Low Stock Items
  const lowStockProducts = products.filter(p => p.stock <= 5);

  res.json({
    salesCount,
    salesTotal,
    purchaseTotal,
    retailBills: filteredRetail,
    purchases: filteredPurchases,
    transports: filteredTransport,
    customerOutstanding,
    lowStockProducts
  });
});

// ==========================================
// VITE INTEGRATION / SPA SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(__dirname, ".."),
      configFile: path.join(__dirname, "..", "vite.config.js"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Crackers Shop Server booted successfully on PORT ${PORT}`);
    console.log(`🔗 Root server control running locally.`);
    console.log(`======================================================\n`);
  });
}

async function prepareDataLayer() {
  try {
    if (process.env.MONGO_URI) {
      const mongo = await import('./mongo.js');
      await mongo.connectMongo(process.env.MONGO_URI);
      // Optional migration from JSON if MIGRATE_JSON=1
      if (process.env.MIGRATE_JSON === '1') {
        await mongo.migrateFromFile(path.join(__dirname, 'data', 'db.json'));
      }
      collections = mongo.collections;
      verifyUserPassword = mongo.verifyUserPassword || verifyUserPassword;
      getDB = mongo.getDB || getDB;
      saveDB = mongo.saveDB || saveDB;
      initDB = null;
      console.log('Using MongoDB as data layer');
    } else {
      // fallback to file JSON DB
      if (typeof initDB === 'function') initDB();
      console.log('Using file-based JSON data layer');
    }
  } catch (err) {
    console.error('Failed to prepare data layer:', err);
    // If data layer fails, still attempt to initialize file DB as fallback
    if (typeof initDB === 'function') initDB();
  }
}

async function main() {
  await prepareDataLayer();
  await startServer();
}

main();
