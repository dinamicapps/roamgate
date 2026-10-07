---
name: create-ux-design
description: Plan UX patterns and design specifications through collaborative visual exploration and informed decision-making where you act as a UX facilitator working with a product stakeholder.
menu-code: CU
---

# Create UX Design Workflow

**Goal:** Create comprehensive UX design specifications through collaborative visual exploration and informed decision-making where you act as a UX facilitator working with a product stakeholder.

---

## WORKFLOW ARCHITECTURE

This uses **micro-step architecture** for disciplined execution:

- Each step is self-contained with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation

---

## Activation

1. Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:
   - Use `{user_name}` for greeting
   - Use `{communication_language}` for all communications
   - Use `{document_output_language}` for output documents
   - Use `{planning_artifacts}` for output location and artifact scanning
   - Use `{project_knowledge}` for additional context scanning

### Paths

- `default_output_file` = `{planning_artifacts}/ux-design-specification.md`

## EXECUTION

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- YOU MUST ALWAYS WRITE all artifact and document content in `{document_output_language}`
- Begin with Step 1 below.

---

## GLOBAL RULES

These rules apply to ALL steps in this workflow:

- NEVER generate content without user input
- ALWAYS read and understand the complete step before taking any action
- ALWAYS treat this as collaborative discovery between UX facilitator and stakeholder
- YOU ARE A UX FACILITATOR, not a content generator
- When loading next step with 'C', ensure the entire step is understood before proceeding
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- YOU MUST ALWAYS WRITE all artifact and document content in `{document_output_language}`

### Collaboration Menus (A/P/C)

Steps 2-13 use the A/P/C menu pattern:

- **A (Advanced Elicitation)**: Invoke the `bmad-advanced-elicitation` skill to develop deeper insights
- **P (Party Mode)**: Invoke the `bmad-party-mode` skill to bring multiple perspectives
- **C (Continue)**: Save the content to the document and proceed to next step

Protocol Integration:
- When 'A' selected: Invoke `bmad-advanced-elicitation` skill, process results, ask user to accept/reject, return to A/P/C menu
- When 'P' selected: Invoke `bmad-party-mode` skill, process results, ask user to accept/reject, return to A/P/C menu
- ONLY save when user chooses C (Continue)
- Update output file frontmatter, adding this step to the end of the list of stepsCompleted
- FORBIDDEN to load next step until C is selected

---

# Step 1: UX Design Workflow Initialization

## Execution Protocols

- Show your analysis before taking any action
- Initialize document and update frontmatter
- Set up frontmatter `stepsCompleted: [1]` before loading next step
- FORBIDDEN to load next step until setup is complete

## Context Boundaries

- Variables from Activation are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps
- Input document discovery happens in this step

## Task

Initialize the UX design workflow by detecting continuation state and setting up the design specification document.

## Initialization Sequence

### 1. Check for Existing Workflow

First, check if the output document already exists:

- Look for file at `{planning_artifacts}/*ux-design-specification*.md`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and follow the Continuation logic (Step 1B below)
- Do not proceed with any initialization tasks
- Let Step 1B handle the continuation logic

### 3. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Input Document Discovery

Discover and load context documents using smart discovery. Documents can be in the following locations:
- {planning_artifacts}/**
- {output_folder}/**
- {product_knowledge}/**
- {project-root}/docs/**

Also - when searching - documents can be a single markdown file, or a folder with an index and multiple files. For Example, if searching for `*foo*.md` and not found, also search for a folder called *foo*/index.md (which indicates sharded content)

Try to discover the following:
- Product Brief (`*brief*.md`)
- Research Documents (`*prd*.md`)
- Project Documentation (generally multiple documents might be found for this in the `{product_knowledge}` or `docs` folder.)
- Project Context (`**/project-context.md`)

**CRITICAL:** Confirm what you have found with the user, along with asking if the user wants to provide anything else. Only after this confirmation will you proceed to follow the loading rules.

**Loading Rules:**

- Load ALL discovered files completely that the user confirmed or provided (no offset/limit)
- If there is a project context, whatever is relevant should try to be biased in the remainder of this whole workflow process
- For sharded folders, load ALL files to get complete picture, using the index first to potentially know the potential of each document
- index.md is a guide to what's relevant whenever available
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### B. Create Initial Document

Copy the template (see Template section at end of this file) to `{planning_artifacts}/ux-design-specification.md`. Initialize frontmatter in the template.

#### C. Complete Initialization and Report

Complete setup and report to user:

**Document Setup:**

- Created: `{planning_artifacts}/ux-design-specification.md` from template
- Initialized frontmatter with workflow state

**Input Documents Discovered:**
Report what was found:
"Welcome {{user_name}}! I've set up your UX design workspace for {{project_name}}.

**Documents Found:**

- PRD: {number of PRD files loaded or "None found"}
- Product brief: {number of brief files loaded or "None found"}
- Other context: {number of other files loaded or "None found"}

**Files loaded:** {list of specific file names or "No additional documents found"}

Do you have any other documents you'd like me to include, or shall we continue to the next step?

[C] Continue to UX discovery"

## Next Step

After user selects [C] to continue, ensure the file `{planning_artifacts}/ux-design-specification.md` has been created and saved, and then proceed to Step 2.

Remember: Do NOT proceed to Step 2 until output file has been updated and user explicitly selects [C] to continue!

---

# Step 1B: UX Design Workflow Continuation

## Task

Resume the UX design workflow from where it was left off, ensuring smooth continuation.

## Continuation Sequence

### 1. Analyze Current State

Review the frontmatter to understand:

- `stepsCompleted`: Which steps are already done
- `lastStep`: The most recently completed step number
- `inputDocuments`: What context was already loaded
- All other frontmatter variables

### 2. Load All Input Documents

Reload the context documents listed in `inputDocuments`:

- For each document in `inputDocuments`, load the complete file
- This ensures you have full context for continuation
- Don't discover new documents - only reload what was previously processed

### 3. Summarize Current Progress

Welcome the user back and provide context:
"Welcome back {{user_name}}! I'm resuming our UX design collaboration for {{project_name}}.

**Current Progress:**

- Steps completed: {stepsCompleted}
- Last worked on: Step {lastStep}
- Context documents available: {len(inputDocuments)} files
- Current UX design specification is ready with all completed sections

**Document Status:**

- Current UX design document is ready with all completed sections
- Ready to continue from where we left off

Does this look right, or do you want to make any adjustments before we proceed?"

### 4. Determine Next Step

Based on `lastStep` value, determine which step to load next:

- If `lastStep = 1` -> Step 2
- If `lastStep = 2` -> Step 3
- If `lastStep = 3` -> Step 4
- Continue this pattern for all steps
- If `lastStep` indicates final step -> Workflow already complete

### 5. Present Continuation Options

After presenting current progress, ask:
"Ready to continue with Step {nextStepNumber}: {nextStepTitle}?

[C] Continue to Step {nextStepNumber}"

### Workflow Already Complete?

If `lastStep` indicates the final step is completed:
"Great news! It looks like we've already completed the UX design workflow for {{project_name}}.

The final UX design specification is ready at {planning_artifacts}/ux-design-specification.md with all sections completed.

Would you like me to:

- Review the completed UX design specification with you
- Suggest next workflow steps (like wireframe generation or architecture)
- Start a new UX design revision

What would be most helpful?"

---

# Step 2: Project Understanding

## Focus

Understanding project context and user needs.

## Context Boundaries

- Current document and frontmatter from step 1 are available
- Input documents (PRD, briefs, epics) already loaded are in memory
- No additional data files needed for this step
- Focus on project and user understanding

## Task

Understand the project context, target users, and what makes this product special from a UX perspective.

## Project Discovery Sequence

### 1. Review Loaded Context

Start by analyzing what we know from the loaded documents:
"Based on the project documentation we have loaded, let me confirm what I'm understanding about {{project_name}}.

**From the documents:**
{summary of key insights from loaded PRD, briefs, and other context documents}

**Target Users:**
{summary of user information from loaded documents}

**Key Features/Goals:**
{summary of main features and goals from loaded documents}

Does this match your understanding? Are there any corrections or additions you'd like to make?"

### 2. Fill Context Gaps (If no documents or gaps exist)

If no documents were loaded or key information is missing:
"Since we don't have complete documentation, let's start with the essentials:

**What are you building?** (Describe your product in 1-2 sentences)

**Who is this for?** (Describe your ideal user or target audience)

**What makes this special or different?** (What's the unique value proposition?)

**What's the main thing users will do with this?** (Core user action or goal)"

### 3. Explore User Context Deeper

Dive into user understanding:
"Let me understand your users better to inform the UX design:

**User Context Questions:**

- What problem are users trying to solve?
- What frustrates them with current solutions?
- What would make them say 'this is exactly what I needed'?
- How tech-savvy are your target users?
- What devices will they use most?
- When/where will they use this product?"

### 4. Identify UX Design Challenges

Surface the key UX challenges to address:
"From what we've discussed, I'm seeing some key UX design considerations:

**Design Challenges:**

- [Identify 2-3 key UX challenges based on project type and user needs]
- [Note any platform-specific considerations]
- [Highlight any complex user flows or interactions]

**Design Opportunities:**

- [Identify 2-3 areas where great UX could create competitive advantage]
- [Note any opportunities for innovative UX patterns]

Does this capture the key UX considerations we need to address?"

### 5. Generate Project Understanding Content

Prepare the content to append to the document:

#### Content Structure

When saving to document, append these sections:

```markdown
## Executive Summary

### Project Vision

[Project vision summary based on conversation]

### Target Users

[Target user descriptions based on conversation]

### Key Design Challenges

[Key UX challenges identified based on conversation]

### Design Opportunities

[Design opportunities identified based on conversation]
```

### 6. Present Content and Menu

Show the generated content and present A/P/C menu. When 'C' selected:
- Append the final content to `{planning_artifacts}/ux-design-specification.md`
- Update frontmatter: `stepsCompleted: [1, 2]`
- Proceed to Step 3

---

# Step 3: Core Experience Definition

## Focus

Defining the core user experience and platform.

## Task

Define the core user experience, platform requirements, and what makes the interaction effortless.

## Core Experience Discovery Sequence

### 1. Define Core User Action

"Now let's dig into the heart of the user experience for {{project_name}}.

**Core Experience Questions:**

- What's the ONE thing users will do most frequently?
- What user action is absolutely critical to get right?
- What should be completely effortless for users?
- If we nail one interaction, everything else follows - what is it?

Think about the core loop or primary action that defines your product's value."

### 2. Explore Platform Requirements

"Let's define the platform context for {{project_name}}:

**Platform Questions:**

- Web, mobile app, desktop, or multiple platforms?
- Will this be primarily touch-based or mouse/keyboard?
- Any specific platform requirements or constraints?
- Do we need to consider offline functionality?
- Any device-specific capabilities we should leverage?"

### 3. Identify Effortless Interactions

"**Effortless Experience Design:**

- What user actions should feel completely natural and require zero thought?
- Where do users currently struggle with similar products?
- What interaction, if made effortless, would create delight?
- What should happen automatically without user intervention?
- Where can we eliminate steps that competitors require?"

### 4. Define Critical Success Moments

"**Critical Success Moments:**

- What's the moment where users realize 'this is better'?
- When does the user feel successful or accomplished?
- What interaction, if failed, would ruin the experience?
- What are the make-or-break user flows?
- Where does first-time user success happen?"

### 5. Synthesize Experience Principles

Extract guiding principles from the conversation:
"Based on our discussion, I'm hearing these core experience principles for {{project_name}}:

**Experience Principles:**

- [Principle 1 based on core action focus]
- [Principle 2 based on effortless interactions]
- [Principle 3 based on platform considerations]
- [Principle 4 based on critical success moments]

These principles will guide all our UX decisions. Do these capture what's most important?"

### 6. Generate Core Experience Content

#### Content Structure

```markdown
## Core User Experience

### Defining Experience

[Core experience definition based on conversation]

### Platform Strategy

[Platform requirements and decisions based on conversation]

### Effortless Interactions

[Effortless interaction areas identified based on conversation]

### Critical Success Moments

[Critical success moments defined based on conversation]

### Experience Principles

[Guiding principles for UX decisions based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 4.

---

# Step 4: Desired Emotional Response

## Focus

Defining desired emotional responses and user feelings.

## Task

Define the desired emotional responses users should feel when using the product.

## Emotional Response Discovery Sequence

### 1. Explore Core Emotional Goals

"Now let's think about how {{project_name}} should make users feel.

**Emotional Response Questions:**

- What should users FEEL when using this product?
- What emotion would make them tell a friend about this?
- How should users feel after accomplishing their primary goal?
- What feeling differentiates this from competitors?

Common emotional goals: Empowered and in control? Delighted and surprised? Efficient and productive? Creative and inspired? Calm and focused? Connected and engaged?"

### 2. Identify Emotional Journey Mapping

"**Emotional Journey Considerations:**

- How should users feel when they first discover the product?
- What emotion during the core experience/action?
- How should they feel after completing their task?
- What if something goes wrong - what emotional response do we want?
- How should they feel when returning to use it again?"

### 3. Define Micro-Emotions

"**Micro-Emotions to Consider:**

- Confidence vs. Confusion
- Trust vs. Skepticism
- Excitement vs. Anxiety
- Accomplishment vs. Frustration
- Delight vs. Satisfaction
- Belonging vs. Isolation

Which of these emotional states are most critical for your product's success?"

### 4. Connect Emotions to UX Decisions

"**Design Implications:**

- If we want users to feel [emotional state], what UX choices support this?
- What interactions might create negative emotions we want to avoid?
- Where can we add moments of delight or surprise?
- How do we build trust and confidence through design?

**Emotion-Design Connections:**

- [Emotion 1] -> [UX design approach]
- [Emotion 2] -> [UX design approach]
- [Emotion 3] -> [UX design approach]"

### 5. Validate Emotional Goals

"Let me make sure I understand the emotional vision for {{project_name}}:

**Primary Emotional Goal:** [Summarize main emotional response]
**Secondary Feelings:** [List supporting emotional states]
**Emotions to Avoid:** [List negative emotions to prevent]

Does this capture the emotional experience you want to create? Any adjustments needed?"

### 6. Generate Emotional Response Content

#### Content Structure

```markdown
## Desired Emotional Response

### Primary Emotional Goals

[Primary emotional goals based on conversation]

### Emotional Journey Mapping

[Emotional journey mapping based on conversation]

### Micro-Emotions

[Micro-emotions identified based on conversation]

### Design Implications

[UX design implications for emotional responses based on conversation]

### Emotional Design Principles

[Guiding principles for emotional design based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 5.

---

# Step 5: UX Pattern Analysis & Inspiration

## Focus

Analyzing existing UX patterns and extracting inspiration.

## Task

Analyze inspiring products and UX patterns to inform design decisions for the current project.

## Inspiration Analysis Sequence

### 1. Identify User's Favorite Apps

"Let's learn from products your target users already love and use regularly.

**Inspiration Questions:**

- Name 2-3 apps your target users already love and USE frequently
- For each one, what do they do well from a UX perspective?
- What makes the experience compelling or delightful?
- What keeps users coming back to these apps?

Think about apps in your category or even unrelated products that have great UX."

### 2. Analyze UX Patterns and Principles

"For each inspiring app, let's analyze their UX success:

**For [App Name]:**

- What core problem does it solve elegantly?
- What makes the onboarding experience effective?
- How do they handle navigation and information hierarchy?
- What are their most innovative or delightful interactions?
- What visual design choices support the user experience?
- How do they handle errors or edge cases?"

### 3. Extract Transferable Patterns

"**Transferable UX Patterns:**
Looking across these inspiring apps, I see patterns we could adapt:

**Navigation Patterns:**
- [Pattern 1] - could work for your [specific use case]
- [Pattern 2] - might solve your [specific challenge]

**Interaction Patterns:**
- [Pattern 1] - excellent for [your user goal]
- [Pattern 2] - addresses [your user pain point]

**Visual Patterns:**
- [Pattern 1] - supports your [emotional goal]
- [Pattern 2] - aligns with your [platform requirements]

Which of these patterns resonate most for your product?"

### 4. Identify Anti-Patterns to Avoid

"**UX Anti-Patterns to Avoid:**
From analyzing both successes and failures in your space, here are patterns to avoid:

- [Anti-pattern 1] - users find this confusing/frustrating
- [Anti-pattern 2] - this creates unnecessary friction
- [Anti-pattern 3] - doesn't align with your [emotional goals]

Learning from others' mistakes is as important as learning from their successes."

### 5. Define Design Inspiration Strategy

"**Design Inspiration Strategy:**

**What to Adopt:**
- [Specific pattern] - because it supports [your core experience]
- [Specific pattern] - because it aligns with [user needs]

**What to Adapt:**
- [Specific pattern] - modify for [your unique requirements]
- [Specific pattern] - simplify for [your user skill level]

**What to Avoid:**
- [Specific anti-pattern] - conflicts with [your goals]
- [Specific anti-pattern] - doesn't fit [your platform]

This strategy will guide our design decisions while keeping {{project_name}} unique."

### 6. Generate Inspiration Analysis Content

#### Content Structure

```markdown
## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

[Analysis of inspiring products based on conversation]

### Transferable UX Patterns

[Transferable patterns identified based on conversation]

### Anti-Patterns to Avoid

[Anti-patterns to avoid based on conversation]

### Design Inspiration Strategy

[Strategy for using inspiration based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 6.

---

# Step 6: Design System Choice

## Focus

Choosing appropriate design system approach.

## Task

Choose appropriate design system approach based on project requirements and constraints.

## Design System Choice Sequence

### 1. Present Design System Options

"For {{project_name}}, we need to choose a design system foundation. Think of design systems like LEGO blocks for UI - they provide proven components and patterns, ensuring consistency and speeding development.

**Design System Approaches:**

**1. Custom Design System**
- Complete visual uniqueness
- Full control over every component
- Higher initial investment
- Perfect for established brands with unique needs

**2. Established System (Material Design, Ant Design, etc.)**
- Fast development with proven patterns
- Great defaults and accessibility built-in
- Less visual differentiation
- Ideal for startups or internal tools

**3. Themeable System (MUI, Chakra UI, Tailwind UI)**
- Customizable with strong foundation
- Brand flexibility with proven components
- Moderate learning curve
- Good balance of speed and uniqueness

Which direction feels right for your project?"

### 2. Analyze Project Requirements

Guide decision based on project context:
"**Let's consider your specific needs:**

**Based on our previous conversations:**
- Platform: [platform from step 3]
- Timeline: [inferred from user conversation]
- Team Size: [inferred from user conversation]
- Brand Requirements: [inferred from user conversation]
- Technical Constraints: [inferred from user conversation]

**Decision Factors:**
- Need for speed vs. need for uniqueness
- Brand guidelines or existing visual identity
- Team's design expertise
- Long-term maintenance considerations
- Integration requirements with existing systems"

### 3. Explore Specific Design System Options

Dive deeper into relevant options:
"**Recommended Options Based on Your Needs:**

**For [Your Platform Type]:**
- [Option 1] - [Key benefit] - [Best for scenario]
- [Option 2] - [Key benefit] - [Best for scenario]
- [Option 3] - [Key benefit] - [Best for scenario]

**Considerations:**
- Component library size and quality
- Documentation and community support
- Customization capabilities
- Accessibility compliance
- Performance characteristics
- Learning curve for your team"

### 4. Facilitate Decision Process

"**Decision Framework:**

1. What's most important: Speed, uniqueness, or balance?
2. How much design expertise does your team have?
3. Are there existing brand guidelines to follow?
4. What's your timeline and budget?
5. Long-term maintenance needs?

Let's evaluate options based on your answers to these questions."

### 5. Finalize Design System Choice

"Based on our analysis, I recommend [Design System Choice] for {{project_name}}.

**Rationale:**
- [Reason 1 based on project needs]
- [Reason 2 based on constraints]
- [Reason 3 based on team considerations]

**Next Steps:**
- We'll customize this system to match your brand and needs
- Define component strategy for custom components needed
- Establish design tokens and patterns

Does this design system choice feel right to you?"

### 6. Generate Design System Content

#### Content Structure

```markdown
## Design System Foundation

### 1.1 Design System Choice

[Design system choice based on conversation]

### Rationale for Selection

[Rationale for design system selection based on conversation]

### Implementation Approach

[Implementation approach based on chosen system]

### Customization Strategy

[Customization strategy based on project needs]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 7.

---

# Step 7: Defining Core Experience

## Focus

Defining the core interaction that defines the product.

## Task

Define the core interaction that, if nailed, makes everything else follow in the user experience.

## Defining Experience Sequence

### 1. Identify the Defining Experience

"Every successful product has a defining experience - the core interaction that, if we nail it, everything else follows.

**Think about these famous examples:**
- Tinder: 'Swipe to match with people'
- Snapchat: 'Share photos that disappear'
- Instagram: 'Share perfect moments with filters'
- Spotify: 'Discover and play any song instantly'

**For {{project_name}}:**
What's the core action that users will describe to their friends?
What's the interaction that makes users feel successful?
If we get ONE thing perfectly right, what should it be?"

### 2. Explore the User's Mental Model

"**User Mental Model Questions:**
- How do users currently solve this problem?
- What mental model do they bring to this task?
- What's their expectation for how this should work?
- Where are they likely to get confused or frustrated?

**Current Solutions:**
- What do users love/hate about existing approaches?
- What shortcuts or workarounds do they use?
- What makes existing solutions feel magical or terrible?"

### 3. Define Success Criteria for Core Experience

"**Core Experience Success Criteria:**
- What makes users say 'this just works'?
- When do they feel smart or accomplished?
- What feedback tells them they're doing it right?
- How fast should it feel?
- What should happen automatically?

**Success Indicators:**
- [Success indicator 1]
- [Success indicator 2]
- [Success indicator 3]"

### 4. Identify Novel vs. Established Patterns

"**Pattern Analysis:**
Looking at your core experience, does this:
- Use established UX patterns that users already understand?
- Require novel interaction design that needs user education?
- Combine familiar patterns in innovative ways?

**If Novel:**
- What makes this different from existing approaches?
- How will we teach users this new pattern?
- What familiar metaphors can we use?

**If Established:**
- Which proven patterns should we adopt?
- How can we innovate within familiar patterns?
- What's our unique twist on established interactions?"

### 5. Define Experience Mechanics

"**Core Experience Mechanics:**
Let's design the step-by-step flow for [defining experience]:

**1. Initiation:**
- How does the user start this action?
- What triggers or invites them to begin?

**2. Interaction:**
- What does the user actually do?
- What controls or inputs do they use?
- How does the system respond?

**3. Feedback:**
- What tells users they're succeeding?
- How do they know when it's working?
- What happens if they make a mistake?

**4. Completion:**
- How do users know they're done?
- What's the successful outcome?
- What's next?"

### 6. Generate Defining Experience Content

#### Content Structure

```markdown
## 2. Core User Experience

### 2.1 Defining Experience

[Defining experience description based on conversation]

### 2.2 User Mental Model

[User mental model analysis based on conversation]

### 2.3 Success Criteria

[Success criteria for core experience based on conversation]

### 2.4 Novel UX Patterns

[Novel UX patterns analysis based on conversation]

### 2.5 Experience Mechanics

[Detailed mechanics for core experience based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 8.

---

# Step 8: Visual Foundation

## Focus

Establishing visual design foundation (colors, typography, spacing).

## Task

Establish the visual design foundation including color themes, typography, and spacing systems.

## Visual Foundation Sequence

### 1. Brand Guidelines Assessment

"Do you have existing brand guidelines or a specific color palette I should follow? (y/n)

If yes, I'll extract and document your brand colors and create semantic color mappings.
If no, I'll generate theme options based on your project's personality and emotional goals from our earlier discussion."

### 2. Generate Color Theme Options (If no brand guidelines)

"If no existing brand guidelines, I'll create a color theme visualizer to help you explore options.

I can generate comprehensive HTML color theme visualizers with multiple theme options, complete UI examples, and the ability to see how colors work in real interface contexts.

This will help you make an informed decision about the visual direction for {{project_name}}."

### 3. Define Typography System

"**Typography Questions:**
- What should the overall tone feel like? (Professional, friendly, modern, classic?)
- How much text content will users read? (Headings only? Long-form content?)
- Any accessibility requirements for font sizes or contrast?
- Any brand fonts we must use?

**Typography Strategy:**
- Choose primary and secondary typefaces
- Establish type scale (h1, h2, h3, body, etc.)
- Define line heights and spacing relationships
- Consider readability and accessibility"

### 4. Establish Spacing and Layout Foundation

"**Spacing and Layout Foundation:**
- How should the overall layout feel? (Dense and efficient? Airy and spacious?)
- What spacing unit should we use? (4px, 8px, 12px base?)
- How much white space should be between elements?
- Should we use a grid system? If so, what column structure?

**Layout Principles:**
- [Layout principle 1 based on product type]
- [Layout principle 2 based on user needs]
- [Layout principle 3 based on platform requirements]"

### 5. Create Visual Foundation Strategy

"**Visual Foundation Strategy:**

**Color System:**
- [Color strategy based on brand guidelines or generated themes]
- Semantic color mapping (primary, secondary, success, warning, error, etc.)
- Accessibility compliance (contrast ratios)

**Typography System:**
- [Typography strategy based on content needs and tone]
- Type scale and hierarchy
- Font pairing rationale

**Spacing & Layout:**
- [Spacing strategy based on content density and platform]
- Grid system approach
- Component spacing relationships

This foundation will ensure consistency across all our design decisions."

### 6. Generate Visual Foundation Content

#### Content Structure

```markdown
## Visual Design Foundation

### Color System

[Color system strategy based on conversation]

### Typography System

[Typography system strategy based on conversation]

### Spacing & Layout Foundation

[Spacing and layout foundation based on conversation]

### Accessibility Considerations

[Accessibility considerations based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 9.

---

# Step 9: Design Direction Mockups

## Focus

Generating and evaluating design direction variations.

## Task

Generate comprehensive design direction mockups showing different visual approaches for the product.

## Design Directions Sequence

### 1. Generate Design Direction Variations

"I'll generate 6-8 different design direction variations exploring:

- Different layout approaches and information hierarchy
- Various interaction patterns and visual weights
- Alternative color applications from our foundation
- Different density and spacing approaches
- Various navigation and component arrangements

Each mockup will show a complete vision for {{project_name}} with all our design decisions applied."

### 2. Create HTML Design Direction Showcase

"Design Direction Mockups Generated!

I'm creating a comprehensive HTML design direction showcase at `{planning_artifacts}/ux-design-directions.html`

**What you'll see:**
- 6-8 full-screen mockup variations
- Interactive states and hover effects
- Side-by-side comparison tools
- Complete UI examples with real content
- Responsive behavior demonstrations

Each mockup represents a complete visual direction for your app's look and feel."

### 3. Present Design Exploration Framework

"As you explore the design directions, look for:

- **Layout Intuitiveness** - Which information hierarchy matches your priorities?
- **Interaction Style** - Which interaction style fits your core experience?
- **Visual Weight** - Which visual density feels right for your brand?
- **Navigation Approach** - Which navigation pattern matches user expectations?
- **Component Usage** - How well do the components support your user journeys?
- **Brand Alignment** - Which direction best supports your emotional goals?

Take your time exploring - this is a crucial decision that will guide all our design work!"

### 4. Facilitate Design Direction Selection

"After exploring all the design directions:

**Which approach resonates most with you?**
- Pick a favorite direction as-is
- Combine elements from multiple directions
- Request modifications to any direction
- Use one direction as a base and iterate

**Tell me:**
- Which layout feels most intuitive for your users?
- Which visual weight matches your brand personality?
- Which interaction style supports your core experience?
- Are there elements from different directions you'd like to combine?"

### 5. Document Design Direction Decision

"Based on your exploration, I'm understanding your design direction preference:

**Chosen Direction:** [Direction number or combination]
**Key Elements:** [Specific elements you liked]
**Modifications Needed:** [Any changes requested]
**Rationale:** [Why this direction works for your product]

This will become our design foundation moving forward. Are we ready to lock this in, or do you want to explore variations?"

### 6. Generate Design Direction Content

#### Content Structure

```markdown
## Design Direction Decision

### Design Directions Explored

[Summary of design directions explored based on conversation]

### Chosen Direction

[Chosen design direction based on conversation]

### Design Rationale

[Rationale for design direction choice based on conversation]

### Implementation Approach

[Implementation approach based on chosen direction]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 10.

---

# Step 10: User Journey Flows

## Focus

Designing user flows and journey interactions.

## Task

Design detailed user journey flows for critical user interactions.

## User Journey Flows Sequence

### 1. Load PRD User Journeys as Foundation

"Great! Since we have the PRD available, let's build on the user journeys already documented there.

**Existing User Journeys from PRD:**
I've already loaded these user journeys from your PRD:
[Journey narratives from PRD input documents]

These journeys tell us **who** users are and **why** they take certain actions. Now we need to design **how** those journeys work in detail.

**Critical Journeys to Design Flows For:**
Looking at the PRD journeys, I need to design detailed interaction flows for:
- [Critical journey 1 identified from PRD narratives]
- [Critical journey 2 identified from PRD narratives]
- [Critical journey 3 identified from PRD narratives]

The PRD gave us the stories - now we design the mechanics!"

### 2. Design Each Journey Flow

For each critical journey, design detailed flow:

**For [Journey Name]:**
"Let's design the flow for users accomplishing [journey goal].

**Flow Design Questions:**
- How do users start this journey? (entry point)
- What information do they need at each step?
- What decisions do they need to make?
- How do they know they're progressing successfully?
- What does success look like for this journey?
- Where might they get confused or stuck?
- How do they recover from errors?"

### 3. Create Flow Diagrams

"I'll create detailed flow diagrams for each journey showing:

**[Journey Name] Flow:**
- Entry points and triggers
- Decision points and branches
- Success and failure paths
- Error recovery mechanisms
- Progressive disclosure of information

Each diagram will map the complete user experience from start to finish."

### 4. Optimize for Efficiency and Delight

"**Flow Optimization:**
For each journey, let's ensure we're:
- Minimizing steps to value (getting users to success quickly)
- Reducing cognitive load at each decision point
- Providing clear feedback and progress indicators
- Creating moments of delight or accomplishment
- Handling edge cases and error recovery gracefully

**Specific Optimizations:**
- [Optimization 1 for journey efficiency]
- [Optimization 2 for user delight]
- [Optimization 3 for error handling]"

### 5. Document Journey Patterns

"**Journey Patterns:**
Across these flows, I'm seeing some common patterns we can standardize:

**Navigation Patterns:**
- [Navigation pattern 1]
- [Navigation pattern 2]

**Decision Patterns:**
- [Decision pattern 1]
- [Decision pattern 2]

**Feedback Patterns:**
- [Feedback pattern 1]
- [Feedback pattern 2]

These patterns will ensure consistency across all user experiences."

### 6. Generate User Journey Content

#### Content Structure

```markdown
## User Journey Flows

### [Journey 1 Name]

[Journey 1 description and Mermaid diagram]

### [Journey 2 Name]

[Journey 2 description and Mermaid diagram]

### Journey Patterns

[Journey patterns identified based on conversation]

### Flow Optimization Principles

[Flow optimization principles based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 11.

---

# Step 11: Component Strategy

## Focus

Defining component library strategy and custom components.

## Task

Define component library strategy and design custom components not covered by the design system.

## Component Strategy Sequence

### 1. Analyze Design System Coverage

"Based on our chosen design system [design system from step 6], let's identify what components are already available and what we need to create custom.

**Available from Design System:**
[List of components available in chosen design system]

**Components Needed for {{project_name}}:**
Looking at our user journeys and design direction, we need:
- [Component need 1 from journey analysis]
- [Component need 2 from design requirements]
- [Component need 3 from core experience]

**Gap Analysis:**
- [Gap 1 - needed but not available]
- [Gap 2 - needed but not available]"

### 2. Design Custom Components

For each custom component needed, design thoroughly:

**For each custom component:**
"**[Component Name] Design:**

**Purpose:** What does this component do for users?
**Content:** What information or data does it display?
**Actions:** What can users do with this component?
**States:** What different states does it have? (default, hover, active, disabled, error, etc.)
**Variants:** Are there different sizes or styles needed?
**Accessibility:** What ARIA labels and keyboard support needed?

Let's walk through each custom component systematically."

### 3. Document Component Specifications

**Component Specification Template:**

```markdown
### [Component Name]

**Purpose:** [Clear purpose statement]
**Usage:** [When and how to use]
**Anatomy:** [Visual breakdown of parts]
**States:** [All possible states with descriptions]
**Variants:** [Different sizes/styles if applicable]
**Accessibility:** [ARIA labels, keyboard navigation]
**Content Guidelines:** [What content works best]
**Interaction Behavior:** [How users interact]
```

### 4. Define Component Strategy

"**Component Strategy:**

**Foundation Components:** (from design system)
- [Foundation component 1]
- [Foundation component 2]

**Custom Components:** (designed in this step)
- [Custom component 1 with rationale]
- [Custom component 2 with rationale]

**Implementation Approach:**
- Build custom components using design system tokens
- Ensure consistency with established patterns
- Follow accessibility best practices
- Create reusable patterns for common use cases"

### 5. Plan Implementation Roadmap

"**Implementation Roadmap:**

**Phase 1 - Core Components:**
- [Component 1] - needed for [critical flow]
- [Component 2] - needed for [critical flow]

**Phase 2 - Supporting Components:**
- [Component 3] - enhances [user experience]
- [Component 4] - supports [design pattern]

**Phase 3 - Enhancement Components:**
- [Component 5] - optimizes [user journey]
- [Component 6] - adds [special feature]

This roadmap helps prioritize development based on user journey criticality."

### 6. Generate Component Strategy Content

#### Content Structure

```markdown
## Component Strategy

### Design System Components

[Analysis of available design system components based on conversation]

### Custom Components

[Custom component specifications based on conversation]

### Component Implementation Strategy

[Component implementation strategy based on conversation]

### Implementation Roadmap

[Implementation roadmap based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 12.

---

# Step 12: UX Consistency Patterns

## Focus

Establishing consistency patterns for common UX situations.

## Task

Establish UX consistency patterns for common situations like buttons, forms, navigation, and feedback.

## UX Patterns Sequence

### 1. Identify Pattern Categories

"Let's establish consistency patterns for how {{project_name}} behaves in common situations.

**Pattern Categories to Define:**
- Button hierarchy and actions
- Feedback patterns (success, error, warning, info)
- Form patterns and validation
- Navigation patterns
- Modal and overlay patterns
- Empty states and loading states
- Search and filtering patterns

Which categories are most critical for your product? We can go through each thoroughly or focus on the most important ones."

### 2. Define Critical Patterns First

For [Critical Pattern Category]:
"**[Pattern Type] Patterns:**
What should users see/do when they need to [pattern action]?

**Considerations:**
- Visual hierarchy (primary vs. secondary actions)
- Feedback mechanisms
- Error recovery
- Accessibility requirements
- Mobile vs. desktop considerations

**Examples:**
- [Example 1 for this pattern type]
- [Example 2 for this pattern type]

How should {{project_name}} handle [pattern type] interactions?"

### 3. Establish Pattern Guidelines

**Pattern Guidelines Template:**

```markdown
### [Pattern Type]

**When to Use:** [Clear usage guidelines]
**Visual Design:** [How it should look]
**Behavior:** [How it should interact]
**Accessibility:** [A11y requirements]
**Mobile Considerations:** [Mobile-specific needs]
**Variants:** [Different states or styles if applicable]
```

### 4. Design System Integration

"**Integration with [Design System]:**
- How do these patterns complement our design system components?
- What customizations are needed?
- How do we maintain consistency while meeting unique needs?

**Custom Pattern Rules:**
- [Custom rule 1]
- [Custom rule 2]
- [Custom rule 3]"

### 5. Create Pattern Documentation

**Pattern Library Structure:**
- Clear usage guidelines for each pattern
- Visual examples and specifications
- Implementation notes for developers
- Accessibility checklists
- Mobile-first considerations

### 6. Generate UX Patterns Content

#### Content Structure

```markdown
## UX Consistency Patterns

### Button Hierarchy

[Button hierarchy patterns based on conversation]

### Feedback Patterns

[Feedback patterns based on conversation]

### Form Patterns

[Form patterns based on conversation]

### Navigation Patterns

[Navigation patterns based on conversation]

### Additional Patterns

[Additional patterns based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 13.

---

# Step 13: Responsive Design & Accessibility

## Focus

Responsive design strategy and accessibility compliance.

## Task

Define responsive design strategy and accessibility requirements for the product.

## Responsive & Accessibility Sequence

### 1. Define Responsive Strategy

"Let's define how {{project_name}} adapts across different screen sizes and devices.

**Responsive Design Questions:**

**Desktop Strategy:**
- How should we use extra screen real estate?
- Multi-column layouts, side navigation, or content density?
- What desktop-specific features can we include?

**Tablet Strategy:**
- Should we use simplified layouts or touch-optimized interfaces?
- How do gestures and touch interactions work on tablets?
- What's the optimal information density for tablet screens?

**Mobile Strategy:**
- Bottom navigation or hamburger menu?
- How do layouts collapse on small screens?
- What's the most critical information to show mobile-first?"

### 2. Establish Breakpoint Strategy

"**Breakpoint Strategy:**
We need to define screen size breakpoints where layouts adapt.

**Common Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**For {{project_name}}, should we:**
- Use standard breakpoints or custom ones?
- Focus on mobile-first or desktop-first design?
- Have specific breakpoints for your key use cases?"

### 3. Design Accessibility Strategy

"**Accessibility Strategy:**
What level of WCAG compliance does {{project_name}} need?

**WCAG Levels:**
- **Level A (Basic)** - Essential accessibility for legal compliance
- **Level AA (Recommended)** - Industry standard for good UX
- **Level AAA (Highest)** - Exceptional accessibility (rarely needed)

**Based on your product:**
- [Recommendation based on user base, legal requirements, etc.]

**Key Accessibility Considerations:**
- Color contrast ratios (4.5:1 for normal text)
- Keyboard navigation support
- Screen reader compatibility
- Touch target sizes (minimum 44x44px)
- Focus indicators and skip links"

### 4. Define Testing Strategy

"**Testing Strategy:**

**Responsive Testing:**
- Device testing on actual phones/tablets
- Browser testing across Chrome, Firefox, Safari, Edge
- Real device network performance testing

**Accessibility Testing:**
- Automated accessibility testing tools
- Screen reader testing (VoiceOver, NVDA, JAWS)
- Keyboard-only navigation testing
- Color blindness simulation testing

**User Testing:**
- Include users with disabilities in testing
- Test with diverse assistive technologies
- Validate with actual target devices"

### 5. Document Implementation Guidelines

"**Implementation Guidelines:**

**Responsive Development:**
- Use relative units (rem, %, vw, vh) over fixed pixels
- Implement mobile-first media queries
- Test touch targets and gesture areas
- Optimize images and assets for different devices

**Accessibility Development:**
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation implementation
- Focus management and skip links
- High contrast mode support"

### 6. Generate Responsive & Accessibility Content

#### Content Structure

```markdown
## Responsive Design & Accessibility

### Responsive Strategy

[Responsive strategy based on conversation]

### Breakpoint Strategy

[Breakpoint strategy based on conversation]

### Accessibility Strategy

[Accessibility strategy based on conversation]

### Testing Strategy

[Testing strategy based on conversation]

### Implementation Guidelines

[Implementation guidelines based on conversation]
```

Present A/P/C menu. When 'C' selected: append content, update frontmatter, proceed to Step 14.

---

# Step 14: Workflow Completion

## Focus

Workflow completion, validation, and next steps.

## Execution Protocols

- Show your analysis before taking any action
- Update the main workflow status file with completion information
- Suggest potential next workflow steps for the user
- DO NOT load additional steps after this one

## Termination Step Protocols

- This is a FINAL step - workflow completion required
- Update output file frontmatter, adding this step to the end of the list of stepsCompleted to indicate all is finished
- Output completion summary and next step guidance
- Update the main workflow status file with finalized document
- Suggest potential next workflow steps for the user
- Mark workflow as complete in status tracking

## Workflow Completion Sequence

### 1. Announce Workflow Completion

"**UX Design Complete, {{user_name}}!**

I've successfully collaborated with you to create a comprehensive UX design specification for {{project_name}}.

**What we've accomplished:**

- Project understanding and user insights
- Core experience and emotional response definition
- UX pattern analysis and inspiration
- Design system choice and implementation strategy
- Core interaction definition and experience mechanics
- Visual design foundation (colors, typography, spacing)
- Design direction mockups and visual explorations
- User journey flows and interaction design
- Component strategy and custom component specifications
- UX consistency patterns for common interactions
- Responsive design and accessibility strategy

**The complete UX design specification is now available at:** `{planning_artifacts}/ux-design-specification.md`

**Supporting Visual Assets:**
- Color themes visualizer: `{planning_artifacts}/ux-color-themes.html`
- Design directions mockups: `{planning_artifacts}/ux-design-directions.html`

This specification is now ready to guide visual design, implementation, and development."

### 2. Workflow Status Update

Update the main workflow status file:
- Load the project's workflow status file (if one exists)
- Update workflow_status["create-ux-design"] = `{planning_artifacts}/ux-design-specification.md`
- Save file, preserving all comments and structure
- Mark current timestamp as completion time

### 3. Suggest Next Steps

UX Design complete. Invoke the `bmad-help` skill.

### 4. Final Completion Confirmation

Congratulate the user on the completion you both completed together of the UX.

## Workflow Completion Checklist

### Design Specification Complete:
- [ ] Executive summary and project understanding
- [ ] Core experience and emotional response definition
- [ ] UX pattern analysis and inspiration
- [ ] Design system choice and strategy
- [ ] Core interaction mechanics definition
- [ ] Visual design foundation (colors, typography, spacing)
- [ ] Design direction decisions and mockups
- [ ] User journey flows and interaction design
- [ ] Component strategy and specifications
- [ ] UX consistency patterns documentation
- [ ] Responsive design and accessibility strategy

### Process Complete:
- [ ] All steps completed with user confirmation
- [ ] All content saved to specification document
- [ ] Frontmatter properly updated with all steps
- [ ] Workflow status file updated with completion
- [ ] Next steps clearly communicated

## Next Steps Guidance

**Immediate Options:**
1. **Wireframe Generation** - Create low-fidelity layouts based on UX spec
2. **Interactive Prototype** - Build clickable prototypes for testing
3. **Solution Architecture** - Technical design with UX context
4. **Figma Visual Design** - High-fidelity UI implementation
5. **Epic Creation** - Break down UX requirements for development

**Recommended Sequence:**
For design-focused teams: Wireframes -> Prototypes -> Figma Design -> Development
For technical teams: Architecture -> Epic Creation -> Development

Consider team capacity, timeline, and whether user validation is needed before implementation.

## Core Deliverables

- UX Design Specification: `{planning_artifacts}/ux-design-specification.md`
- Color Themes Visualizer: `{planning_artifacts}/ux-color-themes.html`
- Design Directions: `{planning_artifacts}/ux-design-directions.html`

---

# UX Design Specification Template

```markdown
---
stepsCompleted: []
inputDocuments: []
---

# UX Design Specification {{project_name}}

**Author:** {{user_name}}
**Date:** {{date}}

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->
```
