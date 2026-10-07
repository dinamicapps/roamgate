# T-003 Matriz de estado T-EST (Frente F1+F2)

Fuente: working tree del repo en rama `dev` (HEAD `d703e6f`), revisado 2026-10-07. Entradas: `etapa-3/frentes/T-001-anatomia-file-manager.md` y `etapa-3/frentes/T-002-anatomia-tabs.md`; las citas reutilizadas se re-verificaron contra el codigo. CAs: CA-01 (fila T-EST con certeza y campos obligatorios) y CA-02 (10 piezas x 6 columnas).

Leyenda de certeza: `verificado` (cita path:linea) / `inferencia` (cita las afirmaciones de origen) / `hipotesis` / `por-definir`. Cuando una celda mezcla afirmaciones de distinta certeza, la etiqueta principal va primero y la secundaria se marca en linea. Los `hipotesis`/`por-definir` estan detallados en la seccion "Registro de incertidumbre" (pregunta bloqueada, fuentes revisadas, condicion de cierre).

Columnas: **Prop.** propietario; **Clave/scope**; **Duracion** (memoria / localStorage / Herdr); **Pestanas** sincronizacion entre pestanas del mismo navegador; **Clientes** sincronizacion entre clientes (otros navegadores o dispositivos); **Cambio** comportamiento al cambiar conexion / worktree / workspace.

## Conceptos base (usados por varias filas)

- **Generacion de conexion.** El `ConnectionClient` captura `connectionId` y `generation` (`web/src/api.ts:472`); la generacion avanza al cambiar de conexion activa, al desconectar y al reconectar a la fuerza (`web/src/api.ts:464`, `web/src/api.ts:696`, `web/src/api.ts:598`), y el store la adopta al desconectar (`web/src/store.ts:2169`). Las claves en memoria se forman con `JSON.stringify([connectionId, generation, ...])` (`web/src/useConnectionClient.ts:24`). `verificado`.
- **resourceUiKey.** `App` deriva `resourceUiKey` de esa generacion (`web/src/App.tsx:1401`); cuando cambia, un layout effect anula el Inspector y la seleccion de preview (`web/src/App.tsx:2764`, `web/src/App.tsx:2769`, `web/src/App.tsx:2771`). `verificado`.
- **Scope de recurso.** `resourceOwnerKey` da `checkout:{checkoutKey}` (worktree) o `workspace:{workspaceId}` (`web/src/workspaceResource.ts:175`, `web/src/workspaceResource.ts:176`); `checkoutKey` es `[repoKey, checkoutPath]` (`web/src/workspaceResource.ts:147`). `verificado`.
- **Claves de localStorage.** `connectionStorageKey` namespacea como `herdr.connection/{conn}/{base}` salvo la conexion `legacy-default`, que usa la clave base sin prefijo (`web/src/connectionStorage.ts:41`, `web/src/connectionStorage.ts:42`); el wrapper fisico antepone `roamgate:` (`web/src/browserStorage.ts:41`). La sincronizacion entre pestanas del navegador solo existe donde alguien llama `subscribeLocalStorage` (evento `storage`, `web/src/browserStorage.ts:85`). No hay `BroadcastChannel` ni `SharedWorker` en `web/src` (busqueda rg, 2026-10-07). `verificado`.
- **Memoria de modulo.** Los `Map` declarados a nivel de modulo viven en el documento: cada pestana del navegador tiene su propia copia. `inferencia` (de la semantica de modulos ES por documento + ausencia de canal cross-tab citada arriba).
- **Remontaje del host.** `WorkspaceInspectorHost` lleva `key = resourceUiKey + resourceOwnerKey(scope)` (`web/src/App.tsx:4253`): cambiar de generacion o de owner remonta host y explorador. `verificado`.

## Tabla resumen T-EST

| # | Pieza | Prop. | Clave/scope | Duracion | Pestanas | Clientes | Cambio conexion/worktree/workspace |
|---|---|---|---|---|---|---|---|
| 1 | Arbol / cache del explorer | Map de modulo `explorerCache` + copia `useState` en el explorador — `verificado` | `[conn, gen, "explorer", resourceKey, showHidden]` — `verificado` | Memoria; revalida al montar/abrir — `verificado` | No — `inferencia` | No (cada cliente lista via `file.list`; sin invalidacion por cambios externos) — `inferencia` | Gen nueva = cache inalcanzable; worktree removido = retirada; workspaces del mismo checkout comparten — `verificado` |
| 2 | Cache de previews | Map de modulo `previewCache` + dedupe de requests — `verificado` | `[conn, gen, "preview", workspaceId, path]`; LRU global 16 MiB — `verificado` | Memoria; stale-while-revalidate; invalidacion por delete/upload — `verificado` | No — `inferencia` | No — `inferencia` | Gen nueva = inalcanzable (ocupa bytes hasta LRU, `inferencia`); worktree removido no la limpia; clave por workspaceId, no por checkout — `verificado` |
| 3 | ResourceFileTabs | localStorage (fuente) + copia `useState` en el host — `verificado` | `workspaceInspectorFile:{owner}` por conexion; `{version:2, paths, activePath, previewPath}` — `verificado` | localStorage; borrado al remover worktree — `verificado` | Comparte almacenamiento sin suscripcion en vivo; last-write-wins — `inferencia` | No — `inferencia` | Por conexion + owner (checkout o workspace) — `verificado` |
| 4 | selection / activeFilePreview | `useState` en `App` — `verificado` | Una por `App`, validada contra el scope; path espejado en la clave de la fila 3 — `verificado` | Memoria (contenido) + path en localStorage — `verificado` | No ("file ... stay in this tab") — `verificado` | No — `inferencia` | Se vacia al cambiar owner, generacion, worktree removido o workspace cerrado; re-scope si cambia el workspace_id del mismo checkout — `verificado` |
| 5 | Preferencias persistidas del Inspector | localStorage; `App` y host las aplican — `verificado` | `workspaceInspector:{owner}` por conexion (view, dock, expanded, tamanos, ratios) — `verificado` | localStorage; escritas en cada apertura/cambio — `verificado` | dock/size/expanded y ratios en vivo; `view` no — `verificado` | No — `inferencia` | Owner nuevo lee sus preferencias; mismo owner conserva las actuales; no se borran al remover worktree — `verificado` |
| 6 | Estado efimero de sesion del Inspector y retorno/foco | `useState` + ref en `App`; refs de foco — `verificado` | Una instancia por `App` con el scope embebido — `verificado` | Memoria; recargar = cerrado — `verificado` | No — `verificado` | El estado no viaja; sus efectos de foco si en shared — `inferencia` | Generacion nueva / worktree removido / workspace cerrado = null; cambio de foco de workspace = reabre para el nuevo — `verificado` |
| 7 | showHidden | `useState` del explorador espejado a localStorage — `verificado` | `fileExplorerShowHidden:{resourceKey}` por conexion; tambien segmenta la cache 1 — `verificado` | localStorage; leido solo al montar; borrado al remover worktree — `verificado` | No en vivo — `inferencia` | No (viaja como parametro por request) — `inferencia` | Por conexion + owner; remonta con el host — `verificado` |
| 8 | Pins de tabs | `tabPins.ts` (cache de modulo + localStorage) — `verificado` | `tabPins.v1` por conexion; lista de `tab_id` (max 256) — `verificado` | localStorage; poda por refresh; supervivencia ligada a ids de Herdr — `verificado` / `por-definir` (PD-1) | Si, en vivo (evento storage) — `verificado` | No ("stay in this browser") — `verificado` | Por conexion; reconexion no los toca; workspace/worktree no aplican — `verificado` |
| 9 | Geometria por tab | Map de modulo `layoutByTab` — `verificado` | `conn\0gen\0tabId` — `verificado` | Memoria; podada por refresh; vaciada al desconectar — `verificado` | No — `inferencia` | No; fuente es `pane.layout` de Herdr — `inferencia` | Desconexion/cambio de conexion la vacia; workspace no aplica — `verificado` |
| 10 | Focus / navegacion shared vs browser-local | shared: Herdr (`inferencia`); browser-local: `store.browserNavigation` (`verificado`) | browser-local: por conexion; workspace, tab por workspace, pane por tab — `verificado` | browser-local: memoria, sobrevive reconexion sin cambio de runtime; shared: Herdr (persistencia `por-definir`, PD-2) — `verificado` | shared: si via Herdr (push + poll); browser-local: no, es por pestana — `inferencia` | shared: si; browser-local: no — `inferencia` | Modo decidido por el bridge; cambio de conexion conserva o vacia segun runtime — `verificado` |
| 11 (desc.) | Raiz del explorador (servidor) | Bridge `explorerRoot` — `verificado` | Por request: checkout o cwd del pane `focused` de Herdr — `verificado` | Recalculada en cada operacion — `verificado` | Comun a todas (depende de Herdr) — `inferencia` | Comun; en browser-local no sigue la seleccion local — `inferencia` | Workspace sin worktree: cambia con el pane enfocado; cache 1 no incluye la raiz — `hipotesis` (H-1) |
| 12 (desc.) | Modo FilesystemBrowser del explorador | `useState` `filesystemContext` — `verificado` | Valido solo para el `runtimeContext` (conn, gen, resourceKey, workspaceId) — `verificado` | Memoria — `verificado` | No — `inferencia` | No — `inferencia` | Cualquier cambio de contexto sale del modo — `verificado` |
| 13 (desc.) | Senal de refresco del explorador | Map de modulo `versions` en `fileExplorerRefresh.ts` — `verificado` | `conn + gen + workspaceId` — `verificado` | Memoria — `verificado` | No — `inferencia` | No — `inferencia` | Gen nueva = clave nueva — `verificado` |
| 14 (desc.) | `mobileView` | `useState` en `App` — `verificado` | Uno por `App` — `verificado` | Memoria — `verificado` | No — `inferencia` | No — `inferencia` | Cambio de generacion y worktree removido vuelven a `session` — `verificado` |
| 15 (desc.) | `drillInByView` (arbol vs detalle en compact) | `useState` del host — `verificado` | Por instancia del host — `verificado` | Memoria; se pierde al remontar — `verificado` | No — `inferencia` | No — `inferencia` | Remonta con cambio de owner/generacion — `verificado` |

## Detalle por pieza

### 1. Arbol / cache del explorer

- **Prop.** `verificado`: `explorerCache` es un `Map` de modulo (`web/src/components/fileExplorerResources.ts:67`) con forma `FileExplorerCache` (search, rootInfo, children, expanded, error) (`web/src/components/fileExplorerResources.ts:48`); `FileExplorerContent` mantiene una copia en `useState` inicializada desde ella (`web/src/components/FileExplorerDialog.tsx:385`) y escribe cada cambio de vuelta (`web/src/components/FileExplorerDialog.tsx:504`).
- **Clave/scope.** `verificado`: `explorerCacheKey` usa `connectionClientScopeKey(client, "explorer", resourceKey, showHidden)` (`web/src/components/fileExplorerResources.ts:99`, `web/src/useConnectionClient.ts:24`); `resourceKey` es el `resourceOwnerKey` del scope que pasa el host (`web/src/components/WorkspaceInspectorHost.tsx:680`).
- **Duracion.** `verificado`: memoria del documento. Al montar o cambiar de recurso se re-listan todos los directorios expandidos (`web/src/components/FileExplorerDialog.tsx:684`, `web/src/components/FileExplorerDialog.tsx:685`). `retireExplorerCache` es el unico borrado (`web/src/components/fileExplorerResources.ts:116`, `web/src/components/fileExplorerResources.ts:118`). `inferencia`: las entradas de generaciones anteriores no se borran nunca; quedan inalcanzables (de :118 como unico `delete` + clave con generacion).
- **Pestanas.** `inferencia`: Map de modulo sin canal cross-tab (ver Conceptos base).
- **Clientes.** `inferencia`: no hay push de cambios de filesystem; la unica senal de refresco es local y la disparan mutaciones Git del panel Changes del mismo documento (`web/src/fileExplorerRefresh.ts:17`, `web/src/components/DiffViewerPanel.tsx:1694`). Los eventos que suscribe el runtime son de Herdr (tabs/layout), no de archivos (`server/src/connections/runtime.ts:73`). Un archivo creado por otro cliente o desde la terminal aparece al reabrir o remontar.
- **Cambio.** `verificado`: generacion nueva = clave nueva (`web/src/useConnectionClient.ts:24`) y host remontado (`web/src/App.tsx:4253`). Worktree removido: `clearFileExplorerResourceCache` retira ambas variantes de showHidden (`web/src/App.tsx:2673`, `web/src/components/fileExplorerResources.ts:121`). Dos workspaces del mismo checkout comparten cache (owner `checkout:`, `web/src/workspaceResource.ts:175`). Con el Inspector cerrado o en otro owner, `App` precalienta la cache del workspace enfocado (`web/src/App.tsx:2977`).

### 2. Cache de previews

- **Prop.** `verificado`: `previewCache` y `previewRequests` de modulo (`web/src/components/fileExplorerResources.ts:70`, `web/src/components/fileExplorerResources.ts:71`). Consumidores: explorador, `App` (`web/src/App.tsx:1701`), `TerminalFileLinkMenu` (`web/src/components/TerminalFileLinkMenu.tsx:45`) y `DiffContentView` (`web/src/components/DiffContentView.tsx:151`).
- **Clave/scope.** `verificado`: `filePreviewCacheKey` = `[conn, gen, "preview", workspaceId, path]` (`web/src/components/fileExplorerResources.ts:192`, `web/src/components/fileExplorerResources.ts:199`): por `workspaceId`, no por owner (a diferencia de la fila 1). LRU global por bytes, tope 16 MiB (`web/src/components/fileExplorerResources.ts:73`, `web/src/components/fileExplorerResources.ts:299`).
- **Duracion.** `verificado`: memoria. Una seleccion desde el arbol publica la preview cacheada y luego re-lee (`web/src/components/FileExplorerDialog.tsx:1028`, `web/src/components/FileExplorerDialog.tsx:1062`); la apertura desde `App` fuerza `refresh: true` (`web/src/App.tsx:1703`). Delete y upload invalidan (`web/src/components/FileExplorerDialog.tsx:1215`, `web/src/components/FileExplorerDialog.tsx:1275`, `web/src/components/fileExplorerResources.ts:268`).
- **Pestanas.** `inferencia`: Map de modulo.
- **Clientes.** `inferencia`: sin invalidacion por cambios externos; la revalidacion ocurre solo al seleccionar (citas de Duracion).
- **Cambio.** `verificado`: la clave lleva generacion. `clearFileExplorerResourceCache` no toca `previewCache` (solo explorer, git summary y showHidden: `web/src/components/fileExplorerResources.ts:121`, `web/src/components/fileExplorerResources.ts:131`). `inferencia`: las previews de generaciones viejas ocupan bytes hasta que el LRU las expulsa.

### 3. ResourceFileTabs

- **Prop.** `verificado`: fuente en localStorage; el host guarda una copia en `useState` (`web/src/components/WorkspaceInspectorHost.tsx:266`) y escribe con read-modify-write (`web/src/components/WorkspaceInspectorHost.tsx:279`, `web/src/components/WorkspaceInspectorHost.tsx:281`).
- **Clave/scope.** `verificado`: prefijo `workspaceInspectorFile:` + owner, namespaceado por conexion (`web/src/workspaceResource.ts:128`, `web/src/workspaceResource.ts:359`); forma `ResourceFileTabs` (`web/src/workspaceResource.ts:366`) serializada como version 2 (`web/src/workspaceResource.ts:449`).
- **Duracion.** `verificado`: localStorage, sobrevive recargas; se vacia al remover el worktree (`web/src/App.tsx:2684`).
- **Pestanas.** `inferencia`: dos pestanas comparten la clave, pero el host re-lee solo cuando cambian la seleccion o el scope (`web/src/components/WorkspaceInspectorHost.tsx:269`, `web/src/components/WorkspaceInspectorHost.tsx:270`); su unica suscripcion a `storage` es la de preferencias (`web/src/components/WorkspaceInspectorHost.tsx:489`). Resultado: sin actualizacion en vivo y last-write-wins sobre la lista.
- **Clientes.** `inferencia`: localStorage es por navegador; ningun RPC lo transporta.
- **Cambio.** `verificado`: owner `checkout:` comparte tabs entre workspaces del mismo checkout; owner `workspace:` las aisla por workspace (`web/src/workspaceResource.ts:175`, `web/src/workspaceResource.ts:176`); otra conexion = otra clave (`web/src/connectionStorage.ts:42`).

### 4. selection / activeFilePreview

- **Prop.** `verificado`: `useState` `activeFilePreview` en `App` (`web/src/App.tsx:1474`) con entry, fragment, preview, loading y error (`web/src/App.tsx:1712`).
- **Clave/scope.** `verificado`: un solo valor por `App`; los cambios que llegan del host se aceptan solo si el `resourceStateKey` coincide con el scope actual (`web/src/App.tsx:2374`). El setter espeja el path a localStorage con `writeResourceFileSelection` (`web/src/App.tsx:1480`), que escribe en la clave de la fila 3 (`web/src/workspaceResource.ts:460`).
- **Duracion.** `verificado`: contenido en memoria; al abrir Files sin path explicito se restaura el path activo desde localStorage (`web/src/App.tsx:1846`).
- **Pestanas.** `verificado`: el comentario del sincronizador de layout dice que "opening, view, file and focus stay in this tab" (`web/src/App.tsx:3542`).
- **Clientes.** `inferencia`: estado React local, sin RPC.
- **Cambio.** `verificado`: owner distinto al abrir lo vacia (`web/src/App.tsx:1830`); generacion nueva (`web/src/App.tsx:2771`); worktree removido (`web/src/App.tsx:2691`); workspace desaparecido (`web/src/App.tsx:2942`); mismo checkout con otro `workspace_id` re-scopea y recarga la preview (`web/src/App.tsx:2952`, `web/src/App.tsx:2954`).

### 5. Preferencias persistidas del Inspector

- **Prop.** `verificado`: localStorage. `App` las aplica al abrir; el host lee los ratios en su propio `useState` (`web/src/components/WorkspaceInspectorHost.tsx:342`).
- **Clave/scope.** `verificado`: `workspaceInspector:` + owner, namespaceado por conexion (`web/src/workspaceResource.ts:127`, `web/src/workspaceResource.ts:228`); campos de `InspectorPreferences` (`web/src/workspaceResource.ts:108`).
- **Duracion.** `verificado`: localStorage; se escribe en cada apertura (`web/src/App.tsx:1839`), al expandir (`web/src/App.tsx:2282`) y al cambiar dock o tamano (`web/src/App.tsx:3603`).
- **Pestanas.** `verificado`: una suscripcion en `App` aplica dock, size y expanded en vivo a otra pestana con el Inspector sobre el mismo scope (`web/src/App.tsx:3505`, `web/src/App.tsx:3543`); los ratios se aplican en vivo via el host (`web/src/components/WorkspaceInspectorHost.tsx:489`); `view` no se aplica en vivo (`web/src/App.tsx:3542`) y solo cuenta en la proxima apertura por toggle (`web/src/App.tsx:2254`).
- **Clientes.** `inferencia`: localStorage por navegador.
- **Cambio.** `verificado`: al abrir sobre otro owner se usan las preferencias de ese scope; sobre el mismo owner se conservan dock, tamano y expanded actuales (`web/src/App.tsx:1793`, `web/src/App.tsx:1823`). El handler de worktree removido no borra esta clave (bloque `web/src/App.tsx:2668`-`web/src/App.tsx:2684`), asi que queda huerfana.

### 6. Estado efimero de sesion del Inspector y retorno/foco

- **Prop.** `verificado`: `useState<WorkspaceInspectorState | null>` con ref espejo (`web/src/App.tsx:1398`, `web/src/App.tsx:1400`); campos `open`, `returnTabId`, `originPaneId`, `initialDirectory` (`web/src/workspaceResource.ts:96`); refs de foco (`web/src/App.tsx:1447`, `web/src/App.tsx:1465`).
- **Clave/scope.** `verificado`: una instancia por `App`, con el scope dentro del estado (`web/src/workspaceResource.ts:96`).
- **Duracion.** `verificado`: memoria; arranca en null, por lo que recargar deja el Inspector cerrado (`web/src/App.tsx:1398`). Cerrar conserva el estado con `open:false` (`web/src/App.tsx:2184`). `returnTabId` se recalcula en cada apertura (`web/src/App.tsx:1816`).
- **Pestanas.** `verificado`: no se sincroniza (`web/src/App.tsx:3542`).
- **Clientes.** `inferencia`: el estado no viaja, pero abrir sobre un workspace no enfocado llama `store.focusWorkspace` (`web/src/App.tsx:1829`) y cerrar llama `store.focusTab(returnTabId)` (`web/src/App.tsx:2200`); en modo shared eso emite `workspace.focus` y `tab.focus` a Herdr (`web/src/store.ts:2623`, `web/src/store.ts:2627`), cuyo foco comparten los demas clientes (fila 10).
- **Cambio.** `verificado`: generacion nueva = null (`web/src/App.tsx:2769`); worktree removido sobre el scope = null (`web/src/App.tsx:2689`); workspace cerrado = null (`web/src/App.tsx:2940`); si cambia el workspace enfocado con el Inspector abierto, se reabre para el nuevo sin mover foco (`web/src/App.tsx:2868`, `web/src/App.tsx:2312`); con History abierto, un cambio de tab actualiza `originPaneId` (`web/src/App.tsx:2909`).

### 7. showHidden

- **Prop.** `verificado`: `useState` del explorador (`web/src/components/FileExplorerDialog.tsx:382`) espejado a localStorage en cada cambio (`web/src/components/FileExplorerDialog.tsx:485`).
- **Clave/scope.** `verificado`: `fileExplorerShowHidden:` + resourceKey, namespaceado por conexion (`web/src/components/fileExplorerResources.ts:76`, `web/src/components/FileExplorerDialog.tsx:380`); tambien es componente de la clave de la cache 1 (`web/src/components/fileExplorerResources.ts:94`).
- **Duracion.** `verificado`: localStorage; leido solo en el inicializador al montar (`web/src/components/FileExplorerDialog.tsx:383`); borrado al remover el worktree (`web/src/components/fileExplorerResources.ts:131`).
- **Pestanas.** `inferencia`: sin `subscribeLocalStorage` en el explorador (busqueda rg, 2026-10-07) y lectura solo al montar (:383): otra pestana lo ve al remontar.
- **Clientes.** `inferencia`: viaja como parametro `show_hidden` en cada `file.list` (`web/src/components/FileExplorerDialog.tsx:531`); el servidor no lo guarda.
- **Cambio.** `verificado`: clave por conexion + owner; el host remonta al cambiar de owner o generacion (`web/src/App.tsx:4253`).

### 8. Pins de tabs

- **Prop.** `verificado`: cache de modulo `pinsByConnection` (`web/src/tabPins.ts:94`) respaldada en localStorage (`web/src/tabPins.ts:128`).
- **Clave/scope.** `verificado`: `tabPins.v1` (`web/src/tabPins.ts:6`) namespaceado por conexion (`web/src/tabPins.ts:98`); maximo 256 ids (`web/src/tabPins.ts:8`).
- **Duracion.** `verificado`: localStorage; se podan los ids que un refresh no lista, salvo con lista vacia (`web/src/store.ts:1352`, `web/src/tabPins.ts:155`, `web/src/tabPins.ts:159`). `por-definir` (PD-1): que los pins sobrevivan a un reinicio de Herdr depende de que Herdr conserve los `tab_id`; el repo solo lo afirma en un comentario (`web/src/tabPins.ts:92`).
- **Pestanas.** `verificado`: suscripcion a `storage` que invalida la cache y notifica (`web/src/tabPins.ts:169`, `web/src/tabPins.ts:180`).
- **Clientes.** `verificado`: "they stay in this browser" (`web/src/tabPins.ts:93`); ningun RPC los transporta (T-002 a6).
- **Cambio.** `verificado`: clave por conexion sin generacion (`web/src/tabPins.ts:98`), asi que la reconexion los conserva; son por `tab_id` a nivel de conexion, sin relacion con worktree o workspace.

### 9. Geometria por tab

- **Prop.** `verificado`: `layoutByTab` de modulo (`web/src/tabLayout.ts:8`).
- **Clave/scope.** `verificado`: `connectionId\0generation\0tabId` (`web/src/tabLayout.ts:11`).
- **Duracion.** `verificado`: memoria; poda a tabs vivos en cada refresh (`web/src/store.ts:1350`, `web/src/tabLayout.ts:32`); se vacia al desconectar (`web/src/store.ts:2141`) y al resetear la conexion activa (`web/src/store.ts:1748`).
- **Pestanas.** `inferencia`: Map de modulo.
- **Clientes.** `inferencia`: la geometria real la da `pane.layout` de Herdr; la cache solo provee un layout provisional al cambiar de tab (`web/src/tabLayout.ts:54`, `web/src/store.ts:2318`; T-002 b5).
- **Cambio.** `verificado`: vaciado por desconexion o reset de conexion (citas de Duracion); clave por tab, sin relacion con workspace o worktree.

### 10. Focus / navegacion shared vs browser-local

- **Prop.** shared: `inferencia`, Herdr decide el foco y el cliente usa `focused` sin proyectar (T-002 b17; la proyeccion solo ocurre en browser-local, `web/src/store.ts:1369`). browser-local: `verificado`, `BrowserNavigation` en memoria del store (`web/src/browserNavigation.ts:3`, `web/src/store.ts:219`).
- **Clave/scope.** `verificado`: `BrowserNavigation` guarda workspaceId, tab por workspace y pane por tab (`web/src/browserNavigation.ts:4`); forma parte de la sesion por conexion (`web/src/store.ts:364`).
- **Duracion.** `verificado`: browser-local arranca vacia y adopta el foco de Herdr en la primera observacion (`web/src/browserNavigation.ts:35`, `web/src/browserNavigation.ts:51`); al volver a una conexion se restaura su sesion si la generacion de runtime coincide (`web/src/store.ts:421`, `web/src/store.ts:426`); se vacia si la generacion cambia (`web/src/store.ts:497`, `web/src/store.ts:502`). `por-definir` (PD-2): que conserva Herdr del foco compartido al reiniciar.
- **Pestanas.** `inferencia`: en shared, Herdr empuja eventos a todos los sockets (`server/src/index.ts:560`), el cliente refresca (`web/src/store.ts:2232`) y un poll de 5 s respalda (`web/src/store.ts:1539`), asi que todas las pestanas convergen al mismo foco. En browser-local la seleccion vive en el store del documento: cada pestana del navegador navega por separado (el modo es "por pestana", no "por navegador").
- **Clientes.** `inferencia`: shared, foco unico para todos (T-002 b17); browser-local, independiente por cliente.
- **Cambio.** `verificado`: el modo lo decide el bridge (`server/src/bridge/terminal-bridge.ts:149`) y el cliente lo lee en cada refresh (`web/src/store.ts:1356`); activar un workspace bifurca por modo (`web/src/store.ts:2759`); la regla de conexion es la de Duracion.

### 11. (descubierta) Raiz del explorador en el servidor

- **Prop.** `verificado`: `explorerRoot` del bridge (`server/src/workspace/files.ts:78`).
- **Clave/scope.** `verificado`: checkout del worktree si existe (`server/src/workspace/files.ts:82`); si no, `foreground_cwd`/`cwd` del pane `focused` del workspace segun `pane.list` de Herdr (`server/src/workspace/files.ts:84`, `server/src/workspace/files.ts:89`, `server/src/workspace/files.ts:92`).
- **Duracion.** `verificado`: se recalcula en cada operacion (`server/src/workspace/files.ts:111`).
- **Pestanas.** `inferencia`: depende solo del estado de Herdr, igual para todas.
- **Clientes.** `inferencia`: igual para todos. En browser-local el bridge usa `focused` de Herdr, no la seleccion local del navegador (fila 10), asi que en un workspace sin worktree la raiz puede no corresponder al pane que ese navegador muestra.
- **Cambio.** `hipotesis` (H-1): en un workspace sin worktree la raiz cambia con el pane enfocado o su cwd, pero la clave de la cache 1 (`workspace:{id}`, `web/src/workspaceResource.ts:176`) no incluye la raiz.

### 12. (descubierta) Modo FilesystemBrowser del explorador

- **Prop.** `verificado`: `useState` `filesystemContext` (`web/src/components/FileExplorerDialog.tsx:448`).
- **Clave/scope.** `verificado`: activo solo si coincide con `runtimeContext` (`web/src/components/FileExplorerDialog.tsx:451`), que combina conexion, generacion, resourceKey y workspaceId (`web/src/components/fileExplorerResources.ts:78`).
- **Duracion.** `verificado`: memoria; se resetea al cambiar el contexto (`web/src/components/FileExplorerDialog.tsx:453`).
- **Pestanas / Clientes.** `inferencia`: estado React local.
- **Cambio.** `verificado`: cualquier cambio de conexion, generacion o recurso sale del modo (:453).

### 13. (descubierta) Senal de refresco del explorador

- **Prop.** `verificado`: Map de modulo `versions` (`web/src/fileExplorerRefresh.ts:7`).
- **Clave/scope.** `verificado`: conexion + generacion + workspaceId (`web/src/fileExplorerRefresh.ts:14`).
- **Duracion.** `verificado`: memoria; `bumpFileExplorerRefresh` la incrementa (`web/src/fileExplorerRefresh.ts:17`) desde el panel Changes (`web/src/components/DiffViewerPanel.tsx:1694`).
- **Pestanas / Clientes.** `inferencia`: Map de modulo, sin canal externo.
- **Cambio.** `verificado`: la clave lleva generacion.

### 14. (descubierta) `mobileView`

- **Prop.** `verificado`: `useState<MobileView>` en `App` (`web/src/App.tsx:1310`).
- **Clave/scope / Duracion.** `verificado`: uno por `App`, en memoria; abrir el Inspector lo pone en la vista (`web/src/App.tsx:1840`) y cerrarlo en `session` (`web/src/App.tsx:2185`).
- **Pestanas / Clientes.** `inferencia`: estado React local.
- **Cambio.** `verificado`: generacion nueva vuelve a `session` salvo assistant (`web/src/App.tsx:2782`); worktree removido sobre el scope vuelve a `session` (`web/src/App.tsx:2692`).

### 15. (descubierta) `drillInByView` (arbol vs detalle en compact)

- **Prop. / Clave / Duracion.** `verificado`: `useState` del host (`web/src/components/WorkspaceInspectorHost.tsx:316`); define si en compact se ve arbol o detalle (`web/src/components/WorkspaceInspectorHost.tsx:685`); se pierde al remontar el host (`web/src/App.tsx:4253`).
- **Pestanas / Clientes.** `inferencia`: estado React local.
- **Cambio.** `verificado`: remonta con cambio de owner o generacion (`web/src/App.tsx:4253`).

## Registro de incertidumbre

| ID | Celda | Estado | Pregunta bloqueada | Fuentes revisadas | Condicion de cierre |
|---|---|---|---|---|---|
| PD-1 | 8 Duracion | `por-definir` | Conserva Herdr los `tab_id` al reiniciar su proceso, de modo que los pins guardados sigan apuntando a los mismos tabs? | `web/src/tabPins.ts:92`-`:93`, `:150`-`:154`; T-002 b6; rama dev, commit d703e6f, 2026-10-07 | Codigo o spec de persistencia de sesion de Herdr, o prueba: pinear un tab, reiniciar Herdr y comparar `tab.list` antes y despues. |
| PD-2 | 10 Duracion (shared) | `por-definir` | Que conserva Herdr del foco compartido (workspace y tab enfocados) al reiniciar, y es el foco unico por sesion de Herdr o por algun otro ambito? | `web/src/store.ts:2623`, `:2627`, `:1369`; `server/src/connections/runtime.ts:73`; T-002 b6 y b17; rama dev, commit d703e6f, 2026-10-07 | Codigo o spec de Herdr sobre `workspace.focus`/`tab.focus` y su persistencia, o prueba de reinicio comparando `workspace.list`/`tab.list` (campos `focused`). |
| H-1 | 11 Cambio | `hipotesis` | En un workspace sin worktree, si cambia el pane enfocado o su cwd, el arbol cacheado bajo `workspace:{id}` pinta entradas de la raiz anterior hasta revalidar, y conserva expandidos paths que no existen en la raiz nueva? | `server/src/workspace/files.ts:78`-`:96`; `web/src/workspaceResource.ts:176`; `web/src/components/fileExplorerResources.ts:91`-`:103`; `web/src/components/FileExplorerDialog.tsx:629`-`:686`; rama dev, commit d703e6f, 2026-10-07 | Evidencia confirmatoria: con un workspace sin worktree, abrir Files, cambiar el cwd del pane enfocado (o enfocar otro pane con otro cwd), cerrar y reabrir Files, y observar si aparece primero el arbol anterior y si quedan errores de `file.list` en paths expandidos (Playwright o manual, o test unitario con `file.list` simulado). Refuta: el arbol se vacia o coincide con la raiz nueva desde el primer render. |
