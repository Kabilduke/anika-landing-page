## ADDED Requirements

### Requirement: Cart and Wishlist Service Functions
The API Services layer SHALL provide helper functions inside a service module to insert, update, retrieve, and delete cart and wishlist records in Supabase.

#### Scenario: Update Cart Item Quantity
- **WHEN** a user updates quantity for an item in the cart
- **THEN** the service SHALL call `supabase.from('cart_items').update({ qty }).eq('id', itemId)` to synchronize the change to the backend.
