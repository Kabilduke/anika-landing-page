import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import { useStore } from "../../hooks/useStore";
import Toast from "../../components/Toast";
import "./Orderdetails.css";

const STATUS_CONFIG = {
  Delivered: { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
  Shipped:   { bg: "#fef9c3", color: "#a16207", dot: "#eab308" },
  Pending:   { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
  Returned:  { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
  Confirmed: { bg: "#f3e8ff", color: "#7c3aed", dot: "#8b5cf6" }
};

const COMPLETED_MAP = {
  Cancelled: 1,
  Returned:  1,
  Pending:   2,
  Confirmed: 3,
  Shipped:   4,
  Delivered: 5
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className="od__status-badge" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="od__status-dot" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
};

const OrderDetails = ({ order, onStatusChange, onBack }) => {
  const [adminNote, setAdminNote] = useState(order?.admin_notes || "");
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [updating, setUpdating] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [productsMap, setProductsMap] = useState({});

  const setSelectedProduct = useStore(state => state.setSelectedProduct);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts();
        const map = {};
        if (data) {
          data.forEach(p => {
            map[p.name] = p;
          });
        }
        setProductsMap(map);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleItemClick = (item) => {
    const product = productsMap[item.product_name];
    if (product) {
      const formattedProduct = {
        ...product,
        id: product.product_id || product.id,
        productId: product.product_id || product.id,
        img: product.image_url || (product.images && product.images[0]) || '/src/assets/cart/bangle1.webp',
        name: product.name,
        desc: product.description,
        price: product.price,
        originalPrice: product.compare_price || Math.round(product.price * 1.3),
        sizes: product.sizes || [],
        stock: product.stock > 0 ? 'in-stock' : 'out-of-stock',
        category: product.categories?.name || product.category || 'Bangles'
      };
      setSelectedProduct(formattedProduct);
      navigate("/product");
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message: "", type: "" });
    setTimeout(() => setToast({ message, type }), 10);
  };

  const o = order || {
    id: "ORD-UNKNOWN",
    customer: { name: "Unknown Customer", email: "N/A", phone: "N/A" },
    order_date: new Date().toISOString(),
    item_name: "N/A",
    quantity: 1,
    total_price: 0,
    status: "Pending",
    payment: "COD"
  };

  useEffect(() => {
    if (o.status) {
      setSelectedStatus(o.status);
    }
  }, [o.status]);

  useEffect(() => {
    setAdminNote(order?.admin_notes || "");
  }, [order?.admin_notes]);

  useEffect(() => {
    if (o.user_id) {
      const fetchAddress = async () => {
        try {
          setAddressLoading(true);
          const data = await orderService.getAddresses(o.user_id);
          const defaultAddr = data.find(a => a.is_default) || data[0];
          setAddress(defaultAddr || null);
        } catch (err) {
          console.error("Error fetching shipping address:", err);
        } finally {
          setAddressLoading(false);
        }
      };
      fetchAddress();
    }
  }, [o.user_id]);

  const handleUpdateStatus = async () => {
    if (!order?.id || !onStatusChange) return;
    try {
      setUpdating(true);
      await onStatusChange(order.id, selectedStatus);
      showToast("Order status updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update status: " + err.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!order?.id) return;
    try {
      setSavingNote(true);
      await orderService.updateOrderNote(order.id, adminNote);
      showToast("Note saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save note: " + err.message, "error");
    } finally {
      setSavingNote(false);
    }
  };

  const orderItems = (o.order_items && o.order_items.length > 0) ? o.order_items : [{
    product_name: o.item_name,
    quantity: o.quantity || 1,
    price: o.total_price || 0,
    size: null,
    color: null,
    image_url: null
  }];

  const uniqueProducts = orderItems.length;
  const totalCount = orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const completedSteps = COMPLETED_MAP[o.status] ?? 2;

  const TIMELINE_STEPS = [
    { label: "Order placed", date: o.order_date ? new Date(o.order_date).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A" },
    { label: "Payment confirmed", date: o.payment === "Paid" ? "Confirmed" : "COD (Upon delivery)" },
    { label: "Order confirmed", date: completedSteps >= 3 ? "Confirmed" : "Pending" },
    { label: "Shipped", date: completedSteps >= 4 ? "Shipped" : "Pending" },
    { label: "Delivered", date: completedSteps >= 5 ? "Delivered" : "Pending" },
  ];

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
        <p className="od__date-placed">Placed on {o.order_date ? new Date(o.order_date).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}</p>
      </div>

      {/* Top two-column: Customer + Shipping */}
      <div className="od__top-grid">
        {/* Customer Details */}
        <div className="od__card">
          <div className="od__card-title">Customer details</div>
          <div className="od__info-grid">
            <span className="od__info-label">Name</span>
            <span className="od__info-value">{o.customer?.name || "Unknown"}</span>
            <span className="od__info-label">Phone</span>
            <span className="od__info-value">{o.customer?.phone || "N/A"}</span>
            <span className="od__info-label">Email</span>
            <span className="od__info-value od__info-value--wrap">{o.customer?.email || "N/A"}</span>
            <span className="od__info-label">Joined</span>
            <span className="od__info-value">
              {o.customer?.created_at ? new Date(o.customer.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
            </span>
            <span className="od__info-label">Total products</span>
            <span className="od__info-value">{uniqueProducts} ({totalCount} {totalCount === 1 ? "item" : "items"})</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="od__card">
          <div className="od__card-title">Shipping Address</div>
          {addressLoading ? (
            <div className="skeleton-shimmer" style={{ width: '100%', height: '80px', borderRadius: '6px' }} />
          ) : address ? (
            <>
              <div className="od__address-name" style={{ fontWeight: '600', marginBottom: '8px' }}>{address.full_name}</div>
              <div className="od__address-lines" style={{ color: '#555', fontSize: '13.5px', lineHeight: '1.5' }}>
                <div>{address.address_line1}</div>
                {address.address_line2 && <div>{address.address_line2}</div>}
                <div>{address.city}, {address.state} — {address.postal_code}</div>
                <div>{address.country}</div>
                <div style={{ marginTop: '8px', fontWeight: '500' }}>Phone: {address.phone_number}</div>
              </div>
            </>
          ) : (
            <div style={{ color: '#888', fontSize: '13.5px', fontStyle: 'italic' }}>No shipping address provided or found.</div>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="od__card od__card--section">
        <div className="od__card-title">Order Details</div>
        <div className="od__items-list">
          {orderItems.map((item, idx) => {
            const product = productsMap[item.product_name];
            const image = item.image_url || product?.image_url || (product?.images && product.images[0]) || '/src/assets/cart/bangle1.webp';
            const isClickable = !!product;

            return (
              <div 
                key={idx} 
                className={`od__item-row ${isClickable ? 'od__item-row--clickable' : ''}`}
                onClick={() => isClickable && handleItemClick(item)}
              >
                <div className="od__item-img">
                  {image ? (
                    <img 
                      src={image} 
                      alt={item.product_name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  ) : (
                    "✨"
                  )}
                </div>
                <div className="od__item-info">
                  <div className="od__item-name" style={{ fontWeight: '500' }}>
                    {item.product_name}
                    {isClickable && (
                      <span className="od__view-link" style={{ fontSize: '11px', color: '#8b0030', marginLeft: '8px', fontWeight: 'normal' }}>
                        (View Product)
                      </span>
                    )}
                  </div>
                  <div className="od__item-sku" style={{ color: '#888', fontSize: '12.5px', marginTop: '4px' }}>
                    Order Ref: #{o.id?.slice(-8) || o.id} &nbsp;·&nbsp; Qty: {item.quantity || 1}
                    {(item.size || item.color) && ` · Size: ${item.size || 'N/A'} · Color: ${item.color || 'N/A'}`}
                  </div>
                </div>
                <div className="od__item-price" style={{ fontWeight: '600' }}>
                  ₹{Number(item.price || 0).toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment + Update Status */}
      <div className="od__mid-grid">
        {/* Payment Details */}
        <div className="od__card">
          <div className="od__card-title">Payment Details</div>
          <div className="od__info-grid">
            <span className="od__info-label">Method</span>
            <span className="od__info-value">{o.payment}</span>
            <span className="od__info-label">Total Amount</span>
            <span className="od__info-value" style={{ fontWeight: '600' }}>₹{Number(o.total_price || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Update Order Status */}
        <div className="od__card">
          <div className="od__card-title">Update Order Status</div>
          <div className="od__status-update-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span className="od__status-label" style={{ color: '#888', fontSize: '13px' }}>Current</span>
            <StatusBadge status={o.status} />
          </div>
          <div className="od__option-label" style={{ color: '#888', fontSize: '13px', marginBottom: '6px' }}>Change Status to</div>
          <div className="od__status-select-row" style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              style={{
                flex: 1, 
                height: '34px', 
                borderRadius: '8px', 
                border: '1px solid #e5e5e5', 
                padding: '0 10px',
                outline: 'none',
                background: '#fff'
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>
            <button 
              onClick={handleUpdateStatus} 
              disabled={updating}
              style={{
                backgroundColor: '#1c1c1e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 16px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '13px'
              }}
            >
              {updating ? 'Updating...' : 'Update'}
            </button>
          </div>
          <div className="od__option-hint" style={{ color: '#aaa', fontSize: '11px', marginTop: '10px' }}>Customer will see the status change immediately.</div>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            onClick={handleSaveNote}
            disabled={savingNote}
            style={{
              backgroundColor: '#1c1c1e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              cursor: savingNote ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '13px',
              opacity: savingNote ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {savingNote ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="od__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button className="od__cancel-btn" onClick={onBack} style={{ background: '#f5f5f7', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Close</button>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
};

export default OrderDetails;