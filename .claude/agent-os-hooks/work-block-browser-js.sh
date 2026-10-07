#!/bin/bash
# Hook: Bloquear ejecucion de JavaScript en browser desde el agente principal
# cuando la sesion orquesta un work activo Y el agente principal actua como
# GOBERNADOR. Cuando el agente principal encarna a un anfitrion (rol: anfitrion,
# ej. Quinn/Tessa conduciendo verificacion E4), la ejecucion es legitima y se
# permite. Los subagentes (Tessa E2E) SI pueden ejecutar JS en browser — bypass
# via agent_id.
#
# La deteccion de work activo y de rol es un ESPEJO del bloque de
# work-block-direct-edits.sh (session_id -> agent-os/work-records/_sesiones/{id}.yml,
# strip_comillas, gate repo_maneja_works, degradacion fail-open). Los hooks no
# comparten libreria; si cambias la deteccion de rol, cambia AMBOS.
#
# NO escanea READMEs: en repos con cientos de works un `grep -r` por invocacion
# es lento y, combinado con stdin colgado, contribuye al cuelgue de la interfaz.
#
# Lectura de stdin con timeout: ver nota en work-block-direct-edits.sh. `cat`
# colgado sin EOF congela la interfaz de Claude Code; `read -t 10` lo acota.
#
# Diseno POSIX puro (sin jq).

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null
# Sin payload (timeout o stdin vacio) -> nada que evaluar, permitir.
[ -z "$INPUT" ] && exit 0

# Quitar comillas envolventes de un valor YAML: `rol: anfitrion` y
# `rol: "anfitrion"` son el mismo valor. El sed captura `\(.*\)` crudo. Strip
# via expansion de parametro (POSIX), coherente con los demas hooks de sesion.
strip_comillas() {
  local v="$1"
  v="${v%\"}"; v="${v#\"}"
  v="${v%\'}"; v="${v#\'}"
  echo "$v"
}

# Extraer tool_name del payload (sin jq).
TOOL=$(echo "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)

# Solo aplica a las herramientas de ejecucion de JS arbitrario en browser.
# grep -E (no comparacion exacta) para tolerar el prefijo de plugin
# (mcp__plugin_playwright_playwright__...) y la variante _unsafe, coherente
# con el matcher del registro en .claude/settings.json.
if ! echo "$TOOL" | grep -qE '^mcp__.*playwright.*__browser_(evaluate|run_code(_unsafe)?)$'; then
  exit 0
fi

# Bypass subagente: presencia de "agent_id":"<value>" en el JSON.
if echo "$INPUT" | grep -qE '"agent_id"[[:space:]]*:[[:space:]]*"[^"]+"'; then
  exit 0
fi

# Detectar work activo y rol via archivo de sesion (1 archivo, no grep -r sobre N READMEs).
SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
SESSION_FILE="agent-os/work-records/_sesiones/${SESSION_ID}.yml"
# Sin session_id o sin archivo de sesion -> permitir (degradacion segura).
if [ -z "$SESSION_ID" ] || [ ! -f "$SESSION_FILE" ]; then
  exit 0
fi
REPO_MANEJA_WORKS=$(strip_comillas "$(sed -n 's/^repo_maneja_works:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
WORK_SLUG=$(strip_comillas "$(sed -n 's/^work_slug:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
ROL=$(strip_comillas "$(sed -n 's/^rol:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")

# Repo que no maneja works -> la restriccion no aplica.
if [ "$REPO_MANEJA_WORKS" != "true" ]; then
  exit 0
fi

# La sesion no orquesta ningun work -> no aplica la restriccion.
if [ -z "$WORK_SLUG" ] || [ "$WORK_SLUG" = "null" ]; then
  exit 0
fi

# Sin rol definido -> permitir (fail-open, politica declarada del sistema).
if [ -z "$ROL" ] || [ "$ROL" = "null" ]; then
  exit 0
fi

# Anfitrion asumido (ej. Quinn/Tessa conduciendo verificacion E4) -> ejecucion
# legitima, se permite.
if [ "$ROL" = "anfitrion" ]; then
  exit 0
fi

# A partir de aqui: rol = gobernador con un work activo. Bloquear.
echo "BLOQUEADO: Work no puede ejecutar JavaScript en browser. Delega a Tessa (E2E) como subagente. Ver Regla Anti-Manipulacion en agent-os/skills/host-protocol/SKILL.md seccion 'Alcance de edicion durante un work activo'." >&2
exit 2
