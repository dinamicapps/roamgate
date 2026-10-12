# Evidencia UI - 20261012-tab-archivos-vinculado

Capturas tomadas con Playwright sobre la vista real (Vite dev en localhost:5174 contra el bridge de desarrollo y el Herdr 0.9.1 del usuario), viewport 1440x900 salvo mobile (390x844, `?layout=mobile`). Pantallas de prueba en los workspaces aislados `fm-prueba` y `fm-prueba2`, creados y cerrados en la sesion.

## Capturas por CA

| Archivo | CA | Que muestra |
|---|---|---|
| `CA-01-antes.png` | CA-01 | Inspector en Files antes de la extraccion N1 (baseline E3) |
| `CA-01-despues.png` | CA-01 | Inspector en Files tras N1: preview de README.md con pestana y modo compacto |
| `CA-09-despues.png` | CA-09 | Tab de archivos pegado a la derecha de su consola, sin numero, ocupando la superficie |
| `CA-11-despues.png` | CA-11 | Tab de `web` en la raiz git con `web/src` expandido tras mover el foco a otra consola (T-010) |
| `CA-13-despues.png` | CA-13 | Boton Files activo en la barra y tab de archivos con AGENTS.md restaurado tras recargar |
| `CA-22-despues.png` | CA-22 | Nav mobile con Files activo y el tab de archivos a pantalla completa |
| `CA-24-antes.png` | CA-24 | Inspector con Files, Changes, Commits y History (baseline E3) |
| `CA-24-despues.png` | CA-24 | Inspector con Changes, Commits y History; Changes del preview selecciona el archivo |
| `CA-10-despues.png` | CA-10 | Anotacion creada sobre una seleccion del preview de AGENTS.md, visible en Review feedback tras cambiar de consola |
| `CA-16-despues.png` | CA-16 | Open in Files desde Changes: Inspector cerrado y TabBar.tsx en el tab de archivos |
| `CA-25-despues.png` | CA-25 | Files de un worktree cerrado abre su workspace y su tab de archivos |
| `CA-25-lifecycle.png` | CA-25 | Worktree Lifecycle con 2 checkouts Open sin duplicados (T-013) |
| `CA-26-despues.png` | CA-26 | Changes con el diff real de TabBar.tsx (T-011) |

Segunda ronda (work reabierto): workspace aislado `fm-prueba3` y worktree `fm-prueba-wt`, creados y eliminados en la sesion; bridge en modo shared solo para CA-20 y en browser-local para el resto.

## Calidad UI (CU)

### Tab de archivos (desktop)
- CU-1: PASS — evidencia: boton Files, menu "Open files of this console", Ctrl+Alt+E, x del tab, Esc y Ctrl+Alt+W ejercitados en navegador; busqueda, arbol, pestanas de preview y boton Changes con handler real.
- CU-2: PASS — evidencia: estado vacio "Select a text file to preview" (CA-09-despues.png), exito con preview (CA-13-despues.png); cargando y error heredados de FileExplorerPanel/FilePreviewContent sin cambios; aviso "Cannot open Files yet" antes del primer snapshot.
- CU-3: DEGRADADO (sin standard frontend en agent-os/standards, senal DT emitida) — estilos co-locados segun CONTRIBUTING.md (FilesTabSurface.css, InspectorSplitResizer.css).
- CU-4: PASS — split arbol/preview alineado a ancho completo, sin desbordes ni solapes; filas del arbol con el ritmo del Inspector (CA-11-despues.png).
- CU-5: PASS (vista real: http://localhost:5174/ bajo el layout de la app).

### Barra de tabs con tab de archivos
- CU-1: PASS — evidencia: clic en el tab activa la superficie local, clic en la consola vuelve, x cierra solo el tab; Ctrl+1..9 salta el tab de archivos (prueba unitaria y navegador).
- CU-2: PASS — evidencia: tab activo e inactivo diferenciados; sin tab de archivos el strip no cambia.
- CU-3: DEGRADADO (sin standard frontend, senal DT emitida).
- CU-4: PASS — icono FolderTree y etiqueta alineados con los tabs de consola (CA-09-despues.png).
- CU-5: PASS (vista real: http://localhost:5174/).

### Inspector sin Files
- CU-1: PASS — evidencia: tabs Changes/Commits/History con flechas; boton Changes del preview abre el Inspector con el archivo seleccionado.
- CU-2: PASS — evidencia: lista "31 changed files" (exito); error del diff visible con "Retry" (H-E4-02, previo y fuera de alcance).
- CU-3: DEGRADADO (sin standard frontend, senal DT emitida).
- CU-4: PASS — tres tabs distribuidos sin hueco del tab retirado (CA-24-despues.png).
- CU-5: PASS (vista real: http://localhost:5174/).

### Nav mobile
- CU-1: PASS — evidencia: Files abre el tab y Terminal vuelve a la consola; active refleja la superficie (CA-22-despues.png).
- CU-2: PASS — evidencia: badge de tabs cuenta solo consolas.
- CU-3: DEGRADADO (sin standard frontend, senal DT emitida).
- CU-4: PASS con observacion — superficie sin borde ni radio como las demas vistas mobile; el strip no se desplaza al tab activo (FM-09, cosmetico).
- CU-5: PASS (vista real: http://localhost:5174/?layout=mobile).

### Worktree Lifecycle (accion Files)
- CU-1: PASS — evidencia: Files de un worktree cerrado abre su workspace y el tab de archivos; Open/Focus/Remove con handler real.
- CU-2: PASS — evidencia: estados Open y Linked correctos tras T-013 (CA-25-lifecycle.png); el estado de error se observo antes del arreglo y el mensaje no cambio.
- CU-3: DEGRADADO (sin standard frontend, senal DT emitida).
- CU-4: PASS — una fila por checkout, sin duplicados (CA-25-lifecycle.png).
- CU-5: PASS (vista real: http://localhost:5174/).

## Llegada

- Tab de archivos: barra de tabs -> boton Files (o clic derecho en una consola -> "Open files of this console", Ctrl+Alt+E, Actions -> "Open file explorer", menu del workspace -> "Browse files"). Verificada en navegador.
- Inspector sin Files: barra de tabs -> Inspector; o boton Changes del preview del tab de archivos. Verificada en navegador.
- Nav mobile: barra inferior -> Files / Terminal. Verificada en viewport 390x844.
