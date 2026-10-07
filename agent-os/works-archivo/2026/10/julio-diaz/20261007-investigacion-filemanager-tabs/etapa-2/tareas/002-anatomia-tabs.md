---
cas:
  - CA-01
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 002: Anatomia actual de los tabs (cliente, bridge, Herdr)

Documentar el ciclo de vida de los tabs y la frontera del modelo entre cliente, bridge y Herdr. Frente F2.

## Subtareas

1. Construir T-F2a operaciones del tab con sus filas minimas.
2. Construir T-F2b frontera cliente/bridge/Herdr con sus filas minimas.
3. Construir T-F2c diferencias shared vs browser-local con sus filas minimas.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: web/src/types.ts, web/src/store.ts, web/src/components/TabBar.tsx, web/src/components/MobileTabSheet.tsx, web/src/tabPins.ts, web/src/tabLayout.ts, web/src/tabShortcuts.ts, web/src/browserNavigation.ts, server/src/bridge/terminal-bridge.ts.
- Entregable: `etapa-3/frentes/T-002-anatomia-tabs.md: tablas T-F2a, T-F2b, T-F2c.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- T-F2a (18 filas), T-F2b (17) y T-F2c (9) en etapa-3/frentes/T-002-anatomia-tabs.md, con todas las filas minimas clasificadas.
- 112 citas verificadas ok; lo interno de Herdr marcado inferencia o por-definir, nunca verificado.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | La suscripcion de eventos (server/src/connections/runtime.ts:73) no incluye movimiento de tab; un reorden remoto llegaria solo por el poll de 5s | Fila por-definir con condicion de cierre; insumo para sincronizacion multi-cliente en las fichas | mary |
| 2 | El abordaje describia store.ts:2232 como push+poll; el push es handleHerdrEvent (store.ts:2212) que solo agenda refresh y el poll (store.ts:1539) es respaldo | Corregido en T-F2a; el README del abordaje no se reescribe, se registra como drift | mary |

## Verificador: quinn

### Que verifico

- Filas minimas de T-F2a, T-F2b y T-F2c clasificadas; lo interno de Herdr nunca como verificado (CA-01): PASS.
- Conflicto a12.1 vs tab.moved reconciliado en el insumo consolidado.

### Hallazgos de verificacion

(ninguno)
