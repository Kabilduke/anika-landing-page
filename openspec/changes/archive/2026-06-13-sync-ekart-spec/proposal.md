## Why

The official Ekart API specification (`ekart-spec.yaml`) contains the source of truth for the logistics integration. However, the details of all available endpoints, request/response schemas, and operations are not documented within the `openspec` format. This change stores these details in `openspec` for future reference and compliance verification.

## What Changes

- **Logistics Specifications**: Document all the API paths, query parameters, request bodies, and responses from `ekart-spec.yaml` inside the `ekart-delivery` capability specification.
- **Reference Baseline**: Establish a comprehensive, spec-first documentation baseline within openspec so that future development, automated testing, and modifications have a clear and unified reference.

## Capabilities

### New Capabilities
- `ekart-delivery`: Comprehensive logistics operations specification detailing authentication, shipment creation, cancellation, serviceability, tracking, labeling, manifesting, address lookup, NDR actions, and webhooks based on the official Ekart API.

### Modified Capabilities

## Impact

- **Documentation**:
  - `openspec/changes/sync-ekart-spec/specs/ekart-delivery/spec.md` will contain the full specifications.
- **Codebase**:
  - No active codebase impact in this documentation-only phase.
