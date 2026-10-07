# Mantenimiento: Maintain (auditoría + migración + saneamiento)

> Gobierno de las acciones de mantenimiento de catálogos y works. Alfred porta el GOBIERNO (qué valida cada acción, lectura vs mutación, qué confirma con AskUserQuestion, formato de reporte). El MOTOR se invoca directamente: `git mv`, `git log`, `grep`, lectura/escritura de catálogos, subagentes (Agent tool). Alfred NO depende del cuerpo de `work-maintain.md` legacy.

## Frontera gobierno / motor

| Se porta (gobierno) | Se invoca (motor estable) |
|---|---|
| Qué verifica cada acción, lectura vs mutación, gates, AskUserQuestion por mutación, formato de reporte | `git mv` / `git log`, `grep`, lectura/escritura YAML de catálogos, subagentes Bob+Quinn (Agent) |

## Acciones de SOLO LECTURA (no mutan)

- `/alfred maintain audit` — escanea `agent-os/work-records/`: por carpeta verifica README.md, Estado válido, carpetas de etapa (reporta `fase-N/` legacy como "usar upgrade-structure"), CAs consolidados. Reporta totales por estado, sincronía del catálogo, works sin aprendizaje. NO muta.
- `/alfred maintain auditar-coherencia` — 7 chequeos de drift entre fuentes únicas. NO muta. Ver FUENTE abajo (no redefinir los 7 chequeos).
- `/alfred maintain audit-tareas {slug}` — audita en tareas `done`: `capa_seguridad.aplica: true` sin bloque `## Verificador` poblado, archivos huerfanos no permitidos, filtros opt-in faltantes en bugfix. Desde 2026-06-09 (works `normal`, incl. el flujo `rediseno-ui`): detecta tareas `done` con `evidencia_requerida.{api|ui|bd}: true` (sin entrada en `descartes[]`) cuyo artefacto NO existe en `etapa-4/evidencia/{eje}/` y sin `[OVERRIDE]` en `etapa-4/bitacora.md` — brecha bloqueante de cierre. NO muta.

  > Desde el corte runtime-cuerpo (2026-06-17): los checks "done sin bloque Ejecutor"
  > y "bullets con timestamp" se eliminan de audit-tareas — el estado es **irrepresentable**
  > porque `work tarea ejecutor` es la unica via de escribir el bloque + marcar done y
  > rechaza timestamps en write-time. audit-tareas conserva: `capa_seguridad.aplica` sin
  > `## Verificador`, archivos huerfanos no permitidos, y filtros opt-in faltantes.

- `/alfred maintain plantillas` — barrido de curaduria de la ruta documentacion (capacidad `CP` de Paige, modo `barrido`). Reporta el catalogo unido (zona, forma, version), las sombras (con U4), las plantillas invalidas y las vias rotas, las candidatas S1-S4 y U1-U4, y los documentos hechos con una version anterior de su plantilla (candidatos a re-plantillado). NO muta en esta fase.

## Acciones que MUTAN (cada una confirma con AskUserQuestion antes de escribir)

> **Precondiciones antes de invocar directo.** `archivar` exige que el work esté en estado terminal con sus grupos bridge en `archivado` y `meta_revisiones[]` consistente — las valida `piezas/cierre.md` paso 1 (validaciones previas) y la operación atómica vive en la FUENTE de abajo. Si se invoca `/alfred maintain archivar` fuera del flujo de cierre, Alfred confirma esas precondiciones con AskUserQuestion antes de mover nada. Las demás acciones mutantes no tienen precondiciones de estado del work; solo confirman su mutación específica.

- `/alfred maintain rebuild-catalogo` — **RETIRADO** (desde 2026-07-08). El catálogo ya no es un archivo persistido: es una vista derivada en memoria que el runtime reconstruye en cada lectura (`agentos catalog show`, loader `cargarFresco`). No existe catálogo físico que reconstruir ni red de seguridad de escritura incremental que respaldar — la lectura ya cumple ese rol.
- `/alfred maintain migrate` — migra works de `.documentacion/11-registros-trabajo/` a `work-records/`. Preserva originales con `_MIGRADO.md`. Estado destino `MIGRADO`.
- `/alfred maintain archivar [--dry-run] [{slug}]` — mueve works **terminales** de `work-records/` a `works-archivo/{AAAA}/{MM}/{autor-kebab}/`. **Lo ejecuta el binario:** `agentos maintain archivar [--dry-run] [--slug {slug}]` (mover atómico de la carpeta, por work; `--dry-run` reporta el plan sin tocar). El catálogo no se muta -- se deriva en memoria del README en la siguiente lectura (ya sea desde `work-records/` o `works-archivo/`). El binario valida solo estado terminal y puebla `fecha_fin` si falta; **no** cambia el estado ni reescribe referencias. La **reescritura de referencias vivas** en `docs/`/`agent-os/` (si se desea) es un paso cognitivo posterior de Alfred (`grep` de los paths del work), fuera del binario. Ver `gestion/archivar-lote.md` y la FUENTE para la operación atómica.
- `/alfred maintain cleanup` — detecta artefactos huérfanos (`nul`, carpetas vacías, `.tmp`/`.bak`, markdown 0 bytes, duplicados). AskUserQuestion por problema.
- `/alfred maintain upgrade-structure` — renombra `fase-N/` → `etapa-N/` y encabezados "Fase N:" → "Etapa N:". NO toca contenido de decisiones/hallazgos.
- `/alfred maintain upgrade-cas` — consolida CAs dispersos (`etapa-1/experto-*.md`) en `etapa-1/cas-consolidados.md`. Subagente Bob (IDs globales, dedup, agrupación) + subagente Quinn (prerequisitos, cadenas críticas).
- `/alfred maintain upgrade-tareas` — remapea IDs de CAs legacy (CA-ARC-, CA-BIZ-, …) a IDs globales en `etapa-2/tareas/` usando `cas-consolidados.md` como tabla. IDs huérfanos se reportan, no se reemplazan.
- `/alfred maintain rebuild-consumers` — reconstruye reverse-links `consumidores[]` desde `insumos_origen[]` declarados (idempotente). Reporta insumos huérfanos.
- `/alfred maintain evaluar-experto {slug}` — corre una iteración del learning loop de expertos (gate estático de cobertura) sobre el experto `{slug}`. Conducido por `mantenimiento/evaluar-experto.md`. Nebulosa-only; el paso propuesta→aprobada es el GATE DEL DIRECTOR (nunca [AUTO]), no AskUserQuestion generico.
- `/alfred maintain plantillas` (tras el reporte de lectura) — ofrece las acciones de la capacidad `CP` (crear, actualizar, adoptar, sombrear, normalizar, consolidar un generador, crear una via), una `AskUserQuestion` por candidata, y registra cada decision en `agent-os/plantillas/documentacion/_curaduria.md`. Un re-plantillado no se ejecuta aqui: se ofrece abrirlo con `/alfred` (ruta documentacion, variante re-plantillado).

## auditar-coherencia — los 7 chequeos

Detecta drift entre fuentes únicas. De SOLO LECTURA. Los 7 chequeos (señales de drift, tabla anfitriones, estados del work, campos de frontmatter, expertos fantasma, estados de grupo bridge, marcadores FUENTE rotos) NO se redefinen aquí — cada uno se valida contra el artefacto vivo que lo declara. Ejecutar antes de cerrar works que tocan el núcleo y mensualmente.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift". Chequeo de senales de drift. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/host-protocol/etapas/README.md seccion "Tabla maestra — Anfitriones por etapa y modo". Chequeo de tabla de anfitriones. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Catalogos de work-records". Schema de catalogos y operacion atomica de archivado. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Estados terminales que archivar selecciona; chequeo de estados del work y campos de frontmatter. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/experts/bmad-agent-paige/references/curar-plantillas.md seccion "Modos de invocacion". Procedimiento de /alfred maintain plantillas (senales, acciones, registro). NO duplicar -- editar la fuente. -->
