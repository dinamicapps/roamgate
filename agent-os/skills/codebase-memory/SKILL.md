---
name: codebase-memory
description: Use cuando un experto necesita busqueda estructural del codebase (simbolos homonimos, impacto multi-hop, busqueda semantica, lectura aislada de un metodo) y el MCP codebase-memory-mcp esta disponible en la sesion. Detecta disponibilidad, expone el protocolo minimo de invocacion y enlaza con el standard canonico y los references practicos.
---

# Skill: codebase-memory

Skill para interactuar con el MCP `codebase-memory-mcp` cuando esta disponible en la sesion. No es un MCP "siempre activo": agent-os lo invoca solo cuando la pregunta del experto calza con los golden cases listados en references o cuando el SKILL E4 lo dispara automaticamente como parte de la auditoria.

## Cuando invocar

Invocar este SKILL antes de usar tools `mcp__codebase-memory-mcp__*` cuando la pregunta del experto calza con alguno de los **golden cases** (ver `references/golden-cases.md`):

- "Quien llama a `MetodoX`?" -> `trace_path inbound`.
- "Que clases implementan `IInterfaceY`?" -> `search_graph relationship=INHERITS`.
- "Existen dos simbolos con el mismo nombre?" -> `query_graph`.
- "Que impacto tiene modificar `MetodoQ` (N hops out)?" -> `trace_path outbound`.
- "Encuentra codigo que haga X (no necesariamente con esa palabra)" -> `search_graph semantic_query`.
- "Dame solo el cuerpo de `MetodoR` sin el resto del archivo" -> `get_code_snippet`.

NO invocar cuando aplica algun **anti-caso** (ver `references/anti-casos.md`):

- El usuario ya dio `path:linea` exacto -> `Read` directo.
- Necesitas contexto completo del archivo -> `Read` completo.
- Cambios recien hechos y no re-indexados -> `Read`/`Grep` (el grafo esta stale).
- Configs (YAML/JSON/INI), markdown narrativo, strings literales -> `Grep`.
- Repo sin indexar y tarea de 1-2 queries -> `Grep` directo es mas barato que indexar.

## Deteccion del MCP

Considerar el MCP disponible cuando se cumple **cualquiera** de:

1. El system reminder de inicio de sesion lista una tool con prefijo `mcp__codebase-memory-mcp__` como deferred.
2. Una consulta a `mcp__codebase-memory-mcp__list_projects` no falla con error de servidor.

Si no se cumple ninguna: agent-os opera con `Read`/`Grep`/`Glob` sin mencionar este SKILL. **No anunciar al usuario que el MCP esta ausente** — el SKILL simplemente no se invoca.

## Protocolo minimo de invocacion

Cinco pasos en orden. Cada paso valida el siguiente.

### Paso 1: cargar schema de las tools necesarias

Las tools `mcp__codebase-memory-mcp__*` son **deferred**: aparecen listadas en el system reminder de la sesion pero su schema NO esta cargado. Antes del primer uso de cada tool, ejecutar:

```
ToolSearch query="select:list_projects,index_status,index_repository,search_graph,trace_path,get_code_snippet,query_graph,manage_adr"
```

Cargar solo las tools que se van a usar realmente — no cargar el catalogo completo "por si acaso" (anti-patron #5 en el standard, seccion 11).

### Paso 2: verificar estado del proyecto

```
list_projects()
```

Si el proyecto aparece con `status: ready`, continuar al paso 4 (consulta).

Si no aparece o `status` no es `ready`, ir al paso 3 (indexado).

### Paso 3: indexar (solo si el alcance justifica)

```
index_repository(repo_path="<path absoluto del repo>", mode="moderate", persistence=false)
```

Modos:
- `moderate` — default sensato. Rapido + semantica reducida.
- `full` — incluye embeddings completos. Usar solo si se anticipan busquedas semanticas frecuentes.
- `fast` — solo estructura, sin semantica. Usar en monorepos enormes.

Validar tras el indexado:

```
index_status(project="<slug retornado>")
```

Esperar `status: ready`.

**Costo:** ~30s en repos medianos (<10k nodos). Si la tarea es de 1-2 queries puntuales y el repo no esta indexado, evaluar si compensa — para fixes triviales (1-3 archivos) `Grep` puede ser mas barato.

### Paso 4: ejecutar la consulta

Ver `references/recetario.md` para comandos exactos por escenario:
- 6.1 Onboarding.
- 6.2 Encontrar un simbolo (regex, BM25, semantica).
- 6.3 Trazar impacto (inbound, outbound, data_flow).
- 6.4 Leer un metodo aislado (qualified_name + get_code_snippet).
- 6.5 Persistir decisiones de arquitectura (manage_adr).

### Paso 5: validar resultados criticos

Para preguntas donde un falso negativo o falso positivo cuesta caro (auditoria, refactor con alto impacto, modificacion de simbolos centrales):

- Si hay homonimos potenciales, validar con `query_graph MATCH (m:Method {name: 'X'}) RETURN m.qualified_name, m.file_path` antes de aceptar el resultado de `trace_path` (ver limitacion 7.2 del standard).
- Si los cambios son recientes y el grafo podria estar stale, considerar re-indexar antes (ver seccion 8 del standard).

## Invocacion automatica desde otros SKILLs

La verificacion de E4 (datos en `agent-os/skills/host-protocol/etapas/etapa-4.md`; en Alfred, `piezas/verificacion.md`) invoca este SKILL automaticamente en el "Paso 0 (condicional al MCP codebase-memory)" de la auditoria de convenciones, cuando se cumplen las tres condiciones (modo `normal` (o el flujo `rediseno-ui`) + MCP disponible + edits en E3).

Otros SKILLs (E1, E2, E3) NO invocan este SKILL automaticamente. Cada experto decide cuando llamar segun calce con golden cases.

## Standard de tooling de referencia

La fuente canonica del standard (que gana, que pierde, limitaciones, mantenimiento) vive en:

**`agent-os/standards/tooling/codebase-memory-mcp.md`**

Este SKILL es la implementacion operativa del standard. Si hay divergencia entre lo escrito aqui y la canonica, la canonica gana — abrir issue para corregir el SKILL.

## References

- `references/golden-cases.md` — extracto literal de la seccion 4 del standard (cuando el MCP gana sobre Read/Grep).
- `references/anti-casos.md` — extracto literal de la seccion 5 (cuando NO usar el MCP).
- `references/recetario.md` — extracto literal de la seccion 6 (comandos exactos por escenario).
