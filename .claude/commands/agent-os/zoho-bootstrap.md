---
description: Ejecuta el wizard de bootstrap de configuracion local de Zoho Sprints para el proyecto consumidor actual
---

# Comando: /agent-os-zoho-bootstrap

Invoca el skill `zoho-sprints-bootstrap` para crear (o regenerar) `.claude/sprints-local.json` del proyecto consumidor. Se usa:

- **La primera vez** que un dev quiere usar la integracion Zoho Sprints en un proyecto.
- **Para refrescar** un campo especifico cuando cambia (ej. el sprint activo cada iteracion).
- **Para reemplazar** completo la config si se corrompio o si se cambia de team/project.

Si `.claude/sprints-local.json` ya existe, el wizard ofrece opciones: reemplazar completo, refrescar un campo, o cancelar.

## Pre-requisitos

1. MCP `zoho-sprints` instalado y disponible en Claude Code.
2. MCP `playwright` instalado (solo se invoca si la API de Zoho no expone los `valid_status_ids` directamente).
3. El dev tiene credenciales validas de Zoho Sprints para completar OAuth.

## Invocacion

```
/agent-os-zoho-bootstrap
```

Sin argumentos. El skill descubre el proyecto automaticamente via `git remote get-url origin`.

## Que hace

El skill ejecuta 8 fases detalladas en `agent-os/skills/zoho-sprints-bootstrap/SKILL.md`:

1. Autenticacion con Zoho Sprints (OAuth via MCP).
2. Identificar team y project via `list_teams` + `list_projects`.
3. Pedir al dev seleccionar su usuario para `allowed_owners`.
4. Obtener sprint activo.
5. Extraer `valid_status_ids` (API con fallback a Playwright si la API no los expone).
6. Escribir `.claude/sprints-local.json`.
7. Asegurar gitignore.
8. Confirmar al dev.

## Tras ejecutar

Con el archivo creado, los comandos `/alfred zoho-*` quedan funcionales. Ver `agent-os/skills/zoho-sprints-integration/SKILL.md` para la lista completa.

## Ver tambien

- Skill: `agent-os/skills/zoho-sprints-bootstrap/SKILL.md`
- Schema y ejemplo del archivo (en el proyecto consumidor): `agent-os/templates/sprints-local.schema.json` y `agent-os/templates/sprints-local.example.json`.
