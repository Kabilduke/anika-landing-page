import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { supabase } from "../lib/supabase"; 
import "./AnikaOrders.css";
import Navbar from "../components/SiteHeader";
import Footer from "../components/SiteFooter";

const ALL_ORDERS = [
  { id: "#AJW-1042", date: "12 May 2026", item: "Gold Jhumka Earrings", qty: 1, price: "₹3,200", status: "Pending" },
  { id: "#AJW-1043", date: "18 May 2026", item: "Diamond Bangle Set", qty: 1, price: "₹8,500", status: "Delivered" },
  { id: "#AJW-1044", date: "22 May 2026", item: "Silver Anklet Pair", qty: 2, price: "₹1,800", status: "Shipped" },
  { id: "#AJW-1045", date: "25 May 2026", item: "Kundan Necklace", qty: 1, price: "₹12,000", status: "Pending" },
];

const TABS = ["Profile", "Orders", "Addresses", "Wishlists", "Account"];
const PAGE_SIZE = 5;

export default function AnikaOrders() {
  const [activeTab, setActiveTab] = useState("Orders");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ← fetch real user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/account/login");
        return;
      }
      setUser(session.user);
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

  const visibleOrders = ALL_ORDERS.slice(0, visibleCount);
  const hasMore = visibleCount < ALL_ORDERS.length;

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
            <span className="ao-vip-badge">{ALL_ORDERS.length} orders</span>
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
            <span className="ao-order-count">{ALL_ORDERS.length} Orders</span>
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