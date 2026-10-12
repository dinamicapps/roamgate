---
archivos:
  - accion: modificar
    ruta: web/vite.config.ts
cas:
  - CA-28
depende_de:
  - T-008
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
fase: 6
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: null
---
# Tarea 009: Volver al presupuesto de assets del build web

Hallazgo bloqueante de la Fase 1 de E4: `bun run build:web` falla en postbuild con 165/160 archivos (scripts/check-web-assets.mjs:7). La base (cc1fd37) generaba exactamente 160. Los chunks nuevos son FilesTabSurface (.js/.css), AnnotationComposerPopover (.js/.css, ahora compartido por dos raices lazy) y filesystemPaths.js. Ajuste por brecha (camino c de reevaluacion): la meta no cambia.

## Subtareas

1. Agrupar los chunks nuevos con `rolldownOptions.output.codeSplitting.groups` en web/vite.config.ts, siguiendo el patron existente, sin cargarlos en el bundle inicial.
2. Confirmar que el build pasa todos los presupuestos (archivos <= 160, JS inicial <= 800 KiB, gzip <= 256 KiB, CSS inicial <= 196 KiB).

## Verificacion

1. `bun run build:web` termina con exit 0.
2. Suite web sin fallas nuevas.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-28 | El build web cumple los presupuestos de scripts/check-web-assets.mjs | Hallazgo E4 Fase 1 |

## Ejecutor: amelia

### Que hizo

- Grupo workspace-annotations al final de codeSplitting.groups (AnnotationComposerPopover y filesystemPaths) con nombre de asset estable.
- FilesTabSurface comparte el lazy boundary del Inspector: WorkspaceInspectorHost.tsx lo re-exporta y App.tsx lo importa desde ahi.
- Postbuild en verde: files 160/160, initial JS 776.4/800 KiB, gzip 237.3/256 KiB, CSS 160.2/196 KiB; suite 1267 pass, 9 fail previas.
- Navegador (anfitriona): el tab de archivos carga y vuelve a la consola con el nuevo boundary.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Solo con grupos el minimo era 162 archivos; dos raices lazy separadas cuestan un par js/css extra | Boundary compartido con el Inspector: mismo perfil de chunk que la base, bundle inicial sin cambios | amelia |
| 2 | Costo: abrir el tab descarga tambien el Inspector (~16 KB gz) y viceversa (~27 KB gz) | Aceptado por la anfitriona: equivale a la base, donde el Inspector incluia Files | amelia |
| 3 | Archivos no declarados: App.tsx y WorkspaceInspectorHost.tsx (re-export) | Aceptado; sin lote paralelo | amelia |
| 4 | Advertencia INEFFECTIVE_DYNAMIC_IMPORT FileExplorerDialog -> FilePreviewContent, previa | Fuera de alcance; relacionado con FM-03 (modal sin importadores) | amelia |
