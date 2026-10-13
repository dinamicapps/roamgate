---
archivos:
  - accion: modificar
    ruta: web/src/components/WorkspaceRail.tsx
  - accion: modificar
    ruta: web/src/components/RailFlyoutMenu.tsx
  - accion: modificar
    ruta: web/src/components/WorkspaceTree.tsx
cas:
  - CA-05
  - CA-06
depende_de:
  - T-003
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 004: Teclado y menus contextuales en riel y submenus

Accesibilidad de teclado y reutilizacion de los menus contextuales (D10).

## Subtareas

1. Riel con foco itinerante: Arriba/Abajo/Home/End entre items; Enter, Space o Derecha abren el submenu y enfocan su primer item.
2. Submenu: Arriba/Abajo/Home/End; Derecha sobre un worktree abre su sub-submenu; Izquierda o Escape cierran el nivel y devuelven el foco al item que lo abrio; Tab cierra todo.
3. Clic derecho, tecla ContextMenu o Shift+F10 sobre item del riel o del submenu abren `ContextMenu` (workspace) o `AgentContextMenu` (agente) con los mismos estados de WorkspaceTree (`setMenu`, `setAgentMenu`) y cierran el submenu. Reutilizar `keyboardContextMenuPoint` de treeKeyboard.ts.
4. Pruebas unitarias de la logica de teclado.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-05 | Navegacion por teclado |
| CA-06 | Menus contextuales existentes |

## Ejecutor: amelia

### Que hizo

- Riel con foco itinerante: flechas, Home/End; Derecha abre sin enfocar el workspace; Enter/Space enfocan y abren; foco al primer item
- Submenu: flechas, Home/End; Derecha abre el sub-submenu; Izquierda/Escape cierran un nivel y devuelven el foco al que lo abrio; Tab cierra todo
- ContextMenu y Shift+F10 abren ContextMenu/AgentContextMenu en keyboardContextMenuPoint y cierran el submenu
- Hover sobre otro item con un submenu abierto cambia al suyo, como barra de menu, sin enfocar el workspace
- focusRovingItem extraido de focusTreeItem en treeKeyboard.ts y compartido por arbol, riel y submenu; 4 pruebas en WorkspaceRailList.test.ts

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | El JS inicial queda en 790,2 de 800 KiB (241,1 de 256 KiB gzip) y los archivos en 160 de 160 | Dentro del presupuesto; se vuelca a post-works que queda sin margen para otra feature eager | amelia |
| 2 | Las flechas no hacen wrap en riel ni submenu | Aceptado: mismo comportamiento que el arbol (treeKeyboard.ts) | amelia |

## Verificador: quinn

### Que verifico

- CA-05: flechas en riel, Derecha abre sin cambiar de workspace, Abajo/End en el submenu, Izquierda devuelve el foco (tras T-006)
- CA-06: Shift+F10 abre ContextMenu y AgentContextMenu; clic derecho con mouse abre el ContextMenu

### Hallazgos de verificacion

| # | Hallazgo | Severidad | Estado |
|---|----------|-----------|--------|
| 1 | En vivo la terminal robaba el foco del riel y las teclas iban a la terminal (las pruebas unitarias no lo detectan) | bloqueante | resuelto en T-006 |
