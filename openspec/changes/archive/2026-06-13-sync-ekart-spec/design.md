## Context

The official Ekart API specification (`ekart-spec.yaml`) is a comprehensive OpenAPI contract containing multiple endpoints and schemas (Authorization, Shipments, Tracking, Serviceability, Address, NDR, Webhook). While our active backend client implements only a subset of these features, we need to document the full specification details within the openspec format for future development reference, contract compliance, and validation.

## Goals / Non-Goals

**Goals:**
- Formally document all primary endpoints, request schemas, parameters, and expected behaviors of `ekart-spec.yaml` in openspec requirements format.
- Ensure that the capability `ekart-delivery` serves as the centralized source of truth for the logistics API.

**Non-Goals:**
- Implementing or modifying any TypeScript / Deno code in `supabase/functions/ekart`.
- Provisioning any database migrations or schema updates.

## Decisions

### 1. Spec-First Reference Archiving
We represent all the OpenAPI specification endpoints as individual Requirements in `specs/ekart-delivery/spec.md`. Once the change is archived, these will become part of the global spec library in `openspec/specs/ekart-delivery/spec.md`, serving as a permanent developer reference.

### 2. Zero Code Impact
We intentionally separate the API reference specification work from active client code modifications. This avoids making any changes to the current functioning client code while creating a robust API reference.

## Risks / Trade-offs

- **[Risk]** Spec Drift: The upstream `ekart-spec.yaml` may be updated without corresponding updates in `openspec`.
  - *Mitigation*: Periodically review `ekart-spec.yaml` modifications and update the openspec files using openspec changes.
