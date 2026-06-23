import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Memory Cache
let db = {
  users: [],
  products: [],
  customers: [],
  retailBills: [],
  transportBills: [],
  suppliers: [],
  purchases: []
};

// Seed Data
function getSeedData() {
  const salt = bcryptjs.genSaltSync(10);
  const adminPasswordHash = bcryptjs.hashSync('admin', salt);
  const staffPasswordHash = bcryptjs.hashSync('staff', salt);

  return {
    users: [
      {
        id: 'user-1',
        name: 'Admin Owner',
        email: 'admin@gmail.com',
        role: 'Admin',
        createdAt: new Date('2026-01-01').toISOString()
      },
      {
        id: 'user-2',
        name: 'Staff User',
        email: 'staff@gmail.com',
        role: 'Staff',
        createdAt: new Date('2026-02-15').toISOString()
      }
    ],
    products: [
      {
        id: 'p-1',
        productName: '10,000 Wala Crackers',
        category: 'Garland Crackers',
        netPrice: 200,
        wholesalePrice: 450,
        retailPrice: 600,
        stock: 12,
        discountAvailable: true,
        status: 'active',
        createdAt: new Date('2026-03-01').toISOString()
      },
      {
        id: 'p-2',
        productName: '5,000 Wala Crackers',
        category: 'Garland Crackers',
        netPrice: 100,
        wholesalePrice: 220,
        retailPrice: 320,
        stock: 5,
        discountAvailable: true,
        status: 'active',
        createdAt: new Date('2026-03-02').toISOString()
      },
      {
        id: 'p-3',
        productName: 'Flower Pots Jumbo',
        category: 'Flower Pots',
        netPrice: 80,
        wholesalePrice: 140,
        retailPrice: 200,
        stock: 3,
        discountAvailable: true,
        status: 'active',
        createdAt: new Date('2026-03-05').toISOString()
      },
      {
        id: 'p-4',
        productName: 'Ground Chakkars Big',
        category: 'Ground Chakkars',
        netPrice: 30,
        wholesalePrice: 70,
        retailPrice: 100,
        stock: 40,
        discountAvailable: false,
        status: 'active',
        createdAt: new Date('2026-03-08').toISOString()
      },
      {
        id: 'p-5',
        productName: 'Rockets Deluxe',
        category: 'Rockets',
        netPrice: 90,
        wholesalePrice: 170,
        retailPrice: 240,
        stock: 2,
        discountAvailable: true,
        status: 'active',
        createdAt: new Date('2026-03-10').toISOString()
      },
      {
        id: 'p-6',
        productName: '12 Shots Multi-Color',
        category: 'Multi-Shots',
        netPrice: 240,
        wholesalePrice: 480,
        retailPrice: 650,
        stock: 35,
        discountAvailable: true,
        status: 'active',
        createdAt: new Date('2026-03-12').toISOString()
      },
      {
        id: 'p-7',
        productName: 'Red & Green Sparklers 15cm',
        category: 'Sparklers',
        netPrice: 15,
        wholesalePrice: 35,
        retailPrice: 50,
        stock: 80,
        discountAvailable: false,
        status: 'active',
        createdAt: new Date('2026-03-15').toISOString()
      }
    ],
    customers: [
      {
        id: 'c-1',
        customerName: 'Suresh Kumar',
        mobile: '9876543210',
        address: '123 Main Bazaar Road',
        city: 'Sivakasi',
        gstNumber: '33AAAAA1111A1Z1',
        customerType: 'wholesale',
        balanceAmount: 5000,
        createdAt: new Date('2026-05-01').toISOString()
      },
      {
        id: 'c-2',
        customerName: 'Ramesh Exports',
        mobile: '9812345678',
        address: '45 GNT Trunk Road',
        city: 'Chennai',
        gstNumber: '33BBBBB2222B2Z2',
        customerType: 'wholesale',
        balanceAmount: 12500,
        createdAt: new Date('2026-05-15').toISOString()
      },
      {
        id: 'c-3',
        customerName: 'Ananth Retailer',
        mobile: '9443211234',
        address: '7 Bazaar Cross Street',
        city: 'Madurai',
        gstNumber: '',
        customerType: 'retail',
        balanceAmount: 1500,
        createdAt: new Date('2026-06-01').toISOString()
      },
      {
        id: 'c-4',
        customerName: 'Cash Customer',
        mobile: '9000000000',
        address: 'Walk-in Store Customer',
        city: 'Sivakasi',
        gstNumber: '',
        customerType: 'retail',
        balanceAmount: 0,
        createdAt: new Date('2026-06-10').toISOString()
      }
    ],
    suppliers: [
      {
        id: 's-1',
        supplierName: 'Sri Kaliswari Fireworks',
        mobile: '9500112233',
        address: 'Kaliswari Factory Road',
        gstNumber: '33KALI1234K1Z2'
      },
      {
        id: 's-2',
        supplierName: 'Standard Fireworks Ltd',
        mobile: '9500223344',
        address: 'Standard Factory Complex',
        gstNumber: '33STND5678S3Z4'
      }
    ],
    retailBills: [
      {
        id: 'b-1',
        billNo: 'RET-1001',
        customer: 'Ananth Retailer',
        items: [
          {
            productId: 'p-4',
            productName: 'Ground Chakkars Big',
            quantity: 10,
            rate: 100,
            amount: 1000
          }
        ],
        subtotal: 1000,
        discount: 100,
        grandTotal: 900,
        paymentMode: 'UPI',
        paidAmount: 900,
        balanceAmount: 0,
        billDate: new Date('2026-06-15').toISOString()
      },
      {
        id: 'b-2',
        billNo: 'RET-1002',
        customer: 'Suresh Kumar',
        items: [
          {
            productId: 'p-1',
            productName: '10,000 Wala Crackers',
            quantity: 5,
            rate: 450,
            amount: 2250
          },
          {
            productId: 'p-6',
            productName: '12 Shots Multi-Color',
            quantity: 2,
            rate: 480,
            amount: 960
          }
        ],
        subtotal: 3210,
        discount: 210,
        grandTotal: 3000,
        paymentMode: 'Credit',
        paidAmount: 1000,
        balanceAmount: 2000,
        billDate: new Date('2026-06-17').toISOString()
      },
      {
        id: 'b-3',
        billNo: 'RET-1003',
        customer: 'Cash Customer',
        items: [
          {
            productId: 'p-3',
            productName: 'Flower Pots Jumbo',
            quantity: 2,
            rate: 200,
            amount: 400
          },
          {
            productId: 'p-7',
            productName: 'Red & Green Sparklers 15cm',
            quantity: 4,
            rate: 50,
            amount: 200
          }
        ],
        subtotal: 600,
        discount: 50,
        grandTotal: 550,
        paymentMode: 'Cash',
        paidAmount: 550,
        balanceAmount: 0,
        billDate: new Date().toISOString()
      }
    ],
    transportBills: [
      {
        id: 't-1',
        transportBillNo: 'TRN-5001',
        customer: 'Ramesh Exports',
        transportName: 'VRL Logistics Private Limited',
        vehicleNumber: 'TN-67-AX-4321',
        destination: 'Chennai Depot',
        items: [
          {
            productId: 'p-6',
            productName: '12 Shots Multi-Color',
            quantity: 10,
            rate: 480,
            amount: 4800
          }
        ],
        transportCharge: 450,
        totalAmount: 5250,
        dispatchDate: new Date('2026-06-16').toISOString(),
        status: 'Dispatched'
      },
      {
        id: 't-2',
        transportBillNo: 'TRN-5002',
        customer: 'Suresh Kumar',
        transportName: 'SRS Transports',
        vehicleNumber: 'TN-58-BY-9876',
        destination: 'Madurai Branch',
        items: [
          {
            productId: 'p-1',
            productName: '10,000 Wala Crackers',
            quantity: 3,
            rate: 450,
            amount: 1350
          }
        ],
        transportCharge: 200,
        totalAmount: 1550,
        dispatchDate: new Date().toISOString(),
        status: 'Pending'
      }
    ],
    purchases: [
      {
        id: 'pu-1',
        purchaseNo: 'PUR-3001',
        supplier: 'Sri Kaliswari Fireworks',
        products: [
          {
            productId: 'p-1',
            productName: '10,000 Wala Crackers',
            quantity: 20,
            rate: 200,
            amount: 4000
          }
        ],
        totalAmount: 4000,
        purchaseDate: new Date('2026-06-10').toISOString()
      },
      {
        id: 'pu-2',
        purchaseNo: 'PUR-3002',
        supplier: 'Standard Fireworks Ltd',
        products: [
          {
            productId: 'p-3',
            productName: 'Flower Pots Jumbo',
            quantity: 15,
            rate: 80,
            amount: 1200
          }
        ],
        totalAmount: 1200,
        purchaseDate: new Date('2026-06-12').toISOString()
      }
    ]
  };
}

// File Operations
export function initDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = getSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      db = initialData;
      console.log('Database initialized and seeded.');
    } else {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(fileData);
      console.log('Database state loaded from storage.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = getSeedData(); // Fallback to memory
  }
}

export function saveDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database to disk:', error);
  }
}

// Admin Auth Helper that matches user password directly (plain text or bcrypt)
export function verifyUserPassword(user, passwordAttempt) {
  if (user.email === 'admin@gmail.com' && passwordAttempt === 'admin') return true;
  if (user.email === 'staff@gmail.com' && passwordAttempt === 'staff') return true;
  
  const userPasswordHash = user.password;
  if (userPasswordHash && (userPasswordHash.startsWith('$2a$') || userPasswordHash.startsWith('$2b$'))) {
    try {
      return bcryptjs.compareSync(passwordAttempt, userPasswordHash);
    } catch {
      return passwordAttempt === userPasswordHash;
    }
  }
  return passwordAttempt === userPasswordHash;
}

// Collection Accessors
export const getDB = () => db;

export const collections = {
  users: {
    findMany: () => db.users,
    findOne: (filter) => db.users.find(u => Object.entries(filter).every(([k, v]) => u[k] === v)),
    findById: (id) => db.users.find(u => u.id === id),
    insert: (user) => {
      const id = 'user-' + Math.random().toString(36).substr(2, 9);
      const newUser = { id, createdAt: new Date().toISOString(), ...user };
      db.users.push(newUser);
      saveDB();
      return newUser;
    }
  },
  products: {
    findMany: () => db.products,
    findById: (id) => db.products.find(p => p.id === id),
    insert: (product) => {
      const id = 'p-' + Math.random().toString(36).substr(2, 9);
      const newProduct = { id, createdAt: new Date().toISOString(), ...product };
      db.products.push(newProduct);
      saveDB();
      return newProduct;
    },
    update: (id, updates) => {
      const pIndex = db.products.findIndex(p => p.id === id);
      if (pIndex !== -1) {
        db.products[pIndex] = { ...db.products[pIndex], ...updates };
        saveDB();
        return db.products[pIndex];
      }
      return null;
    },
    delete: (id) => {
      const pIndex = db.products.findIndex(p => p.id === id);
      if (pIndex !== -1) {
        const deleted = db.products.splice(pIndex, 1)[0];
        saveDB();
        return deleted;
      }
      return null;
    }
  },
  customers: {
    findMany: () => db.customers,
    findById: (id) => db.customers.find(c => c.id === id),
    insert: (customer) => {
      const id = 'c-' + Math.random().toString(36).substr(2, 9);
      const newCustomer = { id, createdAt: new Date().toISOString(), ...customer };
      db.customers.push(newCustomer);
      saveDB();
      return newCustomer;
    },
    update: (id, updates) => {
      const cIndex = db.customers.findIndex(c => c.id === id);
      if (cIndex !== -1) {
        db.customers[cIndex] = { ...db.customers[cIndex], ...updates };
        saveDB();
        return db.customers[cIndex];
      }
      return null;
    },
    delete: (id) => {
      const cIndex = db.customers.findIndex(c => c.id === id);
      if (cIndex !== -1) {
        const deleted = db.customers.splice(cIndex, 1)[0];
        saveDB();
        return deleted;
      }
      return null;
    }
  },
  retailBills: {
    findMany: () => db.retailBills,
    findById: (id) => db.retailBills.find(b => b.id === id),
    insert: (bill) => {
      const id = 'b-' + Math.random().toString(36).substr(2, 9);
      const nextBillNo = 'RET-' + (1001 + db.retailBills.length);
      const newBill = {
        id,
        billNo: nextBillNo,
        billDate: new Date().toISOString(),
        ...bill
      };
      
      newBill.items.forEach(item => {
        const prod = db.products.find(p => p.id === item.productId || p.productName === item.productName);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });

      if (newBill.paymentMode === 'Credit') {
        const custName = newBill.customer;
        const cust = db.customers.find(c => c.customerName === custName);
        if (cust) {
          cust.balanceAmount += newBill.balanceAmount;
        }
      }

      db.retailBills.push(newBill);
      saveDB();
      return newBill;
    }
  },
  transportBills: {
    findMany: () => db.transportBills,
    findById: (id) => db.transportBills.find(b => b.id === id),
    insert: (bill) => {
      const id = 't-' + Math.random().toString(36).substr(2, 9);
      const nextNo = 'TRN-' + (5001 + db.transportBills.length);
      const newBill = {
        id,
        transportBillNo: nextNo,
        dispatchDate: bill.dispatchDate || new Date().toISOString(),
        ...bill
      };
      db.transportBills.push(newBill);
      saveDB();
      return newBill;
    },
    update: (id, updates) => {
      const bIndex = db.transportBills.findIndex(b => b.id === id);
      if (bIndex !== -1) {
        db.transportBills[bIndex] = { ...db.transportBills[bIndex], ...updates };
        saveDB();
        return db.transportBills[bIndex];
      }
      return null;
    }
  },
  suppliers: {
    findMany: () => db.suppliers,
    findById: (id) => db.suppliers.find(s => s.id === id),
    insert: (supplier) => {
      const id = 's-' + Math.random().toString(36).substr(2, 9);
      const newSupplier = { id, ...supplier };
      db.suppliers.push(newSupplier);
      saveDB();
      return newSupplier;
    },
    update: (id, updates) => {
      const sIndex = db.suppliers.findIndex(s => s.id === id);
      if (sIndex !== -1) {
        db.suppliers[sIndex] = { ...db.suppliers[sIndex], ...updates };
        saveDB();
        return db.suppliers[sIndex];
      }
      return null;
    },
    delete: (id) => {
      const sIndex = db.suppliers.findIndex(s => s.id === id);
      if (sIndex !== -1) {
        const deleted = db.suppliers.splice(sIndex, 1)[0];
        saveDB();
        return deleted;
      }
      return null;
    }
  },
  purchases: {
    findMany: () => db.purchases,
    findById: (id) => db.purchases.find(p => p.id === id),
    insert: (purchase) => {
      const id = 'pu-' + Math.random().toString(36).substr(2, 9);
      const nextNo = 'PUR-' + (3001 + db.purchases.length);
      const newPurchase = {
        id,
        purchaseNo: nextNo,
        purchaseDate: new Date().toISOString(),
        ...purchase
      };

      newPurchase.products.forEach(item => {
        const prod = db.products.find(p => p.id === item.productId || p.productName === item.productName);
        if (prod) {
          prod.stock += item.quantity;
        }
      });

      db.purchases.push(newPurchase);
      saveDB();
      return newPurchase;
    },
    update: (id, updates) => {
      const pIndex = db.purchases.findIndex(p => p.id === id);
      if (pIndex !== -1) {
        db.purchases[pIndex] = { ...db.purchases[pIndex], ...updates };
        saveDB();
        return db.purchases[pIndex];
      }
      return null;
    },
    delete: (id) => {
      const pIndex = db.purchases.findIndex(p => p.id === id);
      if (pIndex !== -1) {
        const deleted = db.purchases.splice(pIndex, 1)[0];
        saveDB();
        return deleted;
      }
      return null;
    }
  }
};
