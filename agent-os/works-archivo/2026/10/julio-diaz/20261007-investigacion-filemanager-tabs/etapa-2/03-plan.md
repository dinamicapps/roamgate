---
completedAt: "2026-10-07"
file_type: plan-etapa-2
inputDocuments:
  - etapa-1/01-discovery-investigacion.md
  - etapa-1/cas-cobertura-insumo.md
status: approved
---
# Plan de investigacion - Etapa 2

**Anfitrion**: Winston
**Fecha**: 2026-10-07
**Modo**: investigacion
**Nivel**: normal

Plan de ejecucion de los cinco frentes definidos en E1 (`etapa-1/cas-cobertura-insumo.md`). Cada tarea es un `frente-investigacion` que produce un entregable parcial en `etapa-3/frentes/`; la ultima consolida todo en `etapa-3/insumo-consolidado.md` para el work consumidor. No produce codigo: no aplican capa de seguridad, capa de datos ni gate de implementabilidad [RI].

## Decisiones tecnicas

| # | Decision | Valor final | Justificacion |
|---|----------|-------------|---------------|
| D1 | Viabilidad de Herdr adelantada | T-004 en la primera ola | Si A2 resulta `por-definir`, su ficha se reduce; saberlo antes evita trabajo especulativo |
| D2 | Persistencia de entregables | Parciales en `etapa-3/frentes/T-NNN-*.md`; consolidado en `etapa-3/insumo-consolidado.md` | Auditables por separado; el consumidor lee un solo documento |
| D3 | Paralelismo | Ola 1 {T-001, T-002, T-004}; ola 2 {T-003}; ola 3 {T-005, T-006, T-007}; ola 4 {T-008} | Respeta F1 -> F2 -> (F3 || F4) -> F5; sin entregables compartidos dentro de una ola |
| D4 | Verificacion de citas | `agentos citas verificar` al cerrar cada tarea | CA-01 se verifica incremental, no solo en E4 |
| D5 | CA-01 transversal | Marcado en todas las tareas | La regla de evidencia aplica a todo el insumo (observacion de Mary) |
| D6 | T-006 condicionada | No inicia sin veredicto de T-004; con `por-definir`, ficha parcial y talla `no-estimable` | Evita estimar A2 sin evidencia (CA-05) |

## Estructura de olas

### Ola 1: anatomia y viabilidad
T-001 file manager, T-002 tabs, T-004 viabilidad de Herdr. Independientes entre si.

### Ola 2: estado
T-003 matriz T-EST, sobre las salidas de T-001 y T-002.

### Ola 3: fichas de opcion
T-005 A1, T-006 A2, T-007 B, sobre T-003 (y T-004 para A2).

### Ola 4: comparativa
T-008 comparativa, nucleo comun, recomendacion e insumo consolidado.

## Cobertura CA -> tarea

| CA | Tareas |
|----|--------|
| CA-01 | T-001..T-008 |
| CA-02 | T-003 |
| CA-03 | T-005, T-006, T-007 |
| CA-04 | T-008 |
| CA-05 | T-004, T-006 |
| CA-06 | T-008 |
| CA-07 | T-001, T-008 |
| CA-08 | T-005 |
| CA-09 | T-005, T-006, T-007 |
| CA-10 | T-007 |

## Tareas

- T-001: Anatomia actual del file manager
- T-002: Anatomia actual de los tabs (cliente, bridge, Herdr)
- T-003: Matriz de estado T-EST
- T-004: Viabilidad de A2: acceso y extensibilidad de Herdr
- T-005: Ficha A1: tab virtual en cliente (mover y coexistir)
- T-006: Ficha A2: tab nativo de Herdr (mover y coexistir)
- T-007: Ficha B: panel independiente (mover y coexistir)
- T-008: Comparativa, nucleo comun, recomendacion e insumo consolidado

## Revision de Mary (cobertura vs CAs de E1) - 2026-10-07

Los 10 CAs quedan cubiertos. Observaciones aplicadas: CA-01 explicito en todas las tareas (D5); T-006 condicionada al veredicto de T-004 (D6).
