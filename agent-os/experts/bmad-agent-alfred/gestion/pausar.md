# /alfred pausar "razon"

1. **Cambiar el estado (runtime):** invocar `agentos work transition --slug <slug> --a PAUSADO` (ver `gestion/transition.md`: detectar binario, parsear `{ok,data}`, detenerse si `ok:false`). El binario valida que el origen sea `EN_PROGRESO`, setea el estado en el README y emite el heartbeat; el catalogo no se escribe (se deriva en memoria del README en la siguiente lectura).
2. **Registrar lo cognitivo (Alfred):** anotar la razon de la pausa en `## Pausas` del README. Liberar el rol de sesion: escribir `work_slug: null`, `rol: null`, `anfitrion: null` en `_sesiones/{session_id}.yml` (refrescar `actualizado`; la misma liberacion que `/alfred cancelar`). Aplica SIEMPRE que la pausa deja la sesion sin trabajo activo (el work quedara esperando a otra sesion o a otro dia). NO aplica solo si la pausa es momentanea dentro de la misma sesion (se retomara de inmediato y el rol se conserva para evitar que otra sesion tome el work a medias).

<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion". Esquema de `_sesiones/{session_id}.yml` y liberacion del rol de sesion. NO duplicar -- editar la fuente. -->
