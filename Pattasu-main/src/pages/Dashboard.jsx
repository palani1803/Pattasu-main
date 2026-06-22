import React, { useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  TrendingUp,
  Users,
  Box,
  Truck,
  AlertOctagon,
  Flame,
  BadgePercent,
  TrendingDown,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export const Dashboard = () => {
  const { products = [], customers = [], retailBills = [], transportBills = [], purchases = [] } = useApp();

  // ----------------------------------------------------
  // 1. STATS METRICS CALCULATION
  // ----------------------------------------------------
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const thisMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM

    // Today's Sales
    const todaySales = retailBills
      .filter((b) => b.billDate && b.billDate.startsWith(todayStr))
      .reduce((sum, b) => sum + b.grandTotal, 0);

    // Monthly Sales
    const monthlySales = retailBills
      .filter((b) => b.billDate && b.billDate.startsWith(thisMonthStr))
      .reduce((sum, b) => sum + b.grandTotal, 0);

    // Outstanding amount
    const outstandingTotal = customers.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);

    // Total Purchases Value
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

    // Low stock count (stock <= 5)
    const lowStockCount = products.filter((p) => (p.stock || 0) <= 5 && p.status === "active").length;

    // Pending Transport orders
    const pendingTransports = transportBills.filter((tb) => tb.status === "Pending").length;

    // Gross Profit estimate: Sum of (Product Retail/Wholesale Price minus Net Product Cost) for individual sold invoice items
    let estGrossProfit = 0;
    retailBills.forEach((bill) => {
      if (bill.items) {
        bill.items.forEach((item) => {
          const prod = products.find((p) => p.id === item.productId || p.productName === item.productName);
          if (prod) {
            const profitPerItem = item.rate - prod.netPrice;
            estGrossProfit += Math.max(0, profitPerItem) * item.quantity;
          } else {
            // Fallback estimated cost is 40%
            estGrossProfit += item.amount * 0.4;
          }
        });
      }
    });

    return {
      todaySales,
      monthlySales,
      outstandingTotal,
      lowStockCount,
      pendingTransports,
      totalPurchases,
      estGrossProfit,
    };
  }, [products, customers, retailBills, transportBills, purchases]);

  // ----------------------------------------------------
  // 2. CHART DATA GENERATION
  // ----------------------------------------------------
  
  // A. Daily Sales Trend (last 7 days)
  const salesTrendData = useMemo(() => {
    const dates = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().substring(0, 10);
      dates[str] = 0;
    }

    retailBills.forEach((b) => {
      if (b.billDate) {
        const bDate = b.billDate.substring(0, 10);
        if (dates[bDate] !== undefined) {
          dates[bDate] += b.grandTotal;
        }
      }
    });

    return Object.entries(dates).map(([date, total]) => {
      const label = new Date(date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      return { date: label, Sales: total };
    });
  }, [retailBills]);

  // B. Sells vs Purchases monthly bar chart
  const comparisonData = useMemo(() => {
    const monthlyData = {};
    
    // Seed last 4 months
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const str = d.toISOString().substring(0, 7); // "YYYY-MM"
      monthlyData[str] = { Sales: 0, Purchases: 0 };
    }

    retailBills.forEach((b) => {
      if (b.billDate) {
        const monthStr = b.billDate.substring(0, 7);
        if (monthlyData[monthStr]) {
          monthlyData[monthStr].Sales += b.grandTotal;
        }
      }
    });

    purchases.forEach((p) => {
      if (p.purchaseDate) {
        const monthStr = p.purchaseDate.substring(0, 7);
        if (monthlyData[monthStr]) {
          monthlyData[monthStr].Purchases += p.totalAmount;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, values]) => {
      const label = new Date(month + "-02").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      return { name: label, Sales: values.Sales, Purchases: values.Purchases };
    });
  }, [retailBills, purchases]);

  // C. Top Selling Products
  const topProductsChart = useMemo(() => {
    const soldQuantities = {};
    retailBills.forEach((bill) => {
      if (bill.items) {
        bill.items.forEach((item) => {
          soldQuantities[item.productName] = (soldQuantities[item.productName] || 0) + item.quantity;
        });
      }
    });

    const productsList = Object.entries(soldQuantities)
      .map(([name, qty]) => ({ name, value: qty }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    if (productsList.length === 0) {
      return [{ name: "No Sales Data", value: 1 }];
    }
    return productsList;
  }, [retailBills]);

  // COLORS FOR CHART CHUNKS
  const PIE_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Enterprise Dashboard</h2>
          <p className="text-xs text-zinc-400">Real-time Sivakasi Pyrotechnics shop inventory & daily dispatch analysis</p>
        </div>
        <div className="flex items-center gap-3 bg-[#141822] border border-[#1e2533] px-4 py-2.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="text-xs font-bold text-zinc-300 font-mono">CHANNEL ONLINE • LIVE SYNC</span>
        </div>
      </div>

      {/* METRICS BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Sales */}
        <div className="bg-[#141822] border border-[#1e2533] hover:border-rose-500/20 p-5 rounded-3xl transition-all shadow-lg shadow-black/10 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today's Billing</span>
            <p className="text-2xl font-black text-rose-500 font-mono">
              ₹{stats.todaySales.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Cash/UPI/Credit invoice total</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 group-hover:bg-rose-500/25 border border-rose-500/20 flex items-center justify-center transition-colors">
            <Flame className="w-6 h-6 text-rose-500" />
          </div>
        </div>

        {/* Card 2: Monthly Sales */}
        <div className="bg-[#141822] border border-[#1e2533] hover:border-[#3b82f6]/20 p-5 rounded-3xl transition-all shadow-lg shadow-black/10 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Monthly Invoice</span>
            <p className="text-2xl font-black text-blue-500 font-mono">
              ₹{stats.monthlySales.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Current active calendar month</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/25 border border-blue-500/20 flex items-center justify-center transition-colors">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Card 3: Outstanding Outstanding */}
        <div className="bg-[#141822] border border-[#1e2533] hover:border-[#f59e0b]/20 p-5 rounded-3xl transition-all shadow-lg shadow-black/10 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Ledger Balance</span>
            <p className="text-2xl font-black text-amber-500 font-mono">
              ₹{stats.outstandingTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Outstanding customer credits</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/25 border border-amber-500/20 flex items-center justify-center transition-colors">
            <Users className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Card 4: Est Profit */}
        <div className="bg-[#141822] border border-[#1e2533] hover:border-emerald-500/20 p-5 rounded-3xl transition-all shadow-lg shadow-black/10 flex items-center justify-between group">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Est. Gross Margin</span>
            <p className="text-2xl font-black text-emerald-500 font-mono">
              ₹{stats.estGrossProfit.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono">Retail rate minus cost factor</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/25 border border-emerald-500/20 flex items-center justify-center transition-colors">
            <BadgePercent className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* SUB-METRICS FAST WIDGET ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#141822]/40 border border-[#1e2533] p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Box className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Products Catalog</span>
            <h5 className="text-sm font-extrabold text-white">{products.length} registered</h5>
          </div>
        </div>

        <div className="bg-[#141822]/40 border border-[#1e2533] p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Stock Alerts</span>
            <h5 className="text-sm font-extrabold text-rose-400">{stats.lowStockCount} items depleted</h5>
          </div>
        </div>

        <div className="bg-[#141822]/40 border border-[#1e2533] p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Truck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Transport Queue</span>
            <h5 className="text-sm font-extrabold text-[#22d3ee]">{stats.pendingTransports} pending</h5>
          </div>
        </div>

        <div className="bg-[#141822]/40 border border-[#1e2533] p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500">Total Purchase Orders</span>
            <h5 className="text-sm font-extrabold text-white">₹{stats.totalPurchases.toLocaleString("en-IN")}</h5>
          </div>
        </div>
      </div>

      {/* CHART DIAGRAMS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend over last 7 Days */}
        <div className="lg:col-span-2 bg-[#141822] border border-[#1e2533] rounded-3xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[#1e2533] pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">L-7 Daily Retail Billing Sales</h3>
              <p className="text-[11px] text-zinc-400">Chronological distribution of sales billing tickets</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
              Sales Trend
            </span>
          </div>
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#e2e8f0" }}
                  itemStyle={{ color: "#f43f5e" }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie representation */}
        <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[#1e2533] pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Top-Selling Products</h3>
              <p className="text-[11px] text-zinc-400">Breakdown by item quantity sold</p>
            </div>
          </div>
          <div className="h-60 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProductsChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProductsChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2 overflow-y-auto max-h-24 font-medium">
            {topProductsChart.map((prod, index) => (
              <div key={prod.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="truncate max-w-[170px]">{prod.name}</span>
                </div>
                <span className="font-mono text-zinc-400 font-bold">{prod.value} Units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE COMPARISON TREND */}
      <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-5 shadow-xl mt-6">
        <div className="flex items-center justify-between mb-4 border-b border-[#1e2533] pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Sales Invoices vs Supplier Purchases</h3>
            <p className="text-[11px] text-zinc-400">Monthly breakdown of sales inflows compared with stock purchases outflows</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Sales" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={35} />
              <Bar dataKey="Purchases" fill="#9333ea" radius={[4, 4, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
