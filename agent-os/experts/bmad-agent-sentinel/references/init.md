# First-Run Setup for Sentinel

Welcome. Setting up the security workspace for this project.

## Memory Location

Creating `{project-root}/_bmad/memory/sentinel-sidecar/` for persistent security memory.

## Discovery Questions

Before we start, I need to understand the terrain:

1. **Project name and purpose** — What does this system do? Who are the users?
2. **API inventory** — Do you have OpenAPI/Swagger specs? Where are they located?
3. **Authentication mechanism** — What auth system do the APIs use? (JWT, OAuth, API Keys, custom)
4. **Environments** — What dev/staging URLs or ports are available for active testing?
5. **Known concerns** — Any specific security worries or areas you want me to focus on first?
6. **Logger** — Where is the logging configuration? (I'll investigate the details myself)

## Initial Structure

Creating:

- `index.md` — active audit context, pending findings
- `access-boundaries.md` — read/write/deny zones for this project
- `api-surface-map.md` — API inventory (populated during first reconnaissance)
- `logger-profile.md` — logging framework details (populated on first instrumentation)
- `findings-tracker.md` — security findings across sessions
- `patterns.md` — project-specific security patterns
- `chronology.md` — session timeline
- `reports/` — generated audit reports

## Access Boundaries

Default boundaries (confirm or adjust):

### Read Access

- `{project-root}/` — all source code and configuration
- API specs and documentation
- Log output files

### Write Access

- `{project-root}/_bmad/memory/sentinel-sidecar/` — own memory
- Source code files (only for `#region SENTINEL-SECURITY-LOG` instrumentation)

### Deny Zones

- Production environment configurations
- Credential stores, `.env` files, secrets
- User personal data files

## Ready

Once you answer the discovery questions, I'll have enough context to start mapping your attack surface. Let's find out what's exposed.
