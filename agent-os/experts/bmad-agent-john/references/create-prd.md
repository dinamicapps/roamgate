---
name: create-prd
description: Create a PRD from scratch through a structured 12-step workflow facilitation process
menu-code: create-prd
---

# PRD Create Workflow

**Goal:** Create comprehensive PRDs through structured workflow facilitation.

**Your Role:** Product-focused PM facilitator collaborating with an expert peer.

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

2. Route to Create Workflow

"**Create Mode: Creating a new PRD from scratch.**"

Begin with Step 1 below.

---

## PRD Template

```yaml
---
stepsCompleted: []
inputDocuments: []
workflowType: 'prd'
---
```

```markdown
# Product Requirements Document - {{project_name}}

**Author:** {{user_name}}
**Date:** {{date}}
```

---

## PRD Purpose and Standards

### What is a BMAD PRD?

A dual-audience document serving:
1. **Human Product Managers and builders** - Vision, strategy, stakeholder communication
2. **LLM Downstream Consumption** - UX Design -> Architecture -> Epics -> Development AI Agents

Each successive document becomes more AI-tailored and granular.

### Core Philosophy: Information Density

**High Signal-to-Noise Ratio**

Every sentence must carry information weight. LLMs consume precise, dense content efficiently.

**Anti-Patterns (Eliminate These):**
- "The system will allow users to..." -> "Users can..."
- "It is important to note that..." -> State the fact directly
- "In order to..." -> "To..."
- Conversational filler and padding -> Direct, concise statements

**Goal:** Maximum information per word. Zero fluff.

### The Traceability Chain

**PRD starts the chain:**
```
Vision -> Success Criteria -> User Journeys -> Functional Requirements -> (future: User Stories)
```

**In the PRD, establish:**
- Vision -> Success Criteria alignment
- Success Criteria -> User Journey coverage
- User Journey -> Functional Requirement mapping
- All requirements traceable to user needs

**Why:** Each downstream artifact (UX, Architecture, Epics, Stories) must trace back to documented user needs and business objectives. This chain ensures we build the right thing.

### What Makes Great Functional Requirements?

#### FRs are Capabilities, Not Implementation

**Good FR:** "Users can reset their password via email link"
**Bad FR:** "System sends JWT via email and validates with database" (implementation leakage)

**Good FR:** "Dashboard loads in under 2 seconds for 95th percentile"
**Bad FR:** "Fast loading time" (subjective, unmeasurable)

#### SMART Quality Criteria

**Specific:** Clear, precisely defined capability
**Measurable:** Quantifiable with test criteria
**Attainable:** Realistic within constraints
**Relevant:** Aligns with business objectives
**Traceable:** Links to source (executive summary or user journey)

#### FR Anti-Patterns

**Subjective Adjectives:**
- "easy to use", "intuitive", "user-friendly", "fast", "responsive"
- Use metrics: "completes task in under 3 clicks", "loads in under 2 seconds"

**Implementation Leakage:**
- Technology names, specific libraries, implementation details
- Focus on capability and measurable outcomes

**Vague Quantifiers:**
- "multiple users", "several options", "various formats"
- "up to 100 concurrent users", "3-5 options", "PDF, DOCX, TXT formats"

**Missing Test Criteria:**
- "The system shall provide notifications"
- "The system shall send email notifications within 30 seconds of trigger event"

### What Makes Great Non-Functional Requirements?

#### NFRs Must Be Measurable

**Template:**
```
"The system shall [metric] [condition] [measurement method]"
```

**Examples:**
- "The system shall respond to API requests in under 200ms for 95th percentile as measured by APM monitoring"
- "The system shall maintain 99.9% uptime during business hours as measured by cloud provider SLA"
- "The system shall support 10,000 concurrent users as measured by load testing"

#### NFR Anti-Patterns

**Unmeasurable Claims:**
- "The system shall be scalable" -> "The system shall handle 10x load growth through horizontal scaling"
- "High availability required" -> "99.9% uptime as measured by cloud provider SLA"

**Missing Context:**
- "Response time under 1 second" -> "API response time under 1 second for 95th percentile under normal load"

### Domain-Specific Requirements

**Auto-Detect and Enforce Based on Project Context**

Certain industries have mandatory requirements that must be present:

- **Healthcare:** HIPAA Privacy & Security Rules, PHI encryption, audit logging, MFA
- **Fintech:** PCI-DSS Level 1, AML/KYC compliance, SOX controls, financial audit trails
- **GovTech:** NIST framework, Section 508 accessibility (WCAG 2.1 AA), FedRAMP, data residency
- **E-Commerce:** PCI-DSS for payments, inventory accuracy, tax calculation by jurisdiction

### Document Structure (Markdown, Human-Readable)

#### Required Sections
1. **Executive Summary** - Vision, differentiator, target users
2. **Success Criteria** - Measurable outcomes (SMART)
3. **Product Scope** - MVP, Growth, Vision phases
4. **User Journeys** - Comprehensive coverage
5. **Domain Requirements** - Industry-specific compliance (if applicable)
6. **Innovation Analysis** - Competitive differentiation (if applicable)
7. **Project-Type Requirements** - Platform-specific needs
8. **Functional Requirements** - Capability contract (FRs)
9. **Non-Functional Requirements** - Quality attributes (NFRs)

#### Formatting for Dual Consumption

**For Humans:**
- Clear, professional language
- Logical flow from vision to requirements
- Easy for stakeholders to review and approve

**For LLMs:**
- ## Level 2 headers for all main sections (enables extraction)
- Consistent structure and patterns
- Precise, testable language
- High information density

### Downstream Impact

**How the PRD Feeds Next Artifacts:**

**UX Design:**
- User journeys -> interaction flows
- FRs -> design requirements
- Success criteria -> UX metrics

**Architecture:**
- FRs -> system capabilities
- NFRs -> architecture decisions
- Domain requirements -> compliance architecture
- Project-type requirements -> platform choices

**Epics & Stories (created after architecture):**
- FRs -> user stories (1 FR could map to 1-3 stories potentially)
- Acceptance criteria -> story acceptance tests
- Priority -> sprint sequencing
- Traceability -> stories map back to vision

**Development AI Agents:**
- Precise requirements -> implementation clarity
- Test criteria -> automated test generation
- Domain requirements -> compliance enforcement
- Measurable NFRs -> performance targets

### Summary: What Makes a Great BMAD PRD?

- **High Information Density** - Every sentence carries weight, zero fluff
- **Measurable Requirements** - All FRs and NFRs are testable with specific criteria
- **Clear Traceability** - Each requirement links to user need and business objective
- **Domain Awareness** - Industry-specific requirements auto-detected and included
- **Zero Anti-Patterns** - No subjective adjectives, implementation leakage, or vague quantifiers
- **Dual Audience Optimized** - Human-readable AND LLM-consumable
- **Markdown Format** - Professional, clean, accessible to all stakeholders

**Remember:** The PRD is the foundation. Quality here ripples through every subsequent phase.

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
game,"game,player,gameplay,level,character","REDIRECT TO USE THE BMad Method Game Module Agent and Workflows - HALT","game-brief;GDD","most_sections","game design patterns","Novel mechanics;Genre mixing"
desktop_app,"desktop,Windows,Mac,Linux,native","Cross-platform?;Auto-update?;System integration?;Offline?","platform_support;system_integration;update_strategy;offline_capabilities","web_seo;mobile_features","desktop guidelines;platform requirements","Desktop AI;System automation"
iot_embedded,"IoT,embedded,device,sensor,hardware","Hardware specs?;Connectivity?;Power constraints?;Security?;OTA updates?","hardware_reqs;connectivity_protocol;power_profile;security_model;update_mechanism","visual_ui;browser_support","IoT standards;protocol specs","Edge AI;New sensors"
blockchain_web3,"blockchain,crypto,DeFi,NFT,smart contract","Chain selection?;Wallet integration?;Gas optimization?;Security audit?","chain_specs;wallet_support;smart_contracts;security_audit;gas_optimization","traditional_auth;centralized_db","blockchain standards;security patterns","Novel tokenomics;DAO structure"
```

## Reference Data: Domain Complexity

```csv
domain,signals,complexity,key_concerns,required_knowledge,suggested_workflow,web_searches,special_sections
healthcare,"medical,diagnostic,clinical,FDA,patient,treatment,HIPAA,therapy,pharma,drug",high,"FDA approval;Clinical validation;HIPAA compliance;Patient safety;Medical device classification;Liability","Regulatory pathways;Clinical trial design;Medical standards;Data privacy;Integration requirements","domain-research","FDA software medical device guidance {date};HIPAA compliance software requirements;Medical software standards {date};Clinical validation software","clinical_requirements;regulatory_pathway;validation_methodology;safety_measures"
fintech,"payment,banking,trading,investment,crypto,wallet,transaction,KYC,AML,funds,fintech",high,"Regional compliance;Security standards;Audit requirements;Fraud prevention;Data protection","KYC/AML requirements;PCI DSS;Open banking;Regional laws (US/EU/APAC);Crypto regulations","domain-research","fintech regulations {date};payment processing compliance {date};open banking API standards;cryptocurrency regulations {date}","compliance_matrix;security_architecture;audit_requirements;fraud_prevention"
govtech,"government,federal,civic,public sector,citizen,municipal,voting",high,"Procurement rules;Security clearance;Accessibility (508);FedRAMP;Privacy;Transparency","Government procurement;Security frameworks;Accessibility standards;Privacy laws;Open data requirements","domain-research","government software procurement {date};FedRAMP compliance requirements;section 508 accessibility;government security standards","procurement_compliance;security_clearance;accessibility_standards;transparency_requirements"
edtech,"education,learning,student,teacher,curriculum,assessment,K-12,university,LMS",medium,"Student privacy (COPPA/FERPA);Accessibility;Content moderation;Age verification;Curriculum standards","Educational privacy laws;Learning standards;Accessibility requirements;Content guidelines;Assessment validity","domain-research","educational software privacy {date};COPPA FERPA compliance;WCAG education requirements;learning management standards","privacy_compliance;content_guidelines;accessibility_features;curriculum_alignment"
aerospace,"aircraft,spacecraft,aviation,drone,satellite,propulsion,flight,radar,navigation",high,"Safety certification;DO-178C compliance;Performance validation;Simulation accuracy;Export controls","Aviation standards;Safety analysis;Simulation validation;ITAR/export controls;Performance requirements","domain-research + technical-model","DO-178C software certification;aerospace simulation standards {date};ITAR export controls software;aviation safety requirements","safety_certification;simulation_validation;performance_requirements;export_compliance"
automotive,"vehicle,car,autonomous,ADAS,automotive,driving,EV,charging",high,"Safety standards;ISO 26262;V2X communication;Real-time requirements;Certification","Automotive standards;Functional safety;V2X protocols;Real-time systems;Testing requirements","domain-research","ISO 26262 automotive software;automotive safety standards {date};V2X communication protocols;EV charging standards","safety_standards;functional_safety;communication_protocols;certification_requirements"
scientific,"research,algorithm,simulation,modeling,computational,analysis,data science,ML,AI",medium,"Reproducibility;Validation methodology;Peer review;Performance;Accuracy;Computational resources","Scientific method;Statistical validity;Computational requirements;Domain expertise;Publication standards","technical-model","scientific computing best practices {date};research reproducibility standards;computational modeling validation;peer review software","validation_methodology;accuracy_metrics;reproducibility_plan;computational_requirements"
legaltech,"legal,law,contract,compliance,litigation,patent,attorney,court",high,"Legal ethics;Bar regulations;Data retention;Attorney-client privilege;Court system integration","Legal practice rules;Ethics requirements;Court filing systems;Document standards;Confidentiality","domain-research","legal technology ethics {date};law practice management software requirements;court filing system standards;attorney client privilege technology","ethics_compliance;data_retention;confidentiality_measures;court_integration"
insuretech,"insurance,claims,underwriting,actuarial,policy,risk,premium",high,"Insurance regulations;Actuarial standards;Data privacy;Fraud detection;State compliance","Insurance regulations by state;Actuarial methods;Risk modeling;Claims processing;Regulatory reporting","domain-research","insurance software regulations {date};actuarial standards software;insurance fraud detection;state insurance compliance","regulatory_requirements;risk_modeling;fraud_detection;reporting_compliance"
energy,"energy,utility,grid,solar,wind,power,electricity,oil,gas",high,"Grid compliance;NERC standards;Environmental regulations;Safety requirements;Real-time operations","Energy regulations;Grid standards;Environmental compliance;Safety protocols;SCADA systems","domain-research","energy sector software compliance {date};NERC CIP standards;smart grid requirements;renewable energy software standards","grid_compliance;safety_protocols;environmental_compliance;operational_requirements"
process_control,"industrial automation,process control,PLC,SCADA,DCS,HMI,operational technology,OT,control system,cyberphysical,MES,historian,instrumentation,I&C,P&ID",high,"Functional safety;OT cybersecurity;Real-time control requirements;Legacy system integration;Process safety and hazard analysis;Environmental compliance and permitting;Engineering authority and PE requirements","Functional safety standards;OT security frameworks;Industrial protocols;Process control architecture;Plant reliability and maintainability","domain-research + technical-model","IEC 62443 OT cybersecurity requirements {date};functional safety software requirements {date};industrial process control architecture;ISA-95 manufacturing integration","functional_safety;ot_security;process_requirements;engineering_authority"
building_automation,"building automation,BAS,BMS,HVAC,smart building,lighting control,fire alarm,fire protection,fire suppression,life safety,elevator,access control,DDC,energy management,sequence of operations,commissioning",high,"Life safety codes;Building energy standards;Multi-trade coordination and interoperability;Commissioning and ongoing operational performance;Indoor environmental quality and occupant comfort;Engineering authority and PE requirements","Building automation protocols;HVAC and mechanical controls;Fire alarm, fire protection, and life safety design;Commissioning process and sequence of operations;Building codes and energy standards","domain-research","smart building software architecture {date};BACnet integration best practices;building automation cybersecurity {date};ASHRAE building standards","life_safety;energy_compliance;commissioning_requirements;engineering_authority"
gaming,"game,player,gameplay,level,character,multiplayer,quest",redirect,"REDIRECT TO GAME WORKFLOWS","Game design","game-brief","NA","NA"
general,"",low,"Standard requirements;Basic security;User experience;Performance","General software practices","continue","software development best practices {date}","standard_requirements"
```

---

## Step 1: Workflow Initialization

**Progress: Step 1 of 12** - Next: Project Discovery

### STEP GOAL

Initialize the PRD workflow by detecting continuation state, discovering input documents, and setting up the document structure for collaborative product requirement discovery.

### MANDATORY EXECUTION RULES

**Universal Rules:**
- NEVER generate content without user input
- CRITICAL: Read the complete step before taking any action
- YOU ARE A FACILITATOR, not a content generator
- YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

**Role Reinforcement:**
- You are a product-focused PM facilitator collaborating with an expert peer
- If you already have been given a name, communication_style and persona, continue to use those while playing this new role
- We engage in collaborative dialogue, not command-response
- You bring structured thinking and facilitation skills, while the user brings domain expertise and product vision

### Sequence of Instructions

#### 1. Check for Existing Workflow State

First, check if the output document already exists:

- Look for file at `{outputFile}`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

#### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted` BUT `step-12-complete` is NOT in the list, follow the Continuation Protocol since the document is incomplete:

**Continuation Protocol:**
- STOP immediately and follow the Continuation Protocol (Step 1B below)
- Do not proceed with any initialization tasks
- Let step-1b handle all continuation logic

#### 3. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

**A. Input Document Discovery**

Discover and load context documents using smart discovery. Documents can be in the following locations:
- {planning_artifacts}/**
- {output_folder}/**
- {project_knowledge}/**
- docs/**

Also - when searching - documents can be a single markdown file, or a folder with an index and multiple files. For Example, if searching for `*foo*.md` and not found, also search for a folder called *foo*/index.md (which indicates sharded content)

Try to discover the following:
- Product Brief (`*brief*.md`)
- Research Documents (`/*research*.md`)
- Project Documentation (generally multiple documents might be found for this in the `{project_knowledge}` or `docs` folder.)
- Project Context (`**/project-context.md`)

Confirm what you have found with the user, along with asking if the user wants to provide anything else. Only after this confirmation will you proceed to follow the loading rules.

**Loading Rules:**
- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, whatever is relevant should try to be biased in the remainder of this whole workflow process
- For sharded folders, load ALL files to get complete picture, using the index first to potentially know the potential of each document
- index.md is a guide to what's relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

**B. Create Initial Document**

- Copy the template from the PRD Template section above to `{outputFile}`
- Initialize frontmatter with proper structure including inputDocuments array.

**C. Present Initialization Results**

"Welcome {{user_name}}! I've set up your PRD workspace for {{project_name}}.

**Document Setup:**
- Created: `{outputFile}` from template
- Initialized frontmatter with workflow state

**Input Documents Discovered:**
- Product briefs: {{briefCount}} files
- Research: {{researchCount}} files
- Brainstorming: {{brainstormingCount}} files
- Project docs: {{projectDocsCount}} files

**Files loaded:** {list of specific file names or "No additional documents found"}

Do you have any other documents you'd like me to include, or shall we continue to the next step?"

#### 4. Present MENU OPTIONS

Display menu after setup report:

"[C] Continue - Save this and move to Project Discovery (Step 2 of 12)"

**Menu Handling Logic:**
- IF C: Update output file frontmatter, adding this step name to the end of the list of stepsCompleted, then proceed to Step 2
- IF user provides additional files: Load them, update inputDocuments and documentCounts, redisplay report
- IF user asks questions: Answer and redisplay menu

---

## Step 1B: Workflow Continuation

### STEP GOAL

Resume the PRD workflow from where it was left off, ensuring smooth continuation with full context restoration.

### Sequence of Instructions

#### 1. Analyze Current State

Review the frontmatter to understand:
- `stepsCompleted`: Array of completed step filenames
- Last element of `stepsCompleted` array: The most recently completed step
- `inputDocuments`: What context was already loaded
- All other frontmatter variables

#### 2. Restore Context Documents

For each document in `inputDocuments`, load the complete file. Don't discover new documents - only reload what was previously processed.

#### 3. Determine Next Step

**Step Sequence Lookup:**

| Last Completed | Next Step |
|---|---|
| step-01-init | Step 2: Project Discovery |
| step-02-discovery | Step 2b: Product Vision |
| step-02b-vision | Step 2c: Executive Summary |
| step-02c-executive-summary | Step 3: Success Criteria |
| step-03-success | Step 4: User Journeys |
| step-04-journeys | Step 5: Domain Requirements |
| step-05-domain | Step 6: Innovation |
| step-06-innovation | Step 7: Project Type |
| step-07-project-type | Step 8: Scoping |
| step-08-scoping | Step 9: Functional Requirements |
| step-09-functional | Step 10: Non-Functional Requirements |
| step-10-nonfunctional | Step 11: Polish |
| step-11-polish | Step 12: Complete |

#### 4. Handle Workflow Completion

If `stepsCompleted` array contains `"step-12-complete"`:
"Great news! It looks like we've already completed the PRD workflow for {{project_name}}. The final document is ready at `{outputFile}` with all sections completed."

#### 5. Present Current Progress

If workflow not complete:
"Welcome back {{user_name}}! I'm resuming our PRD collaboration for {{project_name}}.

**Current Progress:**
- Last completed: {last step filename from stepsCompleted array}
- Next up: {next step from lookup table}
- Context documents available: {len(inputDocuments)} files

Does this look right, or do you want to make any adjustments before we proceed?"

Display: "**Select an Option:** [C] Continue to {next step name}"

---

## Step 2: Project Discovery

**Progress: Step 2 of 12** - Next: Product Vision

### STEP GOAL

Discover and classify the project - understand what type of product this is, what domain it operates in, and the project context (greenfield vs brownfield).

### YOUR TASK

Discover and classify the project through natural conversation:
- What type of product is this? (web app, API, mobile, etc.)
- What domain does it operate in? (healthcare, fintech, e-commerce, etc.)
- What's the project context? (greenfield new product vs brownfield existing system)
- How complex is this domain? (low, medium, high)

### DISCOVERY SEQUENCE

#### 1. Check Document State

Read the frontmatter from `{outputFile}` to get document counts. Announce your understanding of what was loaded in Step 1.

#### 2. Load Classification Data

Look up the project type from the Project Types CSV data above based on detection signals.
Look up the domain complexity from the Domain Complexity CSV data above based on domain signals.

#### 3. Begin Discovery Conversation

If the user has a product brief or project docs, acknowledge them and share your understanding. Then ask clarifying questions to deepen your understanding.

If this is a greenfield project with no docs, start with open-ended discovery:
- What problem does this solve?
- Who's it for?
- What excites you about building this?

**Listen for classification signals** - match against project type signals, domain signals, and complexity indicators.

#### 4. Confirm Classification

Once you have enough understanding, share your classification:

"I'm hearing this as:
- **Project Type:** {{detectedType}}
- **Domain:** {{detectedDomain}}
- **Complexity:** {{complexityLevel}}

Does this sound right to you?"

#### 5. Save Classification to Frontmatter

When user selects 'C', update frontmatter with classification:
```yaml
classification:
  projectType: {{projectType}}
  domain: {{domain}}
  complexity: {{complexityLevel}}
  projectContext: {{greenfield|brownfield}}
```

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Product Vision (Step 2b of 12)"

---

## Step 2b: Product Vision Discovery

**Progress: Step 2b of 12** - Next: Executive Summary

### STEP GOAL

Discover what makes this product special and understand the product vision through collaborative conversation. No content generation - facilitation only.

### VISION DISCOVERY SEQUENCE

#### 1. Acknowledge Classification Context

Reference the classification from step 2 and use it to frame the vision conversation.

#### 2. Explore What Makes It Special

Guide the conversation to uncover the product's unique value:
- **User delight:** "What would make users say 'this is exactly what I needed'?"
- **Differentiation moment:** "What's the moment where users realize this is different or better than alternatives?"
- **Core insight:** "What insight or approach makes this product possible or unique?"
- **Value proposition:** "If you had one sentence to explain why someone should use this over anything else, what would it be?"

#### 3. Understand the Vision

Dig deeper into the product vision:
- **Problem framing:** "What's the real problem you're solving - not the surface symptom, but the deeper need?"
- **Future state:** "When this product is successful, what does the world look like for your users?"
- **Why now:** "Why is this the right time to build this?"

#### 4. Validate Understanding

Reflect back what you've heard and confirm:

"Here's what I'm hearing about your vision and differentiator:
**Vision:** {{summarized_vision}}
**What Makes It Special:** {{summarized_differentiator}}
**Core Insight:** {{summarized_insight}}

Does this capture it? Anything I'm missing?"

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Executive Summary (Step 2c of 12)"

**This step ONLY discovers - it does NOT write to the document.**

---

## Step 2c: Executive Summary Generation

**Progress: Step 2c of 12** - Next: Success Criteria

### STEP GOAL

Generate the Executive Summary content using insights from classification (step 2) and vision discovery (step 2b), then append it to the PRD document.

### EXECUTIVE SUMMARY GENERATION SEQUENCE

#### 1. Synthesize Available Context

Review all available context before drafting:
- Classification from step 2: project type, domain, complexity, project context
- Vision and differentiator from step 2b: what makes this special, core insight
- Input documents: product briefs, research, brainstorming, project docs

#### 2. Draft Executive Summary Content

Generate the Executive Summary section. Apply PRD quality standards:
- High information density - every sentence carries weight
- Zero fluff - no filler phrases or vague language
- Precise and actionable - clear, specific statements
- Dual-audience optimized - readable by humans, consumable by LLMs

#### 3. Present Draft for Review

Present the drafted content to the user for review.

Allow the user to request specific changes, add missing information, refine the language, or approve as-is.

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Success Criteria (Step 3 of 12)"

### APPEND TO DOCUMENT

When user selects 'C', append:

```markdown
## Executive Summary

{vision_alignment_content}

### What Makes This Special

{product_differentiator_content}

## Project Classification

{project_classification_content}
```

---

## Step 3: Success Criteria Definition

**Progress: Step 3 of 12** - Next: User Journey Mapping

### STEP GOAL

Define comprehensive success criteria that cover user success, business success, and technical success.

### SUCCESS DISCOVERY SEQUENCE

#### 1. Begin Success Definition Conversation

Check input documents for success indicators. Analyze product brief, research, and brainstorming documents for success criteria already mentioned. If input documents contain success criteria, guide user to refine them. If not, start with user-centered success exploration.

#### 2. Explore User Success Metrics

Listen for specific user outcomes and help make them measurable:
- Guide from vague to specific: NOT "users are happy" -> "users complete [key action] within [timeframe]"
- Ask about emotional success: "When do they feel delighted/relieved/empowered?"
- Identify success moments: "What's the 'aha!' moment?"
- Define completion scenarios: "What does 'done' look like for the user?"

#### 3. Define Business Success

Transition to business metrics:
- Guide conversation to business perspective on success
- Explore timelines: What does 3-month success look like? 12-month success?
- Identify key business metrics: revenue, user growth, engagement, or other measures?

#### 4. Challenge Vague Metrics

Push for specificity:
- "10,000 users" -> "What kind of users? Doing what?"
- "99.9% uptime" -> "What's the real concern - data loss? Failed payments?"
- "Fast" -> "How fast, and what specifically needs to be fast?"

#### 5. Connect to Product Differentiator

Tie success metrics back to what makes the product special. Adapt success criteria to domain context.

#### 6. Smart Scope Negotiation

Guide scope definition through success lens:
- Help user distinguish MVP (must work to be useful) from growth (competitive) and vision (dream)
- Guide conversation through three scope levels:
  1. MVP: What's essential for proving the concept?
  2. Growth: What makes it competitive?
  3. Vision: What's the dream version?
- Challenge scope creep conversationally

#### 7. Generate Success Criteria Content

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to User Journey Mapping (Step 4 of 12)"

### APPEND TO DOCUMENT

When user selects 'C', append:

```markdown
## Success Criteria

### User Success
[Content based on conversation]

### Business Success
[Content based on conversation]

### Technical Success
[Content based on conversation]

### Measurable Outcomes
[Content based on conversation]

## Product Scope

### MVP - Minimum Viable Product
[Content based on conversation]

### Growth Features (Post-MVP)
[Content based on conversation]

### Vision (Future)
[Content based on conversation]
```

---

## Step 4: User Journey Mapping

**Progress: Step 4 of 12** - Next: Domain Requirements

### STEP GOAL

Create compelling narrative user journeys that leverage existing personas from product briefs and identify additional user types needed for comprehensive coverage.

### JOURNEY MAPPING SEQUENCE

#### 1. Leverage Existing Users & Identify Additional Types

Check input documents for existing personas. If user personas exist, guide user to build on them and identify additional user types. If no personas, start with comprehensive user type discovery.

Consider beyond primary users: admins, moderators, support staff, API consumers, internal ops.

#### 2. Create Narrative Story-Based Journeys

For each user type, create compelling narrative journeys using story structure:
- **Opening Scene**: Where/how do we meet them? What's their current pain?
- **Rising Action**: What steps do they take? What do they discover?
- **Climax**: Critical moment where product delivers real value
- **Resolution**: How does their situation improve? What's their new reality?

#### 3. Guide Journey Exploration

For each journey, facilitate:
- What happens at each step specifically?
- What could go wrong? What's the recovery path?
- What information do they need to see/hear?
- What's their emotional state at each point?

#### 4. Connect Journeys to Requirements

After each journey, explicitly state which capability areas this journey reveals.

#### 5. Aim for Comprehensive Coverage

**Minimum Coverage:**
1. **Primary User - Success Path**: Core experience journey
2. **Primary User - Edge Case**: Error recovery, alternative goals
3. **Admin/Operations User**: Management, configuration, monitoring
4. **Support/Troubleshooting**: Help, investigation, issue resolution
5. **API/Integration** (if applicable): Developer/technical user journey

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Domain Requirements (Step 5 of 12)"

### APPEND TO DOCUMENT

When user selects 'C', append:

```markdown
## User Journeys

[All journey narratives based on conversation]

### Journey Requirements Summary

[Summary of capabilities revealed by journeys based on conversation]
```

---

## Step 5: Domain-Specific Requirements (Optional)

**Progress: Step 5 of 12** - Next: Innovation Focus

### STEP GOAL

For complex domains only that have a mapping in the Domain Complexity data, explore domain-specific constraints, compliance requirements, and technical considerations that shape the product.

### DOMAIN DISCOVERY SEQUENCE

#### 1. Check Domain Complexity

Review classification from step 2.

**If complexity is LOW:** Offer to skip: "[C] Skip this step and move to Innovation" or "[D] Do domain exploration anyway"

**If complexity is MEDIUM or HIGH:** Proceed with domain exploration.

#### 2. Load Domain Reference Data

Find the matching row in the Domain Complexity data above for the detected domain. Understand typical concerns and compliance requirements.

#### 3. Explore Domain-Specific Concerns

- What regulations apply? (HIPAA, PCI-DSS, GDPR, SOX, etc.)
- What standards matter? (ISO, NIST, domain-specific standards)
- What certifications are needed?
- What integrations are required?
- Security requirements (encryption, audit logs, access control)
- Privacy requirements (data handling, consent, retention)

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue - Save and Proceed to Innovation (Step 6 of 12)"

### APPEND TO DOCUMENT

When user selects 'C', append:

```markdown
## Domain-Specific Requirements

{{discovered domain requirements}}
```

If step was skipped, append nothing and proceed.

---

## Step 6: Innovation Discovery

**Progress: Step 6 of 12** - Next: Project Type Analysis

### STEP GOAL

Detect and explore innovation patterns in the product, focusing on what makes it truly novel and how to validate the innovative aspects. **OPTIONAL STEP** - only proceed if innovation signals are detected.

### OPTIONAL STEP CHECK

Before proceeding, scan for innovation signals:
- Listen for language like "nothing like this exists", "rethinking how X works"
- Check for project-type innovation signals from CSV
- Look for novel approaches or unique combinations
- If no innovation detected, skip this step

### INNOVATION DISCOVERY SEQUENCE

#### 1. Load Project-Type Innovation Data

Find innovation_signals and web_search_triggers from the Project Types data for the detected project type.

#### 2. Listen for Innovation Indicators

Monitor conversation for both general and project-type-specific innovation signals.

#### 3. Initial Innovation Screening

Ask targeted innovation discovery questions.

#### 4. Deep Innovation Exploration (If Detected)

- What makes it unique compared to existing solutions?
- What assumption are you challenging?
- How do we validate it works?
- What's the fallback if it doesn't?

#### 5. Generate Innovation Content (If Innovation Detected)

```markdown
## Innovation & Novel Patterns

### Detected Innovation Areas
[Innovation patterns identified]

### Market Context & Competitive Landscape
[Market context and research]

### Validation Approach
[Validation methodology]

### Risk Mitigation
[Innovation risks and fallbacks]
```

#### NO INNOVATION DETECTED

If no genuine innovation signals are found:
- Acknowledge that no clear innovation signals were found
- Note this is fine - many successful products are excellent executions of existing concepts

Display: "**Select:** [A] Advanced Elicitation - Let's try to find innovative angles [C] Continue - Skip innovation section and move to Project Type Analysis (Step 7 of 12)"

---

## Step 7: Project-Type Deep Dive

**Progress: Step 7 of 12** - Next: Scoping

### STEP GOAL

Conduct project-type specific discovery using CSV-driven guidance to define technical requirements.

### PROJECT-TYPE DISCOVERY SEQUENCE

#### 1. Load Project-Type Configuration Data

From the Project Types data, find the matching row for the detected project type. Extract:
- `key_questions` (semicolon-separated list of discovery questions)
- `required_sections` (semicolon-separated list of sections to document)
- `skip_sections` (semicolon-separated list of sections to skip)

#### 2. Conduct Guided Discovery Using Key Questions

Parse `key_questions` from CSV and explore each naturally in conversational style.

#### 3. Document Project-Type Specific Requirements

Based on user answers, synthesize comprehensive requirements covering areas indicated by `required_sections`. Skip areas indicated by `skip_sections`.

#### 4. Generate Dynamic Content Sections

Parse `required_sections` list and for each section name, generate corresponding content.

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Scoping (Step 8 of 12)"

### APPEND TO DOCUMENT

```markdown
## [Project Type] Specific Requirements

### Project-Type Overview
[Project type summary]

### Technical Architecture Considerations
[Technical architecture requirements]

[Dynamic sections based on CSV and conversation]

### Implementation Considerations
[Implementation specific requirements]
```

---

## Step 8: Scoping Exercise - MVP & Future Features

**Progress: Step 8 of 12** - Next: Functional Requirements

### STEP GOAL

Conduct comprehensive scoping exercise to define MVP boundaries and prioritize features across development phases.

### SCOPING SEQUENCE

#### 1. Review Current PRD State

Analyze everything documented so far. Present synthesis and assess scope implications.

#### 2. Define MVP Strategy

Facilitate strategic MVP decisions:
- MVP philosophy options: problem-solving, experience, platform, or revenue MVP
- Critical questions: What's the minimum that would make users say 'this is useful'?

#### 3. Scoping Decision Framework

**Must-Have Analysis:** Guide identification of absolute MVP necessities.
**Nice-to-Have Analysis:** Identify what could be added later.

#### 4. Progressive Feature Roadmap

Create phased development approach:
- Phase 1 (MVP): Core user value delivery, essential user journeys, basic functionality
- Phase 2 (Growth): Additional user types, enhanced features, scale improvements
- Phase 3 (Expansion): Advanced capabilities, platform features, new markets

#### 5. Risk-Based Scoping

Identify technical, market, and resource risks with mitigations.

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Functional Requirements (Step 9 of 12)"

### APPEND TO DOCUMENT

```markdown
## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** {{chosen_mvp_approach}}
**Resource Requirements:** {{mvp_team_size_and_skills}}

### MVP Feature Set (Phase 1)
**Core User Journeys Supported:** {{essential_journeys_for_mvp}}
**Must-Have Capabilities:** {{list_of_essential_mvp_features}}

### Post-MVP Features
**Phase 2 (Post-MVP):** {{planned_growth_features}}
**Phase 3 (Expansion):** {{planned_expansion_features}}

### Risk Mitigation Strategy
**Technical Risks:** {{mitigation_approach}}
**Market Risks:** {{validation_approach}}
**Resource Risks:** {{contingency_approach}}
```

---

## Step 9: Functional Requirements Synthesis

**Progress: Step 9 of 12** - Next: Non-Functional Requirements

### STEP GOAL

Create the capability contract for all downstream work. This section defines THE CAPABILITY CONTRACT for the entire product.

### CRITICAL IMPORTANCE

- UX designers will ONLY design what's listed here
- Architects will ONLY support what's listed here
- Epic breakdown will ONLY implement what's listed here
- If a capability is missing from FRs, it will NOT exist in the final product

### FUNCTIONAL REQUIREMENTS SYNTHESIS SEQUENCE

#### 1. Understand FR Purpose and Usage

FRs define WHAT capabilities the product must have. They are the complete inventory of user-facing and system capabilities.

**Critical Properties:**
- Each FR is a testable capability
- Each FR is implementation-agnostic (could be built many ways)
- Each FR specifies WHO and WHAT, not HOW
- No UI details, no performance numbers, no technology choices
- Comprehensive coverage of capability areas

#### 2. Review Existing Content for Capability Extraction

Systematically review all previous sections:
- Executive Summary -> Core product differentiator capabilities
- Success Criteria -> Success-enabling capabilities
- User Journeys -> Journey-revealed capabilities
- Domain Requirements -> Compliance and regulatory capabilities
- Innovation Patterns -> Innovative feature capabilities
- Project-Type Requirements -> Technical capability needs

#### 3. Organize Requirements by Capability Area

Group FRs by logical capability areas (NOT by technology or layer):
- "User Management" (not "Authentication System")
- "Content Discovery" (not "Search Algorithm")
- "Team Collaboration" (not "WebSocket Infrastructure")

Target 5-8 Capability Areas for typical projects.

#### 4. Generate Comprehensive FR List

**Format:** FR#: [Actor] can [capability] [context/constraint if needed]
- Number sequentially (FR1, FR2, FR3...)
- Aim for 20-50 FRs for typical projects

#### 5. Self-Validation Process

**Completeness Check:**
1. "Did I cover EVERY capability mentioned in the MVP scope section?"
2. "Did I include domain-specific requirements as FRs?"
3. "Did I cover the project-type specific needs?"
4. "Could a UX designer read ONLY the FRs and know what to design?"
5. "Could an Architect read ONLY the FRs and know what to support?"

**Altitude Check:**
1. "Am I stating capabilities (WHAT) or implementation (HOW)?"
2. "Am I listing acceptance criteria or UI specifics?" (Remove if yes)
3. "Could this FR be implemented 5 different ways?" (Good)

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Non-Functional Requirements (Step 10 of 12)"

### APPEND TO DOCUMENT

```markdown
## Functional Requirements

### [Capability Area Name]

- FR1: [Specific Actor] can [specific capability]
- FR2: [Specific Actor] can [specific capability]
- FR3: [Specific Actor] can [specific capability]

### [Another Capability Area]

- FR4: [Specific Actor] can [specific capability]
- FR5: [Specific Actor] can [specific capability]

[Continue for all capability areas]
```

**Capability Contract Reminder:** "This FR list is now binding. Any feature not listed here will not exist in the final product unless we explicitly add it."

---

## Step 10: Non-Functional Requirements

**Progress: Step 10 of 12** - Next: Polish Document

### STEP GOAL

Define non-functional requirements that specify quality attributes for the product, focusing only on what matters for THIS specific product.

### NON-FUNCTIONAL REQUIREMENTS SEQUENCE

#### 1. Explain NFR Purpose and Scope

NFRs define HOW WELL the system must perform, not WHAT it must do. We only document NFRs that matter for THIS product.

#### 2. Assess Product Context for NFR Relevance

Quick assessment questions:
- **Performance**: Is there user-facing impact of speed?
- **Security**: Are we handling sensitive data or payments?
- **Scalability**: Do we expect rapid user growth?
- **Accessibility**: Are we serving broad public audiences?
- **Integration**: Do we need to connect with other systems?
- **Reliability**: Would downtime cause significant problems?

#### 3. Explore Relevant NFR Categories

For each relevant category, conduct targeted discovery covering performance, security, scalability, accessibility, and integration as applicable.

#### 4. Make NFRs Specific and Measurable

From vague to specific:
- NOT: "The system should be fast" -> "User actions complete within 2 seconds"
- NOT: "The system should be secure" -> "All data is encrypted at rest and in transit"

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Polish Document (Step 11 of 12)"

### APPEND TO DOCUMENT

```markdown
## Non-Functional Requirements

### Performance
[Only include if relevant]

### Security
[Only include if relevant]

### Scalability
[Only include if relevant]

### Accessibility
[Only include if relevant]

### Integration
[Only include if relevant]
```

---

## Step 11: Document Polish

**Progress: Step 11 of 12** - Next: Complete PRD

### STEP GOAL

Optimize the complete PRD document for flow, coherence, and professional presentation while preserving all essential information.

### DOCUMENT POLISH SEQUENCE

#### 1. Load Context and Document

Load PRD Purpose standards (from the PRD Purpose and Standards section above). Then load the PRD Document completely.

#### 2. Document Quality Review

Review the entire document with PRD purpose principles in mind:

**Information Density:** Are there wordy phrases that can be condensed?
**Flow and Coherence:** Do sections transition smoothly?
**Duplication Detection:** Are ideas repeated across sections?
**Header Structure:** Are all main sections using ## Level 2 headers?
**Readability:** Are sentences clear and concise?

#### 2b. Brainstorming Reconciliation (if brainstorming input exists)

Check the PRD frontmatter `inputDocuments` for any brainstorming document. If found:
1. Load the brainstorming document and extract all distinct ideas
2. Cross-reference against the PRD for each brainstorming idea
3. Identify dropped ideas - especially tone, personality, interaction design ideas, and "what should this feel like" ideas
4. Present findings to user: "These brainstorming ideas did not make it into the PRD: [list]. Should any be incorporated?"

#### 3. Optimization Actions

- Improve flow with transition sentences
- Reduce duplication by consolidating repeated information
- Enhance coherence with consistent terminology
- Optimize headers for proper hierarchy

#### 4. Preserve Critical Information

Must Preserve: All user success criteria, all functional requirements, all user journey narratives, all scope decisions, all non-functional requirements, product differentiator and vision, domain-specific requirements, innovation analysis.

#### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Complete PRD (Step 12 of 12)"

When user selects 'C', replace the entire document content with the polished version.

---

## Step 12: Workflow Completion

**Final Step - Complete the PRD**

### WORKFLOW COMPLETION SEQUENCE

#### 1. Announce Workflow Completion

Celebrate successful completion. Summarize all sections created. Highlight document has been polished.

#### 2. Workflow Status Update

Update the main workflow status file if there is one. Mark current timestamp as completion time.

#### 3. Validation Workflow Options

**Option 1: Check Implementation Readiness** (`skill:bmad-check-implementation-readiness`)
- Validates PRD has all information needed for development
- Identifies gaps before architecture/design work begins

**Option 2: Skip for Now**
- Proceed directly to next workflows (architecture, UX, epics)

#### 4. Suggest Next Workflows

PRD complete. Offer help with next steps.

#### 5. Final Completion Confirmation

Document now contains: Executive Summary, Success Criteria, User Journeys, Domain Requirements (if applicable), Innovation Analysis (if applicable), Project-Type Requirements, Functional Requirements (capability contract), Non-Functional Requirements, and has been polished for flow and coherence.

**The polished PRD serves as the foundation for all subsequent product development activities. All design, architecture, and development work should trace back to the requirements and vision documented in this PRD.**
