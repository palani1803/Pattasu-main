import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Forklift,
  Plus,
  Search,
  CheckCircle,
  X,
  MapPin,
  TrendingUp,
  FileCheck,
  Building,
  Edit2,
  Trash2,
  Phone,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";

export const Purchases = () => {
  const {
    suppliers = [],
    purchases = [],
    products = [],
    addSupplier,
    editSupplier,
    deleteSupplier,
    addPurchase,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState("purchases");

  // Supplier forms states
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierMobile, setSupplierMobile] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierGst, setSupplierGst] = useState("");
  const [supplierDeleteConfirmId, setSupplierDeleteConfirmId] = useState(null);

  // Purchase forms states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectSupplierName, setSelectSupplierName] = useState("");
  
  // Stock adding cart lines
  const [addingProductId, setAddingProductId] = useState("");
  const [addingQuantity, setAddingQuantity] = useState("10");
  const [addingRate, setAddingRate] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Search queries
  const [supplierSearch, setSupplierSearch] = useState("");
  const [purchaseSearch, setPurchaseSearch] = useState("");

  const resetSupplierForm = () => {
    setSupplierName("");
    setSupplierMobile("");
    setSupplierAddress("");
    setSupplierGst("");
    setEditingSupplier(null);
  };

  const openAddSupplier = () => {
    resetSupplierForm();
    setSupplierModalOpen(true);
  };

  const openEditSupplier = (s) => {
    setEditingSupplier(s);
    setSupplierName(s.supplierName);
    setSupplierMobile(s.mobile);
    setSupplierAddress(s.address || "");
    setSupplierGst(s.gstNumber || "");
    setSupplierModalOpen(true);
  };

  const handleSupplierForm = async (e) => {
    e.preventDefault();
    if (!supplierName || !supplierMobile) return;

    const payload = {
      supplierName,
      mobile: supplierMobile,
      address: supplierAddress,
      gstNumber: supplierGst,
    };

    try {
      if (editingSupplier) {
        await editSupplier(editingSupplier.id, payload);
      } else {
        await addSupplier(payload);
      }
      setSupplierModalOpen(false);
      resetSupplierForm();
    } catch (e) {}
  };

  const executeSupplierDelete = async (id) => {
    try {
      await deleteSupplier(id);
      setSupplierDeleteConfirmId(null);
    } catch (e) {}
  };

  // Add Item to purchase queue cart helper
  const handleAddPurchaseLine = () => {
    const prodObj = products.find((p) => p.id === addingProductId);
    if (!prodObj) return;

    const q = Number(addingQuantity);
    const r = Number(addingRate) || prodObj.netPrice; // Defaults to product purchase cost

    if (!q || q <= 0) return;

    setPurchaseItems([
      ...purchaseItems,
      {
        productId: prodObj.id,
        productName: prodObj.productName,
        quantity: q,
        rate: r,
        amount: q * r,
      },
    ]);

    setAddingProductId("");
    setAddingQuantity("10");
    setAddingRate("");
  };

  const executePurchaseCheckout = async (e) => {
    e.preventDefault();
    if (!selectSupplierName || purchaseItems.length === 0) {
      alert("Please select supplier and add inward crates items first.");
      return;
    }

    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.amount, 0);

    const payload = {
      supplier: selectSupplierName,
      products: purchaseItems,
      totalAmount,
    };

    try {
      await addPurchase(payload);
      setPurchaseModalOpen(false);
      setPurchaseItems([]);
      setSelectSupplierName("");
    } catch (e) {}
  };

  // Search filtered suppliers
  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const q = supplierSearch.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.supplierName.toLowerCase().includes(q) ||
        s.mobile.includes(q) ||
        (s.address && s.address.toLowerCase().includes(q))
    );
  }, [suppliers, supplierSearch]);

  // Search filtered purchase logs
  const filteredPurchases = useMemo(() => {
    if (!purchaseSearch.trim()) return purchases;
    const q = purchaseSearch.toLowerCase();
    return purchases.filter(
      (p) =>
        p.supplier.toLowerCase().includes(q) ||
        p.purchaseNo.toLowerCase().includes(q)
    );
  }, [purchases, purchaseSearch]);

  const activeNewProductObj = useMemo(() => {
    return products.find((p) => p.id === addingProductId);
  }, [products, addingProductId]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Stock acquisitions & Suppliers</h2>
          <p className="text-xs text-zinc-400">Record finished cracker stock deliveries from Sivakasi manufacturing fields</p>
        </div>
        <div className="flex items-center gap-2 bg-[#141822] border border-[#1e2533] p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab("purchases")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "purchases"
                ? "bg-rose-500 text-white shadow-md shadow-rose-955"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sivakasi Inward Crates
          </button>
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === "suppliers"
                ? "bg-rose-500 text-white shadow-md shadow-rose-955"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Registered Factories ({suppliers.length})
          </button>
        </div>
      </div>

      {activeTab === "purchases" ? (
        /* PURCHASE INWARD LOGS TAB VIEW */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="search-pu-logs"
                type="text"
                placeholder="Search acquisition history by invoice no, factory source..."
                value={purchaseSearch}
                onChange={(e) => setPurchaseSearch(e.target.value)}
                className="w-full bg-[#141822] border border-[#1e2533] rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <button
              id="record-inward-btn"
              onClick={() => {
                setPurchaseItems([]);
                setSelectSupplierName("");
                setPurchaseModalOpen(true);
              }}
              className="bg-rose-500 hover:bg-rose-400 text-white px-5 py-3 rounded-2xl font-bold text-sm transition shadow-lg flex items-center gap-2 ml-auto sm:ml-0"
            >
              <Plus className="w-4 h-4 inline-block mr-1" /> Record Crates Inward
            </button>
          </div>

          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#11141d] border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Inward No</th>
                    <th className="px-6 py-4">Inward Date</th>
                    <th className="px-6 py-4">Source Factory Supplier</th>
                    <th className="px-6 py-4">Crates Volume</th>
                    <th className="px-6 py-4">Total Buying Cost</th>
                    <th className="px-6 py-4 text-right">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2533] text-sm font-medium">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                        No inward crates logs recorded in store registry.
                      </td>
                    </tr>
                  ) : (
                    [...filteredPurchases].reverse().map((p) => {
                      const unitsCount = p.products ? p.products.reduce((sum, item) => sum + item.quantity, 0) : 0;
                      return (
                        <tr key={p.id} className="hover:bg-[#1a2131]/40 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-rose-400">{p.purchaseNo}</td>
                          <td className="px-6 py-4 text-zinc-400">
                            {new Date(p.purchaseDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="px-6 py-4 text-white font-extrabold">{p.supplier}</td>
                          <td className="px-6 py-4 text-slate-300 font-mono font-bold">
                            {unitsCount} items
                          </td>
                          <td className="px-6 py-4 text-rose-400 font-bold font-mono">
                            ₹{p.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                              ✔️ Augmented & Instated
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* FACTORIES SUPPLIERS REGISTRY VIEW */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                id="search-factories"
                type="text"
                placeholder="Search registered mills directory..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                className="w-full bg-[#141822] border border-[#1e2533] rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <button
              id="add-factory-btn"
              onClick={openAddSupplier}
              className="bg-rose-500 hover:bg-rose-400 text-white px-5 py-3 rounded-2xl font-bold text-sm transition shadow-lg flex items-center gap-2 ml-auto sm:ml-0"
            >
              <Building className="w-4 h-4 inline-block mr-1" /> Add Supplier Factory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSuppliers.length === 0 ? (
              <p className="col-span-2 text-center text-zinc-500 text-sm py-12">No registered fireworks factories match filters.</p>
            ) : (
              filteredSuppliers.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex flex-col justify-between hover:border-rose-500/20 transition shadow-lg"
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start border-b border-[#1e2533] pb-3">
                      <div>
                        <h4 className="text-base font-extrabold text-white">{s.supplierName}</h4>
                        {s.gstNumber && (
                          <span className="inline-block mt-1 font-mono text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            GST: {s.gstNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          id={`edit-sup-${s.id}`}
                          onClick={() => openEditSupplier(s)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a2131] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`del-sup-${s.id}`}
                          onClick={() => setSupplierDeleteConfirmId(s.id)}
                          className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-400 hover:bg-rose-950/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-zinc-500" />
                        <span>Mobile contact: <strong>{s.mobile}</strong></span>
                      </p>
                      <p className="flex items-start gap-2 leading-relaxed">
                        <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                        <span>Address: <strong className="text-zinc-300 font-semibold">{s.address || "Sivakasi Factories Road"}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SUPPLIER MODAL */}
      {supplierDeleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-rose-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h4 className="text-lg font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              Confirm Supplier Delete
            </h4>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Are you sure you want to remove this supplier from registry? This cannot be reverted.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSupplierDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => executeSupplierDelete(supplierDeleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-955"
              >
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM INWARD ADD MODAL */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-xl shadow-2xl relative my-8">
            <button
              onClick={() => setPurchaseModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Forklift className="w-5 h-5 text-rose-500 animate-pulse" />
              Record stock inward loading
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">Acquire products directly from manufactories. Shop inventory levels will increment accordingly.</p>

            <form onSubmit={executePurchaseCheckout} className="space-y-4 mt-6">
              {/* Select Supplier */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                  Select Loading Factory Supplier
                </label>
                <select
                  id="choice-fact-sup"
                  required
                  value={selectSupplierName}
                  onChange={(e) => setSelectSupplierName(e.target.value)}
                  className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-300"
                >
                  <option value="">-- Choose Factory Mill --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.supplierName}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item picker cart builder */}
              <div className="bg-[#171b26] border border-[#273044] p-4 rounded-2xl space-y-3 mt-4">
                <span className="block text-xs font-bold text-white uppercase tracking-wider">
                  Pick Firework & Qty To Instate
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <select
                      id="pu-prod-pick"
                      value={addingProductId}
                      onChange={(e) => setAddingProductId(e.target.value)}
                      className="w-full bg-[#1b2131] border border-[#2d384e] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">-- Choose Firework --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Qty */}
                  <div className="sm:col-span-3">
                    <input
                      id="pu-qty-pick"
                      type="number"
                      placeholder="Crates quantity"
                      min="1"
                      value={addingQuantity}
                      onChange={(e) => setAddingQuantity(e.target.value)}
                      className="w-full bg-[#1b2131] border border-[#2d384e] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  {/* Pricing Rate */}
                  <div className="sm:col-span-2">
                    <input
                      id="pu-rate-pick"
                      type="number"
                      placeholder="Cost / Crates"
                      value={addingRate}
                      onChange={(e) => setAddingRate(e.target.value)}
                      className="w-full bg-[#1b2131] border border-[#2d384e] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      id="add-pu-cart"
                      onClick={handleAddPurchaseLine}
                      className="w-full py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-955"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Displaying Live Product Buying cost default guides */}
                {activeNewProductObj && (
                  <p className="text-[10px] text-zinc-500 pl-1 font-medium font-mono">
                    Standard Buying Cost Rate Factor is: ₹{activeNewProductObj.netPrice} per unit.
                  </p>
                )}

                {/* Inward Items Table */}
                <div className="max-h-24 overflow-y-auto space-y-1.5 pt-1">
                  {purchaseItems.map((itm, index) => (
                    <div key={index} className="flex justify-between items-center text-xs font-mono text-zinc-300">
                      <span>{itm.productName}</span>
                      <strong className="text-emerald-400">
                        {itm.quantity} crates @ ₹{itm.rate} / e.a.
                      </strong>
                    </div>
                  ))}
                  {purchaseItems.length === 0 && (
                    <p className="text-[10px] text-zinc-500 italic text-center py-2">No crates added onto purchase cargo manifest</p>
                  )}
                </div>
              </div>

              {/* Checkout buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1e2533]">
                <button
                  type="button"
                  id="close-pu-modal"
                  onClick={() => setPurchaseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-pu-invoice"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white text-xs font-bold transition shadow-lg"
                >
                  Augment Stocks & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FACTORY SUPPLIER REGISTER / EDIT MODAL */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-lg shadow-2xl relative my-8">
            <button
              onClick={() => setSupplierModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Building className="w-5 h-5 text-rose-500 animate-pulse" />
              {editingSupplier ? "Amend Factory Supplier" : "Register Factory Supplier"}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">Configure company details, mobile contacts, and optional raw GSTIN identifier</p>

            <form onSubmit={handleSupplierForm} className="space-y-4 mt-6 font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Factory/Supplier Registered Name
                  </label>
                  <input
                    id="form-s-name"
                    type="text"
                    required
                    placeholder="e.g. Sri Kaliswari Fireworks Ltd."
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Mobile Contact Number
                  </label>
                  <input
                    id="form-s-mobile"
                    type="text"
                    required
                    placeholder="e.g. 9500112233"
                    value={supplierMobile}
                    onChange={(e) => setSupplierMobile(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500"
                  />
                </div>

                {/* GST */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    GSTIN Registration
                  </label>
                  <input
                    id="form-s-gst"
                    type="text"
                    placeholder="e.g. 33KALI1234K1Z2"
                    value={supplierGst}
                    onChange={(e) => setSupplierGst(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500 uppercase font-mono"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Mill Address
                  </label>
                  <textarea
                    id="form-s-address"
                    rows={2}
                    placeholder="Configure Sivakasi mills address context..."
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1e2533]">
                <button
                  type="button"
                  id="close-s-modal"
                  onClick={() => setSupplierModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-s-form"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-lg"
                >
                  {editingSupplier ? "Apply Changes" : "Register Factory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
