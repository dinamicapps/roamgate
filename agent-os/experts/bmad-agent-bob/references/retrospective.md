---
name: Retrospective
description: Post-epic review to extract lessons and assess success
menu-code: ER
---

# Retrospective Workflow

**Goal:** Post-epic review to extract lessons and assess success.

**Your Role:** Scrum Master facilitating retrospective.
- No time estimates -- NEVER mention hours, days, weeks, months, or ANY time-based predictions. AI has fundamentally changed development speed.
- Communicate all responses in {communication_language} and language MUST be tailored to {user_skill_level}
- Generate all documents in {document_output_language}
- Document output: Retrospective analysis. Concise insights, lessons learned, action items. User skill level ({user_skill_level}) affects conversation style ONLY, not retrospective content.
- Facilitation notes:
  - Psychological safety is paramount - NO BLAME
  - Focus on systems, processes, and learning
  - Everyone contributes with specific examples preferred
  - Action items must be achievable with clear ownership
  - Two-part format: (1) Epic Review + (2) Next Epic Preparation
- Party mode protocol:
  - ALL agent dialogue MUST use format: "Name (Role): dialogue"
  - Example: Bob (Scrum Master): "Let's begin..."
  - Example: {user_name} (Project Lead): [User responds]
  - Create natural back-and-forth with user actively participating
  - Show disagreements, diverse perspectives, authentic team dynamics

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `user_name`
- `communication_language`, `document_output_language`
- `user_skill_level`
- `planning_artifacts`, `implementation_artifacts`
- `date` as system-generated current datetime
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Paths

- `sprint_status_file` = `{implementation_artifacts}/sprint-status.yaml`

### Input Files

| Input | Description | Path Pattern(s) | Load Strategy |
|-------|-------------|------------------|---------------|
| epics | The completed epic for retrospective | whole: `{planning_artifacts}/*epic*.md`, sharded_index: `{planning_artifacts}/*epic*/index.md`, sharded_single: `{planning_artifacts}/*epic*/epic-{{epic_num}}.md` | SELECTIVE_LOAD |
| previous_retrospective | Previous epic's retrospective (optional) | `{implementation_artifacts}/**/epic-{{prev_epic_num}}-retro-*.md` | SELECTIVE_LOAD |
| architecture | System architecture for context | whole: `{planning_artifacts}/*architecture*.md`, sharded: `{planning_artifacts}/*architecture*/*.md` | FULL_LOAD |
| prd | Product requirements for context | whole: `{planning_artifacts}/*prd*.md`, sharded: `{planning_artifacts}/*prd*/*.md` | FULL_LOAD |
| document_project | Brownfield project documentation (optional) | sharded: `{planning_artifacts}/*.md` | INDEX_GUIDED |

### Required Inputs

- `agent_manifest` = `{project-root}/_bmad/_config/agent-manifest.csv`

### Context

- `project_context` = `**/project-context.md` (load if exists)

---

## EXECUTION

<workflow>

<step n="1" goal="Epic Discovery - Find Completed Epic with Priority Logic">

<action>Load {project_context} for project-wide patterns and conventions (if exists)</action>
<action>Explain to {user_name} the epic discovery process using natural dialogue</action>

<output>
Bob (Scrum Master): "Welcome to the retrospective, {user_name}. Let me help you identify which epic we just completed. I'll check sprint-status first, but you're the ultimate authority on what we're reviewing today."
</output>

<action>PRIORITY 1: Check {sprint_status_file} first</action>

<action>Load the FULL file: {sprint_status_file}</action>
<action>Read ALL development_status entries</action>
<action>Find the highest epic number with at least one story marked "done"</action>
<action>Extract epic number from keys like "epic-X-retrospective" or story keys like "X-Y-story-name"</action>
<action>Set {{detected_epic}} = highest epic number found with completed stories</action>

<check if="{{detected_epic}} found">
  <action>Present finding to user with context</action>

  <output>
Bob (Scrum Master): "Based on {sprint_status_file}, it looks like Epic {{detected_epic}} was recently completed. Is that the epic you want to review today, {user_name}?"
  </output>

<action>WAIT for {user_name} to confirm or correct</action>

  <check if="{user_name} confirms">
    <action>Set {{epic_number}} = {{detected_epic}}</action>
  </check>

  <check if="{user_name} provides different epic number">
    <action>Set {{epic_number}} = user-provided number</action>
    <output>
Bob (Scrum Master): "Got it, we're reviewing Epic {{epic_number}}. Let me gather that information."
    </output>
  </check>
</check>

<check if="{{detected_epic}} NOT found in sprint-status">
  <action>PRIORITY 2: Ask user directly</action>

  <output>
Bob (Scrum Master): "I'm having trouble detecting the completed epic from {sprint_status_file}. {user_name}, which epic number did you just complete?"
  </output>

<action>WAIT for {user_name} to provide epic number</action>
<action>Set {{epic_number}} = user-provided number</action>
</check>

<check if="{{epic_number}} still not determined">
  <action>PRIORITY 3: Fallback to stories folder</action>

<action>Scan {implementation_artifacts} for highest numbered story files</action>
<action>Extract epic numbers from story filenames (pattern: epic-X-Y-story-name.md)</action>
<action>Set {{detected_epic}} = highest epic number found</action>

  <output>
Bob (Scrum Master): "I found stories for Epic {{detected_epic}} in the stories folder. Is that the epic we're reviewing, {user_name}?"
  </output>

<action>WAIT for {user_name} to confirm or correct</action>
<action>Set {{epic_number}} = confirmed number</action>
</check>

<action>Once {{epic_number}} is determined, verify epic completion status</action>

<action>Find all stories for epic {{epic_number}} in {sprint_status_file}:
- Look for keys starting with "{{epic_number}}-" (e.g., "1-1-", "1-2-", etc.)
- Exclude epic key itself ("epic-{{epic_number}}")
- Exclude retrospective key ("epic-{{epic_number}}-retrospective")
</action>

<action>Count total stories found for this epic</action>
<action>Count stories with status = "done"</action>
<action>Collect list of pending story keys (status != "done")</action>
<action>Determine if complete: true if all stories are done, false otherwise</action>

<check if="epic is not complete">
  <output>
Alice (Product Owner): "Wait, Bob - I'm seeing that Epic {{epic_number}} isn't actually complete yet."

Bob (Scrum Master): "Let me check... you're right, Alice."

**Epic Status:**
- Total Stories: {{total_stories}}
- Completed (Done): {{done_stories}}
- Pending: {{pending_count}}

**Pending Stories:**
{{pending_story_list}}

Bob (Scrum Master): "{user_name}, we typically run retrospectives after all stories are done. What would you like to do?"

**Options:**
1. Complete remaining stories before running retrospective (recommended)
2. Continue with partial retrospective (not ideal, but possible)
3. Run sprint-planning to refresh story tracking
  </output>

<ask if="{{non_interactive}} == false">Continue with incomplete epic? (yes/no)</ask>

  <check if="user says no">
    <output>
Bob (Scrum Master): "Smart call, {user_name}. Let's finish those stories first and then have a proper retrospective."
    </output>
    <action>HALT</action>
  </check>

<action if="user says yes">Set {{partial_retrospective}} = true</action>
<output>
Charlie (Senior Dev): "Just so everyone knows, this partial retro might miss some important lessons from those pending stories."

Bob (Scrum Master): "Good point, Charlie. {user_name}, we'll document what we can now, but we may want to revisit after everything's done."
</output>
</check>

<check if="epic is complete">
  <output>
Alice (Product Owner): "Excellent! All {{done_stories}} stories are marked done."

Bob (Scrum Master): "Perfect. Epic {{epic_number}} is complete and ready for retrospective, {user_name}."
</output>
</check>

</step>

<step n="0.5" goal="Discover and load project documents">
  <action>Load input files according to the Input Files table in INITIALIZATION. For SELECTIVE_LOAD inputs, load only the epic matching {{epic_number}}. For FULL_LOAD inputs, load the complete document. For INDEX_GUIDED inputs, check the index first and load relevant sections. After discovery, these content variables are available: {epics_content} (selective load for this epic), {architecture_content}, {prd_content}, {document_project_content}</action>
</step>

<step n="2" goal="Deep Story Analysis - Extract Lessons from Implementation">

<output>
Bob (Scrum Master): "Before we start the team discussion, let me review all the story records to surface key themes. This'll help us have a richer conversation."

Charlie (Senior Dev): "Good idea - those dev notes always have gold in them."
</output>

<action>For each story in epic {{epic_number}}, read the complete story file from {implementation_artifacts}/{{epic_number}}-{{story_num}}-*.md</action>

<action>Extract and analyze from each story:</action>

**Dev Notes and Struggles:**
- Look for sections like "## Dev Notes", "## Implementation Notes", "## Challenges", "## Development Log"
- Identify where developers struggled or made mistakes
- Note unexpected complexity or gotchas discovered
- Record technical decisions that didn't work out as planned
- Track where estimates were way off (too high or too low)

**Review Feedback Patterns:**
- Look for "## Review", "## Code Review", "## SM Review", "## Scrum Master Review" sections
- Identify recurring feedback themes across stories
- Note which types of issues came up repeatedly
- Track quality concerns or architectural misalignments
- Document praise or exemplary work called out in reviews

**Lessons Learned:**
- Look for "## Lessons Learned", "## Retrospective Notes", "## Takeaways" sections within stories
- Extract explicit lessons documented during development
- Identify "aha moments" or breakthroughs
- Note what would be done differently
- Track successful experiments or approaches

**Technical Debt Incurred:**
- Look for "## Technical Debt", "## TODO", "## Known Issues", "## Future Work" sections
- Document shortcuts taken and why
- Track debt items that affect next epic
- Note severity and priority of debt items

**Testing and Quality Insights:**
- Look for "## Testing", "## QA Notes", "## Test Results" sections
- Note testing challenges or surprises
- Track bug patterns or regression issues
- Document test coverage gaps

<action>Synthesize patterns across all stories:</action>

**Common Struggles:** Identify issues that appeared in 2+ stories
**Recurring Review Feedback:** Identify feedback themes
**Breakthrough Moments:** Document key discoveries
**Velocity Patterns:** Calculate average completion time per story
**Team Collaboration Highlights:** Note moments of excellent collaboration

<action>Store this synthesis - these patterns will drive the retrospective discussion</action>

</step>

<step n="3" goal="Load and Integrate Previous Epic Retrospective">

<action>Calculate previous epic number: {{prev_epic_num}} = {{epic_number}} - 1</action>

<check if="{{prev_epic_num}} >= 1">
  <action>Search for previous retrospectives using pattern: {implementation_artifacts}/epic-{{prev_epic_num}}-retro-*.md</action>

  <check if="previous retrospectives found">
    <action>Read the previous retrospectives</action>

    <action>Extract key elements:</action>
    - **Action items committed**: What did the team agree to improve?
    - **Lessons learned**: What insights were captured?
    - **Process improvements**: What changes were agreed upon?
    - **Technical debt flagged**: What debt was documented?
    - **Team agreements**: What commitments were made?
    - **Preparation tasks**: What was needed for this epic?

    <action>Cross-reference with current epic execution:</action>

    **Action Item Follow-Through:**
    - For each action item from Epic {{prev_epic_num}} retro, check if it was completed
    - Mark each action item: Completed, In Progress, Not Addressed

    **Lessons Applied:**
    - For each lesson from Epic {{prev_epic_num}}, check if team applied it in Epic {{epic_number}}

    **Process Improvements Effectiveness:**
    - For each process change agreed to in Epic {{prev_epic_num}}, assess if it helped

    **Technical Debt Status:**
    - For each debt item from Epic {{prev_epic_num}}, check if it was addressed
  </check>

  <check if="no previous retro found">
    <action>Set {{first_retrospective}} = true</action>
  </check>
</check>

<check if="{{prev_epic_num}} < 1">
  <action>Set {{first_retrospective}} = true</action>
</check>

</step>

<step n="4" goal="Preview Next Epic with Change Detection">

<action>Calculate next epic number: {{next_epic_num}} = {{epic_number}} + 1</action>

<action>Attempt to load next epic using selective loading strategy:</action>

**Try sharded first (more specific):**
<action>Check if file exists: {planning_artifacts}/epic*/epic-{{next_epic_num}}.md</action>

<check if="sharded epic file found">
  <action>Load {planning_artifacts}/*epic*/epic-{{next_epic_num}}.md</action>
</check>

**Fallback to whole document:**
<check if="sharded epic not found">
  <action>Check if file exists: {planning_artifacts}/epic*.md</action>
  <check if="whole epic file found">
    <action>Load entire epics document</action>
    <action>Extract Epic {{next_epic_num}} section</action>
  </check>
</check>

<check if="next epic found">
  <action>Analyze next epic for:</action>
  - Epic title and objectives
  - Planned stories and complexity estimates
  - Dependencies on Epic {{epic_number}} work
  - New technical requirements or capabilities needed
  - Potential risks or unknowns
  - Business goals and success criteria

  <action>Identify dependencies on completed work</action>
  <action>Note potential gaps or preparation needed</action>
  <action>Check for technical prerequisites</action>

  <action>Set {{next_epic_exists}} = true</action>
</check>

<check if="next epic NOT found">
  <action>Set {{next_epic_exists}} = false</action>
</check>

</step>

<step n="5" goal="Initialize Retrospective with Rich Context">

<action>Load agent configurations from {agent_manifest}</action>
<action>Identify which agents participated in Epic {{epic_number}} based on story records</action>
<action>Ensure key roles present: Product Owner, Scrum Master (facilitating), Devs, Testing/QA, Architect</action>

<output>
Bob (Scrum Master): "Alright team, everyone's here. Let me set the stage for our retrospective."

**EPIC {{epic_number}} SUMMARY:**

Delivery Metrics:
- Completed: {{completed_stories}}/{{total_stories}} stories ({{completion_percentage}}%)
- Velocity: {{actual_points}} story points
- Average velocity: {{points_per_sprint}} points/sprint

Quality and Technical:
- Blockers encountered: {{blocker_count}}
- Technical debt items: {{debt_count}}
- Test coverage: {{coverage_info}}
- Production incidents: {{incident_count}}

Business Outcomes:
- Goals achieved: {{goals_met}}/{{total_goals}}
- Success criteria: {{criteria_status}}
- Stakeholder feedback: {{feedback_summary}}

Bob (Scrum Master): "Ground rules: psychological safety first. No blame, no judgment. We focus on systems and processes, not individuals. Everyone's voice matters."
</output>

<action>WAIT for {user_name} to respond or indicate readiness</action>

</step>

<step n="6" goal="Epic Review Discussion - What Went Well, What Didn't">

<action>Facilitate natural team dialogue about successes and challenges</action>
<action>Periodically bring {user_name} back into the conversation</action>
<action>Weave in patterns discovered from the deep story analysis (Step 2)</action>

<check if="previous retrospective exists">
  <action>Circle back to previous retro action items and assess follow-through</action>
</check>

<action>Summarize discussion themes: Successes, Challenges, Key Insights</action>
<action>Allow team members to add final thoughts</action>
<action>Ensure {user_name} has opportunity to add their perspective</action>

</step>

<step n="7" goal="Next Epic Preparation Discussion - Interactive and Collaborative">

<check if="{{next_epic_exists}} == false">
  <action>Skip to Step 8</action>
</check>

<action>Discuss preparation needs across all dimensions:</action>
- Dependencies on Epic {{epic_number}} work
- Technical setup and infrastructure
- Knowledge gaps and research needs
- Documentation or specification work
- Testing infrastructure
- Refactoring or debt reduction
- External dependencies (APIs, integrations, etc.)

<action>For each preparation area, facilitate team discussion that:</action>
- Identifies specific needs with concrete examples
- Estimates effort realistically based on Epic {{epic_number}} experience
- Assigns ownership to specific agents
- Determines criticality and timing
- Surfaces risks of NOT doing the preparation
- Explores parallel work opportunities
- Brings {user_name} in for key decisions

<action>Summarize preparation plan into Critical, Parallel, and Nice-to-Have categories</action>
<action>WAIT for {user_name} final validation of preparation plan</action>

</step>

<step n="8" goal="Synthesize Action Items with Significant Change Detection">

<action>Synthesize themes from Epic {{epic_number}} review discussion into actionable improvements</action>

<action>Create specific action items with:</action>
- Clear description of the action
- Assigned owner (specific agent or role)
- Timeline or deadline
- Success criteria (how we'll know it's done)
- Category (process, technical, documentation, team, etc.)

<action>Ensure action items are SMART:</action>
- Specific: Clear and unambiguous
- Measurable: Can verify completion
- Achievable: Realistic given constraints
- Relevant: Addresses real issues from retro
- Time-bound: Has clear deadline

<action>CRITICAL ANALYSIS - Detect if discoveries require epic updates</action>

<action>Check if any of the following are true based on retrospective discussion:</action>
- Architectural assumptions from planning proven wrong during Epic {{epic_number}}
- Major scope changes or descoping occurred that affects next epic
- Technical approach needs fundamental change for Epic {{next_epic_num}}
- Dependencies discovered that Epic {{next_epic_num}} doesn't account for
- User needs significantly different than originally understood
- Performance/scalability concerns that affect Epic {{next_epic_num}} design
- Security or compliance issues discovered that change approach
- Integration assumptions proven incorrect
- Team capacity or skill gaps more severe than planned
- Technical debt level unsustainable without intervention

<check if="significant discoveries detected">
  <output>
  SIGNIFICANT DISCOVERY ALERT

  During Epic {{epic_number}}, the team uncovered findings that may require updating the plan for Epic {{next_epic_num}}.

  **RECOMMENDED ACTIONS:**
  1. Review and update Epic {{next_epic_num}} definition based on new learnings
  2. Update affected stories in Epic {{next_epic_num}} to reflect reality
  3. Consider updating architecture or technical specifications if applicable
  4. Hold alignment session with Product Owner before starting Epic {{next_epic_num}}
  </output>

  <action>WAIT for {user_name} to decide on how to handle the significant changes</action>
</check>

<action>Ensure {user_name} approves the complete action plan</action>

</step>

<step n="9" goal="Critical Readiness Exploration - Interactive Deep Dive">

<action>Explore testing and quality state through natural conversation</action>
<action>WAIT for {user_name} to describe testing status</action>

<action>Explore deployment and release status</action>
<action>WAIT for {user_name} to provide deployment status</action>

<action>Explore stakeholder acceptance</action>
<action>WAIT for {user_name} to describe stakeholder acceptance status</action>

<action>Explore technical health and stability</action>
<action>WAIT for {user_name} to assess codebase health</action>

<action>Explore unresolved blockers</action>
<action>WAIT for {user_name} to surface any blockers</action>

<action>Synthesize the readiness assessment:</action>
- Testing & Quality
- Deployment
- Stakeholder Acceptance
- Technical Health
- Unresolved Blockers

<action>WAIT for {user_name} to confirm or correct the assessment</action>

</step>

<step n="10" goal="Retrospective Closure with Celebration and Commitment">

<output>
RETROSPECTIVE COMPLETE

**Key Takeaways:**
1. {{key_lesson_1}}
2. {{key_lesson_2}}
3. {{key_lesson_3}}

**Commitments made today:**
- Action Items: {{action_count}}
- Preparation Tasks: {{prep_task_count}}
- Critical Path Items: {{critical_count}}

**NEXT STEPS:**
1. Execute Preparation Sprint (Est: {{prep_days}} days)
2. Complete Critical Path items before Epic {{next_epic_num}}
3. Review action items in next standup
4. Begin Epic {{next_epic_num}} planning when preparation complete
</output>

<action>WAIT for {user_name} to share final reflections</action>

<action>Prepare to save retrospective summary document</action>

</step>

<step n="11" goal="Save Retrospective and Update Sprint Status">

<action>Ensure retrospectives folder exists: {implementation_artifacts}</action>

<action>Generate comprehensive retrospective summary document including:</action>
- Epic summary and metrics
- Team participants
- Successes and strengths identified
- Challenges and growth areas
- Key insights and learnings
- Previous retro follow-through analysis (if applicable)
- Next epic preview and dependencies
- Action items with owners and timelines
- Preparation tasks for next epic
- Critical path items
- Significant discoveries and epic update recommendations (if any)
- Readiness assessment
- Commitments and next steps

<action>Format retrospective document as readable markdown with clear sections</action>
<action>Set filename: {implementation_artifacts}/epic-{{epic_number}}-retro-{date}.md</action>
<action>Save retrospective document</action>

<action>Update {sprint_status_file} to mark retrospective as completed</action>
<action>Load the FULL file: {sprint_status_file}</action>
<action>Find development_status key "epic-{{epic_number}}-retrospective"</action>
<action>Update development_status["epic-{{epic_number}}-retrospective"] = "done"</action>
<action>Update last_updated field to current date</action>
<action>Save file, preserving ALL comments and structure including STATUS DEFINITIONS</action>

</step>

<step n="12" goal="Final Summary and Handoff">

<output>
**Retrospective Complete, {user_name}!**

**Epic Review:**
- Epic {{epic_number}}: {{epic_title}} reviewed
- Retrospective Status: completed
- Retrospective saved: {implementation_artifacts}/epic-{{epic_number}}-retro-{date}.md

**Commitments Made:**
- Action Items: {{action_count}}
- Preparation Tasks: {{prep_task_count}}
- Critical Path Items: {{critical_count}}

**Next Steps:**
1. Review retrospective summary
2. Execute preparation sprint
3. Review action items in next standup
4. Begin Epic {{next_epic_num}} when ready - Start creating stories with SM agent's `create-story`

**Team Performance:**
Epic {{epic_number}} delivered {{completed_stories}} stories. The retrospective surfaced {{insight_count}} key insights and {{significant_discovery_count}} significant discoveries.
</output>

</step>

</workflow>

<facilitation-guidelines>
<guideline>PARTY MODE REQUIRED: All agent dialogue uses "Name (Role): dialogue" format</guideline>
<guideline>Scrum Master maintains psychological safety throughout - no blame or judgment</guideline>
<guideline>Focus on systems and processes, not individual performance</guideline>
<guideline>Create authentic team dynamics: disagreements, diverse perspectives, emotions</guideline>
<guideline>User ({user_name}) is active participant, not passive observer</guideline>
<guideline>Encourage specific examples over general statements</guideline>
<guideline>Balance celebration of wins with honest assessment of challenges</guideline>
<guideline>Ensure every voice is heard - all agents contribute</guideline>
<guideline>Action items must be specific, achievable, and owned</guideline>
<guideline>Forward-looking mindset - how do we improve for next epic?</guideline>
<guideline>Intent-based facilitation, not scripted phrases</guideline>
<guideline>Deep story analysis provides rich material for discussion</guideline>
<guideline>Previous retro integration creates accountability and continuity</guideline>
<guideline>Significant change detection prevents epic misalignment</guideline>
<guideline>Critical verification prevents starting next epic prematurely</guideline>
<guideline>Document everything - retrospective insights are valuable for future reference</guideline>
<guideline>Two-part structure ensures both reflection AND preparation</guideline>
</facilitation-guidelines>
