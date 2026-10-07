---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Persist now. Route to the right file.

## Process

1. **Always update `index.md`** — Current QA state, test run results, coverage summary, active issues, next priorities, session summary.

2. **Update `test-profile.md`** if any of these occurred:
   - New test framework detail discovered
   - Test command or CI config learned
   - Test data setup pattern identified
   - Assertion style or mocking approach clarified

3. **Update `coverage-map.md`** if any of these occurred:
   - New tests generated (update module coverage status)
   - Coverage report run (update percentages)
   - New untested area discovered
   - Code flagged as untestable

4. **Update `flaky-tests.md`** if any of these occurred:
   - Flaky test detected (add with probable cause)
   - Flaky test diagnosed or fixed (update status)
   - Flaky test accepted as known issue

5. **Checkpoint `patterns.md`** if significant patterns observed:
   - Project test patterns established or changed
   - Test anti-patterns noted
   - Team conventions learned

6. **Checkpoint `chronology.md`** if significant milestones reached:
   - Test suite generated for a new area
   - Coverage milestone hit
   - Flaky test investigation completed
   - Major test infrastructure change

## Save Triggers

These events should always trigger a memory save:

- Tests generated — new tests written and verified
- Coverage changed — coverage numbers moved up or areas newly covered
- Flaky test found — unstable test detected with probable cause
- Framework config discovered — test infrastructure detail learned
- Session close

## Output

Confirm: "Memoria guardada. {files updated} — {one-line summary}."
