import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAdmin } from "../hooks/useAdmin";
import { useStore } from "../hooks/useStore";
import { getNavPath } from "../services/categoryRoute";
import "./SiteHeader.css";
import LogoImg from "../assets/offers/logo.svg";
import UserIcon from "../assets/header/User.png";
import CartIcon from "../assets/header/cards.png";

const DEFAULT_LINKS = ["Rings", "Earrings", "Bracelets", "Bangles", "Necklaces", "Anklets"];

// Second bar under the header — 3 rows, each centered independently.
// Entries with hasDropdown show a chevron and open a subcategory popup.
// Second bar under the header — exactly 3 rows.
// Row 1 ends at "Haaram"; everything else is redistributed across rows 2 & 3.
// Second bar under the header — 3 rows, matching the reference exactly.
const LOWER_NAV_ROWS = [
  [
    { name: "All Products" },
    { name: "New Arrivals" },
    { name: "Neckpiece", hasDropdown: true },
    { name: "Party Wears" },
    { name: "Haaram", hasDropdown: true },
    { name: "Bangles", hasDropdown: true },
    { name: "Earrings", hasDropdown: true },
    { name: "Hip Accessories", hasDropdown: true },
    { name: "Hair Accessories", hasDropdown: true },
  ],
  [
    { name: "Nagas Temple Designers" },
    { name: "Micro Gold Platings" },
    { name: "Under 999" },
    { name: "Bridal Essentials" },
    { name: "GJ polish diamond insp" },
    { name: "Restocked" },
    { name: "Sales" },
    { name: "Others", hasDropdown: true },
  ],
  [
    { name: "Non - Idol Collection" },
    { name: "Mugappu Chain" },
    { name: "Chic - Office Wear" },
    { name: "Vintage Collection" },
  ],
];

// Generates placeholder subcategory names like Ring1, Ring2, Ring3
// Replace with real subcategories from your store once available (category.subcategories = [{ name }, ...])
const getSubcategories = (link, categories = []) => {
  if (link === "Home") return [];

  const matched = categories.find(
    (c) => c.name?.toLowerCase() === link.toLowerCase()
  );
  if (matched?.subcategories?.length) {
    return matched.subcategories.map((s) => s.name);
  }

  const singular = link.endsWith("s") ? link.slice(0, -1) : link;
  return [1, 2, 3].map((n) => `${singular}${n}`);
};

const LoginDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const user = useStore((s) => s.user);
  const isAdmin = useStore((s) => s.isAdmin);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
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

// Desktop nav item: click toggles a popup of subcategories below it.
// Shows a divider + chevron icon when the item has subcategories.
const NavItem = ({ link, isActive, categories, onLinkClick, onSubClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const subcategories = useMemo(
    () => getSubcategories(link, categories),
    [link, categories]
  );
  const hasPopup = subcategories.length > 0;

  useEffect(() => {
    if (!hasPopup) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [hasPopup]);

  const handleMainClick = () => {
    if (!hasPopup) {
      onLinkClick(link);
      return;
    }
    setOpen((o) => !o);
  };

  const handleSubClick = (sub) => {
    setOpen(false);
    onSubClick(link, sub);
  };

  return (
    <div className="nav-item-wrapper" ref={ref}>
      <button
        className={`nav-link ${isActive ? "active" : ""} ${hasPopup ? "has-caret" : ""}`}
        onClick={handleMainClick}
      >
        <span>{link}</span>
        {hasPopup && (
          <svg
            className={`nav-caret-icon ${open ? "open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            width="14"
            height="14"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {hasPopup && open && (
        <div className="nav-popup">
          {subcategories.map((sub) => (
            <button
              key={sub}
              className="nav-popup-item"
              onClick={() => handleSubClick(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Lower-bar nav item: same popup behavior as NavItem, white-on-navbar styling.
const LowerNavItem = ({ item, categories, onLinkClick, onSubClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const subcategories = useMemo(
    () => (item.hasDropdown ? getSubcategories(item.name, categories) : []),
    [item, categories]
  );
  const hasPopup = item.hasDropdown && subcategories.length > 0;

  useEffect(() => {
    if (!hasPopup) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [hasPopup]);

  const handleMainClick = () => {
    if (!hasPopup) {
      onLinkClick(item.name);
      return;
    }
    setOpen((o) => !o);
  };

  const handleSubClick = (sub) => {
    setOpen(false);
    onSubClick(item.name, sub);
  };

  return (
    <div className="lower-nav-item-wrapper" ref={ref}>
      <button className="lower-nav-link" onClick={handleMainClick}>
        <span>{item.name}</span>
        {hasPopup && (
          <svg
            className={`lower-nav-caret-icon ${open ? "open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            width="13"
            height="13"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {hasPopup && open && (
        <div className="nav-popup lower-nav-popup">
          {subcategories.map((sub) => (
            <button
              key={sub}
              className="nav-popup-item"
              onClick={() => handleSubClick(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile nav item: click expands an accordion of subcategories inline
const MobileNavItem = ({ link, categories, onLinkClick, onSubClick }) => {
  const [expanded, setExpanded] = useState(false);

  const subcategories = useMemo(
    () => getSubcategories(link, categories),
    [link, categories]
  );
  const hasPopup = subcategories.length > 0;

  const handleMainClick = () => {
    if (!hasPopup) {
      onLinkClick(link);
      return;
    }
    setExpanded((e) => !e);
  };

  const handleSubClick = (sub) => {
    setExpanded(false);
    onSubClick(link, sub);
  };

  return (
    <div className="mobile-nav-item">
      <button
        className={`mobile-nav-link ${expanded ? "expanded" : ""}`}
        onClick={handleMainClick}
      >
        <span>{link}</span>
        {hasPopup && (
          <svg
            className={`mobile-nav-caret-icon ${expanded ? "open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            width="16"
            height="16"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {hasPopup && expanded && (
        <div className="mobile-nav-submenu">
          {subcategories.map((sub) => (
            <button
              key={sub}
              className="mobile-nav-subitem"
              onClick={() => handleSubClick(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile version of the lower bar — flattened into one accordion section
const MobileLowerNav = ({ categories, onLinkClick, onSubClick }) => {
  const allItems = LOWER_NAV_ROWS.flat();

  return (
    <div className="mobile-collections">
      <p className="mobile-collections-title">Collections</p>
      <div className="mobile-collections-links">
        {allItems.map((item) => (
          <MobileNavItem
            key={item.name}
            link={item.name}
            categories={item.hasDropdown ? categories : []}
            onLinkClick={onLinkClick}
            onSubClick={onSubClick}
          />
        ))}
      </div>
    </div>
  );
};

export default function SiteHeader({ activeLink = "Home", onLinkClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartItems = useStore(state => state.cartItems);
  const wishlistItems = useStore(state => state.wishlistItems);
  const categories = useStore(state => state.categories);
  const fetchCategories = useStore(state => state.fetchCategories);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const NAV_LINKS = useMemo(() => {
    const customNames = (categories || [])
      .map(c => c.name)
      .filter(Boolean)
      .filter(name => !DEFAULT_LINKS.some(d => d.toLowerCase() === name.toLowerCase()));

    return ["Home", ...DEFAULT_LINKS, ...customNames];
  }, [categories]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLinkClick = (link) => {
    setMenuOpen(false);
    if (onLinkClick) {
      onLinkClick(link);
    } else {
      // Fallback: if a parent page doesn't pass its own onLinkClick,
      // navigate directly using the shared category-aware router
      navigate(getNavPath(link, categories));
    }
  };

  // Called when a subcategory item (e.g. "Ring1") is clicked, desktop or mobile
  const handleSubClick = (parentLink, sub) => {
    setMenuOpen(false);
    navigate(`${getNavPath(parentLink, categories)}?sub=${encodeURIComponent(sub)}`);
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
              <NavItem
                key={link}
                link={link}
                isActive={link === activeLink}
                categories={categories}
                onLinkClick={handleLinkClick}
                onSubClick={handleSubClick}
              />
            ))}
          </nav>

          <div className="header-actions">
            <button className="icon-btn" aria-label="Wishlist" onClick={() => navigate("/wishlist")} style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {wishlistCount > 0 && (
                <span style={{
                  position: "absolute", top: "2px", right: "2px",
                  background: "#fff", color: "#C42049", borderRadius: "50%",
                  padding: "1px 5px", fontSize: "10px", fontWeight: "bold",
                  minWidth: "16px", textAlign: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                }}>{wishlistCount}</span>
              )}
            </button>

            <button className="icon-btn" aria-label="Cart" onClick={() => navigate("/cart")} style={{ position: "relative" }}>
              <img src={CartIcon} alt="Cart" className="header-icon" />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "2px", right: "2px",
                  background: "#fff", color: "#C42049", borderRadius: "50%",
                  padding: "1px 5px", fontSize: "10px", fontWeight: "bold",
                  minWidth: "16px", textAlign: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                }}>{cartCount}</span>
              )}
            </button>

            <LoginDropdown />
          </div>
        </div>

        <div className="header-desktop-lower">
          {LOWER_NAV_ROWS.map((row, i) => (
            <nav className="lower-nav-row" key={i}>
              {row.map((item) => (
                <LowerNavItem
                  key={item.name}
                  item={item}
                  categories={categories}
                  onLinkClick={handleLinkClick}
                  onSubClick={handleSubClick}
                />
              ))}
            </nav>
          ))}
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav className="mobile-nav-links">
          {NAV_LINKS.map((link) => (
            <MobileNavItem
              key={link}
              link={link}
              categories={categories}
              onLinkClick={handleLinkClick}
              onSubClick={handleSubClick}
            />
          ))}
        </nav>

        <MobileLowerNav
          categories={categories}
          onLinkClick={handleLinkClick}
          onSubClick={handleSubClick}
        />
      </div>
    </>
  );
}