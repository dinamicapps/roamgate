---
name: agent-os-skill-zoho-projects-integration
description: 'Motor de ingesta de Zoho Projects: descarga Issues (bugs) y Tasks (temas), los tria localmente, promueve los elegidos a works de agent-os (alimentando el abordaje de /alfred + origen_externo), y al cierre sincroniza el estado de vuelta a Zoho. Invocado por /alfred zoho-projects. Requiere el MCP claude_ai_Zoho_Projects conectado. Alfred gobierna; este skill es el motor.'
---

# Zoho Projects Integration — Motor de ingesta

## Overview

Trae bugs (Issues) y temas (Tasks) de Zoho Projects a agent-os como works trazados, y cierra el lazo al terminar. Patron gobierno/motor: Alfred decide CUANDO (precondiciones, gates); este skill + el MCP hacen el COMO. El nucleo nunca auto-crea works: la promocion la decide el usuario.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/integraciones/zoho.md seccion "Zoho Projects". El gobierno (cuando ingerir, gate de cierre) vive alli; aqui solo el motor. NO duplicar -- editar la fuente. -->

## Prerrequisito

MCP `claude_ai_Zoho_Projects` conectado. Si una tool MCP no responde: informar y detener la capacidad, NO improvisar (mismo contrato que el motor bridge/Sprints).

## Las 3 fases

### Fase 1: Ingesta (on-demand)
Leer referencia: `./references/ingesta.md`. Elegir portal/proyecto + filtro; descargar Issues/Tasks; poblar el triage doc + payloads.

### Fase 2: Triage + Promocion
Leer referencia: `./references/triage-promocion.md`. Presentar items (AskUserQuestion): promover | descartar | posponer. Promover = alimentar `/alfred` con el item como semilla + `origen_externo`.

### Fase 3: Sync-back al cierre
Leer referencia: `./references/sync-cierre.md`. Disparado por el gate de cierre de Alfred cuando el work tiene `origen_externo.sistema == zoho-projects`. Actualiza el estado del item en Zoho (gated, no bloqueante).

## Persistencia

- Triage doc: `agent-os/zoho-projects-intake/_pendientes.md` (commiteable; template en `agent-os/templates/zoho-projects-intake/`).
- Payloads crudos: `agent-os/zoho-projects-intake/items/{item_id}.json` (gitignored, cache).
- Trazabilidad del work: campo `origen_externo` en el frontmatter (lo persiste `agentos work open`, no a mano).

## Regla anti-falseo

Si una descarga o un update MCP falla: reportar el fallo con la tool y el error; NO inventar filas en el triage ni asumir que el sync-back ocurrio. La promocion/descarte siempre via AskUserQuestion.
