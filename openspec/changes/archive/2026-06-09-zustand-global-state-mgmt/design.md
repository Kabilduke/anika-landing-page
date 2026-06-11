## Context

Currently, the storefront frontend does not persist cart and wishlist items in a database, and catalog data (products and categories) is fetched on every component mount/page navigation. This design outlines how we will introduce Zustand for global state management to:
1. Cache product catalog and category metadata in memory to reduce Supabase API calls.
2. Implement robust cart and wishlist stores that support offline guest states (saved to `localStorage`) and automated synchronization with Supabase backend tables once a user logs in.

## Goals / Non-Goals

**Goals:**
- Cache category list and product lists by category to eliminate redundant fetching on back-and-forth navigation.
- Implement `public.cart_items` and `public.wishlist_items` database tables with row-level security (RLS).
- Sync cart and wishlist data automatically between client `localStorage` and Supabase when the user transitions from guest to authenticated state.
- Expose cart/wishlist count and totals globally for display in navbar and layout elements.

**Non-Goals:**
- Caching administrative views or tables.
- Real-time multiplayer synchronization of the cart (active websocket channel).
- Implementing pagination caching (simple category-level caching is sufficient).

## Decisions

### Decision 1: Choice of State Management Library
- **Choice**: Zustand
- **Rationale**: Zustand is extremely lightweight, uses simple hooks, has low boilerplate, and provides easy API integrations outside of React component contexts (e.g., in Supabase auth state change handlers).
- **Alternatives Considered**: Redux Toolkit (too verbose, high boilerplate), React Context API (causes unnecessary re-renders of unrelated components, difficult to optimize without boilerplate wrappers).

### Decision 2: Cart and Wishlist DB Schema
- Add tables `public.cart_items` and `public.wishlist_items`:
  - `cart_items`: `id` (uuid primary key), `user_id` (uuid referencing auth.users), `product_id` (int referencing products.id), `qty` (int), `size` (text, nullable), `created_at`.
  - `wishlist_items`: `id` (uuid primary key), `user_id` (uuid referencing auth.users), `product_id` (int referencing products.id), `created_at`.
- Enable RLS:
  - Users can read/write their own records: `auth.uid() = user_id`.

**SQL Schema Specification:**
```sql
-- Create cart_items table
create table if not exists public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id integer references public.products(id) on delete cascade not null,
  qty integer not null default 1 check (qty > 0),
  size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id, size)
);

alter table public.cart_items enable row level security;

create policy "Users can manage their own cart items" 
  on public.cart_items for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create wishlist_items table
create table if not exists public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id integer references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "Users can manage their own wishlist items" 
  on public.wishlist_items for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```


### Decision 3: State Synchronization Flow
- **Guest state**: Persisted in `localStorage`.
- **Auth state**: Retrieved from Supabase `cart_items` and `wishlist_items` tables.
- **Sync Trigger**: Upon login, the client merges existing guest cart/wishlist items with the database items.
  - Cart merge rules: If an item exists in both, use the larger quantity.
  - Database upload: Write the merged result to Supabase, then continue serving from the DB.
  - On logout: Clear the Zustand store and `localStorage`.

## Risks / Trade-offs

- **Risk**: API write overhead during rapid cart changes (e.g., clicking quantity buttons quickly).
  - **Mitigation**: Update Zustand store synchronously for instant visual feedback. Debounce or execute database sync calls asynchronously.
- **Risk**: Stale product cache if products are updated or deleted on the admin side.
  - **Mitigation**: Implement a mechanism to invalidate cache or set a reasonable cache timeout, or force fetch on page refresh.
