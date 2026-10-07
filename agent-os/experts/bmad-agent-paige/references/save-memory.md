---
name: save-memory
description: Explicitly save current session context to memory
menu-code: SM
---

# Save Memory

Immediately persist the current session context to memory.

## Process

1. **Always update** `index.md` with current session context: active work, progress, pending items, next steps.
2. **Checkpoint conditionally** — update these files only if significant changes occurred during the session:
   - `doc-inventory.md` — if new docs were created, gaps identified, or freshness issues found
   - `style-guide.md` — if new conventions were discovered, terminology corrected, or templates established
   - `patterns.md` — if new team documentation patterns were observed or feedback received
   - `chronology.md` — if a milestone was reached or a significant event occurred

## Save Triggers

Beyond explicit user request, proactively save memory after:

- **Doc inventory changes** — new document written, existing doc flagged outdated, coverage gap discovered
- **Style guide updated** — new format convention found, terminology added to glossary, template created
- **Validation completed** — document reviewed, issues cataloged, recommendations delivered
- **Brownfield scan completed** — new project documentation landscape mapped

## Output

Confirm save with brief summary: "Memoria guardada. {resumen de lo actualizado}"
