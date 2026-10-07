---
name: evaluacion-riesgo
description: Score and prioritize API risk per endpoint using OWASP API Security Top 10.
menu-code: ER
---

# Evaluacion de Riesgo

Evaluate each endpoint (or a targeted subset) against the OWASP API Security Top 10 2023 and produce a prioritized risk scorecard.

## Outcome

A risk assessment per endpoint with severity scoring, attack vector description, and remediation priority. Findings contextualized for healthcare data protection.

## OWASP API Security Top 10 2023

Evaluate against each applicable category:

1. **API1** — Broken Object Level Authorization (BOLA)
2. **API2** — Broken Authentication
3. **API3** — Broken Object Property Level Authorization
4. **API4** — Unrestricted Resource Consumption
5. **API5** — Broken Function Level Authorization
6. **API6** — Unrestricted Access to Sensitive Business Flows
7. **API7** — Server Side Request Forgery (SSRF)
8. **API8** — Security Misconfiguration
9. **API9** — Improper Inventory Management
10. **API10** — Unsafe Consumption of APIs

## Scoring

For each finding:

- **Severity:** CRITICAL / HIGH / MEDIUM / LOW / INFO
- **Likelihood:** Based on exploitability (attacker skill, access needed, tooling available)
- **Impact:** Data breach scope, regulatory consequence, business impact
- **Risk = Likelihood x Impact**
- **Chain potential:** Can this finding combine with others to escalate severity?

## Healthcare Context

Amplify severity when:

- Health data (historia clinica, diagnosticos, tratamientos) is exposed
- Patient identification data is accessible
- Consent verification is absent for sensitive data operations
- Audit trail is missing for data access

## Output

Present findings as prioritized table: endpoint, OWASP category, severity, description, remediation suggestion. Persist to sidecar memory for tracking.
