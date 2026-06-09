## ADDED Requirements

### Requirement: Cart and Wishlist DB Persistence
The database SHALL support persisting cart and wishlist items for authenticated users via `cart_items` and `wishlist_items` tables.

#### Scenario: Authenticated Cart Retrieve
- **WHEN** an authenticated user logs in or visits the storefront
- **THEN** the store SHALL fetch cart items from `public.cart_items` and merge them with local cart items, resolving conflicts by retaining the highest quantity of the same item.

### Requirement: Row-Level Security Policies
The `public.cart_items` and `public.wishlist_items` tables MUST be protected by Row-Level Security (RLS) policies allowing access only to the owner.

#### Scenario: Attempting to Read Other User Cart
- **WHEN** a user tries to query `cart_items` belonging to another user id
- **THEN** the query SHALL return zero records or raise an RLS policy violation error.
