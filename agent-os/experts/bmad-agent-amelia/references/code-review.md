---
name: Code Review
description: Review code changes adversarially using parallel review layers with structured triage into actionable categories
menu-code: CR
---

# Code Review Workflow

**Goal:** Review code changes adversarially using parallel review layers and structured triage.

**Your Role:** You are an elite code reviewer. You gather context, launch parallel adversarial reviews, triage findings with precision, and present actionable results. No noise, no filler.

---

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Persist progress via in-memory variables
- **Append-Only Building**: Build artifacts incrementally

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **WAIT FOR INPUT**: Halt at checkpoints and wait for human
4. **LOAD NEXT**: When directed, follow the next step

### Critical Rules (NO EXCEPTIONS)

- **NEVER** load multiple steps simultaneously
- **ALWAYS** read entire step before execution
- **NEVER** skip steps or optimize the sequence
- **ALWAYS** follow the exact instructions in the step
- **ALWAYS** halt at checkpoints and wait for human input

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `planning_artifacts`, `implementation_artifacts`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime
- `sprint_status` = `{implementation_artifacts}/sprint-status.yaml`
- `project_context` = `**/project-context.md` (load if exists)
- CLAUDE.md / memory files (load if exist)

YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`.

### 2. Begin Execution

Proceed to Step 1 below.

---

## Step 1: Gather Context

### Variables

```
diff_output: '' # set at runtime
spec_file: '' # set at runtime (path or empty)
review_mode: '' # set at runtime: "full" or "no-spec"
story_key: '' # set at runtime when discovered from sprint status
```

### Rules

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- The prompt that triggered this workflow IS the intent -- not a hint.
- Do not modify any files. This step is read-only.

### Instructions

1. **Detect review intent from invocation text.** Check the triggering prompt for phrases that map to a review mode:
   - "staged" / "staged changes" -> Staged changes only
   - "uncommitted" / "working tree" / "all changes" -> Uncommitted changes (staged + unstaged)
   - "branch diff" / "vs main" / "against main" / "compared to {branch}" -> Branch diff (extract base branch if mentioned)
   - "commit range" / "last N commits" / "{sha}..{sha}" -> Specific commit range
   - "this diff" / "provided diff" / "paste" -> User-provided diff (do not match bare "diff" -- it appears in other modes)
   - When multiple phrases match, prefer the most specific match (e.g., "branch diff" over bare "diff").
   - **If a clear match is found:** Announce the detected mode (e.g., "Detected intent: review staged changes only") and proceed directly to constructing `{diff_output}` using the corresponding sub-case from instruction 3. Skip to instruction 4 (spec question).
   - **If no match from invocation text, check sprint tracking.** Look for a sprint status file (`*sprint-status*`) in `{implementation_artifacts}` or `{planning_artifacts}`. If found, scan for any story with status `review`. Handle as follows:
     - **Exactly one `review` story:** Set `{story_key}` to the story's key (e.g., `1-2-user-auth`). Suggest it: "I found story {{story-id}} in `review` status. Would you like to review its changes? [Y] Yes / [N] No, let me choose". If confirmed, use the story context to determine the diff source (branch name derived from story slug, or uncommitted changes). If declined, clear `{story_key}` and fall through to instruction 2.
     - **Multiple `review` stories:** Present them as numbered options alongside a manual choice option. Wait for user selection. If the user selects a story, set `{story_key}` to the selected story's key and use the selected story's context to determine the diff source as in the single-story case above, and proceed to instruction 3. If the user selects the manual choice, clear `{story_key}` and fall through to instruction 2.
   - **If no match and no sprint tracking:** Fall through to instruction 2.

2. HALT. Ask the user: **What do you want to review?** Present these options:
   - **Uncommitted changes** (staged + unstaged)
   - **Staged changes only**
   - **Branch diff** vs a base branch (ask which base branch)
   - **Specific commit range** (ask for the range)
   - **Provided diff or file list** (user pastes or provides a path)

3. Construct `{diff_output}` from the chosen source.
   - For **branch diff**: verify the base branch exists before running `git diff`. If it does not exist, HALT and ask the user for a valid branch.
   - For **commit range**: verify the range resolves. If it does not, HALT and ask the user for a valid range.
   - For **provided diff**: validate the content is non-empty and parseable as a unified diff. If it is not parseable, HALT and ask the user to provide a valid diff.
   - For **file list**: validate each path exists in the working tree. Construct `{diff_output}` by running `git diff HEAD -- <path1> <path2> ...`. If any paths are untracked (new files not yet staged), use `git diff --no-index /dev/null <path>` to include them. If the diff is empty (files have no uncommitted changes and are not untracked), ask the user whether to review the full file contents or to specify a different baseline.
   - After constructing `{diff_output}`, verify it is non-empty regardless of source type. If empty, HALT and tell the user there is nothing to review.

4. Ask the user: **Is there a spec or story file that provides context for these changes?**
   - If yes: set `{spec_file}` to the path provided, verify the file exists and is readable, then set `{review_mode}` = `"full"`.
   - If no: set `{review_mode}` = `"no-spec"`.

5. If `{review_mode}` = `"full"` and the file at `{spec_file}` has a `context` field in its frontmatter listing additional docs, load each referenced document. Warn the user about any docs that cannot be found.

6. Sanity check: if `{diff_output}` exceeds approximately 3000 lines, warn the user and offer to chunk the review by file group.
   - If the user opts to chunk: agree on the first group, narrow `{diff_output}` accordingly, and list the remaining groups for the user to note for follow-up runs.
   - If the user declines: proceed as-is with the full diff.

### Checkpoint

Present a summary before proceeding: diff stats (files changed, lines added/removed), `{review_mode}`, and loaded spec/context docs (if any). HALT and wait for user confirmation to proceed.

---

## Step 2: Review

### Variables

```
failed_layers: '' # set at runtime: comma-separated list of layers that failed or returned empty
```

### Rules

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- The Blind Hunter subagent receives NO project context -- diff only.
- The Edge Case Hunter subagent receives diff and project read access.
- The Acceptance Auditor subagent receives diff, spec, and context docs.

### Instructions

1. If `{review_mode}` = `"no-spec"`, note to the user: "Acceptance Auditor skipped -- no spec file provided."

2. Launch parallel subagents without conversation context. If subagents are not available, generate prompt files in `{implementation_artifacts}` -- one per reviewer role below -- and HALT. Ask the user to run each in a separate session (ideally a different LLM) and paste back the findings. When findings are pasted, resume from this point and proceed to step 3.

   - **Blind Hunter** -- receives `{diff_output}` only. No spec, no context docs, no project access. Invoke via the `bmad-review-adversarial-general` skill.

   - **Edge Case Hunter** -- receives `{diff_output}` and read access to the project. Invoke via the `bmad-review-edge-case-hunter` skill.

   <!-- FUENTE: agent-os/skills/principios-diseno/references/solid.md y patrones.md. En code review la lente detecta violaciones SOLID y anti-patrones como hallazgos con severidad (medio/bajo) que entran al triage normal; NO bloquean. NO duplicar -- editar la fuente. -->
   - **Lente de principios de diseno**: al revisar mantenibilidad, contrastar contra `agent-os/skills/principios-diseno/references/solid.md`. Reportar violaciones SOLID (Controller que orquesta+valida+persiste, switch por tipo que pide OCP, `new` de infraestructura en la BL que viola DIP) y anti-patrones como findings con severidad tipica medio/bajo. Entran al triage de Step 3 como cualquier finding; nunca son bloqueo de cierre.

   - **Acceptance Auditor** (only if `{review_mode}` = `"full"`) -- receives `{diff_output}`, the content of the file at `{spec_file}`, and any loaded context docs. Its prompt:
     > You are an Acceptance Auditor. Review this diff against the spec and context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

3. **Subagent failure handling**: If any subagent fails, times out, or returns empty results, append the layer name to `{failed_layers}` (comma-separated) and proceed with findings from the remaining layers.

4. Collect all findings from the completed layers.

---

## Step 3: Triage

### Rules

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- Be precise. When uncertain between categories, prefer the more conservative classification.

### Instructions

1. **Normalize** findings into a common format. Expected input formats:
   - Adversarial (Blind Hunter): markdown list of descriptions
   - Edge Case Hunter: JSON array with `location`, `trigger_condition`, `guard_snippet`, `potential_consequence` fields
   - Acceptance Auditor: markdown list with title, AC/constraint reference, and evidence

   If a layer's output does not match its expected format, attempt best-effort parsing. Note any parsing issues for the user.

   Convert all to a unified list where each finding has:
   - `id` -- sequential integer
   - `source` -- `blind`, `edge`, `auditor`, or merged sources (e.g., `blind+edge`)
   - `title` -- one-line summary
   - `detail` -- full description
   - `location` -- file and line reference (if available)

2. **Deduplicate.** If two or more findings describe the same issue, merge them into one:
   - Use the most specific finding as the base (prefer edge-case JSON with location over adversarial prose).
   - Append any unique detail, reasoning, or location references from the other finding(s) into the surviving `detail` field.
   - Set `source` to the merged sources (e.g., `blind+edge`).

3. **Classify** each finding into exactly one bucket:
   - **decision_needed** -- There is an ambiguous choice that requires human input. The code cannot be correctly patched without knowing the user's intent. Only possible if `{review_mode}` = `"full"`.
   - **patch** -- Code issue that is fixable without human input. The correct fix is unambiguous.
   - **defer** -- Pre-existing issue not caused by the current change. Real but not actionable now.
   - **dismiss** -- Noise, false positive, or handled elsewhere.

   If `{review_mode}` = `"no-spec"` and a finding would otherwise be `decision_needed`, reclassify it as `patch` (if the fix is unambiguous) or `defer` (if not).

4. **Drop** all `dismiss` findings. Record the dismiss count for the summary.

5. If `{failed_layers}` is non-empty, report which layers failed before announcing results. If zero findings remain after dropping dismissed AND `{failed_layers}` is non-empty, warn the user that the review may be incomplete rather than announcing a clean review.

6. If zero findings remain after triage (all rejected or none raised): state "Clean review -- all layers passed." (Step 3 already warned if any review layers failed via `{failed_layers}`.)

---

## Step 4: Present and Act

### Variables

```
deferred_work_file: '{implementation_artifacts}/deferred-work.md'
```

### Rules

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- When `{spec_file}` is set, always write findings to the story file before offering action choices.
- `decision-needed` findings must be resolved before handling `patch` findings.

### Instructions

#### 1. Clean review shortcut

If zero findings remain after triage (all dismissed or none raised): state that and proceed to section 6 (Sprint Status Update).

#### 2. Write findings to the story file

If `{spec_file}` exists and contains a Tasks/Subtasks section, append a `### Review Findings` subsection. Write all findings in this order:

1. **`decision-needed`** findings (unchecked):
   `- [ ] [Review][Decision] <Title> -- <Detail>`

2. **`patch`** findings (unchecked):
   `- [ ] [Review][Patch] <Title> [<file>:<line>]`

3. **`defer`** findings (checked off, marked deferred):
   `- [x] [Review][Defer] <Title> [<file>:<line>] -- deferred, pre-existing`

Also append each `defer` finding to `{deferred_work_file}` under a heading `## Deferred from: code review ({date})`. If `{spec_file}` is set, include its basename in the heading (e.g., `code review of story-3.3 (2026-03-18)`). One bullet per finding with description.

#### 3. Present summary

Announce what was written:

> **Code review complete.** <D> `decision-needed`, <P> `patch`, <W> `defer`, <R> dismissed as noise.

If `{spec_file}` is set, add: `Findings written to the review findings section in {spec_file}.`
Otherwise add: `Findings are listed above. No story file was provided, so nothing was persisted.`

#### 4. Resolve decision-needed findings

If `decision_needed` findings exist, present each one with its detail and the options available. The user must decide -- the correct fix is ambiguous without their input. Walk through each finding (or batch related ones) and get the user's call. Once resolved, each becomes a `patch`, `defer`, or is dismissed.

If the user chooses to defer, ask: Quick one-line reason for deferring this item? (helps future reviews): -- then append that reason to both the story file bullet and the `{deferred_work_file}` entry.

**HALT** -- I am waiting for your numbered choice. Reply with only the number (or "0" for batch). Do not proceed until you select an option.

#### 5. Handle `patch` findings

If `patch` findings exist (including any resolved from step 4), HALT. Ask the user:

If `{spec_file}` is set, present all three options (if >3 `patch` findings exist, also show option 0):

> **How would you like to handle the <Z> `patch` findings?**
> 0. **Batch-apply all** -- automatically fix every non-controversial patch (recommended when there are many)
> 1. **Fix them automatically** -- I will apply fixes now
> 2. **Leave as action items** -- they are already in the story file
> 3. **Walk through each** -- let me show details before deciding

If `{spec_file}` is **not** set, present only options 1 and 3 (omit option 2 -- findings were not written to a file). If >3 `patch` findings exist, also show option 0:

> **How would you like to handle the <Z> `patch` findings?**
> 0. **Batch-apply all** -- automatically fix every non-controversial patch (recommended when there are many)
> 1. **Fix them automatically** -- I will apply fixes now
> 2. **Walk through each** -- let me show details before deciding

**HALT** -- I am waiting for your numbered choice. Reply with only the number (or "0" for batch). Do not proceed until you select an option.

- **Option 0** (only when >3 findings): Apply all non-controversial patches without per-finding confirmation. Skip any finding that requires judgment. Present a summary of changes made and any skipped findings.
- **Option 1**: Apply each fix. After all patches are applied, present a summary of changes made. If `{spec_file}` is set, check off the items in the story file.
- **Option 2** (only when `{spec_file}` is set): Done -- findings are already written to the story.
- **Walk through each**: Present each finding with full detail, diff context, and suggested fix. After walkthrough, re-offer the applicable options above.

  **HALT** -- I am waiting for your numbered choice. Reply with only the number (or "0" for batch). Do not proceed until you select an option.

**Code review actions complete**

- Decision-needed resolved: <D>
- Patches handled: <P>
- Deferred: <W>
- Dismissed: <R>

#### 6. Update story status and sync sprint tracking

Skip this section if `{spec_file}` is not set.

**Determine new status based on review outcome:**

- If all `decision-needed` and `patch` findings were resolved (fixed or dismissed) AND no unresolved HIGH/MEDIUM issues remain: set `{new_status}` = `done`. Update the story file Status section to `done`.
- If `patch` findings were left as action items, or unresolved issues remain: set `{new_status}` = `in-progress`. Update the story file Status section to `in-progress`.

Save the story file.

**Sync sprint-status.yaml:**

If `{story_key}` is not set, skip this subsection and note that sprint status was not synced because no story key was available.

If `{sprint_status}` file exists:

1. Load the FULL `{sprint_status}` file.
2. Find the `development_status` entry matching `{story_key}`.
3. If found: update `development_status[{story_key}]` to `{new_status}`. Update `last_updated` to current date. Save the file, preserving ALL comments and structure including STATUS DEFINITIONS.
4. If `{story_key}` not found in sprint status: warn the user that the story file was updated but sprint-status sync failed.

If `{sprint_status}` file does not exist, note that story status was updated in the story file only.

**Completion summary:**

> **Review Complete!**
>
> **Story Status:** `{new_status}`
> **Issues Fixed:** <fixed_count>
> **Action Items Created:** <action_count>
> **Deferred:** <W>
> **Dismissed:** <R>

#### 7. Next steps

Present the user with follow-up options:

> **What would you like to do next?**
> 1. **Start the next story** -- run `dev-story` to pick up the next `ready-for-dev` story
> 2. **Re-run code review** -- address findings and review again
> 3. **Done** -- end the workflow

**HALT** -- I am waiting for your choice. Do not proceed until the user selects an option.
