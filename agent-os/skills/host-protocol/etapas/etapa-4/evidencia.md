# Etapa 4 — Remocion de instrumentacion y auditoria de evidencia (EV-1..EV-4)

> Tarjeta por-chequeo de Etapa 4. Se carga SOLO cuando `agentos work checklist-cierre --slug {slug}` marca EV-1, EV-2, EV-3 o EV-4 como aplicables (evidencia_requerida activa) — la remocion de instrumentacion temporal corre en el mismo tramo del cierre. Movido desde `etapas/etapa-4.md` (Ola 5 T7, doctrina AI-friendly).

## Remocion de instrumentacion temporal (modo normal, incl. legacy evolucion)

Tras completar la Fase 2 satisfactoriamente (o tras el smoke + override del usuario, si la Fase 2 fue saltada con justificacion), Quinn debe **retirar todos los logs temporales instrumentados en E3** antes del cierre del work. La instrumentacion es por contrato temporal; dejarla en codigo es deuda y, peor, pollute logs en produccion.

### Procedimiento

1. **Recolectar mapa de logs.** Quinn lee `logs_temporales_instrumentados` del frontmatter de cada tarea de E2 (poblado por el anfitrion de E3). Construye lista consolidada `{archivo, marcador, cantidad_regiones}`.

2. **Verificar via grep que el mapa coincide con el codebase.** Para cada marcador:
   - `grep -rn "#region WORK-DEBUG-LOG"` debe retornar exactamente la cantidad declarada.
   - `grep -rn "#region SENTINEL-SECURITY-LOG"` debe retornar la cantidad declarada (puede haber adicionales si Sentinel agrego en E4).
   - Si el grep retorna **menos** de lo declarado: alguien removio manualmente regiones — registrar en bitacora y continuar (no es error).
   - Si el grep retorna **mas** de lo declarado: hay logs huerfanos (regiones que ningun work declaro). Investigar antes de remover ciegamente; pueden venir de works anteriores que no limpiaron.

3. **Remover regiones marcadas.** Por cada archivo:
   - Para `#region WORK-DEBUG-LOG`: Quinn (o el editor invocado) elimina cada region completa (desde `#region WORK-DEBUG-LOG` hasta `#endregion` inclusive), incluyendo el comentario interno con fecha/work/proposito.
   - Para `#region SENTINEL-SECURITY-LOG`: Quinn delega a Sentinel via capacidad `[IL]` seccion "Removal" (`agent-os/experts/bmad-agent-sentinel/references/instrumentacion-logs.md`). Sentinel aplica el mismo procedimiento sobre sus regiones especificas.

4. **Verificar que el codebase compila tras la remocion.** Invocar `run-system accion=build componente=backend` (y frontend si aplica). Si el build falla, hay referencias huerfanas (variables declaradas dentro de la region que se usaban fuera, imports innecesarios). Quinn investiga y corrige antes de cerrar.

5. **Commit de remocion.** Un solo commit con mensaje canonico:
   ```
   chore(logs): remover instrumentacion temporal de E3 tras verificacion en E4

   Work: {slug-del-work}
   Archivos limpiados: {N}
   Regiones removidas: {M} WORK-DEBUG-LOG, {K} SENTINEL-SECURITY-LOG
   ```

6. **Registro en `07-verificacion.md`.** Seccion "Limpieza de instrumentacion temporal" con la lista de archivos y cantidades. Sirve de evidencia auditable de que el codebase quedo limpio.

### Excepciones legitimas — logs que SE QUEDAN

Si durante la Fase 2 Quinn (o Sentinel) determinaron que un log temporal **debe pasar a permanente** porque su valor diagnostico justifica mantenerlo en produccion (con el nivel adecuado), Quinn lo formaliza:

- Mover el log fuera de la region marcada `#region`.
- Ajustar nivel a uno apropiado (ej. de `Information` a `Debug` con flag controlable, o documentar que va a `Information` permanente).
- Registrar la decision en `07-verificacion.md` seccion "Logs promovidos a permanentes" con justificacion. Esto NO es excepcion al contrato de remocion — es una excepcion documentada por log, con un fix explicito.

Si Quinn detecta que **muchos** logs deberian ser permanentes, eso es senal de que la observabilidad del modulo es insuficiente como deuda real. Lo registra como hallazgo secundario para el usuario decidir si abrir un work de observabilidad. NO es bloqueante de cierre del work actual.

### Si las pruebas fallaron y el work no cierra

Si la Fase 2 desemboco en `/alfred reevaluar` por bloqueante de meta, los logs **no se remueven**. Permanecen vivos para soportar el siguiente ciclo de E3 (o E2 segun el camino de reevaluacion). La remocion solo ocurre al cierre exitoso final del work.

### Aplicabilidad por modo

| Modo | Aplica | Nota |
|------|--------|------|
| `normal` / legacy `evolucion` | Si | Cualquier log instrumentado en E3 debe removerse (o promoverse explicitamente) en E4. |
| `investigacion` / `documentacion` | No | E3 no instrumenta logs en estos modos. |

## Auditoria de coherencia de evidencia (EV-N) — modo normal, incl. legacy evolucion

> FUENTE del flujo de evidencia verificable en E4. El schema del bloque `evidencia_requerida` vive en
> `agent-os/templates/work-record/schema/capa-datos-y-evidencia.md` seccion "Evidencia requerida (evidencia_requerida)".
> Aplica a works iniciados desde 2026-06-09 en modo `normal` (incl. legacy `evolucion`). Works previos: Quinn verifica
> por prosa segun reglas vigentes a su inicio (registrar en bitacora).
> CS-2 y Fase 2 estan definidos abajo en este archivo; CD-2 vive en
> `agent-os/experts/bmad-agent-dexter/references/plan-y-verificar-bd.md` (auditoria CD-N).

Cuando una tarea declara `evidencia_requerida.{api|ui|bd}: true`, la verificacion no se considera
completa con una afirmacion en prosa ("PASS"): exige un **artefacto** que demuestre el resultado.

### Principio de roles (no negociable)

**Quinn coordina; el experto de dominio produce; Alfred/Claude no ejecutan ni coordinan.**

Quinn NO captura pantallas, NO ejecuta SQL, NO llama endpoints. Invita al experto productor de cada
eje (cargando su SKILL o despachandolo como subagente segun el patron de despacho del repo), que
produce el artefacto con su capacidad. Si el experto requerido no fue invitado a E4, Quinn lo invita
antes de poder marcar el eje como verificado — no suple su trabajo. Alfred (gobernador) esta fuera de
los gates por contrato (`no_participa_en_gates: true`).

**Precedencia de produccion:** producir es el agente encarnado en el experto (default: misma sesion,
voz del experto) o su subagente despachado (solo cuando el patron de despacho del repo exige
aislamiento). Prohibido producir sin encarnacion — un artefacto generado sin la voz ni el rastro del
experto productor no cuenta como evidencia EV-N.

| Eje | Productor | Capacidad | Artefacto |
|-----|-----------|-----------|-----------|
| API | Sentinel (invitado por Quinn) | `[VP]`, dentro de CS-2 | `etapa-4/evidencia/api/T-NNN-{endpoint}.md`: metodo+URL+headers+body+status+response por llamada |
| UI | Tessa (invitada por Quinn) | `[E2E]`, en Fase 2 | `etapa-4/evidencia/ui/*.png` + `_indice.md` narrado por CA; capturas de brecha anotadas. **UI modificada:** par `{CA}-antes.png` (baseline capturado en E3 antes del primer edit) + `{CA}-despues.png`. **UI nueva:** solo `-despues` (no habia estado previo). Ademas, por cada pantalla cuya llegada verifico, actualiza la entrada en `agent-os/product/mapa-llegada.md` (procedimiento en el reference E2E de Tessa, seccion "Llegada verificada -> mapa de llegada") |
| BD | Dexter (invitado por Quinn) | `[VD]`, dentro de CD-2 (solo lectura, P-D4) | `etapa-4/evidencia/bd/T-NNN-{entidad}.md`: schema + SELECT post-escritura + EXEC+efecto + definicion |
| Cripto | Cipher (invitado por Quinn) | `[VF]`, auditoria CR-1..CR-6 | `etapa-4/evidencia/cripto/`: veredicto CR-1..CR-6 (algoritmo y parametros, ciclo de vida de la llave, fail-closed, valor probatorio, agilidad, verificacion con el verificador del adversario). A diferencia de API/UI/BD, esta dimension NO es un eje de `evidencia_requerida`: se declara en `capa_seguridad.dominios` conteniendo `cripto` (ver `agent-os/templates/work-record/schema/capa-datos-y-evidencia.md`); su exencion reutiliza `descartes[]` con `eje: cripto`, no un descarte de `evidencia_requerida` |

### Los cuatro chequeos (Quinn, auditora independiente)

Quinn no produce ninguno de los tres ejes — eso la vuelve el auditor sin sesgo. Tras recolectar los
artefactos producidos por los expertos, ejecuta:

| Chequeo | Que audita | Bloqueante |
|---------|------------|------------|
| EV-1 Completitud | Cada tarea con `evidencia_requerida.{eje}: true` sin descarte registrado tiene su artefacto en `etapa-4/evidencia/{eje}/`. Para **UI modificada**, el artefacto es el **par** `{CA}-antes.png` + `{CA}-despues.png`: falta cualquiera de los dos = incompleto (bloqueante). | Si |
| EV-2 Suficiencia | Cada artefacto realmente prueba su CA: el log de API muestra el status esperado; la captura de UI muestra el estado final del CA (no una pantalla cualquiera) y, si la UI fue **modificada**, el par `antes/despues` muestra el cambio real (el `-antes.png` es el baseline capturado en E3, visiblemente distinto del `-despues.png`, NO una reconstruccion de memoria); la evidencia de BD muestra el dato/efecto (no un SELECT vacio). | Si |
| EV-3 Coherencia cruzada | Para cada CA cubierto por >1 eje, los artefactos cuentan la MISMA historia: el `id` del response API aparece en el SELECT de BD; la captura de UI refleja el mismo resultado. Contradiccion = bloqueante. | Si |
| EV-4 Trazabilidad de brechas | Si hubo brecha, existe la evidencia anotada (captura del defecto / log del fallo) y esta registrada en `meta_revisiones[]` o como brecha aceptada. Brecha sin evidencia = bloqueante. | Si |

**EV-3 es el corazon del chequeo.** Detecta el "exito aparente": UI con confirmacion verde, API 200,
pero el dato nunca llego a la tabla (transaccion no commiteada, trigger silencioso, mapeo ORM roto).
Ninguna evidencia individual lo detecta; solo el cruce de los tres ejes.

### Descarte deliberado del usuario

El usuario puede descartar un eje (bloqueante por defecto). El descarte se registra en DOS lugares:
`evidencia_requerida.descartes[]` del frontmatter de la tarea Y `[OVERRIDE]` en `etapa-4/bitacora.md`
con razon. Sin ambos, la falta de artefacto es brecha bloqueante. Patron identico al salto de Fase 2.

### Resolucion de fallos EV-N

- EV-1 / EV-2 / EV-4 fallan por falta o insuficiencia: Quinn invita al productor del eje a completar
  o corregir el artefacto antes de cerrar. No suple el trabajo.
- **EV-3 falla (incoherencia cruzada):** senal de drift real, no error cosmetico. Si la incoherencia
  ataca la meta, Quinn detiene el cierre y dispara `/alfred reevaluar` (reusa la disciplina ya vigente:
  bloqueante de meta en Fase 2 NO se marca como deuda tecnica). Una captura que dice "creado" con un
  SELECT vacio significa que el sistema aparenta funcionar pero no persiste.

La **re-ejecucion muestral** de evidencia (re-correr una llamada o un SELECT) NO es ritual
obligatorio (respeta el principio del huevo). Queda como herramienta cuando Quinn detecta una
incoherencia concreta en EV-3 y necesita confirmar si el artefacto quedo obsoleto o fabricado.

## Chequeo transversal de citas (pre-cierre)

> A diferencia de EV-1..EV-4, este chequeo NO depende de `evidencia_requerida`: aplica en todo work. Si esta tarjeta se cargo solo por este chequeo, ignorar el resto de la tarjeta.

Antes de proponer cierre, Quinn recolecta las citas ancladas que sostienen el
cierre (diagnostico del README, bloques Ejecutor/Verificador de tareas,
07-verificacion.md) y:

1. **Mecanica:** corre `agentos citas verificar` con esas citas. `fragmento_movido`
   se corrige; `fragmento_no_encontrado`/`archivo_no_existe` degradan la
   afirmacion a `sin-evidencia`.
2. **Congruencia:** re-abre las citas que sostienen el veredicto de cierre y
   juzga que la fuente diga lo que se afirma (misma disciplina de tercero
   independiente de EV-1..EV-4).

Una afirmacion `sin-evidencia` que sostiene el cierre se trata como brecha de
evidencia (espiritu de EV-4): se resuelve o se registra como brecha aceptada
por el usuario.

<!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Verificacion en dos capas". Aqui solo el procedimiento de Quinn en pre-cierre. NO duplicar la regla — para modificar, editar la fuente. -->
