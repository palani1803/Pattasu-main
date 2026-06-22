import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { api } from "../services/api.js";
import {
  FileText,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle,
  TrendingDown,
  Clock,
  ShieldAlert,
  FolderDown
} from "lucide-react";

export const Reports = () => {
  const { products = [], customers = [] } = useApp();

  // Date Range Filters states (defaulting to current month)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start of month
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });

  // Reports API response states
  const [reportState, setReportState] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Active Report sub-tab ('sales' | 'purchases' | 'transports' | 'outstanding' | 'stock')
  const [subTab, setSubTab] = useState("sales");

  const [searchParam, setSearchParam] = useState("");

  const fetchReportsData = async () => {
    setLoadingReport(true);
    try {
      const payload = await api.reports.get(startDate, endDate);
      setReportState(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [startDate, endDate]);

  // Export CSV Helper (behaves like Excel, widely standard, flawless, native download)
  const handleExportCSV = () => {
    if (!reportState) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (subTab === "sales") {
      csvContent += "Bill No,Date,Customer,Subtotal,Discount,Grand Total,Payment Mode,Settled,Ledger Balance\n";
      reportState.retailBills.forEach((b) => {
        csvContent += `"${b.billNo}","${new Date(b.billDate).toLocaleDateString()}","${b.customer}","₹${b.subtotal}","₹${b.discount}","₹${b.grandTotal}","${b.paymentMode}","₹${b.paidAmount}","₹${b.balanceAmount}"\n`;
      });
    } else if (subTab === "purchases") {
      csvContent += "Inward No,Date,Supplier,Cargo Cost\n";
      reportState.purchases.forEach((p) => {
        csvContent += `"${p.purchaseNo}","${new Date(p.purchaseDate).toLocaleDateString()}","${p.supplier}","₹${p.totalAmount}"\n`;
      });
    } else if (subTab === "transports") {
      csvContent += "Waybill No,Date,Customer,Logistics Lorry,Route,Freight Charges,Cargo Total,Status\n";
      reportState.transports.forEach((t) => {
        csvContent += `"${t.transportBillNo}","${new Date(t.dispatchDate).toLocaleDateString()}","${t.customer}","${t.transportName}","${t.destination}","₹${t.transportCharge}","₹${t.totalAmount}","${t.status}"\n`;
      });
    } else if (subTab === "outstanding") {
      csvContent += "Customer ID,Customer Name,Mobile,City,Dealer Type,Outstanding Balance\n";
      reportState.customerOutstanding.forEach((c) => {
        csvContent += `"${c.customerId}","${c.customerName}","${c.mobile}","${c.city || 'N/A'}","${c.customerType}","₹${c.outstandingAmount}"\n`;
      });
    } else if (subTab === "stock") {
      csvContent += "Product ID,Product Name,Category,Current Stock levels,Wholesale Tariff,Retail Tariff,Status\n";
      products.forEach((p) => {
        csvContent += `"${p.id}","${p.productName}","${p.category}","${p.stock} units","₹${p.wholesalePrice}","₹${p.retailPrice}","${p.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `Report-${subTab}-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Filter Table Items Locally Based on Search Query
  const filteredSubTableItems = useMemo(() => {
    if (!reportState) return [];
    const q = searchParam.toLowerCase().trim();

    if (subTab === "sales") {
      const items = reportState.retailBills || [];
      if (!q) return items;
      return items.filter((b) => b.customer.toLowerCase().includes(q) || b.billNo.toLowerCase().includes(q));
    }
    if (subTab === "purchases") {
      const items = reportState.purchases || [];
      if (!q) return items;
      return items.filter((p) => p.supplier.toLowerCase().includes(q) || p.purchaseNo.toLowerCase().includes(q));
    }
    if (subTab === "transports") {
      const items = reportState.transports || [];
      if (!q) return items;
      return items.filter((t) => t.customer.toLowerCase().includes(q) || t.transportBillNo.toLowerCase().includes(q));
    }
    if (subTab === "outstanding") {
      const items = reportState.customerOutstanding || [];
      if (!q) return items;
      return items.filter((c) => c.customerName.toLowerCase().includes(q) || c.mobile.includes(q));
    }
    if (subTab === "stock") {
      const items = products || [];
      if (!q) return items;
      return items.filter((p) => p.productName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    return [];
  }, [reportState, subTab, searchParam, products]);

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reports & Analytical Ledger</h2>
          <p className="text-xs text-zinc-400">Generate filtered physical sales audits, stock purchase sheets, and customer debts grids</p>
        </div>
        <button
          onClick={fetchReportsData}
          disabled={loadingReport}
          className="bg-[#141822] border border-[#1e2533] hover:bg-[#1c2231] px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide text-zinc-300 hover:text-white transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loadingReport ? "animate-spin text-rose-500" : ""}`} />
          Force Sync Audit
        </button>
      </div>

      {/* FILTER SEARCH CRITERIA ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#141822] border border-[#1e2533] p-5 rounded-3xl">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 pl-1">
            Audit Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              id="report-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 pl-1">
            Audit End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              id="report-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5 pl-1">
            Quick Local Filter Search
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              id="report-local-search"
              type="text"
              placeholder="Search active sub-table rows..."
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* METRIC CARD CORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-400">POS Sales Invoices Count</span>
          <h4 className="text-xl font-black text-rose-500 font-mono mt-1">
            {reportState?.salesCount || 0} tickets
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1">Within filtered epoch limits</p>
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Gross Sales Value</span>
          <h4 className="text-xl font-black text-[#22d3ee] font-mono mt-1">
            ₹{(reportState?.salesTotal || 0).toLocaleString("en-IN")}
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1">Aggregate grand total POS</p>
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Supplier Stock Inwards Cost</span>
          <h4 className="text-xl font-black text-purple-400 font-mono mt-1">
            ₹{(reportState?.purchaseTotal || 0).toLocaleString("en-IN")}
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1">Factory acquisition outputs</p>
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Outstanding Debtors</span>
            <h4 className="text-xl font-black text-amber-500 font-mono mt-1">
              ₹{(customers.reduce((sum, c) => sum + (c.balanceAmount || 0), 0)).toLocaleString("en-IN")}
            </h4>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 p-1.5 rounded bg-amber-500/10 border border-amber-500/20" />
        </div>
      </div>

      {/* CORE REPORTS LEDGER SHEETS */}
      <div className="bg-[#141822] border border-[#1e2533] rounded-3xl overflow-hidden shadow-xl">
        {/* Navigation Selector tab row */}
        <div className="px-6 py-2 border-b border-[#1e2533] bg-[#11141d] flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-1 py-1.5">
            <button
              onClick={() => {
                setSubTab("sales");
                setSearchParam("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wide ${
                subTab === "sales" ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sales Reports
            </button>
            <button
              onClick={() => {
                setSubTab("purchases");
                setSearchParam("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wide ${
                subTab === "purchases" ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "text-zinc-400 hover:text-white"
              }`}
            >
              Purchase Logs
            </button>
            <button
              onClick={() => {
                setSubTab("transports");
                setSearchParam("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wide ${
                subTab === "transports" ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "text-zinc-400 hover:text-white"
              }`}
            >
              Transit dispatch
            </button>
            <button
              onClick={() => {
                setSubTab("outstanding");
                setSearchParam("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wide ${
                subTab === "outstanding" ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "text-zinc-400 hover:text-white"
              }`}
            >
              Outstanding Debts
            </button>
            <button
              onClick={() => {
                setSubTab("stock");
                setSearchParam("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wide ${
                subTab === "stock" ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "text-zinc-400 hover:text-white"
              }`}
            >
              Inventory stock Levels
            </button>
          </div>

          <div className="flex gap-2">
            {/* Export excel / printable actions */}
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="p-2 rounded-lg bg-[#1e2533] border border-[#2d384e] text-zinc-300 hover:text-white hover:bg-[#252f41] transition flex items-center gap-1.5 text-xs font-bold"
              title="Download spreadsheet CSV equivalent"
            >
              <FolderDown className="w-3.5 h-3.5 text-emerald-400" /> Export Excel
            </button>
            <button
              id="print-report-btn"
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-[#1e2533] border border-[#2d384e] text-zinc-300 hover:text-white hover:bg-[#252f41] transition flex items-center gap-1.5 text-xs font-bold"
              title="Print reports checklist"
            >
              <Printer className="w-3.5 h-3.5 text-rose-400" /> Print Sheet
            </button>
          </div>
        </div>

        {/* ACTIVE TABLE SHEET CONTAINER */}
        <div className="overflow-x-auto" id="printable-reports-ledger-table-sheet">
          {subTab === "sales" && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#11141d]/50 border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Bill No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer Account</th>
                  <th className="px-6 py-4">Subtotal</th>
                  <th className="px-6 py-4">Tax factor</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Settled Amount</th>
                  <th className="px-6 py-4 text-right">O/S Debt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533] text-sm font-medium">
                {filteredSubTableItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-500 font-medium">No sales tickets found.</td>
                  </tr>
                ) : (
                  filteredSubTableItems.map((b, index) => (
                    <tr key={b.id} className="hover:bg-[#1a2131]/40 transition-colors">
                      <td className="px-6 py-4 text-zinc-500 font-mono">{index + 1}</td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-400">{b.billNo}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(b.billDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white font-extrabold">{b.customer}</td>
                      <td className="px-6 py-4 text-zinc-400 font-mono">₹{b.subtotal}</td>
                      <td className="px-6 py-4 text-zinc-500 font-mono">18% standard</td>
                      <td className="px-6 py-4 text-rose-400 font-bold font-mono">₹{b.grandTotal}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold font-mono">₹{b.paidAmount}</td>
                      <td className="px-6 py-4 text-amber-500 font-bold font-mono text-right font-bold">₹{b.balanceAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {subTab === "purchases" && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#11141d]/50 border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Inward Way No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Sivakasi Factory Supplier</th>
                  <th className="px-6 py-4 text-right">Aggregate Buying Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533] text-sm font-medium">
                {filteredSubTableItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-medium">No purchase acquisition logs found.</td>
                  </tr>
                ) : (
                  filteredSubTableItems.map((p, index) => (
                    <tr key={p.id} className="hover:bg-[#1a2131]/40 transition-colors">
                      <td className="px-6 py-4 text-zinc-500 font-mono">{index + 1}</td>
                      <td className="px-6 py-4 font-mono font-bold text-rose-400">{p.purchaseNo}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white font-extrabold">{p.supplier}</td>
                      <td className="px-6 py-4 text-cyan-400 font-mono font-bold text-right">
                        ₹{p.totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {subTab === "transports" && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#11141d]/50 border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Waybill No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Consignee Customer</th>
                  <th className="px-6 py-4">Logistics Carrier</th>
                  <th className="px-6 py-4">Vehicle No</th>
                  <th className="px-6 py-4">Depot Point</th>
                  <th className="px-6 py-4">Freight Charge</th>
                  <th className="px-6 py-4 text-right">Cargo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533] text-sm font-medium">
                {filteredSubTableItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 font-medium">No transport dispatches logged.</td>
                  </tr>
                ) : (
                  filteredSubTableItems.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1a2131]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-rose-400">{t.transportBillNo}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(t.dispatchDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white font-extrabold">{t.customer}</td>
                      <td className="px-6 py-4 text-slate-300">{t.transportName}</td>
                      <td className="px-6 py-4 font-mono uppercase text-zinc-400">{t.vehicleNumber || "Counter Pickup"}</td>
                      <td className="px-6 py-4 text-slate-300">{t.destination}</td>
                      <td className="px-6 py-4 text-zinc-400 font-mono">₹{t.transportCharge}</td>
                      <td className="px-6 py-4 text-cyan-400 font-bold font-mono text-right">₹{t.totalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {subTab === "outstanding" && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#11141d]/50 border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Mobile Contact</th>
                  <th className="px-6 py-4">Depot Route</th>
                  <th className="px-6 py-4">Customer Class</th>
                  <th className="px-6 py-4 text-right font-bold text-amber-500">outstanding debt balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533] text-sm font-medium">
                {filteredSubTableItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">No matching outstanding debtors ledger.</td>
                  </tr>
                ) : (
                  filteredSubTableItems.map((c) => (
                    <tr key={c.customerId} className="hover:bg-[#1a2131]/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-500 text-xs">{c.customerId}</td>
                      <td className="px-6 py-4 text-white font-extrabold">{c.customerName}</td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{c.mobile}</td>
                      <td className="px-6 py-4 text-slate-300">{c.city || "Counter walk-in"}</td>
                      <td className="px-6 py-4 capitalize">{c.customerType}</td>
                      <td className="px-6 py-4 text-amber-500 font-bold font-mono text-right text-base font-bold">
                        ₹{(c.outstandingAmount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {subTab === "stock" && (
            <table className="w-full text-left text-sm font-medium">
              <thead>
                <tr className="bg-[#11141d]/50 border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Product Formulation</th>
                  <th className="px-6 py-4">Category Clause</th>
                  <th className="px-6 py-4 font-bold text-cyan-400">Inventory Stock Level</th>
                  <th className="px-6 py-4">Wholesale price Tariff</th>
                  <th className="px-6 py-4 text-right">Retail price Tariff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533]">
                {filteredSubTableItems.map((p) => {
                  const isLow = p.stock <= 5;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#1a2131]/40 transition-colors ${isLow ? "bg-rose-950/10" : ""}`}
                    >
                      <td className="px-6 py-4 font-mono text-zinc-500 text-xs">{p.id}</td>
                      <td className="px-6 py-4 text-white font-extrabold flex items-center gap-2">
                        <span>{p.productName}</span>
                        {isLow && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 rounded uppercase animate-pulse">
                            🚨 Alert
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{p.category}</td>
                      <td className="px-6 py-4 font-bold font-mono">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            isLow ? "text-rose-400 bg-rose-500/15 border border-rose-500/20" : "text-emerald-400"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono">₹{p.wholesalePrice}</td>
                      <td className="px-6 py-4 text-zinc-300 font-mono text-right">₹{p.retailPrice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
