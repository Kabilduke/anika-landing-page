## Context

Currently, the storefront application (`web`) has components that make direct calls to the Supabase client SDK. This design leads to duplicate data-fetching logic and couples the UI rendering layer directly to the database library. This document outlines the design for introducing a services layer (`web/src/services/`) to encapsulate all data fetching, authentication, and file storage SDK operations.

## Goals / Non-Goals

**Goals:**
- Decouple frontend React components from direct Supabase client SDK operations.
- Centralize all API operations into service modules grouped by domain (auth, products, orders, payments).
- Establish a standard Fetch-based API client for communicating with Supabase Edge Functions or other HTTP APIs.
- Refactor storefront and dashboard components to use the new service modules.

**Non-Goals:**
- Modifying the Supabase database schema, triggers, or Row-Level Security (RLS) policies.
- Changing frontend UI designs, routes, or component layout structure.
- Modifying backend configuration or infrastructure setup outside of web UI refactoring.

## Decisions

### 1. Applying SOLID Principles to Frontend Service Layer

* **Single Responsibility (SRP)**:
  * Each file in `web/src/services/` has one distinct reason to change (its domain logic).
  * `apiClient.js` is solely responsible for network transport and auth token injection; it is oblivious to data schemas or application logic.
  * Domain services (`authService.js`, `productService.js`, `orderService.js`) handle only the API calls and SDK orchestration for their respective resources.
  * React components are strictly restricted to UI representation and rendering state, completely decoupled from networking libraries and backend SDK configurations.

* **Open/Closed (OCP)**:
  * Service modules are open for extension (e.g. adding caching, profiling, or offline persistence wrappers) but closed for modification.
  * New features (such as `paymentService.js` for Razorpay integration) are introduced as new services without modifying or refactoring existing ones.

* **Liskov Substitution (LSP)**:
  * Service functions return standard Data Transfer Objects (DTOs) or clean data arrays rather than database-specific result objects.
  * The return signature of any service remains stable, allowing us to swap the backend implementation (e.g., switching from raw Supabase queries to Supabase Edge Functions) without changing a single line of component code.

* **Interface Segregation (ISP)**:
  * Interfaces are segregated by domain (`auth`, `product`, `order`) instead of exposing a bloated, single-client interface.
  * React components only import the exact functions they consume (e.g. checkout views only import `createOrder` from `orderService.js`), avoiding dependency pollution.

* **Dependency Inversion (DIP)**:
  * Components depend on service abstractions rather than concrete SDK dependencies.
  * The concrete Supabase SDK client is imported exclusively inside the service layer. UI components are unaware of the underlying database SDK or REST client used to fetch their data.

### 2. File Structure of the Services Layer
We will create a new directory `web/src/services/` with the following modules:
- `apiClient.js`: A wrapper around native `fetch` that handles the `VITE_SUPABASE_URL` API prefix, authentication headers (retrieved via `supabase.auth.getSession()`), and JSON formatting.
- `authService.js`: Encapsulates user registration, verification, sign-in, session checking, and sign-out logic.
- `productService.js`: Encapsulates queries for product listings, single product details, category lists, and product image uploads/bucket management.
- `orderService.js`: Encapsulates database transactions for order creation, user address management, and retrieval of order lists.

### 3. Service Encapsulation Pattern
All service files will export standalone async functions or a structured service object containing these methods. UI components will import the service functions directly rather than invoking `supabase` methods directly. 

### 4. Error Handling
Service methods will standardize database/network exceptions into predictable JavaScript `Error` payloads and propagate them to components to ensure uniform UI error handling (e.g. toast alerts and fallback states).

## Risks / Trade-offs

- **[Risk]** Broken state due to missing imports or mismatch in return signatures during bulk refactoring.
  - **Mitigation**: Perform changes incrementally. Refactor one domain service at a time (e.g. start with `authService` first, update its components, test, then move to `productService`).
- **[Risk]** Redundant boilerplate wrapper functions.
  - **Mitigation**: Keep service methods extremely light. Their primary job is abstraction, formatting inputs, and calling Supabase client SDK libraries or HTTP endpoints.

