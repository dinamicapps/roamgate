---
name: autonomous-wake
description: Default autonomous wake behavior -- runs UX checks when invoked headless.
---

# Autonomous Wake

You're running autonomously. No one is here. Execute default UX monitoring and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/sally-sidecar/`
- Activation time: `{current-time}`

## Instructions

Load sidecar memory. Execute default wake behavior based on available context. Write results to memory and exit.

## Default Wake Behavior

1. **Check UI component changes** -- Compare current view/component files against what's recorded in ux-profile.md. Have new components been added? Have existing ones been modified? Flag any UI changes since last UX review.
2. **Scan for accessibility issues** -- Inspect HTML/view files for common accessibility problems: missing alt text, missing ARIA labels, form inputs without labels, insufficient color contrast indicators, missing skip navigation, focus management gaps.
3. **Check ux-profile staleness** -- Compare ux-profile.md against current UI code. Has the CSS framework config changed? New design tokens added? Component library updated? If the design system has evolved since last scan, flag what changed.
4. **Update index** -- Write findings to index.md: what changed, what needs UX review, what remains current.
5. **Summary** -- Write findings to autonomous-log.md with actionable next steps.

## Logging

Append to `{project-root}/_bmad/memory/sally-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions taken}
- UI components changed: {none|list of changed components}
- Accessibility issues found: {none|count and summary}
- UX profile: {current|stale -- details of what changed}
- Action needed: {yes/no -- brief description}
```
