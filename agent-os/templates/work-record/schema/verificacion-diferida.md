# Schema de frontmatter — Verificacion diferida

> Fragmento de `frontmatter-schema.md` (ver indice). FUENTE UNICA del bloque `verificacion_diferida{}`,
> su derivacion de estado/status, los cuatro guards asociados y el libro-mayor
> `agent-os/verificaciones/ledger.md`. Cualquier mencion a este contrato en otro schema (`nucleo.md`,
> `cierre-guards-diseno.md`) es un puntero — el detalle vive aqui.

## Por que existe

Un work puede entregar exactamente lo prometido y aun asi no poder comprobarlo en el ambiente de
trabajo: el conector solo existe contra el ERP productivo, el dato solo aparece en produccion, el
evento de negocio solo ocurre en cierre de mes. Cerrar eso como `COMPLETADO` a secas afirma mas de
lo que se sabe (MANIFIESTO P8, Honestidad Epistemica). Cerrar como `COMPLETADO_CON_BRECHA` confunde
dos cosas distintas: "no entregamos todo" y "entregamos todo pero no lo pudimos probar aqui".

El sistema separa dos ejes ortogonales:

| Eje | Pregunta | Donde vive |
|---|---|---|
| **Meta** | se entrego lo que se prometio | `estado` del work / `status` de la tarea |
| **Verificacion** | se pudo comprobar aqui | bloque `verificacion_diferida{}` |

El bloque es la fuente; el estado/status derivado es su proyeccion. Nunca se escribe el estado
diferido a mano.

## El bloque `verificacion_diferida{}`

Vive en el README raiz del work, en el frontmatter de una tarea (`etapa-2/tareas/T-NNN-*.md`), o en
ambos a la vez. No hace falta duplicarlo en el README cuando el pendiente vive entero en una tarea:
el work-record es la unidad que se archiva, y un work con su unico pendiente en `T-004` sigue siendo
un work con comprobacion pendiente.

```yaml
verificacion_diferida:
  id: VD-01                            # unico dentro del work; lo hornea el runtime
  causa: solo-produccion
  razon: "El conector solo existe contra el ERP productivo; no hay sandbox."
  alcance: [T-004, T-007, CA-3]        # ids de tarea, ids de CA, o el literal `work`
  evidencia_sustituta:                 # que SI se comprobo en su lugar
    - "src/Erp/ConectorTests.cs:120"
  plan_confirmacion:
    como: "Ejecutar el flujo de despacho real y revisar el log de conciliacion"
    cuando: "primer cierre de mes tras el despliegue"
    revisar_el: "2026-09-01"
    responsable: "Julio Diaz"
  confirmado_por_usuario: true
```

### Campos y obligatoriedad

| Campo | Obligatorio | Descripcion |
|---|---|---|
| `id` | si, horneado | `VD-NN` correlativo, unico DENTRO DEL WORK (cuenta README + todas las tareas). Lo asigna el runtime; prohibido en el payload de entrada (ver "El `id` horneado"). |
| `causa` | si | enum cerrado (ver abajo). |
| `razon` | si | una linea, futura-legible. El enum dice la clase; la razon dice el caso. |
| `alcance` | si, no vacio | lista de ids de tarea (`T-NNN`), ids de criterio de aceptacion (`CA-N`), o el literal `work` si es transversal. Sin esto, la diferida contamina todo el work. Es lo que el guard converso (`CIERRE_SIN_DECLARAR_PENDIENTES`) cruza contra los pendientes reales. |
| `evidencia_sustituta` | si, >=1 ancla | que SI se comprobo en su lugar. Es la pieza que impide que esto sea un `COMPLETADO`-sin-pruebas con nombre nuevo: no dice "no verificamos", dice hasta donde llego la comprobacion posible. |
| `plan_confirmacion.como` | si | metodo de confirmacion futura. |
| `plan_confirmacion.cuando` | si | ventana en lenguaje de negocio (ej. "primer cierre de mes"). |
| `plan_confirmacion.revisar_el` | si | fecha ISO `YYYY-MM-DD`, validada como fecha de calendario real (no solo la forma — `2026-02-30` se rechaza, no se normaliza a marzo). |
| `plan_confirmacion.responsable` | si | un compromiso sin dueno no es un compromiso. |
| `confirmado_por_usuario` | si, `true` | la marca de la doble confirmacion (ver "Doble confirmacion"). |

### Enum cerrado de `causa`

`solo-produccion` · `dato-solo-productivo` · `integracion-externa-no-disponible` ·
`evento-de-negocio` · `dispositivo-no-disponible`.

El rotulo del mecanismo es generico (verificacion diferida), no especifico de produccion:
produccion es una causa entre varias.

### Forma de `evidencia_sustituta`

Reusa las cinco formas de ancla del ADN — no se inventa una sexta.

<!-- FUENTE: agent-os/templates/work-record/reflexion-adn-entry.md seccion "Regla de evidencia". Aqui solo se declara que evidencia_sustituta reusa esas cinco formas. NO duplicar la regla — para modificar, editar la fuente. -->

## El `id` horneado (VD-NN)

`id` es obligatorio en el frontmatter persistido y prohibido en el payload de entrada:

1. El agente escribe el bloque SIN `id`, via `work set-fm` (README raiz) o `work file set-fm`
   (tarea) — los verbos que ya son la unica via de mutar frontmatter.
2. El verbo detecta un bloque `verificacion_diferida` sin `id`, escanea el README y todas las
   tareas del work para hallar el mayor `VD-NN` en uso, y hornea el siguiente correlativo.
3. Si el payload trae `id`, se rechaza con `FORMA`: la numeracion no es del agente. El bloque
   puede estar perfecto — lo que esta mal es el uso del contrato, por eso el codigo no es
   `VERIFICACION_DIFERIDA_INCOMPLETA`.
4. Que es idempotente, con precision: **un `set-fm` de OTROS campos no renumera un bloque ya
   horneado**. Re-declarar el bloque por `set-fm` si le asigna un `VD-NN` nuevo, porque el payload
   no puede traer el `id` (punto 3) y el horneado no tiene como reconocer que se trata del mismo
   bloque. Declararlo una vez, ya acordado con el usuario, es el camino previsto; re-declararlo
   deja el numero anterior libre y consume el siguiente.

Un bloque persistido sin `id` solo puede venir de una edicion a mano por fuera del runtime — el
guard `VERIFICACION_DIFERIDA_INCOMPLETA` lo rechaza, consistente con la doctrina de que los
work-records no se editan a mano.

## Derivacion: bloque fuente, estado/status proyeccion

Los verbos `work close --estado` y `work tarea ejecutor` con `status` en el payload siguen
recibiendo la **intencion** por su contrato actual. El runtime la reconcilia con el bloque antes
de mutar: el estado/status diferido nunca se pide, se deriva.

### A nivel work (`work close`)

`work close` escanea el README raiz Y todas las tareas. Un solo bloque valido en cualquiera de
los dos sitios activa la derivacion.

| `--estado` pedido | Algun bloque valido en el work (README o tarea) | Estado horneado |
|---|---|---|
| `COMPLETADO` | no hay | `COMPLETADO` |
| `COMPLETADO` | si hay | `COMPLETADO_VERIFICACION_DIFERIDA` |
| `COMPLETADO_CON_BRECHA` | no hay | `COMPLETADO_CON_BRECHA` |
| `COMPLETADO_CON_BRECHA` | si hay | `COMPLETADO_CON_BRECHA` (ver precedencia) |
| `COMPLETADO_VERIFICACION_DIFERIDA` | cualquiera | guard `ESTADO_NO_DERIVABLE` |

El envelope de exito reporta `estado_derivado: true` cuando el horneado difiere de lo pedido, para
que la conversion nunca sea silenciosa.

### A nivel tarea (`work tarea ejecutor`)

Simetrico. El ejecutor sigue pidiendo `done | done_con_brecha | deferido` —
**`done_verificacion_diferida` NO se agrega a los valores pedibles**, no es un status que un
agente pueda solicitar directamente. Cuando el payload trae `status: done` y la tarea tiene bloque
`verificacion_diferida{}` valido, el runtime hornea `done_verificacion_diferida`. El valor si vive
en el enum de valores validos en frontmatter (ver `nucleo.md` seccion "Valores de status") — dos
conjuntos distintos que ya divergian a proposito (los pedibles excluyen tambien `skipped` y
`complete`).

`status: deferido` sobre una tarea con bloque es incoherente y se rechaza (`FORMA`): una tarea que
se decidio no implementar no tiene nada pendiente de comprobar.

## Precedencia entre ejes

Los dos ejes pueden tener algo que decir a la vez: un work puede entregar menos de lo prometido Y
ademas dejar parte sin comprobar. En ese caso:

- **El estado/status refleja el eje meta.** `COMPLETADO_CON_BRECHA` (o `done_con_brecha` en una
  tarea) sobrevive a la derivacion — es la informacion que un lector necesita primero.
- **El bloque sigue presente**, registrando el eje verificacion y generando su fila en el
  libro-mayor igual que si hubiera derivado.
- `COMPLETADO_VERIFICACION_DIFERIDA` (y `done_verificacion_diferida`) se reservan para el caso
  limpio: meta cumplida entera, comprobacion pendiente.

Consecuencia directa de la ortogonalidad: el estado es la proyeccion del eje meta; el bloque es el
eje verificacion y nunca deja de existir por tener un vecino.

## Guards

Los cuatro guards de este dominio. El resto del catalogo de guards estructurales vive en
`cierre-guards-diseno.md` seccion "Guards del runtime (gates bloqueantes)".

### `VERIFICACION_DIFERIDA_INCOMPLETA`

Verbos: `work close`, `work tarea ejecutor`, `work set-fm`, `work file set-fm`. Dispara cuando un
bloque existe pero le falta algun campo obligatorio, `causa` esta fuera del enum,
`evidencia_sustituta` no trae al menos un ancla de forma valida, o `revisar_el` no es una fecha ISO
real. Exceptuado en cierre a `CANCELADO`.

**Que NO es este guard.** Un payload que trae su propio `id` se rechaza con `FORMA`, no con este
codigo: ahi el bloque puede estar completo y lo que falla es el uso del contrato (ver "El `id`
horneado"). Un codigo por situacion, o el lector deja de saber que le esta diciendo el runtime.

Coherente con la frontera runtime/cognicion: el runtime exige que la decision exista y tenga
forma; nunca juzga si la razon es buena.

### `CIERRE_SIN_DECLARAR_PENDIENTES` (guard converso)

Verbo: `work close`, en AMBOS cierres limpios — `COMPLETADO` y `COMPLETADO_CON_BRECHA`. Exceptuado
en `CANCELADO`.

Cubrir tambien `COMPLETADO_CON_BRECHA` no es exceso de celo: sin eso, cerrar con brecha de meta
seguiria siendo el escondite de la comprobacion diferida.

**Dispara por cobertura, no por ausencia.** Tener algun bloque no basta: un work puede declarar la
diferida de `CA-1` y dejar `CA-2` pendiente sin declarar nada. El guard dispara cuando existe al
menos un pendiente que ningun bloque cubre. Los pendientes son de dos clases:

1. Toda tarea con `status: done_verificacion_diferida` (deteccion por frontmatter puro — la
   garantia dura).
2. Todo CA con `Resultado: PENDIENTE` en la tabla de cobertura de `etapa-4/07-verificacion.md`
   (deteccion por contenido, mismo precedente que `LLEGADA_SIN_VERIFICAR` y `CU_SIN_RESULTADO`).

Un pendiente esta cubierto cuando:

| Pendiente | Cubierto si |
|---|---|
| tarea `T-NNN` | la tarea tiene su propio bloque valido, O `T-NNN` figura en el `alcance` de un bloque del README, O algun bloque declara `alcance: work` |
| CA `CA-N` | `CA-N` figura en el `alcance` de algun bloque valido del work, O algun bloque declara `alcance: work` |

**La deteccion del CA depende de la plantilla.** `agent-os/templates/work-record/etapa-4/07-verificacion.md`
declara la tabla de cobertura bajo el encabezado canonico `## Verificacion por CAs`, columnas fijas
`| CA | Tareas relacionadas | Resultado | Notas |` — `Resultado` es la TERCERA columna, y el guard
esta alineado a esa posicion. La columna usa vocabulario cerrado: `PASS` · `FAIL` · `PENDIENTE`, un
token exacto en mayusculas como unico contenido de la celda; la razon de un pendiente va en `Notas`.
El guard parsea solo esa columna, bajo ese encabezado — es deteccion sobre contenido, no la garantia
dura del chequeo 1, y depende de que la plantilla se respete. Renombrar el encabezado o mover la
columna desactiva el chequeo 2 en silencio.

Se resuelve por una de dos vias: el CA deja de estar `PENDIENTE` (pasa a `PASS`/`FAIL` con su
evidencia), o queda cubierto por el `alcance` de un bloque. No hay tercera salida silenciosa.

### `ESTADO_NO_DERIVABLE`

Verbo: `work close`. Dispara cuando se pide `--estado COMPLETADO_VERIFICACION_DIFERIDA`
directamente. Ese estado solo puede nacer de la derivacion — declarar el bloque y cerrar con
`--estado COMPLETADO`.

### `FILA_NO_EXISTE`

Verbo: `verificacion registrar`. Dispara cuando el par `{work_slug, id}` del payload no tiene una
fila `diferida-abierta` sin resolver en el libro-mayor (no existe, o ya tiene desenlace
registrado). Listar las diferidas abiertas: `agentos verificacion pendientes`.

## Doble confirmacion

El runtime no puede probar que un humano hablo; lo que si puede es negarse a cerrar sin la marca.
Tres capas:

1. Quinn plantea la situacion con `AskUserQuestion`, nunca la asume.
2. La confirmacion se hornea como `confirmado_por_usuario: true` MAS una linea `[OVERRIDE]` en la
   bitacora del work — el patron que el repo ya usa para los descartes de evidencia.
   `VERIFICACION_DIFERIDA_INCOMPLETA` valida solo el campo `confirmado_por_usuario: true`; la linea
   `[OVERRIDE]` es disciplina cognitiva, no chequeo mecanico.
3. La verificacion diferida es parte del piso no-negociable de la perilla de autonomia: siempre
   consulta, en cualquier `nivel`, igual que scope, meta y destructivo.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Perilla de autonomia". El piso no-negociable (que siempre consulta, sin importar el nivel) vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

## El libro-mayor (`agent-os/verificaciones/ledger.md`)

Sobrevive al archivado del work. Lo escribe el runtime — mismo molde que `agent-os/pruebas/
ledger.md` y `agent-os/conocimiento/ledger.md`: **append-only, secuencia YAML** (pese a la
extension `.md`), header "gestionado por agentos; NO editar a mano". Nace en el primer append; no
hay seed ni cambio en el installer.

**Una fila por bloque, no por work.** Un work puede diferir dos comprobaciones distintas por
razones distintas, cada una con su ventana y su responsable. Al cerrar, `work close` recorre el
README y todas las tareas, y appendea una fila por cada bloque encontrado.

**Clave de fila:** el par `{work_slug, id}`. **Forma persistida: dos operaciones, nunca una
mutacion.** El estado de una diferida se DERIVA de su ultima operacion para esa clave.

```yaml
- id: VD-01
  operacion: diferida-abierta
  work_slug: 20260811-conector-erp
  causa: solo-produccion
  alcance: [T-004, T-007, CA-3]
  revisar_el: "2026-09-01"
  responsable: Julio Diaz
  fecha: "2026-08-11"
- id: VD-01
  operacion: diferida-resuelta
  work_slug: 20260811-conector-erp
  resultado: desmentido
  evidencia: ["logs/conciliacion-0903.txt:44"]
  notas: "El conector duplica la linea de ajuste"
  fecha: "2026-09-03"
```

### Las dos operaciones

| Operacion | Quien la escribe | Cuando | Campos |
|---|---|---|---|
| `diferida-abierta` | `work close`, antes de archivar | un bloque valido existe en el work al cerrar con `--estado COMPLETADO` o `COMPLETADO_CON_BRECHA` | `id`, `work_slug`, `causa`, `alcance`, `revisar_el`, `responsable`, `fecha` |
| `diferida-resuelta` | `verificacion registrar` | alguien registra el desenlace real | `id`, `work_slug`, `resultado`, `evidencia[]` (si aplica), `notas` (si aplica), `fecha` |

**Por que el alta se restringe a los dos cierres de entrega.** `REPLANTEADO`, `TRASLADADO_A_DISENO`,
`MIGRADO` y `CANCELADO` son desenlaces de no entrega: el work se archiva y lo que continua, continua
en otra parte. Abrir una fila en esos casos crearia un compromiso permanente -- con responsable y
fecha -- de comprobar algo que quiza nunca se despliegue; `verificacion pendientes` lo reportaria
para siempre. Es el mismo modo de falla que este mecanismo existe para evitar: un registro que
afirma un pendiente que nadie debe.

**La asimetria es real y vale decirla.** La validacion de forma del bloque (guard
`VERIFICACION_DIFERIDA_INCOMPLETA`) sigue corriendo para cualquier estado salvo `CANCELADO`: un
bloque mal formado se atrapa igual en un cierre `REPLANTEADO` o `TRASLADADO_A_DISENO`. Lo unico que
se angosto es el ALTA en el ledger. Validar es barato y atrapa un error; registrar un compromiso es
una afirmacion sobre el futuro.

`razon` NO viaja al ledger (es prosa larga): vive en el bloque del work-record, que la fila
referencia por `work_slug`. El `id` es el mismo `VD-NN` del bloque, no uno nuevo.

Una diferida esta **abierta** si su ultima operacion para `{work_slug, id}` es `diferida-abierta`,
y **resuelta** si es `diferida-resuelta`.

### Orden y atomicidad frente al archivado

El append ocurre ANTES de mutar el frontmatter del README (el `Setear` de `estado`/`fecha_fin`) y
ANTES del rename que archiva el work: `append -> mutar frontmatter -> rename`. La razon es mas
fuerte que evitar el silencio del rename solo -- es lo que hace seguro el reintento completo. Si el
append falla, el work queda intacto: activo, con su estado anterior, sin frontmatter mutado. Cerrar
de nuevo es exactamente lo que corresponde. Si el orden fuera al reves, un fallo posterior al mutar
dejaria el README diciendo `COMPLETADO_VERIFICACION_DIFERIDA` sin haber registrado el compromiso, y
el work quedaria emparedado: `ValidarCierre` lo rechaza por no estar activo, y no hay salida por
`work reopen` porque `cerrado_en` nunca se escribio.

El append es **idempotente por estado derivado de la clave `{work_slug, id}`**: se omite solo si esa
clave tiene una diferida actualmente **abierta** (su ultima operacion en el ledger es
`diferida-abierta`); una diferida ya **resuelta** (ultima operacion `diferida-resuelta`) no
suprime un alta nueva. Esto es lo que permite el caso real: un `work reopen` seguido de un nuevo
cierre sobre un bloque que sigue vivo debe poder abrir un compromiso fresco, aunque esa misma clave
ya tenga un desenlace antiguo en el ledger.

## Los verbos

Dominio `verificacion`. Ambos siguen el contrato ejecutable del runtime (bloque `Contrato`,
`--help`, guards declarados) y aceptan payload por `--input {archivo}` o stdin.

### `agentos verificacion pendientes`

Lista las diferidas abiertas: `id`, work origen, `causa`, `alcance`, `revisar_el`, `responsable`,
fecha de apertura (`abierta_el`), y marca `vencida: true` cuando `revisar_el` < hoy. Sin payload.

### `agentos verificacion registrar`

Payload `{work_slug, id, resultado, evidencia[], notas}`. `id` es requerido sin default: no hay
"todas" ni "la unica", porque un default asi convierte un descuido en un dato falso.

| `resultado` | Que significa | evidencia[] |
|---|---|---|
| `confirmado` | funciono en el ambiente real | obligatoria, >=1 ancla |
| `desmentido` | fallo justo donde no se pudo comprobar | obligatoria, >=1 ancla |
| `caducado` | nadie confirmo y ya no aplica | opcional, puede ir vacia |

Escribe la fila `diferida-resuelta` y cierra esa fila (no se puede resolver dos veces: la segunda
llamada sobre la misma clave dispara `FILA_NO_EXISTE`). Guard `FILA_NO_EXISTE` si el par
`{work_slug, id}` no esta abierto.

**El puente hacia el aprendizaje.** El runtime nunca redacta prosa cognitiva. El envelope devuelve
`reflexion_sugerida: {experto, slug, categoria, arte, anclas[]}` — material, no texto — con
`categoria` derivada de `resultado`:

| `resultado` | `categoria` sugerida |
|---|---|
| `confirmado` | `acierto-repetible` |
| `desmentido` | `error-en-sistema` |
| `caducado` | ninguna — `reflexion_sugerida: null`, sin reflexion |

`caducado` no produce reflexion porque no dice nada sobre el sistema ni sobre quien lo construyo:
dice que nadie volvio a mirar. El dato vale en agregado (cuantas diferidas caducan, de que causa,
de que responsable) leyendo el ledger completo, no un verbo de agregacion dedicado.

El agente en sesion redacta la entrada con el material devuelto y la deposita con el verbo
existente:

```
echo '{...entrada...}' | agentos learn validar-candidato --experto quinn --slug {work_origen}
```

Default de experto receptor: **Quinn** (fue quien juzgo que la evidencia sustituta bastaba para
cerrar). Si el desenlace revela causa raiz de otro dominio, el agente atribuye a ese experto y lo
justifica en `causa_atribuida`. Si el deposito falla, el registro en el ledger NO se revierte: el
desenlace es el hecho, la reflexion es su lectura.

## Compatibilidad

Zero migracion forzosa:

- Works ya archivados como `COMPLETADO_CON_BRECHA` se quedan asi.
- Works sin bloque `verificacion_diferida{}` se comportan exactamente como hoy: el bloque es
  opt-in y su ausencia no dispara nada, salvo el guard converso cuando hay pendientes sin declarar.
- Tareas con `done_con_brecha` legitimo (brecha de alcance real) siguen siendo validas.
