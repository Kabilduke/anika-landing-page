## Why

Currently, frontend components fetch product catalogs, category details, and user profiles directly from Supabase/API on every page mount or category transition, leading to redundant network requests and slower page load times. Furthermore, cart and wishlist states are stored in isolated component states or mock data, lacking persistence, global access, and synchronization with the database.

## What Changes

- Introduce `zustand` as the global state management library for the frontend.
- Implement a global store for products, categories, cart, wishlist, and user session.
- Cache products and categories on first visit, serving subsequent views from the store to eliminate redundant database calls.
- Create database tables `public.cart_items` and `public.wishlist_items` to persist cart and wishlist items for authenticated users.
- Sync state automatically to/from Supabase when a user session changes or cart/wishlist are updated.
- Refactor storefront components (`CartPage`, `CategoryPage`, `WishlistPage`, `ProductDetails`, etc.) to use Zustand stores instead of local React states and repeated API calls.

## Capabilities

### New Capabilities
- `global-state-store`: Global state management layer using Zustand to manage and cache storefront catalogs (products, categories) and handle auth session, cart, and wishlist states.
- `db-sync-service`: Cart and wishlist database sync service to persist user cart/wishlist items on Supabase with row-level security.

### Modified Capabilities
- `api-services-layer`: The services layer will be extended to support cart and wishlist DB sync and provide session indicators for state sync triggers.

## Impact

- **Frontend**: Add `zustand` to dependencies. Refactor `CartPage.jsx`, `categorypage.jsx`, `wishlistPage.jsx`, `SiteHeader.jsx`, `ProductDetails.jsx`, and `App.jsx`.
- **Database**: Add migrations to create `cart_items` and `wishlist_items` tables with appropriate RLS policies.
- **Services**: Implement cart and wishlist database query functions in `orderService.js` or new service files.
