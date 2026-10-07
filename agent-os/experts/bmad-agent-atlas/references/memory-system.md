# Memory System for Atlas

**Memory location:** `{project-root}/_bmad/memory/atlas-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` -- Primary Source

**Load on activation.** Contains:

- Essential context (what we're working on, which capability is active)
- Active work items and their state
- User preferences (condensed)
- Current project profile summary
- Quick reference to other files if needed

**Update:** When essential context changes (immediately for critical data).

### `access-boundaries.md` -- Access Control

**Load on activation.** Contains:

- **Read access** -- Folders/patterns this agent can read from
- **Write access** -- Folders/patterns this agent can write to
- **Deny zones** -- Explicitly forbidden folders/patterns
- **Created by** -- Agent builder at creation time, confirmed/adjusted during init

**Critical:** On every activation, load these boundaries first. Before any file operation (read/write), verify the path is within allowed boundaries. If uncertain, ask user.

### `project-profile.md` -- Project Intelligence

**Load when needed.** Contains:

- Stack detected (languages, frameworks, databases)
- Architecture patterns discovered
- Conventions and naming patterns
- Standards applied
- Integration points

**Update:** When project analysis reveals new information.

### `analysis-log.md` -- Analysis History

**Load when needed.** Contains:

- Analysis performed (type, scope, date)
- Key findings per analysis
- Risks identified
- Recommendations given

**Format:** Append-only, summarized regularly.

### `patterns.md` -- Learned Patterns

**Load when needed.** Contains:

- User's quirks and preferences discovered over time
- Recurring patterns or issues in the project
- Conventions learned from codebase analysis
- Common decisions and their rationale

**Format:** Append-only, summarized regularly. Prune outdated entries.

### `chronology.md` -- Timeline

**Load when needed.** Contains:

- Session summaries (capability used, key outcomes)
- Significant events and discoveries
- Progress over time

**Format:** Append-only. Prune regularly; keep only significant events.

### `retirados.md` / `reconciliados.md` -- Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate Persistence)

Persist immediately when:

1. **User data changes** -- preferences, configurations
2. **Work products created** -- documents, analyses, artifacts
3. **State transitions** -- capability switches, tasks completed
4. **User requests save** -- explicit `[SM] - Save Memory` capability

### Checkpoint (Periodic Persistence)

Update periodically after:

- 5-10 significant exchanges
- Session milestones (completing a capability/task)
- When file grows beyond target size

### Save Triggers

**After these events, always update memory:**

- Completing any capability execution
- Switching between capabilities
- Discovering project patterns or conventions
- User explicitly provides preferences or context

**Memory is updated via the `[SM] - Save Memory` capability which:**

1. Reads current index.md
2. Updates with current session context
3. Writes condensed, current version
4. Checkpoints patterns.md, analysis-log.md, and chronology.md if needed

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate memory files to keep them lean.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
