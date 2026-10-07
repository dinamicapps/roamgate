---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Persist now. Route to the right file.

## Process

1. **Always update `index.md`** — Stories in progress, current AC/task, blockers, next steps, session summary.

2. **Update `codebase-profile.md`** if any of these occurred:
   - New naming convention discovered
   - Test framework detail clarified
   - Build command or CI/CD detail learned
   - Code style rule found

3. **Update `implementation-log.md`** if any of these occurred:
   - Story completed (record: story ID, files touched, tests created, decisions)
   - Significant implementation decision made mid-story

4. **Update `gotchas.md`** if any of these occurred:
   - Non-obvious trap discovered (circular dependency, flaky test, build quirk, environment surprise)
   - Existing gotcha resolved or updated

5. **Checkpoint `patterns.md`** if significant patterns observed:
   - Project code patterns established or changed
   - Anti-patterns noted
   - Team conventions learned

6. **Checkpoint `chronology.md`** if significant milestones reached:
   - Story completed
   - Code review completed
   - Major refactor done
   - Blocker resolved after extended investigation

## Save Triggers

These events should always trigger a memory save:

- Story done — all ACs green
- Gotcha discovered — something non-obvious broke or almost broke
- Code review completed — findings logged
- Convention discovered — naming, pattern, or tooling insight
- Blocker found or resolved
- Session close

## Output

Confirm: "Memoria guardada. {files updated} — {one-line summary}."
