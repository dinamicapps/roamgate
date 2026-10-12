---
archivos:
  - accion: modificar
    ruta: web/src/workspaceResource.ts
  - accion: modificar
    ruta: web/src/workspaceResource.test.ts
  - accion: modificar
    ruta: web/src/components/WorkspaceInspectorHost.tsx
  - accion: modificar
    ruta: web/src/components/WorktreeLifecycleRow.tsx
  - accion: modificar
    ruta: web/src/components/FilePreviewTabs.test.ts
  - accion: modificar
    ruta: web/src/App.tsx
capa_datos:
  aplica: true
  datos_md_ref: agent-os/disenos/20261007-file-manager-panel/datos.md
  ddl_sugerido: 'SUGERENCIA: al leer, view ''files'' -> ''changes''; sin reescritura masiva'
  entidades:
    - nombre: localStorage preferencias del Inspector (ENT_preferencias_inspector)
      operacion: data
  saneamiento_estrategia: saneo al leer (datos.md, ENT_preferencias_inspector)
  saneamiento_requerido: true
cas:
  - CA-23
  - CA-24
  - CA-25
  - CA-26
depende_de:
  - T-004
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 5
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 007: P5: el Inspector sin Files

Retirar la vista Files del Inspector una vez que el tab de archivos ya cubre todas las entradas.

## Subtareas

1. InspectorView pierde el miembro files (workspaceResource.ts:7); las preferencias guardadas con view files se sanean a changes al leer.
2. Quitar el boton Files y el montaje del bloque Files del Inspector.
3. El ciclo de vida de worktrees (WorktreeLifecycleRow.tsx:124) abre el tab de archivos.
4. Ver cambios de un archivo abre el Inspector en Changes al costado.
5. Actualizar workspaceResource.test.ts y FilePreviewTabs.test.ts.

## Dev Notes

- Los efectos de foco del Inspector no cambian.

## Verificacion

1. bun test de workspaceResource y FilePreviewTabs en verde.
2. Manual: CA-23..CA-26.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-23 | ESC_P5_saneo_view_files: una preferencia guardada con view files se lee como changes | REG_saneo_view_files |
| CA-24 | ESC_P5_toggle_sin_files: el Inspector no ofrece Files | DEC_D3_quitar_files_inspector_view |
| CA-25 | ESC_P5_worktree_files: la accion de archivos del ciclo de worktree abre el tab de archivos | DEC_D3_quitar_files_inspector_view |
| CA-26 | ESC_P2_ver_cambios: ver cambios de un archivo abre el Inspector en Changes al costado | DEC_D8_inspector_changes |

## Ejecutor: amelia

### Que hizo

- InspectorView queda en changes/commits/history; readInspectorPreferences sanea files a changes al leer sin reescribir (REG_saneo_view_files).
- El Inspector ya no monta WorkspaceFilesView; se retiraron el store de pestanas, el drill-in y los ratios de Files y sus props.
- Worktrees: WORKSPACE_INSPECTOR_REQUEST_EVENT con files abre el tab de archivos de la consola activa (CA-25).
- Ver cambios: el boton Changes del preview abre el Inspector en Changes con el archivo seleccionado via changesRequest; el tab sigue visible (CA-26).
- CSS del split en una sola copia (InspectorSplitResizer.css); superficie mobile sin borde ni radio; restos muertos eliminados en App.tsx.
- Pruebas: saneo files->changes, Inspector con 3 vistas y WorkspaceFilesView montado directo; suite 1267 pass, 9 fail previas.
- Navegador (anfitriona): Inspector con Changes/Commits/History y Changes desde el preview selecciona el archivo; capturas CA-24-antes/despues.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | El diff en Changes muestra invalid Git patch size (server/src/workspace/git-diff.ts:408): el script sh del servidor falla en este Windows | Previo y fuera de alcance (no se toco server/); se registra en post-works | amelia |
| 2 | La prop embedded de DiffContentView (DiffContentView.tsx:826,856,874,1019; diffContentState.ts:39-50) quedo sin llamador en true | Codigo muerto fuera de los archivos de la tarea; se registra en post-works | amelia |
| 3 | Al borrar un worktree se escribe aun workspaceInspectorFile:{owner} (App.tsx:2848), clave ya legada | Inocuo; se registra en post-works junto con read/writeResourceFileSelection | amelia |
| 4 | Archivos reales 17 vs 6 declarados (CSS consolidado, FilePreviewContent, worktrees) | Derivados del mandato (puntos 5 y 6) y de quitar codigo sin uso; sin lote paralelo | amelia |
| 5 | CA-23 y CA-25 no ejercitados en navegador | CA-23 cubierto por prueba unitaria; CA-25 en verificacion manual de E4 | amelia |

## Verificador: quinn

### Que verifico

- CA-23, CA-24, CA-26: saneo files a changes por prueba unitaria; Inspector con 3 vistas (CA-24-antes/despues.png); Changes del preview selecciona el archivo.

### Hallazgos de verificacion

| # | Hallazgo | Severidad | Estado |
|---|----------|-----------|--------|
| 1 | CA-25 requiere un worktree | menor | diferido |
