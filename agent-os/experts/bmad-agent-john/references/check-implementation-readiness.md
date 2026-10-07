---
name: check-implementation-readiness
description: Validate PRD, UX, Architecture and Epics specs are complete and aligned before implementation starts
menu-code: check-readiness
---

# Implementation Readiness

**Goal:** Validate that PRD, Architecture, Epics and Stories are complete and aligned before Phase 4 implementation starts, with a focus on ensuring epics and stories are logical and have accounted for all requirements and planning.

**Your Role:** You are an expert Product Manager and Scrum Master, renowned and respected in the field of requirements traceability and spotting gaps in planning. Your success is measured in spotting the failures others have made in planning or preparation of epics and stories to produce the users product vision.

## WORKFLOW ARCHITECTURE

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

## Readiness Report Template

```markdown
# Implementation Readiness Assessment Report

**Date:** {{date}}
**Project:** {{project_name}}
```

---

## Step 1: Document Discovery

### STEP GOAL

Discover, inventory, and organize all project documents, identifying duplicates and determining which versions to use for the assessment.

### DOCUMENT DISCOVERY PROCESS

#### 1. Initialize Document Discovery

"Beginning **Document Discovery** to inventory all project files.

I will:
1. Search for all required documents (PRD, Architecture, Epics, UX)
2. Group sharded documents together
3. Identify any duplicates (whole + sharded versions)
4. Present findings for your confirmation"

#### 2. Document Search Patterns

**A. PRD Documents**
- Whole: `{planning_artifacts}/*prd*.md`
- Sharded: `{planning_artifacts}/*prd*/index.md` and related files

**B. Architecture Documents**
- Whole: `{planning_artifacts}/*architecture*.md`
- Sharded: `{planning_artifacts}/*architecture*/index.md` and related files

**C. Epics & Stories Documents**
- Whole: `{planning_artifacts}/*epic*.md`
- Sharded: `{planning_artifacts}/*epic*/index.md` and related files

**D. UX Design Documents**
- Whole: `{planning_artifacts}/*ux*.md`
- Sharded: `{planning_artifacts}/*ux*/index.md` and related files

#### 3. Organize Findings

For each document type found, list whole documents and sharded documents with sizes and dates.

#### 4. Identify Critical Issues

**Duplicates (CRITICAL):** If both whole and sharded versions exist, user MUST choose which to use.

**Missing Documents (WARNING):** If required documents not found, note the impact on assessment completeness.

#### 5. Initialize Report

Create {outputFile} from the Readiness Report Template above.

#### 6. Present Findings and Get Confirmation

Display organized file list, issues found, and required actions.

#### 7. Present MENU OPTIONS

Display: **Select an Option:** [C] Continue to PRD Analysis

When C selected: Save document inventory to report, update frontmatter, proceed to Step 2.

---

## Step 2: PRD Analysis

### STEP GOAL

Fully read and analyze the PRD document to extract all FRs and NFRs for validation against epics coverage.

### PRD ANALYSIS PROCESS

#### 1. Initialize PRD Analysis

"Beginning **PRD Analysis** to extract all requirements."

#### 2. Load and Read PRD

From the document inventory in step 1, load and read the complete PRD (whole or all sharded files).

#### 3. Extract Functional Requirements (FRs)

Search for and extract all FRs:
- Numbered FRs (FR1, FR2, FR3, etc.)
- Requirements labeled "Functional Requirement"
- User stories or use cases that represent functional needs
- Business rules that must be implemented

#### 4. Extract Non-Functional Requirements (NFRs)

Search for and extract:
- Performance requirements (response times, throughput)
- Security requirements (authentication, encryption)
- Usability requirements (accessibility, ease of use)
- Reliability requirements (uptime, error rates)
- Scalability requirements (concurrent users, data growth)
- Compliance requirements (standards, regulations)

#### 5. Document Additional Requirements

Look for constraints, assumptions, technical requirements not labeled as FR/NFR, business constraints, integration requirements.

#### 6. Add to Assessment Report

Append: Functional Requirements list, Non-Functional Requirements list, Additional Requirements, PRD Completeness Assessment.

#### 7. Auto-Proceed to Next Step

PRD analysis complete. Proceed to Step 3.

---

## Step 3: Epic Coverage Validation

### STEP GOAL

Validate that all Functional Requirements from the PRD are captured in the epics and stories document.

### EPIC COVERAGE VALIDATION PROCESS

#### 1. Initialize Coverage Validation

"Beginning **Epic Coverage Validation**."

#### 2. Load Epics Document

Load the epics and stories document completely. Look for FR coverage mapping.

#### 3. Extract Epic FR Coverage

Document which FRs are claimed to be covered and by which epics.

#### 4. Compare Coverage Against PRD

Check each PRD FR against epic coverage. Identify FRs NOT covered in epics. Note any FRs in epics but NOT in PRD.

Create coverage matrix:

| FR Number | PRD Requirement | Epic Coverage | Status |
|-----------|-----------------|---------------|--------|
| FR1 | [PRD text] | Epic X Story Y | Covered |
| FR2 | [PRD text] | **NOT FOUND** | MISSING |

#### 5. Document Missing Coverage

List all uncovered FRs with impact assessment and recommendations.

#### 6. Add to Assessment Report

Append coverage matrix, missing requirements, and coverage statistics (total FRs, FRs covered, coverage percentage).

#### 7. Auto-Proceed to Next Step

Proceed to Step 4.

---

## Step 4: UX Alignment

### STEP GOAL

Check if UX documentation exists and validate alignment with PRD requirements and Architecture decisions.

### UX ALIGNMENT PROCESS

#### 1. Initialize UX Validation

"Beginning **UX Alignment** validation."

#### 2. Search for UX Documentation

Search `{planning_artifacts}` for UX documents.

#### 3. If UX Document Exists

**A. UX <-> PRD Alignment:**
- Check UX requirements reflected in PRD
- Verify user journeys in UX match PRD use cases
- Identify UX requirements not in PRD

**B. UX <-> Architecture Alignment:**
- Verify architecture supports UX requirements
- Check performance needs (responsiveness, load times)
- Identify UI components not supported by architecture

#### 4. If No UX Document

Assess if UX/UI is implied by the PRD (user interface, web/mobile components, user-facing application). If UX implied but missing, add warning to report.

#### 5. Add Findings to Report

Append UX document status, alignment issues, and warnings.

#### 6. Auto-Proceed to Next Step

Proceed to Step 5.

---

## Step 5: Epic Quality Review

### STEP GOAL

Validate epics and stories against best practices, focusing on user value, independence, dependencies, and implementation readiness.

### EPIC QUALITY REVIEW PROCESS

#### 1. Initialize Best Practices Validation

"Beginning **Epic Quality Review** against create-epics-and-stories standards."

#### 2. Epic Structure Validation

**A. User Value Focus Check**

For each epic:
- **Epic Title:** Is it user-centric (what user can do)?
- **Epic Goal:** Does it describe user outcome?
- **Value Proposition:** Can users benefit from this epic alone?

**Red flags (violations):**
- "Setup Database" or "Create Models" - no user value
- "API Development" - technical milestone
- "Infrastructure Setup" - not user-facing

**B. Epic Independence Validation**

- Epic 1: Must stand alone completely
- Epic 2: Can function using only Epic 1 output
- Epic 3: Can function using Epic 1 & 2 outputs
- Rule: Epic N cannot require Epic N+1 to work

Document failures: circular dependencies, references to future epic components.

#### 3. Story Quality Assessment

**A. Story Sizing Validation**
- Clear user value? Independent? Completable?

**B. Acceptance Criteria Review**
- Given/When/Then format? Testable? Complete (including errors)? Specific?

**Issues to find:** Vague criteria, missing error conditions, incomplete happy path, non-measurable outcomes.

#### 4. Dependency Analysis

**A. Within-Epic Dependencies**
- Story 1.1 must be completable alone
- Story 1.2 can use Story 1.1 output
- Critical violations: "This story depends on Story 1.4", stories referencing features not yet implemented

**B. Database/Entity Creation Timing**
- Wrong: Epic 1 Story 1 creates all tables upfront
- Right: Each story creates tables it needs

#### 5. Special Implementation Checks

**A. Starter Template Requirement**
If Architecture specifies starter template: Epic 1 Story 1 must be project setup.

**B. Greenfield vs Brownfield Indicators**
Greenfield: initial setup, dev environment, CI/CD.
Brownfield: integration points, migration, compatibility.

#### 6. Best Practices Compliance Checklist

For each epic, verify:
- [ ] Epic delivers user value
- [ ] Epic can function independently
- [ ] Stories appropriately sized
- [ ] No forward dependencies
- [ ] Database tables created when needed
- [ ] Clear acceptance criteria
- [ ] Traceability to FRs maintained

#### 7. Quality Assessment Documentation

Document all findings by severity:

**Critical Violations:** Technical epics with no user value, forward dependencies breaking independence, epic-sized stories.
**Major Issues:** Vague acceptance criteria, stories requiring future stories, database creation violations.
**Minor Concerns:** Formatting inconsistencies, minor structure deviations, documentation gaps.

#### 8. Auto-Proceed

Update report with all quality findings and proceed to Step 6.

---

## Step 6: Final Assessment

### STEP GOAL

Provide comprehensive summary of all findings and determine overall readiness status.

### FINAL ASSESSMENT PROCESS

#### 1. Initialize Final Assessment

"Completing **Final Assessment**."

#### 2. Review Previous Findings

Check the report for all findings from previous steps.

#### 3. Add Final Assessment Section

Append to report:

```markdown
## Summary and Recommendations

### Overall Readiness Status

[READY/NEEDS WORK/NOT READY]

### Critical Issues Requiring Immediate Action

[List most critical issues that must be addressed]

### Recommended Next Steps

1. [Specific action item 1]
2. [Specific action item 2]
3. [Specific action item 3]

### Final Note

This assessment identified [X] issues across [Y] categories. Address the critical issues before proceeding to implementation. These findings can be used to improve the artifacts or you may choose to proceed as-is.
```

#### 4. Complete the Report

Ensure all findings are documented, recommendations are actionable, add date. Save the final report.

#### 5. Present Completion

"**Implementation Readiness Assessment Complete**

Report generated: {outputFile}

The assessment found [number] issues requiring attention. Review the detailed report for specific findings and recommendations."

Offer to answer any questions about the findings.
