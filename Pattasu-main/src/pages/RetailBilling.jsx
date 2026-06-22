import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  ReceiptText,
  Search,
  Plus,
  Trash2,
  Percent,
  CheckCircle,
  X,
  Printer,
  Download,
  AlertTriangle,
  User,
  ShoppingBag,
  History,
  TrendingUp,
  CreditCard,
  Flame,
  FileCheck
} from "lucide-react";

export const RetailBilling = () => {
  const { products = [], customers = [], retailBills = [], addRetailBill } = useApp();

  // POS State
  const [selectedCustomerName, setSelectedCustomerName] = useState("Cash Customer");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [gstEnabled, setGstEnabled] = useState(true);

  // Active Item adding state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [inputQuantity, setInputQuantity] = useState("1");
  const [inputRateType, setInputRateType] = useState("retail");

  // Cart
  const [cartItems, setCartItems] = useState([]);

  // Generated Invoice for Printable popup
  const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState(null);
  const [showPrintPopup, setShowPrintPopup] = useState(false);

  // Billing views state ('pos' | 'history')
  const [billingTab, setBillingTab] = useState("pos");

  // Get active product structure
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId && p.status === "active");
  }, [products, selectedProductId]);

  // Handle adding product item to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    const qty = Number(inputQuantity);
    if (!qty || qty <= 0) return;

    // Check if stock is sufficient
    if (activeProduct.stock < qty) {
      alert(`Insufficient product stock! Standard inventory only has ${activeProduct.stock} units of ${activeProduct.productName} left.`);
      return;
    }

    const rate = inputRateType === "retail" ? activeProduct.retailPrice : activeProduct.wholesalePrice;
    
    // Check if item already exists in cart, update quantity
    const existingIndex = cartItems.findIndex((item) => item.productId === activeProduct.id);
    if (existingIndex !== -1) {
      const updatedCarts = [...cartItems];
      const newQty = updatedCarts[existingIndex].quantity + qty;
      
      if (activeProduct.stock < newQty) {
        alert(`Adding this exceeds available quantity. Cap is ${activeProduct.stock} units.`);
        return;
      }
      
      updatedCarts[existingIndex].quantity = newQty;
      updatedCarts[existingIndex].amount = newQty * rate;
      setCartItems(updatedCarts);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: activeProduct.id,
          productName: activeProduct.productName,
          quantity: qty,
          rate: rate,
          amount: qty * rate,
          stock: activeProduct.stock
        },
      ]);
    }

    // Reset select
    setSelectedProductId("");
    setInputQuantity("1");
  };

  // Delete cart item helper
  const removeCartItem = (idx) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // POS Math calculations
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.amount, 0);
    const gstValue = gstEnabled ? Math.round(subtotal * 0.18) : 0; // 18% GST standard
    const disc = Number(discountAmount) || 0;
    const grandTotal = Math.max(0, subtotal + gstValue - disc);
    
    const paid = Number(paidAmount) || (paymentMode === "Credit" ? 0 : grandTotal);
    const balance = Math.max(0, grandTotal - paid);

    return {
      subtotal,
      gstValue,
      grandTotal,
      balance,
      paid
    };
  }, [cartItems, gstEnabled, discountAmount, paidAmount, paymentMode]);

  // POS Checkout trigger
  const handleCheckoutInvoice = async () => {
    if (cartItems.length === 0) {
      alert("Billing cart is currently empty.");
      return;
    }

    const billPayload = {
      customer: selectedCustomerName,
      items: cartItems.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        quantity: c.quantity,
        rate: c.rate,
        amount: c.amount,
      })),
      subtotal: cartTotals.subtotal,
      discount: Number(discountAmount) || 0,
      grandTotal: cartTotals.grandTotal,
      paymentMode,
      paidAmount: paymentMode === "Credit" ? 0 : cartTotals.paid,
      balanceAmount: paymentMode === "Credit" ? cartTotals.grandTotal : cartTotals.balance,
    };

    try {
      await addRetailBill(billPayload);
      
      // Store in invoice previewer state
      setLastGeneratedInvoice({
        ...billPayload,
        billNo: "RET-" + (1001 + retailBills.length),
        billDate: new Date().toISOString()
      });
      
      // Clear Cart
      setCartItems([]);
      setDiscountAmount("0");
      setPaidAmount("");
      setShowPrintPopup(true);
    } catch (e) {
      // Handled globally
    }
  };

  // Simulated PDF Downloader (downloads high-fidelity audit trail)
  const downloadReceiptMetadata = (invoiceObj) => {
    const details = `
-------------------------------------------------------
              PYROTECH SIVAKASI FIREWORKS
-------------------------------------------------------
INVOICE NO : ${invoiceObj.billNo}
DATE-TIME  : ${new Date(invoiceObj.billDate).toLocaleString()}
CUSTOMER   : ${invoiceObj.customer}
PAYMENT    : ${invoiceObj.paymentMode}
-------------------------------------------------------
ITEMS DETAILED:
${invoiceObj.items.map((it, idx) => `${idx + 1}. ${it.productName} x ${it.quantity} @ Rs.${it.rate} = Rs.${it.amount}`).join("\n")}
-------------------------------------------------------
SUBTOTAL   : Rs.${invoiceObj.subtotal}
GST (18%)  : Rs.${Math.round(invoiceObj.subtotal * 0.18)}
DISCOUNT   : Rs.${invoiceObj.discount}
GRAND TOTAL: Rs.${invoiceObj.grandTotal}
PAID AMT   : Rs.${invoiceObj.paidAmount}
BALANCE DUE: Rs.${invoiceObj.balanceAmount}
-------------------------------------------------------
   Generated via Pyrotech Industrial ERP. Thank You!
-------------------------------------------------------
    `;
    const dataBlob = new Blob([details], { type: "text/plain" });
    const dynamicURL = window.URL.createObjectURL(dataBlob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = dynamicURL;
    downloadAnchor.download = `Invoice-${invoiceObj.billNo}.txt`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-6">
      {/* BRAND VIEWS SELECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Retail Billing (POS)</h2>
          <p className="text-xs text-zinc-400">Generate retail client print vouchers, manage tax, and compute inventory depletion</p>
        </div>
        <div className="flex items-center gap-2 bg-[#141822] border border-[#1e2533] p-1.5 rounded-2xl">
          <button
            onClick={() => setBillingTab("pos")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              billingTab === "pos" ? "bg-rose-500 text-white shadow-md shadow-rose-955" : "text-zinc-400 hover:text-white"
            }`}
          >
            POS Counter Terminal
          </button>
          <button
            onClick={() => setBillingTab("history")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              billingTab === "history" ? "bg-rose-500 text-white shadow-md shadow-rose-955" : "text-zinc-400 hover:text-white"
            }`}
          >
            Invoice Billing History ({retailBills.length})
          </button>
        </div>
      </div>

      {billingTab === "pos" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT BILL CART BUILDER */}
          <div className="lg:col-span-2 space-y-6">
            {/* Choose client */}
            <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-3xl space-y-3.5">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1e2533] pb-2.5 font-bold">
                <User className="w-4 h-4 text-rose-500" />
                Select Customer Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Select Customer
                  </label>
                  <select
                    id="pos-customer-select"
                    value={selectedCustomerName}
                    onChange={(e) => {
                      setSelectedCustomerName(e.target.value);
                      // Auto configure payment mode if default Cash Customer
                      if (e.target.value === "Cash Customer") {
                        setPaymentMode("Cash");
                      }
                    }}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors appearance-none"
                  >
                    <option value="Cash Customer">Walking-Counter Cash Customer</option>
                    {customers
                      .filter((c) => c.customerName !== "Cash Customer")
                      .map((c) => (
                        <option key={c.id} value={c.customerName}>
                          {c.customerName} ({c.customerType})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2 font-bold">
                    Client Quick Check
                  </label>
                  <div className="px-3 py-2 bg-[#1e2433] rounded-xl text-xs flex justify-between items-center h-11 border border-zinc-700/50">
                    <span className="text-zinc-400 font-semibold">Active Ledger Bal:</span>
                    <span className="font-mono font-bold text-amber-500 font-bold">
                      ₹
                      {(customers.find((c) => c.customerName === selectedCustomerName)?.balanceAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Choose item input block */}
            <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-3xl space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1e2533] pb-2.5 font-bold">
                <ShoppingBag className="w-4 h-4 text-rose-500" />
                Add Fireworks Product Items
              </h3>

              <form onSubmit={handleAddToCart} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                {/* Select Product */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Select Product
                  </label>
                  <select
                    id="pos-p-select"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors"
                  >
                    <option value="">-- Choose Brand Firework --</option>
                    {products
                      .filter((p) => p.status === "active")
                      .map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.productName} (Stock: {p.stock}) - ₹{p.retailPrice}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Rating Type */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Tariff Type
                  </label>
                  <select
                    id="pos-rate-type-select"
                    value={inputRateType}
                    onChange={(e) => setInputRateType(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500"
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>

                {/* Qty Box */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Quantity
                  </label>
                  <input
                    id="pos-qty-input"
                    type="number"
                    min="1"
                    required
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>

                {/* Add submit button */}
                <div className="sm:col-span-2">
                  <button
                    id="pos-add-to-cart-btn"
                    type="submit"
                    disabled={!selectedProductId}
                    className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-lg shadow-rose-955 font-bold"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </form>

              {/* Live stock inventory warnings box */}
              {activeProduct && (
                <div className="p-3 bg-[#1d2331] rounded-xl border border-zinc-700/50 flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-semibold font-bold">
                    Stock Available: <strong className="text-white font-mono">{activeProduct.stock} units</strong>
                  </span>
                  <div className="flex gap-4 font-bold font-mono">
                    <span className="text-rose-400">Retail: ₹{activeProduct.retailPrice}</span>
                    <span className="text-emerald-400">Wholesale: ₹{activeProduct.wholesalePrice}</span>
                  </div>
                </div>
              )}
            </div>

            {/* CART ITEMS MATRIX GRID */}
            <div className="bg-[#141822] border border-[#1e2533] rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-[#1e2533] bg-[#11141d] flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-bold">Active Billing Cart</h3>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                  {cartItems.length} Firework Lines
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1e2533] text-zinc-400 text-[10px] font-bold uppercase py-3 px-6 bg-[#11141d]/50">
                      <th className="px-6 py-3">S.No</th>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Billing Tariff</th>
                      <th className="px-6 py-3 text-center">Qty</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2533] text-sm font-medium">
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-zinc-500 text-sm font-medium">
                          No products registered in billing cart. Configure items above to begin.
                        </td>
                      </tr>
                    ) : (
                      cartItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#1a2131]/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-zinc-500">{idx + 1}</td>
                          <td className="px-6 py-3.5 text-white font-extrabold">{item.productName}</td>
                          <td className="px-6 py-3.5 text-zinc-300 font-mono">₹{item.rate}</td>
                          <td className="px-6 py-3.5 text-center font-bold text-slate-300 font-mono">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-3.5 text-[#38bdf8] font-bold font-mono">
                            ₹{(item.quantity * item.rate).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              id={`remove-cart-${idx}`}
                              onClick={() => removeCartItem(idx)}
                              className="text-zinc-500 hover:text-rose-500 p-1.5 hover:bg-rose-950/20 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT CHECKOUT BILL CARD SUMMARY */}
          <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-3xl shadow-xl space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1e2533] pb-2.5 font-bold">
              <FileCheck className="w-4 h-4 text-rose-500" />
              Bill Ticket Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3 bg-[#171b26] border border-[#232c3f] p-4 rounded-2xl text-xs font-medium">
              <div className="flex justify-between items-center text-zinc-400 font-bold">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-white">₹{cartTotals.subtotal.toLocaleString("en-IN")}</span>
              </div>

              {/* GST 18% switch option */}
              <div className="flex justify-between items-center border-t border-[#232c3f]/50 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    id="gst-toggle-check"
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="w-4 h-4 accent-rose-500"
                  />
                  <label htmlFor="gst-toggle-check" className="text-zinc-300 font-semibold cursor-pointer font-bold">
                    Apply IGST / CGST @ 18%
                  </label>
                </div>
                <span className="font-mono text-zinc-400 font-bold">
                  {gstEnabled ? `₹${cartTotals.gstValue.toLocaleString("en-IN")}` : "Exempted"}
                </span>
              </div>

              {/* Discount Entry */}
              <div className="border-t border-[#232c3f]/50 pt-3 flex items-center justify-between gap-4">
                <span className="text-zinc-400 font-bold">Promotional Discount (₹):</span>
                <div className="relative w-28 shrink-0">
                  <Percent className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    id="pos-discount-raw"
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full bg-[#1b2131] border border-[#2b354e] rounded-lg pl-8 pr-2 py-1.5 text-xs text-white font-mono text-right"
                  />
                </div>
              </div>

              {/* Calculated grand total */}
              <div className="border-t border-[#232c3f] pt-4 flex justify-between items-center text-sm font-bold text-white font-bold">
                <span className="text-rose-400 font-extrabold uppercase tracking-wide">GRAND TOTAL DUE:</span>
                <span className="font-mono text-xl text-rose-400 font-black">
                  ₹{cartTotals.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Check-Out Settings */}
            <div className="space-y-4">
              {/* Payment Type */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 pl-1 font-bold">
                  Payment Collection Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Cash", "Card", "UPI", "Credit"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPaymentMode(mode);
                        // Force clean default paid configurations
                        if (mode === "Credit") {
                          setPaidAmount("0");
                        } else {
                          setPaidAmount("");
                        }
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                        paymentMode === mode
                          ? "bg-rose-500/10 border-rose-500 text-rose-400"
                          : "bg-[#171b26] border-[#273044] text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handed Cash Paid Input (unless credit payment mode) */}
              {paymentMode !== "Credit" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 pl-1 font-bold">
                    Cash Handed / Paid Amount (₹)
                  </label>
                  <input
                    id="paid-amount-input"
                    type="number"
                    placeholder={`e.g. ${cartTotals.grandTotal}`}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 font-mono"
                  />
                  {cartTotals.balance > 0 && (
                    <span className="block mt-1 pl-1 text-[11px] text-amber-500 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Will post ₹{cartTotals.balance} outstanding to customer ledger.
                    </span>
                  )}
                </div>
              )}

              {paymentMode === "Credit" && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/20 text-[11px] text-amber-400 font-medium flex items-start gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    CREDIT ACCOUNT MODE: No immediate cash captured. 100% of the invoice sum (₹{cartTotals.grandTotal}) will be debited onto {selectedCustomerName}'s account.
                  </span>
                </div>
              )}
            </div>

            {/* CHECKOUT MASTER TRIGGER ACTION BUTTON */}
            <button
               id="pos-submit-checkout"
               onClick={handleCheckoutInvoice}
               disabled={cartItems.length === 0}
               className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-rose-400 font-extrabold text-white text-sm transition-all shadow-lg shadow-rose-955 outline-none flex items-center justify-center gap-2 disabled:opacity-40 font-bold cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Generate Print Bill Voucher
            </button>
          </div>
        </div>
      ) : (
        /* BILLS ARCHIVAL LOGS VIEW */
        <div className="bg-[#141822] border border-[#1e2533] rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1e2533] bg-[#11141d]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-bold">Archived POS Tickets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#11141d] border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Bill No</th>
                  <th className="px-6 py-4">Invoice Timestamp</th>
                  <th className="px-6 py-4">Customer Account</th>
                  <th className="px-6 py-4">Billing Total</th>
                  <th className="px-6 py-4">Pay Mode</th>
                  <th className="px-6 py-4">Settled</th>
                  <th className="px-6 py-4">Ledger Bal</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2533] text-sm font-medium animate-in fade-in">
                {retailBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      No invoices recorded in history.
                    </td>
                  </tr>
                ) : (
                  [...retailBills].reverse().map((b) => (
                    <tr key={b.id} className="hover:bg-[#1a2131]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-rose-400">{b.billNo}</td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(b.billDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-white font-extrabold">{b.customer}</td>
                      <td className="px-6 py-4 text-rose-400 font-bold font-mono">
                        ₹{(b.grandTotal || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-zinc-300">{b.paymentMode}</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-mono">₹{b.paidAmount}</td>
                      <td className="px-6 py-4 text-amber-500 font-mono">₹{b.balanceAmount}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`print-history-btn-${b.id}`}
                          onClick={() => {
                            setLastGeneratedInvoice(b);
                            setShowPrintPopup(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#242c3e] border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-[#2e3b55] transition"
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT DIALOG / BILL INVOICE VISUAL POPUP */}
      {showPrintPopup && lastGeneratedInvoice && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative my-8">
            {/* Close */}
            <button
              onClick={() => setShowPrintPopup(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a2131] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4 font-bold">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              Invoice Voucher Screen
            </h3>

            {/* HIGH FIDELITY BILL INVOICE CONTAINER */}
            <div
              id="printable-billing-invoice-area"
              className="bg-white text-zinc-900 p-6 sm:p-8 rounded-2xl shadow-inner border border-zinc-200 font-sans max-h-96 overflow-y-auto font-medium"
            >
              {/* Receipt Header logo info */}
              <div className="text-center space-y-1 pb-4 border-b border-zinc-200">
                <h1 className="text-lg font-black uppercase tracking-wider text-black font-extrabold">PYROTECH SIVAKASI FIREWORKS</h1>
                <p className="text-xs text-zinc-600 font-medium">Bypass Main Junction, Sivakasi Hub, Tamil Nadu</p>
                <p className="text-[11px] text-zinc-500 font-mono">Contact: +91 9500112233 | GSTIN: 33PYRO1234S1Z4</p>
              </div>

              {/* Meta information row */}
              <div className="grid grid-cols-2 gap-4 text-xs py-4 border-b border-zinc-200">
                <div className="space-y-1">
                  <p className="text-zinc-500 font-bold">Billed Customer Account:</p>
                  <p className="font-extrabold text-[#0f172a] text-sm">{lastGeneratedInvoice.customer}</p>
                  <p className="text-zinc-650 font-mono">Counter POS Client</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-zinc-500 font-bold">Invoice Voucher Receipt:</p>
                  <p className="font-black font-mono text-rose-600 text-sm font-extrabold">{lastGeneratedInvoice.billNo}</p>
                  <p className="text-zinc-650 font-mono">
                    {new Date(lastGeneratedInvoice.billDate).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>

              {/* Items breakdown list */}
              <table className="w-full text-left text-xs my-4 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 text-zinc-500 uppercase font-black tracking-wider text-[10px]">
                    <th className="py-2">Product Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Standard Tariff</th>
                    <th className="py-2 text-right">Gross Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {lastGeneratedInvoice.items.map((it, index) => (
                    <tr key={index} className="text-zinc-800 font-semibold">
                      <td className="py-2">{it.productName}</td>
                      <td className="py-2 text-center font-mono">{it.quantity}</td>
                      <td className="py-2 text-right font-mono">₹{it.rate}</td>
                      <td className="py-2 text-right font-mono text-zinc-950">₹{it.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculated rates audit details */}
              <div className="border-t border-zinc-200 pt-4 flex flex-col items-end text-xs space-y-2">
                <div className="flex justify-between w-60 text-zinc-500 font-medium">
                  <span>Cart Items Subtotal:</span>
                  <span className="font-mono text-zinc-900 font-bold">₹{lastGeneratedInvoice.subtotal}</span>
                </div>
                
                {/* Simulated tax */}
                <div className="flex justify-between w-60 text-zinc-500 font-medium">
                  <span>GST cgst+sgst (18%):</span>
                  <span className="font-mono text-zinc-900 font-bold">
                    [CGST 9% + SGST 9%] ₹{Math.round(lastGeneratedInvoice.subtotal * 0.18)}
                  </span>
                </div>

                {lastGeneratedInvoice.discount > 0 && (
                  <div className="flex justify-between w-60 text-emerald-600 font-semibold">
                    <span>Rebate Seasonal Discount:</span>
                    <span className="font-mono font-bold">- ₹{lastGeneratedInvoice.discount}</span>
                  </div>
                )}

                <div className="flex justify-between w-60 text-sm font-black border-t border-zinc-300/80 pt-2.5 text-zinc-955 font-extrabold">
                  <span className="uppercase text-rose-600 tracking-wide">GRAND TOTAL VALUE:</span>
                  <span className="font-mono text-rose-600 text-base">₹{lastGeneratedInvoice.grandTotal}</span>
                </div>

                <div className="flex justify-between w-60 text-[11px] font-bold text-zinc-500 pt-1.5 border-t border-zinc-200">
                  <span>Amount Settled ({lastGeneratedInvoice.paymentMode}):</span>
                  <span className="font-mono text-zinc-800">
                    ₹{lastGeneratedInvoice.paidAmount}
                  </span>
                </div>

                <div className="flex justify-between w-60 text-[11px] font-bold text-amber-600">
                  <span>Outstanding Ledger Debt:</span>
                  <span className="font-mono">₹{lastGeneratedInvoice.balanceAmount}</span>
                </div>
              </div>

              {/* Footer details */}
              <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 text-center text-[10px] text-zinc-505">
                <p className="font-extrabold uppercase text-zinc-700 font-extrabold">Thank you for your Pyro Purchase!</p>
                <p>Goods once dispatched cannot be returned. Subject to Sivakasi Jurisdiction.</p>
              </div>
            </div>

            {/* BUTTONS ROW */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[#1e2533]">
              <button
                id="invoice-metadata-dl"
                onClick={() => downloadReceiptMetadata(lastGeneratedInvoice)}
                className="px-4 py-2.5 rounded-xl bg-[#1e2533] border border-[#2d384e] hover:bg-[#252e42] text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Audit file
              </button>
              <button
                id="invoice-metadata-print"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Vouchers
              </button>
              <button
                id="invoice-metadata-close"
                onClick={() => setShowPrintPopup(false)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Finish POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
