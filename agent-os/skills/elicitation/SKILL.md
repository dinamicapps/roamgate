---
name: bmad-skill-elicitation
description: 'Advanced elicitation skill with 50 structured reasoning methods to push the LLM to reconsider, refine, and improve its recent output. Use when user asks for deeper critique, mentions a known method (e.g. socratic, first principles, pre-mortem, red team), or selects [A] Advanced Elicitation from a workflow prompt.'
---

# Advanced Elicitation

## Overview

Push the LLM to reconsider, refine, and improve its recent output using 50 structured reasoning methods spanning collaboration, advanced reasoning, competitive analysis, technical review, creative ideation, research, risk assessment, core analysis, learning, philosophical inquiry, and retrospective reflection.

This skill can be invoked:

- **Standalone:** Directly by the user to enhance any content or output in the current conversation.
- **From workflows:** When a workflow presents an `[A] Advanced Elicitation` option, this skill is activated to iteratively refine the current section before proceeding.

When invoked from a workflow, the skill receives the current section content, applies one or more elicitation methods iteratively, and returns the enhanced version back to the workflow upon completion.

## How to Invoke

- Directly reference a method name (e.g. "apply socratic questioning", "run a pre-mortem", "red team this")
- Select `[A]` from a workflow prompt that offers Advanced Elicitation
- Ask for "deeper critique", "challenge this", "stress test", or similar phrasing

## CRITICAL LLM INSTRUCTIONS

- **MANDATORY:** Execute ALL steps in the flow section IN EXACT ORDER
- DO NOT skip steps or change the sequence
- HALT immediately when halt-conditions are met
- Each action within a step is a REQUIRED action to complete that step
- Sections outside flow (validation, output, critical-context) provide essential context - review and apply throughout execution
- **YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the `communication_language`**

---

## INTEGRATION (When Invoked Indirectly)

When invoked from another prompt or process:

1. Receive or review the current section content that was just generated
2. Apply elicitation methods iteratively to enhance that specific content
3. Return the enhanced version back when user selects 'x' to proceed and return back
4. The enhanced content replaces the original section content in the output document

---

## On Activation

1. Load the methods database from `./references/methods.csv`
2. If `{project-root}/_bmad/config.yaml` exists, read it for project context (output language, user preferences)
3. If `{project-root}/_bmad/config.user.yaml` exists, read it for `communication_language` and `user_name`
4. Analyze the current conversation context to understand what content is being refined
5. Proceed to **Step 1: Method Registry Loading**

---

## FLOW

### Step 1: Method Registry Loading

**Action:** Load and read `./references/methods.csv`

#### CSV Structure

- **num:** Method number (1-50)
- **category:** Method grouping (core, structural, risk, collaboration, etc.)
- **method_name:** Display name for the method
- **description:** Rich explanation of what the method does, when to use it, and why it is valuable
- **output_pattern:** Flexible flow guide using arrows (e.g., "analysis -> insights -> action")

#### Context Analysis

- Use conversation history
- Analyze: content type, complexity, stakeholder needs, risk level, and creative potential

#### Smart Selection

1. Analyze context: Content type, complexity, stakeholder needs, risk level, creative potential
2. Parse descriptions: Understand each method's purpose from the rich descriptions in CSV
3. Select 5 methods: Choose methods that best match the context based on their descriptions
4. Balance approach: Include mix of foundational and specialized techniques as appropriate

---

### Step 2: Present Options and Handle Responses

#### Display Format

```
**Advanced Elicitation Options**
Choose a number (1-5), [r] to Reshuffle, [a] List All, or [x] to Proceed:

1. [Method Name]
2. [Method Name]
3. [Method Name]
4. [Method Name]
5. [Method Name]
r. Reshuffle the list with 5 new options
a. List all methods with descriptions
x. Proceed / No Further Actions
```

#### Response Handling

**Case 1-5 (User selects a numbered method):**

- Execute the selected method using its description from the CSV
- Adapt the method's complexity and output format based on the current context
- Apply the method creatively to the current section content being enhanced
- Display the enhanced version showing what the method revealed or improved
- **CRITICAL:** Ask the user if they would like to apply the changes to the doc (y/n/other) and HALT to await response.
- **CRITICAL:** ONLY if Yes, apply the changes. IF No, discard your memory of the proposed changes. If any other reply, try best to follow the instructions given by the user.
- **CRITICAL:** Re-present the same 1-5,r,x prompt to allow additional elicitations

**Case r (Reshuffle):**

- Select 5 random methods from methods.csv, present new list with same prompt format
- When selecting, try to think and pick a diverse set of methods covering different categories and approaches, with 1 and 2 being potentially the most useful for the document or section being discovered

**Case x (Proceed):**

- Complete elicitation and proceed
- Return the fully enhanced content back to the invoking skill
- The enhanced content becomes the final version for that section
- Signal completion back to the invoking skill to continue with next section

**Case a (List All):**

- List all methods with their descriptions from the CSV in a compact table
- Allow user to select any method by name or number from the full list
- After selection, execute the method as described in the Case 1-5 above

**Case: Direct Feedback:**

- Apply changes to current section content and re-present choices

**Case: Multiple Numbers:**

- Execute methods in sequence on the content, then re-offer choices

---

### Step 3: Execution Guidelines

- **Method execution:** Use the description from CSV to understand and apply each method
- **Output pattern:** Use the pattern as a flexible guide (e.g., "paths -> evaluation -> selection")
- **Dynamic adaptation:** Adjust complexity based on content needs (simple to sophisticated)
- **Creative application:** Interpret methods flexibly based on context while maintaining pattern consistency
- Focus on actionable insights
- **Stay relevant:** Tie elicitation to specific content being analyzed (the current section from the document being created unless user indicates otherwise)
- **Identify personas:** For single or multi-persona methods, clearly identify viewpoints
- **Critical loop behavior:** Always re-offer the 1-5,r,a,x choices after each method execution
- Continue until user selects 'x' to proceed with enhanced content, confirm or ask the user what should be accepted from the session
- Each method application builds upon previous enhancements
- **Content preservation:** Track all enhancements made during elicitation
- **Iterative enhancement:** Each selected method (1-5) should:
  1. Apply to the current enhanced version of the content
  2. Show the improvements made
  3. Return to the prompt for additional elicitations or completion
