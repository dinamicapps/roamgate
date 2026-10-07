#!/bin/bash
# Hook: SQL destructivo/peligroso por el MCP sqlserver pide autorizacion explicita
# del usuario. Matcher: mcp__sqlserver__execute_query | mcp__sqlserver__execute_procedure.
# Siempre activo (no work-scoped).
#
# Emite permissionDecision:"ask" en stdout (exit 0) -> Claude Code muestra un dialogo
# de autorizacion al usuario. Si no es peligroso, exit 0 sin salida (flujo normal).
#
# Grepear el payload completo es SEGURO aqui: el payload del MCP solo trae la query/
# proc como texto libre (a diferencia del payload de Bash, que incluye rutas y
# descripciones). Evita depender de jq (prohibido) y de extraer la query con comillas
# escapadas. Diseno POSIX puro. stdin con read -t 10.

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null
[ -z "$INPUT" ] && exit 0

TOOL=$(echo "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
if [ "$TOOL" != "mcp__sqlserver__execute_query" ] && [ "$TOOL" != "mcp__sqlserver__execute_procedure" ]; then
  exit 0
fi

# pedir_ask "razon" -> emite el JSON de ask y termina.
pedir_ask() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

# 1) DDL destructivo + admin/operacional peligroso -> ask.
if echo "$INPUT" | grep -qiE '\b(DROP[[:space:]]+(TABLE|DATABASE|INDEX|VIEW|PROCEDURE|FUNCTION|SCHEMA)|TRUNCATE[[:space:]]+TABLE|ALTER[[:space:]]+(TABLE|DATABASE)|GRANT[[:space:]]|REVOKE[[:space:]]|DENY[[:space:]]|BACKUP[[:space:]]+(DATABASE|LOG)|RESTORE[[:space:]]|SHUTDOWN|DBCC[[:space:]]|sp_configure|xp_cmdshell)\b'; then
  pedir_ask "SQL peligroso (DDL/admin) detectado. Autoriza explicitamente para continuar."
fi

# 2) DELETE / UPDATE sin WHERE -> efecto masivo -> ask.
if echo "$INPUT" | grep -qiE '\b(DELETE[[:space:]]+FROM|UPDATE[[:space:]]+)'; then
  if ! echo "$INPUT" | grep -qiE '\bWHERE\b'; then
    pedir_ask "DELETE/UPDATE sin WHERE -- efecto masivo. Autoriza explicitamente para continuar."
  fi
fi

exit 0
