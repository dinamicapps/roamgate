# El ciclo de una etapa

> Fuente unica del molde que instancia cada etapa del regimen `modelo`. Una tarjeta de step
> NO repite estos pasos: los apunta y declara solo lo suyo — su subgrafo de entrada, que
> emite, que valida y su frontera de artefacto.

## El principio

**La prosa se produce a partir del grafo y es trazable.** No se elimina la prosa: lo que por
estructura no cabe en el grafo —un E/R dibujado, una deriva observada, la razon por la que
algo se decidio asi— vive mejor en prosa. Lo que se le quita es el rol de **fuente**.

**La prosa declara a que nodo explica.** No toda la prosa: la que no es de un nodo —un E/R,
una deriva observada, el sello de un experto— no lleva marcador y eso esta bien. Lo que si
lo llevan son los cinco tipos que el runtime reclama: `decision`, `proceso`, `regla` nueva,
`entidad` nueva y `operacion_cripto`. Ver `agent-os/templates/diseno/schema/modelo.md` seccion "Que nodos exigen
prosa".

**Quien cierra el nodo, escribe su prosa: ninguna etapa cierra `resuelto` un nodo cuya prosa
viva en el artefacto de una etapa posterior.** Lo deja `abierto` con los campos que ya se
sepan —admitir campos no es cerrar— y lo cierra la etapa dueña de ese artefacto.

**Por que, y no es prolijidad.** El indice que enlaza cada nodo con su explicacion se queda
con el **primer** marcador que aparece al recorrer los `.md` del diseño, y el recorrido es
alfabetico: `bitacora.md` gana sobre `datos.md` y sobre `procesos/`. Una etapa temprana que
ancle en su propio archivo un nodo que se explica mas adelante hace dos daños a la vez —
captura el enlace del grafo para siempre, dejando inalcanzable la explicacion canonica, **y
gasta el chequeo**: `NODO_SIN_PROSA` queda satisfecho, asi que la etapa dueña nunca reclama
la narrativa que le tocaba escribir.

De los cinco tipos, el reparto que sale de esa regla: la `decision` la ancla la etapa que la
toma —su casa **es** el argumento, y ninguna etapa posterior se lo disputa—; la `entidad`
nueva la ancla la etapa de datos en `datos.md`; la `operacion_cripto` la ancla la etapa
criptografica en `criptografia.md`; el `proceso` y la `regla` nueva los ancla la
etapa de procesos en el contrato del proceso.

## Los ocho pasos

1. **Partir del grafo.** Leer el subgrafo que le toca a la etapa. No releer el brief para
   reconstruir lo que la etapa anterior ya declaro.

   La tabla "Lo propio de esta etapa" de cada tarjeta declara ese subgrafo en la fila
   **`Consume`**, con los tipos de nodo entre backticks. No es documentacion: el runtime la lee
   para calcular que etapas hay que re-recorrer cuando un nodo cambia
   (`agentos modelo impacto`). Cambiar lo que una etapa lee **es** cambiar esa fila.
2. **Trabajar** con la tecnica y el juicio del experto. Es lo que el experto aporta y no se
   mecaniza.
3. **Emitir por lote** al cerrar: `agentos modelo emitir --slug {slug} --etapa {etapa}`.
   Unico camino de escritura del modelo. Nunca editar `modelo.yml` a mano.
4. **Validar la etapa:** `agentos modelo validar --slug {slug} --etapa {etapa}`. Mecanico, y
   es lo unico que bloquea el cierre.
5. **Generar el documento desde el grafo** con
   `agentos modelo proyectar --slug {slug} --vista {vista}`, reemplazando lo que hay entre
   los marcadores `modelo:start`/`modelo:end`. Lo de afuera es del experto — y lo que de
   afuera **explica un nodo** se ancla con `<!-- nodo: {id} -->` en su propia linea. Un
   marcador puede nombrar varios ids separados por coma. El marcador nombra un id, asi que
   se escribe **despues** de emitir (paso 3); y el paso 4 no queda limpio hasta que existe,
   porque `NODO_SIN_PROSA` lo reclama — si la etapa cerro nodos que exigen prosa, se ancla y
   se re-valida.
6. **Refrescar el grafo:**

       agentos modelo grafo --slug {slug} --vista todo \
         --dot agent-os/disenos/{slug}/grafo.dot \
         --svg agent-os/disenos/{slug}/grafo.svg

   **Es diagnostico, no compuerta:** su ausencia nunca bloquea el cierre, y por eso va
   despues del paso 4. Se refresca en CADA etapa porque un grafo viejo miente, y porque
   sirve **mientras** se diseña — para ver que quedo suelto, que cluster crecio de mas, que
   pregunta sigue abierta. Uno que solo existiera en el handoff llegaria cuando ya no hay
   decisiones que tomar.

   Los dos archivos son **derivado puro** del `modelo.yml` y estan gitignorados: se
   regeneran en cualquier momento, y versionar un SVG por diseño y por commit seria peso
   muerto con su fuente ya versionada.

   Si la respuesta trae `graphviz_disponible: false`, el DOT **igual quedo escrito** (es
   texto, no depende del render) y la degradacion **se declara en una linea**, nunca en
   silencio:

       A-{experto}: El grafo salio en DOT pero sin imagen: graphviz no resuelve
       (bin usado: {graphviz_bin}, vacio = PATH). Si esta instalado, declara su
       directorio con:
         agentos config set --archivo agent-os-local \
           --ruta graficos.graphviz_bin --valor {dir-bin}

   La causa mas comun observada no es que falte Graphviz sino que **este instalado y fuera
   del PATH**, asi que el mensaje nombra esa salida en vez de mandar a instalar lo que ya
   esta. El campo `graphviz_bin` de la respuesta dice que directorio se uso: sin el, no se
   distingue "falto declarar la ruta" de "la declarada esta mal".
7. **Si algo choca con una etapa anterior**, ofrecer el regreso (abajo).
8. **Si hay senal concreta que la justifique**, la tecnica adversarial corre sobre grafo +
   prosa + hilo previo, y su resultado pasa por el loop de cuatro caminos. No se aplica de
   rutina al cerrar: sin senal, el paso no existe.
9. **Si hubo regreso**, dejar la reflexion (abajo).

## El regreso

Cuando la etapa descubre que algo emitido por otra debe cambiar, el anfitrion **no lo
documenta y sigue**.

1. **Leer la procedencia.** El nodo trae `etapa:` — la que lo creo. Es dato, no memoria.
2. **Anunciarlo como el primer bloque del loop de cuatro caminos** (hallazgo + solucion
   propuesta, igual que cualquier otro hallazgo adversarial):

       A-{experto}: {lo que descubri} choca con `{id-nodo}`, que nacio en la etapa
       {etapa}. Propongo corregirlo aqui o regresar a esa etapa para que su anfitrion lo
       revise.

3. **Abrir los cuatro caminos de siempre sobre esa propuesta** — no hay menu aparte para el
   regreso, el anuncio ES la propuesta del loop. El usuario decide (aceptar, profundizar con
   otra tecnica, cancelar, o aportar contexto — incluyendo cual de las dos opciones
   prefiere) y el anfitrion ejecuta lo que resulte.
4. **Si el resultado es regresar:** el anfitrion de la etapa de origen ajusta y emite. Despues
   se calcula que hay que re-recorrer, y se re-recorre:

       agentos modelo impacto --slug {slug} --nodo {id-nodo} --desde {etapa-que-provoco-el-retorno}

   El verbo devuelve `etapas` (las que hay que volver a ejecutar, en orden) y `saltadas` (las
   que no, cada una con su razon). **Re-recorrer es ejecutar la etapa**: su anfitrion la
   conduce otra vez con el grafo nuevo delante, en el orden que el verbo devuelve, hasta
   llegar de nuevo a la que provoco el retorno.

   **Re-validar no basta, y por eso cambio esta regla.** `modelo validar` comprueba que la
   FORMA siga en pie; lo que un cambio del grafo pone en duda es el CONTENIDO de las etapas
   intermedias. Si en procesos aparece una funcionalidad nueva que ademas necesita
   persistencia, ningun predicado va a notar que Dexter tiene que volver a evaluar la
   persistencia — eso solo lo ve Dexter, re-ejecutando su etapa. Re-validar sigue ocurriendo,
   pero como consecuencia de re-recorrer, no como sustituto.

   **El alcance del calculo es de un salto**, y el verbo lo declara en su salida. Si el
   anfitrion ve que el impacto real llega mas lejos, lo dice y re-recorre mas: el calculo
   acota el trabajo, no reemplaza el juicio.

   **Si `etapas` sale vacio**, no hay nada intermedio que re-recorrer: el nodo nacio en la
   misma etapa que descubrio el problema, o ninguna etapa del tramo consume lo que cambio. Se
   sigue adelante desde donde se estaba.
5. **Un nodo sin `etapa:`** viene de un modelo anterior a esta capa. **Declararlo y
   preguntar**, no adivinar el origen por el tipo del nodo.

## La reflexion del regreso

Cada regreso deja una entrada para el experto de la **etapa de origen** — no para quien
retrocedio. Que no vio, y **que revision le habria hecho verlo**:

    echo '{...entrada...}' | agentos learn validar-candidato \
      --experto {experto-de-la-etapa-origen} --origen diseno --slug {slug} --dev {dev}

La evidencia es el nodo: `diseno/{slug}#{id-nodo}`.

**Por que importa:** un regreso repetido por el mismo motivo deja de ser disciplina del que
retrocede y pasa a ser una revision que el anfitrion de esa etapa no esta haciendo. Sin la
reflexion, esa senal se pierde y el sistema repite el mismo retroceso indefinidamente.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Los 4 caminos". Aqui solo se indica que el regreso se decide por ese loop. NO duplicar la regla — para modificar, editar la fuente. -->
