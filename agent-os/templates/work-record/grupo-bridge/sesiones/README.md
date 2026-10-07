# Sesiones de prueba del grupo

Cada sesion es un evento acotado dentro del grupo con fases ISO-29119: plan -> ejecucion -> evidencia -> reporte.

## Convencion de nombres

`{YYYY-MM-DD}-{slug-corto}/` donde slug describe el objetivo (ej. `2026-04-19-smoke-ciclo-sus-aon`).

## Estructura de cada sesion

- `plan.md` - plan de prueba (checkpoints, CAs cubiertos, criterios)
- `ejecucion.md` - log de ejecucion con timestamps y evidencia de ambos lados
- `hallazgos.md` - hallazgos de la sesion (triage bloqueante vs propuesta)
- `reporte.md` - reporte de cierre con resultado y contratos propagados

## Gate de cierre de sesion

No se puede marcar sesion como `aprobada` si:
- Quedan bloqueantes en `abierto` o `en-resolucion` en `../hallazgos/bloqueantes.md`.
- No hay evidencia de ambos lados (director y colaborador(es)) en `ejecucion.md`.
- Hay contratos acordados pendientes de propagar al repo.
