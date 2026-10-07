---
name: correct-course
description: Manage significant changes during sprint execution by analyzing impact across all project artifacts and producing a structured Sprint Change Proposal
menu-code: correct-course
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

### Document Discovery Strategy

Course correction needs broad project context to assess change impact accurately. Load all available planning artifacts.

**Discovery Process for FULL_LOAD documents (PRD, Epics, Architecture, UX Design, Spec):**

1. **Search for whole document first** - Look for files matching the whole-document pattern
2. **Check for sharded version** - If whole document not found, look for a directory with `index.md`
3. **If sharded version found**: Read `index.md` to understand structure, then read ALL section files
4. **Priority**: If both whole and sharded versions exist, use the whole document

**Discovery Process for INDEX_GUIDED documents (Document Project):**

1. **Search for index file** - Look for `{project_knowledge}/index.md`
2. **If found**: Read the index and selectively load sections based on relevance
3. **This document is optional** - skip if not found (greenfield projects)

**Fuzzy matching**: Be flexible with document names.

**Missing documents**: PRD and Epics are essential; Architecture, UX Design, Spec, and Document Project are loaded if available. HALT if PRD or Epics cannot be found.

---

## EXECUTION

### Step 1: Initialize Change Navigation

1. Load `**/project-context.md` for coding standards and project-wide patterns (if exists)
2. Confirm change trigger and gather user description of the issue
3. Ask: "What specific issue or change has been identified that requires navigation?"
4. Verify access to required project documents (PRD, Epics, Architecture, UI/UX specs)
5. Ask user for mode preference:
   - **Incremental** (recommended): Refine each edit collaboratively
   - **Batch**: Present all changes at once for review
6. Store mode selection for use throughout workflow

**HALT if change trigger is unclear:** "Cannot navigate change without clear understanding of the triggering issue. Please provide specific details about what needs to change and why."

**HALT if core documents are unavailable:** "Need access to project documents (PRD, Epics, Architecture, UI/UX) to assess change impact."

---

### Step 2: Execute Change Analysis Checklist

Work through the following systematic analysis checklist interactively with the user.

Record status for each checklist item:
- [x] Done - Item completed successfully
- [N/A] Skip - Item not applicable to this change
- [!] Action-needed - Item requires attention or follow-up

#### Section 1: Understand the Trigger and Context

**1.1** Identify the triggering story that revealed this issue. Document story ID and brief description.

**1.2** Define the core problem precisely. Categorize issue type:
- Technical limitation discovered during implementation
- New requirement emerged from stakeholders
- Misunderstanding of original requirements
- Strategic pivot or market change
- Failed approach requiring different solution

Write clear problem statement.

**1.3** Assess initial impact and gather supporting evidence. Collect concrete examples, error messages, stakeholder feedback, or technical constraints.

**HALT if trigger is unclear or no evidence provided.**

#### Section 2: Epic Impact Assessment

**2.1** Evaluate current epic containing the trigger story. Can it still be completed as originally planned?

**2.2** Determine required epic-level changes:
- Modify existing epic scope or acceptance criteria
- Add new epic to address the issue
- Remove or defer epic that's no longer viable
- Completely redefine epic based on new understanding

**2.3** Review all remaining planned epics for required changes. Check each future epic for impact. Identify dependencies that may be affected.

**2.4** Check if issue invalidates future epics or necessitates new ones.

**2.5** Consider if epic order or priority should change.

#### Section 3: Artifact Conflict and Impact Analysis

**3.1** Check PRD for conflicts:
- Does issue conflict with core PRD goals or objectives?
- Do requirements need modification, addition, or removal?
- Is the defined MVP still achievable or does scope need adjustment?

**3.2** Review Architecture document for conflicts:
- System components and their interactions
- Architectural patterns and design decisions
- Technology stack choices
- Data models and schemas
- API designs and contracts
- Integration points

**3.3** Examine UI/UX specifications for conflicts:
- User interface components
- User flows and journeys
- Wireframes or mockups
- Interaction patterns
- Accessibility considerations

**3.4** Consider impact on other artifacts:
- Deployment scripts
- Infrastructure as Code (IaC)
- Monitoring and observability setup
- Testing strategies
- Documentation
- CI/CD pipelines

#### Section 4: Path Forward Evaluation

**4.1** Evaluate Option 1: Direct Adjustment
- Can the issue be addressed by modifying existing stories?
- Can new stories be added within the current epic structure?
- Would this approach maintain project timeline and scope?
- Effort estimate: [High/Medium/Low]
- Risk level: [High/Medium/Low]
- Status: [ ] Viable / [ ] Not viable

**4.2** Evaluate Option 2: Potential Rollback
- Would reverting recently completed stories simplify addressing this issue?
- Which stories would need to be rolled back?
- Is the rollback effort justified by the simplification gained?
- Effort estimate: [High/Medium/Low]
- Risk level: [High/Medium/Low]
- Status: [ ] Viable / [ ] Not viable

**4.3** Evaluate Option 3: PRD MVP Review
- Is the original PRD MVP still achievable with this issue?
- Does MVP scope need to be reduced or redefined?
- Do core goals need modification based on new constraints?
- What would be deferred to post-MVP if scope is reduced?
- Effort estimate: [High/Medium/Low]
- Risk level: [High/Medium/Low]
- Status: [ ] Viable / [ ] Not viable

**4.4** Select recommended path forward. Based on analysis of all options, choose the best path considering:
- Implementation effort and timeline impact
- Technical risk and complexity
- Impact on team morale and momentum
- Long-term sustainability and maintainability
- Stakeholder expectations and business value

Selected approach: [Option 1 / Option 2 / Option 3 / Hybrid]
Justification: [Document reasoning]

#### Section 5: Sprint Change Proposal Components

**5.1** Create identified issue summary - clear, concise problem statement with context.

**5.2** Document epic impact and artifact adjustment needs from Sections 2 and 3.

**5.3** Present recommended path forward with rationale, trade-offs, and alternatives considered.

**5.4** Define PRD MVP impact and high-level action plan with dependencies and sequencing.

**5.5** Establish agent handoff plan:
- Development team (for implementation)
- Product Owner / Scrum Master (for backlog changes)
- Product Manager / Architect (for strategic changes)

#### Section 6: Final Review and Handoff

**6.1** Review checklist completion. Verify all applicable sections addressed.

**6.2** Verify Sprint Change Proposal accuracy. Review for consistency and clarity.

**6.3** Obtain explicit user approval.

**6.4** Update sprint-status.yaml to reflect approved epic changes (add/remove epics, renumber, update stories).

**6.5** Confirm next steps and handoff plan.

**HALT if any critical section cannot be completed, user approval not obtained, or handoff responsibilities unclear.**

---

### Step 3: Draft Specific Change Proposals

Based on checklist findings, create explicit edit proposals for each identified artifact.

**For Story changes:**
Show old -> new text format. Include story ID and section being modified. Provide rationale.

Example format:
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

**For PRD modifications:**
Specify exact sections to update. Show current content and proposed changes. Explain impact on MVP scope.

**For Architecture changes:**
Identify affected components, patterns, or technology choices. Describe diagram updates needed. Note ripple effects.

**For UI/UX specification updates:**
Reference specific screens or components. Show wireframe or flow changes. Connect changes to user experience impact.

**If mode is Incremental:** Present each edit proposal individually. Ask: Review and refine? Options: Approve [a], Edit [e], Skip [s]. Iterate based on feedback.

**If mode is Batch:** Collect all edit proposals and present together at end.

---

### Step 4: Generate Sprint Change Proposal

Compile comprehensive Sprint Change Proposal document:

**Section 1: Issue Summary**
- Clear problem statement
- Context about when/how discovered
- Evidence or examples

**Section 2: Impact Analysis**
- Epic Impact: Which epics affected and how
- Story Impact: Current and future stories requiring changes
- Artifact Conflicts: PRD, Architecture, UI/UX documents needing updates
- Technical Impact: Code, infrastructure, or deployment implications

**Section 3: Recommended Approach**
- Present chosen path forward from checklist evaluation:
  - Direct Adjustment: Modify/add stories within existing plan
  - Potential Rollback: Revert completed work to simplify resolution
  - MVP Review: Reduce scope or modify goals
- Clear rationale, effort estimate, risk assessment, timeline impact

**Section 4: Detailed Change Proposals**
- All refined edit proposals from Step 3
- Grouped by artifact type (Stories, PRD, Architecture, UI/UX)
- Each change includes before/after and justification

**Section 5: Implementation Handoff**
- Categorize change scope:
  - Minor: Direct implementation by dev team
  - Moderate: Backlog reorganization needed (PO/SM)
  - Major: Fundamental replan required (PM/Architect)
- Specify handoff recipients and responsibilities
- Define success criteria for implementation

Present complete Sprint Change Proposal to user.
Write to {default_output_file}.
Ask: Review complete proposal. Continue [c] or Edit [e]?

---

### Step 5: Finalize and Route for Implementation

Get explicit user approval: "Do you approve this Sprint Change Proposal for implementation? (yes/no/revise)"

**If no or revise:** Gather feedback and return to Step 3 or Step 4 as appropriate.

**If yes:** Finalize document and determine change scope:
- **Minor**: Route to development team for direct implementation
- **Moderate**: Route to Product Owner / Scrum Master with backlog reorganization plan
- **Major**: Route to Product Manager / Solution Architect with escalation notice

Confirm handoff completion and next steps.

---

### Step 6: Workflow Completion

Summarize workflow execution:
- Issue addressed
- Change scope
- Artifacts modified
- Routed to

Confirm all deliverables:
- Sprint Change Proposal document
- Specific edit proposals with before/after
- Implementation handoff plan

Report completion: "Correct Course workflow complete, {user_name}!"
Remind user of success criteria and next steps for implementation team.

---

## Execution Notes

- This checklist is for SIGNIFICANT changes affecting project direction
- Work interactively with user - they make final decisions
- Be factual, not blame-oriented when analyzing issues
- Handle changes professionally as opportunities to improve the project
- Maintain conversation context throughout - this is collaborative work
