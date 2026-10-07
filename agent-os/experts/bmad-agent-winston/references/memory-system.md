# Memory System for Winston

**Memory location:** `{project-root}/_bmad/memory/winston-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Active architecture decisions and their current status (proposed, accepted, superseded)
- Areas under analysis (modules, integrations, layers being evaluated)
- Tech debt items requiring attention
- Quick reference to generated artifacts and their locations

**Update:** When architecture decision state changes, new area comes under analysis, or tech debt status changes.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, infrastructure, configuration files, docs, specs
- **Write access** — Sidecar memory, architecture documents, ADRs in `{project-root}/_bmad/docs/`
- **Deny zones** — `.env` files with actual secrets, production credentials, secret stores

### `architecture-profile.md` — Discovered Architecture

**Load on activation.** Contains the architectural profile for the current project:

- Architectural pattern (Layered, Clean Architecture, Vertical Slices, Microservices, Monolith)
- Layer inventory — projects/modules and their responsibilities
- Database technology and access pattern (EF Core, Dapper, raw SQL, ORM)
- API pattern (REST, GraphQL, gRPC, SignalR)
- External service integrations (APIs, message queues, cache, storage)
- Middleware pipeline composition
- Deployment topology
- Cross-cutting concerns (logging, auth, caching, error handling)
- Dependency direction and coupling between layers

**Update:** When project structure changes, new integration discovered, deployment topology evolves, or layer responsibilities shift.

### `tech-debt.md` — Technical Debt Registry

**Load when analyzing code or making architecture decisions.** Contains:

- Technical debt items detected, each with:
  - Severity (critical, high, medium, low)
  - Affected area (module, layer, integration)
  - Description (what the debt is and why it matters)
  - Recommendation (how to address it)
  - Discovery date and session reference

**Update:** When new tech debt discovered, existing debt addressed or reclassified.

### `adr-log.md` — Architecture Decision Records

**Load when making or reviewing architecture decisions.** Contains:

- Architecture decisions taken, each with:
  - Decision ID (ADR-NNN)
  - Title (short decision statement)
  - Status (proposed, accepted, deprecated, superseded)
  - Context (what triggered the decision)
  - Trade-offs evaluated (pros/cons of each option)
  - Alternatives discarded (what was NOT chosen and why)
  - Conditions for revisiting (when should this decision be reconsidered)
  - Date and session reference

**Update:** Immediately when an architecture decision is made, revisited, or superseded. Decisions are cheap to record, expensive to forget.

### `patterns.md` — Architectural Patterns

**Load when needed.** Contains:

- Project-specific architectural patterns and conventions detected
- Layer conventions (naming, organization, responsibility boundaries)
- Anti-patterns observed (circular dependencies, leaky abstractions, misplaced logic)
- Integration patterns used (sync/async, retry policies, circuit breakers)
- Team conventions learned over time

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant architectural milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. New architecture decision made (-> adr-log.md)
2. New tech debt discovered or reclassified (-> tech-debt.md)
3. Architecture profile changes detected (-> architecture-profile.md)
4. Access boundaries updated (-> access-boundaries.md)
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a CA or IR capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- Architecture decision made or revisited
- Tech debt discovered or addressed
- Implementation readiness assessment completed
- New integration point discovered
- Architecture profile updated
- Deployment topology changed

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move superseded ADRs and resolved tech debt from active tracking to chronology.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
