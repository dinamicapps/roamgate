#!/bin/bash
# Hook: bloquear la fusion en el remote (forja) en llamadas a Bash.
# Politica git del sistema: todo el trabajo git se hace en LOCAL; contra el remote
# solo fetch/pull/push. La fusion (merge) es una operacion local por naturaleza en
# git — el unico vector para fusionar en el remote es el CLI de la forja: `gh pr merge`.
# Este guard lo deniega. Siempre activo (no work-scoped): es politica permanente.
#
# Detecta la INVOCACION de `gh pr merge` en posicion de comando, NO la subcadena en
# un nombre de archivo. Por eso `cat gh-pr-merge.sh` (gh seguido de `-`, no de espacio)
# NO dispara. `git push`, `gh pr create`, `gh pr view`, fetch/pull/merge locales pasan.
#
# Decision via protocolo JSON de Claude Code: emite permissionDecision:"deny" en
# stdout con exit 0. Si no aplica, exit 0 sin salida (flujo normal).
#
# Diseno POSIX puro (sin jq). stdin con read -t 10: `cat` colgado sin EOF congela la
# interfaz de Claude Code; read -t lo acota (ver block-db-clients.sh).

INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null
[ -z "$INPUT" ] && exit 0

# Solo aplica a Bash.
TOOL=$(echo "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
[ "$TOOL" != "Bash" ] && exit 0

# Detectar `gh pr merge` (tolera gh.exe en Windows y espacios multiples entre tokens).
# Prefijo permitido: inicio, separador de comando (; | & (), comilla de apertura del
# valor JSON ("), backtick de sustitucion de comando (`), espacio, o separador de
# comando ESCAPADO tal como llega en el payload JSON de Claude Code (\n, \r, \t —
# backslash literal seguido de n/r/t, no el caracter de control). Sufijo tras
# "merge": espacio, ", ; o fin. Case-insensitive. El backtick cubre `gh pr merge`
# dentro de command substitution (echo `gh pr merge 123`); $(gh pr merge) ya cae en
# la clase por el "(". Los escapados \n/\r/\t cubren comandos encadenados con salto
# de linea (git status\ngh pr merge 5) que de otro modo dejan la "n" de "\n" como
# prefijo inmediato de "gh", fuera de la clase original.
#   "command":"gh pr merge 123 --squash"  -> matchea
#   echo `gh pr merge 123`                -> matchea (backtick en la clase)
#   git status\ngh pr merge 5             -> matchea (\n en la clase)
#   cat gh-pr-merge.sh                    -> NO matchea (gh seguido de "-")
#   gh pr create ...                      -> NO matchea (create != merge)
#   git push -u origin work/x             -> NO matchea (push permitido)
if echo "$INPUT" | grep -qiE '(^|[;|&("`[:space:]]|\\[nrt])gh(\.exe)?[[:space:]]+pr[[:space:]]+merge([[:space:]";]|$)'; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Fusion en el remote bloqueada. `gh pr merge` fusiona en la forja: prohibido. Fusiona en LOCAL (git merge/rebase en tu checkout, resolviendo conflictos ahi) y luego `git push`. Contra el remote solo fetch/pull/push."}}
JSON
  exit 0
fi

exit 0
