## 1. Database Schema Migration

- [x] 1.1 Create a new database migration under `supabase/migrations` to add delivery columns to the `public.orders` table (`delivery_provider`, `waybill`, `shipment_id`, `delivery_status`, `estimated_delivery_date`).
- [x] 1.2 Apply the database migration locally using `supabase migration up`.

## 2. Backend Edge Functions Implementation

- [x] 2.1 Create the folder structure and configuration files (`deno.json`, `.npmrc`) for the new `ekart` Edge Function.
- [x] 2.2 Implement the `EkartClient` with methods for pincode check, shipment booking, and shipment tracking, using a dynamic base URL and API keys.
- [x] 2.3 Expose the HTTP endpoints in the `ekart` Edge Function index handler to process requested actions.
- [x] 2.4 Modify the existing payment verification handler in `supabase/functions/razorpay/index.ts` to trigger shipment booking immediately after successful payment verification.
- [x] 2.5 Configure local Supabase secrets (`EKART_BASE_URL`, `EKART_CLIENT_ID`, `EKART_API_TOKEN`) to point to the Ekart Staging / Sandbox environment.

## 3. Frontend Checkout UI and Stepper

- [x] 3.1 Implement a debounced pincode lookup hook in `web/src/components/shippingAddress.jsx` that calls the `/ekart` serviceability action.
- [x] 3.2 Add inline validation warnings for unserviceable pincodes and disable the order placement buttons when an unserviceable pincode is entered.
- [x] 3.3 Update the frontend COD order insertion logic to trigger backend shipment booking at checkout.
- [x] 3.4 Update customer order details UI and `web/src/admin/pages/Orderdetails.jsx` to render the shipment waybill link, carrier details, and estimated delivery date.

## 4. Testing & Verification

- [x] 4.1 Test Deno Edge Function endpoints locally using cURL or Postman (pincode check, shipment booking, and tracking).
- [x] 4.2 Conduct an end-to-end checkout validation for COD, ensuring the order is placed, shipment is booked, and delivery details are recorded in the database.
- [x] 4.3 Conduct an end-to-end validation for Razorpay online payments, checking that successful signature verification triggers booking.
