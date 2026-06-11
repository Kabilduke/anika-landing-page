## Context

The Anika Jewelry storefront (`web`) allows authenticated users to configure delivery addresses and place orders. Currently, orders are directly inserted into the database via the client-side Supabase client with a default status of `'Pending'` and payment method of `'COD'`. To offer online payments via Razorpay, we must construct a secure backend endpoint using Supabase Deno Edge Functions to create Razorpay orders and verify transaction signatures.

## Goals / Non-Goals

**Goals:**
- Implement a single backend endpoint (Supabase Deno Edge Function at `supabase/functions/razorpay`) to manage:
  - Secure Razorpay Order Creation: Validating product details/prices against the database.
  - Razorpay Signature Verification: Checking transaction signatures securely on the server.
- Update the customer-facing `/shipping` page checkout flow to let users choose between Cash on Delivery (COD) and Online Payment (Razorpay).
- Dynamically load the Razorpay Checkout SDK script on the storefront.
- Enhance the `public.orders` database schema to record Razorpay identifiers (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`).
- Ensure Row-Level Security (RLS) policies permit Edge Functions to insert verified paid orders.

**Non-Goals:**
- **Razorpay Webhooks Integration**: Out of scope for this change. We will verify signatures synchronously from the client-to-server callback.
- **Automatic Refund Processing**: Admin panel or client interface refunds are out of scope. Refunds will be managed manually through the Razorpay Merchant Dashboard.
- **Razorpay Subscriptions**: Only one-time direct purchase orders are supported.

## Decisions

### 1. Payment Processing Flow Architecture
We will use a secure backend-oriented workflow to handle payments:
1. **Frontend**: User clicks "Pay & Place Order" with Online Payment selected.
2. **Backend (Edge Function)**: Client sends the product ID and quantity. The Edge Function verifies the user's Supabase JWT, retrieves the product price directly from the `public.products` database table, and uses the Razorpay API to generate a Razorpay order.
3. **Frontend**: Receives the Razorpay `order_id` and opens the Razorpay modal.
4. **Frontend**: On successful payment, the modal returns payment metadata.
5. **Backend (Edge Function)**: The frontend sends the metadata to the Edge Function. The function verifies the HMAC signature using the private key secret. If valid, the function inserts the order record directly into `public.orders` with `status = 'Paid'`, `payment = 'Razorpay'`.

*Alternatives Considered:*
- **Client-Side Order Insertion First**: Insert a `'Pending'` order, pay, and then update it to `'Paid'` on signature verification.
  - *Why Rejected*: Inserting orders before payment might lead to cluttered orders tables with unpaid junk. Creating the order only *after* a verified payment transaction ensures database integrity.

### 2. Deno Web Crypto API for Signature Verification
We will use Deno's native `SubtleCrypto` API (Web Crypto API) or standard Node compatibility library (`crypto`) inside the Edge Function to compute HMAC-SHA256 signatures for verification.
- **Formula**: `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)`
- Compare computed hex string with `razorpay_signature` in constant-time.

### 3. Dynamic SDK Loading on Storefront
Instead of adding a static `<script>` tag to `index.html` globally, the storefront will load the Razorpay SDK script dynamically when mounting the checkout/shipping component. This optimizes load times for users who aren't checking out.

### 4. Database Schema Update
A new migrations file will add columns to `public.orders`:
```sql
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_signature text;
```

## Risks / Trade-offs

- **[Risk] Customer closes checkout window before verification resolves**
  - *Mitigation*: The payment succeeds on Razorpay, but the order is not created in Supabase. Since webhooks are out-of-scope, the mitigation is for the admin to check Razorpay dashboard for un-reconciled orders or for the customer to contact support. Webhooks can be added in a future iteration.
- **[Risk] Product price manipulation**
  - *Mitigation*: The server-side Edge Function ignores any pricing details sent by the client. It queries the `public.products` database table directly to determine the actual price of the items.
- **[Risk] Exposing secret keys**
  - *Mitigation*: `RAZORPAY_KEY_SECRET` will only be saved in Supabase Edge Secrets (`supabase secrets set`). It is never exposed to the frontend.
