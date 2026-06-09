# API Services Layer Spec

## Purpose
This spec defines the architectural requirements for the API Services Layer, which abstracts database operations, file storage uploads, and authentication requests from the storefront user interface components.

## Requirements

### Requirement: Decoupled Components
UI components in the storefront frontend SHALL NOT reference or import the `supabase` database instance directly from `web/src/lib/supabase.js`. All database operations, bucket uploads, and authentication requests MUST be encapsulated within service functions under the `web/src/services/` directory.

#### Scenario: Retrieving Product Catalog
- **WHEN** a component requires the catalog of active products
- **THEN** it SHALL call `productService.getProducts()` to query the backend database

### Requirement: Centralized Authentication Service
User registrations, logins, OTP verifications, and sign-outs MUST be processed by service functions inside `authService.js`.

#### Scenario: Signin OTP Request
- **WHEN** a user enters their email to sign in
- **THEN** the auth module SHALL call `authService.signInWithOtp(email)` to trigger the verification code

### Requirement: Centralized Order Service
All database reads and writes targeting the orders and addresses tables MUST be encapsulated in `orderService.js`.

#### Scenario: Creating Customer Order
- **WHEN** the checkout process is finalized
- **THEN** the controller SHALL call `orderService.createOrder(orderData)` to write the record to Supabase

### Requirement: Generalized HTTP API Client
A shared request helper function `apiClient` MUST wrap HTTP Fetch calls to resolve service endpoint prefixes and inject the authenticated user's JWT access token.

#### Scenario: Authorized API Request
- **WHEN** the application invokes `apiClient` to request a secure Supabase Edge Function
- **THEN** the client SHALL retrieve the active session, append the access token as a Bearer authorization header, and parse the JSON response

### Requirement: Cart and Wishlist Service Functions
The API Services layer SHALL provide helper functions inside a service module to insert, update, retrieve, and delete cart and wishlist records in Supabase.

#### Scenario: Update Cart Item Quantity
- **WHEN** a user updates quantity for an item in the cart
- **THEN** the service SHALL call `supabase.from('cart_items').update({ qty }).eq('id', itemId)` to synchronize the change to the backend.

