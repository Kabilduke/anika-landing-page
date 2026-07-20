## Why

Currently, when customers place orders on the Anika platform, there is no self-service option to cancel an order. Both customers and administrators need a clear, structured way to cancel pending or confirmed orders, which must also automatically trigger the cancellation of the associated logistics package on the Ekart partner platform to prevent incorrect fulfillment and waste.

## What Changes

- **Self-Service Order Cancellation**: Customers can cancel their orders directly from the "Order History" UI under their profile page.
- **Admin Order Cancellation**: Administrators can cancel any user order from the admin dashboard.
- **Logistics Integration**: Edge Functions will automatically invoke the Ekart shipment cancellation API when an order with an active waybill is cancelled.
- **Order State Constraints**: Order cancellation is only allowed if the order status is `Pending` or `Confirmed`. Once an order is marked as `Shipped` or `Delivered`, cancellation is restricted.

## Capabilities

### New Capabilities
- `order-cancellation`: Exposes backend endpoint, database status transitions, and frontend controls to cancel orders and dissolve associated Ekart shipment manifestations.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: Updates status of order records in `orders` table to `Cancelled`, and sets `delivery_status` to `Cancelled`.
- **API**: Adds `cancel_order` action to the `ekart` Edge Function and `DELETE /api/v1/package/cancel` call in `EkartClient`.
- **Frontend**: Adds cancellation service helper and UI elements in customer-facing and admin order panels.
