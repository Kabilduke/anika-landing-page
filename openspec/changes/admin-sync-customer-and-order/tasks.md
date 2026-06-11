## 1. Database & Migrations

- [x] 1.1 Create a new migration file `supabase/migrations/20260609000002_admin_sync_policies.sql` to add `email` and `created_at` fields to `public.profiles`.
- [x] 1.2 Update the `public.handle_new_user()` trigger function to populate user emails and registration times, and write a SQL update query to backfill existing records.
- [x] 1.3 Add an RLS SELECT policy on `public.profiles` allowing admin users (using role validation from `public.admin_users`) to read all customer profiles.

- [x] 1.4 Apply migration locally using `supabase db push` or relevant local deploy scripts.
- [x] 1.5 Verify database changes by inspecting the profiles table structure and testing the RLS policies with both admin and non-admin queries.

## 2. API Services (Frontend)

- [x] 2.1 Update `web/src/services/orderService.js` to implement `getAllOrders()`, `getAllCustomers()`, and `updateOrderStatus()`.
- [x] 2.2 Verify new service methods resolve and return records from the database correctly.

## 3. Administrative Components Integration & Custom Hooks

- [x] 3.1 Create custom React hooks (e.g. `useAdminOrders.js` and `useAdminCustomers.js`, or a unified `useAdminData.js`) in `web/src/hooks` to isolate Supabase queries, aggregate profiles to orders, manage real-time subscriptions, and handle connection cleanup.
- [x] 3.2 Refactor `web/src/admin/pages/Dashboard.jsx` to load stats and orders using the custom admin hooks, incorporating skeleton loading states during load.
- [x] 3.3 Refactor `web/src/admin/pages/Allorders.jsx` and `web/src/admin/pages/Allcustomers.jsx` to display live entries using the custom hooks and render skeleton loaders instead of mock lists.
- [x] 3.4 Refactor `web/src/admin/pages/Orderdetails.jsx` and `web/src/admin/pages/Customerdetails.jsx` to render customer addresses, timelines, and details dynamically from the custom data hook or service layer.
- [x] 3.5 Verify that all realtime channels are properly disposed of on component unmount to prevent resource leaks, and manually test the sync dashboard UI flow.

