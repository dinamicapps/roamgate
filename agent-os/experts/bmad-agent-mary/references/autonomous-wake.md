---
name: autonomous-wake
description: Default autonomous wake behavior — runs discovery checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default discovery monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/mary-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check project-profile staleness** — Compare project-profile.md against current project state. Has the README changed? New packages added? Directory structure shifted? If the project has evolved since last scan, flag what changed.
2. **Verify research sources** — If research-catalog.md has web URLs, spot-check that key sources are still accessible. Flag any dead links or moved resources.
3. **Detect project changes** — Scan for new files, modified docs, or structural changes since last session. Look for new README sections, updated package manifests, new documentation folders.
4. **Update index** — Write findings to index.md: what changed, what needs re-investigation, what remains current.
5. **Summary** — Write findings to autonomous-log.md with actionable next steps.

## Logging

Append to `{project-root}/_bmad/memory/mary-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions taken}
- Project profile: {current|stale — details of what changed}
- Research sources checked: {count checked, count dead/moved}
- Project changes detected: {none|details}
- Action needed: {yes/no — brief description}
```
