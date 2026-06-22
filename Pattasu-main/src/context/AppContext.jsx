import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [retailBills, setRetailBills] = useState([]);
  const [transportBills, setTransportBills] = useState([]);
  const [purchases, setPurchases] = useState([]);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (text, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Re-verify auth & pull data
  useEffect(() => {
    const initSession = async () => {
      const persistedToken = localStorage.getItem("token");
      if (persistedToken) {
        try {
          const fetchedUser = await api.auth.me();
          setUser(fetchedUser);
          setToken(persistedToken);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
          setInitialLoading(false);
          setLoading(false);
          return;
        }

        // attempt to load data but do not force logout on failure
        try {
          await loadSystemData();
        } catch (e) {
          console.error("Initial data sync failed:", e);
        }
      }
      setInitialLoading(false);
      setLoading(false);
    };

    initSession();
  }, [token]);

  const loadSystemData = async () => {
    try {
      const [prods, custs, sups, bills, transports, purchs] = await Promise.all([
        api.products.list(),
        api.customers.list(),
        api.suppliers.list(),
        api.retailBills.list(),
        api.transportBills.list(),
        api.purchases.list()
      ]);
      setProducts(prods || []);
      setCustomers(custs || []);
      setSuppliers(sups || []);
      setRetailBills(bills || []);
      setTransportBills(transports || []);
      setPurchases(purchs || []);
    } catch (e) {
      console.error("Failed to sync store collections with Cloud backend:", e);
      // Don't show error toast or log out; just continue with whatever data we have
      // This ensures temporary sync issues don't interrupt the user's session
    }
  };

  const refreshAllData = async () => {
    setLoading(true);
    await loadSystemData();
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const resp = await api.auth.login(email, password);
      localStorage.setItem("token", resp.token);
      setToken(resp.token);
      setUser(resp.user);
      showToast(`Welcome back, ${resp.user.name}!`, "success");
    } catch (err) {
      showToast(err.message || "Invalid credentials", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setRetailBills([]);
    setTransportBills([]);
    setPurchases([]);
    showToast("Signed out successfully", "info");
  };

  // CRUD Implementations
  const addProduct = async (p) => {
    try {
      const newProd = await api.products.create(p);
      setProducts((prev) => [...prev, newProd]);
      showToast(`Product "${newProd.productName}" added successfully`, "success");
    } catch (error) {
      showToast("Failed to add product", "error");
      throw error;
    }
  };

  const editProduct = async (id, p) => {
    try {
      const updated = await api.products.update(id, p);
      setProducts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast("Product details updated successfully", "success");
    } catch (error) {
      showToast("Failed to update product", "error");
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      showToast("Product deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete product", "error");
      throw error;
    }
  };

  const addCustomer = async (c) => {
    try {
      const newCust = await api.customers.create(c);
      setCustomers((prev) => [...prev, newCust]);
      showToast(`Customer "${newCust.customerName}" added`, "success");
    } catch (error) {
      showToast("Failed to register customer", "error");
      throw error;
    }
  };

  const editCustomer = async (id, c) => {
    try {
      const updated = await api.customers.update(id, c);
      setCustomers((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast("Customer info updated", "success");
    } catch (error) {
      showToast("Failed to update customer", "error");
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await api.customers.delete(id);
      setCustomers((prev) => prev.filter((item) => item.id !== id));
      showToast("Customer removed successfully", "success");
    } catch (error) {
      showToast("Failed to delete customer", "error");
      throw error;
    }
  };

  const addSupplier = async (s) => {
    try {
      const newSupplier = await api.suppliers.create(s);
      setSuppliers((prev) => [...prev, newSupplier]);
      showToast(`Supplier "${newSupplier.supplierName}" registered`, "success");
    } catch (error) {
      showToast("Failed to add supplier", "error");
      throw error;
    }
  };

  const editSupplier = async (id, s) => {
    try {
      const updated = await api.suppliers.update(id, s);
      setSuppliers((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast("Supplier catalog updated", "success");
    } catch (error) {
      showToast("Failed to update supplier", "error");
      throw error;
    }
  };

  const deleteSupplier = async (id) => {
    try {
      await api.suppliers.delete(id);
      setSuppliers((prev) => prev.filter((item) => item.id !== id));
      showToast("Supplier deleted from directory", "success");
    } catch (error) {
      showToast("Failed to delete supplier", "error");
      throw error;
    }
  };

  const addRetailBill = async (bill) => {
    try {
      const newBill = await api.retailBills.create(bill);
      setRetailBills((prev) => [...prev, newBill]);
      await loadSystemData();
      showToast(`Invoice ${newBill.billNo} generated successfully!`, "success");
    } catch (error) {
      showToast(error.message || "Failed to generate billing ticket", "error");
      throw error;
    }
  };

  const addTransportBill = async (tb) => {
    try {
      const newT = await api.transportBills.create(tb);
      setTransportBills((prev) => [...prev, newT]);
      showToast(`Transport Booking ${newT.transportBillNo} created`, "success");
    } catch (error) {
      showToast("Failed to register transport order", "error");
      throw error;
    }
  };

  const updateTransportStatus = async (id, status) => {
    try {
      const updated = await api.transportBills.update(id, { status });
      setTransportBills((prev) => prev.map((tb) => (tb.id === id ? updated : tb)));
      showToast(`Transport status updated to ${status}`, "success");
    } catch (error) {
      showToast("Failed to update order status", "error");
      throw error;
    }
  };

  const addPurchase = async (p) => {
    try {
      const newP = await api.purchases.create(p);
      setPurchases((prev) => [...prev, newP]);
      await loadSystemData();
      showToast(`Purchase bill recorded successfully! Stock increased.`, "success");
    } catch (error) {
      showToast("Failed to record stock purchases", "error");
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        products,
        customers,
        suppliers,
        retailBills,
        transportBills,
        purchases,
        initialLoading,
        loading,
        toasts,
        login,
        logout,
        showToast,
        removeToast,
        refreshAllData,
        addProduct,
        editProduct,
        deleteProduct,
        addCustomer,
        editCustomer,
        deleteCustomer,
        addSupplier,
        editSupplier,
        deleteSupplier,
        addRetailBill,
        addTransportBill,
        updateTransportStatus,
        addPurchase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside the AppProvider");
  return context;
};
