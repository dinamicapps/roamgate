---
name: agent-os-skill-bridge-session
description: 'Protocolo de pruebas de integracion multi-sistema via claude-bridge. Gestiona sesiones coordinadas entre instancias de Claude Code en repos diferentes: establecimiento con gobernanza, plan de prueba, datos compartidos, ejecucion de checkpoints, evidencia bidireccional, y reporte consolidado. Invocable desde /alfred (abordaje, Etapas 3, 4) o standalone. Requiere MCP claude-bridge conectado.'
---

# Bridge Session - Protocolo de Integracion Multi-Sistema

## Overview

Coordina trabajo entre dos o mas instancias de Claude Code que gestionan **sistemas independientes** - cada uno con su propio repo, base de datos y stack. Estos sistemas participan juntos en flujos de negocio del cliente (ej: Pedidos reserva stock en Inventario, eMedico envia factura a Contabilidad).

Usa claude-bridge como canal de comunicacion gobernado: roles, reglas inmutables, solicitudes de modificacion con aprobacion, audit trail.

### Escenarios

- **Pruebas con ajustes:** Los sistemas ya estan implementados. Se prueban las integraciones y se hacen ajustes segun lo que se descubra.
- **Desarrollo con pruebas en caliente:** Se esta implementando una feature que cruza sistemas. Desarrollo y pruebas ocurren en tiempo real, coordinados.

### Como invocar

- **Desde el abordaje de /alfred:** "Necesito contexto del otro sistema" ->  establecer sesion y compartir datos
- **Desde /alfred Etapa 3:** "Esta tarea requiere cambios coordinados" ->  solicitudes de modificacion formales
- **Desde /alfred Etapa 4:** "Las pruebas E2E cruzan sistemas" ->  plan de prueba, checkpoints, reporte
- **Standalone:** `/bridge-session` para coordinacion ad-hoc

### Prerrequisito

MCP claude-bridge debe estar conectado. Verificar con `bridge_estado`. Si falla:
```
El MCP claude-bridge no esta conectado. Para conectarlo:
claude mcp add -s user claude-bridge -- bun run {ruta}/src/server.ts
Luego reiniciar esta sesion.
```

## On Activation

1. Verificar que `bridge_estado` responde. Si no ->  informar al usuario y detener.
2. Determinar contexto de invocacion: desde /alfred (que etapa) o standalone.
3. Si desde /alfred: leer `work_output_path` para saber donde escribir artefactos.
4. Preguntar al usuario que fase ejecutar (o ejecutar la que corresponde segun la etapa de work).

## Transporte y recepcion (rediseno 2026-06)

Por default el bridge entrega por **push** (modo channel): los mensajes del grupo llegan solos como
`<channel source="claude-bridge" grupo="..." from="..." tipo="..." msg_id="...">contenido</channel>`
y se responden con `bridge_publicar` (usa `respuesta_a` con el `msg_id`; usa `destinatario` para
dirigir a un miembro concreto). **No montes `/loop` para recibir** en modo channel — es redundante
(el stream SSE ya entrega y marca leido). `bridge_leer` queda como **fallback de pull** (modo polling
o si `bridge_estado` reporta el channel degradado).

Identidad: cada sesion es un miembro propio y estable; **varias sesiones del mismo repo coexisten**
(etiqueta `nombre#session_corto`); reconectar la misma sesion conserva membresia y cursor. Consumidores
no-Claude (Codex): setear `BRIDGE_SESSION_ID` para identidad estable. Guia completa del bridge:
`claude-mcp-bridge/docs/uso-bridge-para-agent-os.md`.

**Resolucion y presencia.** Resolver miembros/destinos por `instancia_id` (coexisten varias sesiones del mismo repo; usar `nombre#session_corto` para desambiguar). Presencia por conexion (`conectada`/`desconectada` en `bridge_listar_miembros`), no por heartbeat: NO dar por muerto a un colaborador por "inactivo". NO editar a mano `.bridge.local` / `.bridge.session.*.local` (los gestiona el MCP).
<!-- Detalle en el repo del bridge: claude-mcp-bridge/docs/uso-bridge-para-agent-os.md secciones 2 y 3. El catalogo de identidad/presencia vive alli; esta seccion solo resume operativamente. Repo externo — NO duplicar. -->

## Las 8 Fases

NUNCA se pueden saltar fases. Todas son obligatorias y secuenciales. Si la sesion ya existe (grupo activo), se retoma desde la fase donde quedo.

**Nota de refactor (2026-04):** El skill ahora distingue "grupo" (contenedor de coordinacion, agnostico al orden del work) de "sesion de prueba" (evento con fases ISO-29119 dentro del grupo). Fase 1 decide que camino tomar segun `estado_grupo` del manifiesto (ver `grupo-vs-sesion.md`).

### Fase 0: Precondicion + Manifiesto

Leer referencia: `./references/fase-0-manifiesto.md`

Verificar work activo y manifiesto valido (formal o minimo). Generar si falta.

### Fase 1: Establecimiento

Leer referencia: `./references/crear-sesion.md`

### Fase 7: Work-Colaborador / Verificar Work-Director

Leer referencia: `./references/fase-7-work-colaborador.md`

(Numerada 7 por convencion: viene tras Fase 1. El colaborador crea su work-record fastrak con F0/F1/F2 y descarga manifiesto. El director valida que el manifiesto esta publicado.)

### Fase 2: Plan de prueba

Leer referencia: `./references/plan-prueba.md`

### Fase 3: Datos compartidos

Leer referencia: `./references/datos-compartidos.md`

### Fase 4: Ejecucion de checkpoints

Leer referencia: `./references/ejecucion.md`

### Fase 5: Evidencia bidireccional

Leer referencia: `./references/evidencia.md`

### Fase 6: Reporte consolidado

Leer referencia: `./references/reporte.md`

## Referencias transversales

- **Guia operativa del bridge (doctrina + trampas conocidas):** `./references/guia-operativa-bridge.md` — leer ANTES de operar: 4 roles + regla de entrega, reglas de oro, escalamiento por disponibilidad, y los bugs del bridge a trabajar a la defensiva (el timeout corre en `requiere_autorizacion`, el operador no se lista pero es alcanzable, estado lectura-vs-enforcement). Destilada de un test de orquestacion end-to-end.
- Manifiesto versionado: `./references/manifiesto-versionado.md`
- Autorizacion dual: `./references/autorizacion-dual.md`
- Mesa redonda: `./references/mesa-redonda.md`
- Archivos publicacion + deteccion capacidades: `./references/archivos-publicacion.md`
- Grupo vs sesion de prueba: `./references/grupo-vs-sesion.md`
- Triage bloqueante vs propuesta: `./references/triage-hallazgos.md`
- Propagacion contrato al repo: `./references/propagacion-contrato.md`
- Disciplina de participante (contexto + cierre): `./references/disciplina-participante.md`

## Alto Total (disponible en cualquier fase)

En cualquier momento de la sesion, cualquier instancia puede solicitar un **Alto Total** que detiene todas las operaciones del grupo. Ver detalle completo en `./references/ejecucion.md` seccion "Alto Total".

- Director: `bridge_solicitar_alto_total` ->  auto-confirmacion inmediata
- Colaborador: `bridge_solicitar_alto_total` ->  espera confirmacion del Director (120s timeout, consenso de emergencia por unanimidad si director ausente)
- Reanudar (solo Director): `bridge_reanudar_grupo`

Usar cuando: cambios descontrolados, sistemas inestables, actuaciones fuera del alcance, datos corruptos.

## Templates ISO 29119

Los artefactos de cada sesion se generan usando templates basados en ISO/IEC/IEEE 29119-3 (Test Documentation). Ver `./references/iso-29119/README.md` para el indice completo.

| Template | Genera | Quien |
|----------|--------|-------|
| `test-plan.md` | Plan de prueba con riesgos, criterios, checkpoints | Director |
| `test-case.md` | Checkpoint con CA asociados, prioridad, idempotencia | Director |
| `test-environment.md` | Ficha de entorno con contratos de endpoints | Cada instancia |
| `test-execution-log.md` | Log de ejecucion con metricas de sesion | Cada instancia |
| `test-incident.md` | Reporte de incidente con severidad y negative provenance | Quien detecta |
| `test-completion.md` | Reporte de cierre con cobertura de CAs y lecciones | Director |

## Correlation ID = CA activo

El CA (Criterio de Aceptacion) del work que se esta validando funciona como correlation ID. Cada checkpoint mapea a CAs. Los mensajes del bridge, los logs forenses, y los reportes se agrupan por CA.

- En mensajes: `metadata: '{"ca_activo": "CA-003"}'`
- En logs forenses: `// FORENSE-LOG [CA-003]: {proposito}`
- En reporte: cobertura de CAs verificados vs total

## Regla de transmision sin filtros

Cuando work recibe un mensaje del bridge destinado a un experto, DEBE transmitir el mensaje completo al experto como subagente SIN filtrar, resumir, reinterpretar ni sesgar. El mensaje llega intacto.

De la misma forma, cuando un experto genera un resultado que debe ir al bridge, work lo publica tal cual.

```
Bridge ->  work recibe ->  transmite intacto al experto (subagente)
Experto genera resultado ->  work publica al bridge intacto
```

La comunicacion via bridge es efectivamente experto-a-experto, con work como mensajero fiel.

## Persistencia y continuidad

Los artefactos de la sesion se escriben en `{work_output_path}/` (si desde /alfred) o en el directorio actual (si standalone):
- `integracion-{nombre-grupo}.md` - evidencia bidireccional
- `reporte-integracion-{nombre-grupo}.md` - reporte consolidado (commiteable)
- Registro en `bitacora.md` de la etapa correspondiente

Si la sesion de Claude Code se interrumpe, `/alfred continuar` retoma. El bridge mantiene el grupo, reglas y metadata. La instancia se re-une al grupo y lee el estado actual.

## Cierre obligatorio de grupo

Al terminar la sesion (pruebas aprobadas, trabajo completado), el grupo DEBE cerrarse:

Antes de que cada participante confirme limpieza, aplica la **disciplina de cierre**
(documentar + commit + decidir compactar/limpiar, graduada por autonomia).
<!-- FUENTE: agent-os/skills/bridge-session/references/disciplina-participante.md seccion "2. Cierre por archivado". NO duplicar -- editar la fuente. -->

1. Director publica: `contexto` "Sesion completada. Resultados: {resumen}. Archivando grupo."
2. Colaborador confirma: `response` "Confirmado. Limpieza completada de mi lado."
3. Director ejecuta: `bridge_archivar_grupo(id_grupo)`

**Si la sesion vive dentro de /alfred Etapa 4:**
El cierre del grupo es parte del cierre de la etapa. No se puede marcar el work como COMPLETADO con un grupo bridge en estado `activo`. La etapa de verificacion (datos en `agent-os/skills/host-protocol/etapas/etapa-4.md`; en Alfred, `piezas/cierre.md`) debe verificar que no hay grupos activos antes de cerrar.
