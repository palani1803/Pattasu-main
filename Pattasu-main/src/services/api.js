const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const fetch = (url, options) => {
  const fullUrl = url.startsWith("/") ? `${BASE_URL}${url}` : url;
  return window.fetch(fullUrl, options);
};

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(err.error || "Login credentials invalid");
      }
      return res.json();
    },
    me: async () => {
      const res = await fetch("/api/auth/me", {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Session expired");
      return res.json();
    },
  },

  products: {
    list: async () => {
      const res = await fetch("/api/products", { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
    create: async (data) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return true;
    },
  },

  customers: {
    list: async () => {
      const res = await fetch("/api/customers", { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to load customers");
      return res.json();
    },
    create: async (data) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create customer");
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      return true;
    },
  },

  suppliers: {
    list: async () => {
      const res = await fetch("/api/suppliers", { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to load suppliers");
      return res.json();
    },
    create: async (data) => {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create supplier");
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update supplier");
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete supplier");
      return true;
    },
  },

  retailBills: {
    list: async () => {
      const res = await fetch("/api/retail-bills", { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to load invoices");
      return res.json();
    },
    create: async (data) => {
      const res = await fetch("/api/retail-bills", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Invoice generation failed");
      return res.json();
    },
  },

  transportBills: {
    list: async () => {
      const res = await fetch("/api/transport-bills", { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to load transport order bills");
      return res.json();
    },
    create: async (data) => {
      const res = await fetch("/api/transport-bills", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create transport bill");
      return res.json();
    },
    update: async (id, data) => {
      const res = await fetch(`/api/transport-bills/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update dispatch status");
      return res.json();
    },
  },

  purchases: {
    list: async () => {
      const res = await fetch("/api/purchases", { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to load purchase records");
      return res.json();
    },
    create: async (data) => {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to record purchase stock");
      return res.json();
    },
  },

  reports: {
    get: async (startDate, endDate) => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`/api/reports?${params.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to generate analytics report");
      return res.json();
    },
  },
};
