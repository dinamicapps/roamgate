# Memory System for John

**Memory location:** `{project-root}/_bmad/memory/john-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Active PRDs and their current status (draft, validated, in-development)
- Epics in progress and their completion state
- Pending product decisions awaiting resolution
- Quick reference to generated artifacts and their locations

**Update:** When PRD state changes, epics created or modified, decisions made or deferred.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, docs, specs, configuration files, planning artifacts
- **Write access** — Sidecar memory, PRDs, epics, product artifacts in `{project-root}/_bmad/docs/`
- **Deny zones** — `.env` files, credentials, secrets, source code (read-only for context)

### `product-context.md` — Product Landscape

**Load on activation.** Contains:

- Product vision as understood from discovery sessions
- Key user types and their primary jobs-to-be-done
- Business constraints discovered (budget, timeline, regulatory, technical)
- Competitive landscape notes (if discussed)
- Stakeholder map (who decides what)

**Update:** When new product insight surfaces, user type clarified, business constraint discovered.

### `requirements-log.md` — Requirements Registry

**Load when working on PRD or epics.** Contains:

- Requirements discovered across sessions, each with:
  - Origin (who said it, when, in what context)
  - Status (discovered, validated, in-PRD, deferred, rejected)
  - Type (FR, NFR, constraint, assumption)
  - Rationale (why this requirement exists)

**Update:** When new requirement discovered, requirement status changes, requirement rejected with reason.

### `decisions-log.md` — Product Decision Record

**Load when needed.** Contains:

- Product decisions taken, each with:
  - Decision statement (what was decided)
  - Context (what triggered the decision)
  - Reason (why this option was chosen)
  - Alternatives discarded (what was NOT chosen and why)
  - Date and session reference

**Update:** Immediately when a product decision is made. Decisions are cheap to record, expensive to forget.

### `patterns.md` — Learned Patterns

**Load when needed.** Contains:

- Project-specific requirement patterns (how this team names FRs/NFRs, preferred conventions)
- Recurring user needs and themes across sessions
- Team conventions and preferences learned over time
- Anti-patterns observed (scope creep triggers, requirement smells)

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant product milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. New product decision made (-> decisions-log.md)
2. New requirement discovered or status changed (-> requirements-log.md)
3. PRD created, validated, or edited (-> index.md)
4. Business constraint or user insight discovered (-> product-context.md)
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- PRD created or major section completed
- Epics generated or restructured
- Course correction decided
- New requirement added to PRD
- Product decision taken with alternatives discarded
- Implementation readiness assessment completed

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move completed PRD work and resolved decisions from active tracking to chronology.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
