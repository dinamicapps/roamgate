# Integración: Bridge (gobierno de grupos multi-repo)

> Gobierno de Alfred para coordinación multi-repo. Alfred porta el GOBIERNO (cuándo crear/archivar grupo, qué validar, cómo registrar en el work-record). El MOTOR se invoca: skill `bridge-session` + tools MCP `bridge_*`.

## Frontera gobierno / motor

| Se porta a Alfred (gobierno) | Se invoca tal cual (motor) |
|---|---|
| Cuándo abrir grupo, validación de nombre, registro en work-record, gate de archivado, drain obligatorio | skill `bridge-session` (establecimiento, sesión), tools MCP `bridge_crear_grupo`, `bridge_subir_adjunto`, `bridge_publicar`, `bridge_archivar_grupo`, `bridge_historial`, `bridge_leer`, `bridge_disponibilidad`, `bridge_listar_instancias`, `bridge_invitar`, `bridge_dm` (P3, segun capacidad) |

Disponibilidad (P3, si el MCP lo expone): Alfred puede marcar la instancia `no_disponible`
durante Alto Total u operacion destructiva larga, y `disponible` al cerrar o al retomar
disponibilidad. `bridge_dm` permite mensaje directo durable fuera de grupo cuando el
destino esta `disponible`.

## Invariante: SIEMPRE director al crear

Cuando Alfred ABRE un grupo, la instancia de Alfred ES el director del grupo — sin excepción. El rol director no se pregunta ni se infiere: es invariante del acto de crear. (En `bridge-session/references/crear-sesion.md` esto era implícito en la rama "Si esta instancia inicia"; aquí se eleva a invariante explícito.)

**Continuidad por rotacion (P3).** Si la sesion de Alfred-director se reinicia, al
re-unirse (`bridge_unirse`, mismo nombre) **reclama su rol director** si la sesion previa
esta desconectada (stale); si la previa sigue conectada, el join se rechaza. Esto retira
el viejo riesgo "grupo sin director" tras un reinicio.

<!-- FUENTE: agent-os/skills/bridge-session/references/crear-sesion.md seccion "Si esta instancia inicia la sesion (Director)". El motor de establecimiento vive alli; aqui solo el gobierno de cuando invocarlo. NO duplicar -- editar la fuente. -->

<!-- FUENTE: agent-os/skills/bridge-session/references/grupo-vs-sesion.md. Estados del grupo (exploracion|acordado|archivado) y la distincion grupo vs sesion viven alli. NO duplicar -- editar la fuente. -->

## /alfred grupo crear {nombre}

Precondición: work activo (EN_PROGRESO o PAUSADO) en `_catalogo.yml`. Nombre kebab-case que NO exista ya en el work.

Secuencia de gobierno (el orden es invariante — el manifiesto se sube ANTES de invitar para que el colaborador no descargue grupo vacío):

1. **Crear el grupo.** Preguntar objetivo + intención inicial + reglas (delegar al motor `crear-sesion.md` pasos 2-3). Invocar `bridge_crear_grupo` con metadata `estado_grupo` (`exploracion` default | `acordado`). **Alfred es director por invariante** (sección "Invariante: SIEMPRE director al crear").
2. **Cargar archivos base.** Subir manifiesto obligatorio (`bridge_subir_adjunto` + `bridge_publicar`, operación lógica única). Si el work tiene `diseno_origen`, subir el brief. Preguntar archivos adicionales del alcance.
3. **Entrar como director.** Ya garantizado por el paso 1: la instancia que crea es director. Registrar punto de restauración git (commit + branch) en bitácora.
4. **Invitar.** Camino primario (si el MCP expone P3): `bridge_listar_instancias` →
   ofrecer instancias conectadas+disponibles (AskUserQuestion) → `bridge_invitar`.
   Fallback (cold-start o sin P3): imprimir el bloque copy/paste (Variantes A/B). El
   detalle del sub-flujo vive en el motor.
<!-- FUENTE: agent-os/skills/bridge-session/references/crear-sesion.md seccion "Invitar por discovery". NO duplicar -- editar la fuente. -->

Registro en work-record: actualizar `README.md` y `{work}/_catalogo.yml` sección `grupos_bridge`; entrada en bitácora de la pieza/etapa activa.

<!-- FUENTE: agent-os/skills/bridge-session/references/crear-sesion.md secciones pasos 4-10 (crear grupo, subir manifiesto, subir brief, archivos adicionales, detectar ecosistema, emitir invitacion). El detalle de cada AskUserQuestion y el formato exacto de las Variantes A/B viven alli. NO duplicar -- editar la fuente. -->

## /alfred grupo listar

Cargar work activo. Leer `{work}/_catalogo.yml` sección `grupos_bridge`. Por cada grupo: leer su `manifiesto.yml` (estado), `README.md` (fecha_creacion), invocar `bridge_historial(id, limite:1)` (último mensaje), contar sesiones y bloqueantes abiertos. Presentar tabla (Nombre | Estado | Creado | Último msg | Sesiones | Bloqueantes). Marcar con warning grupos con bloqueantes o mensajes sin leer > 1h.

## /alfred grupo archivar {nombre}

Gate de cierre (verificar antes de archivar): sin bloqueantes `abierto`/`en-resolucion`, sin contratos acordados sin propagar, sin sesiones `en-ejecucion`. Si alguna falla: reportar y preguntar resolver o forzar con justificación. Al confirmar: actualizar manifiesto y README del grupo a `archivado`, actualizar work-record, publicar aviso al bridge (`bridge_publicar` tipo contexto), invocar `bridge_archivar_grupo(id)`, registrar en bitácora.

Antes de archivar, cada participante (incluido Alfred) aplica la disciplina de cierre.
<!-- FUENTE: agent-os/skills/bridge-session/references/disciplina-participante.md seccion "2. Cierre por archivado". NO duplicar -- editar la fuente. -->

<!-- FUENTE: agent-os/skills/bridge-session/references/grupo-vs-sesion.md seccion "Relacion" (bullet "Gate de cierre": sin bloqueantes abiertos). NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/bridge-session/references/propagacion-contrato.md seccion "Gate" (contratos sin propagar). La tercera condicion (sesiones en-ejecucion) es gobierno propio de Alfred. NO duplicar -- editar la fuente. -->

## /alfred contrato listar

Verificar `.documentacion/contratos-externos/_indice.yml`. Si no existe: informar y sugerir crear. Por cada contrato: calcular edad de `ultima_prueba_exitosa.fecha` → estado (nunca-probado | fresh <3m | stale 3-6m | muy-stale >6m). Tabla (Sistema | Endpoint | Versión | Última prueba | Estado | Rol). Si hay stale/muy-stale, ofrecer crear grupo bridge para re-verificar. Umbral configurable en `.bridge.local` campo `contrato_stale_meses`.

## Drain bridge obligatorio

Con transporte push (modo channel) los mensajes llegan en vivo durante la sesion; el
drain de apertura de pieza es un **catch-up/auditoria** de mensajes que llegaron pero no
se acusaron en el limite de pieza (o entre sesiones). Mecanismo intacto:

Al iniciar cada pieza o tarea, si `{work}/_catalogo.yml` lista grupos bridge activos:

1. Por cada grupo: `bridge_leer(id, recientes:true, limite:10)`.
2. Filtrar mensajes sin acusar con antigüedad > 1h.
3. Si hay: reportar al usuario y preguntar (AskUserQuestion): "Atender ahora (recomendado)" / "Anotar como deuda y continuar" / "Archivar grupo (si ya no es relevante)".

Umbral configurable en `.bridge.local` campo `drain_antiguedad_horas` (default 1).

Las piezas de Alfred (plan, ejecución, verificación) invocan este drain en su apertura cuando el work tiene grupos activos.

## Manejo de errores (motor MCP no disponible)

Si un tool MCP `bridge_*` no responde (timeout, caída, error), el gobierno de Alfred **informa al usuario y detiene la capacidad — no improvisa**. El tratamiento depende de si la operación es bloqueante:

| Operación | Clase | Si falla |
|---|---|---|
| `bridge_crear_grupo`, `bridge_subir_adjunto` (manifiesto), `bridge_archivar_grupo` | **Bloqueante** | NO marcar el grupo como creado/archivado en el work-record. Informar al usuario, dejar el work-record sin tocar (cero estado parcial). El usuario decide reintentar. |
| `bridge_leer` / drain, `bridge_historial` | **No bloqueante** | Anotar como deuda en la bitácora de la pieza activa y continuar. El drain es informativo: su fallo no debe frenar la pieza. |

Reglas:
- **Atomicidad de operación lógica:** `bridge_subir_adjunto` + `bridge_publicar` (manifiesto) son una operación única; si la primera falla, no ejecutar la segunda ni registrar el grupo.
- **Sin reintentos ciegos:** Alfred no reintenta en bucle. Reporta el fallo con el tool y el error, y pregunta al usuario (AskUserQuestion): reintentar / anotar como deuda / abortar la capacidad.
- **No falsear registro:** nunca escribir `grupos_bridge` en el work-record si el tool de creación no confirmó éxito.

<!-- FUENTE: agent-os/skills/bridge-session/SKILL.md seccion "On Activation". El mismo contrato (informar y detener, no improvisar) que el motor aplica. NO duplicar -- editar la fuente. -->

