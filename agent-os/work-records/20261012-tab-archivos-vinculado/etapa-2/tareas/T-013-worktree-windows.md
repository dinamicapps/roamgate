---
archivos:
  - accion: modificar
    ruta: web/src/worktreeLifecycle.ts
  - accion: modificar
    ruta: web/src/components/WorktreeLifecycleDialog.tsx
cas:
  - CA-25
depende_de:
  - T-012
ejecutor: atlas
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 7
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: null
---
# Tarea 013: Worktree Lifecycle en Windows

Verificando CA-25 en navegador (Herdr 0.9.1, Windows): en el dialogo Worktree Lifecycle, `Files` (y Changes/Remove) de un worktree cerrado falla con `Herdr opened the checkout without returning a workspace ID` (web/src/components/WorktreeLifecycleDialog.tsx:381) y no se abre ningun workspace. Ademas el checkout principal aparece dos veces (`\?\E:\...` y `E:/...`) y un worktree abierto se muestra como Closed. La CLI `herdr worktree open` si devuelve `result.workspace.workspace_id`. Previo al work; bloquea CA-25.

## Subtareas

1. Reproducir con evidencia cruda (respuesta del RPC del bridge y argumentos enviados).
2. Corregir la causa raiz (normalizacion de rutas de Windows o forma de la respuesta) sin cambiar Linux/macOS.
3. Pruebas que fijen el caso de Windows.

## Verificacion

1. Pruebas en verde; typecheck; build dentro de presupuesto.
2. Navegador: Files de un worktree cerrado abre su workspace y el tab de archivos de su consola (CA-25); filas sin duplicados y estado Open correcto.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-25 | La accion de archivos del ciclo de worktrees abre el tab de archivos | DEC_D3_quitar_files_inspector_view |

## Ejecutor: atlas

### Que hizo

- Causa 1: openWorktree elegia ruta o rama con startsWith('/'); C:/... viajaba como rama y Herdr respondia worktree_not_found, que el dialogo mostraba como sin workspace ID.
- Causa 2: el checkout llegaba como \\?\E:\... y E:/...; sin normalizar, el principal salia duplicado y los abiertos como Closed.
- normalizeCheckoutPath e isAbsoluteFilesystemPath comunes en filesystemPaths.ts; worktreeOpenLocator en worktreeLifecycle.ts usado por los dos metodos de store.ts.
- Anfitriona: pathBelowRoot quita el prefijo \\?\ y file.resolve devuelve relativa a la raiz una ruta absoluta dentro de ella (link E:\...\index.ts abre server/src/index.ts).
- Pruebas nuevas que fallan sin el arreglo; suite web sin fallas nuevas, server paths 20/20, typecheck y build 160/160.
- Navegador: Files de un worktree cerrado abre su workspace y su tab de archivos; el dialogo muestra 2 checkouts Open sin duplicados.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | workspaceResource.ts:131 y workspaceIdentity.ts:6 tienen normalizadores que no quitan \\?\ y generan claves persistidas | No se cambian para no invalidar preferencias guardadas; hoy comparan rutas de una sola fuente. Registrado en post-works | atlas |
| 2 | Archivos no declarados: filesystemPaths.ts(.test), store.ts, worktreeLifecycle.test.ts, file-paths.ts(.test), files.ts(.test) | Aceptados: normalizador comun y el mismo patron en la resolucion de links | amelia |
