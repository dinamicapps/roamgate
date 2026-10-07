#!/bin/bash
# Hook: SessionStart — mantiene el archivo de control de sesion de Claude Code.
#
# Crea/refresca agent-os/work-records/_sesiones/{session_id}.yml para la sesion
# que arranca, y delega al binario del runtime ("session gc") la purga de
# sesiones cuyo mtime supere 48 horas (red de seguridad para sesiones cuyo
# SessionEnd no disparo: crash, cierre brutal). Sin binario, no purga (best-effort).
#
# El esquema del archivo de sesion es fuente unica en
# agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion".
# La politica de que rol puede editar que vive en
# agent-os/skills/host-protocol/SKILL.md seccion "Alcance de edicion durante un work activo".
#
# Diseno POSIX puro (sin jq): grep + sed. Razon: jq no esta garantizado en Git
# Bash bajo Windows. Coherente con los hooks work-block-*.

# Lectura de stdin con timeout: `cat` se cuelga si el harness deja stdin abierto
# sin EOF (observado en Cygwin/Windows), congelando la interfaz. `read -t 10`
# lo acota; sin payload el hook sale limpio (exit 0).
INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null

# Quitar comillas envolventes de un valor YAML. En YAML real `rol: anfitrion` y
# `rol: "anfitrion"` son el MISMO valor. Como este hook RE-ESCRIBE el archivo en
# source=compact|clear (preserva work_slug/rol/anfitrion del archivo previo), sin
# este strip un valor que entro con comillas se propagaria con comillas y rompria
# la comparacion del hook de bloqueo. Strip via expansion de parametro (POSIX).
strip_comillas() {
  local v="$1"
  v="${v%\"}"; v="${v#\"}"   # comillas dobles envolventes
  v="${v%\'}"; v="${v#\'}"   # comillas simples envolventes
  echo "$v"
}

# --- Extraer campos del payload JSON via sed (tolerante a espacios y orden de claves) ---
SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
SOURCE=$(echo "$INPUT" | sed -n 's/.*"source"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)

# Sin session_id no hay nada que registrar — salir limpio (no es error).
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

SESIONES_DIR="agent-os/work-records/_sesiones"
SESSION_FILE="$SESIONES_DIR/${SESSION_ID}.yml"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# --- Deteccion del binario del runtime (compartida: purga de sesiones + heartbeat) ---
# Fail-silent: repos no migrados (sin binario) no purgan ni emiten por este medio.
AGENTOS_BIN=""
if [ -f ".claude/agent-os-bin/agentos.exe" ]; then
  AGENTOS_BIN=".claude/agent-os-bin/agentos.exe"
elif [ -f ".claude/agent-os-bin/agentos" ]; then
  AGENTOS_BIN=".claude/agent-os-bin/agentos"
fi

# --- Purga de sesiones rancias (mtime > 48h) via runtime ---
# Delegada al binario ("session gc"); sin duplicar aqui la logica bash de purga.
# Best-effort: si no hay binario, no se purga por este medio.
if [ -n "$AGENTOS_BIN" ]; then
  "$AGENTOS_BIN" session gc >/dev/null 2>&1 &

  # Purga del feed de actividad. Mismo perfil que el `session gc` de arriba: en
  # segundo plano y best-effort -- nada depende de ella, y fallar no debe
  # costarle nada al arranque de la sesion. Es OTRA purga: `session gc` limpia
  # _sesiones/*.yml por mtime de 48h; esta limpia agent-os/.actividad/ por la
  # fecha del NOMBRE, a 7 dias.
  "$AGENTOS_BIN" actividad purgar >/dev/null 2>&1 &
fi

# --- Deteccion de repo_maneja_works ---
# El repo maneja works si existe agent-os/work-records/ con al menos una carpeta
# de work (excluir el propio _sesiones/ y archivos sueltos _*.yml).
REPO_MANEJA_WORKS="false"
if [ -d "agent-os/work-records" ]; then
  for d in agent-os/work-records/*/; do
    [ -e "$d" ] || continue
    base=$(basename "$d")
    # Saltar el directorio de control y cualquier carpeta auxiliar con prefijo _.
    case "$base" in
      _*) continue ;;
    esac
    if [ -f "${d}README.md" ]; then
      REPO_MANEJA_WORKS="true"
      break
    fi
  done
fi

# --- source compact/clear: misma sesion, no una nueva ---
# Si el archivo ya existe y la sesion solo se compacto o limpio, preservar
# work_slug/rol/anfitrion y refrescar unicamente actualizado + repo_maneja_works.
if [ -f "$SESSION_FILE" ] && { [ "$SOURCE" = "compact" ] || [ "$SOURCE" = "clear" ]; }; then
  WORK_SLUG=$(strip_comillas "$(sed -n 's/^work_slug:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
  ROL=$(strip_comillas "$(sed -n 's/^rol:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
  ANFITRION=$(strip_comillas "$(sed -n 's/^anfitrion:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
  DISENO_SLUG=$(strip_comillas "$(sed -n 's/^diseno_slug:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
else
  # Sesion nueva (startup/resume) o archivo inexistente: estado base.
  WORK_SLUG="null"
  ROL="null"
  ANFITRION="null"
  DISENO_SLUG="null"
fi

# Defensa: si algun campo quedo vacio tras el parseo, normalizar a null.
[ -z "$WORK_SLUG" ] && WORK_SLUG="null"
[ -z "$ROL" ] && ROL="null"
[ -z "$ANFITRION" ] && ANFITRION="null"
[ -z "$DISENO_SLUG" ] && DISENO_SLUG="null"

# --- Escribir el archivo de sesion ---
mkdir -p "$SESIONES_DIR"
cat > "$SESSION_FILE" <<YAML
session_id: "$SESSION_ID"
repo_maneja_works: $REPO_MANEJA_WORKS
work_slug: $WORK_SLUG
rol: $ROL
anfitrion: $ANFITRION
diseno_slug: $DISENO_SLUG
proveedor_ia: "claude"
actualizado: "$NOW"
YAML

# --- Heartbeat de sesion (telemetria, spec 8) ---
# Si el binario del runtime esta presente (deteccion arriba), emite el evento
# "sesion" en background. Fail-silent: no bloquea el arranque ni rompe el hook;
# repos no migrados (sin binario) no emiten. URL/zapikey van horneadas en el
# binario, no en este script.
if [ -n "$AGENTOS_BIN" ]; then
  "$AGENTOS_BIN" heartbeat emit >/dev/null 2>&1 &
fi

# --- Contexto de invocacion del runtime: el stdout de SessionStart llega al modelo ---
if [ -n "$AGENTOS_BIN" ]; then
  echo "Runtime agent-os: invoca '$AGENTOS_BIN' (no esta en PATH). Contratos de verbos: '$AGENTOS_BIN help <dominio> <verbo>'."

  # Susurro de entorno: ancla el instante de arranque y anuncia el verbo que lo
  # refresca. Sin esto el modelo no sabe hora, zona ni pais (el harness solo le
  # da la fecha). Parseo con sed, sin jq (norma de los hooks). Best-effort: si
  # el verbo falla o no existe, no se emite nada y el arranque sigue igual.
  ENTORNO_JSON=$("$AGENTOS_BIN" session entorno 2>/dev/null)
  if [ -n "$ENTORNO_JSON" ]; then
    E_DIA=$(echo "$ENTORNO_JSON" | sed -n 's/.*"dia_semana"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    E_FECHA=$(echo "$ENTORNO_JSON" | sed -n 's/.*"fecha"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    E_HORA=$(echo "$ENTORNO_JSON" | sed -n 's/.*"hora_local"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    E_OFF=$(echo "$ENTORNO_JSON" | sed -n 's/.*"offset_utc"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    E_ZONA=$(echo "$ENTORNO_JSON" | sed -n 's/.*"zona_horaria"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    E_PAIS=$(echo "$ENTORNO_JSON" | sed -n 's/.*"pais"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

    if [ -n "$E_FECHA" ] && [ -n "$E_HORA" ]; then
      if [ -n "$E_ZONA" ] && [ -n "$E_PAIS" ]; then
        E_LUGAR=" ($E_ZONA, $E_PAIS)"
      else
        E_LUGAR=" (lugar sin declarar: corre /agent-os-doctor para fijar zona horaria y pais)"
      fi
      echo "Contexto de entorno: $E_DIA $E_FECHA $E_HORA $E_OFF$E_LUGAR."
      echo "Es la hora del ARRANQUE de la sesion, no la actual: para la hora exacta re-invoca '$AGENTOS_BIN session entorno'."
    fi
  fi
fi

exit 0
