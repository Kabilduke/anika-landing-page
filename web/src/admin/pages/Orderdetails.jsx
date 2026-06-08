import React, { useState } from "react";
import "./Orderdetails.css";

const STATUS_CONFIG = {
  Delivered: { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
  Shipped:   { bg: "#fef9c3", color: "#a16207", dot: "#eab308" },
  Pending:   { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
};

const TIMELINE_STEPS = [
  { label: "Order placed",      date: "11 May 2026 - 2:42 PM" },
  { label: "Payment confirmed", date: "11 May 2026 - 3:48 PM - Razorpay" },
  { label: "Order confirmed",   date: "11 May 2026 - 5:10 PM" },
  { label: "Shipped",           date: "12 May 2026 - 10:20 AM - AwayDay delivery" },
  { label: "Delivered",         date: "Pending" },
];

const COMPLETED_MAP = {
  Delivered: 5,
  Shipped:   4,
  Pending:   2,
  Cancelled: 1,
};

const MOCK_ITEMS = [
  { name: "Kundan Finger Ring — Gold", sku: "SKU: AJW-RNG-001", qty: 1, price: "₹3,200", img: "💍" },
  { name: "Kundan Finger Ring — Gold", sku: "SKU: AJW-RNG-001", qty: 1, price: "₹3,200", img: "💍" },
  { name: "Kundan Finger Ring — Gold", sku: "SKU: AJW-RNG-001", qty: 1, price: "₹3,200", img: "💍" },
  { name: "Kundan Finger Ring — Gold", sku: "SKU: AJW-RNG-001", qty: 1, price: "₹3,200", img: "💍" },
  { name: "Kundan Finger Ring — Gold", sku: "SKU: AJW-RNG-001", qty: 1, price: "₹3,200", img: "💍" },
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className="od__status-badge" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="od__status-dot" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
};

const OrderDetails = ({ order, onBack }) => {
  const [adminNote, setAdminNote] = useState("");
  const [productOption, setProductOption] = useState("");

  const o = order || {
    id: "#ORD-1001",
    customer: "Meera Nair",
    date: "11 May 2026 at 2:42 PM",
    items: 5,
    amount: "₹16,000",
    status: "Shipped",
    avatar: "MN",
    color: "#f59e0b",
    phone: "+91 986900 12345",
    email: "meera.nair@gmail.com",
    customerSince: "Jan 2025",
    totalOrders: "6 orders",
  };

  const completedSteps = COMPLETED_MAP[o.status] ?? 2;

  return (
    <div className="od">
      {/* Header */}
      <div className="od__header">
        <button className="od__back-btn" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Order Details
        </button>
        <div className="od__header-row">
          <h1 className="od__title">Order Details</h1>
          <StatusBadge status={o.status} />
        </div>
        <p className="od__date-placed">Placed on {o.date}</p>
      </div>

      {/* Top two-column: Customer + Shipping */}
      <div className="od__top-grid">
        {/* Customer Details */}
        <div className="od__card">
          <div className="od__card-title">Customer details</div>
          <div className="od__info-grid">
            <span className="od__info-label">Name</span>
            <span className="od__info-value">{o.customer}</span>
            <span className="od__info-label">Phone</span>
            <span className="od__info-value">{o.phone || "+91 986900 12345"}</span>
            <span className="od__info-label">Email</span>
            <span className="od__info-value od__info-value--wrap">{o.email || "meera.nair@gmail.com"}</span>
            <span className="od__info-label">Customer Since</span>
            <span className="od__info-value">{o.customerSince || "Jan 2025"}</span>
            <span className="od__info-label">Total orders</span>
            <span className="od__info-value">{o.totalOrders || "6 orders"}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="od__card">
          <div className="od__card-title">Shipping Address</div>
          <div className="od__address-name">{o.customer}</div>
          <div className="od__address-lines">
            <div>142/2, Indiranagar 2nd Stage Near</div>
            <div>Bangalore Club, Bangalore — 560038,</div>
            <div>Karnataka, India</div>
            <div>+91 98400 12345</div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="od__card od__card--section">
        <div className="od__card-title">Order Details</div>
        <div className="od__items-list">
          {MOCK_ITEMS.slice(0, o.items).map((item, i) => (
            <div key={i} className="od__item-row">
              <div className="od__item-img">{item.img}</div>
              <div className="od__item-info">
                <div className="od__item-name">{item.name}</div>
                <div className="od__item-sku">{item.sku} &nbsp;·&nbsp; Qty: {item.qty}</div>
              </div>
              <div className="od__item-price">{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment + Update Status */}
      <div className="od__mid-grid">
        {/* Payment Details */}
        <div className="od__card">
          <div className="od__card-title">Payment Details</div>
          <div className="od__info-grid">
            <span className="od__info-label">Name</span>
            <span className="od__info-value">{o.customer}</span>
            <span className="od__info-label">Phone</span>
            <span className="od__info-value">{o.phone || "+91 986900 12345"}</span>
            <span className="od__info-label">Email</span>
            <span className="od__info-value od__info-value--wrap">{o.email || "meera.nair@gmail.com"}</span>
            <span className="od__info-label">Customer Since</span>
            <span className="od__info-value">{o.customerSince || "Jan 2025"}</span>
            <span className="od__info-label">Total orders</span>
            <span className="od__info-value">{o.totalOrders || "6 orders"}</span>
          </div>
        </div>

        {/* Update Order Status */}
        <div className="od__card">
          <div className="od__card-title">Update Order Status</div>
          <div className="od__status-update-row">
            <span className="od__status-label">Current</span>
            <StatusBadge status={o.status} />
          </div>
          <div className="od__option-label">Product Name</div>
          <div className="od__option-input-row">
            <input
              className="od__option-input"
              placeholder="Add an option e.g. Gold"
              value={productOption}
              onChange={e => setProductOption(e.target.value)}
            />
            <button className="od__add-option-btn">Add option</button>
          </div>
          <div className="od__option-hint">Customer will be notified on status change.</div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="od__card od__card--section">
        <div className="od__card-title">Order Timeline</div>
        <div className="od__timeline">
          {TIMELINE_STEPS.map((step, i) => {
            const done = i < completedSteps;
            const lineActive = i < completedSteps - 1;
            return (
              <div key={i} className="od__tl-step">
                <div className="od__tl-top">
                  <div className={`od__tl-circle ${done ? "od__tl-circle--done" : ""}`}>
                    <span className="od__tl-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`od__tl-line ${lineActive ? "od__tl-line--done" : ""}`} />
                  )}
                </div>
                <div className="od__tl-label">{step.label}</div>
                <div className="od__tl-date">{step.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Notes */}
      <div className="od__card od__card--section">
        <div className="od__card-title">Admin Notes</div>
        <textarea
          className="od__admin-notes"
          placeholder="Add a private note about this order (not visible to customer)..."
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          rows={5}
        />
      </div>

      {/* Footer Actions */}
      <div className="od__footer">
        <button className="od__cancel-btn">Cancel Order</button>
        <button className="od__read-btn">Mark As Read</button>
      </div>
    </div>
  );
};

export default OrderDetails;