---
name: Create Story
description: Creates a dedicated story file with all the context the agent will need to implement it later
menu-code: CS
---

# Create Story Workflow

**Goal:** Create a comprehensive story file that gives the dev agent everything needed for flawless implementation.

> **Note on modo under the governed flow (`/alfred`):** This workflow is the BMAD standard flow for generating implementation stories (code tasks). Inside a work run governed by `/alfred`, Bob's materialization adapts to the work's `modo`:
> - `modo: normal` (or the `rediseno-ui` route) → stories as defined here (code tasks, 15–90 min).
> - `modo: investigacion` → tasks are materialized as `frente-investigacion` units (2–4h per frente) using the `etapa-2/tarea.md` template with fields `pregunta_investigativa`, `fuentes_tentativas`, `criterios_de_suficiencia`, `formato_entregable`.
> - `modo: documentacion` → tasks are materialized as documentary units (`tipo_tarea: seccion-documento` or `documentacion`, 30–120 min per seccion) with the fields defined in `agent-os/templates/work-record/etapa-2/tarea.md` (block "Tarea documental"). When the work README has `## Entregables`, every task carries `entregable` (one of its Documento rows), and each deliverable with non-md outputs gets one extra task with `alcance: generar-salidas`.
>
> In both investigation and documentation modes, do NOT invoke this workflow to find epics/stories — read the work's plan (`etapa-2/03-plan.md` and `etapa-2/02-frentes.md` or `etapa-2/02-estructura.md`) and generate tareas directly under `etapa-2/tareas/`. The discipline of no-code-in-story (Rule 1) is adapted: "do not anticipate the hallazgo or the redacted section — the task is the encargo, not the result." Rules 2 (granularity) and 3 (no pre-resolution of dependencies) apply as-is with the mode-specific granularity ranges. See `agent-os/skills/host-protocol/etapas/etapa-2.md` for the full per-modo specification.

**Your Role:** Story context engine that prevents LLM developer mistakes, omissions, or disasters.
- Communicate all responses in {communication_language} and generate all documents in {document_output_language}
- Your purpose is NOT to copy from epics - it's to create a comprehensive, optimized story file that gives the DEV agent EVERYTHING needed for flawless implementation
- COMMON LLM MISTAKES TO PREVENT: reinventing wheels, wrong libraries, wrong file locations, breaking regressions, ignoring UX, vague implementations, lying about completion, not learning from past work
- EXHAUSTIVE ANALYSIS REQUIRED: You must thoroughly analyze ALL artifacts to extract critical context - do NOT be lazy or skim! This is the most important function in the entire development process!
- UTILIZE SUBPROCESSES AND SUBAGENTS: Use research subagents, subprocesses or parallel processing if available to thoroughly analyze different artifacts simultaneously and thoroughly
- SAVE QUESTIONS: If you think of questions or clarifications during analysis, save them for the end after the complete story is written
- ZERO USER INTERVENTION: Process should be fully automated except for initial epic/story selection or missing documents

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `user_skill_level`
- `planning_artifacts`, `implementation_artifacts`
- `date` as system-generated current datetime

### Paths

- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `epics_file` = `{planning_artifacts}/epics.md`
- `prd_file` = `{planning_artifacts}/prd.md`
- `architecture_file` = `{planning_artifacts}/architecture.md`
- `ux_file` = `{planning_artifacts}/*ux*.md`
- `story_title` = "" (will be elicited if not derivable)
- `project_context` = `**/project-context.md` (load if exists)
- `default_output_file` = `{implementation_artifacts}/{{story_key}}.md`

### Input Files

| Input | Description | Path Pattern(s) | Load Strategy |
|-------|-------------|------------------|---------------|
| prd | PRD (fallback - epics file should have most content) | whole: `{planning_artifacts}/*prd*.md`, sharded: `{planning_artifacts}/*prd*/*.md` | SELECTIVE_LOAD |
| architecture | Architecture (fallback - epics file should have relevant sections) | whole: `{planning_artifacts}/*architecture*.md`, sharded: `{planning_artifacts}/*architecture*/*.md` | SELECTIVE_LOAD |
| ux | UX design (fallback - epics file should have relevant sections) | whole: `{planning_artifacts}/*ux*.md`, sharded: `{planning_artifacts}/*ux*/*.md` | SELECTIVE_LOAD |
| epics | Enhanced epics+stories file with BDD and source hints | whole: `{planning_artifacts}/*epic*.md`, sharded: `{planning_artifacts}/*epic*/*.md` | SELECTIVE_LOAD |

---

## EXECUTION

<workflow>

<step n="1" goal="Determine target story">
  <check if="{{story_path}} is provided by user or user provided the epic and story number such as 2-4 or 1.6 or epic 1 story 5">
    <action>Parse user-provided story path: extract epic_num, story_num, story_title from format like "1-2-user-auth"</action>
    <action>Set {{epic_num}}, {{story_num}}, {{story_key}} from user input</action>
    <action>GOTO step 2a</action>
  </check>

  <action>Check if {{sprint_status}} file exists for auto discover</action>
  <check if="sprint status file does NOT exist">
    <output>No sprint status file found and no story specified

      **Required Options:**
      1. Run `sprint-planning` to initialize sprint tracking (recommended)
      2. Provide specific epic-story number to create (e.g., "1-2-user-auth")
      3. Provide path to story documents if sprint status doesn't exist yet
    </output>
    <ask>Choose option [1], provide epic-story number, path to story docs, or [q] to quit:</ask>

    <check if="user chooses 'q'">
      <action>HALT - No work needed</action>
    </check>

    <check if="user chooses '1'">
      <output>Run sprint-planning workflow first to create sprint-status.yaml</output>
      <action>HALT - User needs to run sprint-planning</action>
    </check>

    <check if="user provides epic-story number">
      <action>Parse user input: extract epic_num, story_num, story_title</action>
      <action>Set {{epic_num}}, {{story_num}}, {{story_key}} from user input</action>
      <action>GOTO step 2a</action>
    </check>

    <check if="user provides story docs path">
      <action>Use user-provided path for story documents</action>
      <action>GOTO step 2a</action>
    </check>
  </check>

  <!-- Auto-discover from sprint status only if no user input -->
  <check if="no user input provided">
    <critical>MUST read COMPLETE {sprint_status} file from start to end to preserve order</critical>
    <action>Load the FULL file: {{sprint_status}}</action>
    <action>Read ALL lines from beginning to end - do not skip any content</action>
    <action>Parse the development_status section completely</action>

    <action>Find the FIRST story (by reading in order from top to bottom) where:
      - Key matches pattern: number-number-name (e.g., "1-2-user-auth")
      - NOT an epic key (epic-X) or retrospective (epic-X-retrospective)
      - Status value equals "backlog"
    </action>

    <check if="no backlog story found">
      <output>No backlog stories found in sprint-status.yaml

        All stories are either already created, in progress, or done.

        **Options:**
        1. Run sprint-planning to refresh story tracking
        2. Load PM agent and run correct-course to add more stories
        3. Check if current sprint is complete and run retrospective
      </output>
      <action>HALT</action>
    </check>

    <action>Extract from found story key (e.g., "1-2-user-authentication"):
      - epic_num: first number before dash (e.g., "1")
      - story_num: second number after first dash (e.g., "2")
      - story_title: remainder after second dash (e.g., "user-authentication")
    </action>
    <action>Set {{story_id}} = "{{epic_num}}.{{story_num}}"</action>
    <action>Store story_key for later use (e.g., "1-2-user-authentication")</action>

    <!-- Mark epic as in-progress if this is first story -->
    <action>Check if this is the first story in epic {{epic_num}} by looking for {{epic_num}}-1-* pattern</action>
    <check if="this is first story in epic {{epic_num}}">
      <action>Load {{sprint_status}} and check epic-{{epic_num}} status</action>
      <action>If epic status is "backlog" -> update to "in-progress"</action>
      <action>If epic status is "contexted" (legacy status) -> update to "in-progress" (backward compatibility)</action>
      <action>If epic status is "in-progress" -> no change needed</action>
      <check if="epic status is 'done'">
        <output>ERROR: Cannot create story in completed epic
          Epic {{epic_num}} is marked as 'done'. All stories are complete.
          If you need to add more work, either:
          1. Manually change epic status back to 'in-progress' in sprint-status.yaml
          2. Create a new epic for additional work
        </output>
        <action>HALT - Cannot proceed</action>
      </check>
      <check if="epic status is not one of: backlog, contexted, in-progress, done">
        <output>ERROR: Invalid epic status '{{epic_status}}'
          Epic {{epic_num}} has invalid status. Expected: backlog, in-progress, or done
          Please fix sprint-status.yaml manually or run sprint-planning to regenerate
        </output>
        <action>HALT - Cannot proceed</action>
      </check>
      <output>Epic {{epic_num}} status updated to in-progress</output>
    </check>

    <action>GOTO step 2a</action>
  </check>
  <action>Load the FULL file: {{sprint_status}}</action>
  <action>Read ALL lines from beginning to end - do not skip any content</action>
  <action>Parse the development_status section completely</action>

  <action>Find the FIRST story (by reading in order from top to bottom) where:
    - Key matches pattern: number-number-name (e.g., "1-2-user-auth")
    - NOT an epic key (epic-X) or retrospective (epic-X-retrospective)
    - Status value equals "backlog"
  </action>

  <check if="no backlog story found">
    <output>No backlog stories found in sprint-status.yaml

      All stories are either already created, in progress, or done.

      **Options:**
      1. Run sprint-planning to refresh story tracking
      2. Load PM agent and run correct-course to add more stories
      3. Check if current sprint is complete and run retrospective
    </output>
    <action>HALT</action>
  </check>

  <action>Extract from found story key (e.g., "1-2-user-authentication"):
    - epic_num: first number before dash (e.g., "1")
    - story_num: second number after first dash (e.g., "2")
    - story_title: remainder after second dash (e.g., "user-authentication")
  </action>
  <action>Set {{story_id}} = "{{epic_num}}.{{story_num}}"</action>
  <action>Store story_key for later use (e.g., "1-2-user-authentication")</action>

  <!-- Mark epic as in-progress if this is first story -->
  <action>Check if this is the first story in epic {{epic_num}} by looking for {{epic_num}}-1-* pattern</action>
  <check if="this is first story in epic {{epic_num}}">
    <action>Load {{sprint_status}} and check epic-{{epic_num}} status</action>
    <action>If epic status is "backlog" -> update to "in-progress"</action>
    <action>If epic status is "contexted" (legacy status) -> update to "in-progress" (backward compatibility)</action>
    <action>If epic status is "in-progress" -> no change needed</action>
    <check if="epic status is 'done'">
      <output>ERROR: Cannot create story in completed epic
        Epic {{epic_num}} is marked as 'done'. All stories are complete.
        If you need to add more work, either:
        1. Manually change epic status back to 'in-progress' in sprint-status.yaml
        2. Create a new epic for additional work
      </output>
      <action>HALT - Cannot proceed</action>
    </check>
    <check if="epic status is not one of: backlog, contexted, in-progress, done">
      <output>ERROR: Invalid epic status '{{epic_status}}'
        Epic {{epic_num}} has invalid status. Expected: backlog, in-progress, or done
        Please fix sprint-status.yaml manually or run sprint-planning to regenerate
      </output>
      <action>HALT - Cannot proceed</action>
    </check>
    <output>Epic {{epic_num}} status updated to in-progress</output>
  </check>

  <action>GOTO step 2a</action>
</step>

<step n="2" goal="Load and analyze core artifacts">
  <critical>EXHAUSTIVE ARTIFACT ANALYSIS - This is where you prevent future developer mistakes!</critical>

  <!-- Load all available content through discovery protocol -->
  <action>Load all input files using the discover-inputs protocol (see below)</action>
  <note>Available content: {epics_content}, {prd_content}, {architecture_content}, {ux_content},
  {project_context}</note>

  <!-- Analyze epics file for story foundation -->
  <action>From {epics_content}, extract Epic {{epic_num}} complete context:</action>
  **EPIC ANALYSIS:**
  - Epic objectives and business value
  - ALL stories in this epic for cross-story context
  - Our specific story's requirements, user story statement, acceptance criteria
  - Technical requirements and constraints
  - Dependencies on other stories/epics
  - Source hints pointing to original documents

  <!-- Extract specific story requirements -->
  <action>Extract our story ({{epic_num}}-{{story_num}}) details:</action>
  **STORY FOUNDATION:**
  - User story statement (As a, I want, so that)
  - Detailed acceptance criteria (already BDD formatted)
  - Technical requirements specific to this story
  - Business context and value
  - Success criteria

  <!-- Previous story analysis for context continuity -->
  <check if="story_num > 1">
    <action>Find {{previous_story_num}}: scan {implementation_artifacts} for the story file in epic {{epic_num}} with the highest story number less than {{story_num}}</action>
    <action>Load previous story file: {implementation_artifacts}/{{epic_num}}-{{previous_story_num}}-*.md</action>
    **PREVIOUS STORY INTELLIGENCE:**
    - Dev notes and learnings from previous story
    - Review feedback and corrections needed
    - Files that were created/modified and their patterns
    - Testing approaches that worked/didn't work
    - Problems encountered and solutions found
    - Code patterns established
    <action>Extract all learnings that could impact current story implementation</action>
  </check>

  <!-- Git intelligence for previous work patterns -->
  <check if="previous story exists AND git repository detected">
    <action>Get last 5 commit titles to understand recent work patterns</action>
    <action>Analyze 1-5 most recent commits for relevance to current story:
      - Files created/modified
      - Code patterns and conventions used
      - Library dependencies added/changed
      - Architecture decisions implemented
      - Testing approaches used
    </action>
    <action>Extract actionable insights for current story implementation</action>
  </check>
</step>

<step n="3" goal="Architecture analysis for developer guardrails">
  <critical>ARCHITECTURE INTELLIGENCE - Extract everything the developer MUST follow!</critical>

  **ARCHITECTURE DOCUMENT ANALYSIS:**
  <action>Systematically analyze architecture content for story-relevant requirements:</action>

  <!-- Load architecture - single file or sharded -->
  <check if="architecture file is single file">
    <action>Load complete {architecture_content}</action>
  </check>
  <check if="architecture is sharded to folder">
    <action>Load architecture index and scan all architecture files</action>
  </check>

  **CRITICAL ARCHITECTURE EXTRACTION:**
  <action>For each architecture section, determine if relevant to this story:</action>
  - **Technical Stack:** Languages, frameworks, libraries with versions
  - **Code Structure:** Folder organization, naming conventions, file patterns
  - **API Patterns:** Service structure, endpoint patterns, data contracts
  - **Database Schemas:** Tables, relationships, constraints relevant to story
  - **Security Requirements:** Authentication patterns, authorization rules
  - **Performance Requirements:** Caching strategies, optimization patterns
  - **Testing Standards:** Testing frameworks, coverage expectations, test patterns
  - **Deployment Patterns:** Environment configurations, build processes
  - **Integration Patterns:** External service integrations, data flows

  <action>Extract any story-specific requirements that the developer MUST follow</action>
  <action>Identify any architectural decisions that override previous patterns</action>
</step>

<step n="4" goal="Web research for latest technical specifics">
  <critical>ENSURE LATEST TECH KNOWLEDGE - Prevent outdated implementations!</critical>

  **WEB INTELLIGENCE:**
  <action>Identify specific technical areas that require latest version knowledge:</action>

  <!-- Check for libraries/frameworks mentioned in architecture -->
  <action>From architecture analysis, identify specific libraries, APIs, or frameworks</action>
  <action>For each critical technology, research latest stable version and key changes:
    - Latest API documentation and breaking changes
    - Security vulnerabilities or updates
    - Performance improvements or deprecations
    - Best practices for current version
  </action>

  **EXTERNAL CONTEXT INCLUSION:**
  <action>Include in story any critical latest information the developer needs:
    - Specific library versions and why chosen
    - API endpoints with parameters and authentication
    - Recent security patches or considerations
    - Performance optimization techniques
    - Migration considerations if upgrading
  </action>
</step>

<step n="5" goal="Create comprehensive story file">
  <critical>CREATE ULTIMATE STORY FILE - The developer's master implementation guide!</critical>

  <action>Initialize from story template and write to: {default_output_file}</action>

  <!-- Story foundation from epics analysis -->
  <!-- Developer context section - MOST IMPORTANT PART -->
  **DEV AGENT GUARDRAILS:**
  - Technical requirements
  - Architecture compliance
  - Library/framework requirements
  - File structure requirements
  - Testing requirements

  <!-- Previous story intelligence -->
  <check if="previous story learnings available">
    <action>Include previous story intelligence section</action>
  </check>

  <!-- Git intelligence -->
  <check if="git analysis completed">
    <action>Include git intelligence summary</action>
  </check>

  <!-- Latest technical specifics -->
  <check if="web research completed">
    <action>Include latest tech information</action>
  </check>

  <!-- Project context reference -->
  <action>Include project context reference</action>

  <!-- CRITICAL: Set status to ready-for-dev -->
  <action>Set story Status to: "ready-for-dev"</action>
  <action>Add completion note: "Ultimate context engine analysis completed - comprehensive developer guide created"</action>
</step>

<step n="6" goal="Validate planning discipline before finalizing">
  <critical>
    Before finalizing, validate the materialized tasks against six planning-discipline rules. This step prevents the anti-patterns observed in real works (e.g. work `20260423-migracion-home-a-backoffice-eri` had 14 of 21 tasks with literal C# code, T-001 contained 75 lines of a copy-paste-ready attribute, and T-003 spent 60 lines on a trivial README task). Auto-correcting hides the rules; rejecting and asking Winston to rewrite trains the system.
  </critical>

  <action>**Rule 1 — No literal productive code in tasks.** Scan every materialized task file. A task violates this rule if it contains code blocks (```cs, ```csharp, ```js, ```python, ```ts, etc.) with full method bodies, complete class/attribute/helper implementations, or runnable code the executor would copy-paste. **Allowed:** short pseudocode (5-10 lines max), references to existing code ("same shape as `UsoMaximoAttribute.cs`"), diagrams, tables. **Findings allowed as context:** signatures of interfaces or contracts that ALREADY EXIST in the codebase quoted as findings (so the executor knows what to consume). **DDL allowed as suggestion:** SQL CREATE TABLE / indexes if marked explicitly as suggestions (real DDL may differ at execution).</action>

  <action>**Rule 2 — Task granularity 15-90 min.** Each task must be a coherent unit a single executor can finish in one sitting (15-90 min). Tasks below 15 min must be merged into a parent task as sub-steps. Tasks above 90 min must be decomposed. **Heuristic:** if the materialized plan has more than 15 tasks, recheck for over-fragmentation. If the sum of `tiempo_estimado` of N consecutive tasks is below 30 min, merge them.</action>

  <action>**Rule 3 — No pre-resolution of dependent tasks.** When task N+1 depends on task N, the plan must describe the **dependency** and the **contract** (what outputs N delivers that N+1 consumes), but must NOT pre-resolve N+1 assuming the exact output. The implementation of N+1 is decided at its own execution time, reading the real code produced by N. Pre-written code in N+1 that assumes N's output becomes silently obsolete the moment N is adjusted during execution.</action>

  <action>**Rule 4 — Capa de seguridad declarada (modo normal, or the `rediseno-ui` route).** When the active work (governed by `/alfred`) has `permisos_repo_estado: documentado` or `documentado_externo` (read from the work-record README), every materialized task with `tipo_tarea: codigo` must include a populated `capa_seguridad` block in its frontmatter. The block follows the schema defined in `agent-os/templates/work-record/schema/capa-seguridad.md` section "Capa de seguridad (permisos)". Specific validations:

    - `capa_seguridad.aplica` is `true`, OR `false` with a non-empty justification in `notas_de_aplicacion`.
    - For every entry in `capa_seguridad.metodos[]` whose `accion_crud` is in `[create, update, delete]` and `naturaleza` is `restriccion-acceso`: `requiere_permiso: true` unless `justificacion_si_publico` is populated with explicit reason.
    - For every entry with `naturaleza: modulacion-comportamiento`: `modula_que` is non-null and non-empty (describes the behavioral effect of the permission).
    - `permiso_codigo` matches the regex declared in section 3 of the repo's permission standard.
    - If `decision_permiso: reutilizar`, the code exists in section 4 (catalogo vivo) of the standard. If it does not exist, treat as `nuevo` and confirm with the user.
    - All distinct codes appearing under `permisos_nuevos_a_crear` across tasks are aggregated and pre-announced in `etapa-2/03-plan.md` section "Permisos nuevos a registrar".

    **Inhibition:** if `permisos_repo_estado` is `no_aplica_por_modo` or `override_usuario`, this rule is skipped entirely (no `capa_seguridad` is required).
  </action>

  <action>**Rule 5 — A derived surface is sized against the real source, never against an assumed one.** When a task derives a screen from another, exposes a new entry point into a module, or seeds a structure that already exists in the legacy (menu, tree, catalog), its scope MUST be measured by opening and inventorying the concrete source surface — not a reduced mental version of it. Three traps to catch during materialization:

    - **(1) Omitted affordances.** A derived screen copies the grid/data of the source but drops its UI actions (print, export, etc.). The derived task must carry an explicit checklist of the source screen's affordances; a task that says "replicate screen X" without that inventory is incomplete.
    - **(2) Entry point without its context.** A creation entry point that the business layer requires with a context pair (e.g. an id + its parent) cannot exist without that context. The integration FROM the screen that already holds the context is a blocking task of the module, not a 'later step'.
    - **(3) Legacy structure seeded 'in passing'.** Seeding a legacy structure casually (a menu/tree/catalog) when its real volume (hundreds of items, double filter) turns it into a dedicated task. If the real magnitude was not audited, do NOT declare the structure as covered — split it into its own task with its measured scope.

    If any trap applies and the materialized task does not reflect it, treat as a planning-discipline violation: do not declare the affected surface covered, and return the task to Winston for re-scoping against the audited source.</action>

  <action>**Rule 6 — `archivos` declarado en toda tarea de codigo (desde 2026-07-14).** Every materialized task with `tipo_tarea: codigo` MUST declare the structured field `archivos` in its frontmatter: one entry `{ruta, accion: crear|modificar}` for **each** file the task will create or modify (`crear` if it does not exist yet; `modificar` if it already exists). Specific validations:

    - The field is a **prediction** made without having touched the code. Amelia verifies it against the real codebase in the `[RI]` gate before E3 opens (existence, pertenencia, completitud, solape between tasks) — a wrong path, an inverted `accion` or a missing file is a finding that comes back to you.
    - Declare **every** collateral file the change requires (interface, DI registration, migration, test), not only the obvious one. An incomplete list is as bad as no list.
    - A task that omits `archivos` **cannot be paralelizada** in E3: the anfitrion runs it sequentially. Omitting the field is never a shortcut — it is a loss of throughput.
    - **Inhibition:** tasks that are not `tipo_tarea: codigo` (`frente-investigacion` in `modo: investigacion`, `seccion-documento` in `modo: documentacion`) are exempt.
  </action>
  <!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Orquestacion". El porque (la exclusion mutua que hace segura la paralelizacion, y el fallback fail-safe de la tarea sin `archivos`) vive alli. Aqui solo la obligacion de declararlo al materializar. NO duplicar la regla — para modificar, editar la fuente. -->

  <check if="any rule is violated">
    <action>**STOP materialization.** Do not finalize the story files.</action>
    <action>Publish a message with `I-Bob:` prefix listing every violation found, in prose, one per line, citing the exact location in Winston's plan: which task file (or plan section), which rule was violated, and what correction is expected.</action>
    <action>Return the plan to Winston with explicit instruction to rewrite. Example: *"I-Bob: Rule 1 violation — T-001 contains 75 lines of complete C# implementation of `AplicarCooldownERIAttribute`. Rewrite as: signature + reference to `UsoMaximoAttribute.cs` as inspiration + dependency contract. Implementation belongs in Etapa 3."*</action>
    <action>Wait for Winston to revise. When the revised plan returns, re-validate from Rule 1.</action>
    <action>If Winston insists on a violation with explicit justification, escalate to the user via AskUserQuestion. If user approves override, register in `etapa-2/bitacora.md` with note: *"Plan approved with violation to Rule N by explicit user decision. Reason: {reason}. Risk accepted."*. Then proceed to step 7.</action>
  </check>

  <check if="no rule is violated">
    <action>Proceed to step 7 (finalization).</action>
  </check>
</step>

<step n="7" goal="Update sprint status and finalize">
  <action>Validate the newly created story file {default_output_file} against the checklist and apply any required fixes before finalizing</action>
  <action>Save story document unconditionally</action>

  <!-- Update sprint status -->
  <check if="sprint status file exists">
    <action>Update {{sprint_status}}</action>
    <action>Load the FULL file and read all development_status entries</action>
    <action>Find development_status key matching {{story_key}}</action>
    <action>Verify current status is "backlog" (expected previous state)</action>
    <action>Update development_status[{{story_key}}] = "ready-for-dev"</action>
    <action>Update last_updated field to current date</action>
    <action>Save file, preserving ALL comments and structure including STATUS DEFINITIONS</action>
  </check>

  <action>Report completion</action>
  <output>**ULTIMATE BMad Method STORY CONTEXT CREATED, {user_name}!**

    **Story Details:**
    - Story ID: {{story_id}}
    - Story Key: {{story_key}}
    - File: {{story_file}}
    - Status: ready-for-dev

    **Next Steps:**
    1. Review the comprehensive story in {{story_file}}
    2. Run dev agents `dev-story` for optimized implementation
    3. Run `code-review` when complete (auto-marks done)
    4. Optional: If Test Architect module installed, run `/bmad:tea:automate` after `dev-story` to generate guardrail tests

    **The developer now has everything needed for flawless implementation!**
  </output>
</step>

</workflow>

---

## Story Template

```markdown
# Story {{epic_num}}.{{story_num}}: {{story_title}}

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a {{role}},
I want {{action}},
so that {{benefit}}.

## Acceptance Criteria

1. [Add acceptance criteria from epics/PRD]

## Tasks / Subtasks

- [ ] Task 1 (AC: #)
  - [ ] Subtask 1.1
- [ ] Task 2 (AC: #)
  - [ ] Subtask 2.1

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
```

---

## Discover Inputs Protocol

**Objective:** Intelligently load project files (whole or sharded) based on the workflow's Input Files configuration.

**Prerequisite:** Only execute this protocol if the workflow defines an Input Files section. If no input file patterns are configured, skip this entirely.

### Step 1: Parse Input File Patterns

- Read the Input Files table from the workflow configuration.
- For each input group (prd, architecture, epics, ux, etc.), note the **load strategy** if specified.

### Step 2: Load Files Using Smart Strategies

For each pattern in the Input Files table, work through the following substeps in order:

#### 2a: Try Sharded Documents First

If a sharded pattern exists for this input, determine the load strategy (defaults to **FULL_LOAD** if not specified), then apply the matching strategy:

**FULL_LOAD Strategy:**
Load ALL files in the sharded directory. Use this for PRD, Architecture, UX, brownfield docs, or whenever the full picture is needed.

1. Use the glob pattern to find ALL `.md` files (e.g., `{planning_artifacts}/*architecture*/*.md`).
2. Load EVERY matching file completely.
3. Concatenate content in logical order: `index.md` first if it exists, then alphabetical.
4. Store the combined result in a variable named `{pattern_name_content}` (e.g., `{architecture_content}`).

**SELECTIVE_LOAD Strategy:**
Load a specific shard using a template variable. Example: used for epics with `{{epic_num}}`.

1. Check for template variables in the sharded pattern (e.g., `{{epic_num}}`).
2. If the variable is undefined, ask the user for the value OR infer it from context.
3. Resolve the template to a specific file path.
4. Load that specific file.
5. Store in variable: `{pattern_name_content}`.

**INDEX_GUIDED Strategy:**
Load index.md, analyze the structure and description of each doc in the index, then intelligently load relevant docs.

**DO NOT BE LAZY** -- use best judgment to load documents that might have relevant information, even if there is only a 5% chance of relevance.

1. Load `index.md` from the sharded directory.
2. Parse the table of contents, links, and section headers.
3. Analyze the workflow's purpose and objective.
4. Identify which linked/referenced documents are likely relevant.
5. Load all identified relevant documents.
6. Store combined content in variable: `{pattern_name_content}`.

**When in doubt, LOAD IT** -- context is valuable, and being thorough is better than missing critical info.

After applying the matching strategy, mark the pattern as **RESOLVED** and move to the next pattern.

#### 2b: Try Whole Document if No Sharded Found

If no sharded matches were found OR no sharded pattern exists for this input:

1. Attempt a glob match on the "whole" pattern (e.g., `{planning_artifacts}/*prd*.md`).
2. If matches are found, load ALL matching files completely (no offset/limit).
3. Store content in variable: `{pattern_name_content}` (e.g., `{prd_content}`).
4. Mark pattern as **RESOLVED** and move to the next pattern.

#### 2c: Handle Not Found

If no matches were found for either sharded or whole patterns:

1. Set `{pattern_name_content}` to empty string.
2. Note in session: "No {pattern_name} files found" -- this is not an error, just unavailable. Offer the user a chance to provide the file.

### Step 3: Report Discovery Results

List all loaded content variables with file counts. Example:

```
OK Loaded {prd_content} from 5 sharded files: prd/index.md, prd/requirements.md, ...
OK Loaded {architecture_content} from 1 file: Architecture.md
OK Loaded {epics_content} from selective load: epics/epic-3.md
-- No ux_design files found
```

This gives the workflow transparency into what context is available.

---

## Validation Checklist

### CRITICAL MISSION: Outperform and Fix the Original Create-Story LLM

You are an independent quality validator in a **FRESH CONTEXT**. Your mission is to **thoroughly review** a story file that was generated by the create-story workflow and **systematically identify any mistakes, omissions, or disasters** that the original LLM missed.

### CRITICAL MISTAKES TO PREVENT:

- **Reinventing wheels** - Creating duplicate functionality instead of reusing existing
- **Wrong libraries** - Using incorrect frameworks, versions, or dependencies
- **Wrong file locations** - Violating project structure and organization
- **Breaking regressions** - Implementing changes that break existing functionality
- **Ignoring UX** - Not following user experience design requirements
- **Vague implementations** - Creating unclear, ambiguous implementations
- **Lying about completion** - Implementing incorrectly or incompletely
- **Not learning from past work** - Ignoring previous story learnings and patterns

### Systematic Re-Analysis Approach

**Step 1: Load and Understand the Target**
1. Load the workflow configuration for variable inclusion
2. Load the story file (provided by user or discovered)
3. Extract metadata: epic_num, story_num, story_key, story_title from story file
4. Resolve all workflow variables
5. Understand current status

**Step 2: Exhaustive Source Document Analysis**
- 2.1 Epics and Stories Analysis
- 2.2 Architecture Deep-Dive
- 2.3 Previous Story Intelligence (if applicable)
- 2.4 Git History Analysis (if available)
- 2.5 Latest Technical Research

**Step 3: Disaster Prevention Gap Analysis**
- 3.1 Reinvention Prevention Gaps
- 3.2 Technical Specification DISASTERS
- 3.3 File Structure DISASTERS
- 3.4 Regression DISASTERS
- 3.5 Implementation DISASTERS

**Step 4: LLM-Dev-Agent Optimization Analysis**
- Verbosity problems
- Ambiguity issues
- Context overload
- Missing critical signals
- Poor structure

**Step 5: Improvement Recommendations**
- 5.1 Critical Misses (Must Fix)
- 5.2 Enhancement Opportunities (Should Add)
- 5.3 Optimization Suggestions (Nice to Have)
- 5.4 LLM Optimization Improvements

### Interactive Improvement Process

After completing systematic analysis, present findings to the user interactively:

1. Present improvement suggestions with counts by category
2. Ask user which improvements to apply: all / critical / select / none / details
3. Apply selected improvements (make them look natural)
4. Confirm changes applied

### Success Criteria

The LLM developer agent that processes the improved story will have:
- Clear technical requirements they must follow
- Previous work context they can build upon
- Anti-pattern prevention to avoid common mistakes
- Comprehensive guidance for efficient implementation
- Optimized content structure for maximum clarity and minimum token waste
- Actionable instructions with no ambiguity or verbosity
- Efficient information density
