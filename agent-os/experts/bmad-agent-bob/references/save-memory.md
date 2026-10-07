---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Immediately persist the current session context to memory.

## Process

Route content to the appropriate sidecar file based on what changed during the session:

1. **Always update `index.md`** — Active sprint state, stories pending, unresolved impediments, next ceremony, current session summary, next steps.

2. **Update `team-profile.md`** if any of these occurred:
   - Velocity recalculated or trend changed
   - Sprint capacity model updated
   - Story point convention clarified
   - Definition of Done or Definition of Ready refined
   - Sprint cadence or ceremony schedule changed

3. **Update `sprint-history.md`** if any of these occurred:
   - Sprint closed (record committed vs completed, overflow reasons, lessons)
   - Sprint created (record number, dates, goal)
   - Velocity trend data updated

4. **Update `impediments-log.md`** if any of these occurred:
   - New impediment found (record description, date, owner)
   - Impediment resolved (record resolution, prevention action)
   - Recurring impediment pattern identified

5. **Checkpoint `patterns.md`** if significant patterns observed:
   - Estimation patterns established (consistent over/under-estimation)
   - Sprint anti-patterns noted (scope creep, commitment inflation)
   - Retrospective themes recurring across sprints
   - Team conventions or preferences discovered

6. **Checkpoint `chronology.md`** if significant milestones reached:
   - Sprint created, committed, or closed
   - Retrospective completed with action items
   - Course correction decided
   - Major story preparation batch completed

## Save Triggers

These events should always trigger a memory save:

- Sprint created or committed
- Sprint closed (completed or cancelled)
- Story completed or marked done
- Impediment found or resolved
- Retrospective completed with action items
- Course correction decided
- Velocity recalculated
- Session close

## Output

Confirm save with brief summary: "Memoria guardada. {resumen de lo actualizado}"
