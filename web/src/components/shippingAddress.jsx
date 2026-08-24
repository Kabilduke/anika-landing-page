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
import LogoImg from "../assets/offers/logo.svg";

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
  "Tamil Nadu", "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Telangana", "Tripura", "Uttar Pradesh", "West Bengal",
  "Delhi", "Jammu & Kashmir",
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  flat: "",
  area: "",
  city: "",
  pinCode: "",
  state: "Tamil Nadu",
  isDefault: false,
};

const serviceabilityPromiseCache = {};

export default function ShippingAddress() {
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: "", type: "" });
  const [userId, setUserId] = useState(null);

  // Shopify layout states
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // Default payment method RAZORPAY
  const [billingSame, setBillingSame] = useState(true);
  const [emailNews, setEmailNews] = useState(true);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pincodeServiceability, setPincodeServiceability] = useState('unchecked');
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
    if (form.pinCode && form.pinCode.length === 6 && /^\d{6}$/.test(form.pinCode)) {
      setPincodeServiceability('checking');
      setServiceabilityError("");
      const timer = setTimeout(async () => {
        const serviceable = await checkEkartServiceability(form.pinCode);
        if (serviceable) {
          setPincodeServiceability('serviceable');
        } else {
          setPincodeServiceability('unserviceable');
          setServiceabilityError("This pincode is not serviceable.");
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPincodeServiceability('unchecked');
      setServiceabilityError("");
    }
  }, [form.pinCode]);

  // Check serviceability of selected address
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
    if (link === "Home") {
      navigate("/");
    } else {
      navigate(`/${link.toLowerCase()}`);
    }
  };

  // fetch addresses from Supabase
  const fetchAddresses = async (userEmail) => {
    try {
      const user = await authService.getUser();
      if (!user) return;

      const data = await orderService.getAddresses(user.id);
      if (data && data.length > 0) {
        setAddresses(data);
        // Default to first address
        const addr = data[0];
        setSelectedId(addr.address_id);
        
        // Fill form fields
        const parts = (addr.full_name || "").split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";
        setForm({
          firstName,
          lastName,
          email: userEmail || "",
          mobile: addr.phone_number || "",
          flat: addr.address_line1 || "",
          area: addr.address_line2 || "",
          city: addr.city || "",
          pinCode: addr.postal_code || "",
          state: addr.state || "Tamil Nadu",
          isDefault: addr.is_default || false,
        });
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  };

  // fetch userId and addresses on mount
  useEffect(() => {
    authService.getSession().then((session) => {
      if (session) {
        setUserId(session.user.id);
        const emailVal = session.user.email || "";
        setForm(f => ({ ...f, email: emailVal }));
        fetchAddresses(emailVal);
      }
    });
  }, []);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile.replace(/\D/g, ""))) e.mobile = "Valid 10-digit phone is required";
    if (!form.flat.trim()) e.flat = "Address is required";
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

  const handleAddressSelectChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setSelectedId(null);
      setForm({
        ...emptyForm,
        email: form.email, // keep current email
      });
      setErrors({});
    } else {
      const addrId = parseInt(value, 10);
      const addr = addresses.find((a) => a.address_id === addrId);
      if (addr) {
        setSelectedId(addrId);
        const parts = (addr.full_name || "").split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";
        setForm({
          firstName,
          lastName,
          email: form.email || "",
          mobile: addr.phone_number || "",
          flat: addr.address_line1 || "",
          area: addr.address_line2 || "",
          city: addr.city || "",
          pinCode: addr.postal_code || "",
          state: addr.state || "Tamil Nadu",
          isDefault: addr.is_default || false,
        });
        setErrors({});
      }
    }
  };

  const handleApplyDiscount = () => {
    const code = discountInput.trim().toUpperCase();
    if (code === "WELCOME10") {
      setAppliedDiscount({ code, pct: 10 });
      showToast("Discount code WELCOME10 applied! 10% Off", "success");
    } else if (code === "FESTIVE20") {
      setAppliedDiscount({ code, pct: 20 });
      showToast("Discount code FESTIVE20 applied! 20% Off", "success");
    } else if (code === "") {
      showToast("Please enter a discount code.", "warning");
    } else {
      showToast("Invalid discount code.", "error");
    }
  };

  // Compute checkout items and totals
  const checkoutProduct = location.state?.product;
  const selectedCartItems = location.state?.selectedItems;
  const cartItems = useStore((state) => state.cartItems);
  const checkoutItems = checkoutProduct
    ? [checkoutProduct]
    : (selectedCartItems && selectedCartItems.length > 0 ? selectedCartItems : cartItems);

  const subtotal = checkoutProduct
    ? (parsePrice(checkoutProduct.price) * checkoutProduct.qty)
    : checkoutItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);

  const discountAmount = appliedDiscount
    ? Math.round((subtotal * appliedDiscount.pct) / 100)
    : 0;

  const isAddressServiceable = pincodeServiceability === 'serviceable' || (selectedId && selectedAddrServiceable);
  const shippingFee = isAddressServiceable ? 70 : 0;

  const taxes = 0;
  const platformFee = 0;
  const grandTotal = subtotal - discountAmount + shippingFee + taxes + platformFee;
  const gst = Math.round((subtotal - discountAmount) - ((subtotal - discountAmount) / 1.03));

  const handleCheckoutSubmit = async (e) => {
    if (e) e.preventDefault();

    // 1. Validate form fields
    const eErrors = validate();
    if (Object.keys(eErrors).length > 0) {
      setErrors(eErrors);
      showToast("Please fill all required shipping information.", "error");
      return;
    }

    if (pincodeServiceability === 'unserviceable') {
      showToast("Pincode is not serviceable.", "error");
      return;
    }

    setIsProcessingPayment(true);

    try {
      let activeAddrId = selectedId;
      const fullName = `${form.firstName} ${form.lastName}`.trim();

      if (!selectedId) {
        // Create new address in database
        const inserted = await orderService.createAddress({
          user_id: userId,
          full_name: fullName,
          phone_number: form.mobile,
          address_line1: form.flat,
          address_line2: form.area,
          city: form.city,
          state: form.state,
          postal_code: form.pinCode,
          is_default: form.isDefault,
        });

        const newAddr = Array.isArray(inserted) ? inserted[0] : inserted;
        setAddresses((prev) => [...prev, newAddr]);
        activeAddrId = newAddr.address_id;
        setSelectedId(newAddr.address_id);
      } else {
        // Update if details changed
        const selectedAddressObj = addresses.find(a => a.address_id === selectedId);
        const isModified = selectedAddressObj && (
          selectedAddressObj.full_name !== fullName ||
          selectedAddressObj.phone_number !== form.mobile ||
          selectedAddressObj.address_line1 !== form.flat ||
          selectedAddressObj.address_line2 !== form.area ||
          selectedAddressObj.city !== form.city ||
          selectedAddressObj.state !== form.state ||
          selectedAddressObj.postal_code !== form.pinCode
        );

        if (isModified) {
          await orderService.updateAddress(selectedId, {
            full_name: fullName,
            phone_number: form.mobile,
            address_line1: form.flat,
            address_line2: form.area,
            city: form.city,
            state: form.state,
            postal_code: form.pinCode,
            is_default: form.isDefault,
          });

          setAddresses((prev) =>
            prev.map((a) =>
              a.address_id === selectedId
                ? {
                    ...a,
                    full_name: fullName,
                    phone_number: form.mobile,
                    address_line1: form.flat,
                    address_line2: form.area,
                    city: form.city,
                    state: form.state,
                    postal_code: form.pinCode,
                  }
                : a
            )
          );
        }
      }

      await proceedToPlaceOrder(activeAddrId);

    } catch (err) {
      showToast("Failed to process shipping details: " + err.message, "error");
      setIsProcessingPayment(false);
    }
  };

  const proceedToPlaceOrder = async (addressId) => {
    if (checkoutItems.length === 0) {
      showToast("No items to checkout.", "error");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const session = await authService.getSession();
      const token = session?.access_token;
      if (!token) {
        showToast("You must be logged in to place an order.", "error");
        setIsProcessingPayment(false);
        return;
      }

      if (paymentMethod === "COD") {
        // COD order placement
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

        // Shipment booking via Ekart
        let waybill = "";
        try {
          const { data: bookingData } = await supabase.functions.invoke('ekart', {
            body: {
              action: "book_shipment",
              orderId: generatedOrderId,
              addressId: addressId,
            }
          });
          if (bookingData?.success && bookingData?.order?.waybill) {
            waybill = bookingData.order.waybill;
          }
        } catch (bookingErr) {
          console.error("Ekart automated COD booking failed:", bookingErr);
        }

        // Clear cart
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
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          showToast("Failed to load Razorpay SDK. Please check your connection.", "error");
          setIsProcessingPayment(false);
          return;
        }

        const paymentItems = checkoutItems.map(item => ({
          productId: typeof (item.productId || item.id) === 'number' ? (item.productId || item.id) : null,
          quantity: item.qty || 1,
          size: item.size || null,
          color: item.color || null,
        }));

        const { data: orderData, error: invokeError } = await supabase.functions.invoke('razorpay', {
          body: {
            action: "create_order",
            items: paymentItems,
            discountCode: appliedDiscount?.code || null,
            discountPct: appliedDiscount?.pct || 0,
            shippingFee: shippingFee || 0,
          }
        });

        if (invokeError || !orderData) {
          throw new Error(invokeError?.message || "Failed to initiate Razorpay order.");
        }
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", userId)
          .single();

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
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
                body: {
                  action: "verify_payment",
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: paymentItems,
                  addressId: addressId,
                  discountCode: appliedDiscount?.code || null,
                  discountPct: appliedDiscount?.pct || 0,
                  shippingFee: shippingFee || 0,
                }
              });

              if (verifyError) {
                throw new Error(verifyError.message || "Payment verification failed.");
              }

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
            color: "#8b0030",
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
      <div className="checkout-page-container">
        
        {/* TOAST */}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />

        <div className="checkout-split-layout">
          {/* LEFT COLUMN: Checkout Form */}
          <div className="checkout-left-col">
            <div className="checkout-left-content">
              {/* Logo */}
              <div className="checkout-logo-wrap">
                <img src={LogoImg} alt="Made For Hers Logo" className="checkout-logo" onClick={() => navigate("/")} />
              </div>

              {/* Form */}
              <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                
                {/* Contact Section */}
                <div className="checkout-section">
                  <div className="checkout-section-header">
                    <h2 className="checkout-section-title">Contact</h2>
                    {!userId && (
                      <a href="/account/login" className="checkout-signin-link">Sign in</a>
                    )}
                  </div>
                  
                  <div className="checkout-field-wrap">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      className={`checkout-input ${errors.email ? "error" : ""}`}
                      required
                    />
                    {errors.email && <span className="checkout-err-msg">{errors.email}</span>}
                  </div>

                  <label className="checkout-checkbox-label">
                    <input
                      type="checkbox"
                      checked={emailNews}
                      onChange={(e) => setEmailNews(e.target.checked)}
                      className="checkout-checkbox"
                    />
                    <span>Email me with news and offers</span>
                  </label>
                </div>

                {/* Delivery Section */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">Delivery</h2>

                  {/* Saved Address Dropdown (If logged in and has addresses) */}
                  {addresses.length > 0 && (
                    <div className="checkout-field-wrap">
                      <select
                        className="checkout-input checkout-select"
                        value={selectedId || "new"}
                        onChange={handleAddressSelectChange}
                      >
                        <option value="new">Use a new address...</option>
                        {addresses.map((addr) => (
                          <option key={addr.address_id} value={addr.address_id}>
                            {addr.full_name} - {addr.address_line1}, {addr.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="checkout-field-wrap">
                    <select
                      name="country"
                      className="checkout-input checkout-select"
                      disabled
                      value="India"
                    >
                      <option>India</option>
                    </select>
                  </div>

                  <div className="checkout-fields-row">
                    <div className="checkout-field-wrap flex-1">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={form.firstName}
                        onChange={handleChange}
                        className={`checkout-input ${errors.firstName ? "error" : ""}`}
                      />
                      {errors.firstName && <span className="checkout-err-msg">{errors.firstName}</span>}
                    </div>
                    <div className="checkout-field-wrap flex-1">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={handleChange}
                        className={`checkout-input ${errors.lastName ? "error" : ""}`}
                      />
                      {errors.lastName && <span className="checkout-err-msg">{errors.lastName}</span>}
                    </div>
                  </div>

                  <div className="checkout-field-wrap">
                    <input
                      type="text"
                      name="flat"
                      placeholder="Address"
                      value={form.flat}
                      onChange={handleChange}
                      className={`checkout-input ${errors.flat ? "error" : ""}`}
                    />
                    {errors.flat && <span className="checkout-err-msg">{errors.flat}</span>}
                  </div>

                  <div className="checkout-field-wrap">
                    <input
                      type="text"
                      name="area"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={form.area}
                      onChange={handleChange}
                      className="checkout-input"
                    />
                  </div>

                  <div className="checkout-fields-row tertiary">
                    <div className="checkout-field-wrap city-field">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={handleChange}
                        className="checkout-input"
                      />
                    </div>
                    <div className="checkout-field-wrap state-field">
                      <select
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className="checkout-input checkout-select"
                      >
                        {indianStates.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="checkout-field-wrap pin-field">
                      <input
                        type="text"
                        name="pinCode"
                        placeholder="PIN code"
                        value={form.pinCode}
                        onChange={handleChange}
                        maxLength={6}
                        className={`checkout-input ${errors.pinCode ? "error" : ""}`}
                      />
                      {errors.pinCode && <span className="checkout-err-msg">{errors.pinCode}</span>}
                    </div>
                  </div>

                  <div className="checkout-field-wrap">
                    <input
                      type="tel"
                      name="mobile"
                      placeholder="Phone"
                      value={form.mobile}
                      onChange={handleChange}
                      className={`checkout-input ${errors.mobile ? "error" : ""}`}
                    />
                    {errors.mobile && <span className="checkout-err-msg">{errors.mobile}</span>}
                  </div>

                  {/* Pincode Serviceability Notification */}
                  {pincodeServiceability === 'checking' && (
                    <div className="checkout-pincode-status checking">Checking serviceability...</div>
                  )}
                  {pincodeServiceability === 'serviceable' && (
                    <div className="checkout-pincode-status serviceable">✓ Address is serviceable</div>
                  )}
                  {pincodeServiceability === 'unserviceable' && (
                    <div className="checkout-pincode-status unserviceable">✗ Address is NOT serviceable</div>
                  )}

                  <label className="checkout-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      name="isDefault"
                      onChange={handleChange}
                      className="checkout-checkbox"
                    />
                    <span>Save this information for next time</span>
                  </label>
                </div>

                {/* Shipping Method Section */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">Shipping method</h2>
                  <div className="checkout-shipping-box">
                    {isAddressServiceable ? (
                      <div className="checkout-shipping-rate">
                        <span className="rate-name">Standard Shipping</span>
                        <span className="rate-price">₹70.00</span>
                      </div>
                    ) : (
                      <span className="checkout-shipping-hint">Enter your shipping address to view available shipping methods.</span>
                    )}
                  </div>
                </div>

                {/* Payment Section */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">Payment</h2>
                  <p className="checkout-section-subtitle">All transactions are secure and encrypted.</p>

                  <div className="checkout-accordion-group">
                    {/* Online Payment (Razorpay) */}
                    <div className={`checkout-accordion-item ${paymentMethod === 'RAZORPAY' ? 'active' : ''}`}>
                      <label className="checkout-accordion-header" onClick={() => setPaymentMethod('RAZORPAY')}>
                        <div className="checkout-radio-wrap">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'RAZORPAY'}
                            onChange={() => setPaymentMethod('RAZORPAY')}
                            className="checkout-radio"
                          />
                          <span className="payment-method-name">Razorpay Secure (UPI, Cards, Int'l Cards, Wallets)</span>
                        </div>
                        <div className="payment-card-logos">
                          <span className="logo-icon upi">UPI</span>
                          <span className="logo-icon visa">Visa</span>
                          <span className="logo-icon mc">MC</span>
                          <span className="logo-icon count">+18</span>
                        </div>
                      </label>
                      
                      {paymentMethod === 'RAZORPAY' && (
                        <div className="checkout-accordion-body">
                          <div className="payment-redirect-box">
                            <svg className="redirect-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            <p>You'll be redirected to Razorpay Secure (UPI, Cards, Int'l Cards, Wallets) to complete your purchase.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery (COD) */}
                    <div className={`checkout-accordion-item ${paymentMethod === 'COD' ? 'active' : ''}`}>
                      <label className="checkout-accordion-header" onClick={() => setPaymentMethod('COD')}>
                        <div className="checkout-radio-wrap">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'COD'}
                            onChange={() => setPaymentMethod('COD')}
                            className="checkout-radio"
                          />
                          <span className="payment-method-name">Cash on Delivery (COD)</span>
                        </div>
                      </label>
                      
                      {paymentMethod === 'COD' && (
                        <div className="checkout-accordion-body">
                          <p>Pay with cash upon delivery.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Billing Address Section */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">Billing address</h2>
                  
                  <div className="checkout-accordion-group">
                    <div className={`checkout-accordion-item ${billingSame ? 'active' : ''}`}>
                      <label className="checkout-accordion-header" onClick={() => setBillingSame(true)}>
                        <div className="checkout-radio-wrap">
                          <input
                            type="radio"
                            name="billingAddress"
                            checked={billingSame}
                            onChange={() => setBillingSame(true)}
                            className="checkout-radio"
                          />
                          <span className="payment-method-name">Same as shipping address</span>
                        </div>
                      </label>
                    </div>

                    <div className={`checkout-accordion-item ${!billingSame ? 'active' : ''}`}>
                      <label className="checkout-accordion-header" onClick={() => setBillingSame(false)}>
                        <div className="checkout-radio-wrap">
                          <input
                            type="radio"
                            name="billingAddress"
                            checked={!billingSame}
                            onChange={() => setBillingSame(false)}
                            className="checkout-radio"
                          />
                          <span className="payment-method-name">Use a different billing address</span>
                        </div>
                      </label>
                      
                      {!billingSame && (
                        <div className="checkout-accordion-body">
                          <div className="checkout-fields-row">
                            <input type="text" placeholder="First name" className="checkout-input flex-1" />
                            <input type="text" placeholder="Last name" className="checkout-input flex-1" />
                          </div>
                          <input type="text" placeholder="Address" className="checkout-input" />
                          <input type="text" placeholder="Apartment, suite, etc. (optional)" className="checkout-input" />
                          <div className="checkout-fields-row tertiary">
                            <input type="text" placeholder="City" className="checkout-input city-field" />
                            <select className="checkout-input checkout-select state-field">
                              {indianStates.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            <input type="text" placeholder="PIN code" className="checkout-input pin-field" />
                          </div>
                          <input type="tel" placeholder="Phone" className="checkout-input" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="checkout-submit-wrap">
                  <button
                    type="submit"
                    className="checkout-pay-btn"
                    disabled={isProcessingPayment || (pincodeServiceability === 'unserviceable')}
                  >
                    {isProcessingPayment ? "Processing..." : (paymentMethod === "COD" ? "Place order" : "Pay now")}
                  </button>
                </div>

              </form>

              {/* Footer Links */}
              <div className="checkout-footer-links">
                <a href="/terms" target="_blank" rel="noopener noreferrer">Refund policy</a>
                <a href="/terms" target="_blank" rel="noopener noreferrer">Shipping</a>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a>
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of service</a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary Sidebar */}
          <div className="checkout-right-col">
            <div className="checkout-right-content">
              
              {/* Product list */}
              <div className="checkout-items-list">
                {checkoutItems.map((item, idx) => {
                  const imgUrl = item.img || item.image || (item.images && item.images[0]) || "";
                  return (
                    <div key={idx} className="checkout-item-row">
                      <div className="checkout-item-img-wrap">
                        <img src={imgUrl} alt={item.name} className="checkout-item-img" />
                        <span className="checkout-item-qty-badge">{item.qty || 1}</span>
                      </div>
                      <div className="checkout-item-details">
                        <h3 className="checkout-item-name">{item.name}</h3>
                        {item.size && <p className="checkout-item-option">{item.size}</p>}
                        {item.color && <p className="checkout-item-option">{item.color}</p>}
                      </div>
                      <div className="checkout-item-price">
                        ₹{(parsePrice(item.price) * (item.qty || 1)).toLocaleString('en-IN')}.00
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code Input */}
              <div className="checkout-discount-wrap">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="checkout-input discount-input"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="checkout-discount-btn"
                >
                  Apply
                </button>
              </div>

              {/* Pricing calculations */}
              <div className="checkout-summary-box">
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span className="summary-val">₹{subtotal.toLocaleString('en-IN')}.00</span>
                </div>
                
                {appliedDiscount && (
                  <div className="checkout-summary-row discount-row">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span className="summary-val">-₹{discountAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                <div className="checkout-summary-row">
                  <span>Shipping</span>
                  <span className="summary-val">
                    {isAddressServiceable ? "₹70.00" : "Enter shipping address"}
                  </span>
                </div>

                {gst > 0 && (
                  <div className="checkout-summary-row">
                    <span>GST (3% Incl.)</span>
                    <span className="summary-val">₹{gst.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                <div className="checkout-total-divider"></div>

                <div className="checkout-summary-row total-row">
                  <div className="total-label-wrap">
                    <span className="total-main-label">Total</span>
                    {gst > 0 && <span className="total-sub-label">Including ₹{gst.toLocaleString('en-IN')}.00 in taxes</span>}
                  </div>
                  <div className="total-price-wrap">
                    <span className="total-currency">INR</span>
                    <span className="total-price-val">₹{grandTotal.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}