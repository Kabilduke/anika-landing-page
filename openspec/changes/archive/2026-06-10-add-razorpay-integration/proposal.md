## Why

Currently, the Anika Jewelry platform only supports Cash on Delivery (COD) as a payment option. To enable secure online payments (UPI, credit/debit cards, net banking, and wallets) and provide a premium e-commerce checkout experience, we need to integrate the Razorpay payment gateway.

## What Changes

- **Razorpay Checkout Integration**: Integrate the Razorpay Checkout SDK into the storefront frontend to allow customer payments.
- **Backend Order Creation & Verification**: Implement a Supabase Deno Edge Function to safely create Razorpay orders and verify webhook/callback signatures to prevent fraud.
- **Orders Table Enhancement**: Update the database schema to track Razorpay identifiers (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) on the orders table.
- **Payment Selection UI**: Update the storefront checkout experience to offer both Cash on Delivery (COD) and Razorpay Online Payment options.

## Capabilities

### New Capabilities

- `razorpay-payment`: Handles Razorpay payment gateway integration, including secure backend order creation, frontend payment modal execution, and signature verification via Deno Edge Functions.

### Modified Capabilities

<!-- None -->

## Impact

- **Frontend (`web`)**: 
  - Add Razorpay Checkout JS SDK load logic.
  - Modify `web/src/components/shippingAddress.jsx` to introduce a payment method selection step (Cash on Delivery vs Razorpay Online Payment).
  - Modify `handleDeliver` in `shippingAddress.jsx` to handle the Razorpay payment flow before order insertion.
- **Backend (`supabase`)**:
  - Implement a new Supabase Deno Edge Function at `supabase/functions/razorpay` to process API requests securely (creating orders and verifying signatures).
- **Database (`supabase/migrations`)**:
  - Create a migration adding optional fields `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to the `public.orders` table.
- **Infrastructure / Secrets**:
  - Introduce new environment variables `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the Supabase backend configuration.
  - Add `VITE_RAZORPAY_KEY_ID` to the frontend environment configuration.
