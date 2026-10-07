# Memory System for Amelia

**Memory location:** `{project-root}/_bmad/memory/amelia-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Stories in progress: story ID, current AC, current task/subtask
- Last implementation state: what was done, what's next
- Active blockers: story ID, AC, concrete question
- Quick reference to recent files touched and tests created

**Update:** When story state changes, new blocker found, task completed, or story done.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, tests, configuration, specs, story files
- **Write access** — Sidecar memory, source code, test code, story files (Dev Agent Record, File List, task checkboxes)
- **Deny zones** — `.env` files with secrets, production configs, CI/CD pipeline definitions (suggest changes, don't modify)

### `codebase-profile.md` — Code Conventions Discovered

**Load on activation.** Contains:

- Naming conventions: files, variables, functions, classes, test files
- Project patterns: folder structure, module organization, import style
- Test framework: runner, assertion library, mocking approach, test file naming
- CI/CD: pipeline location, build commands, test commands
- Build system: package manager, build tool, scripts
- Code style: linters, formatters, editor config rules

**Update:** When new convention discovered or existing one clarified.

### `implementation-log.md` — Stories Implemented

**Load when starting a new story or during code review.** Contains:

- Stories implemented: story ID, date, summary
- Files touched per story
- Tests created per story
- Decisions made during implementation (with rationale)

**Update:** When story completed or significant implementation decision made.

### `gotchas.md` — Codebase Traps

**Load on activation.** Contains:

- Non-obvious traps that break things: "Don't import X from Y — circular dependency crashes the build"
- Flaky test patterns: "Tests in `tests/integration/` need DB_URL set or they timeout silently"
- Build quirks: "Must run `npm run generate` before `npm test` — codegen step not in CI"
- Environment surprises: "Windows paths break in `src/utils/path.ts` — use `path.posix` instead"

**Update:** Immediately when a gotcha is discovered. These save hours.

### `patterns.md` — Code Patterns of the Project

**Load when needed.** Contains:

- Project-specific code patterns: how services are structured, how errors are handled, how tests are organized
- Recurring architectural decisions and their rationale
- Anti-patterns observed in the codebase (with notes on whether they're being migrated away from)
- Team conventions learned over time

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant development milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. Story completed (-> implementation-log.md, index.md)
2. Gotcha discovered (-> gotchas.md)
3. New code convention found (-> codebase-profile.md)
4. Blocker found or resolved (-> index.md)
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a DS or CR capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- Story done — all ACs green
- Gotcha discovered — something non-obvious broke or almost broke
- Code review completed — findings logged
- Convention discovered — naming, pattern, or tooling insight
- Blocker found or resolved
- Session close

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move completed stories from index to implementation-log. Move resolved gotchas to patterns if they become conventions.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
