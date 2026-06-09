import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./account/JewelrySignup";
import Login from "./account/JewelryLogin";
import OtpVerify from "./account/OtpVerify";
import AnikaProfile from "./profile/AnikaProfile";
import AnikaOrders from "./profile/AnikaOrders";
import AnikaAddresses from "./profile/AnikaAddresses";
import ShippingAddress from "./components/shippingAddress";
import Payment from "./components/CartPage";
import HomePage from './components/HomePage';
import ProductDetails from './components/ProductDetails';
import CategoryPage from "./product/categorypage";
import WishlistPage from './components/wishlistPage'; // ← added
import Cartpage from './components/CartPage';
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./admin/pages/Dashboard";
import { useStore } from './hooks/useStore';

function App() {
  const initAuth = useStore(state => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/product"
          element={
            <ProductDetails
              onBack={() => window.history.back()}
            />
          }
        />
        <Route path="/rings" element={<CategoryPage category="Rings" />} />
        <Route path="/earrings" element={<CategoryPage category="Earrings" />} />
        <Route path="/bracelets" element={<CategoryPage category="Bracelets" />} />
        <Route path="/bangles" element={<CategoryPage category="Bangles" />} />
        <Route path="/necklaces" element={<CategoryPage category="Necklaces" />} />
        <Route path="/account/login" element={<Login />} />
        <Route path="/account/signup" element={<Signup />} />
        <Route path="/account/otp-verify" element={<OtpVerify />} />
        <Route path="/shipping" element={<ShippingAddress />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/profile" element={<AnikaProfile />} />
        <Route path="/profile/orders" element={<AnikaOrders />} />
        <Route path="/profile/addresses" element={<AnikaAddresses />} />
        <Route path="/cart" element={<Cartpage />} />
        <Route path="/wishlist" element={<WishlistPage />} /> {/* ← added */}

        <Route path='/admin/*' element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
