---
name: quick-flow
description: Quick flow completo -- desde intent hasta artefacto endurecido con review adversarial. Incorpora el workflow de Barry con rigor total.
menu-code: FLW
---

# Quick Flow

**Goal:** Convertir intent del usuario en un artefacto endurecido y revisado. Minima ceremonia, artefactos lean, eficiencia implacable.

**Lente activa:** Full-stack dev con sesgo de envio. No espera permiso para investigar. No pregunta lo que puede responder leyendo codigo.

---

## Subcapacidades

| Sub | Descripcion | Cuando usar |
|-----|-------------|-------------|
| **QD** | Quick dev -- clarificar, planificar, implementar, revisar | Bugfix, feature pequena, iteracion rapida |
| **CR** | Code review adversarial con 3 lentes paralelos | Codigo listo para review |

---

## Principios del quick flow

- **Planning y ejecucion son dos caras de la misma moneda** -- Specs son para construir, no burocracia
- **NO asumir que se empieza de cero** -- Primer movimiento: reconocimiento. Escanear `package.json`/`*.sln`/`*.csproj`, commits recientes, patrones existentes. Matchear convenciones del codebase
- **Cuando spec vs cuando solo code:**
  - Zero blast radius (typo, null check, style tweak) = solo code → ruta One-Shot
  - Toca >2 archivos o introduce patron nuevo = spec primero → ruta Plan-Code-Review
- **Review es parte del flow** -- Cada QD termina con review adversarial. Cada CR usa subagentes reales sin contexto de conversacion
- <!-- FUENTE: .claude/MANIFIESTO.md seccion "2. Simplicity First" + seccion "3. Surgical Changes". La regla de scope (entregar el cambio minimo, no expandir sin pedirlo) se norma alli y la gobierna el gobernador (`/alfred`). NO duplicar la regla de scope aqui: este bullet solo afina el COMO de Atlas en ruta `bugfix`. -->
  **Como ofrezco la expansion del fix y por que no asumo cascada** -- Partiendo del cambio minimo que ya manda el manifiesto, mi aporte como Atlas en ruta `bugfix` es la mecanica de la oferta: si durante la investigacion detecto un gemelo con identico defecto, una asimetria (escritura vs lectura en un acceso multi-tenant), o un dominio donde la misma restriccion deberia propagarse, lo OFREZCO con la evidencia que lo respalda y dejo que el usuario decida ampliar -- la decision de acotar o expandir es suya, no mia. Y nunca asumo resolucion en cascada entre bugs relacionados: si dos sintomas no comparten exactamente la misma cadena de ejecucion, documento la distincion y no doy uno por resuelto al arreglar el otro.

---

## Standards de Calidad

### Ready for Development

Una spec esta "Ready for Development" cuando:

- **Actionable**: Cada tarea tiene file path y accion especifica
- **Logical**: Tareas ordenadas por dependencia
- **Testable**: Todos los ACs usan Given/When/Then
- **Complete**: Sin placeholders ni TBDs

### Scope Standard

Una spec debe apuntar a **un solo objetivo de usuario** dentro de **900-1600 tokens**:

- **Single goal**: Una feature cohesiva, incluso si cruza capas/archivos. Multi-goal = 2+ entregables independientes que podrian ser PRs separados
  - Split: "agregar dark mode AND refactorear auth a JWT AND construir admin dashboard"
  - No split: "agregar validacion y mostrar errores" / "soportar drag-and-drop AND paste AND retry"
- **900-1600 tokens**: Rango optimo para consumo LLM. Debajo de 900 riesgo de ambiguedad; arriba de 1600 riesgo de context-rot
- **Ninguno es un gate hard** -- ambos son propuestas con override del usuario

---

## Quick Dev (QD)

### Paso 1: Clarificar y Rutear

**Variables:**
```
wipFile: '{implementation_artifacts}/spec-wip.md'
deferred_work_file: '{implementation_artifacts}/deferred-work.md'
spec_file: '' # se setea en runtime
```

**Verificar intent** (en este orden, parar al primero que matchee):

1. **Argumento explicito** -- Path a archivo o instruccion clara
   - Si apunta a spec existente con status en frontmatter (ready-for-dev, in-progress, in-review) → rutear directo al paso correspondiente
   - Cualquier otra cosa → ingestar como intent inicial

2. **Conversacion reciente** -- Mensajes anteriores muestran claramente el intent

3. **Sin match** -- Escanear artefactos y preguntar:
   - `{wipFile}` existe? → Ofrecer retomar o archivar
   - Specs activas en `{implementation_artifacts}`? → Listar y HALT
   - Sin specs → Nueva sesion

**Instrucciones:**
1. Cargar contexto: listar archivos en `{planning_artifacts}` y `{implementation_artifacts}`
2. Clarificar intent sin fantasear. Si hay preguntas, hacerlas como lista numerada. Verificar que TODAS fueron respondidas
3. Version control: working tree limpio? Branch correcto para este intent?
4. Multi-goal check (ver Scope Standard): si falla → presentar goals, HALT, ofrecer Split/Keep
5. Rutear:
   - Derivar slug kebab-case del intent. Si tiene tracking ID, liderarlo (ej: `gh-47-fix-auth`)
   - Setear `spec_file` = `{implementation_artifacts}/spec-{slug}.md`
   - **One-Shot** (zero blast radius) → ir a seccion One-Shot
   - **Plan-Code-Review** (todo lo demas) → ir a Paso 2

### Paso 2: Planificar

1. **Investigar codebase** -- Aislar exploracion profunda en sub-agentes si disponibles. Pedir resumenes destilados
2. **Llenar spec template** (ver abajo) y escribir en `{wipFile}`
3. **Self-review** contra Ready for Development standard
4. **Gaps de intent** → HALT y preguntar
5. **Token count check**: si >1600 tokens → HALT, ofrecer Split/Keep

**CHECKPOINT 1:** Presentar resumen. HALT. Opciones: [A] Aprobar | [E] Editar
- **A**: Renombrar `{wipFile}` a `{spec_file}`, status `ready-for-dev`. Contenido dentro de `<frozen-after-approval>` queda bloqueado → Paso 3
- **E**: Aplicar cambios, volver a CHECKPOINT 1

### Paso 3: Implementar

**Precondicion:** Verificar que `{spec_file}` existe y no esta vacio

1. **Baseline**: Capturar `baseline_commit` (HEAD actual) en frontmatter
2. **Status**: Cambiar a `in-progress`
3. **Implementar**: Delegar a sub-agente si disponible, o implementar directamente
4. **Self-check**: Verificar que CADA tarea en `## Tasks & Acceptance` esta completa. Marcar `[x]`

### Paso 4: Review Adversarial

**Status**: Cambiar a `in-review`

1. **Construir diff** desde `{baseline_commit}`
2. **Lanzar 3 subagentes en paralelo** (sin contexto de conversacion):
   - **Blind Hunter** -- Solo recibe diff. Sin spec, sin proyecto. Busca defectos puros
   - **Edge Case Hunter** -- Recibe diff + acceso al proyecto. Busca edge cases
   - **Acceptance Auditor** -- Recibe diff + spec + context docs. Verifica ACs
3. **Clasificar hallazgos:**
   - **intent_gap** -- Intent incompleto. Revertir codigo, volver al usuario, re-ejecutar desde Paso 2
   - **bad_spec** -- Spec debio ser mas clara. Extraer KEEP instructions, revertir, enmendar spec, re-ejecutar desde Paso 3
   - **patch** -- Fixeable sin input humano. Auto-fix
   - **defer** -- Pre-existente. Agregar a `{deferred_work_file}`
   - **reject** -- Ruido. Descartar
4. **Loop control**: Incrementar iteracion. Si >5 → HALT y escalar

### Paso 5: Presentar

1. **Status**: Cambiar a `done`
2. **Generar Suggested Review Order** en `{spec_file}`:
   - Organizar por concern, no por archivo
   - Liderar con entry point
   - Links clickeables relativos a `{spec_file}`
   - Framing ultra-conciso (<=15 palabras por stop)
3. **Commit local** con mensaje convencional
4. **Abrir en editor** (`code -r`)
5. **Presentar resumen**: commit hash, archivos cambiados, findings breakdown
6. **Ofrecer** push/PR

---

## One-Shot

Para cambios de zero blast radius:

1. **Implementar** directamente
2. **Review**: Lanzar Blind Hunter con los archivos cambiados
3. **Clasificar**: Solo 3 categorias (patch, defer, reject). Si algun hallazgo es significativo → HALT
4. **Generar spec trace** minima: frontmatter + Intent + Suggested Review Order con `route: 'one-shot'`
5. **Commit + Presentar**

---

## Code Review (CR)

Review adversarial independiente para codigo existente.

### Paso 1: Contexto

1. **Detectar intent** de la invocacion:
   - "staged" → solo staged changes
   - "uncommitted" / "working tree" → staged + unstaged
   - "branch diff" / "vs main" → diff contra branch base
   - "commit range" / "last N commits" → rango especifico
   - "this diff" → diff proporcionado por usuario
2. **Si no hay match** → verificar sprint-status por stories en `review`. Si hay → sugerir
3. **Si no hay nada** → HALT y preguntar que revisar
4. **Construir `{diff_output}`** segun fuente elegida. Verificar que no esta vacio
5. **Preguntar por spec/story file** para contexto de ACs
6. **Sanity check**: si >3000 lineas → advertir, ofrecer chunk por grupo de archivos

**Checkpoint**: Presentar stats del diff, modo de review, docs cargados. HALT para confirmacion

### Paso 2: Review Paralelo

Lanzar 3 subagentes sin contexto de la conversacion previa:
- **Blind Hunter** -- Solo diff
- **Edge Case Hunter** -- Diff + proyecto
- **Acceptance Auditor** -- Diff + spec + context docs (solo si hay spec)

Si subagentes no disponibles → generar prompts en archivos para ejecucion manual

### Paso 3: Triage

1. **Normalizar** hallazgos a formato comun (id, source, title, detail, location)
2. **Deduplicar** -- mergear hallazgos sobre el mismo issue
3. **Clasificar:**
   - **decision_needed** -- Requiere input humano (solo si hay spec)
   - **patch** -- Fix no ambiguo
   - **defer** -- Pre-existente, no causado por este cambio
   - **dismiss** -- Ruido
4. **Descartar** dismiss. Reportar conteo

### Paso 4: Presentar y Actuar

1. **Si clean review** → anunciar y saltar a actualizacion de sprint
2. **Escribir findings** en story file (si existe): decision_needed, patch, defer
3. **Presentar resumen**: `D decision-needed, P patch, W defer, R dismissed`
4. **Resolver decision_needed** primero -- HALT por cada uno para input del usuario
5. **Manejar patches** -- Ofrecer: [0] Batch-apply all | [1] Fix auto | [2] Dejar como action items | [3] Walk through
6. **Actualizar sprint-status** segun outcome (done si todo resuelto, in-progress si quedan items)
7. **Next steps**: siguiente story | re-run review | done

---

## Spec Template

```markdown
---
title: '{title}'
type: 'feature' # feature | bugfix | refactor | chore
created: '{date}'
status: 'draft' # draft | ready-for-dev | in-progress | in-review | done
context: [] # max 3 project-wide standards/docs. NO source code files.
---

<frozen-after-approval reason="human-owned intent -- do not modify unless human renegotiates">

## Intent

**Problem:** ONE_TO_TWO_SENTENCES

**Approach:** ONE_TO_TWO_SENTENCES

## Boundaries & Constraints

**Always:** INVARIANT_RULES

**Ask First:** DECISIONS_REQUIRING_HUMAN_APPROVAL

**Never:** NON_GOALS_AND_FORBIDDEN_APPROACHES

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | INPUT | OUTCOME | N/A |
| ERROR_CASE | INPUT | OUTCOME | ERROR_HANDLING |

</frozen-after-approval>

## Code Map

- `FILE` -- ROLE_OR_RELEVANCE

## Tasks & Acceptance

**Execution:**
- [ ] `FILE` -- ACTION -- RATIONALE

**Acceptance Criteria:**
- Given PRECONDITION, when ACTION, then EXPECTED_RESULT

## Spec Change Log

## Design Notes

## Verification

**Commands:**
- `COMMAND` -- expected: SUCCESS_CRITERIA
```
