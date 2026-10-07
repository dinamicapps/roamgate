---
name: create-epics-and-stories
description: Break requirements into epics and user stories through a 4-step collaborative workflow
menu-code: create-epics
---

# Create Epics and Stories

**Goal:** Transform PRD requirements and Architecture decisions into comprehensive stories organized by user value, creating detailed, actionable stories with complete acceptance criteria for development teams.

**Your Role:** In addition to your name, communication_style, and persona, you are also a product strategist and technical specifications writer collaborating with a product owner. This is a partnership, not a client-vendor relationship. You bring expertise in requirements decomposition, technical implementation context, and acceptance criteria writing, while the user brings their product vision, user needs, and business requirements. Work together as equals.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step of the overall goal is a self contained instruction file that you will adhere to 1 file as directed at a time
- **Just-In-Time Loading**: Only 1 current step file will be loaded and followed to completion - never load future step files until told to do so
- **Sequential Enforcement**: Sequence within the step files must be completed in order, no skipping or optimization allowed
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array when a workflow produces a document
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, read fully and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple step files simultaneously
- ALWAYS read entire step file before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update frontmatter of output files when writing the final output for a specific step
- ALWAYS follow the exact instructions in the step file
- ALWAYS halt at menus and wait for user input
- NEVER create mental todo lists from future steps

## Activation

1. Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning

2. Begin with Step 1 below.

---

## Epics Template

```yaml
---
stepsCompleted: []
inputDocuments: []
---
```

```markdown
# {{project_name}} - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for {{project_name}}, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

{{fr_list}}

### NonFunctional Requirements

{{nfr_list}}

### Additional Requirements

{{additional_requirements}}

### UX Design Requirements

{{ux_design_requirements}}

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
```

---

## Step 1: Validate Prerequisites and Extract Requirements

### STEP GOAL

Validate that all required input documents exist and extract all requirements (FRs, NFRs, and additional requirements from UX/Architecture) needed for epic and story creation.

### REQUIREMENTS EXTRACTION PROCESS

#### 1. Welcome and Overview

Welcome {user_name} to comprehensive epic and story creation!

**CRITICAL PREREQUISITE VALIDATION:**

Verify required documents exist and are complete:
1. **PRD.md** - Contains requirements (FRs and NFRs) and product scope
2. **Architecture.md** - Contains technical decisions, API contracts, data models
3. **UX Design.md** (if UI exists) - Contains interaction patterns, mockups, user flows

#### 2. Document Discovery and Validation

Search for required documents using these patterns (sharded means a large document was split into multiple small files with an index.md into a folder):

**PRD Document Search Priority:**
1. `{planning_artifacts}/*prd*.md` (whole document)
2. `{planning_artifacts}/*prd*/index.md` (sharded version)

**Architecture Document Search Priority:**
1. `{planning_artifacts}/*architecture*.md` (whole document)
2. `{planning_artifacts}/*architecture*/index.md` (sharded version)

**UX Design Document Search (Optional):**
1. `{planning_artifacts}/*ux*.md` (whole document)
2. `{planning_artifacts}/*ux*/index.md` (sharded version)

Before proceeding, ask the user if there are any other documents to include and if anything found should be excluded. Wait for user confirmation. Once confirmed, create {planning_artifacts}/epics.md from the template above and list the files in the frontmatter `inputDocuments: []`.

#### 3. Extract Functional Requirements (FRs)

From the PRD document, read the entire document and extract ALL functional requirements:
- Look for numbered items like "FR1:", "Functional Requirement 1:", or similar
- Identify requirement statements that describe what the system must DO
- Include user actions, system behaviors, and business rules

Format: `FR1: [Clear, testable requirement description]`

#### 4. Extract Non-Functional Requirements (NFRs)

From the PRD document, extract ALL non-functional requirements:
- Performance, security, usability, reliability requirements
- Constraints and quality attributes
- Technical standards and compliance requirements

Format: `NFR1: [Performance/Security/Usability requirement]`

#### 5. Extract Additional Requirements from Architecture

Review Architecture document for technical requirements:
- **Starter Template**: Does Architecture specify a starter/greenfield template? If YES, document for Epic 1 Story 1
- Infrastructure and deployment requirements
- Integration requirements with external systems
- Data migration or setup requirements
- Monitoring and logging requirements
- API versioning or compatibility requirements
- Security implementation requirements

#### 6. Extract UX Design Requirements (if UX document exists)

**IMPORTANT**: The UX Design Specification is a first-class input document, not supplementary material.

Read the FULL UX Design document and extract ALL actionable work items:
- **Design token work**: Color systems, spacing scales, typography tokens
- **Component proposals**: Reusable UI components identified in the UX spec
- **Visual standardization**: Semantic CSS classes, consistent color palette usage
- **Accessibility requirements**: Contrast audit fixes, ARIA patterns, keyboard navigation
- **Responsive design requirements**: Breakpoints, layout adaptations
- **Interaction patterns**: Animations, transitions, loading states, error handling UX
- **Browser/device compatibility**: Target platforms, progressive enhancement

Format as SEPARATE section: `UX-DR1: [Actionable UX design requirement with clear implementation scope]`

**CRITICAL**: Do NOT reduce UX requirements to vague summaries. Each UX-DR must be specific enough to generate a story with testable acceptance criteria.

#### 7. Load and Initialize Template

Copy the Epics Template above to {planning_artifacts}/epics.md. Replace placeholders with extracted requirements. Leave {{requirements_coverage_map}} and {{epics_list}} as placeholders.

#### 8. Present Extracted Requirements

Display counts, examples, and ask for confirmation of completeness.

#### 9. Get User Confirmation

"Do these extracted requirements accurately represent what needs to be built? Any additions or corrections?"

#### 10. Present MENU OPTIONS

Display: `**Confirm the Requirements are complete and correct to [C] continue:**`

When C selected: Save all to {planning_artifacts}/epics.md, update frontmatter, proceed to Step 2.

---

## Step 2: Design Epic List

### STEP GOAL

Design and get approval for the epics_list that will organize all requirements into user-value-focused epics.

### EPIC DESIGN PROCESS

#### 1. Review Extracted Requirements

Load {planning_artifacts}/epics.md and review all FRs, NFRs, additional requirements, and UX-DRs.

#### 2. Explain Epic Design Principles

**EPIC DESIGN PRINCIPLES:**

1. **User-Value First**: Each epic must enable users to accomplish something meaningful
2. **Requirements Grouping**: Group related FRs that deliver cohesive user outcomes
3. **Incremental Delivery**: Each epic should deliver value independently
4. **Logical Flow**: Natural progression from user's perspective
5. **Dependency-Free Within Epic**: Stories within an epic must NOT depend on future stories

**CRITICAL PRINCIPLE - Organize by USER VALUE, not technical layers:**

**CORRECT Epic Examples (Standalone & Enable Future Epics):**
- Epic 1: User Authentication & Profiles (users can register, login, manage profiles) - **Standalone: Complete auth system**
- Epic 2: Content Creation (users can create, edit, publish content) - **Standalone: Uses auth, creates content**
- Epic 3: Social Interaction (users can follow, comment, like content) - **Standalone: Uses auth + content**

**WRONG Epic Examples (Technical Layers or Dependencies):**
- Epic 1: Database Setup (creates all tables upfront) - **No user value**
- Epic 2: API Development (builds all endpoints) - **No user value**
- Epic 3: Frontend Components (creates reusable components) - **No user value**

**DEPENDENCY RULES:**
- Each epic must deliver COMPLETE functionality for its domain
- Epic 2 must not require Epic 3 to function
- Epic 3 can build upon Epic 1 & 2 but must stand alone

#### 3. Design Epic Structure Collaboratively

**Step A: Identify User Value Themes** - Look for natural groupings in FRs, user journeys/workflows, user types and goals.

**Step B: Propose Epic Structure** - For each epic: Epic Title, User Outcome, FR Coverage, Implementation Notes.

**Step C: Create the epics_list**

```markdown
## Epic List

### Epic 1: [Epic Title]
[Epic goal statement - what users can accomplish]
**FRs covered:** FR1, FR2, FR3, etc.

### Epic 2: [Epic Title]
[Epic goal statement - what users can accomplish]
**FRs covered:** FR4, FR5, FR6, etc.
```

#### 4. Present Epic List for Review

Display complete epics_list with total count, FR coverage per epic, user value delivered, and dependencies.

#### 5. Create Requirements Coverage Map

```markdown
### FR Coverage Map

FR1: Epic 1 - [Brief description]
FR2: Epic 1 - [Brief description]
FR3: Epic 2 - [Brief description]
...
```

This ensures no FRs are missed.

#### 6. Collaborative Refinement

Ask about alignment with product vision, coverage, grouping, and dependencies.

#### 7. Get Final Approval

**CRITICAL:** Must get explicit user approval before proceeding.

#### 8. Present MENU OPTIONS

Display: "**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue"

When C selected: Save approved epics_list, update frontmatter, proceed to Step 3.

---

## Step 3: Generate Epics and Stories

### STEP GOAL

Generate all epics with their stories based on the approved epics_list, following the template structure exactly.

### STORY GENERATION PROCESS

#### 1. Load Approved Epic Structure

Load {planning_artifacts}/epics.md and review approved epics_list, FR coverage map, all requirements, and template structure.

**UX Design Integration**: If UX Design Requirements (UX-DRs) were extracted in Step 1, ensure they are covered by stories.

#### 2. Story Creation Guidelines

For each epic, create stories that:
- Follow the exact template structure
- Are sized for single dev agent completion
- Have clear user value
- Include specific acceptance criteria
- Reference requirements being fulfilled

**DATABASE/ENTITY CREATION PRINCIPLE:**
Create tables/entities ONLY when needed by the story:
- WRONG: Epic 1 Story 1 creates all 50 database tables
- RIGHT: Each story creates/alters ONLY the tables it needs

**STORY DEPENDENCY PRINCIPLE:**
Stories must be independently completable in sequence:
- WRONG: Story 1.2 requires Story 1.3 to be completed first
- RIGHT: Each story can be completed based only on previous stories

**STORY FORMAT (from template):**

```markdown
### Story {N}.{M}: {story_title}

As a {user_type},
I want {capability},
So that {value_benefit}.

**Acceptance Criteria:**

**Given** {precondition}
**When** {action}
**Then** {expected_outcome}
**And** {additional_criteria}
```

**GOOD STORY EXAMPLES:**
- Story 1.1: User Registration with Email
- Story 1.2: User Login with Password
- Story 1.3: Password Reset via Email

**BAD STORY EXAMPLES:**
- Story: "Set up database" (no user value)
- Story: "Create all models" (too large, no user value)
- Story: "Login UI (depends on Story 1.3 API endpoint)" (future dependency!)

#### 3. Process Epics Sequentially

For each epic in the approved epics_list:

**A. Epic Overview** - Display epic number, title, goal, FRs covered, relevant NFRs and UX-DRs.

**B. Story Breakdown** - Work with user to break down into stories. Identify distinct user capabilities, ensure logical flow, size appropriately.

**C. Generate Each Story** - Story Title, User Story (As a/I want/So that), Acceptance Criteria (Given/When/Then).

**AC Writing Guidelines:**
- Use Given/When/Then format
- Each AC should be independently testable
- Include edge cases and error conditions
- Reference specific requirements when applicable

**D. Collaborative Review** - Present each story and ask: "Does this capture the requirement correctly?", "Is the scope appropriate?", "Are the acceptance criteria complete?"

**E. Append to Document** - When approved, append following template structure.

#### 4. Epic Completion

After all stories for an epic are complete, display summary, verify FR coverage, get confirmation to proceed to next epic.

#### 5. Repeat for All Epics

Process each epic in order.

#### 6. Final Document Completion

Verify template structure, all placeholders replaced, all FRs covered, all UX-DRs covered, formatting consistent.

#### 7. Present MENU OPTIONS

Display: "**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue"

When C selected: Save content, update frontmatter, proceed to Step 4.

---

## Step 4: Final Validation

### STEP GOAL

Validate complete coverage of all requirements and ensure stories are ready for development.

### VALIDATION PROCESS

#### 1. FR Coverage Validation

Go through each FR from the Requirements Inventory. Verify it appears in at least one story. Check that acceptance criteria fully address the FR. No FRs should be left uncovered.

#### 2. Architecture Implementation Validation

**Starter Template Setup:**
- Does Architecture specify a starter template?
- If YES: Epic 1 Story 1 must be "Set up initial project from starter template"

**Database/Entity Creation Validation:**
- Are tables/entities created ONLY when needed by stories?
- WRONG: Epic 1 creates all tables upfront
- RIGHT: Tables created as part of the first story that needs them

#### 3. Story Quality Validation

Each story must:
- Be completable by a single dev agent
- Have clear acceptance criteria
- Reference specific FRs it implements
- Include necessary technical details
- **Not have forward dependencies** (can only depend on PREVIOUS stories)
- Be implementable without waiting for future stories

#### 4. Epic Structure Validation

- Epics deliver user value, not technical milestones
- Dependencies flow naturally
- Foundation stories only setup what's needed
- No big upfront technical work

#### 5. Dependency Validation (CRITICAL)

**Epic Independence Check:**
- Does each epic deliver COMPLETE functionality for its domain?
- Can Epic 2 function without Epic 3?
- Can Epic 3 function standalone using Epic 1 & 2 outputs?

**Within-Epic Story Dependency Check:**
For each epic, review stories in order:
- Can Story N.1 be completed without Stories N.2, N.3, etc.?
- Can Story N.2 be completed using only Story N.1 output?

#### 6. Complete and Save

If all validations pass, update remaining placeholders, ensure proper formatting, save final epics.md.

**Present Final Menu:**
**All validations complete!** [C] Complete Workflow

When C is selected, the workflow is complete and epics.md is ready for development. Offer to answer any questions about the Epics and Stories.
