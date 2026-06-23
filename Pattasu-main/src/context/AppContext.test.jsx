import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from './AppContext';
import { api } from '../services/api';

// Mock the API layer
vi.mock('../services/api', () => ({
  api: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
    },
    products: {
      list: vi.fn(),
      create: vi.fn(),
    },
    customers: {
      list: vi.fn(),
    },
    suppliers: {
      list: vi.fn(),
    },
    retailBills: {
      list: vi.fn(),
    },
    transportBills: {
      list: vi.fn(),
    },
    purchases: {
      list: vi.fn(),
    },
  },
}));

// Test consumer component to capture and display state
const TestConsumer = () => {
  const { user, initialLoading, login, logout, products } = useApp();
  if (initialLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  return (
    <div>
      <div data-testid="user-name">{user ? user.name : 'Guest'}</div>
      <div data-testid="products-count">{products.length}</div>
      <button data-testid="login-btn" onClick={() => login('admin@gmail.com', 'admin')}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

describe('AppContext State Management Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock resolves
    api.products.list.mockResolvedValue([]);
    api.customers.list.mockResolvedValue([]);
    api.suppliers.list.mockResolvedValue([]);
    api.retailBills.list.mockResolvedValue([]);
    api.transportBills.list.mockResolvedValue([]);
    api.purchases.list.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize state as logged out when token is absent', async () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    // Initial load should resolve and show Guest
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-name').textContent).toBe('Guest');
  });

  it('should restore user session on mount if token is found in localStorage', async () => {
    localStorage.setItem('token', 'valid-jwt-token');
    api.auth.me.mockResolvedValue({ id: 'user-1', name: 'Restore User', email: 'restore@gmail.com', role: 'Admin' });
    api.products.list.mockResolvedValue([{ id: 'p-1', productName: 'Sparklers' }]);

    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    // It should load the session and pull data
    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Restore User');
    });

    expect(screen.getByTestId('products-count').textContent).toBe('1');
    expect(api.auth.me).toHaveBeenCalledTimes(1);
    expect(api.products.list).toHaveBeenCalledTimes(1);
  });

  it('should successfully log in user and set token in localStorage', async () => {
    api.auth.login.mockResolvedValue({
      token: 'jwt-token-new',
      user: { id: 'user-2', name: 'Logged In User', email: 'logged@gmail.com', role: 'Staff' }
    });

    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    // Fire login
    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Logged In User');
    });

    expect(localStorage.getItem('token')).toBe('jwt-token-new');
    expect(api.auth.login).toHaveBeenCalledWith('admin@gmail.com', 'admin');
  });

  it('should clean up token and session on logout', async () => {
    localStorage.setItem('token', 'valid-jwt-token');
    api.auth.me.mockResolvedValue({ id: 'user-1', name: 'Restore User', role: 'Admin' });

    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Restore User');
    });

    // Logout
    fireEvent.click(screen.getByTestId('logout-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Guest');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
