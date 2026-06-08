## Why

Currently, React components across the frontend storefront (`web`) directly call the Supabase SDK client (`supabase.auth`, `supabase.from()`, `supabase.storage`). This tight coupling introduces duplicate logic, makes components harder to maintain and test, and complicates future integrations (like Razorpay Edge functions or alternative APIs).

## What Changes

- **Centralized Services Layer**: Introduce a structured `web/src/services/` directory containing dedicated modules for auth, products, orders, and general API clients.
- **Supabase SDK Decoupling**: Move all raw Supabase SDK queries, storage operations, and auth calls out of UI components and into reusable service methods.
- **Shared API HTTP Client**: Create a modular fetch-based request client (`apiClient.js`) to handle base URLs, headers, and authorization tokens for external APIs and Supabase Edge Functions.
- **Component Refactoring**: Update storefront and admin dashboard components to use the new service modules instead of direct Supabase imports.

## Capabilities

### New Capabilities

- `api-services-layer`: Provides a centralized service architecture for managing database queries, authentication requests, storage bucket assets, and HTTP external endpoint integrations.

### Modified Capabilities

<!-- None -->

## Impact

- **Frontend (`web`)**:
  - Introduces `web/src/services/` containing `apiClient.js`, `authService.js`, `productService.js`, and `orderService.js`.
  - Refactors authorization files (`JewelryLogin.jsx`, `JewelrySignup.jsx`, `OtpVerify.jsx`), profile dashboard files (`AnikaProfile.jsx`, `AnikaOrders.jsx`, `AnikaAddresses.jsx`), checkout forms (`shippingAddress.jsx`), and admin pages (`addcategory.jsx`, `addproduct.jsx`, `Dashboard.jsx`) to import service interfaces.
- **Backend / Database (`supabase`)**: No changes required.
- **Infrastructure / Secrets (`terraform`)**: No changes required.
