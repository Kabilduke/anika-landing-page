import React, { useState, useEffect, useCallback } from "react";
import "./Allorders.css";

const STATUS_STYLE = {
  Pending:   { bg: "#FFF4E5", color: "#D97706" },
  Shipped:   { bg: "#EFF6FF", color: "#2563EB" },
  Delivered: { bg: "#F0FDF4", color: "#16A34A" },
  Confirmed: { bg: "#F5F3FF", color: "#7C3AED" },
  Return:    { bg: "#FEF2F2", color: "#DC2626" },
};

const PAYMENT_STYLE = {
  Paid: { bg: "#F0FDF4", color: "#16A34A" },
  COD:  { bg: "#FFF4E5", color: "#D97706" },
};

const CATEGORIES = ["All Category", "Necklaces", "Earrings", "Rings", "Bracelets"];
const STATUSES   = ["All Status",   "Pending", "Confirmed", "Shipped", "Delivered", "Return"];
const TYPES      = ["All Types",    "Regular", "Return"];
const PER_PAGE   = 6;

/* ── Icons ── */
const ChevronDownIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EmptyBoxIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
    </path>
  </svg>
);

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr className="ao__skeleton-row">
    <td><div className="ao__skeleton" style={{ width: 14, height: 14, borderRadius: 3 }} /></td>
    <td><div className="ao__skeleton" style={{ width: 90 }} /></td>
    <td><div className="ao__skeleton" style={{ width: 110 }} /></td>
    <td className="ao__col-items"><div className="ao__skeleton" style={{ width: 24 }} /></td>
    <td><div className="ao__skeleton" style={{ width: 60 }} /></td>
    <td className="ao__col-payment"><div className="ao__skeleton" style={{ width: 48, borderRadius: 20 }} /></td>
    <td><div className="ao__skeleton" style={{ width: 70, borderRadius: 20 }} /></td>
    <td><div className="ao__skeleton" style={{ width: 48, borderRadius: 6 }} /></td>
  </tr>
);

/* ── Dropdown ── */
const FilterDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="ao__dd" tabIndex={0} onBlur={() => setTimeout(() => setOpen(false), 120)}>
      <button className="ao__dd-btn" onClick={() => setOpen((o) => !o)}>
        <span>{value}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="ao__dd-menu">
          {options.map((opt) => (
            <div
              key={opt}
              className={`ao__dd-item${value === opt ? " ao__dd-item--active" : ""}`}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ── */
const AllOrders = ({ onViewDetail, fetchOrders }) => {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [category, setCategory] = useState("All Category");
  const [status,   setStatus]   = useState("All Status");
  const [type,     setType]     = useState("All Types");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState([]);
  const [page,     setPage]     = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  /* ── Load data ── */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof fetchOrders === "function") {
        const data = await fetchOrders();
        setOrders(data || []);
      } else {
        /* No fetch function provided — stay empty */
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  /* ── Expose addOrders for imperative use ── */
  const addOrders = useCallback((newOrders) => {
    setOrders((prev) => {
      const map = new Map(prev.map((o) => [o.id, o]));
      newOrders.forEach((o) => map.set(o.id, o));
      return Array.from(map.values());
    });
    setLoading(false);
  }, []);

  /* Attach to window so backend can call window.ordersAPI.addOrders([...]) */
  useEffect(() => {
    window.ordersAPI = { addOrders, reload: loadOrders };
    return () => { delete window.ordersAPI; };
  }, [addOrders, loadOrders]);

  /* ── Derived lists ── */
  const displayOrders = activeTab === "return"
    ? orders.filter((o) => o.type === "Return")
    : orders;

  const filtered = displayOrders.filter((o) => {
    const matchStatus = status === "All Status" || o.status === status;
    const matchType   = type   === "All Types"  || o.type   === type;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const count = (s) => orders.filter((o) => o.status === s).length;

  /* ── Selection ── */
  const toggleRow = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const allChecked = paginated.length > 0 && paginated.every((o) => selected.includes(o.id));

  const toggleAll = () =>
    setSelected(allChecked
      ? selected.filter((id) => !paginated.find((o) => o.id === id))
      : [...new Set([...selected, ...paginated.map((o) => o.id)])]);

  /* ── Pagination numbers ── */
  const pageNums = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const p = safePage;
    if (p <= 3)              return [1, 2, 3, "…", totalPages];
    if (p >= totalPages - 2) return [1, "…", totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", p, "…", totalPages];
  };

  /* ── Render helpers ── */
  const renderBody = () => {
    if (loading) {
      return Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonRow key={i} />);
    }

    if (error) {
      return (
        <tr>
          <td colSpan={8} className="ao__empty">
            <div className="ao__empty-state">
              <div className="ao__empty-icon ao__empty-icon--error">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="ao__empty-title">Something went wrong</p>
              <p className="ao__empty-desc">{error}</p>
              <button className="ao__retry-btn" onClick={loadOrders}>Try again</button>
            </div>
          </td>
        </tr>
      );
    }

    if (orders.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="ao__empty">
            <div className="ao__empty-state">
              <div className="ao__empty-icon">
                <EmptyBoxIcon />
              </div>
              <p className="ao__empty-title">No orders yet</p>
              <p className="ao__empty-desc">
                Orders from your customers will appear here once they start coming in.
              </p>
            </div>
          </td>
        </tr>
      );
    }

    if (paginated.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="ao__empty">
            <div className="ao__empty-state ao__empty-state--sm">
              <p className="ao__empty-title">No orders match your filters</p>
              <p className="ao__empty-desc">Try adjusting your search or filter criteria.</p>
            </div>
          </td>
        </tr>
      );
    }

    return paginated.map((order) => {
      const ss  = STATUS_STYLE[order.status]   || {};
      const ps  = PAYMENT_STYLE[order.payment] || {};
      const sel = selected.includes(order.id);
      return (
        <tr key={order.id} className={`ao__row${sel ? " ao__row--selected" : ""}`}>
          <td className="ao__td-check">
            <input
              type="checkbox"
              className="ao__checkbox"
              checked={sel}
              onChange={() => toggleRow(order.id)}
            />
          </td>
          <td className="ao__cell-id">{order.id}</td>
          <td className="ao__cell-customer">{order.customer}</td>
          <td className="ao__cell-items ao__col-items">{order.items}</td>
          <td className="ao__cell-total">{order.total}</td>
          <td className="ao__col-payment">
            <span className="ao__badge" style={{ background: ps.bg, color: ps.color }}>
              {order.payment}
            </span>
          </td>
          <td>
            <span className="ao__badge" style={{ background: ss.bg, color: ss.color }}>
              {order.status}
            </span>
          </td>
          <td>
            <button className="ao__view-btn" onClick={() => onViewDetail?.(order)}>
              View
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="ao">

      {/* ── Page header ── */}
      <div className="ao__page-header">
        <div className="ao__page-title-block">
          <h1 className="ao__title">All Orders</h1>
          <p className="ao__subtitle">
            {loading ? "Loading…" : `${filtered.length} Orders`}
          </p>
        </div>
        <div className="ao__header-tabs">
          <button
            className={`ao__tab${activeTab === "all" ? " ao__tab--active" : ""}`}
            onClick={() => { setActiveTab("all"); setPage(1); }}
          >
            All Orders
          </button>
          <button
            className={`ao__tab${activeTab === "return" ? " ao__tab--active" : ""}`}
            onClick={() => { setActiveTab("return"); setPage(1); }}
          >
            Return Order
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="ao__stats">
        {[
          { label: "All Orders", value: loading ? "—" : orders.length.toLocaleString() },
          { label: "Pending",    value: loading ? "—" : count("Pending") },
          { label: "Confirmed",  value: loading ? "—" : count("Confirmed") },
          { label: "Shipped",    value: loading ? "—" : count("Shipped") },
          { label: "Delivered",  value: loading ? "—" : count("Delivered") },
          { label: "Returns",    value: loading ? "—" : count("Return") },
        ].map(({ label, value }) => (
          <div key={label} className="ao__stat">
            <span className="ao__stat-label">{label}</span>
            <span className={`ao__stat-value${loading ? " ao__stat-value--loading" : ""}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="ao__toolbar">
        <FilterDropdown value={category} options={CATEGORIES} onChange={(v) => { setCategory(v); setPage(1); }} />
        <FilterDropdown value={status}   options={STATUSES}   onChange={(v) => { setStatus(v);   setPage(1); }} />
        <FilterDropdown value={type}     options={TYPES}      onChange={(v) => { setType(v);     setPage(1); }} />
        <button className="ao__filter-btn">
          <FilterIcon />
          Filter
        </button>
        <div className="ao__search">
          <SearchIcon />
          <input
            className="ao__search-input"
            placeholder="Search orders"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="ao__table-wrap">
        <table className="ao__table">
          <thead>
            <tr>
              <th className="ao__th-check">
                <input
                  type="checkbox"
                  className="ao__checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  disabled={loading || paginated.length === 0}
                />
              </th>
              <th>Order ID</th>
              <th>Customer</th>
              <th className="ao__col-items">Items</th>
              <th>Total</th>
              <th className="ao__col-payment">Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="ao__footer">
        <span className="ao__showing">
          {loading
            ? <span className="ao__loading-text"><SpinnerIcon /> Loading orders…</span>
            : filtered.length === 0
              ? "No orders to show"
              : `Showing ${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filtered.length)} of ${filtered.length} orders`
          }
        </span>
        {!loading && filtered.length > 0 && (
          <div className="ao__pagination">
            <button
              className="ao__pg-arrow"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon />
            </button>
            {pageNums().map((n, i) =>
              n === "…" ? (
                <span key={`e${i}`} className="ao__pg-ellipsis">…</span>
              ) : (
                <button
                  key={n}
                  className={`ao__pg-num${safePage === n ? " ao__pg-num--active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              )
            )}
            <button
              className="ao__pg-arrow"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AllOrders;