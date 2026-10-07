# Pieza: Cierre

> Pieza compartida por todas las rutas que crean work-record. Se activa cuando verificación (Quinn) propone cierre. Gobierna el cierre terminal: validaciones, alimentación de épica, archivado, cosecha. Distinta de verificación (que valida la meta) — cierre PERSISTE el resultado.

## Activación

Quinn (en `piezas/verificacion.md`) propone cierre COMPLETADO (con o sin bloque `verificacion_diferida{}`) o COMPLETADO_CON_BRECHA → Alfred activa esta pieza. Si el work tiene items Zoho, primero transita a PRE_CIERRE (sección PRE_CIERRE).

## Flujo estándar de cierre COMPLETADO

1. **Validaciones previas:** E4 cumple criterio de cierre; auditoría de convenciones a destilar; grupos bridge en `archivado`; `meta_revisiones[]` consistente. Si falla: no cerrar.

**1b. Curaduria de plantillas (solo ruta `documentacion`):** Paige corre su capacidad `CP` en modo `cierre` sobre los documentos que entrega el work (seccion `## Entregables`; si no existe, el documento de `plantilla_documento` y `## Archivos modificados`). Cada propuesta se confirma con `AskUserQuestion` aunque el `nivel` sea `maxima`. Va antes del paso 2 para que las plantillas creadas o actualizadas entren en `## Archivos modificados` y en el commit del work (paso 6), y para que el resumen de las decisiones (o "curaduria: sin candidatas") entre en `## Cierre`. No bloquea el cierre.
<!-- FUENTE: agent-os/experts/bmad-agent-paige/references/curar-plantillas.md seccion "Modos de invocacion". Senales, acciones y registro viven alli. NO duplicar -- para modificar, editar la fuente. -->

2. **Poblar secciones del README via runtime:** poblar `## Cierre`, `## Archivos modificados` y `## Decisiones clave` usando `work file set-section`, una invocacion por seccion:
   ```
   echo '{"work_slug":"<slug>","ruta_relativa":"README.md","seccion":"## Cierre","contenido":"<contenido>"}' \
     | agentos work file set-section
   ```
   El runtime reemplaza/inserta cada seccion sin tocar las hermanas. `## Archivos modificados` debe estar poblada antes del archivado (paso 7) porque el binario extrae `archivos_tocados` de ahi. No se edita el README a mano.
   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". NO duplicar — para modificar, editar la fuente. -->

3. **Depositar reflexion verificada (buffer a ADN):** cada agente que participo en el work (anfitriones de pieza + Alfred como gobernador) REDACTA UNA entrada de reflexion (el contenido cognitivo) y la deposita via el runtime, que valida el schema y la persiste atomicamente en el buffer del sidecar. El agente arma el JSON segun el schema canonico (`agent-os/templates/work-record/reflexion-adn-entry.md`) y lo entrega por stdin:
   ```
   echo '{"categoria":"...","observacion":"...","leccion_candidata":"...","causa_atribuida":"...","evidencia":[{"tipo":"work-record","ancla":"src/AgendaService.cs:38"}]}' \
     | agentos learn validar-candidato --experto {agente} --slug {slug}
   ```
   Reglas:
   - El binario REDACTA nada: el agente produce el contenido, el binario fuerza la forma (rechaza si falta `evidencia.ancla` o si no tiene forma navegable) y appendea. Si el runtime rechaza, el agente corrige la entrada — no se deposita auto-opinion.
   - `ancla` se valida por FORMA. Las cinco validas: `{slug}/T-NNN`, `{slug}/W-NN`, `standard/{ruta}`, `diseno/{slug}#{nodo}` y `{ruta}:{linea}` (la del ejemplo, la natural de la evidencia de codigo). Una frase en prosa NO es ancla.
     <!-- FUENTE: agent-os/templates/work-record/reflexion-adn-entry.md seccion "Regla de evidencia". Aqui solo la lista para no fallar el deposito; la definicion vive alla. NO duplicar la regla — para modificar, editar la fuente. -->
   - Alfred deposita su reflexion de gobernanza (ruta elegida vs acertada, drift tardio, anfitrion, cadencia) con ancla de forma valida (work/tarea o linea del README) segun la categoria. Ver `references/reflexion-adn.md`.
   - El runtime escribe SOLO en el sidecar local. NUNCA toca el ADN (invariante de frontera).
   - Marcar la capa con `agentos learn marcar --slug {slug} --capa memoria_expertos` (por stdin: `reflexion_depositada` y `reflexiones_por_agente`). El binario valida que los artefactos declarados existan (anti-mentira) y fija `ejecutado`/`fecha`/`por`.
   - Si `nivel` es `maxima`: depositar igual, sin ceremonia.
   - **Alarma de reincidencia (F2):** correr `agentos learn reincidencia --rango {base..HEAD del work}` (incondicional — no depende de declaracion alguna). Cada hit se MUESTRA al usuario (archivo:linea + anti-patron) y, confirmado, se registra `agentos learn veredicto` con `veredicto: corregido|rechazado`, `categoria_error: anti-patron-reintroducido`, `origen: gate-etapa`, atribuido al experto ejecutor. Un hit no bloquea el cierre por si mismo: el usuario decide si se corrige en este work o queda registrado.
4. **Alimentar épica vinculada** (si `epica: EP-NNN`): actualizar `agent-os/product/roadmap/{EP-NNN}/README.md` (tabla Trabajos vinculados, Specs consolidadas, Decisiones arquitectónicas, Standards aportados).
5. **Actualizar** el archivo `work-records.yml` de `roadmap/{EP-NNN}` si existe.
6. **Cerrar git limpio:** invocar skill `cerrar-work-git`. Alfred NO ejecuta merge/push (decisión del usuario).

### Disciplina de commit (gobernanza, no mecánica)

Alfred no ejecuta merge/push (decisión del usuario) ni implementa el commit: **propone la forma, `cerrar-work-git` ejecuta la mecánica.** Como gobernador, Alfred vela por dos disciplinas al cerrar:

- **Commit por work, no diferido por sesión.** Cuando dos works tocan el mismo archivo sin commitear, el commit se hace al cerrar **cada** work, no se difiere a un momento posterior de la sesión. Diferir acumula cambios de alcances distintos en un commit mezclado (p.ej. la limpieza de logs de un work anterior viaja en el commit de otro), rompiendo la trazabilidad por work. La frontera del commit sigue la frontera del work.
- **Artefactos grandes o generados no se commitean automáticamente.** Para artefactos regenerados (designs, codegen) o cualquier diff de gran masa, el commit es decisión explícita del usuario tras revisar el `git diff`, aunque el diff sea "solo drifts documentados". El gobernador propone, nunca commitea por iniciativa propia un artefacto de generación: quien mide el riesgo de un commit así es el usuario.

<!-- FUENTE: agent-os/skills/cerrar-work-git/SKILL.md seccion "Reglas de git" (motor). La mecánica de commit/branch/push (staging, formato, atomicidad: "commits atomicos en destino" -- los checkpoints se fragmentan libremente mientras la unidad esta activa, `worktree colapsar` los consolida en uno antes del merge) vive allí y se invoca, no se porta. Aquí solo la disciplina de gobernanza que Alfred sostiene: frontera commit = frontera work (no diferir por sesión); artefactos grandes/generados requieren OK explícito del usuario tras git diff. NO duplicar la mecánica -- editar el motor. -->

- **Flujo de trabajo actualizado (MANIFIESTO P7).** Antes de archivar: ¿el flujo de trabajo / la epica que este work toca quedo actualizada? Si el work formo un flujo NUEVO, documentarlo en la epica correspondiente; si no hay epica, anotarlo como rumbo 2. El work debe poder nombrar su flujo — `work checklist-cierre` emite el codigo FLUJO como recordatorio (informativo, exento en hotfix).

7. **Archivar (runtime):** invocar `agentos work close --slug <slug> --estado COMPLETADO` (o `COMPLETADO_CON_BRECHA` si Quinn propuso esa variante) — ver `gestion/cerrar.md`. **Nunca pedir `--estado COMPLETADO_VERIFICACION_DIFERIDA`**: si el work tiene bloque `verificacion_diferida{}` valido (README o alguna tarea), el runtime deriva ese estado por su cuenta a partir de `--estado COMPLETADO` y reporta `estado_derivado: true` en el envelope — pedirlo explicito es rechazado con `ESTADO_NO_DERIVABLE`. El binario setea el estado terminal + `fecha_fin` + `cerrado_en` + `archivos_tocados` (extraidos de `## Archivos modificados`) en el README, appendea la fila del bloque al libro-mayor `agent-os/verificaciones/ledger.md` (una fila por bloque, antes del archivado), y mueve la carpeta a `works-archivo/`; el catalogo no se escribe (se deriva en memoria del README en la siguiente lectura). Tras `ok:true`, liberar el rol de sesion en `_sesiones/` (cognitivo). Si el work tenía `diseno_origen`: consultar los consumidores del brief (`/alfred maintain rebuild-consumers` o el catálogo); si este era el ÚLTIMO consumidor activo y no hay pendientes, cerrar el ciclo del diseño: `agentos diseno transition --slug {diseno} --a CERRADO`.
8. **Sugerir cosecha post-cierre:** checklist 5 capas (ver sección Cosecha).

### Sync-back a Zoho Projects (works con `origen_externo`)

Si el frontmatter del work tiene `origen_externo.sistema == zoho-projects`, tras archivar (paso 7) Alfred ofrece el sync-back del estado de vuelta a Zoho: invocar el skill `zoho-projects-integration` Fase 3 (actualizar estado del Issue/Task). Gated (AskUserQuestion) y **no bloqueante**: si el `update_*` MCP falla, anotar deuda en bitácora y NO revertir el cierre — mismo contrato que el sync de Sprints. Distinto de PRE_CIERRE (que es el gate de QA de items de Sprints). Detalle del gobierno en `integraciones/zoho.md` sección "Zoho Projects".

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/integraciones/zoho.md seccion "Zoho Projects". El gobierno del gate de cierre vive alli. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/zoho-projects-integration/SKILL.md. Motor (Fase 3 sync-back). Se invoca, no se porta. -->

### Si fallan las validaciones previas (paso 1)

Si una validación previa falla (E4 no cumple criterio de cierre, grupos bridge sin archivar, `meta_revisiones[]` inconsistente), el cierre NO procede y el work **mantiene su estado actual** — no transita a COMPLETADO, no queda "a medio cerrar". Alfred informa al usuario qué validación falló y según la causa:

- **Brecha estructural** (la meta no se cumplió, hay un bloqueante de fondo): Alfred dispara `piezas/reevaluacion.md` — mismo patrón que `plan.md` "Si el anfitrión rechaza el plan". El work vuelve a la pieza que corresponda.
- **Subsanable** (ej. un grupo bridge quedó sin archivar, una entrada de `meta_revisiones[]` sin consolidar): Alfred lo reporta, pide resolverlo y reintentar el cierre. No dispara reevaluación.

### Si `cerrar-work-git` no completa (paso 6)

`cerrar-work-git` es interactivo (no un tool MCP con timeout). Si el usuario aborta o hay un error de git irrecuperable, el cierre **se detiene ANTES del archivado (paso 7)**: el work permanece consistente en su estado previo, sin archivar. No requiere rollback porque la operación atómica de archivado aún no ocurrió. Alfred reporta el estado y el usuario decide reintentar o pausar.

<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Cierre / archivado". Operacion atomica de archivado. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/cerrar-work-git/SKILL.md. Motor de cierre git. Se invoca, no se porta. -->

## Momentos de veredicto (F1)

Cuando el operador corrige o rechaza la salida de un experto durante el work (correccion en conversacion, rechazo en gate), el anfitrion registra el juicio: `agentos learn veredicto` (payload: work/experto/veredicto/categoria_error/origen/evidencia; el libro es POR DEV). NUNCA silencioso: el anfitrion muestra la linea registrada (en nivel `maxima`, resumen `[AUTO]` al cierre). El veredicto `aceptado` tiene UN solo momento de emision — el cierre de la Fase 2 de E4 conducida por el usuario (ver etapa-4) — y NUNCA se emite en gates `[AUTO]`: el veredicto es del operador, no del proceso.

## Cosecha post-cierre (checklist 5 capas)

Tras cerrar, leer el bloque `cosecha{}` del README y mostrar checklist `[x]`/`[ ]` por capa. Para las pendientes, sugerir el comando con `--desde-work {slug}` (copy-paste). NO ejecutar ninguno automáticamente — el usuario decide.

El estado de cosecha lo gobierna el runtime: `agentos learn pendientes` lista los works terminales con cosecha incompleta (desglose por capa); al terminar de cosechar una capa, registrarla con `agentos learn marcar --slug {slug} --capa {capa}` (rechaza marcar si un artefacto declarado no existe). Si un work no debe cosecharse (spike descartado, trivial), eximirlo con `agentos learn omitir --slug {slug} --razon "..."` — queda invisible en el backlog, reversible con `--deshacer`.

1. **Producto** → `/plan-product --desde-work {slug}`
2. **Specs** → `/discover-specs --desde-work {slug}`
3. **Standards** → `/discover-standards --desde-work {slug}`
4. **Documentación** → `/documentar consolidar {módulo} --desde-work {slug}`
5. **Memoria de expertos** → `/alfred learn {slug}` (Fase 6)

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Cosecha post-cierre (5 capas)". El schema del bloque cosecha{} vive alli. NO duplicar -- editar la fuente. -->

## PRE_CIERRE (works con items Zoho)

Si el work tiene items Zoho, no cierra directo a COMPLETADO: transita a `PRE_CIERRE` (espera aprobación QA externa). Los items quedan en "Para Probar".

## /alfred revisar-qa [slug | --todos]

Única etapa válida: PRE_CIERRE. Consulta el estado de cada item en Zoho (invoca skill `zoho-sprints-integration` acción `consultar-estado-qa`) y clasifica: done | rechazado | pendiente. Si algún item no puede consultarse (motor MCP no disponible), queda **sin clasificar** y el árbol de decisión NO avanza — ver `integraciones/zoho.md` sección "Manejo de errores".

Árbol de decisión:
- **Todos done** → Flujo 4.a: cerrar COMPLETADO (ejecuta flujo estándar de cierre).
- **≥1 rechazado** → Flujo 4.b: disparar reevaluación obligatoria. El rechazo es señal estructural. Los caminos aplicables son **los caminos de reevaluación de host-protocol (a..e; (e) solo con `diseno_origen`)** — no un set distinto. Se conducen via `piezas/reevaluacion.md`.
- **Todos pendiente** → informar, no cambiar nada.
- **Mezcla done + pendiente (sin rechazados)** → Flujo 4.c: usuario elige esperar / cerrar parcial / abrir work nuevo.

<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Estado PRE_CIERRE. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/host-protocol/references/reevaluacion-y-gates.md seccion "Procedimiento de reevaluacion". Los caminos de reevaluacion del flujo 4.b (a..e; (e) solo con diseno_origen). NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/zoho-sprints-integration/SKILL.md. Motor Zoho (consultar-estado-qa, consolidar-rechazos). Se invoca, no se porta. -->
