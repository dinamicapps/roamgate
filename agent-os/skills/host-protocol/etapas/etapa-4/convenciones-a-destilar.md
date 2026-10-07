# Etapa 4 — Auditoria de convenciones a destilar

> Tarjeta por-chequeo de Etapa 4. `agentos work checklist-cierre --slug {slug}` marca el chequeo `convenciones` como SIEMPRE aplicable (works con E0 enriquecida); cargar esta tarjeta cuando el checklist lo liste. Movido desde `etapas/etapa-4.md` (Ola 5 T7, doctrina AI-friendly).

## Auditoria de convenciones a destilar (obligatoria antes del cierre)

Aplica a works iniciados con E0 enriquecida (con bloque `descubrimiento_producto` en README). Quinn audita que las convenciones tacitas detectadas durante el work hayan terminado en uno de tres estados:

- `completado` — la convencion fue destilada como standard (existe el archivo, esta indexado, esta vinculado al work-record).
- `diferido` con razon valida — la convencion no era destilable aun (cobertura insuficiente / conflicto activo / dependencia externa). La razon esta documentada.
- `agregado_en_etapa_posterior` — la convencion fue capturada despues de E0 (en E1, E2, E3 o E4) por experto que la detecto. Cada agregado debe tener responsable y fecha.

### Procedimiento

#### Paso 0 (condicional al MCP codebase-memory): re-indexado sugerido

Aplica solo cuando se cumplen las TRES condiciones siguientes:
- `work.modo` es `normal` (incl. legacy `evolucion`) (en `investigacion`/`documentacion` saltar este paso silenciosamente).
- El MCP `codebase-memory-mcp` esta disponible en la sesion (ver `agent-os/skills/codebase-memory/SKILL.md` seccion "Deteccion del MCP").
- Hubo edits en E3 (frontmatter `tareas[]` tiene al menos una tarea con `status: done` y bloque `## Ejecutor` con archivos modificados).

Si NO se cumplen las tres, saltar este paso sin anunciar nada al usuario.

Si SI se cumplen, Quinn anuncia:

```
A-Quinn: Antes de auditar standards y convenciones, advertencia sobre el grafo de
codigo indexado por codebase-memory-mcp.

E3 modifico {N} archivos en este work. El grafo esta stale: consultas estructurales
(busquedas semanticas, trace_path, query_graph) podrian dar falsos positivos o
negativos silenciosos. Si la auditoria depende de estas consultas, recomiendo
re-indexar antes (mode=moderate, ~30s tipicos).

Opciones:
(a) Re-indexar ahora antes de auditar.
(b) Auditar con grep/Read directo sin tocar el grafo (estado actual sin MCP).
(c) Confiar en el grafo stale (NO recomendado — riesgo de auditoria incorrecta).

Cual prefieres? (default: a si no respondes)
```

Decision del usuario:
- **(a) re-indexar:** Quinn invoca SKILL `codebase-memory` y ejecuta `index_repository(repo_path=<repo>, mode="moderate", persistence=false)`. Espera `index_status status="ready"`. Continua con paso 1.
- **(b) sin MCP:** Quinn registra en bitacora E4 entrada `[INFO] Re-indexado omitido. Auditoria sin MCP por decision del usuario.`. Continua con paso 1.
- **(c) confiar en grafo stale:** Quinn registra en bitacora E4 entrada `[OVERRIDE] Auditoria con grafo posiblemente stale. Riesgo asumido por el usuario. Razon: {razon que el usuario de}.`. Continua con paso 1.

Referencia: el standard que define cuando el grafo gana vs `Read`/`Grep` vive en `agent-os/standards/tooling/codebase-memory-mcp.md`.

1. **Leer `descubrimiento_producto.convenciones_a_destilar[]`** del README del work-record.
2. **Listar cada entrada con su `estado_destilado`**.
3. **Comparar contra las bitacoras E1/E2/E3** para detectar convenciones detectadas durante el work que NO quedaron registradas en `convenciones_a_destilar[]` (huerfanas — el experto las menciono pero no las anoto). Quinn las trae a la lista.
4. **Para cada convencion en estado `pendiente_destilar` (sin completar ni diferir explicitamente):**
   - Identificar al experto que la detecto (campo `detectado_por_experto` o por inferencia desde la bitacora).
   - Invocar al experto correspondiente para destilar via `[DT]` (capacidad `destilar-standard`) ANTES del cierre.
   - Si el experto que la detecto no esta disponible (ej. Sally no fue invitada a este work pero la convencion es UX), Quinn la destila ella misma o la diferie con razon explicita.
5. **Para cada convencion `diferida`:** Quinn evalua si la razon es valida.
   - Razones validas (acepta): cobertura insuficiente con evidencia (`solo aparece en 1 sitio`), conflicto activo no resuelto, dependencia externa no confirmada.
   - Razones no validas (rechaza y obliga destilar): "no me dio tiempo", "lo veremos despues", silencio.
6. **Para cada convencion `completada`:** Quinn verifica:
   - El archivo `agent-os/standards/{...}.md` existe.
   - El frontmatter tiene `creado_por_work` apuntando a este work.
   - Sitios canonicos referenciados en el archivo realmente existen en el codigo (grep rapido).

### Mensaje de Quinn al detectar convenciones huerfanas o pendientes

```
A-Quinn: AUDITORIA DE STANDARDS antes de cerrar.

Convenciones declaradas en E0: {N}
- Completadas: {N1} ({lista})
- Diferidas con razon valida: {N2} ({lista breve})
- Pendientes sin destilar: {N3} ({lista}) <- BLOQUEANTES

Convenciones detectadas durante el work pero no registradas en convenciones_a_destilar:
- {lista de huerfanas detectadas en bitacoras E1/E2/E3} <- BLOQUEANTES si las hay

Antes de cerrar, propongo:
- Para las pendientes y huerfanas: invitar al experto correspondiente para destilar
  via [DT]. Estimacion: ~{N} minutos por convencion.
- Para diferidas con razon dudosa: pedir al experto la justificacion concreta o
  destilar ahora.

¿Procedemos con destilado? Si prefieres aceptar el cierre con deuda de standards,
necesitas aprobar el override explicito (queda en bitacora como riesgo asumido).
```

### Decisiones posibles

| Caso | Accion |
|------|--------|
| Quinn invita expertos y todos destilan | Continuar al cierre normal. |
| Usuario aprueba destilar antes de cerrar | Quinn coordina con expertos via `[DT]`. Cuando todos completaron, continuar. |
| Usuario aprueba override (cerrar con deuda de standards) | Registrar override en bitacora E4: *"Cierre aprobado con {N} convenciones pendientes de destilar. Razon: {razon}. Riesgo asumido."* Las convenciones quedan en `convenciones_a_destilar[]` con `estado_destilado: pendiente_post_cierre`. El work cierra pero `/alfred maintain` puede listarlas para futuros works. |
| Quinn detecta huerfanas que el experto no destila | Si el experto se niega o no puede, Quinn las registra como `pendiente_post_cierre` con razon. No bloquea cierre — las convenciones huerfanas son auditoria, no bloqueo automatico (el bloqueo aplica a las declaradas en E0). |

### Compatibilidad con works legacy

Works iniciados antes de E0 enriquecida (sin bloque `descubrimiento_producto` en README) no tienen `convenciones_a_destilar[]` que auditar. Esta seccion no aplica. Quinn registra en bitacora: *"Work legacy sin descubrimiento de producto formal — auditoria de standards no aplica."*
