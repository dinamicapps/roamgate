# Archivar en lote via runtime (maintain archivar)

El archivado en lote de works **terminales** que quedaron en `work-records/` (cerrados a mano, legacy, o archivado que fallo) lo ejecuta el binario, no se hace con `git mv` ni edicion de catalogos a mano. Reusa los pasos 2-4 del cierre (mover atomico + ambos catalogos), pero NO cambia el estado (los works ya son terminales). Patron de invocacion:

1. **Detectar el binario:** igual que en `gestion/cerrar.md`. Si no existe, informar y no archivar.
2. **Mostrar el plan primero:** `agentos maintain archivar --dry-run` (o `--slug <slug>` para uno) reporta `{plan:[{slug,estado,ruta_destino}], omitidos, total}` sin tocar nada. Alfred presenta el plan y confirma con AskUserQuestion (accion mutante).
3. **Ejecutar:** `agentos maintain archivar` (o `--slug <slug>`). El catalogo es un derivado en memoria: `maintain archivar` lo reconstruye en cada corrida, no hay catalogo fisico que reparar. Parsear `{ok,data}`: si `ok:true`, `data.archivados[]` y `data.omitidos[]` resumen el resultado.

El binario valida **solo estado terminal** (`maquina.EsTerminal`); los no-terminales caen en `omitidos`. Las precondiciones de cierre (grupos bridge en `archivado`, `meta_revisiones[]` consistente) las confirma Alfred antes de invocar — ver `mantenimiento/maintain.md`. Si un work terminal no tiene `fecha_fin`, el binario la puebla con la fecha actual antes de mover. La **reescritura de referencias vivas** en `docs/`/`agent-os/` (si se desea) es un paso cognitivo posterior de Alfred (`grep` de los paths del work), fuera del binario.

<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Catalogos de work-records". La operacion atomica de archivado (pasos 2-4) la ejecuta el binario (el runtime, verbo maintain archivar). Aqui solo se documenta como Alfred invoca el verbo. NO duplicar -- editar la fuente. -->
