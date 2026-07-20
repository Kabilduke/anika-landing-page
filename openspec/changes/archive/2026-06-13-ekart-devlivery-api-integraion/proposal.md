## Why

Anika Jewelry needs a reliable and automated logistics flow to handle shipment dispatching, delivery tracking, and address verification. By integrating the Ekart API, we automate waybill/tracking number generation, estimated delivery date calculations, and address pincode serviceability verification. This reduces manual administration overhead and dramatically improves post-purchase customer satisfaction.

## What Changes

- **Ekart Deno Edge Function**: A new backend function at `supabase/functions/ekart` to handle secure communication with Ekart APIs (Pincode Serviceability check, Shipment Booking, and Tracking Status updates).
- **Checkout Pincode Serviceability**: Update the shipping checkout UI (`web/src/components/shippingAddress.jsx`) to dynamically query Ekart serviceability upon pincode entry, warning or blocking users if their address cannot be served.
- **Database Schema Upgrades**: Add fields to the `orders` table to track logistics information: `delivery_provider`, `waybill`, `shipment_id`, `delivery_status`, and `estimated_delivery_date`.
- **Backend Booking Automation**:
  - For Cash on Delivery (COD) orders: Book shipment immediately when the order is created on backend checkout.
  - For online payments (Razorpay): Trigger booking immediately upon successful payment verification within the `razorpay` edge function.
- **Storefront & Admin Dashboard Updates**: Display delivery status, waybill numbers, and estimated delivery dates in the customer orders interface and the administrative console.

## Capabilities

### New Capabilities
- `ekart-delivery`: End-to-end logistics operations using the Ekart API, covering serviceability checks, automatic shipment booking, tracking updates, and delivery information display.

### Modified Capabilities
- `razorpay-payment`: Update backend verification sequence to invoke the Ekart shipment booking immediately following successful signature verification and prior to finalizing the order insertion.

## Impact

- **Database**: Migration script to add delivery fields (`delivery_provider`, `waybill`, `shipment_id`, `delivery_status`, `estimated_delivery_date`) to the `public.orders` table.
- **Backend (Edge Functions)**:
  - New Edge Function at `supabase/functions/ekart`.
  - Modified Edge Function at `supabase/functions/razorpay/index.ts`.
- **Frontend (Web)**:
  - `web/src/components/shippingAddress.jsx` (pincode check and order booking hooks).
  - `web/src/admin/pages/Orderdetails.jsx` (display tracking info).
  - `web/src/hooks/useStore.js` and order service modules.
