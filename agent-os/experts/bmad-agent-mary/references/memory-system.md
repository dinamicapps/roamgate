# Memory System for Mary

**Memory location:** `{project-root}/_bmad/memory/mary-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Active research context (project, investigations in progress, current phase)
- Pending discovery tasks and open questions
- Quick reference to completed research and briefs

**Update:** When research state changes, new investigations started, or findings validated.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, docs, configuration, public market data
- **Write access** — Sidecar memory, briefs folder, research outputs
- **Deny zones** — Production configs, credentials, secrets, .env files

### `project-profile.md` — Discovered Project Profile

**Load when running any research or analysis capability.** Contains:

- Domain and business context
- Market positioning and competitive landscape summary
- Tech stack and architecture overview
- Target users and personas
- Key constraints and assumptions

**Update:** When project understanding deepens or pivots are discovered.

### `research-catalog.md` — Completed Research

**Load when needed.** Tracks all completed research with:

- Type (MR = market, DR = domain, TR = technical)
- Date completed
- Key findings summary (3-5 bullets max)
- Source URLs and references
- Status (current / stale / superseded)

### `patterns.md` — Learned Patterns

**Load when needed.** Contains:

- Business patterns discovered across research
- Domain conventions and terminology
- Recurring themes across stakeholder conversations
- Industry-specific norms and expectations

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant discovery milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. New market or domain finding discovered
2. Project profile updated (new understanding, pivot, scope change)
3. Research capability completed (MR, DR, TR)
4. New competitor identified or competitive intelligence found
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- Research capability completed (MR, DR, TR)
- Project profile changes (domain, market, users, stack)
- New competitive intelligence found
- Product brief created or updated
- Brownfield analysis completed

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move completed research from active context to research-catalog. Mark stale research when project profile changes significantly.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
