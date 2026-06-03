import React, { useState } from "react";
import "./Analytics.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);
const ArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ── Donut Chart ────────────────────────────────────────────────────────────
const DonutChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const cx = 80, cy = 80, r = 60;
  const circumference = 2 * Math.PI * r;

  const slices = data.map((d) => {
    const pct      = d.value / total;
    const offset   = circumference * (1 - pct);
    const rotation = cumulative * 360;
    cumulative += pct;
    return { ...d, offset, rotation };
  });

  const centerTotal = `₹${total.toFixed(1)}L`;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth="22"/>
      {slices.map((s, i) => (
        <circle
          key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth="22"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={s.offset}
          transform={`rotate(${s.rotation - 90} ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      ))}
      <circle cx={cx} cy={cy} r={40} fill="white"/>
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fill="#888" fontFamily="Inter, sans-serif" fontWeight="500">Total Revenue</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="13" fill="#1c1c1e" fontFamily="Inter, sans-serif" fontWeight="700">{centerTotal}</text>
    </svg>
  );
};

// ── Horizontal Bar Chart (Overview) ───────────────────────────────────────
const HorizontalBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="an__bar-chart">
      {data.map((d, i) => (
        <div key={i} className="an__bar-row">
          <span className="an__bar-label">{d.label}</span>
          <div className="an__bar-track">
            <div className="an__bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
          <span className="an__bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Orders Bar Chart ───────────────────────────────────────────────────────
const OrdersBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="an__bar-chart">
      {data.map((d, i) => (
        <div key={i} className="an__bar-row">
          <span className="an__bar-label an__bar-label--wide">{d.label}</span>
          <div className="an__bar-track">
            <div className="an__bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
          <span className="an__bar-value">{d.value.toLocaleString()}</span>
          {d.pct !== undefined && <span className="an__bar-pct">{d.pct}%</span>}
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, change, changeType, subtext }) => (
  <div className="an__stat-card">
    <div className="an__stat-label">{label}</div>
    <div className="an__stat-value">{value}</div>
    <div className="an__stat-footer">
      {change && (
        <span className={`an__badge an__badge--${changeType}`}>
          {changeType === "up"   ? <ArrowUp />   : null}
          {changeType === "down" ? <ArrowDown /> : null}
          {changeType === "warn" ? "↑" : null}
          {change}
        </span>
      )}
      {subtext && <span className="an__stat-subtext">{subtext}</span>}
    </div>
  </div>
);

// ── Date Input ─────────────────────────────────────────────────────────────
const DateInput = ({ label, value, onChange }) => {
  return (
    <div className="an__date-field">
      <label className="an__date-label">{label}</label>
      <div className="an__date-input" style={{ cursor: "default" }}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Input your text"
          className="an__date-native"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "13.5px",
            color: value ? "#333" : "#bbb",
            background: "transparent",
            fontFamily: "inherit",
            cursor: "pointer",
            minWidth: 0,
          }}
        />
        <CalendarIcon />
      </div>
    </div>
  );
};

// ── Sparkline Chart (pure SVG, no dependencies) ────────────────────────────
const Sparkline = () => {
  const W = 420, H = 210;
  const padL = 44, padR = 38, padT = 12, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const labels       = ["Mo", "TU", "WE", "TH", "FR", "SA", "SU"];
  const revenueData  = [5000, 8500,  11000, 13500, 14500, 5000, 9000];
  const customerData = [8,    120,   100,   50,    100,   140,  0   ];

  const revMin = 0, revMax = 20000;
  const cusMin = 0, cusMax = 150;

  const xOf  = (i) => padL + (i / (labels.length - 1)) * chartW;
  const yRev = (v) => padT + chartH - ((v - revMin) / (revMax - revMin)) * chartH;
  const yCus = (v) => padT + chartH - ((v - cusMin) / (cusMax - cusMin)) * chartH;

  const smoothPath = (pts) => {
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cpX = (pts[i][0] + pts[i + 1][0]) / 2;
      d += ` C ${cpX},${pts[i][1]} ${cpX},${pts[i + 1][1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
    }
    return d;
  };

  const revPts = revenueData.map((v, i)  => [xOf(i), yRev(v)]);
  const cusPts = customerData.map((v, i) => [xOf(i), yCus(v)]);

  const revLine = smoothPath(revPts);
  const cusLine = smoothPath(cusPts);
  const revArea = `${revLine} L ${revPts[revPts.length - 1][0]},${padT + chartH} L ${revPts[0][0]},${padT + chartH} Z`;

  const revTicks = [0, 5000, 10000, 15000, 20000];
  const cusTicks = [0, 30, 60, 150];

  const peakIdx = 3;

  return (
    <div className="an__sparkline-wrapper">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
          </linearGradient>
          <clipPath id="chartClip">
            <rect x={padL} y={padT} width={chartW} height={chartH} />
          </clipPath>
        </defs>
        {revTicks.map((v) => (
          <line key={v} x1={padL} y1={yRev(v)} x2={padL + chartW} y2={yRev(v)} stroke="#e8e8e8" strokeWidth="0.5" />
        ))}
        <path d={revArea} fill="url(#revGrad)" clipPath="url(#chartClip)" />
        <path d={cusLine} fill="none" stroke="#c9a800" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" clipPath="url(#chartClip)" />
        <path d={revLine} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" clipPath="url(#chartClip)" />
        <circle cx={revPts[peakIdx][0]} cy={revPts[peakIdx][1]} r="4" fill="#06b6d4" />
        {revTicks.map((v) => (
          <text key={v} x={padL - 5} y={yRev(v) + 4} textAnchor="end" fontSize="9.5" fill="#aaa" fontFamily="Inter, sans-serif">
            {v === 0 ? "₹0" : `₹${v / 1000}K`}
          </text>
        ))}
        {cusTicks.map((v) => (
          <text key={v} x={padL + chartW + 5} y={yCus(v) + 4} textAnchor="start" fontSize="9.5" fill="#aaa" fontFamily="Inter, sans-serif">
            {v}
          </text>
        ))}
        {labels.map((lbl, i) => (
          <text key={i} x={xOf(i)} y={padT + chartH + 18} textAnchor="middle" fontSize="10.5" fill="#aaa" fontFamily="Inter, sans-serif">
            {lbl}
          </text>
        ))}
      </svg>
      <div className="an__sparkline-legend" style={{ justifyContent: "flex-end" }}>
        <span className="an__sparkline-legend-item">
          <svg width="22" height="8" style={{ display: "inline-block", verticalAlign: "middle" }}>
            <line x1="0" y1="4" x2="22" y2="4" stroke="#06b6d4" strokeWidth="2.5" />
          </svg>
          <span style={{ marginLeft: 4 }}>Revenue</span>
        </span>
        <span className="an__sparkline-legend-item">
          <svg width="22" height="8" style={{ display: "inline-block", verticalAlign: "middle" }}>
            <line x1="0" y1="4" x2="22" y2="4" stroke="#c9a800" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
          </svg>
          <span style={{ marginLeft: 4 }}>Customer</span>
        </span>
      </div>
    </div>
  );
};

// ── Orders Tab Data ────────────────────────────────────────────────────────
const FUNNEL_DATA = [
  { label: "Store visits",  value: 4875, color: "#22c55e", pct: 100 },
  { label: "Produc Visits", value: 3510, color: "#06b6d4", pct: 100 },
  { label: "Add to Cart",   value: 1365, color: "#a855f7", pct: 100 },
  { label: "Checkout",      value: 585,  color: "#eab308", pct: 100 },
  { label: "Ordered",       value: 156,  color: "#ef4444", pct: 100 },
];

const DAY_DATA = [
  { label: "Monday",    value: 4875, color: "#22c55e" },
  { label: "Tuesday",   value: 3510, color: "#06b6d4" },
  { label: "Wednesday", value: 1365, color: "#a855f7" },
  { label: "Thursday",  value: 585,  color: "#eab308" },
  { label: "Friday",    value: 156,  color: "#ef4444" },
  { label: "Saturday",  value: 156,  color: "#6366f1" },
  { label: "Sunday",    value: 156,  color: "#f97316" },
];

const TIME_DATA = [
  { label: "6am - 9am",  value: 80, color: "#22c55e" },
  { label: "9am - 12pm", value: 25, color: "#06b6d4" },
  { label: "12pm - 3pm", value: 20, color: "#a855f7" },
  { label: "3pm - 6pm",  value: 40, color: "#eab308" },
  { label: "6pm - 9pm",  value: 50, color: "#ef4444" },
  { label: "9pm - 12pm", value: 30, color: "#6366f1" },
  { label: "12am - 6am", value: 20, color: "#f97316" },
];

// ── Orders Tab ─────────────────────────────────────────────────────────────
const OrdersTab = () => (
  <div className="an__orders">
    <div className="an__orders-stats">
      <div className="an__orders-stat-card">
        <div className="an__orders-stat-label">Total Order</div>
        <div className="an__orders-stat-value">156</div>
        <div className="an__orders-stat-footer">
          <span className="an__badge an__badge--up"><ArrowUp />37.8%</span>
          <span className="an__stat-subtext">this week</span>
        </div>
      </div>
      <div className="an__orders-stat-card">
        <div className="an__orders-stat-label">Completed</div>
        <div className="an__orders-stat-value">88</div>
        <div className="an__orders-stat-footer">
          <span className="an__stat-subtext">84.8% Completion</span>
        </div>
      </div>
      <div className="an__orders-stat-card">
        <div className="an__orders-stat-label">Pending</div>
        <div className="an__orders-stat-value">21</div>
        <div className="an__orders-stat-footer">
          <span className="an__badge an__badge--action">Needs Action</span>
        </div>
      </div>
      <div className="an__orders-stat-card">
        <div className="an__orders-stat-label">Cancelled</div>
        <div className="an__orders-stat-value">8</div>
        <div className="an__orders-stat-footer">
          <span className="an__badge an__badge--action">5.1% Cancel rate</span>
        </div>
      </div>
    </div>

    <div className="an__orders-stats an__orders-stats--half">
      <div className="an__orders-stat-card">
        <div className="an__orders-stat-label">Returns</div>
        <div className="an__orders-stat-value">117</div>
        <div className="an__orders-stat-footer">
          <span className="an__stat-subtext">3.8% Return Rate</span>
        </div>
      </div>
      <div className="an__orders-stat-card">
        <div className="an__orders-stat-label">Avg. fulfilment</div>
        <div className="an__orders-stat-value">3.2%</div>
        <div className="an__orders-stat-footer">
          <span className="an__badge an__badge--down"><ArrowDown />0.3d Faster</span>
        </div>
      </div>
    </div>

    <div className="an__orders-charts-row">
      <div className="an__chart-card an__chart-card--review">
        <div className="an__review-header">
          <div>
            <div className="an__review-title" style={{ fontSize: "20px", fontWeight: "700", color: "#1c1c1e", marginBottom: "10px" }}>Overall Review</div>
            <div className="an__review-value" style={{ fontSize: "34px", fontWeight: "700", letterSpacing: "-0.02em", color: "#1c1c1e", margin: "0 0 6px" }}>₹16,192</div>
            <div className="an__review-sub">
              <span className="an__badge an__badge--up"><ArrowUp />37.8%</span>
              <span className="an__stat-subtext">vs. Yesterday</span>
            </div>
          </div>
          <div className="an__review-period" style={{ fontSize: "14px", padding: "6px 14px", borderRadius: "8px" }}>
            <span>This Week</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <Sparkline />
      </div>

      <div className="an__chart-card">
        <div className="an__chart-card-title">Avg. order value</div>
        <OrdersBarChart data={FUNNEL_DATA} />
      </div>
    </div>

    <div className="an__chart-card an__chart-card--bottom">
      <div className="an__bottom-section-title">Top Order Days &amp; Peak Hours</div>
      <div className="an__bottom-charts-row">
        <div className="an__bottom-chart">
          <div className="an__bottom-chart-label">Orders by Day of Week</div>
          <OrdersBarChart data={DAY_DATA} />
        </div>
        <div className="an__bottom-chart-divider" />
        <div className="an__bottom-chart">
          <div className="an__bottom-chart-label">Orders by time of day</div>
          <OrdersBarChart data={TIME_DATA} />
        </div>
      </div>
    </div>
  </div>
);

// ── Customers Tab Data ─────────────────────────────────────────────────────
const CUSTOMER_SEGMENT_DATA = [
  { label: "VIP (5+ orders)", value: 4875, color: "#22c55e" },
  { label: "Regular (2–4)",   value: 3510, color: "#06b6d4" },
  { label: "One-time (1)",    value: 1365, color: "#a855f7" },
  { label: "No orders yet",   value: 585,  color: "#eab308" },
  { label: "Ordered",         value: 156,  color: "#ef4444" },
];

const CUSTOMER_FUNNEL_DATA = [
  { label: "Store visits",  value: 4875, color: "#22c55e" },
  { label: "Produc Visits", value: 3510, color: "#06b6d4" },
  { label: "Add to Cart",   value: 1365, color: "#a855f7" },
  { label: "Checkout",      value: 585,  color: "#eab308" },
  { label: "Ordered",       value: 156,  color: "#ef4444" },
];

const TOP_CUSTOMERS = [
  { name: "Priya Sharma", orders: 8, city: "Chennai", amount: "₹28,400" },
  { name: "Priya Sharma", orders: 8, city: "Chennai", amount: "₹28,400" },
  { name: "Priya Sharma", orders: 8, city: "Chennai", amount: "₹28,400" },
  { name: "Priya Sharma", orders: 8, city: "Chennai", amount: "₹28,400" },
  { name: "Priya Sharma", orders: 8, city: "Chennai", amount: "₹28,400" },
];

const CUSTOMER_DONUT_DATA = [
  { label: "Necklaces", value: 1.4, color: "#f87171" },
  { label: "Earings",   value: 1.4, color: "#3b82f6" },
];

// ── Customers Tab ──────────────────────────────────────────────────────────
const CustomersTab = () => {
  const customerDonutTotal = CUSTOMER_DONUT_DATA.reduce((s, d) => s + d.value, 0);
  return (
    <div className="an__customers">
      <div className="an__stats-grid">
        <div className="an__stat-card">
          <div className="an__stat-label">Total customers</div>
          <div className="an__stat-value">156</div>
          <div className="an__stat-footer">
            <span className="an__badge an__badge--up"><ArrowUp />21 this month</span>
          </div>
        </div>
        <div className="an__stat-card">
          <div className="an__stat-label">New customers</div>
          <div className="an__stat-value">88</div>
          <div className="an__stat-footer">
            <span className="an__badge an__badge--up"><ArrowUp />21% vs April</span>
          </div>
        </div>
        <div className="an__stat-card">
          <div className="an__stat-label">Returning</div>
          <div className="an__stat-value">21</div>
          <div className="an__stat-footer">
            <span className="an__stat-subtext--green">84.8% retention</span>
          </div>
        </div>
        <div className="an__stat-card">
          <div className="an__stat-label">VIP customers</div>
          <div className="an__stat-value">8</div>
          <div className="an__stat-footer">
            <span className="an__stat-subtext">5+ Orders Each</span>
          </div>
        </div>
      </div>

      <div className="an__stats-grid">
        <div className="an__stat-card">
          <div className="an__stat-label">Avg. LTV</div>
          <div className="an__stat-value">₹6,840</div>
          <div className="an__stat-footer">
            <span className="an__badge an__badge--up"><ArrowUp />9% vs April</span>
          </div>
        </div>
        <div className="an__stat-card">
          <div className="an__stat-label">Churn rate</div>
          <div className="an__stat-value">4.2%</div>
          <div className="an__stat-footer">
            <span className="an__badge an__badge--up"><ArrowUp />0.6% vs April</span>
          </div>
        </div>
      </div>

      <div className="an__charts-row">
        <div className="an__chart-card">
          <div className="an__chart-card-title">Avg. order value</div>
          <OrdersBarChart data={CUSTOMER_SEGMENT_DATA} />
        </div>
        <div className="an__chart-card">
          <div className="an__chart-card-title">Avg. order value</div>
          <div className="an__donut-wrapper">
            <DonutChart data={CUSTOMER_DONUT_DATA} />
            <div className="an__donut-legend">
              {CUSTOMER_DONUT_DATA.map((d, i) => (
                <div key={i} className="an__legend-item">
                  <span className="an__legend-dot" style={{ background: d.color }} />
                  <span className="an__legend-text">
                    {d.label} - ₹{d.value}L ({Math.round((d.value / customerDonutTotal) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="an__charts-row">
        <div className="an__chart-card">
          <div className="an__customers-list-title">Top customers by spend</div>
          {TOP_CUSTOMERS.map((c, i) => (
            <div key={i} className="an__customer-row">
              <span className="an__customer-num">{i + 1}</span>
              <div className="an__customer-info">
                <div className="an__customer-name">{c.name}</div>
                <div className="an__customer-sub">{c.orders} orders · {c.city}</div>
              </div>
              <span className="an__customer-amount">{c.amount}</span>
            </div>
          ))}
        </div>
        <div className="an__chart-card">
          <div className="an__chart-card-title">Avg. order value</div>
          <OrdersBarChart data={CUSTOMER_FUNNEL_DATA} />
        </div>
      </div>
    </div>
  );
};

// ── Products Tab Data ──────────────────────────────────────────────────────
const SALES_BY_CATEGORY = [
  { name: "Gold Jhumka Earrings — 22K", sku: "Earrings · SKU: AJW-EAR-007", units: 42, revenue: "₹1.4L", color: "#6366f1", width: 85 },
  { name: "Gold Jhumka Earrings — 22K", sku: "Earrings · SKU: AJW-EAR-007", units: 42, revenue: "₹1.4L", color: "#22c55e", width: 68 },
  { name: "Gold Jhumka Earrings — 22K", sku: "Earrings · SKU: AJW-EAR-007", units: 42, revenue: "₹1.4L", color: "#06b6d4", width: 52 },
  { name: "Gold Jhumka Earrings — 22K", sku: "Earrings · SKU: AJW-EAR-007", units: 42, revenue: "₹1.4L", color: "#ef4444", width: 40 },
  { name: "Gold Jhumka Earrings — 22K", sku: "Earrings · SKU: AJW-EAR-007", units: 42, revenue: "₹1.4L", color: "#eab308", width: 30 },
];

const LOW_STOCK_ITEMS = [
  { name: "Gold Jhumka", category: "Earrings", stock: 1, status: "low" },
  { name: "Gold Jhumka", category: "Earrings", stock: 2, status: "low" },
  { name: "Gold Jhumka", category: "Earrings", stock: 2, status: "low" },
  { name: "Gold Jhumka", category: "Earrings", stock: 3, status: "low" },
  { name: "Gold Jhumka", category: "Earrings", stock: 0, status: "out" },
];

const WISHLISTED_PRODUCTS = [
  { name: "Gold Jhumka", saves: 84 },
  { name: "Gold Jhumka", saves: 84 },
  { name: "Gold Jhumka", saves: 84 },
  { name: "Gold Jhumka", saves: 84 },
  { name: "Gold Jhumka", saves: 84 },
  { name: "Gold Jhumka", saves: 84 },
];

// ── Products Tab ───────────────────────────────────────────────────────────
const ProductsTab = () => (
  <div className="an__products">
    {/* Row 1: 4 stat cards */}
    <div className="an__stats-grid">
      <div className="an__stat-card">
        <div className="an__stat-label">Total Products</div>
        <div className="an__stat-value">156</div>
        <div className="an__stat-footer">
          <span className="an__stat-subtext">6 categories</span>
        </div>
      </div>
      <div className="an__stat-card">
        <div className="an__stat-label">Products sold</div>
        <div className="an__stat-value">88</div>
        <div className="an__stat-footer">
          <span className="an__stat-subtext">Units this month</span>
        </div>
      </div>
      <div className="an__stat-card">
        <div className="an__stat-label">Best seller</div>
        <div className="an__stat-value an__stat-value--md">Gold Jhumka</div>
        <div className="an__stat-footer">
          <span className="an__stat-subtext">42 units sold</span>
        </div>
      </div>
      <div className="an__stat-card">
        <div className="an__stat-label">Low stock items</div>
        <div className="an__stat-value an__stat-value--red">8</div>
        <div className="an__stat-footer">
          <span className="an__badge an__badge--action">Restock Needed</span>
        </div>
      </div>
    </div>

    {/* Row 2: 2 stat cards */}
    <div className="an__stats-grid">
      <div className="an__stat-card">
        <div className="an__stat-label">Out Of Stock</div>
        <div className="an__stat-value an__stat-value--red">8</div>
        <div className="an__stat-footer">
          <span className="an__badge an__badge--action">Restock Needed</span>
        </div>
      </div>
      <div className="an__stat-card">
        <div className="an__stat-label">Wishlist saves</div>
        <div className="an__stat-value">312</div>
        <div className="an__stat-footer">
          <span className="an__badge an__badge--up"><ArrowUp />21% vs April</span>
        </div>
      </div>
    </div>

    {/* Sales by category */}
    <div className="an__chart-card">
      <div className="an__products-section-title">Sales by category</div>
      <div className="an__products-category-list">
        {SALES_BY_CATEGORY.map((item, i) => (
          <div key={i} className="an__products-category-row">
            <div className="an__products-category-info">
              <div className="an__products-category-name">{item.name}</div>
              <div className="an__products-category-sku">{item.sku}</div>
              <div className="an__products-category-bar-track">
                <div
                  className="an__products-category-bar-fill"
                  style={{ width: `${item.width}%`, background: item.color }}
                />
              </div>
            </div>
            <div className="an__products-category-stats">
              <div className="an__products-category-units">{item.units} units</div>
              <div className="an__products-category-revenue">{item.revenue}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom row: Low stock + Wishlisted */}
    <div className="an__charts-row">
      <div className="an__chart-card">
        <div className="an__products-section-title">Low And Out of Stock</div>
        <div className="an__products-stock-list">
          {LOW_STOCK_ITEMS.map((item, i) => (
            <div key={i} className="an__products-stock-row">
              <div className="an__products-stock-info">
                <div className="an__products-stock-name">{item.name}</div>
                <div className="an__products-stock-category">{item.category}</div>
              </div>
              {item.status === "out" ? (
                <span className="an__products-stock-badge an__products-stock-badge--out">Out Of Stock</span>
              ) : (
                <span className="an__products-stock-badge an__products-stock-badge--low">{item.stock} left</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="an__chart-card">
        <div className="an__products-section-title">Most wishlisted products</div>
        <div className="an__products-wishlist-list">
          {WISHLISTED_PRODUCTS.map((item, i) => (
            <div key={i} className="an__products-wishlist-row">
              <span className="an__products-wishlist-name">{item.name}</span>
              <span className="an__products-wishlist-saves">{item.saves} Saves</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Overview Data ──────────────────────────────────────────────────────────
const PERIOD_DATA = {
  Today: {
    revenue: "₹18,400", orders: 12, avgOrder: "₹1,533", newCustomers: 3,
    returning: 8, conversion: "1.4%", cancelled: 1, returns: 0,
    returnRate: "0%", orderChange: "5.2%", revenueChange: "8.1%", returningPct: "66.7%",
  },
  "7 Days": {
    revenue: "₹1.1L", orders: 84, avgOrder: "₹2,780", newCustomers: 9,
    returning: 62, conversion: "2.8%", cancelled: 4, returns: 2,
    returnRate: "2.4%", orderChange: "12.4%", revenueChange: "15.3%", returningPct: "73.8%",
  },
  "This Month": {
    revenue: "₹4.2L", orders: 156, avgOrder: "₹3,270", newCustomers: 21,
    returning: 117, conversion: "3.2%", cancelled: 8, returns: 6,
    returnRate: "3.8%", orderChange: "37.8%", revenueChange: "37.8%", returningPct: "84.6%",
  },
  "Last Month": {
    revenue: "₹3.6L", orders: 132, avgOrder: "₹2,950", newCustomers: 18,
    returning: 98, conversion: "2.9%", cancelled: 6, returns: 4,
    returnRate: "3.0%", orderChange: "22.1%", revenueChange: "19.5%", returningPct: "74.2%",
  },
  Custom: {
    revenue: "₹4.2L", orders: 156, avgOrder: "₹3,270", newCustomers: 21,
    returning: 117, conversion: "3.2%", cancelled: 8, returns: 6,
    returnRate: "3.8%", orderChange: "37.8%", revenueChange: "37.8%", returningPct: "84.6%",
  },
};

const BAR_DATA = [
  { label: "Delivered", value: 95, color: "#22c55e" },
  { label: "Shipped",   value: 72, color: "#3b82f6" },
  { label: "Confirmed", value: 58, color: "#06b6d4" },
  { label: "Pending",   value: 35, color: "#f59e0b" },
  { label: "Cancelled", value: 18, color: "#ef4444" },
];

const DONUT_DATA = [
  { label: "Necklaces", value: 1.4, color: "#f87171" },
  { label: "Bangles",   value: 1.4, color: "#fb923c" },
  { label: "Rings",     value: 1.4, color: "#3b82f6" },
  { label: "Earings",   value: 1.4, color: "#facc15" },
];

const TABS    = ["Overview", "Orders", "Customers", "Products"];
const PERIODS = ["Today", "7 Days", "This Month", "Last Month", "Custom"];

// ── Analytics Page ─────────────────────────────────────────────────────────
const Analytics = () => {
  const [activeTab, setActiveTab]       = useState("Overview");
  const [activePeriod, setActivePeriod] = useState("This Month");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");

  const d = PERIOD_DATA[activePeriod];
  const total = DONUT_DATA.reduce((s, x) => s + x.value, 0);
  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="an">
      <div className="an__header">
        <h1 className="an__title">Analytics</h1>
        <p className="an__subtitle">{activeTab} — {currentMonth}</p>
      </div>

      <div className="an__tabs">
        {TABS.map((tab) => (
          <button key={tab} className={`an__tab${activeTab === tab ? " an__tab--active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="an__periods">
        {PERIODS.map((p) => (
          <button key={p} className={`an__period${activePeriod === p ? " an__period--active" : ""}`} onClick={() => setActivePeriod(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="an__date-row">
        <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
        <DateInput label="End Date"   value={endDate}   onChange={setEndDate}   />
      </div>

      {activeTab === "Overview" && (
        <>
          <div className="an__stats-container">
            <div className="an__stats-grid">
              <StatCard label="Total Revenue"    value={d.revenue}      change={d.revenueChange} changeType="up" subtext="this week" />
              <StatCard label="Total Order"      value={d.orders}       change={d.orderChange}   changeType="up" subtext="this week" />
              <StatCard label="Avg. order value" value={d.avgOrder}     change="37.8%"           changeType="up" subtext="this week" />
              <StatCard label="New Customers"    value={d.newCustomers} change="37.8%"           changeType="up" subtext="this week" />
            </div>
            <div className="an__stats-divider" />
            <div className="an__stats-grid">
              <StatCard label="Returning Customers" value={d.returning}  subtext={`${d.returningPct} of Orders`} />
              <StatCard label="Conversion rate"     value={d.conversion} change="37.8%" changeType="up" subtext="this week" />
              <StatCard
                label="Cancelled Ordrs"
                value={d.cancelled}
                change={d.cancelled > 2 ? `${d.cancelled - 2} Vs April` : undefined}
                changeType="warn"
                subtext={d.cancelled <= 2 ? "Vs April" : undefined}
              />
              <StatCard label="Returns" value={d.returns} subtext={`${d.returnRate} return rate`} />
            </div>
          </div>
          <div className="an__charts-row">
            <div className="an__chart-card">
              <div className="an__chart-card-title">Avg. order value</div>
              <HorizontalBarChart data={BAR_DATA} />
            </div>
            <div className="an__chart-card">
              <div className="an__chart-card-title">Avg. order value</div>
              <div className="an__donut-wrapper">
                <DonutChart data={DONUT_DATA} />
                <div className="an__donut-legend">
                  {DONUT_DATA.map((d, i) => (
                    <div key={i} className="an__legend-item">
                      <span className="an__legend-dot" style={{ background: d.color }} />
                      <span className="an__legend-text">
                        {d.label} - ₹{d.value}L ({Math.round((d.value / total) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "Orders"    && <OrdersTab />}
      {activeTab === "Customers" && <CustomersTab />}
      {activeTab === "Products"  && <ProductsTab />}
    </div>
  );
};

export default Analytics;