# Curar plantillas (capacidad CP)

> Paige detecta cuando un trabajo de documentacion se repite sin plantilla, o cuando una
> plantilla quedo corta, y propone una de las siete acciones del Paso 4: crear, actualizar,
> adoptar, sombrear, normalizar, consolidar un generador o crear una via. Nada se escribe sin
> confirmacion del usuario.

<!-- FUENTE: agent-os/templates/documentacion/README.md seccion "Zonas". Zonas, formas, slug, resolucion, descriptor, vias, validez y registro de curaduria viven alli; aqui solo el procedimiento. NO duplicar -- para modificar, editar la fuente. -->

## Modos de invocacion

| Modo | Quien invoca | Alcance de la observacion | Que puede proponer |
|---|---|---|---|
| `abordaje` | Alfred, Fase 4, para un documento que quedo "sin plantilla" o cuando el usuario pide "crear plantilla" | S2 sobre el pedido del usuario; S1 limitada al destino declarado del documento | crear la plantilla antes de empezar; si no hay de donde derivarla, registrar el pedido (senal `pedido`) para el cierre |
| `cierre` | Alfred, paso 1b de la pieza de cierre, ruta documentacion | los destinos y familias de los documentos que entrega el work | S1 a S4; U1, U3 y U4; y los pedidos (senal `pedido`) que este work registro en el abordaje, con umbral 1 sobre el documento entregado |
| `barrido` | `/alfred maintain plantillas` | todo el repo | todas las senales, incluida U2 |

## Paso 1 -- Observar

1. **Catalogo:** listar las dos zonas y clasificar cada entrada (simple, kit, fuera del
   catalogo). Validar el descriptor de cada plantilla (seccion "Validez" del contrato). Anotar
   las sombras (mismo slug en las dos zonas) y la version de la semilla sombreada.
2. **Works de documentacion:** `agentos catalog show --todo`, quedandose con las entradas cuyo
   campo `"Modo"` es `"documentacion"` (la salida JSON usa nombres con mayuscula inicial). En
   modo `cierre`, solo el work en curso y los works cuyos documentos comparten destino o familia
   con los suyos.
   La misma salida trae `ilegibles_detalle`: un work con causa `formato_v1` no expone su modo,
   pero si su nombre o su README apuntan a un documento para lectores humanos, su README se lee
   igual y cuenta como evidencia (`work:{slug}`).
3. **Documentos de cada work:**
   - si el README tiene `## Entregables`, esa tabla;
   - si no, `plantilla_documento` del frontmatter, la meta y `## Archivos modificados` (puede
     venir como lista o como tabla).
   Un documento que existe en el arbol pero que ningun work respalda se cita como
   `doc:{ruta}` y cuenta como evidencia igual que los demas.
4. **Forma de cada documento:** sus encabezados (`#`, `##`, `###`), leyendo el archivo.
5. **Ediciones humanas (U2):** `git log --follow --format=%h -- {documento}` para ubicar el
   ultimo commit del work que lo produjo, y `git diff {ese commit}..HEAD -- {documento}`,
   mirando solo lineas de encabezado.
6. **Fuera del catalogo:** en el arbol de documentacion del repo, archivos `.md` con descriptor
   (`plantilla:` en el frontmatter) o llamados (sin distinguir mayusculas) `modelo-*`, `_plantilla*` o `plantilla-*`; y scripts de
   generacion (nombres como `generar*`, o `.py`/`.ps1`/`.sh` junto a los documentos) con
   nombres o cuerpos casi iguales entre si.
   Solo cuentan plantillas de documentos para lectores humanos (el alcance de la ruta
   documentacion). Las de otros generos (reportes de pruebas, bitacoras tecnicas, modelos de
   datos que solo comparten el nombre `modelo-*`) se mencionan como observacion, no como
   candidatas.
7. **Decisiones previas:** `agent-os/plantillas/documentacion/_curaduria.md`, si existe.
8. **Versiones (modo `barrido`):** para cada fila de `## Entregables` cuya plantilla figura como
   `{slug}@{v}`, comparar `v` con la `version` actual de esa plantilla; si es menor, el
   documento es candidato a re-plantillado (se lista, no se re-plantilla aqui).

## Paso 2 -- Detectar senales

**Para crear** (documento entregado sin plantilla):

| Senal | Que detecta | Umbral |
|---|---|---|
| S1 Forma repetida | documentos de works distintos, sin plantilla, con el mismo destino o familia y un esqueleto de encabezados mayormente coincidente | 2 documentos |
| S2 Ejemplar citado | la meta, el discovery o el pedido toman un documento anterior como molde ("conserva la anatomia de...", "mismo perfil que...") | 1 |
| S3 Modelo suelto | archivo con descriptor, o `modelo-*` / `_plantilla*` / `plantilla-*` (sin distinguir mayusculas), fuera del catalogo | 1 |
| S4 Generador copiado | script de generacion duplicado entre works o carpetas | 2 copias |

**Para actualizar** (documento hecho con plantilla):

| Senal | Que detecta | Umbral |
|---|---|---|
| U1 Desviacion repetida | la misma desviacion declarada en E1 por works distintos con esa plantilla | 2 works |
| U2 Edicion humana estructural | tras la entrega, alguien agrego, quito, renombro o reordeno secciones del documento | 1 |
| U3 Metodo enriquecido | un fallo o aprendizaje del work dejo un paso nuevo de llenado | 1 |
| U4 Semilla sombreada desactualizada | la plantilla del repo declara `semilla:{slug}@{v}` y la semilla del sistema tiene `version` mayor | 1 |

- S1 y U1 exigen 2 porque la segunda vez es cuando nace el "ejemplar": antes no hay forma que
  comparar.
- Una edicion de redaccion que no toca la estructura no es U2.
- Si una serie ya tiene un modelo suelto (S3), la recomendacion es **adoptarlo**, no crear otro.
- **Firma:** antes de proponer, buscar la firma de la candidata en `_curaduria.md`; si tiene
  decision `descartada`, no se propone. Que es la firma y como se compara vive en el contrato
  (seccion "Registro de curaduria").
- **Uso sin declarar:** un work que siguio un modelo o una plantilla sin declararlo (su meta,
  su discovery o su `## Archivos modificados` lo nombran, pero ni `## Entregables` ni
  `plantilla_documento` lo registran) se reporta como observacion y cuenta como uso de esa
  candidata.
- **La misma desviacion en plantillas distintas:** si una desviacion se repite en works que
  usan plantillas diferentes, se reporta como observacion con la lista de plantillas
  afectadas. Si alguna plantilla del catalogo ya trae ese eje (por ejemplo
  `manual-por-perfil` para una division por perfil), se sugiere como alternativa; cada
  plantilla afectada sigue su propio umbral U1.

## Paso 3 -- Proponer

Una `AskUserQuestion` por candidata, **siempre**, sin importar el `nivel` del work: una
plantilla cambia el trabajo futuro del equipo, no solo el de este work.

Cada propuesta muestra: la senal, la evidencia (documentos, lineas o commits), la accion
sugerida y lo que se escribiria (rutas y version resultante). Opciones: la accion sugerida,
`descartar` (se pide la razon en una linea) y `diferir`.

## Paso 4 -- Ejecutar la accion confirmada

| Accion | Que hace |
|---|---|
| Crear | Kit o simple en la zona del repo, derivado **de los documentos reales**, no de su esqueleto: estructura, comentarios guia por seccion (que va y por que), variantes observadas, `llenado` si los works muestran un procedimiento, `salidas` y `via` si usaron un generador. Kit si hay llenado, generacion o recursos; simple si no. `version: 1`, `derivado_de` con los documentos fuente, fila inicial en el historial |
| Actualizar | Modifica la plantilla; `version` + 1; agrega a `derivado_de` lo que motivo el cambio; fila nueva en el historial. Despues **lista** los documentos hechos con versiones anteriores (columna Plantilla de `## Entregables`) como candidatos a re-plantillado y ofrece abrir un work con `/alfred` para cada lote; no los re-plantilla aqui |
| Adoptar | `git mv` del modelo suelto (y de su metodo) a un kit de la zona del repo; normaliza el descriptor (`metodo` pasa a `llenado`; se agregan `version` y `derivado_de` si faltan); actualiza en el mismo cambio los enlaces que lo citan (buscar el nombre del archivo en todo el repo). No copia: no quedan dos fuentes. Si varios modelos adoptados comparten un mismo metodo, el metodo se mueve una sola vez a `_comun/` y cada kit lo cita en su `llenado` |
| Sombrear | Copia la semilla a la zona del repo con el mismo slug, aplica el cambio y registra `derivado_de: [semilla:{slug}@{v}]`. Si el cambio lo exige (por ejemplo, una via de generacion), la sombra puede ser un kit: la zona del repo admite las dos formas y lo que sombrea es el slug |
| Normalizar nombre | `git mv` de una plantilla del repo con nombre fuera del alfabeto, o cuyo campo `plantilla` no coincide con su nombre (por ejemplo, una plantilla que el instalador rescato con sufijo `-rescatada`), a su forma canonica; ajusta el campo `plantilla`; actualiza en el mismo cambio las referencias (`## Entregables`, `derivado_de`, `_curaduria.md`). Los `plantilla_documento` ya horneados en works anteriores no se reescriben: quedan como historia |
| Consolidar generador | Propone un generador parametrizado en el kit o en `_comun/`, derivado de las copias, y lo declara como `via` de la plantilla. Las copias existentes no se borran sin confirmacion explicita |
| Crear via | Propone la skill o herramienta que falta (por ejemplo, generar PDF o imagenes): una skill nativa del proyecto, referenciada como `skill:{nombre}`, o un `SKILL.md` en `_comun/skills/`, referenciado como `skill:{ruta}/SKILL.md` |

Reglas comunes:

- Toda escritura va a `agent-os/plantillas/documentacion/`. La zona del sistema no se edita: el
  proximo update la sobrescribe.
- En modo `abordaje`, la plantilla creada se ofrece de inmediato como plantilla del documento
  (se crea en E1, antes de derivar el TOC).
- Una plantilla que se creara en E1 no viaja como `plantilla_documento` al abrir el work
  (todavia no existe y `work open` fallaria): Paige completa su fila de `## Entregables` cuando
  la crea.
- La regla multi-stack del contrato aplica: la via concreta la decide el equipo; Paige no
  impone una herramienta.

## Paso 5 -- Registrar

- Agregar una fila por decision a `agent-os/plantillas/documentacion/_curaduria.md`,
  creandolo con su encabezado si no existe (formato en el contrato, seccion "Registro de
  curaduria").
- Decision `diferida`: anotar ademas el pendiente en `agent-os/post-works/_pendientes.md`,
  salvo la fila de un pedido del abordaje (senal `pedido`), que el cierre del mismo work
  resuelve; si al cierre se vuelve a diferir, entonces si se anota.
- Modo `cierre`: resumir las decisiones (o "curaduria: sin candidatas") y entregar el resumen a
  Alfred, que lo incluye al poblar `## Cierre` en el paso 2 de la pieza de cierre (ese paso
  reescribe la seccion completa). Las plantillas creadas o actualizadas viajan en el commit del
  work.

## Guardia de alcance

- Construir un generador, una skill o un recurso que exceda el work en curso no se hace dentro
  de el: la decision es `diferida` y queda como pendiente post-work.
- La curaduria no bloquea el cierre del work.
- La curaduria no re-plantilla documentos: eso es un work nuevo de la ruta documentacion (ver
  la variante de re-plantillado en la ruta).
