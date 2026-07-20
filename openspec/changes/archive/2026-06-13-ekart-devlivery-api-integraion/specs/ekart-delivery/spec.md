## ADDED Requirements

### Requirement: Pincode Serviceability Check
The system SHALL support checking if a destination address pincode is serviceable by the Ekart delivery network. The frontend checkout page MUST call the `/ekart` Edge Function to perform this validation dynamically upon pincode input.
- Visual Layout & Styling Plan:
  - Add a dynamic indicator inline below the pincode input field (e.g. green "✓ Serviceable by Ekart" or red "✗ Pincode not serviceable by Ekart").
  - Disable the place order button if the pincode is verified as unserviceable.
- Frontend State:
  - `pincodeServiceability`: `'unchecked' | 'checking' | 'serviceable' | 'unserviceable'`.
  - `serviceabilityError`: string showing validation error message.

#### Scenario: Serviceable Pincode Entered
- **WHEN** the user types a 6-digit pincode that is supported by Ekart
- **THEN** the system displays a green success status and enables the checkout confirmation buttons

#### Scenario: Unserviceable Pincode Entered
- **WHEN** the user types a 6-digit pincode that is NOT supported by Ekart
- **THEN** the system displays a red warning message and disables checkout progression

### Requirement: Backend Shipment Booking
The backend (Supabase Edge Function) SHALL automatically book a shipment with the Ekart API when an order is finalized. For Cash on Delivery (COD) orders, this happens immediately during checkout. For Online Payments (Razorpay), this happens immediately after signature verification.
- Backend Action: `book_shipment`
- Database Fields Updated:
  - `delivery_provider`: `'Ekart'`
  - `waybill`: Ekart AWB tracking number (returned by API)
  - `shipment_id`: Ekart shipment identifier (returned by API)
  - `delivery_status`: `'Booked'`
  - `estimated_delivery_date`: Estimated delivery timestamp (returned by API)

#### Scenario: COD Order Automatically Books Shipment
- **WHEN** a customer places a COD order and address is serviceable
- **THEN** the backend books a shipment with Ekart, retrieves the waybill, and saves it in the database with status `'Booked'`

#### Scenario: Shipment Booking API Failure
- **WHEN** the Ekart API returns an error during automated shipment booking
- **THEN** the backend rolls back the order transaction or logs a critical error, setting delivery status to `'Booking Failed'` for admin retry

### Requirement: Shipment Tracking Status Display
The storefront customer order page and admin order detail dashboard SHALL retrieve and display tracking information from the database or the Ekart Tracking API.
- Fields Displayed:
  - Delivery Provider: Ekart
  - Waybill / Tracking Number
  - Current Delivery Status (e.g. Booked, In Transit, Out for Delivery, Delivered)
  - Estimated Delivery Date

#### Scenario: Customer Views Order Details
- **WHEN** a customer opens the detail page for an order that has been booked
- **THEN** the interface shows the Ekart tracking number as a clickable link and the estimated delivery date
