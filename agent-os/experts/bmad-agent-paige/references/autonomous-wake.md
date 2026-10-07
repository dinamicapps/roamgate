---
name: autonomous-wake
description: Default autonomous wake behavior — runs documentation freshness checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default documentation monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/paige-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Scan for documentation freshness** — Compare doc-inventory.md entries against recent code changes (git log). Identify documents that reference files or modules modified since the doc's last verified date.
2. **Check doc-inventory.md for gaps** — Review missing and outdated entries. If new source files, modules, or API endpoints exist without corresponding documentation, flag them.
3. **Verify diagram references** — Check that Mermaid diagrams and architecture diagrams still reference current file paths, module names, and component relationships. Flag any that reference renamed or deleted entities.
4. **Update index.md with findings** — Summarize freshness scan results, new gaps discovered, and diagram drift detected.

## Logging

Append to `{project-root}/_bmad/memory/paige-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions taken}
- Docs scanned: {count}
- Freshness issues: {none|list of stale docs with reason}
- New gaps found: {none|list of undocumented areas}
- Diagram drift: {none|list of diagrams with stale references}
- Action needed: {yes/no — brief description}
```
