---
name: zoho-sprints-integration
description: Contrato entre /alfred y Zoho Sprints. Encapsula asociacion de items, descarga de payload, cambio de estado, subida/bajada de comentarios, generacion de comentarios de cierre, y consulta de resultado QA. Unico punto de interfaz con el MCP zoho-sprints desde el flujo de work.
---

# Zoho Sprints Integration

Skill invocable por anfitriones de `/alfred` y por comandos `/alfred zoho-*`. Una accion por funcion; el flujo las compone.

## Cuando usar

- Hook en `agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md` seccion "Persistencia al confirmar": accion `preguntar-asociacion`, tras crear el work-record.
- Hook en `agent-os/skills/host-protocol/etapas/etapa-4/pre-cierre-zoho.md`: acciones `generar-comentarios-cierre`, `publicar-comentario`, `cambiar-estado-zoho`, `consultar-estado-qa`, `consolidar-rechazos` segun flujo PRE_CIERRE.
- Comandos `/alfred zoho-agregar-item`, `zoho-listar-items`, `zoho-quitar-item`, `zoho-comentarios`, `zoho-comentar`, `revisar-qa`.

## Pre-requisitos

Antes de invocar cualquier accion, validar en orden:

0. **MCP zoho-sprints y playwright disponibles.** Si falta `zoho-sprints`: abortar con instruccion para instalarlo (el instalador del sistema tambien lo verifica). Si falta `playwright`: advertir (solo es requerido si `zoho-sprints-bootstrap` necesita correr para crear la config).
1. **Proyecto detectado** desde `git remote get-url origin`. Misma logica que `/sprints-sync`. Si falla: abortar con instruccion "ejecuta desde dentro del repositorio del proyecto".
2. **Config local del proyecto existente** en `{project-root}/.claude/sprints-local.json`. Si no existe o esta incompleto: invocar skill `zoho-sprints-bootstrap` para crearlo asistidamente. No abortar — bootstrap lo crea en la misma sesion. Invocacion via Skill tool: `Skill(skill: "zoho-sprints-bootstrap")`. El usuario tambien puede invocarlo manualmente con `/agent-os-zoho-bootstrap`.
3. **MCP `zoho-sprints` conectado**. Probar con `mcp__zoho-sprints__zoho_connection_status`. Si falla: abortar con "verifica conexion zoho con `mcp__zoho-sprints__zoho_connect`".
4. **`allowed_owners` poblado** en `sprints-local.json`. Si vacio: abortar con "configura `allowed_owners` re-ejecutando `/agent-os-zoho-bootstrap`".
5. **`valid_status_ids` presente** con claves `to_do` (o `open`), `in_progress`, `para_probar`, `done`. Si falta alguna: advertir y sugerir re-ejecutar bootstrap.

## Acciones

### `preguntar-asociacion` (invocada desde el abordaje, Fase 4)

Flujo opt-in sin default.

1. Ejecutar pre-requisitos. Si alguno falla: retornar `{ abortado: true, razon: "..." }`.
2. Preguntar al usuario (AskUserQuestion, sin default):
   ```
   S-sistema: ¿Queres asociar uno o mas items de Zoho Sprints a este work?

   (a) Si, mostrame items disponibles
   (b) No, seguir sin asociar
   ```
3. Si `(b)`: pedir razon opcional, retornar `{ asociados: [], omitido: "razon o no especificado" }`.
4. Si `(a)`: invocar `listar-items-asignados`, presentar lista, usuario elige 0+ items (multi-select separado por coma).
5. Por cada item elegido: invocar `asociar-item`.
6. Retornar `{ asociados: [<item_no>, ...], omitido: null }`.

### `listar-items-asignados`

Lista items del sprint activo asignados al usuario del `allowed_owners`.

1. Leer `sprints-local.json`: `team.id`, `project.id`, `current_sprint.id`, `allowed_owners`.
2. Invocar `mcp__zoho-sprints__list_items_extended({ team_id, project_id, sprint_id: current_sprint.id })`.
3. Filtrar por:
   - `owner_id` presente en `allowed_owners`.
   - `status_name` en `["To do", "Open", "In Progress"]` (tolerar ambas nomenclaturas).
4. Retornar lista ordenada por prioridad (High→Low) y fecha de creacion (reciente→antigua). Cada entrada: `{ item_no, item_id, titulo, tipo, prioridad, estado }`.

### `asociar-item` (item_no)

1. Invocar `descargar-payload(item_no)` → obtiene JSON completo + attachments.
2. Escribir a `{work}/zoho-items/{item_no}.json`. Crear `{work}/zoho-items/` si no existe.
3. Descargar attachments (si existen) a `{work}/zoho-items/{item_no}_attachments/`. Limite de 50MB por attachment; si excede: omitir con aviso al usuario.
4. Leer README del work y agregar entry a `zoho_items[]`:
   ```yaml
   - item_no: "{item_no}"
     item_id: "{item_id}"
     sprint: "{sprint_name}"
     sprint_id: "{sprint_id}"
     titulo: "{titulo}"
     tipo: "{tipo}"
     asociado_en: "{YYYY-MM-DD}"
     asociado_en_etapa: "{etapa_actual}"
     estado_zoho_al_asociar: "{estado_actual}"
     local_path: "zoho-items/{item_no}.json"
   ```
5. Registrar en `etapa-{etapa_actual}/bitacora.md` con prefijo `[ZOHO]`:
   ```
   [ZOHO] {fecha} — {item_no} asociado al work.
   Titulo: "{titulo}"
   Estado en Zoho al asociar: {estado_actual}
   Descargado a: zoho-items/{item_no}.json
   ```
6. NO cambiar estado en Zoho todavia. El cambio se posterga al cierre del work: si tiene items asociados, entra en `PRE_CIERRE` (ver `agent-os/skills/host-protocol/etapas/etapa-4/pre-cierre-zoho.md`), y `cambiar-estado-zoho` se invoca alli al publicar los comentarios de cierre (paso 7a).

### `descargar-payload` (item_no)

1. Invocar `mcp__zoho-sprints__get_item({ team_id, project_id, item_id })`.
2. Retornar objeto completo con campos de Zoho (id, titulo, descripcion, tipo, prioridad, estado, owner, sprint, attachments_urls, comentarios_ids, etc.).
3. Si tiene `attachments_urls`: descargar cada attachment a carpeta destino indicada por el invocador.

### `cambiar-estado-zoho` (item_no, nuevo_estado)

1. Leer `sprints-local.json` `valid_status_ids[nuevo_estado]`. Si no existe: abortar con "status_id no configurado, re-ejecuta `/agent-os-zoho-bootstrap`".
2. Invocar `mcp__zoho-sprints__update_item({ team_id, project_id, item_id, status_id })`.
3. Registrar en bitacora de etapa actual con `[ZOHO]`:
   ```
   [ZOHO] {fecha} — {item_no} estado cambiado a "{nuevo_estado}" en Zoho.
   ```

### `bajar-comentarios` (item_no)

1. Invocar `mcp__zoho-sprints__list_item_comments({ team_id, project_id, item_id })`.
2. Leer cache local `{work}/zoho-items/{item_no}_comentarios.json` (si no existe, tratar como `[]`).
3. Calcular delta: comentarios en respuesta del MCP que no estan en cache (por `comment_id`).
4. Actualizar cache con todos los comentarios actuales.
5. Retornar `{ total: N, delta: [<comentarios nuevos>] }` para que el invocador decida como presentarlos.

### `publicar-comentario` (item_no, texto, contexto_automatico)

1. Si `contexto_automatico` es true: construir prefijo compacto `[Work: {slug} | Etapa: {N} | Anfitrion: {nombre}]\n\n{texto}`. Si false: solo `{texto}`.
2. Invocar `mcp__zoho-sprints__add_item_comment({ team_id, project_id, item_id, content })`.
3. Capturar `comment_id` del retorno.
4. Actualizar cache local agregando el comentario publicado (para que proximos `bajar-comentarios` no lo marquen como nuevo).
5. Registrar en bitacora con `[ZOHO]`:
   ```
   [ZOHO] {fecha} — Comentario publicado en {item_no}.
   Texto (primeras 80 chars): "{texto[:80]}..."
   ID de comentario: {comment_id}
   ```
6. Retornar `{ comment_id }`.

### `generar-comentarios-cierre` (item_no)

Invocada por Quinn en E4 cuando hay items asociados. Genera 2 comentarios (tecnico + ejecutivo) con scope especifico del item.

1. **Identificar scope del item en el work:**
   - Tareas del plan cuyo frontmatter tiene `zoho_items_relacionados` incluyendo este `item_no`. Leer cada `etapa-2/tareas/*.md`.
   - Archivos modificados derivados de esas tareas (leer `etapa-3/06-hallazgos.md` seccion "Archivos modificados").
   - Commits que mencionan el `item_no`: `git log dev..HEAD --grep "{item_no}"`.
   - CAs del consolidado de E1 (`etapa-1/cas-consolidados.md`) cuyo texto menciona dominio del item (heuristica suave, presentar como candidatos).
   - Hallazgos de `etapa-3/bitacora.md` con referencia al item.

2. **Rellenar template tecnico** (`{project-root}/.claude/agent-os-templates/zoho-comments/comment-technical.md`):
   - `{{problema}}`: prosa humana sobre que fallaba/faltaba, derivado de descripcion del item + CAs cubiertos. Lenguaje tecnico con clases, metodos, endpoints, tablas.
   - `{{solucion}}`: que se hizo — clases modificadas, metodos nuevos, endpoints agregados, tablas tocadas. NO mencionar T-NNN, CA-NNN, slug del work.
   - `{{archivos}}`: lista con rutas de archivos modificados dentro del scope del item.
   - `{{commits}}`: hashes + mensajes (solo los que mencionan el item_no).
   - `{{consideraciones}}`: edge cases, deuda tecnica, notas para QA/prod.

3. **Rellenar template ejecutivo** (`{project-root}/.claude/agent-os-templates/zoho-comments/comment-executive.md`):
   - `{{analisis}}`: contexto del problema en lenguaje no-tecnico. Que proceso fallaba, que se veia desde el lado del usuario/cliente.
   - `{{causa}}`: en prosa accesible, sin tecnicismos.
   - `{{solucion}}`: que cambia desde la perspectiva del negocio. Que flujo mejora. Que proceso es nuevo o distinto.
   - `{{notas}}`: que sigue (validacion con cliente, deuda acordada, etc.).

4. **Validacion de registro:** antes de escribir, verificar que el texto del ejecutivo NO contiene `T-\d{3}`, `CA-\d{3}`, ni el slug del work. Verificar que el tecnico NO contiene `T-\d{3}`, `CA-\d{3}`, ni el slug del work (pero si puede contener rutas y nombres de clases). Si detecta violacion: reescribir la seccion violatoria.

5. **Escribir drafts:**
   - `{work}/etapa-4/pre-cierre/comentarios-{item_no}-tecnico.md`
   - `{work}/etapa-4/pre-cierre/comentarios-{item_no}-ejecutivo.md`

6. Retornar `{ item_no, ruta_tecnico, ruta_ejecutivo }`.

### `consultar-estado-qa` (item_no)

> **Nota:** la spec original listaba dos acciones separadas `consultar-estado-qa` + `clasificar-resultado-qa`. En la implementacion se fusionaron en esta unica accion, que consulta Y clasifica. El resultado retornado ya viene en el formato categorizado (`done | rechazado | pendiente | inesperado`).

1. Invocar `mcp__zoho-sprints__get_item({ team_id, project_id, item_id })`.
2. Leer `estado_actual` del retorno.
3. Clasificar:
   - Si estado = `valid_status_ids.done` → `{ estado: "done" }`.
   - Si estado = `valid_status_ids.in_progress` → `{ estado: "rechazado" }` (QA movio de Para Probar a In Progress).
   - Si estado = `valid_status_ids.para_probar` → `{ estado: "pendiente" }`.
   - Cualquier otro estado → `{ estado: "inesperado", raw: "<estado_actual>" }`.
4. Retornar clasificacion.

### `consolidar-rechazos` (items_rechazados)

Invocada por Quinn cuando uno o mas items fueron rechazados. Produce un documento narrativo que alimenta `/alfred reevaluar`.

1. Para cada item rechazado: invocar `bajar-comentarios(item_no)`, capturar comentarios de QA posteriores a `pre_cierre.entrado_en`. Tipicamente el QA usa template `comment-qa-rejected.md` con `{{motivo}}` y `{{acciones}}`.
2. Escribir `{work}/etapa-4/qa-resultados.md`:
   ```markdown
   # Resultados de revision QA

   Fecha de consulta: {fecha}
   Items revisados: {N}

   ## Items rechazados

   ### {item_no} — {titulo}

   **Revisor:** {revisor}
   **Fecha del rechazo:** {fecha}

   **Motivo (en palabras del revisor):**
   {motivo}

   **Acciones solicitadas:**
   {acciones}

   ---

   (otros items rechazados...)

   ## Items aprobados

   ### {item_no} — {titulo}
   Aprobado por {revisor} el {fecha}.
   ```
3. Retornar ruta del documento.

## Dependencias

- MCP `zoho-sprints`: tools `list_items_extended`, `get_item`, `update_item`, `add_item_comment`, `list_item_comments`, `zoho_connection_status`.
- MCP `playwright`: solo si bootstrap necesita correr (primer uso de la integracion en un proyecto).
- Config local del proyecto: `{project-root}/.claude/sprints-local.json` (creado por `zoho-sprints-bootstrap`).
- Templates: `{project-root}/.claude/agent-os-templates/zoho-comments/comment-technical.md`, `comment-executive.md` (copiados por el instalador del sistema).

## Referencias

- Skill de bootstrap: `agent-os/skills/zoho-sprints-bootstrap/SKILL.md` (se invoca cuando `sprints-local.json` no existe).
- Invocadores tipicos: `agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md` (persistencia al confirmar), `agent-os/skills/host-protocol/etapas/etapa-2.md`, `etapa-4/pre-cierre-zoho.md` (datos de etapa), y el gobierno de Zoho en Alfred `agent-os/experts/bmad-agent-alfred/integraciones/zoho.md` (`/alfred zoho-*`, `/alfred revisar-qa`). El legacy `/work zoho-*` sigue disponible mientras `commands/agent-os/work.md` exista.
