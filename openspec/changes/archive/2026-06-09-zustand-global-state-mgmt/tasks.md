## 1. Database & Infrastructure

- [x] 1.1 Create a new database migration file under `supabase/migrations` to create `cart_items` and `wishlist_items` tables with RLS policies and foreign keys to `auth.users` and `products`.
- [x] 1.2 Run supabase db migration or verify schema locally.

## 2. Frontend Dependencies and Store Setup

- [x] 2.1 Add `zustand` dependency to `web/package.json` and install it.
- [x] 2.2 Create Zustand stores for catalog (products and categories) caching, user session, and cart/wishlist.
- [x] 2.3 Implement services/functions in `web/src/services` to query/update backend cart and wishlist tables.

## 3. Global State Store Logic & Synchronization

- [x] 3.1 Implement fetching/sync actions in the Zustand store that retrieve cart/wishlist from DB if user is authenticated, otherwise fall back to/retrieve from `localStorage`.
- [x] 3.2 Implement merging rules for cart items upon user login.
- [x] 3.3 Set up a listener for Supabase authentication state changes to trigger sync/clear actions in Zustand.

## 4. UI Refactoring & Caching

- [x] 4.1 Update `categorypage.jsx` to fetch products/categories through the Zustand store (using cache if available).
- [x] 4.2 Update `CartPage.jsx` to load and mutate state via the Zustand cart store.
- [x] 4.3 Update `wishlistPage.jsx` to load and mutate state via the Zustand wishlist store.
- [x] 4.4 Update other storefront components (`SiteHeader.jsx`, `ProductDetails.jsx`, `App.jsx`) to consume state from Zustand.

## 5. Verification & Finalization

- [x] 5.1 Perform manual verification of cart persistence (both as guest and logged-in user).
- [x] 5.2 Verify that navigating between categories does not generate redundant API calls.
- [x] 5.3 Run `graphify update .` to update the knowledge graph.
