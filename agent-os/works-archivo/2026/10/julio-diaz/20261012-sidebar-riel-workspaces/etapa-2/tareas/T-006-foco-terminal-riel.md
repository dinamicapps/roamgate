---
archivos:
  - accion: modificar
    ruta: web/src/terminalFocus.ts
  - accion: modificar
    ruta: web/src/terminalFocus.test.ts
cas:
  - CA-05
depende_de:
  - T-004
ejecutor: amelia
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
# Tarea 006: La terminal no roba el foco del riel

Ajuste por brecha (reevaluacion camino c) detectado en la verificacion en vivo: con el riel, los frames de la terminal recuperan el foco a los ~30 ms de enfocar un item, y las teclas siguientes van a la terminal. `terminalFocus.ts` protege `.workspace-tree-panel` y `[role="menu"]`, no `.workspace-rail`.

## Subtareas

1. Prueba roja en terminalFocus.test.ts para `.workspace-rail`.
2. Agregar `.workspace-rail` a TERMINAL_FOCUS_OVERLAY_SELECTOR.
3. Repetir la verificacion de teclado en vivo comprobando el foco antes de cada tecla.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-05 | Navegacion por teclado en el sistema vivo |

## Ejecutor: amelia

### Que hizo

- Prueba roja en terminalFocus.test.ts: el riel debe bloquear el refoco de la terminal
- Se agrega .workspace-rail a TERMINAL_FOCUS_OVERLAY_SELECTOR (terminalFocus.ts) y al comentario que lista las superficies
- En vivo: el foco se queda 2 s en el item del riel; antes la terminal lo recuperaba a los ~30 ms

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Una tecla de prueba llego a la terminal antes del arreglo y recupero un prompt del historial del usuario sin enviarlo | Se aviso al usuario y desde entonces se verifica el foco antes de cada tecla; el prompt quedo vacio | quinn |

## Verificador: quinn

### Que verifico

- CA-05: con .workspace-rail en el selector, el foco se queda 2 s en el item del riel; antes la terminal lo recuperaba a los ~30 ms

### Hallazgos de verificacion

(ninguno)
