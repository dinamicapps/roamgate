# Hooks de Claude Code — agent-os

Scripts bash que el harness de Claude Code ejecuta en eventos del ciclo de vida
(`PreToolUse`, `SessionStart`, `SessionEnd`). Son **producto distribuible**: el
instalador del sistema los copia a `.claude/agent-os-hooks/` del proyecto
consumidor y fusiona su configuracion directamente en `.claude/settings.json`.

> **Por que viven en `.claude/agent-os-hooks/` y no en `.claude/commands/agent-os/`:**
> son scripts ejecutables, una categoria distinta de los comandos slash markdown
> que lee el agente. Mantenerlos separados evita ruido y la confusion de rutas
> que causaban al estar mezclados.

## Diseno comun

- **POSIX puro, sin `jq`.** `jq` no esta garantizado en Git Bash bajo Windows.
  Los hooks parsean el payload JSON con `grep` + `sed`.
- **Exit codes:** `exit 0` permite la accion; `exit 2` la bloquea (Claude Code
  trata cualquier exit code distinto de 0 como bloqueo — un hook que falla por
  error tambien bloquea, de ahi la disciplina de salir limpio en los casos borde).
- **Protocolo JSON de decision (hooks de BD).** `block-db-clients.sh` y
  `block-destructive-sql.sh` no usan el exit-code-2: emiten JSON en stdout con
  `exit 0` y `hookSpecificOutput.permissionDecision` (`deny` bloquea con razon;
  `ask` dispara el dialogo de autorizacion del usuario). Sin JSON, `exit 0` deja
  pasar al flujo normal de permisos.
- **Reciben el payload por stdin con lectura acotada.** Todos leen stdin con
  `IFS= read -r -d '' -t 10 INPUT` — NO con `cat`. `cat` se bloquea
  indefinidamente si el harness deja stdin abierto sin enviar EOF (problema
  observado en Cygwin/Windows), lo que congela la interfaz de Claude Code. El
  `read -t 10` acota la espera: sin payload el hook sale limpio.
- **`timeout` en `settings.json`.** Cada hook se registra con `"timeout": 15`
  (segundos). Es la red de seguridad del harness: el default de Claude Code para
  hooks `command` es 600s — un hook colgado congelaria la sesion 10 minutos. Con
  `timeout: 15` el harness lo mata a los 15s. El `read -t 10` interno es la
  primera linea de defensa; el `timeout` del settings es la segunda.

## Los hooks

### Control de edicion por sesion

Tres hooks cooperan para decidir si una sesion de Claude Code puede editar codigo
del sistema. La decision NO se basa en escanear READMEs en disco, sino en un
**archivo de control por sesion**: `agent-os/work-records/_sesiones/{session_id}.yml`
(gitignoreado, estado efimero). Un archivo por sesion — el usuario trabaja con
varias sesiones en paralelo y un archivo unico seria condicion de carrera.

| Hook | Evento | Que hace |
|------|--------|----------|
| `session-control-start.sh` | `SessionStart` | Crea/refresca el archivo de la sesion. Detecta `repo_maneja_works`. Purga (`rm`) archivos de sesion con mtime > 48h. `source` compact/clear preserva `rol`/`work_slug` (misma sesion). Emite al modelo el contexto de entorno (`agentos session entorno`) rotulado como hora de ARRANQUE. |
| `session-control-end.sh` | `SessionEnd` | Elimina el archivo de la sesion (camino limpio de purga). |
| `work-block-direct-edits.sh` | `PreToolUse` (`Edit`\|`Write`) | Lee el archivo de la sesion y decide por el campo `rol`. |

**Logica de `work-block-direct-edits.sh`:**

```
bypass agent_id (subagente real)              -> permite
sin session_id / sin archivo de sesion        -> permite (degradacion segura)
repo_maneja_works = false                     -> permite
work_slug = null  o  rol = null               -> permite
rol = anfitrion                               -> permite (incl. codigo)
rol = gobernador  + path de codigo            -> BLOQUEA (exit 2)
rol = gobernador  + artefacto de orquestacion -> permite (whitelist)
```

- **Esquema del archivo de sesion:** `agent-os/templates/work-record/schema/catalogos-y-sesion.md`
  seccion "Control de edicion por sesion" (fuente unica).
- **Politica de la matriz (que rol edita que):** `agent-os/skills/host-protocol/SKILL.md`
  seccion "Alcance de edicion durante un work activo" (fuente unica).

### Guards siempre activos

Tres hooks independientes del control por sesion — son politica permanente, no
work-scoped. Usan el protocolo JSON de decision de permisos de Claude Code:
emiten `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny|ask","permissionDecisionReason":"..."}}`
en stdout con `exit 0`.

| Hook | Evento | Que hace |
|------|--------|----------|
| `block-db-clients.sh` | `PreToolUse` (`Bash`) | `deny` si el comando invoca un cliente directo MSSQL (`sqlcmd`, `osql`, `bcp`, `Invoke-Sqlcmd`, `sqlps`). Las conexiones a BD deben ir por el MCP `sqlserver`. Detecta la invocacion del binario, NO verbos SQL -- por eso editar/leer un `.sql` no dispara. |
| `block-destructive-sql.sh` | `PreToolUse` (`mcp__sqlserver__execute_query`\|`execute_procedure`) | `ask` (pide autorizacion al usuario) si la query es destructiva/peligrosa: `DROP`/`TRUNCATE`/`ALTER`, `DELETE`/`UPDATE` sin `WHERE`, o admin (`GRANT`/`REVOKE`, `BACKUP`/`RESTORE`, `sp_configure`, `xp_cmdshell`, `SHUTDOWN`, `DBCC`). SELECT, INSERT y DML con WHERE pasan. |
| `block-remote-merge.sh` | `PreToolUse` (`Bash`) | `deny` si el comando invoca `gh pr merge` (fusion en la forja remota). Politica git: todo el trabajo git se hace en LOCAL; contra el remote solo `fetch`/`pull`/`push`. La fusion se hace en local (`git merge`/`rebase`, resolviendo conflictos ahi) y se publica con `git push`. `gh pr create`/`view` y push pasan. |

### Otros hooks de bloqueo durante un work activo

| Hook | Evento | Que hace |
|------|--------|----------|
| `work-block-browser-js.sh` | `PreToolUse` (`mcp__.*playwright.*__browser_(evaluate\|run_code(_unsafe)?)` -- tolera prefijo de plugin y variante `_unsafe`) | Bloquea ejecucion de JS arbitrario en el navegador cuando la sesion es `rol: gobernador` con work activo. `repo_maneja_works != true` -> permite. `rol: anfitrion` (ej. Quinn/Tessa en E4) permite; sin session/rol permite (fail-open). Espejo de la deteccion de rol de `work-block-direct-edits.sh`. |

## Probar un hook

Los hooks se prueban pasando un payload JSON por stdin y verificando el exit code:

```bash
echo '{"session_id":"test","tool_input":{"file_path":"src/Foo.cs"}}' \
  | bash .claude/agent-os-hooks/work-block-direct-edits.sh
echo "exit: $?"
```

Antes de modificar un hook, reproducir el escenario en un sandbox (`/tmp/hooktest`
con la estructura `agent-os/work-records/_sesiones/`), ejecutar contra payloads
inline, verificar exit codes. La suite completa de casos vive en el repo fuente
del sistema (no se distribuye a este proyecto).
