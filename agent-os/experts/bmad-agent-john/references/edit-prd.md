---
name: edit-prd
description: Edit and improve an existing PRD through a structured 5-step enhancement workflow
menu-code: edit-prd
---

# PRD Edit Workflow

**Goal:** Edit and improve existing PRDs through structured enhancement workflow.

**Your Role:** PRD improvement specialist.

You will continue to operate with your given name, identity, and communication_style, merged with the details of this role description.

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self contained instruction file that is a part of an overall workflow that must be followed exactly
- **Just-In-Time Loading**: Only the current step file is in memory - never load future step files until told to do so
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

YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the configured `{communication_language}`.
YOU MUST ALWAYS WRITE all artifact and document content in `{document_output_language}`.

2. Route to Edit Workflow

"**Edit Mode: Improving an existing PRD.**"

Prompt for PRD path: "Which PRD would you like to edit? Please provide the path to the PRD.md file."

Begin with Step E-1 below.

---

## Reference: PRD Purpose and Standards

### What is a BMAD PRD?

A dual-audience document serving:
1. **Human Product Managers and builders** - Vision, strategy, stakeholder communication
2. **LLM Downstream Consumption** - UX Design -> Architecture -> Epics -> Development AI Agents

### Core Philosophy: Information Density

Every sentence must carry information weight. Zero fluff. Maximum information per word.

**Anti-Patterns:** "The system will allow users to...", "It is important to note that...", "In order to...", conversational filler and padding.

### SMART Quality Criteria for FRs

Specific, Measurable, Attainable, Relevant, Traceable.

### Required BMAD PRD Sections
1. Executive Summary
2. Success Criteria
3. Product Scope
4. User Journeys
5. Functional Requirements
6. Non-Functional Requirements

---

## Step E-1: Discovery & Understanding

### STEP GOAL

Understand what the user wants to edit in the PRD, detect PRD format/type, check for validation report guidance, and route appropriately.

### MANDATORY SEQUENCE

#### 1. Load PRD Purpose Standards

Load the PRD Purpose and Standards reference above. Internalize this understanding - it will guide improvement recommendations.

#### 2. Discover PRD to Edit

"**PRD Edit Workflow**

Which PRD would you like to edit? Please provide the path to the PRD file."

Wait for user to provide PRD path.

#### 3. Validate PRD Exists and Load

Check if PRD file exists. If found, load complete file including frontmatter.

#### 4. Check for Existing Validation Report

Check if validation report exists in the PRD folder. Look for most recent validation report.

**If validation report found:**
"I found a validation report from {validation_date} in the PRD folder. This report contains findings from previous validation checks and can help guide our edits.

Would you like to:
- **[U] Use validation report** - Load it to guide and prioritize edits
- **[S] Skip** - Proceed with manual edit discovery"

**If U selected:** Load the validation report, extract findings, issues, and improvement suggestions.
**If S selected or no validation report found:** Proceed with manual discovery.

#### 5. Ask About Validation Report (Manual)

If no auto-detected report, ask:
"Do you have a validation report to guide edits? Validation report path (or type 'none'):"

If provided, load and extract findings.

#### 6. Discover Edit Requirements

"**What would you like to edit in this PRD?**

Please describe the changes you want to make. For example:
- Fix specific issues (information density, implementation leakage, etc.)
- Add missing sections or content
- Improve structure and flow
- Convert to BMAD format (if legacy PRD)
- General improvements
- Other changes"

Wait for user description.

#### 7. Detect PRD Format

Extract all ## Level 2 headers from PRD. Check for BMAD PRD core sections (6 total).

Classify format:
- **BMAD Standard:** 5-6 core sections present
- **BMAD Variant:** 3-4 core sections present
- **Legacy (Non-Standard):** Fewer than 3 core sections

#### 8. Route Based on Format and Context

**IF validation report provided OR PRD is BMAD Standard/Variant:**
Proceed to Step E-2.

**IF PRD is Legacy AND no validation report:**
Present menu:
- [C] Convert to BMAD Format - Convert PRD to BMAD standard structure, then apply edits
- [E] Edit As-Is - Apply edits without converting format
- [X] Exit

If C selected, proceed to Step E-1B. If E selected, proceed to Step E-2.

---

## Step E-1B: Legacy PRD Conversion Assessment

### STEP GOAL

Analyze legacy PRD against BMAD standards, identify gaps, propose conversion strategy.

### MANDATORY SEQUENCE

#### 1. Analyze Each BMAD PRD Section

For each of the 6 BMAD core sections, analyze:
- Present: Yes/No/Partial
- Gap: What's missing or incomplete
- Effort to Complete: Minimal/Moderate/Significant

#### 2. Overall Assessment

- Sections Present: {count}/6
- Total Conversion Effort: Quick/Moderate/Substantial
- Recommended: Full restructuring / Targeted improvements

#### 3. Present Conversion Assessment

Display gap analysis and recommendation.

#### 4. Present MENU OPTIONS

- [R] Restructure to BMAD - Full conversion to BMAD format, then apply edits
- [I] Targeted Improvements - Apply edits to existing structure without restructuring
- [E] Edit & Restructure - Do both: convert format AND apply edits
- [X] Exit

#### 5. Document Conversion Strategy

Store conversion decision and proceed to Step E-2.

---

## Step E-2: Deep Review & Analysis

### STEP GOAL

Thoroughly review the existing PRD, analyze validation report findings (if provided), and prepare a detailed change plan before editing.

### MANDATORY SEQUENCE

#### 1. Deep Review

**IF validation report provided:**
1. Extract all findings from validation report
2. Map findings to specific PRD sections
3. Prioritize by severity: Critical > Warning > Informational
4. For each critical issue: identify specific fix needed
5. For user's manual edit goals: identify where in PRD to apply

**IF no validation report:**
1. Read entire PRD thoroughly
2. Analyze against BMAD standards
3. Identify issues in: information density, structure/flow, completeness, measurability, traceability, implementation leakage
4. Map user's edit goals to specific sections

#### 2. Build Change Plan

For each section (in order):
- **Current State:** Brief description
- **Issues Identified:** List from validation report or manual analysis
- **Changes Needed:** Specific changes required
- **Priority:** Critical/High/Medium/Low
- **User Requirements Met:** Which user edit goals this addresses

#### 3. Prepare Change Plan Summary

**Changes by Type:** Additions, Updates, Removals, Restructuring counts.
**Priority Distribution:** Critical, High, Medium, Low counts.
**Estimated Effort:** Quick/Moderate/Substantial.

#### 4. Present Change Plan to User

Display the complete change plan with section-by-section breakdown and priority distribution.

Ask:
1. Does this change plan align with what you had in mind?
2. Any sections to add/remove/reprioritize?
3. Any concerns before proceeding with edits?

#### 5. Get User Confirmation

Wait for user review and feedback. If user wants adjustments, revise and re-present.

#### 6. Document Approved Plan

Store approved change plan and proceed to Step E-3.

#### 7. Present MENU OPTIONS (If User Wants Discussion)

**[A] Advanced Elicitation** - Get additional perspectives
**[P] Party Mode** - Discuss with team for more ideas
**[C] Continue to Edit** - Proceed with approved plan

---

## Step E-3: Edit & Update

### STEP GOAL

Apply changes to the PRD following the approved change plan, including content updates, structure improvements, and format conversion if needed.

### MANDATORY SEQUENCE

#### 1. Retrieve Approved Change Plan

Display summary and begin executing.

#### 2. Execute Changes Section-by-Section

For each section in approved plan (in priority order):

**a) Load current section** - Read current PRD section content.
**b) Apply changes per plan** - Additions, updates, removals, restructuring.
**c) Update PRD file** - Apply and verify changes.

Ensure BMAD PRD principles compliance:
- High information density (no filler)
- Measurable requirements
- Clear structure
- Proper markdown formatting

Display progress after each section.

#### 3. Handle Restructuring (If Needed)

If conversion mode is "Full restructuring" or "Both":
- Reorganize PRD to BMAD standard structure
- Ensure proper ## Level 2 headers
- Follow BMAD PRD structure:
  1. Executive Summary
  2. Success Criteria
  3. Product Scope
  4. User Journeys
  5. Domain Requirements (if applicable)
  6. Innovation Analysis (if applicable)
  7. Project-Type Requirements
  8. Functional Requirements
  9. Non-Functional Requirements

#### 4. Update PRD Frontmatter

```yaml
---
workflowType: 'prd'
workflow: 'edit'
classification:
  domain: '{domain}'
  projectType: '{project_type}'
  complexity: '{complexity}'
inputDocuments: [list of input documents]
stepsCompleted: ['step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
lastEdited: '{current_date}'
editHistory:
  - date: '{current_date}'
    changes: '{summary of changes}'
---
```

#### 5. Final Review of Changes

Load complete updated PRD. Verify all approved changes applied correctly, structure is sound, no unintended modifications, frontmatter is accurate.

#### 6. Confirm Completion

Display changes applied summary and present menu.

#### 7. Present MENU OPTIONS

**[V] Run Validation** - Execute full validation workflow
**[S] Summary Only** - End with summary of changes
**[A] Adjust** - Make additional edits
**[X] Exit** - Exit edit workflow

---

## Step E-4: Complete & Validate

### STEP GOAL

Present summary of completed edits and offer next steps including seamless integration with validation workflow.

### MANDATORY SEQUENCE

#### 1. Compile Edit Summary

Changes made (sections added, updated, removed, structure changes), edit details, PRD status.

#### 2. Present Completion Summary

"**PRD Edit Complete**

**Updated PRD:** {prd_file_path}
**Changes Summary:** {bulleted list}
**Edit Mode:** {mode}
**Sections Modified:** {count}
**PRD Format:** {format}

**PRD is now ready for:**
- Downstream workflows (UX Design, Architecture)
- Validation to ensure quality
- Production use"

#### 3. Present MENU OPTIONS

**[V] Run Full Validation** - Execute complete validation workflow to verify PRD quality
**[E] Edit More** - Make additional edits to the PRD
**[S] Summary** - End with detailed summary of changes
**[X] Exit** - Exit edit workflow

**Menu Handling Logic:**
- IF V: Hand off to the validation workflow (Steps V-1 through V-13)
- IF E: Return to Step E-3 for additional edits
- IF S: Display detailed summary and exit
- IF X: Display summary and exit

**Edit workflow seamlessly integrates with validation. User can edit -> validate -> edit again -> validate again in iterative improvement cycle.**
