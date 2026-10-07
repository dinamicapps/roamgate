#!/bin/bash
# Hook: SessionStart — regimen de gobierno Alfred (puerta unica de conversacion).
#
# Resuelve el estado del gobierno en dos niveles (multi-instancia-safe):
#   1. Politica del repo: alfred.gobierno en .claude/agent-os.local.json (default true).
#   2. Override de sesion: marcador .claude/agent-os-sesiones/gobierno-{session8}.off
#      (GANA sobre el config; session8 = primeros 8 chars del session_id).
# Inyecta el regimen al contexto, incluyendo el session8 para que la cognicion
# pueda gestionar el marcador de SU sesion (/alfred gobierno on|off).
#
# POSIX puro (sin jq), fail-silent, exit 0 siempre.

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null

SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
S8=$(printf '%s' "$SESSION_ID" | cut -c1-8)

MARK_DIR=".claude/agent-os-sesiones"

# Poda de marcadores viejos (>7 dias). Un marcador huerfano nunca afecta a otra
# sesion (session_id unico); esto solo evita acumulacion. Fail-silent.
if [ -d "$MARK_DIR" ]; then
  find "$MARK_DIR" -name 'gobierno-*.off' -mtime +7 -delete 2>/dev/null
fi

# Nivel 1 — politica del repo (ausencia de archivo/clave = true).
GOBIERNO="true"
CFG=".claude/agent-os.local.json"
if [ -f "$CFG" ]; then
  if grep -o '"gobierno"[[:space:]]*:[[:space:]]*false' "$CFG" >/dev/null 2>&1; then
    GOBIERNO="false"
  fi
fi
ORIGEN="repo"

# Nivel 2 — override de sesion (gana sobre config).
if [ -n "$S8" ] && [ -f "$MARK_DIR/gobierno-${S8}.off" ]; then
  GOBIERNO="false"
  ORIGEN="sesion"
fi

# Gate por trabajo activo (solo variante activa): tras un compact/clear a mitad de
# un work/diseño, el archivo de sesion preservado trae el trabajo en curso y el
# regimen no se re-inyecta. Las lineas de "cancelado" no se gatean.
SF="agent-os/work-records/_sesiones/${SESSION_ID}.yml"
TRABAJO_ACTIVO="false"
if [ -n "$SESSION_ID" ] && [ -f "$SF" ]; then
  campo_sesion() {
    sed -n "s/^$1:[[:space:]]*\(.*\)\$/\1/p" "$SF" | head -n1 | tr -d '\r' | sed "s/[[:space:]]*\$//; s/^[\"']//; s/[\"']\$//"
  }
  for c in work_slug rol diseno_slug; do
    v=$(campo_sesion "$c")
    if [ -n "$v" ] && [ "$v" != "null" ]; then
      TRABAJO_ACTIVO="true"
      break
    fi
  done
fi

if [ "$GOBIERNO" = "true" ] && [ "$TRABAJO_ACTIVO" = "true" ]; then
  exit 0
fi

if [ "$GOBIERNO" = "true" ]; then
  cat <<CTX
[agent-os] Gobierno Alfred ACTIVO en este repo (sesion: ${S8:-desconocida}): toda peticion
de trabajo del usuario se canaliza via /alfred (abordaje -> ruta -> piezas). No trabajes por
fuera del flujo: si el usuario pide codigo/analisis/fix directo, conducelo por /alfred.
Para cancelar el gobierno: "/alfred gobierno off" (solo esta sesion) o
"/alfred gobierno off definitivo" (todo el repo).
CTX
else
  if [ "$ORIGEN" = "sesion" ]; then
    echo "[agent-os] Gobierno Alfred cancelado (nivel: sesion; sesion: ${S8:-desconocida}). Reactivar: /alfred gobierno on (esta sesion) | /alfred gobierno on definitivo (repo)."
  else
    echo "[agent-os] Gobierno Alfred cancelado (nivel: repo; sesion: ${S8:-desconocida}). Reactivar: /alfred gobierno on definitivo (repo)."
  fi
fi

exit 0
