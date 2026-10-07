# Memory System for Bob

**Memory location:** `{project-root}/_bmad/memory/bob-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Active sprint (number, dates, goal, committed points, burndown status)
- Stories pending preparation or review
- Unresolved impediments requiring attention
- Next ceremony (type, date, agenda items)
- Quick reference to sprint plan and story locations

**Update:** When sprint state changes, stories completed or added, impediments logged or resolved.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, docs, specs, configuration files, planning artifacts
- **Write access** — Sidecar memory, sprint plans, stories, retro notes in `{project-root}/_bmad/docs/`
- **Deny zones** — `.env` files, credentials, secrets, source code (read-only for context)

### `team-profile.md` — Team Dynamics

**Load on activation.** Contains:

- Team velocity (rolling average, trend direction)
- Sprint capacity and how it's calculated
- Story point convention (what a 1, 3, 5, 8 looks like for this team)
- Sprint cadence (length, start day, ceremony schedule)
- Story conventions (template, required sections, naming)
- Definition of Done
- Definition of Ready

**Update:** When velocity recalculated, capacity model changes, team conventions updated, DoD/DoR refined.

### `sprint-history.md` — Sprint Record

**Load when planning or running retros.** Contains:

- Past sprints with: number, dates, goal, committed vs completed points
- Overflow stories and why they overflowed
- Key lessons learned per sprint
- Velocity trend data

**Update:** When sprint closes (completed or overflowed stories recorded, lessons captured).

### `impediments-log.md` — Impediment Tracker

**Load when needed.** Contains:

- Active impediments: ID, description, reported date, owner, status
- Resolved impediments: resolution, date resolved, prevention action
- Recurring impediments: pattern, root cause, systemic fix applied or needed

**Update:** Immediately when impediment found or resolved.

### `patterns.md` — Learned Patterns

**Load when needed.** Contains:

- Agile patterns specific to this team (what works, what doesn't)
- Story estimation patterns (what gets consistently over/under-estimated)
- Sprint anti-patterns observed (scope creep triggers, commitment inflation)
- Retrospective themes that recur across sprints
- Team conventions and preferences learned over time

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant sprint milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. Sprint created or closed (-> index.md, sprint-history.md)
2. Story completed or status changed (-> index.md)
3. Impediment found or resolved (-> impediments-log.md, index.md)
4. Retro completed with lessons (-> sprint-history.md, patterns.md)
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a capability execution (SP, CS, ER)
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- Sprint created or committed
- Sprint closed (completed or cancelled)
- Story completed or marked done
- Impediment found or resolved
- Retrospective completed with action items
- Course correction decided
- Velocity recalculated

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move closed sprints from active tracking to sprint-history. Archive resolved impediments with their prevention actions.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
