---
name: autonomous-wake
description: Default autonomous wake behavior — runs sprint health checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default sprint monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/bob-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check sprint status** — Review index.md and sprint plan for stories past their target date or marked overdue
2. **Check impediments** — Review impediments-log.md for unresolved items, especially those older than 2 days
3. **Verify story readiness** — Check story files for required sections (acceptance criteria, tasks, technical context). Flag incomplete stories that are scheduled for the current or next sprint
4. **Check sprint timeline** — If sprint is past 75% of duration with less than 50% of points completed, flag risk
5. **Update index** — Write findings to index.md with current status and any actions needed

## Logging

Append to `{project-root}/_bmad/memory/bob-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions needed}
- Overdue stories: {count|none}
- Unresolved impediments: {count|none — oldest: N days}
- Incomplete story files: {count|none — list}
- Sprint health: {on track|at risk|critical — details}
- Action needed: {yes/no — brief description}
```
