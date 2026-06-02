import React, { useState } from "react";
import "./productlist.css";
import searchEmpty from "../assets/search.png";
import editIcon    from "../assets/Edit.png";
import trashIcon   from "../assets/Trash.png";

const getCategoryStyle = (category) => {
  const styles = {
    Electronics: { background: "#e0f2fe", color: "#0369a1" },
    Clothing:    { background: "#fce7f3", color: "#be185d" },
    Home:        { background: "#dcfce7", color: "#15803d" },
    Sports:      { background: "#fff7ed", color: "#c2410c" },
    Rings:       { background: "#f0e6ff", color: "#7c3aed" },
    Earrings:    { background: "#fce7f3", color: "#be185d" },
    Necklaces:   { background: "#fff7ed", color: "#c2410c" },
    Bracelets:   { background: "#e0f2fe", color: "#0369a1" },
  };
  return styles[category] || { background: "#f0e6ff", color: "#7c3aed" };
};

/* ── Mobile card view for very small screens ── */
const MobileProductCard = ({ product, onEdit, onDelete, selectedRows, toggleSelectRow }) => {
  const isChecked = selectedRows.includes(product.id);
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
        <span className="pl-stock-low">{product.stock} left</span>
        <span className={`pl-status-badge ${product.status === "Visible" ? "pl-status-visible" : product.status === "Draft" ? "pl-status-draft" : ""}`}>{product.status}</span>
        <span className="pl-mobile-card__price">{"Rs." + parseFloat(product.price || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

const ProductList = ({ onAddProduct, onEditProduct, onDeleteProduct, products = [], onBack }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage]   = useState(1);
  const [searchInput, setSearchInput]   = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const itemsPerPage = 8;

  // Detect mobile card breakpoint
  const [isMobileCard, setIsMobileCard] = useState(window.innerWidth <= 540);
  React.useEffect(() => {
    const handler = () => setIsMobileCard(window.innerWidth <= 540);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Search filter
  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
        );
      })
    : products;

  const totalItems      = filteredProducts.length;
  const totalPages      = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex      = (currentPage - 1) * itemsPerPage;
  const endIndex        = startIndex + itemsPerPage;
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

  const handleDelete = (id) => {
    if (onDeleteProduct) onDeleteProduct(id);
    const newTotal      = filteredProducts.length - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / itemsPerPage));
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
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
          <div className="pl-dropdown">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>All categories</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div className="pl-dropdown">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>All Status</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div className="pl-dropdown">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span>All Stock</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
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
                onDelete={handleDelete}
                selectedRows={selectedRows}
                toggleSelectRow={toggleSelectRow}
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
                <th className="pl-price-col">PRICE</th>
                <th className="pl-stock-col">STOCK</th>
                <th className="pl-status-col">STATUS</th>
                <th className="pl-actions-col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
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
                          <span className="pl-product-name">{product.name}</span>
                          <span className="pl-product-sku">SKU: {product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="pl-category-col">
                      <span className="pl-category-badge" style={getCategoryStyle(product.category)}>
                        {product.category}
                      </span>
                    </td>
                    <td className="pl-price-col">
                      {"Rs." + parseFloat(product.price || 0).toLocaleString()}
                    </td>
                    <td className="pl-stock-col">
                      <span className="pl-stock-low">{product.stock} left</span>
                    </td>
                    <td className="pl-status-col">
                      <span className={
                        "pl-status-badge " +
                        (product.status === "Visible" ? "pl-status-visible" :
                         product.status === "Draft"   ? "pl-status-draft"   : "")
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
                        onClick={() => handleDelete(product.id)}
                      >
                        <img src={trashIcon} alt="Delete" className="pl-action-icon pl-action-icon--delete" />
                      </button>
                    </td>
                  </tr>
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

    </div>
  );
};

export default ProductList;