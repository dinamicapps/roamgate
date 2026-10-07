# Ruta: acotado

> Feature pequena sin modelado. Usa las piezas compartidas plan -> ejecucion -> verificacion.

## Cuando aplica

El abordaje destilo: feature pequena (1-5 tareas), reusables claros, sin multi-actor, sin sistema externo nuevo no documentado. No necesita `/disenar`.

## Insumo

El bloque `## Abordaje` del README del work-record (evidencia + alcance ya confirmados en Fase 4). NO hay E0/E1 — el discovery fue absorbido por el abordaje.

## Sub-flow

```
abordaje (ya hecho) -> piezas/plan.md -> piezas/ejecucion.md -> piezas/verificacion.md
```

1. **Plan** (`piezas/plan.md`): Bob materializa tareas leyendo el `## Abordaje`. Winston entra solo si hay tradeoff arquitectonico real. Sentinel preanuncia capa de seguridad donde aplica; Dexter capa de datos si toca persistencia; Cipher capa criptografica si toca firma, llaves, cifrado o credenciales (declara `capa_seguridad.dominios: ["cripto"]` en las tareas que la tocan). **Excepcion — caso modelo de pruebas:** si el abordaje enruto la intencion de fundar/reforzar el modelo de pruebas de reglas, quien funda el work es **Quinn `[MP]`** (no Bob) y coordina la Etapa 3. <!-- FUENTE: agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md + agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md. NO duplicar -- editar la fuente. -->
2. **Ejecucion** (`piezas/ejecucion.md`): Amelia (normal) o Atlas (multi-capa; o el flujo `rediseno-ui`) con TDD.
3. **Verificacion** (`piezas/verificacion.md`): Quinn, dos fases, CS-N/CD-N/CR-N donde aplican.

## Reevaluacion

Caminos (a)/(b)/(c)/(d). NO (e) — no hay brief de diseno. Ver `piezas/reevaluacion.md`.

## Work-record

Se crea con frontmatter `ruta: acotado`, `modo` destilado del abordaje, `abordaje{}` poblado, `meta` destilada. Formato compartido con Work (`agent-os/templates/work-record/`). Ver `gestion/readme.md`.
