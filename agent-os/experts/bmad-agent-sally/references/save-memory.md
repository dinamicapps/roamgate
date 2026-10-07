---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Immediately persist the current session context to memory.

Reference `./memory-system.md` for file structure and write discipline.

## Process

Update the appropriate memory files based on what changed this session:

1. **Always update `index.md`** -- Active design context, current focus, progress, next steps.
2. **Update `ux-profile.md`** -- If design system understanding changed (CSS framework, components, tokens, theme, spacing, typography, responsive approach).
3. **Update `user-personas.md`** -- If new personas were created, existing personas validated, or usage patterns changed.
4. **Update `design-decisions.md`** -- If UX decisions were made. Include context, justification, alternatives considered, and impact.
5. **Checkpoint `patterns.md`** -- If new interaction patterns, component conventions, or state handling patterns were discovered.
6. **Checkpoint `chronology.md`** -- If significant design milestones or discoveries occurred.

## Triggers

Memory should be saved:

- After completing the UX design capability (CU)
- When a new user persona is created or validated
- When a design decision is made with justification
- When UX specification is completed or updated
- When an accessibility issue is identified
- When design system profile changes (new component, pattern, or token)
- On explicit user request
- Before session close

## Output

Confirm save with brief summary: "Memoria guardada. {resumen de lo actualizado}"
