import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create a spy on window.fetch before any modules are loaded
const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

// Now import the api module
import { api } from './api';

describe('API Client Service Suite', () => {
  beforeEach(() => {
    fetchSpy.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should perform auth login with correct endpoints and parameters', async () => {
    await api.auth.login('admin@gmail.com', 'admin');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchSpy.mock.calls[0];
    
    // Check url (should end with the endpoint)
    expect(calledUrl).toContain('/api/auth/login');
    expect(calledOptions.method).toBe('POST');
    expect(JSON.parse(calledOptions.body)).toEqual({
      email: 'admin@gmail.com',
      password: 'admin',
    });
  });

  it('should get current user me endpoint with jwt authorization token', async () => {
    localStorage.setItem('token', 'mocked-jwt-token-xyz');
    await api.auth.me();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchSpy.mock.calls[0];

    expect(calledUrl).toContain('/api/auth/me');
    expect(calledOptions.headers.Authorization).toBe('Bearer mocked-jwt-token-xyz');
  });

  it('should fetch products list successfully', async () => {
    await api.products.list();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain('/api/products');
  });

  it('should update product with id successfully', async () => {
    const updateData = { productName: 'Sparklers updated', category: 'Sparklers' };
    await api.products.update('p-2', updateData);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchSpy.mock.calls[0];
    expect(calledUrl).toContain('/api/products/p-2');
    expect(calledOptions.method).toBe('PUT');
    expect(JSON.parse(calledOptions.body)).toEqual(updateData);
  });
});
