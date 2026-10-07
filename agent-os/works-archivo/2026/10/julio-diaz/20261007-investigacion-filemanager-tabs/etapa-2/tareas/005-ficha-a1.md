---
cas:
  - CA-01
  - CA-03
  - CA-08
  - CA-09
depende_de:
  - T-003
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 005: Ficha A1: tab virtual en cliente (mover y coexistir)

Producir la ficha de 9 campos de A1 en variantes mover y coexistir, mas T-F3 operaciones del strip. Frente F3.

## Subtareas

1. Llenar los 9 campos de la ficha por variante.
2. Construir T-F3 cubriendo todas las operaciones de T-F2a.
3. Derivar la talla con la regla de dos pasos de CA-03.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: salidas de T-001, T-002 y T-003; web/src/components/TabBar.tsx, web/src/components/FilePreviewTabs.tsx, web/src/App.tsx.
- Entregable: `etapa-3/frentes/T-005-ficha-a1.md: ficha A1 (mover/coexistir) + T-F3.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-03 | Mary (E1) |
| CA-08 | Mary (E1) |
| CA-09 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- Ficha A1 (mover/coexistir) en etapa-3/frentes/T-005-ficha-a1.md: talla L en ambas (solo cliente, >5 modulos), derivada de 5 premisas de modelado declaradas.
- T-F3 cubre 18/18 operaciones de T-F2a + 3 descubiertas; 109 citas ok.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Con el tab Files activo, tab.close (Ctrl+Alt+W) calcula el destino con el tab Herdr enfocado oculto y cerraria un tab o pane no visible (App.tsx:3147, :3158) | Riesgo registrado en la ficha; insumo para T-008 | mary |
| 2 | Pin virtual incompatible con tabPins.v1 (forgetClosedTabPins borra ids no listados por Herdr, tabPins.ts:155); id virtual en groupOrder rompe tabMoveInsertIndex | Contratos nuevos K1-K7 declarados en la ficha | mary |
| 3 | Tres decisiones de producto abiertas (DP-1..DP-3), p. ej. si Files cuenta en el strip mobile con un solo tab Herdr | Registradas por-definir para el work consumidor | mary |

## Verificador: quinn

### Que verifico

- Ficha A1 con 9 campos en ambas variantes y T-F3 completa (CA-03, CA-08, CA-09): PASS tras correccion H-1/H-2/H-4/H-7.
- Talla L en todas las alternativas de sus parametros de decision.

### Hallazgos de verificacion

(ninguno)
