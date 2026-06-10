import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { authService } from "../services/authService"; 
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import { useStore } from "../hooks/useStore";
import "./AnikaOrders.css";
import Navbar from "../components/SiteHeader";
import Footer from "../components/SiteFooter";

const TABS = ["Profile", "Orders", "Addresses", "Wishlists", "Account"];
const PAGE_SIZE = 5;

export default function AnikaOrders() {
  const [activeTab, setActiveTab] = useState("Orders");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const navigate = useNavigate();

  const setSelectedProduct = useStore(state => state.setSelectedProduct);

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

  const loadOrders = async (userId) => {
    try {
      const data = await orderService.getOrders(userId);

      if (data) {
        const formatted = data.map(item => ({
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
          order_items: item.order_items || []
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  // ← fetch real user
  useEffect(() => {
    authService.getSession().then((session) => {
      if (!session) {
        navigate("/account/login");
        return;
      }
      setUser(session.user);
      loadOrders(session.user.id);
    });
  }, []);

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
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
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
      <Footer />
    </>
  );
}