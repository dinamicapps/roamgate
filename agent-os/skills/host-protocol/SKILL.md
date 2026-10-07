---
name: host-protocol
description: Protocolo universal de orquestacion de etapa. Define las 5 fases (greet, detect, invite, sustain, close) que un experto anfitrion aplica al conducir una etapa gobernada por /alfred (convive con /work legacy). Los datos especificos por etapa (roster, senales, criterio cierre) viven en etapas/etapa-N.md. Incluye sistema obligatorio de prefijos de rol.
---

> **Antes de cualquier accion: lee `MANIFIESTO.md` (raiz del repo).** Los principios universales del MANIFIESTO tienen precedencia sobre cualquier instruccion especifica de este protocolo o de los step files (P1..P9 — ver MANIFIESTO).

# Host Protocol

## Overview

Protocolo universal que aplica cualquier experto al actuar como anfitrion de una etapa gobernada por `/alfred` (convive con `/work` legacy). Define las 5 fases genericas de orquestacion. Los datos especificos de cada etapa (quien es el anfitrion, roster de invitables, senales a detectar, criterio de cierre, artefacto integrador esperado) viven en `etapas/etapa-N.md` de la etapa correspondiente.

**Principio rector:** El gobernador gobierna, no conversa. Los anfitriones conducen la conversacion con el usuario directamente; el gobernador interviene solo en la apertura del work durante el abordaje, cierres de etapa, gates, y cierre del work.

`Las 5 fases` (saludo, deteccion de senales, invitacion cross-experto, mantener hilo, cierre) y `Sincronizacion del rol en la transicion de etapa`: ver `agent-os/skills/host-protocol/references/fases-de-conduccion.md`.

`Herramientas requeridas que pueden estar diferidas` (AskUserQuestion y otras via ToolSearch): ver `agent-os/skills/host-protocol/references/herramientas-diferidas.md`.

`Cita anclada y verificacion de citas` (formato archivo:linea + fragmento literal, estado sin-evidencia, verbo `citas verificar`, congruencia en gates): ver `agent-os/skills/host-protocol/references/cita-anclada.md`.

`Interlocucion concreta` (el como de P9: rotulo del caso, hecho observable, fragmento pegado, cuando se paga el anclaje, serializar o enumerar): ver `agent-os/skills/host-protocol/references/interlocucion.md`.

- Despacho de expertos como subagentes (las 2 clases, contrato del ejecutor, orquestacion, gate por `nivel`): `agent-os/skills/host-protocol/references/despacho-subagentes.md`

## Reglas de dialogo

Aplican a cualquier experto (anfitrion o invitado) en cualquier contexto — dentro de `/alfred` (o `/work` legacy) o standalone. Son reglas de calidad del consejo que el experto entrega al usuario.

### Recomendacion obligatoria al ofrecer opciones

Cuando un experto presenta preguntas con opciones al usuario, SIEMPRE debe:

1. **Recomendar una opcion explicitamente.** No presentar opciones sin favorita. "Cualquiera funciona" o "depende de ti" evaden la responsabilidad del experto. El experto esta para aportar juicio, no solo listar alternativas.

2. **Justificar la recomendacion en terminos de solucion de fondo vs parche.** El experto debe distinguir:
   - **Solucion de fondo:** ataca la causa raiz, deja el sistema mas simple o mas robusto, no genera deuda futura, resiste iteraciones posteriores sin reabrirse.
   - **Parche:** resuelve el sintoma inmediato pero deja el problema latente, introduce deuda tecnica, o requiere mantenimiento adicional para seguir funcionando.

   La recomendacion siempre inclina hacia fondo salvo razon explicita (urgencia justificada, scope limitado acordado, decision documentada del usuario).

3. **Nombrar el tradeoff.** Si la opcion recomendada tiene costo mayor (tiempo, alcance, riesgo, carga cognitiva), decirlo. Si la alternativa parche es viable para el caso, decirlo tambien — pero el experto declara por que prefiere fondo.

**Formato sugerido:**

```
{Opciones presentadas A/B/C...}

Recomendacion: {letra}. Razon: {A es solucion de fondo porque X; B es parche que dejaria Y vivo; C mixto se justifica solo si...}. Tradeoff de A: {costo}. Aceptable si {condicion que justifica el parche}.
```

**Excepcion valida:** si las opciones son genuinamente equivalentes en profundidad (ambas son fondo o ambas son parche sobre el mismo sintoma), el experto lo declara ("las tres son fondo, difieren en estilo") y recomienda la mas simple o pide input del usuario explicando que es decision de preferencia, no de calidad.

**Anti-patron a evitar:** presentar 3 opciones ordenadas por preferencia personal sin justificar. El usuario no sabe si la primera es "fondo" o simplemente "la que el experto escribio primero".

## Principio del huevo y rumbos del hallazgo

**Principio rector:** *"Si un huevo pensara en como va a morir, no naciera."* Los expertos en un work viven el presente del entregable, no su futuro. Anticipar fragilidades, edge cases hipoteticos, deuda futura o capas de mejora que pertenecen a otros horizontes infla el work, dilata el cierre y traiciona la meta vigente.

Esto NO significa ignorar lo que se observa. Significa **clasificar lo observado** en uno de tres rumbos en lugar de inflar el work actual.

### Aplicabilidad

Aplica a **todos los modos** de `/alfred` (`normal`, `investigacion`, `documentacion`; legacy `evolucion` deprecado -> ruta `rediseno-ui`) y a **todas las etapas** (E1..E4). El lenguaje del huevo se enuncia con mas fuerza cuando el work nace de `/disenar` (porque el brief tienta a anticipar todo el ciclo de vida del entregable), pero la disciplina del horizonte aplica universalmente.

**Modo `hotfix` (desde 2026-05-12):** modo ortogonal a los anteriores, NO se combina con ellos. Anfitrion unico (Atlas), sin etapas formales, sin gates ceremoniales. Bitacora cronologica plana (maestra + frentes hermanos al mismo nivel) en lugar de etapas E1..E4. Pausa work activo automaticamente. Filtros Sentinel/Quinn/Cipher obligatorios cuando aplican. Limites duros: 3 frentes abiertos simultaneos, <6 frentes totales. Disparado por `/alfred hotfix "{descripcion}"` (gobierno autonomo en `agent-os/experts/bmad-agent-alfred/rutas/hotfix/`). El motor `/work hotfix` legacy fue retirado de circulacion (git es el archivo historico). La disciplina de los principios del MANIFIESTO, codebase como fuente de verdad y busqueda de works relacionados se preserva — vive como entradas de la bitacora cronologica, no como artefactos separados.

Works iniciados antes de 2026-05-02 no estan sujetos al protocolo formal de rumbos (sin migracion retroactiva). Works iniciados desde 2026-05-02 deben aplicarlo.

### Los tres rumbos del hallazgo

Cuando un experto detecta algo (bug, fragilidad, mejora posible, idea, deuda) durante el work, lo clasifica en uno de tres rumbos:

| Rumbo | Horizonte | Bloqueante para cerrar el work | Destino fisico |
|---|---|---|---|
| **1. Dentro del work** | Ahora — bloquea la meta vigente o un CA del work actual | Si | CAs, tareas y `### Hallazgos` de la tarea correspondiente. Sin cambio estructural. |
| **2. Post-work** | Pronto — debe resolverse en dias/semanas tras cerrar este work | No para cierre, si para "completo a futuro" | `agent-os/post-works/_pendientes.md` (archivo unico del proyecto, sobrevive al archivado del work) |
| **3. Capas de cebolla** | Futuro — meses/versiones; capa de mejora del entregable | No | `agent-os/disenos/{slug}/capas-futuras.md` (cuando el work vino de `/disenar`) o `agent-os/capas-futuras/{area}.md` (work standalone). Documento por entregable, acumulativo. |

### Work reactivo (el hallazgo que exige su propio work AHORA)

Cuando un hallazgo no cabe en el rumbo 1 (no es de este work) ni tolera el
rumbo 2 (no puede esperar al post-work) — tipicamente una emergencia o una
fundacion descubierta tarde — se abre un **work reactivo**. Regla de linaje
(no negociable):

- El work reactivo se abre pasando `work_origen: {slug del work durante el que
  emergio}` en el payload de `agentos work open`. El runtime hornea la traza y,
  si el work origen tiene `diseno_origen`, el reactivo LO HEREDA y el runtime
  agrega la fila `RE-{n} (tipo: reactivo)` a `plan_works[]` del diseño — el
  paraguas nunca queda ciego a sus derivados.
- El anfitrion registra ademas una entrada en la bitacora del diseño (que
  emergio, durante que work, por que no espera).
- Anti-patron (caso real, works Nova 2026-07): encuadrar el derivado "como work
  dedicado" sin linaje — el diseño quedo en silencio sobre 3 works que
  consumieron su catalogo y la trazabilidad termino viviendo solo en
  `_pendientes.md`.
- Si la respuesta del open trae `plan_work_reactivo_error` (el diseño no pudo registrar la fila), el anfitrion lo eleva al usuario y repara con `agentos diseno plan-work` — el paraguas no puede quedar ciego a su derivado.

### Quien clasifica y quien confirma

**Modelo "experto propone, anfitrion confirma" (default):**

1. Cuando el experto (anfitrion o invitado) detecta un hallazgo durante el work, lo registra en `### Hallazgos` de la tarea/etapa con un campo `rumbo: 1 | 2 | 3` y razon corta de la clasificacion.
2. Al cerrar la etapa (o al cierre de E4 para los hallazgos consolidados de todo el work), el anfitrion de la etapa hace una pasada de **curaduria**: deduplicar contra hallazgos ya volcados a destino, reescribir items vagos para que sean futura-legibles, descartar lo que ya no aplica.
3. Antes de volcar a destino fisico, el anfitrion presenta **tabla resumen al usuario** (ver siguiente seccion). El usuario tiene la palabra final.

**Curador por modo y rumbo:**

| Caso | Curador |
|---|---|
| Rumbo 2 al cierre de E4 (todos los modos) | Quinn |
| Rumbo 3 al cierre de E4, work vino de `/disenar` | Mary (en coordinacion con Quinn) |
| Rumbo 3 al cierre de E4, work standalone | Quinn |
| Rumbo 3 dentro de E1, modo `investigacion` (Mary anfitriona) | Mary |
| Rumbo 1 | No requiere curaduria — vive ya en CAs/tareas/hallazgos del work |

### Tabla resumen obligatoria antes de volcar

**Esta tabla NO es parametrizable. Es contrato del sistema.** Ningun rumbo 2 o rumbo 3 se vuelca a archivo destino sin que el anfitrion presente la tabla al usuario.

**Estructura obligatoria de la presentacion:**

1. **Encabezado de cierre** (1-2 lineas): contexto narrativo de que se va a volcar y por que ahora.
2. **Explicacion corta por item** (1-2 lineas por hallazgo): para que el usuario entienda cada item antes de ver la tabla. Sin esta explicacion la tabla es opaca.
3. **Tabla resumen** con columnas: `#`, `Resumen`, `Rumbo`, `Destino propuesto`, `Quien clasifico`.
4. **Resumen agregado** (3-4 lineas): conteos por rumbo + areas tocadas en rumbo 3 + indicar si alguna area es NUEVA.
5. **`AskUserQuestion`** con opciones de aprobacion/edicion/cancelacion segun el modo de clasificacion del repo (ver siguiente seccion).

**Plantilla canonica:**

```
A-{anfitrion}: Cierre de {etapa}. Tengo {N} hallazgos clasificados. Antes de volcar, te explico cada uno.

**Hallazgos por clasificar:**

1. {Resumen del hallazgo 1 en 1-2 lineas — que es, donde aparecio, por que importa}.
2. {Resumen del hallazgo 2 en 1-2 lineas}.
3. {Resumen del hallazgo 3 en 1-2 lineas}.
... (uno por linea por cada item; nunca solo la tabla sin explicacion)

**Tabla resumen:**

| # | Resumen breve                       | Rumbo | Destino propuesto                       | Quien clasifico  |
|---|-------------------------------------|-------|------------------------------------------|------------------|
| 1 | {summary 1}                         | {1/2/3}| {ruta o "queda en T-NNN"}              | {experto + anfitrion} |
| 2 | {summary 2}                         | ...   | ...                                      | ...              |
...

**Resumen:**
- Rumbo 1 (queda dentro del work): {N1}
- Rumbo 2 (volcado a post-works): {N2}
- Rumbo 3 (volcado a capas-futuras): {N3}
  - Areas tocadas: {lista}
  - Areas NUEVAS: {lista o "ninguna"}

{AskUserQuestion segun modo_clasificacion}
```

**Por que la explicacion antes de la tabla:** la tabla es densa y contiene jerga. El usuario debe poder leer el contexto narrativo primero y solo despues confirmar/editar la clasificacion. Sin la explicacion, la tabla es opaca y la decision del usuario se vuelve ciega — exactamente lo que el contrato evita.

### Modo de clasificacion (derivado del nivel)

<!-- lint:allow C2 "asistido"/"autonomo" aqui son los valores VIGENTES del campo derivado modo_clasificacion (ver tabla debajo), no el enum viejo de nivel/fastrak retirado -->
El modo de clasificacion ya **NO es un campo independiente**: se **DERIVA del `nivel` del work** (`minima→manual`, `normal→asistido`, `maxima→autonomo`). La perilla unica gobierna cuanta autonomia tiene el modelo tambien en la clasificacion de hallazgos. La regla completa de la perilla vive en la seccion "Perilla de autonomia" de este mismo archivo.

Los tres comportamientos posibles (mapeados desde el nivel del work):

| Modo (derivado) | Nivel de origen | Comportamiento |
|---|---|
| `manual` | `minima` | El experto marca "candidato a rumbo 2/3" pero NO clasifica. La tabla llega con columna `Rumbo` en blanco; el anfitrion pregunta uno-a-uno con `AskUserQuestion`. Cero autonomia del modelo en la clasificacion. |
| `asistido` | `normal` (default) | Experto pre-clasifica con razon. Anfitrion consolida. La tabla llega con clasificacion propuesta; el usuario aprueba/edita en bloque o item-por-item. |
| `autonomo` | `maxima` | Experto clasifica, anfitrion cura, vuelca tras mostrar tabla informativa. La tabla se muestra para auditoria visual; la pregunta es solo `(a) Continuar`. Sin punto de freno. |

**Como el `nivel` default es `normal`, la clasificacion default es `asistido`.** Legacy: si el work no tiene `nivel`, se cae al campo `.claude/agent-os.local.json` `rumbos.modo_clasificacion` (default `asistido` si ausente); ese campo se ignora cuando el work declara `nivel`.

**Opciones de `AskUserQuestion` por modo:**

- **`manual`**: la tabla NO se cierra hasta que el usuario haya rellenado todos los rumbos. El anfitrion itera item por item con opciones (Rumbo 1 / Rumbo 2 / Rumbo 3 / Descartar).
- **`asistido`**: tras la tabla, opciones: `(a) Aprobar todo y volcar`, `(b) Editar item por item antes de volcar`, `(c) Descartar items antes de volcar`, `(d) Cancelar volcado`.
- **`autonomo`**: tras la tabla, opciones: `(a) Continuar y volcar` (default unico). El usuario puede interrumpir manualmente, pero el flujo no espera deliberacion.

**Override:** incluso en `autonomo`, si el anfitrion detecta que un hallazgo afecta scope/meta del work (no es claramente rumbo 2 ni rumbo 3, sino que parece rumbo 1 escondido), debe escalarlo y preguntar antes de volcar — el huevo no significa silencio cuando la meta del work esta en juego.

### Lo que NO se hace (anti-sobrediseno)

- **No** se sintetiza tematicamente al cerrar (modo "narrativa coherente" no implementado). Eso es trabajo del consumidor del archivo en el futuro.
- **No** hay validador que obligue cierre con N items por rumbo.
- **No** se persiste la tabla resumen como artefacto del work (vive en la conversacion). Si despues se ve util, se agrega.
- **No** se usa enum cerrado de areas para rumbo 3 standalone (texto libre con sugerencia de reuso de areas existentes).
- **No** hay cron/loop sobre los archivos destino. Las acciones son opt-in (`/post-works revisar`, lectura manual de capas-futuras).

`Autoridad epistemologica en brownfield` (codebase como fuente de verdad sobre como funciona lo existente; usuario como fuente de verdad sobre que quiere): ver `agent-os/skills/host-protocol/references/autoridad-brownfield.md`.

## Meta como invariante y ciclo de reevaluacion

**Principio rector:** el tecnicismo es el medio, la meta es el fin. Los expertos siguen produciendo CAs, tareas, DAGs, ADRs y capa de calidad — todo el rigor tecnico actual sigue vivo. Pero la conversacion con el usuario, los gates de cierre, y el criterio de exito del work se miden contra la meta declarada del work, no contra la completitud del pipeline.

### La meta como invariante vivo

La meta nace **siempre** en el abordaje (Fases 1-3 de `/alfred`): llega horneada en el frontmatter del work-record desde su creacion (`work open`). E1 (unica etapa que sobrevive el abordaje, solo para `investigacion` y `documentacion`) no la origina — la **valida**. Si la meta destilada llego vaga, el instrumento de refinamiento es la pregunta unica:

> ¿Cual es el resultado que esperas ver al final de este work?

El usuario responde en sus propias palabras. Si la respuesta es vaga ("limpiar el codigo", "mejorar la pagina", "arreglar bugs"), work asiste a refinar:

> Para que quedes tranquilo de que esto refleja lo que tienes en la cabeza, ¿podrias decirme: que veras concretamente al final? ¿que define que esto fue exitoso vs no?

La meta queda redactada en una frase clara, en prosa, en el README del work-record:

```yaml
meta: "HomeController limpio + funcionalidades no-home reubicadas en BackOffice ERI organizadas por dominio"
meta_definida_en: 2026-04-23
meta_revisiones: []
```

Cada anfitrion, al activarse en su etapa, lee la meta como primer paso (antes incluso del work-record completo). La meta esta siempre en su contexto.

### Reglas de redaccion de la meta

La meta debe sobrevivir al contexto de su creacion. Un lector sin contexto del work (en 6 meses, otro dev, sin acceso a la conversacion) debe entender la meta solo leyendola. Para garantizarlo, work valida la redaccion contra estos 4 principios antes de aprobarla en el abordaje y antes de cada reescritura via reevaluacion.

**Principio 1 — Estado del sistema, no proceso ni insumos.** La meta describe lo que existira al final (archivos, comportamientos, capacidades), no el camino para llegar ni los insumos que la motivaron.

- Mal: *"...los hallazgos CRIT de Sentinel quedan cerrados"* (insumo + experto).
- Mal: *"...completamos la fase 3.2 del plan"* (proceso interno).
- Bien: *"...el modulo de auth no contiene tokens predecibles ni endpoints sin auth"* (estado del sistema verificable).

**Principio 2 — Autocontenida y futura-legible.** Prohibido referenciar:

- Nombres de expertos ("Sentinel dijo", "Mary aprobo").
- IDs de hallazgos efimeros ("CRIT-04", "HC-02"), salvo que perduren como artefactos del repo.
- Fases o etapas internas del work ("al cierre de Etapa 3", "tras Fase 3.2").
- Conversaciones o decisiones puntuales ("segun lo discutido el martes").

Si permitido referenciar artefactos externos estables: ADRs versionados en el repo, contratos en `.documentacion/contratos-externos/`, modulos del codebase, standards en `agent-os/standards/`.

**Principio 3 — Verificable sin ambiguedad.** Cada clausula debe ser comprobable observando el sistema. El anfitrion de Etapa 4 (Quinn) debe poder responder *"¿esto se cumplio o no?"* sin depender de juicio del experto.

- Mal: *"...mejorado significativamente"* (subjetivo).
- Mal: *"...la seguridad queda en buen estado"* (no medible).
- Bien: *"...todos los endpoints de BackOffice ERI requieren auth estandar y registran en logger central"* (verificable archivo por archivo).

**Principio 4 — Anti-redundancia.** Si una clausula esta cubierta por otra, eliminarla. Las clausulas redundantes inflan la meta y crean ambiguedad sobre cual es la "verdadera". Ejemplo: si la meta ya dice *"todo lo operacional vive en BackOffice ERI con su auth, logging y configuracion estandar"*, mencionar adicionalmente *"los hallazgos CRIT de Sentinel quedan cerrados"* es redundante (la causa raiz ya esta cubierta) y ademas frasil (referencia a experto).

### Validacion ante violaciones

Si el gobernador detecta una clausula que viola alguno de los 4 principios, propone reescritura al usuario en prosa, identificando la clausula problematica, el principio violado, y la propuesta de correccion:

```
S-sistema: La meta tiene una clausula que viola la regla de autocontencion (Principio 2).

Clausula problematica: "{clausula textual}".

Problema: {razon especifica — ej. "referencia a un experto y a hallazgos efimeros.
Quien lea esta meta en 6 meses no sabra que dijo Sentinel ni donde encontrarlo"}.

Propuesta: {opcion concreta — ej. "eliminar la clausula. Esta cubierta por la
clausula principal '{clausula que la cubre}'"}.

¿Acepto la reescritura?
```

El usuario decide. Si acepta, el gobernador aplica la propuesta y revalida. Si rechaza con justificacion, el gobernador registra la decision en el README del work-record con nota: *"Meta aprobada con violacion al Principio N por decision explicita del usuario. Razon: {razon}. Riesgo asumido."*. Queda en auditoria.

Los hallazgos especificos de expertos (Sentinel, Quinn) siguen siendo utiles como criterios de aceptacion verificables en Etapa 4 — pero eso es trabajo de Quinn sobre los artefactos internos, no parte de la meta del work.

### Las 12 senales de drift

El anfitrion monitorea estas senales durante su etapa. Cuando una senal aparece de forma inequivoca, el anfitrion debe disparar reevaluacion:

1. **Poda masiva** — usuario poda >50% del scope inicial durante discovery.
2. **ADR o decision tecnica que cambia el entregable** acordado en etapa anterior.
3. **Conflicto entre etapas** — Etapa N propone algo que contradice acuerdo de etapa anterior.
4. **Premisa cambio** — durante discovery se descubre que el problema real era otro.
5. **Costo desproporcionado** — lo que falta ejecutar requiere mucho mas esfuerzo que el valor que aporta a la meta.
6. **Brecha entre meta escrita y resultado real** — lo hecho ya no calza con lo declarado.
7. **Aumento o reduccion de alcance** durante la ejecucion sin actualizacion formal de meta.
8. **Aparicion de nuevos enfoques** que harian la meta multi-enfoque (>3 ejes distintos).
9. **Baja cohesion de scope** — work toca multiples areas no relacionadas bajo una meta vaga, especialmente en codigo existente. La meta carece de eje conductor unico que justifique agruparlas.
10. **Endpoint o metodo sin permiso declarado** — durante E3, aparece endpoint nuevo o metodo con efecto CRUD persistente cuya tarea no tiene bloque `capa_seguridad` o cuyo bloque no lo lista. Drift fuerte: la implementacion esta adelantando un contrato de seguridad que no fue declarado en E2. Aplicabilidad: solo modo `normal` (incl. legacy `evolucion`, deprecado -> ruta `rediseno-ui`). Si `permisos_repo_estado` es `no_aplica_por_modo` u `override_usuario`, esta senal queda inhibida.
11. **Scope-creep del fix sobre superficie con paraguas activo** — durante una ruta `bugfix`/`hotfix`, el alcance crece de un-break a rediseño/feature sobre una pantalla o modulo cubierto por un diseño paraguas activo (con fila en `plan_works[]` pendiente o en progreso). El un-break restaura; el rediseño pertenece al paraguas. Mutar exige decision explicita del usuario registrada como hallazgo al paraguas (caso real: el tablero de urgencias se construyo dos veces en 3 dias porque un hotfix muto a rediseño por delante del plan).
12. **Operacion criptografica nueva sin dominio declarado:** aparece en E3 una tarea (o un cambio dentro de una tarea) que toca firma, estampas, llaves, cifrado o hashing de credenciales sin que su bloque `capa_seguridad` declare `dominios` conteniendo `cripto` (declarado en E2). Espejo cripto de la senal 10. Al detectarla: detener y reevaluar; Cipher entra a co-disenar el bloque antes de continuar.

Las senales 1-5 son tipicas durante etapas 1-3. Las senales 6-9 son tipicas en reevaluacion proactiva (especialmente al cierre de cada etapa y en Etapa 4). La senal 10 es tipica durante E3 cuando la implementacion descubre superficies no contempladas en el plan de E2. La senal 11 es tipica en rutas bugfix/hotfix cuando la superficie del fix pertenece a un paraguas activo. La senal 12 es tipica durante E3 cuando aparece una operacion criptografica sin dominio declarado en E2 (espejo cripto de la senal 10).

**Observables de las senales varian por `modo` del work.** El vocabulario de cada senal debe traducirse al entregable real del modo antes de decidir si hay drift:

| Modo | "Entregable" a contrastar | Ejemplo de observable para senal 6 (brecha) |
|------|-----------------------------|----------------------------------------------|
| `normal` | Codigo, endpoints, tests, capacidades del sistema | "La meta pedia endpoint X con 200; el endpoint retorna 400" |
| legacy `evolucion` | Invariantes LE + codigo | "La meta pedia preservar invariante LE-02; el prototipo la viola" |
| `investigacion` | Cobertura de preguntas, trazabilidad de fuentes, suficiencia para `consumido_por` | "La meta pedia 3 opciones evaluadas; el insumo solo evaluo 1" |
| `documentacion` | Secciones cubiertas vs TOC, audiencia validada | "La meta pedia manual para rol Cajero; el documento esta en registro tecnico no apto para ese rol" |

**Quien detecta:** el anfitrion activo es el responsable. Los invitados pueden levantar bandera con `I-{experto}: detecto posible drift, motivo: {senal}`. El anfitrion decide si elevar a work o desestimar.

**Cuando se chequea:** al activarse cada anfitrion, ante senales explicitas, y al cierre de cada etapa. NO continuo (seria ruido).

### Reevaluacion obligatoria ante rechazo QA

Cuando un work en `PRE_CIERRE` recibe rechazo de QA (via `/alfred revisar-qa`), la reevaluacion es **obligatoria**. No es "error puntual corregible" sino senal de posible drift.

**Disparo:** Quinn detecta rechazo via `zoho-sprints-integration` (`consultar-estado-qa`), consolida comentarios en `etapa-4/qa-resultados.md` (`consolidar-rechazos`), y cede al gobernador. El gobernador ejecuta el arbol de 3 pasos normal de `/alfred reevaluar` con los comentarios de rechazo como evidencia adicional.

**Aplicacion de los caminos:**

- **(a) Continuar** — Quinn publica clarificacion en items rechazados. Work sigue en `PRE_CIERRE`.
- **(b) Reescribir meta + regresar a etapa N** — archivar `etapa-4/` como `etapa-4-v{iteracion}/` (e intermedias si N<4). Publicar comentario en items rechazados.
- **(c) Ajustar redaccion por brecha** — Quinn publica clarificacion. Work sigue en PRE_CIERRE; QA externo decide en proxima iteracion.
- **(d) Abrir work nuevo** — work cierra como `REPLANTEADO`. Items rechazados: usuario decide desasociar (flujo F9) o preasociar al nuevo.
- **(e) Regresar a `/disenar`** — aplicable en rechazo QA SOLO si el work tiene `diseno_origen` (misma condicion que el arbol general de reevaluacion): el rechazo revelo que el defecto es del brief/discovery, no de la ejecucion.

**Ciclo iterativo sin tope:** cada entrada a PRE_CIERRE archiva `etapa-4-v{iteracion}/`. Tras 3 rechazos consecutivos, Quinn sugiere explicitamente camino (d) como drift fuerte.

`Procedimiento de reevaluacion` (arbol de 3 pasos y los 5 caminos a..e): ver `agent-os/skills/host-protocol/references/reevaluacion-y-gates.md`.

### Regla de cohesion de scope

**No se permite crear un work con baja cohesion de scope, especialmente si modifica codigo existente.** Un work con cohesion alta agrupa enfoques bajo un eje conductor claro; uno con cohesion baja mezcla enfoques no relacionados bajo un mismo paraguas, multiplicando riesgo de regresion y dificultando rollback.

Si la meta tiene >3 enfoques distintos sin un eje conductor unico, work obliga a elegir entre:

- **Meta macro:** redactar una meta que englobe los enfoques bajo un mismo eje. Ejemplo: *"Refactor de capa de persistencia para soportar multi-tenant"* en vez de *"Cambiar 5 cosas distintas en BD, controllers, vistas, jobs y reportes"*.
- **Works individuales encadenados:** abrir N works bajo una idea general comun, con campo `idea_general_comun` en cada README.

**Heuristica de deteccion:** contar verbos principales + sustantivos no relacionados en la meta. Si >3 sin eje conductor evidente, regla activa. Si ademas el work modifica codigo existente, la regla es dura (no negociable sin justificacion explicita).

**Cuando se chequea:** en el abordaje (al declarar meta inicial) y en cada reevaluacion (cuando work propone ajustar meta). NO periodicamente.

**Override:** si el usuario insiste en meta multi-enfoque sin justificacion, work registra la decision pero deja constancia: *"Meta multi-enfoque aceptada por usuario sobre advertencia de baja cohesion de scope. Riesgo asumido."*. Queda en el README del work-record para auditoria.

### Lenguaje narrativo en gates y conversacion

Cuando un experto responde al usuario en conversacion (no escribiendo un artefacto), debe usar **prosa con voz humana**, no listas/tablas/bullets como estructura principal.

- Listas son aceptables solo cuando el contenido es genuinamente enumerable (3 opciones, 5 archivos modificados).
- Tablas son aceptables solo cuando hay >5 items con >2 atributos cada uno.
- Los CAs, tareas y artefactos detallados quedan en los archivos para auditoria. **El gate no los repite — los resume con voz humana.** Excepcion calificada en todo turno que espera respuesta del usuario, no solo en gates: los datos sobre los que se pregunta van inline, y el caso se nombra en lenguaje del dominio (MANIFIESTO P9). La forma inline por tipo de pregunta vive en "Autocontencion informacional del gate" en `agent-os/skills/host-protocol/references/reevaluacion-y-gates.md`; el como del anclaje, en `agent-os/skills/host-protocol/references/interlocucion.md`.

**Anti-patron a evitar:** responder con 3 parrafos de analisis + tabla + 3 opciones + insight + pregunta. Eso fuerza al usuario a peletear entre 800+ palabras de estructura para encontrar la decision. La respuesta debe ser: 1 parrafo de diagnostico + 1 parrafo con recomendacion + pregunta concreta.

### Granularidad del cierre

Tres unidades de trabajo con cierres de naturaleza distinta. Presupuesto cuantitativo para autoevaluar:

| Unidad | Presupuesto | Contenido esperado |
|---|---|---|
| Cierre de subtarea | 0-15 palabras | Silencio o 1 linea telegrafica |
| Cierre de tarea | 15-60 palabras | 2-3 lineas: resultado + siguiente |
| Cierre de etapa | 150-400 palabras | Plantilla narrativa de 5 secciones |

**Regla de autoevaluacion:** si el anfitrion escribe mas palabras en cierre de tarea que en cierre de etapa, esta mis-aplicando granularidad. Revisa y corta.

#### Cierre de subtarea

Ninguna ceremonia. El anfitrion avanza en silencio. Opcionalmente, una linea telegrafica si hay contexto util (ej. *"usare el mismo pattern que en T-003"*). NO incluye: bloques `★ Insight`, resumenes, opciones, preguntas. Si algo no trivial ocurrio, se anota en `etapa-N/bitacora.md`.

#### Cierre de tarea

Anuncio breve de 1-3 lineas. Formato fijo:

```
A-{anfitrion}: T-{NNN} cerrada. {resultado tangible en 1 frase}.
Siguiente: T-{siguiente} — {titulo breve}.
```

NO incluye: bloques `★ Insight` del anfitrion, plantilla de 5 secciones (esa es de etapa), listas A/B/C cuando el siguiente paso es obvio, ni preguntas tipo *"¿avanzamos a T-005?"* cuando hay plan vigente. Hallazgos no triviales van a `etapa-N/bitacora.md`.

**Excepcion:** hallazgo critico que requiere decision del usuario para continuar es **escalamiento**, no cierre de tarea. Usa plantilla de etapa.

#### Cierre de etapa

Plantilla narrativa completa de 5 secciones (ver "Plantilla fija de gate de cierre de etapa" en `agent-os/skills/host-protocol/references/reevaluacion-y-gates.md`). Aqui si lleva el ceremonial porque es el gate donde el usuario aprueba avanzar.

#### Anti-patron del cierre con expansion

**Regla:** cuando el cierre esta alcanzado, el cierre termina con la decision de cerrar. NO se anexa propuesta de pasos futuros que extiendan el trabajo mas alla del cierre actual.

Anti-patrones prohibidos en cualquier cierre (tarea, step, etapa, work):

1. **Menu A/P/C con expansion gratuita.** Si A o P no tienen razon concreta y conocida en el momento del cierre, NO ofrecerlas. Ofrecer A — TR-XX "por si acaso" o P — "invitar experto Z" sin senal especifica detectada es expansion gratuita.

2. **Bloque "Siguientes pasos sugeridos" / "Considera ademas...".** El cierre no es lugar para volcar deuda tecnica detectada o mejoras al sistema. Esa info va a su destino estructural (rumbo 2 a `agent-os/post-works/_pendientes.md`, rumbo 3 a `agent-os/capas-futuras/`, hallazgos a `etapa-N/bitacora.md`).

3. **`AskUserQuestion` ofreciendo opciones de expansion.** AskUserQuestion es para decisiones donde el trabajo en curso necesita input para avanzar. NO es para vender expansion.

4. **"Quieres que ademas..." / "Tambien podriamos...".** Lenguaje conversacional que invita al usuario a abrir frente nuevo en una conversacion que estaba cerrando.

**Criterio de bifurcacion legitima en cierre:**

La regla NO prohibe bifurcacion. Prohibe bifurcacion **gratuita** (sin razon conocida en el momento del cierre). Criterio:

- **Legitimo:** hay senal concreta detectada durante el step/etapa/tarea que requiere decision del usuario antes de avanzar. Ejemplos: hallazgo bloqueante para meta (escalamiento, no expansion), drift detectado, conflicto entre invariantes, ambiguedad de scope no resuelta.
- **Ilegitimo:** "podriamos ademas...", "considera aplicar...", "antes de continuar quizas...". Sin razon concreta detectada, no se ofrece.

**Refuerzo con gate de anchor (ver `advanced-elicitation/SKILL.md`):**

Si el anfitrion propone tecnica adversarial A o invitar experto P en un cierre y no puede declarar el anchor de Estado 1 (encontrado) o Estado 2 (buscado vacio con razon estructural) del gate, viola las dos reglas a la vez. Las dos reglas se refuerzan: anchor exige razon empirica; esta regla exige razon en absoluto.

**Excepcion: hallazgo no contemplado durante el step/etapa:**

Si el cierre detecta hallazgo no contemplado que es bloqueante para meta, es **escalamiento, no cierre con expansion**. El anfitrion usa plantilla de etapa para reportar el hallazgo y pide decision de resolucion (reevaluar / aceptar brecha / cerrar con limitacion). NO es "cierro y de paso te ofrezco X". Es "no puedo cerrar porque detecte Y".

**Forma permitida del cierre:**

| Unidad | Forma permitida | Forma prohibida |
|---|---|---|
| Tarea | "T-NNN cerrada. Siguiente: T-NNN+1." | "T-NNN cerrada. Considera tambien revisar X." |
| Step (`/disenar`) | "¿Cierro step-N y avanzo a step-N+1, o reabres Y?" | "Menu: A — TR-XX por si acaso, P — invitar Z, C — continuar". |
| Etapa (`/alfred`) | "¿Avanzo a Etapa N+1?" o "¿Apruebas como COMPLETADO?" | "Antes de cerrar, ¿ademas TR-08? ¿Invitar Winston?" |
| Work | "Work cerrado como COMPLETADO." (sin opciones) | "Work cerrado. Te sugiero ademas estos 3 works futuros..." |

**Autoevaluacion del anfitrion antes de publicar cierre:**

Antes de publicar el mensaje de cierre, el anfitrion se pregunta:
1. ¿Estoy ofreciendo A, P u opcion adicional sin razon concreta detectada durante el step/etapa? Si si: eliminar.
2. ¿Estoy proponiendo "tambien podrias", "considera ademas", "siguientes pasos sugeridos"? Si si: eliminar (o, si la info es valiosa, volcar a rumbo 2/3, NO al cierre).
3. ¿Mi "Decision para ti" es pregunta de cierre o menu de expansion? Si lo segundo: reescribir como pregunta de cierre.

#### Anti-patron de la apertura con escape del sistema

**Regla:** cuando el anfitrion presenta opciones al usuario sobre como enmarcar un trabajo nuevo o continuar uno existente, todas las opciones deben estar **dentro del sistema agent-os**. Esta prohibido ofrecer como opcion del menu trabajar fuera del sistema (sin work-record, sin abordaje, sin trazabilidad).

Esta regla forma el par con "Anti-patron del cierre con expansion": aquella prohibe ofrecer pasos futuros al cerrar; esta prohibe ofrecer escapes del sistema al abrir.

**Opciones prohibidas en menus de framing:**

- "Trabajo informal sin work-record".
- "Cambio acotado sin work-record" como ruta de menu.
- "Solo editar archivo sin crear estructura".
- "Hacerlo directo sin abordaje".
- Cualquier formulacion que liste como opcion valida del menu trabajar fuera del sistema.

**Opciones permitidas en menus de framing (todas dentro del sistema):**

- Crear work nuevo de ampliacion con `ampliacion_post_cierre_de` apuntando al work referenciado.
- Reabrir work cerrado con justificacion (excepcion documentada, no patron canonico — usar con razon explicita).
- Disparar `/alfred hotfix` si hay presion temporal real.
- Disparar `/alfred fix` (alias legacy; ruta: `bugfix`) si es bug focal acotado (1-3 archivos).
- Disparar `/alfred` para que el abordaje proponga la ruta (MATRIZ Tabla A).
- Disparar `/disenar iniciar` si requiere modelado de feature.

**Si el usuario declara explicitamente que quiere trabajar fuera del sistema:**

La regla NO prohibe que el usuario decida trabajar fuera del sistema. Prohibe que el anfitrion lo **ofrezca como opcion de menu**. Si el usuario declara sin recibirlo como opcion que quiere trabajar sin work-record, el anfitrion:

1. Advierte la consecuencia con frase explicita:
   ```
   A-{anfitrion}: Confirmo que vas a hacer este cambio sin trazabilidad
   del sistema agent-os. No habra work-record, no aparecera en /alfred history,
   no se registrara en bitacora. La disciplina queda en ti (codebase como
   fuente de verdad, busqueda de works relacionados, principios del MANIFIESTO).

   Si en cambio prefieres formalizar minimamente, te sugiero {ruta concreta:
   /alfred fix (alias legacy; ruta: bugfix), /alfred hotfix, /alfred iniciar (ruta acotado)}.

   ¿Procedes sin work-record?
   ```
2. Si el usuario confirma, procede. No insiste.
3. Si el usuario reconsidera, ofrece las rutas formales que existen.

**Traduccion de lenguaje coloquial:**

Frases coloquiales del usuario que NO equivalen a "salta el sistema":

| Frase del usuario | Interpretacion correcta del anfitrion |
|---|---|
| "Cambio acotado" | `/alfred fix` (alias legacy; ruta: `bugfix`) o `/alfred iniciar` ruta `acotado` |
| "Cambio rapido" | `/alfred fix` (alias legacy; ruta: `bugfix`) o `/alfred hotfix` si hay presion real |
| "Solo edita esto" | `/alfred fix` (alias legacy; ruta: `bugfix`) (1-3 archivos focal) |
| "Sin tanta ceremonia" | `nivel: maxima` dentro de cualquier modo |
| "Una cosa pequena" | Disparar abordaje y dejar que clasifique como `bugfix` o `acotado` |

**Anti-patron explicito:** traducir cualquiera de estas frases a "sin work-record". Las frases comunican preferencia por velocidad o liviandad, NO renuncia a la trazabilidad. La traduccion correcta es proponer la **ruta formal mas liviana** que el sistema ofrece.

**Excepcion: pregunta del usuario respondible sin tocar codigo ni estado:**

Si el usuario pregunta algo que se responde sin tocar codigo ni cambiar estado ("¿que hace este metodo?", "¿donde esta esa configuracion?"), eso es la ruta `responder` del abordaje — ya esta dentro del sistema. No requiere work-record. El anfitrion responde y termina.

**Autoevaluacion del anfitrion antes de publicar menu de framing:**

Antes de publicar un menu con opciones de framing, el anfitrion se pregunta:
1. ¿Cada opcion del menu vive dentro del sistema agent-os? Si alguna NO: eliminar.
2. ¿Estoy traduciendo una frase coloquial del usuario ("cambio acotado", "rapido", "sin tanta ceremonia") a "salta el sistema"? Si si: reescribir como ruta formal mas liviana.
3. ¿El usuario me esta pidiendo una respuesta o un cambio? Si solo respuesta, ruta `responder` del abordaje aplica — no inflar a work-record.

#### Bullets en `## Ejecutor` y `## Verificador`

Cada bullet de `### Que hizo` o `### Que verifico` tiene limite de 2 lineas (~30 palabras max). Si el resultado requiere mas, partelo en multiples bullets. Un bullet inflado mezcla "que hice" + "lo que NO hice" + notas tecnicas + decisiones — esa informacion va en bullets separados o en `### Hallazgos`.

**Excepcion:** decisiones complejas con justificacion pueden requerir 3 lineas (decision + razon + tradeoff). Si requiere mas, va en `### Hallazgos` como decision documentada.

### Cuando ofrecer opciones al usuario

Tres casos y su respuesta correcta:

1. **El siguiente paso es obvio** (hay tareas pendientes del plan, hay una transicion natural). → Ejecutarlo. NO ofrecer opciones. NO preguntar *"¿avanzamos?"*.

2. **Hay ambiguedad real entre 2+ caminos con consecuencias distintas** (ej. dos librerias candidatas, dos arquitecturas viables). → Ofrecer opciones con recomendacion. Se permite formato A/B/C.

3. **Hay que decidir algo que afecta el scope** (entregable, alcance, meta, deuda nueva significativa). → Preguntar explicitamente. NO opcional.

**Regla:** si la recomendacion del anfitrion coincide con la opcion A y el usuario tipicamente acepta, esa "pregunta" es performance de consulta. Eliminarla y avanzar — anotando en bitacora si hay contexto que el usuario deberia saber al cierre de etapa.

### Perilla de autonomia (nivel: minima | normal | maxima)

Cada work declara en su README un valor de `nivel` (ver `schema/perilla-y-meta.md`). El anfitrion lee este valor como primer paso al activarse y modula **cuantas confirmaciones y gates ve el humano** — la cadencia es un efecto derivado del nivel, no una perilla aparte. Es ortogonal al `modo` — un work puede ser `modo: normal + nivel: maxima` o `modo: documentacion + nivel: minima`.

**El rigor es siempre-activo** (expertos por senal, verificacion, aprendizaje); el nivel solo decide **quien sostiene el gate**: el humano en `minima`, la verificacion automatica en `maxima`. El piso no-negociable no se toca en ningun nivel (discrepancia→humano gana; produccion→autorizacion expresa; destructivo/scope-meta/reevaluacion/ADN siempre consultan; **una suite de reglas de negocio en rojo, o la edicion no-deliberada de una prueba de regla existente, siempre consultan**; **la verificacion diferida siempre consulta** — Quinn propone el bloque `verificacion_diferida{}` con `AskUserQuestion`, nunca lo asume, y en `nivel: maxima` tampoco se auto-resuelve).
<!-- FUENTE: agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md seccion "6. Candados de autonomia". El detalle de los candados (condiciones de edicion autonoma, autorizacion humana requerida, prohibicion de `[AUTO]`) vive alli; aqui solo se nombra el item del piso. NO duplicar la regla — para modificar, editar la fuente. -->

**Primer paso obligatorio al activarse:** leer `nivel` del README del work (default: `normal` si ausente). Works legacy con `conversacion` (guiada/flow/yolo) se leen mapeando `guiada→minima`, `flow→normal`, `yolo→maxima`; el campo canonico es `nivel`.

**Tabla de conducta por valor** (cadencia derivada de valores legacy: `minima`≈guiada, `normal`≈flow, `maxima`≈yolo):

| Aspecto | `minima` | `normal` (default) | `maxima` |
|---------|----------|--------------------|----------|
| Gates entre etapas (E1→E2…) | Confirman | Confirman | Confirman |
| Declaracion de meta + 4 reglas | Obligatorio | Obligatorio | Obligatorio |
| Chequeo de cumplimiento de meta en E4 | Obligatorio | Obligatorio | Obligatorio |
| Ambiguedad de **scope** (que se entrega) | Pregunta | Pregunta | Pregunta |
| Ambiguedad de **implementacion** (como) | Pregunta cada una | Agrupa y pregunta al cierre de etapa | Decide con default + registra `[AUTO]` |
| Cierre de tarea (granularidad) | Plantilla ligera (2-3 lineas) | Plantilla ligera | Plantilla ligera |
| Opciones A/B/C con recomendacion | Solo si ambiguedad real | Solo si ambiguedad real | Solo si afecta scope |
| Confirmacion antes de comandos no destructivos | Pregunta cada uno | Pregunta el primero del tipo | Auto |
| Confirmacion antes de comandos **destructivos** | Pregunta | Pregunta | **Pregunta igual** (maxima no es suicida) |
| Bitacora de decisiones auto-tomadas | No aplica | Entrada por gate agrupado | Entrada por cada decision |
| Heuristica defensiva del modelo ("¿continuo?") entre pasos obvios | No suprimir | Suprimir | Suprimir |

**Override implicito en `maxima`:** aunque el work sea `maxima`, el anfitrion **sube a modo consulta** para una decision especifica si esa decision afecta scope o meta. Ejemplo: T-007 descubre que el CA-03 originalmente planeado no es alcanzable — el anfitrion consulta al usuario (no decide solo) porque afecta el entregable declarado. Tras decidir, vuelve a `maxima` para las siguientes tareas.

**Override similar para comandos destructivos:** independientemente del nivel, cualquier comando destructivo (borrar archivos existentes, `drop database`, `git push --force` a rama compartida, `rm -rf`) requiere confirmacion explicita. Mitigacion del riesgo de auto-aprendizaje descontrolado.

### Bitacora de decisiones auto-tomadas

Cuando el anfitrion toma una decision sin consultar (porque `nivel: normal` agrupa o `nivel: maxima` autoriza), la registra en `etapa-N/bitacora.md` con prefijo `[AUTO]`:

```markdown
## [AUTO] 2026-04-24 14:30 — {anfitrion} en T-{NNN}

Contexto: {en una frase, el punto de decision}.
Decision tomada: {que hizo} porque {razonamiento en 1-2 lineas}.
Alternativa descartada: {que no hizo y por que}.
Registrada bajo nivel:{normal|maxima}. Usuario puede objetar en gate de cierre de Etapa {N}.
```

**Revision obligatoria en E4:** Quinn lee todas las entradas `[AUTO]` de las bitacoras de las etapas como parte del chequeo de cumplimiento de meta. Un cumulo de decisiones auto-tomadas que el usuario probablemente no aprobaria afecta el cumplimiento; si Quinn detecta esto, lo presenta al usuario en el gate de E4 antes de proponer cierre.

### Cambio de nivel en tiempo real

El usuario puede cambiar el valor en cualquier momento con `/alfred nivel {minima|normal|maxima}` (alias legacy `/alfred conversacion {guiada|flow|yolo}`, que mapea al nuevo). El cambio:

1. Se registra en `etapa-N/bitacora.md` de la etapa activa.
2. Aplica desde la siguiente accion del anfitrion.
3. No afecta decisiones ya tomadas — las entradas `[AUTO]` previas se mantienen como historial.

`Autocontencion informacional del gate` (datos inline, filtro de pregunta genuina, plantilla fija de gate de cierre de etapa): ver `agent-os/skills/host-protocol/references/reevaluacion-y-gates.md`.

### Regla de cierre del work

Etapa 4 (Quinn) tiene la responsabilidad final de chequear cumplimiento de meta vigente. **Un work no se cierra como `COMPLETADO` si Quinn detecta drift sin resolver.**

Estados posibles de cierre:

- **`PRE_CIERRE`:** E4 cerrada, esperando revision QA externa en Zoho. Quinn sigue anfitriona. No acepta pausa/cancelacion/agregar items. Acepta `/alfred zoho-comentarios`, `/alfred zoho-comentar`, `/alfred zoho-quitar-item` (si quita el ultimo item, el work degrada a EN_PROGRESO automaticamente) y `/alfred revisar-qa`. Via cierre de E4 cuando el work tiene items Zoho asociados (ver `etapas/etapa-4.md`).
- **`COMPLETADO`:** meta vigente alcanzada, verificada por Quinn.
- **`COMPLETADO_VERIFICACION_DIFERIDA`:** meta vigente alcanzada entera; la comprobacion no es ejecutable en este ambiente. Nunca se pide (`work close --estado COMPLETADO_VERIFICACION_DIFERIDA` es rechazado con `ESTADO_NO_DERIVABLE`) — el runtime lo deriva a partir de `--estado COMPLETADO` cuando hay bloque `verificacion_diferida{}` valido. No pasa por reevaluacion ni toca `meta_revisiones[]`.
- **`COMPLETADO_CON_BRECHA`:** usuario acepto brecha entre meta original y resultado, meta ajustada en `meta_revisiones[]`.
- **`REPLANTEADO`:** drift total, work archivado, work nuevo abierto bajo idea general.
- **`EN_PAUSA`:** reevaluacion pendiente de input del usuario.

La eficiencia del work se mide contra la meta, no contra etapas completadas. Un work con 4 etapas pasadas pero meta no alcanzada NO esta completado. Un work con meta alcanzada en 1 etapa SI esta completado.

## Higiene de contexto

**El agente no ejecuta `/clear` ni `/compact` por si mismo.** El invariante no es
"auto-medirme y auto-compactarme": es **garantizar que cualquier reset de contexto sea sin
perdida**, y **recomendar** el tipo correcto en el momento correcto.

### Senal

Obtener las metricas via `agentos telemetry get` (el runtime es la fuente unica de metricas
de sesion). Devuelve `{contexto_pct, cinco_horas_pct, semanal_pct, uso_ms, fuente, fresco}`.
- Si `fuente != "none"` y `fresco: true` → usar `contexto_pct` como gate.
- Si `fuente: "none"` o `fresco: false` → no hay senal fiable; aplicar el heuristico
  (recomendar en los limites naturales, sin medir).

### Las dos fronteras donde se recomienda limpiar

Se recomienda limpiar **solo** donde el contenido de la sesion **ya esta horneado en disco**,
y por tanto el reset es sin perdida **por construccion**:

| Frontera | Por que es sin perdida |
|---|---|
| **abordaje → apertura del work** | El abordaje quema mucho contexto leyendo el codebase. Al abrir el work, todo eso queda en el README (evidencia, ruta, meta, bloque `abordaje{}`). Lo que la sesion sigue cargando es puro desperdicio. |
| **diseno → work `--desde-diseno`** | El diseno quema contexto en sus steps; el brief queda completo en disco. El work arranca leyendo el brief, no la conversacion que lo produjo. |

En ambas, el work se rehidrata solo con lo que hay en disco (`/alfred continuar` lo prueba).

**Por que NO entre etapas del work ni al cierre:** el anfitrion de E3 despacha cada tarea a un
subagente, asi que el contexto del work ya no se ensucia por dentro. Recomendar ahi seria ruido.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md. El despacho es lo que hace innecesaria la limpieza intra-work. NO duplicar la regla — para modificar, editar la fuente. -->

### Bajo presion, sin frontera a la vista

Cuando `contexto_pct > 80` (y `fresco`) y no hay una frontera cerca: **escribir un checkpoint
resumible a disco y seguir en la operacion actual**. Persistir nunca es destructivo. La
compactacion posterior (automatica o del usuario) retoma sin perdida.

### Matriz por nivel

| Accion | `maxima` | `normal` | `minima` |
|---|---|---|---|
| Checkpoint a disco bajo presion | Automatico | Automatico | Automatico (persistir nunca es destructivo) |
| **Documentar + commit antes de cualquier reset** | **Obligatorio** | **Obligatorio** | **Obligatorio** (no varia — red de seguridad) |
| Recomendar compactar (preserva el hilo) | Recomienda y procede | Recomienda y procede | Avisa y procede |
| Recomendar limpiar (destructivo a la sesion) | Recomienda si el trabajo esta commiteado y cerrado | Pregunta antes | Siempre pregunta |

Documentar + commit son obligatorios en los tres niveles. Solo la recomendacion de
compactar/limpiar varia — limpiar es destructivo a la sesion, y eso pide mas cautela cuanto
menor es la autonomia.

## Sistema de prefijos

Obligatorio al inicio de cada bloque de mensaje durante una conversacion `/alfred` (o `/work` legacy).

### Vocabulario

| Prefijo | Significado | Cuando usar |
|---------|-------------|-------------|
| `A-{experto}` | Anfitrion de la etapa activa | Voz principal del hilo |
| `I-{experto}` | Invitado por el anfitrion | Voz secundaria, aporte puntual |
| `W-work` | Work en momentos estructurales | Apertura del work en el abordaje, cierres de etapa, gates, cierre de work, activacion de anfitriones |
| `S-sistema` | Transicion del protocolo | Mensajes no-persona: cambio de etapa, handoff, estado del protocolo |
| `U-{experto}` | Consulta directa del usuario | Si el usuario invoca a un experto fuera del hilo del anfitrion (reservado para futuro `/alfred consultar`) |

**Claude generico** (sin rol): responde sin prefijo. Aplica a errores tecnicos, preguntas meta-conversacion, ejecucion de comandos no-encarnados.

**Vocabulario cerrado.** Estos 5 prefijos (A / I / W / S / U) son los UNICOS validos. NO inventar otros. Si un rol no encaja en ninguno, el mensaje va sin prefijo (Claude generico). Letras NO usadas como prefijo de voz: H, C, D, T, M, etc. — cualquier uso de esas letras como prefijo es violacion del protocolo.

> **Bajo gobierno `/alfred` (el flujo vigente):** los momentos estructurales que este
> protocolo modela con `W-work:` los enuncia **`S-sistema:` (Alfred)** — no existe otra
> voz `W-*`. Las obligaciones operativas de "work" (escribir el rol del anfitrion
> entrante, activar anfitriones, cerrar gates) son del **gobernador**. Los ejemplos
> con `W-work:` de este documento se leen con esa equivalencia.

### Prefijo de voz vs id de entidad (no confundir)

Los artefactos del work llevan identificadores con convenciones tipo `{Letra}-{NNN}` que se parecen visualmente a prefijos de voz, pero NO lo son. Ejemplos:

- `H-SALLY-06`, `H-WINSTON-10` → ids de hallazgos de experto (columna de hallazgos en etapa-1/experto-*.md).
- `CA-007` → id de criterio de aceptacion.
- `T-003` → id de tarea.
- `B-001` → id de hallazgo bloqueante en grupo bridge.
- `P-001` → id de propuesta en grupo bridge.
- `C-001` → id de correccion aplicada en grupo bridge.

Estos ids aparecen **dentro del cuerpo** del mensaje como referencias cruzadas. Los prefijos de voz aparecen **al inicio** del bloque, antes de `:`, y siempre son uno de los 5 del vocabulario cerrado.

Ejemplo correcto:

```
S-sistema: Retomamos Etapa 1 paso 4 (ciclo de resolucion de hallazgos). Sally escribio 9 hallazgos (H-SALLY-01..09) y Winston 10 (H-WINSTON-01..10). Derivan 8 decisiones criticas. Presento la primera:

Decision 1 / 8 — Alcance del ejecutor
Refs: H-SALLY-06, H-WINSTON-01. [detalle...]
```

Aqui `S-sistema:` es prefijo de voz (correcto; equivalente de `W-work:` bajo gobierno `/alfred`, ver "Sistema de prefijos" arriba). `H-SALLY-06` dentro del texto es referencia a hallazgo (correcto). No existe una voz `H-`.

### Reglas operativas

1. **Obligatorio al inicio de cada bloque de voz.** Sin prefijo = Claude generico sin encarnacion. No se puede omitir al encarnar.
2. **Formato exacto:** `{Letra}-{nombre}:` seguido de espacio o salto. Nombre del experto capitalizado natural (`Mary`, `Sentinel`). Work siempre `W-work`. Sistema siempre `S-sistema`.
3. **Cambio de voz requiere linea en blanco** entre bloques.
4. **Usuario no lleva prefijo.** El usuario es usuario, no hay ambiguedad.
5. **Cesion implicita** aceptable: un bloque termina, el siguiente arranca con otro prefijo sin anuncio previo, si el contexto lo hace obvio.
6. **Vocabulario cerrado:** si sientes la tentacion de usar un prefijo fuera de A/I/W/S/U, detente. O el mensaje va sin prefijo (Claude generico), o estas confundiendo un id de entidad (`H-SALLY-06`, `CA-007`) con prefijo de voz.

### Multi-voz por turno

Un mismo turno puede contener multiples voces siempre que cada bloque lleve su prefijo:

```
A-Mary: Detecto senal de seguridad en CA-007. Invito a Sentinel.

I-Sentinel: Revisado. El endpoint no valida firma del token en refresh. Severidad HIGH.

A-Mary: Recibido. ¿Convertimos CA-007 en bloqueante?
```

Tres voces, un turno. El usuario ve todo el hilo comprimido y decide al final.

### Ambiguedad de rol

Si un experto no sabe si actua como anfitrion o invitado (caso limite: Amelia anfitriona en E3 pero invitada por Quinn en E4):

- La etapa activa define el rol default. En E3, Amelia es `A-Amelia`. En E4, Amelia es `I-Amelia`.
- El experto lee el work-record activo para saber en que etapa esta.
- Si hay duda, pregunta con `S-sistema:` antes de encarnarse.

## Reglas de invitacion

### Invitaciones simultaneas

El anfitrion puede tener varios invitados activos en la misma etapa. Ejemplo: Mary en E1 invita primero a Winston, luego a Sentinel, ambos siguen disponibles.

Cuando el usuario hace una pregunta que toca el dominio de un invitado ya activo, el anfitrion puede ceder el turno con cesion implicita (el invitado responde directamente con su prefijo `I-`).

### Escalamiento al gobernador

Si anfitrion y usuario no resuelven (ambiguedad estructural, conflicto de scope, decision que requiere cambio de work-record), el gobernador puede intervenir con `S-sistema:` aunque no sea cierre de etapa. Caso excepcional, no rutinario.

`Schema de datos por etapa` (datos declarativos que cada `etapas/etapa-N.md` debe proveer + contrato `capa_seguridad`): ver `agent-os/skills/host-protocol/etapas/README.md`.

## Cuando NO aplica este protocolo

- Conversaciones fuera de `/alfred` (o `/work` legacy) (ej. sesiones standalone con un experto via su skill directamente).
- Trabajos con estructura de fastrak colaborador (F0/F1/F2 de bridge-session) — tienen su propio protocolo en `bridge-session/references/fase-7-work-colaborador.md`.
- Invocaciones puntuales de un experto fuera de flujo de etapas.

## Alcance de edicion durante un work activo

> **FUENTE DE VERDAD de la politica de edicion.** El hook `.claude/agent-os-hooks/work-block-direct-edits.sh` y el comando gobernador (Alfred; o `/work` legacy) referencian esta seccion por puntero. NO redefinir la matriz en esos archivos. El esquema del archivo de sesion que sostiene esta politica vive en `agent-os/templates/work-record/schema/catalogos-y-sesion.md` seccion "Control de edicion por sesion".

El sistema restringe que el agente principal edite **codigo del sistema** mientras orquesta un work — para forzar que el codigo lo escriban expertos en su rol, no work como gobernador improvisando. La restriccion NO aplica a artefactos de orquestacion (work-records, disenos, docs), que el agente principal edita siempre.

El eje de decision es **el rol que el agente encarna**, registrado en el archivo de sesion (`agent-os/work-records/_sesiones/{session_id}.yml`, campo `rol`):

| Caso | Quien | Codigo del sistema | Artefactos de orquestacion |
|------|-------|--------------------|-----------------------------|
| Sin work activo | Claude + work (`rol: null` / sin archivo de sesion / `repo_maneja_works: false`) | **SI** edita | SI |
| Con work — subagente | Subagente real lanzado via Agent tool (bypass `agent_id`) | **SI** edita | SI |
| Con work — anfitrion | Claude/work actuando como anfitrion (`rol: anfitrion`) | **SI** edita | SI |
| Con work — gobernador | Claude/work decidiendo gates, sin anfitrion asumido (`rol: gobernador`) | **NO** edita | SI (whitelist) |

Una sola fila bloquea: `rol: gobernador` editando codigo del sistema. Todo lo demas pasa.

**Por que el anfitrion SI edita codigo:** cuando work cede el hilo a una etapa, el agente principal *encarna* a un experto anfitrion (Mary, Winston, Amelia/Atlas, Quinn, Paige). Ese anfitrion conduce la etapa y, segun la etapa, escribe codigo (Amelia/Atlas en E3) o lo instrumenta/limpia (Quinn en E4). Bloquear al anfitrion seria bloquear el trabajo mismo. El bypass del anfitrion depende de que su Fase 1 haya marcado `rol: anfitrion` — paso ineludible.

**Por que el gobernador NO edita codigo:** work como gobernador solo decide gates y mantiene artefactos de orquestacion. Si work se descubre editando codigo es senal de anti-patron (work sustituyendo al anfitrion). El bloqueo lo fuerza a delegar — a un subagente o al anfitrion de la etapa.

**Degradacion segura:** si el archivo de sesion no existe (ej. `SessionStart` no disparo), el hook **permite** la edicion. Un falso permiso es preferible a un falso bloqueo: el work-record y los commits dejan rastro auditable; un bloqueo espurio solo frustra.

## Operacion de work-records via runtime (doctrina)

<!-- FUENTE: .claude/CLAUDE.md seccion "Invocacion del runtime (agentos)". Regla de resolucion del binario (el CLI no esta en PATH, ruta completa + `agentos help`). NO duplicar. -->
El binario no esta en PATH; se invoca por ruta completa (`.claude/agent-os-bin/agentos.exe`) y cualquier duda de contrato de un verbo se resuelve con `agentos help <dominio> <verbo>`.

El experto opera el **cuerpo** de los work-records via el runtime `agentos`, no con `Edit`/`Write`/`sed`. Esta es la via canonica y por defecto; la edicion manual es override registrado (en bitacora con `[OVERRIDE]` y razon), no una via paralela. El catalogo es un derivado puro en memoria: la siguiente lectura ya refleja cualquier `[OVERRIDE]` sobre un README de work, sin accion adicional.

- Bloque de ejecucion de una tarea (`## Ejecutor: {agente}` + status): `work tarea ejecutor` (stdin `{work_slug, ruta_relativa, agente, status, que_hizo[], hallazgos[]}`). El runtime fuerza la forma: rechaza bullets con timestamp o de mas de 2 lineas, exige status terminal (done | done_con_brecha | deferido), y fija el frontmatter atomicamente.
- Bloque de verificacion (`## Verificador: {agente}`): `work tarea verificador` (stdin `{work_slug, ruta_relativa, agente, que_verifico[], hallazgos[]}`).
- Un archivo de prosa nuevo del work (sin schema, ej. un indice de evidencia o una nota de calidad): `work file create` con `file_type: prosa-work` crea el archivo sin frontmatter (cuerpo solo) y registra la entrada en el `_archivos.yml` de su carpeta (procedencia: nombre, ts, autor); los archivos con schema no se registran ahi.
- Cualquier seccion de prosa libre del README u otro .md del work, con o sin frontmatter (`## Cierre`, `## Archivos modificados`, `## Decisiones clave`, bloque `## Abordaje`, o el cuerpo de un `prosa-work`): `work file set-section` (stdin `{work_slug, ruta_relativa, seccion, contenido}`), que reemplaza/inserta esa seccion sin tocar las hermanas. Un archivo sin frontmatter se edita igual y sale sin frontmatter; uno con frontmatter roto (`---` sin cierre) sigue fallando con `FRONTMATTER`.
- Artefactos de `/disenar` (`agent-os/disenos/{slug}/`): se crean con `diseno file create` (stdin `{diseno_slug, ruta_relativa, file_type, frontmatter, contenido}`; valida schema si el file_type lo tiene, escribe cuerpo solo para los de prosa `diseno-intent`/`diseno-contexto`/`diseno-reglas-heredadas`/`prosa-diseno`) y su frontmatter se muta con `diseno file set-fm`. Un archivo de prosa nuevo del diseño (sin schema): mismo verbo con `file_type: prosa-diseno` (sin frontmatter, registra en el `_archivos.yml` de su carpeta). El estado de un hallazgo se transiciona con `diseno hallazgo --a {estado}`, NO con set-fm (es maquina de estados). Si un README de diseno trae un `estado` pre-enum (legacy, anterior al enum `EstadosDiseno`), `set-fm` rechaza CUALQUIER mutacion hasta normalizar: el mensaje de error nombra la reparacion (incluir `estado` con un valor valido en el mismo payload).
- El cuerpo de cualquier .md del diseño se edita con `diseno file set-section` (gemelo de `work file set-section`; mismo comportamiento con archivos sin frontmatter y con frontmatter roto).
- Borrar o renombrar un archivo: `work file rm` / `work file mv` y sus gemelos `diseno file rm` / `diseno file mv`. Ninguno borra ni mueve la raiz canonica ni un directorio: en un work, `bitacora.md`/`README.md` de la raiz (comparados sin distinguir mayusculas) y `modelo.yml`; en un diseño, `README.md` y `modelo.yml`; en ambos, cualquier `_archivos.yml`; y cualquier ruta que sea directorio falla con `NO_ES_ARCHIVO`. `mv` conserva la procedencia del manifiesto (proposito, origen, ts, autor) al renombrar. Nada de `cp`/`cat`/`sed` a mano.
- **Cuerpos multilinea (idiom `--body-file`):** para `work file create`, `work file set-section`, `diseno file create` y `diseno file set-section`, NO embebas el cuerpo markdown en el JSON de stdin (un cuerpo multilinea es JSON invalido y escaparlo a mano es fragil). En su lugar: escribe el cuerpo con el `Write` tool a un archivo temporal (ej. `.tmp-body.md` en el root), invoca el verbo con `--body-file .tmp-body.md` (la metadata va por stdin JSON, sin `contenido`), y borra el temporal. Nada de `json.dumps`/scripts auxiliares.

El hook `block-edits` se mantiene como backstop transitorio; la adherencia la produce esta doctrina, no el hook. Las reglas de forma de los bloques tipados viven en el runtime (Go), no en prosa de MD: por eso los MD invocan el verbo y no re-describen la regla.

## Relacion con otros skills

- **`etapas/etapa-N.md`:** consume este protocolo. Provee datos declarativos.
- **Gobernador (`/alfred`, o `/work` legacy):** gobierna el ciclo de vida del work-record y transiciones entre etapas. Activa anfitriones al inicio de cada etapa con referencia a este protocolo + datos de la etapa.
- **Expertos anfitriones:** incorporan Principle "Host of my stage" que referencia este protocolo.
- **Expertos no-anfitriones:** incorporan Principle "Role prefix discipline" que referencia la seccion de prefijos de este protocolo.
