import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Sparkles,
  Flame,
  BadgeAlert,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";

export const Products = () => {
  const { products = [], addProduct, editProduct, deleteProduct, user } = useApp();

  // Dialog / Modal State Managers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Garland Crackers");
  const [netPrice, setNetPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [stock, setStock] = useState("");
  const [discountAvailable, setDiscountAvailable] = useState(false);
  const [status, setStatus] = useState("active");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockSelectorFilter, setStockSelectorFilter] = useState("all"); // 'all', 'low'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Categories Master List
  const categoriesList = [
    "Garland Crackers",
    "Flower Pots",
    "Ground Chakkars",
    "Rockets",
    "Multi-Shots",
    "Sparklers",
    "Fancy Novelties"
  ];

  // Reset fields
  const resetForm = () => {
    setProductName("");
    setCategory("Garland Crackers");
    setNetPrice("");
    setWholesalePrice("");
    setRetailPrice("");
    setStock("");
    setDiscountAvailable(false);
    setStatus("active");
    setEditingItem(null);
  };

  // Open Edit Dialog
  const openEditModal = (p) => {
    setEditingItem(p);
    setProductName(p.productName);
    setCategory(p.category);
    setNetPrice(p.netPrice.toString());
    setWholesalePrice(p.wholesalePrice.toString());
    setRetailPrice(p.retailPrice.toString());
    setStock(p.stock.toString());
    setDiscountAvailable(p.discountAvailable);
    setStatus(p.status);
    setModalOpen(true);
  };

  // Handle Add/Edit submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !category) return;

    const payload = {
      productName,
      category,
      netPrice: Number(netPrice) || 0,
      wholesalePrice: Number(wholesalePrice) || 0,
      retailPrice: Number(retailPrice) || 0,
      stock: Number(stock) || 0,
      discountAvailable,
      status
    };

    try {
      if (editingItem) {
        await editProduct(editingItem.id, payload);
      } else {
        await addProduct(payload);
      }
      setModalOpen(false);
      resetForm();
    } catch (e) {
      // Handled in Context
    }
  };

  const executeItemDeletion = async (id) => {
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
    } catch (e) {
      // Handles error
    }
  };

  // Filter/Search Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // A. Apply Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // B. Apply Category Dropdown Filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // C. Apply Stock level filter
    if (stockSelectorFilter === "low") {
      result = result.filter((p) => (p.stock || 0) <= 5 && p.status === "active");
    }

    return result;
  }, [products, searchQuery, categoryFilter, stockSelectorFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const changePage = (pNum) => {
    if (pNum >= 1 && pNum <= totalPages) {
      setCurrentPage(pNum);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Products Catalogue</h2>
          <p className="text-xs text-zinc-400">Manage fireworks catalog inventory, wholesale/retail rate charts, and stock limits</p>
        </div>
        <button
          id="add-p-btn"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-rose-500 hover:bg-rose-400 text-white px-5 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-rose-955 gap-2"
        >
          <Plus className="w-4 h-4 inline-block mr-1.5" />
          Add New Product
        </button>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#141822] border border-[#1e2533] p-4 rounded-3xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            id="p-search-query"
            type="text"
            placeholder="Search products by brand, category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Category select */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <select
            id="p-category-filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors appearance-none"
          >
            <option value="all">All Category Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock status filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <select
            id="p-stock-filter-select"
            value={stockSelectorFilter}
            onChange={(e) => {
              setStockSelectorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors appearance-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">⚠️ Depleted Stock (Alarm)</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS DASHBOARD TABLE */}
      <div className="bg-[#141822] border border-[#1e2533] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#11141d] border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Net Price (Buy)</th>
                <th className="px-6 py-4">Wholesale Rate</th>
                <th className="px-6 py-4">Retail Rate</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2533]">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No matching fireworks registered in current store catalog.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p, idx) => {
                  const serialNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isLow = (p.stock || 0) <= 5 && p.status === "active";
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#181d2a]/50 transition-colors text-sm font-medium ${
                        isLow ? "bg-rose-950/10 border-l-2 border-l-rose-500" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-zinc-500">{serialNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Flame className={`w-4 h-4 shrink-0 ${isLow ? "text-rose-500 animate-pulse" : "text-amber-500"}`} />
                          <span className="text-white font-extrabold">{p.productName}</span>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 rounded uppercase animate-pulse">
                              <BadgeAlert className="w-2.5 h-2.5" />
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">{p.category}</td>
                      <td className="px-6 py-4 text-zinc-400 font-mono">₹{p.netPrice}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold font-mono font-bold">₹{p.wholesalePrice}</td>
                      <td className="px-6 py-4 text-rose-400 font-bold font-mono font-bold">₹{p.retailPrice}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-mono font-bold px-2 py-1 rounded-lg text-xs ${
                            isLow
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-[#1d2438] text-slate-300 border border-transparent"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.discountAvailable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            Available
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-mono">Nil</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            p.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
                          }`}
                        >
                          {p.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-p-${p.id}`}
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a2131] border border-transparent hover:border-[#2e3b56] transition"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            id={`delete-p-${p.id}`}
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION STATUS CONTROL */}
        <div className="bg-[#11141d] border-t border-[#1e2533] px-6 py-4 flex items-center justify-between font-medium">
          <span className="text-xs text-zinc-400">
            Showing <strong className="text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-white">
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </strong>{" "}
            of <strong className="text-white">{filteredProducts.length}</strong> items registered
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#141822] border border-[#2b354a] text-zinc-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-300 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#141822] border border-[#2b354a] text-zinc-400 hover:text-white disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETION POPUP */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-rose-500/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <h4 className="text-lg font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              Confirm Product Delete
            </h4>
            <p className="text-xs text-zinc-300 tracking-wide mt-2 leading-relaxed">
              Are you sure you want to delete this product from database? This step cannot be reverted.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                id="cancel-delete-p"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-p"
                onClick={() => executeItemDeletion(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-950"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL DIALOGUE */}
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
              <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
              {editingItem ? "Amend Product Record" : "Add Brand Firecracker"}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">Configure retail list pricings and initial shop stock levels</p>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Firework Product Name
                  </label>
                  <input
                    id="form-product-name"
                    type="text"
                    required
                    placeholder="e.g. 50 Shots Fancy Aerial Shells"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Category select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Product Category
                  </label>
                  <select
                    id="form-product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Shop Floor Stock (Units)
                  </label>
                  <input
                    id="form-product-stock"
                    type="number"
                    required
                    placeholder="e.g. 24"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>

                {/* Net Price */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Net Price / Cost (₹)
                  </label>
                  <input
                    id="form-product-net-price"
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={netPrice}
                    onChange={(e) => setNetPrice(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>

                {/* Wholesale Rate */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Wholesale Rate (₹)
                  </label>
                  <input
                    id="form-product-wholesale-price"
                    type="number"
                    required
                    placeholder="e.g. 300"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>

                {/* Retail Rate */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Retail Rate (₹)
                  </label>
                  <input
                    id="form-product-retail-price"
                    type="number"
                    required
                    placeholder="e.g. 420"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                  />
                </div>

                {/* Status selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Catalog Status
                  </label>
                  <select
                    id="form-product-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    <option value="active">Active (On POS)</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Discount check */}
              <div className="flex items-center gap-3.5 bg-[#171b26] border border-[#273044] p-4 rounded-xl mt-2 font-medium">
                <input
                  id="form-product-disc"
                  type="checkbox"
                  checked={discountAvailable}
                  onChange={(e) => setDiscountAvailable(e.target.checked)}
                  className="w-4.5 h-4.5 accent-rose-500 border-zinc-700 bg-zinc-800"
                />
                <div>
                  <label htmlFor="form-product-disc" className="block text-xs font-bold text-white uppercase tracking-wider">
                    Discount Eligibility
                  </label>
                  <span className="block text-[10px] text-zinc-400">Can customer apply seasonal rate cuts on this firework?</span>
                </div>
              </div>

              {/* Button and footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1e2533]">
                <button
                  type="button"
                  id="close-p-modal"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-p-form"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-lg shadow-rose-950"
                >
                  {editingItem ? "Apply Audit Changes" : "Register Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
