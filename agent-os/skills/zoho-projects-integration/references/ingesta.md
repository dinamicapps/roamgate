# Fase 1: Ingesta on-demand

## Flujo

1. **Elegir destino.** `mcp__claude_ai_Zoho_Projects__get_portals` -> `get_projects_list` (o `get_portal_details`). Presentar proyectos via AskUserQuestion; el usuario elige uno (o varios).
2. **Elegir filtro.** AskUserQuestion: tipo (`issues` | `tasks` | `ambos`), estado (default: abiertos), asignado (default: a mi). "Asignado a mi" se resuelve con `get_project_users` contra la identidad Zoho del usuario; si no se puede resolver, caer a "todos los abiertos" CON AVISO explicito.
3. **Descargar.**
   - Issues: `get_all_issues` / `get_project_issues` (filtrar abiertos/asignado).
   - Tasks: `get_tasks_by_project`.
   - Por item: opcional `get_issue` / `get_task_details` para el payload completo.
4. **Persistir.**
   - Cada payload crudo -> `agent-os/zoho-projects-intake/items/{item_id}.json` (crear el dir si falta; gitignored).
   - Agregar/actualizar fila en `agent-os/zoho-projects-intake/_pendientes.md` (crear desde el template si no existe): `item_id | tipo | titulo | estado_zoho | prioridad | asignado | descargado(fecha) | estado_triage=pendiente | work_slug=(vacio)`.
   - Si un item ya estaba (mismo `item_id`): refrescar estado_zoho, NO duplicar fila ni pisar `estado_triage`/`work_slug`.

## Anti-falseo
Si la descarga falla a mitad: reportar cuantos items se trajeron y cual fallo; NO completar la tabla con filas inventadas.
