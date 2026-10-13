# Pendientes post-work

Hallazgos clasificados como **rumbo 2** durante el cierre de works completados. No fueron bloqueantes para cerrar el work, pero deberian resolverse pronto (dias/semanas tras el cierre).

Este archivo sobrevive al archivado de works individuales — es del proyecto, no del work.

## Procesamiento

Usar `/post-works revisar` para procesar items uno por uno: promover a un work nuevo (`/alfred "descripcion"`), descartar con razon, marcar resuelto, o dejar vivo.

Usar `/post-works status` para ver conteos y antiguedad agregada.

**El sistema NO procesa este archivo automaticamente.** Es responsabilidad del usuario invocar el comando cuando tenga capacidad.

## Estructura

| Campo | Significado |
|-------|-------------|
| `id` | Identificador del hallazgo (heredado del work origen, ej. `HG-T003-01`) |
| `resumen` | Descripcion corta futura-legible (sin nombres de expertos ni IDs efimeros) |
| `work_origen` | Slug del work donde se detecto |
| `volcado_en` | Fecha ISO `YYYY-MM-DD` del volcado al cierre del work |
| `prioridad` | `alta | media | baja | sin asignar` (estimacion del experto al clasificar) |
| `estado` | `pendiente | en-proceso | descartado | promovido-a-work | resuelto` |

## Tabla de pendientes

<!-- Cada nuevo item se agrega al final de la tabla. NO reordenar items existentes; el orden cronologico facilita auditoria. -->

| id | resumen | work_origen | volcado_en | prioridad | estado |
|----|---------|-------------|------------|-----------|--------|
| <!-- ejemplo: HG-T003-01 | Logging de auth poco granular para investigar fallos productivos | 20260502-mejoras-auth | 2026-05-02 | media | pendiente --> |
| FM-01 | Roamgate no suscribe el evento `tab.moved` de Herdr (`server/src/connections/runtime.ts:73`); un reorden de tabs hecho desde otro cliente tarda hasta el poll de respaldo de 5 s en verse | 20261007-investigacion-filemanager-tabs | 2026-10-07 | media | pendiente |
| FM-02 | Esc no cierra el panel de archivos del Inspector: solo el modal lo registra (`web/src/components/FileExplorerDialog.tsx:689`) y el panel pasa `showCloseButton=false` | 20261007-investigacion-filemanager-tabs | 2026-10-07 | baja | pendiente |
| FM-03 | Modal `FileExplorerDialog` sin importadores (codigo muerto, `web/src/components/FileExplorerDialog.tsx:108`) | 20261007-investigacion-filemanager-tabs | 2026-10-07 | baja | pendiente |
| FM-04 | Al remover un worktree quedan claves huerfanas de cache de previews (por workspaceId) y de preferencias del Inspector en localStorage | 20261007-investigacion-filemanager-tabs | 2026-10-07 | baja | pendiente |
| FM-05 | Hipotesis no probada en navegador: el menu contextual del explorador (`position:fixed`, sin portal) bajo `.workspace-stage` con `container-type: size` podria posicionarse o recortarse mal | 20261007-investigacion-filemanager-tabs | 2026-10-07 | media | pendiente |
| FM-06 | `git.diff_file` falla con "invalid Git patch size" en Windows (`server/src/workspace/git-diff.ts:408`): el script sh del diff no devuelve el tamano esperado; Changes no muestra diffs en este host | 20261012-tab-archivos-vinculado | 2026-10-12 | alta | resuelto (T-011, c408bf6) |
| FM-07 | Los links de archivo de la terminal (`file.resolve`, `web/src/components/TerminalView.tsx:375`) resuelven contra el pane enfocado del workspace y no contra la consola duena; deberian enviar `tab_id` como el tab de archivos | 20261012-tab-archivos-vinculado | 2026-10-12 | media | resuelto (T-012, de2b7c2) |
| FM-08 | `relativePathWithinCheckout` distingue mayusculas (`web/src/workspaceResource.ts:131-137`): en Windows una capitalizacion distinta entre Herdr y git deja el directorio inicial en la raiz | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-09 | Tab de archivos: en mobile el strip no se desplaza hasta el tab activo, y al abrir el foco de teclado queda en la primera fila y no en el directorio inicial | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-10 | Codigo muerto tras sacar Files del Inspector: prop `embedded` de DiffContentView sin llamador (`DiffContentView.tsx:826`, `diffContentState.ts:39-50`) y escritura legada de `workspaceInspectorFile:{owner}` al borrar un worktree (`web/src/App.tsx:2848`) | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-11 | La captura `roamgate-desktop-files` (`docs/SCREENSHOTS.md:281`) muestra Files dentro del Inspector; regenerarla con el tab de archivos | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-12 | Snapshots de Last step fallan en Windows con `ulimit: file size: cannot modify limit` (`server/src/workspace/git-diff.ts:441`); causa 20 fallas de `git-diff.test.ts` y rompe la vista Last step en este host | 20261012-tab-archivos-vinculado | 2026-10-12 | media | resuelto (20261012-bugfix-last-step-ulimit) |
| FM-13 | Normalizadores de checkout que no quitan el prefijo `\\?\` (`web/src/workspaceResource.ts:131`, `web/src/workspaceIdentity.ts:6`); generan claves persistidas, cambiarlos exige migrar preferencias | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-14 | Si el pane que imprime un link y el pane enfocado de su consola estan en repos distintos, el tab de archivos abre una ruta relativa a otra raiz (`web/src/App.tsx` handleTerminalWorkspaceFile) | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-15 | La cache positiva de links de terminal dura 30 s (`web/src/terminalFileLinks.ts:9`): tras un `cd` el mismo texto puede resolver al archivo del cwd anterior | 20261012-tab-archivos-vinculado | 2026-10-12 | baja | pendiente |
| FM-16 | El dialogo Worktree Lifecycle muestra "Herdr opened the checkout without returning a workspace ID" cuando Herdr devuelve un error: `action()` en `web/src/store.ts` se traga el error real | 20261012-tab-archivos-vinculado | 2026-10-12 | media | resuelto (20261012-bugfix-worktree-error-real) |
| FM-17 | git-snapshot.test.ts tiene 10 pruebas que no pueden pasar en Windows tal como estan escritas: symlinks sin privilegio, nombres con `"` y `\` invalidos en NTFS, chmod sin efecto, y los dos timeouts reales; deberian saltarse o adaptarse en win32 | 20261012-bugfix-last-step-ulimit | 2026-10-12 | baja | pendiente |
| FM-18 | El Git for Windows del host tiene `core.autocrlf=true` en `C:/Program Files/Git/etc/gitconfig` (y le faltan etc/fstab y etc/profile); explica 3 fallas de sparse-checkout en git-snapshot.test.ts:474. Configuracion del entorno, no del codigo | 20261012-bugfix-last-step-ulimit | 2026-10-12 | baja | pendiente |
| FM-19 | El update checker (`server/src/http/update.ts:160-189`) trata `0.7.15-dinamicapps.N` como menor que la `0.7.15` del upstream: en macOS/Linux ofreceria actualizar e instalar el upstream encima del fork. En Windows no aplica. Si el fork llega a otras plataformas: ROAMGATE_UPDATE_BASE_URL propio, ROAMGATE_DISABLE_UPDATE_CHECK=1 o build metadata | 20261012-dist-windows-roamgate | 2026-10-12 | media | pendiente |
| FM-20 | `scripts/prepare-release.ts:26,83-85` solo acepta versiones X.Y.Z y aborta con el sufijo del fork; el flujo de release del upstream no corre en este repo | 20261012-dist-windows-roamgate | 2026-10-12 | baja | pendiente |
| FM-21 | `build:windows-x64` (`package.json:41`) no tiene postbuild de limpieza de `*.bun-build`, a diferencia de linux y darwin | 20261012-dist-windows-roamgate | 2026-10-12 | baja | pendiente |
| FM-22 | `action()` (`web/src/store.ts`) no limpia `state.error` cuando una accion tiene exito: quien lea `state.error` tras un `undefined` puede ver un error viejo (p.ej. `WorktreeLifecycleDialog.tsx:290-291`, `WorktreeHooksDialog.tsx:98-101`). Revisar el patron `undefined` + `state.error` en los demas llamadores | 20261012-bugfix-worktree-error-real | 2026-10-12 | baja | pendiente |
| FM-23 | Crear un worktree desde Roamgate en navegacion local mueve el foco real de Herdr al workspace nuevo aunque el cliente envia `focus: false` (`web/src/store.ts:3214`; `server/src/worktree/worktree-hooks.ts:331` ya anota que Herdr muta el foco al crear) | 20261012-sidebar-riel-workspaces | 2026-10-12 | media | pendiente |
| FM-24 | `terminalComposer.test.ts` falla 9 pruebas ("terminal composer drafts") al correr `bun test web/src` completo, tambien en HEAD; aislado pasa 20/20: dependencia de orden entre archivos de prueba | 20261012-sidebar-riel-workspaces | 2026-10-12 | media | pendiente |
| FM-25 | Presupuesto de assets web sin margen: JS inicial 790,2 de 800 KiB (241,1 de 256 gzip) y 160 de 160 archivos (`scripts/check-web-assets.mjs:7-11`); la proxima feature eager lo rompe | 20261012-sidebar-riel-workspaces | 2026-10-12 | media | pendiente |
| FM-26 | Observado, sin investigar: el ContextMenu de un repo con un worktree git existente (creado por CLI, no abierto) no ofrecio "Open worktree…". Ademas, un worktree abierto fuera de Roamgate no se anida bajo su repo: el padre solo se registra al abrir o crear desde Roamgate (`server/src/worktree/parents.ts:48-91`) | 20261012-sidebar-riel-workspaces | 2026-10-12 | baja | pendiente |
| FM-27 | En Windows la tarea de Roamgate declara `roamgate.stdout.log`/`.stderr.log` (`server/src/config/service-definitions.ts:64-65`) pero su accion no redirige la salida: corriendo sin ventana (conhost --headless) no queda ningun log; diagnosticar exige `service run` en primer plano | 20261013-instalador-todo-en-uno | 2026-10-13 | media | pendiente |
| FM-28 | `herdr setup` rechaza `HERDR_SOCKET_PATH`/`HERDR_CLIENT_SOCKET_PATH` aunque traigan la ruta por defecto (`server/src/herdr/bootstrap.ts` assertManagedSetupAllowed); dentro de un pane de Herdr siempre vienen definidas, asi que el CLI y el boton web "Set up Herdr" fallan si Roamgate se lanzo desde una terminal de Herdr. install.ps1 lo esquiva quitandolas cuando son las de defecto | 20261013-instalador-todo-en-uno | 2026-10-13 | media | pendiente |
| FM-29 | `defaultSocketPath()` de `server/src/herdr/bootstrap.ts` usa `~/.config/herdr/herdr.sock` tambien en Windows (donde el pipe sale de %APPDATA%\herdr); hoy no rompe porque CLI y HTTP pasan su propio ping, pero cualquier llamador sin `ping` consultaria una ruta que no existe | 20261013-instalador-todo-en-uno | 2026-10-13 | baja | pendiente |
| FM-30 | `bun test server/src/config server/src/herdr` tiene 21 fallas en Windows tambien en HEAD (symlinks, preflight launchd, rutas Unix en findHerdrBinary/installVerifiedHerdr); deberian saltarse o adaptarse en win32 como FM-17 | 20261013-instalador-todo-en-uno | 2026-10-13 | baja | pendiente |

## Items archivados

<!-- Items con estado != pendiente se mantienen aqui para auditoria. NO se borran. -->

### Promovidos a work nuevo

<!--
- HG-T005-02: refactor capa servicios facturas. Promovido a 20260510-refactor-facturas el 2026-05-10. Razon: el alcance se hizo claro tras el work origen.
-->

### Descartados

<!--
- HG-T007-03: validacion de input en /api/legacy. Descartado el 2026-05-15 por Julio Diaz. Razon: endpoint deprecado, sera removido en v3.0.
-->

### Resueltos

<!--
- HG-T002-01: monitoreo de rate limit. Resuelto el 2026-05-20. Evidencia: implementado en commit abc1234 dentro del work 20260518-observabilidad.
-->

## Referencias

- Principio del huevo y rumbos: `agent-os/skills/host-protocol/SKILL.md` seccion "Principio del huevo y rumbos del hallazgo".
- Comando: `.claude/commands/agent-os/post-works.md`.
- Schema: `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Rumbos del hallazgo".
