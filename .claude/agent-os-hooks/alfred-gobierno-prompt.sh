#!/bin/bash
# Hook: UserPromptSubmit — recordatorio corto del gobierno Alfred por prompt.
#
# Mismo calculo de estado que alfred-gobierno-start.sh (config por-repo +
# marcador por-sesion). Calla cuando: gobierno cancelado, prompt vacio, o el
# prompt ya empieza con "/" (un comando es explicito y no necesita reorientacion).
#
# POSIX puro (sin jq), fail-silent, exit 0 siempre.

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null

# Primer tramo del prompt (hasta la primera comilla): suficiente para decidir
# si empieza con "/". No se necesita el prompt completo.
PROMPT_INICIO=$(echo "$INPUT" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\([^"]*\).*/\1/p' | head -n1)
case "$PROMPT_INICIO" in
  "")  exit 0 ;;
  /*)  exit 0 ;;
esac

SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
S8=$(printf '%s' "$SESSION_ID" | cut -c1-8)

GOBIERNO="true"
CFG=".claude/agent-os.local.json"
if [ -f "$CFG" ]; then
  if grep -o '"gobierno"[[:space:]]*:[[:space:]]*false' "$CFG" >/dev/null 2>&1; then
    GOBIERNO="false"
  fi
fi
if [ -n "$S8" ] && [ -f ".claude/agent-os-sesiones/gobierno-${S8}.off" ]; then
  GOBIERNO="false"
fi

# Gate por trabajo activo: si ESTA sesion conduce un work o un diseño, el gobierno
# calla — los mensajes en prosa pertenecen al hilo del anfitrion del trabajo
# (incluida la consulta directa a un experto). Fallback: sin archivo de sesion o
# campos ilegibles, el recordatorio se emite (fail hacia el gobierno).
SF="agent-os/work-records/_sesiones/${SESSION_ID}.yml"
if [ "$GOBIERNO" = "true" ] && [ -n "$SESSION_ID" ] && [ -f "$SF" ]; then
  campo_sesion() {
    sed -n "s/^$1:[[:space:]]*\(.*\)\$/\1/p" "$SF" | head -n1 | tr -d '\r' | sed "s/[[:space:]]*\$//; s/^[\"']//; s/[\"']\$//"
  }
  for c in work_slug rol diseno_slug; do
    v=$(campo_sesion "$c")
    if [ -n "$v" ] && [ "$v" != "null" ]; then
      exit 0
    fi
  done
fi

if [ "$GOBIERNO" = "true" ]; then
  cat <<'CTX'
[agent-os] Gobierno Alfred activo: canaliza esta peticion via /alfred salvo que sea
conversacion trivial o el usuario este gestionando el propio gobierno.
CTX
fi

exit 0
