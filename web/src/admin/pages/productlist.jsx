import React, { useMemo, useState } from "react";
import "./productlist.css";
import searchEmpty from "../../assets/admin/search.png";
import editIcon from "../../assets/admin/Edit.png";
import trashIcon from "../../assets/admin/Trash.png";
import { SkeletonTable } from "../../components/ui/Skeleton";

const getFinalPrice = (product) => {
  return parseFloat(product.price) || 0;
};

const getCategoryStyle = (category) => {

  const styles = {
    Rings: { background: "#f0e6ff", color: "#7c3aed" },
    Earrings: { background: "#fce7f3", color: "#be185d" },
    Bangles: { background: "#dcfce7", color: "#15803d" },
    Necklaces: { background: "#fff7ed", color: "#c2410c" },
    Bracelets: { background: "#e0f2fe", color: "#0369a1" },
    Anklets: { background: "#FFF0D9", color: "#FF6A1C" },
  };
  return styles[category] || { background: "#f0e6ff", color: "#7c3aed" };
};

/* ── Mobile card view for very small screens ── */
const MobileProductCard = ({ product, onEdit, onDelete, selectedRows, toggleSelectRow, expandedRows, toggleExpand }) => {
  const isChecked = selectedRows.includes(product.id);
  const isExpanded = expandedRows.includes(product.id);
  const hasVariants = product.has_variants && product.variants?.length > 0;


  return (
    <div className={`pl-mobile-card${isChecked ? " pl-mobile-card--selected" : ""}`}>
      <div className="pl-mobile-card__top">
        <label className="pl-mobile-card__check">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => toggleSelectRow(product.id)}
          />
        </label>
        <img
          src={product.images?.[0] || product.image || searchEmpty}
          alt={product.name}
          className="pl-mobile-card__img"
          onError={(e) => { e.target.src = searchEmpty; }}
        />
        <div className="pl-mobile-card__info">
          <span className="pl-mobile-card__name">{product.name}</span>
          <span className="pl-mobile-card__sku">SKU: {product.sku}</span>
          {hasVariants && (
            <div className="pl-color-dots">
              {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map((c) => (
                <span key={c} className="pl-color-dot" style={{ backgroundColor: c }} title={c} />
              ))}
            </div>
          )}
        </div>
        <div className="pl-mobile-card__actions">
          <button className="pl-action-btn" aria-label="Edit" onClick={() => onEdit(product)}>
            <img src={editIcon} alt="Edit" className="pl-action-icon" />
          </button>
          <button className="pl-action-btn pl-action-btn--delete" aria-label="Delete" onClick={() => onDelete(product.id)}>
            <img src={trashIcon} alt="Delete" className="pl-action-icon pl-action-icon--delete" />
          </button>
        </div>
      </div>
      <div className="pl-mobile-card__meta">
        <span className="pl-category-badge" style={getCategoryStyle(product.category)}>{product.category}</span>

        {product.subcategory && (
          <span className="pl-subcategory-badge">{product.subcategory}</span>  
        )}
        <span className="pl-stock-low">{product.stock} left</span>
        <span className={`pl-status-badge ${product.status === "Visible" ? "pl-status-visible" : product.status === "Draft" ? "pl-status-draft" : ""}`}>{product.status}</span>
        <span className="pl-mobile-card__price">{"Rs." + getFinalPrice(product).toLocaleString()}</span>
      </div>
      {hasVariants && (
        <>
          <button className="pl-variant-toggle pl-variant-toggle--mobile" onClick={() => toggleExpand(product.id)}>
            {product.variants.length} variants {isExpanded ? "▲" : "▼"}
          </button>

          {isExpanded && (
            <div className="pl-mobile-variant-list">
              {product.variants.map(v => (
                <div key={v.variant_id} className="pl-mobile-variant-row">
                  <img
                    src={v.images?.[0] || searchEmpty}
                    alt={`${product.name} ${v.color || ''} ${v.size || ''}`}
                    className="pl-variant-img"
                    onError={(e) => { e.target.src = searchEmpty; }}
                  />
                  <div className="pl-mobile-variant-details">
                    <span>
                      <span className="pl-color-dot" style={{ backgroundColor: v.color }} /> {v.color} {v.size ? `• ${v.size}` : ''}
                    </span>
                    <span className="pl-mobile-variant-sku">SKU: {v.sku}</span>
                  </div>
                  <div className="pl-mobile-variant-price">
                    <span>₹{Number(v.price).toLocaleString()}</span>
                    <span className="pl-mobile-variant-stock">{v.stock} left</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ProductList = ({ onAddProduct, onEditProduct, onDeleteProduct, products = [], categories = [], loading = false, onBack }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); 
  const itemsPerPage = 8;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStock, setSelectedStock] = useState("All");
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  const CATEGORIES = useMemo(() => {
    const fromProps = categories.map((c) => (typeof c === "string" ? c : c?.name || c?.title)).filter(Boolean);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const unique = Array.from(new Set([...fromProps, ...fromProducts]));
    return ["All", ...unique];
  }, [categories, products]);

  const STATUSES = ["All", "Visible", "Draft"];
  const STOCKS = ["All", "In Stock", "Low Stock", "Out of Stock"];

  const SUBCATEGORIES = useMemo(() => {
    const relevantProducts = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);
    const subs = relevantProducts.map((p) => p.subcategory).filter(Boolean);
    return ["All", ...Array.from(new Set(subs))];
  }, [products, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedRows((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Detect mobile card breakpoint
  const [isMobileCard, setIsMobileCard] = useState(window.innerWidth <= 540);
  React.useEffect(() => {
    const handler = () => setIsMobileCard(window.innerWidth <= 540);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery.trim() ||
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q);

    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchSubcategory = selectedSubcategory === "All" || p.subcategory === selectedSubcategory; 
    const matchStatus   = selectedStatus === "All"   || p.status === selectedStatus;
    const matchStock    = selectedStock === "All"    ||
      (selectedStock === "In Stock"    && p.stock > 5)  ||
      (selectedStock === "Low Stock"   && p.stock > 0 && p.stock <= 5) ||
      (selectedStock === "Out of Stock" && p.stock === 0);

    return matchSearch && matchCategory && matchSubcategory && matchStatus && matchStock; 
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") { setSearchQuery(searchInput); setCurrentPage(1); setSelectedRows([]); }
    if (e.key === "Escape") { setSearchInput(""); setSearchQuery(""); setCurrentPage(1); }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    if (e.target.value === "") { setSearchQuery(""); setCurrentPage(1); }
  };

  const handleEdit = (product) => { if (onEditProduct) onEditProduct(product); };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    const id = pendingDeleteId
    if (onDeleteProduct) onDeleteProduct(id);
    const newTotal = filteredProducts.length - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / itemsPerPage));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    setPendingDeleteId(null);
  };

  const toggleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? currentProducts.map((p) => p.id) : []);
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    currentProducts.length > 0 &&
    currentProducts.every((p) => selectedRows.includes(p.id));

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectedRows([]);
  };

  const getPageNumbers = () => {
    if (totalItems === 0) return [1, 2, 3];
    const pages = new Set([1, totalPages, currentPage]);
    if (currentPage - 1 >= 1) pages.add(currentPage - 1);
    if (currentPage + 1 <= totalPages) pages.add(currentPage + 1);
    return Array.from(pages).sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  const showingText = totalItems === 0
    ? "Showing 0 products"
    : "Showing " + (startIndex + 1) + "-" + Math.min(endIndex, totalItems) + " of " + totalItems + " products";

  return (
    <div className="product-list">

      {/* Header */}
      <div className="pl-header">
        <div className="pl-title">
          <h1>All products</h1>
          <span className="pl-count">{products.length} Items</span>
        </div>
        <button className="pl-add-btn" onClick={onAddProduct}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add product
        </button>
      </div>

      {/* Filters + Search */}
      <div className="pl-filters">
        <div className="pl-filter-group">
        {/* Category Dropdown */}
        <div className="pl-dropdown-wrap" style={{ position: 'relative' }}>
          <div className="pl-dropdown" onClick={() => { setCategoryOpen(o => !o); setStatusOpen(false); setStockOpen(false); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            <span>{selectedCategory === "All" ? "All categories" : selectedCategory}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {categoryOpen && (
            <div className="pl-dropdown-menu">
              {CATEGORIES.map(c => (
                <div key={c} className={`pl-dropdown-item ${selectedCategory === c ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(c); setCategoryOpen(false); setCurrentPage(1); setSelectedSubcategory("All");}}>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subcategory Dropdown — new */}
        <div className="pl-dropdown-wrap" style={{ position: 'relative'}}>
          <div className="pl-dropdown" onClick={() => { setSubcategoryOpen(o => !o); setCategoryOpen(false); setStatusOpen(false); setStockOpen(false); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h12M3 18h6" />
            </svg>
            <span>{selectedSubcategory === "All" ? "All subcategories" : selectedSubcategory}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {subcategoryOpen && (
            <div className="pl-dropdown-menu">
              {SUBCATEGORIES.map(s => (
                <div  key={s} className= {`pl-dropdown-item ${selectedSubcategory === s ? 'active' : ''}`}
                onClick={() => { setSelectedSubcategory(s); setSubcategoryOpen(false); setCurrentPage(1);}}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="pl-dropdown-wrap" style={{ position: 'relative' }}>
          <div className="pl-dropdown" onClick={() => { setStatusOpen(o => !o); setCategoryOpen(false); setSubcategoryOpen(false); setStockOpen(false); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>{selectedStatus === "All" ? "All Status" : selectedStatus}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {statusOpen && (
            <div className="pl-dropdown-menu">
              {STATUSES.map(s => (
                <div key={s} className={`pl-dropdown-item ${selectedStatus === s ? 'active' : ''}`}
                  onClick={() => { setSelectedStatus(s); setStatusOpen(false); setCurrentPage(1); }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Dropdown */}
        <div className="pl-dropdown-wrap" style={{ position: 'relative' }}>
          <div className="pl-dropdown" onClick={() => { setStockOpen(o => !o); setCategoryOpen(false); setSubcategoryOpen(false); setStatusOpen(false); }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            <span>{selectedStock === "All" ? "All Stock" : selectedStock}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {stockOpen && (
            <div className="pl-dropdown-menu">
              {STOCKS.map(s => (
                <div key={s} className={`pl-dropdown-item ${selectedStock === s ? 'active' : ''}`}
                  onClick={() => { setSelectedStock(s); setStockOpen(false); setCurrentPage(1); }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>


        <div className="pl-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
          {searchInput && (
            <button
              className="pl-search-clear"
              onClick={() => { setSearchInput(""); setSearchQuery(""); setCurrentPage(1); }}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {searchQuery && (
        <p className="pl-search-label">
          Results for <strong>"{searchQuery}"</strong> — {totalItems} product{totalItems !== 1 ? "s" : ""} found
        </p>
      )}

      {/* ── Mobile card list (≤540px) ── */}
      {isMobileCard ? (
        <div className="pl-mobile-list">
          {currentProducts.length === 0 ? (
            <div className="pl-table-wrapper">
              <div className="pl-empty-state" style={{ padding: "60px 20px" }}>
                <div className="pl-empty-content">
                  <img src={searchEmpty} alt="No results" className="pl-empty-img" />
                  <p className="pl-empty-title">No results found</p>
                  <span className="pl-empty-subtitle">
                    {searchQuery
                      ? `No products match "${searchQuery}". Try a different name or SKU.`
                      : "No products yet. Click Add product to get started."}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            currentProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={requestDelete}
                selectedRows={selectedRows}
                toggleSelectRow={toggleSelectRow}
                expandedRows={expandedRows}
                toggleExpand={toggleExpand}
              />
            ))
          )}
        </div>
      ) : (
        /* ── Desktop / tablet table ── */
        <div className="pl-table-wrapper">
          <table className="pl-table">
            <thead>
              <tr>
                <th className="pl-checkbox-col">
                  <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                </th>
                <th className="pl-product-col">PRODUCT</th>
                <th className="pl-category-col">CATEGORY</th>
                <th className="pl-subcategory-col">SUBCATEGORY</th>
                <th className="pl-price-col">PRICE</th>
                <th className="pl-stock-col">STOCK</th>
                <th className="pl-status-col">STATUS</th>
                <th className="pl-actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: "20px" }}>
                    <SkeletonTable rows={5} cols={7} />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="pl-empty-state">
                    <div className="pl-empty-content">
                      <img src={searchEmpty} alt="No results" className="pl-empty-img" />
                      <p className="pl-empty-title">No results found</p>
                      <span className="pl-empty-subtitle">
                        {searchQuery
                          ? `No products match "${searchQuery}". Try a different name or SKU.`
                          : "No products yet. Click Add product to get started."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                 <React.Fragment key={product.id}>
                  <tr key={product.id}>
                    <td className="pl-checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(product.id)}
                        onChange={() => toggleSelectRow(product.id)}
                      />
                    </td>
                    <td className="pl-product-col">
                      <div className="pl-product-info">
                        <img
                          src={product.images?.[0] || product.image || searchEmpty}
                          alt={product.name}
                          className="pl-product-img"
                          onError={(e) => { e.target.src = searchEmpty; }}
                        />
                        <div className="pl-product-details">
                          <span className="pl-product-name">
                            {product.name}
                            {product.has_variants && product.variants?.length > 0 && (
                              <button
                                className="pl-variant-toggle"
                                onClick={() => toggleExpand(product.id)}
                              >
                                {product.variants.length} variants {expandedRows.includes(product.id) ? "▲" : "▼"}
                              </button>
                            )}

                          </span>
                          <span className="pl-product-sku">SKU: {product.sku}</span>
                          {product.has_variants && product.variants?.length > 0 &&(
                            <div className="pl-color-dots">
                              {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map((c) => (
                                <span key={c} className="pl-color-dot" style={{ backgroundColor: c }} title={c} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="pl-category-col">
                      <span className="pl-category-badge" style={getCategoryStyle(product.category)}>
                        {product.category}
                      </span>
                    </td>
                    <td className="pl-category-col">
                      {product.subcategory ? (
                        <span className="pl-subcategory-badge">{product.subcategory}</span>
                      ) :(
                        <span className="pl-subcategory-none">—</span>
                      )}
                    </td>
                    <td className="pl-price-col">
                      {product.compare_price && parseFloat (product.compare_price) > parseFloat(product.price) && (
                        <span className="pl-price-compare">
                          Rs.{parseFloat(product.compare_price).toLocaleString()}
                        </span>
                      )}
                      <span className="pl-price-final">
                        Rs.{getFinalPrice(product).toLocaleString()}
                      </span>
                    </td>
                    <td className="pl-stock-col">
                      <span className="pl-stock-low">{product.stock} left</span>
                    </td>
                    <td className="pl-status-col">
                      <span className={
                        "pl-status-badge " +
                        (product.status === "Visible" ? "pl-status-visible" :
                          product.status === "Draft" ? "pl-status-draft" : "")
                      }>
                        {product.status}
                      </span>
                    </td>
                    <td className="pl-actions-col">
                      <button className="pl-action-btn" aria-label="Edit" onClick={() => handleEdit(product)}>
                        <img src={editIcon} alt="Edit" className="pl-action-icon" />
                      </button>
                      <button
                        className="pl-action-btn pl-action-btn--delete"
                        aria-label="Delete"
                        onClick={() => requestDelete(product.id)}
                      >
                        <img src={trashIcon} alt="Delete" className="pl-action-icon pl-action-icon--delete" />
                      </button>
                    </td>
                  </tr>

                  {product.has_variants && expandedRows.includes(product.id) && (
                    <tr className="pl-variant-subrow">
                      <td></td>
                      <td colSpan='6'>
                        <table className="pl-variant-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Color</th>
                              <th>Size</th>
                              <th>SKU</th>
                              <th>Price</th>
                              <th>Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map(v => (
                              <tr key={v.variant_id}>
                                <img
                                  src={v.images?.[0] || searchEmpty}
                                  alt={`${product.name} ${v.color || ''} ${v.size || ''}`}
                                  className="pl-variant-img"
                                  onError={(e) => { e.target.src = searchEmpty; }}
                                />
                                <td><span className="pl-color-dot" style={{ backgroundColor: v.color }} /> {v.color}</td>
                                <td>{v.size || '—'}</td>
                                <td>{v.sku}</td>
                                <td>₹{Number(v.price).toLocaleString()}</td>
                                <td>{v.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                 </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pl-pagination">
        <span className="pl-showing">{showingText}</span>
        <div className="pl-page-controls">
          <button
            className="pl-page-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {pageNumbers.map((page, idx) => {
            const prev = pageNumbers[idx - 1];
            return (
              <React.Fragment key={page}>
                {prev && page - prev > 1 && (
                  <span className="pl-page-ellipsis">...</span>
                )}
                <button
                  className={"pl-page-btn" + (currentPage === page ? " pl-page-btn--active" : "")}
                  onClick={() => goToPage(page)}
                  disabled={totalItems === 0}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
          <button
            className="pl-page-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {pendingDeleteId !== null && (
        <div className="pl-confirm-overlay" onClick={() => setPendingDeleteId(null)}>
          <div className="pl-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pl-confirm-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="pl-confirm-text">Are you sure you want to delete this product?</p>
            <div className="pl-confirm-actions">
              <button className="pl-confirm-cancel" onClick={() => setPendingDeleteId(null)}>
                Cancel
              </button>
              <button className="pl-confirm-ok" onClick={confirmDelete}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;