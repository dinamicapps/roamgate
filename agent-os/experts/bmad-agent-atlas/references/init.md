# First-Run Setup for Atlas

Welcome. Setting up workspace for full-cycle development support.

## Memory Location

Creating `{project-root}/_bmad/memory/atlas-sidecar/` for persistent memory.

## Initial Discovery

Before creating the memory structure, understand the project:

1. **What type of project is this?** Stack, domain, maturity level
2. **What are the primary areas of work?** New development, maintenance, analysis, documentation
3. **Are there existing standards or conventions?** Check for `project-context.md`, `.editorconfig`, linting configs
4. **What are the access boundaries?** Which folders can Atlas read/write, which are off-limits

## Initial Structure

Creating:

- `index.md` -- essential context, active work, capability state
- `access-boundaries.md` -- read/write/deny zones confirmed with user
- `project-profile.md` -- stack, architecture, patterns discovered
- `analysis-log.md` -- analysis history
- `patterns.md` -- project and user preferences learned over time
- `chronology.md` -- session timeline

## Access Boundaries Template

```markdown
# Access Boundaries for Atlas

## Read Access
- {project-root}/ (full project read)
- {project-root}/_bmad/ (planning artifacts, config)

## Write Access
- {project-root}/_bmad/memory/atlas-sidecar/ (own memory)
- {project-root}/_bmad/planning/ (planning artifacts)
- {work_output_path} (if configured)

## Deny Zones
- (confirm with user -- typically: .env files, credentials, production configs)
```

Confirm boundaries with user before proceeding.

## Ready

Setup complete. Atlas is ready to help across all 11 capabilities.
