import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';

// Mock fs module to prevent writing mock data to the real db.json on disk
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

// Mock existSync specifically for db.json so it always seeds a clean database in memory
vi.spyOn(fs, 'existsSync').mockImplementation((path) => {
  if (typeof path === 'string' && path.endsWith('db.json')) {
    return false;
  }
  return true;
});

// Import app and collections after setting up mocks
import { app, prepareDataLayer } from './server';

describe('Backend API Integration Tests', () => {
  let adminToken = '';
  let staffToken = '';

  beforeAll(async () => {
    // Force NODE_ENV to test to prevent server startup during imports
    process.env.NODE_ENV = 'test';
    // Initialize file db layer in memory
    await prepareDataLayer();
  });

  beforeEach(async () => {
    // Clear/Re-seed the in-memory database state
    const dbModule = await import('./db');
    dbModule.initDB();

    // Generate tokens for testing auth endpoints
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'admin' });
    adminToken = adminLoginRes.body.token;

    const staffLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@gmail.com', password: 'staff' });
    staffToken = staffLoginRes.body.token;
  });

  describe('Authentication Module', () => {
    it('should authenticate user and return token for valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@gmail.com', password: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('Admin');
    });

    it('should return 401 unauthorized for invalid passwords', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@gmail.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fetch authenticated user profile when authorization header is present', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@gmail.com');
    });

    it('should return 401 access token required when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Products Module CRUD', () => {
    it('should list all products for authenticated users', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('productName');
    });

    it('should create a new product', async () => {
      const newProduct = {
        productName: 'Chotta Wala Sparklers',
        category: 'Sparklers',
        netPrice: 25,
        wholesalePrice: 50,
        retailPrice: 75,
        stock: 100,
        discountAvailable: true,
        status: 'active',
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(res.status).toBe(201);
      expect(res.body.productName).toBe('Chotta Wala Sparklers');
      expect(res.body).toHaveProperty('id');
    });

    it('should update an existing product by ID', async () => {
      // Updates product p-1
      const updateData = {
        productName: '10,000 Wala Crackers Super',
        category: 'Garland Crackers',
        netPrice: 220,
        wholesalePrice: 480,
        retailPrice: 650,
        stock: 8,
        status: 'active',
      };

      const res = await request(app)
        .put('/api/products/p-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.productName).toBe('10,000 Wala Crackers Super');
      expect(res.body.stock).toBe(8);
    });

    it('should delete a product by ID', async () => {
      const res = await request(app)
        .delete('/api/products/p-3')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Customers Module CRUD', () => {
    it('should list all customers', async () => {
      const res = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should create a new customer', async () => {
      const newCustomer = {
        customerName: 'Priya Rajan',
        mobile: '9888877777',
        city: 'Madurai',
        customerType: 'retail',
        balanceAmount: 0,
      };

      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCustomer);

      expect(res.status).toBe(201);
      expect(res.body.customerName).toBe('Priya Rajan');
    });
  });
});
