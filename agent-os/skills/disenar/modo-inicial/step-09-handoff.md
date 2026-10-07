# step-09: Handoff

> Gate UNICO de cierre del diseño. Aplica plantilla de 5 secciones (analoga
> a la plantilla de cierre de etapa de /alfred). Termina con confirmacion del
> usuario o reapertura.

## Pre-condicion

- step-08 cerrado (brief aprobado).

## Pre-condicion de persistencia (bloqueante)

Antes de cambiar estado a BRIEF_LISTO, verificar que `datos.md` tiene
`persistencia_resuelta: true`. Si está en `false`, el handoff NO cierra:
regresar a step-03 (o al step donde quedó la decisión diferida) para que
Dexter complete el sello anti-evasión.

Tres entradas posibles en bitácora (molde del patrón TR-10):
- persistencia_resuelta: true -> handoff procede.
- no-aplica-sin-datos: el diseño no toca persistencia (raro; Dexter lo declara explícitamente).
- override-con-razon: el usuario salta con razón registrada y riesgo asumido.

<!-- FUENTE P-D3: agent-os/experts/bmad-agent-dexter/SKILL.md seccion "Principles". NO duplicar. -->

## Pre-condicion criptografica (bloqueante, si el diseño tiene dimension criptografica)

Antes de cambiar estado a BRIEF_LISTO, verificar que `criptografia.md` tiene
`confianza_resuelta: true`. Si esta en `false`, el handoff NO cierra: regresar a
step-03b (o al step donde quedo la decision diferida) para que Cipher complete el
sello anti-evasion. Una firma sin valor probatorio declarado, una llave sin custodia
resuelta o un algoritmo sin parametros no son deuda diferible: son el trabajo.

Tres entradas posibles en bitacora (mismo molde que la pre-condicion de persistencia):
- confianza_resuelta: true -> handoff procede.
- no-aplica-sin-cripto: el diseño no tiene operacion criptografica, en cualquiera de sus dos
  formas — Mary omitiendo el step con el modelo revisado (sin artefacto), o Cipher
  declarandolo con evidencia en `criptografia.md`.
  <!-- FUENTE: agent-os/skills/disenar/modo-inicial/step-03b-pre-diseno-cripto.md seccion "Activacion (gate de entrada)". Los dos caminos viven alli. NO duplicar. -->
- override-con-razon: el usuario salta con razon registrada y riesgo asumido.

Si el diseño nunca instancio `criptografia.md` porque el gate de entrada de step-03b
determino que no habia dimension criptografica, esa declaracion en bitacora ES la entrada
`no-aplica-sin-cripto` **solo si ningun freno de Cipher se disparo aguas abajo** (step-04 o
step-07). Si un freno se disparo, `criptografia.md` debe existir con `confianza_resuelta: true`
— la declaracion de omision ya no aplica, quedo superada por el freno.

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". NO duplicar. -->

## Gate de cobertura de requisitos (bloqueante, si el diseño nace de un expediente)

Si el README tiene `expediente_origen`, antes de `diseno transition --a BRIEF_LISTO` Mary
resuelve la cobertura de CADA `requisitos_cubiertos`. Esto previene el desastre de descubrir
en E4 del tercer work de un paraguas un requisito normativo nunca considerado.

1. **Mary presenta la tabla de cobertura:** por cada requisito, que proceso del diseño lo cubre.
2. **Por cada requisito CUBIERTO:** `agentos diseno set-cobertura --slug {slug} --requisito R-NNN --estado cubierto --proceso PN`.
3. **Por cada requisito que el diseño NO cubre:** Mary NO lo deja pasar en silencio. Pide al usuario
   aprobacion explicita del diferimiento (con razon: que otro diseño/work lo aterrizara):
   `agentos diseno set-cobertura --slug {slug} --requisito R-NNN --estado diferido_aprobado --razon "{razon del usuario}"`.
4. El `agentos diseno transition --a BRIEF_LISTO` (paso 2 de la Mision) **rechaza con COBERTURA_INCOMPLETA**
   mientras quede algun requisito `pendiente`. El guard es del runtime; Mary no puede saltarlo.

Lo que el diseño no cubra debe estar **verificado y aprobado por el usuario** — nada normativo se cuela.

## Pre-condicion del modelo (bloqueante, si el diseño es regimen `modelo`)

Antes de intentar `diseno transition --a BRIEF_LISTO`, Mary corre la bateria del modelo por
adelantado, igual que hace con la cobertura arriba. Aplica cuando el diseño declara `flujo: modelo`
o ya tiene `agent-os/disenos/{slug}/modelo.yml`; un diseño `lineal` no tiene modelo que evaluar y
este gate no le aplica.

1. Correr `agentos modelo validar --slug {slug} --etapa {etapa}` por **cada una** de las 8 etapas de
   `modelo.Etapas` (foco, datos, cripto, procesos, pipeline, fragmentacion, modelado, brief). **Ojo
   con el remedio que parece obvio y no lo es:** una sola corrida (`--etapa brief`, por ejemplo) NO
   da el mismo resultado que el gate — es un PISO, no el total. Medido sobre
   `ihce_gateway/20260901-retencion-contenido-transaccion`: `--etapa brief` sola dio 14 hallazgos; el
   gate real (las 8 etapas) dio 26.
2. Resolver cada hallazgo con la etapa dueña de su predicado antes de reintentar el cierre: cerrar la
   pregunta, degradar su severidad con `razon` en el nodo, completar el nodo, citar lo que falta,
   etc. — cada `codigo` de hallazgo apunta a que exige el predicado que lo emitio.
3. El `agentos diseno transition --a BRIEF_LISTO` (paso 2 de la Mision) corre esta misma bateria por
   su cuenta y **rechaza con `MODELO_INCOMPLETO`** mientras quede algun predicado sin cumplir. El
   guard es del runtime; Mary no puede saltarlo — correr la bateria a mano aqui es para no llegar a
   ese rechazo a ciegas, no para evitarlo.

## Mision

Cerrar el diseño con un gate formal. Cambiar estado de `EN_DISENO` a
`BRIEF_LISTO`. Anunciar al usuario que el diseño esta listo para consumirse
via `/alfred iniciar --desde-diseno={slug}`.

## Pasos

1. **Mary publica gate con plantilla de 5 secciones:**

```
A-Mary: Cierre del diseño {slug}.

Lo que entendi del trabajo: {2-3 lineas en voz humana, sin enumeracion
de procesos. Que producto/feature debe quedar implementado al final.}

Lo que vas a recibir: el brief en agent-os/disenos/{slug}/brief.md
referencia {N} procesos modelados con contrato completo, {M} mockups,
{K} reglas heredadas + {L} reglas nuevas. Cualquier work consumidor que
tu inicies con /alfred iniciar --desde-diseno={slug} hereda este brief
por path (no copia) — si aplico hallazgos, el work los ve sin sincronizar.

{Si es_paraguas: Este diseño se implementa en {N} works verticales (ver plan_works en el
README). Inicia cada uno con /alfred iniciar --desde-diseno={slug}; el primero elegible es
{W1} ({procesos}). Alfred valida que no inicies un work cuya dependencia dura no haya cerrado.}

Lo que NO vas a recibir (y por que): {bullets de out_of_scope}. Esos
items deberan diseñarse en su propio diseño o tratarse como work
acotado /alfred iniciar.

Avance hacia tu intent: el intent declarado fue "{intent literal}".
El brief cubre eso al 100%; no hay clausulas pendientes.

Decision para ti: ¿cierro el diseño como BRIEF_LISTO y queda listo
para consumirse por work, o quieres reabrir algun step antes?
```

2. **Si el usuario aprueba:**

```bash
# Transicion gobernada por el runtime (detectar binario y parsear {ok,data};
# patron en agent-os/experts/bmad-agent-alfred/gestion/readme.md).
agentos diseno transition --slug {slug} --a BRIEF_LISTO

# Bitacora
echo "
## $(date +%Y-%m-%d) — step-09 cerrado. Diseño listo.

Estado: BRIEF_LISTO.
Brief en agent-os/disenos/{slug}/brief.md (brief_version: 1).
Listo para consumirse via /alfred iniciar --desde-diseno={slug}.
" >> agent-os/disenos/{slug}/bitacora.md

# Si el diseño tiene bloque worktree{} (regimen de rama activo): checkpoint final
# con el trailer de la unidad, y colapso — "diseno transition" no colapsa por su
# cuenta. Ver SKILL.md seccion "Ciclo git (checkpoints y colapso)".
git add agent-os/disenos/{slug}/
git commit -m "diseno({slug}): handoff a BRIEF_LISTO

Diseno: {slug}"
agentos worktree colapsar --slug {slug} --asunto "diseno({slug}): brief listo para consumo"
```

   **Si el verbo rechaza con `MODELO_INCOMPLETO`:** no es un fallo de la transicion, es el gate
   haciendo el trabajo que la pre-condicion del modelo (arriba) anticipa. El payload trae
   `data.hallazgos[]` con `{codigo, nodo, detalle}` y `data.hallazgos_total`. Mary presenta la lista
   completa al usuario (no un resumen), la resuelve por etapa dueña como indica esa pre-condicion, y
   solo entonces repite este paso 2. NO se reintenta el mismo comando a ciegas esperando que pase.

3. **Mary anuncia:**

```
A-Mary: Diseño cerrado como BRIEF_LISTO. Cuando quieras implementarlo:

  /alfred iniciar --desde-diseno={slug}

{Si es_paraguas: empieza por {W1} (el primer work elegible). Los demas se habilitan al cerrar
sus dependencias. Consulta el avance con /disenar estado {slug}.}

El work hereda el brief. Si durante el work aparece una inconsistencia
con el brief, dispara /alfred retroceder-a-diseno con un titulo corto y
yo reactivo el diseño en modo retroceso para mitigar.

Termino mi turno aqui.
```

Nota del handoff dirigido: al abrir cada work hijo, el runtime hornea en su
frontmatter `contratos_asignados[]` (los contratos de proceso de SU casilla,
resueltos de `plan_works[Wn].procesos`). El hijo no re-descubre su contexto por
imitacion de hermanos: nace sabiendo exactamente que leer.

3.b **Recomendar higiene de contexto.** Cerrado el diseño, Mary aplica la recomendacion de
limpieza de la frontera **diseño → work `--desde-diseno`**: el brief ya esta completo en
disco y el work arranca leyendolo, no leyendo la conversacion que lo produjo. Mary
**recomienda**; nunca limpia por su cuenta.
<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Higiene de contexto". La senal (`agentos telemetry get`), el invariante de reset sin perdida, las dos fronteras y la matriz por nivel viven alli. Aqui solo se dispara en la frontera. NO duplicar la regla — para modificar, editar la fuente. -->

4. **Si el usuario quiere reabrir:**

```
A-Mary: ¿Que step quieres reabrir? Te recuerdo:
  step-01 FOCO (rehacer el modelo o cambiar intent / out_of_scope; conduce Winston)
    {en el regimen `lineal`, en su lugar: step-01 intencion y step-02 contexto}
  step-03 pre-diseño de persistencia (ajustar datos.md / E/R)
  step-04 procesos-y-contratos (modificar un contrato)
  step-05 pipeline (replantear transiciones)
  step-06 fragmentacion (re-decidir la division en works)
  step-07 modelado (ajustar mockup/flujo/escenarios)
  step-08 brief (refinar el consolidado)
```

   Reabrir el step indicado. NO se cierra el diseño.

## Post-condicion

- Si aprobado: estado `BRIEF_LISTO`, bitacora actualizada, comando para
  consumir disponible.
- Si reabierto: regreso al step correspondiente sin cambio de estado.
- Solo si aprobado: `diseno_slug` de vuelta a `null` en el archivo de sesión (el diseño ya
  no se conduce). Si reabierto, se conserva — la sesión sigue conduciendo el diseño.
  <!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Marca de sesion (diseno_slug)". NO duplicar la regla — para modificar, editar la fuente. -->

## Prohibiciones

- NO crear works automaticamente.
- NO publicar nada en Zoho.
- NO leer modo-retroceso/.
