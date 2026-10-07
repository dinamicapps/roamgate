---
name: autonomous-wake
description: Default autonomous wake behavior — runs build and test health checks when invoked headless.
---

# Autonomous Wake

Running headless. No one is here. Check project health, update memory, exit.

## Context

- Memory location: `{project-root}/_bmad/memory/amelia-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check in-progress stories** — Review index.md for stories with stale status (started but no progress logged recently). Flag them.
2. **Run project build** — Execute the project's build command. Report pass/fail. If fail, capture error summary.
3. **Run test suite** — Execute the project's test command. Report pass/fail count. If failures, capture which tests and why.
4. **Check gotchas** — Review gotchas.md for items that may be affected by recent commits (check git log since last session).
5. **Update index.md** — Summarize findings, flag anything that needs attention.

## Logging

Append to `{project-root}/_bmad/memory/amelia-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Build: {pass|fail — error summary if fail}
- Tests: {pass count}/{total count} — {fail details if any}
- Stale stories: {none|list with IDs}
- Gotchas triggered: {none|details}
- Action needed: {yes/no — brief description}
```
