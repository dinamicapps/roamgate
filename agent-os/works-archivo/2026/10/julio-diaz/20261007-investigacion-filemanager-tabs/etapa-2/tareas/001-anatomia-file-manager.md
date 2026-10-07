---
cas:
  - CA-01
  - CA-07
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 001: Anatomia actual del file manager

Documentar como funciona hoy el file manager (vista Files del Workspace Inspector). Frente F1.

## Subtareas

1. Construir T-F1a puntos de entrada con sus filas minimas.
2. Construir T-F1b contrato backend (WS y HTTP) con sus filas minimas.
3. Construir T-F1c acoplamientos con el contenedor con sus filas minimas.
4. Registrar la seccion Fuera de alcance (CA-07) con cita.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: web/src/App.tsx, web/src/components/WorkspaceInspectorHost.tsx, web/src/components/FileExplorerDialog.tsx, web/src/components/fileExplorerResources.ts, web/src/workspaceResource.ts, web/src/styles/layout/app.css, server/src/workspace/*.ts, server/src/index.ts, server/src/connections/http-routing.ts.
- Entregable: `etapa-3/frentes/T-001-anatomia-file-manager.md: tablas T-F1a, T-F1b, T-F1c + Fuera de alcance.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-07 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- T-F1a (14 filas), T-F1b (11), T-F1c (13) y Fuera de alcance (3) en etapa-3/frentes/T-001-anatomia-file-manager.md; todas las filas minimas cubiertas.
- 219 citas verificadas ok sobre el archivo publicado.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Menu contextual position:fixed sin portal dentro de .workspace-stage con container-type: size (app.css:73); podria posicionarse relativo al stage y no al viewport | Registrado como hipotesis; no ejecutado en navegador. Riesgo a considerar en las fichas que cambien el contenedor | mary |
| 2 | La raiz del explorador sin worktree depende del cwd del pane enfocado en Herdr; puede cambiar con el foco | Insumo para T-003 (matriz de estado) y fichas | mary |
| 3 | En mobile el boton Terminal llama activateTerminalSurface, que cierra el Inspector (open:false), no solo cambia de vista | Insumo para flujos mobile (campo 6) de las fichas | mary |

## Verificador: quinn

### Que verifico

- Filas minimas de T-F1a, T-F1b y T-F1c clasificadas; Fuera de alcance con cita (CA-01, CA-07): PASS.
- Congruencia de citas por muestreo: sin incongruencias; FA-8 corregida con metodo de ausencia.

### Hallazgos de verificacion

(ninguno)
