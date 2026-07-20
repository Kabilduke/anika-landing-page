## MODIFIED Requirements

### Requirement: Secure Payment Verification & Order Placement
The Supabase Deno Edge Function (`/razorpay`) SHALL expose a POST endpoint to verify the Razorpay payment signature. If the signature is verified, the function SHALL insert the order record into the database `public.orders` table with a status of `'Paid'` and payment method of `'Razorpay'`, AND SHALL automatically trigger the Ekart shipment booking.
- Verification logic:
  - Compute SHA256 HMAC of `razorpay_order_id + "|" + razorpay_payment_id` using the secret `RAZORPAY_KEY_SECRET`.
  - Compare computed signature with `razorpay_signature`.
- Database Schema & RLS Changes:
  - Add optional columns to `public.orders`: `razorpay_order_id` (text), `razorpay_payment_id` (text), `razorpay_signature` (text).
  - RLS Policies on `public.orders` must allow the Edge Function (using service role key or user's JWT) to insert the paid order.

#### Scenario: Successful Payment Signature Verification
- **WHEN** the frontend sends a verification request with a valid signature and transaction IDs
- **THEN** the edge function successfully verifies the signature, inserts the order into the database, triggers the Ekart shipment booking to retrieve the waybill number, and returns the completed order details to the client

#### Scenario: Failed Payment Signature Verification
- **WHEN** the frontend sends a verification request with a mismatched signature
- **THEN** the edge function rejects the request, does not insert any order record, and returns a 400 Bad Request error
