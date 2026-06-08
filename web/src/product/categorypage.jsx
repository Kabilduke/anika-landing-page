import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Toast from "../components/Toast";
import "./categorypage.css";

// ─── Import Product Assets ───
import Product1 from "../assets/Product1.webp";
import Product2 from "../assets/Product2.webp";
import Product3 from "../assets/Product3.webp";
import Product4 from "../assets/Product4.webp";
import Product5 from "../assets/Product2.webp";
import RingsImg from "../assets/Rings.webp";
import Rings1Img from "../assets/Rings1.webp";
import EarringsImg from "../assets/Earrings.webp";
import BraceletsImg from "../assets/Bracelets.webp";
import Bracelets1Img from "../assets/Bracelets1.webp";
import BanglesImg from "../assets/Bangles.webp";
import NecklacesImg from "../assets/Necklaces.webp";

// Necklaces
import Necklace1 from "../assets/Photo Frame 1.webp";
import Necklace2 from "../assets/Photo Frame 2.webp";
import Necklace3 from "../assets/Photo Frame.webp";
import Necklace4 from "../assets/Photo Frame 4.webp";

// Earrings (Offers)
import Offer1 from "../assets/offers/image-1.webp";
import Offer2 from "../assets/offers/image-2.webp";
import Offer3 from "../assets/offers/image-3.webp";
import Offer4 from "../assets/offers/image-4.webp";
import Offer5 from "../assets/offers/image-6.webp";

// ─── Product Catalog ───
const CATALOG = {
  Rings: [
    { id: 101, img: Product1, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [6, 7, 8], stock: "in-stock" },
    { id: 102, img: Product2, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [7, 8, 9], stock: "in-stock" },
    { id: 103, img: Product3, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [8, 9, 10], stock: "in-stock" },
    { id: 104, img: Product4, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [5, 6, 7], stock: "in-stock" },
    { id: 105, img: RingsImg, name: "Elegant Solitaire Gold Ring", desc: "Premium handcrafted gold band with gem", price: 1299, originalPrice: 2800, sizes: [6, 7, 8, 9], stock: "in-stock" },
    { id: 106, img: Rings1Img, name: "Vanki Gold Ring", desc: "Traditional South Indian chevron gold ring", price: 1599, originalPrice: 3000, sizes: [5, 6, 7], stock: "in-stock" },
    { id: 107, img: Product1, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [9, 10, 11], stock: "out-of-stock" },
    { id: 108, img: Product2, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [6, 8, 10], stock: "in-stock" },
    { id: 109, img: Product3, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [5, 7, 9], stock: "in-stock" },
    { id: 110, img: Product4, name: "Radiant Vitamin C Wash", desc: "Brightening boost with every wash", price: 78, originalPrice: 102, sizes: [8, 10, 11], stock: "in-stock" },
    { id: 111, img: RingsImg, name: "Eternity Diamond Ring", desc: "Exquisite diamond studded gold ring", price: 1899, originalPrice: 3500, sizes: [6, 7, 8], stock: "in-stock" },
    { id: 112, img: Rings1Img, name: "Matte Gold Floral Ring", desc: "Floral motif gold plated ring", price: 999, originalPrice: 2000, sizes: [7, 8, 9, 10], stock: "in-stock" }
  ],
  Earrings: [
    { id: 201, img: Offer1, name: "Glamore Earrings Set", desc: "Intricate jhumka earrings with gems", price: 749, originalPrice: 1200, sizes: ["Standard"], stock: "in-stock" },
    { id: 202, img: Offer2, name: "Glamore Pearls Earrings", desc: "Classic hanging pearl gold earrings", price: 899, originalPrice: 1500, sizes: ["Standard"], stock: "in-stock" },
    { id: 203, img: Offer3, name: "Kundan Stud Earrings", desc: "Vibrant Kundan stones on gold plating", price: 650, originalPrice: 1100, sizes: ["Standard"], stock: "in-stock" },
    { id: 204, img: Offer4, name: "Matte Antique Ear Studs", desc: "Royal heritage matte finish earrings", price: 800, originalPrice: 1400, sizes: ["Standard"], stock: "in-stock" },
    { id: 205, img: EarringsImg, name: "Premium Temple Jhumkas", desc: "Traditional South Indian temple jhumka set", price: 1199, originalPrice: 2500, sizes: ["Standard"], stock: "in-stock" },
    { id: 206, img: Offer5, name: "Glamore Floral Earrings", desc: "Flower motif gold alloy drop earrings", price: 799, originalPrice: 1300, sizes: ["Standard"], stock: "in-stock" },
    { id: 207, img: Offer1, name: "Glamore Earrings Set", desc: "Intricate jhumka earrings with gems", price: 749, originalPrice: 1200, sizes: ["Standard"], stock: "out-of-stock" },
    { id: 208, img: Offer2, name: "Glamore Pearls Earrings", desc: "Classic hanging pearl gold earrings", price: 899, originalPrice: 1500, sizes: ["Standard"], stock: "in-stock" }
  ],
  Bracelets: [
    { id: 301, img: BraceletsImg, name: "Antique Gold Kada", desc: "Chased details antique gold kada bracelet", price: 1499, originalPrice: 2800, sizes: [2.4, 2.6, 2.8], stock: "in-stock" },
    { id: 302, img: Bracelets1Img, name: "Glamore Stone Bracelet", desc: "Fashion chain bracelet with white stones", price: 999, originalPrice: 1900, sizes: [2.4, 2.6], stock: "in-stock" },
    { id: 303, img: BraceletsImg, name: "Leaf Motif Bangle Kada", desc: "Leaf engraving gold plated kada", price: 1249, originalPrice: 2300, sizes: [2.6, 2.8], stock: "in-stock" },
    { id: 304, img: Bracelets1Img, name: "Delicate Floral Bracelet", desc: "Thin chain gold bracelet with floral links", price: 799, originalPrice: 1500, sizes: [2.4, 2.6], stock: "in-stock" },
    { id: 305, img: BraceletsImg, name: "Antique Gold Kada", desc: "Chased details antique gold kada bracelet", price: 1499, originalPrice: 2800, sizes: [2.4, 2.6, 2.8], stock: "out-of-stock" },
    { id: 306, img: Bracelets1Img, name: "Glamore Stone Bracelet", desc: "Fashion chain bracelet with white stones", price: 999, originalPrice: 1900, sizes: [2.4, 2.6], stock: "in-stock" }
  ],
  Bangles: [
    { id: 401, img: Product1, name: "Glamore Gold Bangles", desc: "Exquisitely detailed antique bangle set", price: 1299, originalPrice: 2800, sizes: [2.4, 2.6, 2.8], stock: "in-stock" },
    { id: 402, img: Product2, name: "Glamore Pearl Bangles", desc: "Gold plated alloy with synthetic pearls", price: 1199, originalPrice: 2500, sizes: [2.4, 2.6], stock: "in-stock" },
    { id: 403, img: Product3, name: "Ruby Studded Bangles", desc: "Vibrant ruby stones on matte gold bangles", price: 1849, originalPrice: 2800, sizes: [2.6, 2.8], stock: "in-stock" },
    { id: 404, img: Product4, name: "Classic Gold Bangles", desc: "Engraved geometric traditional bangle set", price: 1399, originalPrice: 2300, sizes: [2.4, 2.6, 2.8], stock: "in-stock" },
    { id: 405, img: Product5, name: "Bridal Bangle Set", desc: "Heavy gold-plated traditional bridal bangles", price: 1249, originalPrice: 2500, sizes: [2.6, 2.8], stock: "in-stock" },
    { id: 406, img: BanglesImg, name: "Matte Antique Bangle Set", desc: "Matte gold bangle set with floral carvings", price: 1699, originalPrice: 3200, sizes: [2.4, 2.6], stock: "in-stock" },
    { id: 407, img: Product1, name: "Glamore Gold Bangles", desc: "Exquisitely detailed antique bangle set", price: 1299, originalPrice: 2800, sizes: [2.4, 2.6, 2.8], stock: "out-of-stock" },
    { id: 408, img: Product2, name: "Glamore Pearl Bangles", desc: "Gold plated alloy with synthetic pearls", price: 1199, originalPrice: 2500, sizes: [2.4, 2.6], stock: "in-stock" }
  ],
  Necklaces: [
    { id: 501, img: Necklace1, name: "Long Layered Haram Set", desc: "Heavy temple haram gold plated necklace", price: 3499, originalPrice: 7000, sizes: ["Adjustable"], stock: "in-stock" },
    { id: 502, img: Necklace2, name: "Multicolour Choker Necklace", desc: "Choker necklace with rubies and emeralds", price: 2199, originalPrice: 4500, sizes: ["Adjustable"], stock: "in-stock" },
    { id: 503, img: Necklace3, name: "Kundan Choker Set", desc: "Traditional Kundan choker with matching studs", price: 2899, originalPrice: 5500, sizes: ["Adjustable"], stock: "in-stock" },
    { id: 504, img: Necklace4, name: "Temple Laxmi Necklace", desc: "Laxmi coin motif antique gold necklace set", price: 1999, originalPrice: 4000, sizes: ["Adjustable"], stock: "in-stock" },
    { id: 505, img: NecklacesImg, name: "Antique Guttapusalu Choker", desc: "Pearl cluster antique gold choker set", price: 2499, originalPrice: 5000, sizes: ["Adjustable"], stock: "in-stock" },
    { id: 506, img: Necklace1, name: "Long Layered Haram Set", desc: "Heavy temple haram gold plated necklace", price: 3499, originalPrice: 7000, sizes: ["Adjustable"], stock: "out-of-stock" },
    { id: 507, img: Necklace2, name: "Multicolour Choker Necklace", desc: "Choker necklace with rubies and emeralds", price: 2199, originalPrice: 4500, sizes: ["Adjustable"], stock: "in-stock" }
  ]
};

const ITEMS_PER_PAGE = 9;

export default function CategoryPage({ category, onProductClick }) {
  const navigate = useNavigate();

  // Reset pagination and search inputs when category changes
  useEffect(() => {
    setSearchInput(category === "Rings" ? "Gold jwell" : "");
    setSearchQuery(category === "Rings" ? "Gold jwell" : "");
    setSelectedSizes([]);
    setCurrentPage(1);
  }, [category]);

  // Search input and query states
  const [searchInput, setSearchInput] = useState(category === "Rings" ? "Gold jwell" : "");
  const [searchQuery, setSearchQuery] = useState(category === "Rings" ? "Gold jwell" : "");

  // Sidebar Filter states
  const [stockStatus, setStockStatus] = useState({
    inStock: true,
    outOfStock: false,
  });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Wishlist and Toast states
  const [wishlist, setWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Determine size filter options based on category
  const sizeOptions = useMemo(() => {
    if (category === "Rings") return [5, 6, 7, 8, 9, 10, 11];
    if (category === "Bangles" || category === "Bracelets") return [2.4, 2.6, 2.8];
    return []; // Earrings and Necklaces have standard/adjustable sizes, so they do not require size sidebar filtering
  }, [category]);

  // Header Nav handler
  const handleNavClick = (link) => {
    if (link === "Home") {
      navigate("/");
    } else if (link === category) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(`/${link.toLowerCase()}`);
    }
  };

  // Trigger Toast helper
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  // Toggle wishlist item
  const handleWishlistToggle = (e, productId) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(prev => prev.filter(id => id !== productId));
      showToast("Removed from wishlist", "info");
    } else {
      setWishlist(prev => [...prev, productId]);
      showToast("Added to wishlist", "success");
    }
  };

  // Add to cart click
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    showToast(`Added "${product.name}" to cart successfully!`, "success");
  };

  // Category change from select dropdown
  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value !== category) {
      navigate(`/${value.toLowerCase()}`);
    }
  };

  // Search trigger
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Toggle Stock filters
  const handleStockToggle = (key) => {
    setStockStatus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setCurrentPage(1);
  };

  // Toggle Size filter
  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  // Collapsible Size Toggle
  const toggleSizeMenu = () => {
    setSizeMenuOpen(prev => !prev);
  };

  // Get current products catalog
  const productsCatalog = useMemo(() => {
    return CATALOG[category] || [];
  }, [category]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return productsCatalog.filter(product => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.desc.toLowerCase().includes(q);
        // Rings mockup matching
        const matchesRingSku = category === "Rings" && (q === "gold jwell" || q === "gold" || q === "jwell");
        if (!matchesName && !matchesDesc && !matchesRingSku) return false;
      }

      // 2. Stock filter
      const inStockMatch = stockStatus.inStock && product.stock === "in-stock";
      const outOfStockMatch = stockStatus.outOfStock && product.stock === "out-of-stock";
      if (!stockStatus.inStock && !stockStatus.outOfStock) return false;
      if (stockStatus.inStock && !stockStatus.outOfStock && !inStockMatch) return false;
      if (!stockStatus.inStock && stockStatus.outOfStock && !outOfStockMatch) return false;

      // 3. Size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes.some(size => selectedSizes.includes(size));
        if (!hasMatchingSize) return false;
      }

      return true;
    });
  }, [productsCatalog, searchQuery, stockStatus, selectedSizes, category]);

  // Paginated items
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Handle page change
  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Open product details page
  const handleProductCardClick = (product) => {
    const formattedProduct = {
      ...product,
      price: `₹${product.price}.00`,
      original: `₹${product.originalPrice}.00`,
      category: category
    };
    onProductClick(formattedProduct);
    navigate("/product");
  };

  return (
    <div className="categorypage-root">
      {/* Site Header */}
      <SiteHeader activeLink={category} onLinkClick={handleNavClick} />

      {/* Main Search and Filter Top Bar */}
      <div className="search-bar-container">
        <div className="search-bar-wrapper">
          {/* Category Dropdown */}
          <div className="category-select-wrapper">
            <select 
              value={category} 
              onChange={handleCategorySelect}
              className="category-dropdown-select"
            >
              <option value="Rings">Rings</option>
              <option value="Earrings">Earrings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Bangles">Bangles</option>
              <option value="Necklaces">Necklaces</option>
            </select>
          </div>

          {/* Search Box Input */}
          <div className="search-input-field-wrapper">
            <input
              type="text"
              placeholder={`Search ${category.toLowerCase()}...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="search-input-field"
            />
            {searchInput && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="search-input-clear-btn"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button 
              type="button" 
              onClick={() => handleSearchSubmit()}
              className="search-input-submit-btn"
              aria-label="Submit search"
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* View Cart Button */}
          <button 
            type="button" 
            onClick={() => navigate("/cart")}
            className="search-view-cart-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            View Cart
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="categorypage-main-layout">
        
        {/* Sidebar Filters */}
        <aside className="categorypage-sidebar">
          
          {/* Stock Status Accordion */}
          <div className="sidebar-filter-section">
            <h3 className="filter-title-no-collapse">Stock Status</h3>
            <div className="filter-options-content">
              <label className="checkbox-item-label">
                <input
                  type="checkbox"
                  checked={stockStatus.inStock}
                  onChange={() => handleStockToggle("inStock")}
                  className="filter-checkbox-input"
                />
                <span className="checkbox-custom-box"></span>
                <span className="checkbox-item-text">In Stock</span>
              </label>
              
              <label className="checkbox-item-label">
                <input
                  type="checkbox"
                  checked={stockStatus.outOfStock}
                  onChange={() => handleStockToggle("outOfStock")}
                  className="filter-checkbox-input"
                />
                <span className="checkbox-custom-box"></span>
                <span className="checkbox-item-text">Out of Stock</span>
              </label>
            </div>
          </div>

          {/* Size Accordion (Only visible for categories with sizes like Rings, Bangles, Bracelets) */}
          {sizeOptions.length > 0 && (
            <div className="sidebar-filter-section border-top">
              <button 
                type="button"
                onClick={toggleSizeMenu}
                className="filter-collapse-header-btn"
              >
                <span className="filter-title-text">Size</span>
                <svg 
                  className={`filter-chevron-icon ${sizeMenuOpen ? "rotated" : ""}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  width="16" 
                  height="16" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                >
                  <path d="M18 15l-6-6-6 6" strokeLinecap="round" />
                </svg>
              </button>
              
              {sizeMenuOpen && (
                <div className="filter-options-content size-list-layout">
                  {sizeOptions.map(size => (
                    <label key={size} className="checkbox-item-label">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeToggle(size)}
                        className="filter-checkbox-input"
                      />
                      <span className="checkbox-custom-box"></span>
                      <span className="checkbox-item-text">Size {size}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Product Grid Panel */}
        <main className="categorypage-content-panel">
          
          {/* Breadcrumbs */}
          <nav className="breadcrumbs-nav-panel">
            <span onClick={() => navigate("/")} className="breadcrumb-nav-link">Home</span>
            <span className="breadcrumb-nav-separator">/</span>
            <span onClick={() => handleClearSearch()} className="breadcrumb-nav-link">Search</span>
            <span className="breadcrumb-nav-separator">/</span>
            <span className="breadcrumb-nav-current-page">{category}</span>
          </nav>

          {/* Search Result Summary Header */}
          <div className="search-results-summary-header">
            <h2 className="search-query-results-title">
              {searchQuery ? searchQuery : `All ${category}`}
            </h2>
            <span className="search-results-divider-line"></span>
            <span className="search-results-count-badge">
              {filteredProducts.length} Results
            </span>
          </div>

          {/* Grid view */}
          {currentItems.length === 0 ? (
            <div className="results-empty-state-card">
              <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="#888" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3 className="empty-state-title">No items match your filters</h3>
              <p className="empty-state-subtitle">Try adjusting your search criteria, clearing filters, or checking out of stock products.</p>
              <button 
                type="button" 
                onClick={() => {
                  setSearchInput(category === "Rings" ? "Gold jwell" : "");
                  setSearchQuery(category === "Rings" ? "Gold jwell" : "");
                  setSelectedSizes([]);
                  setStockStatus({ inStock: true, outOfStock: false });
                }}
                className="empty-state-reset-btn"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-results-grid">
                {currentItems.map(product => (
                  <article 
                    key={product.id} 
                    onClick={() => handleProductCardClick(product)}
                    className="grid-product-card"
                  >
                    {/* Image frame */}
                    <div className="product-card-image-wrapper">
                      <img 
                        src={product.img} 
                        alt={product.name} 
                        className="product-card-image-display" 
                        loading="lazy"
                      />
                    </div>

                    {/* Details content */}
                    <div className="product-card-body-details">
                      <h3 className="product-card-title-text">{product.name}</h3>
                      <p className="product-card-subtitle-desc">{product.desc}</p>
                      
                      <div className="product-card-price-row">
                        <span className="price-tag-now">₹{product.price}.00</span>
                        <span className="price-tag-was">₹{product.originalPrice}.00</span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="product-card-footer-actions">
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          className="product-card-add-to-cart-btn"
                        >
                          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add To Cart
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => handleWishlistToggle(e, product.id)}
                          className={`product-card-wishlist-toggle-btn ${wishlist.includes(product.id) ? "active" : ""}`}
                          aria-label="Toggle Wishlist"
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            fill={wishlist.includes(product.id) ? "#C42049" : "none"} 
                            stroke={wishlist.includes(product.id) ? "#C42049" : "currentColor"} 
                            strokeWidth="2"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Section */}
              <div className="pagination-bar-wrapper">
                <div className="pagination-info-box">
                  <span className="pagination-current-page-num">
                    {currentPage < 10 ? `0${currentPage}` : currentPage}
                  </span>
                  <span className="pagination-of-text">
                    of {totalPages < 10 ? `0${totalPages}` : totalPages}
                  </span>
                </div>
                
                <div className="pagination-control-arrows">
                  <button
                    type="button"
                    onClick={() => handlePageChange("prev")}
                    disabled={currentPage === 1}
                    className="pagination-arrow-button"
                    aria-label="Previous Page"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handlePageChange("next")}
                    disabled={currentPage === totalPages}
                    className="pagination-arrow-button"
                    aria-label="Next Page"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Toast notifications */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage("")} 
      />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
