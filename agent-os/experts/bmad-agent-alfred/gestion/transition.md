# Gestionar el estado via runtime (transition)

Los cambios de estado **entre activos** (pausar, reanudar) son deterministicos: los ejecuta el binario `agentos`, no se edita el frontmatter a mano. El binario valida la maquina de estados, setea `estado` en el README del work (unica fuente de verdad) y emite el heartbeat en una sola operacion. No escribe ningun catalogo: el catalogo es una vista derivada que el runtime reconstruye en memoria en la siguiente lectura (`agentos catalog show`). Patron de invocacion (lo reusan `pausar` y `continuar`):

1. **Detectar el binario:** buscar `.claude/agent-os-bin/agentos` (o `agentos.exe` en Windows). Si NO existe: informar "Runtime de agent-os requerido para gestionar el estado del work. Reinstala el runtime de agent-os (instalador del paquete)." y NO cambiar el estado (sin fallback en prosa, igual que la creacion).
2. **Invocar:** `agentos work transition --slug <slug> --a <ESTADO_DESTINO>`.
3. **Parsear** `{ok, data}`: si `ok:false`, mostrar `error.mensaje` al usuario y detenerse; si `ok:true`, continuar. El binario rechaza transiciones ilegales (`Fallo("TRANSICION", ...)`) — Alfred no valida la maquina por su cuenta.

El binario solo mueve el estado estructural; lo cognitivo (razon de la pausa, rol de sesion) lo gobierna Alfred aparte.

<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work" (catalogo de estados). La regla de que transicion es legal la implementa y hace cumplir el binario (el runtime, verbo work transition). Aqui solo se documenta como Alfred invoca el verbo. NO duplicar la maquina de estados. -->
