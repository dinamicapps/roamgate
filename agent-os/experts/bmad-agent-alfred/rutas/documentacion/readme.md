# Ruta: documentacion

> Entregable: prosa para un humano lector. Anfitriona del discovery y la redaccion: **Paige**. Es una de las DOS rutas que conservan E1.

## Cuando aplica

El abordaje destilo que el entregable es **prosa leida por un humano** (manual de usuario, guia de onboarding, documentacion tecnica) — NO conocimiento consumido por otro work (eso es `investigacion`).

## Sub-flow (E1 + E2 + E3 + E4)

```
abordaje (ya hecho; Fase 4 define los documentos del work y la plantilla de
          cada uno -> `## Entregables`, y captura `audiencia_documento`)
   |
   E1  Paige (+ Mary asistiendo) define audiencia detallada -> CAs de cobertura editorial + TOC
   |
   E2  piezas/plan.md (modo documentacion): Paige anfitriona, Bob materializa las tareas documentales
   |
   E3  piezas/ejecucion.md (modo documentacion): Paige redacta secciones (Tessa screenshots si aplica)
   |
   E4  piezas/verificacion.md (modo documentacion): Quinn verifica; Paige validate-doc, usuario objetivo valida
```

## Documentos, plantillas y audiencia

Un work de documentacion produce uno o varios documentos, cada uno con su plantilla (o sin
ella) y, si hace falta, su propia audiencia. En el abordaje (Fase 4), Alfred pregunta que
documentos producira el work y Paige propone, por documento, plantillas del catalogo; el
usuario elige. El resultado queda en la seccion `## Entregables` del README.

- **Catalogo:** dos zonas, la del sistema (`agent-os/templates/documentacion/`, semillas) y la
  del repo (`agent-os/plantillas/documentacion/`, plantillas y kits del equipo). Si un slug esta
  en las dos, gana la del repo.
- **Kit:** una plantilla del repo puede traer, ademas de la estructura, como se llena cada
  seccion (`llenado`) y como se generan sus salidas en cada formato (`salidas[].via`).
- **Un solo documento:** `plantilla_documento` y `audiencia_documento` viajan en el bloque
  `documentacion{}` del payload de `work open`, que los hornea (guards `PLANTILLA_NO_ENCONTRADA`
  y `PLANTILLA_AMBIGUA`).

Graceful: si el catalogo no existe o esta vacio (instalacion vieja), Alfred lo anuncia y
continua sin plantilla. Si el usuario no responde audiencia, el campo queda ausente y Quinn lo
trata como brecha en E4.

<!-- FUENTE: agent-os/templates/documentacion/README.md seccion "Zonas". Zonas, formas, slug, resolucion, descriptor y vias viven alli. NO duplicar -- para modificar, editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Campos especificos del modo `documentacion`". NO duplicar el schema de audiencia_documento/plantilla_documento ni el de ## Entregables -- editar la fuente. -->
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md seccion "Documentos del work (ruta documentacion)". El momento y la mecanica de la seleccion viven alli. NO duplicar -- editar la fuente. -->

## Variante: insumo de sesion grabada

Cuando aplica: el abordaje capturo material de sesion (los campos
`sesion_material_mpa`, `sesion_material_video`, `sesion_dominio_cruce` viajaron al
`work open` — ver `agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md`
seccion "Campos que exige la ruta al abrir el work").

- **Encuadre del programa (antes de G1, no bloqueante):** una sesion no se
  destila en el vacio — es la sesion N de un programa. Alfred abre con
  `agentos conocimiento cobertura` (o `--territorio {id}` si el
  `sesion_dominio_cruce` ya acota) y le muestra al humano que territorios siguen
  `sin tocar` y cuales ya tienen material. Es la unica forma de responder que
  quedo sin capturar: la cobertura editorial que Quinn mide en E4 responde otra
  pregunta (si el documento cumplio su indice, no si el sistema quedo cubierto).
  La vista nunca dice "cubierto" — no hay denominador — asi que se lee como
  mapa de huecos, no como semaforo. Si el repo no declara territorios, el verbo
  responde `disponible: false` y la variante sigue igual.
- **G1 (bloqueante, antes de E1):** el runtime lista los hablantes con
  `sesion abrir`; el humano rotula cada uno `fuente|receptor` via
  `AskUserQuestion`; el sufijo `- DinamicAPPS` precarga `fuente`. Sin rotulado no
  se destila. **El rotulado se persiste antes de cerrar el gate**, con
  `agentos sesion indexar --mpa {ruta} --sesion-id S1 --fecha AAAA-MM-DD
  --autoridad "speaker_0=fuente,speaker_1=receptor" --out
  agent-os/work-records/{slug}/indice-sesiones.yml`. El indice es lo unico que
  sobrevive del material crudo: sin el, cada cita `[S1 · 00:20:55]` que E3
  escriba nace huerfana y no hay con que verificarla. El verbo falla si algun
  hablante quedo sin autoridad (`ROTULADO_INCOMPLETO`) o si se rotulo un
  `speaker_id` que no existe en el `.mpa` (`HABLANTE_DESCONOCIDO`) — el gate no
  se da por cerrado hasta que el indice existe.
- **E1 con insumo de sesion:** Paige conduce, Mary asiste; destilacion por
  ventanas; capturas por necesidad; cruce documental. Produce corpus + preguntas
  + conflictos + candidatos a promocion.

  El procedimiento del cruce no se repite aqui: vive en el skill y se
  referencia con puntero. Lo que este readme declara es en que etapa ocurre, no
  como se hace.

  <!-- FUENTE: agent-os/skills/destilar-sesion/SKILL.md seccion "Cruce documental". El procedimiento (que arboles se recorren, los enlazados por el README, que autoridad se cruza) vive alli. NO duplicar -- para modificar, editar la fuente. -->

- **G2 (bloqueante, E1 -> E2):**

  Antes de decidir, G2 consulta las preguntas que sesiones anteriores dejaron vivas
  en los territorios que esta sesion toca:
  `agentos conocimiento consultar --territorio {id} --abiertas`. El conjunto de
  territorios es el `sesion_dominio_cruce` declarado (por coincidencia exacta de id)
  mas los de todo `seccion_destino` ya propuesto; si la union sale vacia, se consulta
  sin `--territorio`. Una pregunta que este material responde se cierra con
  `agentos conocimiento resolver --pregunta {K-NNN} --work {slug}`.

  Las tres clases de decision (preguntas,
  conflictos, promociones), en una sola compuerta. Solo la cubeta
  `modelo-trabajo-cliente` llega al gate como promovible; `solicitud`,
  `falsa-afirmacion` y `comparacion-otro-sistema` no llegan al gate: van
  directo a hallazgos.
- La promocion conserva la autoridad, y aterriza bajo el marcador de seccion:

  ```markdown
  ### Contexto de operacion del cliente
  <!-- agent-os:contexto-cliente sesion=S1 -->
  ```

- **E3:** procedencia inline `[S1 · 00:20:55]` y bloque `Sesiones referenciadas`
  al pie del documento enriquecido, con enlace al work-record.

<!-- FUENTE: agent-os/skills/destilar-sesion/SKILL.md seccion "Autoridad por hablante". Las reglas de autoridad, cubetas y escalamiento viven alli. Aqui solo se declara donde entran en el flujo de la ruta. NO duplicar -- para modificar, editar la fuente. -->

## Variante: re-plantillado

Cuando aplica: el work toma documentos existentes y produce, **al lado** de cada uno, una
version nueva que sigue una plantilla (recien creada o actualizada, o una que el documento nunca
uso). Se reconoce porque alguna fila de `## Entregables` tiene la columna Origen.

Entradas: `/alfred "re-plantillar {documento} a {plantilla}"`, los candidatos que lista
`/alfred maintain plantillas`, o la oferta de Paige tras actualizar una plantilla.

- **Abordaje:** cada documento a re-plantillar es un entregable con Origen (el documento
  fuente), plantilla destino y Documento nuevo. El Documento nuevo es un archivo distinto del
  Origen: Paige propone el nombre y el usuario lo confirma. El Origen puede ser cualquier
  documento del repo, incluso uno anterior a agent-os; si lo produjo un work, ese slug va en
  `insumos_origen`. Un lote de N origenes es un work con N entregables.
- **E1 -- mapa de conservacion:** Paige produce `etapa-1/mapa-conservacion.md` (un bloque por
  entregable, desde la semilla `agent-os/templates/work-record/etapa-1/mapa-conservacion.md`) en
  dos direcciones:
  - origen -> plantilla: donde queda cada bloque del original (seccion destino, descartado con
    razon, o sin lugar como desviacion declarada);
  - plantilla -> origen: con que se llena cada seccion de la plantilla (contenido del origen,
    hueco o no aplica). Llenar un hueco con el `llenado` **amplia el alcance y lo decide el
    usuario**.

  Re-plantillar no re-investiga el contenido: lo que parezca desactualizado es un hallazgo y no
  se corrige en silencio, salvo que el usuario amplie la meta.
- **E2-E3:** Paige redacta el documento nuevo siguiendo el mapa y genera sus salidas con las
  vias de la plantilla. Las imagenes del original se referencian; se regeneran solo si la
  plantilla lo exige. El historial del documento nuevo registra "re-plantillado de {origen} a
  {plantilla}@{version}".
- **E4:** Quinn aplica los chequeos de re-plantillado.
- **Fuera de alcance:** retirar o redirigir el documento viejo. Si el usuario lo quiere, es otro
  work o un pendiente post-work.

<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-4.md seccion "Documentacion: entregables y re-plantillado". Los chequeos de Quinn viven alli. NO duplicar -- para modificar, editar la fuente. -->

## E1 — discovery con Paige

Paige (`A-Paige:`) + Mary definen la audiencia y producen CAs de cobertura editorial (secciones cubiertas, exactitud tecnica, legibilidad) + un TOC tentativo. Roster: Mary (audiencia/alcance), Winston, Sentinel, Sally (UI/wireframes), Tessa (screenshots), Quinn, Bob.

Por cada documento con plantilla (seccion `## Entregables`, o `plantilla_documento` si el work
no la tiene), Paige carga la plantilla resuelta en el catalogo y **deriva de ella el TOC + los
CAs de cobertura editorial** de ese documento; si es un kit, carga tambien su `llenado`. La
plantilla es punto de partida, no camisa de fuerza: las desviaciones (secciones agregadas,
quitadas o reordenadas) se declaran en el discovery, por documento. Las plantillas con
`capturas: recomendado`, o con `imagenes` via `experto:tessa`, anticipan la invitacion de Tessa
desde E2.

## E2-E3 — Paige anfitriona

En modo documentacion, Paige es anfitriona del plan (E2) y de la redaccion (E3) — distinto de los modos de codigo donde E2 es Winston y E3 es Amelia/Atlas. Las secciones son las unidades de trabajo (Bob las materializa como tareas tipo seccion-documento).

## Cierre

Documento commiteado en su ruta destino del repo (`.documentacion/`, `docs/`) listo para ser leido. Quinn verifica cobertura vs TOC + audiencia validada (idealmente con el usuario objetivo).

Quinn contrasta cada documento con plantilla contra el TOC derivado de ella en E1 (una
desviacion sin registro en el discovery es brecha) y exige que cada salida declarada en
`## Entregables` exista como archivo.

### Cierre con insumo de sesion

**Que sale del work al cerrar:** documentacion enriquecida, capturas usadas,
glosario actualizado. **Que se queda dentro:** corpus de afirmaciones, indice
de sesion, registro de decisiones G2, hallazgos y preguntas pendientes. **Que
nunca entra al repo:** el `.mpa`, el video, los frames descartados.

**Reflexion sobre el metodo, nunca sobre el contenido:** el work emite
aprendizaje solo sobre el metodo -- que tipo de afirmacion se resistio a
clasificar, que fallo en el cruce, donde el rotulado de autoridad fue dudoso.
Nunca sobre el contenido de la sesion. Sin esta restriccion, el dominio de una
capacitacion concreta se filtraria al ADN de los expertos como contexto
permanente, en contra de la invariante de no-carga de abajo.

**Antes de cerrar:** `agentos conocimiento anotar --work {slug}` deriva del corpus las
entradas del indice de programa. El cierre no procede sin esto
(`CONOCIMIENTO_NO_ANOTADO`). Las reglas candidatas que se decida promover se
registran en el modelo de pruebas del repo y se vinculan con
`agentos conocimiento promover --candidata {K-NNN} --regla-id {id}`.

**Invariante de no-carga:** ningun skill, hook o tarjeta puede listar el
corpus, el indice, los hallazgos ni el registro de decisiones como lectura
obligatoria al abrir un work. Va en los dos lugares a proposito: el schema lo
ve quien toca los campos, y el readme de la ruta lo ve quien extiende el
flujo. La invariante no tiene mecanismo que la imponga, asi que su unica
defensa es aparecer donde alguien la vaya a leer antes de romperla.

| Experto | Con insumo de sesion |
|---------|----------------------|
| Paige | conduce la destilacion por ventanas y la redaccion con procedencia inline |
| Mary | asiste en el cruce documental y en clasificar la ambiguedad |
| Tessa | ejecuta `sesion capturar` anclado a afirmaciones, nunca por barrido |
| Quinn | chequeos 1-7 sobre el corpus, ademas del 8 (cobertura editorial) |
| Alfred | conduce G1 y G2 |

Ningun experto nuevo entra al roster: Winston, Sentinel, Sally y Bob conservan
su rol.

## Curaduria de plantillas

Paige mantiene vivo el catalogo con su capacidad `CP`. Tres disparadores:

| Momento | Donde | Que observa |
|---|---|---|
| Abordaje | Fase 4, cuando un documento queda sin plantilla o el usuario pide crear una | el pedido y el destino declarado |
| Cierre | pieza de cierre, paso 1b | los destinos y familias de los documentos entregados |
| Bajo demanda | `/alfred maintain plantillas` | todo el repo, incluidas las ediciones humanas posteriores a la entrega |

Toda accion (crear, actualizar, adoptar, sombrear, normalizar, consolidar un generador o crear
una via) se confirma con el usuario, sin importar el `nivel`, y queda en
`agent-os/plantillas/documentacion/_curaduria.md`.

<!-- FUENTE: agent-os/experts/bmad-agent-paige/references/curar-plantillas.md seccion "Modos de invocacion". Senales, acciones y registro viven alli. NO duplicar -- para modificar, editar la fuente. -->

## Reevaluacion

Caminos (a)/(b)/(c)/(d). El entregable a contrastar es secciones cubiertas vs TOC + audiencia validada. Ver `piezas/reevaluacion.md`.
