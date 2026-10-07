---
description: Comando /expediente para gestion de cumplimiento normativo. Subcomandos iniciar, estado, listar, ingestar-norma, revisar.
argument-hint: <subcomando> [args]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /expediente

Gestion de cumplimiento normativo mantenible. Mary anfitriona; Dexter (BD) y Sentinel (compliance) invitados.
El runtime gobierna forma/estado/versionado/trazas; la IA produce el analisis.

Lee `agent-os/skills/expediente/SKILL.md` y delega segun subcomando.

## Subcomandos

### `/expediente iniciar "{dominio}" "{descripcion}"`

Crea expediente nuevo. Mary conduce la fase investigativa: identifica la(s) norma(s) fuente,
las ingesta, descompone en requisitos atomicos, y hace el gap analysis con Dexter.

Cuando todos los `R-NNN` tienen `estado_gap` evaluado (ninguno `no_evaluado`), Mary propone
promover: `agentos expediente transition --slug {exp} --a VIGENTE` (gate con el usuario) — el
runtime lo exige (guard `GAPS_SIN_EVALUAR` nombra los pendientes y el verbo de salida), no solo
la disciplina.

Flujo: deriva slug -> `agentos expediente crear --slug {slug} --dominio "{dominio}"` ->
steps del SKILL (ver abajo).

### `/expediente estado {slug}`

`agentos expediente estado --slug {slug}` + render legible (estado, version, contadores,
requisitos en revision).

### `/expediente listar`

`agentos expediente listar` en tabla compacta.

### `/expediente ingestar-norma {slug}`

Subflujo de mantenibilidad: el usuario aporta una norma posterior. Mary la ingesta
(`expediente ingestar-fuente`), corre `expediente diff`, interpreta que cambia, marca los
requisitos afectados (`expediente marcar-revision`) y reporta el impacto (diseños/works).

### `/expediente revisar {slug}`

Procesa los requisitos en `requiere_revision`: por cada uno, Mary decide si sigue vigente
(set estado_revision vigente), si se derogo (set derogado), o si cambio (ajusta enunciado/accion/gap).
Al terminar, `expediente sincronizar` deriva VIGENTE.

### `/expediente archivar {slug}`

`agentos expediente transition --slug {exp} --a ARCHIVADO`; el guard `ARCHIVO_BLOQUEADO` exige
resolver antes los requisitos en `requiere_revision` (via
`agentos expediente requisito set --slug {exp} --id {R-NNN} --campo estado_revision --valor vigente|derogado`).

## Patron de invocacion del binario

Detectar `.claude/agent-os-bin/agentos` (o `agentos.exe`). Si no existe, informar que se
requiere el runtime y NO mutar (sin fallback). Invocar VIA BASH (sin BOM). Parsear `{ok,data}`;
detenerse si `ok:false`.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/transition.md. Mismo patron que diseno/work. NO duplicar. -->
