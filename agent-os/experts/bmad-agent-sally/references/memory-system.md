# Memory System for Sally

**Memory location:** `{project-root}/_bmad/memory/sally-sidecar/`

## Core Principle

Tokens are expensive. Only remember what matters. Condense everything to its essence.

## File Structure

### `index.md` -- Primary Source

**Load on activation.** Contains:

- Active design context (screens in progress, UX flows under review, current phase)
- Pending UX findings and open design questions
- Current focus area and next steps
- Quick reference to completed specs and design decisions

**Update:** When design state changes, new UX work started, or findings validated.

### `access-boundaries.md` -- Access Control

**Load on activation.** Contains:

- **Read access** -- Source code, views, styles, configuration, design artifacts
- **Write access** -- Sidecar memory, UX specs folder, design documentation
- **Deny zones** -- Production configs, credentials, secrets, .env files

### `ux-profile.md` -- Discovered Design System Profile

**Load when running any design or review capability.** Contains:

- CSS framework and approach (Tailwind, CSS Modules, styled-components, SASS, plain CSS)
- UI component library (Material UI, Ant Design, Bootstrap, Kendo UI, custom)
- Design tokens: theme colors, spacing scale, typography scale
- Responsive breakpoints and approach
- Animation/transition patterns in use
- Icon system and asset conventions
- Storybook or component documentation status

**Update:** When design system understanding deepens, new patterns discovered, or framework changes detected.

### `user-personas.md` -- User Personas

**Load when designing flows or evaluating UX decisions.** Contains:

- Discovered or defined user personas with: name, role, context of use, technical level, emotional state, goals, frustrations
- Persona validation status (assumed vs. confirmed by stakeholder)
- Usage frequency and primary flows per persona

**Update:** When new persona created, existing persona validated, or usage patterns change.

### `design-decisions.md` -- UX Decision Log

**Load when needed.** Tracks design decisions with:

- Decision description and date
- Context and user need that drove it
- Alternatives considered and why rejected
- Impact on other flows or components
- Status (active / superseded / reverted)

### `patterns.md` -- Interaction Patterns

**Load when needed.** Contains:

- UI interaction patterns discovered in the project (form handling, navigation, modals, notifications, error display)
- Component reuse conventions
- State management patterns affecting UX (loading, error, empty, offline)
- Recurring UX issues across screens
- Team conventions learned

### `chronology.md` -- Timeline

**Load when needed.** Session summaries and significant design milestones.

### `retirados.md` / `reconciliados.md` -- Purge Ledgers

**NOT loaded on activation.** Machine ledgers owned by the runtime (`agentos learn retirar` / `agentos learn reconciliar`), never read or written by this agent directly. `retirados.md` holds tombstones for entries retired from `patterns.md`; `reconciliados.md` holds entry-vs-standard pairs arbitrated as compatible. `patterns.md` stays free-form markdown owned by cognition -- the runtime never touches it; consolidation itself removes a retired entry when rewriting `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Memory Persistence Strategy

### Write-Through (Immediate)

Persist immediately when:

1. New user persona defined or validated
2. Design decision made (with justification and alternatives)
3. Design system profile updated (new framework detail, pattern, or token discovered)
4. Accessibility issue found
5. User requests save

### Checkpoint (Periodic)

Update periodically after:

- Completing a capability execution (CU)
- Every 5-10 significant exchanges
- Before session close

### Save Triggers

**After these events, always update memory:**

- User persona created or validated
- Design decision made with justification
- UX specification completed or updated
- Accessibility issue identified
- Design system profile changed (new component, pattern, or token)

**Memory is updated via the `[SM] - Save Memory` capability.**

## Write Discipline

Persist only what matters, condensed to minimum tokens. Route to the appropriate file based on content type. Update `index.md` when other files change.

## Memory Maintenance

Periodically condense, prune, and consolidate. Move completed designs from active context to chronology. Mark superseded decisions in design-decisions.md.

## First Run

If sidecar doesn't exist, load `init.md` to create the structure.
