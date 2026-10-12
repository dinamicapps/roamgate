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
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 7
file_type: tarea-etapa-2
standards_cargados: []
status: in_progress
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
