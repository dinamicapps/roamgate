# Anti-casos — cuando NO usar codebase-memory-mcp

> Extracto literal de la seccion 5 del standard canonico (`agent-os/standards/tooling/codebase-memory-mcp.md`). Si hay divergencia, la canonica gana.

Reglas duras: en estos casos, **agent-os debe usar Read/Grep/Glob directo** y NO invocar el MCP.

| Caso | Herramienta correcta | Por que el MCP pierde |
|---|---|---|
| El usuario ya dio el `path:linea` exacto | `Read` con offset/limit | Mas barato y directo. El MCP no agrega valor. |
| Necesitas contexto completo del archivo (no solo un simbolo) | `Read` completo | `get_code_snippet` aisla y rompe contexto. |
| Cambios recien hechos no re-indexados | `Read`/`Grep` | El grafo esta stale silenciosamente. Ver seccion 7 del standard. |
| Archivos de configuracion (YAML, JSON, INI) | `Read`/`Grep` | El grafo no extrae relaciones de configs no estructuradas en codigo. |
| Markdown narrativo (docs, READMEs sin estructura simbolica) | `Read`/`Grep` | Captura sections pero no las relaciones que importan. |
| Buscar un string literal exacto (mensaje de error, regex hardcodeada) | `Grep` | El grafo no indexa contenido de strings dentro de literales. |
| Diagnostico de runtime con stacktrace | `Read` por linea/archivo del stack | El grafo no sabe que falla en runtime. |
| Dudas si el simbolo existe siquiera | `Glob`/`Grep` rapido | Mas barato que cargar schema MCP + indexar. |
| Repos sin indexar y sin tiempo para indexar | Fallback completo | Indexar tiene costo. Si la tarea es de 1 query, no compensa. |

---

**Fuente canonica:** `agent-os/standards/tooling/codebase-memory-mcp.md` seccion 5.
