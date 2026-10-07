# Pieza: Verificacion (E4)

> Pieza compartida. Anfitriona: **Quinn** en todos los modos. El roster de invitables cambia por modo.

## Proposito

Verificar la meta del work contra el sistema vivo, en dos fases, clasificar hallazgos en rumbos, retirar instrumentacion, auditar capa de seguridad y datos.

## Roster por modo

| Modo | Invitables |
|---|---|
| `normal` | Amelia (CR), Sentinel (VP, obligatorio si alguna tarea tiene `capa_seguridad.aplica`), Tessa (E2E), Dexter (VD si hay `capa_datos`), Atlas (multi-capa) |
| legacy `evolucion` (deprecado -> ruta `rediseno-ui`) | idem + Sally (VE) |
| `investigacion` | Mary (cobertura), Paige (validate-doc), Winston, Sentinel (compliance) |
| `documentacion` | Paige (validate-doc), Tessa (screenshots), Mary (CAs), usuario objetivo (validacion real) |

<!-- FUENTE del roster de invitables detallado por modo (con "cuando invitarlo"): agent-os/skills/host-protocol/etapas/etapa-4.md seccion "Roster de invitables por modo". La tabla de arriba condensa esa version completa para la vista de gobernanza de Alfred. NO duplicar -- editar la fuente. -->

## Pre-condicion

Auditar el work-record antes de proponer cierre: detectar tareas con `capa_seguridad.aplica: true` sin `## Verificador`, archivos huerfanos. El estado "done sin bloque Ejecutor" o "bullets con timestamp" es irrepresentable desde el corte runtime-cuerpo: `work tarea ejecutor` es la unica via de cerrar una tarea y rechaza timestamps en write-time.

## Las dos fases (modo `normal`, incl. el flujo `rediseno-ui`)

**Fase 1 — Smoke-test.** `run-system` build + run + suite automatizada. Confirma que el sistema arranca y compila. **NO es suficiente para cerrar.**

> Anti-patron PROHIBIDO: sugerir cierre tras smoke-test sin Fase 2.

**Si `run-system` devuelve `exito: false`** (build/run/suite falla, incluido fallo parcial — build OK pero run falla): es **bloqueante de cierre**. Quinn lo trata como hallazgo bloqueante y dispara `piezas/reevaluacion.md` (mismo tratamiento que un hallazgo bloqueante de Fase 2). El motor ya capturo el stderr y resolvio con el usuario si el comando estaba mal vs el ambiente; Quinn solo decide la consecuencia sobre el work.

<!-- FUENTE: agent-os/skills/run-system/SKILL.md seccion "Paso 4 — Si ejecucion falla". El manejo del fallo (captura stderr, AskUserQuestion corregir/ambiente/cancelar, retorno exito:false) vive alli. Aqui solo se declara que exito:false es bloqueante para el cierre. NO duplicar -- editar la fuente. -->

**Fase 2 — Pruebas guiadas con el usuario.** Quinn anuncia que sigue verificacion: activa logs instrumentados (invita Sentinel IL si hay logs de seguridad), valida datos de prueba con el usuario, decide quien conduce el navegador (Quinn/Tessa via Playwright vs el usuario), ejecuta los flujos de los CAs validando contra la meta. Por flujo: PASS / FAIL / PENDIENTE con evidencia.

> Anti-patron PROHIBIDO en Fase 2: si surge un hallazgo bloqueante para la meta (aun fuera de los CAs nominados), Quinn NO sugiere "deuda tecnica" ni "otro work". Detiene la prueba y dispara reevaluacion hasta la etapa necesaria, o cierra como `COMPLETADO_CON_BRECHA` con el bloqueante en `meta_revisiones[]`.

**Excepcion:** el usuario puede saltar Fase 2 si la naturaleza del work (refactor sin cambio funcional, cambio puramente backend) hace que smoke + suite cubran todo. Quinn registra `[OVERRIDE]` con razon.

## Remocion de instrumentacion temporal

Tras Fase 2 exitosa: recolectar el mapa desde `logs_temporales_instrumentados`, grep de los marcadores, remover `#region WORK-DEBUG-LOG` (Quinn) y `#region SENTINEL-SECURITY-LOG` (Sentinel IL), verificar que compila, un commit `chore(logs): remover instrumentacion temporal`. Si las pruebas fallaron y hubo reevaluacion, los logs permanecen hasta el cierre exitoso final.

Lista consolidada de chequeos aplicables a ESTE work: `agentos work checklist-cierre --slug {slug}` deriva del frontmatter que aplica y que no (CS/CD/EV/PRE_CIERRE/meta/cosecha/convenciones/rumbos); no re-derivar a mano.

## Capa de seguridad (CS-1/CS-2/CS-2b/CS-3)

Quinn (capacidad VS) orquesta, invitando a Sentinel (VP). Bloqueante de cierre si CS-2 o CS-2b fallan.

- **CS-1** — cobertura declarativa: cada tarea con `capa_seguridad.aplica: true` tiene bloque estructuralmente valido.
- **CS-2** — restriccion-acceso aplicada: pruebas activas por endpoint (sin sesion -> 401, con sesion sin permiso -> 403, con permiso -> 200).
- **CS-2b** — modulacion-comportamiento aplicada: con permiso -> comportamiento esperado; sin permiso -> comportamiento default sin 403.
- **CS-3** — sincronizacion con el standard: permisos nuevos insertados en el catalogo vivo del `permisos-repo.md` en el mismo commit que el codigo.

Los schemas de `capa_seguridad` y la definicion detallada de cada CS-N no se duplican aqui.

<!-- FUENTE: agent-os/templates/work-record/schema/capa-seguridad.md seccion "Capa de seguridad (permisos)". Aqui se nombra que orquesta Quinn en E4 (CS-1..CS-3) y la condicion de bloqueo; el schema y el detalle de cada CS-N viven alli y en agent-os/experts/bmad-agent-quinn/SKILL.md (capacidad VS). NO duplicar -- editar la fuente. -->

## Capa de datos (CD-1..CD-4)

Dexter (capacidad VD) audita, solo lectura (principio P-D4: produccion intocable). CD-2 fallido es bloqueante de cierre.

- **CD-1** — estructural.
- **CD-2** — contra BD real (solo lectura). Bloqueante.
- **CD-3** — saneamiento.
- **CD-4** — no-redundancia.

<!-- FUENTE del SCHEMA de capa_datos: agent-os/templates/work-record/schema/capa-datos-y-evidencia.md seccion "Capa de datos (capa_datos)". NO duplicar el schema -- editar la fuente. -->
<!-- FUENTE de los CRITERIOS pasa/falla CD-1..CD-4: agent-os/experts/bmad-agent-dexter/references/plan-y-verificar-bd.md seccion "[VD] — Verificación de BD en E4 del flujo gobernado (`/alfred`) (auditoría CD-N)". Aqui se nombra que audita Dexter en E4 y la condicion de bloqueo; el criterio de cada CD-N vive alli. NO duplicar -- editar la fuente. -->

## Auditoria de evidencia (EV-1..EV-4)

Solo works iniciados desde 2026-06-09. Quinn audita como tercero independiente los artefactos que producen los expertos de dominio cuando una tarea declara `evidencia_requerida` activa. **Quinn coordina; el experto produce** (Sentinel [VP] el log API, Tessa [E2E] las capturas UI, Dexter [VD] las 4 evidencias BD). Bloqueante de cierre salvo descarte registrado en `descartes[]` + `[OVERRIDE]` en bitacora.

- **EV-1** — completitud: cada eje requerido sin descarte tiene su artefacto en `etapa-4/evidencia/{eje}/`.
- **EV-2** — suficiencia: cada artefacto prueba su CA (no un SELECT vacio ni una pantalla cualquiera).
- **EV-3** — coherencia cruzada: los ejes cuentan la misma historia (detecta el "exito aparente"). Si ataca la meta, dispara reevaluacion, no deuda tecnica.
- **EV-4** — trazabilidad de brechas: toda brecha tiene evidencia anotada y registro en `meta_revisiones[]`.

<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md seccion "Auditoria de coherencia de evidencia (EV-N) — modo normal, incl. legacy evolucion". Aqui se nombra que audita Quinn en E4 (EV-1..EV-4), el principio de roles y la condicion de bloqueo; el detalle de los chequeos y la tabla de productores viven alli. El schema de evidencia_requerida vive en agent-os/templates/work-record/schema/capa-datos-y-evidencia.md, seccion Evidencia requerida. NO duplicar -- editar la fuente. -->

## Chequeo de meta y rumbos del hallazgo

Quinn compara lo entregado vs la meta vigente:

| Situacion | Salida | ¿Reevaluacion? |
|---|---|---|
| Meta cumplida y verificada | `COMPLETADO` | no |
| Meta cumplida, verificacion no ejecutable en este ambiente | `COMPLETADO_VERIFICACION_DIFERIDA` | no |
| Brecha de meta aceptada | `COMPLETADO_CON_BRECHA` | si, camino (c) |
| Brecha estructural | reevaluacion | si, caminos (b)/(d) |

La segunda fila **no pasa por reevaluacion** y **no toca `meta_revisiones[]`**: la meta no se
reviso. Quinn declara el bloque `verificacion_diferida{}` (causa del enum, evidencia
sustituta con anclas, plan con `revisar_el`) tras confirmarlo con el usuario via
AskUserQuestion, y cierra con `--estado COMPLETADO`: **el estado diferido lo deriva el
runtime, nunca se pide** (`work close --estado COMPLETADO_VERIFICACION_DIFERIDA` es rechazado
con `ESTADO_NO_DERIVABLE`).

Los hallazgos secundarios se clasifican en rumbos (1 dentro del work, 2 post-work, 3 capas futuras) con tabla resumen obligatoria antes de volcar. El detalle de los rumbos y la tabla vive en host-protocol.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Principio del huevo y rumbos del hallazgo". NO duplicar la mecanica de los 3 rumbos ni la tabla resumen -- editar la fuente. -->

## Verificacion de works con insumo de sesion (chequeos 1-8)

Solo works cuyo insumo de E1 es una capacitacion grabada (variante de apertura declarada por `sesion_material_mpa`). Quinn corre estos chequeos sobre el corpus de afirmaciones antes de proponer cierre, ademas de lo demas de esta pieza.

| # | Chequeo | Forma verificable |
|---|---------|-------------------|
| 1 | Cobertura: toda afirmacion tiene `destino` no vacio; todo `descartado` tiene `razon_destino` | campo presente en el corpus |
| 2 | Autoridad, tres clausulas obligatorias. **(a)** toda afirmacion con `destino: doc` cumple `autoridad: fuente`, **o** cumple las tres a la vez: `cubeta_receptor: modelo-trabajo-cliente`, `decision_g2` presente, y `seccion_destino` bajo un encabezado con el marcador `agent-os:contexto-cliente`. **(b)** ninguna afirmacion de `tipo` en (`capacidad-sistema`, `regla-negocio`) tiene `autoridad: receptor` — sea cual sea su destino: un receptor no puede afirmar que hace el sistema ni que regla lo gobierna. **(c)** `cubeta_receptor` esta presente si y solo si `autoridad: receptor` | cruce de campos + grep del marcador |
| 3 | Procedencia: toda afirmacion con `destino: doc` aparece en el documento con su marca `[sesion · t]` | grep por `procedencia.sesion` y `t` |
| 4 | Capacidades: toda afirmacion con `destino: doc` y `tipo` en (`capacidad-sistema`, `regla-negocio`) cuyo `cruce.estado` sea `agrega`, `sin-cruce` o `contradice-fuerte` tiene `codigo_confirma: si` | cruce de campos |
| 5 | Conflictos: todo `contradice-fuerte` tiene `decision_g2` presente y esa decision existe en el registro | cruce corpus / registro de decisiones |
| 6 | Capturas, dos clausulas obligatorias. **(a)** toda afirmacion con `requiere_captura: true` tiene `captura` (y el archivo existe) **o** `brecha_captura` con motivo, **nunca ambos ni ninguno** — los dos a la vez es una brecha declarada sobre evidencia que si se tomo, y ninguno de los dos es una captura que nadie sabe si falta. **(b)** toda `elevada_por_captura: true` tiene `requiere_captura: true` **y** `captura` presente: sin evidencia visual la elevacion no puede aplicarse, asi que una elevacion con `brecha_captura` es afirmacion de receptor documentada como capacidad | cruce de campos + existencia en disco |
| 7 | Enum: ninguna afirmacion usa `destino: standard` | valor fuera del enum |
| 8 | Cobertura editorial vs TOC y audiencia (verificacion propia de la ruta) | juicio de Quinn |

Los chequeos 1-7 se resuelven con los campos del corpus y `grep`, sin leer prosa. El 8 es juicio de Quinn. Esa frontera es deliberada: un chequeo que exige leer e interpretar prosa no es mecanico por mucho que se declare mecanico -- declararlo asi es la forma mas rapida de creer que hay una garantia donde solo hay una intencion. La columna "Forma verificable" es lo que distingue una garantia de una intencion.

El chequeo 2 es el critico: convierte la regla de autoridad (solo el personal de la empresa puede afirmar que hace el sistema) de prosa a garantia verificable por cruce de campos y grep del marcador. Una regla escrita la cumple el agente que la recuerda y la incumple el que va apurado en el tramo 7 de 9.

El chequeo 6 valida las capturas referenciadas, no que toda afirmacion visual tenga una. Una afirmacion sin captura por ausencia de `ffmpeg` es brecha declarada, no falla de verificacion. La clausula (b) es la que impide que esa brecha se use para elevar igual: sin captura no hay elevacion.

**Cobertura de las ocho invariantes del corpus.** El schema declara que sus ocho invariantes se verifican mecanicamente en E4; esta tabla es donde esa promesa se cumple, y el reparto no deja ninguna sin chequeo:

| Invariante del schema | Chequeo que la cubre |
|---|---|
| 1 — `capacidad-sistema`/`regla-negocio` exigen `autoridad: fuente` | 2 (b) |
| 2 — `cubeta_receptor` si y solo si `autoridad: receptor` | 2 (c) |
| 3 — `elevada_por_captura: true` exige `requiere_captura: true` y `captura` | 6 (b) |
| 4 — `requiere_captura: true` exige `captura` **o** `brecha_captura`, nunca ambos ni ninguno | 6 (a) |
| 5 — `destino: descartado` exige `razon_destino` | 1 |
| 6 — `destino: doc` con `autoridad: receptor` exige cubeta + `decision_g2` + `seccion_destino` | 2 (a) |
| 7 — `estado: contradice-fuerte` exige `decision_g2` | 5 |
| 8 — `destino: doc`, tipo que afirma capacidad y estado sin cobertura documental exigen `codigo_confirma: si` | 4 |

Una invariante enunciada en el schema y no cubierta aqui seria una garantia solo en apariencia: el schema la declara verificada y nadie la corre. Al agregar una invariante al schema se agrega su chequeo (o su clausula) en esta tabla, en el mismo cambio.

Schema de los campos citados arriba (corpus de afirmaciones, indice de sesion, decisiones de G2): `agent-os/templates/work-record/schema/sesion.md`.

## Cierre de la pieza

`07-verificacion.md` completo, CAs cubiertos, CS-N sin brecha, CD-N sin brecha, CR-N sin brecha (si aplica), EV-N sin brecha (si aplica), Fase 2 ejecutada (o saltada con override), instrumentacion removida, rumbos curados, meta cumplida. Quinn propone cierre; Alfred activa `piezas/cierre.md` (que gobierna validaciones, epica, archivado y cosecha; y PRE_CIERRE si hay items Zoho).

<!-- FUENTE del criterio de cierre completo (incl. tablas CS-N/CD-N/EV-N y "Especifico por modo"): agent-os/skills/host-protocol/etapas/etapa-4.md seccion "Criterio de cierre". Aqui solo el resumen operativo del caso normal. NO duplicar -- editar la fuente. -->
