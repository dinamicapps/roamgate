# /alfred history [término | --modulo X | --reciente [N] | --todo]

Consulta histórica de works en ambos catálogos (activos + archivo). Lee índices; abre README solo bajo demanda.

Pasos:
1. Parsear modo: `--modulo` → por módulo; `--reciente [N]` (default 5) → listado reciente; `--todo` → todos; otro → búsqueda por archivo/término libre.
2. Invocar `agentos catalog show --todo`; parsear `{ok,data}` (si `ok:false`, mostrar `error.mensaje` y detenerse) y usar `data.activo` + `data.archivo`.
3. Buscar coincidencias según modo:
   - Por archivo/término: recorrer entries, buscar en `archivos_tocados` (parcial, case-insensitive). Works activos con `archivos_tocados` vacío: abrir README sección "Archivos modificados".
   - Por módulo: filtrar `archivos_tocados` por prefijo de módulo o ruta.
   - Reciente/todo: ordenar desc por `cerrado_en` (archivo) / `ultima_actividad` (activos).
4. Presentar tabla según modo (historial por archivo / por módulo / listado reciente).
5. Detalle bajo demanda: abrir README del work elegido (objetivo, decisiones clave, archivos, hallazgos).

<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Catalogos de work-records". Campos archivos_tocados, cerrado_en, ultima_actividad. NO duplicar -- editar la fuente. -->
