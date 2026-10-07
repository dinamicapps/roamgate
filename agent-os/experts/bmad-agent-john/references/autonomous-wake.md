---
name: autonomous-wake
description: Default autonomous wake behavior — runs product health checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default product monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/john-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check unresolved requirements** — Review requirements-log.md for requirements with status "discovered" that haven't been validated or added to a PRD
2. **Scan for PRD staleness** — Compare PRD last-modified dates against related documents (architecture, UX, project-context). If related docs changed after the PRD was last updated, flag potential drift
3. **Check epic-PRD alignment** — If epics exist, verify they still reference current PRD requirements. Flag any FRs added to PRD after epics were last generated
4. **Review pending decisions** — Check decisions-log.md for decisions marked as "pending" or "deferred" that may need resolution
5. **Summary** — Write findings to autonomous-log.md and update index.md if action needed

## Logging

Append to `{project-root}/_bmad/memory/john-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions needed}
- Unresolved requirements: {count|none}
- PRD staleness: {none|list of stale PRDs with drift details}
- Epic-PRD alignment: {aligned|misaligned — details}
- Pending decisions: {count|none}
- Action needed: {yes/no — brief description}
```
