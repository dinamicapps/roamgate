# Pendientes post-work

Hallazgos clasificados como **rumbo 2** durante el cierre de works completados. No fueron bloqueantes para cerrar el work, pero deberian resolverse pronto (dias/semanas tras el cierre).

Este archivo sobrevive al archivado de works individuales — es del proyecto, no del work.

## Procesamiento

Usar `/post-works revisar` para procesar items uno por uno: promover a un work nuevo (`/alfred "descripcion"`), descartar con razon, marcar resuelto, o dejar vivo.

Usar `/post-works status` para ver conteos y antiguedad agregada.

**El sistema NO procesa este archivo automaticamente.** Es responsabilidad del usuario invocar el comando cuando tenga capacidad.

## Estructura

| Campo | Significado |
|-------|-------------|
| `id` | Identificador del hallazgo (heredado del work origen, ej. `HG-T003-01`) |
| `resumen` | Descripcion corta futura-legible (sin nombres de expertos ni IDs efimeros) |
| `work_origen` | Slug del work donde se detecto |
| `volcado_en` | Fecha ISO `YYYY-MM-DD` del volcado al cierre del work |
| `prioridad` | `alta | media | baja | sin asignar` (estimacion del experto al clasificar) |
| `estado` | `pendiente | en-proceso | descartado | promovido-a-work | resuelto` |

## Tabla de pendientes

<!-- Cada nuevo item se agrega al final de la tabla. NO reordenar items existentes; el orden cronologico facilita auditoria. -->

| id | resumen | work_origen | volcado_en | prioridad | estado |
|----|---------|-------------|------------|-----------|--------|
| <!-- ejemplo: HG-T003-01 | Logging de auth poco granular para investigar fallos productivos | 20260502-mejoras-auth | 2026-05-02 | media | pendiente --> |
| FM-01 | Roamgate no suscribe el evento `tab.moved` de Herdr (`server/src/connections/runtime.ts:73`); un reorden de tabs hecho desde otro cliente tarda hasta el poll de respaldo de 5 s en verse | 20261007-investigacion-filemanager-tabs | 2026-10-07 | media | pendiente |
| FM-02 | Esc no cierra el panel de archivos del Inspector: solo el modal lo registra (`web/src/components/FileExplorerDialog.tsx:689`) y el panel pasa `showCloseButton=false` | 20261007-investigacion-filemanager-tabs | 2026-10-07 | baja | pendiente |
| FM-03 | Modal `FileExplorerDialog` sin importadores (codigo muerto, `web/src/components/FileExplorerDialog.tsx:108`) | 20261007-investigacion-filemanager-tabs | 2026-10-07 | baja | pendiente |
| FM-04 | Al remover un worktree quedan claves huerfanas de cache de previews (por workspaceId) y de preferencias del Inspector en localStorage | 20261007-investigacion-filemanager-tabs | 2026-10-07 | baja | pendiente |
| FM-05 | Hipotesis no probada en navegador: el menu contextual del explorador (`position:fixed`, sin portal) bajo `.workspace-stage` con `container-type: size` podria posicionarse o recortarse mal | 20261007-investigacion-filemanager-tabs | 2026-10-07 | media | pendiente |

## Items archivados

<!-- Items con estado != pendiente se mantienen aqui para auditoria. NO se borran. -->

### Promovidos a work nuevo

<!--
- HG-T005-02: refactor capa servicios facturas. Promovido a 20260510-refactor-facturas el 2026-05-10. Razon: el alcance se hizo claro tras el work origen.
-->

### Descartados

<!--
- HG-T007-03: validacion de input en /api/legacy. Descartado el 2026-05-15 por Julio Diaz. Razon: endpoint deprecado, sera removido en v3.0.
-->

### Resueltos

<!--
- HG-T002-01: monitoreo de rate limit. Resuelto el 2026-05-20. Evidencia: implementado en commit abc1234 dentro del work 20260518-observabilidad.
-->

## Referencias

- Principio del huevo y rumbos: `agent-os/skills/host-protocol/SKILL.md` seccion "Principio del huevo y rumbos del hallazgo".
- Comando: `.claude/commands/agent-os/post-works.md`.
- Schema: `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Rumbos del hallazgo".
