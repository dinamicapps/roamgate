---
name: pruebas-activas
description: Plan and execute active security tests against API endpoints in dev/staging.
menu-code: PA
---

# Pruebas Activas de Seguridad

Plan and execute security tests against live API endpoints. **Development and staging environments ONLY — never production.**

## Outcome

Verified security findings with proof: actual request/response pairs demonstrating vulnerabilities, contract violations, or security misconfigurations.

## Pre-Execution Checklist

Before any active test:

1. **Confirm environment** — Verify target is dev/staging. If uncertain, ask user. Never assume.
2. **Scope agreement** — User must approve the test plan before execution.
3. **Rollback awareness** — Identify if tests will create/modify data and plan cleanup.

## Test Categories

### Authentication & Authorization

- Token validation (expired, malformed, missing, wrong scope)
- Privilege escalation (access resources of other users/roles)
- BOLA testing (enumerate object IDs)
- Function-level authorization bypass

### Input Validation

- SQL injection (parameterized vs concatenated queries)
- XSS in API responses (reflected, stored)
- Path traversal in file-related endpoints
- Mass assignment (send extra fields, check persistence)
- Type confusion (string where int expected, arrays where objects expected)

### Data Exposure

- Verbose error messages leaking internals (stack traces, connection strings)
- Excessive data in responses (fields not needed by consumer)
- Sensitive data in URLs/query strings
- PII/health data without encryption

### Rate Limiting & Resource

- Endpoint flooding (check rate limit headers)
- Large payload handling
- Pagination abuse (request page_size=999999)

### Security Headers & Config

- CORS configuration
- Security headers (HSTS, X-Content-Type-Options, X-Frame-Options)
- TLS configuration
- Debug endpoints exposed

## Execution

For each test: document the request, expected secure behavior, actual behavior, and verdict (PASS/FAIL/WARN). Persist results to sidecar memory.

## Output

Test execution report with evidence. Failed tests include remediation suggestions with .NET/C# code examples when applicable.
