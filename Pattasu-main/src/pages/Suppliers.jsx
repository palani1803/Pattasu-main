import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Plus, Search, Building, Edit2, Trash2, Phone, MapPin, X, AlertTriangle } from "lucide-react";

export const Suppliers = () => {
  const { suppliers = [], addSupplier, editSupplier, deleteSupplier, user } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierMobile, setSupplierMobile] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierGst, setSupplierGst] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const resetForm = () => {
    setSupplierName("");
    setSupplierMobile("");
    setSupplierAddress("");
    setSupplierGst("");
    setEditingSupplier(null);
  };

  const openAdd = () => { resetForm(); setModalOpen(true); };

  const openEdit = (s) => {
    setEditingSupplier(s);
    setSupplierName(s.supplierName);
    setSupplierMobile(s.mobile);
    setSupplierAddress(s.address || "");
    setSupplierGst(s.gstNumber || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierName || !supplierMobile) return;
    const payload = { supplierName, mobile: supplierMobile, address: supplierAddress, gstNumber: supplierGst };
    try {
      if (editingSupplier) await editSupplier(editingSupplier.id, payload);
      else await addSupplier(payload);
      setModalOpen(false);
      resetForm();
    } catch (e) {}
  };

  const executeDelete = async (id) => {
    try { await deleteSupplier(id); setDeleteConfirmId(null); } catch (e) {}
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(s => s.supplierName.toLowerCase().includes(q) || s.mobile.includes(q) || (s.address && s.address.toLowerCase().includes(q)));
  }, [suppliers, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Suppliers Registry</h2>
          <p className="text-xs text-zinc-400">Manage factory suppliers and contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#141822] border border-[#1e2533] rounded-xl px-3 py-2 text-sm text-slate-200"
          />
          <button onClick={openAdd} className="bg-rose-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No suppliers found.</p>
        ) : (
          filtered.map(s => (
            <div key={s.id} className="bg-[#141822] border border-[#1e2533] p-4 rounded-2xl flex items-start justify-between">
              <div>
                <h4 className="text-white font-extrabold">{s.supplierName}</h4>
                <p className="text-xs text-zinc-400 mt-1">{s.gstNumber}</p>
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-2"><Phone className="w-4 h-4" /> {s.mobile}</p>
                <p className="text-xs text-zinc-400 mt-1 flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> {s.address || "-"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg bg-[#1b2131] text-zinc-300 hover:text-white">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirmId(s.id)} className="p-2 rounded-lg bg-[#1b2131] text-rose-400 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#141822] border border-rose-500/20 rounded-3xl p-6 w-full max-w-sm">
            <h4 className="text-rose-500 font-black flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Confirm Delete</h4>
            <p className="text-xs text-zinc-400 mt-2">Delete supplier permanently?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-2 bg-[#1e2533] rounded-xl text-zinc-400">Cancel</button>
              <button onClick={() => executeDelete(deleteConfirmId)} className="px-3 py-2 bg-rose-600 rounded-xl text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-lg">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-zinc-400"><X className="w-5 h-5" /></button>
            <h3 className="text-white font-black">{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Supplier Name" className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-3 py-2 text-sm text-slate-200" />
              <input value={supplierMobile} onChange={(e) => setSupplierMobile(e.target.value)} placeholder="Mobile" className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-3 py-2 text-sm text-slate-200" />
              <input value={supplierGst} onChange={(e) => setSupplierGst(e.target.value)} placeholder="GSTIN (optional)" className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-3 py-2 text-sm text-slate-200" />
              <textarea value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} placeholder="Address" className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-3 py-2 text-sm text-slate-200" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-[#1e2533] rounded-xl text-zinc-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-500 rounded-xl text-white">{editingSupplier ? "Save" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
