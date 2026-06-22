import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  Flame,
  LayoutDashboard,
  Box,
  Users,
  ReceiptText,
  Truck,
  Forklift,
  TrendingUp,
  LogOut,
  Bell,
  Menu,
  X,
  RefreshCw,
  UserCheck,
  Clock,
  Building
} from "lucide-react";

export const DashboardLayout = ({ children }) => {
  const { user, logout, products, refreshAllData, loading } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

    const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products Catalogue", path: "/products", icon: Box },
    { name: "Customer Ledger", path: "/customers", icon: Users },
    { name: "Retail Billing (POS)", path: "/billing", icon: ReceiptText },
    { name: "Transport Dispatch", path: "/transport", icon: Truck },
    { name: "Purchases", path: "/purchases", icon: Forklift },
    { name: "Suppliers", path: "/suppliers", icon: Building },
    { name: "Reports & Analytics", path: "/reports", icon: TrendingUp },
  ];

  // Calculate low stock alarm count
  const lowStockProducts = products ? products.filter((p) => p.stock <= 5 && p.status === "active") : [];

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e2e8f0] font-sans flex">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-72 glass-card shrink-0 overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-white/10 bg-slate-950/85">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">PYROTECH</h1>
            <p className="text-[10px] text-rose-500 font-mono tracking-widest font-semibold uppercase">Crackers ERP</p>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                id={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500/15 to-orange-500/5 text-rose-400 border border-rose-500/20 shadow-md shadow-rose-900/5 font-semibold"
                    : "text-zinc-400 hover:text-slate-200 hover:bg-[#1a1f2e] border border-transparent"
                }`}
              >
                <IconComponent
                  className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-rose-400" : "text-zinc-400 group-hover:text-slate-300"
                  }`}
                />
                <span>{item.name}</span>
                {item.name.includes("Products") && lowStockProducts.length > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {lowStockProducts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-[#1e2533] bg-[#11141d] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "System Admin"}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                <UserCheck className="w-2.5 h-2.5" />
                {user?.role || "Admin"}
              </span>
            </div>
          </div>
          <button
            id="sidebar-logout-button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* SIDEBAR FOR MOBILE (TOGGLED) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-[#141822] flex flex-col h-full shadow-2xl relative border-r border-[#1e2533] animate-in slide-in-from-left duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mobile Brand */}
            <div className="h-16 flex items-center px-6 gap-3 border-b border-[#1e2533]">
              <Flame className="w-6 h-6 text-rose-500 animate-pulse" />
              <div>
                <h1 className="text-sm font-bold text-white uppercase tracking-tight">PYROTECH</h1>
                <p className="text-[10px] text-rose-500 font-mono tracking-widest font-semibold">Crackers Manager</p>
              </div>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-rose-500/20 to-orange-500/10 text-rose-400 border border-rose-500/25 font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-[#1a1f2e]"
                    }`}
                  >
                    <IconComponent className="w-[18px] h-[18px]" />
                    <span>{item.name}</span>
                    {item.name.includes("Products") && lowStockProducts.length > 0 && (
                      <span className="ml-auto bg-rose-500/25 text-rose-400 border border-rose-500/35 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                        {lowStockProducts.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User bar */}
            <div className="p-4 border-t border-[#1e2533] bg-[#11141d] flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center font-bold text-white text-xs">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{user?.name || "System Admin"}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{user?.role || "Admin"}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP NAVBAR HEADER */}
        <header className="h-16 bg-[#141822] border-b border-[#1e2533] flex items-center justify-between px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            {/* Sidebar mobile toggler */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1e2533] transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Time Context */}
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] text-rose-500 font-mono font-bold tracking-widest uppercase">Crackers Shop HQ</span>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span>2026-06-18 • UTC-7</span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-4">
            {/* Refresh stats */}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className={`p-2 rounded-lg bg-[#1e2533] border border-[#2b354a] text-zinc-300 hover:text-white hover:bg-[#252f41] transition ${
                loading ? "animate-spin text-rose-400" : ""
              }`}
              title="Synchronize ERP Collections"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Simple Notification Dropdown (Low Stock alerting) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-[#1e2533] border border-[#2b354a] text-zinc-300 hover:text-white hover:bg-[#252f41] transition relative"
                title="Notifications & Guardrails"
              >
                <Bell className="w-4 h-4" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border border-[#141822]" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-[#161c28] border border-[#273248] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#273248] pb-2 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Inventory Alarms</h4>
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-full font-mono">
                        {lowStockProducts.length} Items Low
                      </span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {lowStockProducts.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-4">All stocks fully robust.</p>
                      ) : (
                        lowStockProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#1a2131] border border-rose-950/20"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{p.productName}</p>
                              <span className="text-[9px] text-[#94a3b8]">{p.category}</span>
                            </div>
                            <span className="text-xs font-bold text-rose-400 font-mono">
                              Stock: {p.stock}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Profile details */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#1e2533]">
              <span className="hidden md:block text-right">
                <p className="text-xs font-bold text-zinc-200">{user?.name || "System Admin"}</p>
                <p className="text-[9px] text-zinc-500 font-mono tracking-wider">{user?.role || "Administrator"}</p>
              </span>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-900/10">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
              </div>
            </div>
          </div>
        </header>

        {/* PRIMARY VIEWPORT VIEW */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
