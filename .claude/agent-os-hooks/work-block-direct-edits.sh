#!/bin/bash
# Hook: Bloquear Edit/Write sobre CODIGO del sistema cuando el agente principal
# actua como GOBERNADOR de un work activo.
#
# La decision se basa en el ARCHIVO DE CONTROL POR SESION
# (agent-os/work-records/_sesiones/{session_id}.yml), NO en escanear READMEs.
# Escanear READMEs confundia "existe un work EN_PROGRESO en disco" con "esta
# sesion lo orquesta" — bloqueaba toda sesion del repo aunque no tuviera relacion.
#
# Politica (fuente unica): agent-os/skills/host-protocol/SKILL.md seccion
# "Alcance de edicion durante un work activo". Esquema del archivo de sesion:
# agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion".
#
# Quien SI edita codigo: subagentes reales (bypass agent_id) y el agente principal
# cuando encarna a un anfitrion (rol: anfitrion). Quien NO: el agente principal
# como gobernador (rol: gobernador) — debe delegar a un subagente o al anfitrion.
#
# Diseno POSIX puro (sin jq): grep + sed + case. jq no esta garantizado en Git
# Bash bajo Windows.
#
# Lectura de stdin con timeout: `cat` se cuelga indefinidamente si el harness
# deja stdin abierto sin enviar EOF (problema observado en Cygwin/Windows). Eso
# congela la interfaz de Claude Code. `read -t 10` acota la espera: si en 10s no
# llega payload, INPUT queda vacio y el hook sale limpio (exit 0 = permitir).

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null
# Sin payload (timeout o stdin vacio) -> no hay nada que evaluar, permitir.
[ -z "$INPUT" ] && exit 0

# Guard de canal del ledger de pruebas (Fase 2 modelo de pruebas): el libro-mayor
# maquina prueba<->work lo escribe SOLO el verbo 'agentos pruebas anotar' (por
# syscall, no por el tool Edit — este bloqueo no afecta al verbo). NADIE lo edita
# a mano: va ANTES de los bypass de subagente/rol para que ni un subagente ni un
# anfitrion lo toquen con Edit/Write.
FILE_PATH_LEDGER=$(echo "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
# Colapsar backslash JSON-escapado (\\ = dos bytes 0x5c en el stdin crudo,
# como envia Claude Code para paths absolutos Windows) a un slash ANTES del
# tr por-caracter, que de lo contrario produce dobles slashes (E://a//b) que
# no matchean el case de abajo. tr final normaliza a minuscula: el FS de
# Windows es case-insensitive, asi que Agent-OS/Pruebas/Ledger.md es el mismo
# archivo fisico y debe bloquearse igual.
FILE_PATH_LEDGER=$(echo "$FILE_PATH_LEDGER" | sed 's/\\\\/\//g' | tr '\\' '/' | tr 'A-Z' 'a-z')
case "$FILE_PATH_LEDGER" in
  agent-os/pruebas/ledger.md|*/agent-os/pruebas/ledger.md)
    echo "BLOQUEADO: agent-os/pruebas/ledger.md es libro-mayor del runtime (prueba<->work)." >&2
    echo "Escribelo con 'agentos pruebas anotar' (creada|modificada|retirada), no con Edit/Write." >&2
    exit 2 ;;
esac

# 1) Bypass subagente: si Claude Code envia agent_id en el payload, el llamante
#    es un subagente real lanzado via Agent/Task tool. Documentado en
#    https://code.claude.com/docs/en/hooks. Detectamos la clave con valor no vacio.
if echo "$INPUT" | grep -qE '"agent_id"[[:space:]]*:[[:space:]]*"[^"]+"'; then
  exit 0
fi

# 2) Leer el archivo de control de la sesion actual.
SESSION_ID=$(echo "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
SESSION_FILE="agent-os/work-records/_sesiones/${SESSION_ID}.yml"

# Degradacion segura: sin session_id o sin archivo de sesion, PERMITIR.
# Un falso permiso es preferible a un falso bloqueo — el work-record y los
# commits dejan rastro auditable; un bloqueo espurio solo frustra.
if [ -z "$SESSION_ID" ] || [ ! -f "$SESSION_FILE" ]; then
  exit 0
fi

# Quitar comillas envolventes de un valor YAML. En YAML real `rol: anfitrion` y
# `rol: "anfitrion"` son el MISMO valor; el sed de extraccion captura `\(.*\)`
# crudo (comillas incluidas), asi que un humano que edite el archivo a mano y
# escriba `rol: "anfitrion"` rompia la comparacion `[ "$ROL" = "anfitrion" ]` y
# era tratado como gobernador -> bloqueo espurio de codigo. Strip via expansion
# de parametro (POSIX puro): solo remueve la comilla si esta en ambos extremos.
strip_comillas() {
  local v="$1"
  v="${v%\"}"; v="${v#\"}"   # comillas dobles envolventes
  v="${v%\'}"; v="${v#\'}"   # comillas simples envolventes
  echo "$v"
}

# Extraer los campos de decision (claves planas de nivel raiz). Se normalizan
# con strip_comillas para tolerar valores con o sin comillas indistintamente.
REPO_MANEJA_WORKS=$(strip_comillas "$(sed -n 's/^repo_maneja_works:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
WORK_SLUG=$(strip_comillas "$(sed -n 's/^work_slug:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")
ROL=$(strip_comillas "$(sed -n 's/^rol:[[:space:]]*\(.*\)$/\1/p' "$SESSION_FILE" | head -n1)")

# Repo que no maneja works -> la restriccion no aplica.
if [ "$REPO_MANEJA_WORKS" != "true" ]; then
  exit 0
fi

# Sesion que no orquesta ningun work, o sin rol definido -> permitir.
if [ -z "$WORK_SLUG" ] || [ "$WORK_SLUG" = "null" ] || [ -z "$ROL" ] || [ "$ROL" = "null" ]; then
  exit 0
fi

# Anfitrion asumido -> edita codigo libremente (es el ejecutor de la etapa).
if [ "$ROL" = "anfitrion" ]; then
  exit 0
fi

# A partir de aqui: rol = gobernador con un work activo. Solo esta combinacion
# puede bloquear. Determinar si el path destino es codigo o artefacto de orquestacion.

# 3) Extraer tool_input.file_path del payload JSON via sed.
FILE_PATH=$(echo "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)

# Normalizacion a forma canonica POSIX (la que retorna `pwd` en Git Bash):
#   1) Backslash -> forward slash.
#   2) Prefijo de unidad Windows (letra + dos puntos) -> segmento POSIX en
#      minuscula (la unidad se convierte en un segmento inicial de una letra).
# Sin esta normalizacion, el prefix strip contra `pwd` falla cuando Claude Code
# envia paths absolutos en formato Windows pero `pwd` devuelve la forma POSIX
# equivalente.
normalize_path() {
  local p="$1"
  p=$(echo "$p" | tr '\\' '/')
  p=$(echo "$p" | sed 's|//*|/|g')
  if [[ "$p" =~ ^([A-Za-z]):(/.*)?$ ]]; then
    local drive
    drive=$(echo "${BASH_REMATCH[1]}" | tr 'A-Z' 'a-z')
    p="/$drive${BASH_REMATCH[2]}"
  fi
  echo "$p"
}

FILE_PATH_NORM=$(normalize_path "$FILE_PATH")
CWD_NORM=$(normalize_path "$(pwd)")

# Relativo al cwd (descartar prefijo si vino absoluto y empieza con el cwd).
FILE_PATH_REL="${FILE_PATH_NORM#${CWD_NORM}/}"

# Whitelist de paths que el gobernador SI puede tocar directamente:
#   - artefactos de orquestacion (READMEs, bitacoras, tareas visuales, _catalogo, _sesiones)
#   - artefactos de /disenar (disenos/, post-works/, capas-futuras/)
#   - documentacion del proyecto (.documentacion/ y docs/) — generacion libre sin
#     forzar crear work formal por tareas triviales de documentacion.
#   - plantillas del equipo (agent-os/plantillas/): la curaduria de Paige escribe ahi en el
#     cierre y en /alfred maintain plantillas, siempre con confirmacion del usuario.
#   - configuracion local del agente (.claude/agent-os.local.json)
case "$FILE_PATH_REL" in
  agent-os/work-records/*) exit 0 ;;
  agent-os/disenos/*) exit 0 ;;
  agent-os/post-works/*) exit 0 ;;
  agent-os/capas-futuras/*) exit 0 ;;
  agent-os/product/roadmap/_roadmap.yml) exit 0 ;;
  .documentacion/*) exit 0 ;;
  docs/*) exit 0 ;;
  agent-os/plantillas/*) exit 0 ;;
  .claude/agent-os.local.json) exit 0 ;;
  # Temporal del idiom --body-file (host-protocol "Operacion via runtime (doctrina)"):
  # el gobernador escribe el cuerpo a .tmp-body.md y lo pasa al verbo. No es codigo.
  .tmp-body.md|*/.tmp-body.md) exit 0 ;;
esac

# Memoria personal fuera del repo: matchear ruta absoluta normalizada.
case "$FILE_PATH_NORM" in
  */.claude/projects/*/memory/*) exit 0 ;;
esac

# 4) Path no esta en la whitelist -> es codigo del sistema, y el rol es gobernador.
#    Bloquear y orientar. El mensaje prioriza la AUTO-CORRECCION: la causa mas
#    comun de este bloqueo no es "work intenta editar codigo indebidamente",
#    sino que el agente ESTA conduciendo una etapa como anfitrion pero el archivo
#    de sesion quedo con rol: gobernador (no se ejecuto el paso de marcar el rol).
echo "BLOQUEADO: la sesion tiene rol: gobernador y el path es codigo del sistema. Path: $FILE_PATH_REL" >&2
echo "" >&2
echo "Si estas conduciendo una etapa como anfitrion (A-Amelia, A-Atlas, A-Quinn, etc.) y necesitas editar este codigo:" >&2
echo "  -> ESO ES LEGITIMO. El bloqueo es por desincronizacion del archivo de sesion, no porque la edicion este prohibida." >&2
echo "  -> Corrige $SESSION_FILE: cambia 'rol: gobernador' a 'rol: anfitrion' y 'anfitrion: null' al nombre del experto. Refresca 'actualizado'. Luego reintenta el Edit/Write directo — NO necesitas despachar un subagente." >&2
echo "" >&2
echo "Si NO estas actuando como anfitrion (work gobernando entre gates): delega la edicion de codigo a un subagente real via Agent tool (subagent_type Amelia DS / Atlas DEV)." >&2
echo "" >&2
echo "Si el path es un artefacto de orquestacion legitimo mal clasificado: reporta el path para evaluar la whitelist." >&2
echo "Politica completa: 'Alcance de edicion durante un work activo' en agent-os/skills/host-protocol/SKILL.md." >&2
exit 2
