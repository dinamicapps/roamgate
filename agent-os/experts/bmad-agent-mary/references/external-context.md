---
name: external-context
description: Lightweight external context analysis — quick web research (3-5 searches) for pre-discovery in agent-os workflows
menu-code: ANA
---

# External Context Analysis (ANA)

**Goal:** Rapid external context research (3-5 targeted searches) to inform pre-discovery analysis. NOT the full MR/DR/TR interactive workflow — this is a lightweight, autonomous capability designed to run as part of the abordaje.

**Prerequisite:** Web search via MCP tools (Jina, WebSearch). If unavailable, report gracefully and continue without external research — do NOT block the flow.

**Que significa degradar, exactamente.** La regla de la URL dice que **un hallazgo externo sin
URL no entra**, no que el flujo se detenga. Sin busqueda disponible: no hay hallazgos externos,
ninguna capacidad nace con `sustento: externo`, y quien invoca lo declara en su artefacto. La
fase que llama NO se salta — confrontar contra el codebase y cortar en etapas no dependen del
barrido.

---

## Input

- **Work description**: What the user wants to build/change (from work.md or direct input)
- **Project context**: `project-context.md` if available — project standards, tech stack, domain

---

## Step 1: Classify Investigation Type

Based on the work description, classify into ONE primary type:

| Work Type | Investigation Type | Focus |
|-----------|-------------------|-------|
| Nueva funcionalidad / nuevo feature | `competencia` | Direct competitors, similar solutions, domain trends |
| Nuevo modulo / nuevo sistema | `regulatorio` | Applicable regulations, industry best practices, compliance |
| Integracion con sistema externo | `tecnico` | System documentation, public APIs, integration experiences |
| Mejora UX / nuevo flujo de usuario | `dominio` | UX patterns, industry standards, user expectations |
| Idea nueva sin equivalente en el repo ("quiero algo tipo X") | `prior-art` | Proyectos y repos que resuelven lo mismo; que capacidades tienen y cuales se pueden tomar prestadas |

### Skip Criteria — Do NOT investigate if:

- Bugfix or hotfix
- Pure refactor / tech debt cleanup
- Internal tooling with no end-user impact
- Work description is too vague to form meaningful queries (ask for clarification instead)

If skip criteria match, output:

```markdown
## [Mary] Contexto externo
fecha: {timestamp}
tipo_investigacion: N/A — no aplica
razon: {bugfix | refactor | interno | otro}

No se requiere investigacion externa para este tipo de trabajo.
```

**Stop here.**

---

## Step 2: Design Search Queries

Design 3-5 targeted searches based on classification:

### For `competencia`:
1. "{domain/product area} software solutions {year}"
2. "{specific feature} competitors comparison"
3. "{industry} {feature type} trends {year}"
4. (optional) "{competitor name} features pricing" — if known competitors exist
5. (optional) "{domain} market landscape"

### For `regulatorio`:
1. "{industry} regulations {country/region} {year}"
2. "{domain} compliance requirements software"
3. "{specific regulation name} implementation guide" — if regulation is known
4. (optional) "{industry} data protection requirements"
5. (optional) "{domain} audit compliance checklist"

### For `tecnico`:
1. "{external system} API documentation"
2. "{external system} integration guide {tech stack}"
3. "{external system} developer experience reviews"
4. (optional) "{external system} SDK {language}"
5. (optional) "{external system} known issues limitations"

### For `dominio`:
1. "{domain} UX best practices {year}"
2. "{feature type} design patterns"
3. "{industry} user expectations {workflow type}"
4. (optional) "{domain} accessibility standards"
5. (optional) "{similar product} user flow analysis"

### For `prior-art`:
1. "{domain} open source {product category}"
2. "{product category} github alternatives"
3. "{referenced system} features list"
4. (optional) "{referenced system} architecture overview"
5. (optional) "{product category} self-hosted comparison"

**El objetivo de `prior-art` no es describir sistemas: es DESAGREGARLOS.** La salida util no
es "n8n es una plataforma de workflows" sino la lista de lo que hace: disparadores por evento,
disparadores programados, reintentos con backoff, versionado de flujos, custodia de
credenciales, ejecucion parcial, replay, observabilidad de corridas, sub-flujos, manejo de
error por nodo. Un reporte de `prior-art` en parrafos no sirve para lo que sigue.

---

## Step 3: Execute Searches

Execute searches using available MCP tools (Jina `search_web` or `read_url`, WebSearch).

**Protocol:**
- Run searches in parallel when possible
- For each result, extract: key finding, source URL, relevance to the work
- Discard results that are irrelevant, outdated, or low-quality
- Do NOT deep-dive — this is reconnaissance, not exhaustive research
- Time budget: spend no more than 3-5 searches total

### Degradation

If web search fails or is unavailable:
```markdown
## [Mary] Contexto externo
fecha: {timestamp}
tipo_investigacion: {type}
busquedas_realizadas: 0
estado: degradado — web search no disponible

No se pudo realizar investigacion externa. Herramientas de busqueda web (Jina/WebSearch) no disponibles.
Recomendacion: continuar con analisis basado en codebase. Considerar investigacion manual si el contexto externo es critico.
```

**Continue with the rest of the workflow — do NOT block.**

---

## Step 4: Produce Structured Output

Write findings in the following format for inclusion in the expert file:

```markdown
## [Mary] Contexto externo
fecha: {timestamp}
tipo_investigacion: {competencia | regulatorio | dominio | tecnico | prior-art}
busquedas_realizadas: {N}

### Hallazgos relevantes

| # | Tipo | Hallazgo | Fuente | Impacto en el trabajo |
|---|------|----------|--------|----------------------|
| EXT-001 | {Competencia|Regulatorio|Dominio|Tecnico|Prior-art} | {hallazgo concreto} | {URL} | {como afecta al trabajo} |
| EXT-002 | ... | ... | ... | ... |

### Implicaciones para el discovery
- {como estos hallazgos externos afectan el alcance, criterios de aceptacion, o decisiones}
- {riesgos o oportunidades identificados}
- {recomendaciones concretas para el equipo}
```

### Prior-art: una capacidad = una fila

Para `tipo_investigacion: prior-art` la tabla `Hallazgos relevantes` NO es un resumen: es el
menu que despues se confronta al usuario para que marque que quiere. Eso solo funciona si cada
fila es una capacidad marcable por separado.

- **Una capacidad por fila, nunca varias por celda.** "n8n soporta triggers por evento,
  programados y reintentos con backoff" en un solo `Hallazgo` NO desagrega — son minimo 3 filas
  (EXT-001 trigger por evento, EXT-002 trigger programado, EXT-003 reintentos con backoff), cada
  una con su propia fuente. Si una celda de `Hallazgo` describe mas de una capacidad, esta mal
  formada: partirla.
- **El tope de 3-8 filas de Quality Criteria NO gobierna prior-art.** Ese tope esta pensado para
  hallazgos de mercado o regulacion, donde mas no es mejor. Para prior-art el criterio es
  cobertura: listar cada capacidad relevante que el sistema de referencia resuelve, sin techo
  artificial. Un barrido de prior-art que cierra en 3-8 filas probablemente agrego capacidades en
  vez de desagregarlas — revisar antes de reportar.

### Quality Criteria

- Each finding must be **actionable** — it should influence a decision or raise a flag
- Each finding must have a **source URL** — no unsourced claims
- Impact column must be **specific to this work** — not generic industry observations
- Implications must connect external findings to **concrete project decisions**
- Keep it concise: 3-8 findings maximum. Quality over quantity. **Exception: `prior-art` is not
  bound by this cap — see "Prior-art: una capacidad = una fila" above.**

---

## Integration Notes

- Output goes into the expert's file (`experto-mary.md` in agent-os) alongside codebase findings
- Findings participate in the normal hallazgo resolution cycle — if external findings conflict with codebase findings, they can be debated in party mode
- Esta capacidad la invoca la fase de reconocimiento del abordaje (paso R1). Ver
  `agent-os/experts/bmad-agent-alfred/abordaje/fase-3-reconocer.md` seccion "R1".
  Mary retiene el juicio final sobre si la investigacion externa aporta valor.
