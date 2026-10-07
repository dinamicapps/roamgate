# Memory System for Paige

**Memory location:** `{project-root}/_bmad/memory/paige-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Documentation state (current task, phase, what's being worked on)
- Pending documentation items (docs requested but not yet written)
- Last session summary and next steps
- Quick reference to doc-inventory and style-guide

**Update:** When documentation state changes, tasks complete, or new requests are captured.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, docs, configuration files, API specs
- **Write access** — Sidecar memory, documentation output folder, README
- **Deny zones** — .env files, credentials, secrets, source code logic (read-only for understanding)

### `doc-inventory.md` — Documentation Inventory

**Load when running documentation assessment, brownfield analysis, or validation.** Contains:

- What documents exist (path, type, audience, last verified date)
- What's missing (identified gaps in documentation coverage)
- What's outdated (docs that no longer match the codebase)
- Coverage map: documented vs. undocumented areas (modules, APIs, workflows)

### `style-guide.md` — Discovered Documentation Conventions

**Load when writing or validating documents.** Contains:

- Format conventions (heading levels, code block style, admonition style)
- Terminology glossary (project-specific terms and their correct usage)
- Audience profiles (who reads what, and at what level of detail)
- Templates used (standard structures for READMEs, API docs, architecture docs)
- Diagram conventions (preferred diagram types, labeling patterns, tool preferences)

### `patterns.md` — Team Documentation Patterns

**Load when needed.** Contains:

- How the team currently documents (inline comments, external docs, wikis, none)
- Recurring documentation issues across reviews
- Team preferences learned from feedback (what they like, what they reject)
- Conventions inferred from existing documentation

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant documentation milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. Doc inventory updated (new doc created, existing doc flagged outdated, gap identified)
2. New style convention discovered (format pattern, terminology, template)
3. Documentation validated (validation results, recommendations given)
4. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- Doc inventory changes (new doc written, doc archived, gap discovered)
- Style guide updated (new convention found, terminology corrected)
- Validation completed (doc reviewed, issues identified, recommendations given)
- Brownfield scan completed (new project mapped)

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move completed documentation items from active inventory to chronology. Archive outdated style conventions when they're superseded.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
