## Why

Currently, the admin panel's orders dashboard and customer pages display static mock data. When a customer finishes an order and processes payment (either COD or Razorpay online payment), the admin dashboard does not receive updates in real-time, nor does the admin have access to real customer accounts and emails from the database. Syncing this data dynamically and in real-time will enable administrative users to track and manage order fulfillment and customer accounts accurately.

## What Changes

* **Database Schema Modifications**:
  * Add `email` and `created_at` columns to `public.profiles` table.
  * Update Postgres trigger `handle_new_user` on `auth.users` to automatically populate user emails and account creation times into `public.profiles`.
  * Create database migration script to backfill `email` and `created_at` fields for existing profiles from `auth.users`.
* **Row-Level Security (RLS)**:
  * Add SELECT policy on `public.profiles` table to allow administrative users (`role = 'admin'` check from `public.admin_users`) to read all customer profiles.
* **API Services (Frontend)**:
  * Extend `orderService` with functions to fetch all orders (`getAllOrders`) and all customers (`getAllCustomers`).
  * Implement update handler for order status (`updateOrderStatus`) within the order service.
* **Frontend Real-time Sync**:
  * Integrate dynamic state loading and real-time database subscriptions (`postgres_changes` listener via Supabase) in the admin dashboard page (`Dashboard.jsx`), order list (`Allorders.jsx`), customer list (`Allcustomers.jsx`), and details views to automatically update metrics and tables.

## Capabilities

### New Capabilities
- `admin-order-customer-sync`: Dynamic data synchronization, aggregation, and real-time synchronization of customer details and orders for administrative views.

### Modified Capabilities
<!-- None -->

## Impact

* **Supabase Database**: New migration adding fields and an admin view policy to the `profiles` table.
* **Web App**:
  * `web/src/services/orderService.js`: Added query operations for fetching all records and executing admin updates.
  * `web/src/admin/pages/Dashboard.jsx`: Refactored dashboard homepage to aggregate totals dynamically from active data, and subscribe to realtime Postgres inserts/updates.
  * `web/src/admin/pages/Allorders.jsx` and `web/src/admin/pages/Allcustomers.jsx`: Converted local/mock list states to fetch from backend and subscribe to realtime table broadcasts.
  * `web/src/admin/pages/Orderdetails.jsx` and `web/src/admin/pages/Customerdetails.jsx`: Modified details components to render real customer profiles, addresses, and order histories from fetched state.
