---
cas:
  - CA-01
  - CA-02
depende_de:
  - T-001
  - T-002
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 003: Matriz de estado T-EST

Producir la matriz T-EST de 10 piezas de estado con 6 columnas, a partir de las salidas de T-001 y T-002. Frente F1+F2.

## Subtareas

1. Para cada una de las 10 piezas, llenar propietario, clave/scope, duracion, sincronizacion entre pestanas del navegador, sincronizacion entre clientes y comportamiento al cambiar conexion/worktree/workspace.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: salidas de T-001 y T-002; web/src/workspaceResource.ts, web/src/components/fileExplorerResources.ts, web/src/tabPins.ts, web/src/tabLayout.ts, web/src/browserNavigation.ts, web/src/App.tsx (estado del Inspector).
- Entregable: `etapa-3/frentes/T-003-matriz-estado.md: tabla T-EST.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-02 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- T-EST en etapa-3/frentes/T-003-matriz-estado.md: 10 piezas obligatorias + 5 descubiertas x 6 columnas (90 celdas: 63 verificado, 25 inferencia, 1 hipotesis, 1 mixta).
- 167 citas verificadas ok; PD-1 y PD-2 sobre Herdr como por-definir secundarios con condicion de cierre.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | En modo shared abrir/cerrar el Inspector emite RPC de foco a Herdr (App.tsx:1829, :2200) y cambia el foco de todos los clientes | Insumo critico para fichas: sacar Files del Inspector puede o no conservar este efecto | mary |
| 2 | Una reconexion WS avanza la generacion y anula el estado del Inspector (App.tsx:2764-2771) | Insumo para persistencia de las fichas | mary |
| 3 | Cache de previews por workspaceId vs arbol por owner/checkout; al remover worktree quedan claves huerfanas | Registrado; candidato a fuera de alcance o a nucleo comun segun fichas | mary |

## Verificador: quinn

### Que verifico

- T-EST con 10 piezas obligatorias + 5 descubiertas x 6 columnas (CA-02): PASS.
- Celdas por-definir con pregunta bloqueada, fuentes y condicion de cierre.

### Hallazgos de verificacion

(ninguno)
