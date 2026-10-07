# Herramientas requeridas que pueden estar diferidas

> Como cargar con `ToolSearch` una herramienta (`AskUserQuestion` y otras) que aparece como deferred en el system reminder, en vez de declararla "no disponible". Movido desde `host-protocol/SKILL.md` (CG-01/05/06).

## Herramientas requeridas que pueden estar diferidas

Ciertas herramientas que los expertos usan habitualmente NO siempre estan precargadas en el contexto inicial. En entornos con muchas herramientas disponibles, algunas se cargan **bajo demanda** via `ToolSearch` con query `select:NombreHerramienta`. Si una herramienta aparece listada como "deferred tool" en el system reminder, NO esta disponible directamente — hay que cargar su schema antes de invocarla.

### `AskUserQuestion` — herramienta esencial para preguntas con opciones

Es la herramienta canonica del sistema para presentar al usuario preguntas con opciones discretas y recibir respuesta estructurada. **Es de uso obligatorio** cuando un experto ofrece opciones (ver "Recomendacion obligatoria al ofrecer opciones" en `host-protocol/SKILL.md`) — preferida sobre texto libre porque (a) reduce ambiguedad, (b) preserva intent original del usuario, (c) deja registro estructurado en la conversacion.

**Si la herramienta NO aparece directamente disponible:**

1. **NO declarar al usuario "no esta disponible".** Es FALSO — la herramienta existe en el entorno, solo esta diferida.
2. **Cargarla con `ToolSearch`:**
   ```
   ToolSearch query="select:AskUserQuestion" max_results=1
   ```
3. **Tras la carga, su schema queda disponible y se puede invocar** como cualquier herramienta normal.

**Anti-patron a evitar:** sustituir `AskUserQuestion` por una pregunta de texto libre cuando es deferred. Ejemplo observado en prueba real: "AskUserQuestion no es una herramienta disponible en este entorno — no figura en los resultados". Esto era falso (es deferred, no inexistente). El experto debio cargarla con `ToolSearch select:AskUserQuestion` y proceder.

**Excepcion bridge:** en sesiones bridge la pregunta viaja POR EL BRIDGE (`bridge_dm` o `bridge_publicar`, con las opciones numeradas en el contenido), nunca `AskUserQuestion` — esa herramienta solo aparece en la terminal local, no frente al remitente. Regla operativa completa: `agent-os/skills/bridge-session/references/guia-operativa-bridge.md`.

### Otras herramientas potencialmente diferidas

Patrones similares aplican a `WebFetch`, `WebSearch`, `TaskCreate`, `EnterPlanMode`, `NotebookEdit`, herramientas MCP especificas (zoho, sqlserver, playwright, jina, context7). Si el experto necesita una y no la encuentra, primer paso es `ToolSearch` con `select:` antes de declararla "no disponible".
