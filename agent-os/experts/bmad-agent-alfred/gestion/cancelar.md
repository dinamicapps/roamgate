# /alfred cancelar "razon"

Cancela formalmente un work activo: lo lleva a estado terminal `CANCELADO` y lo archiva. Distinto de `pausar` (que deja el work retomable): cancelar es **irreversible** — no se retoma con `/alfred continuar`.

Pasos:

1. Buscar work `EN_PROGRESO` o `PAUSADO`. Si no hay: informar y terminar.
2. Si no se da razon: AskUserQuestion con opciones "Ya no se necesita" / "Reemplazado" / "Bloqueado indefinidamente" / (otra).
3. **Confirmar** via AskUserQuestion (accion irreversible — no se puede retomar). Si no confirma: terminar sin tocar nada.
4. Si confirma:
   a. Actualizar README seccion "Decisiones clave" con la razon. (El `Estado: CANCELADO` y `cerrado_en` los escribe la operacion atomica del paso b.)
   b. **Archivar el work (runtime):** invocar `agentos work close --slug <slug> --estado CANCELADO` (ver `gestion/cerrar.md`). El binario escribe `CANCELADO` + `fecha_fin` y mueve la carpeta a `works-archivo/`; el catalogo no se escribe (se deriva en memoria en la siguiente lectura). CANCELADO no exige grupos bridge archivados.
   c. Registrar en bitacora de la pieza actual (`S-sistema:` — Alfred gobierna esta transicion terminal): fecha, razon, pieza al cancelar.
   d. `TaskUpdate`: todas las tareas pendientes -> `cancelled`.
   e. **Liberar el rol de sesion:** escribir `work_slug: null`, `rol: null`, `anfitrion: null` en `_sesiones/{session_id}.yml` (refrescar `actualizado`). Ver FUENTE.

<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Catalogos de work-records" -> "Cierre / archivado". Operacion atomica de archivado ejecutada por 'agentos work close' (la misma que usa cierre.md para COMPLETADO). NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Estado terminal CANCELADO. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion". Liberacion del rol de sesion. NO duplicar -- editar la fuente. -->
