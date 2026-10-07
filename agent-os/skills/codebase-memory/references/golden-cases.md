# Golden cases — cuando codebase-memory-mcp gana sustancialmente

> Extracto literal de la seccion 4 del standard canonico (`agent-os/standards/tooling/codebase-memory-mcp.md`). Si hay divergencia, la canonica gana.

Reglas duras: en estos casos, **agent-os debe intentar el MCP primero** antes de Read/Grep.

| Pregunta del agente | Tool primaria | Por que gana |
|---|---|---|
| "Quien llama a `MetodoX`?" | `trace_path direction=inbound` | Filtra tests automaticamente, da hop distance, colapsa duplicados. Grep retorna ruido. |
| "Que clases implementan `IInterfaceY`?" | `search_graph relationship=INHERITS` o `query_graph` | Una consulta vs leer cada implementador. |
| "Cuantos metodos tiene `ClaseZ` y como se llaman?" | `query_graph MATCH (c:Class)-[:DEFINES_METHOD]->(m)` | Tabular en una row vs Read del archivo completo. |
| "Existen dos simbolos con el mismo nombre `MetodoW`?" | `query_graph MATCH (m:Method {name})` | Expone ambiguedades en una row con file_path + start_line. Grep no las separa por declaracion. |
| "Que impacto tiene modificar `MetodoQ` (3 hops out)?" | `trace_path direction=outbound depth=3` | Mapea cascada de llamadas. Grep no entiende llamadas, solo strings. |
| "Encuentra codigo que haga 'enviar mensaje' (no necesariamente la palabra send)" | `search_graph semantic_query=["enviar","mensaje","publicar"]` | Embeddings cruzan vocabulario. Grep falla si el codigo dice `publish` y tu buscas `send`. |
| "Dame solo el cuerpo de `MetodoR` sin el resto del archivo" | `get_code_snippet` | Snippet aislado. Read entrega el archivo entero. |
| "Vista de alto nivel del codebase" | `get_architecture aspects=["all"]` | Conteos agregados en una sola llamada. |

---

**Fuente canonica:** `agent-os/standards/tooling/codebase-memory-mcp.md` seccion 4.
