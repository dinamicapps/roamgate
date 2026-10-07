# Schema de frontmatter — Sesion grabada (corpus, indice, decisiones y hallazgos)

> Fragmento de `frontmatter-schema.md` (ver indice). Cinco artefactos de la ruta
> `documentacion` cuando el insumo es una capacitacion grabada: campos de apertura,
> indice de sesion, corpus de afirmaciones, decisiones de G2 y hallazgos del cliente.
> Son artefactos DISTINTOS, con momento de existencia y actor que escribe distintos —
> fundirlos es el error que esta version del diseno corrige.

## (a) Campos de apertura (frontmatter del work)

> FUENTE UNICA de `sesion_material_mpa`, `sesion_material_video`, `sesion_dominio_cruce`.
> Bloque opt-in en el frontmatter del work (`README.md`), horneado por `work open` cuando
> la variante de apertura es una sesion grabada. Planos y con prefijo `sesion_`, mismo
> precedente que `audiencia_documento`. Es lo unico de este schema que se sabe **antes**
> de abrir el work — (b) a (e) todavia no existen en ese momento.

| Campo | Tipo | Obligatorio | Nota |
|-------|------|-------------|------|
| `sesion_material_mpa` | string | si (si la variante aplica) | nombre del archivo `.mpa` |
| `sesion_material_video` | string | no | nombre del `.mp4`; ausente si no hay video |
| `sesion_dominio_cruce` | string | si (si la variante aplica) | dominio de `.documentacion/` contra el que se cruza |

Quien lo escribe: `work open`, a partir de lo declarado en el abordaje.
Quien lo consume: el gate G1 (que material rotular) y `sesion indexar`, que puebla (b) a partir de los mismos nombres.

## (b) Indice de sesion (`indice-sesiones.yml`)

> No vive en el frontmatter del work: vive en archivo propio `indice-sesiones.yml`, en
> el directorio del work-record. Lo escribe `sesion indexar`. Existe recien **despues**
> del gate G1: la autoridad de cada hablante es una decision humana que todavia no se
> tomo cuando el work se abre.

| Campo | Tipo | Obligatorio | Nota |
|-------|------|-------------|------|
| `id` | string | si | id corto de la sesion en el work (`S1`, `S2`) |
| `uuid` | string | si | el `metadata.id` del `.mpa`; identifica el material sin depender del nombre |
| `titulo` | string | si | |
| `fecha` | date | si | |
| `duracion` | string | si | `hh:mm:ss` |
| `material` | string | si | nombre del archivo, **nunca** una ruta absoluta de maquina |
| `hablantes[]` | lista | si | `{nombre, hablante_id, autoridad}`, `autoridad` en `fuente \| receptor` |

**Relacion (a)-(b):** `sesion_material_mpa` del frontmatter y `material` del indice
nombran el **mismo archivo**, pero se escriben en momentos distintos (apertura del work
vs. despues de G1) y por actores distintos (`work open` vs. `sesion indexar` mas el
humano que rotula). No son el mismo campo con dos nombres: uno es la promesa de
apertura, el otro es el registro posterior a la decision de autoridad.

**Invariante:** ningun elemento de `hablantes[]` puede quedar sin `autoridad`. Un
rotulado parcial deja afirmaciones de ese hablante sin forma de clasificarse en el
corpus (ver invariantes 1 y 2 mas abajo).

## (c) Corpus de afirmaciones (`corpus-afirmaciones.yml`)

> Archivo propio en el directorio del work-record. Lo produce la destilacion por
> ventanas. Consultable, no contexto: nada de este archivo se carga al abrir otro work
> (ver "Invariante de no-carga" abajo).

Campos:

- `id`, `texto` — identificador y frase textual de la afirmacion.
- `autoridad`: `fuente | receptor`
- `elevada_por_captura`: bool
- `tipo`: `capacidad-sistema | regla-negocio | flujo-operativo | vocabulario | ambiguo`
- `cubeta_receptor`: `solicitud | modelo-trabajo-cliente | falsa-afirmacion | comparacion-otro-sistema`
- `procedencia`: objeto `{sesion, t, hablante, requiere_captura, captura, brecha_captura}`
- `cruce`: objeto `{estado, contra, codigo, codigo_confirma}`, con `estado` en
  `confirma | agrega | matiza | contradice-fuerte | sin-cruce` y `codigo_confirma` en
  `si | no | indeterminado`
- `destino`: `doc | hallazgo | pregunta | descartado` (el enum **no** admite `standard`)
- `razon_destino`, `decision_g2`
- `seccion_destino`: string canonico `<ruta-relativa-al-repo>.md#<anchor>`. El anchor
  es obligatorio: una afirmacion aterriza en una seccion, no en un archivo entero. La
  ruta debe caer bajo exactamente un territorio declarado en
  `agent-os/conocimiento/territorios.yml`; si no, el anotado falla con
  `TERRITORIO_NO_DECLARADO`.

### Invariantes del corpus (verificadas mecanicamente en E4)

1. `capacidad-sistema` y `regla-negocio` exigen `autoridad: fuente`.
2. `cubeta_receptor` es obligatorio si y solo si `autoridad: receptor`.
3. `elevada_por_captura: true` exige `requiere_captura: true` y `captura` presente.
4. `requiere_captura: true` exige `captura` **o** `brecha_captura`, nunca ambos ni ninguno.
5. `destino: descartado` exige `razon_destino`.
6. `destino: doc` con `autoridad: receptor` exige `cubeta_receptor: modelo-trabajo-cliente` + `decision_g2` + `seccion_destino`.
7. `estado: contradice-fuerte` exige `decision_g2`.
8. `destino: doc` con `tipo` en (`capacidad-sistema`, `regla-negocio`) y `estado` en (`agrega`, `sin-cruce`, `contradice-fuerte`) exige `codigo_confirma: si`.

Estas ocho invariantes son de campo: se resuelven cruzando valores del corpus, sin leer
prosa. Son la base mecanica de los chequeos de E4; el chequeo en si (que corre cada uno,
quien lo produce) tiene su propia fuente unica y no se duplica aqui.

## (d) Decisiones de G2 (`decisiones-g2.yml`)

> Archivo propio en el directorio del work-record. Cada entrada es una decision humana
> tomada en el gate G2, con los dos lados que se confrontaron.

| Campo | Tipo | Obligatorio | Nota |
|-------|------|-------------|------|
| `id` | string | si | id de la decision; referenciada por `decision_g2` en el corpus y en hallazgos |
| `clase` | enum | si | `conflicto \| promocion` |
| `afirmacion_id` | string | si | `id` del corpus que origino la decision |
| `lado_a` | string | si | |
| `lado_b` | string | si | |
| `decision` | string | si | |
| `consecuencia` | string | si | |
| `fecha` | date | si | |

## (e) Hallazgos del cliente (`hallazgos-cliente.yml`)

> Archivo propio en el directorio del work-record. Es el destino de todo lo que **no**
> va a documentacion: las cuatro cubetas de receptor mas los cuatro desagues del flujo.

| Campo | Tipo | Nota |
|-------|------|------|
| `id` | string | |
| `clase` | enum | `solicitud \| modelo-trabajo-cliente \| falsa-afirmacion \| comparacion-otro-sistema \| pregunta-pendiente \| error-capacitacion \| capacidad-no-confirmada \| recomendacion-standard` |
| `afirmacion_id` | string | la afirmacion del corpus que lo origino, si aplica |
| `texto` | string | |
| `procedencia` | objeto | mismo shape que `procedencia` en el corpus |
| `decision_g2` | string | si paso por el gate y no se promovio |

Las cuatro primeras clases son las cubetas de `cubeta_receptor` del corpus. Las otras
cuatro son los desagues del flujo: preguntas que el gate no pudo responder, material
audiovisual que afirmo algo falso, capacidades que el humano creyo pero el codigo no
confirmo, y reglas que mereceran ser standard en un trabajo aparte (fuera de alcance de
esta ruta).

**Dos valores que se parecen y no son lo mismo:**

- `pendiente-confirmacion` es un valor de `razon_destino` **en el corpus**: por que se
  descarto una afirmacion.
- `pregunta-pendiente` es un valor de `clase` **en hallazgos**: que tipo de entrada es.

Una afirmacion descartada con `razon_destino: pendiente-confirmacion` genera una entrada
de hallazgo de `clase: pregunta-pendiente` que la referencia por `afirmacion_id`. No se
usa un valor donde va el otro: uno vive en el corpus y explica un descarte; el otro vive
en hallazgos y clasifica una entrada.

## Invariante de no-carga

Ningun skill, hook, tarjeta de etapa ni doctrina puede listar los artefactos **(b) a
(e)** de este schema como lectura obligatoria al abrir un work. Son consultables, no
contexto: se abren cuando alguien decide ir a buscarlos, no en cada arranque de sesion.

Los campos de apertura **(a)** son la excepcion: son contexto legitimo del work, porque
son su insumo declarado (que material se va a destilar), no el residuo de la sesion ya
destilada.
