# step-01: Intencion

> **Regimen `lineal`.** Este step sirve a diseños creados antes de que el modelo
> existiera (`flujo: lineal` o ausente en el README del diseño). El flujo nuevo
> entra por `modo-inicial/step-01-foco.md`. Un diseño lineal puede reanudarse y
> retroceder por aqui, pero **para cerrar una etapa nueva reconstruye primero**:
> ver `../reconstruir.md`.

> **Disciplina BMAD-style:** lee este archivo completo antes de actuar. Ejecuta en orden estricto. Termina ofreciendo solo C (continuar). step-01 no ofrece tecnica adversarial ni party — eso requiere codebase escaneado (step-02). Prohibido planear pasos futuros desde aqui.

## Pre-condicion

- Comando invocado: `/disenar iniciar "{descripcion}"`.
- No existe diseño con el slug derivado de la descripcion.

## Mision del step

Extraer del usuario:

1. **intent** — 1 frase de 15-30 palabras: que producto/feature debe quedar LISTO PARA IMPLEMENTAR al cerrar este diseño.
2. **out_of_scope** — bullets de cosas que el diseño NO cubre.
3. **slug** — derivado mecanicamente de la fecha + descripcion + dominio.

NO se discute aqui: implementacion, mockups, contratos, pipeline. Solo intencion.

## Insumo del abordaje (cuando aplica)

Cuando `/disenar` es invocado **internamente desde `/alfred`** (ruta `diseno` destilada del abordaje), llega con un bloque de evidencia ya recolectada y validada. Esa evidencia es **insumo de step-01**, no se redescubre.

Estructura del insumo:

```yaml
abordaje_origen:
  realizado_en: "YYYY-MM-DD"
  evidencia: [...]              # bullets con citas path:linea
  drifts_detectados: [...]      # tabla
  expertos_invitados: [...]     # quien aporto que
  ruta_propuesta: "diseno"
```

Mary lee este bloque al activarse y:

1. **NO redescubre lo que ya esta validado.** Las citas son input, no preguntas a re-validar.
2. **Procesa drifts pendientes si los hay.** Si abordaje detecto drifts y los marco como `pendiente_validacion_codebase: true`, Mary los aborda en step-01 antes de cualquier otra cosa.
3. **Continua step-01 normal** con el contexto pre-validado. El paso 0 (leer referencias declaradas) sigue aplicando, pero las referencias que ya estan en `abordaje_origen.evidencia` no se releen — se citan directamente.

Si `/disenar` es invocado **directamente por el usuario** (sin venir de `/alfred`), `abordaje_origen` no existe. Mary ejecuta step-01 desde cero como antes.

## Insumo del expediente (cuando el diseño nace de un expediente)

Cuando el usuario expresa **en prosa** que quiere diseñar asociado a un expediente
("diseñemos la fase de contratación del expediente SIIFA"), Mary NO pide flags. Ejecuta
el **paso 0.5 (asociación a expediente)** antes de la pregunta única:

1. **Resolver el expediente.** `agentos expediente listar`. Si la prosa nombra uno y matchea,
   usarlo; si hay ambiguedad, `AskUserQuestion` con la lista. Si no existe ninguno que matchee,
   Mary lo dice y ofrece crearlo con `/expediente` primero (NO lo crea inline).
2. **Desplegar los requisitos.** `agentos expediente requisitos --slug {slug}` (via Bash, sin BOM).
   Presentar la lista legible (tabla: `id · enunciado corto · estado_gap · [ya trazado a diseño Y]`).
   Selección: si caben en <=4 grupos (p.ej. por fase de la norma), `AskUserQuestion` multiSelect;
   si son muchos, listar numerados y el usuario indica en prosa cuales cubre. NO obligar a teclear IDs.
3. **Registrar la selección** como `expediente_origen{slug, requisitos_seleccionados[]}` en contexto.

El intent (paso 3) se **sintetiza** de los requisitos seleccionados: Mary redacta una frase-objetivo
que los engloba y el usuario la aprueba/ajusta. El paso 3.5 (validacion de claims) se alivia: los
requisitos ya traen gap validado por Dexter; Mary no re-valida lo que el expediente investigo.

Al **crear la estructura** (paso 7), Mary hornea en el README:
- `expediente_origen: {slug}`
- `requisitos_cubiertos:` con cada requisito seleccionado en `estado: pendiente`.

Y traza cada uno (cierra el loop del spec 1):

```bash
for id in {ids seleccionados}; do
  agentos expediente trazar --slug {expediente} --requisito $id --diseno {diseno-slug}
done
```

Si `/disenar` se invoca SIN expediente (caso normal), este paso no aplica: step-01 corre como antes.

<!-- El verbo de lectura y trazado nace de una spec dedicada del repo fuente del sistema (no se distribuye). El gate de cobertura se hace cumplir en step-09 + el guard del runtime. -->

## Pasos a ejecutar

### Paso 0 (obligatorio antes de cualquier pregunta): leer referencias declaradas por el usuario

**Antes de plantear pregunta alguna**, Mary identifica y lee TODAS las referencias declaradas explicitamente por el usuario en la descripcion inicial del comando `/disenar iniciar "..."`. Esto incluye:

1. **Paths absolutos o relativos** mencionados (ej. `~/.claude/integracion/`, una ruta absoluta a otro repo del workspace, `src/IhceGateway/Infrastructure/Security/`).
2. **Nombres de sistemas, repos, modulos o componentes** (ej. "DinamicCOM", "el activador", "registry").
3. **Documentacion** referenciada por nombre (ej. "ver la documentacion de Integracion", "el README declara que...").
4. **Identidad del repo huesped:** verificar SIEMPRE `README.md`, `agent-os/product/` (si existe), y nombre real del repo via `git config --get remote.origin.url` o lectura del path actual. **NO asumir** que el nombre del slug derivado del comando = identidad del repo.

Para cada referencia:
- Si es un path: ejecutar `Read` o despachar subagent `Explore` con prompt acotado a esa ruta.
- Si es un nombre de sistema: localizar via `Glob` o pregunta minima al usuario si el path no es deducible.
- Si es documentacion: leer al menos el README/index/overview de la fuente declarada.

**Resultado de paso 0:** Mary tiene en contexto el material referenciado por el usuario antes de proponer redaccion del intent. Si despues de leer una referencia surge ambiguedad sobre la identidad del diseño (ej. "el repo es X o se incorpora a X"), Mary la nombra explicitamente y la pregunta antes de avanzar.

**Anti-patron a evitar:** plantear la pregunta unica del paso 1, recibir intent del usuario, redactar intent en frontmatter, y solo entonces leer las referencias. Esto produce intent erroneo que requiere retroceso. Si la descripcion declara referencias, leerlas primero es contrato, no opcion.

**Excepcion:** si la descripcion del usuario NO declara referencias explicitas (caso comun de bugs simples o features muy acotadas), saltar paso 0 y avanzar directamente a paso 1. Mary lo declara: `A-Mary: La descripcion no menciona referencias externas. Avanzo directo a la pregunta unica.`

### Paso 1: Mary se presenta y plantea pregunta unica

```
A-Mary: Vamos a aterrizar "{descripcion}". Primero, dime en una sola frase:
¿que producto o feature debe quedar listo para implementar al cerrar este diseño?
```

Si Mary leyo referencias en paso 0, lo declara antes de la pregunta:

```
A-Mary: Antes de avanzar, lei las referencias que mencionaste:
- {ref 1}: {1 frase de lo que entendi}
- {ref 2}: {1 frase de lo que entendi}

Vamos a aterrizar "{descripcion}". Primero, dime en una sola frase:
¿que producto o feature debe quedar listo para implementar al cerrar este diseño?
```

### Paso 2: Recibir respuesta del usuario

Si es vaga ("hacer X mejor", "limpiar Y"), Mary refina:

```
A-Mary: Para que el diseño tenga un cierre claro, ¿podrias decirme: que sera
posible hacer al cerrar el diseño que hoy NO es posible? ¿que componentes
existiran y que producirian?
```

### Paso 3: Validar redaccion del intent contra 4 reglas (analogas a las de meta)

- Estado del producto a implementar, no proceso del diseño.
- Autocontenida (un lector en 6 meses entiende sin contexto).
- Verificable (un PM puede decir "esto se logro o no").
- Anti-redundancia (eliminar clausulas cubiertas por otras).

Si viola algun principio, Mary propone reescritura y consulta. NO se avanza con intent que viole reglas, salvo override explicito del usuario registrado en `bitacora.md`.

**Validacion adicional:** si en paso 0 Mary leyo referencias del usuario, confronta el intent propuesto contra esas referencias antes de aprobarlo. Si hay contradiccion (ej. el intent dice que el diseño es para el repo X pero las referencias indican que el repo X no existe o tiene otra naturaleza), Mary lo nombra explicitamente y pide aclaracion. Esto previene el anti-patron "fijar intent erroneo y descubrirlo recien en un paso posterior, cuando corregirlo ya cuesta mas".

### Paso 3.5 (BLOQUEANTE): Validacion inline de claims sobre codigo existente

<!-- FUENTE del principio de autoridad epistemologica en brownfield: agent-os/skills/host-protocol/references/autoridad-brownfield.md seccion "Autoridad epistemologica en brownfield". Aqui solo se documenta la mecanica operativa para step-01. NO duplicar el principio — para modificar la regla, editar host-protocol. -->

**Antes de avanzar al paso 4, Mary detecta y valida claims del usuario sobre codigo existente.** Este paso es bloqueante: el usuario es autoridad sobre **que quiere lograr**, pero el codigo es autoridad sobre **como esta hecho lo que ya existe**. Validar aqui (5-15 min por claim) ahorra reevaluacion en E3/E4 del work consumidor (horas de retrabajo).

#### 3.5.1 — Detectar claims sobre codigo existente

Mientras el usuario describio el intent y razono sobre por que existe el diseño, Mary escucho frases del tipo:

- "esto se conecta con [sistema/modulo/repo]"
- "hereda auth de [middleware/handler/scheme]"
- "consume el service [IXxxService] / la tabla [X] / el endpoint [Y]"
- "reusa el contrato / patron / contexto [Z]"
- "el actor [usuario/operador] resuelve sesion / permisos / tenant asi"
- "en el sistema gemelo [eMedicoMVC/DinamicERP/...] esto funciona asi"
- "el flujo actual hace X y vamos a hacerlo Y"

Cada uno de esos es un **claim sobre como funciona codigo existente**. Mary los lista internamente. Si en paso 0 leyo referencias del usuario, los claims pueden venir tanto de la descripcion inicial como de la conversacion sobre el intent.

**Si Mary detecta 0 claims:** declarar `A-Mary: No detecte claims tuyos sobre codigo existente. Avanzo al paso 4.` y continuar. Caso comun en diseños greenfield o features muy aisladas.

**Si Mary detecta >=1 claim:** continuar con 3.5.2.

#### 3.5.2 — Anunciar al usuario que va a validar

Mary lista los claims detectados al usuario explicitamente:

```
A-Mary: Antes de seguir, escuche {N} claims tuyos sobre como se conecta esto
        con codigo existente:

        1. "{claim 1 textual o parafraseado}"
        2. "{claim 2 textual o parafraseado}"
        ...

        Para no diseñar sobre supuestos, voy a validar cada uno contra el
        codigo del repo. Toma ~5-10 minutos por claim. ¿Lo hago ahora o
        prefieres pausar y retomar cuando tengas tiempo de revisar conmigo?
```

Esto NO es performance de consulta — es contrato del step. El usuario puede pausar (el diseño queda en step-01 con `bitacora.md` registrando los claims pendientes) o aprobar continuar. NO se avanza al paso 4 con claims no validados.

**Anti-patron a evitar:** anunciar "voy a validar" sin nombrar los claims uno por uno. Sin la lista explicita, el usuario no puede corregir un claim mal capturado por Mary.

#### 3.5.3 — Validar cada claim contra el codigo

Para cada claim, Mary ejecuta busqueda concreta en el repo huesped (y reusables relevantes si el claim los menciona):

```bash
# Ejemplos de validaciones segun tipo de claim:

# Claim sobre service reusable:
rg --type=cs "(class|interface)\s+IEmpresaService\b" {repo}
rg --type=cs "IEmpresaService" {repo}/src/

# Claim sobre middleware/handler:
rg --type=cs "TokenOfuscadorAuthHandler\b" {repo}
rg --type=cs "AuthenticationHandler<" {repo}

# Claim sobre actor/contexto:
rg --type=cs "ITenantContext\b" {repo}
rg --type=cs "_tenantContext\." {repo} | head -10

# Claim sobre tabla/entidad:
rg --type=cs "DbSet<{Entidad}>" {repo}
rg --type=cs "[Table\(\"{TABLA}\"\)]" {repo}

# Claim sobre sistema gemelo:
rg --type=cs "{patron-mencionado}" {repo-gemelo}/src/
```

Mary reporta para cada claim:

- Archivo:linea de la definicion encontrada (o "no encontrada").
- Cita textual de la firma / contrato / asuncion implicita.
- Comparacion contra el claim del usuario.

#### 3.5.4 — Tres caminos al validar

**Camino A — Codebase confirma el claim:**

```
A-Mary: Confirmado. "TokenOfuscadorAuthHandler" existe en
        src/IhceGateway/Auth/TokenOfuscadorAuthHandler.cs:12. Hereda de
        AuthenticationHandler<TokenOfuscadorOptions> y se registra en
        Program.cs:45. La descripcion del usuario coincide con el codigo.

        Lo registro como hecho validado en intent.md con cita real.
```

Mary reemplaza "segun el usuario" por la cita real en `intent.md` seccion "Razonamiento" o en seccion nueva "Claims validados contra codebase".

**Camino B — Codebase contradice el claim:**

```
A-Mary: Aqui tengo divergencia. Dijiste que "el operador BackOffice-ERI
        opera con TenantContext resuelto como cualquier API". El codigo
        del repo dice otra cosa:

        - src/IhceGateway/Infrastructure/Tenant/TenantContext.cs:23: la
          propiedad TenantResuelto es false hasta que el TenantResolutionMiddleware
          (Program.cs:78) la setee.
        - El middleware se registra solo para rutas de API publica
          (/api/empresa/*); no se ejecuta para las rutas del panel
          (/backoffice-eri/*).
        - Conclusion: el operador BackOffice-ERI invocaria services con
          TenantContext.TenantResuelto = false. Cualquier service legacy
          que asuma lo contrario se rompe por construccion.

        Tres caminos posibles. ¿Cual eliges?

        (a) Tu memoria estaba imprecisa — usemos lo que dice el codigo.
            Modifico intent/razonamiento para reflejar que el operador
            no resuelve TenantContext y que los services reusables
            requieren envoltura. Modulo se modela considerando esto.
        (b) El codigo tiene un bug — el middleware deberia ejecutarse
            tambien para /backoffice-eri/*. Si tomamos este camino,
            es cambio al codigo existente, lo declaro como decision
            explicita: "el diseño incluye corregir el alcance de
            TenantResolutionMiddleware". Eso amplia el scope del work
            consumidor; ¿lo aceptas?
        (c) Quieres que en el futuro funcione como dijiste, pero
            entiendes que requiere refactor previo. Eso es un work
            adicional o un sub-objetivo declarado de este. ¿Cual?
```

`AskUserQuestion` con esas opciones. NO se elige por defecto. NO se reescribe el codigo en silencio. NO se reescribe el intent en silencio.

**Camino C — Validacion ambigua o parcial:**

```
A-Mary: Validacion parcial. "ConfiguracionIhceService" existe pero su
        firma no me deja decidir si tu claim sobre cascada empresa->global
        coincide. Necesito leer mas codigo (~10 min adicionales) o
        diferir la validacion a step-02 explicitamente como hipotesis
        abierta.

        ¿Profundizo ahora o lo registro como H-S01-NN pendiente
        validacion?
```

Si el usuario elige diferir, Mary registra en `bitacora.md` como hipotesis explicitamente marcada `pendiente_validacion_codebase: true`. Step-02 la consume primero, antes de cualquier otra decision.

#### 3.5.5 — Output del paso 3.5

Tras procesar todos los claims, Mary actualiza `intent.md`:

- Seccion `## Razonamiento`: las afirmaciones sobre codigo existente que se validaron quedan con cita real (`archivo:linea`). Las que se contradijeron y se decidio "usar lo que dice el codigo" (camino A) se reescriben.
- Seccion nueva `## Claims validados contra codebase` (al final del intent.md):

```markdown
## Claims validados contra codebase

| # | Claim del usuario | Validacion | Decision |
|---|-------------------|-----------|----------|
| 1 | "operador BackOffice-ERI opera con TenantContext resuelto" | CONTRADICHO — TenantResolutionMiddleware no se ejecuta para /backoffice-eri/* (Program.cs:78) | Camino (a): usar lo que dice el codigo. Operador no resuelve TenantContext; services reusables requieren envoltura. |
| 2 | "hereda auth de TokenOfuscadorAuthHandler" | CONFIRMADO — TokenOfuscadorAuthHandler.cs:12 + Program.cs:45 | Cita real registrada en razonamiento. |
| 3 | "consume EmpresaService legacy" | PARCIAL — service existe pero asume ITenantContext.IdEmpresa. Pendiente validar contrato completo. | Diferido como H-S01-NN pendiente_validacion_codebase. step-02 valida primero. |
```

Y registra en `bitacora.md`:

```markdown
## YYYY-MM-DD — step-01 paso 3.5: validacion inline de claims sobre codigo existente

Detectados {N} claims del usuario sobre codigo existente:
- {N1} confirmados → cita real registrada en intent.md.
- {N2} contradichos → decision usuario: {camino a/b/c por cada uno}.
- {N3} parciales/ambiguos → diferidos a step-02 como H-S01-NN pendiente_validacion_codebase.

Tiempo invertido: {minutos}.
```

#### 3.5.6 — Override del usuario (saltar validacion)

Si el usuario decide explicitamente saltar la validacion ("no tengo tiempo, sigamos y lo vemos en step-02", "confio en mi descripcion"), Mary registra:

```markdown
## YYYY-MM-DD — Override paso 3.5 en step-01

Usuario salto validacion inline de {N} claims. Razon: {razon textual}.
Riesgo asumido: claims no validados podrian contradecir el codebase
y emerger como invariantes-puente en step-02 (TR-10) o en E3/E4 del
work consumidor con costo de reevaluacion alta.

Claims diferidos:
- {claim 1}
- {claim 2}
- ...
```

Step-02 los procesa primero como hipotesis pendientes. NO se salta sin entrada en bitacora.

### Paso 4: Preguntar por out_of_scope

```
A-Mary: Para acotar el diseño, dime 3-5 cosas que explicitamente NO se diseñan
aqui. Ejemplos genericos: "no se diseña la migracion del modulo X", "no se
diseña el manual de usuario", "no se diseña el flujo de Y aunque esta cerca".
```

### Paso 5: Recibir lista de out_of_scope

Si el usuario dice "no se me ocurre nada", Mary propone 3 candidatos basados en la descripcion y pide confirmar/descartar.

### Paso 6: Derivar slug

- Formato: `{YYYYMMDD}-{slug-corto-de-descripcion}`.
- Ejemplo: `20260429-solicitud-insumos-aplicacion-medicamentos`.

### Paso 7: Crear estructura inicial

```bash
mkdir -p agent-os/disenos/{slug}/{procesos,hallazgos}
```

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". NO duplicar — para modificar, editar la fuente. -->

Crear el README via runtime con frontmatter completo:

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

```bash
# 1) Escribir el cuerpo con Write a un temporal (sin escapado):
#    Write tool -> .tmp-body.md con el cuerpo completo del README
# 2) Invocar con --body-file (metadata por stdin, sin contenido):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "README.md",
  "file_type": "diseno-readme",
  "frontmatter": {
    "slug": "{slug}",
    "intent": "{intent literal}",
    "out_of_scope": ["{bullet 1}", "{bullet 2}"],
    "estado": "EN_DISENO",
    "brief_version": 1,
    "fecha_inicio": "{YYYY-MM-DD}",
    "fecha_fin": null,
    "autor": "{nombre usuario activo}",
    "modulo_huesped": "",
    "procesos": [],
    "es_paraguas": false,
    "plan_works": [],
    "hallazgos_pendientes": 0,
    "hallazgos_aplicados": 0,
    "persistencia_resuelta": false,
    "datos_md_version": 1
  }
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

El cuerpo del README contiene:
```
# Diseño: {titulo derivado de intent}

## Intent

{Parrafo breve que expande la frase del frontmatter.}

## Out of scope

{Bullets de cosas que NO se disenan aqui.}

## Estado

- **Estado:** EN_DISENO
- **brief_version:** 1
- **Anfitriona:** Mary
- **Procesos identificados:** 0
- **Works consumidores activos:** ninguno
- **Persistencia resuelta:** false

## Procesos

| ID | Nombre | Actor | Modulo huesped |
|----|--------|-------|----------------|

## Bitacora

Ver `bitacora.md` para historial cronologico.

## Hallazgos

Ver `hallazgos/` para hallazgos del retroceso bidireccional.
```

### Paso 8: Crear `intent.md` standalone

Si en paso 0 se leyeron referencias, su sintesis va integrada en la seccion `## Razonamiento` del intent.md (Mary parafrasea como entendio cada referencia y como informa el diseño). Esto deja constancia auditable de que las referencias se leyeron y como se interpretaron.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

```bash
# 1) Escribir el cuerpo con Write a un temporal:
#    Write tool -> .tmp-body.md con el contenido de intent.md
# 2) Invocar con --body-file (sin contenido en el JSON):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "intent.md",
  "file_type": "diseno-intent"
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

El cuerpo de intent.md:
```
# Intent

{Intent literal del frontmatter}

## Razonamiento

{2-3 parrafos del usuario explicando por que este diseño existe ahora,
que motivo concreto lo dispara, que se gana al lograrlo. Mary los
transcribe de la conversacion sin embellecer.}

## Out of scope

- {bullet 1}
- {bullet 2}
```

### Paso 9: Inicializar `bitacora.md`

Si en paso 0 se leyeron referencias, registrar en bitacora la lista de referencias leidas (paths, fuentes, sintesis 1 linea de cada una). Esto permite a steps futuros saber que material esta en contexto sin re-leerlo.

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
cat > agent-os/disenos/{slug}/bitacora.md <<'EOF'
# Bitacora del diseño

## {fecha actual} {hora} — step-01 cerrado

Intent declarado: "{intent literal}".
Out of scope: {N} items.
Slug: {slug}.

Anfitriona: Mary [DI].
EOF
```

## Cierre

Mary muestra al usuario:

```
A-Mary: Diseño creado en agent-os/disenos/{slug}/. Tienes:

- intent: "{intent literal}"
- out_of_scope: {N} items
- slug: {slug}
{Si paso 3.5 ejecutado:}
- claims sobre codigo existente: {N1} confirmados, {N2} contradichos
  (decisiones registradas), {N3} diferidos a step-02 como pendientes
  validacion.
{Si paso 3.5 salteado por override:}
- claims sobre codigo existente: salteados por override del usuario,
  registrados en bitacora para procesamiento prioritario en step-02.

Siguiente paso:
  C — continuar a step-02 (contexto: escanear modulo huesped y producir discovery.md)

Las tecnicas adversariales (TR-NN) y party NO se ofrecen aqui: requieren anchor
en el codebase, que aun no se ha escaneado (eso es step-02). Adversariar sobre el
intent sin codebase es opinion flotante. step-01 ya valido los claims del usuario
contra el codigo (paso 3.5) — esa es la unica confrontacion con hechos posible aqui.
Tras discovery.md (step-02), las tecnicas se habilitan con anchor.
```

## Post-condicion

- `agent-os/disenos/{slug}/` existe con README.md, intent.md, bitacora.md.
- Estructura `procesos/` y `hallazgos/` creadas vacias.
- `intent.md` con seccion `## Claims validados contra codebase` si se detectaron claims, o ausencia explicita si Mary declaro 0 claims.
- `bitacora.md` registra estado del paso 3.5 (ejecutado / 0 claims / override).
- Si C: avanzar a `step-02-contexto.md`. (step-01 no ofrece P ni tecnica — ver Cierre.)

## Prohibiciones

- NO plantear pregunta unica del paso 1 antes de ejecutar paso 0 (leer referencias declaradas).
- NO redactar intent en frontmatter del README sin haber leido primero las referencias del usuario, si las hay.
- NO asumir que el nombre del slug derivado del comando es la identidad del repo huesped — verificar siempre via README/git remote/path actual.
- **NO avanzar al paso 4 sin haber procesado el paso 3.5** (validacion inline de claims sobre codigo existente). Override valido pero registrado en bitacora.
- **NO transcribir claims del usuario sobre codigo existente al intent.md como hechos sin haberlos validado contra codigo o registrado explicitamente como pendientes.**
- **NO modificar codigo del repo "para que cuadre con la descripcion del usuario" sin autorizacion explicita registrada como decision.** Cualquier cambio al codigo existente es decision del usuario via camino (b) o (c) del paso 3.5.4, no consecuencia silenciosa de un intent impreciso.
- NO crear procesos aun.
- NO definir contratos aun.
- NO escribir mockups aun.
- NO planear pipeline aun.
- NO leer step-02 antes de C.
