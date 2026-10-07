# Pieza: Plan (E2)

> Pieza compartida por las rutas `acotado`, `diseno`, `investigacion`, `documentacion`. La ruta determina el insumo y el anfitrion base.

## Proposito

Materializar tareas atomicas (una por unidad de trabajo) desde el insumo de la ruta, con cobertura de los criterios de aceptacion por tarea.

## Anfitrion base y roster por modo

| Modo | Anfitrion del plan | Materializa tareas | Invitables |
|---|---|---|---|
| `normal` | Winston | Bob (CS) | Sentinel (seguridad), Dexter (persistencia), Paige (diagramas), Amelia (RI), Quinn (RT) |
| legacy `evolucion` (deprecado -> ruta `rediseno-ui`) | Winston + Sally (LE) | Bob | idem + Sally |
| `investigacion` | Winston (frentes) | Bob | Mary (valida frentes vs E1), Paige |
| `documentacion` | Paige | Bob (secciones) | Mary (valida cobertura), Sally, Tessa |

<!-- FUENTE del roster de invitables detallado por modo (con "cuando invitarlo"): agent-os/skills/host-protocol/etapas/etapa-2.md secciones "Anfitrion por modo" y "Roster de invitables por modo". La tabla de arriba condensa ambas para la vista de gobernanza de Alfred. NO duplicar -- editar la fuente. -->

**Precedencia anfitrion base vs practico.** La tabla lista a Winston como anfitrion *base* del plan; en la practica **Bob** es el anfitrion por default, materializando directo desde el `## Abordaje` (acotado) o el brief (diseno). Winston se **eleva** a anfitrion solo cuando se detecta un tradeoff arquitectonico real en la evidencia. "Real" se operacionaliza: al menos una de estas condiciones, citada con evidencia:

- Mas de una capa afectada con **dependencia cruzada** (el cambio en una obliga cambio en otra).
- **Eleccion entre patrones** con costo divergente (ej. sincrono vs cola, monolito vs servicio) que no es reversible barato.
- **Frontera de modulo que cambia** (responsabilidad se mueve de un modulo a otro, o se crea uno nuevo).

Si ninguna aplica, Bob materializa sin elevar a Winston. La decision se cita en el plan (que condicion disparo, con evidencia), no se asume.

## Insumo segun ruta

- `acotado`: el bloque `## Abordaje` del README (evidencia + alcance ya confirmados).
- `diseno`: el brief de `/disenar` (`agent-os/disenos/{slug}/brief.md`) + `datos.md` si existe + **los contratos de `contratos_asignados[]`** del frontmatter del work (horneados al abrir; cada uno trae mockup, flujo y reglas locales de SU proceso). Bob los lee ANTES de descomponer — el brief global resume, el contrato del proceso manda. Work paraguas pre-SP4 sin el campo: derivar las rutas de `plan_works[Wn].procesos` del README del diseño.
- `investigacion` / `documentacion`: los artefactos de E1 (CAs de cobertura + discovery).

## Que hace el anfitrion

1. Lee el insumo de la ruta.
2. Propone fases/frentes/secciones segun el modo. El usuario aprueba.
3. **Bob materializa** cada tarea **invocando el runtime** (`agentos work file create` con `file_type: tarea-etapa-2`, frontmatter `status`/`cas`/`tipo_tarea`/`ejecutor: null`/`verificador: null` + el cuerpo completo de la tarea en `contenido`). El plan `03-plan.md` lo crea igual (`file_type: plan-etapa-2`). El binario valida el frontmatter contra el schema y escribe atómico — no se usa Write a mano. Granularidad: 15-90 min (codigo), 30-120 min (investigacion/doc).
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/artefactos-hijos.md. NO duplicar el patron -- para modificar, editar la fuente. -->
4. Cada CA queda cubierto por >=1 tarea.
5. Si la suficiencia de evidencia es `requiere-observacion`, Bob aplica patron "dos olas" (primero tareas de observacion/instrumentacion, luego tareas de cambio).

## Capa de seguridad preanunciada (modo `normal`, incl. el flujo `rediseno-ui`)

Si una tarea tendra `capa_seguridad.aplica: true`, **Sentinel** es invitado (capacidad DP/ER) para co-disenar el bloque por tarea: endpoint/metodo, naturaleza (restriccion-acceso default | modulacion-comportamiento excepcion), permiso (reutilizar | nuevo), sesion aplicable.

El schema completo de `capa_seguridad` (campos, reglas de validacion, permisos nuevos a crear) **no se duplica aqui**.

<!-- FUENTE: agent-os/templates/work-record/schema/capa-seguridad.md seccion "Capa de seguridad (permisos)". Aqui se documenta CUANDO Sentinel preanuncia el bloque en E2; el schema de campos vive alli. NO duplicar la regla -- para modificarla, editar la fuente. -->

## Capa de datos preanunciada

Si la ruta tiene `datos.md` (viene de `/disenar`) o la tarea toca persistencia, **Dexter** (capacidad PD) traduce a bloques `capa_datos` por tarea (entidades + operacion, DDL como sugerencia no contrato, saneamiento si aplica).

<!-- FUENTE: agent-os/templates/work-record/schema/capa-datos-y-evidencia.md seccion "Capa de datos (capa_datos)". Aqui se documenta CUANDO Dexter preanuncia el bloque en E2; el schema vive alli. NO duplicar -- editar la fuente. -->

## Permisos nuevos

Se preanuncian en el plan (seccion "Permisos nuevos a registrar"), pero el delta se aplica al standard en la pieza de ejecucion (atomico con el commit del codigo).

## Cierre de la pieza

Plan aprobado, tareas materializadas con frontmatter valido, cobertura de CAs verificada, bloques `capa_seguridad`/`capa_datos` declarados donde aplican. El anfitrion cede; Alfred activa la pieza de ejecucion.

<!-- FUENTE del criterio de cierre completo por modo (incl. cobertura de items Zoho y tabla "Especifico por modo"): agent-os/skills/host-protocol/etapas/etapa-2.md seccion "Criterio de cierre". Aqui solo el resumen operativo del caso normal. NO duplicar -- editar la fuente. -->

### Si el anfitrion rechaza el plan (no happy-path)

El plan puede resultar no viable: Winston detecta una brecha arquitectonica fundamental, Bob no puede materializar tareas atomicas que cubran los CAs, o el insumo de la ruta (brief/`## Abordaje`) es insuficiente. En ese caso el work NO queda en estado zombie sin responsable:

1. **Quien levanta la bandera:** el anfitrion base (Winston/Bob/Paige) o un invitable via `I-{experto}: detecto posible drift, motivo: {brecha}`.
2. **Alfred toma el hilo** (`S-sistema:`, momento estructural) y dispara `piezas/reevaluacion.md`. Igual que ejecucion y verificacion disparan reevaluacion ante su fallo tipico (`ejecucion.md` senal de drift, `verificacion.md` hallazgo bloqueante), un plan no viable tambien la dispara.
3. **Camino de reevaluacion segun la brecha:**
   - Brecha de discovery (el insumo es incompleto) -> camino (b) reescribir meta + regresar, o (e) regresar a `/disenar` si es ruta `diseno`.
   - Brecha acotable (parte del plan es viable) -> camino (c) ajuste por brecha.
4. **Registro:** la decision se registra en `meta_revisiones[]` del README. El work no avanza a ejecucion hasta tener un plan viable.

Sin esta rama, un plan rechazado dejaria al work sin pieza activa ni responsable del retroceso.
