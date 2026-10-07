---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Immediately persist the current session context to memory.

## Process

Route content to the appropriate sidecar file based on what changed during the session:

1. **Always update `index.md`** — Active PRDs, epics in progress, pending decisions, current session summary, next steps.

2. **Update `product-context.md`** if any of these occurred:
   - New product insight or vision refinement discovered
   - New user type identified or existing one clarified
   - Business constraint surfaced (budget, timeline, regulatory, technical)

3. **Update `requirements-log.md`** if any of these occurred:
   - New requirement discovered (record origin, status, type, rationale)
   - Requirement status changed (validated, added to PRD, deferred, rejected)
   - Requirement clarified or refined

4. **Update `decisions-log.md`** if any of these occurred:
   - Product decision made (record decision, context, reason, alternatives discarded)
   - Decision deferred with reason
   - Previous decision revisited or reversed

5. **Checkpoint `patterns.md`** if significant patterns observed:
   - FR/NFR naming conventions established or changed
   - Recurring user needs or themes identified
   - Team preferences or anti-patterns noted

6. **Checkpoint `chronology.md`** if significant milestones reached:
   - PRD created, validated, or major edit completed
   - Epics generated or restructured
   - Course correction decided
   - Implementation readiness assessed

## Save Triggers

These events should always trigger a memory save:

- PRD created or major section completed
- Epics generated or restructured
- Course correction decided
- New requirement added to PRD
- Product decision taken with alternatives discarded
- Implementation readiness assessment completed
- Session close

## Output

Confirm save with brief summary: "Memoria guardada. {resumen de lo actualizado}"
