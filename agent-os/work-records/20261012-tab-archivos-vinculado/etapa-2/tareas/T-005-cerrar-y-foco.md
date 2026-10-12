---
archivos:
  - accion: modificar
    ruta: web/src/App.tsx
  - accion: modificar
    ruta: web/src/store.ts
  - accion: modificar
    ruta: web/src/components/WorkspaceFilesView.tsx
cas:
  - CA-06
  - CA-17
  - CA-18
  - CA-19
  - CA-20
depende_de:
  - T-003
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 4
file_type: tarea-etapa-2
standards_cargados: []
status: pending
tipo_tarea: codigo
verificador: null
---
# Tarea 005: P4: cierre, Esc, Ctrl+Alt+W y foco externo

El tab de archivos se cierra solo o con su consola, Esc vuelve a la consola en cascada y el foco de Herdr manda sobre la superficie visible.

## Subtareas

1. Cerrar el tab de archivos borra su vinculo y su clave filesTabFiles; nunca cierra la consola.
2. Cerrar la consola, local (closeTab store.ts:2709) o externo (reconciliacion con el snapshot), cierra su tab de archivos.
3. Esc en cascada dentro del componente (no en window): despeja lo transitorio y luego vuelve a la consola sin cerrar el tab.
4. Ctrl+Alt+W con el tab de archivos activo cierra solo ese tab (App.tsx:3147/3153).
5. Foco externo o cambio de workspace: mostrar la consola enfocada.

## Dev Notes

- Leer INV-PUENTE-07 antes de tocar foco: en shared el foco es RPC a Herdr.

## Verificacion

1. Manual: CA-06, CA-17..CA-20 con la receta de cada escenario.
2. Pruebas de store (cierre de tabs) en verde.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-06 | ESC_P4_recarga_y_reinicio: tras recargar se restauran los vinculos de consolas vivas; los de consolas muertas se descartan | INV-PUENTE-09 |
| CA-17 | ESC_P4_cierre_externo: cerrar la consola (local o desde Herdr/otro navegador) cierra su tab de archivos | REG_cierre_consola_cierra_archivos |
| CA-18 | ESC_P4_ctrl_alt_w: Ctrl+Alt+W con el tab activo cierra solo el tab de archivos | DEC_ctrl_alt_w_cierra_tab_archivos |
| CA-19 | ESC_P4_esc_cascada: Esc despeja lo transitorio y luego vuelve a la consola sin cerrar el tab | DEC_esc_cascada_vuelve_consola |
| CA-20 | ESC_P3_foco_externo_shared: ante foco externo o cambio de workspace se muestra la consola enfocada | DEC_P3_foco_externo_manda, INV-PUENTE-07 |
