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
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 3
file_type: tarea-etapa-2
standards_cargados: []
status: done
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

## Ejecutor: amelia

### Que hizo

- App: sesion de vinculos por (connectionId, generation) alimentada con snapshots frescos, sync entre pestanas y un dueno de superficie que se limpia al cambiar de consola.
- openOrFocusFilesTab idempotente con directorio inicial desde el cwd del pane enfocado; Ctrl+Alt+E pasa a toggleFilesTab (abre, enfoca o vuelve a la consola).
- TabBar: tab de archivos pegado a su consola en .tabbar-tab-group, sin numero, pin, rename, menu ni drag propio; id virtual solo como React key (filesTabStrip.ts).
- FilesTabSurface (lazy) monta WorkspaceFilesView con key por vinculo, filesTabFiles:{owner} y ratios del vinculo; anotaciones con scope del vinculo via nucleos compartidos.
- Terminal oculta con visibility:hidden (sin resize a Herdr) y .files-tab-surface en la guarda de foco (INV-PUENTE-05).
- Pruebas: filesTabStrip.test.ts, adjacentStripEntry y guarda de foco; suite 1248 pass, 9 fail previas (terminalComposer).
- Navegador (anfitriona): toggle, vuelta a la terminal, rehidratacion de AGENTS.md, un solo tab en el strip y claves con prefijo de conexion; captura CA-09-despues.png.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Archivos no declarados: TabBar.css, FilesTabSurface.css, fileExplorerResources.ts, filesTabStrip(.test).ts, terminalFocus.test.ts, styles/layout/app.css | Aceptados: CSS co-locado segun CONTRIBUTING y extraccion DRY de helpers de preview; no habia lote paralelo | amelia |
| 2 | Ver cambios desde el tab (D-05) no cableado: el boton Changes del preview depende de renderFileChanges del host del Inspector | Pasa a T-007 (ESC_P2_ver_cambios, CA-26) junto con la API del Inspector | amelia |
| 3 | FilesTabSurface.css duplica ~70 lineas de WorkspaceInspectorHost.css:150-365 | Consolidar en T-007 cuando el Inspector pierda Files | amelia |
| 4 | expandedNavigationRatio del vinculo queda sin uso en el tab a ancho completo | Se acepta; el vinculo conserva el campo por compatibilidad con datos.md | amelia |
| 5 | CA-10 (anotacion sobrevive) no ejercitado en navegador; ver Annotations requiere crear una anotacion real | Queda para la verificacion manual de E4 | amelia |
| 6 | Ctrl+Alt+W con el tab activo aun cierra la consola; Esc en cascada y limpieza tras closeTab pendientes | Alcance de T-005 | amelia |
