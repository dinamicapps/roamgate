---
slug: 20261007-investigacion-filemanager-tabs
autor: julio-diaz
autor_kebab: julio-diaz
fecha_inicio: "2026-10-07"
fecha_fin: "2026-10-07"
estado: COMPLETADO
modo: investigacion
nivel: normal
tipo: investigacion
version_sistema: "2"
proveedor_ia: claude
ruta: investigacion
consumido_por: "Futuro work de implementacion (diseno/acotado) de la opcion elegida para el file manager como tab o panel"
abordaje:
  realizado_en: "2026-10-07"
  expertos_invitados: []
  party_mode: false
  ruta_propuesta: investigacion
  ruta_aprobada: investigacion
meta: "Insumo persistido que documenta el funcionamiento actual de file manager y tabs con citas path:linea, y un analisis de brechas comparado de las opciones A (tab) y B (panel independiente) con cambios requeridos, riesgos, impacto mobile/persistencia, esfuerzo estimado y recomendacion, suficiente para que un work de implementacion arranque sin re-investigar."
meta_definida_en: "2026-10-07"
cosecha:
  memoria_expertos:
    ejecutado: true
    fecha: "2026-10-07"
    por: julio-diaz
    reflexion_depositada: true
    reflexiones_por_agente: 4
disponible_como_insumo: true
consumidores: []
---
# Work: Investigacion: file manager y tabs (camino a tab o panel)

> Estado: **EN_PROGRESO** · Ruta: investigacion · Modo: investigacion · Nivel: normal · 2026-10-07

## Objetivo

Entender en detalle como funcionan hoy el file manager (vista Files del Workspace Inspector) y el sistema de tabs (Herdr + cliente), y determinar que faltaria para que el file manager sea (A) un tab propio o (B) un panel independiente fuera del Inspector.

## Abordaje (2026-10-07)

### Objetivo

Entender como funcionan hoy el file manager y el sistema de tabs, y determinar que faltaria para que el file manager sea (A) un tab propio o (B) un panel independiente. Ambas opciones se comparan con recomendacion.

### Evidencia recolectada

**File manager**
- Es la vista `files` del Workspace Inspector, no un modal ni ruta: montaje en `web/src/App.tsx:4234-4252`; host `web/src/components/WorkspaceInspectorHost.tsx:677` (panel) y `:725` (`FilePreviewTabs`).
- Logica real en `FileExplorerContent` (`web/src/components/FileExplorerDialog.tsx:337`); recursos/caches en `web/src/components/fileExplorerResources.ts:67-72`.
- Entrada unica `openInspector(view, workspaceId, opts)` (`App.tsx:1738`); disparadores: atajo `files.toggle` (`shortcutBindings.ts:48`), paleta (`App.tsx:3801`), nav mobile (`App.tsx:3976-3986`), arbol de workspaces (`App.tsx:4162`, `browseFilesForPane` `:2395`), links de terminal (`handleTerminalWorkspaceFile` `:2421`).
- Estado del Inspector en App (`App.tsx:1398`, `:1817`); cerrar = `open:false` con `display:none`, sigue montado (`app.css:767`).
- Scope por conexion+workspace/checkout (`workspaceResource.ts:150`); raiz backend = checkout o cwd del pane enfocado (`server/src/workspace/files.ts:78-96`).
- Contrato: WS `file.list|read|search|resolve|reveal` (`server/src/index.ts:998-1042`); HTTP download/upload/delete (`server/src/connections/http-routing.ts:17-75`).
- No hay rename/move/mkdir/editar en UI ni backend (`server/src/workspace/local-files.ts`, `remote-files.ts`).
- Sistema de tabs propio de previews (`ResourceFileTabs`, `workspaceResource.ts:366-451`), persistido en localStorage por scope.

**Tabs**
- Tab = tab de Herdr (multiplexor en servidor); tipo `Tab` sin `kind` (`web/src/types.ts:66-74`); contenido via `Pane` con `terminal_id` (`types.ts:76-91`).
- Solo terminales: `TerminalPaneLayout` (`App.tsx:995-1239`).
- Ciclo de vida por RPC a Herdr: `createTab`/`closeTab`/`renameTab`/`moveTab` (`store.ts:2637-2748`); validacion en `server/src/bridge/terminal-bridge.ts:953-994`.
- Persistencia en Herdr; cliente solo guarda pins (`tabPins.ts:6,118-136`). Sync multi-cliente via push + poll 5s (`store.ts:2232`, `:1539-1554`); modos `shared` vs `browser-local` (`terminal-bridge.ts:149-155`).
- Tabs inactivos se desmontan (`App.tsx:1047-1063`).

**Paneles / layout**
- Sin libreria de layout (`web/package.json:14-63`); layout a mano en `App.tsx` (4414 lineas): grid sidebar|resizer|main (`App.tsx:4146-4148`).
- Inspector: dock right/bottom, size/expanded, 4 vistas cerradas `files|changes|commits|history` (`workspaceResource.ts:7`, `:37`, `:96-106`); vistas por condicionales en `WorkspaceInspectorHost.tsx:534-580`.
- Superficies hardcodeadas (Inspector, AnnotationPanel, AssistantPanel) y `MobileView` union cerrada (`App.tsx:349-354`); mobile muestra una superficie a la vez (`styles/layout/app.css:973-995`).
- Docs: `FEATURES.md:92-110`, `:330+`; `docs/ARCHITECTURE.md:244-259`.

### Drifts detectados

| Claim del usuario | Evidencia | Resolucion acordada |
|---|---|---|
| "que ahora sea un panel" | Ya es un panel (vista del Inspector acoplable), pero no independiente: compite con Changes/Commits/History | Evaluar opcion B como panel independiente fuera del Inspector |
| "que sea un tab" | Tabs son de Herdr y solo terminales; sin discriminador `kind` | Evaluar opcion A incluyendo donde viviria el modelo (cliente vs protocolo Herdr) |
| (hallazgo lateral) | `FileExplorerDialog` modal es codigo muerto (`FileExplorerDialog.tsx:108`); Esc no cierra el panel | Registrar como hallazgo; fuera de scope de cambio |

### Profundizacion experta

No fue necesaria. Tres exploraciones paralelas (Explore) sobre file manager, tabs y layout.

### Ruta destilada

**investigacion**: el entregable es conocimiento (funcionamiento + analisis de brechas A vs B) consumido por un futuro work de implementacion.

Razon de NO ruta `responder`: hay consumidor declarado y el insumo debe persistir.
Razon de NO ruta `diseno`: aun no hay opcion elegida que modelar; la investigacion la habilita.

### Decision del usuario

Aprobada, 2026-10-07. Alcance: ambas opciones (A tab, B panel independiente) comparadas con recomendacion. `consumido_por`: futuro work de implementacion.

## Terreno

<!-- modelo:start vista=terreno -->
_(pendiente: lo escribe `agentos work terreno`)_
<!-- modelo:end -->

## Decisiones clave

| Fecha | Etapa | Decision | Resolucion |
|-------|-------|----------|------------|
| 2026-10-07 | E1 | Profundidad de A2 (tab nativo Herdr) | Verificar viabilidad; si no es verificable, `por-definir` |
| 2026-10-07 | E1 | Mover vs coexistir | Subdecision evaluada en cada opcion |
| 2026-10-07 | E1 | Capacidades faltantes del file manager | Fuera de alcance; solo registro |
| 2026-10-07 | E1 | Auditoria adversarial del discovery (3 rondas Codex) | Tras ronda 3 (1 MAYOR + 1 MEDIO), corregir y cerrar gate sin ronda 4 (freno 2, decision del usuario) |
| 2026-10-07 | E1 | Gate E1 | Aprobado; 5 frentes + T-EST, 10 CAs (`etapa-1/cas-cobertura-insumo.md`) |
| 2026-10-07 | E2 | Plan de 8 tareas en 4 olas (D1-D6) | Aprobado |
| 2026-10-07 | E4 | H-1 bloqueante: CA-03 mezclaba incertidumbre de evidencia con decisiones de producto | Desvio de CA-03 aprobado: categoria "parametro de decision" con talla por alternativa; correccion rumbo 1 + re-verificacion de correcciones |
| 2026-10-07 | E4 | Hallazgos N-1..N-5 (MENOR) | Corregir dentro del work antes de cerrar; re-verificado (vuelta 2 de 2) |
| 2026-10-07 | E4 | Hallazgos Q-1..Q-3 (MENOR) tras tope de verificacion | Corregir en texto sin nueva verificacion ([OVERRIDE]) |
| 2026-10-07 | E4 | Gate E4 y curaduria de rumbos | Aprobados; cierre COMPLETADO |

## Tareas

| T | Titulo | Status | Verif | Tags |
|---|--------|--------|-------|------|
| T-001 | Anatomia actual del file manager | done | - | F1, ola 1 |
| T-002 | Anatomia actual de los tabs (cliente, bridge, Herdr) | done | - | F2, ola 1 |
| T-003 | Matriz de estado T-EST | done | - | F1+F2, ola 2 |
| T-004 | Viabilidad de A2: acceso y extensibilidad de Herdr | done | - | F3, ola 1 |
| T-005 | Ficha A1: tab virtual en cliente | done | - | F3, ola 3 |
| T-006 | Ficha A2: tab nativo de Herdr | done | - | F3, ola 3 |
| T-007 | Ficha B: panel independiente | done | - | F4, ola 3 |
| T-008 | Comparativa, nucleo comun, recomendacion e insumo | done | - | F5, ola 4 |

## Iteraciones

| # | Fecha | Accion | Desde etapa | Hacia etapa | Razon |
|---|-------|--------|-------------|-------------|-------|

## Pausas

| Fecha inicio | Etapa | Razon | Fecha reanudacion |
|--------------|-------|-------|--------------------|

## Archivos modificados

Work de investigacion: no modifica codigo del sistema.

- `agent-os/work-records/20261007-investigacion-filemanager-tabs/**` (artefactos del work)
- `agent-os/post-works/_pendientes.md` (rumbo 2)
- `agent-os/capas-futuras/file-manager.md` (rumbo 3, nuevo)

## Cierre

Meta cumplida. Insumo consumible en `etapa-3/insumo-consolidado.md` para el work de implementacion.

- Recomendacion: B (panel independiente), variante mover, talla L; primer paso N1 (extraer el bloque Files de `WorkspaceInspectorHost` a un componente montable fuera del Inspector, sin cambio de comportamiento). A1 L en toda alternativa; A2 `por-definir` (Herdr sin punto de extension para tabs de contenido hasta v0.9.3/HEAD). 10 decisiones D-1..D-10 para el consumidor; D-2 (foco en shared) conviene decidirla primero.
- Verificacion: 10/10 CAs PASS (`etapa-4/07-verificacion.md`); citas mecanicas sin fallos y congruencia por muestreo en 3 pasadas.
- Rumbos: 5 pendientes post-work (`agent-os/post-works/_pendientes.md`), 2 capas futuras (`agent-os/capas-futuras/file-manager.md`), aprendizajes depositados en buffers de reflexion.
- Flujo de trabajo (P7): explorar archivos del workspace junto a la terminal; sin epica en el roadmap (la crearia el work consumidor).
