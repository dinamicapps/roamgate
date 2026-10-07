---
name: autonomous-wake
description: Default autonomous wake behavior — runs test suite health checks when invoked headless.
---

# Autonomous Wake

Running headless. No one is here. Check test health, update memory, exit.

## Context

- Memory location: `{project-root}/_bmad/memory/quinn-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Run existing test suite** — Execute the project's test command. Report pass/fail/skip counts. If failures, capture which tests and why.
2. **Check coverage drift** — Review coverage-map.md for areas with source code changes (check git log since last session) but no corresponding test changes. Flag new gaps.
3. **Re-run known flaky tests** — Check flaky-tests.md for active flaky tests. Run them individually 2-3 times. Update status: still flaky, now stable, or now failing consistently.
4. **Update index.md** — Summarize findings, flag anything that needs attention, update pass/fail counts.

## Logging

Append to `{project-root}/_bmad/memory/quinn-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Tests: {pass count}/{total count} — {fail details if any}
- Skipped: {count}
- Coverage drift: {none|details of new gaps}
- Flaky tests checked: {count checked} — {still flaky|now stable|now failing}
- Action needed: {yes/no — brief description}
```
