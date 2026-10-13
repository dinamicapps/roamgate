# Evidencia UI - 20261012-sidebar-riel-workspaces

Capturas tomadas con Playwright sobre la vista real (Vite dev en localhost:5174 contra el bridge de desarrollo en 8788 y el Herdr 0.9.1 del usuario), viewport 1440x900 salvo mobile (390x844). Conexion en navegacion local (`Default, Local, Connected`). Workspace de prueba `rail-prueba` (repo git del scratchpad con origin bare local) y su worktree `fair-spark-5854` creado por "New worktree…", ambos cerrados y borrados en la sesion; el foco de Herdr se restauro a AURORA.

## Capturas por CA

| Archivo | CA | Que muestra |
|---|---|---|
| `CA-01-antes.png` | CA-01 | Sidebar ampliado con el boton Collapse sidebar en el header de Workspaces |
| `CA-01-despues.png` | CA-01, CA-02 | Riel de 52 px: boton Expand, items ED y AU con punto de estado, AU activo |
| `CA-04-submenu.png` | CA-03, CA-04 | Submenu de AURORA abierto por click: el workspace y sus cuatro agentes, roamgate activo |
| `CA-04-elegir-agente.png` | CA-04 | Tras elegir broker-bridge en el submenu: tab activo broker-bridge y submenu cerrado |
| `CA-04-sub-submenu-worktree.png` | CA-02, CA-04 | rail-prueba fijado (pin, primero) con su worktree fair-spark-5854 abierto como sub-submenu |
| `CA-05-teclado.png` | CA-05 | Submenu de ED abierto con ArrowRight y foco en el agente tras ArrowDown (tras T-006) |
| `CA-06-menu-contextual.png` | CA-06 | ContextMenu de EME_DCOM abierto con Shift+F10 desde el item del riel |

Comprobaciones sin captura (medidas en el DOM durante la sesion): persistencia del riel tras recargar (`sidebarRail=true`), ancho previo 340 px restaurado al ampliar con el riel a 52 px y resizer inerte, Ctrl+Alt+B y Zen ocultan y vuelven al riel, mobile 390x844 sin riel ni boton aunque `sidebarRail=true`, layout `separate` intacto con agentes anidados en el submenu y panel Agents de vuelta al ampliar, hover abre y salir cierra tras el margen, click fija y click fuera cierra, clic derecho con mouse abre el ContextMenu.

## Calidad UI (CU)

### Riel de workspaces (desktop)
- CU-1: PASS — evidencia: botones Collapse/Expand, click, hover, teclado (flechas, Home/End, Derecha/Izquierda, Escape, Shift+F10) y clic derecho ejercitados en navegador con handlers reales.
- CU-2: PASS — evidencia: estados activo, fijado (pin), con y sin agentes ("no agents"), y riel vacio heredado del estado vacio del arbol; punto de estado con los colores de AgentStatusIcon.
- CU-3: DEGRADADO (sin standard frontend en agent-os/standards, senal DT emitida) — estilos co-locados segun CONTRIBUTING.md (WorkspaceRail.css) sobre los tokens existentes.
- CU-4: PASS — riel alineado con el panel del sidebar, items centrados, submenu con el estilo de los menus contextuales y acotado al viewport (CA-01-despues.png, CA-04-submenu.png).
- CU-5: PASS (vista real: http://localhost:5174/ bajo el layout de la app).

### Submenu flotante anidado
- CU-1: PASS — evidencia: elegir workspace, agente y worktree; sub-submenu por hover y por ArrowRight; Escape e Izquierda cierran un nivel y devuelven el foco.
- CU-2: PASS — evidencia: entrada activa marcada, worktree con chevron y aria-expanded, agentes con icono de estado.
- CU-3: DEGRADADO (sin standard frontend, senal DT emitida).
- CU-4: PASS — reusa ContextMenu.css; sub-submenu a la derecha de su entrada (CA-04-sub-submenu-worktree.png).
- CU-5: PASS (vista real: http://localhost:5174/).

## Llegada

- Riel: header de Workspaces -> boton Collapse sidebar (desktop). Expand sidebar arriba del riel lo amplia. Verificada en navegador.
- Submenu: hover o click sobre las iniciales de un workspace; teclado con Derecha/Enter desde el riel. Verificada en navegador.
- Mobile: no hay llegada al riel; el sidebar se ve como antes. Verificada en viewport 390x844.
