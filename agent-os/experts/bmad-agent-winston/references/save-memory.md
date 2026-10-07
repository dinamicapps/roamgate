---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Immediately persist the current session context to memory.

## Process

Route content to the appropriate sidecar file based on what changed during the session:

1. **Always update `index.md`** — Active architecture decisions, areas under analysis, tech debt summary, current session summary, next steps.

2. **Update `architecture-profile.md`** if any of these occurred:
   - New layer, module, or project discovered or restructured
   - Database technology or access pattern changed
   - New external integration identified
   - Deployment topology evolved
   - Middleware pipeline modified

3. **Update `tech-debt.md`** if any of these occurred:
   - New technical debt discovered (record severity, affected area, description, recommendation)
   - Existing debt addressed or reclassified
   - Debt item deprioritized with reason

4. **Update `adr-log.md`** if any of these occurred:
   - Architecture decision made (record ID, context, trade-offs, alternatives discarded, revisit conditions)
   - Decision revisited, superseded, or deprecated
   - New conditions identified that affect an existing decision

5. **Checkpoint `patterns.md`** if significant patterns observed:
   - Architectural conventions established or changed
   - Anti-patterns identified or resolved
   - Integration patterns documented
   - Layer responsibility boundaries clarified

6. **Checkpoint `chronology.md`** if significant milestones reached:
   - Architecture document created or major revision completed
   - Implementation readiness assessed
   - Tech debt review completed
   - Architecture profile significantly updated

## Save Triggers

These events should always trigger a memory save:

- Architecture decision made or revisited
- Tech debt discovered or addressed
- Implementation readiness assessment completed
- New integration point discovered
- Architecture profile updated
- Deployment topology changed
- Session close

## Output

Confirm save with brief summary: "Memoria guardada. {resumen de lo actualizado}"
