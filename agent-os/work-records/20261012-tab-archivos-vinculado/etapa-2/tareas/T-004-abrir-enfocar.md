---
archivos:
  - accion: modificar
    ruta: web/src/App.tsx
  - accion: modificar
    ruta: web/src/components/TabBar.tsx
cas:
  - CA-02
  - CA-11
  - CA-12
  - CA-13
  - CA-14
  - CA-15
  - CA-16
depende_de:
  - T-003
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
# Tarea 004: P1: abrir o enfocar el tab desde todas las entradas

Un unico punto de entrada abre o enfoca el tab de archivos de una consola, y todas las entradas a Files convergen ahi.

## Subtareas

1. Funcion openOrFocusFilesTab(ownerTabId, origen): reusa el vinculo si existe; si no, calcula el directorio inicial una sola vez desde el cwd del pane enfocado relativo a la raiz (relativePathWithinCheckout, App.tsx:2403-2405), o la raiz si esta fuera.
2. Entradas: boton Files en la barra de tabs, opcion 'Abrir archivos de esta consola' en el menu del tab, paleta y Ctrl+Alt+E como toggle (REG_files_toggle).
3. Link de terminal: resolver ownerTabId desde el paneId de origen (REG_link_resuelve_pane_dueno).
4. Entrada sobre otro workspace: enfocarlo antes, como hoy (focusWorkspace App.tsx:1829).
5. Abrir desde Changes cierra el Inspector y abre el tab con el archivo.

## Dev Notes

- Las entradas que hoy abren el Inspector en Files se redirigen aqui; la vista Files del Inspector se retira en T-007.

## Verificacion

1. Manual: CA-02, CA-11..CA-16 con la receta de cada escenario.
2. typecheck y pruebas existentes en verde.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-02 | ESC_P1_reusar_existente: pedir los archivos de una consola que ya tiene tab enfoca el existente, no crea otro | REG_idempotencia_abrir_tab_archivos |
| CA-11 | ESC_P1_crear_en_subdir: el tab nace en el cwd del pane enfocado relativo a la raiz del checkout | REG_P1_raiz_al_crear |
| CA-12 | ESC_P1_cwd_fuera_de_raiz: con cwd fuera del checkout el tab abre en la raiz | REG_cwd_fuera_raiz_abre_raiz |
| CA-13 | ESC_P1_files_toggle_doble: Ctrl+Alt+E abre y la segunda vez vuelve a la consola | REG_files_toggle |
| CA-14 | ESC_P1_link_consola_no_activa: un link de archivo resuelve la consola duena desde su pane | REG_link_resuelve_pane_dueno |
| CA-15 | ESC_P1_otro_workspace: una entrada sobre otro workspace lo enfoca antes de abrir | DEC_P1_otro_ws_enfocar |
| CA-16 | ESC_P1_desde_changes: abrir un archivo desde Changes cierra el Inspector y abre el tab | DEC_P1_changes_cierra_inspector |
