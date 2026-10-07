# Recetario — comandos exactos por escenario

> Extracto literal de la seccion 6 del standard canonico (`agent-os/standards/tooling/codebase-memory-mcp.md`). Si hay divergencia, la canonica gana.

## 6.1 Onboarding a un repo (primera vez)

```
# Verifica si ya esta indexado
list_projects()

# Si no aparece, indexa
index_repository(repo_path="<path absoluto>", mode="full", persistence=false)

# Validacion
index_status(project="<slug retornado>")

# Vista de alto nivel
get_architecture(project="<slug>", aspects=["all"])
```

Modos de indexado:
- `full`: incluye pasada semantica (embeddings). Recomendado para repos donde se anticipa busqueda semantica frecuente.
- `moderate`: rapido + semantica reducida. Default sensato si no sabes.
- `fast`: solo estructura. Util para repos enormes donde el costo de embeddings no compensa.
- `cross-repo-intelligence`: matching de Routes/Channels entre repos ya indexados. Requiere `target_projects`.

## 6.2 Encontrar un simbolo

```
# Por nombre exacto o regex
search_graph(project="<slug>", name_pattern=".*Activacion.*", label="Class")

# Por descripcion natural (BM25)
search_graph(project="<slug>", query="autenticacion JWT middleware")

# Por vocabulario semantico (requiere mode moderate/full)
search_graph(project="<slug>", semantic_query=["validar","permiso","autorizar"])
```

## 6.3 Trazar impacto

```
# Quien llama a X (inbound)
trace_path(project="<slug>", function_name="MetodoX", direction="inbound", depth=2)

# A donde llama X (outbound)
trace_path(project="<slug>", function_name="MetodoX", direction="outbound", depth=3)

# Propagacion de un parametro especifico
trace_path(project="<slug>", function_name="MetodoX", mode="data_flow", parameter_name="userId")
```

## 6.4 Leer un metodo aislado

```
# Primero: encuentra el qualified_name
search_graph(project="<slug>", name_pattern="^ActivarAsync$")

# Despues: lee solo el cuerpo
get_code_snippet(project="<slug>", qualified_name="<qn completo>")
```

## 6.5 Persistir decisiones de arquitectura

```
# Leer ADR actual
manage_adr(project="<slug>", mode="get")

# Crear/sobrescribir
manage_adr(project="<slug>", mode="update", content="## PURPOSE\n...\n\n## ARCHITECTURE\n...")

# Listar secciones (para edicion incremental)
manage_adr(project="<slug>", mode="sections")
```

---

**Fuente canonica:** `agent-os/standards/tooling/codebase-memory-mcp.md` seccion 6.
