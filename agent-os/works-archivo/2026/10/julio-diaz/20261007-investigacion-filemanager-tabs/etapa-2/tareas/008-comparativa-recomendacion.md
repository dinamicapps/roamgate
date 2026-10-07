---
cas:
  - CA-01
  - CA-04
  - CA-06
  - CA-07
depende_de:
  - T-005
  - T-006
  - T-007
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 008: Comparativa, nucleo comun, recomendacion e insumo consolidado

Comparar A1, A2 y B, extraer el nucleo comun y emitir la recomendacion; consolidar el insumo final. Frente F5.

## Subtareas

1. Construir T-F5 matriz comparativa sobre las fichas (A2 sin comparacion cuantitativa si es no-estimable).
2. Construir T-NUC con la clasificacion comun-a-todas / compartido-por / condicional.
3. Redactar la recomendacion con los elementos exigidos por CA-06.
4. Consolidar todas las salidas en el insumo final, incluida la seccion Fuera de alcance.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes: salidas de T-001 a T-007.
- Entregable: `etapa-3/insumo-consolidado.md: insumo completo para el work consumidor.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-04 | Mary (E1) |
| CA-06 | Mary (E1) |
| CA-07 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- Insumo consolidado en etapa-3/insumo-consolidado.md (secciones a-i): T-F5, T-NUC (4 comun-a-todas, 10 compartido, 8 condicional), recomendacion B mover con primer paso N1.
- Conflictos de bitacora reconciliados (ambos compatibles); 105 citas del repo ok; 9 decisiones D-1..D-9 para el consumidor.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | citas verificar solo confirma que la linea existe porque el fragmento se toma de la misma linea; no valida que la linea sostenga la afirmacion | Quinn en E4 debe muestrear contenido de citas, no solo su existencia | mary |
| 2 | La talla M de B coexistir (T-007) probablemente esta subestimada: no cuenta el doble escritor de ResourceFileTabs | Nota en F5-12 sin re-estimar; no afecta la variante recomendada | mary |

## Verificador: quinn

### Que verifico

- T-F5, T-NUC (6/8/9) y recomendacion con los elementos de CA-06 (CA-04, CA-06, CA-07): PASS tras correccion H-3/H-5/H-8/H-9.
- Hallazgos MENOR N-1..N-5 remitidos a curaduria de rumbos; no cambian la recomendacion.

### Hallazgos de verificacion

(ninguno)
