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
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 4
file_type: tarea-etapa-2
standards_cargados: []
status: done
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

## Ejecutor: amelia

### Que hizo

- Ctrl+Alt+W: closeShortcutTarget recibe filesTabActive y con el tab de archivos activo cierra solo ese tab; con la consola activa, como antes.
- Cierre local de la consola: store.closeTab llama forgetClosedConsoleFilesTab tras un tab.close exitoso; el externo lo cubre acceptSnapshot.
- Esc en cascada: filesTabEscapeStep (pura) y onKeyDown en la section de FilesTabSurface, nunca en window; respeta overlays y handlers previos.
- Busqueda del explorador: Esc con texto la limpia; foco devuelto a la terminal al desmontar la superficie con foco dentro, sin tab.focus.
- Pruebas: tabShortcuts, filesTabEscape (3 casos) y store (cierre exitoso/fallido); suite 1258 pass, 9 fail previas.
- Navegador (anfitriona): Esc limpia busqueda y luego vuelve a la terminal con el tab en el strip; Ctrl+Alt+W cierra solo el tab, sin dialogo y con 5 consolas intactas.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | El Esc de la busqueda vive en FileExplorerContent compartido (FileExplorerDialog.tsx:1803): en el modal y en el Inspector, Esc con texto limpia la busqueda en vez de cerrar | Aceptado como cambio menor y coherente con DiffContentView.tsx:1783; se reporta al usuario y se revisa en E4 | amelia |
| 2 | closePane del ultimo pane (store.ts:3963) no limpia el vinculo de forma optimista | Lo cubre la reconciliacion del siguiente snapshot; se acepta | amelia |
| 3 | CA-06, CA-17 y CA-20 no se ejercitaron en navegador: requieren reiniciar Herdr, cerrar consolas o cambiar el foco del Herdr real | Verificacion manual de E4 en workspace de prueba | amelia |
