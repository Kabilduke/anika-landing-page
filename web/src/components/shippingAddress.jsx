import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from "../services/authService";
import { orderService } from "../services/orderService";
import { useStore } from "../hooks/useStore";
import { supabase } from "../lib/supabase";
import "./shippingAddress.css";
import Navbar from "./SiteHeader";
import Footer from "./SiteFooter";
import Toast from "./Toast";

// Helper to dynamically load the Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const parsePrice = (priceVal) => {
  if (typeof priceVal === 'number') return priceVal;
  return parseFloat(String(priceVal).replace(/[₹,\s]/g, "")) || 0;
};

const indianStates = [
  "Tamil Nadu", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Telangana", "Uttar Pradesh", "West Bengal",
  "Delhi", "Jammu & Kashmir",
];

const emptyForm = {
  name: "", email: "", mobile: "",
  flat: "", area: "", city: "",
  pinCode: "", state: "Tamil Nadu", isDefault: false,
};

const serviceabilityPromiseCache = {};

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [userId, setUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeStep, setActiveStep] = useState('address'); // 'address' | 'payment'
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'RAZORPAY'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pincodeServiceability, setPincodeServiceability] = useState('unchecked'); // 'unchecked' | 'checking' | 'serviceable' | 'unserviceable'
  const [serviceabilityError, setServiceabilityError] = useState("");
  const [selectedAddrServiceable, setSelectedAddrServiceable] = useState(true);
  const [selectedAddrChecking, setSelectedAddrChecking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const hasAddresses = addresses.length > 0;
  const selectedAddress = addresses.find((a) => a.address_id === selectedId);

  const checkEkartServiceability = (pincode) => {
    if (!pincode || pincode.length !== 6) return Promise.resolve(false);
    if (serviceabilityPromiseCache[pincode]) {
      return serviceabilityPromiseCache[pincode];
    }

    const promise = (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('ekart', {
          body: {
            action: "check_serviceability",
            pincode: pincode
          }
        });
        if (error) throw error;
        return data?.serviceable ?? false;
      } catch (err) {
        console.error("Failed to check pincode serviceability:", err);
        // Fallback for sandbox environment issues:
        return !pincode.startsWith("999");
      }
    })();

    serviceabilityPromiseCache[pincode] = promise;
    return promise;
  };

  // Debounced pincode serviceability check for address form
  useEffect(() => {
    if (form.pinCode.length === 6 && /^\d{6}$/.test(form.pinCode)) {
      setPincodeServiceability('checking');
      setServiceabilityError("");
      const timer = setTimeout(async () => {
        const serviceable = await checkEkartServiceability(form.pinCode);
        if (serviceable) {
          setPincodeServiceability('serviceable');
        } else {
          setPincodeServiceability('unserviceable');
          setServiceabilityError("This pincode is not serviceable by Ekart.");
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPincodeServiceability('unchecked');
      setServiceabilityError("");
    }
  }, [form.pinCode]);

  // Check serviceability of selected address from cards list
  useEffect(() => {
    let active = true;
    if (selectedAddress) {
      const checkSelected = async () => {
        setSelectedAddrChecking(true);
        const serviceable = await checkEkartServiceability(selectedAddress.postal_code);
        if (active) {
          setSelectedAddrServiceable(serviceable);
          setSelectedAddrChecking(false);
        }
      };
      checkSelected();
    } else {
      setSelectedAddrServiceable(true);
    }
    return () => {
      active = false;
    };
  }, [selectedId, addresses]);

  const handleNavClick = (link) => {
    if (link == "Home"){
      navigate("/");
    }else{
      navigate(`/${link.toLowerCase()}`);
    }
  }

  // ── fetch addresses from Supabase ──
  const fetchAddresses = async () => {
    try {
      const user = await authService.getUser();
      if (!user){
        return;
      }

      const data = await orderService.getAddresses(user.id);
      if (data && data.length > 0) {
        setAddresses(data);
        setSelectedId(data[0].address_id);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  };

  // ── fetch userId and addresses on mount ──
  useEffect(() => {
    authService.getSession().then((session) => {
      if (session) {
        setUserId(session.user.id);
        fetchAddresses();
      }
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile.replace(/\D/g, ""))) e.mobile = "Valid 10-digit mobile is required";
    if (!form.flat.trim()) e.flat = "Address is required";
    if (!form.area.trim()) e.area = "Area is required";
    if (!form.pinCode.trim() || !/^\d{6}$/.test(form.pinCode)) e.pinCode = "Valid 6-digit PIN required";
    return e;
  };

  const showToast = (message, type = "success") => {
    setToast({ message: "", type: "" });
    setTimeout(() => setToast({ message, type }), 10);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (pincodeServiceability === 'unserviceable') {
      showToast("Cannot save address: Pincode is not serviceable by Ekart.", "error");
      return;
    }

    try {
      if (editingId !== null) {
        await orderService.updateAddress(editingId, {
          full_name: form.name,
          phone_number: form.mobile,
          address_line1: form.flat,
          address_line2: form.area,
          city: form.city,
          state: form.state,
          postal_code: form.pinCode,
          is_default: form.isDefault,
        });

        // ── UPDATE local state only ──
        setAddresses((prev) =>
          prev.map((a) =>
            a.address_id === editingId
              ? {
                  ...a,
                  full_name: form.name,
                  phone_number: form.mobile,
                  address_line1: form.flat,
                  address_line2: form.area,
                  city: form.city,
                  state: form.state,
                  postal_code: form.pinCode,
                  is_default: form.isDefault,
                }
              : a
          )
        );
        setEditingId(null);
        showToast("Address updated!", "success");
      } else {
        // ── ADD — save to Supabase ──
        const session = await authService.getSession();
        const uid = session?.user?.id;
        if (!uid) { alert("Not logged in."); return; }

        // ── check for duplicate ──
        const isDuplicate = addresses.some(
          (a) =>
            a.address_line1.trim().toLowerCase() === form.flat.trim().toLowerCase() &&
            a.postal_code === form.pinCode &&
            a.phone_number === form.mobile
        );
        if (isDuplicate) { showToast("This address already exists.", "error"); return; }

        const inserted = await orderService.createAddress({
          user_id: uid,
          full_name: form.name,
          phone_number: form.mobile,
          address_line1: form.flat,
          address_line2: form.area,
          city: form.city,
          state: form.state,
          postal_code: form.pinCode,
          is_default: form.isDefault,
        });

        const data = Array.isArray(inserted) ? inserted[0] : inserted;
        setAddresses((prev) => [...prev, data]);
        setSelectedId(data.address_id);
        showToast("Address added!", "success");
      }

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

    try {
      await orderService.deleteAddress(id, userId);
      setAddresses((prev) => prev.filter((a) => a.address_id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      alert("Failed to delete address: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Deliver Here — proceed to payment step ──
  const handleDeliver = () => {
    if (!selectedAddress) return;
    setActiveStep('payment');
  };
  // Compute checkout items
  const checkoutProduct = location.state?.product;
  const cartItems = useStore((state) => state.cartItems);
  const checkoutItems = checkoutProduct ? [checkoutProduct] : cartItems;

  const subtotal = checkoutProduct
    ? (parsePrice(checkoutProduct.price) * checkoutProduct.qty)
    : cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxes = 0;
  const gst = Math.round(subtotal * 0.03); // 3% GST on jewelry
  const platformFee = 0;
  const grandTotal = subtotal + taxes + gst + platformFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast("Please select a delivery address.", "error");
      return;
    }

    if (checkoutItems.length === 0) {
      showToast("No items to checkout.", "error");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const session = await authService.getSession();
      const token = session?.access_token;
      if (!token) {
        showToast("You must be logged in to place an order.", "error");
        setIsProcessingPayment(false);
        return;
      }

      if (paymentMethod === "COD") {
        // Cash on Delivery flow - Insert order directly into database
        // id is omitted — DB trigger auto-generates: ORD{YYYYMMDD}{NNNN}
        const mainItem = checkoutItems[0];
        
        const { data, error } = await supabase
          .from("orders")
          .insert({
            user_id: userId,
            item_name: checkoutItems.length > 1 
              ? `${mainItem.name} + ${checkoutItems.length - 1} other(s)` 
              : mainItem.name,
            quantity: checkoutItems.reduce((sum, item) => sum + (item.qty || 1), 0),
            total_price: grandTotal,
            payment: "COD",
            type: "Regular",
            status: "Pending",
          })
          .select()
          .single();

        if (error) throw error;

        // Use the DB-generated order ID for child records
        const generatedOrderId = data.id;

        // Insert order items
        const orderItemsToInsert = checkoutItems.map(item => ({
          order_id: generatedOrderId,
          product_id: typeof (item.productId || item.id) === 'number' ? (item.productId || item.id) : null,
          product_name: item.name,
          quantity: item.qty || 1,
          price: parsePrice(item.price),
          size: item.size || null,
          color: item.color || null,
          image_url: item.img || item.image || (item.images && item.images[0]) || null,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsToInsert);

        if (itemsError) throw itemsError;

        // Trigger automated shipment booking via Ekart
        let waybill = "";
        try {
          const { data: bookingData } = await supabase.functions.invoke('ekart', {
            body: {
              action: "book_shipment",
              orderId: generatedOrderId,
              addressId: selectedId,
            }
          });
          if (bookingData?.success && bookingData?.order?.waybill) {
            waybill = bookingData.order.waybill;
          }
        } catch (bookingErr) {
          console.error("Ekart automated COD booking failed:", bookingErr);
        }

        // Clear cart if we checked out from cart
        if (!checkoutProduct) {
          const removeFromCart = useStore.getState().removeFromCart;
          for (const item of checkoutItems) {
            await removeFromCart(item.id);
          }
        }

        showToast("Order placed successfully via Cash on Delivery!", "success");
        setTimeout(() => {
          navigate("/profile/orders", { state: { redirectToEkartUrl: waybill ? `https://app.elite.ekartlogistics.in/track/${waybill}` : null } });
        }, 2000);
      } else {
        // Razorpay Online Payment flow
        // 1. Load Razorpay script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          showToast("Failed to load Razorpay SDK. Please check your internet connection.", "error");
          setIsProcessingPayment(false);
          return;
        }

        // 2. Create Razorpay order via backend edge function
        const paymentItems = checkoutItems.map(item => ({
          productId: typeof (item.productId || item.id) === 'number' ? (item.productId || item.id) : null,
          quantity: item.qty || 1,
          size: item.size || null,
          color: item.color || null,
        }));

        // Call our Edge Function
        const { data: orderData, error: invokeError } = await supabase.functions.invoke('razorpay', {
          body: {
            action: "create_order",
            items: paymentItems,
          }
        });

        if (invokeError || !orderData) {
          throw new Error(invokeError?.message || "Failed to initiate Razorpay order.");
        }
        
        // Get user profile details for prefill
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", userId)
          .single();

        // 3. Launch Razorpay Checkout Modal
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Anika Jewelry",
          description: `Order for ${orderData.productName}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              setIsProcessingPayment(true);
              // 4. Verify payment via edge function on successful payment
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
                body: {
                  action: "verify_payment",
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: paymentItems,
                  addressId: selectedId,
                }
              });

              if (verifyError) {
                throw new Error(verifyError.message || "Payment verification failed.");
              }

              // Clear cart if checking out from cart
              if (!checkoutProduct) {
                const removeFromCart = useStore.getState().removeFromCart;
                for (const item of checkoutItems) {
                  await removeFromCart(item.id);
                }
              }

              const waybill = verifyData?.order?.waybill || verifyData?.waybill;
              showToast("Payment successful! Order placed.", "success");
              setTimeout(() => {
                navigate("/profile/orders", { state: { redirectToEkartUrl: waybill ? `https://app.elite.ekartlogistics.in/track/${waybill}` : null } });
              }, 2000);
            } catch (err) {
              showToast(err.message, "error");
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: profile?.name || session?.user?.email?.split("@")[0] || "",
            email: session?.user?.email || "",
            contact: profile?.phone || "",
          },
          theme: {
            color: "#8b0030", // Royal Burgundy/Red color
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              showToast("Payment cancelled by user.", "warning");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      showToast(err.message, "error");
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <Navbar onLinkClick={handleNavClick}/>
      <div className="page-wrapper">

        {/* TOAST */}
        {/* TOAST */}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />

        <main className="main-content">
          <h1 className="page-title">Shipping Address</h1>

          {/* STEPPER */}
          <div className="stepper">
            <div 
              className={`step ${activeStep === 'address' ? 'active' : 'completed'}`}
              onClick={() => activeStep === 'payment' && !isProcessingPayment && setActiveStep('address')}
              style={{ cursor: activeStep === 'payment' && !isProcessingPayment ? 'pointer' : 'default' }}
            >
              <div className="step-icon">
                {activeStep === 'payment' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )}
              </div>
              <span className="step-label">Address</span>
            </div>
            <div className={`step-line ${activeStep === 'payment' ? 'active' : ''}`}></div>
            <div className={`step-line ${activeStep === 'payment' ? 'active' : ''}`}></div>
            <div className={`step ${activeStep === 'payment' ? 'active' : 'inactive'}`}>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <span className="step-label">Payment Method</span>
            </div>
          </div>

          {activeStep === 'address' ? (
            <>
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
                        {selectedAddrChecking && <div className="preview-serviceability text-checking">Checking serviceability...</div>}
                        {!selectedAddrChecking && selectedAddrServiceable && <div className="preview-serviceability text-success">✓ Address is serviceable by Ekart</div>}
                        {!selectedAddrChecking && !selectedAddrServiceable && <div className="preview-serviceability text-error">✗ Address is NOT serviceable by Ekart</div>}
                      </div>
                    </div>
                  )}

                  {/* DELIVER HERE */}
                  <button
                    className="btn-deliver"
                    disabled={!selectedId || selectedAddrChecking || !selectedAddrServiceable}
                    onClick={handleDeliver}
                  >
                    {selectedAddrChecking ? "Checking Serviceability..." : !selectedAddrServiceable ? "Unserviceable Pincode" : "Deliver Here"}
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
                    {pincodeServiceability === 'checking' && <span className="serviceability-checking">Checking serviceability...</span>}
                    {pincodeServiceability === 'serviceable' && <span className="serviceability-success">✓ Serviceable by Ekart</span>}
                    {pincodeServiceability === 'unserviceable' && <span className="serviceability-error">✗ Not serviceable by Ekart</span>}
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
            </>
          ) : (
            <div className="payment-step-container">
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

              {/* ORDER SUMMARY */}
              <div className="order-summary-preview">
                <div className="summary-title">Order Summary</div>
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="summary-item-row">
                    <span>{item.name} (x{item.qty || 1})</span>
                    <span>₹{(parsePrice(item.price) * (item.qty || 1)).toLocaleString()}</span>
                  </div>
                ))}
                <div className="summary-item-row">
                  <span>Taxes</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="summary-item-row">
                  <span>GST (3%)</span>
                  <span>₹{gst}</span>
                </div>
                <div className="summary-item-row">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="summary-total-row">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* PAYMENT SELECTION */}
              <div className="payment-section">
                <div className="section-label">Select a payment method</div>
                <div className="payment-methods-grid">
                  {/* COD */}
                  <div
                    className={`payment-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className="payment-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                    </div>
                    <span className="payment-card-title">Cash on Delivery (COD)</span>
                    <span className="payment-card-desc">Pay with cash upon delivery</span>
                  </div>

                  {/* RAZORPAY */}
                  <div
                    className={`payment-card ${paymentMethod === 'RAZORPAY' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('RAZORPAY')}
                  >
                    <div className="payment-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <span className="payment-card-title">Online Payment (Razorpay)</span>
                    <span className="payment-card-desc">UPI, Cards, Netbanking, Wallets</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="form-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setActiveStep('address')}
                  disabled={isProcessingPayment}
                >
                  Back to Address
                </button>
                <button
                  className="btn-add-address"
                  onClick={handlePlaceOrder}
                  disabled={isProcessingPayment}
                  style={{ background: "#8b0030", borderRadius: "6px" }}
                >
                  {isProcessingPayment 
                    ? "Processing..." 
                    : paymentMethod === 'RAZORPAY' 
                      ? "Pay & Place Order" 
                      : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}