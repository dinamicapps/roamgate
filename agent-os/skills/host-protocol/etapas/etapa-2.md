---
name: etapa-2
description: Etapa 2 Plan - Anfitrion por modo (Winston en normal/investigacion y legacy evolucion, Paige en documentacion). Bob materializa tareas al cierre con granularidad por modo.
---

# Work Etapa 2 — Plan

## Insumo de E2 (3 origenes posibles)

E2 acepta como input uno de los siguientes origenes, segun la ruta destilada del abordaje:

| Origen | Ruta del abordaje | Contenido |
|---|---|---|
| **Bloque `## Abordaje` del README del work** | `acotado` | Evidencia + drifts + ruta destilada + decision usuario. Bob materializa tareas leyendo este bloque + frontmatter `abordaje{}`. |
| **Brief de `/disenar` + `## Terreno` del README** | `diseno` | Contratos modelados + procesos + actores + reglas heredadas. El work tiene `diseno_origen: {slug}` en frontmatter y, **cuando el frontmatter tambien trae `work_paraguas`**, su propio subgrafo del modelo en `modelo.yml`, proyectado en el bloque `## Terreno`: que nodos le tocan, cuales **construye** y cuales solo **consume**, y que cruza hacia otros works (frontera). Winston lo lee ANTES de planificar: un nodo con `rol: construye` es entrega de este work; uno con `rol: consume` es terreno que hay que respetar, no rehacer. Si el bloque existe pero esta vacio, rehacerlo con `agentos work terreno --slug {work}` — **eso vale mientras el work ya tenga su `modelo.yml`, o pueda hornearlo de su diseño de origen**; cuando ni lo tiene ni puede, ese verbo no proyecta nada: responde `SIN_DISENO_ORIGEN` cuando al work le falta alguna de las dos coordenadas (`diseno_origen`, `work_paraguas`), y `HORNEADO` cuando las trae ambas pero el diseño de origen no tiene `modelo.yml`. En los dos casos no hay de donde derivar el terreno. Un work con `diseno_origen` y **sin** `work_paraguas` no gana su subgrafo por el camino derivado: no hay fila del plan de works de la cual derivarlo — se planifica con el brief, y si eso sorprende, la fila del `plan_works[]` es lo que falta en el diseño. Tampoco lo gana asi el work cuyo diseño de origen no llego a tener `modelo.yml` (diseños anteriores al modelo): mismo caso, se planifica con el brief. El bloque `## Terreno` puede seguir presente igual (el molde lo siembra siempre) pero vacio, y puede llenarse mas tarde por el camino reconstruido: `modelo emitir --portador work` primero, `agentos work terreno --slug {work}` despues. Ese es el orden en los dos sub-casos de este parrafo — sin el primer verbo, el segundo no tiene modelo que proyectar. Caso aparte: el bloque no esta vacio sino **desactualizado** porque el diseño gano o perdio nodos despues de abierto el work. Ahi `agentos work terreno --slug {work}` no cambia nada — responde `modelo_ya_existia: true` — y la via es `agentos work terreno --slug {work} --rehornear`, que re-proyecta el subgrafo desde el diseño, conserva intacto lo que el work emitio de propio y declara en `data.rehorneado` lo que se perdio (nodos retirados, aristas y referencias que quedaron colgando, y modificaciones locales pisadas). |
| **Artefactos de E1** | `investigacion` / `documentacion` | CAs de cobertura de insumo o cobertura editorial + audiencia + TOC tentativo. |

**Eliminado:** `02-opciones.md` ya no se genera. Las decisiones tecnicas, si existen multiples opciones reales evaluadas, se documentan inline en `etapa-2/03-plan.md` seccion "Decisiones tecnicas".

## Anfitrion por modo

<!-- FUENTE de la tabla maestra de anfitriones por etapa: agent-os/skills/host-protocol/etapas/README.md seccion "Tabla maestra — Anfitriones por etapa y modo". Esta tabla local enriquece con prefijo + referencia + matiz especifico de E2 (Sally invitada en legacy evolucion, frentes en investigacion). NO duplicar la tabla maestra — aqui solo el detalle de E2. -->

El anfitrion de Etapa 2 depende del `modo` declarado en el README del work.

| Modo | Anfitrion | Prefijo | Referencia |
|------|-----------|---------|------------|
| `normal` | **Winston** | `A-Winston:` | `agent-os/experts/bmad-agent-winston/SKILL.md` |
| legacy `evolucion` | **Winston** (con Sally invitada con capacidad LE) | `A-Winston:` | Igual + `bmad-agent-sally/references/lead-evolution.md` |
| `investigacion` | **Winston** (plan de frentes de investigacion, no opciones de codigo) | `A-Winston:` | Winston adapta su flujo a "frentes a investigar" |
| `documentacion` | **Paige** | `A-Paige:` | `agent-os/experts/bmad-agent-paige/SKILL.md` (referencias: `write-document.md`, `document-project.md`) |

**Constante:** Bob materializa tareas al cierre en todos los modos. Lo que cambia es el tipo y la granularidad de las tareas (ver "Materializacion de tareas por modo" abajo).

## Roster de invitables por modo

### Modo `normal`

| Experto | Cuando invitarlo |
|---------|------------------|
| Bob | Al aprobarse el plan, para materializar tareas en etapa-2/tareas/{NNN}-{nombre}.md |
| Quinn | Revision de testeabilidad de tareas (RT) |
| Sentinel | Co-disenador del bloque `capa_seguridad` por tarea cuando el plan toca endpoints, metodos CRUD persistentes, hubs SignalR o services con efecto persistente. Tambien co-anfitrion de esta misma pieza (mision `[DP]`) cuando el abordaje (Fase 2) clasifico `permisos_repo_estado: no_documentado`. |
| Cipher | Cuando el alcance toca firma digital, estampas, llaves, cifrado o hashing de credenciales: Bob lo invita a co-disenar los bloques `capa_seguridad` con `dominios: ["cripto"]` de esas tareas (capacidad [PC]). <!-- FUENTE: agent-os/experts/bmad-agent-cipher/references/plan-y-verificar-cripto.md seccion [PC]. NO duplicar -- editar la fuente. --> |
| Paige | Si el plan requiere diagramas o doc nueva |

### Modo `evolucion` (legacy, deprecado -> ruta `rediseno-ui`)

Mismos invitables que `normal` + **Sally** con capacidad LE (lead-evolution): guia la conversacion de opciones hacia prototipo tangible e invariantes verificables antes de tocar codigo.

### Modo `investigacion`

| Experto | Cuando invitarlo |
|---------|------------------|
| Bob | Al aprobarse el plan de frentes, materializa tareas tipo `frente-investigacion` |
| Mary | Invitada por Winston para validar la estructura de los frentes desde su perspectiva de analista (consistencia con los CAs de E1) |
| Paige | Si los frentes requieren entregables con diagramas/esquemas |

Amelia, Quinn, Sentinel NO son invitados default: la ejecucion de E3 sera investigativa, no de codigo.

### Modo `documentacion`

| Experto | Cuando invitarla |
|---------|------------------|
| Bob | Al aprobarse la estructura del documento, materializa tareas tipo `seccion-documento` |
| Mary | Invitada por Paige para validar que la audiencia y alcance reflejan los CAs de E1 |
| Sally | Si el documento incluye flujos de usuario o wireframes |
| Tessa | Si el documento requiere screenshots automatizados via Playwright |

Winston, Amelia, Sentinel NO son invitados default: no hay opciones de arquitectura ni codigo que implementar.

## Senales a detectar

- Usuario elige opcion de solucion (modos normal/investigacion, incl. legacy evolucion) o aprueba estructura del documento (modo documentacion) → invitar capa de calidad antes de generar tareas.
- Plan aprobado → invitar a Bob para materializar tareas.
- Plan toca seguridad / PHI (modos con codigo) → invitar Sentinel.
- Plan toca endpoints, metodos CRUD persistentes, hubs SignalR o services con efecto persistente → invitar Sentinel para co-diseno del bloque `capa_seguridad`.
- Plan requiere diagramas Mermaid → invitar Paige (en modos donde no es anfitriona).
- Modo `documentacion` con flujos UI → invitar Sally.

Regla: invitaciones secuenciales segun flujo (opciones/estructura → decision → plan → tareas), no paralelas "por si acaso".

## Materializacion de tareas por modo (Bob)

Bob aplica granularidad y tipo de tarea segun el modo:

| Modo | Tipo de tarea | Granularidad | Criterio de autocontencion |
|------|---------------|--------------|----------------------------|
| `normal` | Codigo productivo (UTs, endpoints, refactors localizados) | 15-90 min | Codigo, tests, archivos referenciados, no-pre-resolver dependencias |
| legacy `evolucion` | Codigo + prototipo tangible (si Sally definio invariantes) | 15-90 min | Igual + invariantes LE referenciadas en frontmatter |
| `investigacion` | `frente-investigacion` (ej. "evaluar opcion A contra criterios X, Y, Z") | 1-4 horas por frente | Pregunta investigativa, fuentes a consultar, formato de entregable (tabla, matriz, reporte breve) |
| `documentacion` | `seccion-documento` (ej. "redactar seccion 3.2 - procedimiento de facturacion para cajero") | 30-120 min por seccion | Audiencia de la seccion, alcance, referencias de entrada, formato de salida |

Las tareas de `investigacion` y `documentacion` **no son UTs de codigo**. Las Reglas 1/2/3 de Bob (ver `bmad-agent-bob/references/create-story.md`) aplican con la siguiente adaptacion:

- **Regla 1 (no codigo productivo en la tarea):** sigue vigente en normal (incl. legacy evolucion). En investigacion/documentacion se sustituye por **"no adelantar el hallazgo o la seccion en la tarea — la tarea es el encargo, no el resultado"**.
- **Regla 2 (granularidad):** usa los rangos ampliados de la tabla.
- **Regla 3 (sin pre-resolucion de dependencias):** sigue vigente en todos los modos.

### Patron "dos olas" cuando `requiere-observacion: true`

Si el frontmatter `abordaje.suficiencia_evidencia` del README es `requiere-observacion`, Bob materializa tareas en **dos olas**:

**Ola 1 — Preparacion + instrumentacion + primera observacion:**
- Tareas concretas con frontmatter completo y CAs especificos.
- Cubre: setup de ambiente, scripts auxiliares permanentes, instrumentacion temporal con marcadores unicos, primer ciclo de observacion.
- Cierra con una tarea explicita "observar y replan" cuyo entregable es: bloque de hallazgos del primer ciclo + propuesta de tareas de Ola 2.

**Ola 2 — Materializada al cierre de Ola 1:**
- En el plan inicial existe como **placeholder explicito** con frontmatter minimo: `id: T-{NN}`, `status: placeholder-pendiente-observacion`, `descripcion: "A materializar tras Ola 1 segun hallazgos"`.
- Al cerrar la ultima tarea de Ola 1 (la tarea "observar y replan"), el gobernador detecta que el plan tiene tareas en `placeholder-pendiente-observacion` y re-invoca a Bob (mismo mecanismo que la materializacion inicial al aprobarse el plan en E2). Bob lee los hallazgos del entregable de la tarea de observacion y materializa cada placeholder con frontmatter completo. El usuario aprueba el plan extendido antes de que Atlas/Amelia continuen ejecutando.
- La materializacion de Ola 2 NO requiere regresar a abordaje ni a E1. Es continuacion natural de E2 dentro del mismo work.

**Anti-patron a evitar:** materializar Ola 2 con CAs adivinados antes de Ola 1. Si Bob siente que tiene "buenos candidatos" para Ola 2, los anota como `hipotesis_ola_2` en `etapa-2/03-plan.md` pero NO los convierte en tareas hasta tener observacion.

**Aplicabilidad:** este patron es opt-in via la senal del abordaje. NO aplica por default. Trabajos sin la senal mantienen materializacion de una sola ola como hoy.

**Status de tareas placeholder:** ver `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Status nuevos en tareas" para `placeholder-pendiente-observacion`.

## Capa de seguridad por tarea (modo normal, incl. legacy evolucion)

Aplica si `permisos_repo_estado` del README es `documentado` o `documentado_externo`. Si es `no_aplica_por_modo` u `override_usuario`, esta seccion se salta. Si es `no_documentado` al iniciar E2, se resuelve dentro de esta misma Etapa 2 con Sentinel como co-anfitrion (mision `[DP]`, ver "Anfitrion por modo" arriba), o como tarea T-001 INDISPENSABLE-PRE-EJECUCION en este E2 que bloquea el resto de tareas en E3.

### Principio operativo

El default es **restriccion-acceso a nivel endpoint/controller** — esta capa cubre la gran mayoria de casos. Solo se declara `modulacion-comportamiento` en BL/service cuando el permiso *altera* el flujo de un proceso ya autorizado (no lo niega; ej. tarifa preferencial vs estandar).

### Flujo de Bob al materializar cada tarea con `tipo_tarea: codigo`

**Mecanismo de escritura (runtime):** Bob materializa cada tarea con
`agentos work file create` (`file_type: tarea-etapa-2`, ruta
`etapa-2/tareas/T-NNN-{nombre}.md`, frontmatter completo + cuerpo en `contenido`),
y el plan con `agentos work file create` (`file_type: plan-etapa-2`, ruta
`etapa-2/03-plan.md`). El binario valida frontmatter contra schema y escribe
atómico; no se usa Write a mano para estos artefactos. Las secciones
`## Ejecutor`/`## Verificador` las escribe EXCLUSIVAMENTE el runtime
(`work tarea ejecutor|verificador`); no se editan con Edit/Write.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/artefactos-hijos.md. NO duplicar -- editar la fuente. -->

Bob conduce el dialogo asistido por Sentinel si esta invitado. Por cada tarea:

1. **Por cada endpoint nuevo o modificado:**
   - "¿Esta accion modifica/elimina datos persistentes?" → si si, default `requiere_permiso: true` con `naturaleza: restriccion-acceso` y `capa: controller` o `endpoint-api`.
   - "¿Reutilizamos un permiso existente o creamos uno nuevo?" → consultar catalogo vivo (seccion 4 del standard del repo).
   - "¿Que sesion aplica?" → segun subdirectorio de Controllers o convencion del repo.

2. **Por cada metodo de BL/Service nuevo o modificado:**
   - "¿Algun permiso *altera el comportamiento* de este metodo (sin negar el acceso)?"
   - Si si: declarar entrada con `naturaleza: modulacion-comportamiento`, `capa: bl` o `service`, y `modula_que` describiendo el efecto.
   - Si no: no declarar entrada (el control vive en su endpoint).

3. **Atajo grupal:** si todas las acciones publicas de un Controller comparten patron, `aplica_a_todos_los_metodos_del_archivo: true` con `archivo_grupal: "ruta/Controller.cs"`. Sentinel valida que efectivamente todos los metodos publicos cumplen el mismo perfil. **El atajo NO aplica para entradas de BL** (la modulacion es metodo-especifica).

### Validaciones automaticas que Bob aplica al cerrar la materializacion

- `accion_crud in [create, update, delete]` con `naturaleza: restriccion-acceso` → `requiere_permiso: true` salvo override con `justificacion_si_publico` explicita.
- `naturaleza: modulacion-comportamiento` → `modula_que` obligatorio (no puede ser null ni vacio).
- `permiso_codigo` debe matchear el regex declarado en seccion 3 del standard del repo (en `dotnet-react`: `^[A-Z]{2}\d{3}$`).
- Si `decision_permiso: reutilizar`, el codigo debe existir en seccion 4 (catalogo vivo) del standard. Si no existe, Bob lo trata como `nuevo` y pide confirmacion al usuario.
- Si Bob detecta inconsistencias → bloquea cierre de E2 hasta resolver (no es advertencia, es gate).
- Afirmaciones sobre codigo existente en las tareas (reusables, puntos de integracion, patrones a imitar) llevan cita anclada; Bob corre `agentos citas verificar` sobre ellas y las rotas se re-anclan o degradan a `sin-evidencia` antes del gate. <!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Verificacion en dos capas". NO duplicar la regla — para modificar, editar la fuente. -->

### Sincronizacion con standard al cierre de E2

Sentinel propone delta de `permisos_nuevos_a_crear` agregados al catalogo vivo del standard. **El delta NO se aplica al archivo en E2** (eso es trabajo de E3, atomico con el commit del codigo que crea el permiso). Solo se preanuncia en `etapa-2/03-plan.md` seccion "Permisos nuevos a registrar":

```
## Permisos nuevos a registrar (delta para E3)

| Codigo | Descripcion | Dominio | Tarea origen |
|--------|-------------|---------|--------------|
| EA047  | Aprobar facturas en lote | EA | T-002 |
```

### Mapeo de tareas a items Zoho (si aplica)

Si el work tiene `zoho_items[]` no vacio en el README, Bob pregunta a qué item(s) pertenece cada tarea que materializa.

**Flujo por tarea:**

1. Leer `zoho_items[]` del README.
2. Si hay **exactamente 1 item**: Bob asume `zoho_items_relacionados: [<item_no>]` sin preguntar. Lo agrega al frontmatter de la tarea.
3. Si hay **>1 items**: Bob presenta al usuario:
   ```
   A-Bob (materializando T-{NNN}): {titulo de la tarea}

   Items asociados al work:
   - DC-I150 (Fix validacion email en registro)
   - DC-I151 (Agregar filtro por fecha)

   ¿A cual(es) item(s) cubre esta tarea? (uno, varios separados por coma, o "ninguno" si es infraestructura/refactor transversal)
   ```
4. Parsear respuesta y escribir `zoho_items_relacionados: [...]` en el frontmatter de la tarea. `[]` si el usuario respondio "ninguno".

## Criterio de cierre

### Constante (todos los modos)

- Plan aprobado por usuario (decisiones tecnicas (embebidas en `etapa-2/03-plan.md`) o equivalente por modo + `etapa-2/03-plan.md`).
- Tareas materializadas por Bob en `etapa-2/tareas/{NNN}-{nombre}.md` con frontmatter completo. (creadas via `agentos work file create`)
- Cada CA de la fuente de requisitos de la ruta esta cubierto por >=1 tarea: el bloque `## Abordaje` del README o el brief de `/disenar` en rutas de codigo (`acotado`/`diseno`); los CAs de Etapa 1 en `investigacion`/`documentacion`.
- **Cobertura de items Zoho (si aplica).** Si el work tiene `zoho_items[]` no vacio, cada item debe tener **>=1 tarea** con ese `item_no` en `zoho_items_relacionados`. Si algun item quedo **sin tareas** que lo cubran, Bob advierte:
  ```
  A-Bob: Alerta de cobertura.
  El item DC-I151 esta asociado al work pero ninguna tarea lo referencia.

  Posibles causas:
  (a) Olvido al materializar: puedo re-preguntar tarea por tarea.
  (b) El item se cubre indirectamente por otra tarea sin referencia explicita.
  (c) El item se asocio por error y habria que desasociarlo.

  ¿Como procedemos?
  ```
  Registrar decision en `etapa-2/bitacora.md` con prefijo `[ZOHO]`.
- Usuario aprueba el gate "Etapa 2 completa".

### Especifico por modo

| Modo | Criterio adicional |
|------|--------------------|
| `normal` / legacy `evolucion` | Bob valida Reglas 1/2/3 (ver `bmad-agent-bob/references/create-story.md` step 6). Overrides en `etapa-2/bitacora.md`. **Campo `archivos`:** toda tarea con `tipo_tarea: codigo` declara `archivos` (lista `{ruta, accion: crear\|modificar}`, una entrada por archivo que la tarea crea o modifica). Es la exclusion mutua que hace segura la paralelizacion en E3; una tarea sin `archivos` no se paraleliza (ver `agent-os/skills/host-protocol/references/despacho-subagentes.md` seccion "Orquestacion"). **Capa de seguridad:** si `permisos_repo_estado` no es `no_aplica_por_modo`/`override_usuario`, toda tarea con `tipo_tarea: codigo` tiene bloque `capa_seguridad` valido (todas las validaciones automaticas pasan) o `capa_seguridad.aplica: false` con justificacion documentada en `notas_de_aplicacion`. Si hay `permisos_nuevos_a_crear`, preanunciados en `etapa-2/03-plan.md`. **Gate de implementabilidad [RI]:** cerrado, sin hallazgos abiertos (ver "Gate de implementabilidad (Amelia [RI]) — regla dura antes de E3"). |
| `investigacion` | Cada `frente-investigacion` incluye pregunta, fuentes tentativas y formato de entregable. Winston valida que el conjunto de frentes cubre los CAs de E1. |
| `documentacion` | Cada tarea documental (`tipo_tarea: seccion-documento` o `documentacion`) incluye audiencia, alcance y referencias de entrada; si el README tiene `## Entregables`, tambien `entregable` (campos en `agent-os/templates/work-record/etapa-2/tarea.md`, bloque "Tarea documental"). Paige planifica **por documento**: una tarea por seccion, las tareas de llenado que pida cada via (invitar a Tessa, correr una skill de imagenes, un inventario) y, si el documento declara salidas distintas de `md`, una tarea `alcance: generar-salidas`. Paige valida que el TOC cubre la audiencia declarada (`audiencia_documento` o la columna Audiencia) y los CAs de E1, y que el plan sigue el TOC derivado de cada plantilla o que la desviacion quedo declarada en E1. **Antes de abrir E3**, Paige verifica que cada via y cada recurso declarados existen; si falta uno, el usuario decide: crearlo dentro del work (amplia alcance), quitar esa salida, o diferirlo como pendiente post-work. Plantillas con `capturas: recomendado`: las secciones que requieren captura anticipan la invitacion de Tessa. |

## Artefacto integrador esperado

### Constante

- `agent-os/work-records/{slug}/etapa-2/03-plan.md` — plan detallado con fases/frentes/secciones, gates.
- `agent-os/work-records/{slug}/etapa-2/tareas/{NNN}-{nombre}.md` — una tarea por archivo.

### Por modo

| Modo | Artefacto principal de opciones |
|------|---------------------------------|
| `normal` / legacy `evolucion` | decisiones tecnicas (embebidas en `etapa-2/03-plan.md`) — opciones de solucion evaluadas + decision del usuario. |
| `investigacion` | `etapa-2/02-frentes.md` — frentes de investigacion propuestos + decision del usuario sobre cuales abordar. |
| `documentacion` | `etapa-2/02-estructura.md` — tabla de contenidos del documento + audiencia objetivo + formato + decision del usuario. |

## Activacion

E2 arranca por uno de dos caminos, segun si la ruta tiene Etapa 1 o no:

- **Rutas de codigo (`acotado`, `diseno`, incl. legacy `evolucion`; sin E1):** el gobernador activa a Winston al cerrar el **abordaje** (o el brief de `/disenar` en la ruta `diseno`). Contextos estandar a pasar: el bloque `## Abordaje` del README (o `agent-os/disenos/{slug}/brief.md` + `datos.md`), modo, nivel.
- **`investigacion` / `documentacion` (con E1):** el gobernador activa al anfitrion al cerrar Etapa 1. `investigacion` → Winston; `documentacion` → Paige. Contextos estandar a pasar: los artefactos de E1 (`etapa-1/01-discovery-investigacion.md` + `etapa-1/cas-cobertura-insumo.md` en investigacion; `etapa-1/audiencia-y-toc.md` + `etapa-1/cas-cobertura-editorial.md` en documentacion), modo, nivel.

## Gate de implementabilidad (Amelia `[RI]`) — regla dura antes de E3

**Aplica en modo `normal` (incl. legacy `evolucion`), a toda tarea con `tipo_tarea: codigo`.**

Cuando Bob termina de materializar las tareas, **E3 no abre** hasta que Amelia valide su
implementabilidad contra el codebase real. No es opcional y no es a discrecion del anfitrion.

**Se despacha como subagente consultor**, no en la sesion principal — por independencia, no
por contexto.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Por que existe". El razonamiento completo (dilucion de doctrina + perdida de independencia) vive alli; el contrato del consultor vive en seccion "Las dos clases". NO duplicar la regla — para modificar, editar la fuente. -->

**Que verifica Amelia `[RI]`:** que cada tarea sea implementable contra el codebase real —
**archivos**, patrones y dependencias. Procedimiento completo: `agent-os/experts/bmad-agent-amelia/references/revision-implementabilidad.md`.

**Flujo del gate:**

| Quien | Que hace |
|---|---|
| **Amelia `[RI]`** (subagente consultor) | Produce `etapa-2/calidad-amelia-implementabilidad.md` con los hallazgos, cada uno con cita `path:linea`. |
| **Bob** | Es el destinatario: corrige las tareas cuyos `archivos`, patrones o dependencias no resistieron el contraste. |
| **Winston** (anfitrion de E2) | Es la autoridad del gate: cierra E2 y abre E3. |

**Bloqueo duro:** E3 no abre con hallazgos `[RI]` abiertos.

**Tope de 2 vueltas.** Bob corrige → se re-despacha a Amelia (subagente **fresco**, no el
mismo). Si tras **2 vueltas** siguen quedando hallazgos abiertos, **se escala al usuario**.
No hay tercera vuelta automatica ni override silencioso: dos agentes que no se ponen de
acuerdo son un problema humano, y el sistema lo trata como tal.

## Transicion a Etapa 3

Trigger: el anfitrion publica `A-{Winston|Paige}: Etapa 2 cerrada, entregando al gobernador.` (tareas ya materializadas por Bob).

Accion del gobernador:

1. Lee artefactos para validar cobertura CA → tarea.
2. Decide anfitrion de Etapa 3 segun `modo`:
   - `normal` (incl. legacy `evolucion`) → Amelia por default, Atlas si hay senal de cruce de disciplinas (UX + ARQ + DEV + SEC combinados — senal detectada en el abordaje).
   - `investigacion` → Mary.
   - `documentacion` → Paige (continua como anfitriona).
3. Publica `S-sistema: Gate Etapa 2 aprobado. Activando a {anfitrion} como anfitrion de Etapa 3.`
4. Invoca al anfitrion correspondiente con contextos estandar.

## Bitacora

Ubicacion: `agent-os/work-records/{slug}/etapa-2/bitacora.md`.

## Referencias

- Protocolo universal: `agent-os/skills/host-protocol/SKILL.md`
- Siguiente etapa: `agent-os/skills/host-protocol/etapas/etapa-3.md`
- Reglas de Bob: `agent-os/experts/bmad-agent-bob/references/create-story.md`
- Modo documentacion (Paige): `agent-os/experts/bmad-agent-paige/references/write-document.md`
- Modo investigacion (Mary): `agent-os/experts/bmad-agent-mary/references/technical-research.md`, `domain-research.md`, `market-research.md`
