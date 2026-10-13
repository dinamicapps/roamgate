---
completedAt: "2026-10-12"
file_type: plan-etapa-2
inputDocuments:
  - README.md
status: approved
---
# Plan de implementacion - Etapa 2

**Anfitrion**: Bob
**Fecha**: 2026-10-12
**Modo**: normal
**Nivel**: normal

La seccion Workspaces del sidebar gana un segundo estado, el **riel**: una columna angosta con un item por workspace de nivel superior que funciona como menu con submenus de la jerarquia nested. Bob materializa sin elevar a Winston: todo el cambio vive en la capa web (App.tsx, WorkspaceTree y componentes nuevos), no cambia fronteras de modulo ni toca el servidor ni el protocolo con Herdr.

## Decisiones tecnicas

| # | Decision | Valor final | Justificacion |
|---|---|---|---|
| D1 | Estado del riel | `sidebarRail` booleano en App.tsx, persistido con `roamgateLocalStorage` (clave `sidebarRail`, junto a `sidebarWidth` en App.tsx:255) | Es preferencia del navegador como el ancho; no depende de la conexion |
| D2 | Ancho | Riel de 52 px fijo en `gridTemplateColumns` (App.tsx:4330); `sidebarWidth` no se toca, asi ampliar vuelve al ancho previo; el `.resizer` no arrastra en riel | El ancho persistido sigue siendo el del modo ampliado |
| D3 | Ocultar vs riel | Independientes: `sidebarHidden` (Ctrl+Alt+B y Zen, App.tsx:1661-1675) oculta lo que haya; al mostrarse vuelve en el estado que tenia | No se cambia el contrato de Zen ni del atajo |
| D4 | Mobile | El riel solo aplica con `!mobile`; en mobile no aparece el boton de colapsar y el sidebar se ve como hoy | Decision del usuario: en mobile el sidebar ya es vista completa |
| D5 | Nested forzado | En riel se usa la jerarquia nested (buildWorkspaceHierarchy + agentsByWorkspace) sin importar `workspaceAgentLayout`; la preferencia no se escribe, y el panel Agents de `separate` no se pinta en riel | Decision del usuario: colapsado siempre nested |
| D6 | Item del riel | Iniciales de 2 letras de `workspaceDisplayName`, punto de estado agregado de los agentes del subarbol (blocked > working > done > idle; sin agentes, sin punto), marca de pin, resaltado si el subarbol contiene el item activo, tooltip con el nombre | Decision del usuario (iniciales + estado) |
| D7 | Submenu | Componente nuevo de menu flotante anidado, `role="menu"`, en portal a `document.body`, posicionado al lado del item y acotado al viewport con la logica de `contextMenuPosition.ts` | No existe primitiva de submenu; ActionsMenu (ActionsMenu.tsx) es plano |
| D8 | Apertura | Hover con retardo de apertura (~150 ms) y de cierre (~250 ms, para cruzar al flotante); click enfoca el workspace y deja el submenu fijo; con puntero touch solo click | Decision del usuario (hover + click) |
| D9 | Contenido | Primer item: el workspace (enfoca); luego sus agentes (icono de estado, titulo nested); luego cada worktree hijo como item con sub-submenu de sus agentes | Decision del usuario (jerarquia nested) |
| D10 | Menu contextual | Clic derecho (y tecla ContextMenu / Shift+F10) sobre item del riel o del submenu abre el ContextMenu o AgentContextMenu actual y cierra el submenu | Se reutilizan los menus existentes (ContextMenu.tsx:271-390, WorkspaceAgentRows.tsx:364-403) |

## Criterios de aceptacion

| ID | Criterio | Tareas |
|---|---|---|
| CA-01 | En desktop, un boton del header de Workspaces colapsa el sidebar al riel y un boton del riel lo amplia al ancho previo; el estado persiste tras recargar; en mobile no hay boton ni riel | T-001 |
| CA-02 | El riel muestra un item por workspace de nivel superior, en el orden del arbol (pins primero), con iniciales, punto de estado agregado de agentes, marca de pin, resaltado del activo y tooltip con el nombre completo | T-002, T-003 |
| CA-03 | Hover con retardo abre el submenu del item; click enfoca el workspace y lo deja abierto; en touch solo click; se cierra al salir (con margen para cruzar), con Escape y con click fuera | T-003 |
| CA-04 | El submenu contiene el workspace, sus agentes y cada worktree hijo como sub-submenu con sus agentes; elegir un item enfoca el workspace o el pane, igual que el arbol (onSelect / onSelectAgent) | T-002, T-003 |
| CA-05 | Riel y submenus se navegan por teclado: flechas, Home/End, Enter/Space/Derecha abren, Izquierda/Escape cierran y devuelven el foco al item que abrio | T-004 |
| CA-06 | Clic derecho, tecla ContextMenu o Shift+F10 sobre un item del riel o del submenu abre el ContextMenu o AgentContextMenu existente | T-004 |
| CA-07 | En riel la jerarquia es nested aunque la preferencia sea separate o compact; la preferencia no cambia y al ampliar se ve como antes | T-002, T-003 |
| CA-08 | Ctrl+Alt+B y Zen siguen ocultando y mostrando el sidebar; al volver conserva el estado riel o ampliado | T-001 |
| CA-09 | Typecheck, lint, pruebas web y presupuesto de assets pasan; FEATURES.md documenta el riel | T-005 |

## Tareas

| Tarea | Titulo | CAs | Depende de |
|---|---|---|---|
| T-001 | Estado del riel en App: persistencia, ancho, botones y mobile | CA-01, CA-08 | - |
| T-002 | Modelo del riel: items, iniciales, estado agregado y jerarquia nested | CA-02, CA-04, CA-07 | - |
| T-003 | Riel y submenu flotante anidado | CA-02, CA-03, CA-04, CA-07 | T-001, T-002 |
| T-004 | Teclado y menus contextuales en riel y submenus | CA-05, CA-06 | T-003 |
| T-005 | Docs, presupuesto y verificacion de conjunto | CA-09 | T-004 |

## Capa de seguridad y datos

No aplica: cambio solo de presentacion en la web; no hay endpoints, permisos ni persistencia de servidor. La unica persistencia nueva es una preferencia de navegador (`sidebarRail`).

## Evidencia

Las tareas T-001, T-003 y T-004 exigen evidencia de UI (capturas antes/despues en `etapa-4/evidencia/ui/`), con el sistema corriendo en modo browser-local y sin mover el foco de los workspaces del usuario.
