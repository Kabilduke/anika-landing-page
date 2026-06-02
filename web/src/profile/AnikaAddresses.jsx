import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./AnikaAddresses.css";
import Navbar from "../components/SiteHeader";
import Footer from "../components/SiteFooter";

const TABS = ["Profile", "Orders", "Addresses", "Wishlists", "Account"];
const STATES = ["Gujarat", "Tamil Nadu", "Maharashtra", "Delhi", "Karnataka", "Telangana", "West Bengal"];

export default function AnikaAddresses() {
  const [activeTab, setActiveTab] = useState("Addresses");
  const [addresses, setAddresses] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", mobile: "",
    flat: "", area: "", city: "",
    pinCode: "", state: "Tamil Nadu", isDefault: false,
  });

  // ── Fetch addresses from Supabase ──
  const fetchAddresses = async (userId) => {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setAddresses(data);
    }
  };

  // ── Load user + addresses on mount ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/account/login");
        return;
      }
      setUser(session.user);
      fetchAddresses(session.user.id); // ← load from Supabase
    });
  }, []);

  const handleTabClick = (tab) => {
    if (tab === "Profile")        navigate("/profile");
    else if (tab === "Orders")    navigate("/profile/orders");
    else if (tab === "Addresses") setActiveTab("Addresses");
    else navigate(`/profile/${tab.toLowerCase()}`);
  };

  const handleNavClick = (link) => {
    if (link === "Home") navigate("/");
    else navigate(`/${link.toLowerCase()}`);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Add new address to Supabase ──
  const handleAddNew = async () => {
    if (!form.name.trim()) { alert("Please enter a name."); return; }
    if (!form.flat.trim() || !form.city.trim() || !form.pinCode.trim()) {
      alert("Please fill in address, city and pin code.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { error } = await supabase
      .from("addresses")
      .insert({
        user_id: userId,
        full_name: form.name,
        phone_number: form.mobile,
        address_line1: form.flat,
        address_line2: form.area,
        city: form.city,
        state: form.state,
        postal_code: form.pinCode,
        is_default: form.isDefault,
      });

    if (error) {
      alert(error.message);
    } else {
      fetchAddresses(userId); // ← refresh list
      setForm({
        name: "", email: "", mobile: "", flat: "", area: "",
        city: "", pinCode: "", state: "Tamil Nadu", isDefault: false,
      });
    }
  };

  // ── Delete address from Supabase ──
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("address_id", id);

    if (error) {
      alert(error.message);
    } else {
      setAddresses((prev) => prev.filter((a) => a.address_id !== id));
    }
  };

  // ── Set default address ──
  const handleSetDefault = async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Unset all defaults first
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Set new default
    await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("address_id", id);

    fetchAddresses(userId); // ← refresh list
  };

  return (
    <>
      <Navbar onLinkClick={handleNavClick} />
      <div className="addr-root">

        <h1 className="addr-profile-title">Profile</h1>

        {/* ── USER INFO ── */}
        <div className="addr-user-section">
          <div className="addr-avatar">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="addr-user-text">
            <span className="addr-user-name">{user?.user_metadata?.name || "User"}</span>
            <span className="addr-user-meta">
              {user?.email} &nbsp;·&nbsp; Member since{" "}
              {user ? new Date(user.created_at).toLocaleDateString("en-IN", {
                month: "short", year: "numeric"
              }) : ""}
            </span>
            <span className="addr-vip-badge">{addresses.length} addresses saved</span>
          </div>
        </div>

        <hr className="addr-divider" />

        {/* ── TABS ── */}
        <div className="addr-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`addr-tab${activeTab === tab ? " addr-tab--active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── SAVED ADDRESSES ── */}
        <h2 className="addr-section-title">Saved Addresses</h2>

        {addresses.length === 0 ? (
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>
            No addresses saved yet.
          </p>
        ) : (
          <div className="addr-saved-grid">
            {addresses.map((addr) => (
              <div
                key={addr.address_id} // ← use address_id from Supabase
                className={`addr-saved-card${addr.is_default ? " addr-saved-card--selected" : ""}`}
              >
                <div className="addr-saved-card-top">
                  <input
                    type="checkbox"
                    className="addr-check"
                    checked={addr.is_default}
                    onChange={() => handleSetDefault(addr.address_id)} // ← Supabase update
                  />
                  <div className="addr-saved-info">
                    <span className="addr-saved-name">{addr.full_name}</span>
                    <span className="addr-saved-addr">
                      {addr.address_line1}, {addr.address_line2}, {addr.city}, {addr.state} - {addr.postal_code}
                    </span>
                  </div>
                </div>
                <div className="addr-saved-actions">
                  <button className="addr-edit-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="addr-delete-btn"
                    onClick={() => handleDelete(addr.address_id)} // ← use address_id
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ADD NEW ADDRESS FORM ── */}
        <div className="addr-form-card">
          <h3 className="addr-form-title">Add a new address</h3>

          <div className="addr-field">
            <label className="addr-label">Name</label>
            <input className="addr-input" placeholder="Enter full name"
              value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">Email Address</label>
            <input className="addr-input" type="email" placeholder="name@email.com"
              value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">Mobile Number</label>
            <input className="addr-input" type="tel" placeholder="+91 9876543210"
              value={form.mobile} onChange={(e) => handleFormChange("mobile", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">Flat, House no., Building</label>
            <input className="addr-input" placeholder="A-01 Sun Pharma Road"
              value={form.flat} onChange={(e) => handleFormChange("flat", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">Area, Colony, Street</label>
            <input className="addr-input" placeholder="Sun Pharma Road"
              value={form.area} onChange={(e) => handleFormChange("area", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">City</label>
            <input className="addr-input" placeholder="Chennai"
              value={form.city} onChange={(e) => handleFormChange("city", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">Pin Code</label>
            <input className="addr-input" placeholder="600001"
              value={form.pinCode} onChange={(e) => handleFormChange("pinCode", e.target.value)} />
          </div>

          <div className="addr-field">
            <label className="addr-label">State</label>
            <div className="addr-select-wrap">
              <select className="addr-select" value={form.state}
                onChange={(e) => handleFormChange("state", e.target.value)}>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="addr-checkbox-row">
            <input type="checkbox" id="defaultAddr" className="addr-check"
              checked={form.isDefault}
              onChange={(e) => handleFormChange("isDefault", e.target.checked)} />
            <label htmlFor="defaultAddr" className="addr-check-label">
              Use as my default address
            </label>
          </div>

          <button className="addr-add-btn" onClick={handleAddNew}>
            Add New Address
          </button>
        </div>

      </div>
      <Footer />
    </>
  );
}