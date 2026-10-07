---
name: bmad-skill-party-mode
description: 'Orchestrates roundtable discussions between BMAD agents with automatic cross-listening. Agents are real subagents with independent thinking. Round 1 captures independent perspectives in parallel. Round 2 (automatic) enables cross-listening where each agent reads all Round 1 responses and reacts. Use when user requests party mode, roundtable, multi-agent discussion, or group debate.'
---

# Party Mode

## Overview

Party Mode facilitates roundtable discussions where BMAD agents participate as **real subagents** -- each spawned independently via the Agent tool so they think for themselves. The orchestrator picks voices, builds context, spawns agents in rounds, and presents their responses. Agents write their interventions to their own expert files (`experto-{name}.md`) and the orchestrator tracks session metadata in the stage log (`bitacora.md`).

### Why Rounds Matter

A single parallel spawn produces independent monologues -- agents never hear each other. Real roundtable discussions require **listening**. Party mode solves this with automatic rounds:

- **Round 1**: Parallel spawn -- genuine diversity of thought (no one has spoken yet)
- **Round 2**: Automatic cross-listening -- each agent reads ALL Round 1 responses and reacts
- **Round 3+**: Conditional -- only if unresolved tension remains

This gives the best of both worlds: independent perspectives AND real dialogue.

### How to Invoke

- **Standalone:** Ask for "party mode", "roundtable", "multi-agent discussion".
- **From workflows:** Select `[P]` when offered during a workflow, or `Debatir [Party Mode]` at gates.
- **Arguments:**
  - `--model <model>` -- Force all subagents to use a specific model (e.g. `--model haiku`, `--model opus`). When omitted, the orchestrator chooses the model that fits the round.
  - `--solo` -- Run without subagents. Roleplay all agents in a single response. Round 1 and Round 2 must be generated in SEPARATE messages to avoid convergence.
  - `--no-reply` -- Skip automatic Round 2. Only run initial perspectives (legacy behavior).
  - `--tools` -- Allow agents to use Grep/Glob/Read to investigate the codebase. Default when invoked from `/alfred`.

## On Activation

1. **Parse arguments** -- check for `--model`, `--solo`, `--no-reply`, and `--tools` flags.

2. **Read the agent manifest** at `./references/agent-manifest.csv`. Build an internal roster with displayName, title, icon, role, identity, communicationStyle, and principles.

3. **Load project context** -- search for `**/project-context.md` in `{project-root}`. If found, hold as background context.

4. **Locate expert files** -- if invoked from `/alfred`, check `{work_output_path}/` for existing `experto-{name}.md` files. These contain prior interventions from previous sessions.

5. **Welcome the user** -- briefly introduce party mode. Show the agent roster (icon + name + one-line role). Ask what to discuss.

## The Core Loop

For each user message:

### 1. Pick the Right Voices

Choose 2-4 agents whose expertise is most relevant. Guidelines:

- **Simple question**: 2 agents with the most relevant expertise
- **Complex or cross-cutting topic**: 3-4 agents from different domains
- **User names specific agents**: Always include those, plus 1-2 complementary voices
- **Rotate over time** -- avoid the same 2 agents dominating every round

### 2. Round 1: Opening Perspectives

Spawn all selected agents in parallel -- put all Agent tool calls in a single response.

**The agent prompt** (built from manifest data):

```
You are {displayName} ({title}), a BMAD agent in a collaborative roundtable discussion.

## Your Persona
- Icon: {icon}
- Communication Style: {communicationStyle}
- Principles: {principles}
- Identity: {identity}

## Discussion Context
{summary of the conversation so far, if any prior rounds exist}

{project context if relevant}

## Your Expert File
{contents of experto-{name}.md if it exists -- the agent's full history}

## The User's Message
{the user's actual message}

## Guidelines
- Respond authentically as {displayName}. Your perspective should reflect your genuine expertise.
- Start your response with: {icon} **{displayName}:**
- Scale your response to the substance -- don't pad. Brief point? Make it briefly.
- Disagree with other agents when your expertise tells you to. Don't hedge.
- If you have nothing substantive to add, say so in one sentence.
- You may ask the user direct questions if something needs clarification.
{if --tools or invoked from /alfred}
- You MUST investigate the codebase before opining. Use Grep, Glob, and Read to find relevant files. Cite file:line as evidence. Opinions without codebase evidence will be challenged at the gate.
{else}
- You may use Grep/Glob/Read if you need to verify a specific claim, but it is not required.
{end}
```

If `--model` was specified, use that model for all subagents. Otherwise, pick the model that matches the round.

**Solo mode**: Generate all agent responses in a single message, staying faithful to each persona.

**After receiving all responses:**
1. Present each response to the user -- complete, distinct, in their own voice. Never blend, paraphrase, or condense.
2. Append each agent's response to their `experto-{name}.md` file using the format:
   ```
   ## [{Name}] Party Mode — R1: Perspectiva inicial
   fecha: {YYYY-MM-DDTHH:MM}
   tema: "{topic}"
   ronda: 1 | agentes: [{all participants}]
   escucho_a: [ninguno]
   {full response}
   ```
3. Register in `bitacora.md`:
   ```
   ## [Orquestador] Party Mode iniciado
   fecha: {YYYY-MM-DDTHH:MM}
   tema: "{topic}"
   agentes: [{participants}]
   activacion: {automatica | manual}

   ## [Orquestador] Party Mode — Ronda 1 completada
   fecha: {YYYY-MM-DDTHH:MM}
   ronda: 1
   -> Ver respuestas en: {experto-a.md, experto-b.md, ...}
   ```

### 3. Round 2: Cross-Listening (Automatic)

Round 2 happens automatically after Round 1. Skip ONLY if `--no-reply` was specified.

**Purpose:** Each agent reads the FULL responses from all other agents and reacts. This is what makes it a real roundtable.

**Build the Round 2 prompt for each agent:**

```
You are {displayName} ({title}), continuing a roundtable discussion.

## Your Persona
{same persona block as Round 1}

## Round 1 Responses (Full Transcript)
{Full text of EVERY agent's Round 1 response, clearly labeled with icon + name}

## Your Round 1 Response (reminder)
{This agent's own Round 1 response}

## Your Task for Round 2
You already gave your initial perspective. Now you have heard everyone else.
React authentically:
- If someone changed your mind, say so and explain why
- If you disagree with a specific point, address it directly by name
- If you want to build on what someone said, do it
- If you have nothing new to add after hearing others, say "I stand by my initial position" in one sentence
- You may ask another agent a direct question
- Do NOT repeat your Round 1 response. Only add what is NEW after hearing others.
Start with: {icon} **{displayName} (Reply):**
{same tools guidelines as Round 1}
```

**Spawn all agents in parallel** -- each gets the same full transcript of Round 1 responses.

**Solo mode**: Generate Round 2 in a SEPARATE message from Round 1. This separation is critical -- even in solo mode, the orchestrator must reset between rounds to avoid the convergence effect of one LLM generating all voices sequentially.

**After receiving all responses:**
1. Present each response to the user.
2. Append to each `experto-{name}.md`:
   ```
   ## [{Name}] Party Mode — R2: Replica
   fecha: {YYYY-MM-DDTHH:MM}
   tema: "{topic}"
   ronda: 2 | agentes: [{all participants}]
   escucho_a: [{all OTHER participants from R1}]
   {full response}
   ```
3. Register in `bitacora.md`:
   ```
   ## [Orquestador] Party Mode — Ronda 2 completada
   fecha: {YYYY-MM-DDTHH:MM}
   ronda: 2
   -> Ver respuestas en: {experto-a.md, experto-b.md, ...}
   ```

### 4. Assess and Optionally Continue

After presenting Round 2, evaluate whether more rounds are needed.

**Auto-trigger Round 3 if:**
- An agent explicitly asked another agent a direct question
- Two agents directly contradict each other with no resolution
- An agent said "I'd need to hear more from X about..."

**Do NOT auto-trigger if:**
- Agents are converging or explicitly agreeing
- Responses are getting shorter (diminishing returns)
- Round 2 responses are mostly "I stand by my position"

If Round 3 is warranted, briefly tell the user:
"There's unresolved tension between {Agent A} and {Agent B} on {topic}. Running one more round."

For Round 3+, pass the cumulative transcript (all prior round responses from expert files).

**Maximum: 3 automatic rounds.** After that, present an Orchestrator Note summarizing the state and let the user drive.

### 5. Present After Each Round

Present each agent's full response to the user after EVERY round -- do not hold responses waiting for the next round.

Format: each agent's response one after another, separated by a blank line. No introductions, no framing -- just the responses.

After the final round, add an **Orchestrator Note** (clearly labeled):
- Points of agreement
- Points of disagreement
- Open questions
- Suggested next step

Keep the note under 5 bullet points.

### 6. Handle Follow-ups

The user drives what happens next. Common patterns:

| User says... | You do... |
|---|---|
| Continues the general discussion | Pick fresh agents, repeat the loop |
| "Winston, what do you think about what Sally said?" | Spawn just Winston with Sally's response as context |
| "Bring in Quinn on this" | Spawn Quinn with summary + expert files of discussion |
| "I agree with John, let's go deeper" | Spawn John + 1-2 others to expand |
| "What would Mary think about Winston's approach?" | Spawn Mary with Winston's response as context |
| Asks a question directed at everyone | Back to step 1 with all agents |
| "One more round" | Run another round with cumulative transcript from expert files |
| "They're going in circles, wrap it up" | Skip to synthesis and close |

Each spawn is cheap and independent. You can spawn any combination at any time.

## Keeping Context Manageable

**Within a party session (Rounds 1-3):** Pass FULL responses between rounds. Never summarize within an active session. The cost is modest: 3 agents x ~500 words = ~1500 words of cross-context per round.

**Follow-up questions after party concludes:** Summarize the party outcome in ~400 words, focusing on conclusions and unresolved tensions.

**New party session on same topic:** Read the expert files for prior session history. Provide a ~600 word summary of prior session outcomes.

The expert files (`experto-{name}.md`) are the persistent record. When context gets long, the orchestrator reads these files to build context rather than inlining the full history.

## File Formats

Expert files and log entries follow the templates defined in:
- `agent-os/templates/work-record/experto.md` -- expert file format

When invoked from `/alfred`, files are written to `{work_output_path}/`.
When standalone, files are written to `_bmad/party-logs/` if the directory exists.

## When Things Go Sideways

- **Agents are all saying the same thing**: Bring in a contrarian voice, or ask a specific agent to play devil's advocate.
- **Discussion is going in circles**: Summarize the impasse and ask the user what angle to explore next.
- **User seems disengaged**: Ask directly -- continue, change topic, or wrap up?
- **Agent gives a weak response**: Do not retry. Present it and let the user decide.
- **Round 2 just echoes Round 1**: Stop after Round 2. The topic may not have enough tension for meaningful cross-pollination. Summarize and move on.
- **All agents converge in Round 1**: Skip Round 2 -- go directly to synthesis. No need to force a reply round when everyone agrees.

## Exit

**Cuando party-mode corre dentro de un gate de `/disenar` o `/alfred`:** los hallazgos del party (acuerdos, tensiones, invariantes detectados) NO se absorben directo al artefacto. Pasan por el **loop de validación de hallazgos con el usuario** — los 4 caminos del loop se mapean así: "De acuerdo / acepto síntesis" = camino A; "traer otro experto / otra técnica" = camino B, escalada adversarial heredando el contexto acumulado; "cerrar el party sin absorber / volver al gate" = camino C; "comento / aporto contexto" = camino D, nueva ronda con el mensaje del usuario. El party presenta sus respuestas en pantalla (no "ver archivo X") y el usuario responde en el prompt libre.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Los 4 caminos". Aqui se mapea el follow-up de party-mode a los 4 caminos del loop. La mecanica y persistencia (hereda_de:) viven en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

**Cuando el roundtable toca un artefacto multi-dominio** (credenciales, tokens, interconexión firmada, campo cifrado en BD: cualquier pieza con 2+ dueños de dominio), el party NO reemplaza al **Acuerdo de Juntura**. La opinión de un experto en un roundtable no es un veredicto de dueño de dominio: la juntura exige veredicto anclado en evidencia, ronda adversarial cruzada y firma escrita de cada dueño, y sin esas firmas el gate de la pieza no cierra. Si el party destapa que la pieza es una juntura, el orquestador lo declara y convoca a los dueños bajo ese protocolo.

<!-- FUENTE: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Protocolo (4 reglas)". Aqui solo se declara que un roundtable no sustituye a la juntura. NO duplicar la regla — para modificar, editar la fuente. -->

When the user says they are done ("thanks", "that's all", "end party mode", etc.):

1. **Present an executive summary to the user on screen.** Do NOT just say "see file X". The user should see the outcome directly, concise and actionable:
   - Agreements and unresolved tensions (bullet points)
   - Tasks added, removed, or modified (table)
   - Accepted risks (table)
   - Recommended execution order (numbered blocks)

   **Keep it executive.** No rondas de debate, no citas de codigo, no argumentos de cada experto. Solo: que se decidio, que cambio, que sigue.

2. **Persist the full detail to files** -- this is where the "how we got here" lives:
   - Each agent's interventions with code evidence go to their `experto-{name}.md`
   - The complete rounds (arguments, counter-arguments, code citations) go to the party session record
   - This detail is valuable context for the agent that will execute the tasks later

3. Register metadata in `bitacora.md`:
   ```
   ## [Orquestador] Party Mode cerrado
   fecha: {YYYY-MM-DDTHH:MM}
   rondas_totales: {N}
   sintesis:
   - Acuerdos: {convergence points}
   - Tensiones: {unresolved points}
   - Preguntas abiertas: {if any}
   ```

4. Return to normal mode.

Do not force exit triggers -- read the room.
