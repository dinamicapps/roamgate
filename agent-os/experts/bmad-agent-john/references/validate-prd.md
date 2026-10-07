---
name: validate-prd
description: Validate a PRD against BMAD standards through a comprehensive 13-step review workflow
menu-code: validate-prd
---

# PRD Validate Workflow

**Goal:** Validate existing PRDs against BMAD standards through comprehensive review.

**Your Role:** Validation Architect and Quality Assurance Specialist.

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

2. Route to Validate Workflow

"**Validate Mode: Validating an existing PRD against BMAD standards.**"

Begin with Step V-1 below.

---

## Reference Data: PRD Purpose and Standards

### What is a BMAD PRD?

A dual-audience document serving:
1. **Human Product Managers and builders** - Vision, strategy, stakeholder communication
2. **LLM Downstream Consumption** - UX Design -> Architecture -> Epics -> Development AI Agents

### Core Philosophy: Information Density

Every sentence must carry information weight. LLMs consume precise, dense content efficiently.

**Anti-Patterns (Eliminate These):**
- "The system will allow users to..." -> "Users can..."
- "It is important to note that..." -> State the fact directly
- "In order to..." -> "To..."
- Conversational filler and padding -> Direct, concise statements

### The Traceability Chain

```
Vision -> Success Criteria -> User Journeys -> Functional Requirements -> (future: User Stories)
```

### SMART Quality Criteria for FRs

**Specific:** Clear, precisely defined capability
**Measurable:** Quantifiable with test criteria
**Attainable:** Realistic within constraints
**Relevant:** Aligns with business objectives
**Traceable:** Links to source (executive summary or user journey)

### FR Anti-Patterns

- Subjective adjectives: "easy to use", "intuitive", "user-friendly", "fast", "responsive"
- Implementation leakage: Technology names, specific libraries, implementation details
- Vague quantifiers: "multiple users", "several options", "various formats"
- Missing test criteria

### NFR Standards

NFRs Must Be Measurable. Template: "The system shall [metric] [condition] [measurement method]"

### Required PRD Sections
1. Executive Summary
2. Success Criteria
3. Product Scope
4. User Journeys
5. Domain Requirements (if applicable)
6. Innovation Analysis (if applicable)
7. Project-Type Requirements
8. Functional Requirements
9. Non-Functional Requirements

---

## Reference Data: Project Types

```csv
project_type,detection_signals,key_questions,required_sections,skip_sections,web_search_triggers,innovation_signals
api_backend,"API,REST,GraphQL,backend,service,endpoints","Endpoints needed?;Authentication method?;Data formats?;Rate limits?;Versioning?;SDK needed?","endpoint_specs;auth_model;data_schemas;error_codes;rate_limits;api_docs","ux_ui;visual_design;user_journeys","framework best practices;OpenAPI standards","API composition;New protocol"
mobile_app,"iOS,Android,app,mobile,iPhone,iPad","Native or cross-platform?;Offline needed?;Push notifications?;Device features?;Store compliance?","platform_reqs;device_permissions;offline_mode;push_strategy;store_compliance","desktop_features;cli_commands","app store guidelines;platform requirements","Gesture innovation;AR/VR features"
saas_b2b,"SaaS,B2B,platform,dashboard,teams,enterprise","Multi-tenant?;Permission model?;Subscription tiers?;Integrations?;Compliance?","tenant_model;rbac_matrix;subscription_tiers;integration_list;compliance_reqs","cli_interface;mobile_first","compliance requirements;integration guides","Workflow automation;AI agents"
developer_tool,"SDK,library,package,npm,pip,framework","Language support?;Package managers?;IDE integration?;Documentation?;Examples?","language_matrix;installation_methods;api_surface;code_examples;migration_guide","visual_design;store_compliance","package manager best practices;API design patterns","New paradigm;DSL creation"
cli_tool,"CLI,command,terminal,bash,script","Interactive or scriptable?;Output formats?;Config method?;Shell completion?","command_structure;output_formats;config_schema;scripting_support","visual_design;ux_principles;touch_interactions","CLI design patterns;shell integration","Natural language CLI;AI commands"
web_app,"website,webapp,browser,SPA,PWA","SPA or MPA?;Browser support?;SEO needed?;Real-time?;Accessibility?","browser_matrix;responsive_design;performance_targets;seo_strategy;accessibility_level","native_features;cli_commands","web standards;WCAG guidelines","New interaction;WebAssembly use"
desktop_app,"desktop,Windows,Mac,Linux,native","Cross-platform?;Auto-update?;System integration?;Offline?","platform_support;system_integration;update_strategy;offline_capabilities","web_seo;mobile_features","desktop guidelines;platform requirements","Desktop AI;System automation"
iot_embedded,"IoT,embedded,device,sensor,hardware","Hardware specs?;Connectivity?;Power constraints?;Security?;OTA updates?","hardware_reqs;connectivity_protocol;power_profile;security_model;update_mechanism","visual_ui;browser_support","IoT standards;protocol specs","Edge AI;New sensors"
blockchain_web3,"blockchain,crypto,DeFi,NFT,smart contract","Chain selection?;Wallet integration?;Gas optimization?;Security audit?","chain_specs;wallet_support;smart_contracts;security_audit;gas_optimization","traditional_auth;centralized_db","blockchain standards;security patterns","Novel tokenomics;DAO structure"
```

## Reference Data: Domain Complexity

```csv
domain,signals,complexity,key_concerns,required_knowledge,suggested_workflow,web_searches,special_sections
healthcare,"medical,diagnostic,clinical,FDA,patient,treatment,HIPAA,therapy,pharma,drug",high,"FDA approval;Clinical validation;HIPAA compliance;Patient safety;Medical device classification;Liability","Regulatory pathways;Clinical trial design;Medical standards;Data privacy;Integration requirements","domain-research","FDA software medical device guidance;HIPAA compliance software requirements;Medical software standards;Clinical validation software","clinical_requirements;regulatory_pathway;validation_methodology;safety_measures"
fintech,"payment,banking,trading,investment,crypto,wallet,transaction,KYC,AML,funds,fintech",high,"Regional compliance;Security standards;Audit requirements;Fraud prevention;Data protection","KYC/AML requirements;PCI DSS;Open banking;Regional laws;Crypto regulations","domain-research","fintech regulations;payment processing compliance;open banking API standards;cryptocurrency regulations","compliance_matrix;security_architecture;audit_requirements;fraud_prevention"
govtech,"government,federal,civic,public sector,citizen,municipal,voting",high,"Procurement rules;Security clearance;Accessibility (508);FedRAMP;Privacy;Transparency","Government procurement;Security frameworks;Accessibility standards;Privacy laws;Open data requirements","domain-research","government software procurement;FedRAMP compliance requirements;section 508 accessibility;government security standards","procurement_compliance;security_clearance;accessibility_standards;transparency_requirements"
edtech,"education,learning,student,teacher,curriculum,assessment,K-12,university,LMS",medium,"Student privacy (COPPA/FERPA);Accessibility;Content moderation;Age verification;Curriculum standards","Educational privacy laws;Learning standards;Accessibility requirements;Content guidelines;Assessment validity","domain-research","educational software privacy;COPPA FERPA compliance;WCAG education requirements;learning management standards","privacy_compliance;content_guidelines;accessibility_features;curriculum_alignment"
general,"",low,"Standard requirements;Basic security;User experience;Performance","General software practices","continue","software development best practices","standard_requirements"
```

---

## Step V-1: Document Discovery & Confirmation

### STEP GOAL

Handle fresh context validation by confirming PRD path, discovering and loading input documents from frontmatter, and initializing the validation report.

### MANDATORY SEQUENCE

#### 1. Load PRD Purpose and Standards

Load the PRD Purpose and Standards section above. This defines what makes a great BMAD PRD and will guide all validation checks.

#### 2. Discover PRD to Validate

**If PRD path provided as invocation parameter:** Use provided path.

**If no PRD path provided, auto-discover:**
- Search `{planning_artifacts}` for files matching `*prd*.md`
- Also check for sharded PRDs: `{planning_artifacts}/*prd*/*.md`

If exactly ONE PRD found, use it automatically. If MULTIPLE found, list them for user selection. If NONE found, ask user for path.

#### 3. Validate PRD Exists and Load

Check if PRD file exists. If found, load complete file including frontmatter.

#### 4. Extract Frontmatter and Input Documents

From the loaded PRD frontmatter, extract `inputDocuments: []` array (if present) and any other relevant metadata.

#### 5. Load Input Documents

For each document listed in `inputDocuments`, attempt to load and track successfully loaded documents.

#### 6. Ask About Additional Reference Documents

Ask user if there are any additional reference documents to include.

#### 7. Initialize Validation Report

Create validation report with frontmatter:
```yaml
---
validationTarget: '{prd_path}'
validationDate: '{current_date}'
inputDocuments: [list of all loaded documents]
validationStepsCompleted: []
validationStatus: IN_PROGRESS
---
```

#### 8. Present Discovery Summary

Report what was found and loaded.

#### 9. Present MENU OPTIONS

Display: **Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Format Detection

---

## Step V-2: Format Detection & Structure Analysis

### STEP GOAL

Detect if PRD follows BMAD format and route appropriately - classify as BMAD Standard / BMAD Variant / Non-Standard, with optional parity check for non-standard formats.

### MANDATORY SEQUENCE

#### 1. Extract PRD Structure

Load the complete PRD file and extract all Level 2 (##) headers and PRD frontmatter.

#### 2. Check for BMAD PRD Core Sections

Check for these 6 core sections:
1. **Executive Summary** (or variations: Overview, Introduction)
2. **Success Criteria** (or: Goals, Objectives)
3. **Product Scope** (or: Scope, In Scope, Out of Scope)
4. **User Journeys** (or: User Stories, User Flows)
5. **Functional Requirements** (or: Features, Capabilities)
6. **Non-Functional Requirements** (or: NFRs, Quality Attributes)

#### 3. Classify PRD Format

- **BMAD Standard:** 5-6 core sections present
- **BMAD Variant:** 3-4 core sections present
- **Non-Standard:** Fewer than 3 core sections present

#### 4. Report Format Findings to Validation Report

Append format classification and section analysis to the report.

#### 5. Route Based on Format Classification

**IF BMAD Standard or BMAD Variant:** Auto-proceed to Step V-3.

**IF Non-Standard:** Present menu:
- [A] Parity Check - Analyze gaps and estimate effort to reach BMAD PRD parity
- [B] Validate As-Is - Proceed with validation using current structure
- [C] Exit - Exit validation and review format findings

If A selected, proceed to Step V-2B. If B selected, proceed to Step V-3.

---

## Step V-2B: Document Parity Check

### STEP GOAL

Analyze non-standard PRD and identify gaps to achieve BMAD PRD parity.

### MANDATORY SEQUENCE

#### 1. Analyze Each BMAD PRD Section

For each of the 6 BMAD PRD core sections, analyze what exists, what's missing, and the effort to complete (Minimal/Moderate/Significant).

#### 2. Estimate Effort to Reach Parity

Overall classification: Quick / Moderate / Substantial effort.

#### 3. Report Parity Analysis to Validation Report

Append detailed parity analysis.

#### 4. Present Options

- [C] Continue Validation - Proceed with validation using current structure
- [E] Exit & Review - Exit validation and review parity report
- [S] Save & Exit - Save parity report and exit

---

## Step V-3: Information Density Validation

### STEP GOAL

Validate PRD meets BMAD information density standards. This step runs autonomously - no user input needed.

### MANDATORY SEQUENCE

#### 1. Scan for Anti-Patterns

**Conversational filler patterns:**
- "The system will allow users to..."
- "It is important to note that..."
- "In order to", "For the purpose of", "With regard to"

**Wordy phrases:**
- "Due to the fact that" (use "because")
- "In the event of" (use "if")
- "At this point in time" (use "now")
- "In a manner that" (use "how")

**Redundant phrases:**
- "Future plans" (just "plans")
- "Past history" (just "history")
- "Absolutely essential" (just "essential")

Count occurrences and note line numbers.

#### 2. Classify Severity

- **Critical:** Total > 10 violations
- **Warning:** Total 5-10 violations
- **Pass:** Total < 5 violations

#### 3. Report to Validation Report

Append density findings with counts, examples, severity, and recommendation.

#### 4. Auto-Proceed

Display severity and proceed to Step V-4.

---

## Step V-4: Product Brief Coverage Validation

### STEP GOAL

Validate that PRD covers all content from Product Brief (conditional on brief existence). This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Check for Product Brief

If no Product Brief found, report "N/A" and skip to Step V-5.

#### 2. Extract and Map Brief Content

Extract from Product Brief: Vision, Users, Problem, Features, Goals, Differentiators.

For each item, search PRD for corresponding coverage. Classify:
- **Fully Covered:** Content present and complete
- **Partially Covered:** Content present but incomplete
- **Not Found:** Content missing from PRD
- **Intentionally Excluded:** Content explicitly out of scope

#### 3. Assess Coverage and Severity

For each gap: Critical (core vision, primary users, main features), Moderate (secondary features, some goals), or Informational.

#### 4. Report and Auto-Proceed

Append coverage findings and proceed to Step V-5.

---

## Step V-5: Measurability Validation

### STEP GOAL

Validate that all FRs and NFRs are measurable, testable, and follow proper format. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Functional Requirements Analysis

Extract all FRs and check each for:
- **Format compliance:** "[Actor] can [capability]" pattern
- **No subjective adjectives:** easy, fast, simple, intuitive, user-friendly, responsive, quick, efficient (without metrics)
- **No vague quantifiers:** multiple, several, some, many, few, various
- **No implementation details:** React, Vue, Angular, PostgreSQL, MongoDB, AWS, Docker, etc.

#### 2. Non-Functional Requirements Analysis

Extract all NFRs and check each for:
- **Specific metrics:** Is there a measurable criterion?
- **Template compliance:** Criterion, metric, measurement method, context
- **Context provided?**

#### 3. Tally Violations

Count FR and NFR violations separately and total. Classify severity: Critical (>10), Warning (5-10), Pass (<5).

#### 4. Report and Auto-Proceed

Append measurability findings and proceed to Step V-6.

---

## Step V-6: Traceability Validation

### STEP GOAL

Validate the traceability chain is intact. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Extract Key Elements

- Executive Summary: vision, goals, objectives
- Success Criteria: all criteria
- User Journeys: user types and flows
- Functional Requirements: all FRs
- Product Scope: in-scope items

#### 2. Validate Chains

- **Executive Summary -> Success Criteria:** Does vision align with defined success?
- **Success Criteria -> User Journeys:** Are success criteria supported by user journeys?
- **User Journeys -> Functional Requirements:** Does each FR trace back to a user journey?
- **Scope -> FRs:** Do MVP scope FRs align with in-scope items?

#### 3. Identify Orphans

- Orphan FRs (no traceable source)
- Unsupported success criteria
- User journeys without supporting FRs

#### 4. Report and Auto-Proceed

Append traceability findings and proceed to Step V-7.

---

## Step V-7: Implementation Leakage Validation

### STEP GOAL

Ensure FRs and NFRs specify WHAT, not HOW. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Scan for Implementation Terms

**Categories:**
- Frontend Frameworks: React, Vue, Angular, Svelte, Next.js, etc.
- Backend Frameworks: Express, Django, Rails, Spring, Laravel, etc.
- Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, etc.
- Cloud Platforms: AWS, GCP, Azure, Cloudflare, Vercel, etc.
- Infrastructure: Docker, Kubernetes, Terraform, Ansible, etc.
- Libraries: Redux, Zustand, axios, lodash, jQuery, etc.
- Data Formats: JSON, XML, YAML, CSV (unless capability-relevant)

#### 2. Distinguish Capability-Relevant vs Leakage

- "API consumers can access data via REST endpoints" - API/REST is capability
- "React components fetch data using Redux" - implementation leakage

#### 3. Tally and Classify

Severity: Critical (>5 violations), Warning (2-5), Pass (<2).

**Note:** API consumers, GraphQL (when required), and other capability-relevant terms are acceptable when they describe WHAT, not HOW.

#### 4. Report and Auto-Proceed

Append leakage findings and proceed to Step V-8.

---

## Step V-8: Domain Compliance Validation

### STEP GOAL

Validate domain-specific requirements are present for high-complexity domains. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Load Domain Complexity Data

Use the Domain Complexity reference data above.

#### 2. Extract Domain Classification

From PRD frontmatter, extract `classification.domain`. If no domain found, treat as "general".

#### 3. Determine Domain Complexity

**Low complexity:** Skip detailed checks. Report "N/A" and proceed to Step V-9.

**High complexity:** Validate required special sections:
- **Healthcare:** Clinical Requirements, Regulatory Pathway, Safety Measures, HIPAA Compliance
- **Fintech:** Compliance Matrix, Security Architecture, Audit Requirements, Fraud Prevention
- **GovTech:** Accessibility Standards, Procurement Compliance, Security Clearance, Data Residency
- **Other regulated domains:** Check for domain-specific regulatory sections

#### 4. Build Compliance Matrix

For each required section: Met / Partial / Missing.

#### 5. Report and Auto-Proceed

Append compliance findings and proceed to Step V-9.

---

## Step V-9: Project-Type Compliance Validation

### STEP GOAL

Validate project-type specific requirements are properly documented. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Load Project Types Data

Use the Project Types reference data above.

#### 2. Extract Project Type Classification

From PRD frontmatter, extract `classification.projectType`. If none found, assume "web_app".

#### 3. Determine Required and Excluded Sections

From the CSV data for this project type:
- **Required sections** (from required_sections column) - MUST be present
- **Skip sections** (from skip_sections column) - MUST NOT be present

#### 4. Validate Against Requirements

Check each required section for presence/completeness. Check excluded sections are absent.

#### 5. Build Compliance Table

Required: {present}/{total}. Excluded violations: {count}.

#### 6. Report and Auto-Proceed

Append project-type compliance findings and proceed to Step V-10.

---

## Step V-10: SMART Requirements Validation

### STEP GOAL

Validate FRs meet SMART quality criteria. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Extract All Functional Requirements

Extract all FRs with their FR numbers. Count total FRs.

#### 2. Score Each FR on SMART Criteria (1-5 scale)

**Specific (1-5):** 5=Clear/unambiguous, 3=Somewhat clear, 1=Vague/ambiguous
**Measurable (1-5):** 5=Quantifiable/testable, 3=Partially measurable, 1=Not measurable
**Attainable (1-5):** 5=Realistic/achievable, 3=Probably achievable, 1=Unrealistic
**Relevant (1-5):** 5=Clearly aligned, 3=Somewhat relevant, 1=Not relevant
**Traceable (1-5):** 5=Clearly traces to source, 3=Partially traceable, 1=Orphan

#### 3. Build Scoring Table

Flag FRs with score < 3 in any category. Calculate percentage of FRs with all scores >= 3 and >= 4.

#### 4. Report and Auto-Proceed

Append SMART scoring table, improvement suggestions for low-scoring FRs, and proceed to Step V-11.

---

## Step V-11: Holistic Quality Assessment

### STEP GOAL

Assess the PRD as a cohesive, compelling document. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Evaluate from Multiple Perspectives

**Document Flow & Coherence:**
- Narrative flow, transitions, consistency, readability

**Dual Audience Effectiveness:**
- For Humans: Executive-friendly, developer clarity, designer clarity, stakeholder decision-making
- For LLMs: Machine-readable structure, UX readiness, architecture readiness, epic/story readiness

**BMAD PRD Principles Compliance:**
- Information density, measurability, traceability, domain awareness, zero anti-patterns, dual audience, markdown format

#### 2. Overall Quality Rating (1-5 scale)

- 5/5 Excellent: Exemplary, ready for production use
- 4/5 Good: Strong with minor improvements needed
- 3/5 Adequate: Acceptable but needs refinement
- 2/5 Needs Work: Significant gaps or issues
- 1/5 Problematic: Major flaws, needs substantial revision

#### 3. Top 3 Improvements

Identify the 3 most impactful improvements to make this a great PRD.

#### 4. Report and Auto-Proceed

Append holistic quality assessment and proceed to Step V-12.

---

## Step V-12: Completeness Validation

### STEP GOAL

Final comprehensive completeness check. This step runs autonomously.

### MANDATORY SEQUENCE

#### 1. Template Completeness

Scan for any remaining template variables: {variable}, {{variable}}, [placeholder], etc.

#### 2. Content Completeness by Section

For each section: Complete / Incomplete / Missing.

#### 3. Section-Specific Completeness

- Success criteria measurable: All / Some / None
- Journeys cover all users: Yes / Partial / No
- FRs cover MVP scope: Yes / Partial / No
- NFRs have specific criteria: All / Some / None

#### 4. Frontmatter Completeness

Check: stepsCompleted, classification, inputDocuments, date.

#### 5. Report and Auto-Proceed

Append completeness findings and proceed to Step V-13.

---

## Step V-13: Validation Report Complete

### STEP GOAL

Finalize validation report, summarize all findings, and present to user with actionable next steps.

### MANDATORY SEQUENCE

#### 1. Load Complete Validation Report

Extract all findings from Steps V-2 through V-12.

#### 2. Update Report Frontmatter

```yaml
validationStatus: COMPLETE
holisticQualityRating: '{rating from step 11}'
overallStatus: '{Pass/Warning/Critical}'
```

#### 3. Create Summary of Findings

**Overall Status:**
- **Pass:** All critical checks pass, minor warnings acceptable
- **Warning:** Some issues found but PRD is usable
- **Critical:** Major issues that prevent PRD from being fit for purpose

**Quick Results Table:**
- Format, Information Density, Measurability, Traceability, Implementation Leakage, Domain Compliance, Project-Type Compliance, SMART Quality, Holistic Quality, Completeness

#### 4. Present Summary to User

Show overall status, quick results, critical issues, warnings, strengths, holistic quality rating, top 3 improvements, and recommendation.

#### 5. Present MENU OPTIONS

**[R] Review Detailed Findings** - Walk through validation report section by section
**[E] Use Edit Workflow** - Use validation report with Edit workflow for systematic improvements
**[F] Fix Simpler Items** - Immediate fixes for simple issues (anti-patterns, leakage, missing headers)
**[X] Exit** - Exit and Suggest Next Steps

**Menu Handling Logic:**
- IF R: Walk through validation report section by section
- IF E: Offer to launch Edit mode to fix validation findings systematically
- IF F: Offer immediate fixes for template variables, conversational filler, implementation leakage, missing headers
- IF X: Display validation report path and exit
