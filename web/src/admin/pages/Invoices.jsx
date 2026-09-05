import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import ThermalInvoice from "../components/ThermalInvoice";
import { orderService } from "../../services/orderService";
import "./Invoices.css";

const STATUS_COLORS = {
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Shipped:   { bg: "#fef9c3", color: "#a16207" },
  Pending:   { bg: "#dbeafe", color: "#1d4ed8" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
  Confirmed: { bg: "#f3e8ff", color: "#7c3aed" },
  Returned:  { bg: "#fee2e2", color: "#dc2626" },
};

// Play a crisp, gentle synthesizer chime on new order
const playOrderChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    // Audio context may be restricted before user gesture
    console.debug("Audio chime skipped:", e);
  }
};

const Invoices = ({ orders = [], loading = false }) => {
  const [localOrders, setLocalOrders] = useState(orders);
  const [filter, setFilter] = useState("all"); // all | unprinted | printed
  const [search, setSearch] = useState("");
  const [printBatch, setPrintBatch] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toast, setToast] = useState(null);
  const [autoPrint, setAutoPrint] = useState(() => {
    return localStorage.getItem("anika_auto_print") !== "false";
  });

  const toastTimerRef = useRef(null);

  const showToast = (message, type = "info") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Keep localOrders synced with incoming props
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Toggle Auto-Print setting
  const handleToggleAutoPrint = () => {
    setAutoPrint((prev) => {
      const next = !prev;
      localStorage.setItem("anika_auto_print", String(next));
      showToast(
        next
          ? "🟢 Auto-Print turned ON — invoices will print immediately on new orders!"
          : "⚪ Auto-Print paused — use 'Print All Pending' to print manually.",
        next ? "success" : "info"
      );
      return next;
    });
  };

  // Reusable batch print trigger
  const triggerPrintBatch = async (ordersToPrint) => {
    if (!ordersToPrint || ordersToPrint.length === 0 || isPrinting) return;
    try {
      setIsPrinting(true);
      setPrintBatch(ordersToPrint);

      // Allow 200ms for React to mount thermal invoices to the DOM
      await new Promise((res) => setTimeout(res, 200));

      // Trigger browser print dialog
      window.print();

      // Mark all printed in Supabase
      const ids = ordersToPrint.map((o) => o.id);
      await orderService.markInvoicesBulkPrinted(ids);

      // Optimistically update local state so rows turn green / counted as printed
      setLocalOrders((prev) =>
        prev.map((o) => (ids.includes(o.id) ? { ...o, invoice_printed: true } : o))
      );

      showToast(
        `✅ Successfully printed ${ids.length} invoice${ids.length > 1 ? "s" : ""}!`,
        "success"
      );
    } catch (err) {
      console.error("Print batch error:", err);
      showToast("Print error: " + err.message, "error");
    } finally {
      setIsPrinting(false);
      setPrintBatch([]);
    }
  };

  // Supabase Realtime: Auto-print on new order creation
  useEffect(() => {
    const channel = supabase
      .channel("invoices-realtime-listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const newOrder = payload.new;
          console.log("⚡ [Invoices Realtime] New Order Received:", newOrder);

          // Prepend new order to list if not present
          setLocalOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });

          // If auto-print is enabled and this order is not marked as printed yet
          if (autoPrint && !newOrder.invoice_printed) {
            playOrderChime();
            const orderShortId = String(newOrder.id).slice(-8).toUpperCase();
            showToast(`🔔 New Order #${orderShortId} placed! Auto-printing invoice...`, "info");

            setTimeout(() => {
              triggerPrintBatch([newOrder]);
            }, 300);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoPrint]);

  // Master Print All Pending
  const handlePrintAllPending = () => {
    const unprinted = localOrders.filter((o) => !o.invoice_printed);
    if (unprinted.length === 0) {
      showToast("No pending invoices to print! All orders are already printed.", "info");
      return;
    }
    triggerPrintBatch(unprinted);
  };

  // Filter and search
  const unprintedCount = localOrders.filter((o) => !o.invoice_printed).length;
  const printedCount = localOrders.filter((o) => o.invoice_printed).length;

  const filtered = localOrders.filter((order) => {
    if (filter === "unprinted" && order.invoice_printed) return false;
    if (filter === "printed" && !order.invoice_printed) return false;
    if (search) {
      const q = search.toLowerCase();
      const id = String(order.id || "").toLowerCase();
      const name = String(order.customer?.name || "").toLowerCase();
      const phone = String(order.customer?.phone || "").toLowerCase();
      if (!id.includes(q) && !name.includes(q) && !phone.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="inv">
      {/* Toast Alert */}
      {toast && (
        <div className={`inv__toast inv__toast--${toast.type}`}>
          <span className="inv__toast-icon">
            {toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "🔔"}
          </span>
          <span className="inv__toast-msg">{toast.message}</span>
          <button className="inv__toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="inv__header">
        <div>
          <h1 className="inv__title">Invoices & Printing</h1>
          <p className="inv__subtitle">
            Thermal 80mm receipts for orders. Printed invoices cannot be reprinted.
          </p>
        </div>

        {/* Master Print All Together & Auto-Print Toggle */}
        <div className="inv__header-actions">
          <button
            className={`inv__auto-toggle ${autoPrint ? "inv__auto-toggle--active" : ""}`}
            onClick={handleToggleAutoPrint}
            title={autoPrint ? "Click to pause auto-printing" : "Click to enable auto-printing"}
          >
            <span className={`inv__pulse-dot ${autoPrint ? "inv__pulse-dot--active" : ""}`} />
            Auto-Print: {autoPrint ? "ON" : "OFF"}
          </button>

          <button
            className="inv__master-print-btn"
            onClick={handlePrintAllPending}
            disabled={unprintedCount === 0 || isPrinting}
          >
            {isPrinting ? (
              <>
                <span className="inv__spin">⏳</span> Printing...
              </>
            ) : (
              <>
                <span>🖨️</span>
                <span>Print All Pending</span>
                {unprintedCount > 0 && (
                  <span className="inv__btn-badge">{unprintedCount}</span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="inv__stats">
        <div className="inv__stat-card inv__stat-card--pending">
          <div className="inv__stat-num">{unprintedCount}</div>
          <div className="inv__stat-label">Pending to Print</div>
        </div>
        <div className="inv__stat-card inv__stat-card--done">
          <div className="inv__stat-num">{printedCount}</div>
          <div className="inv__stat-label">Already Printed</div>
        </div>
        <div className="inv__stat-card inv__stat-card--total">
          <div className="inv__stat-num">{localOrders.length}</div>
          <div className="inv__stat-label">Total Orders</div>
        </div>
      </div>

      {/* Status banner */}
      <div className="inv__status-banner">
        <div className="inv__status-banner-left">
          <span className="inv__status-banner-indicator">
            {autoPrint ? "🟢" : "⚪"}
          </span>
          <div>
            <strong>
              {autoPrint
                ? "Auto-Print Active"
                : "Auto-Print Paused"}
            </strong>
            <p>
              {autoPrint
                ? "As soon as any customer places an order, the thermal invoice will be generated and printed automatically."
                : "Auto-printing is paused. Use 'Print All Pending' to print waiting orders together in one go."}
            </p>
          </div>
        </div>
        {unprintedCount > 0 && (
          <button
            className="inv__status-banner-action"
            onClick={handlePrintAllPending}
            disabled={isPrinting}
          >
            Print {unprintedCount} Pending Invoice{unprintedCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="inv__toolbar">
        <div className="inv__filter-tabs">
          <button
            className={`inv__tab ${filter === "all" ? "inv__tab--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`inv__tab ${filter === "unprinted" ? "inv__tab--active" : ""}`}
            onClick={() => setFilter("unprinted")}
          >
            Not Printed
            {unprintedCount > 0 && (
              <span className="inv__tab-badge">{unprintedCount}</span>
            )}
          </button>
          <button
            className={`inv__tab ${filter === "printed" ? "inv__tab--active" : ""}`}
            onClick={() => setFilter("printed")}
          >
            Printed
          </button>
        </div>

        <input
          className="inv__search"
          type="text"
          placeholder="Search by order ID, name, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="inv__table-wrap">
        {/* Table Header */}
        <div className="inv__table-head">
          <div className="inv__col inv__col--id">Order ID</div>
          <div className="inv__col inv__col--customer">Customer</div>
          <div className="inv__col inv__col--date">Date</div>
          <div className="inv__col inv__col--total">Amount</div>
          <div className="inv__col inv__col--payment">Payment</div>
          <div className="inv__col inv__col--status">Status</div>
          <div className="inv__col inv__col--action">Action</div>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="inv__row inv__row--skeleton">
              <div
                className="skeleton-shimmer"
                style={{ height: "20px", width: "80%", borderRadius: "4px" }}
              />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="inv__empty">
            <span>🧾</span>
            <p>No invoices found</p>
          </div>
        ) : (
          filtered.map((order) => {
            const statusCfg = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            const orderShortId = order.id
              ? "#" + String(order.id).slice(-8).toUpperCase()
              : "#UNKNOWN";
            const orderDate = order.order_date
              ? new Date(order.order_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "N/A";

            const isPrinted = Boolean(order.invoice_printed);

            return (
              <div
                key={order.id}
                className={`inv__row ${isPrinted ? "inv__row--printed" : ""}`}
              >
                <div className="inv__col inv__col--id">
                  <span className="inv__order-id">{orderShortId}</span>
                </div>

                <div className="inv__col inv__col--customer">
                  <span className="inv__customer-name">
                    {order.customer?.name || "N/A"}
                  </span>
                  <span className="inv__customer-phone">
                    {order.customer?.phone || ""}
                  </span>
                </div>

                <div className="inv__col inv__col--date">{orderDate}</div>

                <div className="inv__col inv__col--total">
                  ₹{Number(order.total_price || 0).toLocaleString("en-IN")}
                </div>

                <div className="inv__col inv__col--payment">
                  <span className="inv__payment-badge">{order.payment || "COD"}</span>
                </div>

                <div className="inv__col inv__col--status">
                  <span
                    className="inv__status-badge"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="inv__col inv__col--action">
                  {isPrinted ? (
                    <span className="inv__printed-badge">✅ Printed</span>
                  ) : (
                    <button
                      className="inv__print-btn"
                      onClick={() => triggerPrintBatch([order])}
                      disabled={isPrinting}
                    >
                      <span>🖨️</span> Print
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Hidden container used during printing — supports both single order and batch */}
      {printBatch && printBatch.length > 0 && (
        <div className="thermal-print-area">
          {printBatch.map((orderItem) => (
            <ThermalInvoice key={orderItem.id} order={orderItem} address={null} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
