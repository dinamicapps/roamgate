# Memory System for Sentinel

**Memory location:** `{project-root}/_bmad/memory/sentinel-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Active audit context (project, APIs under review, current phase)
- Pending findings awaiting remediation
- Logger profile reference
- Quick reference to reports and catalogs

**Update:** When audit state changes, new findings discovered, or remediations verified.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, API specs, configuration files, logs
- **Write access** — Sidecar memory, reports folder, instrumented log markers
- **Deny zones** — Production configs, credentials, secrets, .env files

### `api-surface-map.md` — API Inventory

**Load when running reconnaissance or risk evaluation.** Contains the mapped API surface for the current project.

### `logger-profile.md` — Project Logger Configuration

**Load when instrumenting logs.** Contains discovered logging framework details, patterns, and namespaces for the current project.

### `catalogo-actualizado.md` — Updated Normative Catalog

**Load when running compliance checks.** Contains normative references updated via web search, with URLs and version dates.

### `reports/` — Generated Reports

Date-stamped reports from audits. Referenced from index.md.

### `findings-tracker.md` — Active Findings

**Load when needed.** Tracks findings across sessions: ID, status (open/remediated/accepted), discovery date, remediation date.

### `patterns.md` — Learned Patterns

**Load when needed.** Contains:

- Project-specific security patterns and anti-patterns discovered
- Recurring issues across audits
- Team conventions learned

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant security events.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. New security finding discovered
2. Finding remediation verified
3. API surface map updated
4. Logger profile discovered or updated
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- New CRITICAL or HIGH finding discovered
- Compliance status changes
- API surface map changes
- Report generated

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move resolved findings from active tracker to chronology.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
