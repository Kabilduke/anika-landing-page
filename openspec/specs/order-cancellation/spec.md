# order-cancellation Specification

## Purpose
This specification defines the functional requirements and behaviors for order cancellation. It supports customer self-service order cancellation for pending/confirmed orders and administrative cancellations via the admin interface. It also governs the automated cancellation of shipment manifestations with the external Ekart logistics partner.
## Requirements
### Requirement: Customer self-service cancellation
The system SHALL allow customers to cancel their own orders from the order history view, provided that the order status is either `Pending` or `Confirmed`.

#### Scenario: Successful customer cancellation
- **WHEN** a customer clicks the "Cancel Order" button and confirms the action
- **THEN** the system SHALL invoke the `cancel_order` Edge Function action, cancel the associated Ekart logistics package if a waybill is present, and update the order and delivery statuses to `Cancelled` in the database.

#### Scenario: Unauthorised order cancellation
- **WHEN** a user attempts to cancel an order that does not belong to them
- **THEN** the system SHALL reject the request with a `403 Forbidden` error.

#### Scenario: Forbidden state cancellation
- **WHEN** an order status is `Shipped`, `Delivered`, or already `Cancelled`
- **THEN** the system SHALL hide/disable the cancellation button and reject any direct API attempts with a `400 Bad Request` error.

### Requirement: Admin cancellation
The system SHALL allow administrators to cancel any order by updating the order status to `Cancelled` in the admin panel.

#### Scenario: Admin updates status to Cancelled
- **WHEN** an administrator changes the order status to `Cancelled` in the status dropdown
- **THEN** the system SHALL invoke the order cancellation service layer, request Ekart to cancel the shipment if a waybill is present, and save the updated statuses to the database.

