# Schema del feed de actividad

## Por que existe

Varias sesiones pueden trabajar el mismo diseño o el mismo work al mismo tiempo, y
seguirles el ritmo mirando consolas no funciona. Cada vez que un verbo toca el
grafo del FOCO (nodos y aristas de un diseño o de un work), deja un registro en
este feed. Un visor externo lo puede leer para mostrar que esta cambiando
mientras ocurre, sin tener que reconstruir el estado completo del modelo en
cada vistazo.

Este documento cubre **dos feeds** distintos, cada uno resolviendo una
necesidad propia: el feed del FOCO (grafo de un diseño o work — el resto de
esta seccion y las siguientes, hasta "Lo que este feed no trae en esta fase")
y el feed de archivos (lo que la cognicion edita bajo `agent-os/` — seccion
"El feed de archivos" mas abajo). Comparten directorio y ciclo de vida por
dia; no comparten formato ni contenido.

## Donde vive

`agent-os/.actividad/foco-YYYY-MM-DD.jsonl`

- Un archivo **por dia**, con la fecha **local** de quien escribe — no UTC. Quien
  mira el panel piensa en su dia, no en el de un servidor en otro huso.
- Append-only: cada registro es una linea JSON nueva, nunca se reescribe una
  linea existente.
- El directorio esta **gitignorado**. No es un artefacto para versionar — es
  rastro operativo que se purga solo (ver "Ciclo de vida" abajo).
- No hay rotacion. El archivo del dia se escribe directo; rotarlo implicaria
  mover un archivo que otra sesion puede estar escribiendo a la vez.

## La forma del registro

Cada linea es un objeto JSON con estos campos:

| Campo | Tipo | Presente cuando |
|---|---|---|
| `t` | string, hora con offset | siempre |
| `tipo` | `"fusion"` \| `"horneado"` | siempre |
| `sujeto.tipo` | `"diseno"` \| `"work"` | siempre |
| `sujeto.slug` | string | siempre |
| `verbo` | string, ej. `"modelo emitir"` | siempre |
| `etapa` | string | solo cuando el sujeto es un diseño; un work no tiene etapa y la clave se omite |
| `nuevos` | lista de ids de nodo | solo `fusion`, y solo si la lista no quedo vacia |
| `modificados` | lista de ids de nodo | solo `fusion`, y solo si la lista no quedo vacia |
| `reaperturas` | lista de ids de nodo | solo `fusion`, y solo si la lista no quedo vacia |
| `estados` | lista de transiciones (ver abajo) | solo `fusion`, y solo si hubo cambio de estado |
| `campos` | lista de campos movidos (nodo, campo, antes, despues, nucleo) | solo `fusion`, y solo si la lista no quedo vacia |
| `nodos` | numero | solo `horneado` (un `0` se emite; no se omite) |
| `aristas` | numero | solo `horneado` (un `0` se emite; no se omite) |

**Una lista vacia no viaja vacia: la clave desaparece del objeto.** Un visor que
haga `reg.campos.length` sobre un registro sin campos movidos revienta. Lo mismo
para `nuevos`, `modificados`, `reaperturas` y `estados`. Los unicos campos que
estan siempre son `t`, `tipo`, `sujeto` y `verbo`.

**Los dos valores de `tipo`** reflejan las dos maneras en que un verbo puede
tocar el grafo:

- **`fusion`** — un lote de cambios se aplica nodo por nodo, y el registro trae
  el delta que ese lote produjo: que nodos nacieron, cuales se modificaron,
  cuales se reabrieron, que campos se movieron y que nodos cambiaron de estado.
  **No implica que hubiera un modelo antes.** Emitir sobre un diseño o un work
  que todavia no tiene modelo esta permitido a proposito, y esa primera emision
  tambien sale `fusion` — con todos sus nodos en `nuevos` y sin nada en
  `modificados`.

  **Este feed no distingue el nacimiento de un modelo, y no hay campo que lo
  responda.** Ni `tipo` ni el delta: un lote que agrega solo `E1` a un modelo
  que ya tenia `P1` y `P2` produce un registro **identico** al de la primera
  emision de un modelo cuyo unico nodo es `E1`. Los dos dicen
  `nuevos: ["E1"]` y nada mas. **Es un dato ausente y declarado**, no un dato
  que este en otro campo: no se busque en el modelo, que tampoco registra
  cuando nacio.
- **`horneado`** — un modelo nace entero de una sola vez (por ejemplo, el
  subgrafo que un work deriva de su diseño de origen). No hay un "antes" contra
  el cual comparar — no habia nada ahi —, asi que no hay delta que reportar.
  El registro dice solo cuantos nodos y cuantas aristas nacieron.

## `estados`: la transicion de un nodo

`estados` es el equivalente, en este grafo, de una eliminacion: un nodo que
pasa a `descartado` u `obsoleto` no desaparece del modelo, pero deja de estar
vigente, y ese cambio es lo mas visible que le puede ocurrir. Cada entrada
trae:

| Campo | Significa |
|---|---|
| `nodo` | id del nodo que cambio de estado |
| `de` | estado anterior |
| `a` | estado nuevo |
| `razon` | la razon **vigente** del nodo despues del cambio |

Un nodo puede llevar ademas un campo de dominio llamado `estado` — una entidad
que pasa de borrador a publicado, por ejemplo. Ese **no** es una transicion de
vigencia y viaja en `campos`, no aqui: `estados` habla del estado del nodo en el
grafo, nunca de una clave homonima de su contenido.

La homonimia no se acaba en `estado`. `razon` es vocabulario canonico del tipo
`decision`, asi que un mismo lote puede mover la `razon` **del nodo** y un campo
`razon` **de su contenido**, y las dos caen en `campos` como dos entradas
`{campo: "razon"}`. Por eso cada entrada de `campos` puede traer
**`nucleo: true`**: significa que ese campo es propio del nodo (`razon`, `cita`)
y no una clave de su contenido. La marca **solo aparece cuando es cierta** — un
campo de dominio no trae la clave —, asi que se lee como `nucleo === true`,
nunca como `!nucleo`.

`razon` no es "la razon de este cambio en particular" — es la razon que el
nodo tiene en el modelo en el momento de la emision, ya aplicado el lote
entero. Si un mismo lote cambia el estado de un nodo y despues su razon, lo
que viaja aqui es la razon final, no un valor intermedio.

## Una linea que no se puede interpretar se salta, no interrumpe la lectura

Con varias sesiones appendeando al mismo archivo, una escritura a medias es
posible aunque infrecuente. El lector del feed no revienta por eso: una linea
que no es JSON valido, o que es JSON valido pero no tiene la forma de un
registro de este feed, se descarta y se cuenta aparte, en vez de devolver un
error que esconderia todo lo demas.

**`lineas_ilegibles` es un PISO, no un total.** Lo que no se pudo leer no se
puede contar: un archivo de un dia entero que no se deja abrir — permisos, un
antivirus que lo tiene tomado — suma **1**, aunque dentro hubiera cuatrocientos
registros. Lo mismo una linea sobrelarga, que corta la lectura de ese archivo
sin decir cuanto quedaba detras. Un `lineas_ilegibles` de 1 significa "al menos
una", nunca "exactamente una", y **no hay error que lo delate**: la lectura sale
bien a proposito, para no perder los dias que si se leyeron. Un visor que
muestre este numero debe decir "al menos N".

## Ciclo de vida: purga a 7 dias

El feed se purga a los **7 dias**: archivos con mas antiguedad que esa se
borran. El archivo del **dia en curso nunca se toca** — alguien puede estar
escribiendo en el en ese momento —, y la purga corre en segundo plano al
arrancar una sesion, sin bloquear nada y sin que un fallo suyo sea visible
para quien trabaja.

## Como se lee: no es para un bucle de polling

Hay **dos superficies distintas**, para dos necesidades distintas:

- **El latido en vivo** ("algo esta cambiando ahora mismo") se resuelve
  **leyendo el archivo del dia directamente**. Es la via barata.
- **La vista digerida** (que cambio, agrupado y legible) se resuelve
  **llamando al verbo que lee el feed**. Arrancar el binario del runtime tiene
  un costo notable por invocacion — del orden del segundo —, asi que meter ese
  verbo en un `setInterval` o equivalente degradaria cualquier interfaz que lo
  haga. Un visor que necesite refrescarse a cada rato debe leer el archivo, no
  invocar el verbo en bucle.

## Lo que este feed no trae en esta fase

El registro **no lleva sesion ni agente**: no identifica que instancia de
trabajo produjo el cambio. No es un descuido — el runtime, en esta fase, no
recibe ese dato al emitir — y no esta prometido en ningun otro lugar de este
documento. Un dato ausente y declarado es preferible a uno inferido y
mostrado como si fuera cierto.

## El feed de archivos: lo que edita la cognicion bajo `agent-os/`

Segundo feed, mismo directorio, formato distinto. Mientras el feed del FOCO
registra cambios en el grafo (nodos y aristas), este registra el **hecho** de
que un archivo bajo `agent-os/` nacio o cambio — sin interpretar su
contenido. Un visor externo lo usa para mostrar, en vivo, que archivos estan
tocando varias sesiones a la vez.

### Donde vive el carrete

`agent-os/.actividad/archivos-YYYY-MM-DD.tsv`

- Un archivo **por dia**, con la fecha **local** de quien escribe — mismo
  criterio que el feed del FOCO.
- El directorio esta **gitignorado**: es rastro operativo, no un artefacto
  para versionar.
- Sin rotacion, por la misma razon que el feed del FOCO: rotar moveria un
  archivo que otra sesion puede estar escribiendo a la vez.
- Lo escribe un hook de shell en el camino de cada edicion (`Edit`/`Write`
  bajo `agent-os/`) — por eso es TSV y no JSON: construir JSON con
  `grep`/`sed` en ese camino caliente seria fragil.

### Las cinco columnas exactas

Cada linea trae, separadas por tabulador, **exactamente cinco columnas**:

| # | Campo | Valor |
|---|---|---|
| 1 | momento | hora ISO-8601 con offset (ej. `2026-08-30T10:07:15-05:00`) |
| 2 | evento | `nace` \| `cambia` \| `?` |
| 3 | ruta | relativa a la raiz del repo, siempre bajo `agent-os/` |
| 4 | sesion | id de la sesion que edito |
| 5 | agente | ver "El quinto campo es el agente" abajo — **puede venir vacio** |

**El quinto campo vacio es la trampa del formato.** Cuando lo escribe el
agente principal, la columna 5 queda vacia — pero el tabulador que la separa
de la columna 4 sigue ahi, y la linea sigue teniendo cuatro tabuladores
(cinco campos). Un corte ingenuo que se queda con lo que haya tras el ultimo
tabulador no vacio se come ese campo final, y la linea del agente principal
queda con cuatro campos en vez de cinco — indistinguible, para un lector
descuidado, de una linea corrupta. Quien lea este carrete tiene que
**preservar** el campo vacio, no descartarlo.

### Los tres eventos

- **`nace`** — el archivo no existia antes de la edicion.
- **`cambia`** — el archivo ya existia.
- **`?`** — **dato ausente declarado, no un error.** Se emite cuando no hubo
  forma de saber si el archivo existia antes de editarlo: la anotacion previa
  a la edicion no corrio, o no se pudo emparejar con esta. Nunca se adivina
  entre `nace` y `cambia` — inventar seria un dato plausible y falso.

### El quinto campo es el agente

- **Vacio** — escribio el agente principal.
- **El id del subagente** — escribio un subagente, identificado por su propio
  id (los subagentes comparten el `session_id` de la sesion, pero no este
  campo).
- **`runtime:{verbo}`** — forma prevista para cuando un verbo del propio
  runtime escriba al carrete. **Es la Fase 2B y hoy no ocurre**: ningun verbo
  emite todavia con esta forma. No se busque en ningun carrete real.

### El carrete no lleva el sujeto

El carrete no dice de que diseño o work cuelga cada ruta. Esa derivacion —por
casos, sobre la ruta bajo `agent-os/`— vive en un **solo sitio**: el verbo
que digiere el carrete, y en ningun otro. Que quien escribe tambien la
calculara repartiria la regla entre dos mundos, que es exactamente donde se
desincronizaria si un caso nuevo se agrega en uno y no en el otro.

### Las rafagas se colapsan en el verbo, no en el carrete

El carrete es tonto a proposito: una linea por edicion, sin agrupar. Ocho
ediciones seguidas del mismo archivo son ocho lineas. El colapso —convertir
esas ocho lineas en una entrada con `veces: 8`— lo hace el verbo que lee, no
quien escribe: escribir esta en el camino caliente de cada edicion y no
puede pagar ese costo.

### `existe` se resuelve al leer, no al escribir

El carrete no dice si el archivo sigue existiendo — solo dice lo que paso en
cada edicion. Si un archivo nacio y despues se borro, el carrete sigue
diciendo `nace` (el hecho de ese momento no cambia), pero el bit `existe` que
el verbo agrega se calcula contra el disco en el momento de la lectura, no
contra lo que el carrete registro.

### Purga: dos relojes, dos reglas

- **El carrete** (`archivos-YYYY-MM-DD.tsv`) se purga a los **7 dias**, por
  la **fecha del nombre del archivo** — igual que el feed del FOCO. El
  archivo del **dia en curso nunca se toca**.
- **Los scratch de emparejamiento** (`agent-os/.actividad/_pre/`, uno por
  tool-call entre la anotacion previa y la posterior a una edicion) se
  purgan por **minutos**, contra su **mtime** — no llevan fecha en el
  nombre, y su vida util normal es de segundos, no de dias. Uno que
  sobrevive mucho mas que eso es basura de una tool-call que nunca llego a
  completarse.

### No es para un bucle de polling

Mismo criterio que el feed del FOCO: el latido en vivo se resuelve leyendo
el archivo del dia directamente; la vista digerida (agrupada, con el sujeto
resuelto) se resuelve llamando al verbo, que cuesta un arranque de binario
por invocacion.

## La salida del verbo que digiere el carrete

Es lo que un visor consume de verdad — documentar solo el TSV crudo dejaria
sin describir la unica forma que el consumidor lee.

- **`sujetos[]`** — uno por diseño o work con actividad, con `tipo`
  (`diseno` \| `work`) y `slug`, y su lista de `archivos[]`.
- **`archivos[]`** (dentro de cada sujeto, y en `huerfanos[]` con la misma
  forma) — cada entrada trae:
  - `ruta`
  - `evento` — el mas informativo visto: un `?` se pisa con el primer evento
    real que aparezca despues para esa ruta; un evento real nunca se pisa
    con un `?` posterior.
  - `primero` / `ultimo` — momento de la primera y la ultima linea de esa
    ruta en la ventana leida.
  - `veces` — cuantas lineas colapso esa entrada.
  - `escritores` — **un array de objetos `{sesion, agente?}`, no de
    cadenas.** `agente` se **omite** cuando escribio el agente principal
    (nunca viaja como cadena vacia). Puede haber menos escritores que
    `veces`: una linea sin sesion firmada sube `veces` y no deja rastro
    aqui.
  - `existe` — resuelto contra el disco al momento de leer (ver arriba).
- **`huerfanos[]`** — misma forma que `archivos[]`, para lo que cuelga de
  `agent-os/` sin pertenecer a un diseño o a un work (standards,
  conocimiento). Al filtrar por un sujeto puntual, `huerfanos[]` no se
  devuelve: por definicion no cuelgan del sujeto pedido, y devolverlos seria
  ruido.
- **`lineas_ilegibles`** — mismo criterio que en el feed del FOCO: es un
  **PISO**, no un total.

## Alcance del feed de archivos: lo que no ve

Dicho sin rodeos, para que este documento no prometa mas de lo que el codigo
cumple:

- **Lo que escribe el propio runtime** — por ejemplo, un work naciendo
  entero. Es la Fase 2B, y todavia no ocurre.
- **Lo que se edita con un editor externo** — fuera de las herramientas de
  edicion de la cognicion.
- **Lo que se escribe con Bash y redireccion.**
- **Lo que se borra con `rm`.**

De estos cuatro, la Fase 2B cubre el primero. Los otros tres no tienen una
señal fiable que capturar, y **eso es una propiedad del alcance, no un
defecto oculto**: no hay hook que intercepte un editor externo o una
redireccion de shell.
