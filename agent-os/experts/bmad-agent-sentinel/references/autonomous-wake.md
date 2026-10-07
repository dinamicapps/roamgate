---
name: autonomous-wake
description: Default autonomous wake behavior — runs security checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default security monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/sentinel-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check pending findings** — Review findings-tracker.md for open items past their remediation deadline
2. **Contract drift detection** — If API specs are available, run a quick contract validation against known endpoints
3. **Normative updates** — Search for recent regulatory changes affecting the project's compliance scope (Colombia, healthcare)
4. **CVE scan** — Search for new CVEs related to the project's dependencies (.NET version, NuGet packages)
5. **Summary** — Write findings to autonomous-log.md and update index.md if action needed

## Logging

Append to `{project-root}/_bmad/memory/sentinel-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions taken}
- Pending findings reviewed: {count}
- Contract drift: {none|details}
- Normative updates: {none|details}
- New CVEs: {none|details}
- Action needed: {yes/no — brief description}
```
