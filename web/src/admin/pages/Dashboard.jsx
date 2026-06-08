import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import "./Dashboard.css";

import profile from "../../assets/admin/Pro.png"
import logo from "../../assets/admin/AnikaLogo.png";
import dashboardIcon from "../../assets/admin/Home.png";
import productIcon from "../../assets/admin/product.png";
import categoryIcon from "../../assets/admin/category.png";
import orderIcon from "../../assets/admin/order.png";
import customerIcon from "../../assets/admin/customer.png";
import discountIcon from "../../assets/admin/discount.png";
import bannerIcon from "../../assets/admin/banner.png";
import analyticsIcon from "../../assets/admin/analytics.png";
import settingsIcon from "../../assets/admin/settings.png";
import searchIcon from "../../assets/admin/search.png";
import dropdownIcon from "../../assets/admin/dropdown.png";

import AddProduct from "./addproduct";
import ProductList from "./productlist";
import AddCategory from "./addcategory";
import CategoryList from "./categorylist";
import AllOrders from "./Allorders";
import OrderDetails from "./Orderdetails";
import AllCustomers from "./Allcustomers";
import CustomerDetails from "./Customerdetails";
import AddBanner from "./Addbanner";
import BannerList from "./Bannerlist";
import Analytics from "./Analytics";
import StoreInfo from "./Storeinfo";
import Policies from "./Policies";
import Contact from "./Contact";
import Shipping from "./Shipping";
import Payment from "./Payment";
import AdminAccount from "./Adminaccount";
import DangerZone from "./Dangerzone";
import Notification from "./Notification";

// ── Icons ───────────────────────────────────────────────────────
const StatIcon = ({ type }) => {
  const icons = {
    orders: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    revenue: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    customers: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    pending: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

const ArrowUp   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const ArrowDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const ChevronDown = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUp   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;

const HamburgerIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );

// ── Menu Config ─────────────────────────────────────────────────
const menuItems = [
  { id: "dashboard", label: "Dashboard", path: "/admin" },
  { id: "category",  label: "Category", path: "/admin/categories", children: [
    { label: "All Categories", path: "/admin/categories" },
    { label: "Add Category", path: "/admin/categories/add" },
  ]},
  { id: "product",   label: "Product", path: "/admin/products", children: [
    { label: "All Products", path: "/admin/products" },
    { label: "Add Product", path: "/admin/products/add" },
  ]},
  { id: "order",     label: "Order", path: "/admin/orders", children: [
    { label: "All Orders", path: "/admin/orders" },
    { label: "Order Details", path: "/admin/orders/detail" },
  ]},
  { id: "customer",  label: "Customer", path: "/admin/customers", children: [
    { label: "All Customers", path: "/admin/customers" },
    { label: "Customer Details", path: "/admin/customers/detail" },
  ]},
  { id: "discount",  label: "Discount", path: "/admin/discount" },
  { id: "banner",    label: "Banner & Content", path: "/admin/banners", children: [
    { label: "All Banners", path: "/admin/banners" },
    { label: "Add Banner", path: "/admin/banners/add" },
  ]},
  { id: "analytics", label: "Analytics", path: "/admin/analytics" },
  { id: "settings",  label: "Settings", path: "/admin/store", children: [
    { label: "Store Info", path: "/admin/store" },
    { label: "Contact", path: "/admin/contact" },
    { label: "Shipping", path: "/admin/shipping" },
    { label: "Payment", path: "/admin/payment" },
    { label: "Admin Account", path: "/admin/account" },
    { label: "Notification", path: "/admin/notification" },
    { label: "Policies", path: "/admin/policies" },
    { label: "Danger Zone", path: "/admin/danger" },
  ]},
];

const sidebarIcons = {
  dashboard: <img src={dashboardIcon} alt="dashboard" className="db__menu-icon-img" />,
  product:   <img src={productIcon}   alt="product"   className="db__menu-icon-img" />,
  category:  <img src={categoryIcon}  alt="category"  className="db__menu-icon-img" />,
  order:     <img src={orderIcon}     alt="order"     className="db__menu-icon-img" />,
  customer:  <img src={customerIcon}  alt="customer"  className="db__menu-icon-img" />,
  discount:  <img src={discountIcon}  alt="discount"  className="db__menu-icon-img" />,
  banner:    <img src={bannerIcon}    alt="banner"    className="db__menu-icon-img" />,
  analytics: <img src={analyticsIcon} alt="analytics" className="db__menu-icon-img" />,
  settings:  <img src={settingsIcon}  alt="settings"  className="db__menu-icon-img" />,
};

const HIDE_ADD_PRODUCT_PATHS = [
  "/admin/categories", "/admin/categories/add", "/admin/products/add",
  "/admin/orders", "/admin/orders/detail", "/admin/customers", "/admin/customers/detail",
  "/admin/banners", "/admin/banners/add", "/admin/analytics",
  "/admin/store", "/admin/contact", "/admin/shipping", "/admin/payment",
  "/admin/account", "/admin/notification", "/admin/policies", "/admin/danger", "/admin/discount"
];

// ── Sub-Components ──────────────────────────────────────────────
const StatCard = ({ icon, label, value, change, changeType, subtext, color }) => (
  <div className="dc__stat-card">
    <div className="dc__stat-icon" style={{ backgroundColor: color + "15", color: color }}>
      <StatIcon type={icon} />
    </div>
    <div className="dc__stat-label">{label}</div>
    <div className="dc__stat-value">{value}</div>
    <div className="dc__stat-change">
      <span className={`dc__change-badge dc__change-badge--${changeType}`}>
        {changeType === "up" ? <ArrowUp /> : changeType === "down" ? <ArrowDown /> : null}
        {change}
      </span>
      <span className="dc__change-text">{subtext}</span>
    </div>
  </div>
);

const RevenueChart = () => {
  const data = [
    { day: "Mo", rev: 40, cust: 20 },
    { day: "TU", rev: 55, cust: 35 },
    { day: "WE", rev: 60, cust: 50 },
    { day: "TH", rev: 45, cust: 40 },
    { day: "FR", rev: 50, cust: 30 },
    { day: "SA", rev: 52, cust: 45 },
    { day: "SU", rev: 58, cust: 55 },
  ];
  const W = 520, H = 180;
  const pad = { t: 20, r: 30, b: 30, l: 50 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const maxV = 70;
  const gx = (i) => pad.l + (i / (data.length - 1)) * cw;
  const gy = (v) => pad.t + ch - (v / maxV) * ch;
  const revPath  = data.map((p, i) => `${i === 0 ? "M" : "L"} ${gx(i)} ${gy(p.rev)}`).join(" ");
  const custPath = data.map((p, i) => `${i === 0 ? "M" : "L"} ${gx(i)} ${gy(p.cust)}`).join(" ");
  return (
    <div className="dc__chart-container">
      <div className="dc__chart-header">
        <div>
          <div className="dc__chart-title">Total customers</div>
          <div className="dc__chart-value">₹16,192</div>
          <div className="dc__chart-sub">
            <span className="dc__change-badge dc__change-badge--up"><ArrowUp /> 37.8%</span>
            <span className="dc__change-text">vs. Yesterday</span>
          </div>
        </div>
        <select className="dc__chart-select"><option>This Week</option><option>This Month</option></select>
      </div>
      <svg width="100%" height="200" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {[0, 20, 40, 60].map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={gy(v)} x2={W - pad.r} y2={gy(v)} stroke="#e5e5e5" strokeDasharray="4 4"/>
            <text x={pad.l - 10} y={gy(v) + 4} textAnchor="end" fontSize="11" fill="#999">{v === 60 ? "₹20K" : v === 40 ? "₹15K" : v === 20 ? "₹10K" : "₹5K"}</text>
            <text x={W - pad.r + 5} y={gy(v) + 4} textAnchor="start" fontSize="11" fill="#999">{v * 2.5}</text>
          </g>
        ))}
        <path d={revPath}  fill="none" stroke="#0ea5e9" strokeWidth="2.5"/>
        <path d={custPath} fill="none" stroke="#d4d4d8" strokeWidth="2" strokeDasharray="4 4"/>
        {data.map((p, i) => <circle key={i} cx={gx(i)} cy={gy(p.rev)} r="4" fill="#0ea5e9"/>)}
        {data.map((p, i) => <text key={i} x={gx(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#999">{p.day}</text>)}
      </svg>
      <div className="dc__chart-legend">
        <span className="dc__legend-item"><span className="dc__legend-line" style={{ backgroundColor: "#0ea5e9" }}></span>Revenue</span>
        <span className="dc__legend-item"><span className="dc__legend-line dc__legend-line--dashed" style={{ backgroundColor: "#d4d4d8" }}></span>Customer</span>
      </div>
    </div>
  );
};

const SalesByCategory = () => {
  const cats = [
    { name: "Necklaces",   value: 1.4, color: "#8b5cf6" },
    { name: "Earrings",    value: 1.1, color: "#65a30d" },
    { name: "Rings",       value: 0.9, color: "#0ea5e9" },
    { name: "Bracelets",   value: 0.5, color: "#ef4444" },
    { name: "Accessories", value: 0.3, color: "#f59e0b" },
  ];
  const max = 1.4;
  return (
    <div className="dc__category-card">
      <div className="dc__card-title">Sales by category</div>
      <div className="dc__category-list">
        {cats.map((c, i) => (
          <div key={i} className="dc__category-item">
            <div className="dc__category-info">
              <span className="dc__category-name">{c.name}</span>
              <span className="dc__category-value">₹{c.value}L</span>
            </div>
            <div className="dc__category-bar-bg">
              <div className="dc__category-bar-fill" style={{ width: `${(c.value / max) * 100}%`, backgroundColor: c.color }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentOrders = () => (
  <div className="dc__table-card dc__empty-card">
    <div className="dc__empty-state">
      <div className="dc__empty-icon-wrapper">
        <img src={searchIcon} alt="Search" className="dc__empty-icon" />
      </div>
      <div className="dc__empty-title">No results found</div>
      <div className="dc__empty-subtitle">No results found. Please try again.</div>
    </div>
  </div>
);

const LowStockAlerts = () => {
  const items = [
    { name: "Gold Jhumka", type: "Earrings", left: 2 },
    { name: "Gold Jhumka", type: "Earrings", left: 2 },
    { name: "Gold Jhumka", type: "Earrings", left: 2 },
    { name: "Gold Jhumka", type: "Earrings", left: 2 },
    { name: "Gold Jhumka", type: "Earrings", left: 2 },
  ];
  return (
    <div className="dc__table-card">
      <div className="dc__card-title">Low stock alerts</div>
      <div className="dc__stock-list">
        {items.map((it, i) => (
          <div key={i} className="dc__stock-item">
            <div className="dc__stock-info">
              <span className="dc__stock-name">{it.name}</span>
              <span className="dc__stock-type">{it.type}</span>
            </div>
            <span className="dc__stock-left">{it.left} left</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopCustomers = () => {
  const customers = [
    { initials: "MN", name: "Meera Nair",     orders: "8 orders", location: "Chennai", amount: "₹6,600", color: "#f59e0b" },
    { initials: "DK", name: "Deepa Krishnan", orders: "8 orders", location: "Chennai", amount: "₹5,707", color: "#0ea5e9" },
    { initials: "RV", name: "Ritu Verma",     orders: "8 orders", location: "Chennai", amount: "₹4,680", color: "#65a30d" },
    { initials: "AR", name: "Anjali Rao",     orders: "8 orders", location: "Chennai", amount: "₹3,600", color: "#ef4444" },
    { initials: "MN", name: "Meera Nair",     orders: "8 orders", location: "Chennai", amount: "₹2,600", color: "#f59e0b" },
  ];
  return (
    <div className="dc__table-card">
      <div className="dc__card-title">Top customers</div>
      <div className="dc__customer-list">
        {customers.map((c, i) => (
          <div key={i} className="dc__customer-item">
            <div className="dc__customer-avatar" style={{ backgroundColor: c.color + "15", color: c.color }}>{c.initials}</div>
            <div className="dc__customer-info">
              <span className="dc__customer-name">{c.name}</span>
              <span className="dc__customer-meta">{c.orders} · {c.location}</span>
            </div>
            <span className="dc__customer-amount">{c.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardHome = () => (
  <div className="dc">
    <div className="dc__page-title-wrapper">
      <h1 className="dc__page-title">Dashboard</h1>
    </div>
    <div className="dc__content">
      <div className="dc__stats-row">
        <StatCard icon="orders"    label="Total orders"         value="1,284" change="37.8%" changeType="up"   subtext="this week"       color="#10b981" />
        <StatCard icon="revenue"   label="Revenue (this month)" value="₹4.2L" change="37.8%" changeType="down" subtext="this week"       color="#0ea5e9" />
        <StatCard icon="customers" label="New customers"        value="138"   change="37.8%" changeType="up"   subtext="this week"       color="#f59e0b" />
        <StatCard icon="pending"   label="Pending orders"       value="24"    change=""       changeType="up"   subtext="Needs attention" color="#ef4444" />
      </div>
      <div className="dc__charts-row">
        <div className="dc__chart-wrapper"><RevenueChart /></div>
        <div className="dc__category-wrapper"><SalesByCategory /></div>
      </div>
      <div className="dc__tables-row">
        <RecentOrders />
        <LowStockAlerts />
        <TopCustomers />
      </div>
    </div>
  </div>
);

const NavbarSearchBar = ({ className = "" }) => (
  <div className={`db__navbar-search ${className}`}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input type="text" placeholder="Search or type a command" className="db__navbar-search-input" />
  </div>
);

// ── Main Dashboard Layout ───────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);

  const currentPath = location.pathname;

  // Auto-expand menu based on current path
  useEffect(() => {
    const expanded = {};
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => currentPath.startsWith(item.path))) {
        expanded[item.id] = true;
      }
    });
    setOpenMenus(expanded);
  }, [currentPath]);

  // ── Fetch categories from Supabase on mount ─────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setCategories(
          data.map((row) => ({
            ...row,
            id: row.category_id,
            categoryImage: row.image_url || null,
            status: row.is_active ? "Active" : "Draft",
          }))
        );
      }
    };
    fetchCategories();
  }, []);

  // Normalize a raw Supabase product row into the shape productlist.jsx expects
  const normalizeProductRow = (row) => ({
    ...row,
    id: row.product_id ?? row.id,
    images: Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : []),
    image: row.image_url || null,
    category: row.categories?.name || row.category || "",
    status: row.is_active ? "Visible" : "Draft",
  });

  // ── Fetch products from Supabase on mount ─────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data.map(normalizeProductRow));
      }
    };
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setSidebarOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = (id) => setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  const isActive = (path) => currentPath === path || currentPath.startsWith(path + "/");

  const showSearchNavbar = ["/admin/categories", "/admin/categories/add", "/admin/products/add", "/admin/orders", "/admin/orders/detail", "/admin/customers", "/admin/customers/detail", "/admin/banners"].some(p => currentPath.startsWith(p));
  const hideAddProduct = HIDE_ADD_PRODUCT_PATHS.includes(currentPath);

  // ── Handlers ──────────────────────────────────────────────────
  const goToAddProduct = () => {
    setEditingProduct(null);
    navigate("/admin/products/add");
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    navigate("/admin/products/add");
  };



  const handleDeleteProduct = async (id) => {
    await supabase.from("products").delete().eq("product_id", id);
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const handlePublish = (data) => {
    const normalized = normalizeProductRow(data);
    setProducts((p) =>
      editingProduct
        ? p.map((x) => x.id === editingProduct.id ? normalized : x)
        : [normalized, ...p]
    );
    setEditingProduct(null);
    navigate("/admin/products");
  };

  const handleSaveDraft = (data) => {
    const normalized = normalizeProductRow(data);
    setProducts((p) =>
      editingProduct
        ? p.map((x) => x.id === editingProduct.id ? normalized : x)
        : [normalized, ...p]
    );
    setEditingProduct(null);
    navigate("/admin/products");
  };

  const goToAddCategory = () => {
    setEditingCategory(null);
    navigate("/admin/categories/add");
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    navigate("/admin/categories/add");
  };

  const handleDeleteCategory = async (id) => {
    const row = categories.find((x) => x.id === id);
    if (row) {
      await supabase.from("categories").delete().eq("category_id", id);
    }
    setCategories((p) => p.filter((x) => x.id !== id));
  };

  const normalizeCategoryRow = (data) => ({
    ...data,
    id: data.category_id ?? data.id,
    categoryImage: data.image_url || null,
    status: data.is_active ? "Active" : "Draft",
  });

  const handlePublishCategory = (data) => {
    const normalized = normalizeCategoryRow(data);
    setCategories((p) =>
      editingCategory
        ? p.map((x) => x.id === editingCategory.id ? normalized : x)
        : [normalized, ...p]
    );
    setEditingCategory(null);
    navigate("/admin/categories");
  };

  const handleSaveDraftCategory = (data) => {
    const normalized = normalizeCategoryRow(data);
    setCategories((p) =>
      editingCategory
        ? p.map((x) => x.id === editingCategory.id ? normalized : x)
        : [normalized, ...p]
    );
    setEditingCategory(null);
    navigate("/admin/categories");
  };

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    navigate("/admin/orders/detail");
  };

  const handleViewCustomerDetail = (customer) => {
    setSelectedCustomer(customer);
    navigate("/admin/customers/detail");
  };

  const goToAddBanner = () => {
    setEditingBanner(null);
    navigate("/admin/banners/add");
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    navigate("/admin/banners/add");
  };

  const handleDeleteBanner = (id) => setBanners((p) => p.filter((x) => x.id !== id));

  const handlePublishBanner = (data) => {
    if (editingBanner) {
      setBanners((p) => p.map((x) => x.id === editingBanner.id ? { ...data, id: editingBanner.id } : x));
    } else {
      setBanners((p) => [{ ...data, id: Date.now(), uploadedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), dimensions: "1200×400px", status: data.isActive ? "Active" : "Inactive" }, ...p]);
    }
    setEditingBanner(null);
    navigate("/admin/banners");
  };

  return (
    <div className="db">
      {/* Navbar */}
      <nav className="db__navbar">
        <button className="db__hamburger" aria-label={sidebarOpen ? "Close menu" : "Open menu"} onClick={() => setSidebarOpen((v) => !v)}>
          <HamburgerIcon open={sidebarOpen} />
        </button>
        <div className="db__navbar-logo">
          <img src={logo} alt="Anika" className="db__logo-img" />
        </div>
        <NavbarSearchBar className={showSearchNavbar ? "db__navbar-search--force-show" : ""} />
        <div className="db__navbar-actions">
          {!hideAddProduct && (
            <button className="db__add-btn" onClick={goToAddProduct}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add product</span>
            </button>
          )}
          <button className="db__icon-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <Link to="/profile">
            <button className="db__avatar-btn" aria-label="Profile">
              <img src={profile} alt="Avatar" className="db__avatar-img" />
            </button>
          </Link>
        </div>
      </nav>

      <div className="db__body">
        <div className={`db__sidebar-overlay${sidebarOpen ? " db__sidebar-overlay--visible" : ""}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

        {/* Sidebar */}
        <aside className={`db__sidebar${sidebarOpen ? " db__sidebar--open" : ""}`}>
          <nav className="db__sidenav">
            {menuItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.id];
              const active = isActive(item.path);

              return (
                <div key={item.id} className="db__menu-group">
                  <button
                    className={`db__menu-item${active ? " db__menu-item--active" : ""}`}
                    onClick={() => {
                      if (hasChildren) {
                        toggle(item.id);
                        navigate(item.children[0].path);
                      } else {
                        navigate(item.path);
                      }
                    }}
                  >
                    <span className="db__menu-icon">{sidebarIcons[item.id]}</span>
                    <span className="db__menu-label">{item.label}</span>
                    {hasChildren && <span className="db__chevron">{isOpen ? <ChevronUp /> : <ChevronDown />}</span>}
                  </button>

                  {hasChildren && isOpen && (
                    <div className="db__submenu">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`db__sub-item${currentPath === child.path ? " db__sub-item--active" : ""}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <img src={dropdownIcon} alt="" className="db__sub-item-icon" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - React Router Routes */}
        <main className="db__main">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* Products */}
            <Route path="/products" element={<ProductList products={products} onAddProduct={goToAddProduct} onEditProduct={handleEditProduct} onDeleteProduct={handleDeleteProduct} />} />
            <Route path="/products/add" element={<AddProduct initialData={editingProduct} onBack={() => { setEditingProduct(null); navigate("/admin/products"); }} onPublish={handlePublish} onSaveDraft={handleSaveDraft} />} />

            {/* Categories */}
            <Route path="/categories" element={<CategoryList categories={categories} onAddCategory={goToAddCategory} onEditCategory={handleEditCategory} onDeleteCategory={handleDeleteCategory} />} />
            <Route path="/categories/add" element={<AddCategory initialData={editingCategory} onBack={() => { setEditingCategory(null); navigate("/admin/categories"); }} onPublish={handlePublishCategory} onSaveDraft={handleSaveDraftCategory} />} />

            {/* Orders */}
            <Route path="/orders" element={<AllOrders onViewDetail={handleViewOrderDetail} />} />
            <Route path="/orders/detail" element={<OrderDetails order={selectedOrder} onBack={() => navigate("/admin/orders")} />} />

            {/* Customers */}
            <Route path="/customers" element={<AllCustomers onViewDetail={handleViewCustomerDetail} />} />
            <Route path="/customers/detail" element={<CustomerDetails customer={selectedCustomer} onBack={() => navigate("/admin/customers")} />} />

            {/* Banners */}
            <Route path="/banners" element={<BannerList banners={banners} onAddBanner={goToAddBanner} onEditBanner={handleEditBanner} onDeleteBanner={handleDeleteBanner} />} />
            <Route path="/banners/add" element={<AddBanner initialData={editingBanner} onBack={() => navigate("/admin/banners")} onPublish={handlePublishBanner} />} />

            {/* Settings */}
            <Route path="/store" element={<StoreInfo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/account" element={<AdminAccount />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/danger" element={<DangerZone />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;