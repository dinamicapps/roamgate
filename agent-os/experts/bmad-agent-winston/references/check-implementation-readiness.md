---
name: check-implementation-readiness
description: Validate PRD, UX, Architecture and Epics specs are complete and aligned before implementation starts.
menu-code: IR
---

# Implementation Readiness Workflow

**Goal:** Validate that PRD, Architecture, Epics and Stories are complete and aligned before Phase 4 implementation starts, with a focus on ensuring epics and stories are logical and have accounted for all requirements and planning.

**Your Role:** You are an expert Product Manager and Scrum Master, renowned and respected in the field of requirements traceability and spotting gaps in planning. Your success is measured in spotting the failures others have made in planning or preparation of epics and stories to produce the users product vision.

## WORKFLOW ARCHITECTURE

### Core Principles

- **Sequential Enforcement**: Steps must be completed in order, no skipping or optimization allowed
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, proceed to the next step

### Critical Rules (NO EXCEPTIONS)

- NEVER load multiple steps simultaneously
- ALWAYS read entire step before execution
- NEVER skip steps or optimize the sequence
- ALWAYS update frontmatter of output files when writing the final output for a specific step
- ALWAYS follow the exact instructions in the step
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

### Paths

- `outputFile` = `{planning_artifacts}/implementation-readiness-report-{{date}}.md`

---

# Step 1: Document Discovery

## Step Goal

To discover, inventory, and organize all project documents, identifying duplicates and determining which versions to use for the assessment.

## Mandatory Execution Rules

- Focus ONLY on finding and organizing files
- Don't read or analyze file contents yet
- Identify duplicate documents clearly
- Get user confirmation on file selections

## Document Discovery Process

### 1. Initialize Document Discovery

"Beginning **Document Discovery** to inventory all project files.

I will:

1. Search for all required documents (PRD, Architecture, Epics, UX)
2. Group sharded documents together
3. Identify any duplicates (whole + sharded versions)
4. Present findings for your confirmation"

### 2. Document Search Patterns

Search for each document type using these patterns:

#### A. PRD Documents
- Whole: `{planning_artifacts}/*prd*.md`
- Sharded: `{planning_artifacts}/*prd*/index.md` and related files

#### B. Architecture Documents
- Whole: `{planning_artifacts}/*architecture*.md`
- Sharded: `{planning_artifacts}/*architecture*/index.md` and related files

#### C. Epics & Stories Documents
- Whole: `{planning_artifacts}/*epic*.md`
- Sharded: `{planning_artifacts}/*epic*/index.md` and related files

#### D. UX Design Documents
- Whole: `{planning_artifacts}/*ux*.md`
- Sharded: `{planning_artifacts}/*ux*/index.md` and related files

### 3. Organize Findings

For each document type found:

```
## [Document Type] Files Found

**Whole Documents:**
- [filename.md] ([size], [modified date])

**Sharded Documents:**
- Folder: [foldername]/
  - index.md
  - [other files in folder]
```

### 4. Identify Critical Issues

#### Duplicates (CRITICAL)

If both whole and sharded versions exist:

```
CRITICAL ISSUE: Duplicate document formats found
- PRD exists as both whole.md AND prd/ folder
- YOU MUST choose which version to use
- Remove or rename the other version to avoid confusion
```

#### Missing Documents (WARNING)

If required documents not found:

```
WARNING: Required document not found
- Architecture document not found
- Will impact assessment completeness
```

### 5. Add Initial Report Section

Initialize the output file with the report template (see Template section at end of this file).

### 6. Present Findings and Get Confirmation

Display findings and ask:
"**Document Discovery Complete**

[Show organized file list]

**Issues Found:**
- [List any duplicates requiring resolution]
- [List any missing documents]

**Required Actions:**
- If duplicates exist: Please remove/rename one version
- Confirm which documents to use for assessment

**Ready to proceed?** [C] Continue after resolving issues"

### 7. Present Menu Options

Display: **Select an Option:** [C] Continue to File Validation

#### Menu Handling Logic:
- IF C: Save document inventory to output file, update frontmatter with completed step and files being included, and then proceed to Step 2
- IF Any other comments or queries: help user respond then redisplay menu

ONLY WHEN C is selected and document inventory is saved will you proceed to Step 2.

---

# Step 2: PRD Analysis

## Step Goal

To fully read and analyze the PRD document (whole or sharded) to extract all Functional Requirements (FRs) and Non-Functional Requirements (NFRs) for validation against epics coverage.

## Mandatory Execution Rules

- Focus ONLY on reading and extracting from PRD
- Don't validate files (done in step 1)
- Read PRD completely - whole or all sharded files
- Extract every FR and NFR with numbering

## PRD Analysis Process

### 1. Initialize PRD Analysis

"Beginning **PRD Analysis** to extract all requirements.

I will:

1. Load the PRD document (whole or sharded)
2. Read it completely and thoroughly
3. Extract ALL Functional Requirements (FRs)
4. Extract ALL Non-Functional Requirements (NFRs)
5. Document findings for coverage validation"

### 2. Load and Read PRD

From the document inventory in step 1:

- If whole PRD file exists: Load and read it completely
- If sharded PRD exists: Load and read ALL files in the PRD folder
- Ensure complete coverage - no files skipped

### 3. Extract Functional Requirements (FRs)

Search for and extract:

- Numbered FRs (FR1, FR2, FR3, etc.)
- Requirements labeled "Functional Requirement"
- User stories or use cases that represent functional needs
- Business rules that must be implemented

Format findings as:

```
## Functional Requirements Extracted

FR1: [Complete requirement text]
FR2: [Complete requirement text]
FR3: [Complete requirement text]
...
Total FRs: [count]
```

### 4. Extract Non-Functional Requirements (NFRs)

Search for and extract:

- Performance requirements (response times, throughput)
- Security requirements (authentication, encryption, etc.)
- Usability requirements (accessibility, ease of use)
- Reliability requirements (uptime, error rates)
- Scalability requirements (concurrent users, data growth)
- Compliance requirements (standards, regulations)

Format findings as:

```
## Non-Functional Requirements Extracted

NFR1: [Performance requirement]
NFR2: [Security requirement]
NFR3: [Usability requirement]
...
Total NFRs: [count]
```

### 5. Document Additional Requirements

Look for:

- Constraints or assumptions
- Technical requirements not labeled as FR/NFR
- Business constraints
- Integration requirements

### 6. Add to Assessment Report

Append to output file:

```markdown
## PRD Analysis

### Functional Requirements

[Complete FR list from section 3]

### Non-Functional Requirements

[Complete NFR list from section 4]

### Additional Requirements

[Any other requirements or constraints found]

### PRD Completeness Assessment

[Initial assessment of PRD completeness and clarity]
```

### 7. Auto-Proceed to Next Step

After PRD analysis complete, immediately proceed to Step 3.

---

# Step 3: Epic Coverage Validation

## Step Goal

To validate that all Functional Requirements from the PRD are captured in the epics and stories document, identifying any gaps in coverage.

## Mandatory Execution Rules

- Focus ONLY on FR coverage validation
- Don't analyze story quality (that's later)
- Compare PRD FRs against epic coverage list
- Document every missing FR

## Epic Coverage Validation Process

### 1. Initialize Coverage Validation

"Beginning **Epic Coverage Validation**.

I will:

1. Load the epics and stories document
2. Extract FR coverage information
3. Compare against PRD FRs from previous step
4. Identify any FRs not covered in epics"

### 2. Load Epics Document

From the document inventory in step 1:

- Load the epics and stories document (whole or sharded)
- Read it completely to find FR coverage information
- Look for sections like "FR Coverage Map" or similar

### 3. Extract Epic FR Coverage

From the epics document:

- Find FR coverage mapping or list
- Extract which FR numbers are claimed to be covered
- Document which epics cover which FRs

Format as:

```
## Epic FR Coverage Extracted

FR1: Covered in Epic X
FR2: Covered in Epic Y
FR3: Covered in Epic Z
...
Total FRs in epics: [count]
```

### 4. Compare Coverage Against PRD

Using the PRD FR list from step 2:

- Check each PRD FR against epic coverage
- Identify FRs NOT covered in epics
- Note any FRs in epics but NOT in PRD

Create coverage matrix:

```
## FR Coverage Analysis

| FR Number | PRD Requirement | Epic Coverage  | Status    |
| --------- | --------------- | -------------- | --------- |
| FR1       | [PRD text]      | Epic X Story Y | Covered   |
| FR2       | [PRD text]      | **NOT FOUND**  | MISSING   |
| FR3       | [PRD text]      | Epic Z Story A | Covered   |
```

### 5. Document Missing Coverage

List all FRs not covered:

```
## Missing FR Coverage

### Critical Missing FRs

FR#: [Full requirement text from PRD]
- Impact: [Why this is critical]
- Recommendation: [Which epic should include this]

### High Priority Missing FRs

[List any other uncovered FRs]
```

### 6. Add to Assessment Report

Append to output file:

```markdown
## Epic Coverage Validation

### Coverage Matrix

[Complete coverage matrix from section 4]

### Missing Requirements

[List of uncovered FRs from section 5]

### Coverage Statistics

- Total PRD FRs: [count]
- FRs covered in epics: [count]
- Coverage percentage: [percentage]
```

### 7. Auto-Proceed to Next Step

After coverage validation complete, immediately proceed to Step 4.

---

# Step 4: UX Alignment

## Step Goal

To check if UX documentation exists and validate that it aligns with PRD requirements and Architecture decisions, ensuring architecture accounts for both PRD and UX needs.

## Mandatory Execution Rules

- Check for UX document existence first
- Don't assume UX is not needed
- Validate alignment between UX, PRD, and Architecture
- Add findings to the output report

## UX Alignment Process

### 1. Initialize UX Validation

"Beginning **UX Alignment** validation.

I will:

1. Check if UX documentation exists
2. If UX exists: validate alignment with PRD and Architecture
3. If no UX: determine if UX is implied and document warning"

### 2. Search for UX Documentation

Search patterns:

- `{planning_artifacts}/*ux*.md` (whole document)
- `{planning_artifacts}/*ux*/index.md` (sharded)
- Look for UI-related terms in other documents

### 3. If UX Document Exists

#### A. UX to PRD Alignment

- Check UX requirements reflected in PRD
- Verify user journeys in UX match PRD use cases
- Identify UX requirements not in PRD

#### B. UX to Architecture Alignment

- Verify architecture supports UX requirements
- Check performance needs (responsiveness, load times)
- Identify UI components not supported by architecture

### 4. If No UX Document

Assess if UX/UI is implied:

- Does PRD mention user interface?
- Are there web/mobile components implied?
- Is this a user-facing application?

If UX implied but missing: Add warning to report

### 5. Add Findings to Report

Append to output file:

```markdown
## UX Alignment Assessment

### UX Document Status

[Found/Not Found]

### Alignment Issues

[List any misalignments between UX, PRD, and Architecture]

### Warnings

[Any warnings about missing UX or architectural gaps]
```

### 6. Auto-Proceed to Next Step

After UX assessment complete, immediately proceed to Step 5.

---

# Step 5: Epic Quality Review

## Step Goal

To validate epics and stories against best practices, focusing on user value, independence, dependencies, and implementation readiness.

## Mandatory Execution Rules

- Apply epic/story standards rigorously
- Don't accept "technical milestones" as epics
- Challenge every dependency on future work
- Verify proper story sizing and structure

## Role Reinforcement

- You are an EPIC QUALITY ENFORCER
- You know what good epics look like - challenge anything deviating
- Technical epics are wrong - find them
- Forward dependencies are forbidden - catch them
- Stories must be independently completable

## Epic Quality Review Process

### 1. Initialize Best Practices Validation

"Beginning **Epic Quality Review** against best practices standards.

I will rigorously validate:

- Epics deliver user value (not technical milestones)
- Epic independence (Epic 2 doesn't need Epic 3)
- Story dependencies (no forward references)
- Proper story sizing and completeness

Any deviation from best practices will be flagged as a defect."

### 2. Epic Structure Validation

#### A. User Value Focus Check

For each epic:

- **Epic Title:** Is it user-centric (what user can do)?
- **Epic Goal:** Does it describe user outcome?
- **Value Proposition:** Can users benefit from this epic alone?

**Red flags (violations):**
- "Setup Database" or "Create Models" - no user value
- "API Development" - technical milestone
- "Infrastructure Setup" - not user-facing
- "Authentication System" - borderline (is it user value?)

#### B. Epic Independence Validation

Test epic independence:

- **Epic 1:** Must stand alone completely
- **Epic 2:** Can function using only Epic 1 output
- **Epic 3:** Can function using Epic 1 & 2 outputs
- **Rule:** Epic N cannot require Epic N+1 to work

**Document failures:**
- "Epic 2 requires Epic 3 features to function"
- Stories in Epic 2 referencing Epic 3 components
- Circular dependencies between epics

### 3. Story Quality Assessment

#### A. Story Sizing Validation

Check each story:

- **Clear User Value:** Does the story deliver something meaningful?
- **Independent:** Can it be completed without future stories?

**Common violations:**
- "Setup all models" - not a USER story
- "Create login UI (depends on Story 1.3)" - forward dependency

#### B. Acceptance Criteria Review

For each story's ACs:

- **Given/When/Then Format:** Proper BDD structure?
- **Testable:** Each AC can be verified independently?
- **Complete:** Covers all scenarios including errors?
- **Specific:** Clear expected outcomes?

**Issues to find:**
- Vague criteria like "user can login"
- Missing error conditions
- Incomplete happy path
- Non-measurable outcomes

### 4. Dependency Analysis

#### A. Within-Epic Dependencies

Map story dependencies within each epic:

- Story 1.1 must be completable alone
- Story 1.2 can use Story 1.1 output
- Story 1.3 can use Story 1.1 & 1.2 outputs

**Critical violations:**
- "This story depends on Story 1.4"
- "Wait for future story to work"
- Stories referencing features not yet implemented

#### B. Database/Entity Creation Timing

Validate database creation approach:

- **Wrong:** Epic 1 Story 1 creates all tables upfront
- **Right:** Each story creates tables it needs
- **Check:** Are tables created only when first needed?

### 5. Special Implementation Checks

#### A. Starter Template Requirement

Check if Architecture specifies starter template:

- If YES: Epic 1 Story 1 must be "Set up initial project from starter template"
- Verify story includes cloning, dependencies, initial configuration

#### B. Greenfield vs Brownfield Indicators

Greenfield projects should have:
- Initial project setup story
- Development environment configuration
- CI/CD pipeline setup early

Brownfield projects should have:
- Integration points with existing systems
- Migration or compatibility stories

### 6. Best Practices Compliance Checklist

For each epic, verify:

- [ ] Epic delivers user value
- [ ] Epic can function independently
- [ ] Stories appropriately sized
- [ ] No forward dependencies
- [ ] Database tables created when needed
- [ ] Clear acceptance criteria
- [ ] Traceability to FRs maintained

### 7. Quality Assessment Documentation

Document all findings by severity:

#### Critical Violations
- Technical epics with no user value
- Forward dependencies breaking independence
- Epic-sized stories that cannot be completed

#### Major Issues
- Vague acceptance criteria
- Stories requiring future stories
- Database creation violations

#### Minor Concerns
- Formatting inconsistencies
- Minor structure deviations
- Documentation gaps

### 8. Autonomous Review Execution

This review runs autonomously to maintain standards:

- Apply best practices without compromise
- Document every violation with specific examples
- Provide clear remediation guidance
- Prepare recommendations for each issue

## Review Completion

After completing epic quality review:
- Update output file with all quality findings
- Document specific best practices violations
- Provide actionable recommendations
- Proceed to Step 6

---

# Step 6: Final Assessment

## Step Goal

To provide a comprehensive summary of all findings and give the report a final polish, ensuring clear recommendations and overall readiness status.

## Mandatory Execution Rules

- Compile and summarize all findings
- Don't soften the message - be direct
- Provide specific examples for problems
- Add final section to the report

## Final Assessment Process

### 1. Initialize Final Assessment

"Completing **Final Assessment**.

I will now:

1. Review all findings from previous steps
2. Provide a comprehensive summary
3. Add specific recommendations
4. Determine overall readiness status"

### 2. Review Previous Findings

Check the output file for sections added by previous steps:

- File and FR Validation findings
- UX Alignment issues
- Epic Quality violations

### 3. Add Final Assessment Section

Append to output file:

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

### 4. Complete the Report

- Ensure all findings are clearly documented
- Verify recommendations are actionable
- Add date and assessor information
- Save the final report

### 5. Present Completion

"**Implementation Readiness Assessment Complete**

Report generated: {outputFile}

The assessment found [number] issues requiring attention. Review the detailed report for specific findings and recommendations."

## Workflow Complete

The implementation readiness workflow is now complete. The report contains all findings and recommendations for the user to consider.

Implementation Readiness complete. Invoke the `bmad-help` skill.

---

# Report Template

```markdown
# Implementation Readiness Assessment Report

**Date:** {{date}}
**Project:** {{project_name}}
```
