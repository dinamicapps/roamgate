---
archivos:
  - accion: modificar
    ruta: web/src/App.tsx
  - accion: modificar
    ruta: web/src/components/TabBar.tsx
  - accion: modificar
    ruta: web/src/tabShortcuts.ts
  - accion: modificar
    ruta: web/src/tabReorder.ts
  - accion: modificar
    ruta: web/src/terminalFocus.ts
  - accion: crear
    ruta: web/src/components/FilesTabSurface.tsx
cas:
  - CA-07
  - CA-08
  - CA-09
  - CA-10
depende_de:
  - T-001
  - T-002
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 3
file_type: tarea-etapa-2
standards_cargados: []
status: pending
tipo_tarea: codigo
verificador: null
---
# Tarea 003: Tab de archivos en el strip y su superficie

Mostrar el tab de archivos en la barra de tabs pegado a la derecha de su consola y montar como superficie el componente de T-001, con estado propio por vinculo.

## Subtareas

1. Representar el tab virtual (id files:{ownerTabId}) en TabBar sin alterar el modelo Tab de Herdr.
2. Excluirlo de Ctrl+1..9, de pins (tabPins.v1), de reorder y de rename; su id nunca llega a tab.move/close/focus/rename.
3. Superficie: montar WorkspaceFilesView con key por vinculo; rehidratar pestanas, seleccion y preview desde filesTabResource al remontar.
4. Agregar la superficie a la guarda de foco de la terminal (terminalFocus.ts:12, INV-PUENTE-05).
5. Activar el tab no emite tab.focus a Herdr (INV-PUENTE-11).

## Dev Notes

- Los tabs inactivos se desmontan (App.tsx:1047): la rehidratacion es obligatoria, no opcional.

## Verificacion

1. Pruebas de tabShortcuts/tabReorder/tabPins actualizadas y en verde.
2. Manual: CA-07, CA-08, CA-09, CA-10 con la receta de cada escenario.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-07 | ESC_P2_rehidratar: al volver a un tab de archivos desmontado se restauran pestanas, seleccion y preview | REG_rehidratar_al_remontar |
| CA-08 | ESC_P2_dos_consolas_aisladas: dos tabs de archivos de consolas distintas no comparten estado | INV-PUENTE-01 |
| CA-09 | ESC_P3_orden_y_atajos: el tab va pegado a la derecha de su consola, sin numero en Ctrl+1..9, sin pin, y su id no llega a Herdr | REG_id_virtual_fuera_de_herdr, INV-PUENTE-11 |
| CA-10 | ESC_P2_anotacion_sobrevive: una anotacion creada en el tab sobrevive al ir y volver | REG_anotaciones_conservadas |
