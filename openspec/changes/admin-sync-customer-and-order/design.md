## Context

The administrative pages (Dashboard Home, All Orders, All Customers, Order Details, Customer Details, and Analytics) currently render mock arrays. Placing a new order or updating a profile has no visible effect on these screens. Additionally, the admin interface cannot view customer profiles or customer emails due to missing database columns and restrictive Row-Level Security (RLS) policies.

## Goals / Non-Goals

**Goals:**
* Sync orders and customer lists dynamically from the Supabase database.
* Enable real-time updates on the admin dashboard and lists using Supabase Realtime channels.
* Update database schemas (`public.profiles`) to capture registration emails and timestamps, and implement RLS policies that grant administrative access.
* Compute dashboard summary statistics and charts dynamically based on active database rows.

**Non-Goals:**
* Modifying the checkout process or payment gateway handlers.
* Building advanced messaging/notification hubs.

## Decisions

### Decision 1: Profiles Schema Enhancement
We will add `email` (text) and `created_at` (timestamptz) columns to `public.profiles` and modify the trigger function `handle_new_user` to store them when a user registers.
* **Alternatives Considered**: Fetch user emails using a custom Edge Function or a Postgres view of `auth.users`.
* **Rationale**: PostgREST/Supabase client restricts querying `auth.users` directly to prevent user information harvesting. Duplicating the email and registration date in the public profiles table is the standard Supabase pattern for public directory indexing, secured via role-based RLS policies.

### Decision 2: Client-side Order-Customer Aggregation via Custom Hooks
Instead of performing complex SQL joins, creating database views, or writing inline mapping logic within presentation components, the admin data fetching hook (`useAdminData`) will load orders and profiles, and aggregate customer profiles to orders dynamically.
* **Alternatives Considered**: Perform inline joins in JSX page components, or modify the database schema to force relation references.
* **Rationale**: Separates data formatting/join logic from visual display (SRP). Presentation components can simply consume clean aggregated objects without knowing how the data is joined.

### Decision 3: Encapsulated Realtime Channels
Rather than declaring inline Supabase subscription side-effects directly in page components, we will encapsulate database realtime subscriptions inside dedicated custom hooks (e.g. `useRealtimeOrders`, `useRealtimeCustomers`).
* **Alternatives Considered**: Direct inline `supabase.channel` subscriptions inside the `useEffect` hooks of multiple page components.
* **Rationale**: Encapsulating subscriptions in custom hooks ensures subscription state, event filters, list update calculations, and cleanup lifecycles are defined once (SRP and DRY). This also isolates the dependency on the Supabase client implementation, allowing easier testing and future data layer modifications (DIP).

## Risks / Trade-offs

* **[Risk] Unauthorized user profile reads** &rarr; **Mitigation**: The select policy on `public.profiles` checks the registry `public.admin_users` for the user's UID and role, ensuring only authenticated admins can select multiple rows.
* **[Risk] Out of sync charts or missing details** &rarr; **Mitigation**: Render skeleton loaders or descriptive loading/empty states gracefully when database values are loading, missing, or incomplete.

