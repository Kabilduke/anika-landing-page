import React, { useState } from "react";
import "./Customerdetails.css";

const mockCustomer = {
  name: "Meera Nair",
  phone: "+91 98400 12345",
  email: "meera.nair@gmail.com",
  accountCreated: "3 Nov 2024",
  lastLogin: "12 May 2026",
  status: "Blocked",
  profileInfo: {
    totalOrders: 8,
    totalSpent: "₹26,400",
    lastOrder: "12 May 2026",
    returns: 0,
    avgOrderValue: "₹3,050",
  },
  addresses: {
    home: {
      label: "Home (Default)",
      name: "Priya Sharma",
      line1: "42, Anna Nagar East",
      line2: "Chennai — 600102",
      state: "Tamil Nadu, India",
      phone: "+91 98400 11111",
    },
    office: {
      label: "Office",
      name: "Priya Sharma",
      line1: "B42 Abinav, Datrons 4",
      line2: "Perungalathur, Chennai — 600088",
      state: "Tamil Nadu, India",
      phone: "+91 98400 11111",
    },
  },
  orderHistory: [
    { id: "AK-JH-1542", product: "Kundan Finger Ring — Gold", qty: 1, date: "12 May 2026", amount: "₹3,200", status: "Pending" },
    { id: "AK-JH-1542", product: "Kundan Finger Ring — Gold", qty: 1, date: "12 May 2026", amount: "₹3,200", status: "Delivered" },
    { id: "AK-JH-1542", product: "Kundan Finger Ring — Gold", qty: 1, date: "12 May 2025", amount: "₹3,200", status: "Pending" },
    { id: "AK-JH-1542", product: "Kundan Finger Ring — Gold", qty: 1, date: "12 May 2026", amount: "₹3,200", status: "Pending" },
    { id: "AK-JH-1542", product: "Kundan Finger Ring — Gold", qty: 1, date: "12 May 2026", amount: "₹3,200", status: "Pending" },
  ],
  wishlist: [
    { name: "Kundan Finger Ring — Gold", price: "₹3,200" },
    { name: "Kundan Finger Ring — Gold", price: "₹3,200" },
    { name: "Kundan Finger Ring — Gold", price: "₹3,200" },
    { name: "Kundan Finger Ring — Gold", price: "₹3,200" },
    { name: "Kundan Finger Ring — Gold", price: "₹3,200" },
  ],
  recentActivity: [
    { color: "#ef4444", text: "Placed order #AK-JH-1042 — Gold Jhumka Earrings" },
    { color: "#10b981", text: "Added Diamond Nose Pin to wishlist" },
    { color: "#ef4444", text: "Placed order #AK-JH-1042 — Gold Jhumka Earrings" },
    { color: "#f59e0b", text: "Updated shipping address — added Office address" },
    { color: "#ef4444", text: "Placed order #AK-JH-1042 — Gold Jhumka Earrings" },
  ],
};

const RingProductImage = () => (
  <div className="cd__product-img">
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="6" fill="#fff3e0" />
      <ellipse cx="18" cy="20" rx="8" ry="4" stroke="#b45309" strokeWidth="1.5" fill="none" />
      <ellipse cx="18" cy="16" rx="5" ry="3" fill="#fbbf24" opacity="0.7" />
      <circle cx="18" cy="13" r="4" fill="#fbbf24" />
      <circle cx="18" cy="13" r="2" fill="#f59e0b" />
      <circle cx="16.5" cy="12" r="0.7" fill="#fff" opacity="0.8" />
    </svg>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Pending:   { bg: "#fff7ed", color: "#ea580c" },
    Delivered: { bg: "#f0fdf4", color: "#16a34a" },
    Cancelled: { bg: "#fef2f2", color: "#dc2626" },
    Blocked:   { bg: "#fef2f2", color: "#dc2626" },
  };
  const s = map[status] || { bg: "#f5f5f5", color: "#666" };
  return (
    <span className="cd__status-badge" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

const CustomerDetails = ({ customer, onBack }) => {
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm]   = useState(false);

  const c = { ...mockCustomer, ...(customer || {}) };

  return (
    <div className="cd">

      {/* ── Header ── */}
      <div className="cd__header">
        <button className="cd__back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Customer Details
        </button>
        <div className="cd__header-meta">
          <span className="cd__header-date">Placed on 11 May 2026 at 3:42 PM</span>
          <StatusBadge status="Blocked" />
        </div>
      </div>

      {/* ── Profile Info ── */}
      <div className="cd__section cd__profile-grid">
        <div className="cd__card">
          <div className="cd__card-title">Profile Info</div>
          <div className="cd__info-rows">
            <div className="cd__info-row"><span className="cd__info-label">Full name</span><span className="cd__info-value">{c.name}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Phone</span><span className="cd__info-value">{c.phone}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Email</span><span className="cd__info-value cd__info-value--email">{c.email}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Account created</span><span className="cd__info-value">{mockCustomer.accountCreated}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Last login</span><span className="cd__info-value">{mockCustomer.lastLogin}</span></div>
          </div>
        </div>
        <div className="cd__card">
          <div className="cd__card-title">Order Summary</div>
          <div className="cd__info-rows">
            <div className="cd__info-row"><span className="cd__info-label">Total orders</span><span className="cd__info-value">{c.orders ? `${c.orders} orders` : mockCustomer.profileInfo.totalOrders + " orders"}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Total spent</span><span className="cd__info-value">{c.totalSpent ? `₹${Number(c.totalSpent).toLocaleString("en-IN")}` : mockCustomer.profileInfo.totalSpent}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Last order</span><span className="cd__info-value">{c.joined || mockCustomer.profileInfo.lastOrder}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Returns</span><span className="cd__info-value">{mockCustomer.profileInfo.returns}</span></div>
            <div className="cd__info-row"><span className="cd__info-label">Avg. order value</span><span className="cd__info-value">{mockCustomer.profileInfo.avgOrderValue}</span></div>
          </div>
        </div>
      </div>

      {/* ── Saved Addresses ── */}
      <div className="cd__section">
        <div className="cd__section-title">Saved Addresses</div>
        <div className="cd__address-grid">
          {Object.values(mockCustomer.addresses).map((addr, i) => (
            <div key={i} className="cd__card">
              <div className="cd__address-label">{addr.label}</div>
              <div className="cd__address-name">{addr.name}</div>
              <div className="cd__address-lines">
                <span>{addr.line1}</span>
                <span>{addr.line2}</span>
                <span>{addr.state}</span>
                <span>{addr.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Order History ── */}
      <div className="cd__section">
        <div className="cd__section-title">Order History</div>
        <div className="cd__card cd__card--no-pad">
          {mockCustomer.orderHistory.map((order, i) => (
            <div key={i} className="cd__order-row">
              <RingProductImage />
              <div className="cd__order-info">
                <div className="cd__order-name">{order.product}</div>
                <div className="cd__order-meta">
                  <span>Order ID: {order.id}</span>
                  <span className="cd__order-meta-sep">·</span>
                  <span>Qty: {order.qty}</span>
                </div>
                <div className="cd__order-date">{order.date}</div>
              </div>
              <div className="cd__order-right">
                <div className="cd__order-amount">{order.amount}</div>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Wishlist ── */}
      <div className="cd__section">
        <div className="cd__section-title-row">
          <div className="cd__section-title">Wishlist</div>
          <div className="cd__wishlist-count">{mockCustomer.wishlist.length} Items Wishlisted</div>
        </div>
        <div className="cd__wishlist-grid">
          {mockCustomer.wishlist.map((item, i) => (
            <div key={i} className="cd__wishlist-card">
              <RingProductImage />
              <div className="cd__wishlist-name">{item.name}</div>
              <div className="cd__wishlist-price">{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="cd__section">
        <div className="cd__section-title">Recent activity</div>
        <div className="cd__card">
          {mockCustomer.recentActivity.map((act, i) => (
            <div key={i} className="cd__activity-row">
              <span className="cd__activity-dot" style={{ background: act.color }} />
              <span className="cd__activity-text">{act.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Account Controls ── */}
      <div className="cd__section">
        <div className="cd__section-title">Account controls</div>
        <div className="cd__card cd__controls-card">
          <div className="cd__controls-warning">
            <span className="cd__warning-dot" />
            <div>
              <div className="cd__warning-title">Disabling this account will prevent the customer from logging in or placing new orders.</div>
              <div className="cd__warning-sub">Their catalog and history data will be preserved. You can re-enable at any time.</div>
            </div>
          </div>
          <div className="cd__controls-btns">
            <button className="cd__btn cd__btn--disable" onClick={() => setShowDisableConfirm(true)}>
              Disable Account
            </button>
            <button className="cd__btn cd__btn--delete" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>

      {/* ── Disable Confirm Modal ── */}
      {showDisableConfirm && (
        <div className="cd__modal-overlay" onClick={() => setShowDisableConfirm(false)}>
          <div className="cd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd__modal-title">Disable Account?</div>
            <div className="cd__modal-body">This will prevent the customer from logging in or placing orders. You can re-enable at any time.</div>
            <div className="cd__modal-btns">
              <button className="cd__btn cd__btn--cancel" onClick={() => setShowDisableConfirm(false)}>Cancel</button>
              <button className="cd__btn cd__btn--disable" onClick={() => setShowDisableConfirm(false)}>Disable</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="cd__modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="cd__modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd__modal-title">Delete Account Permanently?</div>
            <div className="cd__modal-body">This action cannot be undone. All customer data will be permanently removed.</div>
            <div className="cd__modal-btns">
              <button className="cd__btn cd__btn--cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="cd__btn cd__btn--delete" onClick={() => setShowDeleteConfirm(false)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;