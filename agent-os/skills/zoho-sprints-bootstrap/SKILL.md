---
name: zoho-sprints-bootstrap
description: Asistente para crear `.claude/sprints-local.json` de un proyecto consumidor la primera vez que se quiere usar la integracion Zoho Sprints. Combina MCP zoho-sprints (API oficial) con MCP playwright (extraccion de datos que la API no provee) guiando al dev paso a paso.
---

# Zoho Sprints Bootstrap

Skill invocado automaticamente por el skill `zoho-sprints-integration` cuando detecta que `.claude/sprints-local.json` no existe o esta incompleto. Tambien invocable manualmente con `/agent-os-zoho-bootstrap` para re-ejecutar el wizard.

## Pre-requisitos

1. MCP `zoho-sprints` instalado y disponible.
2. MCP `playwright` instalado y disponible (para extraccion de datos no expuestos en la API).
3. Usuario tiene credenciales de Zoho Sprints validas para autenticacion OAuth.

Si falta cualquiera: abortar con instruccion clara.

## Flujo

### Fase 1: Autenticacion con Zoho Sprints (API)

1. Invocar `mcp__zoho-sprints__zoho_connection_status`. Si ya esta conectado: saltar al paso 4.
2. Si no: invocar `mcp__zoho-sprints__zoho_setup` siguiendo prompts al usuario.
3. Completar OAuth: `zoho_oauth_get_url`, usuario visita URL, copia el code, `zoho_oauth_exchange_code`.
4. Confirmar conexion con `zoho_connection_status`.

### Fase 2: Identificar team y project via API

1. Invocar `mcp__zoho-sprints__list_teams`. Si devuelve >1 team: presentar al usuario, pedir eleccion (AskUserQuestion). Guardar `team_id` y `team_name`.
2. Invocar `mcp__zoho-sprints__list_projects({ team_id })`. Presentar lista, pedir eleccion. Guardar `project_id` y `project_name`.

### Fase 3: Obtener usuarios del proyecto via API (para allowed_owners)

1. Invocar `mcp__zoho-sprints__get_project_users({ team_id, project_id })`. Retorna lista de usuarios con `user_id` y nombre.
2. Presentar lista al dev con AskUserQuestion:
   ```
   ¿Cual es tu usuario en este proyecto de Zoho? (Se usara para filtrar
   los items que te son asignados al ejecutar /alfred.)

   Opciones: <lista de usuarios>
   ```
3. Guardar seleccion como `allowed_owners: { "{user_id}": "{nombre}" }`. (Si colaboras con mas devs bajo el mismo usuario compartido, el skill ofrece agregar mas.)

### Fase 4: Obtener sprint activo via API

1. Invocar `mcp__zoho-sprints__list_sprints({ team_id, project_id, status: "In Progress" })`.
2. Si hay 1 sprint: guardar `current_sprint_id` y `current_sprint_name`.
3. Si hay >1: presentar, pedir eleccion.
4. Si hay 0: advertir al dev ("no hay sprints activos; la integracion funcionara cuando inicie uno").

### Fase 5: Extraer valid_status_ids (API + fallback a Playwright)

Los `status_id` internos (IDs para `To do`, `In Progress`, `Para Probar`, `Done`) NO siempre estan en la API publica de Zoho Sprints. Estrategia en cascada:

**Intento 1 — API:**

1. Invocar `mcp__zoho-sprints__list_release_stages({ team_id, project_id })` o herramienta equivalente si existe.
2. Si la respuesta contiene los 4 estados con sus IDs: guardar y saltar al paso 6.

**Intento 2 — Playwright (fallback):**

Si la API no expone los `status_id` directamente:

1. Informar al dev:
   ```
   La API de Zoho no expone los IDs internos de los estados de items.
   Necesito abrir Zoho Sprints en un navegador y extraerlos inspeccionando
   la UI. Requiere tu login en Zoho Sprints.

   Voy a abrir un navegador Playwright. Continua? (s/n)
   ```
2. Si `s`: invocar `mcp__playwright__browser_navigate` a `https://sprints.zoho.com/team/{team_id}/projects/{project_id}/backlogsprintsboard`.
3. Pedir al dev que complete login si aparece:
   ```
   Por favor inicia sesion en Zoho Sprints en la ventana del navegador.
   Cuando veas el board del sprint, responde aqui "listo".
   ```
4. Una vez logueado, invocar `mcp__playwright__browser_evaluate` con script JS que extraiga los status IDs del DOM/contexto JS de la pagina. Ejemplo:
   ```javascript
   // Script adaptado al DOM/API interna de Zoho Sprints.
   // Busca las burbujas/columnas de estado y extrae sus IDs.
   const statuses = Array.from(document.querySelectorAll('[data-status-id]')).map(el => ({
     name: el.textContent.trim(),
     id: el.getAttribute('data-status-id')
   }));
   return statuses;
   ```
   (El script exacto debe validarse contra la version actual de Zoho Sprints UI; si cambia, ajustar aqui.)

5. Parsear resultado. Mapear nombres a claves estandarizadas:
   - "To do" / "Abierto" → `to_do`
   - "In Progress" / "En progreso" → `in_progress`
   - "Para probar" / "To Test" → `para_probar`
   - "Done" / "Terminado" → `done`

6. Si algun mapeo falla: pedir al dev confirmacion del mapping manual mostrando nombres extraidos vs claves esperadas.

7. Cerrar Playwright con `mcp__playwright__browser_close`.

### Fase 6: Escribir `.claude/sprints-local.json`

Escribir en el proyecto consumidor (NO en el home):

```json
{
  "schema_version": 1,
  "creado_en": "{YYYY-MM-DD}",
  "creado_por": "zoho-sprints-bootstrap",
  "team": {
    "id": "<team_id>",
    "name": "<team_name>"
  },
  "project": {
    "id": "<project_id>",
    "name": "<project_name>"
  },
  "current_sprint": {
    "id": "<sprint_id o null>",
    "name": "<sprint_name o null>"
  },
  "allowed_owners": {
    "<user_id>": "<nombre>"
  },
  "valid_status_ids": {
    "to_do": "<id>",
    "in_progress": "<id>",
    "para_probar": "<id>",
    "done": "<id>"
  }
}
```

### Fase 7: Asegurar `.gitignore` del proyecto consumidor excluye `sprints-local.json`

1. Leer `.gitignore` del proyecto. Si no existe: crearlo.
2. Buscar linea `.claude/sprints-local.json` o `.claude/*-local.*`. Si no esta: agregarla.
3. Registrar en la conversacion.

### Fase 8: Confirmacion al dev

```
Configuracion Zoho completa:

Proyecto: {project_name} (ID: {project_id})
Team: {team_name}
Tu usuario: {nombre} (ID: {user_id})
Sprint activo: {sprint_name}
Status IDs: 4 estados mapeados

Archivo: .claude/sprints-local.json (gitignoreado)

Ahora podes usar la integracion Zoho en /alfred:
  /alfred zoho-agregar-item
  /alfred zoho-listar-items
  ...
```

## Manejo de errores

| Error | Accion |
|-------|--------|
| MCP zoho-sprints no disponible | Abortar con instruccion para instalar el MCP. |
| MCP playwright no disponible en fase 5 intento 2 | Pedir al dev ingresar IDs manualmente desde la UI de Zoho con instrucciones paso a paso. |
| Login a Zoho fallido | Retry. Tras 3 intentos fallidos: abortar y pedir al dev verificar credenciales. |
| Script de extraccion no encuentra status IDs | Informar al dev que la UI de Zoho cambio; ofrecer ingreso manual de los 4 IDs. |
| project-id no encontrado | Verificar que el usuario es miembro del proyecto; sino reasignarlo en Zoho. |

## Invocacion manual

El dev puede re-ejecutar el wizard con `/agent-os-zoho-bootstrap`. Si `.claude/sprints-local.json` ya existe: ofrecer opciones:
- Reemplazar completo (pierde valores anteriores).
- Refrescar solo un campo (ej. cambiar sprint activo).
- Cancelar.

## Referencias

- Skill relacionado: `agent-os/skills/zoho-sprints-integration/SKILL.md` (consume el archivo generado aqui).
