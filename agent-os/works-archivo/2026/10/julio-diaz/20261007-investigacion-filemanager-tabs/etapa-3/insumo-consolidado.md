# Insumo consolidado: file manager y tabs (T-008, Frente F5)

Fuente: working tree de Roamgate en rama `dev`, HEAD `d703e6f`, revisado 2026-10-07. Entradas: `etapa-3/frentes/T-001` a `T-007` y `etapa-3/bitacora.md`. CAs: CA-01, CA-04, CA-06, CA-07 (y cierre de lo que CA-03 y CA-05 exigen a F5).

Este es el documento unico que debe leer el work de implementacion. Las tablas completas viven en los frentes; aqui se citan sus filas clave.

Leyenda de certeza (regla transversal, `etapa-1/cas-cobertura-insumo.md`): `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis`, `por-definir`. Toda `hipotesis`/`por-definir` vigente esta en la seccion i con pregunta bloqueada, fuentes revisadas y condicion de cierre.

## a) Resumen ejecutivo

1. Hoy el file manager es la vista `files` del Workspace Inspector, uno de cuatro valores de una union cerrada (`web/src/workspaceResource.ts:7`). Se abre siempre por `openInspector` (`web/src/App.tsx:1738`), y al cerrarlo queda montado con `display:none` (`web/src/styles/layout/app.css:767`). `verificado`.
2. Hoy un tab es un tab de Herdr: tipo `Tab` sin `kind` (`web/src/types.ts:66`), con contenido solo de panes de terminal. Su ciclo de vida va por RPC passthrough a Herdr (`server/src/index.ts:1271`). El cliente solo guarda pins (`web/src/tabPins.ts:6`). `verificado`.
3. A2 (tab nativo de Herdr) no se puede construir sobre ninguna version publicada de Herdr. No hay punto de extension para tabs no-terminal en v0.9.0, v0.9.3 ni en HEAD `4e624cd5` (T-006, declaracion CA-05). `verificado` (ausencia). Su futuro queda `por-definir`.
4. Recomendacion: opcion **B (panel independiente), variante `mover`**. Es solo cliente, no toca el ciclo de vida de tabs y no duplica estado. Primer paso: extraer la superficie Files a un componente propio, que es el nucleo comun N1 de T-NUC. Certeza: `inferencia`, apoyada en las filas F5-2, F5-4, F5-5 y F5-10 de T-F5.
5. Antes de implementar, el consumidor debe tomar 10 decisiones (D-1..D-10, seccion f). Son parametros de decision (CA-03 ajustado en E4): cambian el contenido del trabajo, pero B mover es L en cualquier alternativa.

## b) Funcionamiento actual (sintesis de T-001, T-002, T-003)

### File manager (T-001)

Tablas fuente: T-F1a puntos de entrada (14 filas), T-F1b contrato backend (11 filas), T-F1c acoplamientos (12 filas) en `etapa-3/frentes/T-001-anatomia-file-manager.md`. Todas las filas minimas estan `cubierta`.

| Fila clave | Afirmacion | Cita | Certeza |
|---|---|---|---|
| Montaje | El host del Inspector monta `FileExplorerPanel` y `FilePreviewTabs`. La logica real vive en `FileExplorerContent` | `web/src/components/WorkspaceInspectorHost.tsx:677`, `web/src/components/WorkspaceInspectorHost.tsx:725`, `web/src/components/FileExplorerDialog.tsx:337` | verificado |
| T-F1a | Todas las entradas (atajo `files.toggle`, paleta, boton mobile, arbol, links de terminal, Changes) convergen en `openFileExplorer`/`openFileExplorerFile` | `web/src/App.tsx:2154`, `web/src/App.tsx:2159`, `web/src/shortcutBindings.ts:48` | verificado |
| T-F1b | Contrato: WS `file.list/resolve/read/search/reveal` y HTTP download/upload/delete por `workspace_id`. No depende del host | `server/src/index.ts:998`, `server/src/connections/http-routing.ts:60`, `server/src/workspace/files.ts:662` | verificado |
| T-F1b 10 | La raiz del explorador es el checkout o el cwd del pane `focused` de Herdr | `server/src/workspace/files.ts:78` | verificado |
| T-F1c 1 | Cerrar = `open:false`. El slot sigue montado | `web/src/App.tsx:2184`, `web/src/styles/layout/app.css:767` | verificado |
| T-F1c 7 | Al abrir enfoca el tab activo del Inspector. Al cerrar re-enfoca el tab de Herdr de retorno | `web/src/App.tsx:1459`, `web/src/App.tsx:2200` | verificado |
| T-F1c 9 | En mobile, abrir pone `mobileView = view`. El boton Terminal vuelve a `session` | `web/src/App.tsx:1840`, `web/src/App.tsx:3971` | verificado |
| T-F1c 6b | El menu contextual sin portal se posiciona respecto al stage (`container-type: size`) | `web/src/styles/layout/app.css:73`, `web/src/components/FileExplorerDialog.tsx:315` | inferencia; efecto visible `hipotesis` (U-1) |

### Tabs (T-002)

Tablas fuente: T-F2a operaciones (18 filas), T-F2b frontera (17), T-F2c shared vs browser-local (9) en `etapa-3/frentes/T-002-anatomia-tabs.md`.

| Fila clave | Afirmacion | Cita | Certeza |
|---|---|---|---|
| a1-a5 | Crear, cerrar, renombrar y reordenar van por RPC `tab.*` a Herdr. Cerrar pasa por `guardTabClose` (pins) | `web/src/store.ts:2637`, `web/src/store.ts:2687`, `web/src/store.ts:2727`, `web/src/store.ts:2735` | verificado |
| a2 / c1-c2 | Activar: en shared, `workspace.focus` + `tab.focus` (foco compartido). En browser-local, seleccion en memoria sin RPC | `web/src/store.ts:2587`, `web/src/store.ts:2623`, `web/src/store.ts:2627` | verificado (compartido entre clientes: inferencia, b17) |
| a6 / b7 | Los pins viven en localStorage `tabPins.v1` por conexion, sincronizados entre pestanas por el evento storage | `web/src/tabPins.ts:6`, `web/src/tabPins.ts:180` | verificado |
| a12 | Los eventos de Herdr disparan un refresh (no aplican deltas). El poll de 5 s es el respaldo | `server/src/connections/runtime.ts:73`, `web/src/store.ts:2232`, `web/src/store.ts:1539` | verificado |
| a10.1 | En mobile el strip solo se muestra con mas de un tab | `web/src/components/TabBar.tsx:153` | verificado |
| a13 | Solo se renderiza el layout del tab activo | `web/src/App.tsx:995` | verificado |
| b14 | El modo (shared o browser-local) lo decide el bridge | `server/src/bridge/terminal-bridge.ts:149` | verificado |

### Estado (T-003, T-EST)

Tabla fuente: 15 piezas x 6 columnas en `etapa-3/frentes/T-003-matriz-estado.md`. Las filas que deciden la comparativa son:

| Pieza | Clave | Por que importa | Cita | Certeza |
|---|---|---|---|---|
| 1 Arbol/cache | Map de modulo por `resourceKey`+`showHidden`. Cada instancia guarda una copia en `useState` y la reescribe en la cache | Dos instancias sobre la misma clave entran en conflicto | `web/src/components/fileExplorerResources.ts:67`, `web/src/components/FileExplorerDialog.tsx:385`, `web/src/components/FileExplorerDialog.tsx:504` | verificado |
| 3 ResourceFileTabs | localStorage `workspaceInspectorFile:{owner}` con read-modify-write | Last-write-wins con dos escritores | `web/src/workspaceResource.ts:128`, `web/src/components/WorkspaceInspectorHost.tsx:266` | verificado; last-write-wins: inferencia |
| 4 activeFilePreview | Un solo `useState` en `App`, filtrado por el scope del Inspector | Una seleccion para una sola superficie | `web/src/App.tsx:1474`, `web/src/App.tsx:2374` | verificado |
| 5 Preferencias | `workspaceInspector:{owner}`. El parser cae a `files` | Hay que migrarlo si `files` deja de ser vista | `web/src/workspaceResource.ts:127`, `web/src/workspaceResource.ts:294` | verificado |
| 6 Retorno/foco | `returnTabId`. Cerrar emite `store.focusTab`, que en shared mueve el foco de todos | Efecto entre clientes | `web/src/App.tsx:2200`, `web/src/store.ts:2627` | verificado; alcance entre clientes: inferencia |
| 10 Foco shared/browser-local | shared: Herdr. browser-local: memoria por pestana | Define la sincronizacion entre clientes | `web/src/store.ts:1369`, `web/src/browserNavigation.ts:3` | verificado / inferencia (shared) |
| 14 mobileView | Una union cerrada que incluye `InspectorView` | Si `files` sale del Inspector o se duplica, el tipo cambia | `web/src/App.tsx:349`, `web/src/App.tsx:354` | verificado |

## c) Reconciliacion de conflictos de la bitacora

### Conflicto 1: T-002 a12.1 (evento de reorden `por-definir`) vs T-006 (Herdr emite `tab.moved` y Roamgate no lo suscribe)

| Afirmacion | Cita | Certeza |
|---|---|---|
| `DEFAULT_EVENTS` de Roamgate suscribe `tab.created/closed/renamed/focused` y `layout.updated`, pero no `tab.moved` | `server/src/connections/runtime.ts:73`, `server/src/connections/runtime.ts:81`, `server/src/connections/runtime.ts:84`, `server/src/connections/runtime.ts:91` | verificado (re-leido 2026-10-07) |
| El schema de Herdr en tag `v0.9.0` (commit `cca4af8dfad160bc5fb5ae133b70882b5fe28f61`), que es la version que Roamgate fija, declara el evento `tab.moved` | https://raw.githubusercontent.com/herdrdev/herdr/v0.9.0/docs/next/api/herdr-api.schema.json l.4154 (`"const": "tab.moved"`); protocolo 22 en l.3 | verificado (descarga y busqueda, 2026-10-07) |
| La doc del socket API en `v0.9.0` dice que las suscripciones de tab incluyen `tab.moved` con `tab_id`, `workspace_id`, `insert_index` y la lista ordenada de `tabs` del workspace | https://raw.githubusercontent.com/herdrdev/herdr/v0.9.0/docs/next/website/src/content/docs/socket-api.mdx l.818-821 | verificado |
| En `v0.9.3` el evento sigue presente (schema l.4088) | T-006 EXT-8 | verificado (T-006) |
| Roamgate fija Herdr 0.9.0 / protocolo 22 | `server/src/herdr/release.ts:14`, `server/src/herdr/release.ts:15` | verificado |

**Veredicto:** las dos fuentes son compatibles, no contradictorias. T-002 a12.1 acierta en la parte del repo: Roamgate no suscribe ningun evento de movimiento de tab. La pregunta que T-002 dejo abierta ("emite Herdr algun evento al ejecutar `tab.move`?") queda **cerrada como `verificado`** con la spec y la doc de v0.9.0: el evento `tab.moved` existe en el protocolo 22. Conclusion operativa (`inferencia`, de las filas anteriores): un reorden hecho desde otro cliente llega a Roamgate por el poll de 5 s (`web/src/store.ts:1539`), o antes si coincide otro evento suscrito. Lo segundo no se verifico.

Queda abierto, solo para quien decida suscribir el evento: si los protocolos 14-20 que el bridge acepta (`server/src/bridge/protocol-compat.ts:1`, `server/src/bridge/protocol-compat.ts:14`) emiten `tab.moved`, y si suscribir un evento desconocido falla en esas versiones (U-15, `hipotesis`). Suscribirlo es un lateral fuera de alcance (seccion h, FA-5). Aplica sobre todo a A1 (DP-3, anclaje del tab virtual) y no a la opcion recomendada.

### Conflicto 2: boton Terminal mobile (T-001: `activateTerminalSurface` cierra el Inspector; T-006: pone `mobileView = session`)

| Afirmacion | Cita | Certeza |
|---|---|---|
| El boton Terminal de la nav mobile llama `activateTerminalSurface` | `web/src/App.tsx:3971` | verificado |
| `activateTerminalSurface` hace, en el mismo callback y en este orden: Inspector a `open:false`, cerrar anotaciones y `setMobileView("session")` | `web/src/App.tsx:1645`, `web/src/App.tsx:1646`, `web/src/App.tsx:1647`, `web/src/App.tsx:1649`, `web/src/App.tsx:1650` | verificado (re-leido 2026-10-07) |
| No llama `store.focusTab` (a diferencia de `closeInspector`) | `web/src/App.tsx:1645`, `web/src/App.tsx:2200` | verificado |

**Veredicto:** las dos afirmaciones son ciertas y ocurren en la misma ruta y el mismo callback, asi que no hay conflicto. T-001 T-F1c 9 ya lo describia completo ("cerrar o Terminal vuelve a `session` (y cierra el Inspector)"). T-006 cita solo la parte de `mobileView` porque su punto es otro: en A2, con un tab de contenido activo, `session` seguiria mostrando Files, y haria falta enfocar un tab terminal. Esa consecuencia es propia de A2 (`inferencia`, T-006 campo 6) y no contradice a T-001. Para la opcion recomendada, `activateTerminalSurface` tambien debe cerrar u ocultar el panel B (T-007 4.5).

## d) T-F5 Matriz comparativa

Columnas: A1 y B en cada variante. A2 va en columna aparte como `por-definir`, sin comparacion cuantitativa (CA-05): su talla es `no-estimable` en ambas variantes, solo por incertidumbre de evidencia sobre Herdr (T-006 campo 9).

Parametros de decision (CA-03 ajustado en E4): las decisiones de producto o diseno pendientes se declaran con alternativas y la talla se da por alternativa; no hacen la talla `no-estimable`. Equivalencias entre fichas: destino de las entradas en coexistir = A1 DP-2 = A2 DP-A2-3 = B DP-B1. Tipado de `files` en mover = A1 DP-4 = A2 DP-A2-4 = B DP-B3 (D-3). Sub-vista de cambios = A1 DP-5 = A2 DP-A2-5 = B DP-B4 (D-8). Foco del panel = B DP-B2 (D-2). Seguimiento del workspace = B DP-B5 (D-5). Descubribilidad desktop = B DP-B7 (D-6). Ubicacion del estado del panel y forma de coordinar el doble escritor = B DP-B8 (D-10); su parte 4.17 = A1 DP-6. Propios: A1 DP-1 (strip mobile), A1 DP-3 (anclaje) y B DP-B6 (extraccion en coexistir).

Criterio de lectura de la regla L "cambio en el ciclo de vida de tabs/foco compartido" (correccion E4 v2, N-1; definido en T-007 campo 9 y aplicado igual en T-005 y T-006). Cuenta cambiar las operaciones del ciclo de vida de tabs o su semantica en el strip, o agregar emisiones de `workspace.focus`/`tab.focus` en shared que hoy no existen. No cuenta trasladar 1:1 un disparador existente a otra superficie ni suprimir emisiones. Razon: la regla apunta a efectos que se propagan a otros clientes via Herdr (T-007 L6 y R2). Resultado: A1 cuenta (strip), A2 cuenta (abrir Files = `tab.focus`), B mover no cuenta en ninguna alternativa de DP-B2, y B coexistir cuenta con DP-B2=a y no con DP-B2=b. `inferencia`.

| ID | Criterio | A1 mover | A1 coexistir | B mover | B coexistir | A2 (mover y coexistir) | Certeza / origen |
|---|---|---|---|---|---|---|---|
| F5-1 | Frontera | Solo cliente | Solo cliente | Solo cliente | Solo cliente | Cliente + bridge + Herdr (requisito externo) | inferencia (T-005 campo 2; T-007 campo 2; T-006 campo 2) |
| F5-2 | Modulos (.ts/.tsx) | 10 (DP-4=b) o 12 (DP-4=a): TabBar, MobileTabSheet, App, tabShortcuts, modelo nuevo, host nuevo, WorkspaceInspectorHost, workspaceResource, terminalFocus, FilePreviewTabs (test) (+WorktreeLifecycleRow, +Dialog si DP-4=a) | 8 (DP-6=b) o 9 (DP-6=a): los anteriores sin FilePreviewTabs ni WorktreeLifecycle*, con WorkspaceInspectorHost por el doble escritor; workspaceResource solo con DP-6=a | 6 (DP-B3=b) u 8 (DP-B3=a); +1 (`TabBar.tsx`) si DP-B7=b; +1 (modulo nuevo para 3.4) si DP-B8=b o c. Rango 6-10 | 5 con DP-B6=a o b y DP-B8=a o c; 6 con DP-B6=a' o DP-B8=b; 7 con DP-B6=a' y DP-B8=b | Superficie listada en T-006 campo 1; conteo no comparable (por-definir) | inferencia (T-005 campo 9; T-007 campo 9; T-006 campo 1) |
| F5-3 | Contratos | Cliente: K1 tipo de entrada del strip, K2 clave nueva, K4, K7 (+K3, K5, K6 si DP-4=a) | Cliente: K1, K2, K7 (doble escritor) (+K6 si T-EST 14 se resuelve con un miembro distinto) | Cliente: 3.2-3.4, 3.8, 3.9 (+3.1, 3.6 y 3.7 si DP-B3=a). Sin RPC | Cliente: 3.4, 3.9 y 3.5 con dos escritores (+3.7 si T-EST 14 se resuelve con un miembro distinto). Sin RPC | Protocolo Herdr (R-H1..R-H6), rango de protocolo, flag de capacidad, tipo `Tab` (+`InspectorView`/`MobileView` si DP-A2-4=a) | inferencia (T-005 campo 3; T-007 campo 3; T-006 campo 3). `MobileView` con el mismo criterio en las tres fichas (N-3): mover, segun A1 DP-4 / B DP-B3 / A2 DP-A2-4; coexistir, segun como se resuelva T-EST 14 |
| F5-4 | Toca ciclo de vida de tabs / strip | Si: activo propio del strip, cierre, reorden, atajos `tab.*`, MobileTabSheet (T-F3: 14 operaciones adaptadas, 6 no aplicables, 1 aplicable) | Si (igual) | No: TabBar, MobileTabSheet y tabShortcuts sin cambio | No | Si: `createTab`, `focusTab`, cierre, caches por tab (X7, X10) | inferencia (T-005 T-F3; T-007 campo 1 fila 1.9; T-006 campo 4) |
| F5-5 | Riesgos principales | R1: `tab.close` con Files activo cierra un tab oculto. R3: el tab nuevo queda detras de Files. R4: con el id virtual en `groupOrder` el drop no hace nada (vecino siguiente virtual) o mueve el tab de Herdr al indice 0 (vecino previo virtual). R8: migrar `view:"files"`. R9: Changes cruza de superficie. R13: re-foco de la terminal sin `terminalFocus` | R1, R3, R4, R13. R10/R11: dos superficies con una sola seleccion | R2: segundo emisor de foco (shared, si DP-B2=a). R3: ancho en desktop estrecho. R5: re-hogar la sub-vista de cambios. R6: migrar `view:"files"`. R7: descubribilidad desktop | R1: dos instancias pisan cache y ResourceFileTabs. R2 (mas probable). R3. R5 | RG1: roadmap ajeno. RG2: foco compartido para todos. RG3: tab ilegible en la TUI. RG4: version skew | inferencia/verificado segun cada riesgo (T-005 campo 7; T-007 campo 7; T-006 campo 7) |
| F5-6 | Mobile | Fila Files en MobileTabSheet. El strip aparece con 1 tab de Herdr + Files si DP-1=a. Terminal desactiva el tab sin cerrarlo | Igual + destino de cada entrada segun DP-2 | `files` de `MobileView` designa el panel (miembro propio si DP-B3=a; heredado de `InspectorView` si DP-B3=b). Patron de anotaciones/Ranger. TabBar y MobileTabSheet sin cambio | `files` ambiguo: hace falta un miembro distinto o una regla de prioridad (T-EST 14). Terminal cierra panel e Inspector | Files en `session`. Volver a terminal exige enfocar un tab terminal. Workspace solo con el tab Files: por-definir | inferencia (T-005 campo 6; T-007 campo 6; T-006 campo 6) |
| F5-7 | Persistencia | Abierto/posicion/pin en una clave nueva (K2). Activo en memoria. Al recargar arranca en terminal | Igual + dos superficies sobre `workspaceInspectorFile:` | Preferencias del panel en una clave nueva (3.4). Sesion en memoria, como el Inspector. Reutiliza `workspaceInspectorFile:` con un solo escritor | Clave nueva + dos escritores de `workspaceInspectorFile:` | Depende de que Herdr persista `kind` y metadata (R-H4): por-definir | inferencia (T-005 a11, K2, K7; T-007 3.4, 3.5; T-006 R-H4) |
| F5-8 | Sincronizacion entre pestanas del navegador | Solo si el modelo nuevo se suscribe a `storage` (patron `tabPins`) | Igual | Preferencias del panel: posible en vivo con el patron del Inspector. La sesion no se sincroniza (igual que hoy) | Igual | Via Herdr (todas las pestanas ven el tab): por-definir | inferencia (T-005 a12, C12; T-003 filas 5-6; T-006 campo 5 fila 10) |
| F5-9 | Sincronizacion entre clientes | No (el tab virtual es local). Foco de Herdr intacto (P-4) | No | No en estado. En shared, efecto de foco si DP-B2=a (igual que el Inspector hoy); ninguno si DP-B2=b | No en estado. Dos emisores de foco si DP-B2=a | Si por diseno: abrir Files es `tab.focus`, que en shared ven todos | inferencia (T-005 P-4; T-007 L6, DP-B2; T-006 RG2) |
| F5-10 | Conflictos de estado en T-EST (filas `conflicto`, etiquetado homogeneo) | 0 | 5 (filas 1, 3, 4, 7, 14) | 0 | 5 (filas 1, 3, 4, 7, 14) | mover: por-definir (fila 3 depende de R-H3). coexistir: filas 1, 3, 4 y 7 en conflicto; sin total ni comparacion cuantitativa (CA-05; ver T-006 campo 5) | inferencia (T-005 campo 5; T-007 campo 5; T-006 campo 5) |
| F5-11 | Incertidumbre de evidencia que afecta campos 1-4 | Ninguna | Ninguna | Ninguna | Ninguna | PD-A2-1, PD-A2-2, H-A2-1, H-A2-2, H-A2-3 (parte mover); todas dependen de Herdr | inferencia (campo 8a de cada ficha) |
| F5-11b | Parametros de decision que afectan campos 1-4 | DP-1, DP-4, DP-5 (DP-3 en el modulo nuevo) | DP-1, DP-2, DP-5, DP-6 (DP-3 en el modulo nuevo) | DP-B2, DP-B3, DP-B4, DP-B5, DP-B7, DP-B8 | DP-B1, DP-B2, DP-B4, DP-B5, DP-B6, DP-B8 | DP-A2-4, DP-A2-5 (+ DP-A2-3 en coexistir); no cambian la no-estimabilidad | inferencia (campo 8b de cada ficha) |
| F5-12 | Talla (CA-03, por alternativa) | **L** en toda alternativa | **L** en toda alternativa | **L** en toda alternativa | DP-B2=a: **L** en toda alternativa (agrega emisiones de foco compartido; criterio N-1). DP-B2=b: **M** con 5 modulos (DP-B6=a o b, y DP-B8=a o c); **L** con DP-B6=a' o DP-B8=b | **no-estimable** (solo por evidencia sobre Herdr). Cota: al menos L (cruza bridge y Herdr) | inferencia (T-005 campo 9; T-007 campo 9; T-006 campo 9) |

Nota sobre F5-10 (correccion E4, H-3): antes A1 coexistir figuraba con "3 + 1 hipotesis" y B coexistir con 5 porque el mismo fenomeno se etiquetaba distinto (A1 decia "se duplica" en las filas 1 y 7). Tras unificar, dos escritores sobre la misma clave o lectura solo al montar = `conflicto` en las tres fichas, y la perdida visible queda como `hipotesis` aparte (H-A1-1, H-B1, H-A2-3). Las columnas son comparables. Correccion E4 v2 (N-4): la columna A2 ya no lleva total; solo lista las filas en conflicto y remite a T-006, porque CA-05 no admite comparar A2 cuantitativamente.

Nota sobre F5-12 (`inferencia`): el M de B coexistir es fragil. Solo se da con DP-B2=b y con 5 modulos, en el limite de M. Cualquier modulo mas lo lleva a L: extraer el bloque Files a un modulo propio (DP-B6=a') o llevar el estado del panel a un modulo nuevo resolviendo el doble escritor en `workspaceResource.ts` (DP-B8=b). Con DP-B2=a es L por el criterio del ciclo de vida de foco compartido (SN-1). Correccion E4 v2 (N-1, N-2): la alternativa DP-B8 queda declarada y la talla con DP-B2=a ya no depende de quien aplique la regla.

## e) T-NUC Nucleo comun

Regla (CA-04): se clasifican los cambios `confirmado` de las fichas. **Fichas elegibles para `comun-a-todas`: A1 y B.** A2 no cuenta porque es `no-estimable` en ambas variantes (T-006 campo 9). Sus cambios aparecen solo en `compartido-por` y como referencia. Solo `comun-a-todas` se presenta como trabajo inevitable.

Efecto de la correccion E4 sobre el conjunto elegible (`inferencia`): con el ajuste de CA-03, los parametros de decision no hacen `no-estimable` a ninguna ficha. A1 y B siguen estimables y A2 sigue `no-estimable` solo por evidencia sobre Herdr. **El conjunto elegible no cambia (A1 y B).** Lo que cambia es el contenido: al corregir T-005 (H-4), la seleccion por superficie (C18) y `terminalFocus` (C19) pasan a ser `confirmado` en A1 y suben de `compartido-por:{B}` a `comun-a-todas` como N5 y N6.

### comun-a-todas (6)

| ID | Cambio | A1 | B | A2 (referencia) | Certeza |
|---|---|---|---|---|---|
| N1 | Componente host de la superficie Files fuera del Inspector. Compone `FileExplorerPanel` + `FilePreviewTabs` + preview y re-hoga el acoplamiento con Changes (`diffViewerRef`, forma segun D-8) | C13 | 4.12 | X11 | inferencia (de las fichas); montaje actual verificado: `web/src/components/WorkspaceInspectorHost.tsx:677`, `web/src/components/WorkspaceInspectorHost.tsx:725`, `web/src/components/WorkspaceInspectorHost.tsx:772` |
| N2 | `App.tsx` monta esa superficie fuera del slot del Inspector. El sitio difiere: A1 en `.workspace-stage`, ocultando la terminal. B como hermano en `.workspace-surfaces` | C5 | 4.3 | X8 | inferencia; puntos verificados: `web/src/App.tsx:4195`, `web/src/App.tsx:4205` |
| N3 | Mobile: el boton Files de la nav y `activateTerminalSurface` deben gobernar la superficie nueva (abrir y desactivar/cerrar) | C8 | 4.5 | (campo 6) | inferencia; actual verificado: `web/src/App.tsx:3982`, `web/src/App.tsx:1645` |
| N4 | Estado propio de la superficie nueva (abierto, scope y, en A1, posicion/pin) con clave localStorage nueva namespaceada por conexion | C12 (K2) | 4.1 + 4.11 (3.4) | no (delegado a Herdr) | inferencia; patron verificado: `web/src/connectionStorage.ts:42`, `web/src/tabPins.ts:6` |
| N5 (antes S-2) | Seleccion/preview con gating por el scope de la superficie nueva (hoy `setActiveFilePreview` y `handleFilePreviewChange` solo aceptan el scope del Inspector) | C18 | 4.6 | (campo 5 fila 4) | verificado (gating `web/src/App.tsx:1478`, `web/src/App.tsx:2374`); cambio inferencia |
| N6 (antes S-3) | Agregar la superficie nueva al selector de `terminalFocus`, que hoy protege `.workspace-inspector` | C19 | 4.13 | no listado | verificado (`web/src/terminalFocus.ts:12`); cambio inferencia |

### compartido-por:{subconjunto}

| ID | Cambio | Subconjunto | Origen | Certeza |
|---|---|---|---|---|
| S-1 | Re-rutear las entradas de T-F1a a la superficie nueva | compartido-por:{B} (en A1 es `condicional:mover`, C6; en A2 `condicional:mover`, X12) | T-007 4.2 | verificado (convergencia en `web/src/App.tsx:2154`) |
| S-4 | Incluir la superficie en el calculo "peer layout" del Inspector | compartido-por:{B} | T-007 4.4 | inferencia |
| S-5 | Regla de seguimiento del workspace enfocado (forma segun DP-B5 / D-5) | compartido-por:{B} | T-007 4.7 | verificado (`web/src/App.tsx:2868`) |
| S-6 | Strip mezclado: TabBar (activo, cierre, drag, menu) y visibilidad mobile del strip | compartido-por:{A1, A2} | T-005 C1, C2; T-006 X9 | inferencia |
| S-7 | MobileTabSheet con la fila Files | compartido-por:{A1, A2} | T-005 C3; T-006 X9 | inferencia |
| S-8 | Atajos y orden del strip (`tabShortcuts`, atajos `tab.*` en App) | compartido-por:{A1} (en A2 es `hipotesis`, X10) | T-005 C4, C7 | inferencia |
| S-9 | Limpieza del estado nuevo al remover el worktree o cambiar de generacion | compartido-por:{A1} | T-005 C9 | inferencia |
| S-10 | Requisito R-H en Herdr, version/protocolo, gating de capacidad, tipo `Tab`, rutas de `store.ts` | compartido-por:{A2} | T-006 X1, X2, X3, X6, X7 | inferencia / por-definir |

S-2 y S-3 ya no figuran aqui: pasaron a N5 y N6 (correccion E4, H-4).

### condicional:{variante}

| ID | Cambio | Variante | Fichas | Certeza |
|---|---|---|---|---|
| V-1 | Quitar Files de `WorkspaceInspectorHost` (vista, boton, ArrowDown, recurso, props) | condicional:mover | A1 C14, B 4.9, A2 X12 | verificado (puntos `web/src/components/WorkspaceInspectorHost.tsx:445`, `web/src/components/WorkspaceInspectorHost.tsx:456`, `web/src/components/WorkspaceInspectorHost.tsx:668`) |
| V-2 | Default/saneo de preferencias sin `files`, migracion de `view:"files"` y, si D-3 lo quita, `InspectorView` sin `files`. Superficie de regresion: `web/src/workspaceResource.test.ts` (unas 20 aserciones sobre `view:"files"`, `filesNavigationRatio` y `expandedNavigationRatios.files`, p. ej. `web/src/workspaceResource.test.ts:164`, `web/src/workspaceResource.test.ts:277`, `web/src/workspaceResource.test.ts:438`, `web/src/workspaceResource.test.ts:556`); cuenta con el modulo `workspaceResource.ts` y no cambia la talla | condicional:mover | A1 C15, B 4.10, A2 X12/C8 | verificado (`web/src/workspaceResource.ts:7`, `web/src/workspaceResource.ts:294` y lineas del test) |
| V-3 | Defaults de App que caen a `files` (toggle sin pane de History, `keepInspectorForWorkspace`) | condicional:mover | A1 C10, B 4.8 | verificado (`web/src/App.tsx:2267`, `web/src/App.tsx:2311`) |
| V-4 | Tipado de la peticion de `WorktreeLifecycleRow`/`Dialog` | condicional:mover, solo si D-3 quita `files` de la union (A1 DP-4=a, B DP-B3=a) | A1 C17, B 4.15 | verificado (`web/src/components/WorktreeLifecycleRow.tsx:124`) |
| V-5 | Reescribir el arnes de `FilePreviewTabs.test.ts` | condicional:mover | A1 C20, B 4.14 | verificado (`web/src/components/FilePreviewTabs.test.ts:296`, `web/src/components/FilePreviewTabs.test.ts:406`) |
| V-6 | Re-semantizar `files.toggle` y el boton Files | condicional:mover | A1 C6, A2 X13 (en B queda dentro de S-1) | inferencia |
| V-7 | Coordinar dos instancias (seleccion por superficie, doble escritor de `ResourceFileTabs`, extraccion del bloque Files) | condicional:coexistir | A1 C11, C16; B 4.9b, 4.17; A2 X14 | inferencia |
| V-8 | Destino de cada entrada de T-F1a (Inspector o superficie nueva) | condicional:coexistir | A1 DP-2, B DP-B1, A2 DP-A2-3 | parametro de decision (no es estado de certeza) |
| V-9 | Actualizar la documentacion que describe Files como vista del Inspector: `FEATURES.md:94` ("Open **Files**, **Changes**, ... from the Inspector button"), `FEATURES.md:100` (anchos separados de Files y Changes), `docs/ARCHITECTURE.md:257` ("Inspector geometry is shared; active views, files, ...": ubica `files` entre el estado del Inspector). No es modulo (CA-03). Correccion E4 v2 (N-5): antes se citaba `:232`, que trata de la propiedad del checkout y sigue siendo cierta con B mover | condicional:mover | B (y A1/A2 mover) | verificado (citas); necesidad inferencia |

Tamano de T-NUC: 6 `comun-a-todas`, 8 `compartido-por`, 9 `condicional`.

## f) Recomendacion (CA-06)

| Elemento | Contenido | Certeza |
|---|---|---|
| Opcion elegida | **B: panel independiente**, hermano del Inspector en `.workspace-surfaces` | inferencia (de F5-2, F5-4, F5-5, F5-12) |
| Variante | **mover**: Files deja de ser vista del Inspector | inferencia (de F5-10: 0 conflictos de estado frente a 5 en coexistir, con etiquetado homogeneo; F5-6: `MobileView` sin ambiguedad; nota de F5-12: el M de coexistir es fragil) |
| Referencia a T-NUC | Trabajo inevitable: N1-N6 (`comun-a-todas`). Para B suman los `compartido-por:{B}` S-1, S-4 y S-5 y los `condicional:mover` V-1..V-5 y V-9 | inferencia (de la seccion e) |
| Primer paso del work consumidor | Construir **N1**: extraer de `WorkspaceInspectorHost` el bloque Files (arbol `FileExplorerPanel` + `FilePreviewTabs` + preview + manejo de `ResourceFileTabs` y `drillInByView.files`) a un componente propio, montable fuera del Inspector y sin cambiar su comportamiento. **Entrada:** T-007 L7, 4.9b y 4.12; T-001 T-F1c filas 5, 7 y 11; T-003 filas 3, 4 y 15; puntos de codigo `web/src/components/WorkspaceInspectorHost.tsx:266`, `web/src/components/WorkspaceInspectorHost.tsx:677`, `web/src/components/WorkspaceInspectorHost.tsx:725`, `web/src/components/WorkspaceInspectorHost.tsx:772`. Es comun a todas las opciones elegibles, asi que sirve aunque D-1 cambie la opcion | inferencia (N1 en A1 C13, B 4.12, A2 X11) |
| Por que no A1 (ambas variantes) | F5-4: toca el ciclo de vida del strip (14 operaciones adaptadas de T-F3) y S-6..S-9. F5-5: R1, R3 y R4 interactuan con operaciones de tabs de Herdr (R4 puede mover un tab de Herdr al indice 0). F5-6: la visibilidad del strip en mobile queda como parametro de decision (DP-1). F5-12: L en toda alternativa, con 10-12 (mover) u 8-9 (coexistir) modulos frente a 6-10 de B mover, y ademas por el ciclo de vida de tabs (criterio N-1, seccion d) | inferencia |
| Por que no A2 (ambas variantes) | **A2 queda `por-definir`, no descartada** (CA-05). F5-1/F5-3: exige que Herdr publique R-H1..R-H6, y esa ausencia esta verificada hasta v0.9.3 y HEAD `4e624cd5` (T-006). F5-11/F5-12: `no-estimable` solo por incertidumbre de evidencia sobre Herdr, al menos L. F5-9/F5-5 RG2: abrir Files moveria el foco de todos los clientes en shared. Se reabre si se cierra PD-A2-1 (U-9) | verificado (ausencia en Herdr); por-definir (futuro) |
| Por que no B coexistir | F5-10: 5 filas de T-EST en conflicto (1, 3, 4, 7, 14) y H-B1 sin cerrar. F5-6: `files` ambiguo en `MobileView`. F5-9: dos emisores de foco (R2) si DP-B2=a. F5-12: L si DP-B2=a (agrega emisiones de foco compartido, SN-1); con DP-B2=b, M solo con 5 modulos, en el limite, y L con DP-B6=a' o DP-B8=b | inferencia |

Efecto de la correccion E4 sobre esta tabla (`inferencia`): la opcion (B), la variante (mover) y el primer paso (N1) no cambian. Cambian la referencia a T-NUC (N1-N6 en vez de N1-N4, y se agrega V-9) y los numeros citados en las razones (14 operaciones adaptadas; modulos por alternativa).

Efecto de la correccion E4 v2 (N-1..N-5) (`inferencia`): la opcion (B), la variante (mover), la talla de la opcion recomendada (L en toda alternativa, ahora con 6-10 modulos), T-NUC (6 / 8 / 9) y el primer paso (N1) no cambian. Cambian los rangos de modulos (B mover 6-10; B coexistir 5-7; A1 coexistir 8-9) y la talla de B coexistir con DP-B2=a, que pasa de condicional a L. Las dos cosas refuerzan `mover`.

### Sensibilidades declaradas

| ID | Sensibilidad | Efecto sobre la recomendacion | Certeza |
|---|---|---|---|
| SN-1 | Con DP-B2=a, B coexistir es L: el panel agrega emisiones de `workspace.focus`/`tab.focus` (una sesion con `returnTabId` propio, R2), y eso cuenta como cambio del foco compartido segun el criterio fijado en T-007 campo 9 (N-1). En mover, DP-B2=a tambien cuenta cuando el panel y el Inspector (Changes/Commits/History) estan abiertos a la vez, porque cada uno lleva su sesion con `returnTabId` propio (T-007 4.1, R2, F5-5); la talla de mover no cambia porque ya es L por modulos (correccion Q-1) | Ya no diferencia mover de coexistir en la talla; mover sigue preferido por los conflictos de F5-10 de coexistir. Implica decidir D-2 al inicio del work de implementacion | inferencia |
| SN-2 | Parametros de T-007 DP-B1 (antes S1: las entradas de Files abren el panel) y DP-B2 (antes S2: el panel replica la semantica de foco del Inspector) | En `mover`, DP-B1 no tiene alternativas (no queda otra superficie Files). DP-B2 es la decision D-2: con DP-B2=b desaparece el riesgo R2 y la talla no cambia (mover es L en toda alternativa) | inferencia |
| SN-3 | Premisas de A1 P-1..P-4 (T-005). Son la definicion de la opcion, no evidencia ni parametro | Si el consumidor cambiara a A1, P-4 (activar Files sin RPC a Herdr) es la que evita tocar el foco compartido. Alterarla re-deriva la talla | inferencia |
| SN-4 | Parametros de decision de A1, DP-1..DP-6 (T-005 campo 8b) | Solo aplican si se elige A1, y A1 es L en toda alternativa. DP-4 y DP-5 equivalen a D-3 y D-8 de B | inferencia |
| SN-5 | Si Herdr publicara R-H (PD-A2-1) | A2 pasaria a ser estimable (al menos L) y deberia re-compararse con B. N1 seguiria valiendo | inferencia |

### Decisiones que el consumidor debe tomar antes de implementar

Todas son parametros de decision (CA-03 ajustado): decisiones de producto o diseno, no incertidumbre de evidencia. La talla de B mover es L en cualquier alternativa.

| ID | Decision | Afecta | Origen | Parametro en las fichas | Estado |
|---|---|---|---|---|---|
| D-1 | Ratificar B mover o cambiar de opcion o variante | Todo el plan | Esta seccion | - | parametro de decision |
| D-2 | El panel conserva o no los efectos de foco hacia Herdr al abrir y cerrar (`focusWorkspace`, `focusTab(returnTabId)`) | R2, F5-9 | T-007 L6; `web/src/App.tsx:1829`, `web/src/App.tsx:2200` | B DP-B2 (antes S2) | parametro de decision |
| D-3 | Tipado: quitar `files` de `InspectorView` o conservarlo como valor no renderizado | +2 modulos (V-4): 6 vs 8 con DP-B8=a; 7 vs 9 con DP-B8=b o c. Tambien decide si cambian los tipos de 3.6 y `MobileView` (3.7) | T-007 3.1, 4.10, 4.15 | B DP-B3; A1 DP-4; A2 DP-A2-4 | parametro de decision |
| D-4 | Migracion de `view:"files"` persistido y de los ratios de Files huerfanos | R6 | T-007 3.3; `web/src/workspaceResource.ts:294` | - (no cambia modulos) | parametro de decision |
| D-5 | El panel sigue al workspace enfocado o queda fijo a su scope | S-5 | T-007 4.7 | B DP-B5 | parametro de decision |
| D-6 | Afordancia de descubribilidad en desktop (hoy el unico boton es "Inspector"). Si se agrega al TabBar, suma un modulo (mover queda entre 7 y 10, sigue L) | R7 | T-007 R7; `web/src/components/TabBar.tsx:373` | B DP-B7 | parametro de decision |
| D-7 | Layout del panel (lado, tamano, expandido) y convivencia de ancho con Inspector + anotaciones | R3, S-4 | T-007 R3, 4.4 | - (no cambia modulos) | parametro de decision |
| D-8 | Sub-vista de cambios del archivo: segunda instancia de `DiffViewerPanel` o navegar al Inspector-Changes | R5, H-B2 | T-007 4.12, R5 | B DP-B4; A1 DP-5; A2 DP-A2-5 | parametro de decision (el costo de la primera alternativa es la `hipotesis` U-16) |
| D-9 | Mobile: si D-3 quita `files` de `InspectorView`, nombre del miembro propio de `MobileView`; y si Terminal oculta el panel montado (para conservar el arbol) o lo desmonta | N3 | T-007 3.7, campo 6 | - (no cambia modulos) | parametro de decision |
| D-10 | Ubicacion del estado y las preferencias del panel (3.4): `workspaceResource.ts` o modulo nuevo | +1 modulo con modulo nuevo (mover sigue L) | T-007 4.11, 3.4 | B DP-B8 (en coexistir incluye la forma de 4.17; su parte 4.17 = A1 DP-6) | parametro de decision |

## g) Riesgos transversales

| ID | Escenario | Opciones | Cita | Certeza |
|---|---|---|---|---|
| RT-1 | `tab.close` (`Ctrl+Alt+W`) con Files activo como tab: calcula el destino con el tab de Herdr enfocado y cierra un tab o pane oculto. Relacionado en A1: R4, un drop con el id virtual en `groupOrder` puede mover un tab de Herdr al indice 0 (T-005 R4) | A1 (no aplica a B: la terminal sigue visible) | `web/src/App.tsx:3147`, `web/src/App.tsx:3153`; T-005 R1 | inferencia |
| RT-2 | Foco compartido en shared: cerrar Files emite `tab.focus(returnTabId)` y mueve a todos los clientes. B agrega un segundo emisor. A2 lo vuelve el mecanismo de apertura | Hoy (Inspector), B, A2 | `web/src/App.tsx:2200`, `web/src/store.ts:2627`; T-007 R2; T-006 RG2 | inferencia (T-002 b17) |
| RT-3 | Coexistir: dos instancias sobre la misma `resourceKey` se pisan la cache del arbol, `ResourceFileTabs`, la seleccion unica, `showHidden` y `mobileView` | Todas en coexistir | `web/src/components/FileExplorerDialog.tsx:504`, `web/src/App.tsx:1474`; T-005 R10/R11; T-007 R1; T-006 RG8 | inferencia; perdida visible: hipotesis (U-5, U-12, U-14) |
| RT-4 | Migracion: preferencias guardadas con `view:"files"` (o sin `view`) caen a `files` y `inspector.toggle` abriria una vista inexistente | Todas en mover | `web/src/workspaceResource.ts:294`; T-005 R8; T-007 R6 | verificado (saneo); escenario inferencia |
| RT-5 | Menu contextual del explorador sin portal dentro de un contenedor `size`: puede recortarse o desplazarse | Todas | `web/src/styles/layout/app.css:73`, `web/src/styles/layout/app.css:893`, `web/src/components/FileExplorerDialog.tsx:315` | inferencia; efecto hipotesis (U-1, U-6, U-13) |
| RT-6 | Raiz del explorador en un workspace sin worktree: la da el pane `focused` de Herdr, no la seleccion local en browser-local | Todas (A2 agrava: tab sin panes) | `server/src/workspace/files.ts:84`; T-003 H-1; T-006 H-A2-1 | hipotesis (U-3, U-10) |
| RT-7 | La salida de la terminal roba el foco a la superficie nueva si no se agrega a `terminalFocus` | B y A1 (declarado en T-007 R9 y T-005 R13; cambio comun N6) | `web/src/terminalFocus.ts:12`; T-007 R9; T-005 R13 | inferencia |
| RT-8 | Reordenar las reglas CSS mobile rompe Commits, que se ve por el overlay del slot y no por una regla `mobile-view-commits` | B, A1 mover | `web/src/styles/layout/app.css:985`, `web/src/styles/layout/app.css:816`; T-007 R10 | inferencia |
| RT-9 | Renombrar clases del bloque Files cierra el `AnnotationComposerPopover` al navegar el arbol | Cualquier extraccion (N1) | `web/src/components/AnnotationComposerPopover.tsx:88`; T-007 R8 | inferencia |

## h) Fuera de alcance (CA-07)

Registro sin propuesta de cambio.

| ID | Item | Evidencia | Certeza |
|---|---|---|---|
| FA-1 | Faltan capacidades: rename, move, mkdir, editar contenido. El backend solo expone list/resolve/read/search/reveal y download/upload/delete | `server/src/index.ts:998`, `server/src/connections/http-routing.ts:17`, `server/src/workspace/files.ts:662`, `web/src/components/FileExplorerDialog.tsx:277` (T-001 FA-1) | verificado |
| FA-2 | El modal `FileExplorerDialog` no se usa: el unico import de produccion trae `FileExplorerPanel` | `web/src/components/FileExplorerDialog.tsx:108`, `web/src/components/WorkspaceInspectorHost.tsx:59` (T-001 FA-2) | verificado (ausencia de usos por busqueda textual) |
| FA-3 | Esc no cierra el panel: Esc->onClose solo con `showCloseButton`, y el panel pasa `false` | `web/src/components/FileExplorerDialog.tsx:689`, `web/src/components/FileExplorerDialog.tsx:177`, `web/src/App.tsx:3096` (T-001 FA-3) | verificado |
| FA-4 | Claves huerfanas al remover un worktree: el handler limpia cache, diff y seleccion, pero no `workspaceInspector:{owner}` (preferencias) | `web/src/App.tsx:2668`, `web/src/App.tsx:2684` (T-003 fila 5) | verificado |
| FA-5 | `tab.moved` no esta suscrito aunque Herdr v0.9.0 lo declara. Un reorden remoto llega por el poll | `server/src/connections/runtime.ts:73`; seccion c, conflicto 1 | verificado |
| FA-6 | `previewCache` no se limpia al remover un worktree y esta indexada por `workspaceId`, no por owner | `web/src/components/fileExplorerResources.ts:121`, `web/src/components/fileExplorerResources.ts:199` (T-003 fila 2) | verificado |
| FA-7 | Las entradas de `explorerCache` de generaciones anteriores nunca se borran | `web/src/components/fileExplorerResources.ts:118` (T-003 fila 1) | inferencia |
| FA-8 | MobileTabSheet no ofrece renombrar, reordenar ni pin (solo despin de un tab ya fijado) | Acciones presentes por fila: foco (`web/src/components/MobileTabSheet.tsx:141`), despin solo si el tab esta fijado (`web/src/components/MobileTabSheet.tsx:170`), cerrar (`web/src/components/MobileTabSheet.tsx:182`); al pie, New Tab (`web/src/components/MobileTabSheet.tsx:197`). La ausencia sale de leer completo el rango de acciones `web/src/components/MobileTabSheet.tsx:130`-`web/src/components/MobileTabSheet.tsx:202` y de buscar `rename\|move\|drag` en el archivo: la unica coincidencia es `removeEventListener` (rama dev, d703e6f, 2026-10-07) (T-002 a10) | verificado (acciones presentes); ausencia por lectura del rango y busqueda textual |
| FA-9 | En mobile con un solo tab no hay boton Inspector, porque vive dentro del strip oculto | `web/src/components/TabBar.tsx:153`, `web/src/components/TabBar.tsx:373` (T-007 campo 6) | verificado |
| FA-10 | Roamgate fija Herdr 0.9.0. El ultimo release es v0.9.3 | `server/src/herdr/release.ts:14` (T-004) | verificado |

## i) Registro de incertidumbre consolidado

Fuentes revisadas comunes: rama `dev`, commit `d703e6f`, 2026-10-07 (repo). Herdr: tags v0.9.0 (`cca4af8d`), v0.9.3 (`7b116c05`) y HEAD master `4e624cd5`, 2026-10-07.

| ID | Origen | Estado | Pregunta bloqueada | Fuentes revisadas | Condicion de cierre |
|---|---|---|---|---|---|
| U-1 | T-001 T-F1c 6b | hipotesis | El menu contextual se recorta o desplaza si el Inspector no esta en el origen del viewport? | `web/src/styles/layout/app.css:73`, `web/src/components/FileExplorerDialog.tsx:315` | Abrir el menu con dock right en desktop y comparar la posicion del clic con la del menu (Playwright o manual) |
| U-2 | T-003 PD-1 (= T-002 b6) | por-definir | Conserva Herdr los `tab_id` (labels, orden, layout) al reiniciar? | `web/src/tabPins.ts:92`; T-003 PD-1; rama dev, d703e6f, 2026-10-07 | Spec de persistencia de Herdr, o prueba de reinicio comparando `tab.list` |
| U-3 | T-003 H-1 | hipotesis | En un workspace sin worktree, el arbol cacheado pinta la raiz anterior cuando cambia el pane o el cwd enfocado? | `server/src/workspace/files.ts:78`, `web/src/workspaceResource.ts:176` | Prueba cambiando el cwd del pane enfocado y reabriendo Files |
| U-4 | T-003 PD-2 | por-definir | Que conserva Herdr del foco compartido al reiniciar? | `web/src/store.ts:2623`, `server/src/connections/runtime.ts:73`; T-003 PD-2; rama dev, d703e6f, 2026-10-07 | Spec de `workspace.focus`/`tab.focus`, o prueba de reinicio |
| U-5 | T-005 H-A1-1 | hipotesis | Dos `FileExplorerContent` sobre la misma clave pierden `expanded`? | `web/src/components/FileExplorerDialog.tsx:385` | Test con dos instancias montadas |
| U-6 | T-005 H-A1-2 | hipotesis | El menu contextual se desplaza en el host del tab? | `web/src/styles/layout/app.css:73` | Prueba Playwright/manual |
| U-7 | T-005 DP-1..DP-6 | parametro de decision (CA-03 ajustado; no es estado de certeza) | Files cuenta para el strip mobile? Destino de las entradas en coexistir? Anclaje de la posicion virtual? Tipado de `files` en mover? Sub-vista de cambios? Forma del doble escritor en coexistir? | `web/src/components/TabBar.tsx:153`, `web/src/App.tsx:2321`; T-005 campo 8b; rama dev, d703e6f, 2026-10-07 | Decision del dueno de producto o del diseno, solo si se elige A1 (DP-4, DP-5 y DP-6 equivalen a D-3, D-8 y la parte 4.17 de D-10). A1 es L en toda alternativa |
| U-9 | T-006 PD-A2-1 | por-definir | Publicara Herdr un tab no-terminal con metadata, evento, persistencia y senal de capacidad (R-H1..R-H4, R-H6)? | EXT-1..EXT-12 de T-006 | Un tag de Herdr cuyo schema tenga kind/metadata en `TabInfo`/`TabCreateParams`, o un issue/PR aceptado |
| U-10 | T-006 PD-A2-2 / H-A2-1 | por-definir / hipotesis | Semantica de foco y TUI para un tab sin panes. Hay pane `focused` para `explorerRoot`? | EXT-8, EXT-12; `server/src/workspace/files.ts:92` | Spec R-H5 o prueba contra un Herdr que implemente R-H |
| U-11 | T-006 H-A2-2 | hipotesis | `pane.layout`, viewport y `closeShortcutTarget` fallan con `pane_count: 0`? | `web/src/tabLayout.ts:8`, `web/src/tabShortcuts.ts:25` | Tests unitarios con un `Tab` sin panes |
| U-12 | T-006 H-A2-3 | hipotesis | mover: la seleccion vive en metadata de Herdr o local por `tab_id`? coexistir: dos instancias pierden estado visible? | `web/src/components/WorkspaceInspectorHost.tsx:266`; rama dev, d703e6f, 2026-10-07 | mover: depende de U-9. coexistir: prueba de doble instancia |
| U-12b | T-006 DP-A2-3 (antes PD-A2-3), DP-A2-4, DP-A2-5 | parametro de decision (CA-03 ajustado; no es estado de certeza) | Destino de las entradas en coexistir; tipado de `files` en mover; sub-vista de cambios | T-006 campo 8b; rama dev, d703e6f, 2026-10-07 | Decision de producto o diseno. No interviene en la no-estimabilidad de A2 |
| U-13 | T-007 H-B3 | hipotesis | El menu contextual se desplaza en el panel B? | `web/src/styles/layout/app.css:893` | Prueba con el panel acoplado a la derecha |
| U-14 | T-007 H-B1 | hipotesis | Dos instancias (Inspector-Files + panel) pierden estado visible? Solo aplica a coexistir | `web/src/components/FileExplorerDialog.tsx:504` | Test con dos `FileExplorerPanel` sobre la misma clave |
| U-15 | T-008 (este documento) | hipotesis | Los protocolos 14-20 que acepta el bridge (ademas del 22) emiten `tab.moved`, y suscribir un evento desconocido falla en esas versiones? | `server/src/bridge/protocol-compat.ts:1`, `server/src/bridge/protocol-compat.ts:14`; schema v0.9.0 l.4154 | Schema de Herdr de las versiones con protocolo 14-20, o prueba de `events.subscribe` con `tab.moved` contra esas versiones |
| U-16 | T-007 H-B2 | hipotesis | Una segunda instancia de `DiffViewerPanel` duplica peticiones git? (ligada a D-8) | `web/src/components/WorkspaceInspectorHost.tsx:841`, `web/src/App.tsx:2977` | Traza de RPC con panel e Inspector abiertos |
| U-17 | Seccion f, D-1..D-10 | parametro de decision (CA-03 ajustado; no es estado de certeza) | Ver la tabla de decisiones | T-007 campos 3, 4, 7 y 8b; rama dev, d703e6f, 2026-10-07 | Decision del dueno de producto al iniciar el work consumidor |

Cerrados en este documento: T-002 a12.1 (cerrado como `verificado` en la seccion c, conflicto 1). Los dos `por-definir` de T-004 ya los habia cerrado T-006 (verificado negativo hasta v0.9.3/HEAD).

Correccion E4 (H-5): se retira U-8. Las premisas P-1..P-4 de A1 no son incertidumbre de evidencia ni parametro de decision: definen la opcion evaluada y constan en SN-3. U-7, U-12b y U-17 usan la categoria "parametro de decision" de CA-03 ajustado. Esa categoria no es un estado de certeza y no bloquea la talla.
