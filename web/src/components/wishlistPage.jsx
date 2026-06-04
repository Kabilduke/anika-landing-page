import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WishlistPage.css";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

// ── Wishlist section images
import bangle4 from "../assets/wishlist/bangle4.png";
import bangle5 from "../assets/wishlist/bangle5.png";
import bangle6 from "../assets/wishlist/bangle6.png";
import photo1 from "../assets/wishlist/photo1.png";
import photo2 from "../assets/wishlist/photo2.png";
import photo3 from "../assets/wishlist/photo3.png";
import photo4 from "../assets/wishlist/photo4.png";
import photo5 from "../assets/wishlist/photo5.png";
import photo6 from "../assets/wishlist/photo6.png";

// ── Sample data ──────────────────────────────────────────────────
const frequentlyBought = [
  { id: "fb1", name: "Gold Floral Bangle", price: 4299, originalPrice: 5999,  image: bangle4 },
  { id: "fb2", name: "Pearl Bangle",       price: 2899, originalPrice: 3999,  image: bangle5 },
  { id: "fb3", name: "Diamond Bangle",     price: 8499, originalPrice: 10999, image: bangle6 },
];

const allRecentlyViewed = [
  { id: "rv1", name: "Kundan Necklace",    price: 6799, originalPrice: 8999,  image: photo1 },
  { id: "rv2", name: "Ruby Stud Earrings", price: 3199, originalPrice: 4299,  image: photo2 },
  { id: "rv3", name: "Antique Bracelet",   price: 2499, originalPrice: 3499,  image: photo3 },
  { id: "rv4", name: "Gold Choker",        price: 9999, originalPrice: 12999, image: photo4 },
  { id: "rv5", name: "Silver Toe Ring",    price: 699,  originalPrice: 999,   image: photo5 },
  { id: "rv6", name: "Emerald Pendant",    price: 5499, originalPrice: 7299,  image: photo6 },
];

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedIds, setSelectedIds]     = useState([]);
  const [toast, setToast]                 = useState("");
  const [recentStart, setRecentStart]     = useState(0);
  const [wishlist, setWishlist]           = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const PAGE_SIZE = 6;
  const recentlyViewed = allRecentlyViewed.slice(recentStart, recentStart + PAGE_SIZE);
  const canPrev = recentStart > 0;
  const canNext = recentStart + PAGE_SIZE < allRecentlyViewed.length;
  const freqTotal = frequentlyBought.reduce((s, i) => s + i.price, 0);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const toggleWishlistItem = (item) => {
    setWishlist((prev) =>
      prev.find((w) => w.id === item.id)
        ? prev.filter((w) => w.id !== item.id)
        : [...prev, item]
    );
  };

  const allSelected = wishlistItems.length > 0 && selectedIds.length === wishlistItems.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(wishlistItems.map((i) => i.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setWishlistItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
    setSelectedIds([]);
    showToast("Items removed from wishlist");
  };

  const updateQty = (id, val) => {
    setWishlistItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, qty: Math.max(1, val) } : item)
    );
  };

  return (
    <div className="wishlist-page-wrapper">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <SiteHeader
        activeLink="Home"
        onLinkClick={(link) => {
          if (link === "Home") navigate("/");
        }}
      />

      {/* ── TOAST ───────────────────────────────────────────── */}
      {toast && (
        <div className="wishlist-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast}
        </div>
      )}

      <main className="wishlist-main">

        {/* Header row — back button removed */}
        <div className="wishlist-header-row">
          <h1 className="wishlist-title">Wishlist</h1>
        </div>

        {/* ── WISHLIST ITEMS ─────────────────────────────────── */}
        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p>Your wishlist is empty</p>
          </div>
        ) : (
          <>
            {/* Select bar */}
            <div className="wishlist-select-bar">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="wish-checkbox"
                />
                <span>{selectedIds.length}/{wishlistItems.length} Items Selected</span>
              </label>
              <button
                className="wish-delete-btn"
                onClick={deleteSelected}
                disabled={selectedIds.length === 0}
                aria-label="Delete selected"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>

            {/* Items list */}
            <div className="wishlist-items-list">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <input
                    type="checkbox"
                    className="wish-checkbox item-checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  <img src={item.image} alt={item.name} className="wishlist-item-img" />
                  <div className="wishlist-item-info">
                    <p className="wishlist-item-name">{item.name}</p>
                    <div className="wishlist-item-pricing">
                      <span className="wishlist-item-price">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="wishlist-item-original">₹{item.originalPrice}</span>
                      )}
                    </div>
                    <div className="wishlist-item-qty">
                      <select
                        value={item.qty || 1}
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value))}
                        className="qty-select"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <option key={n} value={n}>Qty: {n}</option>
                        ))}
                      </select>
                    </div>
                    {item.category && (
                      <p className="wishlist-item-category">{item.category}</p>
                    )}
                    {item.deliveryDate && (
                      <div className="wishlist-item-delivery">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <path d="M16 8h4l3 5v3h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        <span>Delivered by {item.deliveryDate}</span>
                      </div>
                    )}
                  </div>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => {
                      setWishlistItems((prev) => prev.filter((w) => w.id !== item.id));
                      showToast("Item removed from wishlist");
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FREQUENTLY BOUGHT TOGETHER ──────────────────────── */}
        <div className="freq-section">
          <h2 className="freq-title">Frequently bought together</h2>
          <div className="freq-content">
            <div className="freq-products">
              {frequentlyBought.map((item, idx) => (
                <div key={item.id} className="freq-item-wrapper">
                  <div className="freq-item">
                    <img src={item.image} alt={item.name} className="freq-img" />
                    <p className="freq-price">
                      <span className="freq-price-now">₹{item.price.toLocaleString()}</span>
                      <span className="freq-price-old">₹{item.originalPrice.toLocaleString()}</span>
                    </p>
                    <p className="freq-name">{item.name}</p>
                  </div>
                  {idx < frequentlyBought.length - 1 && (
                    <span className="freq-plus">+</span>
                  )}
                </div>
              ))}
            </div>
            <div className="freq-action">
              <p className="freq-total-label">
                Total Price: <strong>₹{freqTotal.toLocaleString()}.00</strong>
              </p>
              <button className="freq-add-btn" onClick={() => showToast("Items added to cart!")}>
                Add to Cart
              </button>
              <p className="freq-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                These items are dispatched from and sold by different sellers
              </p>
            </div>
          </div>
        </div>

        {/* ── RECENTLY VIEWED ─────────────────────────────────── */}
        <div className="recent-section">
          <h2 className="recent-title">Recently Viewed</h2>
          <div className="recent-grid">
            {recentlyViewed.map((item) => (
              <div key={item.id} className="recent-item">
                <div className="recent-img-wrapper">
                  <img src={item.image} alt={item.name} className="recent-img" />
                  <button
                    className={`recent-wish-btn ${wishlist.find((w) => w.id === item.id) ? "wishlisted" : ""}`}
                    onClick={() => toggleWishlistItem(item)}
                    aria-label="Wishlist"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={wishlist.find((w) => w.id === item.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <p className="recent-price">
                  <span className="recent-price-now">₹{item.price.toLocaleString()}</span>
                  <span className="recent-price-old">₹{item.originalPrice.toLocaleString()}</span>
                </p>
                <p className="recent-name">{item.name}</p>
              </div>
            ))}
          </div>
          <div className="recent-nav">
            <button
              className="recent-nav-btn"
              onClick={() => setRecentStart((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={!canPrev}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              className="recent-nav-btn"
              onClick={() => setRecentStart((p) => p + PAGE_SIZE)}
              disabled={!canNext}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <SiteFooter
        newsletterEmail={newsletterEmail}
        setNewsletterEmail={setNewsletterEmail}
        onSubscribe={() => { showToast("Subscribed!"); setNewsletterEmail(""); }}
      />

    </div>
  );
}