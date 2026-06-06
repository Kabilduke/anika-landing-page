import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./shippingAddress.css";
import Navbar from "../components/SiteHeader";
import Footer from "../components/SiteFooter";

const indianStates = [
  "Tamil Nadu", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Telangana",  "Uttar Pradesh", "West Bengal",
  "Delhi", "Jammu & Kashmir" ,
];

const emptyForm = {
  name: "", email: "", mobile: "", flat: "", area: "",
  city: "", pinCode: "", state: "Tamil Nadu", isDefault: false,
};

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const fetchAddresses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map(item => ({
          id: item.address_id,
          name: item.full_name,
          address: `${item.address_line1}, ${item.address_line2 || ""}, ${item.city}, ${item.state} - ${item.postal_code}`,
          isDefault: item.is_default,
          flat: item.address_line1,
          area: item.address_line2 || "",
          city: item.city,
          state: item.state,
          pinCode: item.postal_code,
          mobile: item.phone_number,
        }));
        setAddresses(formatted);
        
        const defaultAddr = formatted.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedId(defaultAddr.id);
        } else if (formatted.length > 0) {
          setSelectedId(formatted[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchAddresses(session.user.id);
      } else {
        alert("Please log in first to checkout.");
        navigate("/account/login");
      }
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile.replace(/\D/g, ""))) e.mobile = "Valid 10-digit mobile is required";
    if (!form.flat.trim()) e.flat = "Address is required";
    if (!form.area.trim()) e.area = "Area is required";
    if (!form.pinCode.trim() || !/^\d{6}$/.test(form.pinCode)) e.pinCode = "Valid 6-digit PIN required";
    return e;
  };

  const toast = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    try {
      if (!user) {
        alert("Please log in first.");
        navigate("/account/login");
        return;
      }

      if (form.isDefault) {
        // Reset defaults in database
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingId !== null) {
        const { error } = await supabase
          .from("addresses")
          .update({
            full_name: form.name,
            phone_number: form.mobile,
            address_line1: form.flat,
            address_line2: form.area,
            city: form.city,
            state: form.state,
            postal_code: form.pinCode,
            is_default: form.isDefault
          })
          .eq("address_id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
        toast("Address updated successfully!");
        setEditingId(null);
      } else {
        // check duplicate
        const isDuplicate = addresses.some(
          (a) =>
            a.flat.trim().toLowerCase() === form.flat.trim().toLowerCase() &&
            a.pinCode === form.pinCode &&
            a.mobile === form.mobile
        );
        if (isDuplicate) {
          alert("This address already exists.");
          return;
        }

        const { error } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            full_name: form.name,
            phone_number: form.mobile,
            address_line1: form.flat,
            address_line2: form.area,
            city: form.city,
            state: form.state,
            postal_code: form.pinCode,
            is_default: form.isDefault
          });

        if (error) throw error;
        toast("Address added successfully!");
      }

      await fetchAddresses(user.id);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      alert("Failed to save address: " + err.message);
    }
  };

  // ── edit: populate form ──
  const handleEdit = (addr) => {
    setForm({
      name: addr.full_name || "",
      email: "",
      mobile: addr.phone_number || "",
      flat: addr.address_line1 || "",
      area: addr.address_line2 || "",
      city: addr.city || "",
      pinCode: addr.postal_code || "",
      state: addr.state || "Tamil Nadu",
      isDefault: addr.is_default || false,
    });
    setEditingId(addr.address_id);
    setErrors({});
    document.getElementById("add-address-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── delete ──
  const handleDelete = async (id) => {
    setDeletingId(id);

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("address_id", id)

    if (error){
      alert(error.message);
      setDeletingId(null);
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.address_id !== id));
    if (selectedId === id) setSelectedId(null);
    setDeletingId(null);
  };

  // ── Deliver Here — navigate ──
  const handleDeliver = async () => {
    if (!selectedAddress) return;
    if (!user) {
      alert("Please log in first to place your order.");
      navigate("/account/login");
      return;
    }

    try {
      const product = location.state?.product || {
        name: "Antique Bangle set",
        price: "1299",
        qty: 1
      };

      const numericPrice = parseFloat(product.price.toString().replace(/[^\d.]/g, '')) || 1299;
      const orderId = "#AJW-" + Math.floor(1000 + Math.random() * 9000);

      const { error } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          user_id: user.id,
          item_name: product.name,
          quantity: product.qty || 1,
          total_price: numericPrice * (product.qty || 1),
          payment: 'COD',
          type: 'Regular',
          status: 'Pending'
        });

      if (error) throw error;

      toast("Order placed successfully! Redirecting...");
      setTimeout(() => {
        navigate("/profile/orders");
      }, 1500);

    } catch (err) {
      alert("Failed to place order: " + err.message);
    }
  };

  const hasAddresses = addresses.length > 0;
  const selectedAddress = addresses.find((a) => a.address_id === selectedId);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">

        {/* TOAST */}
        {showSuccess && (
          <div className="toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {successMsg}
          </div>
        )}

        <main className="main-content">
          <h1 className="page-title">Shipping Address</h1>

          {/* STEPPER */}
          <div className="stepper">
            <div className="step active">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="step-label">Address</span>
            </div>
            <div className="step-line"></div>
            <div className="step-line"></div>
            <div className="step inactive">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <span className="step-label">Payment Method</span>
            </div>
          </div>

          {/* ADDRESS CARDS */}
          {hasAddresses && (
            <>
              <div className="section-label">Select a delivery address</div>
              <p className="section-hint">Select an address below or add a new one.</p>

              <div className="address-cards">
                {addresses.map((addr) => (
                  <div
                    key={addr.address_id}
                    className={`address-card ${selectedId === addr.address_id ? "selected" : ""}`}
                    onClick={() => setSelectedId(addr.address_id)}
                  >
                    <div className="card-header">
                      <input
                        type="checkbox"
                        className="addr-checkbox"
                        checked={selectedId === addr.address_id}
                        onChange={() => setSelectedId(addr.address_id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="addr-name">{addr.full_name}</span>
                    </div>
                    <p className="addr-text">
                      {addr.address_line1}, {addr.address_line2}, {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <div className="card-actions">
                      <button className="btn-edit" onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(addr.address_id); }}
                        disabled= {deletingId === addr.address_id}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {deletingId === addr.address_id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SELECTED ADDRESS PREVIEW */}
              {selectedAddress && (
                <div className="selected-address-preview">
                  <div className="preview-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="preview-title">Delivering to</span>
                  </div>
                  <div className="preview-body">
                    <p className="preview-name">{selectedAddress.full_name}</p>
                    <p className="preview-address">
                      {selectedAddress.address_line1}, {selectedAddress.address_line2},{" "}
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                    </p>
                  </div>
                </div>
              )}

              {/* DELIVER HERE */}
              <button
                className="btn-deliver"
                disabled={!selectedId}
                onClick={handleDeliver}
              >
                Deliver Here
              </button>
            </>
          )}

          {/* ADD / EDIT FORM */}
          <div className="add-address-box" id="add-address-section">
            <h2 className="form-title">{editingId ? "Edit Address" : "Add a new address"}</h2>

            <div className="form-grid">
              <div className="form-group full">
                <label>Name</label>
                <input type="text" name="name" placeholder="Akshen S" value={form.name} onChange={handleChange} className={errors.name ? "error" : ""} />
                {errors.name && <span className="err-msg">{errors.name}</span>}
              </div>

              <div className="form-group full">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="name@email.com" value={form.email} onChange={handleChange} className={errors.email ? "error" : ""} />
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>

              <div className="form-group full">
                <label>Mobile Number</label>
                <div className="phone-input">
                  <span className="phone-prefix">(+91)</span>
                  <input type="tel" name="mobile" placeholder="9876543210" value={form.mobile} onChange={handleChange} className={errors.mobile ? "error" : ""} />
                </div>
                {errors.mobile && <span className="err-msg">{errors.mobile}</span>}
              </div>

              <div className="form-group full">
                <label>Flat, House no., Building, Company, Apartment</label>
                <input type="text" name="flat" placeholder="A-01 Sun Pharma Road" value={form.flat} onChange={handleChange} className={errors.flat ? "error" : ""} />
                {errors.flat && <span className="err-msg">{errors.flat}</span>}
              </div>

              <div className="form-group full">
                <label>Area, Colony, Street, Sector, Village</label>
                <input type="text" name="area" placeholder="Sun Pharma Road" value={form.area} onChange={handleChange} className={errors.area ? "error" : ""} />
                {errors.area && <span className="err-msg">{errors.area}</span>}
              </div>

              <div className="form-group half">
                <label>City</label>
                <input type="text" name="city" placeholder="Chennai" value={form.city} onChange={handleChange} />
              </div>

              <div className="form-group half">
                <label>Pin Code</label>
                <input type="text" name="pinCode" placeholder="600001" value={form.pinCode} onChange={handleChange} maxLength={6} className={errors.pinCode ? "error" : ""} />
                {errors.pinCode && <span className="err-msg">{errors.pinCode}</span>}
              </div>

              <div className="form-group full">
                <label>State</label>
                <div className="select-wrapper">
                  <select name="state" value={form.state} onChange={handleChange}>
                    {indianStates.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div className="form-group full checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
                  Use as my default address
                </label>
              </div>
            </div>

            <div className="form-actions">
              {editingId && (
                <button className="btn-cancel" onClick={() => { setForm(emptyForm); setEditingId(null); setErrors({}); }}>
                  Cancel
                </button>
              )}
              <button className="btn-add-address" onClick={handleSubmit}>
                {editingId ? "Update Address" : "Add New Address"}
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}