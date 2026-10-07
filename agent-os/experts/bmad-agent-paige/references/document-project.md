---
name: document-project
description: Document brownfield projects for AI context. Use when the user says "document this project" or "generate project docs"
menu-code: DPR
---

# Document Project Workflow

**Goal:** Document brownfield projects for AI context.

**Your Role:** Project documentation specialist.
- Communicate all responses in {communication_language}

---

## INITIALIZATION

1. Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning

2. **Greet user** as `{user_name}`, speaking in `{communication_language}`.

---

## WORKFLOW ROUTER

This router determines workflow mode and delegates to specialized sub-workflows.

### Step 1: Check for Ability to Resume and Determine Workflow Mode

Check for existing state file at: `{project_knowledge}/project-scan-report.json`

**If project-scan-report.json exists:**

Read state file and extract: timestamps, mode, scan_level, current_step, completed_steps, project_classification. Extract cached project_type_id(s) from state file if present. Calculate age of state file (current time - last_updated).

Ask the user:

> I found an in-progress workflow state from {{last_updated}}.
>
> **Current Progress:**
> - Mode: {{mode}}
> - Scan Level: {{scan_level}}
> - Completed Steps: {{completed_steps_count}}/{{total_steps}}
> - Last Step: {{current_step}}
> - Project Type(s): {{cached_project_types}}
>
> Would you like to:
> 1. **Resume from where we left off** - Continue from step {{current_step}}
> 2. **Start fresh** - Archive old state and begin new scan
> 3. **Cancel** - Exit without changes

**If user selects 1 (Resume):**
- Set resume_mode = true
- Set workflow_mode = {{mode}}
- Load findings summaries from state file
- Load cached project_type_id(s) from state file
- **CONDITIONAL CSV LOADING FOR RESUME:** For each cached project_type_id, load ONLY the corresponding row from documentation-requirements data (see CSV below). Skip loading full CSV (not needed on resume).
- Store loaded doc requirements for use in remaining steps
- Display: "Resuming {{workflow_mode}} from {{current_step}} with cached project type(s): {{cached_project_types}}"
- If workflow_mode == deep_dive: Follow the Deep-Dive Sub-Workflow with resume context
- If workflow_mode == initial_scan OR full_rescan: Follow the Full-Scan Sub-Workflow with resume context

**If user selects 2 (Start fresh):**
- Create archive directory: `{project_knowledge}/.archive/`
- Move old state file to: `{project_knowledge}/.archive/project-scan-report-{{timestamp}}.json`
- Set resume_mode = false
- Continue to Step 3

**If user selects 3 (Cancel):**
- Display: "Exiting workflow without changes."
- Exit workflow

**If state file age >= 24 hours:**
- Display: "Found old state file (>24 hours). Starting fresh scan."
- Archive old state file to: `{project_knowledge}/.archive/project-scan-report-{{timestamp}}.json`
- Set resume_mode = false
- Continue to Step 3

### Step 3: Check for Existing Documentation and Determine Workflow Mode

**Only runs if resume_mode == false**

Check if `{project_knowledge}/index.md` exists.

**If index.md exists:**

Read existing index.md to extract metadata (date, project structure, parts count). Store as {{existing_doc_date}}, {{existing_structure}}.

Ask the user:

> I found existing documentation generated on {{existing_doc_date}}.
>
> What would you like to do?
> 1. **Re-scan entire project** - Update all documentation with latest changes
> 2. **Deep-dive into specific area** - Generate detailed documentation for a particular feature/module/folder
> 3. **Cancel** - Keep existing documentation as-is

- If user selects 1: Set workflow_mode = "full_rescan". Follow the Full-Scan Sub-Workflow. After sub-workflow completes, continue to Step 4.
- If user selects 2: Set workflow_mode = "deep_dive", scan_level = "exhaustive". Follow the Deep-Dive Sub-Workflow. After sub-workflow completes, continue to Step 4.
- If user selects 3: Display "Keeping existing documentation. Exiting workflow." Exit workflow.

**If index.md does not exist:**

Set workflow_mode = "initial_scan". Follow the Full-Scan Sub-Workflow. After sub-workflow completes, continue to Step 4.

---

## FULL-SCAN SUB-WORKFLOW

**Goal:** Complete project documentation (initial scan or full rescan).

**Your Role:** Full project scan documentation specialist.

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
- `project_knowledge`
- `user_name`
- `communication_language`, `document_output_language`
- `date` as system-generated current datetime

You MUST ALWAYS speak in your Agent communication style with the configured `{communication_language}`.
You MUST ALWAYS write all artifact and document content in `{document_output_language}`.

### Runtime Inputs

- `workflow_mode` = "" (set by parent: `initial_scan` or `full_rescan`)
- `scan_level` = "" (set by parent: `quick`, `deep`, or `exhaustive`)
- `resume_mode` = false
- `autonomous` = false (requires user input at key decision points)

---

### Full-Scan Step 0.5: Load Documentation Requirements Data (fresh starts only)

**Only runs if resume_mode == false**

Display explanation to user:

> **How Project Type Detection Works:**
>
> This workflow uses a comprehensive documentation requirements dataset to intelligently document your project:
>
> - Contains 12 project types (web, mobile, backend, cli, library, desktop, game, data, extension, infra, embedded)
> - 24-column schema combining project type detection AND documentation requirements
> - **Detection columns**: project_type_id, key_file_patterns (used to identify project type from codebase)
> - **Requirement columns**: requires_api_scan, requires_data_models, requires_ui_components, etc.
> - **Pattern columns**: critical_directories, test_file_patterns, config_patterns, etc.
> - Acts as a "scan guide" - tells the workflow WHERE to look and WHAT to document
>
> **When Documentation Requirements are Loaded:**
> - **Fresh Start (initial_scan)**: Load all 12 rows, detect type using key_file_patterns, use that row's requirements
> - **Resume**: Load ONLY the doc requirements row(s) for cached project_type_id(s)
> - **Full Rescan**: Same as fresh start (may re-detect project type)
> - **Deep Dive**: Load ONLY doc requirements for the part being deep-dived

Load documentation requirements from the inline CSV data below. Store all 12 rows indexed by project_type_id for project detection and requirements lookup.

### Full-Scan Step 0.6: Check for Existing Documentation

Check if `{project_knowledge}/index.md` exists.

**If index.md exists:**

Read existing index.md to extract metadata (date, project structure, parts count).

Ask the user:

> I found existing documentation generated on {{existing_doc_date}}.
> 1. **Re-scan entire project** - Update all documentation with latest changes
> 2. **Deep-dive into specific area** - Generate detailed documentation for a particular feature/module/folder
> 3. **Cancel** - Keep existing documentation as-is

- If user selects 1: Set workflow_mode = "full_rescan". Continue to scan level selection.
- If user selects 2: Set workflow_mode = "deep_dive", scan_level = "exhaustive". Initialize state file. Jump to Deep-Dive Sub-Workflow Step 13.
- If user selects 3: Exit workflow.

**If index.md does not exist:**

Set workflow_mode = "initial_scan". Continue to scan level selection.

**Scan Level Selection (if workflow_mode != deep_dive):**

Ask the user:

> Choose your scan depth level:
>
> **1. Quick Scan** (2-5 minutes) [DEFAULT]
> - Pattern-based analysis without reading source files
> - Scans: Config files, package manifests, directory structure
> - Best for: Quick project overview, initial understanding
>
> **2. Deep Scan** (10-30 minutes)
> - Reads files in critical directories based on project type
> - Scans: All critical paths from documentation requirements
> - Best for: Comprehensive documentation for brownfield PRD
>
> **3. Exhaustive Scan** (30-120 minutes)
> - Reads ALL source files in project
> - Scans: Every source file (excludes node_modules, dist, build)
> - Best for: Complete analysis, migration planning, detailed audit

- If user selects 1 or presses enter: Set scan_level = "quick"
- If user selects 2: Set scan_level = "deep"
- If user selects 3: Set scan_level = "exhaustive"

Initialize state file at `{project_knowledge}/project-scan-report.json`:

```json
{
  "workflow_version": "1.2.0",
  "timestamps": {"started": "{{current_timestamp}}", "last_updated": "{{current_timestamp}}"},
  "mode": "{{workflow_mode}}",
  "scan_level": "{{scan_level}}",
  "project_root": "{{project_root_path}}",
  "project_knowledge": "{{project_knowledge}}",
  "completed_steps": [],
  "current_step": "step_1",
  "findings": {},
  "outputs_generated": ["project-scan-report.json"],
  "resume_instructions": "Starting from step 1"
}
```

**CRITICAL:** Every time you touch the state file, record: step id, human-readable summary (what you actually did), precise timestamp, and any outputs written. Vague phrases are unacceptable.

### Full-Scan Step 1: Detect Project Structure and Classify Project Type

Ask user: "What is the root directory of the project to document?" (default: current working directory). Store as {{project_root_path}}.

Scan {{project_root_path}} for key indicators:
- Directory structure (presence of client/, server/, api/, src/, app/, etc.)
- Key files (package.json, go.mod, requirements.txt, etc.)
- Technology markers matching key_file_patterns from documentation requirements

Detect if project is:
- **Monolith**: Single cohesive codebase
- **Monorepo**: Multiple parts in one repository
- **Multi-part**: Separate client/server or similar architecture

**If multiple distinct parts detected (e.g., client/ and server/ folders):**

List detected parts with their paths. Ask user to confirm. If confirmed, set repository_type = "monorepo" or "multi-part". For each detected part: identify root path, run project type detection using key_file_patterns from documentation requirements, store as part in project_parts array.

**If single cohesive project detected:**

Set repository_type = "monolith". Create single part in project_parts array with root_path = {{project_root_path}}. Run project type detection.

For each part, match detected technologies and file patterns against key_file_patterns column in documentation requirements. Assign project_type_id to each part. Load corresponding documentation_requirements row for each part.

Ask user to confirm classification.

**IMMEDIATELY update state file** with step completion. Cache project_type_id(s). PURGE detailed scan results from memory, keep only summary.

### Full-Scan Step 2: Discover Existing Documentation and Gather User Context

For each part, scan for existing documentation:
- README.md, README.rst, README.txt
- CONTRIBUTING.md, CONTRIBUTING.rst
- ARCHITECTURE.md, docs/architecture/
- DEPLOYMENT.md, docs/deployment/
- API.md, docs/api/
- Any files in docs/, documentation/, .github/ folders

Create inventory of existing_docs. Ask user for additional guidance. Update state file. PURGE detailed doc contents from memory.

### Full-Scan Step 3: Analyze Technology Stack

For each part in project_parts:
- Load key_file_patterns from documentation_requirements
- Scan part root for these patterns
- Parse technology manifest files (package.json, go.mod, requirements.txt, etc.)
- Extract: framework, language, version, database, dependencies
- Build technology_table with columns: Category, Technology, Version, Justification

Determine architecture pattern based on detected tech stack. Update state file. PURGE detailed tech analysis.

### Full-Scan Step 4: Conditional Analysis Based on Project Type

**BATCHING STRATEGY FOR DEEP/EXHAUSTIVE SCANS:**

For deep or exhaustive scan levels:
- Identify subfolders to process:
  - deep: Use critical_directories from documentation_requirements
  - exhaustive: Get ALL subfolders recursively (excluding node_modules, .git, dist, build, coverage)
- For each subfolder: Read all files, extract required info, IMMEDIATELY write findings, validate, update state, PURGE from context, move to next subfolder

For quick scan: Use pattern matching only - do NOT read source files. Use glob/grep.

**Conditional scans based on documentation_requirements boolean flags:**

- **requires_api_scan == true**: Scan for API routes/endpoints. Build API contracts catalog. IMMEDIATELY write to `{project_knowledge}/api-contracts-{part_id}.md`. PURGE.
- **requires_data_models == true**: Scan for data models. Build database schema docs. IMMEDIATELY write to `{project_knowledge}/data-models-{part_id}.md`. PURGE.
- **requires_state_management == true**: Analyze state management patterns (Redux, Context API, MobX, etc.)
- **requires_ui_components == true**: Inventory UI component library. Categorize components.
- **requires_hardware_docs == true**: Look for hardware schematics. Ask user for hardware doc paths.
- **requires_asset_inventory == true**: Scan and catalog assets.

Scan for additional patterns: config_patterns, auth_security_patterns, entry_point_patterns, shared_code_patterns, async_event_patterns, ci_cd_patterns, localization_patterns.

Update state file. PURGE all detailed scan results.

### Full-Scan Step 5: Generate Source Tree Analysis

For each part, generate complete directory tree using critical_directories. Annotate with purpose, entry points, key file locations, integration points. For multi-part: show how parts are organized and where they interface.

IMMEDIATELY write source-tree-analysis.md. Validate. Update state file. PURGE.

### Full-Scan Step 6: Extract Development and Operational Information

Scan for:
- Prerequisites, installation steps, environment setup, build commands, run commands, test commands
- Deployment configuration: Dockerfile, docker-compose, Kubernetes, CI/CD pipelines, IaC
- Contribution guidelines (if CONTRIBUTING.md found)

Update state file. PURGE.

### Full-Scan Step 7: Detect Multi-Part Integration Architecture

**Only runs for projects with multiple parts.**

Analyze how parts communicate. Identify REST calls, GraphQL, gRPC, message queues, shared databases. Create integration_points array. IMMEDIATELY write integration-architecture.md. Validate. Update state file. PURGE.

### Full-Scan Step 8: Generate Architecture Documentation

For each part, use matched architecture template. Fill all sections: Executive Summary, Technology Stack, Architecture Pattern, Data Architecture, API Design, Component Overview, Source Tree, Development Workflow, Deployment, Testing Strategy.

- Single part: Generate architecture.md
- Multi-part: Generate architecture-{part_id}.md for each part

IMMEDIATELY write, validate, update state, PURGE for each.

### Full-Scan Step 9: Generate Supporting Documentation

Generate the following, IMMEDIATELY writing each to disk:
- **project-overview.md**: Project name, purpose, executive summary, tech stack, architecture, repo structure
- **source-tree-analysis.md** (if not written in Step 5)
- **component-inventory.md** (or per-part): All discovered components, categorized
- **development-guide.md** (or per-part): Prerequisites, environment setup, commands, testing
- **deployment-guide.md** (if deployment config found)
- **contribution-guide.md** (if contribution guidelines found)
- **api-contracts.md** (or per-part, if APIs documented)
- **data-models.md** (or per-part, if data models documented)
- **integration-architecture.md** (if multi-part)
- **project-parts.json** (if multi-part)

Update state file. PURGE all document contents.

### Full-Scan Step 10: Generate Master Index

**INCOMPLETE DOCUMENTATION MARKER CONVENTION:**

When a document SHOULD be generated but wasn't (due to quick scan, missing data, etc.):
- Use EXACTLY this marker: `_(To be generated)_`
- Place it at the end of the markdown link line
- Example: `- [API Contracts - Server](./api-contracts-server.md) _(To be generated)_`

Create index.md with intelligent navigation based on project structure. For single-part projects: simple index with quick reference. For multi-part projects: comprehensive index with part-based navigation and cross-part integration links.

Before writing, check which expected files actually exist. Set existence flags and _(To be generated)_ markers for missing files.

IMMEDIATELY write index.md. Validate. Update state file. PURGE.

### Full-Scan Step 11: Validate and Review

Show summary of all generated files. Run validation checklist.

**Incomplete documentation detection:**
1. PRIMARY SCAN: Look for exact marker `_(To be generated)_`
2. FALLBACK SCAN: Look for fuzzy patterns: `_(TBD)_`, `_(TODO)_`, `_(Coming soon)_`, `_(Not yet generated)_`, `_(Pending)_`
3. Extract document metadata from each match

Present options to user:
1. Generate incomplete documentation (if any found)
2. Review specific sections
3. Add more detail to areas
4. Generate additional custom documentation
5. Finalize and complete

If user selects "generate incomplete": Let them choose which items. Route to appropriate generation substep based on doc_type (architecture, api-contracts, data-models, component-inventory, development-guide, deployment-guide, integration-architecture). After generation, update index.md to remove markers.

Loop back to check for remaining incomplete items until user finalizes.

### Full-Scan Step 12: Finalize and Provide Next Steps

Create final summary report. Compile verification recap: tests/validations executed, open risks, recommended next checks.

Display completion message with:
- Location of documentation
- Master index path
- List of generated documentation
- Next steps for brownfield PRD workflow
- Verification recap

Finalize state file with completed timestamp.

---

## DEEP-DIVE SUB-WORKFLOW

**Goal:** Exhaustive deep-dive documentation of specific project areas.

**Your Role:** Deep-dive documentation specialist.
- Deep-dive mode requires literal full-file review. Sampling, guessing, or relying solely on tooling output is FORBIDDEN.

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
- `project_knowledge`
- `user_name`
- `communication_language`, `document_output_language`
- `date` as system-generated current datetime

You MUST ALWAYS speak in your Agent communication style with `{communication_language}`.
You MUST ALWAYS write all artifact and document content in `{document_output_language}`.

### Runtime Inputs

- `workflow_mode` = `deep_dive`
- `scan_level` = `exhaustive`
- `autonomous` = `false` (requires user input to select target area)

---

### Deep-Dive Step 13: Deep-dive documentation of specific area

**CRITICAL:** Deep-dive mode requires literal full-file review. Sampling, guessing, or relying solely on tooling output is FORBIDDEN.

Load existing project structure from index.md and project-parts.json (if exists). Load source tree analysis to understand available areas.

#### Step 13a: Identify Area for Deep-Dive

Analyze existing documentation to suggest deep-dive options. Present to user:

> What area would you like to deep-dive into?
>
> **Suggested Areas Based on Project Structure:**
>
> (If API routes found) API Routes with endpoint groups
> (If feature modules found) Feature Modules with file counts
> (If UI components found) UI Component Areas with component counts
> (If services found) Services/Business Logic areas
>
> **Or specify custom:**
> - Folder path (e.g., "client/src/features/dashboard")
> - File path (e.g., "server/src/api/users.ts")
> - Feature name (e.g., "authentication system")

Parse user input to determine: target_type ("folder" | "file" | "feature" | "api_group" | "component_group"), target_path, target_name, target_scope.

Display confirmation with estimated file count. Ask user to proceed.

#### Step 13b: Comprehensive Exhaustive Scan of Target Area

Set scan_mode = "exhaustive". Initialize file_inventory = [].

You must read every line of every file in scope and capture a plain-language explanation that future developer agents can act on. No shortcuts.

**For folder targets:** Get complete recursive file list. Filter out node_modules/, .git/, dist/, build/, coverage/, *.min.js, *.map. For EVERY remaining file: Read complete contents, extract all exports/imports, identify purpose, write natural language description, extract function signatures, note TODOs/FIXMEs, identify patterns, capture contributor guidance.

**For file targets:** Read complete file. Extract all information. Read all files it imports (1 level deep). Find all files that import this file. Store all in file_inventory.

**For API group targets:** Identify all route/controller files. Read all handlers, middleware, controllers, services, data models, schemas. Extract request/response schemas. Document auth requirements.

**For feature targets:** Search codebase for all related files. Include UI components, API endpoints, models, services, tests. Read each completely.

**For component group targets:** Get all component files. Read each completely. Extract props interfaces, hooks, child components, state management.

Document for each file:
- File Path, Purpose, Lines of Code
- Exports (functions, classes, types, interfaces, constants with signatures)
- Imports/Dependencies
- Used By (dependents)
- Key Implementation Details
- State Management
- Side Effects
- Error Handling
- Testing (associated test files and coverage)
- Comments/TODOs

#### Step 13c: Analyze Relationships and Data Flow

Build dependency graph: files as nodes, import relationships as edges. Identify circular dependencies, entry points, leaf nodes.

Trace data flow: function calls, data transformations, API calls, state updates, database queries.

Identify integration points: external APIs, internal services, shared state, events, database tables.

#### Step 13d: Find Related Code and Similar Patterns

Search codebase OUTSIDE scanned area for: similar naming patterns, function signatures, component structures, API patterns, reusable utilities.

Identify code reuse opportunities. Find reference implementations.

#### Step 13e: Generate Comprehensive Deep-Dive Documentation

Create filename: `deep-dive-{{sanitized_target_name}}.md`

Aggregate contributor insights across files: combine risk/gotcha notes, verification steps, recommended tests.

Fill the Deep-Dive Template (see Templates section below) with all collected data from steps 13b-13d. Write to `{project_knowledge}/deep-dive-{{sanitized_target_name}}.md`. Validate completeness.

Update state file with deep_dive_targets, outputs_generated, timestamp.

#### Step 13f: Update Master Index

Read existing index.md. If "Deep-Dive Documentation" section does not exist, add it. Add link to new deep-dive doc. Update index metadata. Save.

#### Step 13g: Offer to Continue or Complete

Display summary with files analyzed, LOC scanned, documentation includes.

Ask user:
1. **Deep-dive another area**
2. **Finish**

If user selects 1: Clear target, go to Step 13a.
If user selects 2: Display final message and exit.

---

## VALIDATION CHECKLIST

### Scan Level and Resumability

- [ ] Scan level selection offered (quick/deep/exhaustive) for initial_scan and full_rescan modes
- [ ] Deep-dive mode automatically uses exhaustive scan (no choice given)
- [ ] Quick scan does NOT read source files (only patterns, configs, manifests)
- [ ] Deep scan reads files in critical directories per project type
- [ ] Exhaustive scan reads ALL source files (excluding node_modules, dist, build)
- [ ] State file (project-scan-report.json) created at workflow start
- [ ] State file updated after each step completion
- [ ] State file contains all required fields per schema
- [ ] Resumability prompt shown if state file exists and is <24 hours old
- [ ] Old state files (>24 hours) automatically archived
- [ ] Resume functionality loads previous state correctly
- [ ] Workflow can jump to correct step when resuming

### Write-as-you-go Architecture

- [ ] Each document written to disk IMMEDIATELY after generation
- [ ] Document validation performed right after writing (section-level)
- [ ] State file updated after each document is written
- [ ] Detailed findings purged from context after writing (only summaries kept)
- [ ] Context contains only high-level summaries (1-2 sentences per section)
- [ ] No accumulation of full project analysis in memory

### Batching Strategy (Deep/Exhaustive Scans)

- [ ] Batching applied for deep and exhaustive scan levels
- [ ] Batches organized by SUBFOLDER (not arbitrary file count)
- [ ] Large files (>5000 LOC) handled with appropriate judgment
- [ ] Each batch: read files, extract info, write output, validate, purge context
- [ ] Batch completion tracked in state file (batches_completed array)
- [ ] Batch summaries kept in context (1-2 sentences max)

### Project Detection and Classification

- [ ] Project type correctly identified and matches actual technology stack
- [ ] Multi-part vs single-part structure accurately detected
- [ ] All project parts identified if multi-part (no missing client/server/etc.)
- [ ] Documentation requirements loaded for each part type
- [ ] Architecture registry match is appropriate for detected stack

### Technology Stack Analysis

- [ ] All major technologies identified (framework, language, database, etc.)
- [ ] Versions captured where available
- [ ] Technology decision table is complete and accurate
- [ ] Dependencies and libraries documented
- [ ] Build tools and package managers identified

### Codebase Scanning Completeness

- [ ] All critical directories scanned based on project type
- [ ] API endpoints documented (if requires_api_scan = true)
- [ ] Data models captured (if requires_data_models = true)
- [ ] State management patterns identified (if requires_state_management = true)
- [ ] UI components inventoried (if requires_ui_components = true)
- [ ] Configuration files located and documented
- [ ] Authentication/security patterns identified
- [ ] Entry points correctly identified
- [ ] Integration points mapped (for multi-part projects)
- [ ] Test files and patterns documented

### Source Tree Analysis

- [ ] Complete directory tree generated with no major omissions
- [ ] Critical folders highlighted and described
- [ ] Entry points clearly marked
- [ ] Integration paths noted (for multi-part)
- [ ] Asset locations identified (if applicable)
- [ ] File organization patterns explained

### Architecture Documentation Quality

- [ ] Architecture document uses appropriate template from registry
- [ ] All template sections filled with relevant information (no placeholders)
- [ ] Technology stack section is comprehensive
- [ ] Architecture pattern clearly explained
- [ ] Data architecture documented (if applicable)
- [ ] API design documented (if applicable)
- [ ] Component structure explained (if applicable)
- [ ] Source tree included and annotated
- [ ] Testing strategy documented
- [ ] Deployment architecture captured (if config found)

### Development and Operations Documentation

- [ ] Prerequisites clearly listed
- [ ] Installation steps documented
- [ ] Environment setup instructions provided
- [ ] Local run commands specified
- [ ] Build process documented
- [ ] Test commands and approach explained
- [ ] Deployment process documented (if applicable)
- [ ] CI/CD pipeline details captured (if found)
- [ ] Contribution guidelines extracted (if found)

### Multi-Part Project Specific (if applicable)

- [ ] Each part documented separately
- [ ] Part-specific architecture files created (architecture-{part_id}.md)
- [ ] Part-specific component inventories created (if applicable)
- [ ] Part-specific development guides created
- [ ] Integration architecture document created
- [ ] Integration points clearly defined with type and details
- [ ] Data flow between parts explained
- [ ] project-parts.json metadata file created

### Index and Navigation

- [ ] index.md created as master entry point
- [ ] Project structure clearly summarized in index
- [ ] Quick reference section complete and accurate
- [ ] All generated docs linked from index
- [ ] All existing docs linked from index (if found)
- [ ] Getting started section provides clear next steps
- [ ] AI-assisted development guidance included
- [ ] Navigation structure matches project complexity

### File Completeness

- [ ] index.md generated
- [ ] project-overview.md generated
- [ ] source-tree-analysis.md generated
- [ ] architecture.md (or per-part) generated
- [ ] component-inventory.md (or per-part) generated if UI components exist
- [ ] development-guide.md (or per-part) generated
- [ ] api-contracts.md (or per-part) generated if APIs documented
- [ ] data-models.md (or per-part) generated if data models found
- [ ] deployment-guide.md generated if deployment config found
- [ ] contribution-guide.md generated if guidelines found
- [ ] integration-architecture.md generated if multi-part
- [ ] project-parts.json generated if multi-part

### Content Quality

- [ ] Technical information is accurate and specific
- [ ] No generic placeholders or "TODO" items remain
- [ ] Examples and code snippets are relevant to actual project
- [ ] File paths and directory references are correct
- [ ] Technology names and versions are accurate
- [ ] Terminology is consistent across all documents
- [ ] Descriptions are clear and actionable

### Brownfield PRD Readiness

- [ ] Documentation provides enough context for AI to understand existing system
- [ ] Integration points are clear for planning new features
- [ ] Reusable components are identified for leveraging in new work
- [ ] Data models are documented for schema extension planning
- [ ] API contracts are documented for endpoint expansion
- [ ] Code conventions and patterns are captured for consistency
- [ ] Architecture constraints are clear for informed decision-making

### Output Validation

- [ ] All files saved to correct output folder
- [ ] File naming follows convention (no part suffix for single-part, with suffix for multi-part)
- [ ] No broken internal links between documents
- [ ] Markdown formatting is correct and renders properly
- [ ] JSON files are valid (project-parts.json if applicable)

### Final Validation

- [ ] User confirmed project classification is accurate
- [ ] User provided any additional context needed
- [ ] All requested areas of focus addressed
- [ ] Documentation is immediately usable for brownfield PRD workflow
- [ ] No critical information gaps identified

### Deep-Dive Mode Validation (if applicable)

- [ ] Deep-dive target area correctly identified and scoped
- [ ] All files in target area read completely (no skipped files)
- [ ] File inventory includes all exports with complete signatures
- [ ] Dependencies mapped for all files
- [ ] Dependents identified (who imports each file)
- [ ] Code snippets included for key implementation details
- [ ] Patterns and design approaches documented
- [ ] State management strategy explained
- [ ] Side effects documented (API calls, DB queries, etc.)
- [ ] Error handling approaches captured
- [ ] Testing files and coverage documented
- [ ] TODOs and comments extracted
- [ ] Dependency graph created showing relationships
- [ ] Data flow traced through the scanned area
- [ ] Integration points with rest of codebase identified
- [ ] Related code and similar patterns found outside scanned area
- [ ] Reuse opportunities documented
- [ ] Implementation guidance provided
- [ ] Modification instructions clear
- [ ] Index.md updated with deep-dive link
- [ ] Deep-dive documentation is immediately useful for implementation

### State File Quality

- [ ] State file is valid JSON (no syntax errors)
- [ ] State file is optimized (no pretty-printing, minimal whitespace)
- [ ] State file contains all completed steps with timestamps
- [ ] State file outputs_generated list is accurate and complete
- [ ] State file resume_instructions are clear and actionable
- [ ] State file findings contain only high-level summaries (not detailed data)
- [ ] State file can be successfully loaded for resumption

### Completion Criteria

All items in the following sections must be checked:
- Scan Level and Resumability
- Write-as-you-go Architecture
- Batching Strategy (if deep/exhaustive scan)
- Project Detection and Classification
- Technology Stack Analysis
- Architecture Documentation Quality
- Index and Navigation
- File Completeness
- Brownfield PRD Readiness
- State File Quality
- Deep-Dive Mode Validation (if applicable)

The workflow is complete when:
1. All critical checklist items are satisfied
2. No critical issues remain
3. User has reviewed and approved the documentation
4. Generated docs are ready for use in brownfield PRD workflow
5. Deep-dive docs (if any) are comprehensive and implementation-ready
6. State file is valid and can enable resumption if interrupted

---

## DOCUMENTATION REQUIREMENTS (CSV DATA)

The following data drives project type detection and documentation requirements:

```csv
project_type_id,requires_api_scan,requires_data_models,requires_state_management,requires_ui_components,requires_deployment_config,key_file_patterns,critical_directories,integration_scan_patterns,test_file_patterns,config_patterns,auth_security_patterns,schema_migration_patterns,entry_point_patterns,shared_code_patterns,monorepo_workspace_patterns,async_event_patterns,ci_cd_patterns,asset_patterns,hardware_interface_patterns,protocol_schema_patterns,localization_patterns,requires_hardware_docs,requires_asset_inventory
web,true,true,true,true,true,package.json;tsconfig.json;*.config.js;*.config.ts;vite.config.*;webpack.config.*;next.config.*;nuxt.config.*,src/;app/;pages/;components/;api/;lib/;styles/;public/;static/,*client.ts;*service.ts;*api.ts;fetch*.ts;axios*.ts;*http*.ts,*.test.ts;*.spec.ts;*.test.tsx;*.spec.tsx;**/__tests__/**;**/*.test.*;**/*.spec.*,.env*;config/*;*.config.*;.config/;settings/,*auth*.ts;*session*.ts;middleware/auth*;*.guard.ts;*authenticat*;*permission*;guards/,migrations/**;prisma/**;*.prisma;alembic/**;knex/**;*migration*.sql;*migration*.ts,main.ts;index.ts;app.ts;server.ts;_app.tsx;_app.ts;layout.tsx,shared/**;common/**;utils/**;lib/**;helpers/**;@*/**;packages/**,pnpm-workspace.yaml;lerna.json;nx.json;turbo.json;workspace.json;rush.json,*event*.ts;*queue*.ts;*subscriber*.ts;*consumer*.ts;*producer*.ts;*worker*.ts;jobs/**,.github/workflows/**;.gitlab-ci.yml;Jenkinsfile;.circleci/**;azure-pipelines.yml;bitbucket-pipelines.yml,.drone.yml,public/**;static/**;assets/**;images/**;media/**,N/A,*.proto;*.graphql;graphql/**;schema.graphql;*.avro;openapi.*;swagger.*,i18n/**;locales/**;lang/**;translations/**;messages/**;*.po;*.pot,false,false
mobile,true,true,true,true,true,package.json;pubspec.yaml;Podfile;build.gradle;app.json;capacitor.config.*;ionic.config.json,src/;app/;screens/;components/;services/;models/;assets/;ios/;android/,*client.ts;*service.ts;*api.ts;fetch*.ts;axios*.ts;*http*.ts,*.test.ts;*.test.tsx;*_test.dart;*.test.dart;**/__tests__/**,.env*;config/*;app.json;capacitor.config.*;google-services.json;GoogleService-Info.plist,*auth*.ts;*session*.ts;*authenticat*;*permission*;*biometric*;secure-store*,migrations/**;realm/**;*.realm;watermelondb/**;sqlite/**,main.ts;index.ts;App.tsx;App.ts;main.dart,shared/**;common/**;utils/**;lib/**;components/shared/**;@*/**,pnpm-workspace.yaml;lerna.json;nx.json;turbo.json,*event*.ts;*notification*.ts;*push*.ts;background-fetch*,fastlane/**;.github/workflows/**;.gitlab-ci.yml;bitbucket-pipelines.yml;appcenter-*,assets/**;Resources/**;res/**;*.xcassets;drawable*/;mipmap*/;images/**,N/A,*.proto;graphql/**;*.graphql,i18n/**;locales/**;translations/**;*.strings;*.xml,false,true
backend,true,true,false,false,true,package.json;requirements.txt;go.mod;Gemfile;pom.xml;build.gradle;Cargo.toml;*.csproj,src/;api/;services/;models/;routes/;controllers/;middleware/;handlers/;repositories/;domain/,*client.ts;*repository.ts;*service.ts;*connector*.ts;*adapter*.ts,*.test.ts;*.spec.ts;*_test.go;test_*.py;*Test.java;*_test.rs,.env*;config/*;*.config.*;application*.yml;application*.yaml;appsettings*.json;settings.py,*auth*.ts;*session*.ts;*authenticat*;*authorization*;middleware/auth*;guards/;*jwt*;*oauth*,migrations/**;alembic/**;flyway/**;liquibase/**;prisma/**;*.prisma;*migration*.sql;*migration*.ts;db/migrate,main.ts;index.ts;server.ts;app.ts;main.go;main.py;Program.cs;__init__.py,shared/**;common/**;utils/**;lib/**;core/**;@*/**;pkg/**,pnpm-workspace.yaml;lerna.json;nx.json;go.work,*event*.ts;*queue*.ts;*subscriber*.ts;*consumer*.ts;*producer*.ts;*worker*.ts;*handler*.ts;jobs/**;workers/**,.github/workflows/**;.gitlab-ci.yml;Jenkinsfile;.circleci/**;azure-pipelines.yml;.drone.yml,N/A,N/A,*.proto;*.graphql;graphql/**;*.avro;*.thrift;openapi.*;swagger.*;schema/**,N/A,false,false
cli,false,false,false,false,false,package.json;go.mod;Cargo.toml;setup.py;pyproject.toml;*.gemspec,src/;cmd/;cli/;bin/;lib/;commands/,N/A,*.test.ts;*_test.go;test_*.py;*.spec.ts;*_spec.rb,.env*;config/*;*.config.*;.*.rc;.*rc,N/A,N/A,main.ts;index.ts;cli.ts;main.go;main.py;__main__.py;bin/*,shared/**;common/**;utils/**;lib/**;helpers/**,N/A,N/A,.github/workflows/**;.gitlab-ci.yml;goreleaser.yml,N/A,N/A,N/A,N/A,false,false
library,false,false,false,false,false,package.json;setup.py;Cargo.toml;go.mod;*.gemspec;*.csproj;pom.xml,src/;lib/;dist/;pkg/;build/;target/,N/A,*.test.ts;*_test.go;test_*.py;*.spec.ts;*Test.java;*_test.rs,.*.rc;tsconfig.json;rollup.config.*;vite.config.*;webpack.config.*,N/A,N/A,index.ts;index.js;lib.rs;main.go;__init__.py,src/**;lib/**;core/**,N/A,N/A,.github/workflows/**;.gitlab-ci.yml;.circleci/**,N/A,N/A,N/A,N/A,false,false
desktop,false,false,true,true,true,package.json;Cargo.toml;*.csproj;CMakeLists.txt;tauri.conf.json;electron-builder.yml;wails.json,src/;app/;components/;main/;renderer/;resources/;assets/;build/,*service.ts;ipc*.ts;*bridge*.ts;*native*.ts;invoke*,*.test.ts;*.spec.ts;*_test.rs;*.spec.tsx,.env*;config/*;*.config.*;app.config.*;forge.config.*;builder.config.*,*auth*.ts;*session*.ts;keychain*;secure-storage*,N/A,main.ts;index.ts;main.js;src-tauri/main.rs;electron.ts,shared/**;common/**;utils/**;lib/**;components/shared/**,N/A,*event*.ts;*ipc*.ts;*message*.ts,.github/workflows/**;.gitlab-ci.yml;.circleci/**,resources/**;assets/**;icons/**;static/**;build/resources,N/A,N/A,i18n/**;locales/**;translations/**;lang/**,false,true
game,false,false,true,false,false,*.unity;*.godot;*.uproject;package.json;project.godot,Assets/;Scenes/;Scripts/;Prefabs/;Resources/;Content/;Source/;src/;scenes/;scripts/,N/A,*Test.cs;*_test.gd;*Test.cpp;*.test.ts,.env*;config/*;*.ini;settings/;GameSettings/,N/A,N/A,main.gd;Main.cs;GameManager.cs;main.cpp;index.ts,shared/**;common/**;utils/**;Core/**;Framework/**,N/A,N/A,.github/workflows/**;.gitlab-ci.yml,Assets/**;Scenes/**;Prefabs/**;Materials/**;Textures/**;Audio/**;Models/**;*.fbx;*.blend;*.shader;*.hlsl;*.glsl;Shaders/**;VFX/**,N/A,N/A,Localization/**;Languages/**;i18n/**,false,true
data,false,true,false,false,true,requirements.txt;pyproject.toml;dbt_project.yml;airflow.cfg;setup.py;Pipfile,dags/;pipelines/;models/;transformations/;notebooks/;sql/;etl/;jobs/,N/A,test_*.py;*_test.py;tests/**,.env*;config/*;profiles.yml;dbt_project.yml;airflow.cfg,N/A,migrations/**;dbt/models/**;*.sql;schemas/**,main.py;__init__.py;pipeline.py;dag.py,shared/**;common/**;utils/**;lib/**;helpers/**,N/A,*event*.py;*consumer*.py;*producer*.py;*worker*.py;jobs/**;tasks/**,.github/workflows/**;.gitlab-ci.yml;airflow/dags/**,N/A,N/A,*.proto;*.avro;schemas/**;*.parquet,N/A,false,false
extension,true,false,true,true,false,manifest.json;package.json;wxt.config.ts,src/;popup/;content/;background/;assets/;components/,*message.ts;*runtime.ts;*storage.ts;*tabs.ts,*.test.ts;*.spec.ts;*.test.tsx,.env*;wxt.config.*;webpack.config.*;vite.config.*,*auth*.ts;*session*.ts;*permission*,N/A,index.ts;popup.ts;background.ts;content.ts,shared/**;common/**;utils/**;lib/**,N/A,*message*.ts;*event*.ts;chrome.runtime*;browser.runtime*,.github/workflows/**,assets/**;icons/**;images/**;static/**,N/A,N/A,_locales/**;locales/**;i18n/**,false,false
infra,false,false,false,false,true,*.tf;*.tfvars;pulumi.yaml;cdk.json;*.yml;*.yaml;Dockerfile;docker-compose*.yml,terraform/;modules/;k8s/;charts/;playbooks/;roles/;policies/;stacks/,N/A,*_test.go;test_*.py;*_test.tf;*_spec.rb,.env*;*.tfvars;config/*;vars/;group_vars/;host_vars/,N/A,N/A,main.tf;index.ts;__main__.py;playbook.yml,modules/**;shared/**;common/**;lib/**,N/A,N/A,.github/workflows/**;.gitlab-ci.yml;.circleci/**,N/A,N/A,N/A,N/A,false,false
embedded,false,false,false,false,false,platformio.ini;CMakeLists.txt;*.ino;Makefile;*.ioc;mbed-os.lib,src/;lib/;include/;firmware/;drivers/;hal/;bsp/;components/,N/A,test_*.c;*_test.cpp;*_test.c;tests/**,.env*;config/*;sdkconfig;*.json;settings/,N/A,N/A,main.c;main.cpp;main.ino;app_main.c,lib/**;shared/**;common/**;drivers/**,N/A,N/A,.github/workflows/**;.gitlab-ci.yml,N/A,*.h;*.hpp;drivers/**;hal/**;bsp/**;pinout.*;peripheral*;gpio*;*.fzz;schematics/**,*.proto;mqtt*;coap*;modbus*,N/A,true,false
```

---

## TEMPLATES

### Project Scan Report Schema (project-scan-report.json)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Project Scan Report Schema",
  "description": "State tracking file for document-project workflow resumability",
  "type": "object",
  "required": ["workflow_version", "timestamps", "mode", "scan_level", "completed_steps", "current_step"],
  "properties": {
    "workflow_version": {
      "type": "string",
      "description": "Version of document-project workflow",
      "example": "1.2.0"
    },
    "timestamps": {
      "type": "object",
      "required": ["started", "last_updated"],
      "properties": {
        "started": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp when workflow started"
        },
        "last_updated": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp of last state update"
        },
        "completed": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp when workflow completed (if finished)"
        }
      }
    },
    "mode": {
      "type": "string",
      "enum": ["initial_scan", "full_rescan", "deep_dive"],
      "description": "Workflow execution mode"
    },
    "scan_level": {
      "type": "string",
      "enum": ["quick", "deep", "exhaustive"],
      "description": "Scan depth level (deep_dive mode always uses exhaustive)"
    },
    "project_root": {
      "type": "string",
      "description": "Absolute path to project root directory"
    },
    "project_knowledge": {
      "type": "string",
      "description": "Absolute path to project knowledge folder"
    },
    "completed_steps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["step", "status"],
        "properties": {
          "step": { "type": "string", "description": "Step identifier" },
          "status": { "type": "string", "enum": ["completed", "partial", "failed"] },
          "timestamp": { "type": "string", "format": "date-time" },
          "outputs": { "type": "array", "items": { "type": "string" }, "description": "Files written during this step" },
          "summary": { "type": "string", "description": "1-2 sentence summary of step outcome" }
        }
      }
    },
    "current_step": { "type": "string", "description": "Current step identifier for resumption" },
    "findings": {
      "type": "object",
      "description": "High-level summaries only (detailed findings purged after writing)",
      "properties": {
        "project_classification": {
          "type": "object",
          "properties": {
            "repository_type": { "type": "string" },
            "parts_count": { "type": "integer" },
            "primary_language": { "type": "string" },
            "architecture_type": { "type": "string" }
          }
        },
        "technology_stack": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "part_id": { "type": "string" },
              "tech_summary": { "type": "string" }
            }
          }
        },
        "batches_completed": {
          "type": "array",
          "description": "For deep/exhaustive scans: subfolders processed",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "files_scanned": { "type": "integer" },
              "summary": { "type": "string" }
            }
          }
        }
      }
    },
    "outputs_generated": {
      "type": "array",
      "items": { "type": "string" },
      "description": "List of all output files generated"
    },
    "resume_instructions": { "type": "string", "description": "Instructions for resuming from current_step" },
    "validation_status": {
      "type": "object",
      "properties": {
        "last_validated": { "type": "string", "format": "date-time" },
        "validation_errors": { "type": "array", "items": { "type": "string" } }
      }
    },
    "deep_dive_targets": {
      "type": "array",
      "description": "Track deep-dive areas analyzed (for deep_dive mode)",
      "items": {
        "type": "object",
        "properties": {
          "target_name": { "type": "string" },
          "target_path": { "type": "string" },
          "files_analyzed": { "type": "integer" },
          "output_file": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
}
```

### Index Template (index.md)

```
# {{project_name}} Documentation Index

**Type:** {{repository_type}}{{#if is_multi_part}} with {{parts_count}} parts{{/if}}
**Primary Language:** {{primary_language}}
**Architecture:** {{architecture_type}}
**Last Updated:** {{date}}

## Project Overview

{{project_description}}

{{#if is_multi_part}}

## Project Structure

This project consists of {{parts_count}} parts:

{{#each project_parts}}

### {{part_name}} ({{part_id}})

- **Type:** {{project_type}}
- **Location:** `{{root_path}}`
- **Tech Stack:** {{tech_stack_summary}}
- **Entry Point:** {{entry_point}}
  {{/each}}

## Cross-Part Integration

{{integration_summary}}

{{/if}}

## Quick Reference

{{#if is_single_part}}

- **Tech Stack:** {{tech_stack_summary}}
- **Entry Point:** {{entry_point}}
- **Architecture Pattern:** {{architecture_pattern}}
- **Database:** {{database}}
- **Deployment:** {{deployment_platform}}
  {{else}}
  {{#each project_parts}}

### {{part_name}} Quick Ref

- **Stack:** {{tech_stack_summary}}
- **Entry:** {{entry_point}}
- **Pattern:** {{architecture_pattern}}
  {{/each}}
  {{/if}}

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md) - Executive summary and high-level architecture
- [Source Tree Analysis](./source-tree-analysis.md) - Annotated directory structure

{{#if is_single_part}}

- [Architecture](./architecture.md) - Detailed technical architecture
- [Component Inventory](./component-inventory.md) - Catalog of major components{{#if has_ui_components}} and UI elements{{/if}}
- [Development Guide](./development-guide.md) - Local setup and development workflow
  {{#if has_api_docs}}- [API Contracts](./api-contracts.md) - API endpoints and schemas{{/if}}
  {{#if has_data_models}}- [Data Models](./data-models.md) - Database schema and models{{/if}}
  {{else}}

### Part-Specific Documentation

{{#each project_parts}}

#### {{part_name}} ({{part_id}})

- [Architecture](./architecture-{{part_id}}.md) - Technical architecture for {{part_name}}
  {{#if has_components}}- [Components](./component-inventory-{{part_id}}.md) - Component catalog{{/if}}
- [Development Guide](./development-guide-{{part_id}}.md) - Setup and dev workflow
  {{#if has_api}}- [API Contracts](./api-contracts-{{part_id}}.md) - API documentation{{/if}}
  {{#if has_data}}- [Data Models](./data-models-{{part_id}}.md) - Data architecture{{/if}}
  {{/each}}

### Integration

- [Integration Architecture](./integration-architecture.md) - How parts communicate
- [Project Parts Metadata](./project-parts.json) - Machine-readable structure
  {{/if}}

### Optional Documentation

{{#if has_deployment_guide}}- [Deployment Guide](./deployment-guide.md) - Deployment process and infrastructure{{/if}}
{{#if has_contribution_guide}}- [Contribution Guide](./contribution-guide.md) - Contributing guidelines and standards{{/if}}

## Existing Documentation

{{#if has_existing_docs}}
{{#each existing_docs}}

- [{{title}}]({{path}}) - {{description}}
  {{/each}}
  {{else}}
  No existing documentation files were found in the project.
  {{/if}}

## Getting Started

{{#if is_single_part}}

### Prerequisites

{{prerequisites}}

### Setup

\`\`\`bash
{{setup_commands}}
\`\`\`

### Run Locally

\`\`\`bash
{{run_commands}}
\`\`\`

### Run Tests

\`\`\`bash
{{test_commands}}
\`\`\`

{{else}}
{{#each project_parts}}

### {{part_name}} Setup

**Prerequisites:** {{prerequisites}}

**Install & Run:**

\`\`\`bash
cd {{root_path}}
{{setup_command}}
{{run_command}}
\`\`\`

{{/each}}
{{/if}}

## For AI-Assisted Development

This documentation was generated specifically to enable AI agents to understand and extend this codebase.

### When Planning New Features:

**UI-only features:**
{{#if is_multi_part}}Reference: `architecture-{{ui_part_id}}.md`, `component-inventory-{{ui_part_id}}.md`{{else}}Reference: `architecture.md`, `component-inventory.md`{{/if}}

**API/Backend features:**
{{#if is_multi_part}}Reference: `architecture-{{api_part_id}}.md`, `api-contracts-{{api_part_id}}.md`, `data-models-{{api_part_id}}.md`{{else}}Reference: `architecture.md`{{#if has_api_docs}}, `api-contracts.md`{{/if}}{{#if has_data_models}}, `data-models.md`{{/if}}{{/if}}

**Full-stack features:**
Reference: All architecture docs{{#if is_multi_part}} + `integration-architecture.md`{{/if}}

**Deployment changes:**
{{#if has_deployment_guide}}Reference: `deployment-guide.md`{{else}}Review CI/CD configs in project{{/if}}

---

_Documentation generated by BMAD Method `document-project` workflow_
```

### Project Overview Template (project-overview.md)

```
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

{{#if is_multi_part}}

## Multi-Part Structure

This project consists of {{parts_count}} distinct parts:

{{#each project_parts}}

### {{part_name}}

- **Type:** {{project_type}}
- **Location:** `{{root_path}}`
- **Purpose:** {{purpose}}
- **Tech Stack:** {{tech_stack}}
  {{/each}}

### How Parts Integrate

{{integration_description}}
{{/if}}

## Technology Stack Summary

{{#if is_single_part}}
{{technology_table}}
{{else}}
{{#each project_parts}}

### {{part_name}} Stack

{{technology_table}}
{{/each}}
{{/if}}

## Key Features

{{key_features}}

## Architecture Highlights

{{architecture_highlights}}

## Development Overview

### Prerequisites

{{prerequisites}}

### Getting Started

{{getting_started_summary}}

### Key Commands

{{#if is_single_part}}

- **Install:** `{{install_command}}`
- **Dev:** `{{dev_command}}`
- **Build:** `{{build_command}}`
- **Test:** `{{test_command}}`
  {{else}}
  {{#each project_parts}}

#### {{part_name}}

- **Install:** `{{install_command}}`
- **Dev:** `{{dev_command}}`
  {{/each}}
  {{/if}}

## Repository Structure

{{repository_structure_summary}}

## Documentation Map

For detailed information, see:

- [index.md](./index.md) - Master documentation index
- [architecture.md](./architecture{{#if is_multi_part}}-{part_id}{{/if}}.md) - Detailed architecture
- [source-tree-analysis.md](./source-tree-analysis.md) - Directory structure
- [development-guide.md](./development-guide{{#if is_multi_part}}-{part_id}{{/if}}.md) - Development workflow

---

_Generated using BMAD Method `document-project` workflow_
```

### Source Tree Template (source-tree-analysis.md)

```
# {{project_name}} - Source Tree Analysis

**Date:** {{date}}

## Overview

{{source_tree_overview}}

{{#if is_multi_part}}

## Multi-Part Structure

This project is organized into {{parts_count}} distinct parts:

{{#each project_parts}}

- **{{part_name}}** (`{{root_path}}`): {{purpose}}
  {{/each}}
  {{/if}}

## Complete Directory Structure

\`\`\`
{{complete_source_tree}}
\`\`\`

## Critical Directories

{{#each critical_folders}}

### `{{folder_path}}`

{{description}}

**Purpose:** {{purpose}}
**Contains:** {{contents_summary}}
{{#if entry_points}}**Entry Points:** {{entry_points}}{{/if}}
{{#if integration_note}}**Integration:** {{integration_note}}{{/if}}

{{/each}}

{{#if is_multi_part}}

## Part-Specific Trees

{{#each project_parts}}

### {{part_name}} Structure

\`\`\`
{{source_tree}}
\`\`\`

**Key Directories:**
{{#each critical_directories}}

- **`{{path}}`**: {{description}}
  {{/each}}

{{/each}}

## Integration Points

{{#each integration_points}}

### {{from_part}} to {{to_part}}

- **Location:** `{{integration_path}}`
- **Type:** {{integration_type}}
- **Details:** {{details}}
  {{/each}}

{{/if}}

## Entry Points

{{#if is_single_part}}

- **Main Entry:** `{{main_entry_point}}`
  {{#if additional_entry_points}}
- **Additional:**
  {{#each additional_entry_points}}
  - `{{path}}`: {{description}}
    {{/each}}
    {{/if}}
    {{else}}
    {{#each project_parts}}

### {{part_name}}

- **Entry Point:** `{{entry_point}}`
- **Bootstrap:** {{bootstrap_description}}
  {{/each}}
  {{/if}}

## File Organization Patterns

{{file_organization_patterns}}

## Key File Types

{{#each file_type_patterns}}

### {{file_type}}

- **Pattern:** `{{pattern}}`
- **Purpose:** {{purpose}}
- **Examples:** {{examples}}
  {{/each}}

## Asset Locations

{{#if has_assets}}
{{#each asset_locations}}

- **{{asset_type}}**: `{{location}}` ({{file_count}} files, {{total_size}})
  {{/each}}
  {{else}}
  No significant assets detected.
  {{/if}}

## Configuration Files

{{#each config_files}}

- **`{{path}}`**: {{description}}
  {{/each}}

## Notes for Development

{{development_notes}}

---

_Generated using BMAD Method `document-project` workflow_
```

### Deep-Dive Template (deep-dive-{target}.md)

```
# {{target_name}} - Deep Dive Documentation

**Generated:** {{date}}
**Scope:** {{target_path}}
**Files Analyzed:** {{file_count}}
**Lines of Code:** {{total_loc}}
**Workflow Mode:** Exhaustive Deep-Dive

## Overview

{{target_description}}

**Purpose:** {{target_purpose}}
**Key Responsibilities:** {{responsibilities}}
**Integration Points:** {{integration_summary}}

## Complete File Inventory

{{#each files_in_inventory}}

### {{file_path}}

**Purpose:** {{purpose}}
**Lines of Code:** {{loc}}
**File Type:** {{file_type}}

**What Future Contributors Must Know:** {{contributor_note}}

**Exports:**
{{#each exports}}

- `{{signature}}` - {{description}}
  {{/each}}

**Dependencies:**
{{#each imports}}

- `{{import_path}}` - {{reason}}
  {{/each}}

**Used By:**
{{#each dependents}}

- `{{dependent_path}}`
  {{/each}}

**Key Implementation Details:**

\`\`\`{{language}}
{{key_code_snippet}}
\`\`\`

{{implementation_notes}}

**Patterns Used:**
{{#each patterns}}

- {{pattern_name}}: {{pattern_description}}
  {{/each}}

**State Management:** {{state_approach}}

**Side Effects:**
{{#each side_effects}}

- {{effect_type}}: {{effect_description}}
  {{/each}}

**Error Handling:** {{error_handling_approach}}

**Testing:**

- Test File: {{test_file_path}}
- Coverage: {{coverage_percentage}}%
- Test Approach: {{test_approach}}

**Comments/TODOs:**
{{#each todos}}

- Line {{line_number}}: {{todo_text}}
  {{/each}}

---

{{/each}}

## Contributor Checklist

- **Risks & Gotchas:** {{risks_notes}}
- **Pre-change Verification Steps:** {{verification_steps}}
- **Suggested Tests Before PR:** {{suggested_tests}}

## Architecture & Design Patterns

### Code Organization

{{organization_approach}}

### Design Patterns

{{#each design_patterns}}

- **{{pattern_name}}**: {{usage_description}}
  {{/each}}

### State Management Strategy

{{state_management_details}}

### Error Handling Philosophy

{{error_handling_philosophy}}

### Testing Strategy

{{testing_strategy}}

## Data Flow

{{data_flow_diagram}}

### Data Entry Points

{{#each entry_points}}

- **{{entry_name}}**: {{entry_description}}
  {{/each}}

### Data Transformations

{{#each transformations}}

- **{{transformation_name}}**: {{transformation_description}}
  {{/each}}

### Data Exit Points

{{#each exit_points}}

- **{{exit_name}}**: {{exit_description}}
  {{/each}}

## Integration Points

### APIs Consumed

{{#each apis_consumed}}

- **{{api_endpoint}}**: {{api_description}}
  - Method: {{method}}
  - Authentication: {{auth_requirement}}
  - Response: {{response_schema}}
    {{/each}}

### APIs Exposed

{{#each apis_exposed}}

- **{{api_endpoint}}**: {{api_description}}
  - Method: {{method}}
  - Request: {{request_schema}}
  - Response: {{response_schema}}
    {{/each}}

### Shared State

{{#each shared_state}}

- **{{state_name}}**: {{state_description}}
  - Type: {{state_type}}
  - Accessed By: {{accessors}}
    {{/each}}

### Events

{{#each events}}

- **{{event_name}}**: {{event_description}}
  - Type: {{publish_or_subscribe}}
  - Payload: {{payload_schema}}
    {{/each}}

### Database Access

{{#each database_operations}}

- **{{table_name}}**: {{operation_type}}
  - Queries: {{query_patterns}}
  - Indexes Used: {{indexes}}
    {{/each}}

## Dependency Graph

{{dependency_graph_visualization}}

### Entry Points (Not Imported by Others in Scope)

{{#each entry_point_files}}

- {{file_path}}
  {{/each}}

### Leaf Nodes (Don't Import Others in Scope)

{{#each leaf_files}}

- {{file_path}}
  {{/each}}

### Circular Dependencies

{{#if has_circular_dependencies}}
Warning: Circular dependencies detected:
{{#each circular_deps}}

- {{cycle_description}}
  {{/each}}
  {{else}}
  No circular dependencies detected.
  {{/if}}

## Testing Analysis

### Test Coverage Summary

- **Statements:** {{statements_coverage}}%
- **Branches:** {{branches_coverage}}%
- **Functions:** {{functions_coverage}}%
- **Lines:** {{lines_coverage}}%

### Test Files

{{#each test_files}}

- **{{test_file_path}}**
  - Tests: {{test_count}}
  - Approach: {{test_approach}}
  - Mocking Strategy: {{mocking_strategy}}
    {{/each}}

### Test Utilities Available

{{#each test_utilities}}

- `{{utility_name}}`: {{utility_description}}
  {{/each}}

### Testing Gaps

{{#each testing_gaps}}

- {{gap_description}}
  {{/each}}

## Related Code & Reuse Opportunities

### Similar Features Elsewhere

{{#each similar_features}}

- **{{feature_name}}** (`{{feature_path}}`)
  - Similarity: {{similarity_description}}
  - Can Reference For: {{reference_use_case}}
    {{/each}}

### Reusable Utilities Available

{{#each reusable_utilities}}

- **{{utility_name}}** (`{{utility_path}}`)
  - Purpose: {{utility_purpose}}
  - How to Use: {{usage_example}}
    {{/each}}

### Patterns to Follow

{{#each patterns_to_follow}}

- **{{pattern_name}}**: Reference `{{reference_file}}` for implementation
  {{/each}}

## Implementation Notes

### Code Quality Observations

{{#each quality_observations}}

- {{observation}}
  {{/each}}

### TODOs and Future Work

{{#each all_todos}}

- **{{file_path}}:{{line_number}}**: {{todo_text}}
  {{/each}}

### Known Issues

{{#each known_issues}}

- {{issue_description}}
  {{/each}}

### Optimization Opportunities

{{#each optimizations}}

- {{optimization_suggestion}}
  {{/each}}

### Technical Debt

{{#each tech_debt_items}}

- {{debt_description}}
  {{/each}}

## Modification Guidance

### To Add New Functionality

{{modification_guidance_add}}

### To Modify Existing Functionality

{{modification_guidance_modify}}

### To Remove/Deprecate

{{modification_guidance_remove}}

### Testing Checklist for Changes

{{#each testing_checklist_items}}

- [ ] {{checklist_item}}
      {{/each}}

---

_Generated by `document-project` workflow (deep-dive mode)_
_Base Documentation: {project_knowledge}/index.md_
_Scan Date: {{date}}_
_Analysis Mode: Exhaustive_
```

---

_Consolidated from BMAD Method `bmad-document-project` skill_
