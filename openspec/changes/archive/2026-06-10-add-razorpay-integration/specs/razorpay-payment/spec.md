## ADDED Requirements

### Requirement: Payment Method Selection UI and State
The storefront checkout page (`/shipping`) SHALL provide a Payment Method selection interface allowing the user to choose between Cash on Delivery (COD) and Razorpay Online Payment.
- Visual Layout & Styling Plan:
  - Add a "Payment Method" section after the address list is displayed.
  - Style as selection cards with subtle icons (e.g., banknotes for COD, credit card/UPI logos for Online Payment).
  - Use matching color transitions, hover states, and micro-animations styled in Vanilla CSS.
  - Update the stepper to transition visually to the Payment Method step once an address is selected.
- Frontend State Structure:
  - `paymentMethod`: `'COD' | 'RAZORPAY'` (defaults to `'COD'`).
  - `isProcessingPayment`: boolean to show loading state during payment processing.

#### Scenario: Switching Payment Methods
- **WHEN** the user selects the "Razorpay Online Payment" option
- **THEN** the active payment method state updates to `'RAZORPAY'` and the checkout button text changes to "Pay & Place Order"

### Requirement: Secure Backend Razorpay Order Creation
The Supabase Deno Edge Function (`/razorpay`) SHALL expose a POST endpoint to create a Razorpay order. The function MUST securely fetch the user session from the authorization header and verify the order amount on the database to prevent pricing tampering.
- Backend API Contract:
  - Endpoint: `POST /razorpay` (with action: `'create_order'`)
  - Request Body: `{ productId: string, quantity: number }`
  - Response (Success): `{ success: true, orderId: string, amount: number, currency: string }`
- Database interaction:
  - Verifies the product exists and retrieves the authentic price to compute `total_price`.

#### Scenario: Successful Razorpay Order Creation
- **WHEN** the frontend requests order creation for a valid product ID and quantity
- **THEN** the edge function fetches the true product price, calls Razorpay's Create Order API, and returns the Razorpay `order_id` along with the amount

### Requirement: Frontend Checkout Modal Launch
The storefront checkout page SHALL load the external Razorpay Checkout SDK dynamically. When the user initiates checkout with `RAZORPAY` payment method, the client MUST launch the Razorpay Checkout modal with appropriate configuration.
- Client Parameters:
  - `key`: Frontend public Razorpay key.
  - `amount`: Amount in paise (obtained from the backend).
  - `order_id`: Razorpay order ID.
  - `prefill`: User's name, email, and phone number.

#### Scenario: User Completes Payment in Modal
- **WHEN** the user successfully enters payment details and completes payment in the Razorpay Checkout modal
- **THEN** the Razorpay SDK fires the `handler` callback returning `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`

### Requirement: Secure Payment Verification & Order Placement
The Supabase Deno Edge Function (`/razorpay`) SHALL expose a POST endpoint to verify the Razorpay payment signature. If the signature is verified, the function SHALL insert the order record into the database `public.orders` table with a status of `'Paid'` and payment method of `'Razorpay'`.
- Verification logic:
  - Compute SHA256 HMAC of `razorpay_order_id + "|" + razorpay_payment_id` using the secret `RAZORPAY_KEY_SECRET`.
  - Compare computed signature with `razorpay_signature`.
- Database Schema & RLS Changes:
  - Add optional columns to `public.orders`: `razorpay_order_id` (text), `razorpay_payment_id` (text), `razorpay_signature` (text).
  - RLS Policies on `public.orders` must allow the Edge Function (using service role key or user's JWT) to insert the paid order.

#### Scenario: Successful Payment Signature Verification
- **WHEN** the frontend sends a verification request with a valid signature and transaction IDs
- **THEN** the edge function successfully verifies the signature, inserts the order into the database, and returns success to the client

#### Scenario: Failed Payment Signature Verification
- **WHEN** the frontend sends a verification request with a mismatched signature
- **THEN** the edge function rejects the request, does not insert any order record, and returns a 400 Bad Request error
