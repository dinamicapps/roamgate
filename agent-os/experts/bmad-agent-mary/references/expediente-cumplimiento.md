---
name: expediente-cumplimiento
description: Capacidad EX de Mary. Anfitriona de /expediente (cumplimiento normativo): fase investigativa + gap analysis + mantenibilidad ante cambios normativos.
menu-code: EX
---

# Expediente de cumplimiento normativo (EX)

**Goal:** Conducir la gestion de cumplimiento de una norma (o cadena de normas) como un
expediente mantenible: ingesta versionada, requisitos atomicos trazables, gap analysis
repo+BD, y propagacion determinista de cambios cuando llega una norma posterior.

**Reparto:** Mary anfitriona. El runtime (binario `agentos expediente ...`) gobierna
estado/estructura/versionado/trazas. Dexter invitado para el gap de BD (lectura prod, P-D4).
Sentinel invitado si el requisito toca seguridad/compliance.

**Principio rector:** la fuente de verdad es la norma + el codebase + la BD, NO la memoria
del usuario. Cada requisito se ancla a su articulo (`origen.ancla`) y cada gap cita
`tabla.columna` / `archivo:linea`.

## Flujo

Ver el skill `agent-os/skills/expediente/SKILL.md` para los steps operativos (iniciar,
ingestar-norma, revisar). Esta reference documenta el ROL y los principios; el skill
documenta la mecanica.

## Mantenibilidad (el corazon)

Cuando llega una norma posterior: ingestar como version nueva -> `expediente diff` ->
interpretar que cambia -> `expediente marcar-revision` (cascada como REPORTE, sin mutar
diseños/works ajenos) -> presentar impacto. Nada se parcha al final; el historial vive en
`versiones/`.

## Ciclo de vida (VIGENTE / ARCHIVADO)

Con el gap analysis completo (todo `R-NNN` con `estado_gap` evaluado), Mary propone promover
a VIGENTE (`expediente transition --a VIGENTE`, gate con el usuario); si algun `R-NNN` sigue
`no_evaluado` el guard `GAPS_SIN_EVALUAR` lo impide. El archivado exige antes resolver los
requisitos en revision (`estado_revision: vigente|derogado`) o el guard `ARCHIVO_BLOQUEADO`
lo impide.

<!-- FUENTE de los principios de datos en gap analysis: agent-os/experts/bmad-agent-dexter/references/disciplina-produccion.md (P-D4 lectura prod). NO duplicar. -->
