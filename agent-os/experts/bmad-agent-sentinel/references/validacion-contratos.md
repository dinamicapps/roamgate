---
name: validacion-contratos
description: Validate API contracts — spec vs actual implementation, detect drift.
menu-code: VC
---

# Validacion de Contratos

Verify that API contracts between systems are honored. Detect drift between specification and implementation.

## Outcome

A contract validation report identifying discrepancies between documented API contracts (OpenAPI/Swagger specs) and actual API behavior. Each discrepancy classified by severity and impact on system integration.

## Validation Dimensions

### Spec vs Implementation

- Response schema matches spec (fields, types, nullability)
- Status codes match documented behavior
- Required headers present
- Content-Type negotiation works as documented
- Pagination behavior matches spec
- Error response format consistent with spec

### Inter-System Contracts

- Consumer expectations match provider behavior
- Breaking changes detection (removed fields, type changes, new required params)
- Versioning strategy consistency
- Backward compatibility verification

### Data Contract Integrity

- Field naming conventions consistent across endpoints
- Date/time format standardization
- Enum values match documented options
- Nested object structure stability

## Execution

1. Parse available specs (OpenAPI/Swagger)
2. For each endpoint in scope, compare spec to actual response
3. Flag discrepancies with severity: BREAKING / DEGRADED / COSMETIC
4. For inter-system contracts, verify both sides of the integration

## Output

Contract validation report: endpoint, expected behavior, actual behavior, discrepancy type, severity, recommended fix. Persist to sidecar for tracking over time.
