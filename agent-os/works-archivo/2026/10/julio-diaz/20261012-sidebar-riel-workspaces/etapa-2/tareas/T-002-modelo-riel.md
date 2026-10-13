---
archivos:
  - accion: crear
    ruta: web/src/components/workspaceRail.ts
  - accion: crear
    ruta: web/src/components/workspaceRail.test.ts
cas:
  - CA-02
  - CA-04
  - CA-07
depende_de: []
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 002: Modelo del riel: items, iniciales, estado agregado y jerarquia nested

Funciones puras que convierten workspaces y panes en el modelo del riel, probadas con TDD.

## Subtareas

1. `workspaceInitials(nombre)`: 2 letras (iniciales de las dos primeras palabras, o las dos primeras letras/digitos si es una sola palabra; separadores `-`, `_`, `.`, espacio y camelCase), en mayusculas; nombre vacio da `?`.
2. `aggregateAgentStatus(panes)`: prioridad blocked > working > done > idle > unknown; sin agentes, `null`.
3. `buildRailItems(...)`: a partir de `buildWorkspaceHierarchy` (worktree.ts:77-109) y `groupAgentPanesByWorkspace`, un item por workspace de nivel superior en el orden del arbol, con iniciales, estado agregado del subarbol, pin, activo (misma regla que `workspaceSubtreeContainsActiveItem`, WorkspaceTree.tsx:877) y sus entradas de submenu: el workspace, sus agentes y cada worktree hijo con sus agentes (recursivo). No depende de `workspaceAgentLayout` (CA-07).

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-02 | Orden, iniciales, estado agregado, pin y activo |
| CA-04 | Contenido nested del submenu |
| CA-07 | Independiente de la preferencia de layout |

## Ejecutor: amelia

### Que hizo

- workspaceRail.ts con workspaceInitials, aggregateAgentStatus y buildRailItems (jerarquia nested, sin parametro de layout)
- 15 pruebas TDD en workspaceRail.test.ts: iniciales Unicode/camelCase/kebab, prioridad, pins primero, anidado recursivo, activo
- aggregateAgentStatus reutiliza AGENT_STATE_PRIORITY de agentSession.ts (exportado), el mismo orden del resumen de agentes del tab

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | El plan (D6) fijaba done > idle; agentSession.ts:53 ordena idle > done para el resumen del tab | Un solo orden: se exporta AGENT_STATE_PRIORITY y el riel lo reutiliza, para que punto del riel y badge del tab no se contradigan | amelia |
| 2 | La regla de activo del subarbol duplica workspaceSubtreeContainsActiveItem (WorkspaceTree.tsx:877) | Se deduplica en T-003 al integrar el riel en WorkspaceTree | amelia |

## Verificador: quinn

### Que verifico

- CA-02/CA-04/CA-07: iniciales ED/AU/RP, estado agregado, pin primero y jerarquia nested vistos en el riel vivo; 15 pruebas del modelo en verde

### Hallazgos de verificacion

(ninguno)
