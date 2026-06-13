## Context

The Anika Jewelry platform (`web`) currently supports shipping configuration where users input their address details. Orders are directly inserted into the database. Recently, Razorpay was integrated to handle online payments, but there is no integration with an actual logistics/delivery API. We need to integrate with the Ekart API to automate shipment booking, pincode serviceability validation, and real-time shipment tracking.

Following the `/grill-me` alignment, the integration will:
1. Support Ekart API only.
2. Check pincode serviceability dynamically on the shipping address screen.
3. Book shipments on the backend via a dedicated `ekart` Supabase Deno Edge Function.
4. Auto-trigger booking upon COD order placement or immediately after Razorpay signature verification.
5. Save waybill tracking details, estimated delivery dates, and status on the `orders` table.

## Goals / Non-Goals

**Goals:**
- **Pincode Verification**: Validate destination pincode against Ekart's serviceable database dynamically before the customer initiates checkout.
- **Automated Booking**: Programmatically create a shipment booking with Ekart for all paid or COD orders, capturing the Waybill/AWB and estimated delivery date.
- **Shipment Tracking**: Expose the waybill details and tracking state to both customers and admin operators.
- **SOLID Design**: Structure the Edge Functions using clear interfaces/clients (e.g. `EkartClient`) to keep backend logic modular, clean, and easily mockable.

**Non-Goals:**
- **Label Printing / PDF Generation**: Automating the print of physical shipping labels or packaging slips is out of scope.
- **Reverse Logistics / Returns**: Automated booking for return pickups is out of scope.
- **Multi-courier Routing**: Route optimization or comparison between multiple delivery partners is out of scope (Ekart only).

## Decisions

### 1. Dedicated `ekart` Supabase Deno Edge Function
We will implement the logistics interaction in a new Edge Function `supabase/functions/ekart`.
- *Rationale*: Protects Ekart merchant credentials (e.g., API keys, merchant codes) from public exposure on the client-side storefront.
- *API Contracts*:
  - `POST /ekart` with actions:
    - `{ "action": "check_serviceability", "pincode": "560001" }`
    - `{ "action": "book_shipment", "orderId": "..." }` (Internal or administrative trigger)
    - `{ "action": "track_shipment", "waybill": "..." }`

### 2. Database Schema Upgrades
Add the following columns to `public.orders` table in a new migration:
- `delivery_provider` (text, default `'Ekart'`)
- `waybill` (text, nullable)
- `shipment_id` (text, nullable)
- `delivery_status` (text, default `'Pending'`)
- `estimated_delivery_date` (timestamp with time zone, nullable)

### 3. Ekart Sandbox & Staging Environment Client
We will implement an `EkartClient` that connects to the Ekart HTTP API.
- The client dynamically reads the `EKART_BASE_URL` from environment variables, allowing seamless switching between the Sandbox/Staging API and the Production API.
- Authentic sandbox/staging credentials (`EKART_CLIENT_ID` and `EKART_API_TOKEN`) will be loaded from Supabase Secrets. No mock response fallback will be implemented in the code; all development/testing runs will communicate directly with the live Ekart Staging environment.

### 4. Integration with Razorpay Verification
Upon successful Razorpay signature verification in `supabase/functions/razorpay/index.ts`, the order will be inserted as `status: 'Paid'`, and we will call the internal shipment booking helper (which queries the Ekart API client and updates the order's waybill, shipment ID, and status to `'Booked'`).

## Risks / Trade-offs

- **Risk**: Ekart API down or slow during order placement, blocking order completion or Razorpay callbacks.
  - *Mitigation*: We will execute the shipment booking *after* database order insertion inside a try-catch block. If shipment booking fails, the order is still successfully placed with `delivery_status = 'Booking Failed'`, and an admin retry option will be provided in the admin panel.
- **Risk**: Pincode Serviceability API latency on the frontend during typing.
  - *Mitigation*: Debounce the pincode serviceability check request by 500ms to avoid spamming the backend API, and show a clean skeleton loading indicator.
