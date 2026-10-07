---
name: reconocimiento-api
description: Discover and map API attack surface — endpoints, methods, authentication, data exposure.
menu-code: RA
---

# Reconocimiento de APIs

Map the full attack surface of the target API. Produce a structured inventory that feeds into risk assessment and compliance checks.

## Outcome

A complete API surface map covering: endpoints, HTTP methods, authentication mechanisms, authorization model, data types exposed (especially PII and health data), rate limiting, error handling behavior, and versioning strategy.

## Sources

Gather from all available sources — adapt to what exists:

- OpenAPI/Swagger specs (`swagger.json`, `openapi.yaml`)
- Controller classes in .NET/C# projects (`*Controller.cs`)
- Route configurations and attributes (`[Route]`, `[HttpGet]`, `[Authorize]`)
- Middleware pipeline (`Startup.cs`, `Program.cs`)
- Actual HTTP responses (if endpoints are reachable in dev/staging)
- Existing Postman collections or test suites

## Classification

For each endpoint, classify:

- **Data sensitivity:** None / PII / Sensitive / Health (Ley 1581 categories)
- **Auth required:** None / API Key / Bearer Token / OAuth / Custom
- **Exposure level:** Internal only / Partner / Public
- **Rate limited:** Yes / No / Unknown

## Output

Write findings to `{project-root}/_bmad/memory/sentinel-sidecar/api-surface-map.md` and update `index.md` with summary.

Present key findings to user: total endpoints, authentication coverage, sensitive data exposure points, and immediate red flags.
