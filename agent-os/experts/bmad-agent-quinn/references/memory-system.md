# Memory System for Quinn

**Memory location:** `{project-root}/_bmad/memory/quinn-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` — Primary Source

**Load on activation.** Contains:

- Current QA state: what's being tested, what's pending
- Last test run results: pass/fail/skip counts, date
- Coverage summary: quick reference to coverage-map.md highlights
- Active issues: flaky tests, regressions, blocked areas
- Next priorities: what needs tests next

**Update:** When test state changes, new tests generated, coverage updated, or flaky test status changes.

### `access-boundaries.md` — Access Control

**Load on activation.** Contains:

- **Read access** — Source code, tests, configuration, specs, CI pipelines
- **Write access** — Sidecar memory, test code directories, QA reports
- **Deny zones** — `.env` files with secrets, production configs, source code business logic (read-only; tests only)

### `test-profile.md` — Test Infrastructure Discovered

**Load on activation.** Contains:

- Test framework(s): runner, assertion library, mocking approach
- Test commands: how to run unit, integration, E2E
- Test file naming: conventions and locations (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- Test data setup: fixtures, factories, builders, seeding patterns
- Assertion style: expect/assert, matchers used, custom matchers
- CI test configuration: pipeline location, test stages, parallelization
- Coverage tooling: reporter, thresholds, output location

**Update:** When new framework detail discovered or test infrastructure changes.

### `coverage-map.md` — What's Tested, What's Not

**Load when generating tests or reporting coverage.** Contains:

- Module-by-module coverage status: tested/untested/partial
- Estimated coverage percentage per area (when tooling provides it)
- Untestable code flagged with reason and suggested refactor
- Priority ranking: which untested areas have the most risk
- History: coverage changes per session

**Update:** When tests generated, coverage report run, or new untested area discovered.

### `flaky-tests.md` — Unstable Tests Tracked

**Load when running tests or triaging failures.** Contains:

- Test file and name
- Probable cause: timing, shared state, external dependency, race condition
- Status: active/investigating/fixed/accepted
- Last observed: date and context
- Fix attempts: what was tried, what worked or didn't

**Update:** Immediately when a flaky test is detected, diagnosed, or fixed.

### `patterns.md` — Testing Patterns of the Project

**Load when needed.** Contains:

- Project-specific test patterns: how tests are structured, how mocks are set up, how test data is created
- Recurring test anti-patterns observed
- Team conventions learned over time
- Quality hotspots: areas that break often

### `chronology.md` — Timeline

**Load when needed.** Session summaries and significant QA milestones.

### `retirados.md` / `reconciliados.md` — Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. Test suite generated (-> coverage-map.md, index.md)
2. Coverage updated after test run (-> coverage-map.md, index.md)
3. Flaky test detected (-> flaky-tests.md, index.md)
4. Test framework config discovered (-> test-profile.md)
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a QA capability execution
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- Tests generated — new tests written and verified
- Coverage changed — coverage numbers moved up or areas newly covered
- Flaky test found — unstable test detected with probable cause
- Framework config discovered — test infrastructure detail learned
- Session close

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move fixed flaky tests from active tracker to patterns if they reveal a convention. Archive old coverage snapshots in chronology.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
