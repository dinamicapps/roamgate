# Pieza: Ejecucion (E3)

> Pieza compartida. Anfitrion de ejecucion estandar: Amelia (coordina el pool; invita a Atlas por tarea cross-lens). Mary (investigacion) / Paige (documentacion). Atlas es anfitrion fijo de las rutas forenses fix/hotfix. Contrato completo y last-word por dominio: agent-os/skills/host-protocol/etapas/etapa-3.md.

## Proposito

Ejecutar las tareas materializadas con TDD (modos de codigo), instrumentar temporalmente para diagnostico, validar seguridad pre/post-tarea.

## Anfitrion y roster por modo

| Modo | Anfitrion | Naturaleza | Invitables |
|---|---|---|---|
| `normal` | Amelia (host) / Atlas invitado cross-lens | Codigo + tests | Sentinel (obligatorio si `capa_seguridad.aplica`), Quinn (test failures), Bob (course correction) |
| legacy `evolucion` (deprecado -> ruta `rediseno-ui`) | Amelia (host) / Atlas invitado + Sally (LE permanente) | Codigo guiado por prototipo | idem + Sally |
| `investigacion` | Mary | Frentes investigativos | Winston, Sentinel (compliance), Paige (formato) |
| `documentacion` | Paige | Redaccion de secciones | Mary (cobertura), Tessa (screenshots), Winston (tecnicidad) |

Amelia es la **anfitriona** y duena del codigo (last-word del dominio) de la ejecucion estandar: **conduce** la ejecucion despachando subagentes ejecutores y recibiendo sus bloques —salvo en `nivel: minima`, donde ejecuta ella misma en la sesion principal— y coordina el pool; la invitacion de Atlas para una tarea cross-lens (UX+ARQ+DEV+SEC simultaneos) queda **declarada en el plan**. Alfred, al activar esta pieza, **lee esa marca del plan** (lectura de metadatos, transicion estructural) y activa a Amelia, invitando a Atlas si el plan lo marco. Alfred NO re-analiza disciplinas ni codigo — solo enruta segun lo que el plan ya declaro. El contrato completo (last-word por dominio) vive en `agent-os/skills/host-protocol/etapas/etapa-3.md`; el contrato del despacho (que hace el ejecutor, que recibe la anfitriona, gate por `nivel`) vive en `agent-os/skills/host-protocol/references/despacho-subagentes.md`.

<!-- FUENTE del roster de invitables detallado por modo (con "cuando invitarlo"): agent-os/skills/host-protocol/etapas/etapa-3.md secciones "Anfitrion por modo" y "Roster de invitables por modo". La tabla de arriba condensa ambas para la vista de gobernanza de Alfred. NO duplicar -- editar la fuente. -->

## Que hace el anfitrion

1. Lee la meta vigente, el `nivel` vigente (minima/normal/maxima), los standards aplicables, y el bloque `capa_seguridad` de cada tarea.
2. **Por tarea:** lee el objetivo, inicializa (pre-flight de seguridad si aplica).
3. **Conduce la ejecucion:** en `nivel: normal`/`maxima`, despacha subagentes ejecutores por tarea, recibe su bloque y corre la suite real via `run-system`; si sale roja, re-despacha al mismo ejecutor con el output del fallo. En `nivel: minima`, ejecuta ella misma (codigo + tests TDD) en la sesion principal. Para frente investigativo / seccion redactada, aplica el patron equivalente segun modo.
4. **Recibe los logs temporales instrumentados** (codigo): bajo despacho, el ejecutor instrumenta y devuelve la lista; la anfitriona la **persiste** tal cual en el frontmatter `logs_temporales_instrumentados`, sin re-derivarla. En `nivel: minima`, instrumenta ella misma.
   <!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md secciones "Contrato del ejecutor" y "Gate por nivel". El contrato completo del despacho y el gate por nivel viven alli. NO duplicar la regla — para modificar, editar la fuente. -->
5. **Cierra tarea:** post-flight de seguridad si aplica, luego invoca
   `work tarea ejecutor` (stdin `{work_slug, ruta_relativa, agente, status, que_hizo[], hallazgos[]}`).
   El runtime escribe el bloque `## Ejecutor: {agente}` y fija `status`/`ejecutor`
   atomicamente, forzando la forma (rechaza timestamps y bullets >2 lineas). Si rechaza,
   el agente corrige el contenido — no se edita el archivo a mano.
   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". La regla de forma vive en el runtime. NO duplicar — para modificar, editar la fuente. -->

## Pre-flight y post-flight de seguridad (REF->)

- **Pre-flight:** el anfitrion anuncia el bloque `capa_seguridad` declarado (metodos, permisos, sesiones; modulacion si aplica).
- **Post-flight:** verifica que el endpoint tiene extraccion de sesion + chequeo de permiso con el codigo declarado; que la modulacion-comportamiento consulta el permiso sin retornar 403; que los permisos nuevos se insertan en el catalogo vivo del standard en el MISMO commit. Si falla: NO cierra la tarea; Sentinel revisa y se reintenta. **Para tareas con `capa_seguridad.aplica: true`, el cierre exige el sign-off autoritativo de Sentinel (G5)** — ver `etapas/etapa-3/capa-seguridad.md` seccion Post-flight.

El schema de `capa_seguridad` y la mecanica de los permisos no se duplican aqui.

<!-- FUENTE: agent-os/templates/work-record/schema/capa-seguridad.md seccion "Capa de seguridad (permisos)". Aqui se documenta el pre/post-flight de la ejecucion; el schema vive alli. NO duplicar -- editar la fuente. -->

## Senal de drift durante ejecucion

Si aparece un endpoint nuevo o metodo con efecto CRUD persistente cuya tarea no tiene bloque `capa_seguridad`, es la senal de drift mas tipica de E3. El anfitrion la registra y, si es inequivoca, dispara `piezas/reevaluacion.md`. El catalogo completo de senales vive en host-protocol.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift". Aqui solo se nombra la senal tipica de ejecucion (endpoint sin permiso declarado). NO duplicar el listado -- editar la fuente. -->

## Contrato de ejecucion del sistema

En modo `normal` (incl. el flujo `rediseno-ui`), compilar/iniciar/probar/detener el sistema se hace via el skill `run-system` (`agent-os/skills/run-system/SKILL.md`), que lee `test-env.local.json` como fuente de verdad.

## Cierre de la pieza

Todas las tareas en `done`/`done_con_brecha`/`deferido` (o `done_verificacion_diferida`, que el runtime hornea a partir de `done` + bloque `verificacion_diferida{}` valido: es terminal, no una tarea sin cerrar), hallazgos consolidados, post-flight de seguridad pasado, logs temporales instrumentados registrados. El anfitrion cede; Alfred activa la pieza de verificacion.

<!-- FUENTE del criterio de cierre completo por modo (incl. tabla "Especifico por modo" y evidencia): agent-os/skills/host-protocol/etapas/etapa-3.md seccion "Criterio de cierre por modo". Aqui solo el resumen operativo del caso normal. NO duplicar -- editar la fuente. -->
