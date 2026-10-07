# Fase 3: Sync-back al cierre

Disparado por el gate de cierre de Alfred cuando el work tiene `origen_externo.sistema == zoho-projects`.

## Flujo (gated, no bloqueante)
1. Leer `origen_externo` del frontmatter del work (item_id, item_tipo, proyecto_id).
2. AskUserQuestion: ¿sincronizar el estado en Zoho? (opciones: si -> elegir estado destino; no -> omitir; el estado destino default depende del desenlace del work — p.ej. resuelto/cerrado).
3. Si si:
   - `item_tipo == issue` -> `mcp__claude_ai_Zoho_Projects__update_issue` (cambiar estado; agregar nota de cierre si el tool admite un campo de descripcion/comentario).
   - `item_tipo == task` -> `update_a_task` (cambiar estado/porcentaje).
   - NOTA: el MCP de Projects NO parece tener un tool de "comentar" como Sprints (`add_item_comment`). Si `update_*` no admite nota, sincronizar SOLO el estado y avisar la limitacion.
4. Tras exito: actualizar `_pendientes.md` -> `estado_triage = cerrado`.

## Anti-falseo / no bloqueante
Si el `update_*` falla: reportar la tool y el error, anotar deuda en la bitacora del work, y **NO bloquear el cierre** (mismo contrato que Sprints E4). No marcar `cerrado` en el triage si el update no confirmo.
