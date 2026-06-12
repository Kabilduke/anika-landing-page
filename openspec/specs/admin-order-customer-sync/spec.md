# Admin Order & Customer Sync Spec

## Purpose
This spec defines the requirements for database schema extensions, API services, and real-time dashboard synchronization to support administrative orders and customer management.

## Requirements

### Requirement: Database Schema Extensions and RLS Policies
The database schema SHALL include user email and creation date fields on the profiles table, and enforce Row-Level Security (RLS) policies allowing admin users to view all customer records.
* Table `public.profiles` MUST contain `email` (text) and `created_at` (timestamp with time zone) columns.
* The Postgres function `handle_new_user` and trigger `on_auth_user_created` MUST insert the new user's email and account registration timestamp from `auth.users` into `public.profiles`.
* The `public.profiles` table MUST have an RLS policy checking if the requesting user's ID exists in `public.admin_users` with `role = 'admin'` to allow SELECT query access to all rows.

#### Scenario: Profile Creation upon User Signup
- **WHEN** a new user signs up on the store platform
- **THEN** a profile record is automatically created containing the user's name, phone, email, and the registration timestamp

#### Scenario: Admin Fetching Profiles
- **WHEN** a authenticated user with role 'admin' queries all rows from `public.profiles`
- **THEN** the database returns all customer profile records successfully

#### Scenario: Non-Admin Fetching Other Profiles
- **WHEN** a authenticated user without role 'admin' attempts to query other users' profiles from `public.profiles`
- **THEN** the database RLS policies deny access and return only the user's own profile row or zero records


### Requirement: Admin API Services
The frontend `orderService` SHALL provide functions to query all orders, all customers, and modify orders to support administrative workflows.
* `orderService.getAllOrders()`: Queries all rows from `public.orders`, ordering them by `order_date` descending.
* `orderService.getAllCustomers()`: Queries all rows from `public.profiles`, ordering by `created_at` descending.
* `orderService.updateOrderStatus(orderId, status)`: Modifies the `status` column of the specified order ID.

#### Scenario: Admin Retrieves All Orders
- **WHEN** the admin service requests all customer orders
- **THEN** the system issues a database select on `public.orders` and returns the complete list of order records

#### Scenario: Admin Retrieves All Customers
- **WHEN** the admin service requests all customer accounts
- **THEN** the system issues a database select on `public.profiles` and returns the complete list of profiles


### Requirement: Admin Dashboard Real-time Synchronization
The administrative interfaces SHALL load live data on mount and subscribe to Postgres real-time events to auto-refresh lists, statistics, and detail views.
* The admin pages (`Dashboard.jsx`, `Allorders.jsx`, `Allcustomers.jsx`, `Analytics.jsx`) MUST load actual orders and customer records via custom hooks or services, displaying skeleton loaders when loading, instead of displaying static mock values.
* The frontend data services or custom hooks MUST manage a Supabase realtime channel subscribing to `postgres_changes` on the `orders` and `profiles` tables.
* Upon receiving insert, update, or delete notifications, the hooks MUST automatically compute changes and expose updated states, updating lists and KPIs on the screen.


#### Scenario: Real-time Order Update on Payment Completion
- **WHEN** a customer completes a checkout payment and the order is inserted in `public.orders`
- **THEN** the open admin dashboard immediately updates its order count statistics and inserts the new order at the top of the orders list without requiring a manual page reload

#### Scenario: Real-time Customer Profile Synchronization
- **WHEN** a new customer registers an account or a profile is updated
- **THEN** the admin customer list is updated with the real name, email, phone, and joined date of the customer
