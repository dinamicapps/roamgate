---
archivos:
  - accion: modificar
    ruta: server/src/workspace/files.ts
  - accion: modificar
    ruta: server/src/workspace/files.test.ts
  - accion: modificar
    ruta: web/src/components/TerminalView.tsx
  - accion: modificar
    ruta: web/src/components/TabBar.tsx
cas:
  - CA-14
  - CA-09
depende_de:
  - T-011
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 7
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 012: Links de terminal resueltos desde su pane (FM-07)

Verificando CA-14 en navegador: un link relativo al cwd del pane que lo imprimio (`index.ts` en un pane en server/src) no se resuelve, porque `file.resolve` (server/src/workspace/files.ts:349) usa la raiz del pane enfocado del workspace. Incluye tambien el arreglo de la anfitriona en TabBar: el clic en una consola con tab de archivos llegaba al grupo por la captura de puntero del reorder y no volvia a la consola.

## Subtareas

1. `file.resolve` acepta `pane_id` opcional validado contra el workspace: raiz = toplevel git del cwd de ese pane (o ese cwd); los candidatos relativos se prueban primero contra el cwd del pane y luego contra la raiz; la ruta devuelta es relativa a la raiz.
2. TerminalView envia el pane emisor y la cache de resolucion distingue el pane.
3. Pruebas de servidor y de cliente.

## Verificacion

1. Pruebas en verde; typecheck; build dentro de presupuesto.
2. Navegador: Ctrl+clic en `index.ts` impreso por un pane en server/src abre server/src/index.ts en el tab de archivos de su consola (CA-14).

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-14 | Un link de terminal resuelve la consola duena y el archivo desde el pane que lo emitio | REG_link_resuelve_pane_dueno |
| CA-09 | Clic en la consola con su tab de archivos activo vuelve a la consola | REG_id_virtual_fuera_de_herdr |

## Ejecutor: amelia

### Que hizo

- file.resolve acepta pane_id validado contra el workspace; la raiz es la del pane emisor y los candidatos relativos se prueban primero contra su cwd y luego contra la raiz.
- Helpers comunes paneCwd, workspacePanes y paneRoot extraidos de explorerRoot; pathBelowRoot puro con normalizacion de barras y mayusculas en win32.
- TerminalView envia el pane emisor y la cache de resolucion distingue por pane; 14+6+8 pruebas en verde, suite web sin fallas nuevas, build 160/160.
- Anfitriona: el clic en una consola con tab de archivos llegaba al grupo por la captura de puntero del reorder; el grupo ahora selecciona la consola cuando el clic le llega a el.
- Navegador (fm-prueba3): workspace/files.ts y ./index.ts impresos por el pane en server/src abren server/src/... en el tab de archivos de su consola; el clic en la consola vuelve a ella.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Si el pane emisor y el pane enfocado de su consola estan en repos distintos, el tab abre una ruta relativa a otra raiz (App.tsx:2587-2606) | Caso de borde registrado en post-works | amelia |
| 2 | La cache positiva de links del cliente dura 30 s (terminalFileLinks.ts:9): tras un cd el mismo texto puede resolver al archivo anterior hasta que expire | Registrado en post-works | amelia |
| 3 | Los nombres sin barra (index.ts) no son candidatos a link por diseno; hace falta dir/archivo o ./ | Comportamiento previo intencional para evitar falsos positivos | amelia |
| 4 | Archivos no declarados: file-paths.ts(.test), terminalFileLinks.ts(.test) | Aceptados: normalizador y cache del link | amelia |

## Verificador: quinn

### Que verifico

- CA-14: Ctrl+clic en workspace/files.ts y ./index.ts impresos por un pane en server/src abre el archivo correcto en el tab de su consola; CA-09: el clic en la consola con su tab activo vuelve a ella.

### Hallazgos de verificacion

(ninguno)
