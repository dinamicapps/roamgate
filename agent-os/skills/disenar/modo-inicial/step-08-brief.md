# step-08: Consolidar brief

> Lee completo, ejecuta en orden. Termina con P/C. Solo C avanza.

## Pre-condicion

- step-07 cerrado (todos los procesos modelados).
- Artefactos parciales: modelo.yml, datos.md, procesos/, pipeline.md, y contexto.md si hubo
  contrastacion entre fuentes. Del modelo se proyectan bajo demanda dos vistas —
  `discovery` y `reglas-heredadas` — que NO son archivos en disco: se piden con
  `agentos modelo proyectar --slug {slug} --vista {vista}` cuando alguien quiere leerlas en
  prosa. El `intent` vive en el frontmatter del README.
  (Regimen `lineal`: intent.md, contexto.md, reglas-heredadas.md, procesos/, pipeline.md.)

## Mision

Consolidar todo lo producido en `brief.md` apto para que un work consumidor
lo referencie via `--desde-diseno`. El brief es el ARTEFACTO PRIMARIO del diseño;
todo lo demas es soporte.

## Pasos

1. **Instanciar `brief.md` via runtime:**

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Creacion de artefactos de diseno via runtime (no cp de template). Idiom --body-file para cuerpos multilinea. NO duplicar la regla — para modificar, editar la fuente. -->

```bash
# 1) Escribir el cuerpo del brief con Write a un temporal (sin escapado):
#    Write tool -> .tmp-body.md con el contenido completo del brief
# 2) Invocar con --body-file (metadata por stdin, sin contenido):
echo '{"diseno_slug":"{slug}","ruta_relativa":"brief.md","file_type":"diseno-brief","frontmatter":{"diseno_slug":"{slug}","brief_version":1,"fecha_aprobacion":null,"aprobado_por_usuario":false,"hallazgos_aplicados":[]}}' \
  | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

2. **Mary llena seccion por seccion:**

   - **Resumen ejecutivo:** 2-3 parrafos en lenguaje de producto. NO procesos numerados, NO tecnicismo. Un PM debe poderlo leer en 2 minutos.
   - **Pipeline:** copiar tabla resumen desde `pipeline.md`.
   - **Procesos detallados:** 1 parrafo por proceso. NO copiar contratos enteros — esos viven en `procesos/`. Solo el resumen.
   - **Reglas heredadas globales:** desde la vista `reglas-heredadas` del modelo (`agentos modelo proyectar --slug {slug} --vista reglas-heredadas`), las que aplican a >=2 procesos. Las locales quedan en sus contratos.
   - **Reglas nuevas globales:** idem.
   - **Decisiones arquitectonicas:** 3-5 ADR ligeros si Winston participo en algun step del diseño (pipeline, fragmentacion o modelado).
   - **Restricciones tecnicas:** del modulo huesped (lock files, dependencias, etc.).
   - **Mockups:** referencias a los mockups por proceso. NO duplicar.
   - **Capa de seguridad preanunciada:** consolidar todos los preanuncios de los contratos en una tabla unica.
   - **Capa de datos:** referenciar `datos.md` (NO duplicar). El brief apunta al artefacto de primera clase producido por Dexter en step-03.
   - **Capa criptografica:** referenciar `criptografia.md` (NO duplicar). El brief apunta al artefacto de primera clase producido por Cipher en step-03b. Si el diseño no tiene dimension criptografica (step-03b omitido), la seccion declara "no aplica" citando la evidencia de la omision registrada en bitacora — NO se omite en silencio.
   - **Discovery:** referenciar el modelo (NO duplicar). Las 5 preguntas con evidencia se responden con los nodos y aristas de `modelo.yml`, y se leen en prosa con `agentos modelo proyectar --slug {slug} --vista discovery`. El brief nombra el modelo y el comando; no pega la salida, que quedaria congelada mientras el modelo sigue vivo. (Regimen `lineal`: el brief apunta a `discovery.md`, que ahi si es un archivo escrito a mano.)

3. **Validacion final con el usuario:**

```
A-Mary: Brief listo. Resumen:

- {N} procesos.
- {K} reglas heredadas globales + {L} reglas nuevas globales.
- {M} decisiones arquitectonicas.
- {P} endpoints preanunciados con permisos.

¿El brief refleja lo que tienes en la cabeza? Antes de cerrar el diseño,
es el momento de ajustar.
```

4. **Si el usuario pide ajustes, iterar.** Cambios pequeños se hacen aqui.
   Cambios grandes (nuevo proceso, regla heredada olvidada, contrato roto)
   regresan a step correspondiente.

5. **Dexter ejecuta ultimo sello anti-evasion (P-D3) sobre datos.md.**

   Antes del red-team, Dexter (invitado) re-verifica que datos.md siga con
   `persistencia_resuelta: true` y que ninguna decision de datos del brief
   contradiga el artefacto. Si el brief introdujo una decision de datos no
   reflejada en datos.md, Dexter frena: se actualiza datos.md primero.

   <!-- FUENTE P-D3: agent-os/experts/bmad-agent-dexter/SKILL.md seccion "Principles". NO duplicar. -->

5b. **Cipher ejecuta ultimo sello anti-evasion sobre criptografia.md (solo si el diseño tiene dimension criptografica).**

   Antes del red-team, Cipher (invitado) re-verifica que `criptografia.md` siga con
   `confianza_resuelta: true` y que ninguna decision del brief contradiga el artefacto
   (un algoritmo distinto, una llave sin custodia, una firma cuyo valor probatorio el
   brief promete y el artefacto no declara). Si el brief introdujo una decision
   criptografica no reflejada, Cipher frena: se actualiza `criptografia.md` primero.

   Si el diseño NO tiene dimension criptografica (step-03b omitido con declaracion en
   bitacora), este paso se omite explicitamente y se deja constancia — no se salta en
   silencio.

   <!-- FUENTE de los principios P-C1..P-C8 (incl. el sello anti-evasion): agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". El COMO del sello vive en agent-os/experts/bmad-agent-cipher/references/modelar-cripto.md. NO duplicar. -->

5c. **La compuerta final del modelo (regimen `modelo`).**

   Antes del red-team, el modelo tiene que cerrar:

   ```bash
   agentos modelo validar --slug {slug} --etapa brief
   ```

   `MODELO_ABIERTO` reclama **todo nodo que siga `abierto`**. No es una formalidad de
   cierre: un nodo abierto al final del diseño es una pregunta que nadie contesto y que el
   work va a encontrarse. Los transversales corren tambien —pregunta critica, pregunta
   abierta sobre nodo resuelto, prosa anclada— asi que esta es la ultima vez que el diseño
   entero se comprueba de una pieza.

   Si sale con hallazgos: **no se sigue al red-team**. Cada nodo abierto se cierra en la
   etapa dueña de su artefacto (el regreso del molde), o se descarta con razon. Un descarte
   con razon cierra la compuerta; un descarte sin razon es error de forma y el verbo lo
   rechaza antes.

   <!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "El regreso". Como se vuelve a una etapa anterior vive alli. NO duplicar. -->

6. **Antes de aprobar, ejecutar bloqueante TR-02 Red team.**

   Razon: el brief recopila lo que el modelador penso. Red-team obliga a buscar lo que NO penso, en 3 dimensiones (funcional, tecnica, regulatoria). Sin red-team, el cierre firma sobre lo que esta — no sobre lo que falta. Caso real: el diseño `20260430-backoffice-eri` cerro sin red-team y un invariante interno (RH-G1 + reusables que asumen tenant) emergio en E3 del work consumidor.

   Mary ejecuta la plantilla `agent-os/skills/advanced-elicitation/plantillas/red-team.md` sobre `brief.md` en construccion.

   **Antes de clasificar e iterar el brief, Mary presenta los hallazgos crudos del red-team al usuario via el loop de validacion de hallazgos** (en pantalla: analisis + hallazgos + solucion propuesta; menu de 4 caminos en el cuerpo, prompt libre). La superficie no cubierta detectada en las 3 rondas (funcional / tecnica / regulatoria) son hallazgos: el usuario los acepta (A), profundiza con otra tecnica (B), cancela y vuelve al gate (C), o aporta contexto que precisa el alcance o explica por que algo esta cubierto (D). La clasificacion cubierto/añadir/out_of_scope se hace CON el usuario en el loop, no por Mary en solitario.

   <!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Interacción con técnicas bloqueantes (TR-10 en el FOCO, TR-02 step-08)". Aqui: red-team presenta hallazgos al usuario via loop antes de clasificar/iterar el brief. NO duplicar la regla — para modificar, editar la fuente. -->

   Tras el camino A del loop, Output:

   - Bloque `## Red team review` anexado al brief con las 3 rondas y las decisiones acordadas con el usuario (cubierto / añadir / out_of_scope).
   - Lo marcado como "añadir" se incorpora al brief (volver al paso 2).
   - Entrada(s) en `bitacora.md` por cada turno del loop con `hereda_de:`.

   **Override del usuario** valido en casos excepcionales (brief refinamiento de uno previo donde red-team ya se aplico recientemente al brief padre, o brief experimental de exploracion). Override registrado:

   ```
   ## YYYY-MM-DD — Override TR-02 en step-08

   Usuario salto TR-02 red-team. Razon: {razon textual}.
   Riesgo asumido: superficie no cubierta puede emerger downstream.
   ```

   Nota: elegir el camino C (cancelar y volver al gate) dentro del loop de
   hallazgos de TR-02 equivale a ESTE override — TR-02 es bloqueante, asi que C
   no descarta en silencio: registra esta misma entrada de override con el riesgo
   asumido. Ver loop-validacion-hallazgos.md seccion "Asimetria de C".

   NO se cierra step-08 sin que `bitacora.md` registre TR-02 ejecutado o override.

7. **Cuando red-team cerrado y usuario aprueba:**

   Antes de presentar el gate, Mary ejecuta el chequeo de citas del brief:
   `agentos citas verificar` sobre las citas ancladas de `brief.md` (mecanica), y
   re-abre las citas que sostienen DECISIONES del brief juzgando congruencia (la
   fuente dice lo que la afirmacion sostiene). Cita rota o incongruente -> la
   afirmacion se degrada a `sin-evidencia` y se resuelve antes del gate.
   <!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Verificacion en dos capas". NO duplicar la regla — para modificar, editar la fuente. -->

```bash
# Marcar brief como aprobado via runtime
# FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)".
# El frontmatter del brief se actualiza con diseno file set-fm — NO editar directamente con sed.
echo '{"diseno_slug":"{slug}","ruta_relativa":"brief.md","frontmatter":{"aprobado_por_usuario":true,"fecha_aprobacion":"{YYYY-MM-DD}"}}' \
  | agentos diseno file set-fm

# Bitacora
# <!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
echo "
## $(date +%Y-%m-%d) — step-08 cerrado

Brief consolidado y aprobado por usuario.
TR-02 red-team {ejecutado con N hallazgos absorbidos al brief | saltado por override del usuario}.
brief_version: 1.
" >> agent-os/disenos/{slug}/bitacora.md
```

## Cierre

```
A-Mary: Brief aprobado tras red-team. Vamos al gate final (step-09 handoff).

{Si TR-02 ejecutado:}
  Red-team review anexado al brief. {N} hallazgos absorbidos como reglas o
  alcance; {M} aceptados como out_of_scope con razon.
{Si override:}
  TR-02 saltado por override del usuario. Registrado en bitacora.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):
  P — invocar Paige para pulir lenguaje del resumen ejecutivo / Quinn para
      revisar testabilidad de contratos antes del handoff
  C — continuar a step-09 (handoff: gate de cierre del diseño)
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". Mary declara anchor antes de P (invitar experto). NO duplicar la regla — para modificar, editar la fuente. -->

## Post-condicion

- `brief.md` aprobado por usuario.
- `modelo validar --etapa brief` salio limpio (regimen `modelo`).
- `## Red team review` anexado al brief (si TR-02 ejecutado) o override registrado en `bitacora.md`.
- Si C: avanzar a step-09.

## Prohibiciones

- NO publicar handoff aun.
- NO cerrar step-08 sin TR-02 ejecutado o override registrado.
- NO cerrar step-08 con el modelo en rojo: `MODELO_ABIERTO` es bloqueante, no informativo.
- NO leer step-09.
