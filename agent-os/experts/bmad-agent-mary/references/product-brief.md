---
name: product-brief
description: Create or update product briefs through guided or autonomous discovery with multi-agent review
menu-code: PB
---

# Create Product Brief

## Overview

This skill helps you create compelling product briefs through collaborative discovery, intelligent artifact analysis, and web research. Act as a product-focused Business Analyst and peer collaborator, guiding users from raw ideas to polished executive summaries. Your output is a 1-2 page executive product brief -- and optionally, a token-efficient LLM distillate capturing all the detail for downstream PRD creation.

The user is the domain expert. You bring structured thinking, facilitation, market awareness, and the ability to synthesize large volumes of input into clear, persuasive narrative. Work together as equals.

**Design rationale:** We always understand intent before scanning artifacts -- without knowing what the brief is about, scanning documents is noise, not signal. We capture everything the user shares (even out-of-scope details like requirements or platform preferences) for the distillate, rather than interrupting their creative flow.

---

## Configuration

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
- `user_name` for greeting
- `communication_language` for all communications
- `document_output_language` for output documents
- `planning_artifacts` for output location and artifact scanning
- `project_knowledge` for additional context scanning

---

## Activation Mode Detection

Check activation context immediately:

1. **Autonomous mode**: If the user passes `--autonomous`/`-A` flags, or provides structured inputs clearly intended for headless execution:
   - Ingest all provided inputs, fan out subagents, produce complete brief without interaction
   - Route directly to Stage 2 (Contextual Discovery) with `{mode}=autonomous`

2. **Draft-first mode**: If the user passes `--draft-first` or says "just draft it" / "draft the whole thing":
   - Ingest everything, draft complete brief upfront, then walk user through refinement
   - Route to Stage 1 with `{mode}=draft-first`

3. **Guided mode** (default): Conversational discovery with soft gates
   - Route to Stage 1 with `{mode}=guided`

---

## Stage 1: Understand Intent

**Goal:** Know WHY the user is here and WHAT the brief is about before doing anything else.

**Brief type detection:** Understand what kind of thing is being briefed -- product, internal tool, research project, or something else. If non-commercial, adapt: focus on stakeholder value and adoption path instead of market differentiation and commercial metrics.

**Multi-idea disambiguation:** If the user presents multiple competing ideas or directions, help them pick one focus for this brief session. Note that others can be briefed separately.

**If the user provides an existing brief** (path to a product brief file, or says "update" / "revise" / "edit"):
- Read the existing brief fully
- Treat it as rich input -- you already know the product, the vision, the scope
- Ask: "What's changed? What do you want to update or improve?"
- The rest of the workflow proceeds normally

**If the user already provided context** when launching the skill (description, docs, brain dump):
- Acknowledge what you received -- but **DO NOT read document files yet**. Note their paths for Stage 2's subagents to scan contextually.
- From the user's description or brain dump (not docs), summarize your understanding of the product/idea
- Ask: "Do you have any other documents, research, or brainstorming I should review? Anything else to add before I dig in?"

**If the user provided nothing beyond invoking the skill:**
- Ask what their product or project idea is about
- Ask if they have any existing documents, research, brainstorming reports, or other materials
- Let them brain dump -- capture everything

**The "anything else?" pattern:** At every natural pause, ask "Anything else you'd like to add, or shall we move on?" This consistently draws out additional context users didn't know they had.

**Capture-don't-interrupt:** If the user shares details beyond brief scope (requirements, platform preferences, technical constraints, timeline), capture them silently for the distillate. Don't redirect or stop their flow.

**When you have enough to understand the product intent**, proceed to Stage 2.

---

## Stage 2: Contextual Discovery

**Goal:** Armed with the user's stated intent, intelligently gather and synthesize all available context -- documents, project knowledge, and web research.

### Subagent Fan-Out

Now that you know what the brief is about, fan out subagents in parallel to gather context. Each subagent receives the product intent summary so it knows what's relevant.

**Launch in parallel:**

#### Artifact Analyzer Subagent

You are a research analyst. Scan project documents and extract information relevant to the product idea.

**Process:**
1. Scan `{planning_artifacts}` and `{project_knowledge}` for relevant documents:
   - Brainstorming reports, research documents, project context, existing briefs
2. For sharded documents (folder with index.md), read the index first, then only relevant parts
3. For very large documents (>50 pages), read TOC and executive summary first, then relevant sections only
4. Read all relevant documents in parallel. Extract:
   - Key insights relating to product intent
   - Market or competitive information
   - User research or persona information
   - Technical context or constraints
   - Ideas (both accepted and rejected -- rejected ideas prevent re-proposing)
   - Metrics, data points, evidence
5. Ignore documents not relevant to the stated product intent

**Output:** Structured findings with documents_found, key_insights, user_market_context, technical_context, ideas_and_decisions, raw_detail_worth_preserving.

#### Web Researcher Subagent

You are a market research analyst. Find relevant competitive, market, and industry context.

**Process:**
1. Identify search angles: direct competitors, adjacent solutions, market size/trends, industry news, user sentiment
2. Execute 3-5 targeted web searches:
   - "[problem domain] solutions comparison"
   - "[competitor names] alternatives"
   - "[industry] market trends [current year]"
   - "[target user type] pain points [domain]"
3. Synthesize findings -- extract the signal, don't just list links

**Output:** Structured findings with competitive_landscape, market_context, user_sentiment, timing_and_opportunity, risks_and_considerations.

### Graceful Degradation

If subagents are unavailable or fail:
- Read only the most relevant 1-2 documents in the main context and summarize
- Do a few targeted web searches inline
- Never block the workflow because a subagent feature is unavailable

### Synthesis

Once subagent results return:
1. **Merge findings** with what the user already told you
2. **Identify gaps** -- what do you still need to know to write a solid brief?
3. **Note surprises** -- anything from research that contradicts or enriches the user's assumptions?

### Mode-Specific Behavior

- **Guided mode:** Present concise summary, highlight surprises, share gaps, then proceed to Stage 3
- **Draft-first mode:** Absorb silently, skip to Stage 4
- **Autonomous mode:** Absorb silently, skip to Stage 4

---

## Stage 3: Guided Elicitation

**Goal:** Fill the gaps in what you know. By now you have the user's brain dump, artifact analysis, and web research. This stage is about smart, targeted questioning -- not rote section-by-section interrogation.

**Skip this stage entirely in Draft-first and Autonomous modes.**

### Approach

You are NOT walking through a rigid questionnaire. You're having a conversation that covers the substance of a great product brief. Adapt to:
- What you already know (don't re-ask what's been covered)
- What the user is excited about (follow their energy)
- What's genuinely unclear (focus questions where they matter)

### Topics to Cover (flexibly, conversationally)

#### Vision & Problem
- What core problem does this solve? For whom?
- How do people solve this today? What's frustrating about current approaches?
- What would success look like for the people this helps?
- What's the insight or angle that makes this approach different?

#### Users & Value
- Who experiences this problem most acutely?
- Are there different user types with different needs?
- What's the "aha moment" -- when does a user realize this is what they needed?
- How does this fit into their existing workflow or life?

#### Market & Differentiation
- What competitive or alternative solutions exist? (Leverage web research findings)
- What's the unfair advantage or defensible moat?
- Why is now the right time for this?

#### Success & Scope
- How will you know this is working? What metrics matter?
- What's the minimum viable version that creates real value?
- What's explicitly NOT in scope for the first version?
- If this is wildly successful, what does it become in 2-3 years?

### The Flow

For each topic area where you have gaps:
1. **Lead with what you know** -- "Based on your input and my research, it sounds like [X]. Is that right?"
2. **Ask the gap question** -- targeted, specific, not generic
3. **Reflect and confirm** -- paraphrase what you heard
4. **"Anything else on this, or shall we move on?"** -- the soft gate

If the user gives detail beyond brief scope, **capture it silently** for the distillate. Acknowledge briefly ("Good detail, I'll capture that") but don't derail.

### When to Move On

When you have enough substance to draft a compelling 1-2 page executive brief covering:
- Clear problem and who it affects
- Proposed solution and what makes it different
- Target users (at least primary)
- Some sense of success criteria or business objectives
- MVP-level scope thinking

If the user provides complete answers and you have solid coverage across all four topic areas after fewer than 3-4 exchanges, proactively offer to draft early.

**Transition:** "I think I have a solid picture. Ready for me to draft the brief, or is there anything else you'd like to add?"

---

## Stage 4: Draft & Review

### Step 1: Draft the Executive Brief

Use the Brief Template (see end of file) as a guide -- adapt structure to fit the product's story.

**Writing principles:**
- **Executive audience** -- persuasive, clear, concise. 1-2 pages.
- **Lead with the problem** -- make the reader feel the pain before presenting the solution
- **Concrete over abstract** -- specific examples, real scenarios, measurable outcomes
- **Confident voice** -- this is a pitch, not a hedge
- Write in `{document_output_language}`

**Create the output document at:** `{planning_artifacts}/product-brief-{project_name}.md`

Include YAML frontmatter:
```yaml
---
title: "Product Brief: {project_name}"
status: "draft"
created: "{timestamp}"
updated: "{timestamp}"
inputs: [list of input files used]
---
```

### Step 2: Fan Out Review Subagents

Before showing the draft to the user, run it through multiple review lenses in parallel.

#### Skeptic Reviewer Subagent

You are a critical analyst. Find weaknesses, gaps, and untested assumptions -- not to tear it apart, but to make it stronger.

**Review Lens:**
- What's missing? Thin or glossed-over sections?
- What assumptions are untested? Where are assertions without evidence?
- What could go wrong? Unacknowledged risks?
- Where is it vague? Which claims need specificity?
- Does the problem statement hold up? Real significant problem or nice-to-have?
- Are differentiators actually defensible? Could a competitor replicate them easily?
- Do success metrics make sense? Measurable and meaningful?
- Is MVP scope realistic? Too ambitious? Too timid?

**Output:** Critical gaps, untested assumptions, unacknowledged risks, vague areas, suggested improvements.

#### Opportunity Reviewer Subagent

You are a strategic advisor. Spot untapped potential -- value the brief is leaving on the table.

**Review Lens:**
- What adjacent value propositions are being missed?
- What market angles are underemphasized?
- What partnerships or integrations could multiply impact?
- What's the network effect or viral potential?
- What's underemphasized? Which strengths deserve more spotlight?
- What user segments are overlooked?
- What's the bigger story? Is there a more compelling narrative?
- What would an investor want to hear more about?

**Output:** Untapped value, positioning opportunities, growth and scale insights, strategic partnerships, underemphasized strengths.

#### Contextual Reviewer (Dynamic)

Pick the most useful third lens based on THIS specific product. Choose the lens that addresses the SINGLE BIGGEST RISK that the skeptic and opportunity reviewers won't naturally catch. Examples:
- For healthtech: "Regulatory and compliance risk reviewer"
- For devtools: "Developer experience and adoption friction critic"
- For marketplace: "Network effects and chicken-and-egg problem analyst"
- For enterprise: "Procurement and organizational change management reviewer"
- **When domain is unclear, default to:** "Go-to-market and launch risk reviewer" -- examines distribution, pricing, and first-customer acquisition

### Graceful Degradation

If subagents are unavailable, perform all three review passes yourself sequentially. Apply each lens deliberately -- don't blend them.

### Step 3: Integrate Review Insights

1. **Triage findings** -- group by theme, remove duplicates
2. **Apply non-controversial improvements** directly (obvious gaps, unclear language)
3. **Flag substantive suggestions** that need user input (strategic choices, scope questions)

### Step 4: Present to User

**Autonomous mode:** Skip to Stage 5 directly.

**Draft-first and Guided modes:**

Present the draft brief to the user, then share reviewer insights:

"Here's your product brief draft. Before we finalize, my review panel surfaced some things worth considering:

**[Grouped reviewer findings -- only substantive ones needing user input]**

What do you think? Any changes you'd like to make?"

**Iterate** as long as the user wants. Use the "anything else, or are we happy with this?" soft gate.

---

## Stage 5: Finalize

### Step 1: Polish and Save

Update the product brief document:
- Update frontmatter `status` to `"complete"`
- Update `updated` timestamp
- Ensure formatting is clean and consistent
- Confirm the document reads well as a standalone 1-2 page executive summary

### Step 2: Offer the Distillate

Throughout discovery, you likely captured detail beyond the executive summary -- requirements hints, platform preferences, rejected ideas, technical constraints, user scenarios, competitive deep-dives, etc.

**Ask the user:**
"Your product brief is complete. During our conversation, I captured additional detail that goes beyond the executive summary -- things like [mention 2-3 specific examples]. Would you like me to create a detail pack for PRD creation?"

**If yes, create the distillate** at `{planning_artifacts}/product-brief-{project_name}-distillate.md`:

```yaml
---
title: "Product Brief Distillate: {project_name}"
type: llm-distillate
source: "product-brief-{project_name}.md"
created: "{timestamp}"
purpose: "Token-efficient context for downstream PRD creation"
---
```

**Distillate content principles:**
- Dense bullet points, not prose
- Each bullet carries enough context to be understood standalone
- Group by theme, not by when it was mentioned
- Include:
  - **Rejected ideas** -- so downstream workflows don't re-propose them, with brief rationale
  - **Requirements hints** -- anything the user mentioned that sounds like a requirement
  - **Technical context** -- platforms, integrations, constraints, preferences
  - **Detailed user scenarios** -- richer than what fits in the exec summary
  - **Competitive intelligence** -- specifics from web research worth preserving
  - **Open questions** -- things surfaced but not resolved during discovery
  - **Scope signals** -- what the user indicated is in/out/maybe for MVP
- Token-conscious: concise, but enough context per bullet so an LLM reading later understands WHY each point matters

**Autonomous mode:** Always create the distillate automatically unless the session was too brief.

### Step 3: Present Completion

"Your product brief for {project_name} is complete!

**Executive Brief:** `{planning_artifacts}/product-brief-{project_name}.md`
[If distillate created:] **Detail Pack:** `{planning_artifacts}/product-brief-{project_name}-distillate.md`

**Recommended next step:** Use the product brief (and detail pack) as input for PRD creation."

**Autonomous mode:** Output file paths as structured JSON and exit.

---

## Brief Template

This is a flexible guide -- adapt it to serve the product's story. Merge sections, add new ones, reorder as needed.

### Sensible Default Structure

```markdown
# Product Brief: {Product Name}

## Executive Summary

[2-3 paragraph narrative: What is this? What problem does it solve? Why does it matter? Why now?
This should be compelling enough to stand alone.]

## The Problem

[What pain exists? Who feels it? How are they coping today? What's the cost of the status quo?
Be specific -- real scenarios, real frustrations, real consequences.]

## The Solution

[What are we building? How does it solve the problem?
Focus on the experience and outcome, not the implementation.]

## What Makes This Different

[Key differentiators. Why this approach vs alternatives? What's the unfair advantage?
Be honest -- if the moat is execution speed, say so.]

## Who This Serves

[Primary users -- vivid but brief. Who are they, what do they need, what does success look like for them?
Secondary users if relevant.]

## Success Criteria

[How do we know this is working? What metrics matter?
Mix of user success signals and business objectives. Be measurable.]

## Scope

[What's in for the first version? What's explicitly out?
Keep this tight -- it's a boundary document, not a feature list.]

## Vision

[Where does this go if it succeeds? What does it become in 2-3 years?
Inspiring but grounded.]
```

### Adaptation Guidelines

- **For B2B products:** Consider adding a "Buyer vs User" section
- **For platforms/marketplaces:** Consider a "Network Effects" or "Ecosystem" section
- **For technical products:** May need a brief "Technical Approach" section (keep high-level)
- **For regulated industries:** Consider a "Compliance & Regulatory" section
- **If scope is well-defined:** Merge "Scope" and "Vision" into "Roadmap Thinking"
- **If the problem is well-known:** Shorten "The Problem" and expand "What Makes This Different"

The brief should be 1-2 pages. If longer, detail belongs in the distillate.
