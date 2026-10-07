#!/bin/bash
# Hook: bloquear clientes directos de BD (familia MSSQL) en llamadas a Bash.
# Las conexiones a BD deben ir EXCLUSIVAMENTE por el MCP sqlserver. Siempre activo
# (no work-scoped): es una politica de conexion permanente.
#
# Detecta la INVOCACION del binario cliente en posicion de comando, NO verbos SQL.
# Por eso editar/leer/grepear un .sql, o un comando cuyo argumento contenga "sqlcmd",
# no disparan -- ese era el bug del hook anterior (grep de verbos SQL sobre el payload).
#
# Decision via protocolo JSON de Claude Code: emite permissionDecision:"deny" en
# stdout con exit 0. Si no aplica, exit 0 sin salida (flujo normal).
#
# Diseno POSIX puro (sin jq). stdin con read -t 10: `cat` colgado sin EOF congela
# la interfaz de Claude Code; read -t lo acota (ver work-block-direct-edits.sh).

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null
[ -z "$INPUT" ] && exit 0

# Solo aplica a Bash.
TOOL=$(echo "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
[ "$TOOL" != "Bash" ] && exit 0

# Detectar invocacion de un cliente directo MSSQL en posicion de comando.
# Se grep-ea el payload completo, donde el command aparece como "command":"sqlcmd ...".
# Prefijo permitido: inicio, separador de comando (; | & (), comilla de apertura del
# valor JSON ("), backtick de sustitucion de comando (`), espacio, o separador de
# comando ESCAPADO tal como llega en el payload JSON de Claude Code (\n, \r, \t —
# backslash literal seguido de n/r/t). Sufijo: espacio, ", ;, o ".exe". Simetria con
# block-remote-merge.sh (mismo gap de newline escapado y de backtick). Asi:
#   "command":"sqlcmd -S ..."  -> matchea (sqlcmd tras " y antes de espacio)
#   echo `sqlcmd -S s`         -> matchea (backtick en la clase)
#   ls\nsqlcmd -S s            -> matchea (\n en la clase)
#   cat run-sqlcmd.sh          -> NO matchea (sqlcmd precedido por "-")
#   cat scripts/migracion.sql  -> NO matchea (no hay token de cliente)
# Case-insensitive (cubre Invoke-Sqlcmd, SQLCMD.EXE, etc.).
if echo "$INPUT" | grep -qiE '(^|[;|&("`[:space:]]|\\[nrt])(sqlcmd|osql|bcp|invoke-sqlcmd|sqlps)([[:space:]";]|\.exe)'; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Conexion directa a BD bloqueada. Las conexiones deben ir por el MCP sqlserver (mcp__sqlserver__execute_query)."}}
JSON
  exit 0
fi

exit 0
