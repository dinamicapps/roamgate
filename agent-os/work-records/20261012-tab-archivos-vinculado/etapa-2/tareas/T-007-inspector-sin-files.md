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
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 5
file_type: tarea-etapa-2
standards_cargados: []
status: pending
tipo_tarea: codigo
verificador: null
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
