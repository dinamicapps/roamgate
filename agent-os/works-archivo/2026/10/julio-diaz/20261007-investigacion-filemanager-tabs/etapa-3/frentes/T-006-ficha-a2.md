# T-006 Ficha A2: file manager como tab nativo de Herdr (Frente F3)

Fecha: 2026-10-07. Repo Roamgate en rama `dev` @ d703e6f. CAs: CA-01, CA-03, CA-05, CA-09.
Entradas: `etapa-3/frentes/T-004-viabilidad-herdr.md` (veredicto de viabilidad), `T-003-matriz-estado.md` (T-EST), `T-002-anatomia-tabs.md`, `T-001-anatomia-file-manager.md`.
Alcance: solo la ficha de A2 en variantes `mover` y `coexistir`. No compara con A1 ni con B y no recomienda (eso es F5).

Definicion de A2 usada en esta ficha: Herdr conoce un tab cuyo contenido no es una terminal (un tab "Files"); Roamgate lo lista, lo enfoca, lo cierra y lo renderiza como el file manager. Lo que eso exige a Herdr se escribe como **requisito sobre un sistema externo** (seccion R-H), no como cambio a codigo propio.

Leyenda de certeza: `verificado` (cita path:linea del repo o URL/commit externo) / `inferencia` (cita las afirmaciones de origen) / `hipotesis` / `por-definir`. Toda `hipotesis` y `por-definir` esta detallada en el campo 8 con pregunta bloqueada, fuentes revisadas y condicion de cierre. Leyenda de clasificacion de cambios (campo 4): `confirmado` (necesario en ambas variantes), `condicional:mover`, `condicional:coexistir`, `hipotesis`.

## Fuentes externas

EXT-1..EXT-6 son las de T-004 (repo publico `github.com/herdrdev/herdr`, schema y docs en tag `v0.9.0`). Fuentes nuevas revisadas en esta tarea (2026-10-07):

| ID | Fuente | Ref |
|----|--------|-----|
| EXT-7 | https://github.com/herdrdev/herdr/compare/v0.9.0...v0.9.3 (API GitHub `compare`) | 229 commits; incluye diff de `docs/next/api/herdr-api.schema.json` y `docs/next/CHANGELOG.md` |
| EXT-8 | `docs/next/api/herdr-api.schema.json` en tag `v0.9.3` (commit `7b116c05bfda646af39d2524c54e70c751f57ee8`) | `"protocol": 22` l.3; `TabInfo` l.1038 y l.10537; `TabCreateParams` l.4273; evento `tab.moved` l.4088 |
| EXT-9 | `docs/next/api/herdr-api.schema.json` en `master` HEAD `4e624cd50e26f1284fed6e89f557479c235fcb8d` | byte a byte identico a EXT-8 (comparacion `cmp` de ambos raw, 2026-10-07) |
| EXT-10 | `docs/next/website/src/content/docs/plugins.mdx` en tag `v0.9.3` y en HEAD `4e624cd5` | l.31-33: "Runtime action registration and native non-terminal plugin UI are not part of plugin v1" (texto identico en ambas refs) |
| EXT-11 | `docs/next/CHANGELOG.md` en tag `v0.9.3` | l.13 seccion 0.9.2; l.16 "The Herdr-specific pane graphics API is gone" (#4561); l.34 confirmacion al cerrar el ultimo tab |
| EXT-12 | `docs/next/website/src/content/docs/socket-api.mdx` en tag `v0.9.3` | l.105 metodos Tab; l.204-206 el contenido de un tab es un arbol BSP de nodos `pane` y `split`; l.818-821 evento `tab.moved` |

## Declaracion CA-05 (accesibilidad y punto de extension)

| Afirmacion | Estado | Evidencia |
|---|---|---|
| El codigo y la spec de Herdr son accesibles (repo publico Apache-2.0, JSON Schema versionado con el numero de protocolo) | verificado | EXT-1, EXT-3 (T-004 seccion a) |
| En protocolo 22 / plugin v1 no existe punto de extension para tabs de contenido no-terminal (tag v0.9.0) | verificado | EXT-3 l.1032 y l.4339, EXT-5 l.31-33 (T-004 seccion c) |
| Entre v0.9.0 y v0.9.3 el schema no cambia `TabInfo` ni `TabCreateParams`: ninguno gana `kind`, tipo ni metadata; el protocolo sigue en 22. Los cambios del diff son de panes (`restore_error`, `resume_argv`, `pane.clear`, `pane.link.resolve`, retiro de `pane.graphics.*`) y de servidor (`server.ssh_agent.register`) | verificado | EXT-7 (diff del schema), EXT-8 l.3, l.1038, l.4273 |
| HEAD de `master` (4e624cd5) tiene el mismo schema que v0.9.3 | verificado | EXT-9 |
| La documentacion de plugins sigue excluyendo la UI nativa no-terminal en v0.9.3 y en HEAD 4e624cd5 | verificado | EXT-10 |
| En v0.9.3 el contenido de un tab es exclusivamente un arbol de panes (BSP de `pane`/`split`) | verificado | EXT-12 l.204-206 |
| Roamgate fija y verifica Herdr 0.9.0 / protocolo 22 | verificado | `server/src/herdr/release.ts:14`, `server/src/herdr/release.ts:15` |

Efecto sobre T-004: los dos `por-definir` de T-004 (diff del schema posterior a v0.9.0; tipos no-terminal en 0.9.1-0.9.3 o master) quedan **cerrados como `verificado` negativo** hasta v0.9.3 y HEAD 4e624cd5 (EXT-7..EXT-10). Lo que sigue abierto es futuro: si Herdr aceptara alguna vez el requisito R-H (PD-A2-1).

Conclusion operativa (`inferencia`, de las filas anteriores): A2 no se puede construir sobre ninguna version publicada de Herdr; toda la ficha describe lo que Roamgate tendria que cambiar **si** Herdr publicara el requisito R-H. Por eso la forma exacta de los contratos queda condicionada a una spec que no existe.

## Requisito sobre el sistema externo (R-H)

Lo que tendria que existir en el protocolo de Herdr para que A2 sea posible. Cada fila: estado de la ausencia hoy (verificado) y estado de la forma requerida.

| ID | Requisito sobre Herdr | Ausencia hoy | Forma requerida |
|---|---|---|---|
| R-H1 | `TabInfo` con discriminador de tipo (p. ej. `kind: "terminal" \| "content"`) y metadata opaca del cliente (p. ej. `{owner:"roamgate", view:"files", scope, path}`) devuelta por `tab.list`, `tab.get` y los eventos `tab.*` | verificado: EXT-8 l.1038, l.10537 (campos: agent_status, focused, label, number, pane_count, tab_id, workspace_id) | por-definir (PD-A2-1) |
| R-H2 | `tab.create` capaz de crear un tab sin pane de terminal (o con un pane de contenido), con `kind` y metadata iniciales | verificado: `TabCreateParams` solo `cwd`, `env`, `focus`, `label`, `workspace_id` (EXT-8 l.4273); el tab es arbol de panes (EXT-12 l.204-206) | por-definir (PD-A2-1) |
| R-H3 | Metodo para actualizar la metadata del tab (equivalente a `pane.report_metadata` pero de tab) y evento push asociado (p. ej. `tab.metadata_updated`) | verificado: no hay `tab.report_metadata` (EXT-4 l.105, T-004 c); la fila Tab de EXT-12 l.105 lista solo create/list/get/focus/rename/move/close | por-definir (PD-A2-1) |
| R-H4 | Persistencia de `kind` + metadata al reiniciar Herdr y al restaurar sesion | por-definir: hoy ni siquiera esta verificada la persistencia de `tab_id` (T-003 PD-1, T-002 b6) | por-definir (PD-A2-1, PD-1) |
| R-H5 | Semantica definida para el tab de contenido en la TUI de Herdr y en el foco: que muestra la TUI, si `tab.focus` lo admite, que pane queda `focused` en el workspace cuando el tab enfocado no tiene panes | verificado (ausencia): sin tipo de tab en el schema (EXT-8) | por-definir (PD-A2-2) |
| R-H6 | Senal de capacidad para gating (nuevo numero de protocolo o flag en `server.info`), analoga a `tab.move` en protocolo 16 | verificado (ausencia): protocolo sigue en 22 en v0.9.3 y HEAD (EXT-8 l.3, EXT-9) | por-definir (PD-A2-1) |

## Variante `mover` y variante `coexistir`

- `mover`: Files deja de ser vista del Inspector; la unica superficie del file manager es el tab de contenido de Herdr. El Inspector queda con Changes, Commits, History.
- `coexistir`: el Inspector conserva Files y ademas existe el tab de contenido "Files"; ambos montan el mismo explorador.

Los nueve campos se presentan una sola vez, marcando en cada fila que difiere por variante.

## Campo 1. Superficie afectada

| # | Modulo / archivo | Por que se toca | Variante | Cita | Certeza |
|---|---|---|---|---|---|
| S1 | Herdr: schema del protocolo (externo) | Requisito R-H1..R-H6 | ambas | EXT-8 l.1038, l.4273 | verificado (ausencia) |
| S2 | `server/src/herdr/release.ts` | Version verificada de Herdr fijada en 0.9.0 / protocolo 22; habria que subirla a la version que publique R-H | ambas | `server/src/herdr/release.ts:14`, `server/src/herdr/release.ts:15` | verificado (punto); inferencia (necesidad) |
| S3 | `server/src/bridge/protocol-compat.ts` | Rango aceptado 14-20 y 22; un protocolo nuevo se rechaza hoy | ambas | `server/src/bridge/protocol-compat.ts:1`, `server/src/bridge/protocol-compat.ts:2`, `server/src/bridge/protocol-compat.ts:14` | verificado |
| S4 | `server/src/bridge/terminal-bridge.ts` | Gating por capacidad, mismo patron que `tabMoveSupported` | ambas | `server/src/bridge/terminal-bridge.ts:159`, `server/src/bridge/terminal-bridge.ts:149` | verificado (patron) |
| S5 | `server/src/index.ts` | Publicar la capacidad en `workspace.list` (como `tab_move_supported`); intercepcion de `tab.create` con `browser_source` en browser-local | ambas | `server/src/index.ts:1285`, `server/src/index.ts:942`, `server/src/index.ts:1271` | verificado (patron) |
| S6 | `server/src/connections/runtime.ts` | `DEFAULT_EVENTS` es una lista fija; un evento nuevo de metadata de tab habria que suscribirlo | ambas | `server/src/connections/runtime.ts:73`, `server/src/connections/runtime.ts:84` | verificado |
| S7 | `server/src/workspace/files.ts` | `explorerRoot` usa el cwd del pane `focused` del workspace via `pane.list`; con un tab sin panes enfocado la raiz queda indefinida | ambas | `server/src/workspace/files.ts:78`, `server/src/workspace/files.ts:84`, `server/src/workspace/files.ts:92` | verificado (punto); hipotesis H-A2-1 (efecto) |
| S8 | `web/src/types.ts` | Tipo `Tab` sin kind ni metadata | ambas | `web/src/types.ts:66` | verificado |
| S9 | `web/src/store.ts` | `createTab`, `focusTab` (pre-resize del relay en shared), `guardTabClose`/limpieza de borradores, refresh con `pane.layout` del tab activo | ambas | `web/src/store.ts:2637`, `web/src/store.ts:2587`, `web/src/store.ts:2604`, `web/src/store.ts:2687`, `web/src/store.ts:2716`, `web/src/store.ts:1335`, `web/src/store.ts:1424` | verificado |
| S10 | `web/src/App.tsx` | El stage renderiza el layout de panes del tab activo; habria que bifurcar a render del file manager; entradas `openFileExplorer`/`openFileExplorerFile` | ambas (render); mover (entradas) | `web/src/App.tsx:997`, `web/src/App.tsx:4206`, `web/src/App.tsx:2154`, `web/src/App.tsx:2159`, `web/src/App.tsx:1738` | verificado |
| S11 | `web/src/components/TabBar.tsx` | Strip, menu contextual y visibilidad mobile del strip; icono/afordancias del tab de contenido | ambas | `web/src/components/TabBar.tsx:153`, `web/src/components/TabBar.tsx:294` | verificado |
| S12 | `web/src/components/MobileTabSheet.tsx` | Lista, activa, cierra y crea tabs en mobile | ambas | `web/src/components/MobileTabSheet.tsx:141`, `web/src/components/MobileTabSheet.tsx:182`, `web/src/components/MobileTabSheet.tsx:197` | verificado |
| S13 | `web/src/tabLayout.ts`, `web/src/terminalResize.ts`, `web/src/tabShortcuts.ts` | Caches de geometria y viewport por tab y destino de cierre por atajo, pensados para tabs con panes | ambas | `web/src/tabLayout.ts:8`, `web/src/terminalResize.ts:22`, `web/src/tabShortcuts.ts:25` | verificado (punto); hipotesis H-A2-2 (necesidad de cambio) |
| S14 | `web/src/components/FileExplorerDialog.tsx` | `FileExplorerPanel` es el envoltorio reutilizable del explorador | ambas | `web/src/components/FileExplorerDialog.tsx:177` | verificado |
| S15 | `web/src/components/WorkspaceInspectorHost.tsx` | Monta Files y lo mantiene montado oculto; dueno de `fileTabs` y `drillInByView` | mover (retirar Files); coexistir (segundo consumidor) | `web/src/components/WorkspaceInspectorHost.tsx:677`, `web/src/components/WorkspaceInspectorHost.tsx:668`, `web/src/components/WorkspaceInspectorHost.tsx:266`, `web/src/components/WorkspaceInspectorHost.tsx:316` | verificado |
| S16 | `web/src/workspaceResource.ts` | `InspectorView` incluye `files`; prefijos de localStorage del Inspector | mover | `web/src/workspaceResource.ts:7`, `web/src/workspaceResource.ts:127`, `web/src/workspaceResource.ts:128` | verificado |
| S17 | `web/src/shortcutBindings.ts` | Atajo `files.toggle` hoy abre la vista del Inspector | mover | `web/src/shortcutBindings.ts:48` | verificado |

## Campo 2. Frontera tocada

| Frontera | Tocada | Certeza | Origen |
|---|---|---|---|
| Cliente (web/) | Si, en ambas variantes | inferencia | S8-S17 |
| Bridge (server/) | Si, en ambas variantes | inferencia | S2-S7 |
| Herdr | Si, en ambas variantes, como requisito externo R-H (no es codigo de este repo) | verificado (que hoy no existe); inferencia (que es necesario) | Declaracion CA-05; EXT-8, EXT-10 |

## Campo 3. Contratos que se tocan o se crean

| # | Contrato | Existente (cita) | Accion | Variante | Certeza |
|---|---|---|---|---|---|
| C1 | `TabInfo` / `TabCreateParams` de Herdr | EXT-8 l.1038, l.4273 | Requisito externo: agregar kind + metadata (R-H1, R-H2) | ambas | verificado (ausencia); forma por-definir (PD-A2-1) |
| C2 | Metodo/evento de metadata de tab | no existe (EXT-12 l.105) | Requisito externo (R-H3) | ambas | por-definir (PD-A2-1) |
| C3 | Rango de protocolo del bridge | `server/src/bridge/protocol-compat.ts:14` | Modificar para aceptar el protocolo que traiga R-H | ambas | inferencia (de C1 + S3); numero por-definir |
| C4 | Campos de capacidad en `workspace.list` | `server/src/index.ts:1284`, `server/src/index.ts:1285` | Nuevo flag (p. ej. `content_tabs_supported`) | ambas | inferencia (patron de `tab_move_supported`); nombre hipotesis |
| C5 | Lista de eventos suscritos | `server/src/connections/runtime.ts:73` | Agregar el evento de R-H3 | ambas | inferencia; nombre por-definir |
| C6 | Tipo `Tab` del cliente | `web/src/types.ts:66` | Agregar kind + metadata espejo de C1 | ambas | inferencia (de C1) |
| C7 | RPC `tab.create` (cliente -> bridge -> Herdr) y su intercepcion browser-local | `web/src/store.ts:2637`, `server/src/index.ts:942` | Nuevos params de creacion de tab de contenido; en browser-local hoy se exige `browser_source` de un pane terminal | ambas | verificado (contrato actual); forma por-definir |
| C8 | `InspectorView` y `MobileView` | `web/src/workspaceResource.ts:7`, `web/src/App.tsx:1310` | DP-A2-4=a: quitar `files` de ambas uniones (modificado). DP-A2-4=b: sin cambio de tipo; `files` queda como valor no renderizado y el tab se ve en `session`. Mismo criterio que T-005 K6 (DP-4) y T-007 3.7 (DP-B3) (correccion E4 v2, N-3) | condicional:mover | verificado (contrato actual) |
| C9 | Claves de localStorage `workspaceInspectorFile:{owner}` y `workspaceInspector:{owner}` | `web/src/workspaceResource.ts:128`, `web/src/workspaceResource.ts:127` | mover: el estado de seleccion pasa a la metadata del tab o a una clave nueva por `tab_id`; coexistir: dos superficies escriben la misma clave | ambas, con efecto distinto | hipotesis H-A2-3 (destino) |
| C10 | Atajo `files.toggle` | `web/src/shortcutBindings.ts:48` | Re-semantizar a "abrir/enfocar tab Files" | condicional:mover | inferencia |

## Campo 4. Cambios por archivo/modulo

| # | Cambio | Clasificacion | Certeza | Origen |
|---|---|---|---|---|
| X1 | Herdr publica R-H1..R-H6 (externo, no implementable desde este repo) | confirmado (requisito externo) | verificado (ausencia); forma por-definir (PD-A2-1) | Declaracion CA-05 |
| X2 | Subir version verificada de Herdr y aceptar el protocolo nuevo (`release.ts`, `protocol-compat.ts`) | confirmado | inferencia (de X1 + S2/S3) | S2, S3 |
| X3 | Exponer capacidad y gatear (`terminal-bridge.ts`, `index.ts`) | confirmado | inferencia (patron `tab.move`) | S4, S5 |
| X4 | Suscribir evento de metadata de tab (`runtime.ts`) | confirmado si R-H3 trae evento | por-definir (PD-A2-1) | S6 |
| X5 | Definir raiz del explorador cuando el tab enfocado es de contenido (`files.ts`) | hipotesis | hipotesis H-A2-1 | S7 |
| X6 | Tipo `Tab` con kind/metadata (`types.ts`) | confirmado | inferencia (de C1) | S8 |
| X7 | `store.ts`: crear tab de contenido; no pedir `pane.layout` ni pre-dimensionar relay para el; cierre sin limpieza de borradores | confirmado | inferencia (de S9: esas rutas suponen panes de terminal) | S9 |
| X8 | `App.tsx`: render del file manager cuando el tab activo es de contenido | confirmado | inferencia | S10 |
| X9 | `TabBar.tsx` y `MobileTabSheet.tsx`: icono y afordancias del tab de contenido (renombrar/pin aplican igual porque es un tab de Herdr) | confirmado | inferencia (de C1 + T-002 a4, a6) | S11, S12 |
| X10 | `tabLayout.ts`, `terminalResize.ts`, `tabShortcuts.ts`: excluir tabs de contenido | hipotesis | hipotesis H-A2-2 | S13 |
| X11 | Nuevo componente host del file manager para el tab (reutiliza `FileExplorerPanel` y previews); la sub-vista de cambios del archivo se re-hoga segun DP-A2-5 | confirmado | inferencia (de S14, S15) | S14 |
| X12 | Retirar Files del Inspector (`WorkspaceInspectorHost.tsx`, `workspaceResource.ts`, `MobileView` en `App.tsx`) y re-apuntar las entradas de T-F1a a "abrir/enfocar tab Files"; quitar `files` de la union o conservarlo segun DP-A2-4 | condicional:mover | inferencia | S15, S16, S10 |
| X13 | Re-semantizar `files.toggle` y el boton Files mobile | condicional:mover | inferencia | S17, `web/src/App.tsx:3982` |
| X14 | Coordinar dos instancias del explorador sobre las mismas claves y caches (seleccion, ResourceFileTabs, showHidden) | condicional:coexistir | inferencia (de campo 5 filas 1, 3, 4, 7 y T-003 filas 1, 3, 4, 7); la perdida visible es la parte coexistir de H-A2-3 y solo afecta campo 5 y RG8 | Campo 5 filas 1, 3, 4, 7 |
| X15 | Reparto de las entradas de T-F1a entre Inspector y tab | condicional:coexistir | parametro de decision DP-A2-3 (campo 8b); todas las alternativas caen en `App.tsx`, ya contado en X8/X12 | T-001 T-F1a |

Correccion E4 (H-1): X14 pasa de `hipotesis` a `inferencia`, igual que el cambio equivalente en A1 (C11, C16) y en B (4.17): la necesidad de coordinar dos escritores se deduce de T-003; lo hipotetico es solo el efecto visible. X15 deja de ser `por-definir`: es un parametro de decision (antes PD-A2-3).

## Campo 5. Efecto sobre T-EST (15 piezas)

Efectos: `se mantiene` / `cambia de propietario/scope` / `se duplica` / `conflicto` / `no-aplica`.

| # | Pieza | mover | coexistir | Certeza | Origen |
|---|---|---|---|---|---|
| 1 | Arbol / cache del explorer | se mantiene (Map de modulo por `resourceKey`; el host del tab usa la misma clave) | conflicto: dos `FileExplorerContent` con copia `useState` propia escriben de vuelta la misma entrada; last-write-wins sobre expandidos | inferencia; efecto visible coexistir: hipotesis H-A2-3 | `web/src/components/fileExplorerResources.ts:67`; T-003 fila 1 |
| 2 | Cache de previews | se mantiene | se duplica el consumidor, sin conflicto (cache de solo lectura con dedupe) | inferencia | `web/src/components/fileExplorerResources.ts:70`; T-003 fila 2 |
| 3 | ResourceFileTabs | cambia de propietario: del host del Inspector a la superficie del tab; destino (localStorage por owner, por `tab_id` o metadata de Herdr compartida) depende de R-H3 | conflicto: dos hosts hacen read-modify-write de `workspaceInspectorFile:{owner}` sin suscripcion en vivo | mover: por-definir (PD-A2-1); coexistir: inferencia | `web/src/workspaceResource.ts:128`, `web/src/components/WorkspaceInspectorHost.tsx:266`; T-003 fila 3 |
| 4 | selection / activeFilePreview | cambia de propietario: de un unico `useState` en `App` a la instancia del tab (uno por tab de contenido si hay varios) | conflicto: un unico valor en `App` alimentaria dos superficies, o se duplica | inferencia | `web/src/App.tsx:1474`; T-003 fila 4 |
| 5 | Preferencias persistidas del Inspector | cambia: `view: files` deja de ser valor valido; dock/size/expanded no aplican al tab (ocupa el stage) | se mantiene | inferencia | `web/src/workspaceResource.ts:127`; T-003 fila 5 |
| 6 | Estado efimero del Inspector y retorno/foco | cambia de propietario: `returnTabId` lo sustituye el foco de tabs de Herdr (compartido en shared); `initialDirectory`/`originPaneId` tendrian que viajar en metadata o en estado local por `tab_id` | se mantiene para el Inspector; se duplica para el tab | mover: por-definir (PD-A2-1); coexistir: inferencia | `web/src/workspaceResource.ts:96`, `web/src/App.tsx:2200`; T-003 fila 6 |
| 7 | showHidden | se mantiene (clave por `resourceKey`) | conflicto: misma clave, leida solo al montar; las dos superficies divergen hasta remontar | inferencia | `web/src/components/FileExplorerDialog.tsx:382`, `web/src/components/fileExplorerResources.ts:76`; T-003 fila 7 |
| 8 | Pins de tabs | se mantiene: el tab de contenido tendria `tab_id` de Herdr y entraria en `tabPins.v1` como cualquier tab; supervivencia ligada a R-H4 | igual que mover | inferencia (mecanica); por-definir (persistencia, PD-1) | `web/src/tabPins.ts:6`, `web/src/tabPins.ts:92`; T-003 fila 8 |
| 9 | Geometria por tab | no-aplica al tab de contenido (no tiene panes); hay que excluirlo o tolerar layout vacio | igual que mover | hipotesis H-A2-2 | `web/src/tabLayout.ts:8`, `web/src/store.ts:1350`; T-003 fila 9 |
| 10 | Focus / navegacion shared vs browser-local | cambia de scope: abrir Files pasa a ser `tab.focus`; en shared lo ven todos los clientes (hoy abrir Files es local a la pestana); en browser-local queda local | igual para el tab; el Inspector conserva su comportamiento | inferencia | `web/src/store.ts:2623`, `web/src/store.ts:2627`, `web/src/store.ts:1369`; T-003 fila 10 |
| 11 | Raiz del explorador (servidor) | conflicto potencial: si el tab enfocado no tiene panes, el pane `focused` del workspace no esta definido | igual | hipotesis H-A2-1; semantica de Herdr por-definir (PD-A2-2) | `server/src/workspace/files.ts:84`, `server/src/workspace/files.ts:92`; T-003 fila 11 |
| 12 | Modo FilesystemBrowser | se mantiene (estado local del explorador) | se duplica (cada instancia tiene el suyo) | inferencia | `web/src/components/FileExplorerDialog.tsx:448`; T-003 fila 12 |
| 13 | Senal de refresco del explorador | se mantiene | se mantiene (ambas instancias leen la misma version) | inferencia | `web/src/fileExplorerRefresh.ts:7`; T-003 fila 13 |
| 14 | `mobileView` | cambia: Files se ve en `session` cuando el tab activo es de contenido; `files` sale de `MobileView` si DP-A2-4=a o queda como valor sin uso si DP-A2-4=b | se mantiene y se suma el tab | inferencia | `web/src/App.tsx:1310`, `web/src/workspaceResource.ts:7`; T-003 fila 14 |
| 15 | `drillInByView` | cambia de propietario: del host del Inspector al host del tab | se duplica | inferencia | `web/src/components/WorkspaceInspectorHost.tsx:316`; T-003 fila 15 |

Etiquetado homogeneo con T-005 y T-007 (correccion E4, H-3): coexistir = `conflicto` en filas 1, 3, 4 y 7 (4 filas; la fila 14 no entra en conflicto porque el tab se ve en `session` y `files` sigue siendo solo del Inspector). La perdida visible queda como `hipotesis` (parte coexistir de H-A2-3), igual que H-A1-1 y H-B1.

## Campo 6. Flujos mobile

### Flujos

| Flujo | mover | coexistir | Certeza |
|---|---|---|---|
| Abrir | Boton Files o MobileTabSheet -> crear o enfocar el tab de contenido; se ve en la vista `session`. En shared el foco se mueve tambien para los demas clientes (`tab.focus`) | Boton Files abre el Inspector como hoy (`mobileView = files`); el tab Files se abre desde MobileTabSheet | inferencia (de `web/src/App.tsx:3982`, `web/src/App.tsx:1840`, `web/src/store.ts:2627`) |
| Cambiar entre Files y terminal | Por MobileTabSheet o por el strip (con dos tabs el strip se muestra en mobile) | Inspector: botones Terminal/Files como hoy. Tab: MobileTabSheet o strip | inferencia (de `web/src/components/TabBar.tsx:153`, `web/src/components/MobileTabSheet.tsx:141`) |
| Cerrar | `tab.close` via `requestCloseTab` desde MobileTabSheet, con guard de pin; cerrar el tab cierra el file manager para todos los clientes del workspace | Inspector: como hoy; tab: igual que mover | inferencia (de `web/src/components/MobileTabSheet.tsx:182`; T-002 a3) |
| Volver a terminal | El boton Terminal hoy solo pone `mobileView = session` y cierra el Inspector; si el tab activo es Files, `session` sigue mostrando Files: hace falta enfocar un tab terminal (equivalente a `returnTabId`) | Inspector: como hoy; tab: igual que mover | verificado (comportamiento actual `web/src/App.tsx:1645`, `web/src/App.tsx:3971`); inferencia (efecto) |

### Destino de los controles mobile

| Control | mover | coexistir | Certeza |
|---|---|---|---|
| `MobileView` "files" | Se elimina de la union (DP-A2-4=a) o queda como valor sin uso (DP-A2-4=b) | Se mantiene | inferencia (de `web/src/App.tsx:1310`, `web/src/workspaceResource.ts:7`) |
| Boton Files de la nav mobile | Re-apuntado a crear/enfocar el tab Files | Se mantiene apuntando al Inspector; su relacion con el tab la fija el parametro de decision DP-A2-3 (campo 8b) | inferencia |
| TabBar oculto con un solo tab | Un tab Files mas un tab terminal suman dos tabs y hacen visible el strip; un workspace con solo el tab Files (sin terminal) depende de que Herdr lo admita | igual | verificado (regla `web/src/components/TabBar.tsx:153`); por-definir (workspace sin tab terminal, PD-A2-2) |
| MobileTabSheet | Lista el tab Files; activar lleva a `session`, que renderiza el file manager; permite cerrar y unpin; necesita icono distinto | igual | inferencia (de `web/src/components/MobileTabSheet.tsx:141`, `web/src/components/MobileTabSheet.tsx:182`; `web/src/App.tsx:3920`) |

## Campo 7. Riesgos

| # | Riesgo | Escenario concreto | Certeza |
|---|---|---|---|
| RG1 | Dependencia de roadmap ajeno | Herdr declara la UI nativa no-terminal fuera de plugin v1 en v0.9.0, v0.9.3 y HEAD; si nunca la publica, A2 no es ejecutable | verificado (exclusion vigente, EXT-5, EXT-10); por-definir (aceptacion futura, PD-A2-1) |
| RG2 | Foco compartido | En modo shared, abrir Files desde un telefono mueve a todos los navegadores y a la TUI al tab Files | inferencia (de `web/src/store.ts:2623`, `web/src/store.ts:2627`; T-002 b17) |
| RG3 | Tab ilegible fuera de Roamgate | Un usuario de la TUI de Herdr (u otro cliente) enfoca el tab Files y no tiene que mostrar; o lo cierra y destruye el estado del file manager de los navegadores | hipotesis (depende de R-H5, PD-A2-2) |
| RG4 | Version skew | Roamgate verifica Herdr 0.9.0 y solo acepta protocolos 14-20 y 22; hosts con Herdr anterior al protocolo de R-H no tendrian Files como tab, lo que exige fallback (en `mover`, el file manager desapareceria en esos hosts) | inferencia (de `server/src/bridge/protocol-compat.ts:14`, `server/src/herdr/release.ts:14`) |
| RG5 | Raiz del explorador indefinida | Workspace sin worktree con el tab Files enfocado: `explorerRoot` busca el pane `focused` y no hay ninguno en ese tab | hipotesis H-A2-1 |
| RG6 | Perdida al reiniciar Herdr | Herdr restaura panes/agentes; un tab sin panes podria no restaurarse y perder su metadata | por-definir (R-H4, PD-1) |
| RG7 | Mecanismo adyacente retirado | El mecanismo `pane.graphics.*` listado en T-004 como adyacente ya no existe desde v0.9.2; no sirve como base de una variante intermedia | verificado (EXT-11 l.16) |
| RG8 | Doble instancia en `coexistir` | Dos exploradores sobre el mismo scope en la misma pestana pisan expandidos, tabs de archivo y seleccion | inferencia (de campo 5 filas 1, 3, 4; T-003 fila 3 last-write-wins) |

## Campo 8. Incertidumbre

### 8a. Incertidumbre de evidencia (`hipotesis` / `por-definir`)

| ID | Afirmacion | Estado | Pregunta bloqueada | Fuentes revisadas | Condicion de cierre |
|---|---|---|---|---|---|
| PD-A2-1 | Forma y existencia futura de R-H1..R-H4, R-H6 | por-definir | Publicara Herdr un tipo de tab no-terminal con metadata, metodo/evento de actualizacion, persistencia y senal de capacidad? Con que nombres y numero de protocolo? | EXT-1..EXT-12; tags v0.9.0 (cca4af8d), v0.9.3 (7b116c05), HEAD master 4e624cd5; 2026-10-07 | Un tag de Herdr cuyo `herdr-api.schema.json` incluya kind/metadata en `TabInfo`/`TabCreateParams`, o un issue/PR aceptado en github.com/herdrdev/herdr con el diseno |
| PD-A2-2 | Semantica de foco y TUI para un tab sin panes (R-H5) | por-definir | Que pane queda `focused` en el workspace, que muestra la TUI, y se admite un workspace cuyo unico tab sea de contenido? | EXT-8, EXT-12 l.204-206; mismas refs y fecha | Spec de Herdr para el tab de contenido (misma fuente que PD-A2-1) |
| PD-1 | Persistencia de `tab_id` en Herdr (heredada de T-003) | por-definir | Ver T-003 PD-1 | `web/src/tabPins.ts:92`; T-003 | Ver T-003 PD-1 |
| H-A2-1 | `explorerRoot` sin pane enfocado | hipotesis | Con un tab de contenido enfocado, `pane.list` devuelve algun pane `focused` en el workspace? | `server/src/workspace/files.ts:78`-`server/src/workspace/files.ts:92`; d703e6f; 2026-10-07 | Confirma: spec de R-H5 o prueba contra un Herdr que implemente R-H en la que `pane.list` no marque ningun pane `focused`; refuta: Herdr conserva el ultimo pane terminal como `focused` del workspace |
| H-A2-2 | Caches por tab y atajos suponen panes | hipotesis | `pane.layout`, `terminalRelayViewportForTab` y `closeShortcutTarget` fallan o devuelven vacio con un tab sin panes? | `web/src/tabLayout.ts:8`, `web/src/terminalResize.ts:22`, `web/src/tabShortcuts.ts:25`, `web/src/store.ts:1424`; d703e6f; 2026-10-07 | Confirma/refuta: tests unitarios con un `Tab` de `pane_count: 0` en el store, y respuesta de `pane.layout` en un Herdr con R-H |
| H-A2-3 | Destino del estado de seleccion (mover) y efecto visible de dos instancias (coexistir) | hipotesis | mover: la seleccion vive en metadata de Herdr (compartida) o local por `tab_id`? coexistir: dos `FileExplorerContent` sobre la misma clave pierden estado visible? | `web/src/components/WorkspaceInspectorHost.tsx:266`, `web/src/workspaceResource.ts:128`, `web/src/components/fileExplorerResources.ts:67`; T-003 filas 1, 3, 4; d703e6f; 2026-10-07 | mover: depende de PD-A2-1 (si existe R-H3). coexistir: prueba montando dos exploradores sobre el mismo scope y comparando expandidos/tabs tras operar en ambos |

Afecta a campos 1-4 (incertidumbre de evidencia): PD-A2-1 (C1, C2, C5, C7, X1, X4), PD-A2-2 (S7), H-A2-1 (X5), H-A2-2 (X10), H-A2-3 parte mover (C9). Las cinco dependen de como Herdr defina un tab de contenido (PD-A2-1/PD-A2-2): H-A2-1 y H-A2-2 preguntan que devuelve Herdr para un tab sin panes, y la parte mover de H-A2-3 depende de que exista R-H3. La parte coexistir de H-A2-3 solo afecta el campo 5 y RG8, como H-A1-1 en T-005 y H-B1 en T-007.

### 8b. Parametros de decision (CA-03, ajuste E4)

Decisiones de producto o de diseno pendientes, no incertidumbre de evidencia. No hacen la talla `no-estimable`. Mismo tratamiento que T-005 8b y T-007 campo 8b.

| ID | Decision | Alternativas | Afecta (campos 1-4) | Efecto de cada alternativa en modulos / frontera / contratos | Fuentes revisadas | Equivalente en otras fichas |
|---|---|---|---|---|---|---|
| DP-A2-3 (antes PD-A2-3) | En coexistir, cada punto de entrada (atajos, paleta, boton mobile, arbol, links de terminal) abre el Inspector o el tab? | a) todas al tab; b) todas al Inspector y el tab desde el strip/`MobileTabSheet`; c) reparto por entrada | X15 (y campo 6) | Todas caen en `App.tsx` (`openFileExplorer`, `web/src/App.tsx:2154`), ya contado; sin efecto en frontera ni contratos | T-001 T-F1a; rama dev d703e6f; 2026-10-07 | T-005 DP-2; T-007 DP-B1 |
| DP-A2-4 | En mover, `files` sale de `MobileView`/`InspectorView` o se conserva como valor no renderizado? | a) quitar; b) conservar | C8, X12 (y campo 5 fila 14, campo 6) | a) modifica `InspectorView` y `MobileView` y toca ademas los emisores tipados (`WorktreeLifecycleRow`/`Dialog`); b) sin cambio de tipo ni esos emisores. Sin efecto en frontera | `web/src/workspaceResource.ts:7`; d703e6f; 2026-10-07 | T-005 DP-4; T-007 DP-B3 |
| DP-A2-5 | Sub-vista de cambios del archivo en el host del tab | a) segunda instancia de `DiffViewerPanel`; b) navegar al Inspector en Changes | X11 | Ambas dentro de modulos ya listados (host nuevo, `App.tsx`); sin efecto en frontera | `web/src/components/WorkspaceInspectorHost.tsx:772`; d703e6f; 2026-10-07 | T-005 DP-5; T-007 DP-B4 |

## Campo 9. Talla

Paso 1 (estimabilidad, CA-03 con el ajuste E4): en ambas variantes hay incertidumbre de evidencia que afecta los campos 1-4: PD-A2-1 y PD-A2-2 (`por-definir`), y H-A2-1, H-A2-2 y la parte mover de H-A2-3 (`hipotesis`). Ver 8a. **Motivo unico de `no-estimable`: la incertidumbre de evidencia sobre Herdr.** No existe una version publicada con tab de contenido (verificado hasta v0.9.3 y HEAD `4e624cd5`), y las tres `hipotesis` dependen de lo que Herdr defina para ese tab. Los parametros de decision (8b: DP-A2-3, DP-A2-4, DP-A2-5) no contribuyen a la no-estimabilidad. Si Herdr estuviera definido, A2 se tallaria por alternativa, igual que A1 y B.

| Variante | Talla | Que la desbloquea (solo evidencia) |
|---|---|---|
| mover | **no-estimable** | (1) Herdr publica R-H1..R-H6 en un protocolo versionado (cierra PD-A2-1, PD-A2-2); (2) con esa spec, cerrar H-A2-1, H-A2-2 y la parte mover de H-A2-3 |
| coexistir | **no-estimable** | Lo mismo que mover. La prueba de doble instancia (parte coexistir de H-A2-3) y el parametro DP-A2-3 ya no figuran como desbloqueo: la primera solo afecta riesgos y el segundo es una decision |

Cota de frontera (no es talla): cuando sea estimable, la regla de CA-03 la ubicaria al menos en L porque cruza bridge y Herdr y cambia un contrato de protocolo, en cualquier alternativa de 8b. Con el criterio de lectura del ciclo de vida de tabs/foco compartido fijado en T-007 campo 9 (correccion E4 v2, N-1), A2 tambien lo cumple: abrir Files pasa a ser `tab.create`/`tab.focus` de Herdr (X7, RG2), un cambio del ciclo de vida de tabs y una emision de foco compartido que hoy no existe. Refuerza la cota L; no cambia la no-estimabilidad. `inferencia` (de campo 2, C1/C3, X7 y RG2).

Correccion E4 (H-1): antes PD-A2-3 contaba como bloqueo de coexistir. Ahora es el parametro DP-A2-3, tratado igual que DP-2 en T-005 y DP-B1 en T-007. El resultado (`no-estimable` en ambas variantes) no cambia.

## Nota de alcance

Un tab respaldado por un pane de terminal (por ejemplo, un pane de plugin con `--placement tab`, `herdr-plugin.toml:16`, `herdr-plugin.toml:28`) sobre el que Roamgate pintara el file manager no es A2 en el sentido de esta ficha: Herdr no sabria que el tab es de contenido y `TabInfo` no lleva marca para reconocerlo (EXT-8 l.1038). Se registra solo para delimitar; no se evalua aqui. `inferencia`.

## Conteo

Afirmaciones por estado de certeza (filas de tablas; una fila con certeza mixta cuenta por su etiqueta principal; en R-H se cuentan por separado la ausencia hoy y la forma requerida). Tras la correccion E4 los parametros de decision se cuentan en columna propia (no son estado de certeza).

| Seccion | verificado | inferencia | hipotesis | por-definir | parametro de decision |
|---|---|---|---|---|---|
| Declaracion CA-05 | 7 | 0 | 0 | 0 | 0 |
| R-H | 5 | 0 | 0 | 7 | 0 |
| Campo 1 | 17 | 0 | 0 | 0 | 0 |
| Campo 2 | 1 | 2 | 0 | 0 | 0 |
| Campo 3 | 3 | 5 | 1 | 1 | 0 |
| Campo 4 | 1 | 10 | 2 | 1 | 1 |
| Campo 5 | 0 | 11 | 2 | 2 | 0 |
| Campo 6 | 2 | 6 | 0 | 0 | 0 |
| Campo 7 | 2 | 3 | 2 | 1 | 0 |
| Campo 8 (registro 8a + 8b) | 0 | 0 | 3 | 3 | 3 |
| Campo 9 y nota de alcance | 0 | 2 | 0 | 0 | 0 |
| **Total (106)** | **38** | **39** | **10** | **15** | **4** |

Registros unicos: incertidumbre de evidencia = 3 `por-definir` (PD-A2-1, PD-A2-2, PD-1 heredado de T-003) y 3 `hipotesis` (H-A2-1, H-A2-2, H-A2-3); parametros de decision = 3 (DP-A2-3, antes PD-A2-3; DP-A2-4; DP-A2-5).
