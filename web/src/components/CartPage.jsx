import { useState } from "react";
import "./CartPage.css";
import Navbar from "./SiteHeader"
import Footer from "./SiteFooter"
import { useNavigate } from "react-router-dom";
import WishlistPage from "./wishlistPage";
import { useStore } from "../hooks/useStore";

export default function CartPage() {
  const cartItems = useStore((state) => state.cartItems);
  const wishlistItems = useStore((state) => state.wishlistItems);
  const updateCartQty = useStore((state) => state.updateCartQty);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const removeSelectedFromCart = useStore((state) => state.removeSelectedFromCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);

  const [selectedIds, setSelectedIds] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showWishlist, setShowWishlist] = useState(false);

  const navigate = useNavigate()

  const handleNavClick = (link) =>{
    if (link == "Home"){
      navigate("/");
    }else{
      navigate(`/${link.toLowerCase()}`);
    }
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(cartItems.map((i) => i.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateQty = async (id, val) => {
    await updateCartQty(id, val);
  };

  const deleteSelected = async () => {
    await removeSelectedFromCart(selectedIds);
    setSelectedIds([]);
    showToast("Items removed from cart");
  };

  const moveToWishlist = async () => {
    const moved = cartItems.filter((i) => selectedIds.includes(i.id));
    for (const item of moved) {
      const isWishlisted = wishlistItems.some((w) => w.id === item.productId);
      if (!isWishlisted) {
        await toggleWishlist({
          productId: item.productId,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          category: item.category,
          img: item.image
        });
      }
    }
    await removeSelectedFromCart(selectedIds);
    setSelectedIds([]);
    showToast("Items moved to wishlist");
    setTimeout(() => setShowWishlist(true), 800);
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const taxes = 350;
  const gst = 300;
  const platformFee = 150;
  const grandTotal = subtotal + taxes + gst + platformFee;

  if (showWishlist) {
    return (
      <WishlistPage
        onBack={() => setShowWishlist(false)}
      />
    );
  }

  return (
    <>
      <Navbar activeLink="" onLinkClick={handleNavClick}/>
      <div className="cart-page-wrapper">

      {/* TOAST */}
      {toast && (
        <div className="cart-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast}
        </div>
      )}

      <main className="cart-main">

        {/* LEFT */}
        <div className="cart-left">
          <h1 className="cart-title">My Cart</h1>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* SELECT ALL BAR */}
              <div className="cart-select-bar">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="cart-checkbox"
                  />
                  <span>{selectedIds.length}/{cartItems.length} Items Selected</span>
                </label>
                <div className="cart-bar-actions">
                  <button
                    className="cart-delete-btn"
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
                  <button
                    className="cart-wishlist-btn"
                    onClick={moveToWishlist}
                    disabled={selectedIds.length === 0}
                  >
                    Move To Wishlist
                  </button>
                </div>
              </div>

              {/* CART ITEMS LIST */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <input
                      type="checkbox"
                      className="cart-checkbox item-checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.name}</p>
                      <div className="cart-item-pricing">
                        <span className="cart-item-price">₹{item.price}</span>
                        <span className="cart-item-original">₹{item.originalPrice}</span>
                      </div>
                      <div className="cart-item-qty">
                        <select
                          value={item.qty}
                          onChange={(e) => updateQty(item.id, parseInt(e.target.value))}
                          className="qty-select"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                            <option key={n} value={n}>Qty: {n}</option>
                          ))}
                        </select>
                      </div>
                      <p className="cart-item-category">{item.category}</p>
                      <div className="cart-item-delivery">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13" rx="1"/>
                          <path d="M16 8h4l3 5v3h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        <span>Delivered by {item.deliveryDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        {cartItems.length > 0 && (
          <div className="cart-right">
            <div className="order-summary">
              <div className="summary-row summary-subtotal">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Taxes</span>
                <span>₹{taxes}</span>
              </div>
              <div className="summary-row">
                <span>GST</span>
                <span>₹{gst}</span>
              </div>
              <div className="summary-row">
                <span>Flatform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className="free-label">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-grand">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => navigate("/shipping")}
              >
                Checkout
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer/>

      </div>
    </>
  );
}