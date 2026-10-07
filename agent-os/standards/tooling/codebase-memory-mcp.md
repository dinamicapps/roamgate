---
nombre: codebase-memory-mcp
dominio: tooling
aplica_a: [normal, rediseno-ui, investigacion, documentacion]
creado_por_work: null
fecha_creacion: 2026-05-12
fuente_canonica: agent-os/standards/tooling/codebase-memory-mcp.md
origen: ihce_gateway/docs/agent-os-standards/codebase-memory-mcp.md (sesion empirica 2026-05-12)
---

# Standard de tooling: codebase-memory-mcp

**Tipo:** standard de tooling (horizontal, no depende del stack)
**Aplicabilidad:** todos los repos consumidores de agent-os donde el MCP `codebase-memory-mcp` este registrado en la configuracion de Claude Code.

---

## 1. Que es codebase-memory-mcp

Servidor MCP que construye un grafo de conocimiento del codebase (nodos: archivos, modulos, clases, metodos, interfaces, variables, secciones markdown; aristas: definiciones, llamadas, herencias, configuraciones, similitud semantica, etc.) y expone consultas tipo Cypher, busqueda semantica con embeddings, trazado de paths entre simbolos, lectura de snippets aislados y persistencia de ADRs.

Nombre del namespace de tools: `mcp__codebase-memory-mcp__*`.

Las tools son **deferred** en la sesion: aparecen listadas pero su schema se carga bajo demanda con `ToolSearch query="select:<nombre>"`. Esto significa que el primer uso de una tool tiene un round-trip extra de carga.

---

## 2. Deteccion

Agent-os debe considerar este MCP disponible cuando se cumple cualquiera de:

1. El system reminder de inicio de sesion lista una tool con prefijo `mcp__codebase-memory-mcp__` como deferred.
2. Una consulta a `mcp__codebase-memory-mcp__list_projects` no falla con error de servidor.

Si no se cumple, agent-os opera en modo fallback (Read/Grep/Glob/Agent) sin mencionar este standard.

---

## 3. Tools disponibles y para que sirve cada una

| Tool | Proposito | Cuando es la mejor opcion |
|---|---|---|
| `index_repository` | Construye el grafo. Modos `full`, `moderate`, `fast`, `cross-repo-intelligence`. | Primera vez en el repo, o re-indexado tras cambios sustantivos. |
| `index_status` | Reporta nodes/edges del proyecto indexado. | Antes de consultar, para validar que el grafo este `ready`. |
| `list_projects` | Lista proyectos ya indexados con sus slugs. | Inicio de sesion en repos donde no se sabe si ya se indexo. |
| `get_architecture` | Vista agregada: conteos por label/edge type, packages, dependencias. | Onboarding rapido a un codebase nuevo o exploracion de alto nivel. |
| `search_code` | Grep + enriquecimiento de grafo. Deduplicates en funciones contenedoras, ranking por importancia estructural. | Cuando buscas un patron de texto pero quieres jerarquia: definiciones primero, tests al final. |
| `search_graph` | Busqueda en el grafo por `name_pattern` (regex), `query` (BM25 full-text), `semantic_query` (embeddings array). | Encontrar simbolos por nombre, descripcion natural o vocabulario cercano. |
| `query_graph` | Cypher arbitrario sobre el grafo. | Consultas estructurales multi-hop, agregaciones, joins entre labels. |
| `trace_path` | Inbound/outbound de `CALLS`, `data_flow` con args, `cross_service` por Routes HTTP/async. | Quien llama a X, impacto de modificar Y, propagacion de un parametro. |
| `get_code_snippet` | Lee solo el cuerpo de un metodo/clase por qualified_name. | Cuando quieres ver UN simbolo sin abrir 500 lineas de archivo. |
| `manage_adr` | Crea/lee/edita un ADR por proyecto. Secciones canonicas: PURPOSE, STACK, ARCHITECTURE, PATTERNS, TRADEOFFS, PHILOSOPHY. | Persistir decisiones arquitectonicas entre sesiones. |
| `ingest_traces` | Importa trazas runtime al grafo (si esta soportado). | Enriquecer estatico con dinamico. |
| `get_graph_schema` | Esquema actual del grafo. | Diagnosticar que labels/aristas existen antes de escribir Cypher. |
| `detect_changes` | Detecta drift entre el grafo y el codebase actual. | Pre-flight de auditoria, decision de re-indexar. |
| `delete_project` | Elimina el grafo de un proyecto. | Limpiar antes de re-indexado completo o cuando un proyecto se archiva. |

---

## 4. Donde gana sustancialmente sobre Read/Grep (casos golden)

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

## 5. Donde NO gana (o pierde)

Reglas duras: en estos casos, **agent-os debe usar Read/Grep/Glob directo** y NO invocar el MCP.

| Caso | Herramienta correcta | Por que el MCP pierde |
|---|---|---|
| El usuario ya dio el `path:linea` exacto | `Read` con offset/limit | Mas barato y directo. El MCP no agrega valor. |
| Necesitas contexto completo del archivo (no solo un simbolo) | `Read` completo | `get_code_snippet` aisla y rompe contexto. |
| Cambios recien hechos no re-indexados | `Read`/`Grep` | El grafo esta stale silenciosamente. Ver seccion 7. |
| Archivos de configuracion (YAML, JSON, INI) | `Read`/`Grep` | El grafo no extrae relaciones de configs no estructuradas en codigo. |
| Markdown narrativo (docs, READMEs sin estructura simbolica) | `Read`/`Grep` | Captura sections pero no las relaciones que importan. |
| Buscar un string literal exacto (mensaje de error, regex hardcodeada) | `Grep` | El grafo no indexa contenido de strings dentro de literales. |
| Diagnostico de runtime con stacktrace | `Read` por linea/archivo del stack | El grafo no sabe que falla en runtime. |
| Dudas si el simbolo existe siquiera | `Glob`/`Grep` rapido | Mas barato que cargar schema MCP + indexar. |
| Repos sin indexar y sin tiempo para indexar | Fallback completo | Indexar tiene costo. Si la tarea es de 1 query, no compensa. |

---

## 6. Comandos exactos (recetario)

### 6.1 Onboarding a un repo (primera vez)

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

### 6.2 Encontrar un simbolo

```
# Por nombre exacto o regex
search_graph(project="<slug>", name_pattern=".*Activacion.*", label="Class")

# Por descripcion natural (BM25)
search_graph(project="<slug>", query="autenticacion JWT middleware")

# Por vocabulario semantico (requiere mode moderate/full)
search_graph(project="<slug>", semantic_query=["validar","permiso","autorizar"])
```

### 6.3 Trazar impacto

```
# Quien llama a X (inbound)
trace_path(project="<slug>", function_name="MetodoX", direction="inbound", depth=2)

# A donde llama X (outbound)
trace_path(project="<slug>", function_name="MetodoX", direction="outbound", depth=3)

# Propagacion de un parametro especifico
trace_path(project="<slug>", function_name="MetodoX", mode="data_flow", parameter_name="userId")
```

### 6.4 Leer un metodo aislado

```
# Primero: encuentra el qualified_name
search_graph(project="<slug>", name_pattern="^ActivarAsync$")

# Despues: lee solo el cuerpo
get_code_snippet(project="<slug>", qualified_name="<qn completo>")
```

### 6.5 Persistir decisiones de arquitectura

```
# Leer ADR actual
manage_adr(project="<slug>", mode="get")

# Crear/sobrescribir
manage_adr(project="<slug>", mode="update", content="## PURPOSE\n...\n\n## ARCHITECTURE\n...")

# Listar secciones (para edicion incremental)
manage_adr(project="<slug>", mode="sections")
```

---

## 7. Limitaciones reales (lo que NO funciona)

### 7.1 El grafo se desactualiza silenciosamente

Cada edit invalida partes del grafo. No hay warning automatico. Si un agente consulta tras editar codigo sin re-indexar, recibe informacion stale.

**Mitigacion:** ver seccion 8 (recomendacion de re-indexado en E4).

### 7.2 `trace_path` puede rechazar qualified_name completo

En la version observada (2026-05), `trace_path` rechaza nombres muy largos con error `function not found` aunque el mismo qualified_name funcione en `get_code_snippet`. El hint del error sugiere usar `name_pattern`, pero el workaround practico es pasar el **nombre corto** del metodo.

**Implicacion:** si hay homonimos en el repo (ej. `ActivarAsync` declarado en 4 lugares), `trace_path` con nombre corto puede agregar callers de implementaciones distintas. Validar resultados con `query_graph` previo:

```
query_graph(query="MATCH (m:Method {name: 'ActivarAsync'}) RETURN m.qualified_name, m.file_path")
```

### 7.3 Tools deferred requieren carga previa

Cada nueva tool del MCP necesita `ToolSearch query="select:<nombre>"` antes del primer uso. Round-trip extra. Para una consulta unica puede no compensar.

**Implicacion:** agent-os debe agrupar usos del MCP en bloques contiguos cuando sea posible, no entremezclar con Read/Grep alternados.

### 7.4 Indexado inicial cuesta tiempo

En repos pequenos-medianos (<10k nodos) es rapido (<30s). En monorepos puede tardar minutos. **Recomendacion:** empezar con `moderate`, no `full`, y promover a `full` si la busqueda semantica se vuelve frecuente.

### 7.5 El MCP no piensa por ti

El grafo te lleva al snippet correcto. Entender la **doctrina** del codigo (politicas de seguridad, decisiones arquitectonicas implicitas, motivaciones) sigue requiriendo lectura humana del codigo y los comentarios. El MCP es **acelerador de localizacion**, no **sustituto de comprension**.

### 7.6 Capacidades dinamicas limitadas

`ingest_traces` existe pero requiere infraestructura de tracing runtime que la mayoria de repos no tienen. El grafo es esencialmente **estatico**. No sabe de:
- Que ruta toma un request en runtime.
- Que rama de un `if` se ejecuta mas.
- Errores que ocurren en produccion.

Para esas preguntas, usar logs/APM/tracing externos.

---

## 8. Recomendacion de re-indexado en E4 (sugerencia fuerte)

Aplica a works en modo `normal` (o el flujo `rediseno-ui`) donde la etapa de ejecucion (E3) modifica codigo y la etapa de verificacion (E4) ejecuta "Auditoria de convenciones a destilar".

### Regla operativa

En `agent-os/skills/host-protocol/etapas/etapa-4/convenciones-a-destilar.md`, el "Paso 0 (condicional al MCP codebase-memory)" instruye a Quinn a:

1. Verificar disponibilidad del MCP (ver seccion 2).
2. Verificar que el proyecto este indexado via `list_projects()` o `index_status(project=<slug>)`.
3. Si hubo edits en E3 y el proyecto esta indexado, **ofrecer al usuario** tres opciones:
   - **(a)** Re-indexar mode=moderate antes de auditar (~30s tipicos).
   - **(b)** Auditar con grep/Read directo sin tocar el grafo.
   - **(c)** Confiar en el grafo stale (registrar `[OVERRIDE]` en bitacora con razon).
4. Ejecutar la opcion elegida y proceder con el resto del procedimiento de auditoria.

### Por que es sugerencia y no regla dura

La version empirica original (en `ihce_gateway/docs/agent-os-standards/codebase-memory-mcp.md`) proponia esto como regla dura. La decision del 2026-05-12 al migrar al sistema agent-os fue suavizarla a sugerencia con anuncio explicito del riesgo. Razones:

- Respeta la autonomia del usuario.
- No fuerza ~30s de espera en cada cierre de E4.
- El riesgo (auditoria con grafo stale = falso positivo/negativo silencioso) queda explicitado en el mensaje de Quinn cada vez, asi el usuario decide informado.

### Por que sigue siendo sugerencia "fuerte"

CS-4 audita cumplimiento de standards (naming, api-response, security, etc.) contra archivos que **acaban de cambiar en E3**. Si el grafo esta stale:
- Standards aplicables se infieren del grafo viejo -> carga incorrecta.
- Violaciones de standards en codigo nuevo pasan desapercibidas (falso negativo).
- Violaciones que E3 corrigio se reportan como activas (falso positivo).

Esto rompe la utilidad de la auditoria silenciosamente. Por eso Quinn debe ofrecer las tres opciones de forma explicita en el mensaje del paso 0, no como mero recordatorio.

### Si la auditoria no aplica (modos investigacion/documentacion)

El re-indexado no se ofrece. Quinn salta el paso 0 silenciosamente.

---

## 9. Guia (no obligatoria) para otros usos en works

Estos son recomendaciones, no reglas duras. Cada experto decide segun contexto.

### 9.1 Abordaje (Fase 2: recolectar evidencia)

Cuando `/alfred` o `/disenar` arranca y el abordaje invoca subagentes paralelos para recolectar evidencia, el MCP es valioso para:
- Mapear simbolos relacionados al objetivo declarado (`search_graph` por nombre/semantica).
- Detectar duplicados de nomenclatura (clases/metodos homonimos).
- Calcular impacto preliminar (`trace_path inbound` sobre el simbolo central).

**Antes de invocarlo:** confirmar que el repo este indexado. Si no, decidir si el costo de indexar compensa para el alcance del work. Para fixes triviales (1-3 archivos), Grep es mas barato.

### 9.2 Etapa 1 Discovery (Mary anfitriona)

Util para preguntas como:
- "Hay otros lugares en el repo donde ya se resolvio algo similar?" -> `search_graph semantic_query`.
- "Que actores tocan este modulo?" -> `trace_path inbound` desde los entry points.
- "Hay tests previos que documentan comportamiento?" -> `search_graph label="Class" name_pattern=".*Tests"`.

### 9.3 Etapa 2 Plan (Winston / Paige)

Para Winston:
- Localizar interfaces existentes que el plan deberia reutilizar: `query_graph` sobre `Interface` nodes.
- Detectar puntos de extension naturales (clases con muchas implementaciones): `query_graph` con `count(INHERITS)`.

Para Paige (modo documentacion):
- El grafo no aporta tanto. Read/Grep directo sobre el codigo a documentar es mas eficiente.

### 9.4 Etapa 3 Ejecucion (Amelia / Atlas)

Antes de cada Edit/Write:
- `get_code_snippet` para leer el contexto inmediato del simbolo a modificar (mas eficiente que Read del archivo completo).
- `trace_path inbound` sobre el simbolo a modificar para validar que el cambio no rompe callers.

Despues del bloque de cambios:
- Re-indexar es **opcional** durante E3. Solo sugerido antes de la auditoria en E4 (ver seccion 8).
- Si la tarea va a iterar sobre el mismo simbolo varias veces, vale la pena re-indexar mid-E3 para mantener consultas relevantes.

### 9.5 Etapa 4 Verificacion (Quinn)

- **Sugerencia fuerte:** re-indexar pre-auditoria (seccion 8).
- Util: `search_graph` para localizar todos los archivos modificados que tocan un dominio (ej. security) y aplicar el standard relevante.
- Util: `trace_path` para validar que cambios en metodos clave no rompen llamantes inesperados (regression preview).

---

## 10. ADR como practica complementaria

Cuando un work modifica decisiones arquitectonicas (introduce un patron nuevo, cambia el flujo de un proceso central, formaliza una politica como "no leak" o "defensa en profundidad"), Quinn o el experto correspondiente **puede** invocar `manage_adr` para persistir la decision.

Esto es **guia, no obligatorio**. Criterio:

- **Vale la pena:** el cambio establece una doctrina que futuras sesiones necesitan entender sin re-derivar.
- **No vale la pena:** fix de bug aislado, refactor focal, ajuste de naming.

Los hechos arquitectonicos son recuperables del codigo, pero **costosos de re-derivar**. El ADR los hace baratos.

---

## 11. Anti-patrones a evitar

1. **Indexar al inicio de cada sesion por costumbre.** Costoso y rara vez justificado. Indexar solo cuando el work lo requiere.
2. **Confiar en el grafo despues de Edit sin re-indexar.** Falso sentido de cobertura. Aplica especialmente a la auditoria de E4.
3. **Usar `search_code` cuando `Grep` resuelve mas barato.** `search_code` es valioso por el enriquecimiento estructural, no por el grep crudo. Si solo necesitas el match crudo, usa `Grep`.
4. **Pedir `get_architecture` cuando ya tienes el ADR poblado.** El ADR cubre la pregunta de alto nivel mejor.
5. **Cargar todos los schemas del MCP con `ToolSearch` al inicio "por si acaso".** Carga bajo demanda. Cargar todo enturbia el contexto sin beneficio.
6. **Asumir que `trace_path` con nombre corto es univoco.** Validar con `query_graph` cuando el repo tiene homonimos (seccion 7.2).

---

## 12. Checklist de adopcion (para repos nuevos)

Cuando agent-os entra a un repo donde el MCP esta disponible y nunca se ha usado:

- [ ] `list_projects()` para confirmar si ya esta indexado.
- [ ] Si no esta indexado y el work tiene alcance >3 archivos, ejecutar `index_repository mode="moderate"`.
- [ ] `index_status` para validar `ready`.
- [ ] `get_architecture aspects=["all"]` UNA VEZ para perfil del repo (loguear o no segun verbosidad).
- [ ] Considerar `manage_adr mode="get"` para ver si hay decisiones previas. Si vacio, el primer work arquitectonico puede crear el inicial.

---

## 13. Evidencia de validacion (sesion empirica 2026-05-12 en `ihce_gateway`)

> Esta seccion documenta el descubrimiento empirico que motivo este standard. Se conserva textual por su valor probatorio.

Indexado completo (modo `full`): 7388 nodos, 12619 aristas. Tiempo subjetivo: ~30 segundos.

Distribucion observada:
- 43% `Section` (markdown del corpus agent-os del repo)
- 17% `Method` (1288)
- 13% `Variable` (952)
- 8% `File` + 8% `Module` (633 c/u, biyeccion)
- 6% `Class` (465)
- Resto: Folder (2%), Interface (0.6%), Enum (0.5%).

Aristas dominantes: `DEFINES` (52%), `CALLS` (13%), `USAGE` (13%), `DEFINES_METHOD` (10%). Semanticas: `SEMANTICALLY_RELATED` + `SIMILAR_TO` ~3.2% combinado (solo aparecen en modo `full`).

Casos donde el MCP demostro ventaja sustancial en la sesion:
- Detectar 4 declaraciones distintas de `ActivarAsync` en 4 archivos (granja-impl, granja-iface, empresa-impl, empresa-iface) que grep habria mezclado.
- Trazar inbound a `ActivarAsync` y obtener separacion clara tests vs produccion (3 callers de produccion + 8 tests) sin filtrado manual.
- Leer cuerpo aislado de 3 metodos (~150 lineas utiles) sin abrir 3 archivos completos (~900 lineas).

Caso donde grep habria sido mas barato:
- Si la pregunta inicial hubiera sido "muestrame `ActivacionService.cs`" con path conocido, Read habria sido directo. El MCP solo se justifico porque la pregunta era exploratoria.

---

## 14. Mantenimiento de este standard

Revisar este documento cuando:
- El MCP `codebase-memory-mcp` libere version nueva con tools/modos adicionales.
- Aparezca un caso golden nuevo que merezca regla dura.
- Se descubra una limitacion no documentada (seccion 7) que requiera workaround.
- Cambien las etapas de `/alfred` y la regla del re-indexado pre-auditoria (seccion 8) necesite ajuste.

Este standard se versiona como canonica en `agent-os/standards/tooling/codebase-memory-mcp.md`. Punteros en otros perfiles enlazan con marcador HTML obligatorio.
