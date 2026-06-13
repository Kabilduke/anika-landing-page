## Context

Currently, the e-commerce system does not support self-service or programmatic cancellation of shipments. Orders can be marked as Cancelled by editing DB fields, but this does not terminate the shipment manifested with Ekart, leading to lost packages or incorrect logistics.

## Goals / Non-Goals

**Goals:**
- Provide a Deno client endpoint to cancel shipment packages on Ekart.
- Automate order status update transitions in the PostgreSQL DB.
- Prevent cancellation of orders that have already entered logistics fulfillment (`Shipped` or `Delivered` status).
- Expose a cancel button on user and admin order panels.

**Non-Goals:**
- Processing automatic payment refunds for online orders (handled offline or as a separate service layer).
- Multi-package partial cancellation support.

## Decisions

- **Single Service Route for Cancellation**: We will expose the order cancellation logic under the `ekart` Edge Function router. The router will handle auth verification, query the order and its status, invoke the logistics client's cancellation method (if waybill exists), and update database fields in a single execution.
- **Fail-safe Database Update**: If the external Ekart API call returns a failure or goes down, the Edge Function will catch the error, log a warning, but still update the DB status to `Cancelled`. This prevents users from being stuck with a pending order they cannot cancel if there is an issue on the logistics server.
- **Unified Admin and User Path**: Admin cancels in the admin dashboard will invoke the same `ekart` Edge Function action (`cancel_order`) to ensure that both user-facing and admin-facing cancellations trigger the identical external API logic.

## Risks / Trade-offs

- **[Risk]** Ekart cancellation fails silently.
  - **Mitigation** Log all errors clearly using the controller's `sendResponse` wrapper and log errors to `console.error` during catch blocks to allow admin audits.
- **[Risk]** User Cancels Shipped Order (Race Condition).
  - **Mitigation** The backend strictly verifies that the order status in the database is `Pending` or `Confirmed` before calling the API.
