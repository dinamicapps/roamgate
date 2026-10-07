# Borrador E1 (Discovery) — work 20261007-investigacion-filemanager-tabs — v4 final (tras ronda 3)

Repo: E:\DinamicAPPS\github\roamgate (cliente web React 19 + Vite + TS para Herdr, multiplexor de terminales en servidor; backend Node/TS en server/).
Work-record: agent-os/work-records/20261007-investigacion-filemanager-tabs/README.md (meta, abordaje con evidencia citada).

## Meta (invariante del work)

Insumo persistido que documenta el funcionamiento actual de file manager y tabs con citas path:linea, y un analisis de brechas comparado de las opciones A (tab) y B (panel independiente) con cambios requeridos, riesgos, impacto mobile/persistencia, esfuerzo estimado y recomendacion, suficiente para que un work de implementacion arranque sin re-investigar.

consumido_por: futuro work de implementacion (diseno/acotado) de la opcion elegida.

## Decisiones de alcance tomadas por el usuario

- A2 (tab nativo de Herdr): verificar viabilidad (codigo/spec accesible, punto de extension); si no verificable, marcar "por definir".
- Coexistencia: evaluar "mover Files fuera del Inspector" vs "coexistir" como subdecision de cada opcion.
- Capacidades faltantes del file manager (renombrar/mover/mkdir/editar): fuera de alcance, solo registrar.

## Regla transversal de evidencia (aplica a TODO el insumo)

Toda afirmacion del insumo lleva un estado de certeza:
- `verificado` — con cita path:linea (codigo del repo) o URL/commit (Herdr u otra fuente externa). Verificable con `agentos citas verificar`.
- `inferencia` — deducida de afirmaciones verificadas; cita las afirmaciones de las que deriva.
- `hipotesis` — no verificada; declara que evidencia la confirmaria o refutaria.
- `por-definir` — no verificable con las fuentes disponibles (tipico de Herdr si no hay codigo/spec accesible).

Ninguna estimacion, riesgo, descarte o recomendacion puede apoyarse solo en `hipotesis`/`por-definir` sin declararlo.

Toda afirmacion `hipotesis` o `por-definir` registra obligatoriamente: pregunta bloqueada; fuentes revisadas (rutas/URLs) con fecha y ref/commit/version; condicion de cierre (que evidencia la resolveria y donde conseguirla). `hipotesis` ademas enlaza la evidencia confirmatoria exigida.

## Filas minimas obligatorias (cobertura sustantiva)

Derivadas de la evidencia del abordaje. Cada fila minima debe aparecer clasificada como `cubierta`, `no-aplica` (con razon) o `por-definir`; se pueden agregar filas descubiertas.
- T-F1a (puntos de entrada): atajo files.toggle; atajo inspector.toggle; paleta de comandos; boton Files de navegacion mobile; arbol de workspaces "Browse files"; "Browse files at agent CWD"; links de archivo desde terminal; abrir archivo desde Changes; abrir archivo desde paleta.
- T-F1b (contrato backend): WS file.list, file.read, file.search, file.resolve, file.reveal; HTTP download, upload, delete; scope filesystem (FilesystemBrowser).
- T-F1c (acoplamientos con el contenedor): montaje oculto con display:none al cerrar (sigue montado); dimensiones min/max y dock right/bottom; overlay absolute en stage <1000px; modo expandido; modo compact <640px (arbol o detalle); z-index del slot y del menu contextual sin portal; foco al abrir y devolucion de foco al cerrar; teclado (atajos, Esc no cierra, ArrowDown tab->arbol); visibilidad mobile (mobileView/visible).
- T-F2a (operaciones del tab): crear, activar/focus, cerrar (con guard y pins), renombrar, reordenar, pin/unpin, atajos de tab, menu contextual, long-press, MobileTabSheet, refresh/restauracion al recargar, sync push+poll.
- T-F2b (frontera cliente/bridge/Herdr): que guarda Herdr (tabs, labels, orden, panes, layout); que guarda el cliente (pins en localStorage, cache de geometria en memoria, borradores del composer, viewport); que hace el bridge (validacion de tab.create, gating por version de protocolo de tab.move, modos de navegacion); canal de eventos push y refresh.
- T-F2c (shared vs browser-local): foco del tab (compartido vs por navegador); activacion (workspace.focus+tab.focus vs navigateBrowser); creacion (focus:false y browser_source en browser-local); proyeccion de layout/panes del tab activo; que sigue compartido en ambos modos (lista, nombres, orden).
- T-EST (piezas de estado): ver lista de 10 piezas en su definicion.
- Vistas del Inspector (ficha B y fichas con variante mover): Files, Changes, Commits, History.

## Frentes, orden y salidas consumibles

Orden: F1 -> F2 -> (F3 || F4) -> F5. F3 y F4 consumen las salidas de F1 y F2; F5 consume todas.

| Frente | Pregunta investigativa | Salidas que entrega (tablas) |
|---|---|---|
| F1 File manager hoy | Anatomia: montaje, puntos de entrada, contrato backend, acoplamientos con el Inspector. | T-F1a puntos de entrada (disparador, funcion, cita). T-F1b contrato backend (operacion, canal WS/HTTP, cita). T-F1c acoplamientos con el contenedor (tamano, z-index, foco, teclado, compact). |
| F2 Tabs hoy | Ciclo de vida cliente <-> bridge <-> Herdr; que del modelo vive en cliente vs Herdr; efecto de los modos shared/browser-local en foco y navegacion. | T-F2a operaciones del tab (crear, activar, cerrar, renombrar, reordenar, pin, atajos): donde vive, canal, cita. T-F2b frontera cliente/bridge/Herdr. T-F2c diferencias shared vs browser-local. |
| F1+F2 Matriz de estado | (Producida conjuntamente al cerrar F1 y F2.) | T-EST: por cada pieza de estado (1 arbol/cache explorer, 2 cache de previews, 3 ResourceFileTabs, 4 selection/activeFilePreview, 5 preferencias persistidas del Inspector (dock/size/view/expanded/ratios), 6 estado efimero de sesion del Inspector y retorno/foco (open, returnTabId, originPaneId, initialDirectory), 7 showHidden, 8 pins de tabs, 9 geometria por tab, 10 focus/navegacion shared vs browser-local): propietario, clave/scope, duracion (memoria/localStorage/Herdr), sincronizacion entre pestanas del navegador, sincronizacion entre clientes, comportamiento al cambiar conexion/worktree/workspace. |
| F3 Opcion A (tab) | A1: tab virtual en cliente mezclado en TabBar. A2: tab nativo Herdr. Viabilidad de A2 contra codigo/spec de Herdr. | Ficha de opcion A1 y A2 (formato abajo). T-F3 operaciones del strip para A1: por cada operacion de T-F2a (foco, cerrar, reordenar, pin, renombrar, atajos, menu contextual, long-press) -> aplicable/no aplicable/adaptada, destino del estado, evidencia. |
| F4 Opcion B (panel independiente) | Sacar Files del Inspector a una superficie propia; impacto en Changes/Commits/History. | Ficha de opcion B (formato abajo) + T-F4 vistas del Inspector: por cada vista (Files, Changes, Commits, History) destino, host, navegacion, foco y efecto mover/coexistir. |
| F5 Comparativa y recomendacion | Matriz A1/A2/B sobre las fichas; nucleo comun; recomendacion. | T-F5 matriz comparativa; T-NUC nucleo comun; recomendacion (formato CA-06). |

### Formato de ficha de opcion (A1, A2, B), cada una en variantes `mover` y `coexistir`

1. Superficie afectada: modulos/archivos, cada uno con cita.
2. Frontera tocada: cliente / bridge (server/) / Herdr.
3. Contratos que se tocan o se crean (tipos, RPC, eventos, claves de localStorage), con cita del contrato existente.
4. Cambios por archivo/modulo, cada uno clasificado como `confirmado` (necesario en ambas variantes), `condicional:{mover|coexistir}` o `hipotesis`.
5. Efecto sobre cada fila de T-EST (se mantiene / cambia de propietario/scope / se duplica / conflicto).
6. Flujos mobile: abrir, cambiar entre Files y terminal, cerrar, volver a terminal; destino de los controles existentes (MobileView "files", boton de nav mobile, TabBar oculto con un solo tab, MobileTabSheet).
7. Riesgos: cada uno con escenario concreto y estado de certeza.
8. Incertidumbre: lista de afirmaciones `hipotesis`/`por-definir` de la ficha.
9. Talla: derivada de 1-3 y 8 con la regla de CA-03.

## CAs de cobertura del insumo


- CA-01: T-F1a, T-F1b, T-F1c, T-F2a, T-F2b, T-F2c, T-EST y T-F4 existen; contienen todas las filas minimas obligatorias clasificadas (cubierta/no-aplica/por-definir); cada fila tiene estado de certeza; toda fila `verificado` pasa `agentos citas verificar`; toda fila `hipotesis`/`por-definir` tiene los campos obligatorios de la regla transversal.
- CA-02: T-EST cubre las 10 piezas de estado listadas en su definicion, con las 6 columnas llenas (o `por-definir` declarado con sus campos obligatorios).
- CA-03: Existen fichas A1, A2 y B, cada una en variantes mover y coexistir, con los 9 campos. La talla se deriva en dos pasos. Paso 1, estimabilidad: si alguna afirmacion `por-definir` o `hipotesis` afecta los campos 1-4 (superficie, frontera, contratos, cambios), la talla es `no-estimable` (resultado valido, distinto de talla) y se lista que la desbloquea. Paso 2, talla (solo si es estimable): S = solo cliente, <=2 modulos, sin contratos nuevos/modificados; M = solo cliente, 3-5 modulos o algun contrato cliente nuevo/modificado (tipo, clave localStorage, evento); L = cruza bridge o Herdr, o cambia un contrato RPC/protocolo, o solo cliente con >5 modulos o con cambio en el ciclo de vida de tabs/foco compartido. "Modulo" = archivo fuente (.ts/.tsx) en cualquier nivel bajo web/src, server/src o shared/; un componente cuenta junto con su CSS y sus tests como un solo modulo. Las hipotesis que solo afectan riesgos (campo 7) no impiden estimar; se listan en el campo 8. [Ajuste E4, 2026-10-07, aprobado por el usuario] Parametro de decision: una decision de producto pendiente (no una incertidumbre de evidencia) que afecta los campos 1-4 NO hace la talla `no-estimable`; se declara como parametro `DP-x` con sus alternativas y la talla se deriva por alternativa (p. ej. `M si DP-x=a; L si DP-x=b`). El paso 1 solo aplica a `hipotesis`/`por-definir` de evidencia. La categoria se aplica igual en las tres fichas y en T-F5.
- CA-04: T-NUC clasifica los cambios `confirmado` en: `comun-a-todas` (presente en todas las fichas elegibles, es decir no `no-estimable` ni descartadas con evidencia), `compartido-por:{subconjunto}` y `condicional:{variante}`; cada cambio referencia las fichas donde aparece. Solo `comun-a-todas` se presenta al consumidor como trabajo inevitable.
- CA-05: La ficha A2 declara, con URL/commit o con `por-definir`, si el codigo/spec de Herdr es accesible y si existe punto de extension para tabs no-terminal. La matriz T-F5 no compara cuantitativamente A2 ni la descarta salvo con evidencia `verificado` o `inferencia` sobre Herdr; si A2 es `por-definir`, la recomendacion lo dice explicitamente.
- CA-06: La recomendacion contiene exactamente: opcion elegida; variante (mover/coexistir); referencia a T-NUC; primer paso del work consumidor (que construir primero y con que entrada); por cada opcion no elegida, la razon citando filas de T-F5. Cada elemento con su estado de certeza.
- CA-07: Seccion "Fuera de alcance" con al menos: capacidades faltantes (rename/move/mkdir/editar), modal FileExplorerDialog sin uso, Esc no cierra el panel; cada uno con cita.
- CA-08: T-F3 existe para A1 y cubre todas las operaciones de T-F2a.
- CA-10: T-F4 cubre las 4 vistas del Inspector con destino, host, navegacion, foco y efecto mover/coexistir.
- CA-09: Cada ficha tiene el campo 6 (flujos mobile) con los 4 flujos y el destino de los 4 controles mobile listados.


## Invariantes que este discovery promete

- INV-1: Los frentes y sus salidas cubren todos los elementos de la meta (funcionamiento actual de ambos sistemas, brechas A y B, cambios, riesgos, mobile, persistencia, esfuerzo, recomendacion).
- INV-2: Cada CA se verifica por presencia/forma de tablas y campos enumerados, sin juicio subjetivo.
- INV-3: Ninguna afirmacion sobre Herdr se trata como `verificado` sin cita a su codigo/spec.
- INV-4: El work consumidor recibe opcion, variante, nucleo comun, primer paso y estado de estado (T-EST) sin re-investigar.
- INV-5: Las opciones se comparan con la misma ficha y la misma regla de talla.
