# step-02: Contexto del modulo huesped + sistemas referenciados

> **Regimen `lineal`.** Este step sirve a diseños creados antes de que el modelo
> existiera (`flujo: lineal` o ausente en el README del diseño). El flujo nuevo
> entra por `modo-inicial/step-01-foco.md`. Un diseño lineal puede reanudarse y
> retroceder por aqui, pero **para cerrar una etapa nueva reconstruye primero**:
> ver `../reconstruir.md`.

> Lee completo, ejecuta en orden, termina con P/C. Solo C avanza.

## Pre-condicion

- step-01 cerrado (intent y out_of_scope declarados).
- README del diseño tiene `modulo_huesped: ""` vacio o tentativo.
- Si en step-01 paso 0 se leyeron referencias del usuario, sus paths estan listados en `bitacora.md`.

## Mision

Mary (con subagents en paralelo) escanea el modulo huesped del codebase + cualquier **sistema gemelo** o **documentacion de ecosistema** declarado por el usuario en step-01 como referencia. Identifica:

1. Patrones existentes que el diseño deberia imitar (modulo huesped + sistemas gemelos).
2. Reglas heredadas implicitas en codigo (validaciones, transformaciones, asunciones).
3. Permisos y capa de seguridad existentes (lookup en `agent-os/standards/security/permisos-repo.md` si existe).
4. Modelos de datos que el diseño tocara. (este discovery alimenta el step-03 pre-diseño de persistencia conducido por Dexter)
5. Contratos y reglas del ecosistema externo si el diseño se incorpora a uno (ej. ecosistema centralizado de APIs documentado en path declarado por el usuario).

**Entregable bloqueante de step-02:** Mary consolida el discovery en `agent-os/disenos/{slug}/discovery.md` (plantilla `agent-os/templates/diseno/discovery.md`) respondiendo las 5 preguntas del aterrizaje con EVIDENCIA CITADA (`path:linea` / tabla BD): (1) que se va a hacer, (2) como, (3) que existe y se puede reutilizar o mejorar, (4) como se conecta, (5) como accede el usuario. Principio rector: la fuente de verdad es el codebase y la DB, luego el usuario — investigar a fondo aqui es el contrato, no opcion.

## Cuando viene con evidencia del abordaje

Si step-01-intencion recibio `abordaje_origen{}` (ver step-01 seccion "Insumo del abordaje"), Mary parte de la evidencia validada en lugar de discovery desde cero.

Procedimiento:

1. **Leer `abordaje_origen.evidencia[]`** y registrar en `contexto.md` como hechos verificados (no claims a validar).
2. **Cubrir gaps:** si la evidencia del abordaje no responde alguna pregunta de step-02 (ej. relaciones de dominio entre 3 modulos), Mary invoca subagentes adicionales solo para los gaps.
3. **Ejecutar TR-10 sobre la evidencia ampliada** (paso normal de step-02, ver "Bloqueante de cierre — TR-10 Data flow back-trace" mas abajo). La evidencia inicial cuenta como input — TR-10 verifica que no haya invariantes-puente ocultos en lo nuevo descubierto.

Beneficio: 30-50% menos tiempo de step-02 cuando viene del abordaje.

Si NO hay `abordaje_origen` (`/disenar` invocado directamente por el usuario), discovery desde cero aplica como antes.

## Cuando viene con expediente (gap pre-hecho)

Si step-01 registro `expediente_origen` (el diseño nace de un expediente), el `estado_gap` /
`accion` / evidencia BD de cada requisito seleccionado es **discovery ya hecho** (Dexter lo
produjo en el expediente). Procedimiento:

1. **Leer los requisitos** (`agentos expediente requisitos --slug {slug} --ids {seleccionados}`)
   y registrar su gap en `discovery.md` como hechos verificados (no preguntas a re-investigar).
2. **Cubrir solo huecos:** las 5 preguntas del aterrizaje (especialmente "que existe / que falta")
   parten de ese gap; Mary investiga unicamente lo que el expediente no responde.
3. **TR-10 aplica normal** sobre la evidencia ampliada (invariantes-puente que el gap no cubre).

Beneficio: el discovery no redescubre lo que el expediente ya tiene; el diseño parte de un
gap analysis repo+BD ya validado.

## Pasos

### Paso 0: Detectar sistemas externos accesibles + jerarquia de fuente de verdad

**Antes de identificar fuentes a escanear**, aplica heuristica de detective:

#### Detector de sistema externo accesible

Si las referencias del usuario (registradas en `bitacora.md` paso 0 de step-01) incluyen:

- Docs de un sistema externo (paths tipo `~/.claude/{sistema}/`, `docs/{sistema}/`, archivos `.md` que describen "endpoints", "APIs", "contratos" de un sistema X).
- O nombres de sistemas externos (ej: "el activador", "registry central", "DinamicERP-Central").

Entonces busca si ese sistema externo tiene **codigo accesible** en el mismo workspace o repos hermanos:

1. Listar repos hermanos: `ls {parent-del-repo-actual}/` o pregunta al usuario por la ruta.
2. Si hay match (ej: usuario menciono `~/.claude/integracion/` y existe un repo hermano `activacion` en el workspace), declarar el codigo como **fuente primaria** y las docs como **secundaria**.
3. Si no hay match accesible pero el usuario lo menciono, preguntar al usuario si tiene acceso al repo y donde esta.

#### Jerarquia de fuente de verdad cuando hay multiples fuentes

```
1. Codigo deployado del sistema externo (si accesible) — verdad operativa.
2. Codigo de sistema gemelo que ya consume el sistema externo en produccion — evidencia de uso real.
3. Docs del sistema externo — pueden tener drift, son referencia secundaria.
4. Sintesis del usuario — puede tener brechas, valida con codigo cuando se puede.
```

**Razon:** las docs describen contratos pero el contrato canonico es el codigo. Sistemas gemelos en produccion son evidencia de que el contrato funciona. Cuando hay desacuerdo entre fuentes, el codigo gana sobre las docs.

#### Anti-patron observado en prueba real

En diseño `20260429-granja-registry-link`, las docs decian "X-App-Id puede ser `GRJ-` o `APP-` segun caso". El codigo real del activador validaba estricto contra `APP-{64hex}`. Mary asumio docs = verdad y diseño endpoints con identidad por-granja. En E4 el drift contractual emergio (HF-E4-004) con costo de regreso a E1 + refactor de 4 tareas. Auditar el codigo real del activador en step-02 habria evitado el costo.

#### Output del paso 0

Lista de fuentes a escanear actualizada (entrada del paso 1) con clasificacion explicita:

```yaml
fuentes_a_escanear:
  modulo_huesped:
    path: "src/IhceGateway"
    tipo: primaria-local
  sistema_externo:
    path: "{workspace}/activacion"
    tipo: primaria-canonica  # codigo del sistema externo
    detectado_por: "usuario referencio ~/.claude/integracion/ y existe repo activacion en workspace"
  sistema_gemelo:
    path: "{workspace}/DinamicCOM"
    tipo: evidencia-uso-real
  docs_ecosistema:
    path: "~/.claude/integracion/"
    tipo: secundaria-referencial  # puede tener drift vs codigo
```

### Paso 1: Mary pregunta el modulo huesped si no esta declarado

```
A-Mary: ¿En que modulo del codebase vivira principalmente el feature?
Ejemplos: HistoriaClinica/, Farmacia/, BackOffice/. Si toca varios,
nombra el principal.
```

### Paso 2: Identificar fuentes a escanear (modulo huesped + referencias del usuario)

Mary lista las fuentes a escanear:

1. **Modulo huesped** (siempre): el path identificado en paso 1.
2. **Sistemas gemelos** (si los hay): repos/modulos declarados por el usuario en step-01 como "patron a copiar/imitar" (ej. un repo hermano `DinamicCOM` en el workspace).
3. **Docs de ecosistema** (si las hay): documentacion declarada por el usuario en step-01 (ej. `~/.claude/integracion/`, `agent-os/standards/`).

Las fuentes 2 y 3 vienen de `bitacora.md` del step-01 (paso 0 las registro). Si Mary no las encuentra registradas pero el intent o el razonamiento las menciona, las recupera de ahi.

### Paso 3: Despachar subagents Explore en paralelo

Una llamada por fuente. Para 1-3 fuentes tipico, despachar todos en paralelo en un solo turno.

**Prompt para modulo huesped:**

```
Subagent Explore (medium): escanea {modulo-huesped}. Reporta en <500 palabras:

(a) Patrones de Controllers/Views/BL existentes (3-5 ejemplos representativos).
(b) Reglas heredadas detectables en codigo: validaciones, transformaciones,
    asunciones sobre datos del usuario logueado, dependencias inyectadas.
(c) Tablas de BD tocadas por el modulo (max 10). Para cada una, si es accesible:
    nombre, proposito aparente, y columnas clave. Esta lista es INSUMO del
    step-03 (pre-diseño de persistencia, Dexter). Cuanto mas completa, mejor
    el cimiento de datos.
(d) Standards aplicables encontrados en agent-os/standards/.
(e) Si existe agent-os/standards/security/permisos-repo.md, lista los
    permisos relacionados al modulo (max 10).

NO escribir codigo. Solo reportar.
```

**Prompt para sistema gemelo** (si aplica):

```
Subagent Explore (medium): escanea {repo-gemelo} buscando el patron de
{tema del diseño, ej. "cliente de granja + servidor de registry"}. Reporta:

(a) Como el sistema gemelo implementa este patron: archivos clave, clases,
    estructura, naming.
(b) Decisiones tecnicas observables (politica de cifrado, manejo de errores,
    cache, retries, tolerancia a fallos).
(c) Diferencias estructurales con el modulo huesped que afecten copia
    selectiva (ej. multi-tenancy distinta, framework distinto).
(d) Que conviene copiar literal vs adaptar.

NO escribir codigo. Solo reportar.
```

**Prompt para docs de ecosistema** (si aplica):

```
Subagent Explore (medium): lee {path-docs}. Reporta en <500 palabras:

(a) Contratos del ecosistema relevantes al diseño (APIs, formatos,
    flujos de auth, headers, codigos de error).
(b) Reglas y politicas declaradas (rate limits, TTL, fallback, sincronizacion).
(c) Modelos de datos del lado del ecosistema que el diseño debe respetar
    o consumir.
(d) Gaps detectados (preguntas sin responder en la doc que el implementador
    necesitara aclarar).

NO escribir codigo. Solo reportar.
```

### Paso 3.5: Instanciar y poblar discovery.md (las 5 preguntas)

Con los reportes de los subagentes Explore en mano, Mary instancia `discovery.md` via runtime:

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". NO duplicar — para modificar, editar la fuente. -->

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

```bash
# 1) Escribir el cuerpo con Write a un temporal:
#    Write tool -> .tmp-body.md con las 5 preguntas respondidas con evidencia
# 2) Invocar con --body-file (sin contenido en el JSON):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "discovery.md",
  "file_type": "diseno-discovery",
  "frontmatter": {
    "diseno_slug": "{slug}",
    "gate_discovery": "pendiente"
  }
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

Mary llena las 5 preguntas con evidencia citada de los reportes + lectura directa del codebase/BD. La pregunta 3 (que existe reutilizable) es obligatoria: Mary lista lo que YA ofrece el codebase con cita y marca reutilizar/mejorar/construir-nuevo. Si una pregunta no aplica por greenfield, declara "no aplica — greenfield" con razon estructural (analogo a anchor vacio justificado). NO se cierra step-02 con una pregunta vacia sin esa declaracion.

### Paso 4: Consolidar reportes en `contexto.md`

Mary integra los N reportes recibidos. Si hay sistema gemelo, agrega seccion explicita "## Comparacion con sistema gemelo" donde nombra que copiar literal y que adaptar (anti-patron: copia mecanica sin justificacion). Si hay docs de ecosistema, agrega seccion "## Reglas del ecosistema" con los contratos relevantes.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". NO duplicar — para modificar, editar la fuente. -->

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

```bash
# 1) Escribir el cuerpo con Write a un temporal:
#    Write tool -> .tmp-body.md con el contenido de contexto.md
# 2) Invocar con --body-file (sin contenido en el JSON):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "contexto.md",
  "file_type": "diseno-contexto"
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

El cuerpo de contexto.md:
```
# Contexto del modulo huesped

## Modulo

{ruta-relativa}

## Patrones existentes

{tabla con 3-5 patrones tipo Controller/View/BL/Service}

## Reglas heredadas detectadas

| # | Regla | Fuente | Notas |
|---|-------|--------|-------|

## Modelos de datos relacionados

{tabla de 5-10 tablas/entidades clave}

## Standards aplicables

{lista de standards encontrados con ruta y aplicabilidad}
```

### Paso 5: Crear `reglas-heredadas.md` extraido del paso 4

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". NO duplicar — para modificar, editar la fuente. -->

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

```bash
# 1) Escribir el cuerpo con Write a un temporal:
#    Write tool -> .tmp-body.md con el contenido de reglas-heredadas.md
# 2) Invocar con --body-file (sin contenido en el JSON):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "reglas-heredadas.md",
  "file_type": "diseno-reglas-heredadas"
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

El cuerpo de reglas-heredadas.md:
```
# Reglas heredadas del modulo huesped

> Reglas que el diseño DEBE respetar porque ya existen en el sistema.
> Cada regla con fuente verificable. Mary consolido del subagent en step-02.

## Globales (aplican a >=2 procesos)

| # | Regla | Fuente | Razon de existencia |
|---|-------|--------|---------------------|
| RH-G1 | ... | ... | ... |

## Por modulo

(seccion por modulo si el diseño toca mas de uno)

## Banderas para Sentinel

(reglas relacionadas con permisos/auditoria/datos sensibles que requieren
su revision en step-04)
```

### Paso 6: Mary actualiza el README del diseño con `modulo_huesped` poblado

### Paso 7: Contrastacion entre fuentes (cuando aplica)

Si tienes >=2 fuentes que describen el mismo contrato externo (ej. docs del ecosistema + codigo gemelo + codigo del sistema externo), **antes de cerrar step-02**, ejecuta contrastacion explicita:

#### Procedimiento

1. Lista los puntos del contrato: autenticacion (headers, firma), endpoints (rutas, verbos), formatos de respuesta (envoltura, campos), reglas (rate limit, TTL, fallback).
2. Para cada punto, contrasta lo que dice cada fuente:
   - ¿Las docs describen lo mismo que el codigo del sistema externo?
   - ¿El codigo gemelo implementa lo que dicen las docs?
3. Si hay drift entre fuentes, NO asumas cual es la verdad. Marca el punto como "ambiguo" en `contexto.md` seccion nueva "## Drifts observados entre fuentes".
4. Cada drift queda como bandera para step-04 — debe resolverse al modelar el proceso afectado, NO en E4 del work consumidor.

#### Output: seccion nueva en `contexto.md`

```markdown
## Drifts observados entre fuentes (cuando aplica)

| Punto del contrato | Docs dicen | Codigo gemelo hace | Codigo sistema externo hace | Resolucion |
|---------------------|------------|---------------------|------------------------------|------------|
| Identidad para registry | "X-App-Id puede ser GRJ- o APP-" | usa APP- siempre | valida estricto contra APP-{64hex} | Codigo gana: APP- por empresa-licencia |
| Wrapper de respuesta | no documentado | `{error,mensaje,dato}` | `{error,mensaje,dato}` | Codigo gemelo + sistema externo concuerdan: usar wrapper |
```

#### Anti-patron a evitar

Cerrar step-02 con `contexto.md` y `reglas-heredadas.md` que listan reglas de cada fuente por separado SIN contrastar entre si. Los drifts emergen en E4 del work consumidor con costo alto. La inversion de tiempo en contrastar aqui (15-30 min) ahorra horas de reevaluacion downstream.

#### Cuando saltar este paso

Si las fuentes describen aspectos NO superpuestos (ej: modulo huesped describe arquitectura interna del repo + docs ecosistema describe contratos externos — no hay solapamiento), saltar contrastacion. Mary lo declara: `A-Mary: Las fuentes no se solapan en contratos. Salto contrastacion del paso 7.`

## Procesar claims pendientes de step-01 (paso bloqueante previo a TR-10)

<!-- FUENTE del principio de autoridad epistemologica en brownfield: agent-os/skills/host-protocol/references/autoridad-brownfield.md seccion "Autoridad epistemologica en brownfield". -->

**Antes de ejecutar TR-10, Mary procesa los claims que step-01 dejo pendientes** (camino C del paso 3.5.4 de step-01: hipotesis con `pendiente_validacion_codebase: true`, o claims diferidos por override del usuario).

Para cada claim pendiente:

1. Aplicar el procedimiento del paso 3.5.3 de step-01 (busqueda concreta en codigo). Esta vez con mas tiempo si fue diferido por ambiguedad.
2. Aplicar uno de los tres caminos del paso 3.5.4 (codebase confirma / codebase contradice / aun ambiguo).
3. Si despues de profundizar sigue ambiguo, escalar al usuario en lugar de dejarlo en el brief sin resolver.

Output: actualizar `## Claims validados contra codebase` en `intent.md` con los items procesados aqui (mover de "pendiente" a "confirmado / contradicho / decision tomada").

**Anti-patron a evitar:** ignorar los claims pendientes en step-02 con la idea de que "TR-10 los va a cubrir". TR-10 es barrido sistematico sobre el catalogo del brief; no es validacion de claims especificos del usuario. Si los claims pendientes no se procesan aqui explicitamente, contaminan el modelado de step-02..06.

## Bloqueante de cierre — TR-10 Data flow back-trace

Antes de presentar el menu P/C de cierre, Mary verifica si TR-10 aplica:

**TR-10 es bloqueante** si en `contexto.md` se declararon:
- `>=1 dependencia reusable` (services, contextos, helpers, middleware reusables del modulo huesped que el diseño consumira), **o**
- `>=2 actores distintos` (ej. usuario empresa + operador soporte; usuario externo + sistema interno; etc.).

Razon: TR-10 mira hacia adentro del codigo existente y declara **invariantes-puente** que el brief debe respetar. Red-team (en step-08) mira hacia afuera y no caza contradicciones internas entre brief y codigo. Sin TR-10, los invariantes-puente emergen en E3/E4 del work consumidor con costo de reevaluacion alta. Caso real: work `20260430-backoffice-eri-impl` reevaluo E3->E1 por invariante-puente "operador ERI no es tenant" que no se declaro en step-02.

**Relacion con la validacion inline de step-01:** step-01 valido claims **especificos del usuario** sobre codigo existente. TR-10 aqui ejecuta barrido **sistematico** sobre actores/reusables del catalogo del brief — incluyendo aquellos que el usuario no menciono explicitamente como claim. Con step-01 ejecutado correctamente, TR-10 trabaja sobre input ya validado y solo detecta invariantes-puente residuales (los del catalogo no nombrado). Sin step-01 (override), TR-10 carga con todo el costo de validacion tardia y debe procesar tambien los claims diferidos.

### Si TR-10 aplica: ejecutar antes del menu

Mary ejecuta la plantilla `agent-os/skills/advanced-elicitation/plantillas/data-flow-backtrace.md` sobre `contexto.md` y `reglas-heredadas.md` en construccion.

**Antes de anexar y propagar, Mary presenta los invariantes-puente detectados al usuario via el loop de validacion de hallazgos** (en pantalla: analisis + hallazgos + solucion propuesta; menu de 4 caminos en el cuerpo, prompt libre). Los `INV-PUENTE-NN` son hallazgos crudos: el usuario los acepta (A), profundiza con otra tecnica (B, ej. TR-02 red-team), cancela y vuelve al gate (C), o aporta contexto/opinion (D). Solo cuando el usuario elige A se anexan y propagan.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Interacción con técnicas bloqueantes (TR-10 en el FOCO, TR-02 step-08)". Aqui se indica que los invariantes-puente de TR-10 pasan por el loop antes de anexarse. NO duplicar la regla — para modificar, editar la fuente. -->

Tras el camino A del loop, Output:

- Tabla `## Invariantes-puente` anexada a `contexto.md` (o seccion equivalente, decidir donde tiene mas sentido).
- Cada `INV-PUENTE-NN` aceptado se propaga a step-04 como regla heredada explicita o a step-07 como restriccion de modelado.
- Entrada(s) en `bitacora.md` por cada turno del loop con `hereda_de:` (incluso si 0 invariantes-puente nuevos detectados).

### Si TR-10 NO aplica: declararlo explicitamente

Si el diseño no toca codigo existente (modulo nuevo aislado, sin dependencias reusables, un solo actor), Mary declara en `bitacora.md`:

```
## YYYY-MM-DD — TR-10 no aplica en step-02

Razon: {0 dependencias reusables Y 1 solo actor | otro motivo concreto}.
contexto.md no declara dependencias reusables a contrastar.
```

### Override del usuario (saltar TR-10 a pesar de que aplique)

Si el usuario decide saltarlo (brief muy pequeño, urgencia justificada, etc.), Mary registra:

```
## YYYY-MM-DD — Override TR-10 en step-02

Usuario salto TR-10. Razon: {razon textual del usuario}.
Riesgo asumido: invariantes-puente no detectados podrian emerger en E3/E4
del work consumidor con costo de reevaluacion alta.
```

Nota: elegir el camino C (cancelar y volver al gate) dentro del loop de hallazgos de TR-10 equivale a ESTE override — TR-10 es bloqueante, asi que C no descarta en silencio: registra esta misma entrada de override con el riesgo asumido. Ver loop-validacion-hallazgos.md seccion "Asimetria de C".

NO se salta sin entrada en bitacora — el cierre del step verifica que exista una de las tres entradas (TR-10 ejecutado / no aplica / override).

## Cierre

### Verificacion mecanica de citas (previo al menu)

Mary recolecta las citas ancladas de `discovery.md` y `contexto.md` en un
payload `{"citas":[{"archivo","linea","fragmento"}]}` (archivo temporal) y corre:

    agentos -C {raiz} citas verificar --input {tmp}

- `fragmento_movido` -> actualizar la linea en el artefacto (drift menor, no bloquea).
- `fragmento_no_encontrado` / `archivo_no_existe` -> la afirmacion se degrada a
  `sin-evidencia`: Mary la re-ancla (releyendo la fuente real) o la retira antes
  de firmar el gate. El gate NO cierra con afirmaciones `sin-evidencia` sobre
  codigo existente (regla ya vigente del template, ahora verificada).

<!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Verificacion en dos capas". Aqui solo el procedimiento de invocacion en step-02; semantica de veredictos y congruencia viven en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

```
A-Mary: Contexto consolidado. He identificado:

- {N} patrones existentes en el modulo.
- {M} reglas heredadas (de las cuales {K} levantan banderas para Sentinel).
- {L} tablas de BD relacionadas.
- {Q} dependencias reusables y {R} actores declarados.

{Si TR-10 ejecutado:}
  TR-10 detecto {K} invariantes-puente: INV-PUENTE-01..0{K}.
{Si TR-10 no aplica o override:}
  TR-10 {no aplicaba | saltado por override del usuario}. Registrado en bitacora.

Estado del gate de discovery: {las 5 preguntas con evidencia | pregunta(s) N sin evidencia}.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):
  P — invitar a Sentinel (si {K} > 0 ya hay banderas) o a Winston (si arquitectura
      relevante). Mary declara que archivos/tablas leera el invitado antes de opinar.
  C — continuar a step-03 (pre-diseño de persistencia).
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". El gate de las 5 preguntas (discovery.md) es bloqueante de step-02; el gate de anchor aplica a P. NO duplicar la regla — para modificar, editar la fuente. -->

**Bloqueante:** NO ofrecer C mientras alguna de las 5 preguntas de discovery.md quede sin evidencia citada (o sin "no aplica greenfield" justificado). Si el usuario fuerza el cierre, registrar override en bitacora con riesgo asumido. Y si Mary no puede declarar anchor (encontrado / vacio-justificado) para invitar a un experto: NO ofrecer P.

## Post-condicion

- `contexto.md` y `reglas-heredadas.md` poblados.
- `discovery.md` poblado con las 5 preguntas, cada una con evidencia citada (o "no aplica greenfield" justificado). gate_discovery: completo (u override registrado).
- README actualizado con `modulo_huesped`.
- `bitacora.md` registra estado de TR-10 (ejecutado / no aplica / override).
- Si TR-10 ejecutado y produjo invariantes: `## Invariantes-puente` en `contexto.md` o equivalente, propagado a step-04/step-07.
- Si C: avanzar a step-03.

## Prohibiciones

- NO definir procesos aun.
- NO escribir mockups.
- NO leer step-03.
- NO cerrar step-02 sin que `bitacora.md` tenga una de las 3 entradas de TR-10 (ejecutado / no aplica / override).
- NO cerrar step-02 con una pregunta de discovery.md sin evidencia citada (salvo "no aplica greenfield" justificado u override del usuario en bitacora).
- NO invocar una tecnica adversarial voluntaria ni ofrecer P (invitar experto) sin declarar el anchor (la evidencia ya esta en discovery.md — usarla). Las dos bloqueantes —TR-10 aqui, TR-02 en step-08— tienen anchor implicito por diseño y no lo declaran.
