# Schema del modelo del work (`modelo.yml`)

> <!-- FUENTE: agent-os/templates/diseno/schema/modelo.md seccion "Portadores del modelo". Alli vive el contrato COMPARTIDO por los dos portadores: los tipos de nodo, sus campos, los estados y los extremos por arista. Aqui solo lo propio del work. NO duplicar la tipologia — para modificarla, editar la fuente. -->

Un work porta su propio `modelo.yml` en `agent-os/work-records/{slug}/modelo.yml`.
Cuando nace de un diseño, **no es un artefacto nuevo**: es el subgrafo del
modelo del diseño que a este work le toca, con la misma tipologia y los mismos
ids. Cuando nace reconstruido esos mismos ids y esa misma tipologia se
mantienen, pero el contenido lo declara la evidencia propia del work, no un
diseño — ver "Camino reconstruido" abajo.

Un `modelo.yml` de work nace por uno de **dos caminos**. Ya no es cierto que
hagan falta coordenadas para que exista — el camino reconstruido lo crea sin
ninguna — asi que lo que sigue describe cuando hace falta cada una.

**Camino derivado.** Hacen falta **tres condiciones**, no dos: `diseno_origen`
(de que diseño viene), `work_paraguas` (que fila del plan de works es este) y
que ese diseño de origen **tenga su propio `modelo.yml`** en disco. Faltando
cualquiera de las tres no hay nodo `work` del cual derivar un subgrafo, y
entonces el work no tiene `modelo.yml` por esta via. Cuando el work nace con el
molde del README completo — el de las rutas `diseno`, `acotado`, `bugfix`,
`investigacion`, `documentacion` y `rediseno-ui` — el bloque `## Terreno` puede
seguir estando ahi, porque ese molde lo siembra siempre, tenga o no las tres
condiciones; sus marcadores quedan vacios hasta que algo los llene, lo cual es
legal, no un error (ver "Retrocompatibilidad"). Los otros tres moldes no llevan
esa seccion al nacer: la bitacora del `hotfix`, el README del
`colaborador-fastrak` y el esqueleto minimo.

**El molde no lo elige la ruta.** Lo eligen el contenido del payload y la flag
`--modo` de la invocacion. `work open` decide en este orden: un payload con
bloque `fastrak` da el README del colaborador-fastrak; `--modo hotfix` da la
bitacora — es flag, no campo del payload, y ningun campo del payload la
sobrescribe —; un payload vacio da el esqueleto minimo; cualquier otro da el
README completo. Las seis rutas de arriba llegan al README completo porque su
payload siempre trae `ruta` y nunca un bloque `fastrak`, y porque se invocan con
un modo distinto de `hotfix` — no porque el runtime mire la ruta. Un payload
que combine ambas cosas (por ejemplo `ruta: diseno` junto con un bloque
`fastrak`) sale por la primera rama, no por la de su ruta.

**Camino reconstruido.** Sin las tres condiciones de arriba, un work puede
tener igual `modelo.yml`: `modelo emitir --portador work` lo hornea desde la
evidencia propia del work — sus tareas, `## Abordaje`, `## Decisiones clave`,
`## Archivos modificados` — sin pasar por ningun diseño. Con el molde del README
completo, los marcadores del bloque (`<!-- modelo:start vista=terreno --> ...
<!-- modelo:end -->`) ya no dependen de que las tres condiciones del camino
derivado se hayan cumplido: ese molde los siembra siempre, al crear el work. Si
el README nacio con un molde mas antiguo o los perdio por edicion manual, y por
eso no tiene ninguno de los dos marcadores, `agentos work terreno` los siembra
el mismo en su lugar canonico en vez de fallar; solo falla con
`MARCADORES_AUSENTES` cuando el bloque esta malformado — duplicado, o el fin
antes del inicio —, porque ahi si hay mas de un candidato y elegir seria
inventar. El contenido entre marcadores se escribe *cuando* el `modelo.yml`
existe y `agentos work terreno` corre — no antes, y no por el solo hecho de
tener el `modelo.yml`.

**Que molde queda fuera, y cual no.** Lo decide el CUERPO del archivo raiz: que
ya traiga el bloque, o que traiga una **seccion ancla** (`## Decisiones clave` o
`## Archivos modificados`) antes de la cual sembrarlo. No lo decide la ruta ni
el nombre del archivo raiz.

- La bitacora del `hotfix` y el README del `colaborador-fastrak` **quedan
  fuera**: no tienen ninguna de las dos secciones, asi que no hay lugar canonico
  donde poner el bloque. `agentos work terreno` responde `MOLDE_SIN_TERRENO` sin
  tocar el archivo, y `work open` no lo escribe por la puerta de atras.
- El **esqueleto minimo NO queda fuera**. No trae el bloque al nacer, pero su
  `## Archivos modificados` es seccion ancla: `agentos work terreno` se lo
  siembra y el camino reconstruido le aplica entero.

## Lo propio del portador work

| Campo | Valor | Quien lo pone |
|---|---|---|
| `origen` | dos formas: derivado `{diseno_slug}#{id_nodo}`, reconstruido `work:{slug}#{referencia}`. El contrato completo — las cuatro referencias admitidas y quien declara/valida/congela cada forma — vive en el schema compartido, seccion "Las dos formas de `origen`" | ver esa seccion |
| `rol` | `construye` \| `consume` | derivado: el horneado, resuelto por el arbitraje (ver abajo). reconstruido: la cognicion, al emitir; el mecanismo de quien declara y quien congela es el mismo que `origen` — ver el schema compartido, seccion "Quien declara `origen` y `rol`, y quien los congela" |
| `reconstruido` | bloque a nivel de MODELO (no de nodo): `desde`, `fecha`, `cobertura_declarada` | `modelo emitir --portador work`, en su primera emision sobre ese `modelo.yml` — sin importar si el modelo tiene o no nodos derivados de un diseño; el contrato completo vive en el schema compartido, seccion "El regimen `reconstruido`" |

`rol` responde UNA pregunta: **¿este nodo es entrega de este work?** `construye`
es si; `consume` es no. No describe una relacion de uso — un `hallazgo` no se
"consume" en ningun sentido literal —, sino la responsabilidad de entrega.

Como se resuelve `rol` en el camino **derivado**, al hornear:

1. Hay una arista `CONSTRUYE` explicita en el diseño → manda, **si ese work alcanza el nodo**.
   Un `CONSTRUYE` hacia un work que no lo alcanza no resuelve nada (el nodo no viajaria a su
   modelo) y cuenta como sin arbitrar.
2. El nodo es alcanzable desde **un solo** work → ese lo construye, sin declarar nada.
3. Alcanzable desde **varios** y sin `CONSTRUYE` → `NODO_COMPARTIDO_SIN_ARBITRO`
   bloquea el cierre de la fragmentacion, en el diseño, antes de que el work exista.

El `proceso` que el work contiene lleva `construye` siempre. Los tipos que no
pueden ser entrega (actor, restriccion, capacidad, escenario, pregunta,
hallazgo, decision, riesgo) llevan `consume` siempre: son terreno o son meta.
En el camino **reconstruido** no hay arbitraje que resolver: `rol` lo decide
quien emite, nodo por nodo.

Un caso que conviene reconocer al leer el modelo de un work: un nodo `obsoleto`
puede aparecer **sin** `reemplazado_por` aunque en el diseño lo tenga. Significa
que su sucesor no es terreno de este work. Su `razon` sigue ahí, y `origen`
lleva al nodo del diseño, donde el puntero está completo.

## El historial no viaja

El nodo horneado nace con `historial` **vacio**. El historial es libro-mayor del
runtime que escribio esos cambios; copiarlo atribuiria al work cambios ocurridos
en otro modelo, bajo otro portador. En el camino derivado la historia no se
pierde: `origen` apunta al nodo del diseño, donde esta completa. En el camino
reconstruido no hay nodo de diseño al que apuntar — no existia ninguno —: lo que
`origen` referencia ahi es la evidencia del work (la tarea, el `## Abordaje`)
de la que ese nodo salio, no un historial previo.

## La frontera

Una `TRANSICION` que sale hacia un proceso de otro work pierde un extremo: no
puede ser arista de este modelo. Pero es informacion valiosa — es literalmente
el borde donde viven las cosas que nadie vio —, asi que **se reporta**:
`work open` la devuelve en su salida JSON como `frontera[]`, y la vista
`terreno` la pinta.

Absorberla es decision de otra fase. Aqui se declara como limite explicito.

## Aristas que no viajan

Del subgrafo viajan las aristas cuyos **dos** extremos quedaron incluidos, salvo:

- `CONTIENE` — el work no se contiene a si mismo.
- `DEPENDE_DE` — es coordinacion del paraguas, no terreno del work.
- `CONSTRUYE` — su informacion ya viaja sellada en el `rol` de cada nodo.

## Idempotencia

Si el work ya tiene `modelo.yml` (reapertura, reevaluacion, regreso al diseño),
el horneado **no lo pisa**: lo preserva y lo reporta. Un modelo de work puede
haber ganado hallazgos y re-citas propias, y machacarlo seria borrar trabajo
verificado.

Este "no pisa" describe el comportamiento por defecto; `agentos work terreno
--slug {work} --rehornear` es la via explicita que si re-proyecta, conservando
lo que el work emitio de propio.

## Quien lo lee

`agentos work terreno --slug {work}` proyecta el subgrafo y lo escribe entre
`<!-- modelo:start vista=terreno -->` y `<!-- modelo:end -->`, bajo `## Terreno`
en el README del work. Ya no exige que esos marcadores existan de antemano:
si el cuerpo no tiene ninguno de los dos, los siembra en su lugar canonico y
escribe; si el bloque esta malformado — duplicado, o el fin antes del inicio
—, sigue fallando con `MARCADORES_AUSENTES`, porque ahi si hay mas de un
candidato y elegir seria inventar; y si el cuerpo no tiene donde alojarlo
—ninguna seccion ancla— sale `MOLDE_SIN_TERRENO` sin tocar el archivo. Fuera de esa siembra inicial es
idempotente y no toca una linea del cuerpo fuera de los marcadores (el
frontmatter se reserializa normalizado al reescribir el archivo). `work open`
lo invoca al hornear; el verbo tambien es el camino de recuperacion si alguno
de los dos pasos fallo.

`agentos modelo validar --slug {work} --portador work` corre las tres compuertas
del portador: la forma, `ORIGEN_NO_RESOLUBLE` y `ROL_AUSENTE`. No escanea prosa
y no admite `--etapa`: las etapas son del ciclo del diseño.

Y sobre todo lo lee **el anfitrion de la Etapa 2 antes de planificar**: un nodo
con `rol: construye` es entrega de este work; uno con `rol: consume` es terreno
que hay que respetar y no rehacer. Esa es la razon de ser del bloque — un modelo
que nadie lee no reduce ningun error.

## Retrocompatibilidad

Un work sin `diseno_origen` —o con el pero sin `work_paraguas`, o cuyo diseño de
origen no tiene `modelo.yml`— no tiene `modelo.yml` **por el camino derivado**.
Cuando nace con el molde del README completo (rutas `diseno`, `acotado`,
`bugfix`, `investigacion`, `documentacion`, `rediseno-ui`) eso ya no lo deja sin
grafo: el sistema lo emite al abrir, de oficio, por el camino reconstruido — sin
que nadie lo pida (ver "Camino reconstruido" arriba). Sigue siendo una accion
explicita de quien emite solo cuando el backfill ocurre despues, sobre un work
que ya existia sin grafo: `modelo emitir --portador work`. Un work `hotfix` o
`colaborador-fastrak` queda sin grafo indefinidamente por defecto: su cuerpo no
tiene el bloque `## Terreno` ni seccion ancla donde sembrarlo, y la instruccion
cognitiva que lo llena no corre para el. El **esqueleto minimo** es distinto: no
nace con el bloque ni con instruccion que lo dispare, pero nada le impide
ganarlo despues por backfill — `modelo emitir --portador work` seguido de
`agentos work terreno`, que se lo siembra sobre su `## Archivos modificados`.
Los works ya existentes no se migran.
