import React, { useState } from "react";
import "./Allcustomers.css";

const ROWS_PER_PAGE = 6;

const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ── Mobile Card ───────────────────────────────────────────────── */
const CustomerCard = ({ customer, selected, onToggle, onViewDetail }) => (
  <div className={`ac__card ${selected ? "ac__card--selected" : ""}`}>
    <div className="ac__card-top">
      <input
        type="checkbox"
        className="ac__checkbox"
        checked={selected}
        onChange={() => onToggle(customer.id)}
      />
      <div className="ac__card-name">{customer.name}</div>
      <span className={`ac__badge ac__badge--${customer.status === "Confirmed" ? "confirmed" : "disabled"}`}>
        {customer.status}
      </span>
    </div>

    <div className="ac__card-body">
      <div className="ac__card-row">
        <span className="ac__card-lbl">Email</span>
        <span className="ac__card-val">{customer.email}</span>
      </div>
      <div className="ac__card-row">
        <span className="ac__card-lbl">Phone</span>
        <span className="ac__card-val">{customer.phone}</span>
      </div>
      <div className="ac__card-row">
        <span className="ac__card-lbl">Orders</span>
        <span className="ac__card-val">{customer.orders}</span>
      </div>
      <div className="ac__card-row">
        <span className="ac__card-lbl">Total Spent</span>
        <span className="ac__card-val">₹{customer.totalSpent.toLocaleString("en-IN")}</span>
      </div>
      <div className="ac__card-row">
        <span className="ac__card-lbl">Joined</span>
        <span className="ac__card-val">{customer.joined}</span>
      </div>
    </div>

    <div className="ac__card-footer">
      <button className="ac__view-btn" onClick={() => onViewDetail && onViewDetail(customer)}>
        View Details
      </button>
    </div>
  </div>
);

/* ── Add Customer Modal ─────────────────────────────────────────── */
const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  orders: "",
  totalSpent: "",
  joined: "",
  status: "Confirmed",
};

const AddCustomerModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = "Name is required";
    if (!form.email.trim())      e.email      = "Email is required";
    if (!form.phone.trim())      e.phone      = "Phone is required";
    if (!form.joined.trim())     e.joined     = "Joined date is required";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd({
      id: Date.now(),
      name:       form.name.trim(),
      email:      form.email.trim(),
      phone:      form.phone.trim(),
      orders:     parseInt(form.orders, 10)     || 0,
      totalSpent: parseFloat(form.totalSpent)   || 0,
      joined:     form.joined.trim(),
      status:     form.status,
    });
    onClose();
  };

  return (
    <div className="ac__modal-overlay" onClick={onClose}>
      <div className="ac__modal" onClick={(e) => e.stopPropagation()}>
        <div className="ac__modal-header">
          <h2 className="ac__modal-title">Add Customer</h2>
          <button className="ac__modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ac__modal-body">
          {/* Row 1: Name + Email */}
          <div className="ac__modal-row">
            <div className="ac__field">
              <label className="ac__field-label">Full Name <span className="ac__required">*</span></label>
              <input
                className={`ac__field-input${errors.name ? " ac__field-input--error" : ""}`}
                placeholder="e.g. Ranganath"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && <span className="ac__field-error">{errors.name}</span>}
            </div>
            <div className="ac__field">
              <label className="ac__field-label">Email <span className="ac__required">*</span></label>
              <input
                className={`ac__field-input${errors.email ? " ac__field-input--error" : ""}`}
                placeholder="e.g. user@gmail.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <span className="ac__field-error">{errors.email}</span>}
            </div>
          </div>

          {/* Row 2: Phone + Joined */}
          <div className="ac__modal-row">
            <div className="ac__field">
              <label className="ac__field-label">Phone <span className="ac__required">*</span></label>
              <input
                className={`ac__field-input${errors.phone ? " ac__field-input--error" : ""}`}
                placeholder="e.g. +91 98400 11111"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              {errors.phone && <span className="ac__field-error">{errors.phone}</span>}
            </div>
            <div className="ac__field">
              <label className="ac__field-label">Joined Date <span className="ac__required">*</span></label>
              <input
                className={`ac__field-input${errors.joined ? " ac__field-input--error" : ""}`}
                placeholder="e.g. 12th May,2026"
                value={form.joined}
                onChange={(e) => handleChange("joined", e.target.value)}
              />
              {errors.joined && <span className="ac__field-error">{errors.joined}</span>}
            </div>
          </div>

          {/* Row 3: Orders + Total Spent */}
          <div className="ac__modal-row">
            <div className="ac__field">
              <label className="ac__field-label">Orders</label>
              <input
                className="ac__field-input"
                type="number"
                min="0"
                placeholder="e.g. 87"
                value={form.orders}
                onChange={(e) => handleChange("orders", e.target.value)}
              />
            </div>
            <div className="ac__field">
              <label className="ac__field-label">Total Spent (₹)</label>
              <input
                className="ac__field-input"
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={form.totalSpent}
                onChange={(e) => handleChange("totalSpent", e.target.value)}
              />
            </div>
          </div>

          {/* Row 4: Status */}
          <div className="ac__modal-row">
            <div className="ac__field">
              <label className="ac__field-label">Status</label>
              <div className="ac__select-wrapper">
                <select
                  className="ac__select ac__field-input"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>

        <div className="ac__modal-footer">
          <button className="ac__cancel-btn" onClick={onClose}>Cancel</button>
          <button className="ac__submit-btn" onClick={handleSubmit}>Add Customer</button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────────── */
const AllCustomers = ({ onViewDetail }) => {
  const [customers, setCustomers]       = useState([]);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter]     = useState("All Customers");
  const [searchQuery, setSearchQuery]   = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [showFilters, setShowFilters]   = useState(false);
  const [showModal, setShowModal]       = useState(false);

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prev) => [...prev, newCustomer]);
  };

  /* Filtering */
  const filtered = customers.filter((c) => {
    const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
    const matchSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  /* Select logic */
  const allChecked = paginated.length > 0 && paginated.every((c) => selectedIds.includes(c.id));
  const toggleAll  = () => setSelectedIds(allChecked
    ? selectedIds.filter((id) => !paginated.find((c) => c.id === id))
    : [...new Set([...selectedIds, ...paginated.map((c) => c.id)])]);
  const toggleOne  = (id) => setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  /* Stats */
  const totalCustomers   = customers.length;
  const newThisMonth     = customers.filter((c) => c.joined.includes("2026")).length;
  const activeAccounts   = customers.filter((c) => c.status === "Confirmed").length;
  const disabledAccounts = customers.filter((c) => c.status === "Disabled").length;
  const avgOrderValue    = totalCustomers > 0
    ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / totalCustomers)
    : 0;

  /* Pagination */
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className="ac">

      {/* ── Header ── */}
      <div className="ac__header">
        <div className="ac__header-left">
          <h1 className="ac__title">All Customers</h1>
          <span className="ac__subtitle">{filtered.length} customers</span>
        </div>
        <div className="ac__header-actions">
          <button className="ac__link-btn">All Orders</button>
          <button className="ac__link-btn">Return Order</button>
          <button className="ac__add-btn" onClick={() => setShowModal(true)}>
            + Add Customer
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ac__stats-row">
        <div className="ac__stat-card">
          <div className="ac__stat-label">Total Customers</div>
          <div className="ac__stat-value">{totalCustomers}</div>
          <div className="ac__stat-sub">All Time</div>
        </div>
        <div className="ac__stat-card">
          <div className="ac__stat-label">New this month</div>
          <div className="ac__stat-value">{newThisMonth}</div>
          <div className="ac__stat-sub">May 2026</div>
        </div>
        <div className="ac__stat-card">
          <div className="ac__stat-label">Active Accounts</div>
          <div className="ac__stat-value">{activeAccounts}</div>
          <div className="ac__stat-sub">Enabled</div>
        </div>
        <div className="ac__stat-card">
          <div className="ac__stat-label">Disabled Accounts</div>
          <div className="ac__stat-value">{disabledAccounts}</div>
          <div className="ac__stat-sub">Restricted</div>
        </div>
        <div className="ac__stat-card">
          <div className="ac__stat-label">Avg. order value</div>
          <div className="ac__stat-value">₹{avgOrderValue.toLocaleString("en-IN")}</div>
          <div className="ac__stat-sub">Per customer</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="ac__toolbar">
        <div className="ac__search-wrapper">
          <SearchIcon />
          <input
            type="text"
            className="ac__search-input"
            placeholder="Search name, email, contact..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <button
          className="ac__filter-toggle"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
          {statusFilter !== "All Status" && <span className="ac__filter-dot" />}
        </button>

        <div className={`ac__filters${showFilters ? " ac__filters--open" : ""}`}>
          <div className="ac__select-wrapper">
            <select className="ac__select" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Disabled</option>
            </select>
            <ChevronDown />
          </div>

          <div className="ac__select-wrapper">
            <select className="ac__select" value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All Customers</option>
              <option>New Customers</option>
              <option>Returning</option>
            </select>
            <ChevronDown />
          </div>

          <div className="ac__select-wrapper">
            <select className="ac__select">
              <option>Filter</option>
              <option>By Amount</option>
              <option>By Orders</option>
            </select>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      {customers.length === 0 && (
        <div className="ac__empty">
          <div className="ac__empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="ac__empty-title">No customers yet</p>
          <p className="ac__empty-sub">Click "Add Customer" to add your first customer.</p>
          <button className="ac__add-btn" onClick={() => setShowModal(true)}>+ Add Customer</button>
        </div>
      )}

      {/* ── Table (tablet +) ── */}
      {customers.length > 0 && (
        <div className="ac__table-wrapper">
          <table className="ac__table">
            <thead>
              <tr>
                <th className="ac__th ac__th--check">
                  <input type="checkbox" className="ac__checkbox" checked={allChecked} onChange={toggleAll} />
                </th>
                <th className="ac__th">Customer</th>
                <th className="ac__th ac__th--hide-sm">Contact</th>
                <th className="ac__th ac__th--center ac__th--hide-md">Orders</th>
                <th className="ac__th ac__th--center ac__th--hide-md">Total Spent</th>
                <th className="ac__th ac__th--center ac__th--hide-lg">Joined</th>
                <th className="ac__th ac__th--center">Status</th>
                <th className="ac__th ac__th--center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((customer) => (
                <tr key={customer.id} className="ac__tr">
                  <td className="ac__td ac__td--check">
                    <input type="checkbox" className="ac__checkbox"
                      checked={selectedIds.includes(customer.id)}
                      onChange={() => toggleOne(customer.id)} />
                  </td>
                  <td className="ac__td ac__td--name">
                    <span className="ac__name-text">{customer.name}</span>
                    <span className="ac__name-email-sm">{customer.email}</span>
                  </td>
                  <td className="ac__td ac__td--contact ac__td--hide-sm">
                    <span>{customer.email}</span>
                    <span>{customer.phone}</span>
                  </td>
                  <td className="ac__td ac__td--center ac__td--hide-md">{customer.orders}</td>
                  <td className="ac__td ac__td--center ac__td--hide-md">₹{customer.totalSpent.toLocaleString("en-IN")}</td>
                  <td className="ac__td ac__td--center ac__td--hide-lg">{customer.joined}</td>
                  <td className="ac__td ac__td--center">
                    <span className={`ac__badge ac__badge--${customer.status === "Confirmed" ? "confirmed" : "disabled"}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="ac__td ac__td--center">
                    <button className="ac__view-btn" onClick={() => onViewDetail && onViewDetail(customer)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile Cards ── */}
      {customers.length > 0 && (
        <div className="ac__cards-wrapper">
          {paginated.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              selected={selectedIds.includes(customer.id)}
              onToggle={toggleOne}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      {customers.length > 0 && (
        <div className="ac__footer">
          <span className="ac__showing">
            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
            <span className="ac__showing-full"> Customers</span>
          </span>
          <div className="ac__pagination">
            <button className="ac__page-btn ac__page-btn--arrow" disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="ac__page-ellipsis">…</span>
              ) : (
                <button key={p}
                  className={`ac__page-btn${currentPage === p ? " ac__page-btn--active" : ""}`}
                  onClick={() => setCurrentPage(p)}>{p}</button>
              )
            )}
            <button className="ac__page-btn ac__page-btn--arrow" disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* ── Add Customer Modal ── */}
      {showModal && (
        <AddCustomerModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddCustomer}
        />
      )}

    </div>
  );
};

export default AllCustomers;