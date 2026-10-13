---
archivos:
  - accion: crear
    ruta: web/src/components/WorkspaceRail.tsx
  - accion: crear
    ruta: web/src/components/WorkspaceRail.css
  - accion: crear
    ruta: web/src/components/RailFlyoutMenu.tsx
  - accion: modificar
    ruta: web/src/components/WorkspaceTree.tsx
cas:
  - CA-02
  - CA-03
  - CA-04
  - CA-07
depende_de:
  - T-001
  - T-002
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
# Tarea 003: Riel y submenu flotante anidado

Componentes del riel y del submenu flotante (D6-D9).

## Subtareas

1. `WorkspaceRail`: boton de ampliar y la lista de items (iniciales, punto de estado con las clases de `agentClass`, pin, activo, tooltip). WorkspaceTree lo pinta en lugar de los paneles cuando `rail` es verdadero (sin panel Agents ni AgentLayoutControl).
2. `RailFlyoutMenu`: menu flotante en portal, `role="menu"`, posicionado a la derecha del item y acotado al viewport (`contextMenuPosition.ts`); los worktree hijos abren un sub-submenu al lado.
3. Apertura: hover con retardo de ~150 ms, cierre con ~250 ms de margen; click en el item enfoca el workspace (`store.focusWorkspace` + `onSelect`) y deja el submenu fijo; con `pointerType` touch solo click. Cierre con Escape, click fuera o al elegir.
4. Elegir el workspace o un worktree enfoca y llama `onSelect`; elegir un agente llama `store.focusPane` y `onSelectAgent`, como el arbol (WorkspaceTree.tsx:983-986, WorkspaceAgentRows.tsx:177-186).
5. Pruebas de componente donde el entorno lo permita (happy-dom) para apertura por click, contenido y eleccion.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-02 | Items del riel |
| CA-03 | Hover, click, touch y cierre |
| CA-04 | Submenu nested y eleccion |
| CA-07 | Nested aun con layout separate o compact |

## Ejecutor: amelia

### Que hizo

- WorkspaceRailList.tsx: items con iniciales, punto de estado, pin, activo y tooltip; openPath como unica fuente de los niveles abiertos
- RailFlyoutMenu.tsx: menu flotante por nivel en portal, role=menu, acotado con observeClampedContextMenu; worktrees abren sub-submenu
- Hover 150/250 ms, click enfoca y fija, touch solo tap; cierre con Escape, click fuera, scroll, blur y resize
- WorkspaceTree reutiliza workspaceSubtreeContainsActiveItem de workspaceRail.ts; gitStatusTitle y workspaceLocationTitle en workspaceTreeBadges.ts
- Pruebas happy-dom en WorkspaceRailList.test.ts; 287/287 en components, typecheck, oxlint y build dentro del presupuesto

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | WorkspaceRail.tsx junto a workspaceRail.ts choca por mayusculas en Windows (TS1149) | El componente se llama WorkspaceRailList.tsx | amelia |
| 2 | Con el submenu fijado por click, el hover sobre otro item del riel no cambia de submenu | Se corrige en T-004: con submenu abierto, el hover cambia al item como una barra de menu | amelia |
| 3 | En touch, tocar un worktree abre su sub-submenu en vez de elegirlo | Aceptado: su primera entrada elige el worktree; touch no tiene hover | amelia |

## Verificador: quinn

### Que verifico

- CA-03: hover abre y salir cierra tras el margen; click fija; click fuera cierra
- CA-04: submenu de AURORA con sus 4 agentes; elegir broker-bridge cambia el tab activo; sub-submenu del worktree fair-spark-5854
- CA-07: con layout separate el submenu muestra los agentes, la preferencia no cambia y el panel Agents vuelve al ampliar

### Hallazgos de verificacion

(ninguno)
