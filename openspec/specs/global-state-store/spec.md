# Global State Store Spec

## Purpose
This spec defines the global state store architecture and synchronization requirements for managing client-side applications.

## Requirements

### Requirement: Global Store Initialization
The application SHALL initialize a global Zustand store containing state for user authentication session, cart, wishlist, products, and categories.

#### Scenario: App Mount State Load
- **WHEN** the application mounts
- **THEN** it SHALL initialize default states: session as null, cart as empty or loaded from localStorage, wishlist as empty or loaded from localStorage, cached products as empty object, and cached categories as empty array.

### Requirement: Cache Categories and Products
The store SHALL check for existing cached categories or products before making database/API queries and return cached data if available.

#### Scenario: Category Navigation
- **WHEN** a user navigates to Category page for "Rings"
- **THEN** the component SHALL query the Zustand store, which fetches "Rings" from the database if not cached, stores it, and subsequent navigations return from the store without API calls.

### Requirement: Global Cart State Management
The cart state in Zustand store SHALL manage item quantities, selection status, subtotal, and total calculation.

#### Scenario: Add to Cart from Product Page
- **WHEN** a user clicks "Add to Cart"
- **THEN** the store SHALL add the product with quantity 1, recalculate cart totals, and update localStorage or Supabase if logged in.
