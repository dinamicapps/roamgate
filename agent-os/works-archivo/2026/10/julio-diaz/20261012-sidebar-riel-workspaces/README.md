---
slug: 20261012-sidebar-riel-workspaces
autor: julio-diaz
autor_kebab: julio-diaz
fecha_inicio: "2026-10-12"
fecha_fin: "2026-10-12"
estado: COMPLETADO
modo: normal
nivel: normal
tipo: feature
version_sistema: "2"
proveedor_ia: claude
ruta: acotado
abordaje:
  realizado_en: "2026-10-12"
  expertos_invitados: []
  party_mode: false
  ruta_propuesta: acotado
  ruta_aprobada: acotado
meta: "En desktop, un boton del header de Workspaces colapsa el sidebar a un riel angosto con un item por workspace de nivel superior (iniciales + estado de agentes + pin, tooltip con el nombre); hover (con retardo) o click abre un submenu flotante con la jerarquia nested de ese workspace (el workspace, sus agentes y cada worktree hijo como sub-submenu con sus agentes), navegable por teclado, cuyos items enfocan workspace/agente y cuyo clic derecho abre el ContextMenu actual; un boton del riel lo vuelve a ampliar al ancho previo; el estado colapsado persiste entre recargas y no aplica en mobile."
meta_definida_en: "2026-10-12"
---
# Work: Sidebar Workspaces colapsable a riel con submenus

> Estado: **EN_PROGRESO** · Ruta: acotado · Modo: normal · Nivel: normal · 2026-10-12

## Objetivo

Que la seccion Workspaces del sidebar pueda colapsarse a un riel compacto que funciona como menu con submenus (siempre con la jerarquia nested), con un boton para volver a ampliarla.

## Abordaje (2026-10-12)

Evidencia (subagente Explore): la seccion la pinta WorkspaceTree (web/src/components/WorkspaceTree.tsx:197; filas WorkspaceRow :903; agentes WorkspaceAgentRows.tsx:88,306), montada en .body > .sidebar > .sidebar-content (App.tsx:4328-4360) con .resizer (:4361). Ancho ya redimensionable MIN 180 / MAX 560 / DEFAULT 284 (App.tsx:252-254), persistido en sidebarWidth (:3757-3764), aplicado inline en gridTemplateColumns (:4330). Unico colapso existente: sidebarHidden todo-o-nada via sidebar.toggle Ctrl+Alt+B y Zen (App.tsx:1372,1661-1675; sidebar.css:1-3; app.css:109-119). Colapso por fila de grupos worktree en collapsedWorktreeGroups.v1 (workspaceTreeCollapse.ts:9-34). 'nested' es WorkspaceAgentLayout nested|separate|compact en localStorage workspaceAgentLayout (workspaceAgentLayout.ts:1-9; control AgentLayoutControl WorkspaceTree.tsx:115-153): repo -> worktrees hijos (buildWorkspaceHierarchy worktree.ts:77-109) -> panes con agente (agentSession.ts:7-24); los tabs no son filas, solo badge (:1150-1158). Acciones de fila: focusWorkspace (:983-986), chevron colapsa (:1136), menu contextual por right-click/long-press/teclado (:988-997) con ContextMenu.tsx:271-390; agente: focusPane y AgentContextMenu (WorkspaceAgentRows.tsx:177-186,364-403). Primitivas: ActionsMenu.tsx (role=menu, flechas, Escape, retorno de foco), observeClampedContextMenu (contextMenuPosition.ts:22), Radix solo popover (components/ui/popover.tsx). NO existe primitiva de submenu. Teclado de arbol treeKeyboard.ts:1-87. Preferencias via roamgateLocalStorage/subscribeLocalStorage (browserStorage.ts:1-105) y layoutPreferences.v1. Breakpoint mobile por html[data-layout] (layoutPreferences.ts:6-8,96). Pruebas unitarias bun:test (WorkspaceTree.test.ts, WorkspaceAgentRows.test.ts, treeKeyboard.test.ts, layoutPreferences.test.ts, contextMenuPosition.test.ts); sin e2e; presupuesto de assets scripts/check-web-assets.mjs:7-11. Docs: FEATURES.md:26-28,120,128-132,547; docs/SCREENSHOTS.md:177,280-282. Brecha: estado ampliado/riel con persistencia y relacion con Zen/sidebarHidden y el ancho; riel; primitiva de submenu anidado con teclado; cableado de acciones. Decisiones del usuario: ruta acotado; riel con iniciales (2 letras) + punto de estado de agentes + marca de pin + tooltip; apertura hover con retardo + click (click fija y enfoca el workspace; touch solo click); submenu con jerarquia nested (workspace, sus agentes, worktrees hijos como sub-submenu con sus agentes), clic derecho abre el ContextMenu actual; solo desktop (en mobile el sidebar ya es vista completa). Colapsado siempre se muestra nested sin cambiar la preferencia workspaceAgentLayout del modo ampliado. Works previos relacionados: 20261012-tab-archivos-vinculado (App.tsx, TabBar). Suficiencia: suficiente.

## Terreno

<!-- modelo:start vista=terreno -->
_(pendiente: lo escribe `agentos work terreno`)_
<!-- modelo:end -->

## Decisiones clave

| Fecha | Etapa | Decision | Resolucion |
|-------|-------|----------|------------|
|       |       |          |            |

## Tareas

| T | Titulo | Status | Verif | Tags |
|---|--------|--------|-------|------|

## Iteraciones

| # | Fecha | Accion | Desde etapa | Hacia etapa | Razon |
|---|-------|--------|-------------|-------------|-------|

## Pausas

| Fecha inicio | Etapa | Razon | Fecha reanudacion |
|--------------|-------|-------|--------------------|

## Archivos modificados

<!-- Se llena al cierre del work con git diff. -->

## Cierre

