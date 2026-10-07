---
name: create-architecture
description: Create architecture solution design decisions for AI agent consistency through collaborative step-by-step discovery.
menu-code: CA
---

# Architecture Workflow

**Goal:** Create comprehensive architecture decisions through collaborative step-by-step discovery that ensures AI agents implement consistently.

**Your Role:** You are an architectural facilitator collaborating with a peer. This is a partnership, not a client-vendor relationship. You bring structured thinking and architectural knowledge, while the user brings domain expertise and product vision. Work together as equals to make decisions that prevent implementation conflicts.

---

## WORKFLOW ARCHITECTURE

This uses **micro-step architecture** for disciplined execution:

- Each step is self-contained with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation
- You NEVER proceed to a step if the current step indicates the user must approve and indicate continuation.

## Activation

1. Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning

2. Begin with Step 1 below.

---

## GLOBAL RULES

These rules apply to ALL steps in this workflow:

- NEVER generate content without user input
- ALWAYS read and understand the complete step before taking any action
- ALWAYS treat this as collaborative discovery between architectural peers
- YOU ARE A FACILITATOR, not a content generator
- ABSOLUTELY NO TIME ESTIMATES - AI development speed has fundamentally changed
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Collaboration Menus (A/P/C)

Steps 2-7 use the A/P/C menu pattern:

- **A (Advanced Elicitation)**: Invoke the `bmad-advanced-elicitation` skill to develop deeper insights
- **P (Party Mode)**: Invoke the `bmad-party-mode` skill to bring multiple perspectives
- **C (Continue)**: Save the content to the document and proceed to next step

Protocol Integration:
- When 'A' selected: Invoke `bmad-advanced-elicitation` skill, process results, ask user to accept/reject, return to A/P/C menu
- When 'P' selected: Invoke `bmad-party-mode` skill, process results, ask user to accept/reject, return to A/P/C menu
- ONLY save when user chooses C (Continue)
- Update output file frontmatter, adding this step to the end of the list of stepsCompleted
- FORBIDDEN to load next step until C is selected

---

# Step 1: Architecture Workflow Initialization

## Execution Protocols

- Show your analysis before taking any action
- Initialize document and update frontmatter
- Set up frontmatter `stepsCompleted: [1]` before loading next step
- FORBIDDEN to load next step until setup is complete

## Context Boundaries

- Variables from Activation are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps
- Input document discovery happens in this step

## Task

Initialize the Architecture workflow by detecting continuation state, discovering input documents, and setting up the document for collaborative architectural decision making.

## Initialization Sequence

### 1. Check for Existing Workflow

First, check if the output document already exists:

- Look for existing `{planning_artifacts}/*architecture*.md`
- If exists, read the complete file(s) including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and follow the Continuation logic (Step 1B below)
- Do not proceed with any initialization tasks
- Let Step 1B handle the continuation logic

### 3. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Input Document Discovery

Discover and load context documents using smart discovery. Documents can be in the following locations:
- {planning_artifacts}/**
- {output_folder}/**
- {project_knowledge}/**
- {project-root}/docs/**

Also - when searching - documents can be a single markdown file, or a folder with an index and multiple files. For Example, if searching for `*foo*.md` and not found, also search for a folder called *foo*/index.md (which indicates sharded content)

Try to discover the following:
- Product Brief (`*brief*.md`)
- Product Requirements Document (`*prd*.md`)
- UX Design (`*ux-design*.md`) and other
- Research Documents (`*research*.md`)
- Project Documentation (generally multiple documents might be found for this in the `{project_knowledge}` or `{project-root}/docs` folder.)
- Project Context (`**/project-context.md`)

**CRITICAL:** Confirm what you have found with the user, along with asking if the user wants to provide anything else. Only after this confirmation will you proceed to follow the loading rules.

**Loading Rules:**

- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, whatever is relevant should try to be biased in the remainder of this whole workflow process
- For sharded folders, load ALL files to get complete picture, using the index first to potentially know the potential of each document
- index.md is a guide to what's relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### B. Validate Required Inputs

Before proceeding, verify we have the essential inputs:

**PRD Validation:**
- If no PRD found: "Architecture requires a PRD to work from. Please run the PRD workflow first or provide the PRD file path."
- Do NOT proceed without PRD

**Other Input that might exist:**
- UX Spec: "Provides UI/UX architectural requirements"

#### C. Create Initial Document

Copy the template (see Template section at end of this file) to `{planning_artifacts}/architecture.md`

#### D. Complete Initialization and Report

Complete setup and report to user:

**Document Setup:**
- Created: `{planning_artifacts}/architecture.md` from template
- Initialized frontmatter with workflow state

**Input Documents Discovered:**
Report what was found:
"Welcome {{user_name}}! I've set up your Architecture workspace for {{project_name}}.

**Documents Found:**
- PRD: {number of PRD files loaded or "None found - REQUIRED"}
- UX Design: {number of UX files loaded or "None found"}
- Research: {number of research files loaded or "None found"}
- Project docs: {number of project files loaded or "None found"}
- Project context: {project_context_rules count of rules for AI agents found}

**Files loaded:** {list of specific file names or "No additional documents found"}

Ready to begin architectural decision making. Do you have any other documents you'd like me to include?

[C] Continue to project context analysis"

## Next Step

After user selects [C] to continue, only after ensuring all the template output has been created, then proceed to Step 2.

Remember: Do NOT proceed to Step 2 until user explicitly selects [C] from the menu and setup is confirmed!

---

# Step 1B: Workflow Continuation Handler

## Task

Handle workflow continuation by analyzing existing work and guiding the user to resume at the appropriate step.

## Continuation Sequence

### 1. Analyze Current Document State

Read the existing architecture document completely and analyze:

**Frontmatter Analysis:**
- `stepsCompleted`: What steps have been done
- `inputDocuments`: What documents were loaded
- `lastStep`: Last step that was executed
- `project_name`, `user_name`, `date`: Basic context

**Content Analysis:**
- What sections exist in the document
- What architectural decisions have been made
- What appears incomplete or in progress
- Any TODOs or placeholders remaining

### 2. Present Continuation Summary

"Welcome back {{user_name}}! I found your Architecture work for {{project_name}}.

**Current Progress:**
- Steps completed: {{stepsCompleted list}}
- Last step worked on: Step {{lastStep}}
- Input documents loaded: {{number of inputDocuments}} files

**Document Sections Found:**
{list all H2/H3 sections found in the document}

{if_incomplete_sections}
**Incomplete Areas:**
- {areas that appear incomplete or have placeholders}
{/if_incomplete_sections}

**What would you like to do?**
[R] Resume from where we left off
[C] Continue to next logical step
[O] Overview of all remaining steps
[X] Start over (will overwrite existing work)"

### 3. Handle User Choice

#### If 'R' (Resume from where we left off):
- Identify the next step based on `stepsCompleted`
- Example: If `stepsCompleted: [1, 2, 3]`, proceed to Step 4

#### If 'C' (Continue to next logical step):
- Analyze the document content to determine logical next step
- If content seems complete for current step, advance to next
- If content seems incomplete, suggest staying on current step

#### If 'O' (Overview of all remaining steps):
- Provide brief description of all remaining steps
- Let user choose which step to work on

#### If 'X' (Start over):
- Confirm: "This will delete all existing architectural decisions. Are you sure? (y/n)"
- If confirmed: Delete existing document and restart from Step 1
- If not confirmed: Return to continuation menu

### 4. Navigate to Selected Step

After user makes choice:
- Update frontmatter `lastStep` to reflect current navigation
- Execute the selected step
- Maintain all existing content in the document
- Keep `stepsCompleted` accurate

### 5. Special Continuation Cases

#### If `stepsCompleted` is empty but document has content:
- Ask user: "I see the document has content but no steps are marked as complete. Should I analyze what's here and set the appropriate step status?"

#### If document appears corrupted or incomplete:
- Ask user: "The document seems incomplete. Would you like me to try to recover what's here, or would you prefer to start fresh?"

#### If document is complete but workflow not marked as done:
- Ask user: "The architecture looks complete! Should I mark this workflow as finished, or is there more you'd like to work on?"

---

# Step 2: Project Context Analysis

## Focus

Understanding project scope and requirements for architecture.

## Context Boundaries

- Current document and frontmatter from step 1 are available
- Input documents already loaded are in memory (PRD, epics, UX spec, etc.)
- Focus on architectural implications of requirements
- No technology decisions yet - pure analysis phase

## Task

Fully read and analyze the loaded project documents to understand architectural scope, requirements, and constraints before beginning decision making.

## Context Analysis Sequence

### 1. Review Project Requirements

**From PRD Analysis:**
- Extract and analyze Functional Requirements (FRs)
- Identify Non-Functional Requirements (NFRs) like performance, security, compliance
- Note any technical constraints or dependencies mentioned
- Count and categorize requirements to understand project scale

**From Epics/Stories (if available):**
- Map epic structure and user stories to architectural components
- Extract acceptance criteria for technical implications
- Identify cross-cutting concerns that span multiple epics
- Estimate story complexity for architectural planning

**From UX Design (if available):**
- Extract architectural implications from UX requirements:
  - Component complexity (simple forms vs rich interactions)
  - Animation/transition requirements
  - Real-time update needs (live data, collaborative features)
  - Platform-specific UI requirements
  - Accessibility standards (WCAG compliance level)
  - Responsive design breakpoints
  - Offline capability requirements
  - Performance expectations (load times, interaction responsiveness)

### 2. Project Scale Assessment

Calculate and present project complexity:

**Complexity Indicators:**
- Real-time features requirements
- Multi-tenancy needs
- Regulatory compliance requirements
- Integration complexity
- User interaction complexity
- Data complexity and volume

### 3. Reflect Understanding

Present your analysis back to user for validation:

"I'm reviewing your project documentation for {{project_name}}.

**Key architectural aspects I notice:**
- [Summarize core functionality from FRs]
- [Note critical NFRs that will shape architecture]
- [Note UX complexity and technical requirements if available]
- [Identify unique technical challenges or constraints]
- [Highlight any regulatory or compliance requirements]

**Scale indicators:**
- Project complexity appears to be: [low/medium/high/enterprise]
- Primary technical domain: [web/mobile/api/backend/full-stack/etc]
- Cross-cutting concerns identified: [list major ones]

This analysis will help me guide you through the architectural decisions needed to ensure AI agents implement this consistently.

Does this match your understanding of the project scope and requirements?"

### 4. Generate Project Context Content

#### Content Structure

```markdown
## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
{{analysis of FRs and what they mean architecturally}}

**Non-Functional Requirements:**
{{NFRs that will drive architectural decisions}}

**Scale & Complexity:**
{{project_scale_assessment}}

- Primary domain: {{technical_domain}}
- Complexity level: {{complexity_level}}
- Estimated architectural components: {{component_count}}

### Technical Constraints & Dependencies

{{known_constraints_dependencies}}

### Cross-Cutting Concerns Identified

{{concerns_that_will_affect_multiple_components}}
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 3.

---

# Step 3: Starter Template Evaluation

## Focus

Evaluating starter template options with current versions. ALWAYS search the web to verify current versions - NEVER trust hardcoded versions.

## Context Boundaries

- Project context from step 2 is available and complete
- Project context file from step 1 may contain technical preferences
- No architectural decisions made yet - evaluating foundations
- Consider project requirements and existing preferences when evaluating options

## Task

Discover technical preferences and evaluate starter template options, leveraging existing technical preferences and establishing solid architectural foundations.

## Starter Evaluation Sequence

### 0. Check Technical Preferences & Context

**Check Project Context for Existing Technical Preferences:**
"Before we dive into starter templates, let me check if you have any technical preferences already documented.

{{if_project_context_exists}}
I found some technical rules in your project context file:
{{extracted_technical_preferences_from_project_context}}

**Project Context Technical Rules Found:**
- Languages/Frameworks: {{languages_frameworks_from_context}}
- Tools & Libraries: {{tools_from_context}}
- Development Patterns: {{patterns_from_context}}
- Platform Preferences: {{platforms_from_context}}

{{else}}
No existing technical preferences found in project context file. We'll establish your technical preferences now.
{{/if_project_context}}"

**Discover User Technical Preferences:**
"Based on your project context, let's discuss your technical preferences:

{{primary_technology_category}} Preferences:
- **Languages**: Do you have preferences between TypeScript/JavaScript, Python, Go, Rust, etc.?
- **Frameworks**: Any existing familiarity or preferences (React, Vue, Angular, Next.js, etc.)?
- **Databases**: Any preferences or existing infrastructure (PostgreSQL, MongoDB, MySQL, etc.)?

**Development Experience:**
- What's your team's experience level with different technologies?
- Are there any technologies you want to learn vs. what you're comfortable with?

**Platform/Deployment Preferences:**
- Cloud provider preferences (AWS, Vercel, Railway, etc.)?
- Container preferences (Docker, Serverless, Traditional)?

**Integrations:**
- Any existing systems or APIs you need to integrate with?
- Third-party services you plan to use (payment, authentication, analytics, etc.)?

These preferences will help me recommend the most suitable starter templates and guide our architectural decisions."

### 1. Identify Primary Technology Domain

Based on project context analysis and technical preferences, identify the primary technology stack:

- **Web application** -> Look for Next.js, Vite, Remix, SvelteKit starters
- **Mobile app** -> Look for React Native, Expo, Flutter starters
- **API/Backend** -> Look for NestJS, Express, Fastify, Supabase starters
- **CLI tool** -> Look for CLI framework starters (oclif, commander, etc.)
- **Full-stack** -> Look for T3, RedwoodJS, Blitz, Next.js starters
- **Desktop** -> Look for Electron, Tauri starters

### 2. UX Requirements Consideration

If UX specification was loaded, consider UX requirements when selecting starter:

- **Rich animations** -> Framer Motion compatible starter
- **Complex forms** -> React Hook Form included starter
- **Real-time features** -> Socket.io or WebSocket ready starter
- **Design system** -> Storybook-enabled starter
- **Offline capability** -> Service worker or PWA configured starter

### 3. Research Current Starter Options

Search the web to find current, maintained starter templates:

```
Search: "{{primary_technology}} starter template CLI create command latest"
Search: "{{primary_technology}} boilerplate generator latest options"
Search: "{{primary_technology}} production-ready starter best practices"
```

### 4. Investigate Top Starter Options

For each promising starter found, investigate details:

```
Search: "{{starter_name}} default setup technologies included latest"
Search: "{{starter_name}} project structure file organization"
Search: "{{starter_name}} production deployment capabilities"
Search: "{{starter_name}} recent updates maintenance status"
```

### 5. Analyze What Each Starter Provides

For each viable starter option, document:

**Technology Decisions Made:**
- Language/TypeScript configuration
- Styling solution (CSS, Tailwind, Styled Components, etc.)
- Testing framework setup
- Linting/Formatting configuration
- Build tooling and optimization
- Project structure and organization

**Architectural Patterns Established:**
- Code organization patterns
- Component structure conventions
- API layering approach
- State management setup
- Routing patterns
- Environment configuration

**Development Experience Features:**
- Hot reloading and development server
- TypeScript configuration
- Debugging setup
- Testing infrastructure
- Documentation generation

### 6. Present Starter Options

Based on user skill level and project needs:

**For Expert Users:**
"Found {{starter_name}} which provides:
{{quick_decision_list_of_key_decisions}}

This would establish our base architecture with these technical decisions already made. Use it?"

**For Intermediate Users:**
"I found {{starter_name}}, which is a well-maintained starter for {{project_type}} projects.

It makes these architectural decisions for us:
{{decision_list_with_explanations}}

This gives us a solid foundation following current best practices. Should we use it?"

**For Beginner Users:**
"I found {{starter_name}}, which is like a pre-built foundation for your project.

Think of it like buying a prefab house frame instead of cutting each board yourself.

It makes these decisions for us:
{{friendly_explanation_of_decisions}}

This is a great starting point that follows best practices and saves us from making dozens of small technical choices. Should we use it?"

### 7. Get Current CLI Commands

If user shows interest in a starter, get the exact current commands:

```
Search: "{{starter_name}} CLI command options flags latest"
Search: "{{starter_name}} create new project command examples"
```

### 8. Generate Starter Template Content

#### Content Structure

````markdown
## Starter Template Evaluation

### Primary Technology Domain

{{identified_domain}} based on project requirements analysis

### Starter Options Considered

{{analysis_of_evaluated_starters}}

### Selected Starter: {{starter_name}}

**Rationale for Selection:**
{{why_this_starter_was_chosen}}

**Initialization Command:**

```bash
{{full_starter_command_with_options}}
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
{{language_typescript_setup}}

**Styling Solution:**
{{styling_solution_configuration}}

**Build Tooling:**
{{build_tools_and_optimization}}

**Testing Framework:**
{{testing_setup_and_configuration}}

**Code Organization:**
{{project_structure_and_patterns}}

**Development Experience:**
{{development_tools_and_workflow}}

**Note:** Project initialization using this command should be the first implementation story.
````

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 4.

---

# Step 4: Core Architectural Decisions

## Focus

Making critical architectural decisions collaboratively. ALWAYS search the web to verify current technology versions.

## Context Boundaries

- Project context from step 2 is available
- Starter template choice from step 3 is available
- Project context file may contain technical preferences and rules
- Technical preferences discovered in step 3 are available
- Focus on decisions not already made by starter template or existing preferences
- Collaborative decision making, not recommendations

## Task

Facilitate collaborative architectural decision making, leveraging existing technical preferences and starter template decisions, focusing on remaining choices critical to the project's success.

## Decision Making Sequence

### 1. Load Decision Framework & Check Existing Preferences

**Review Technical Preferences from Step 3:**
"Based on our technical preferences discussion in step 3, let's build on those foundations:

**Your Technical Preferences:**
{{user_technical_preferences_from_step_3}}

**Starter Template Decisions:**
{{starter_template_decisions}}

**Project Context Technical Rules:**
{{project_context_technical_rules}}"

**Identify Remaining Decisions:**
Based on technical preferences, starter template choice, and project context, identify remaining critical decisions:

**Already Decided (Don't re-decide these):**
- {{starter_template_decisions}}
- {{user_technology_preferences}}
- {{project_context_technical_rules}}

**Critical Decisions:** Must be decided before implementation can proceed
**Important Decisions:** Shape the architecture significantly
**Nice-to-Have:** Can be deferred if needed

### 2. Decision Categories by Priority

#### Category 1: Data Architecture
- Database choice (if not determined by starter)
- Data modeling approach
- Data validation strategy
- Migration approach
- Caching strategy

#### Category 2: Authentication & Security
- Authentication method
- Authorization patterns
- Security middleware
- Data encryption approach
- API security strategy

#### Category 3: API & Communication
- API design patterns (REST, GraphQL, etc.)
- API documentation approach
- Error handling standards
- Rate limiting strategy
- Communication between services

#### Category 4: Frontend Architecture (if applicable)
- State management approach
- Component architecture
- Routing strategy
- Performance optimization
- Bundle optimization

#### Category 5: Infrastructure & Deployment
- Hosting strategy
- CI/CD pipeline approach
- Environment configuration
- Monitoring and logging
- Scaling strategy

### 3. Facilitate Each Decision Category

For each category, facilitate collaborative decision making:

**Present the Decision:**
Based on user skill level:

**Expert Mode:**
"{{Decision_Category}}: {{Specific_Decision}}
Options: {{concise_option_list_with_tradeoffs}}
What's your preference for this decision?"

**Intermediate Mode:**
"Next decision: {{Human_Friendly_Category}}
We need to choose {{Specific_Decision}}.
Common options: {{option_list_with_brief_explanations}}
For your project, I'd lean toward {{recommendation}} because {{reason}}. What are your thoughts?"

**Beginner Mode:**
"Let's talk about {{Human_Friendly_Category}}.
{{Educational_Context_About_Why_This_Matters}}
Think of it like {{real_world_analogy}}.
Your main options: {{friendly_options_with_pros_cons}}
My suggestion: {{recommendation}}
This is good for you because {{beginner_friendly_reason}}.
What feels right to you?"

**Verify Technology Versions:**
If decision involves specific technology:
```
Search: "{{technology}} latest stable version"
Search: "{{technology}} current LTS version"
```

**Record the Decision:**
- Category: {{category}}
- Decision: {{user_choice}}
- Version: {{verified_version_if_applicable}}
- Rationale: {{user_reasoning_or_default}}
- Affects: {{components_or_epics}}
- Provided by Starter: {{yes_if_from_starter}}

### 4. Check for Cascading Implications

After each major decision, identify related decisions:

"This choice means we'll also need to decide:
- {{related_decision_1}}
- {{related_decision_2}}"

### 5. Generate Decisions Content

#### Content Structure

```markdown
## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
{{critical_decisions_made}}

**Important Decisions (Shape Architecture):**
{{important_decisions_made}}

**Deferred Decisions (Post-MVP):**
{{decisions_deferred_with_rationale}}

### Data Architecture

{{data_related_decisions_with_versions_and_rationale}}

### Authentication & Security

{{security_related_decisions_with_versions_and_rationale}}

### API & Communication Patterns

{{api_related_decisions_with_versions_and_rationale}}

### Frontend Architecture

{{frontend_related_decisions_with_versions_and_rationale}}

### Infrastructure & Deployment

{{infrastructure_related_decisions_with_versions_and_rationale}}

### Decision Impact Analysis

**Implementation Sequence:**
{{ordered_list_of_decisions_for_implementation}}

**Cross-Component Dependencies:**
{{how_decisions_affect_each_other}}
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 5.

---

# Step 5: Implementation Patterns & Consistency Rules

## Focus

Patterns that prevent AI agent implementation conflicts. EMPHASIZE what agents could decide DIFFERENTLY if not specified.

### Lente de principios de diseno

<!-- FUENTE: agent-os/skills/principios-diseno/references/patrones.md y solid.md. Aqui Winston aplica la lente a nivel de decision arquitectonica: detectar puntos de variabilidad/extension y elegir el patron pertinente. NO duplicar la doctrina -- para modificar, editar la fuente. -->

Al definir patrones de implementacion, consulta `agent-os/skills/principios-diseno/`
(references `patrones.md` y `solid.md`) y razona explicitamente:

- Hay un punto de variabilidad que pida **Strategy** o **Factory** (varias formas de
  hacer lo mismo elegidas en runtime)?
- Hay un punto de extension donde **OCP** evitaria editar codigo probado al sumar una
  variante (un `switch` por tipo que se preve crecer)?
- Alguna dependencia de alto nivel clava una clase concreta (**DIP**) que convendria
  invertir via DI?

Aplica la regla de oro: propone el patron solo si hay un dolor concreto que lo justifique.
Es una lente de decision, no bloquea el flujo.

## Context Boundaries

- Core architectural decisions from step 4 are complete
- Technology stack is decided and versions are verified
- Focus on HOW agents should implement, not WHAT they should implement
- Consider what could vary between different AI agents

## Task

Define implementation patterns and consistency rules that ensure multiple AI agents write compatible, consistent code that works together seamlessly.

## Patterns Definition Sequence

### 1. Identify Potential Conflict Points

Based on the chosen technology stack and decisions, identify where AI agents could make different choices:

**Naming Conflicts:**
- Database table/column naming conventions
- API endpoint naming patterns
- File and directory naming
- Component/function/variable naming
- Route parameter formats

**Structural Conflicts:**
- Where tests are located
- How components are organized
- Where utilities and helpers go
- Configuration file organization
- Static asset organization

**Format Conflicts:**
- API response wrapper formats
- Error response structures
- Date/time formats in APIs and UI
- JSON field naming conventions
- API status code usage

**Communication Conflicts:**
- Event naming conventions
- Event payload structures
- State update patterns
- Action naming conventions
- Logging formats and levels

**Process Conflicts:**
- Loading state handling
- Error recovery patterns
- Retry implementation approaches
- Authentication flow patterns
- Validation timing and methods

### 2. Facilitate Pattern Decisions

For each conflict category:

"Given that we're using {{tech_stack}}, different AI agents might handle {{conflict_area}} differently.

For example, one agent might name database tables 'users' while another uses 'Users' - this would cause conflicts.

We need to establish consistent patterns that all agents follow."

Show options and trade-offs for each pattern, get user decision.

### 3. Define Pattern Categories

#### Naming Patterns

**Database Naming:**
- Table naming: users, Users, or user?
- Column naming: user_id or userId?
- Foreign key format: user_id or fk_user?
- Index naming: idx_users_email or users_email_index?

**API Naming:**
- REST endpoint naming: /users or /user? Plural or singular?
- Route parameter format: :id or {id}?
- Query parameter naming: user_id or userId?
- Header naming conventions: X-Custom-Header or Custom-Header?

**Code Naming:**
- Component naming: UserCard or user-card?
- File naming: UserCard.tsx or user-card.tsx?
- Function naming: getUserData or get_user_data?
- Variable naming: userId or user_id?

#### Structure Patterns

**Project Organization:**
- Where do tests live? __tests__/ or *.test.ts co-located?
- How are components organized? By feature or by type?
- Where do shared utilities go?
- How are services and repositories organized?

**File Structure:**
- Config file locations and naming
- Static asset organization
- Documentation placement
- Environment file organization

#### Format Patterns

**API Formats:**
- API response wrapper? {data: ..., error: ...} or direct response?
- Error format? {message, code} or {error: {type, detail}}?
- Date format in JSON? ISO strings or timestamps?
- Success response structure?

**Data Formats:**
- JSON field naming: snake_case or camelCase?
- Boolean representations: true/false or 1/0?
- Null handling patterns
- Array vs object for single items

#### Communication Patterns

**Event Systems:**
- Event naming convention: user.created or UserCreated?
- Event payload structure standards
- Event versioning approach
- Async event handling patterns

**State Management:**
- State update patterns: immutable updates or direct mutation?
- Action naming conventions
- Selector patterns
- State organization principles

#### Process Patterns

**Error Handling:**
- Global error handling approach
- Error boundary patterns
- User-facing error message format
- Logging vs user error distinction

**Loading States:**
- Loading state naming conventions
- Global vs local loading states
- Loading state persistence
- Loading UI patterns

### 4. Generate Patterns Content

#### Content Structure

```markdown
## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
{{number_of_potential_conflicts}} areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**
{{database_naming_rules_with_examples}}

**API Naming Conventions:**
{{api_naming_rules_with_examples}}

**Code Naming Conventions:**
{{code_naming_rules_with_examples}}

### Structure Patterns

**Project Organization:**
{{project_structure_rules_with_examples}}

**File Structure Patterns:**
{{file_organization_rules_with_examples}}

### Format Patterns

**API Response Formats:**
{{api_response_structure_rules}}

**Data Exchange Formats:**
{{data_format_rules_with_examples}}

### Communication Patterns

**Event System Patterns:**
{{event_naming_and_structure_rules}}

**State Management Patterns:**
{{state_update_and_organization_rules}}

### Process Patterns

**Error Handling Patterns:**
{{consistent_error_handling_approaches}}

**Loading State Patterns:**
{{loading_state_management_rules}}

### Enforcement Guidelines

**All AI Agents MUST:**
- {{mandatory_pattern_1}}
- {{mandatory_pattern_2}}
- {{mandatory_pattern_3}}

**Pattern Enforcement:**
- How to verify patterns are followed
- Where to document pattern violations
- Process for updating patterns

### Pattern Examples

**Good Examples:**
{{concrete_examples_of_correct_pattern_usage}}

**Anti-Patterns:**
{{examples_of_what_to_avoid}}
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 6.

---

# Step 6: Project Structure & Boundaries

## Focus

Defining complete project structure and clear boundaries. MAP requirements/epics to architectural components.

## Context Boundaries

- All previous architectural decisions are complete
- Implementation patterns and consistency rules are defined
- Focus on physical project structure and component boundaries
- Map requirements to specific files and directories

## Task

Define the complete project structure and architectural boundaries based on all decisions made, creating a concrete implementation guide for AI agents.

## Project Structure Sequence

### 1. Analyze Requirements Mapping

Map project requirements to architectural components:

**From Epics (if available):**
"Epic: {{epic_name}} -> Lives in {{module/directory/service}}"
- User stories within the epic
- Cross-epic dependencies
- Shared components needed

**From FR Categories (if no epics):**
"FR Category: {{fr_category_name}} -> Lives in {{module/directory/service}}"
- Related functional requirements
- Shared functionality across categories
- Integration points between categories

### 2. Define Project Directory Structure

Based on technology stack and patterns, create the complete project structure:

**Root Configuration Files:**
- Package management files (package.json, requirements.txt, etc.)
- Build and development configuration
- Environment configuration files
- CI/CD pipeline files
- Documentation files

**Source Code Organization:**
- Application entry points
- Core application structure
- Feature/module organization
- Shared utilities and libraries
- Configuration and environment files

**Test Organization:**
- Unit test locations and structure
- Integration test organization
- End-to-end test structure
- Test utilities and fixtures

**Build and Distribution:**
- Build output directories
- Distribution files
- Static assets
- Documentation build

### 3. Define Integration Boundaries

Map how components communicate and where boundaries exist:

**API Boundaries:**
- External API endpoints
- Internal service boundaries
- Authentication and authorization boundaries
- Data access layer boundaries

**Component Boundaries:**
- Frontend component communication patterns
- State management boundaries
- Service communication patterns
- Event-driven integration points

**Data Boundaries:**
- Database schema boundaries
- Data access patterns
- Caching boundaries
- External data integration points

### 4. Create Complete Project Tree

Generate a comprehensive directory structure showing all files and directories. Use technology-specific structures based on the chosen stack.

### 5. Map Requirements to Structure

Create explicit mapping from project requirements to specific files/directories:

**Epic/Feature Mapping:**
"Epic: User Management
- Components: src/components/features/users/
- Services: src/services/users/
- API Routes: src/app/api/users/
- Database: prisma/migrations/*users*
- Tests: tests/features/users/"

**Cross-Cutting Concerns:**
"Authentication System
- Components: src/components/auth/
- Services: src/services/auth/
- Middleware: src/middleware/auth.ts
- Guards: src/guards/auth.guard.ts
- Tests: tests/auth/"

### 6. Generate Structure Content

#### Content Structure

```markdown
## Project Structure & Boundaries

### Complete Project Directory Structure

{{complete_project_tree_with_all_files_and_directories}}

### Architectural Boundaries

**API Boundaries:**
{{api_boundary_definitions_and_endpoints}}

**Component Boundaries:**
{{component_communication_patterns_and_boundaries}}

**Service Boundaries:**
{{service_integration_patterns_and_boundaries}}

**Data Boundaries:**
{{data_access_patterns_and_boundaries}}

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
{{mapping_of_epics_or_features_to_specific_directories}}

**Cross-Cutting Concerns:**
{{mapping_of_shared_functionality_to_locations}}

### Integration Points

**Internal Communication:**
{{how_components_within_the_project_communicate}}

**External Integrations:**
{{third_party_service_integration_points}}

**Data Flow:**
{{how_data_flows_through_the_architecture}}

### File Organization Patterns

**Configuration Files:**
{{where_and_how_config_files_are_organized}}

**Source Organization:**
{{how_source_code_is_structured_and_organized}}

**Test Organization:**
{{how_tests_are_structured_and_organized}}

**Asset Organization:**
{{how_static_and_dynamic_assets_are_organized}}

### Development Workflow Integration

**Development Server Structure:**
{{how_the_project_is_organized_for_development}}

**Build Process Structure:**
{{how_the_build_process_uses_the_project_structure}}

**Deployment Structure:**
{{how_the_project_structure_supports_deployment}}
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 7.

---

# Step 7: Architecture Validation & Completion

## Focus

Validating architectural coherence and completeness. VALIDATE all requirements are covered by architectural decisions.

## Context Boundaries

- Complete architecture document with all sections is available
- All architectural decisions, patterns, and structure are defined
- Focus on validation, gap analysis, and coherence checking
- Prepare for handoff to implementation phase

## Task

Validate the complete architecture for coherence, completeness, and readiness to guide AI agents through consistent implementation.

## Validation Sequence

### 1. Coherence Validation

Check that all architectural decisions work together:

**Decision Compatibility:**
- Do all technology choices work together without conflicts?
- Are all versions compatible with each other?
- Do patterns align with technology choices?
- Are there any contradictory decisions?

**Pattern Consistency:**
- Do implementation patterns support the architectural decisions?
- Are naming conventions consistent across all areas?
- Do structure patterns align with technology stack?
- Are communication patterns coherent?

**Structure Alignment:**
- Does the project structure support all architectural decisions?
- Are boundaries properly defined and respected?
- Does the structure enable the chosen patterns?
- Are integration points properly structured?

### 2. Requirements Coverage Validation

Verify all project requirements are architecturally supported:

**From Epics (if available):**
- Does every epic have architectural support?
- Are all user stories implementable with these decisions?
- Are cross-epic dependencies handled architecturally?

**From FR Categories (if no epics):**
- Does every functional requirement have architectural support?
- Are all FR categories fully covered?
- Are cross-cutting FRs properly addressed?

**Non-Functional Requirements:**
- Are performance requirements addressed architecturally?
- Are security requirements fully covered?
- Are scalability considerations properly handled?
- Are compliance requirements architecturally supported?

### 3. Implementation Readiness Validation

Assess if AI agents can implement consistently:

**Decision Completeness:**
- Are all critical decisions documented with versions?
- Are implementation patterns comprehensive enough?
- Are consistency rules clear and enforceable?
- Are examples provided for all major patterns?

**Structure Completeness:**
- Is the project structure complete and specific?
- Are all files and directories defined?
- Are integration points clearly specified?
- Are component boundaries well-defined?

**Pattern Completeness:**
- Are all potential conflict points addressed?
- Are naming conventions comprehensive?
- Are communication patterns fully specified?
- Are process patterns (error handling, etc.) complete?

### 4. Gap Analysis

Identify and document any missing elements:

**Critical Gaps:** Missing architectural decisions that block implementation
**Important Gaps:** Areas that need more detailed specification
**Nice-to-Have Gaps:** Additional patterns that would be helpful

### 5. Address Validation Issues

For any issues found, facilitate resolution with the user:
- Critical issues must be addressed before implementation
- Important issues should be addressed but aren't blocking
- Minor issues are optional refinements

### 6. Generate Validation Content

#### Content Structure

```markdown
## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
{{assessment_of_how_all_decisions_work_together}}

**Pattern Consistency:**
{{verification_that_patterns_support_decisions}}

**Structure Alignment:**
{{confirmation_that_structure_supports_architecture}}

### Requirements Coverage Validation

**Epic/Feature Coverage:**
{{verification_that_all_epics_or_features_are_supported}}

**Functional Requirements Coverage:**
{{confirmation_that_all_FRs_are_architecturally_supported}}

**Non-Functional Requirements Coverage:**
{{verification_that_NFRs_are_addressed}}

### Implementation Readiness Validation

**Decision Completeness:**
{{assessment_of_decision_documentation_completeness}}

**Structure Completeness:**
{{evaluation_of_project_structure_completeness}}

**Pattern Completeness:**
{{verification_of_implementation_patterns_completeness}}

### Gap Analysis Results

{{gap_analysis_findings_with_priority_levels}}

### Validation Issues Addressed

{{description_of_any_issues_found_and_resolutions}}

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** {{high/medium/low}} based on validation results

**Key Strengths:**
{{list_of_architecture_strengths}}

**Areas for Future Enhancement:**
{{areas_that_could_be_improved_later}}

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
{{starter_template_command_or_first_architectural_step}}
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 8.

---

# Step 8: Architecture Completion & Handoff

## Focus

Successful workflow completion and implementation handoff. THIS IS THE FINAL STEP IN THIS WORKFLOW.

## Execution Protocols

- Show your analysis before taking any action
- Present completion summary and implementation guidance
- Update frontmatter with final workflow state

## Completion Sequence

### 1. Congratulate the User on Completion

Both you and the User completed something amazing here - give a summary of what you achieved together and really congratulate the user on a job well done.

### 2. Update the created document's frontmatter

```yaml
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '{{current_date}}'
```

### 3. Next Steps Guidance

Architecture complete. Invoke the `bmad-help` skill.

Upon Completion of task output: offer to answer any questions about the Architecture Document.

## Workflow Complete

This is the final step of the Architecture workflow. The user now has a complete, validated architecture document ready for AI agent implementation.

The architecture will serve as the single source of truth for all technical decisions, ensuring consistent implementation across the entire project development lifecycle.

---

# Architecture Decision Document Template

```markdown
---
stepsCompleted: []
inputDocuments: []
workflowType: 'architecture'
project_name: '{{project_name}}'
user_name: '{{user_name}}'
date: '{{date}}'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._
```

---

# Reference Data: Project Types

| project_type | detection_signals | description | typical_starters |
|---|---|---|---|
| web_app | website, web application, browser, frontend, UI, interface | Web-based applications running in browsers | Next.js, Vite, Remix |
| mobile_app | mobile, iOS, Android, app, smartphone, tablet | Native mobile applications | React Native, Expo, Flutter |
| api_backend | API, REST, GraphQL, backend, service, microservice | Backend services and APIs | NestJS, Express, Fastify |
| full_stack | full-stack, complete, web+mobile, frontend+backend | Applications with both frontend and backend | T3 App, RedwoodJS, Blitz |
| cli_tool | CLI, command line, terminal, console, tool | Command-line interface tools | oclif, Commander, Caporal |
| desktop_app | desktop, Electron, Tauri, native app, macOS, Windows | Desktop applications | Electron, Tauri, Flutter Desktop |

# Reference Data: Domain Complexity

| domain | signals | complexity_level | suggested_workflow | web_searches |
|---|---|---|---|---|
| e_commerce | shopping, cart, checkout, payment, products, store | medium | standard | ecommerce architecture patterns, payment processing, inventory management |
| fintech | banking, payment, trading, finance, money, investment | high | enhanced | financial security, PCI compliance, trading algorithms, fraud detection |
| healthcare | medical, diagnostic, clinical, patient, hospital, health | high | enhanced | HIPAA compliance, medical data security, FDA regulations, health tech |
| social | social network, community, users, friends, posts, sharing | high | advanced | social graph algorithms, feed ranking, notification systems, privacy |
| education | learning, course, student, teacher, training, academic | medium | standard | LMS architecture, progress tracking, assessment systems, video streaming |
| productivity | productivity, workflow, tasks, management, business, tools | medium | standard | collaboration patterns, real-time editing, notification systems, integration |
| media | content, media, video, audio, streaming, broadcast | high | advanced | CDN architecture, video encoding, streaming protocols, content delivery |
| iot | IoT, sensors, devices, embedded, smart, connected | high | advanced | device communication, real-time data processing, edge computing, security |
| government | government, civic, public, admin, policy, regulation | high | enhanced | accessibility standards, security clearance, data privacy, audit trails |
| process_control | industrial automation, process control, PLC, SCADA, DCS, HMI, operational technology, control system, cyberphysical, MES, instrumentation, I&C, P&ID | high | advanced | industrial process control architecture, SCADA system design, OT cybersecurity architecture, real-time control systems |
| building_automation | building automation, BAS, BMS, HVAC, smart building, fire alarm, fire protection, fire suppression, life safety, elevator, DDC, access control, sequence of operations, commissioning | high | advanced | building automation architecture, BACnet integration patterns, smart building design, building management system security |
| gaming | game, gaming, multiplayer, real-time, interactive, entertainment | high | advanced | real-time multiplayer, game engine architecture, matchmaking, leaderboards |
