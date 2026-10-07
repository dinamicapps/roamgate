---
name: document-project
description: Document brownfield projects for AI context with full scan, deep-dive, and resumable workflows
menu-code: DP
---

# Document Project Workflow

**Goal:** Document brownfield projects for AI context.

**Your Role:** Project documentation specialist.

---

## Configuration

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
- `project_knowledge` for output location
- `user_name` for greeting
- `communication_language` for all communications
- `document_output_language` for output documents
- `date` as system-generated current datetime

---

## Workflow Router

### Step 1: Check for Resumability

Check for existing state file at: `{project_knowledge}/project-scan-report.json`

**If state file exists:**
- Read state file and extract: timestamps, mode, scan_level, current_step, completed_steps, project_classification
- Extract cached project_type_id(s)
- Calculate age of state file

Present options:
1. **Resume from where we left off** - Continue from current step
2. **Start fresh** - Archive old state and begin new scan
3. **Cancel** - Exit without changes

If state file age >= 24 hours, automatically start fresh (archive old state).

**On Resume:**
- Load findings summaries from state file
- Load cached project_type_id(s)
- For each cached project_type_id, load ONLY the corresponding row from documentation-requirements data
- Route to appropriate sub-workflow (full-scan or deep-dive)

### Step 2: Check for Existing Documentation

Check if `{project_knowledge}/index.md` exists.

**If index.md exists:**
1. **Re-scan entire project** - Update all documentation
2. **Deep-dive into specific area** - Detailed documentation for a specific feature/module/folder
3. **Cancel** - Keep existing documentation

**If index.md does not exist:**
- Set to initial_scan mode automatically

---

## Documentation Requirements Data

The workflow uses a comprehensive requirements system with 12 project types. Each type defines:

| Field | Purpose |
|-------|---------|
| `project_type_id` | Type identifier (web, mobile, backend, cli, library, desktop, game, data, extension, infra, embedded) |
| `requires_api_scan` | Whether to scan for API endpoints |
| `requires_data_models` | Whether to scan for database schemas |
| `requires_state_management` | Whether to analyze state management |
| `requires_ui_components` | Whether to inventory UI components |
| `requires_deployment_config` | Whether to scan deployment configs |
| `key_file_patterns` | Patterns to detect project type (e.g., package.json, tsconfig.json) |
| `critical_directories` | Key directories to scan (e.g., src/, app/, components/) |
| `integration_scan_patterns` | API client patterns to find |
| `test_file_patterns` | Test file patterns |
| `config_patterns` | Configuration file patterns |
| `auth_security_patterns` | Auth/security file patterns |
| `schema_migration_patterns` | Database migration patterns |
| `entry_point_patterns` | Application entry point patterns |
| `shared_code_patterns` | Shared/common code patterns |
| `monorepo_workspace_patterns` | Monorepo workspace config patterns |
| `async_event_patterns` | Event/queue/worker patterns |
| `ci_cd_patterns` | CI/CD pipeline patterns |
| `asset_patterns` | Static asset patterns |
| `hardware_interface_patterns` | Hardware interface patterns |
| `protocol_schema_patterns` | Protocol/schema definition patterns |
| `localization_patterns` | i18n/localization patterns |
| `requires_hardware_docs` | Whether hardware documentation needed |
| `requires_asset_inventory` | Whether asset inventory needed |

### Project Types Reference

| Type | Key Indicators | Primary Scans |
|------|---------------|---------------|
| **web** | package.json, tsconfig.json, vite/webpack/next config | API, data models, state, UI, deployment |
| **mobile** | pubspec.yaml, Podfile, build.gradle, app.json | API, data models, state, UI, deployment |
| **backend** | requirements.txt, go.mod, Gemfile, pom.xml, Cargo.toml | API, data models, deployment |
| **cli** | cli patterns, bin/ directory | Minimal scans |
| **library** | package.json (lib), setup.py, Cargo.toml | Minimal scans |
| **desktop** | tauri.conf.json, electron-builder.yml | State, UI, deployment |
| **game** | .unity, .godot, .uproject | State management |
| **data** | dbt_project.yml, airflow.cfg, Pipfile | Data models, deployment |
| **extension** | manifest.json (browser) | API, state, UI |
| **infra** | .tf, pulumi.yaml, cdk.json, Dockerfile | Deployment |
| **embedded** | platformio.ini, CMakeLists.txt, .ino | Hardware docs |

---

## Full Scan Workflow

### Scan Level Selection

For initial_scan and full_rescan modes:

**1. Quick Scan** (2-5 minutes)
- Pattern-based analysis without reading source files
- Scans: Config files, package manifests, directory structure
- File reading: Minimal (configs, README, package.json)

**2. Deep Scan** (10-30 minutes)
- Reads files in critical directories based on project type
- Scans: All critical paths from documentation requirements
- File reading: Selective (key files in critical directories)

**3. Exhaustive Scan** (30-120 minutes)
- Reads ALL source files in project
- Scans: Every source file (excludes node_modules, dist, build)
- File reading: Complete (all source files)

### State File Management

Initialize state file: `{project_knowledge}/project-scan-report.json`

State file schema tracks:
- `workflow_version`, `timestamps` (started, last_updated, completed)
- `mode` (initial_scan, full_rescan, deep_dive)
- `scan_level` (quick, deep, exhaustive)
- `project_root`, `project_knowledge`
- `completed_steps` (array with step, status, timestamp, outputs, summary)
- `current_step` for resumption
- `findings` (project_classification, technology_stack, batches_completed)
- `outputs_generated`, `resume_instructions`
- `validation_status`, `deep_dive_targets`

**Critical rules:**
- Every state file update records: step id, human-readable summary, precise timestamp, outputs written
- After each step, PURGE detailed findings from context, keep only 1-2 sentence summaries
- Write-as-you-go: each document written to disk IMMEDIATELY after generation

### Step 1: Detect Project Structure

- Scan project root for key indicators (directory structure, key files, technology markers)
- Detect if project is: Monolith, Monorepo, or Multi-part
- For multiple parts: list detected parts, confirm with user
- Match against key_file_patterns from documentation requirements
- Assign project_type_id to each part
- Cache project_type_id(s) in state file for resume

### Step 2: Discover Existing Documentation

- Scan for: README, CONTRIBUTING, ARCHITECTURE, DEPLOYMENT, API docs, docs/ folders
- Create inventory with file path, file type, which part it belongs to
- Ask user for additional documents or key areas to focus on

### Step 3: Analyze Technology Stack

For each part:
- Load key_file_patterns from documentation requirements
- Parse technology manifests (package.json, go.mod, etc.)
- Extract: framework, language, version, database, dependencies
- Build technology_table: Category, Technology, Version, Justification
- Determine architecture pattern based on tech stack and project_type_id

### Step 4: Conditional Analysis (Based on Project Type)

**Batching Strategy for Deep/Exhaustive Scans:**
- Organize batches by SUBFOLDER
- For each subfolder: read files, extract info, write output, validate, purge context, update state
- Quick scan: pattern matching only (glob/grep), no source file reading

**Conditional scans based on documentation requirements flags:**

| Flag | Scan | Output |
|------|------|--------|
| `requires_api_scan` | Routes, controllers, endpoints | api-contracts-{part_id}.md |
| `requires_data_models` | Models, schemas, migrations | data-models-{part_id}.md |
| `requires_state_management` | Redux, Context, MobX, Vuex, Pinia | Inline findings |
| `requires_ui_components` | Components, UI, widgets, views | component-inventory-{part_id}.md |
| `requires_hardware_docs` | Hardware schematics, pinouts | hardware-documentation-{part_id}.md |
| `requires_asset_inventory` | Images, audio, 3D models, sprites | asset-inventory-{part_id}.md |

**Additional pattern scans:** config_patterns, auth_security_patterns, entry_point_patterns, shared_code_patterns, async_event_patterns, ci_cd_patterns, localization_patterns

### Step 5: Generate Source Tree Analysis

- Generate complete directory tree using critical_directories
- Annotate with: purpose of each directory, entry points, key file locations, integration points
- Write source-tree-analysis.md immediately

### Step 6: Extract Development and Operational Information

- Prerequisites, installation, environment setup, build/run/test commands
- Deployment configuration (Docker, Kubernetes, CI/CD)
- Contribution guidelines (code style, PR process, commit conventions)

### Step 7: Multi-Part Integration Architecture (if applicable)

- Analyze how parts communicate: REST, GraphQL, gRPC, message queues, shared databases
- Document API contracts between parts, data flow, authentication flow
- Write integration-architecture.md

### Step 8: Generate Architecture Documentation

For each part, fill architecture template with all discovered information:
- Executive Summary, Technology Stack, Architecture Pattern, Data Architecture
- API Design, Component Overview, Source Tree, Development Workflow
- Deployment Architecture, Testing Strategy

Output: architecture.md (single-part) or architecture-{part_id}.md (multi-part)

### Step 9: Generate Supporting Documentation

- project-overview.md - Executive summary, tech stack, architecture type
- component-inventory.md (per-part if needed) - Component catalog
- development-guide.md (per-part if needed) - Setup and dev workflow
- deployment-guide.md (if deployment config found)
- contribution-guide.md (if guidelines found)
- api-contracts.md (per-part if APIs documented)
- data-models.md (per-part if data models found)
- project-parts.json (if multi-part)

### Step 10: Generate Master Index

Create index.md as primary AI retrieval source with:
- Project overview and structure
- Quick reference (tech stack, entry points, architecture)
- Links to all generated docs
- Links to existing docs
- Getting started section
- AI-assisted development guidance

**Incomplete Documentation Markers:** Use `_(To be generated)_` for documents that should exist but weren't generated (due to quick scan, missing data, etc.)

### Step 11: Validate and Review

- Show summary of all generated files
- Run validation checklist
- Scan for incomplete documentation markers (strict and fuzzy)
- Offer to generate incomplete items, review sections, add detail, or finalize

**Incomplete Document Generation:**
When user requests, re-run the appropriate step targeting only the specific part/document needed. After generation, update index.md to remove markers.

### Step 12: Finalize

Display completion summary with:
- Master index location
- All generated files
- Next steps for brownfield PRD
- Verification recap (tests executed, open risks, next checks)

---

## Deep-Dive Workflow

Deep-dive mode uses exhaustive scan level automatically. Requires literal full-file review -- sampling, guessing, or relying solely on tooling output is FORBIDDEN.

### Step 13a: Identify Area for Deep-Dive

Load existing project structure from index.md and project-parts.json. Present options:
- API Routes (by group)
- Feature Modules
- UI Component Areas
- Services/Business Logic
- Custom folder path, file path, or feature name

Confirm target and estimated file count before proceeding.

### Step 13b: Comprehensive Exhaustive Scan

For EVERY file in scope:
- Read complete file contents (all lines)
- Extract all exports (functions, classes, types, interfaces, constants) with full signatures
- Extract all imports/dependencies
- Identify purpose from comments and code structure
- Write 1-2 sentences describing behavior, side effects, assumptions
- Note TODOs, FIXMEs, comments
- Identify patterns (hooks, components, services, controllers)
- Capture contributor guidance: risks, verification steps, suggested tests

### Step 13c: Analyze Relationships and Data Flow

- Build dependency graph (files as nodes, imports as edges)
- Identify circular dependencies, entry points, leaf nodes
- Trace data flow: function calls, data transformations, API calls, state updates, DB queries
- Identify integration points: external APIs, internal services, shared state, events, database tables

### Step 13d: Find Related Code and Similar Patterns

Search codebase OUTSIDE scanned area for:
- Similar naming patterns, function signatures, component structures
- Reusable utilities, design patterns, component libraries
- Reference implementations and established patterns

### Step 13e: Generate Deep-Dive Documentation

Create `deep-dive-{{target_name}}.md` using the deep-dive template with:

- **Overview:** Target description, purpose, key responsibilities, integration points
- **Complete File Inventory:** For each file: purpose, LOC, exports (with signatures), dependencies, dependents, key implementation details, patterns, state management, side effects, error handling, testing, TODOs
- **Contributor Checklist:** Aggregated risks/gotchas, verification steps, suggested tests
- **Architecture & Design Patterns:** Code organization, design patterns, state management, error handling, testing strategy
- **Data Flow:** Entry points, transformations, exit points
- **Integration Points:** APIs consumed/exposed, shared state, events, database access
- **Dependency Graph:** Entry points, leaf nodes, circular dependencies
- **Testing Analysis:** Coverage summary, test files, test utilities, testing gaps
- **Related Code & Reuse Opportunities:** Similar features, reusable utilities, patterns to follow
- **Implementation Notes:** Code quality, TODOs, known issues, optimization opportunities, technical debt
- **Modification Guidance:** How to add, modify, or remove functionality; testing checklist

### Step 13f: Update Master Index

Add link to new deep-dive doc in index.md under "Deep-Dive Documentation" section.

### Step 13g: Offer to Continue or Complete

1. Deep-dive another area
2. Finish workflow

---

## Validation Checklist

### Scan Level and Resumability
- Scan level selection offered appropriately
- State file created at workflow start and updated after each step
- Resume functionality loads previous state correctly

### Write-as-you-go Architecture
- Each document written to disk IMMEDIATELY after generation
- Detailed findings purged from context after writing (only summaries kept)
- No accumulation of full project analysis in memory

### Batching Strategy
- Batches organized by SUBFOLDER
- Large files (>5000 LOC) handled with judgment
- Batch completion tracked in state file

### Project Detection
- Project type correctly identified
- Multi-part vs single-part accurately detected
- Documentation requirements loaded for each part type

### Content Quality
- Technical information is accurate and specific
- No generic placeholders or TODO items remain
- File paths and directory references are correct
- Terminology is consistent across all documents

### Brownfield PRD Readiness
- Documentation provides enough context for AI to understand existing system
- Integration points are clear for planning new features
- Reusable components identified
- Code conventions and patterns captured
- Architecture constraints are clear

### File Completeness
Required: index.md, project-overview.md, source-tree-analysis.md, architecture.md (per-part)
Conditional: component-inventory.md, development-guide.md, api-contracts.md, data-models.md, deployment-guide.md, contribution-guide.md, integration-architecture.md, project-parts.json

---

## Templates

### Index Template

```markdown
# {{project_name}} Documentation Index

**Type:** {{repository_type}}
**Primary Language:** {{primary_language}}
**Architecture:** {{architecture_type}}
**Last Updated:** {{date}}

## Project Overview
{{project_description}}

## Quick Reference
- **Tech Stack:** {{tech_stack_summary}}
- **Entry Point:** {{entry_point}}
- **Architecture Pattern:** {{architecture_pattern}}

## Generated Documentation
- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Architecture](./architecture.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)

## For AI-Assisted Development
Reference architecture docs + component inventories when planning features.
```

### Project Overview Template

```markdown
# {{project_name}} - Project Overview

**Date:** {{date}}
**Type:** {{project_type}}
**Architecture:** {{architecture_type}}

## Executive Summary
{{executive_summary}}

## Project Classification
- **Repository Type:** {{repository_type}}
- **Project Type(s):** {{project_types_list}}
- **Primary Language(s):** {{primary_languages}}
- **Architecture Pattern:** {{architecture_pattern}}

## Technology Stack Summary
{{technology_table}}

## Key Features
{{key_features}}

## Architecture Highlights
{{architecture_highlights}}
```

### Source Tree Template

```markdown
# {{project_name}} - Source Tree Analysis

## Complete Directory Structure
{{complete_source_tree}}

## Critical Directories
[For each: path, description, purpose, contents, entry points, integration notes]

## Entry Points
{{entry_points}}

## File Organization Patterns
{{file_organization_patterns}}

## Configuration Files
{{config_files}}
```

### Deep-Dive Template

```markdown
# {{target_name}} - Deep Dive Documentation

**Scope:** {{target_path}}
**Files Analyzed:** {{file_count}}
**Lines of Code:** {{total_loc}}

## Overview
{{target_description}}

## Complete File Inventory
[Per file: purpose, LOC, exports, dependencies, dependents, implementation details, patterns, state, side effects, error handling, testing, TODOs]

## Contributor Checklist
- Risks & Gotchas
- Pre-change Verification Steps
- Suggested Tests Before PR

## Architecture & Design Patterns
[Code organization, design patterns, state management, error handling, testing strategy]

## Data Flow
[Entry points, transformations, exit points]

## Integration Points
[APIs consumed/exposed, shared state, events, database access]

## Dependency Graph
[Entry points, leaf nodes, circular dependencies]

## Testing Analysis
[Coverage, test files, utilities, gaps]

## Related Code & Reuse Opportunities
[Similar features, reusable utilities, patterns to follow]

## Implementation Notes
[Quality observations, TODOs, known issues, optimizations, tech debt]

## Modification Guidance
[How to add/modify/remove functionality, testing checklist]
```
