---
name: schema-modelo
description: Contrato del modelo del diseño: campos por tipo de nodo, extremos por arista y estados
---

# Contrato del modelo del diseño

Fuente canonica de **que campos lleva cada nodo** y **que extremos admite cada
arista**. Quien emite al modelo se rige por este documento; el runtime lo
implementa y lo hace cumplir. Si aqui cambia un valor, la implementacion cambia.

Este contrato gobierna la **forma**: que campo existe y a que tipo apunta cada
arista. No juzga si un valor concreto es acertado — eso es cognitivo. La
gramatica visual (forma, color y vistas de la proyeccion) es un contrato
hermano, no este.

## Estados

| Estado | Que significa | Que exige |
|---|---|---|
| abierto | todavia no determinado | solo el campo de identidad de su tipo |
| resuelto | determinado | los campos minimos de su tipo. Citar y explicarse no son forma y no los reclama este contrato: la cita la reclama `NODO_SIN_CITA` al cerrar el FOCO, y solo a los tipos que lista "Que nodos citan"; la prosa anclada la reclama `NODO_SIN_PROSA` al cerrar **cualquier** etapa, y solo a los cinco tipos que lista "Que nodos exigen prosa" |
| descartado | se decidio no hacerlo — nunca existio | una razon |
| obsoleto | fue verdad y dejo de serlo — posiblemente ya construido | una razon, y opcionalmente `reemplazado_por` |

El estado gana sobre la forma en un solo sentido: un nodo `abierto` es, por
definicion, uno que todavia no esta determinado. Pedirle los campos minimos
seria impedir representarlo mientras se investiga.

**`descartado` y `obsoleto` no son intercambiables.** Un nodo descartado nunca
existio; uno obsoleto si, y puede haber codigo desplegado que lo implementa. Un
work cerrado necesita esa diferencia para saber contra que se valido. Por eso el
obsoleto **no desaparece**: sigue en el grafo, navegable, marcado como lo que es.

**Los campos minimos los sigue exigiendo solo el `resuelto`.** Un nodo que nunca
se determino y muere obsoleto no tiene que cumplirlos; uno que si se determino ya
los trae, y emitir nunca quita. Lo unico que el obsoleto exige por si mismo es su
razon — mas la cita y la prosa, que conserva (ver las dos tablas de abajo).

## Dos palabras parecidas que no son lo mismo

El sistema usa "obsoleto" en dos maquinas distintas y hay que no confundirlas:

- `obsoleto_por_replanteamiento` — estado de **la ficha de un hallazgo**: el
  hallazgo dejo de tener sentido porque el diseño cambio. Habla del **caso**.
- `obsoleto` — estado de **un nodo del grafo**: lo que el nodo afirmaba dejo de
  ser cierto. Habla del **mundo**.

Un hallazgo puede quedar `obsoleto_por_replanteamiento` sin que ningun nodo quede
`obsoleto`, y al reves.

## Forma del id

Todo id calza `^[A-Za-z_][A-Za-z0-9_]*$`. No es capricho: el id viaja sin comillas
al DOT y forma el nombre del cluster, y un id como `P-1` produce un grafo
sintacticamente invalido que las comillas no arreglan.

## Procedencia del nodo

Todo nodo, sin importar el tipo, puede declarar la etapa que lo creo.

| Campo | Exigido | Descripcion |
|---|---|---|
| `etapa` | no | La etapa que CREO el nodo. Con `--portador diseno`, la sella `modelo emitir` y no cambia cuando otra etapa lo completa: el regreso pregunta por que nacio asi, y eso lo responde el origen. Con `--portador work` el campo se BORRA si el lote lo trae — el work no tiene ciclo de etapas y su procedencia se declara con `origen`, no con `etapa` —, asi que un lote que meta `etapa` a mano la pierde en silencio. Ausente en modelos anteriores a esta capa. |

## Portadores del modelo

El modelo tiene dos portadores: `diseno` y `work`. La **tipologia es la misma** en
ambos — un `entidad` en el modelo de un work es el mismo tipo de cosa que en el
del diseño, con los mismos campos minimos y el mismo dominio de valores. Esa
identidad es lo que permite atar un modelo al otro nodo a nodo.

| Portador | Donde vive | Quien lo escribe |
|---|---|---|
| `diseno` | `agent-os/disenos/{slug}/modelo.yml` | las etapas de `/disenar`, via `modelo emitir` |
| `work` | `agent-os/work-records/{slug}/modelo.yml` | dos vias: el horneado, derivado del diseño (`work open` al crear el work, `work terreno` al recuperar), o `modelo emitir --portador work`, reconstruido desde la evidencia del propio work, sin diseño |

Dos campos existen **solo en el portador `work`**:

| Campo | Valor | Que responde |
|---|---|---|
| `origen` | dos formas — ver abajo | de que nodo o de que evidencia salio este |
| `rol` | `construye` \| `consume` | ¿este nodo es entrega de este work? |

### Las dos formas de `origen`

Un work puede tener `origen` de dos formas, segun de donde nacio su modelo. No
son intercambiables: la forma dice de un vistazo por que camino llego el nodo.

| Forma | Cuando se usa | Que nombra |
|---|---|---|
| `{diseno_slug}#{id_nodo}` | el work nace **derivado** de un diseño (`work open` con `desde_diseno` en el payload, o `work terreno` recuperando) | el nodo del diseño del que este se horneo |
| `work:{slug}#{referencia}` | el work se **reconstruye** desde su propia evidencia, sin subgrafo que derivar de un diseño | `{slug}` tiene que ser el de ESTE work — nombrar otro work dispara `ORIGEN_NO_RESOLUBLE` — y `{referencia}` es una de cuatro formas admitidas: `tarea:T-NNN` (tres digitos; es el nombre de archivo de la tarea, no un campo de su frontmatter), `abordaje`, `decisiones`, `archivos_modificados` |

`archivos_modificados` es una referencia porque nombra la **seccion** del
work que la trae, no las rutas de archivo que ella lista: una ruta de archivo
sostiene un nodo como cita, no lo origina — por eso `archivos` a secas no es
una referencia valida.

### El regimen `reconstruido`

Un modelo `work` puede llevar un bloque `reconstruido`, a nivel de
**modelo**, no de nodo — la condicion es del artefacto entero. Lo escribe
`modelo emitir --portador work`, en su primera emision sobre ese `modelo.yml`,
**sin mirar de donde salio el modelo antes**: aparece igual sobre un modelo
horneado por `work open` desde un diseño si alguien corre esa emision sobre
el. La marca no significa "este work nunca tuvo diseño de origen" — significa
"alguien emitio sobre este modelo con `--portador work` al menos una vez".

| Campo | Valor | Quien lo pone |
|---|---|---|
| `desde` | `dossier` \| `abordaje` | `modelo emitir --portador work`, en la primera emision — `dossier` si el flag `--desde` esta ausente (default retrocompatible), `abordaje` si se pasa `--desde abordaje` |
| `fecha` | fecha de esa primera emision | el runtime |
| `cobertura_declarada` | prosa: que evidencia cubrio la reconstruccion y que quedo fuera. La flag `--cobertura-declarada` es requerida en TODA invocacion con `--portador work`, no solo la primera — pero solo el valor de la primera se guarda | quien emite; la de la **primera** emision es la que vale — una emision posterior que declare otra cobertura se rechaza (`COBERTURA`) |

El bloque es opcional, pero **presente tiene que estar completo**: `desde` con
un valor conocido y `cobertura_declarada` no vacia, o la forma lo rechaza
(`MODELO_FORMA`). Un `reconstruido: {}` escrito a mano dejaria el modelo
rechazando toda emision posterior con `COBERTURA`, porque la cobertura vacia
que quedo guardada no vuelve a coincidir con ninguna.

**La marca no exime de ninguna compuerta hoy.** La lectura natural de
"regimen reconstruido" es la contraria — que algo se relaja porque el modelo
no vino de un diseño — y esa lectura es falsa: las compuertas del portador
`work` corren igual sobre un modelo reconstruido que sobre uno derivado. Lo
que la marca hace es **declarar** (un FOCO reconstruido que no dice que lo es
se lee como completo, y no lo es) y **preparar** la distincion que hara falta
el dia que existan compuertas propias sobre los nodos que un work emite de si
mismo.

El `id` se conserva identico entre portadores: `ENT_Cita` en el diseño es
`ENT_Cita` en el work. Sin eso, devolver un hallazgo al diseño exigiria una
tabla de traduccion, y toda tabla de traduccion se desincroniza.

El `historial` **no viaja**: el nodo horneado nace con el libro-mayor vacio.
Copiarlo atribuiria al runtime del work cambios que ocurrieron en otro modelo,
bajo otro portador. Si esa historia se puede recuperar por `origen` depende
del camino — derivado si, reconstruido no, porque ahi no hay diseño del que
venir —; el detalle vive en el schema del work, seccion "El historial no
viaja".

**Quien declara `origen` y `rol`, y quien los congela.** En el camino
derivado los sella el horneado, calculandolos del diseño. En el camino
reconstruido los **declara la cognicion** al emitir — es ella quien sabe de
que tarea o seccion salio cada nodo, dato que el runtime no puede inferir —,
y el runtime los **valida contra el work al emitir** (la referencia tiene que
existir de verdad, `REFERENCIA`; el resto de la forma del lote, `LOTE`) **y
despues los congela**: una emision posterior no puede moverlos.
`ORIGEN_NO_RESOLUBLE` es un hallazgo distinto, de `modelo validar`: caza un
`origen` que quedo mal escrito a mano DESPUES de la emision, no el que la
emision misma ya rechazo.

Ambos campos son ausentes en el portador `diseno` y eso no es error de forma.
Quien los reclama es `modelo validar --portador work`.

<!-- FUENTE de lo propio del work (frontera, idempotencia del horneado): agent-os/templates/work-record/schema/modelo-del-work.md seccion "Lo propio del portador work". Aqui vive el contrato compartido por los dos portadores. NO duplicar — para modificar lo del work, editar alla. -->

## Historial de campos

Todo nodo puede traer un `historial`: la lista de sobrescrituras que sus campos
recibieron, en orden de ocurrencia.

| Campo | Exigido | Descripcion |
|---|---|---|
| `historial` | no | Lista de entradas `{etapa, campo, antes, despues}`. **Lo escribe el runtime**: cada emision que sobrescribe un campo agrega una entrada al final |

El `campo` de una entrada **no distingue** un campo propio del nodo (`estado`, `razon`, `cita`) de una clave de `campos` que se llame igual: `campo: razon` puede ser la razon del descarte o un `razon` de dominio.

El `etapa` de una entrada del historial **no** es "la etapa del ciclo del
diseño" — es "que momento produjo este cambio". En el portador `diseno` esas
dos lecturas coinciden, porque no hay otro momento posible. En el portador
`work` no coinciden: el work no tiene ciclo de etapas, y ese momento es
siempre el valor `reconstruccion`, sin importar que campo se sobrescribio ni
cuantas veces.

```yaml
- id: ENT_Cita
  tipo: entidad
  estado: resuelto
  campos: {columnas: [...]}
  historial:
    - {etapa: procesos, campo: columnas, antes: "5 columnas", despues: "8 columnas"}
```

**Nunca lo escribe quien emite.** Un lote que traiga `historial` **se rechaza** y
no se aplica nada de el. No es formalismo: un historial que un agente puede
redactar a mano no es un historial, es una narracion, y un rechazo silencioso
dejaria creer que la inyeccion funciono.

Un nodo nuevo nace sin historial: no hay "antes" que registrar.

## Campos por tipo de nodo

`-` significa "no aplica": el `work` es un cluster, no un nodo dibujado — su
identidad es el id del nodo y su contenido son las aristas `CONTIENE`, no un
campo propio.

| Tipo | Identidad | Campos minimos | Dominio |
|---|---|---|---|
| capacidad | nombre | clasificacion | se_conserva / se_modifica / desaparece / no_aplica / nueva |
| proceso | nombre | trigger, modulo | trigger: evento concreto en texto libre. modulo: ruta del modulo huesped en el codebase |
| actor | nombre | tipo | humano / rol / sistema / servicio / programado |
| entidad | nombre | existencia, columnas | existencia: nueva / existente. columnas: lista con tipo, null, default y PK/FK por columna |
| regla | enunciado | origen | heredada (con fuente citada) / nueva (con justificacion) |
| restriccion | enunciado | tipo | normativa / arquitectonica / tecnica / operacional |
| pantalla | nombre | cadena_navegacion | texto libre: menu -> submenu -> accion -> pantalla |
| endpoint | ruta | naturaleza, decision_permiso | naturaleza: restriccion-acceso / modulacion-comportamiento. decision_permiso: reutilizar / nuevo |
| work | - | - | cluster: su identidad es el id del nodo, su contenido son las aristas `CONTIENE` |
| escenario | accion | precondicion, resultado, receta_dato_prueba | texto libre cada uno; receta_dato_prueba lo consume el plan de prueba de la etapa de verificacion |
| pregunta | enunciado | severidad, motiva | severidad: critica / alta / media / baja / informativa — **el valor se valida** (SEVERIDAD_INVALIDA). motiva: id de otro nodo del modelo |
| hallazgo | enunciado | invalida, origen | invalida: id de otro nodo del modelo. origen: dentro del diseño / desde un work |
| decision | enunciado | razon, que_resolvio, afecta | que_resolvio: freno confirmado / riesgo aceptado / alternativa elegida / override. afecta: id de otro nodo del modelo |
| riesgo | enunciado | responsable, amenaza | responsable: texto libre (persona o rol). amenaza: id de otro nodo del modelo |
| operacion_cripto | nombre | naturaleza, algoritmo, valor_probatorio, existencia | naturaleza: firma / estampa / cifrado / hash. algoritmo: nombre CON sus parametros (tamano de llave, modo, iteraciones). valor_probatorio: escalon declarado; admite `no_aplica` en cifrado y hash. existencia: nueva / existente |
| llave | nombre | custodia, proposito, rotacion, existencia | custodia: donde vive (HSM/KMS/Key Vault). proposito: el uso unico. rotacion: plan de rotacion. existencia: nueva / existente |

**La `severidad` de una pregunta abierta tiene consecuencia mecanica.** Tres
predicados la leen: `PREGUNTA_ABIERTA` bloquea el cierre de cualquier etapa con
una `critica` o una `alta` viva; `NODO_RESUELTO_CON_PREGUNTA_ABIERTA` impide que
el nodo al que la pregunta `motiva` quede `resuelto` mientras ella siga abierta
— con las `informativa` **exentas**, porque no impiden dar por determinado
aquello sobre lo que preguntan; y `SEVERIDAD_DEGRADADA_SIN_RAZON` exige que
bajarle la severidad a un nodo venga con su `razon`. Bajar una severidad no es un
gesto de forma: cambia que compuertas se aplican, y ahora deja rastro con porque.

## Que nodos citan

Un nodo cita cuando **afirma algo del mundo preexistente**. Un nodo que propone
algo que todavia no existe **no cita, y su ausencia de cita es correcta** — no un
hueco que haya que rellenar. El discriminador ya vive en los campos del nodo.

| Tipo | Campo discriminador | Cita cuando | No cita cuando |
|---|---|---|---|
| entidad | existencia | existente | nueva |
| regla | origen | heredada | nueva |
| capacidad | clasificacion | se_conserva, se_modifica, desaparece | nueva, no_aplica |
| endpoint | decision_permiso | reutilizar | nuevo |
| restriccion | - | siempre | - |
| actor | - | siempre | - |
| proceso | - | nunca | siempre |
| pantalla | - | nunca | siempre |
| decision | - | nunca | siempre |
| pregunta | - | nunca | siempre |
| hallazgo | - | nunca | siempre |
| riesgo | - | nunca | siempre |
| escenario | - | nunca | siempre |
| work | - | nunca | siempre |
| operacion_cripto | existencia | existente | nueva |
| llave | existencia | existente | nueva |

`NODO_SIN_CITA` reclama la cita solo a los que la tabla dice que citan. Que la
fuente citada **sostenga** la afirmacion es la segunda capa, y es cognitiva: no se
mecaniza.

## Que nodos exigen prosa

Cinco tipos, y solo cinco. Son aquellos donde el porque no cabe en ningun campo
del nodo y se pierde si nadie lo escribe. Los otros once quedan **exentos por
diseño**: exigir prosa a todo nodo resuelto produce el parrafo ceremonial escrito
para apagar un hallazgo, que es ruido con apariencia de rigor.

| Tipo | Condicion | Donde vive esa prosa hoy |
|---|---|---|
| decision | siempre | el porque de la eleccion; `razon` es una linea y el argumento no cabe ahi |
| proceso | siempre | `proceso-contrato.md`, el archivo propio del proceso |
| regla | origen: nueva | la tabla "Justificacion de las reglas nuevas" de `proceso-contrato.md` |
| entidad | existencia: nueva | `datos.md`; hoy es un checkbox del sello anti-evasion |
| operacion_cripto | siempre | `criptografia.md`; el porque del nivel de firma y del valor probatorio elegido |

`NODO_SIN_PROSA` reclama un marcador `<!-- nodo: {id} -->` en algun `.md` del
diseño para cada nodo `resuelto` de estos cinco tipos.

La `llave` **no** entra: custodia, proposito y rotacion **son** sus campos, y
pedirle prosa ademas produciria justo el parrafo ceremonial que esta tabla
existe para evitar.

## El marcador de prosa

```markdown
<!-- nodo: DEC_TipoCitaId, ENT_Cita -->
CitaId pasa de INT a BIGINT. La tabla crece ~40M filas/año y el rango de INT
se agota en 2027.
```

Un marcador nombra **[1..N] ids** separados por coma, ocupa la linea entera, y
usa la misma forma de id que declara "Forma del id". Un mismo bloque puede
explicar varios nodos: la razon de un cambio de tipo pertenece a la vez a la
decision y a la tabla.

**No se define "bloque".** Los chequeos necesitan los ids del marcador y su
ubicacion; el enlace del grafo necesita el encabezado que lo contiene. Ninguno
necesita saber donde termina el bloque, y definir esa frontera seria una regla
nueva que nadie usa.

**Prosa sin marcador NO es un hallazgo.** La mayor parte de la prosa de un
artefacto no es de un nodo — el E/R, las derivas observadas, el sello del
experto — y exigirle ancla produciria hallazgos sobre texto que esta bien como
esta. `PROSA_SIN_NODO` caza el ancla **muerta**: un marcador que nombra un id que
el modelo no tiene.

## Extremos por arista

`-` en la columna `A` significa "sin restringir": el tipo de nodo destino puede
ser cualquiera. Solo `LIMITA` usa este comodin — una restriccion gobierna
cualquier nodo, y no se inventa un alcance que la fuente no declara.

| Arista | De | A |
|---|---|---|
| DERIVA_DE | proceso | capacidad |
| USA | proceso | capacidad |
| INICIA | actor | proceso |
| TRANSICION | proceso | proceso |
| ACCEDE | proceso | entidad |
| RELACIONA | entidad | entidad |
| LLEGA_POR | proceso | pantalla |
| APLICA | proceso | regla |
| EXPONE | proceso | endpoint |
| CONTIENE | work | proceso |
| LIMITA | restriccion | - |
| REQUIERE | proceso | pantalla |
| DEPENDE_DE | work | work |
| VERIFICA | escenario | proceso |
| EJECUTA | proceso | operacion_cripto |
| USA_LLAVE | operacion_cripto | llave |
| CONSTRUYE | work | entidad, endpoint, regla, pantalla, operacion_cripto, llave |

`DEPENDE_DE` es la unica que un emisor normalmente no declara a mano: el
runtime la calcula desde las transiciones que cruzan de un work a otro. Si
alguien la declara igual, tiene que respetar los mismos extremos que el
calculo produce.

`CONSTRUYE` es la unica arista con varios destinos posibles, y la unica que se
emite **solo donde hay conflicto**. Dice quien es RESPONSABLE de entregar un
nodo, no quien lo usa: eso ultimo ya lo dice la alcanzabilidad desde los
procesos de cada work. Si un nodo es alcanzable desde un solo work, ese lo
construye y no hay nada que declarar; si lo es desde varios y nadie lo declara,
`NODO_COMPARTIDO_SIN_ARBITRO` bloquea el cierre de la fragmentacion. Ese mismo
hallazgo dispara cuando la arista existe pero **el work declarado no alcanza el
nodo**: una declaracion que no resuelve deja la entrega sin dueño igual que su
ausencia.

El `proceso` no esta entre los destinos a proposito: `PROCESO_EN_N_WORKS` ya
prohibe que un proceso quede contenido por mas de un work, asi que su
propietario es siempre el unico que lo `CONTIENE`.

`VERIFICA` sale del `escenario` y no del `proceso` a proposito: es el escenario
quien afirma algo sobre el proceso. Un proceso no "tiene" escenarios — los
escenarios lo examinan, y pueden nacer y morir sin que el proceso cambie.

## Campos exigidos por arista

Una arista casi siempre relaciona y nada mas. La excepcion es `TRANSICION`, cuyo
campo `dato` **es forma y se exige**: nombra que viaja de un proceso al
siguiente, y la etapa de pipeline lo compara contra las `salidas` del origen y
las `entradas` del destino.

| Arista | Campo | Forma | Por que se exige |
|---|---|---|---|
| TRANSICION | dato | texto no vacio | sin el, la comparacion se hace contra el vacio y el hallazgo de correspondencia no puede dispararse |

Las demas aristas no exigen campos. `ACCEDE` admite `operaciones` y no se exige:
la matriz CRUD se rinde en la proyeccion, y un acceso sin operaciones declaradas
es una omision de detalle, no una relacion rota.

## Campos declarados y no exigidos

Estos campos aparecen en el diseño del modelo y **a proposito no se exigen**.
Cada uno con su razon, para que no se lean como olvido.

| Tipo | Campo | Por que no se exige |
|---|---|---|
| proceso | actor | lo carga la arista `INICIA`; exigirlo como campo duplicaria la relacion |
| proceso | entradas | un proceso puede no recibir nada (un disparo programado, por ejemplo); exigirla obligaria a inventar una lista vacia con aire de dato. Ver "Entradas y salidas de un proceso" |
| proceso | salidas | misma razon que `entradas`: hay procesos cuyo efecto es solo escritura, y la lista vacia no informa. Ver "Entradas y salidas de un proceso" |
| restriccion | cita | la cita no es campo de ningun tipo: quien la lleva y quien no lo decide la tabla "Que nodos citan", y la reclama `NODO_SIN_CITA` al cerrar el FOCO, no este contrato. Que la `restriccion` cite siempre sale de esa tabla transversal, no de una excepcion propia del tipo; declararla aqui la haria parecer campo |
| pantalla | prerequisitos | ambiguo entre campo propio y arista: el prerequisito ya viaja por `REQUIERE` hacia la pantalla donde se obtiene; se declara sin exigir mientras eso no se resuelva |
| endpoint | codigo | el permiso concreto (ej. AE090 o BS-XXX) se decide al implementar, no al diseñar; exigirlo aqui congelaria una decision que todavia no existe |
| proceso | es_inicial | booleano. Marca el proceso que ABRE la cadena del pipeline: sin el, un proceso sin transicion entrante es indistinguible de uno olvidado. No se exige porque la mayoria de los procesos no son extremos, y poblar dos falsos en cada nodo seria ruido. Lo emite la etapa de pipeline |
| proceso | es_terminal | booleano. El espejo del anterior: marca el proceso que CIERRA la cadena. Misma razon para no exigirlo |
| _cualquiera_ | reemplazado_por | id del nodo que sucede a uno obsoleto. Es transversal — cualquier nodo puede quedar obsoleto — y por eso no vive en el dominio de un tipo. Opcional a proposito: un nodo puede quedar obsoleto sin sucesor, y exigir un reemplazo obligaria a inventarlo. Si viene, el id tiene que existir y no puede ser el del propio nodo |

Los dos campos booleanos son **declarados y no exigidos, pero si tipados**: si
vienen, tienen que ser `true` o `false` de verdad. Un `"true"` entre comillas es
error de forma — el predicado que los lee hace una conversion que degrada
cualquier otra cosa a `false`, y el hallazgo que deberia apagarse volveria sin
explicacion.

## Entradas y salidas de un proceso

El contrato de un proceso —que recibe y que produce— vive en dos campos del nodo
`proceso`, no en aristas: el dato no relaciona dos nodos, describe al proceso.

| Campo | Forma | Quien lo emite | Quien lo lee |
|---|---|---|---|
| `entradas` | lista de textos; un item por dato de entrada (`citaId`, `nuevaFechaHora`) | la etapa de procesos, al cerrar el contrato con el usuario | la proyeccion `--vista contrato`, seccion "Datos requeridos (entrada)"; y la etapa de pipeline, para casar la salida de un proceso con la entrada del siguiente |
| `salidas` | lista de textos; un item por resultado producido (`cita reprogramada`, `movimiento registrado`) | la etapa de procesos, en el mismo momento | igual que `entradas`, seccion "Resultado producido (salida)" |

Son **textos**, no ids de otros nodos: nombran datos y resultados en el lenguaje del
contrato, no piezas del modelo. Cuando la salida de un proceso es una escritura sobre una
entidad, lo que relaciona ambos es la arista `ACCEDE`, no el texto de `salidas`.

## Contexto de llegada

Como queda el actor parado frente a un proceso: la respuesta a "como accede el
usuario a la nueva funcionalidad" tiene tres componentes, y cada uno vive en un
campo concreto de un tipo de nodo concreto.

1. **Cadena de navegacion.** Campo `cadena_navegacion` de la `pantalla`: menu ->
   submenu -> accion -> pantalla, o la declaracion de que no aplica (proceso sin
   UI, o pantalla nueva a diseñar). Es campo minimo — toda pantalla `resuelta`
   lo exige.
2. **Prerequisitos del actor.** Campo `prerequisitos` de la `pantalla` (que
   IDs, codigos o registros previos trae el actor) mas la arista `REQUIERE` de
   un `proceso` hacia la `pantalla` donde el actor los obtiene. El campo esta
   declarado y no exigido (ver la tabla anterior); la arista si es forma.
3. **Receta de datos de prueba.** Campo `receta_dato_prueba` del `escenario`:
   como fabricar o localizar en el tenant de pruebas el dato minimo para
   recorrer la funcionalidad. Es campo minimo de todo escenario `resuelto`, y
   quien lo consume es el plan de prueba de la etapa de verificacion.

"Endpoint mas rol" no es respuesta suficiente para una pantalla con entrada de
usuario: falta la cadena de navegacion y los prerequisitos, y ninguno de los
dos se deriva del endpoint.
