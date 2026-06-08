import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import Toast from "../components/Toast";
import "./categorypage.css";

const ITEMS_PER_PAGE = 9;

// ─── Loading Skeleton ─────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="grid-product-card skeleton">
    <div className="product-card-image-wrapper">
      <div className="skeleton-img" />
    </div>
    <div className="product-card-body-details">
      <div className="skeleton-title" />
      <div className="skeleton-desc" />
      <div className="skeleton-price" />
    </div>
  </div>
);

export default function CategoryPage({ category, onProductClick }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search and filter states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatus, setStockStatus] = useState({ inStock: true, outOfStock: false });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const productsData = await productService.getProductsByCategoryName(category);
        const mapped = (productsData || []).map(p => ({
          id: p.product_id,
          img: p.image_url,
          name: p.name,
          desc: p.description,
          price: p.price,
          originalPrice: p.compare_price || Math.round(p.price * 1.3),
          sizes: p.sizes || [],
          stock: p.stock > 0 ? "in-stock" : "out-of-stock"
        }));
        setProducts(mapped);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }

      setLoading(false);
      setCurrentPage(1);
    };

    fetchProducts();
  }, [category]);

  // Reset filters when category changes
  useEffect(() => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedSizes([]);
    setCurrentPage(1);
  }, [category]);

  const sizeOptions = useMemo(() => {
    if (category === "Rings") return [5, 6, 7, 8, 9, 10, 11];
    if (category === "Bangles" || category === "Bracelets") return [2.4, 2.6, 2.8];
    return [];
  }, [category]);

  const handleNavClick = (link) => {
    if (link === "Home") navigate("/");
    else if (link === category) window.scrollTo({ top: 0, behavior: "smooth" });
    else navigate(`/${link.toLowerCase()}`);
  };

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

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

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    showToast(`Added "${product.name}" to cart!`, "success");
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value !== category) navigate(`/${value.toLowerCase()}`);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleStockToggle = (key) => {
    setStockStatus(prev => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const toggleSizeMenu = () => setSizeMenuOpen(prev => !prev);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.desc.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      const inStockMatch = stockStatus.inStock && product.stock === "in-stock";
      const outOfStockMatch = stockStatus.outOfStock && product.stock === "out-of-stock";
      if (!stockStatus.inStock && !stockStatus.outOfStock) return false;
      if (stockStatus.inStock && !stockStatus.outOfStock && !inStockMatch) return false;
      if (!stockStatus.inStock && stockStatus.outOfStock && !outOfStockMatch) return false;

      if (selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes.some(size => selectedSizes.includes(size));
        if (!hasMatchingSize) return false;
      }

      return true;
    });
  }, [products, searchQuery, stockStatus, selectedSizes]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleProductCardClick = (product) => {
    const formattedProduct = {
      ...product,
      price: `₹${product.price}.00`,
      original: `₹${product.originalPrice}.00`,
      category
    };
    onProductClick(formattedProduct);
    navigate("/product");
  };

  return (
    <div className="categorypage-root">
      <SiteHeader activeLink={category} onLinkClick={handleNavClick} />

      <div className="search-bar-container">
        <div className="search-bar-wrapper">
          <div className="category-select-wrapper">
            <select value={category} onChange={handleCategorySelect} className="category-dropdown-select">
              <option value="Rings">Rings</option>
              <option value="Earrings">Earrings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Bangles">Bangles</option>
              <option value="Necklaces">Necklaces</option>
            </select>
          </div>

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
              <button type="button" onClick={handleClearSearch} className="search-input-clear-btn">✕</button>
            )}
            <button type="button" onClick={handleSearchSubmit} className="search-input-submit-btn">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <button type="button" onClick={() => navigate("/cart")} className="search-view-cart-btn">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            View Cart
          </button>
        </div>
      </div>

      <div className="categorypage-main-layout">
        <aside className="categorypage-sidebar">
          <div className="sidebar-filter-section">
            <h3 className="filter-title-no-collapse">Stock Status</h3>
            <div className="filter-options-content">
              <label className="checkbox-item-label">
                <input type="checkbox" className="filter-checkbox-input" checked={stockStatus.inStock} onChange={() => handleStockToggle("inStock")} />
                <span className="checkbox-custom-box"></span>
                <span className="checkbox-item-text">In Stock</span>
              </label>
              <label className="checkbox-item-label">
                <input type="checkbox" className="filter-checkbox-input" checked={stockStatus.outOfStock} onChange={() => handleStockToggle("outOfStock")} />
                <span className="checkbox-custom-box"></span>
                <span className="checkbox-item-text">Out of Stock</span>
              </label>
            </div>
          </div>

          {sizeOptions.length > 0 && (
            <div className="sidebar-filter-section border-top">
              <button type="button" onClick={toggleSizeMenu} className="filter-collapse-header-btn">
                <span className="filter-title-text">Size</span>
                <svg className={`filter-chevron-icon ${sizeMenuOpen ? "rotated" : ""}`} viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 15l-6-6-6 6" strokeLinecap="round" />
                </svg>
              </button>
              {sizeMenuOpen && (
                <div className="filter-options-content size-list-layout">
                  {sizeOptions.map(size => (
                    <label key={size} className="checkbox-item-label">
                      <input type="checkbox" className="filter-checkbox-input" checked={selectedSizes.includes(size)} onChange={() => handleSizeToggle(size)} />
                      <span className="checkbox-custom-box"></span>
                      <span className="checkbox-item-text">Size {size}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        <main className="categorypage-content-panel">
          <nav className="breadcrumbs-nav-panel">
            <span onClick={() => navigate("/")} className="breadcrumb-nav-link">Home</span>
            <span className="breadcrumb-nav-separator">/</span>
            <span onClick={handleClearSearch} className="breadcrumb-nav-link">Search</span>
            <span className="breadcrumb-nav-separator">/</span>
            <span className="breadcrumb-nav-current-page">{category}</span>
          </nav>

          <div className="search-results-summary-header">
            <h2 className="search-query-results-title">
              {searchQuery || `All ${category}`}
            </h2>
            <span className="search-results-divider-line"></span>
            <span className="search-results-count-badge">
              {loading ? "Loading..." : `${filteredProducts.length} Results`}
            </span>
          </div>

          {loading ? (
            // ─── Loading Skeleton Grid ─────────────────────────────
            <div className="product-results-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : currentItems.length === 0 ? (
            // ─── Empty State ───────────────────────────────────────
            <div className="results-empty-state-card">
              <svg viewBox="0 0 24 24" fill="none" width="48" height="48" stroke="#888" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3 className="empty-state-title">No products found</h3>
              <p className="empty-state-subtitle">
                {products.length === 0
                  ? "No products in this category yet. Check back soon!"
                  : "No items match your filters. Try adjusting your search criteria."}
              </p>
              {products.length > 0 && (
                <button type="button" onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setSelectedSizes([]);
                  setStockStatus({ inStock: true, outOfStock: false });
                }} className="empty-state-reset-btn">
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            // ─── Product Grid ──────────────────────────────────────
            <>
              <div className="product-results-grid">
                {currentItems.map(product => (
                  <article key={product.id} onClick={() => handleProductCardClick(product)} className="grid-product-card">
                    <div className="product-card-image-wrapper">
                      <img src={product.img} alt={product.name} className="product-card-image-display" loading="lazy" />
                    </div>
                    <div className="product-card-body-details">
                      <h3 className="product-card-title-text">{product.name}</h3>
                      <p className="product-card-subtitle-desc">{product.desc}</p>
                      <div className="product-card-price-row">
                        <span className="price-tag-now">₹{product.price}.00</span>
                        <span className="price-tag-was">₹{product.originalPrice}.00</span>
                      </div>
                      <div className="product-card-footer-actions">
                        <button type="button" onClick={(e) => handleAddToCart(e, product)} className="product-card-add-to-cart-btn">
                          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add To Cart
                        </button>
                        <button type="button" onClick={(e) => handleWishlistToggle(e, product.id)} className={`product-card-wishlist-toggle-btn ${wishlist.includes(product.id) ? "active" : ""}`}>
                          <svg viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "#C42049" : "none"} stroke={wishlist.includes(product.id) ? "#C42049" : "currentColor"} strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="pagination-bar-wrapper">
                <div className="pagination-info-box">
                  <span className="pagination-current-page-num">{currentPage < 10 ? `0${currentPage}` : currentPage}</span>
                  <span className="pagination-of-text">of {totalPages < 10 ? `0${totalPages}` : totalPages}</span>
                </div>
                <div className="pagination-control-arrows">
                  <button type="button" onClick={() => handlePageChange("prev")} disabled={currentPage === 1} className="pagination-arrow-button">
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => handlePageChange("next")} disabled={currentPage === totalPages} className="pagination-arrow-button">
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

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      <SiteFooter />
    </div>
  );
}