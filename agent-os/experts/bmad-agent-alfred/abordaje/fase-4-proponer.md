# Abordaje Fase 4 — Proponer ruta

## Proposito

Con la evidencia consolidada, presentar al usuario lo que el codigo dice, los drifts respecto a lo que dijo, y la ruta sugerida con razon. Obtener confirmacion.

## Reglas duras

- NO accion (Edit/Write sobre codigo) hasta que el usuario confirme la ruta.
- El drift se declara explicitamente (no se silencia ni se "arregla" reescribiendo el artefacto).
- La razon de la ruta sugerida se declara, y la razon de NO elegir la alternativa cercana tambien.

## Estructura de la propuesta

1. Lo que existe (resumen con cita).
2. Lo que falta o tiene problema (brecha con cita).
3. Drift respecto a lo que dijiste (si aplica).
4. Aportes de expertos / party / elicitation (si se activaron).
5. Alcance acotado (que cambia, que no, que queda fuera).
6. Suficiencia de evidencia (si `requiere-observacion`, explicar la consecuencia).
7. Ruta sugerida + razon.
8. Confirmacion: procedemos con esta ruta?

## Las rutas canonicas

| Ruta | Cuando aplica | Que hace Alfred al confirmar |
|---|---|---|
| `responder` | Pregunta informativa, sin cambio de codigo | Enruta al experto dueno del dominio (o a `Explore` si no tiene dueno) y cierra. Sin work-record. Ver `rutas/responder/`. |
| `bugfix` | Bug focal identificable (1-3 archivos), comportamiento erroneo, no agrega capacidad | Crea work-record bugfix. Atlas sabueso. Ver `rutas/bugfix/`. |
| `hotfix` | Incidente bajo presion temporal real (demo, prod caida, cliente esperando). NO es bugfix deliberado | Crea work-record `modo: hotfix`. Atlas conductor de emergencia, bitacora cronologica plana, pausa work activo. Ver `rutas/hotfix/`. |
| `acotado` | Feature pequena (1-5 tareas), reusables claros, sin multi-actor, sin sistema externo nuevo | Crea work-record. Bob materializa desde `## Abordaje`. Ver `rutas/acotado/`. |
| `diseno` | Multi-modulo, multi-actor, reglas heredadas, sistema externo nuevo | Invoca `/disenar` internamente. Mary modela. Luego piezas. Ver `rutas/diseno/`. |
| `rediseno-ui` | Rediseno UI/UX sobre base existente, discovery acotado de cadena de datos, NO modela datos nuevos | Crea work-record. Sally anfitriona. Flujo propio ligero: discovery acotado → iteracion → verificacion → cierre. Ver `rutas/rediseno-ui/`. |
| `investigacion` | El entregable es conocimiento consumido por otro work | Crea work-record `modo: investigacion`. Mary anfitriona. Ver `rutas/investigacion/`. |
| `documentacion` | El entregable es prosa para un humano lector | Crea work-record `modo: documentacion`. Paige anfitriona. Ver `rutas/documentacion/`. |

**Distincion investigacion vs documentacion** (obligatoria si ambas matchean): quien consume el entregable? Otro work / decisor tecnico -> `investigacion`. Un humano que abrira el archivo y lo leera -> `documentacion`. Si "ambas a la vez" -> son dos works encadenados (primero investigacion como insumo, luego documentacion); elige investigacion ahora.

**Nota `ruta` vs `modo`:** `investigacion`, `documentacion` y `hotfix` son ruta Y modo a la vez (coinciden por diseno). Al persistir: `investigacion`/`documentacion` escriben `ruta` Y `modo`; `hotfix` escribe SOLO `modo` (su work-record no usa el campo `ruta`). Las demas rutas escriben `ruta` con `modo` tipicamente `normal` (o el flujo `rediseno-ui`). <!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Modo del work" nota "hotfix (ruta-y-modo)". NO duplicar -- editar la fuente. -->

## Desempates entre rutas cercanas

Cuando dos rutas matchean, aplicar el criterio antes de caer en `AskUserQuestion` reactivo:

- **`acotado` vs `diseno`:** `acotado` si las tres se cumplen — <=5 tareas estimadas, sin multi-actor (<=1 actor nuevo en el flujo), sin sistema externo nuevo. Si **cualquiera** falla (6+ tareas, multi-actor, sistema externo nuevo, o regla heredada implicita que requiere modelado) -> `diseno`. La duda se resuelve hacia `diseno` (el costo de sub-modelar es mayor que el de sobre-modelar).
  - **Que cuenta como "actor":** un rol funcional distinto en el flujo (usuario final, administrador, sistema externo, proceso batch), NO una persona. El mismo humano en dos roles cuenta como 2 actores si el flujo los distingue (ej. quien crea la factura vs quien la aprueba). Metrica alineada con el detector de scope de Atlas (`rutas/bugfix/conversacion.md`: ">3 actores distintos").
- **`responder` vs `investigacion`:** ambas "sin codigo". Diferenciador: **hay un consumidor declarado del entregable?** Si el resultado lo consume otro work / decisor tecnico (se persiste como insumo) -> `investigacion` (`consumido_por`). Si es una respuesta que cierra en el chat sin entregable persistente -> `responder`.
- **`bugfix` vs `hotfix`:** `hotfix` solo si hay **presion temporal real** declarada (demo en curso, prod caida, cliente esperando). Sin presion real, es `bugfix` aunque el bug sea urgente subjetivamente.
- **Caso `acotado` (modelo de pruebas) vs `acotado` (codigo) / `documentacion` / `bugfix`:** la intencion es fundar o reforzar el modelo de pruebas de reglas de negocio -> **caso de `acotado` con ejecutor Quinn `[MP]`** (ver subseccion abajo), NO `acotado` generico ni `documentacion`: el entregable no es prosa para un lector humano, son dos artefactos normativos (`modelo-pruebas.md` + `reglas-negocio.yml`) mas pruebas ejecutables -- codigo con contrato, no narrativa. Tampoco es `bugfix`: no hay comportamiento erroneo puntual que corregir, es fundacion/ampliacion de cobertura.

### Ruta `rediseno-ui`

**Cuando proponerla.** Proponer `rediseno-ui` cuando concurren las cuatro senales:

1. El trabajo es **rediseno o ajuste de UI/UX**: re-alinear vistas a un sistema visual, adoptar tokens/componentes, ajustar layout, visualizacion o carga de datos en pantalla.
2. Existe una **base de diseno previa** (standards de UI, design tokens, libreria de componentes, o un diseno/epica origen): el trabajo NO requiere modelar datos o procesos nuevos.
3. Requiere **discovery acotado de la cadena de datos existente** de la pieza a reemplazar (de donde salen las listas desplegables, el origen de los datos del formulario/pagina, que SPs o APIs alimentan los catalogos) — pero NO discovery amplio del sistema.
4. Es predominantemente **mono-actor** y de cambio visual; puede tocar backend en el contrato de datos del componente (que consume, que envia) y en reorganizar origenes de listas/catalogos, pero no en logica de negocio nueva.

**Dos modalidades:** (a) **migrar** — llevar una vista al sistema de diseno (caso Nova: re-alinear a tokens/componentes); (b) **corregir-existente** — sanear una pagina ya creada que arrastra deuda (CSS in-line, componentes ad-hoc, origenes de datos desordenados).

**Distincion vs `diseno` (regla de oro):** `diseno` **crea** modelo de datos (E/R, tablas, CRUD nuevo, reglas heredadas implicitas a descubrir, multi-actor). `rediseno-ui` **mapea el existente** para preservarlo — discovery acotado a una pieza, bitacora de hitos, sin plan formal E2. Si en el analisis surge la necesidad de modelar datos o procesos nuevos, es `diseno`, no `rediseno-ui`.

**Distincion vs `acotado`:** `acotado` es una feature pequena generica (nuevo boton, campo, endpoint simple) con tareas discretas. `rediseno-ui` es trabajo de UI iterativo con loop ejecucion-verificacion en caliente, bitacora viva de hitos, y un invariante de calidad visual (Atomic Design + BEM sobre tokens) que `acotado` no tiene. Usa `acotado` si el cambio es un feature pequeno sin componente de sistema de diseno; usa `rediseno-ui` si el objetivo es alinear vistas a un sistema de diseno existente o sanear deuda visual.

### Caso de `acotado`: fundar o reforzar el modelo de pruebas (Quinn `[MP]`)

**Cuando proponerlo.** La intencion destilada es fundar o reforzar el modelo de pruebas de **reglas de negocio** del repo -- no un pedido de codigo generico ni un pedido de prosa. Ejemplos de intencion del usuario: "quiero cubrir con pruebas las reglas del modulo X", "fundar el modelo de pruebas de este repo", "faltan pruebas de reglas de negocio en Y".

**Por que es un caso de `acotado` y no una ruta nueva.** Persiste igual que cualquier `acotado`: crea work-record con `ruta: acotado`, `modo: normal`. Lo unico que cambia es el ejecutor de la fundacion -- en vez de que Bob materialice tareas directo desde el `## Abordaje`, Alfred activa a Quinn con su capacidad `MP`. No amerita una ruta dedicada: el sub-flow (plan -> ejecucion -> verificacion) es el mismo de `rutas/acotado/`, solo con Quinn como anfitriona de la fundacion y coordinadora de la Etapa 3.

**Que hace Alfred al confirmar.** Activa Quinn `[MP]`: funda (o refuerza) el modelo del repo -- `agent-os/standards/testing/modelo-pruebas.md` + `agent-os/standards/testing/reglas-negocio.yml` -- y coordina la Etapa 3 para que el ejecutor de desarrollo del work implemente las primeras pruebas bajo ese modelo; Quinn audita el contrato al cierre. Contrato completo, agnostico de stack: `agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md`.
<!-- FUENTE: agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md. El contrato completo de la fundacion (decisiones 1.1..1.4, artefactos, BR-1..BR-4, candados de autonomia) vive alli. Aqui solo la senal de ruteo. NO duplicar -- editar la fuente. -->

**Nota transversal: la obligacion de pruebas no es una ruta.** El caso de arriba aplica solo cuando la intencion del usuario es explicitamente fundar o reforzar el modelo. Independiente de eso, cualquier work -- `acotado`, `bugfix`, `diseno`, cualquier ruta de esta tabla -- que toque logica de negocio ya registrada en `agent-os/standards/testing/reglas-negocio.yml` arrastra la **obligacion de pruebas**. Alfred no la decide ni la propone aqui: el runtime la deriva comparando los archivos tocados por el work contra el registro (no contra la ruta elegida) y la enforza al cierre (verbo `work close`, gate `OBLIGACION_PRUEBAS_NO_DECLARADA`). El routing de esta fase sigue eligiendo la ruta con el criterio de siempre; la obligacion es una capa aparte que se activa o no en la Etapa 4, sin cambiar la ruta.
<!-- FUENTE: agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md seccion "5. Contrato BR-1..BR-4" + agent-os/skills/host-protocol/etapas/etapa-4.md (fila del chequeo `BR-1`..`BR-4`). El contrato del gate y el checklist de cierre viven alli. Aqui solo se declara que es transversal a la ruta, no una ruta nueva. NO duplicar -- editar la fuente. -->

## Tabla pedagogica intencion -> ruta

Mapa de ejemplos comunes (orientativo, no exhaustivo; si la intencion no encaja, regresar a Fase 2):

| Lo que el usuario pide | Ruta tipica |
|---|---|
| "como funciona X?", "por que pasa Y?" (sin cambio) | `responder` |
| "arregla el bug de Z" (focal, deliberado) | `bugfix` |
| "se cayo prod / demo, arregla ya" | `hotfix` |
| "agrega este boton / campo / endpoint simple" | `acotado` |
| "necesito el modulo de facturacion" (multi-actor, reglas) | `diseno` |
| "investiga que opcion de libreria conviene" | `investigacion` |
| "escribe el manual de usuario de W" | `documentacion` |
| "quiero cubrir con pruebas las reglas del modulo X" / "fundar el modelo de pruebas de este repo" | `acotado` (ejecutor Quinn `[MP]`) |

## Confirmacion del usuario

Usar `AskUserQuestion` (cargar con `ToolSearch select:AskUserQuestion` si esta diferida). Tres salidas:

1. **Aprueba** la ruta -> Alfred continua segun la ruta (crea work-record si aplica, inserta bloque `## Abordaje`).
2. **Redirige** a otra ruta -> Alfred valida si la evidencia la sostiene. Si no: pide refinamiento o regresa a Fase 2.
3. **Pide ajuste** -> reformula la propuesta y vuelve a presentar.

## Atajo `--desde-diseno={slug}`

Cuando se invoca `/alfred iniciar --desde-diseno={slug}`: el abordaje se ejecuta **comprimido**. Objetivo absorbido por el flag; evidencia parcialmente cubierta por el brief; Fase 4 se reduce a validar que el brief sigue aplicable. La ruta es `diseno` con brief listo. Pre-requisito: el diseno existe en `agent-os/disenos/{slug}/` en estado `BRIEF_LISTO` o `EN_USO`.

## Campos que exige la ruta al abrir el work

Cuando la ruta aprobada los exige, Alfred los pregunta AQUI — antes de abrir el work-record,
no despues. Antes vivian en la Etapa 0, que se retiro.

| Ruta | Campo | Pregunta | Destino |
|---|---|---|---|
| `investigacion` | `consumido_por` (obligatorio) | "¿A quien sirve este insumo? (slug del work que lo consumira, o el destinatario tecnico)" | Bloque `investigacion{}` del payload de `work open`. Sin el, el runtime **no abre el work** (falla con `CONSUMIDO_POR_FALTANTE`): un insumo sin destinatario no tiene como declarar suficiencia. |
| `documentacion` | `audiencia_documento` (opcional); los documentos del work y su plantilla | audiencia detallada; que documentos producira el work y con que plantilla cada uno (ver "Documentos del work (ruta documentacion)") | `audiencia_documento` en el bloque `documentacion{}` del payload de `work open`; `plantilla_documento` solo si el work tiene exactamente un documento con plantilla elegida. La lista completa va a la seccion `## Entregables` del README, escrita tras abrir el work. |
| `documentacion` (insumo de sesion grabada) | `sesion_material_mpa`, `sesion_dominio_cruce` (obligatorios si el insumo es una grabacion); `sesion_material_video` (opcional) | **nombre del archivo** `.mpa`; **nombre del archivo** `.mp4` si hay video; dominio de `.documentacion/` contra el que se cruzara | Bloque `documentacion{}` del payload de `work open`, campos planos con prefijo `sesion_` (mismo precedente que `audiencia_documento`/`plantilla_documento`). Sin `sesion_dominio_cruce` el runtime **no abre el work** (falla con `SESION_DOMINIO_CRUCE_FALTANTE`): sin dominio no hay arbol contra el cual cruzar. Ver `agent-os/templates/work-record/schema/sesion.md` seccion "(a) Campos de apertura (frontmatter del work)". |

**Nombre de archivo, jamas la ruta.** Los dos campos de material guardan el nombre
del archivo (`capacitacion-consulta-externa.mpa`), no la ruta con que Alfred lo
localizo. El work-record vive en el repo consumidor y se commitea: una ruta del
almacen de grabaciones de quien abrio el work no existe en ninguna otra maquina, y
ademas rompe la equivalencia con el campo `material` del indice de sesion, que
`sesion indexar` escribe como nombre de archivo. La ruta completa se le pide al
usuario cuando se invoca el runtime en G1, no se hornea al frontmatter.

**Meta vaga.** La meta se destila en Fase 1 y se hornea al abrir el work. Si al llegar aqui la
meta sigue siendo vaga (no declara un resultado observable), Alfred la refina con la pregunta
unica —"¿Cual es el resultado que esperas ver al final de este work?"— e invita a Mary si el
objetivo del usuario sigue sin aterrizar. La meta NO se difiere a una etapa posterior.
<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "La meta como invariante vivo". La pregunta unica y la doctrina de la meta viven alli; aqui solo el momento en que se aplica. NO duplicar -- editar la fuente. -->

### Documentos del work (ruta documentacion)

Un work de documentacion puede producir varios documentos, cada uno con su propia plantilla
y, si hace falta, su propia audiencia. Elegir la plantilla es una decision del usuario con
Paige; el runtime no elige ni valida por documento.

1. Alfred pregunta que documentos producira el work: uno, varios, o "se define en E1".
2. Para cada documento conocido, Paige propone hasta 3 plantillas **ofrecibles** del catalogo
   (las dos zonas), por afinidad de `tipo`, audiencia y destino, y por precedentes en works
   anteriores. `AskUserQuestion` por documento: una opcion por candidata, mas "sin plantilla" y "crear plantilla".
3. Si el catalogo no existe o esta vacio (instalacion vieja), Alfred lo anuncia y sigue sin
   plantilla.
4. `plantilla_documento` viaja en el payload de `work open` solo si el work tiene exactamente un
   documento con plantilla elegida. Con mas de uno, no se envia.
5. Tras abrir el work, Alfred escribe la seccion `## Entregables` con
   `agentos work file set-section` (una fila por documento). Si los documentos se definen en E1,
   la escribe Paige al cerrar la seleccion en E1.

**Disparador de curaduria.** Cuando un documento queda "sin plantilla", o el usuario elige
"crear plantilla", Paige corre su capacidad `CP` en modo `abordaje`: S2 sobre el pedido, S1
limitada al destino declarado del documento. Si hay candidata, ofrece crear la plantilla antes de
empezar; se crea en E1, antes de derivar el TOC, y queda como plantilla del documento. Si no la
hay y el usuario pidio crearla, Paige explica que una plantilla nace de un
documento real y registra el pedido en `_curaduria.md` (senal `pedido`, decision `diferida`); el
documento sigue sin plantilla y el cierre evalua el pedido sobre el documento entregado. Una
plantilla que se creara en E1 no viaja como `plantilla_documento` al abrir el work: Paige
completa su fila de `## Entregables` cuando la crea.

<!-- FUENTE: agent-os/experts/bmad-agent-paige/references/curar-plantillas.md seccion "Modos de invocacion". Senales, acciones y registro viven alli. NO duplicar -- para modificar, editar la fuente. -->

<!-- FUENTE: agent-os/templates/documentacion/README.md seccion "Resolucion de un slug". Zonas, formas y que es una plantilla ofrecible viven alli. NO duplicar -- para modificar, editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Seccion Entregables del README". Columnas y reglas de la tabla viven alli. NO duplicar -- para modificar, editar la fuente. -->

## Persistencia al confirmar

Schema de `abordaje{}` y bloque `## Abordaje`: `agent-os/templates/work-record/schema/abordaje.md` seccion "Abordaje" + plantilla `agent-os/templates/work-record/abordaje-seccion.md`. Alfred escribe `ruta` con el nombre corto (`responder|bugfix|acotado|diseno|rediseno-ui|investigacion|documentacion`).

**Asociacion de items de gestion.** Tras crear el work-record, si el repo tiene la integracion
de sprints configurada, Alfred ofrece asociar el work a un item de la herramienta de gestion
(flujo opt-in, sin default) invocando la accion `preguntar-asociacion` de
`agent-os/skills/zoho-sprints-integration/SKILL.md`. El cambio de estado del item se pospone
al cierre del work (PRE_CIERRE), no ocurre aqui. Este hook colgaba del cierre de la Etapa 0.
<!-- FUENTE: agent-os/skills/zoho-sprints-integration/SKILL.md accion "preguntar-asociacion". El flujo y sus pre-requisitos viven alli. NO duplicar -- editar la fuente. -->
