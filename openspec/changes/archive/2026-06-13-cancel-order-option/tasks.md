## 1. Backend Edge Function Implementation

- [x] 1.1 Implement the `cancelShipment` method in `EkartClient` (`client.ts`)
- [x] 1.2 Implement the `cancelOrder` method in `EkartService` (`service.ts`)
- [x] 1.3 Add the `cancel_order` action route delegate in the Edge Function controller (`index.ts`)

## 2. Frontend Application Integration

- [x] 2.1 Add the `cancelOrder` method wrapper in `orderService.js`
- [x] 2.2 Update `updateOrderStatus` in `useAdminData.js` hook to invoke `cancelOrder` when status changes to "Cancelled"
- [x] 2.3 Add state, confirmation handler, and UI cancel button to `AnikaOrders.jsx` page

## 3. Verification & Compliance

- [x] 3.1 Typecheck Deno backend edge function files using `deno check`
- [x] 3.2 Verify order status and shipment cancellation triggers behave properly during local staging run
