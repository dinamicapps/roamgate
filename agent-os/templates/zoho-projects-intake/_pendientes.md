# Triage de items de Zoho Projects — pendientes

> Indice de trabajo (no fuente de verdad). La fuente de verdad de un item promovido es el work-record (campo `origen_externo`). Los payloads crudos viven en `agent-os/zoho-projects-intake/items/{item_id}.json` (gitignored).
>
> Lo gobierna `/alfred zoho-projects`; el motor es el skill `zoho-projects-integration`. La promocion/descarte la decide el usuario (AskUserQuestion); el sistema NO auto-promueve.

| item_id | tipo | titulo | estado_zoho | prioridad | asignado | descargado | estado_triage | work_slug |
|---------|------|--------|-------------|-----------|----------|------------|---------------|-----------|

<!-- estado_triage: pendiente | promovido | descartado | pospuesto | cerrado -->
<!-- tipo: issue | task -->
