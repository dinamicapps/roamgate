---
name: etapa-1
description: Etapa 1 del work — sobrevive solo para rutas investigacion/documentacion (Mary o Paige anfitrionas). Para otras rutas, el discovery fue absorbido por el abordaje.
---

# Work Etapa 1 — Discovery (sobreviviente para investigacion/documentacion)

## Estado

Esta etapa sobrevive solo para rutas `investigacion` y `documentacion`. Para rutas `bugfix` (alias legacy: fix), `acotado`, `diseno`, **el discovery fue absorbido por el abordaje**. La evidencia recolectada en abordaje + el bloque `## Abordaje` del README cubren lo que E1 vieja capturaba con CAs y discovery formal.

## Anfitrion

- Modo `investigacion`: **Mary** (`A-Mary:`).
- Modo `documentacion`: **Paige** (`A-Paige:`) con Mary asistiendo.

## Proposito

Para `investigacion`:
- Profundizar en las preguntas investigativas planteadas en abordaje.
- Producir CAs de cobertura del insumo (cobertura de preguntas, trazabilidad de fuentes, suficiencia respecto a `consumido_por`).

Para `documentacion`:
- Definir audiencia detallada (roles, nivel tecnico, contexto de uso).
- Producir CAs de cobertura editorial (secciones cubiertas, exactitud tecnica, legibilidad).
- Esbozar TOC tentativo.
- Por cada documento del work (seccion `## Entregables`; si no existe, el unico documento y su `plantilla_documento`): cargar su plantilla resuelta en el catalogo y derivar de ella el TOC y los CAs de cobertura editorial de ese documento. Si la plantilla es un kit, cargar tambien su `llenado`. `etapa-1/audiencia-y-toc.md` lleva un bloque por documento (audiencia, TOC, desviaciones declaradas). Si aparece un documento nuevo, pasa por la misma seleccion que en el abordaje y se agrega a `## Entregables`.
  <!-- FUENTE: agent-os/templates/documentacion/README.md seccion "Resolucion de un slug". Zonas, formas y resolucion viven alli. NO duplicar -- para modificar, editar la fuente. -->
- Si algun entregable declara Origen (re-plantillado): producir `etapa-1/mapa-conservacion.md` desde la semilla `agent-os/templates/work-record/etapa-1/mapa-conservacion.md`, con las dos direcciones (origen -> plantilla y plantilla -> origen). Todo hueco que se llene con el `llenado` de la plantilla amplia el alcance y lo decide el usuario en el gate de E1.
- Si el work declara `sesion_material_mpa` (insumo de sesion grabada): E1 gana **destilacion y cruce** ademas de audiencia y TOC. La destilacion ocurre despues del gate G1 de rotulado de autoridad — que es bloqueante y previo a esta etapa — y se trabaja por ventanas servidas por el runtime, nunca cargando la transcripcion entera. Produce corpus de afirmaciones + preguntas + conflictos + candidatos a promocion, que entran al gate G2 antes de E2.

<!-- FUENTE: agent-os/skills/destilar-sesion/SKILL.md seccion "Autoridad por hablante". Las reglas de autoridad por hablante, la elevacion por captura y las cuatro cubetas de receptor viven alli; el lugar de G1 y G2 en el flujo vive en agent-os/experts/bmad-agent-alfred/rutas/documentacion/readme.md seccion "Variante: insumo de sesion grabada". Aqui solo se declara que trabajo gana esta etapa. NO duplicar -- para modificar, editar la fuente. -->


## Tipos de CAs

| Modo | Tipo de CA | Observable |
|---|---|---|
| `investigacion` | Cobertura de insumo | Cobertura de preguntas, trazabilidad de fuentes, suficiencia respecto a `consumido_por` |
| `documentacion` | Cobertura editorial | Secciones cubiertas, audiencia, exactitud tecnica validada, legibilidad |

## Roster de invitables

### Modo `investigacion`

| Experto | Cuando |
|---|---|
| Winston | Si las preguntas investigativas tocan arquitectura |
| Sentinel | Si las preguntas tocan compliance, seguridad o regulacion |
| Paige | Co-produccion de CAs de trazabilidad editorial (formato del insumo) |
| Quinn | Al cierre, revision de testeabilidad de CAs |
| Bob | Al cierre, materializa CAs en estructura de `frente-investigacion` |

### Modo `documentacion`

| Experto | Cuando |
|---|---|
| Mary | Asiste a Paige (audiencia y alcance) |
| Winston | Si el documento cubre arquitectura |
| Sentinel | Si el documento cubre seguridad/compliance |
| Sally | Si el documento incluye flujos UI o wireframes |
| Tessa | Si el documento requiere screenshots automatizados |
| Quinn | Al cierre, testeabilidad de CAs editoriales |
| Bob | Al cierre, materializa CAs en estructura de `seccion-documento` |

## Criterio de cierre

- CAs cubren el espectro de preguntas (investigacion) o la audiencia (documentacion).
- Cada CA tiene owner + prerequisito.
- Quinn valida testeabilidad.
- Usuario aprueba el gate.

## Artefacto integrador

| Modo | Artefacto |
|---|---|
| `investigacion` | `etapa-1/01-discovery-investigacion.md` (resumen ejecutivo) + `etapa-1/cas-cobertura-insumo.md` |
| `documentacion` | `etapa-1/audiencia-y-toc.md` + `etapa-1/cas-cobertura-editorial.md` (+ `etapa-1/mapa-conservacion.md` si algun entregable declara Origen) |

NO se generan `01-discovery-distillate.md`, `cas-consolidados.md`, ni `descubrimiento-producto.md` (eliminados con el abordaje).

## NO se invoca para rutas

- `bugfix` (alias legacy: `fix`) → directo al flujo de sabueso.
- `acotado` → directo a E2 con Bob materializando desde el `## Abordaje` del README.
- `diseno` → `/disenar` invocado internamente; no hay E1 en el work.

## Activacion

Solo cuando ruta destilada del abordaje es `investigacion` o `documentacion`. La etapa **entra
desde el abordaje**: el work-record ya existe, con la meta horneada, la ruta aprobada, y el
campo del modo ya en el frontmatter (`consumido_por` en investigacion; `audiencia_documento`/
`plantilla_documento` en documentacion) y, en documentacion, la seccion `## Entregables` si el
abordaje ya definio los documentos.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md seccion "Campos que exige la ruta al abrir el work". Los campos llegan horneados desde ahi. NO duplicar -- editar la fuente. -->

## Transicion

- `investigacion` → E2 con Winston.
- `documentacion` → E2 con Paige.

## Referencias

- Skill que absorbio el discovery generico: `agent-os/experts/bmad-agent-alfred/abordaje/readme.md`.
- Siguiente etapa: `agent-os/skills/host-protocol/etapas/etapa-2.md`.
