import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import { useStore } from "../hooks/useStore";
import { getUserInitials } from "../utils/avatarUtils";
import "./AnikaOrders.css";
import Navbar from "../components/SiteHeader";
import Footer from "../components/SiteFooter";
import ThermalInvoice from "../admin/components/ThermalInvoice";

const TABS = ["Profile", "Orders", "Addresses", "Wishlists", "Account"];
const PAGE_SIZE = 5;

export default function AnikaOrders() {
  const [activeTab, setActiveTab] = useState("Orders");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [productsMap, setProductsMap] = useState({});
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [invoiceAddress, setInvoiceAddress] = useState(null);
  const [printingInvoice, setPrintingInvoice] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = useStore((s) => s.user);
  const sessionLoading = useStore((s) => s.sessionLoading);
  const rawOrders = useStore((s) => s.orders);
  const fetchOrders = useStore((s) => s.fetchOrders);
  const setSelectedProduct = useStore((s) => s.setSelectedProduct);


  useEffect(() => {
    if (!rawOrders || rawOrders.length === 0) return;
    const productIds = new Set();
    rawOrders.forEach(o => (o.order_items || []) .forEach(i => {
      if (i.product_id) productIds.add(i.product_id);
    }));
    if (productIds.size === 0) return;

    productService.getProductsByIds([...productIds]).then((data) => {
      const map = {};
      (data || []).forEach((p) => { map[p.name] = p; });
      setProductsMap(map);  
    }).catch((err) => console.error("Error fetching Product:", err));
  }, [rawOrders]);

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

  const handleViewInvoice = async (orderSummary) => {
    const fullOrder = rawOrders.find((o) => o.id === orderSummary.id) || orderSummary;
    setSelectedInvoiceOrder(fullOrder);
    setInvoiceAddress(null);
    if (user?.id) {
      try {
        const addresses = await orderService.getAddresses(user.id);
        const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
        setInvoiceAddress(defaultAddr || null);
      } catch (err) {
        console.debug("Could not fetch address for invoice:", err);
      }
    }
  };

  const handlePrintUserInvoice = () => {
    setPrintingInvoice(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintingInvoice(false), 1000);
    }, 250);
  };

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      navigate("/account/login");
      return
    }
    fetchOrders(user.id); 
  }, [user, sessionLoading]);


  const orders = useMemo(() => {
    return rawOrders.map((item) => ({
      id: item.id,
      date: new Date(item.order_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      item: item.item_name,
      qty: item.quantity,
      price: "₹" + parseFloat(item.total_price).toLocaleString("en-IN"),
      status: item.status,
      order_items: item.order_items || [],
      deliveryProvider: item.delivery_provider,
      waybill: item.waybill,
      shipmentId: item.shipment_id,
      deliveryStatus: item.delivery_status,
      estimatedDeliveryDate: item.estimated_delivery_date
        ? new Date(item.estimated_delivery_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        : null
    }));
  }, [rawOrders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }
    try {
      setCancellingOrderId(orderId);
      await orderService.cancelOrder(orderId);
      if (user) {
        await fetchOrders(user.id, {force: true});
      }
    } catch (err) {
      alert("Failed to cancel order: " + err.message);
    } finally {
      setCancellingOrderId(null);
    }
  };


  // ← handle tab navigation
  const handleTabClick = (tab) => {
    if (tab === "Profile") {
      navigate("/profile");
    } else if (tab === "Orders") {
      setActiveTab("Orders");
    } else if (tab === "Addresses") {
      navigate("/profile/addresses");
    } else if (tab === "Wishlists") {
      navigate("/profile/wishlists");
    } else if (tab === "Account") {
      navigate("/profile/account");
    }
  };

  const handleNavClick = (link) => {
    if (link === "Home") navigate("/");
    else navigate(`/${link.toLowerCase()}`);
  };

  const visibleOrders = orders.slice(0, visibleCount);
  const hasMore = visibleCount < orders.length;

  return (
    <>
      <Navbar onLinkClick={handleNavClick} />
      <div className="ao-root">
        <div className="ao-page-top">
          <h1 className="ao-profile-title">Profile</h1>
        </div>

        {/* ── USER INFO — real data ── */}
        <div className="ao-user-section">
          <div className="ao-avatar">
            {getUserInitials(user?.user_metadata?.name || user?.email)}
          </div>
          <div className="ao-user-text">
            <span className="ao-user-name">{user?.user_metadata?.name || "User"}</span>
            <span className="ao-user-meta">
              {user?.email} &nbsp;·&nbsp; Member since{" "}
              {user ? new Date(user.created_at).toLocaleDateString("en-IN", {
                month: "short", year: "numeric"
              }) : ""}
            </span>
            <span className="ao-vip-badge">{orders.length} orders</span>
          </div>
        </div>

        <hr className="ao-divider" />

        {/* ── TABS ── */}
        <div className="ao-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`ao-tab${activeTab === tab ? " ao-tab--active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── ORDER HISTORY CARD ── */}
        <div className="ao-card">
          <div className="ao-card-header">
            <span className="ao-card-title">Order History</span>
            <span className="ao-order-count">{orders.length} Orders</span>
          </div>

          <div className="ao-order-list">
            {visibleOrders.map((order, idx) => {
              const orderItems = order.order_items && order.order_items.length > 0
                ? order.order_items
                : [{
                    product_name: order.item,
                    quantity: order.qty || 1,
                    price: order.price,
                    size: null,
                    color: null,
                    image_url: null
                  }];

              return (
                <div 
                  key={idx} 
                  className="ao-order-block" 
                  style={{ 
                    borderBottom: idx < visibleOrders.length - 1 ? '1px solid #ebebeb' : 'none', 
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Order header details */}
                  <div className="ao-order-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span className="ao-order-id" style={{ fontWeight: '600', color: '#111', fontSize: '13px' }}>Order: #{order.id?.slice(-8) || order.id}</span>
                      <span style={{ color: '#aaa', margin: '0 8px' }}>·</span>
                      <span className="ao-order-meta" style={{ fontSize: '12.5px', color: '#666' }}>{order.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="ao-order-price" style={{ fontWeight: '600', color: '#111', fontSize: '13px' }}>{order.price}</span>
                      <span className={`ao-order-status ao-status--${order.status.toLowerCase()}`} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: '500' }}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => handleViewInvoice(order)}
                        title="View and print invoice"
                        style={{
                          background: '#fff',
                          border: '1px solid #d4d4d8',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11.5px',
                          fontWeight: '500',
                          color: '#333',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>🧾</span> Invoice
                      </button>
                    </div>
                  </div>

                  {/* List of order items */}
                  <div className="ao-order-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {orderItems.map((item, itemIdx) => {
                      const product = productsMap[item.product_name];
                      const image = item.image_url || product?.image_url || (product?.images && product.images[0]) || '/src/assets/cart/bangle1.webp';
                      const isClickable = !!product;

                      return (
                        <div 
                          key={itemIdx} 
                          className="ao-order-item-row"
                          onClick={() => isClickable && handleItemClick(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                            borderRadius: '8px',
                            background: '#fafafa',
                            border: '1px solid #f0f0f0',
                            cursor: isClickable ? 'pointer' : 'default',
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <div className="ao-item-img" style={{ width: '40px', height: '40px', overflow: 'hidden', borderRadius: '6px', background: '#fff', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {image ? (
                              <img src={image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              "✨"
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: '500', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</span>
                              {isClickable && (
                                <span style={{ fontSize: '10px', color: '#8b0030', marginLeft: '6px', fontWeight: 'normal' }}>(View Product)</span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                              Qty: {item.quantity}
                              {(item.size || item.color) && ` · Size: ${item.size || 'N/A'} · Color: ${item.color || 'N/A'}`}
                            </div>
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#111', textAlign: 'right' }}>
                            {typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : item.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Shipping / Delivery Details */}
                  {order.waybill && (
                    <div 
                      className="ao-delivery-details" 
                      style={{ 
                        fontSize: '11.5px', 
                        background: '#fcfcfc', 
                        padding: '10px 14px', 
                        borderRadius: '6px', 
                        border: '1px dashed #e0e0e0', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <span style={{ color: '#777' }}>Delivery by:</span>{' '}
                        <strong style={{ color: '#111' }}>{order.deliveryProvider || 'Ekart'}</strong>
                        <span style={{ color: '#aaa', margin: '0 6px' }}>·</span>
                        <span style={{ color: '#777' }}>Waybill:</span>{' '}
                        <a 
                          href={`https://ekartlogistics.com/ekartlogistics-web/shipmenttrack/${order.waybill}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#8b0030', textDecoration: 'underline', fontWeight: '500' }}
                        >
                          {order.waybill}
                        </a>
                      </div>
                      <div>
                        {order.estimatedDeliveryDate && (
                          <>
                            <span style={{ color: '#777' }}>Est. Delivery:</span>{' '}
                            <strong style={{ color: '#111' }}>{order.estimatedDeliveryDate}</strong>
                            <span style={{ color: '#aaa', margin: '0 6px' }}>·</span>
                          </>
                        )}
                        <span style={{ color: '#777' }}>Delivery Status:</span>{' '}
                        <span style={{ fontWeight: '600', color: order.deliveryStatus === 'Booked' ? '#27ae60' : '#d35400' }}>
                          {order.deliveryStatus || 'Pending'}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Cancel Order Button */}
                  {(order.status === "Pending" || order.status === "Confirmed") && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        className="ao-cancel-order-btn"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                      >
                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="ao-show-more-wrap">
              <button
                className="ao-show-more-btn"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Show More
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal for Customer */}
      {selectedInvoiceOrder && (
        <div className="inv__modal-overlay" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="inv__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="inv__modal-header">
              <div>
                <h3 className="inv__modal-title">Order Receipt</h3>
                <p className="inv__modal-subtitle">
                  Order #{String(selectedInvoiceOrder.id).slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                className="inv__modal-close"
                onClick={() => setSelectedInvoiceOrder(null)}
                aria-label="Close invoice"
              >
                ✕
              </button>
            </div>

            <div className="inv__modal-body">
              <ThermalInvoice
                order={selectedInvoiceOrder}
                address={invoiceAddress}
                isPreview={true}
              />
            </div>

            <div className="inv__modal-footer">
              <button
                className="inv__modal-close-btn"
                onClick={() => setSelectedInvoiceOrder(null)}
              >
                Close
              </button>
              <button
                className="inv__modal-print-btn"
                onClick={handlePrintUserInvoice}
                disabled={printingInvoice}
              >
                {printingInvoice ? (
                  <>
                    <span className="inv__spin">⏳</span> Printing...
                  </>
                ) : (
                  <>
                    <span>🖨️</span> Print / Save Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print container for customer */}
      {selectedInvoiceOrder && (
        <div className="thermal-print-area">
          <ThermalInvoice order={selectedInvoiceOrder} address={invoiceAddress} />
        </div>
      )}

      <Footer />
    </>
  );
}