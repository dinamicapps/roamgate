# Schema de frontmatter — Nucleo (campos comunes, modo, estados)

> Fragmento de `frontmatter-schema.md` (ver indice). Campos comunes a todo artefacto, el enum `modo`, el catalogo de `status` y los estados del work.

## Campos comunes (obligatorios en todos los artefactos)

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `status` | string | `pending`, `in_progress`, `done`, `done_con_brecha`, `deferido`, `complete`, `blocked`, `skipped` | Estado del artefacto |
| `completedAt` | string/null | `YYYY-MM-DD` o `null` | Fecha de completado |
| `inputDocuments` | array | rutas relativas al work-record | Artefactos de entrada que alimentaron este |

### Quien actualiza

- `status` y `completedAt`: work al cerrar la etapa (gate aprobado)
- `inputDocuments`: el agente que genera el artefacto

### Quien consume

- `/alfred continuar`: lee `status` para determinar donde retomar
- `/alfred maintain audit-tareas`: verifica consistencia entre `status` y contenido real
- `/alfred estado`: muestra progreso basado en `status`

## Campos especificos por artefacto

### Campo `archivos` (tarea, desde 2026-07-14)

Lista de archivos que la tarea va a crear o modificar. Opcional (works previos a
2026-07-14 no lo declaran; zero migracion).

| Sub-campo | Tipo | Obligatorio | Valores |
|---|---|---|---|
| `ruta` | string | si | ruta relativa al project-root |
| `accion` | enum | si | `crear` \| `modificar` |

**Quien lo declara:** Bob, al materializar la tarea en E2.
**Quien lo verifica:** Amelia con capacidad `[RI]`, antes de que abra E3 (regla dura).
**Para que sirve:** es la **exclusion mutua** que hace seguro el paralelismo. El anfitrion
de E3 solo despacha dos tareas a la vez si no comparten ninguna `ruta`. `depende_de` da el
ORDEN; `archivos` da la EXCLUSION MUTUA — son garantias distintas y ambas necesarias (dos
tareas sin dependencia entre si pueden tocar el mismo controller).

**Es una prediccion, no un hecho.** Bob lo declara sin haber tocado el codigo. El ejecutor
devuelve los archivos que REALMENTE toco; si divergen de lo declarado, eso es una senal de
drift que el anfitrion procesa con el arbol de reevaluacion — no un error.

<!-- FUENTE de la doctrina de despacho y de la regla de paralelizacion: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Orquestacion". Aqui se documenta la FORMA del campo. NO duplicar la regla — para modificar, editar la fuente. -->

### Campos de apertura de sesion grabada (`sesion_*`, desde 2026-08-06)

Bloque opt-in en el frontmatter del work (`README.md`), horneado por `work open` cuando
la variante de apertura es una capacitacion grabada (ruta `documentacion`). Schema
completo, incluidos el indice de sesion, el corpus de afirmaciones, las decisiones de G2
y los hallazgos del cliente: `./sesion.md`.

## Modo del work (enum de primera clase)

### README.md del work-record

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `modo` | string | `normal` \| `evolucion` (deprecado, legacy) \| `investigacion` \| `documentacion` \| `hotfix` | Modo del work. Define anfitriones por etapa, rosters y criterios de cierre. Detectado por el abordaje de `/alfred` (senales_por_modo del registry) y confirmado por usuario via AskUserQuestion. Default si no se detecta: `normal`. `evolucion` es un valor legacy — la ruta vigente para rediseno UI/UX es `rediseno-ui`; `evolucion` solo aparece en works activos abiertos antes de la migracion. `hotfix` es ortogonal (no se combina con los otros); se persiste en `modo` y el work-record NO usa el campo `ruta` (ver nota abajo). |
| `modo_senales` | array | palabras que matchearon | Lista de palabras de la descripcion que dispararon la deteccion del modo. Auditoria. |

**Significado por valor:**

- `normal` — work de desarrollo/refactor/fix con entregable de codigo. No hay Etapa 1: el discovery lo cubre el abordaje. Anfitriones default (Winston E2, Amelia/Atlas E3, Quinn E4).
- `evolucion` (deprecado, legacy) — rediseno evolutivo de UI/UX en works abiertos antes de la migracion a la ruta `rediseno-ui`. Descripcion del modelo viejo (works legacy abiertos antes de 2026-05-05, cuando E1 corria en todos los modos): Sally entraba como invitada en E1, E2 y E4 con capacidades LE/VE. Works `evolucion` nuevos no se abren (modo deprecado); si hipoteticamente se abriera uno hoy, seguiria el mismo modelo que `normal` (sin E1).
- `investigacion` — entregable es conocimiento (analisis de opciones, research) consumido por otro work posterior. Mary anfitriona de E3.
- `documentacion` — entregable es prosa para humanos (manual, documentacion tecnica). Paige anfitriona de E2 y E3.
- `hotfix` — respuesta a incidente con presion temporal real (demo, prod caida, cliente esperando). Atlas conductor unico, bitacora cronologica plana (maestra + frentes), pausa work activo, filtros Sentinel/Quinn/Cipher obligatorios. Ortogonal a los demas modos: NO se combina con ellos.

**Nota sobre `hotfix` (ruta-y-modo):** en el flujo de Alfred, `investigacion`, `documentacion` y `hotfix` son simultaneamente nombre de **ruta** (lo que el abordaje destila) y valor de **modo** (lo que parametriza las piezas) — coinciden por diseno. La diferencia: `investigacion`/`documentacion` se persisten en el campo `ruta` Y `modo`; `hotfix` se persiste SOLO en `modo` (su work-record no usa el campo `ruta`). Las demas rutas canonicas (`responder`, `bugfix`, `acotado`, `diseno`, `rediseno-ui`) usan el campo `ruta` con su propio valor de `modo` (tipicamente `normal`; `evolucion` solo en works legacy de rediseno UI).

**Legacy:**

Works anteriores a esta feature pueden tener:
- Ausencia del campo `modo` → se interpreta como `normal`.
- `modo_evolucion: true` + `modo_evolucion_senales: [...]` (flag booleano antiguo) → se interpreta como `modo: evolucion` (legacy) con `modo_senales` equivalente. No se migra masivamente; se lee por adaptador.


## Valores de status

| Valor | Significado |
|-------|-------------|
| `pending` | Artefacto creado pero no completado |
| `in_progress` | Artefacto en proceso de elaboracion |
| `complete` | Artefacto terminado y aprobado en gate |
| `done` | Tarea completada cumpliendo su meta sin brecha medible (sinonimo de `complete` para tareas) |
| `done_con_brecha` | Tarea completada con limitacion conocida y documentada (ver `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Status nuevos en tareas") |
| `deferido` | Tarea pospuesta conscientemente con riesgo aceptado (ver `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Status nuevos en tareas") |
| `done_verificacion_diferida` | Tarea completada sin brecha de meta, con comprobacion pospuesta por bloque `verificacion_diferida{}` valido. Horneado por el runtime; no es pedible via `work tarea ejecutor` <!-- FUENTE: agent-os/templates/work-record/schema/verificacion-diferida.md seccion "El bloque". Aqui solo el valor del enum; la regla de derivacion vive alla. NO duplicar la regla — para modificar, editar la fuente. --> |
| `blocked` | Tarea no puede continuar por dependencia externa o tecnica; espera resolucion |
| `skipped` | Artefacto omitido con justificacion documentada |

## Estados del work (campo `Estado` en README.md)

Distinto de los `status` de artefactos. Aplica al work completo. El campo del frontmatter es `estado` (minuscula); la linea display del cuerpo del README (`- **Estado**: VALOR` o el bloque `> Estado: **{VALOR}** · ...`) se deriva de ese campo y no se edita independientemente.

### Estados activos (works iniciados desde 2026-04-23)

| Estado | Significado | Cuando aplica |
|--------|-------------|---------------|
| `EN_PROGRESO` | Work activo en alguna etapa | Por defecto al crear |
| `PAUSADO` | Work suspendido temporalmente con razon | Via `/alfred pausar` |
| `EN_PAUSA` | Reevaluacion pendiente de input del usuario | Via `/alfred reevaluar` cuando usuario no responde |
| `EN_PAUSA_POR_DISENO` | Work pausado tras emitir un hallazgo al diseno origen; espera resolucion en `/disenar`. Es el camino (e) de reevaluacion expuesto como transicion | Via `/alfred retroceder-a-diseno` cuando el work tiene `diseno_origen` |
| `PRE_CIERRE` | E4 cerrada, esperando revision QA externa en Zoho. Quinn sigue anfitriona. No acepta pausa/agregar items. Sale por cierre (`COMPLETADO`/`COMPLETADO_CON_BRECHA`/`CANCELADO`) o degrada a `EN_PROGRESO` cuando QA rechaza items (via `work transition`) | Cierre de E4 con items Zoho asociados (via skill zoho-sprints-integration) |
| `COMPLETADO` | Meta vigente alcanzada, verificada por Quinn en Etapa 4 | Cierre normal de work |
| `COMPLETADO_VERIFICACION_DIFERIDA` | Meta cumplida entera; comprobacion pospuesta por bloque `verificacion_diferida{}` valido en README y/o tarea. Horneado por el runtime; no es pedible directamente <!-- FUENTE: agent-os/templates/work-record/schema/verificacion-diferida.md seccion "Derivacion: bloque fuente, estado/status proyeccion". Aqui solo el valor del enum; la regla de derivacion vive alla. NO duplicar la regla — para modificar, editar la fuente. --> | Cierre con `--estado COMPLETADO` cuando existe un bloque valido |
| `COMPLETADO_CON_BRECHA` | Usuario acepto brecha entre meta original y resultado, meta ajustada en `meta_revisiones[]` | Cierre tras aplicar camino (c) de reevaluacion |
| `REPLANTEADO` | Drift total durante el work, archivado, work nuevo abierto bajo idea general | Cierre tras aplicar camino (d) de reevaluacion |
| `TRASLADADO_A_DISENO` | Work-record de ruta `bugfix` que excedio scope focal y fue trasladado a `/disenar` + `/alfred iniciar --desde-diseno`. Estado terminal | Ver `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Optimizacion bugfix+desarrollo" (campos `trasladado_a`/`trasladado_en`/`trasladado_razon`) |
| `CANCELADO` | Work abandonado sin completar | Decision explicita del usuario |
| `MIGRADO` | Work migrado a otra estructura/proyecto | Casos legacy |

### Estados legacy (works iniciados antes de 2026-04-23, sin meta como invariante)

Estos estados existen para soportar works abiertos antes de la introduccion del modelo de meta. NO usar en works nuevos.

| Estado legacy | Significado | Equivalente en modelo nuevo |
|---------------|-------------|------------------------------|
| `VERIFICACION_PENDIENTE` | Pruebas no ejecutables al cierre, razon documentada, work en pausa | Equivalente a `EN_PAUSA` con razon "verificacion no ejecutable" |
| `COMPLETADO-SIN-PRUEBAS` | Usuario confirmo explicitamente cierre sin pruebas (doble confirmacion) | Equivalente a `COMPLETADO_CON_BRECHA` con brecha "verificacion saltada" registrada en `meta_revisiones[]` |

**Para works activos en estos estados:** se mantienen como historico inmutable. Si un work legacy se reactiva, primero `/alfred maintain audit-tareas` propone migrarlo al modelo nuevo declarando meta retroactiva (opcional).

**Para works nuevos:** Quinn en E4 NO ofrece estos estados como opcion. Los caminos son siempre alguno de los activos (incluyendo `COMPLETADO_CON_BRECHA` si hay brecha).

