## 1. Setup Services Directory

- [x] 1.1 Create services directory at `web/src/services/`
- [x] 1.2 Implement generic HTTP helper `web/src/services/apiClient.js`

## 2. Core Service Implementation

- [x] 2.1 Implement auth functions in `web/src/services/authService.js` using Supabase SDK
- [x] 2.2 Implement product, category, and storage bucket queries in `web/src/services/productService.js`
- [x] 2.3 Implement orders and address insertion queries in `web/src/services/orderService.js`

## 3. UI Refactoring

- [x] 3.1 Refactor auth views `JewelryLogin.jsx`, `JewelrySignup.jsx`, and `OtpVerify.jsx` to use `authService`
- [x] 3.2 Refactor header navigation `SiteHeader.jsx` and middleware route `AdminRoute.jsx` to use `authService`
- [x] 3.3 Refactor profile pages `AnikaProfile.jsx`, `AnikaOrders.jsx`, and `AnikaAddresses.jsx` to use `authService` and `orderService`
- [x] 3.4 Refactor checkout module `shippingAddress.jsx` to use `orderService`
- [x] 3.5 Refactor admin dashboard views `Dashboard.jsx`, `addcategory.jsx`, and `addproduct.jsx` to use `productService`

## 4. Verification and Cleanup

- [x] 4.1 Run build validation using npm compiler scripts inside the `web` workspace
- [x] 4.2 Audit imports across refactored files to ensure zero direct `supabase` database imports remain in components
- [x] 4.3 Update code knowledge graph using `graphify update`
