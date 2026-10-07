# Abordaje — Entrada invariante de Alfred

## Proposito

Aterrizar la intencion del usuario en evidencia tangible **antes** de tocar codigo o destilar ruta. El abordaje es **invariante**: toda invocacion de `/alfred iniciar` arranca aqui (excepto `--desde-diseno`, que lo ejecuta comprimido — ver `fase-4-proponer.md`).

## Las 4 fases

```
/alfred "{prompt}"
   |
   Fase 1: Comprender objetivo (sin tocar codigo)        -> fase-1-comprender.md
   |
   Fase 2: Recolectar evidencia (subagentes paralelos     -> fase-2-recolectar.md
           + profundizacion adversarial bajo demanda)
   |
   Fase 3: Reconocer -- hacia afuera, luego confronta      -> fase-3-reconocer.md
           hacia adentro (LA UNICA CONDICIONAL: solo
           corre si lo que se pide no existe en el repo)
   |
   Fase 4: Proponer ruta (una de las rutas de la MATRIZ Tabla A)  -> fase-4-proponer.md
   |
   Usuario confirma -> la ruta gobierna el sub-flow
```

## Freno contra impulsividad

3 reglas duras auditables atraviesan las 4 fases. Detalle: `freno-impulsividad.md`.

1. Fase 1: solo conversacion (no grep, no Read del codebase, no Bash).
2. Fase 1 + Fase 2: solo lectura (no Edit, no Write sobre codigo del repo).
3. Fases 2, 3 y 4: toda afirmacion sustantiva lleva cita (`path:linea`, URL, doc, commit).

### Arbitraje con el MANIFIESTO

El freno NO contradice el MANIFIESTO (P1 Think Before Coding): la Fase 1 ES la
operacionalizacion de P1. Leer lo que el usuario cito (paths, docs, repos declarados)
SI es Fase 1; explorar el codebase por iniciativa propia NO lo es. P5 (Source-of-Truth
Hierarchy) se activa desde Fase 2, cuando la recoleccion de evidencia ya esta gobernada.

## Persistencia

El abordaje persiste **inline en el README del work-record** como bloque `## Abordaje (fecha)` + frontmatter `abordaje{}` + `ruta`. Cero archivos nuevos, cero carpetas nuevas. Excepcion: ruta `responder` no crea work-record (el abordaje vive solo en chat).

Schema de `abordaje{}` y `ruta`: ver `agent-os/templates/work-record/schema/abordaje.md` seccion "Abordaje (desde 2026-05-05)".

**El abordaje reemplazo a la Etapa 0 por completo (2026-07-14).** Lo que E0 producia
(los 5 ejes, el mermaid integrador, la cohesion bidimensional, la declaracion abstracta de
meta) ya lo cubrian el objetivo, la evidencia, los drifts y la ruta destilada del abordaje.
Lo ultimo que le quedaba —la pregunta del campo obligatorio de `investigacion`, el refinamiento
de la meta vaga, el hook de asociacion de items, y los pre-requisitos del repo (entorno de
ejecucion y patron de permisos)— vive ahora en Fase 2 y Fase 4. **La Etapa 0 no existe: el
modelo de etapas empieza en E1** (que a su vez solo corre en `investigacion` y `documentacion`).

### Abordaje interrumpido

El abordaje es EFIMERO hasta `work open`: si la sesion se interrumpe antes de que la
Fase 4 confirme la ruta (todavia no existe work-record), no persiste nada — la
siguiente invocacion de /alfred reinicia en Fase 1. Costo aceptado: re-conversar es
mas barato que arrastrar un abordaje a medias sin evidencia. Desde que el work-record
existe, la seccion `## Abordaje` del README es el estado durable: retomar = releerla
(no re-abordar; el re-abordaje es solo para drift posterior, ver "## Re-abordaje").

## Reconocimiento en curso

Un reconocimiento **sobrevive al abordaje**. Antes de arrancar Fase 1,
`agentos reconocimiento listar` devuelve los que estan en `{LISTO, EN_CURSO}` (cada uno con la
fila del plan que le toca) mas los `EN_RECONOCIMIENTO` que ya tienen plan o catalogo emitido —
estos ultimos marcados `"incompleto":true`: R4 nunca cerro, pero el barrido/confrontacion/plan ya
pagados no se pierden ni quedan invisibles (correccion I4 de la revision final de rama). Un
`EN_RECONOCIMIENTO` recien creado (sin nada emitido todavia) no aparece: ahi no hay nada que
retomar.

**Antes de leer la fila de cada entrada, correr `agentos reconocimiento sincronizar --slug
{slug}` sobre ella.** `sincronizar` es el UNICO camino por el que una fila llega a `cerrada` —
ni `/disenar` ni `work close` lo hacen por su cuenta, y `listar` no sincroniza antes de leer.
Sin este paso, `listar` puede seguir reportando `en_diseno`/`en_work` sobre una fila cuyo diseño
o work YA cerro: Alfred propondria retomar un artefacto terminado en vez de avanzar a la
siguiente etapa. Si `sincronizar` cierra la ultima fila pendiente, el reconocimiento entero
deriva a `CERRADO` y esa entrada deja de aparecer en la proxima `listar` — no hay nada que
proponer de ella.

La lectura de esa fila no es literal contra `estado`: cuando el
objeto trae `etapa_activable` (numero), esa es la fila que se puede arrancar — su `fila.estado`
en el JSON es `pendiente`, no `activable` (`activable` es derivado, nunca un valor guardado). Si
no trae `etapa_activable`, mirar `fila.estado` directo:

| Senal en la salida de `reconocimiento listar` | Que propone Alfred |
|---|---|
| `"incompleto":true` | **retomar Fase 3** (`fase-3-reconocer.md`) sobre ese slug: correr `reconocimiento validar --slug {slug}` para ver que falta y seguir R1-R4 desde ahi hasta poder cerrar con `transition --a LISTO` |
| trae `etapa_activable` | arrancar esa etapa (`reconocimiento etapa transition --n {etapa_activable} --a en_diseno\|en_work`) |
| `fila.estado == en_diseno` | **retomar el diseno** que registra `fila.produjo` — no abrir otro |
| `fila.estado == en_work` | **retomar el work** que registra `fila.produjo`; aqui no hay etapa siguiente |

## Re-abordaje

Cuando la ruta inicial resulta insuficiente y se dispara `/alfred reevaluar`, el abordaje se re-ejecuta con la evidencia ya recolectada + lo nuevo. Se agrega bloque `## Re-abordaje (fecha)` al README; el original NO se borra. Ver `piezas/reevaluacion.md`.
