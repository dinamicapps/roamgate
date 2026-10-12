# Evidencia UI - 20261012-bugfix-worktree-error-real

Capturas con Playwright sobre la vista real (Vite dev en localhost:5174, bridge dev en modo browser-local, Herdr 0.9.1 en Windows). Escenario aislado: repo git temporal `wt16` con un worktree `rama-borrada` cuya carpeta se borro, para que Herdr rechace abrirlo (`worktree_not_found: worktree cannot be opened`). Todo creado y eliminado en la sesion.

## Capturas por CA

| Archivo | CA | Que muestra |
|---|---|---|
| `CA-01-despues.png` | CA-01, CA-03 | Worktree Lifecycle: Open de la fila prunable muestra "Opening worktree / worktree_not_found: worktree cannot be opened" (antes: mensaje generico) |
| `CA-02-despues.png` | CA-02 | Open existing con la ruta del worktree borrado: toast "Failed to open worktree" con el error real (antes: sin ningun rastro) |

## Calidad UI (CU)

### Dialogo Worktree Lifecycle y Open Worktree
- CU-1: PASS — evidencia: Open de la fila y submit de Open existing ejercitados con un rechazo real de Herdr.
- CU-2: PASS — evidencia: estado de error visible en el detalle de la operacion y en el toast; el mensaje "without returning a workspace ID" queda solo para exito sin ID.
- CU-3: DEGRADADO (sin standard frontend en agent-os/standards, senal DT emitida). Sin cambios de estilos.
- CU-4: PASS — sin cambios de layout.
- CU-5: PASS (vista real: http://localhost:5174/).

## Llegada

- Menu del workspace -> Worktree lifecycle... -> fila del worktree -> Open; y Open existing -> ruta -> Open. Verificada en navegador.
