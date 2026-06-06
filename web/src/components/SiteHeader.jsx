import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./SiteHeader.css";
import LogoImg from "../assets/offers/logo.svg";

const NAV_LINKS = ["Home", "Rings", "Earrings", "Bracelets", "Bangles", "Necklaces"];

const LoginDropdown = ({ user, isAdmin, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="login-wrapper" ref={ref}>
      <button className="icon-btn" aria-label="Account" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {/* ← show User or Login based on session */}
        <p className="account-label">{user ? (user.user_metadata?.name || "User") : "Login"}</p>
      </button>

      {open && (
        <div className="login-dropdown">
          {user ? (
            //logged in menu
            <>
              <p className="dropdown-name">{user.user_metadata?.name || "User"}</p>
              <p className="dropdown-email">{user.email}</p>
              <hr />
              <Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
              {isAdmin && (
                <>
                  <hr />
                  <a 
                    href={import.meta.env.VITE_ADMIN_CONSOLE_URL || "http://localhost:5173"} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => setOpen(false)}
                    style={{ display: "block", padding: "8px 0", color: "#b8860b", fontWeight: "600", textDecoration: "none" }}
                  >
                    Admin Console
                  </a>
                </>
              )}
              <hr />
              <button className="dropdown-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            //logged out menu
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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // ← check session + check admin role on mount + listen for auth changes
  useEffect(() => {
    const checkAdmin = async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("role")
          .eq("id", currentUser.id)
          .single();
        
        if (data && data.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      checkAdmin(u);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      checkAdmin(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setMenuOpen(false);
    navigate("/");
  };

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
            {isAdmin && (
              <a
                href={import.meta.env.VITE_ADMIN_CONSOLE_URL || "http://localhost:5173"}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link admin-console-link"
                style={{ color: "#b8860b", fontWeight: "600", textDecoration: "none" }}
              >
                Admin Console
              </a>
            )}
          </nav>

          <div className="header-actions">
            <button className="icon-btn" aria-label="Search">
              <svg viewBox="0 0 20 20" fill="none" width="22" height="22">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <button className="icon-btn" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M12 21C12 21 3 14.5 3 8.5A4.5 4.5 0 0 1 12 6.27 4.5 4.5 0 0 1 21 8.5C21 14.5 12 21 12 21Z"
                  stroke="currentColor" strokeWidth="1.6"
                />
              </svg>
            </button>

            <LoginDropdown user={user} isAdmin={isAdmin} handleLogout={handleLogout} />
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
          {isAdmin && (
            <a
              href={import.meta.env.VITE_ADMIN_CONSOLE_URL || "http://localhost:5173"}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link admin-console-link"
              style={{ color: "#b8860b", fontWeight: "600", textDecoration: "none", display: "block" }}
            >
              Admin Console
            </a>
          )}
        </nav>
      </div>
    </>
  );
}