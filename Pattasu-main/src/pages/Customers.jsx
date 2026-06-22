import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Users,
  Plus,
  Search,
  UserCheck,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  X,
  CreditCard,
  MapPin,
  FileText,
  TrendingDown,
  TrendingUp,
  History,
  Phone
} from "lucide-react";

export const Customers = () => {
  const { customers = [], retailBills = [], addCustomer, editCustomer, deleteCustomer, user } = useApp();

  // Active customer highlight for ledger drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [customerType, setCustomerType] = useState("retail");
  const [balanceAmount, setBalanceAmount] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const resetForm = () => {
    setCustomerName("");
    setMobile("");
    setAddress("");
    setCity("");
    setGstNumber("");
    setCustomerType("retail");
    setBalanceAmount("");
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (c, e) => {
    e.stopPropagation(); // Prevent active ledger select
    setEditingItem(c);
    setCustomerName(c.customerName);
    setMobile(c.mobile);
    setAddress(c.address || "");
    setCity(c.city || "");
    setGstNumber(c.gstNumber || "");
    setCustomerType(c.customerType);
    setBalanceAmount(c.balanceAmount ? c.balanceAmount.toString() : "0");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !mobile) return;

    try {
      const payload = {
        customerName,
        mobile,
        address,
        city,
        gstNumber,
        customerType,
        balanceAmount: Number(balanceAmount) || 0,
      };

      if (editingItem) {
        await editCustomer(editingItem.id, payload);
      } else {
        await addCustomer(payload);
      }
      setModalOpen(false);
      resetForm();
    } catch (e) {
      // Handled globally
    }
  };

  const initiateDelete = (id, e) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await deleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
      setDeleteConfirmId(null);
    } catch (e) {}
  };

  // Filter / Search customer list
  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          (c.city && c.city.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((c) => c.customerType === typeFilter);
    }
    return result;
  }, [customers, searchQuery, typeFilter]);

  // Aggregate stats
  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
  }, [customers]);

  const activeCustomerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return retailBills.filter(
      (b) => b.customer === selectedCustomer.customerName
    );
  }, [selectedCustomer, retailBills]);

  return (
    <div className="space-y-6">
      {/* HEADER CORES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Customer Outstanding Ledger</h2>
          <p className="text-xs text-zinc-400">Record retail & bulk wholesale customer mappings, GST credentials, and credit limits</p>
        </div>
        <button
          id="add-c-btn"
          onClick={openAddModal}
          className="bg-rose-500 hover:bg-rose-400 text-white px-5 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-rose-955 gap-2"
        >
          <Plus className="w-4 h-4 inline-block mr-1.5" />
          Add Customer Profile
        </button>
      </div>

      {/* OVERVIEW PANEL COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Accounts</span>
            <h4 className="text-xl font-extrabold text-white font-mono mt-1">{customers.length} ledger routes</h4>
          </div>
          <Users className="w-8 h-8 text-rose-500 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20" />
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Outstanding Credit Balance</span>
            <h4 className="text-xl font-extrabold text-amber-500 font-mono mt-1">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </h4>
          </div>
          <CreditCard className="w-8 h-8 text-amber-400 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20" />
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Wholesale Buyers</span>
            <h4 className="text-xl font-extrabold text-[#38bdf8] font-mono mt-1">
              {customers.filter((c) => c.customerType === "wholesale").length} companies
            </h4>
          </div>
          <UserCheck className="w-8 h-8 text-[#38bdf8] bg-[#38bdf8]/10 p-1.5 rounded-lg border border-[#38bdf8]/20" />
        </div>
      </div>

      {/* SEARCH FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#141822] border border-[#1e2533] p-4 rounded-3xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            id="c-search-field"
            type="text"
            placeholder="Search accounts catalog by customer name, mobile, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
        <select
          id="c-type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#171b26] border border-[#273044] rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors shrink-0"
        >
          <option value="all">All Buyer Types</option>
          <option value="retail">Retail Consumers</option>
          <option value="wholesale">Wholesale Dealers</option>
        </select>
      </div>

      {/* LEDGER PROFILE SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CUSTOMER DIRECTORY LIST */}
        <div className="lg:col-span-2 bg-[#141822] border border-[#1e2533] rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e2533] bg-[#11141d] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Customer Directory</h3>
            <span className="text-[10px] text-zinc-400">Click a record to view customer outstanding account ledger</span>
          </div>
          <div className="divide-y divide-[#1e2533] max-h-[500px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <p className="p-12 text-center text-zinc-500 text-sm font-medium">No customers match filtered search.</p>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <div
                    key={c.id}
                    id={`cust-item-${c.id}`}
                    onClick={() => setSelectedCustomer(c)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition ${
                      isSelected ? "bg-rose-500/5 border-l-2 border-l-rose-500" : "hover:bg-[#1a2131]/50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-extrabold">{c.customerName}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 rounded uppercase border ${
                            c.customerType === "wholesale"
                              ? "bg-[#38bdf8]/15 border-[#38bdf8]/20 text-[#38bdf8]"
                              : "bg-orange-500/15 border-orange-500/20 text-orange-400"
                          }`}
                        >
                          {c.customerType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-500" /> {c.mobile}
                        </span>
                        {c.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" /> {c.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Balance indicators */}
                      <div className="text-right">
                        <span className="block text-[9px] uppercase font-bold text-zinc-500">O/S balance</span>
                        <span
                          className={`font-mono text-sm font-bold ${
                            c.balanceAmount > 0 ? "text-amber-500" : "text-emerald-400"
                          }`}
                        >
                          ₹{(c.balanceAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* CRUD action buttons */}
                      <div className="flex items-center gap-1 pl-3 border-l border-[#202737]">
                        <button
                          id={`edit-c-${c.id}`}
                          onClick={(e) => openEditModal(c, e)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f2638] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          id={`del-c-${c.id}`}
                          onClick={(e) => initiateDelete(c.id, e)}
                          className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-400 hover:bg-rose-950/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CUSTOMER PROFILE LEDGER (Right drawer-like card) */}
        <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-5 shadow-xl min-h-[400px] flex flex-col">
          {selectedCustomer ? (
            <div className="space-y-5 flex-1 flex flex-col">
              {/* Profile Card Header */}
              <div className="border-b border-[#1e2533] pb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedCustomer.customerName}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">Route: {selectedCustomer.city || "Not set"}</p>
                </div>
                <Users className="w-9 h-9 text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20" />
              </div>

              {/* Quick Contacts */}
              <div className="grid grid-cols-2 gap-3.5 bg-[#171b26] border border-[#232c3f] p-4 rounded-2xl text-xs">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Mobile Contact</span>
                  <p className="text-white font-mono font-bold">{selectedCustomer.mobile}</p>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Customer Type</span>
                  <p className="text-white capitalize font-bold">{selectedCustomer.customerType}</p>
                </div>
                {selectedCustomer.gstNumber && (
                  <div className="col-span-2 border-t border-[#232c3f] pt-2 mt-1">
                    <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">GST Identification No (IN)</span>
                    <p className="text-amber-400 font-mono font-bold uppercase">{selectedCustomer.gstNumber}</p>
                  </div>
                )}
                <div className="col-span-2 border-t border-[#232c3f] pt-2 mt-1">
                  <span className="block text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Dealer Address</span>
                  <p className="text-zinc-300 leading-relaxed font-semibold">
                    {selectedCustomer.address || "Local counter collector"}
                  </p>
                </div>
              </div>

              {/* Balance ledger indicators */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/10 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-zinc-400 uppercase font-bold">Outstanding balance ledger</span>
                  <span className="text-xl font-black font-mono text-amber-500">
                    ₹{(selectedCustomer.balanceAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {selectedCustomer.balanceAmount > 0 ? (
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-emerald-400" />
                )}
              </div>

              {/* Transactions billing invoice history */}
              <div className="flex-1 flex flex-col min-h-0">
                <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-2.5 flex items-center gap-1.5 pb-2 border-b border-[#1e2533]">
                  <History className="w-4 h-4 text-rose-500" />
                  Recent Sales Bills ({activeCustomerInvoices.length})
                </h4>
                <div className="space-y-2 overflow-y-auto max-h-48 pr-1 flex-1">
                  {activeCustomerInvoices.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">No bills generated for this account ledger.</p>
                  ) : (
                    activeCustomerInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 bg-[#171b26] hover:bg-[#1a2131] border border-[#242c3d] rounded-xl flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-white font-mono">{inv.billNo}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(inv.billDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-rose-400 font-mono">
                            ₹{inv.grandTotal.toLocaleString("en-IN")}
                          </p>
                          <span className="text-[9px] font-mono font-bold bg-[#1d2638] text-zinc-400 border border-zinc-700/50 px-1 py-0.2 rounded uppercase">
                            {inv.paymentMode}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3.5">
              <Users className="w-12 h-12 text-zinc-600 bg-zinc-800/20 p-2.5 rounded-2xl border border-zinc-800" />
              <div>
                <h4 className="text-sm font-bold text-zinc-300">No Account Selected</h4>
                <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                  Click a customer profile on the directory to view outstanding transactions ledger immediately
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-rose-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h4 className="text-lg font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              Confirm Ledger Deletion
            </h4>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Are you sure you want to remove this customer account? This will wipe their ledger history completely.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-955"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER DIALOGUE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-lg shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a2131]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-500 animate-pulse" />
              {editingItem ? "Amend Customer Account" : "Register New Account"}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">Configure credit details, mobile number, and optional GST identification</p>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Customer Account Name
                  </label>
                  <input
                    id="form-c-name"
                    type="text"
                    required
                    placeholder="e.g. Sivakasi Fireworks Dealers"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Mobile Contact Number
                  </label>
                  <input
                    id="form-c-mobile"
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    City / Depot Location
                  </label>
                  <input
                    id="form-c-city"
                    type="text"
                    placeholder="e.g. Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* GST Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    GSTIN Identification (Optional)
                  </label>
                  <input
                    id="form-c-gst"
                    type="text"
                    placeholder="e.g. 33AAAAA1111A1Z1"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono uppercase"
                  />
                </div>

                {/* Dealer Class */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Dealer Type
                  </label>
                  <select
                    id="form-c-type"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    <option value="retail">Counter Retail Client</option>
                    <option value="wholesale">Bulk Wholesale Dealer</option>
                  </select>
                </div>

                {/* Opening outstanding balance */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Opening O/S Debt Balance (₹)
                  </label>
                  <input
                    id="form-c-balance"
                    type="number"
                    placeholder="e.g. 5000"
                    disabled={!!editingItem} // Opening depth immutable
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono disabled:opacity-40"
                  />
                </div>

                {/* Dealer complete Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Complete Address
                  </label>
                  <textarea
                    id="form-c-address"
                    rows={2}
                    placeholder="Provide full shipping / billing address details"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1e2533]">
                <button
                  type="button"
                  id="close-c-modal"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-c-form"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-lg shadow-rose-955"
                >
                  {editingItem ? "Apply Changes" : "Register Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
