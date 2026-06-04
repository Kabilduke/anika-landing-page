import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAdmin } from "../hooks/useAdmin";
import "./SiteHeader.css";
import LogoImg from "../assets/offers/logo.svg";
import UserIcon from "../assets/header/User.png";
import CartIcon from "../assets/header/cards.png";

const NAV_LINKS = ["Home", "Rings", "Earrings", "Bracelets", "Bangles", "Necklaces"];

const LoginDropdown = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { isAdmin } = useAdmin();
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="login-wrapper" ref={ref}>
      <button className="icon-btn" aria-label="Account" onClick={() => setOpen(!open)}>
        <img src={UserIcon} alt="Account" className="header-icon" />
      </button>

      {open && (
        <div className="login-dropdown">
          {user ? (
            <>
              <p className="dropdown-name">{user.user_metadata?.name || "User"}</p>
              <p className="dropdown-email">{user.email}</p>
              <hr />
              <Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
              {isAdmin && (
                <>
                  <hr />
                  <Link to="/admin" onClick={() => setOpen(false)} className="admin_link">
                    Admin Panel
                  </Link>
                </>
              )}
              <hr />
              <button className="dropdown-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/account/login">Login</Link>
              <hr />
              <Link to="/account/signup">New Customer? <span>Sign Up</span></Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function SiteHeader({ activeLink = "Home", onLinkClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // ← added

  const handleLinkClick = (link) => {
    setMenuOpen(false);
    if (onLinkClick) onLinkClick(link);
  };

  return (
    <>
      <header className={`header ${menuOpen ? "menu-open" : ""}`}>
        <div className="header-top-row">

          <button className="burger-btn mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <div className={`burger-icon ${menuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <div className="logo" onClick={() => handleLinkClick("Home")} style={{ cursor: "pointer" }}>
            <img src={LogoImg} alt="Anika" className="logo-img" />
          </div>

          <nav className="desktop-nav">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                className={`nav-link ${link === activeLink ? "active" : ""}`}
                onClick={() => handleLinkClick(link)}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="header-actions">

            {/* Search */}
            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {/* Wishlist — navigates to /wishlist on click */}
            <button className="icon-btn" aria-label="Wishlist" onClick={() => navigate("/wishlist")}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Cart — PNG icon */}
            <button className="icon-btn" aria-label="Cart">
              <img src={CartIcon} alt="Cart" className="header-icon" />
            </button>

            {/* Account — PNG icon */}
            <LoginDropdown />

          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav className="mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              className="mobile-nav-link"
              onClick={() => handleLinkClick(link)}
            >
              {link}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}