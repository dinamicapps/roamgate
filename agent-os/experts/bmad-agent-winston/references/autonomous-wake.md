---
name: autonomous-wake
description: Default autonomous wake behavior — runs architecture health checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default architecture monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/winston-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check architecture-profile.md against current project structure** — Scan for structural changes since last review: new projects/modules added, removed, or reorganized. Flag any divergence from the documented profile.
2. **Scan for new dependencies or integration points** — Check package manifests, configuration files, and imports for new external dependencies or service integrations added since last review. Evaluate whether they align with current architecture decisions.
3. **Check adr-log.md for affected decisions** — Review recent code changes against existing ADRs. Flag decisions that may need revisiting based on new dependencies, structural changes, or evolved requirements.
4. **Look for new tech debt signals** — Scan for: large files (>500 lines), circular dependencies between layers, missing abstractions (business logic in controllers/handlers), duplicated patterns that should be consolidated, and new anti-patterns.
5. **Update index.md** — Summarize findings and flag items requiring human attention.

## Logging

Append to `{project-root}/_bmad/memory/winston-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions needed}
- Profile drift: {none|details of structural changes}
- New dependencies: {none|list with alignment assessment}
- ADRs affected: {none|list of ADR IDs with concern}
- Tech debt signals: {none|count and summary}
- Action needed: {yes/no — brief description}
```
