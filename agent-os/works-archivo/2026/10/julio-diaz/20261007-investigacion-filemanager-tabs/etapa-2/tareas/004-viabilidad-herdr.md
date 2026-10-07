---
cas:
  - CA-01
  - CA-05
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 004: Viabilidad de A2: acceso y extensibilidad de Herdr

Determinar si el codigo o la spec de Herdr son accesibles y si existe un punto de extension para tabs no-terminal. Frente F3.

## Subtareas

1. Buscar fuentes de Herdr (repositorio, docs del protocolo, paquetes, herdr.dev) y el contrato que usa el bridge (version de protocolo, metodos tab.*).
2. Emitir veredicto: verificado (con URL/commit) o por-definir (con pregunta bloqueada, fuentes revisadas con fecha y condicion de cierre).

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: https://herdr.dev, server/src/bridge/terminal-bridge.ts, server/package.json y dependencias, README.md, docs/ARCHITECTURE.md.
- Entregable: `etapa-3/frentes/T-004-viabilidad-herdr.md: veredicto de viabilidad con fuentes.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-05 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- Veredicto de viabilidad de Herdr en etapa-3/frentes/T-004-viabilidad-herdr.md: codigo y spec accesibles (github.com/herdrdev/herdr, Apache-2.0, schema protocolo 22).
- Contrato de tabs del bridge documentado (tab.* + eventos, gating por version); 37 citas del repo verificadas ok.
- Punto de extension para tabs no-terminal: verificado que no existe en protocolo 22 / plugin v1.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Roamgate fija Herdr 0.9.0 (protocolo 22) y el ultimo release es v0.9.3; lo verificado corresponde a v0.9.0 | Dos afirmaciones quedan por-definir con condicion de cierre: comparar schema y CHANGELOG v0.9.0..v0.9.3/HEAD | mary |
| 2 | TabCreateParams no admite kind ni metadata; no existe tab.report_metadata (solo pane/workspace) | Insumo directo para la ficha A2 (T-006) | mary |

## Verificador: quinn

### Que verifico

- Veredicto de viabilidad con URL/tag/linea contrastado contra el schema de Herdr v0.9.0 (CA-05): PASS.

### Hallazgos de verificacion

(ninguno)
