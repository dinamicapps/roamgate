---
archivos:
  - accion: modificar
    ruta: web/src/store.ts
  - accion: modificar
    ruta: web/src/store.test.ts
  - accion: modificar
    ruta: web/src/components/WorktreeLifecycleDialog.tsx
cas:
  - CA-01
  - CA-02
  - CA-03
  - CA-04
ejecutor: atlas
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 001: Error real de Herdr en Worktree Lifecycle

Aplica la solucion acordada (ver ## Solucion del README): A (rethrow opcional), C (failureNotice en openWorktree*) y D2 (error capturado antes del refresh).

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-01 | Files/Changes/Remove/Open de una fila muestran el error real de Herdr en el detalle del dialogo |
| CA-02 | Un fallo de worktree.open produce un toast con el error real, tambien desde Open worktree |
| CA-03 | runOperation no pierde el error por el refresh |
| CA-04 | Los 37 llamadores de action() conservan su contrato (undefined sin rethrow) |

## Ejecutor: atlas

### Que hizo

- action() acepta rethrow opcional: registra error y notice como hoy y relanza; pausa -> 'Connection is paused'; lease muerto -> error explicito. Sin rethrow nada cambia.
- openWorktree/openWorktreeFromCwd aceptan {rethrow} y tienen failureNotice 'Failed to open worktree' como sus hermanos.
- WorktreeLifecycleDialog usa rethrow (Files/Changes/Remove/Open) y runOperation captura el error antes del refresh (D2).
- 4 pruebas rojo->verde en store.test.ts (incluido el control sin rethrow); store+worktreeLifecycle 92/0, web sin fallas nuevas, typecheck limpio, build 160/160.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Si la accion termina bien pero el lease murio, devuelve undefined aun con rethrow (store.ts:2039-2040) | El dialogo sale antes por operationIsCurrent(); sin efecto visible. Registrado en post-works | atlas |
| 2 | recordedError puede traer un state.error viejo cuando una accion devuelve undefined sin registrar nada (WorktreeLifecycleDialog.tsx:290-291); action() no limpia state.error al tener exito | Registrado en post-works | atlas |

## Verificador: quinn

### Que verifico

- CA-01/CA-03: en navegador, Open de una fila con worktree borrado muestra worktree_not_found: worktree cannot be opened en el detalle (CA-01-despues.png).
- CA-02: Open existing con la ruta borrada muestra el toast Failed to open worktree con el error real (CA-02-despues.png); antes era silencioso.
- CA-04: prueba de control fija que sin rethrow action() sigue devolviendo undefined y dejando state.error.

### Hallazgos de verificacion

(ninguno)
