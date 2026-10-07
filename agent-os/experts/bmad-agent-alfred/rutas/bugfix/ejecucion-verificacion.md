# Ruta bugfix — Ejecucion + Verificacion

> Anfitrion: Atlas. Aplica el fix, verifica localmente, decide filtros opt-in (Quinn/Sentinel/Cipher), cierra.

## Nivel de autonomia

Atlas lee `nivel` del README y modula: **normal** (anuncia y aplica, pausa si encuentra algo no anticipado), **minima** (espera aprobacion por cambio), **maxima** (decide intermedios, registra `[AUTO]`, solo consulta scope).

## Accion por desenlace

El desenlace clasificado en `conversacion.md` determina la accion de esta etapa:

- **`correccion_codigo`:** fix clasico (ver "## Aplicar el fix").
- **`restriccion_faltante`:** agregar la validacion/restriccion que el sistema debio tener. Si toca logica de validacion, Quinn obligatorio (ver filtros).
- **`parametrizacion_no_controlada`:** corregir la parametrizacion **y** agregar el control/mensaje que la informe. Dexter verifica el dato de prod corregido (solo lectura).
- **`notificacion_faltante`:** agregar/clarificar el mensaje. A menudo es el fix mas pequeno y de mayor impacto en el "ojo clinico".
- **`logging_faltante`:** instrumentar el logging que faltaba (marcadores `#region WORK-DEBUG-LOG`); cerrar.
- **`caso_en_seguimiento`:** ver "## Cierre en seguimiento".
- **`replanteo`:** NO se ejecuta aqui — se cerro como `TRASLADADO_A_DISENO` en `conversacion.md`.

Si la accion (restriccion/parametrizacion/notificacion) excede el scope focal, Atlas la reencauza a un work de mejora en vez de inflar el bugfix; el `desenlace` ya declara la naturaleza para trazabilidad.

## Aplicar el fix

- **Trivial:** Atlas modifica el archivo, llena `### Fix aplicado` (archivo:linea — descripcion), hallazgos a tabla `### Hallazgos`.
- **Con tareas:** por cada T-NNN en orden de dependencias, aplica el cambio, luego invoca
  `work tarea ejecutor` (stdin `{work_slug, ruta_relativa, agente, status, que_hizo[], hallazgos[]}`);
  el runtime escribe `## Ejecutor: atlas` y fija `status`/`ejecutor` atomicamente.
  Si rechaza, Atlas corrige el contenido — no se edita el archivo a mano.
  Si >=2 tareas paralelizables, pregunta hilo unico vs subagentes.
  <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". La regla de forma vive en el runtime. NO duplicar — para modificar, editar la fuente. -->

### Regla de la ruta: escritura en produccion

La correccion de dato de produccion NUNCA la ejecuta un agente: se genera el script
DDL/DML documentado (con verificacion previa y reversa) y un HUMANO lo ejecuta por
fuera del agente. Esta regla es DE LA RUTA — aplica este Dexter invitado o no — y
de toda ruta cuyo trabajo toque dato de produccion.
<!-- FUENTE: agent-os/experts/bmad-agent-dexter/references/disciplina-produccion.md seccion "Producción: nunca escribe, ni con autorización". Aqui vive la regla de la ruta (precedencia); el detalle operativo del script vive alla. NO duplicar la regla — para modificar, editar la fuente. -->

## Verificacion local

- `run-system build` (skill `agent-os/skills/run-system/SKILL.md`). Si devuelve `exito: false`, Atlas NO cierra: registra el fallo y reevalua la hipotesis del fix (puede requerir volver a `investigacion.md`). El fix puede estar incompleto o haber roto algo.
- Smoke manual de la seccion `## Verificacion` del README/tarea.
- Valida contra standards cargados en `investigacion.md`. Si viola: hallazgo + ajuste antes de cerrar.

<!-- FUENTE: agent-os/skills/run-system/SKILL.md seccion "Paso 4 — Si ejecucion falla". El manejo del fallo de run-system vive alli; aqui solo la consecuencia para el bugfix (no cerrar, reevaluar hipotesis). NO duplicar -- editar la fuente. -->

## Filtros opt-in

Atlas evalua disparadores honestos:

- **Quinn OBLIGATORIO si:** la solucion modifica logica de validacion, agrega test nuevo, o fixea un bug que tenia test pasando.
- **Sentinel OBLIGATORIO si:** el fix toca endpoint con `[Authorize]`, cambia consulta a datos sensibles, o modifica un permiso.
- **Cipher OBLIGATORIO si:** el fix toca una operacion criptografica (firma, verificacion de firma, estampa, cifrado/descifrado, hashing de credencial), cambia un algoritmo o sus parametros, o toca el manejo de una llave/certificado/secreto.
- **Ningun filtro:** Atlas declara explicitamente la razon ("cambio de CSS sin tocar logica ni permisos").

Si invoca filtro: el experto entra (`I-Quinn:` / `I-Sentinel:` / `I-Cipher:`), revisa, luego invoca
`work tarea verificador` (stdin `{work_slug, ruta_relativa, agente, que_verifico[], hallazgos[]}`);
el runtime escribe `## Verificador: {experto}` y fija el frontmatter. No se edita el archivo a mano.
Si rechaza, el experto corrige el contenido e invoca nuevamente. Atlas itera si se requiere.
<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". La regla de forma vive en el runtime. NO duplicar — para modificar, editar la fuente. -->

## Verificacion por desenlace (siempre-activa, gate de cierre)

> La verificacion es **rigor siempre-activo**, no opt-in: toma la **forma adaptada al desenlace**
> como gate de cierre, envolviendo el `run-system build` existente. Quinn/Sentinel/Cipher son
> **obligatorios** segun el desenlace. El `nivel` no la activa ni desactiva — solo decide quien
> sostiene el gate: a `maxima`, el gate es automatico (verde = cierra, registra `[AUTO]`); a
> `minima`, Atlas confirma el resultado con el humano antes de cerrar.

Forma de la verificacion por `desenlace` (gate de cierre):

| `desenlace` | Verificacion obligatoria |
|---|---|
| `correccion_codigo` / `restriccion_faltante` / `parametrizacion_no_controlada` | **repro->verde**: test que reproduce el bug (rojo) -> fix -> verde (via `systematic-debugging`), envolviendo `run-system build`. Si `restriccion_faltante` toca validacion: Quinn obligatorio. Si `parametrizacion_no_controlada`: Dexter verifica el dato de prod (solo lectura). |
| `notificacion_faltante` | asercion de que el mensaje **ahora aparece** (antes ausente). |
| `logging_faltante` | asercion de que la linea de log **emite**. |
| `caso_en_seguimiento` | verificar que los logs quedaron **cableados** y permanecen (ver "## Cierre en seguimiento"). |
| `replanteo` | N/A (no ejecuta aqui; se cerro como `TRASLADADO_A_DISENO` en `conversacion.md`). |

Si el fix toca endpoint `[Authorize]` / datos sensibles / permiso: Sentinel obligatorio (CS-2)
ademas de la forma del desenlace. Ningun desenlace cierra sin su verificacion.

Si el fix toca una operacion criptografica o material de llave: Cipher obligatorio (auditoria CR-N, al menos CR-1 interoperabilidad y CR-5 fail-closed) ademas de la forma del desenlace. <!-- FUENTE: agent-os/experts/bmad-agent-cipher/references/plan-y-verificar-cripto.md. Los chequeos CR-1..CR-6 viven alli. NO duplicar -- editar la fuente. -->

<!-- FUENTE: agent-os/skills/run-system/SKILL.md. El build/run vive alli; aqui solo se envuelve. NO duplicar. -->

El metodo es repro->verde: reproducir el fallo con un caso minimo ANTES de tocar codigo, aplicar el fix, y re-correr el mismo caso hasta verde (sin saltarse la reproduccion).

## Emision de aprendizaje (siempre-activa, POST)

> Step **aditivo POST siempre-activo**. El paso **solo emite** candidatos; nunca cura ni edita el
> ADN (invariante de frontera). El `nivel` solo modula la confirmacion: a `minima`, Atlas confirma
> el candidato con el humano antes de emitirlo; a `normal`/`maxima`, lo emite y registra.
> La seleccion/promocion es el spec hermano.

Al **cerrar** el bugfix y al **promover a diseno**, invocar `learn validar-candidato`
(stdin con el candidato anclado: patron de fix recurrente; el binario fuerza schema +
`evidencia.ancla`, anti-mentira). Aditivo al cierre; no bloquea.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/references/reflexion-adn.md (invariante de frontera: el ADN no se edita fuera del origen). NO duplicar. -->
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/mantenimiento/learn.md seccion "Subcomandos". El contrato del verbo `learn validar-candidato` vive alli. NO duplicar. -->

## Cierre en seguimiento (`caso_en_seguimiento`)

Cuando la forense no concluyo, la accion de esta iteracion es **instrumentar**, no parchar:

1. Cablear los logs que la forense identifico como faltantes (`#region WORK-DEBUG-LOG`). Estos logs **permanecen** (no se retiran al cerrar; son el instrumento para la reincidencia).
2. Registrar en `## Diagnostico forense`: que logs se cablearon, en que archivos, y **que reincidencia esperar** (no es un cierre vacio).
3. Declarar `desenlace: caso_en_seguimiento` y cerrar como `COMPLETADO` (la accion de esta iteracion esta hecha; cerrar es mas limpio que dejar el work colgado).
4. Si reincide, un nuevo bugfix parte con la evidencia ya capturada.

## Cierre

Atlas puebla `## Cierre` (`COMPLETADO el {fecha}. {1 frase}`). **Antes de cerrar, el `desenlace` debe estar declarado en el frontmatter** (via `agentos work set-fm --slug <slug>`); el runtime lo exige con el gate `DESENLACE_NO_DECLARADO` para todo bugfix v2 de ruta `bugfix` que cierra como `COMPLETADO`/`COMPLETADO_CON_BRECHA`.

Declarado el desenlace, si la causa real resulto otra durante la verificacion, Atlas registra `agentos learn veredicto` con `experto: atlas`, `origen: gate-etapa`, `veredicto: corregido`, `categoria_error: diagnostico-errado`. Si el diagnostico se confirma, NO se registra veredicto aqui -- `aceptado` tiene un unico punto de emision (Fase 2 de E4 conducida por el usuario); la metrica de acierto de Atlas se deriva de los `diagnostico-errado` sobre bugfixes cerrados.

El cierre estructural lo ejecuta el runtime: invocar `agentos work close --slug <slug> --estado COMPLETADO` (ver `gestion/cerrar.md`). No escribir `estado`/`fecha_fin` a mano. Anuncia: resumen + desenlace clasificado + filtros invocados + build limpio. Sin ofrecer pasos futuros (anti-patron del cierre con expansion).

<!-- FUENTE: agent-os/templates/work-record/schema/cierre-guards-diseno.md seccion "Guards del runtime (gates bloqueantes) (desde 2026-06-30)". El enum de `desenlace` y el gate DESENLACE_NO_DECLARADO (que exige el campo declarado antes de cerrar) los aplica el runtime. NO duplicar la regla -- editar la fuente. -->

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Anti-patron del cierre con expansion". NO duplicar -- editar la fuente. -->
