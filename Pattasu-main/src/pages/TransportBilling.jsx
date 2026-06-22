import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  Flame,
  FileSpreadsheet
} from "lucide-react";

export const TransportBilling = () => {
  const { transportBills = [], addTransportBill, updateTransportStatus, customers = [], products = [] } = useApp();

  // Selected Order for printable Gate Pass Popup representation
  const [selectedBillForGatePass, setSelectedBillForGatePass] = useState(null);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [transportName, setTransportName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [destination, setDestination] = useState("");
  const [transportCharge, setTransportCharge] = useState("");
  const [status, setStatus] = useState("Pending");

  // Selection items inside transport
  const [transitProductId, setTransitProductId] = useState("");
  const [transitQuantity, setTransitQuantity] = useState("1");
  const [transitItems, setTransitItems] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const resetForm = () => {
    setCustomerName("");
    setTransportName("");
    setVehicleNumber("");
    setDestination("");
    setTransportCharge("");
    setStatus("Pending");
    setTransitItems([]);
    setTransitProductId("");
    setTransitQuantity("1");
  };

  const handleAddTransitItem = () => {
    const prodObj = products.find((p) => p.id === transitProductId);
    if (!prodObj) return;

    const qty = Number(transitQuantity);
    if (!qty || qty <= 0) return;

    const rate = prodObj.wholesalePrice; // Transport orders usually reference Wholesale prices
    setTransitItems([
      ...transitItems,
      {
        productId: prodObj.id,
        productName: prodObj.productName,
        quantity: qty,
        rate,
        amount: qty * rate,
      },
    ]);

    setTransitProductId("");
    setTransitQuantity("1");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !transportName) return;

    const subtotal = transitItems.reduce((sum, item) => sum + item.amount, 0);
    const charge = Number(transportCharge) || 0;
    const totalAmount = subtotal + charge;

    const payload = {
      customer: customerName,
      transportName,
      vehicleNumber,
      destination,
      items: transitItems,
      transportCharge: charge,
      totalAmount,
      status,
    };

    try {
      await addTransportBill(payload);
      setModalOpen(false);
      resetForm();
    } catch (e) {}
  };

  // Status Color Helper
  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case "Pending":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Dispatched":
        return "bg-blue-500/10 text-cyan-400 border border-cyan-500/20";
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Cancelled":
        return "bg-zinc-800 text-zinc-500 border border-zinc-700";
      default:
        return "bg-zinc-850 text-zinc-400 border border-transparent";
    }
  };

  // Search/Filter matching
  const filteredBills = useMemo(() => {
    let result = transportBills;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.customer.toLowerCase().includes(q) ||
          b.transportBillNo.toLowerCase().includes(q) ||
          b.transportName.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    return result;
  }, [transportBills, searchQuery, statusFilter]);

  // Aggregate stats
  const transportStats = useMemo(() => {
    const pending = transportBills.filter((tb) => tb.status === "Pending").length;
    const active = transportBills.filter((tb) => tb.status === "Dispatched").length;
    const totalCharges = transportBills.reduce((sum, tb) => sum + (tb.transportCharge || 0), 0);
    return { pending, active, totalCharges };
  }, [transportBills]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Transport Dispatch logs</h2>
          <p className="text-xs text-zinc-400">Generate transport lorry gate passes, configure vehicle details, and adjust delivery states</p>
        </div>
        <button
          id="add-tb-btn"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-rose-500 hover:bg-rose-400 text-white px-5 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-rose-955 flex items-center gap-2 font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 inline-block mr-1" />
          Create Transport Waybill
        </button>
      </div>

      {/* QUICK STATUS METRIC CORES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-medium">
        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Pending Lorry Cargoes</span>
            <h4 className="text-xl font-extrabold text-amber-500 font-mono mt-1">{transportStats.pending} dispatches waiting</h4>
          </div>
          <Truck className="w-8 h-8 text-amber-500 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20" />
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-bold">Active In-Transit Ships</span>
            <h4 className="text-xl font-extrabold text-[#22d3ee] font-mono mt-1">{transportStats.active} trucks route</h4>
          </div>
          <ChevronRight className="w-8 h-8 text-[#22d3ee] bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20 animate-pulse" />
        </div>

        <div className="bg-[#141822] border border-[#1e2533] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-bold">Aggregate Carrier Freight</span>
            <h4 className="text-xl font-extrabold text-white font-mono mt-1">₹{transportStats.totalCharges.toLocaleString("en-IN")}</h4>
          </div>
          <FileSpreadsheet className="w-8 h-8 text-rose-500 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20" />
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#141822] border border-[#1e2533] p-4 rounded-3xl font-medium">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            id="t-search-field"
            type="text"
            placeholder="Search log by waybill no, customer name, carrier, route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171b26] border border-[#273044] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
        <select
          id="t-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#171b26] border border-[#273044] rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
        >
          <option value="all">All Transit Statuses</option>
          <option value="Pending">Pending Cargo queue</option>
          <option value="Dispatched">Dispatched on Lorry</option>
          <option value="Delivered">Delivered (Safe/Checked)</option>
          <option value="Cancelled">Cancelled gate Pass</option>
        </select>
      </div>

      {/* TRANSPORT ORDERS TABLE */}
      <div className="bg-[#141822] border border-[#1e2533] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#11141d] border-b border-[#1e2533] text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Waybill No</th>
                <th className="px-6 py-4">Consignee Customer</th>
                <th className="px-6 py-4">Carrier Logist</th>
                <th className="px-6 py-4">Vehicle Number</th>
                <th className="px-6 py-4">Transit Depot Route</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Gate Pass Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2533] text-sm font-medium animate-in fade-in">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 font-medium font-bold">
                    No active freight shipments registered.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1a2131]/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-rose-400">{b.transportBillNo}</td>
                    <td className="px-6 py-4 text-white font-extrabold">{b.customer}</td>
                    <td className="px-6 py-4 text-zinc-300">{b.transportName}</td>
                    <td className="px-6 py-4 font-mono text-zinc-400 uppercase">{b.vehicleNumber || "Counter Pick"}</td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {b.destination}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cyan-400 font-bold font-mono">
                      ₹{(b.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {/* One-click status cycles with inline trigger */}
                      <select
                        value={b.status}
                        onChange={(e) => updateTransportStatus(b.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg focus:outline-none cursor-pointer uppercase ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        <option value="Pending">⌛ Pending</option>
                        <option value="Dispatched">🚚 Dispatched</option>
                        <option value="Delivered">✔️ Delivered</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        id={`print-tb-btn-${b.id}`}
                        onClick={() => setSelectedBillForGatePass(b)}
                        className="px-3 py-1.5 rounded-lg bg-[#242c3e] border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-[#2e3b55] transition cursor-pointer"
                      >
                        Print Manifest
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GATE PASS POPUP PRINT */}
      {selectedBillForGatePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-xl shadow-2xl relative">
            <button
              onClick={() => setSelectedBillForGatePass(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a2131] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4 font-bold">
              <Truck className="w-5 h-5 text-rose-500 animate-pulse" />
              Lorry Gate Pass Manifest
            </h3>

            {/* printable page */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl border border-zinc-200 uppercase font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto font-bold">
              <div className="text-center space-y-1 pb-3 mb-3 border-b-2 border-slate-900">
                <h2 className="text-base font-black text-black font-extrabold">PYROTECH LORRY GATE PASS</h2>
                <h4 className="text-[10px] text-zinc-650">Sivakasi Factories Loading Depot</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-300 text-zinc-800">
                <div>
                  <p>WAYBILL NO : <strong className="text-black font-extrabold">{selectedBillForGatePass.transportBillNo}</strong></p>
                  <p>CARRIER    : {selectedBillForGatePass.transportName}</p>
                  <p>VEHICLE NO : <span className="text-black font-extrabold">{selectedBillForGatePass.vehicleNumber || "LOCAL PICKUP"}</span></p>
                </div>
                <div>
                  <p>DISPATCH DT : {new Date(selectedBillForGatePass.dispatchDate).toLocaleDateString()}</p>
                  <p>ROUTE/DEST  : {selectedBillForGatePass.destination}</p>
                  <p>WAY STATE  : <span className="text-black font-semibold">{selectedBillForGatePass.status}</span></p>
                </div>
              </div>

              <div className="mt-4">
                <p className="font-extrabold border-b border-zinc-300 mb-2 pb-1 text-black">CARGO INVENTORY LIST:</p>
                {selectedBillForGatePass.items && selectedBillForGatePass.items.length > 0 ? (
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-200 font-extrabold text-black">
                        <th className="py-1">DESCRIPTION</th>
                        <th className="py-1 text-center">QTY</th>
                        <th className="py-1 text-right">RATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBillForGatePass.items.map((it, index) => (
                        <tr key={index} className="text-zinc-700">
                          <td className="py-1">{it.productName}</td>
                          <td className="py-1 text-center font-bold">{it.quantity} CTNS</td>
                          <td className="py-1 text-right font-bold">₹{it.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-zinc-650 italic text-center py-4">No item-wise cargo listed inside manifests.</p>
                )}
              </div>

              <div className="border-t border-zinc-300 mt-4 pt-3 flex flex-col items-end text-zinc-850">
                <p>FREIGHT CHARGES: ₹{selectedBillForGatePass.transportCharge}</p>
                <p className="font-extrabold text-black font-mono text-xs mt-1 font-black">
                  ESTIMATED CARGO VALUE: ₹{selectedBillForGatePass.totalAmount}
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 mt-12 text-center text-[10px] text-zinc-650 font-bold border-t border-dashed border-zinc-300 pt-6">
                <div>
                  <p className="border-b border-zinc-400 w-32 mx-auto mb-1"></p>
                  <p>LOADING OFFICER SIGN</p>
                </div>
                <div>
                  <p className="border-b border-zinc-400 w-32 mx-auto mb-1"></p>
                  <p>LORRY DRIVER CARRIER SIGN</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[#1e2533]">
              <button
                id="close-gate-pass"
                onClick={() => setSelectedBillForGatePass(null)}
                className="px-4 py-2 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                id="print-gate-pass"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-955"
              >
                <Printer className="w-4 h-4" /> Print Gate Waybill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TRANSPORT WAYBILL DIALOGUE */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-[#1e2533] rounded-3xl p-6 w-full max-w-lg shadow-2xl relative my-8 font-medium">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 font-bold">
              <Truck className="w-5 h-5 text-rose-500 animate-pulse" />
              Configure cargo waybill
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 pb-1">Specify lorry details, consignee customer mapping, and waypoint charges</p>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6 font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Consignee */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Consignee Customer
                  </label>
                  <select
                    id="form-t-customer"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Choose Account --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.customerName}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Carrier logistics Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Logistics / Lorry Name
                  </label>
                  <input
                    id="form-t-carrier"
                    type="text"
                    required
                    placeholder="e.g. VRL Logistics"
                    value={transportName}
                    onChange={(e) => setTransportName(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* Vehicle */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Vehicle Number (Lorry)
                  </label>
                  <input
                    id="form-t-vehicle"
                    type="text"
                    placeholder="e.g. TN-67-A-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Destination Depot Route
                  </label>
                  <input
                    id="form-t-destination"
                    type="text"
                    placeholder="e.g. Chennai Depot"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                {/* Transport charge */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Carrying Freight Charge (₹)
                  </label>
                  <input
                    id="form-t-charge"
                    type="number"
                    placeholder="e.g. 1200"
                    value={transportCharge}
                    onChange={(e) => setTransportCharge(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-zinc-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Status selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Initial Dispatch Status
                  </label>
                  <select
                    id="form-t-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#171b26] border border-[#273044] rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Pending">⌛ Waiting / Loading</option>
                    <option value="Dispatched">🚚 Dispatched In-Transit</option>
                  </select>
                </div>
              </div>

              {/* Transit Cargo Item Constructor */}
              <div className="bg-[#171b26] border border-[#273044] p-4 rounded-2xl space-y-3 mt-4">
                <span className="block text-xs font-bold text-white uppercase tracking-wider font-bold">
                  Add Cargo Firework items
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end font-bold">
                  <div className="sm:col-span-7">
                    <select
                      id="transit-prod-choose"
                      value={transitProductId}
                      onChange={(e) => setTransitProductId(e.target.value)}
                      className="w-full bg-[#1b2131] border border-[#2d384e] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="">-- Choose Item --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 font-mono">
                    <input
                      id="transit-qty-choose"
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={transitQuantity}
                      onChange={(e) => setTransitQuantity(e.target.value)}
                      className="w-full bg-[#1b2131] border border-[#2d384e] rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      id="add-transit-line-item"
                      onClick={handleAddTransitItem}
                      className="w-full py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-955 cursor-pointer font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Transit Cart Output */}
                <div className="max-h-24 overflow-y-auto space-y-1.5 pt-1 font-bold">
                  {transitItems.map((itm, index) => (
                    <div key={index} className="flex justify-between items-center text-[10px] font-mono text-zinc-350 bg-[#141822]/45 px-3 py-1 rounded">
                      <span>{itm.productName}</span>
                      <strong className="text-cyan-400">{itm.quantity} Units</strong>
                    </div>
                  ))}
                  {transitItems.length === 0 && (
                    <p className="text-[10px] text-zinc-500 italic text-center py-2">No firecracker crates queued yet</p>
                  )}
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#1e2533]">
                <button
                  type="button"
                  id="cancel-t-form"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e2533] text-zinc-400 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-t-form"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition shadow-lg shadow-rose-955 cursor-pointer font-bold"
                >
                  Create Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
