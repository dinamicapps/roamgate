#!/bin/bash
# Hook: SessionEnd — elimina el archivo de control de la sesion que termina.
#
# Es el camino limpio de purga. La red de seguridad para sesiones cuyo SessionEnd
# no disparo (crash, cierre brutal) es la purga >48h en session-control-start.sh.
#
# El esquema del archivo de sesion es fuente unica en
# agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion".
#
# Diseno POSIX puro (sin jq), coherente con los demas hooks de .claude/agent-os-hooks/.

# Lectura de stdin con timeout: `cat` se cuelga si el harness deja stdin abierto
# sin EOF (observado en Cygwin/Windows), congelando la interfaz. `read -t 10`
# lo acota; sin payload el hook sale limpio (exit 0).
INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null

# Extraer session_id del payload JSON via sed.
SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)

# Sin session_id no hay archivo que borrar — salir limpio.
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

SESSION_FILE="agent-os/work-records/_sesiones/${SESSION_ID}.yml"

# rm -f: no falla si el archivo no existe (ej. repo sin works, o ya purgado).
rm -f "$SESSION_FILE"

exit 0
