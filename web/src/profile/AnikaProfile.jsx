import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { authService } from "../services/authService";
import { useStore } from "../hooks/useStore";
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import "./AnikaProfile.css";
import Navbar from "../components/SiteHeader";
import Footer from "../components/SiteFooter";

export default function AnikaProfile() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

    const handleNavClick = (link) => {
    if (link === "Home") {
      navigate("/");
    } else {
      navigate(`/${link.toLowerCase()}`);
    }
  };

  const wishlistItems = useStore((state) => state.wishlistItems);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const setSelectedProduct = useStore((state) => state.setSelectedProduct);

  const [userOrders, setUserOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    customerSince: "",
    totalOrders: "0 orders",
  });
  const [tempDetails, setTempDetails] = useState({ ...customerDetails });

  // Fetch real user data, orders, and products map
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const session = await authService.getSession();
        const user = session?.user;

        if (!user) {
          navigate("/account/login");
          return;
        }

        const joinedDate = new Date(user.created_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });

        // Fetch user's orders from database
        const ordersData = await orderService.getOrders(user.id);
        setUserOrders(ordersData || []);
        const orderCountStr = `${ordersData?.length || 0} order${ordersData?.length !== 1 ? 's' : ''}`;

        const details = {
          name: user.user_metadata?.name || "No name set",
          phone: user.user_metadata?.phone || "No phone set",
          email: user.email,
          customerSince: joinedDate,
          totalOrders: orderCountStr,
        };

        setCustomerDetails(details);
        setTempDetails(details);

        // Fetch products to map item names to full product rows
        const productsData = await productService.getProducts();
        const map = {};
        if (productsData) {
          productsData.forEach((p) => {
            map[p.name] = p;
          });
        }
        setProductsMap(map);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setTempDetails({ ...customerDetails });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // ← save name and phone back to Supabase metadata
      await authService.updateUser({
        data: {
          name: tempDetails.name,
          phone: tempDetails.phone,
        },
      });

      await authService.refreshSession();
      setCustomerDetails({ ...tempDetails });
      setIsEditing(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setTempDetails({ ...customerDetails });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setTempDetails((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = ["Profile", "Orders", "Addresses", "Wishlists", "Account"];

  const handleTabClick = (tab) => {
    if (tab === "Orders") {
      navigate("/profile/orders");
    } else if (tab === "Addresses") {
      navigate("/profile/addresses");
    } else if (tab === "Wishlists") {
      navigate("/profile/wishlists");
    } else if (tab === "Account") {
      navigate("/profile/account");
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <>
      <Navbar onLinkClick={handleNavClick} />
      <div className="anika-root">
        <main className="anika-main">
          <h1 className="anika-profile-title">Profile</h1>

          {/* User Info */}
          <div className="anika-user-info">
            <div className="anika-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="anika-user-text">
              <span className="anika-user-name">{customerDetails.name}</span>
              <span className="anika-user-meta">
                {customerDetails.email} &nbsp;·&nbsp; Member since {customerDetails.customerSince}
              </span>
              <span className="anika-vip-badge">{customerDetails.totalOrders}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="anika-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`anika-tab${activeTab === tab ? " anika-tab--active" : ""}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Customer Details Card */}
          <div className="anika-card">
            <div className="anika-card-header">
              <span className="anika-card-title">Customer details</span>
              <div className="anika-card-header-actions">
                {isEditing ? (
                  <>
                    <button className="anika-save-btn" onClick={handleSave}>Save</button>
                    <button className="anika-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <button className="anika-edit-btn" onClick={handleEdit}>Edit</button>
                )}
              </div>
            </div>
            <div className="anika-card-body">
              <div className="anika-detail-row">
                <span className="anika-detail-label">Name</span>
                {isEditing ? (
                  <input
                    className="anika-detail-input"
                    value={tempDetails.name}
                    placeholder="Enter your name"
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                ) : (
                  <span className="anika-detail-value">{customerDetails.name}</span>
                )}
              </div>
              <div className="anika-detail-row">
                <span className="anika-detail-label">Phone</span>
                {isEditing ? (
                  <input
                    className="anika-detail-input"
                    value={tempDetails.phone}
                    placeholder="Enter your phone"
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                ) : (
                  <span className="anika-detail-value">{customerDetails.phone}</span>
                )}
              </div>
              <div className="anika-detail-row">
                <span className="anika-detail-label">Email</span>
                {/* email is read-only — comes from Supabase Auth */}
                <span className="anika-detail-value">{customerDetails.email}</span>
              </div>
              <div className="anika-detail-row">
                <span className="anika-detail-label">Customer Since</span>
                <span className="anika-detail-value">{customerDetails.customerSince}</span>
              </div>
              <div className="anika-detail-row">
                <span className="anika-detail-label">Total Orders</span>
                <span className="anika-detail-value">{customerDetails.totalOrders}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}