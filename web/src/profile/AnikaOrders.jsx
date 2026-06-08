import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { authService } from "../services/authService"; 
import { orderService } from "../services/orderService";
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
  const navigate = useNavigate();

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
          status: item.status
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
    } else {
      navigate(`/profile/${tab.toLowerCase()}`);
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
            {visibleOrders.map((order, idx) => (
              <div key={idx} className="ao-order-row">
                <div className="ao-order-left">
                  <span className="ao-order-id">{order.id}</span>
                  <span className="ao-order-meta">
                    {order.date} &nbsp;·&nbsp; {order.item} × {order.qty}
                  </span>
                </div>
                <div className="ao-order-right">
                  <span className="ao-order-price">{order.price}</span>
                  <span className={`ao-order-status ao-status--${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
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