# Integración: Zoho Sprints (gobierno de items)

> Alfred porta el GOBIERNO (encaje por anfitrión, los 4 caminos, validaciones por etapa). El MOTOR se invoca: skill `zoho-sprints-integration` (acciones: listar-items-asignados, descargar-payload, asociar-item, cambiar-estado-zoho, publicar-comentario, bajar-comentarios, consultar-estado-qa, consolidar-rechazos) y tools MCP `zoho-sprints_*`.

## Frontera gobierno / motor

| Se porta (gobierno) | Se invoca (motor) |
|---|---|
| Encaje por anfitrión (4 caminos a/b/c/d), validaciones de etapa/estado, decisión dejar/reasignar/remover tareas | skill `zoho-sprints-integration` (8 acciones), tools MCP `zoho-sprints_*`, `sprints-local.json` |

## /alfred zoho-agregar-item    (mientras el work esté activo, no PRE_CIERRE)
La asociación ya se ofrece en el abordaje, Fase 4 (hook `preguntar-asociacion`, opt-in al crear el work). Este comando cubre asociaciones posteriores: el anfitrión activo **conduce** la decisión de encaje (lee meta + candidato + tareas como metadatos; NO analiza código — conducir, no analizar). 4 caminos: (a) encaja → asociar-item + cambiar-estado in_progress; (b) ajustar meta → reevaluación camino b, luego asociar; (c) rechazar → descartar; (d) work nuevo → ceder, item preasociado.

## /alfred zoho-listar-items    (cualquier etapa)
Por cada item: invocar consultar-estado-qa. Tabla (item, título, estado, # tareas).

## /alfred zoho-quitar-item {item_no}    (E1-E4)
Validar en `zoho_items[]`. Si hay tareas relacionadas: 3 opciones (dejar rota / reasignar / remover). Revertir estado a to_do (cambiar-estado-zoho). Comentario obligatorio (publicar-comentario). Mover JSON a desasociados/. Actualizar `zoho_items[]` y `zoho_items_desasociados[]`.

## /alfred zoho-comentarios [item_no]    (cualquier etapa)
Invocar bajar-comentarios (delta vs cache). Anfitrión presenta el delta en prosa + sugerencias si afecta scope.

## /alfred zoho-comentar {item_no} "texto"    (cualquier etapa)
Invocar publicar-comentario con contexto_automatico=true (prefija `[Work | Pieza | Anfitrión]`).

(revisar-qa vive en piezas/cierre.md — pertenece al ciclo terminal.)

## Manejo de errores (motor MCP no disponible)

Si un tool MCP `zoho-sprints_*` o una acción del skill `zoho-sprints-integration` no responde, el gobierno **informa al usuario y detiene la capacidad — no improvisa ni inventa el resultado del item**.

| Acción | Clase | Si falla |
|---|---|---|
| `asociar-item` + `cambiar-estado` (camino a de zoho-agregar-item), `consultar-estado-qa` (revisar-qa) | **Bloqueante** | NO cambiar el estado del work ni clasificar items. En revisar-qa: si no se puede consultar el estado de un item, NO clasificarlo (no asumir done/rechazado/pendiente) y no cerrar el work. Informar y esperar decisión del usuario. |
| `bajar-comentarios` (delta), `listar-items-asignados` | **No bloqueante** | Informar que el delta no pudo bajarse; el anfitrión continúa sin los comentarios nuevos (los presenta cuando el motor responda). |

Reglas:
- **Caída a mitad de transición de estado:** si `asociar-item` tuvo éxito pero `cambiar-estado` falló (o viceversa), reportar el estado parcial explícitamente al usuario y NO registrar el item como asociado-y-en-progreso. El usuario decide reintentar el paso faltante o revertir.
- **No falsear QA:** en `revisar-qa`, un item cuyo estado no se pudo consultar queda "no clasificado"; el árbol de decisión (4.a/4.b/4.c en `piezas/cierre.md`) NO avanza con items sin clasificar.
- **Sin reintentos ciegos:** AskUserQuestion (reintentar / continuar sin esta acción / abortar).

<!-- FUENTE: agent-os/skills/zoho-sprints-integration/SKILL.md. Las 8 acciones del motor. Se invoca, no se porta. -->
<!-- FUENTE: agent-os/templates/work-record/schema/zoho.md seccion "Schema de cada entrada en `zoho_items[]`". Campos zoho_items y zoho_items_desasociados. NO duplicar -- editar la fuente. -->

## Zoho Projects (ingesta de bugs/temas)

> Gobierno de Alfred para ingerir Issues (bugs) y Tasks (temas) de Zoho Projects como works. El MOTOR es el skill `zoho-projects-integration`; aqui solo el gobierno (cuando ingerir, gate de cierre).

### `/alfred zoho-projects`
1. Precondicion: MCP `claude_ai_Zoho_Projects` responde. Si no -> informar y detener.
2. Invocar el motor (skill `zoho-projects-integration`) Fase 1 (ingesta) -> Fase 2 (triage+promocion). La promocion la decide el usuario (AskUserQuestion); Alfred NO auto-promueve.
3. Registro: el work promovido lleva `origen_externo` en su frontmatter (lo persiste `work open`); el triage doc queda actualizado.

### Gate de cierre (sync-back)
Al cerrar un work, si su frontmatter tiene `origen_externo.sistema == zoho-projects`, Alfred ofrece el sync-back (skill `zoho-projects-integration` Fase 3): actualizar el estado del item en Zoho. Gated (AskUserQuestion) y **no bloqueante** (si falla, deuda en bitacora; no frena el cierre) -- mismo contrato que el sync de Sprints en E4.

<!-- FUENTE: agent-os/skills/zoho-projects-integration/SKILL.md. El motor de las 3 fases vive alli; aqui solo el gobierno. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/zoho.md seccion "Origen externo (origen_externo)". El schema vive alli. NO duplicar -- editar la fuente. -->
