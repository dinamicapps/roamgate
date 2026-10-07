#!/bin/bash
# Hook: SessionStart — informa al agente el origen de despliegue de la instancia.
#
# Clasifica como nacio esta instancia de Claude Code y lo inyecta al contexto:
#   - launcher: la desplego el launcher del bridge (BRIDGE_LAUNCH_TOKEN presente).
#   - manual:   la abrio el usuario a mano en un repo con bridge.
# Gate: solo habla si el repo usa el bridge (existe .bridge.local en el cwd);
# en cualquier otro repo el hook es un no-op silencioso. Multi-instancia-safe:
# el gate es por-repo (compartido a proposito) y la clasificacion por-proceso
# (env var aislada). NO leer .bridge.session.*.local (spec bridge 2026-07-07 §4.1).
#
# Diseno POSIX puro (sin jq), fail-silent, exit 0 siempre. Coherente con los
# demas hooks agent-os (session-control-start.sh, work-block-*).

# Drenar stdin con timeout (evita cuelgue si el harness no cierra stdin).
INPUT=""
IFS= read -r -d '' -t 10 INPUT 2>/dev/null

# Gate: sin .bridge.local, este repo no usa el bridge -> callar.
if [ ! -f ".bridge.local" ]; then
  exit 0
fi

# Clasificar origen por presencia de la env var inyectada por el launcher.
if [ -n "$BRIDGE_LAUNCH_TOKEN" ]; then
  cat <<'CTX'
[bridge] Esta instancia fue desplegada por el LAUNCHER del bridge (coordinacion automatica).
Esta a completa disposicion del director/orquestador/operador del canal y arranco en
disponibilidad "disponible". Asume que NO hay usuario en la consola local: preguntas,
opciones y decisiones van SIEMPRE por el bridge (bridge_dm al director o a
dashboard-usuario; bridge_publicar en grupo), NUNCA por AskUserQuestion ni por pantalla.
Al iniciar: revisa si hay un grupo o una tarea esperandote (bridge_estado,
bridge_listar_grupos) y atiende el canal. Solo si un operador local escribe efectivamente
en la consola, su instruccion toma prioridad.
Disciplina de worktree: todo trabajo que toque archivos del repo se aisla en rama+worktree
(agentos worktree abrir antes del primer cambio) y cierra en 3 pasos (work close -> merge
a default -> limpieza aprobada). Doctrina completa:
agent-os/skills/bridge-session/references/ciclo-worktree.md.
CTX
else
  cat <<'CTX'
[bridge] Esta instancia fue abierta MANUALMENTE por el usuario en un repo con bridge.
Tu disponibilidad ante el canal es "ocupado": trabajas en algo local del usuario y NO te
auto-integres al bridge. GARANTIA: en tu primer turno, marca ese estado tu misma llamando
bridge_disponibilidad ("ocupado") — no confies en el default del broker (las reconexiones
preservan un estado anterior que puede ser "disponible"). Solo cuando el usuario te pida
deliberadamente quedar al servicio del canal llamas bridge_disponibilidad ("disponible");
esa peticion posterior del usuario prevalece sobre esta garantia (no vuelvas a marcarte
ocupado tras cumplirla).
CTX
fi

exit 0
