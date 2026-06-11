## 1. Database and Environment Configuration

- [x] 1.1 Create a new SQL migration under `supabase/migrations` adding `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` text fields to `public.orders`.
- [x] 1.2 Apply the Supabase migration locally to update the schema.
- [x] 1.3 Configure local Supabase secret file or set env variables for `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

## 2. Supabase Deno Edge Function Development

- [x] 2.1 Scaffold the `supabase/functions/razorpay` function.
- [x] 2.2 Implement request parsing, CORS headers, and Supabase JWT authentication helper in `supabase/functions/razorpay/index.ts`.
- [x] 2.3 Implement the `create_order` action in the Edge Function to fetch the product price from the database and call Razorpay's API.
- [x] 2.4 Implement the `verify_payment` action in the Edge Function to verify the HMAC-SHA256 signature and insert the successful order into the database.

## 3. Storefront Integration

- [x] 3.1 Implement a dynamic script loading helper for the Razorpay Checkout SDK in the React codebase.
- [x] 3.2 Add the payment method selection UI (Cash on Delivery vs Razorpay Online Payment) in `web/src/components/shippingAddress.jsx`.
- [x] 3.3 Style the payment method selector and step stepper using Vanilla CSS.
- [x] 3.4 Update `handleDeliver` in `shippingAddress.jsx` to trigger the Razorpay modal, backend verification, and order placement if the user chooses Razorpay.

## 4. Verification and Graph Update

- [x] 4.1 Test the order placement flow manually using Razorpay's Test Mode.
- [x] 4.2 Run `graphify update .` to rebuild the knowledge graph with the new changes.
