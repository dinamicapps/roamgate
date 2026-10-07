---
cas:
  - CA-01
  - CA-03
  - CA-05
  - CA-09
depende_de:
  - T-003
  - T-004
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 006: Ficha A2: tab nativo de Herdr (mover y coexistir)

Producir la ficha de 9 campos de A2 en variantes mover y coexistir, condicionada al veredicto de T-004. Frente F3.

## Subtareas

1. No iniciar sin veredicto de T-004.
2. Si T-004 es por-definir: llenar solo los campos estimables y dejar los demas `por-definir` con su rastro; talla `no-estimable`.
3. Si T-004 es verificado: llenar los 9 campos y derivar talla con la regla de CA-03.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: salida de T-004 y T-003; server/src/bridge/terminal-bridge.ts; fuentes de Herdr identificadas en T-004.
- Entregable: `etapa-3/frentes/T-006-ficha-a2.md: ficha A2 (mover/coexistir).`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-03 | Mary (E1) |
| CA-05 | Mary (E1) |
| CA-09 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- Ficha A2 (mover/coexistir) en etapa-3/frentes/T-006-ficha-a2.md: talla no-estimable en ambas, con requisitos R-H1..R-H6 sobre Herdr que la desbloquean.
- Cerrados los dos por-definir de T-004 como verificado negativo hasta v0.9.3 y HEAD 4e624cd5; 69 citas del repo ok.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Herdr ya emite tab.moved (schema v0.9.0 l.4154) y Roamgate no lo suscribe (runtime.ts:73); contradice la fila a12.1 de T-002 marcada por-definir | Reconciliar en T-008 (insumo consolidado); T-002 no se reescribe | mary |
| 2 | En v0.9.3 el contenido de un tab es solo un arbol BSP de panes; un tab Files exige cambio estructural en Herdr, y v0.9.2 retiro pane.graphics.* | Cota inferencia: si llega a ser estimable, A2 seria al menos L | mary |

## Verificador: quinn

### Que verifico

- Ficha A2 no-estimable solo por evidencia sobre Herdr; parametros de decision separados (CA-03, CA-05, CA-09): PASS tras correccion H-1.

### Hallazgos de verificacion

(ninguno)
