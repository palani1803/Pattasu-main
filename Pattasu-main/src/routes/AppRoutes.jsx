import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { DashboardLayout } from "../layouts/DashboardLayout.jsx";
import { Login } from "../pages/Login.jsx";
import { Dashboard } from "../pages/Dashboard.jsx";
import { Products } from "../pages/Products.jsx";
import { Customers } from "../pages/Customers.jsx";
import { RetailBilling } from "../pages/RetailBilling.jsx";
import { TransportBilling } from "../pages/TransportBilling.jsx";
import { Purchases } from "../pages/Purchases.jsx";
import { Suppliers } from "../pages/Suppliers.jsx";
import { Reports } from "../pages/Reports.jsx";
import { motion } from "motion/react";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, initialLoading } = useApp();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-rose-500 animate-spin"></div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider animate-pulse">
          Authenticating ERP Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Animated Page Transition Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Main dashboard routes wrapped with ProtectedRoute and DashboardLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="dashboard"
          element={
            <PageWrapper>
              <Dashboard />
            </PageWrapper>
          }
        />
        
        <Route
          path="products"
          element={
            <PageWrapper>
              <Products />
            </PageWrapper>
          }
        />
        
        <Route
          path="customers"
          element={
            <PageWrapper>
              <Customers />
            </PageWrapper>
          }
        />
        
        <Route
          path="billing"
          element={
            <PageWrapper>
              <RetailBilling />
            </PageWrapper>
          }
        />
        
        <Route
          path="transport"
          element={
            <PageWrapper>
              <TransportBilling />
            </PageWrapper>
          }
        />
        
        <Route
          path="purchases"
          element={
            <PageWrapper>
              <Purchases />
            </PageWrapper>
          }
        />
        <Route
          path="suppliers"
          element={
            <PageWrapper>
              <Suppliers />
            </PageWrapper>
          }
        />
        
        <Route
          path="reports"
          element={
            <PageWrapper>
              <Reports />
            </PageWrapper>
          }
        />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
