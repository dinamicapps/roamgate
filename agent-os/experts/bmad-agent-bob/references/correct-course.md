---
name: Correct Course
description: Manage significant changes during sprint execution
menu-code: CC
---

# Correct Course - Sprint Change Management Workflow

**Goal:** Manage significant changes during sprint execution by analyzing impact across all project artifacts and producing a structured Sprint Change Proposal.

**Your Role:** You are a Scrum Master navigating change management. Analyze the triggering issue, assess impact across PRD, epics, architecture, and UX artifacts, and produce an actionable Sprint Change Proposal with clear handoff.

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `user_skill_level`
- `implementation_artifacts`
- `planning_artifacts`
- `project_knowledge`
- `date` as system-generated current datetime
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- Language MUST be tailored to `{user_skill_level}`
- Generate all documents in `{document_output_language}`
- DOCUMENT OUTPUT: Updated epics, stories, or PRD sections. Clear, actionable changes. User skill level (`{user_skill_level}`) affects conversation style ONLY, not document updates.

### Paths

- `default_output_file` = `{planning_artifacts}/sprint-change-proposal-{date}.md`

### Input Files

| Input | Path | Load Strategy |
|-------|------|---------------|
| PRD | `{planning_artifacts}/*prd*.md` (whole) or `{planning_artifacts}/*prd*/*.md` (sharded) | FULL_LOAD |
| Epics | `{planning_artifacts}/*epic*.md` (whole) or `{planning_artifacts}/*epic*/*.md` (sharded) | FULL_LOAD |
| Architecture | `{planning_artifacts}/*architecture*.md` (whole) or `{planning_artifacts}/*architecture*/*.md` (sharded) | FULL_LOAD |
| UX Design | `{planning_artifacts}/*ux*.md` (whole) or `{planning_artifacts}/*ux*/*.md` (sharded) | FULL_LOAD |
| Spec | `{planning_artifacts}/*spec-*.md` (whole) | FULL_LOAD |
| Document Project | `{project_knowledge}/index.md` (sharded) | INDEX_GUIDED |

### Context

- Load `**/project-context.md` if it exists

---

## EXECUTION

### Document Discovery - Loading Project Artifacts

**Strategy**: Course correction needs broad project context to assess change impact accurately. Load all available planning artifacts.

**Discovery Process for FULL_LOAD documents (PRD, Epics, Architecture, UX Design, Spec):**

1. **Search for whole document first** - Look for files matching the whole-document pattern (e.g., `*prd*.md`, `*epic*.md`, `*architecture*.md`, `*ux*.md`, `*spec-*.md`)
2. **Check for sharded version** - If whole document not found, look for a directory with `index.md` (e.g., `prd/index.md`, `epics/index.md`)
3. **If sharded version found**:
   - Read `index.md` to understand the document structure
   - Read ALL section files listed in the index
   - Process the combined content as a single document
4. **Priority**: If both whole and sharded versions exist, use the whole document

**Discovery Process for INDEX_GUIDED documents (Document Project):**

1. **Search for index file** - Look for `{project_knowledge}/index.md`
2. **If found**: Read the index to understand available documentation sections
3. **Selectively load sections** based on relevance to the change being analyzed -- do NOT load everything, only sections that relate to the impacted areas
4. **This document is optional** -- skip if `{project_knowledge}` does not exist (greenfield projects)

**Fuzzy matching**: Be flexible with document names -- users may use variations like `prd.md`, `bmm-prd.md`, `product-requirements.md`, etc.

**Missing documents**: Not all documents may exist. PRD and Epics are essential; Architecture, UX Design, Spec, and Document Project are loaded if available. HALT if PRD or Epics cannot be found.

<workflow>

<step n="1" goal="Initialize Change Navigation">
  <action>Load **/project-context.md for coding standards and project-wide patterns (if exists)</action>
  <action>Confirm change trigger and gather user description of the issue</action>
  <action>Ask: "What specific issue or change has been identified that requires navigation?"</action>
  <action>Verify access to required project documents:</action>
    - PRD (Product Requirements Document)
    - Current Epics and Stories
    - Architecture documentation
    - UI/UX specifications
  <action>Ask user for mode preference:</action>
    - **Incremental** (recommended): Refine each edit collaboratively
    - **Batch**: Present all changes at once for review
  <action>Store mode selection for use throughout workflow</action>

<action if="change trigger is unclear">HALT: "Cannot navigate change without clear understanding of the triggering issue. Please provide specific details about what needs to change and why."</action>

<action if="core documents are unavailable">HALT: "Need access to project documents (PRD, Epics, Architecture, UI/UX) to assess change impact. Please ensure these documents are accessible."</action>
</step>

<step n="2" goal="Execute Change Analysis Checklist">
  <action>Work through each checklist section interactively with the user (see Change Navigation Checklist below)</action>
  <action>Record status for each checklist item:</action>
    - [x] Done - Item completed successfully
    - [N/A] Skip - Item not applicable to this change
    - [!] Action-needed - Item requires attention or follow-up
  <action>Maintain running notes of findings and impacts discovered</action>
  <action>Present checklist progress after each major section</action>

<action if="checklist cannot be completed">Identify blocking issues and work with user to resolve before continuing</action>
</step>

<step n="3" goal="Draft Specific Change Proposals">
<action>Based on checklist findings, create explicit edit proposals for each identified artifact</action>

<action>For Story changes:</action>
- Show old -> new text format
- Include story ID and section being modified
- Provide rationale for each change
- Example format:
  ```
  Story: [STORY-123] User Authentication
  Section: Acceptance Criteria

  OLD:
  - User can log in with email/password

  NEW:
  - User can log in with email/password
  - User can enable 2FA via authenticator app

  Rationale: Security requirement identified during implementation
  ```

<action>For PRD modifications:</action>
- Specify exact sections to update
- Show current content and proposed changes
- Explain impact on MVP scope and requirements

<action>For Architecture changes:</action>
- Identify affected components, patterns, or technology choices
- Describe diagram updates needed
- Note any ripple effects on other components

<action>For UI/UX specification updates:</action>
- Reference specific screens or components
- Show wireframe or flow changes needed
- Connect changes to user experience impact

<check if="mode is Incremental">
  <action>Present each edit proposal individually</action>
  <ask>Review and refine this change? Options: Approve [a], Edit [e], Skip [s]</ask>
  <action>Iterate on each proposal based on user feedback</action>
</check>

<action if="mode is Batch">Collect all edit proposals and present together at end of step</action>

</step>

<step n="4" goal="Generate Sprint Change Proposal">
<action>Compile comprehensive Sprint Change Proposal document with following sections:</action>

**Section 1: Issue Summary**
- Clear problem statement describing what triggered the change
- Context about when/how the issue was discovered
- Evidence or examples demonstrating the issue

**Section 2: Impact Analysis**
- Epic Impact: Which epics are affected and how
- Story Impact: Current and future stories requiring changes
- Artifact Conflicts: PRD, Architecture, UI/UX documents needing updates
- Technical Impact: Code, infrastructure, or deployment implications

**Section 3: Recommended Approach**
- Present chosen path forward from checklist evaluation:
  - Direct Adjustment: Modify/add stories within existing plan
  - Potential Rollback: Revert completed work to simplify resolution
  - MVP Review: Reduce scope or modify goals
- Provide clear rationale for recommendation
- Include effort estimate, risk assessment, and timeline impact

**Section 4: Detailed Change Proposals**
- Include all refined edit proposals from Step 3
- Group by artifact type (Stories, PRD, Architecture, UI/UX)
- Ensure each change includes before/after and justification

**Section 5: Implementation Handoff**
- Categorize change scope:
  - Minor: Direct implementation by dev team
  - Moderate: Backlog reorganization needed (PO/SM)
  - Major: Fundamental replan required (PM/Architect)
- Specify handoff recipients and their responsibilities
- Define success criteria for implementation

<action>Present complete Sprint Change Proposal to user</action>
<action>Write Sprint Change Proposal document to {default_output_file}</action>
<ask>Review complete proposal. Continue [c] or Edit [e]?</ask>
</step>

<step n="5" goal="Finalize and Route for Implementation">
<action>Get explicit user approval for complete proposal</action>
<ask>Do you approve this Sprint Change Proposal for implementation? (yes/no/revise)</ask>

<check if="no or revise">
  <action>Gather specific feedback on what needs adjustment</action>
  <action>Return to appropriate step to address concerns</action>
  <goto step="3">If changes needed to edit proposals</goto>
  <goto step="4">If changes needed to overall proposal structure</goto>
</check>

<check if="yes the proposal is approved by the user">
  <action>Finalize Sprint Change Proposal document</action>
  <action>Determine change scope classification:</action>
  - **Minor**: Can be implemented directly by development team
  - **Moderate**: Requires backlog reorganization and PO/SM coordination
  - **Major**: Needs fundamental replan with PM/Architect involvement

  <action>Provide appropriate handoff based on scope:</action>
</check>

<check if="Minor scope">
  <action>Route to: Development team for direct implementation</action>
  <action>Deliverables: Finalized edit proposals and implementation tasks</action>
</check>

<check if="Moderate scope">
  <action>Route to: Product Owner / Scrum Master agents</action>
  <action>Deliverables: Sprint Change Proposal + backlog reorganization plan</action>
</check>

<check if="Major scope">
  <action>Route to: Product Manager / Solution Architect</action>
  <action>Deliverables: Complete Sprint Change Proposal + escalation notice</action>
</check>

<action>Confirm handoff completion and next steps with user</action>
<action>Document handoff in workflow execution log</action>
</step>

<step n="6" goal="Workflow Completion">
<action>Summarize workflow execution:</action>
  - Issue addressed: {{change_trigger}}
  - Change scope: {{scope_classification}}
  - Artifacts modified: {{list_of_artifacts}}
  - Routed to: {{handoff_recipients}}

<action>Confirm all deliverables produced:</action>
- Sprint Change Proposal document
- Specific edit proposals with before/after
- Implementation handoff plan

<action>Report workflow completion to user with personalized message: "Correct Course workflow complete, {user_name}!"</action>
<action>Remind user of success criteria and next steps for implementation team</action>
</step>

</workflow>

---

## Change Navigation Checklist

<checklist>

### Section 1: Understand the Trigger and Context

- [ ] **1.1** Identify the triggering story that revealed this issue. Document story ID and brief description.
- [ ] **1.2** Define the core problem precisely. Categorize issue type:
  - Technical limitation discovered during implementation
  - New requirement emerged from stakeholders
  - Misunderstanding of original requirements
  - Strategic pivot or market change
  - Failed approach requiring different solution
  Write clear problem statement.
- [ ] **1.3** Assess initial impact and gather supporting evidence. Collect concrete examples, error messages, stakeholder feedback, or technical constraints.

**HALT conditions:**
- If trigger is unclear: "Cannot proceed without understanding what caused the need for change"
- If no evidence provided: "Need concrete evidence or examples of the issue before analyzing impact"

### Section 2: Epic Impact Assessment

- [ ] **2.1** Evaluate current epic containing the trigger story. Can this epic still be completed as originally planned?
- [ ] **2.2** Determine required epic-level changes:
  - Modify existing epic scope or acceptance criteria
  - Add new epic to address the issue
  - Remove or defer epic that's no longer viable
  - Completely redefine epic based on new understanding
- [ ] **2.3** Review all remaining planned epics for required changes. Check each future epic for impact. Identify dependencies that may be affected.
- [ ] **2.4** Check if issue invalidates future epics or necessitates new ones.
- [ ] **2.5** Consider if epic order or priority should change.

### Section 3: Artifact Conflict and Impact Analysis

- [ ] **3.1** Check PRD for conflicts. Does issue conflict with core PRD goals or objectives? Do requirements need modification? Is the defined MVP still achievable?
- [ ] **3.2** Review Architecture document for conflicts:
  - System components and their interactions
  - Architectural patterns and design decisions
  - Technology stack choices
  - Data models and schemas
  - API designs and contracts
  - Integration points
- [ ] **3.3** Examine UI/UX specifications for conflicts:
  - User interface components
  - User flows and journeys
  - Wireframes or mockups
  - Interaction patterns
  - Accessibility considerations
- [ ] **3.4** Consider impact on other artifacts:
  - Deployment scripts
  - Infrastructure as Code (IaC)
  - Monitoring and observability setup
  - Testing strategies
  - Documentation
  - CI/CD pipelines

### Section 4: Path Forward Evaluation

- [ ] **4.1** Evaluate Option 1: Direct Adjustment. Can the issue be addressed by modifying existing stories? Can new stories be added within the current epic structure? Effort estimate: [High/Medium/Low]. Risk level: [High/Medium/Low].
- [ ] **4.2** Evaluate Option 2: Potential Rollback. Would reverting recently completed stories simplify addressing this issue? Which stories would need to be rolled back? Effort estimate: [High/Medium/Low]. Risk level: [High/Medium/Low].
- [ ] **4.3** Evaluate Option 3: PRD MVP Review. Is the original PRD MVP still achievable? Does MVP scope need to be reduced or redefined? What would be deferred to post-MVP? Effort estimate: [High/Medium/Low]. Risk level: [High/Medium/Low].
- [ ] **4.4** Select recommended path forward. Provide clear rationale considering: implementation effort, technical risk, team impact, long-term sustainability, stakeholder expectations.

### Section 5: Sprint Change Proposal Components

- [ ] **5.1** Create identified issue summary.
- [ ] **5.2** Document epic impact and artifact adjustment needs.
- [ ] **5.3** Present recommended path forward with rationale.
- [ ] **5.4** Define PRD MVP impact and high-level action plan.
- [ ] **5.5** Establish agent handoff plan.

### Section 6: Final Review and Handoff

- [ ] **6.1** Review checklist completion. Verify all applicable sections have been addressed.
- [ ] **6.2** Verify Sprint Change Proposal accuracy. Review complete proposal for consistency and clarity.
- [ ] **6.3** Obtain explicit user approval.
- [ ] **6.4** Update sprint-status.yaml to reflect approved epic changes.
- [ ] **6.5** Confirm next steps and handoff plan.

**HALT conditions:**
- If any critical section cannot be completed: "Cannot proceed to proposal without complete impact analysis"
- If user approval not obtained: "Must have explicit approval before implementing changes"
- If handoff responsibilities unclear: "Must clearly define who will execute the proposed changes"

</checklist>

**Execution Notes:**
- This checklist is for SIGNIFICANT changes affecting project direction
- Work interactively with user -- they make final decisions
- Be factual, not blame-oriented when analyzing issues
- Handle changes professionally as opportunities to improve the project
- Maintain conversation context throughout -- this is collaborative work
