---
name: destilar-standard
description: Capacidad transversal para destilar una convencion tacita del repo en un standard documentado. Invocable por Sentinel, Winston, Atlas, Amelia, Sally o Mary segun el dominio de la convencion. Codigo-menu DT.
menu-code: DT
---

# Destilar Standard

Convierte una **convencion tacita del repo** en un **standard documentado**, vivo en `agent-os/standards/{dominio}/{tema}.md`. Excepcion: si trabajas en la nebulosa (repo agent-os-dinamicapps), vive en `profiles/{stack}/standards/{dominio}/{tema}.md` en su lugar. <!-- lint:allow C1 rama-nebulosa-del-criterio --> Es la respuesta operativa al patron observado en works historicos: las mismas convenciones se redescubren docena de veces en E3/E4 porque nadie las escribe.

## Principio

> Una convencion existe en uno de tres estados: tacita (vive en la cabeza del usuario o en el codigo sin documentar), descubierta (mencionada en un work pero no escrita aun), o destilada (existe como standard documentado y referenciable). El proposito de esta capacidad es mover convenciones de tacita/descubierta -> destilada en el mismo work donde se descubren, no como deuda futura.

## Cuando se invoca

### Durante un work activo

- **Por Mary en E1**: cuando el discovery de E1 (ruta `investigacion`) detecta una convencion tacita relevante (legacy: tambien via el `descubrimiento_producto` de la Etapa 0 enriquecida, en works anteriores al retiro de esa etapa). Mary decide si la destila ella misma (dominios de negocio) o invita al experto correspondiente.
- **Por Sentinel en E2/E3** (rutas de codigo, co-diseno del bloque `capa_seguridad`) o **E1** (rutas `investigacion`/`documentacion`, cuando la pregunta o el documento tocan compliance/seguridad): cuando la convencion es de seguridad/permisos. Tiene su capacidad propia mas profunda `[DP]` para el patron de permisos completo; `[DT]` aplica a otras convenciones de seguridad puntuales (ej. patron de auditoria, encriptacion en reposo, manejo de PHI/PII).
- **Por Winston en E2**: cuando una decision arquitectonica revela una convencion del repo no documentada (ej. "el repo siempre usa LINQ-to-SQL con `Tablas.dbml + designer.cs`"; "todas las consultas a inventario pasan por SP_GETCONSECUTIVOSEDE para idempotencia").
- **Por Atlas/Amelia en E3**: cuando ejecutando codigo se descubre una convencion tacita (ej. "no se inserta directo en `FC_SERVICIOPRESTADO`, se usa `ServicioPrestado.cargarServicioMedicamentoDespachado` canonico").
- **Por Sally en el flujo `rediseno-ui`** (fase 4 — cierre, donde Sally destila al estandar) **o en legacy `evolucion`** (E2/E3, capacidad LE): cuando descubre patrones UX/UI tacitos del repo (ej. patron de breadcrumb de los constructores, manejo de wrappers de scope angular, paleta de colores no en CSS variables).
- **Por Quinn en E4**: cuando auditando descubre que un patron usado en este work no esta documentado y deberia. Quinn delega al experto del dominio o destila ella misma si es de testing/QA.

### Retroactivamente sobre works completados

- **Invocado por `/alfred learn destilar {work-id}` o `/alfred learn destilar batch`** (gobierno en `agent-os/experts/bmad-agent-alfred/mantenimiento/learn.md`; el motor `/work-learn destilar` legacy fue retirado — git es el archivo historico). El director ejecuta destilado retroactivo sobre works que cerraron antes de E0 enriquecida (legacy) o que cerraron con `pendiente_post_cierre` en alguna convencion. El experto recibe la convencion candidata + evidencia en artefactos del work-record + sugerencia de destino, y aplica el procedimiento canonico con dos diferencias respecto al destilado durante work activo:

  1. **No hay work activo**: `creado_por_work` en el frontmatter del standard apunta al slug del work-record de origen (con sufijo `-retroactivo`).
  2. **Doble revision del director**: el experto propone el contenido del standard, el director lo revisa antes de escribirlo en disco. Es la regla de oro del destilado retroactivo: standards del repo escritos con doble revision para evitar standards aspiracionales basados en lectura de bitacoras sin re-validar contra codigo.
  3. **Update del work-record retroactivamente**: se marca `convenciones_destiladas_retroactivamente: true` con resultado agregado y standards generados (ver `agent-os/templates/work-record/schema/cosecha.md` seccion "Compatibilidad con bloques viejos").

## Pre-requisito

El experto que invoca `[DT]` ya tiene en su contexto:
- Una convencion concreta a destilar (no abstracta).
- Evidencia de uso en el codigo (al menos 2 sitios donde se aplica) o evidencia historica (work previo donde se descubrio).
- Conocimiento del dominio para redactar.

Si el experto no tiene los 3, pide ayuda al usuario o a otro experto antes de invocar `[DT]`.

## Procedimiento

### Paso 1 — Confirmar destino

Determinar la ruta del standard segun el dominio de la convencion. Tabla orientativa:

| Dominio | Ruta sugerida (default) | Ruta sugerida (excepcion nebulosa, con perfil de stack) |
|---------|--------------------------|--------------------------------------|
| Seguridad / permisos / auth | `agent-os/standards/security/{tema}.md` | `profiles/{stack}/standards/security/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |
| Arquitectura / DI / patrones de capas | `agent-os/standards/architecture/{tema}.md` | `profiles/{stack}/standards/architecture/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |
| Backend / BL / acceso a datos | `agent-os/standards/backend/{tema}.md` | `profiles/{stack}/standards/backend/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |
| Frontend / UI / patrones angular/react/etc | `agent-os/standards/frontend/{tema}.md` | `profiles/{stack}/standards/frontend/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |
| Datos / catalogos / schema / migraciones | `agent-os/standards/data/{tema}.md` | `profiles/{stack}/standards/data/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |
| Testing / QA / smoke / regresion | `agent-os/standards/testing/{tema}.md` | `profiles/{stack}/standards/testing/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |
| Dominio de negocio (ej. RIPS, MEDICOLOG) | `agent-os/standards/business/{tema}.md` | `profiles/{stack}/standards/business/{tema}.md` <!-- lint:allow C1 rama-nebulosa-del-criterio --> |

Reglas:
- Si trabajas en la nebulosa (repo agent-os-dinamicapps) y el repo tiene `profiles/{stack}/standards/`, escribir alli (especifico al stack). <!-- lint:allow C1 rama-nebulosa-del-criterio -->
- En cualquier otro caso (consumidor), escribir en `agent-os/standards/`.
- El nombre del archivo (`{tema}.md`) debe ser descriptivo en kebab-case y reflejar la convencion (ej. `linq-to-sql-tablas-dbml.md`, `tp-estado-semilla-csv.md`, `servicio-prestado-canonico.md`, `wrapper-scope-angular-hc2.md`).

Si la ruta sugerida YA existe, el destilado es una **actualizacion**, no un archivo nuevo. Leer el archivo existente y agregar la convencion como seccion nueva, no sobrescribir.

### Paso 2 — Recoger evidencia del codigo

El experto ejecuta grep / glob / lectura de archivos para confirmar la convencion en el codigo. Resultado esperado:

- 2+ sitios donde la convencion se aplica correctamente (sirven como ejemplo).
- 0+ sitios donde la convencion **NO** se aplica (sirven como anti-ejemplo o deuda — se mencionan pero no se arreglan en este destilado).
- 1+ historia (work previo o decision en bitacora) donde la convencion se descubrio o consolido.

Si no logra reunir 2 sitios de aplicacion, la convencion no esta lo suficientemente arraigada para destilar — se registra como "candidata a destilar cuando aparezca en mas works" en lugar de forzar el standard prematuramente.

### Paso 3 — Redactar el standard

Estructura minima obligatoria del archivo `{tema}.md`:

```markdown
---
nombre: {Tema en titulo}
dominio: {seguridad | arquitectura | backend | frontend | datos | testing | negocio}
estado: vigente
creado_en: YYYY-MM-DD
creado_por_work: {slug-del-work}
ultima_actualizacion: YYYY-MM-DD
referenciado_por_works: [{slug1}, {slug2}, ...]
---

# {Tema}

## Que es esta convencion

Una o dos frases que la describen. NO ambiguas, NO retoricas.

## Por que existe en este repo

Origen historico o tecnico. Si nacio de un work, mencionar el slug. Si nacio de un dolor real (incident, bug recurrente, restriccion del cliente), describirlo.

## Cuando se aplica

Casos donde la convencion es la norma. Lista en prosa breve.

## Cuando NO se aplica

Excepciones legitimas. Si no hay, escribirlo explicito ("Sin excepciones conocidas a 2026-04-XX").

## Como se aplica

Snippet de codigo representativo (puede ser pseudocodigo si el real es muy verboso). Mostrar el patron, no la implementacion completa.

```language
// ejemplo del patron
```

## Sitios canonicos en el codigo

Lista de archivos+linea donde la convencion vive como referencia.

- `path/to/file.cs:NNN` — {breve descripcion del por que es canonico}
- `path/to/other.cs:MMM` — {idem}

## Anti-patrones detectados

Si durante el destilado se vieron sitios donde la convencion NO se aplica y deberia, listarlos como deuda detectada (NO arreglar en este standard, solo registrar):

- `path/to/file.cs:NNN` — {sintoma}

## Works que aplicaron o validaron este standard

(Lista vive y crece con el tiempo. Cada work que destila o referencia este standard agrega una linea.)

- `{slug}` (YYYY-MM-DD): {breve descripcion del rol del work respecto a este standard — destilo / refino / valido / encontro contraejemplo}.
```

### Paso 4 — Indexar

Si existe `agent-os/standards/index.yml`, agregar entrada al final con:

```yaml
- ruta: "agent-os/standards/{dominio}/{tema}.md"
  dominio: {dominio}
  resumen: "{una linea descriptiva}"
  creado_en: YYYY-MM-DD
  creado_por_work: {slug}
```

Si el index.yml no existe, crear uno minimo con solo esta entrada. Otros works lo poblaran progresivamente.

### Paso 5 — Vincular al work-record

Actualizar el README del work-record:

```yaml
descubrimiento_producto:
  convenciones_a_destilar:
    - convencion: "..."
      ambito: "..."
      destino_sugerido: "agent-os/standards/{dominio}/{tema}.md"
      estado_destilado: "completado"   # NUEVO campo
      destilado_por_experto: "{nombre-experto}"
      destilado_en_etapa: "etapa-1 | etapa-2 | etapa-3 | etapa-4"
      destilado_en_fecha: "YYYY-MM-DD"
      ruta_final: "agent-os/standards/{dominio}/{tema}.md"
```

### Paso 6 — Anuncio en bitacora

El experto que destilo agrega entry en la bitacora de la etapa correspondiente con prefijo `[DT]`:

```
[DT] {experto} destilo convencion "{nombre}" en `{ruta-final}`. Origen: {convencion-tacita-del-descubrimiento}. Sitios canonicos referenciados: {lista}.
```

### Paso 7 — Reporte al usuario

```
A-{experto}: Destilo en standard nuevo:
- Archivo: `agent-os/standards/{dominio}/{tema}.md`
- Origen: convencion tacita "{nombre}" detectada en {fuente}
- Aplica a: {ambito}
- Sitios canonicos: {lista corta}

¿Quieres revisarlo antes de continuar, o sigo con la siguiente?
```

Si el usuario aprueba, continuar. Si ajusta, iterar el contenido.

## Autoridad y resolución de conflictos

Destilar es una capacidad compartida: ocho expertos la declaran (Mary, Sally, Sentinel, Winston, Dexter, Atlas, Amelia, Cipher) y Quinn destila en E4. Eso obliga a separar **quién puede destilar** (muchos, según dónde detectan la convención) de **quién tiene autoridad sobre el contenido** del standard (el dueño del dominio). Winston decide la estructura pero NO desarrolla; el patrón de código es de Amelia.

### Autoridad por dominio

| Dominio del standard | Autoridad final sobre el contenido | Costura |
|---|---|---|
| seguridad / permisos / auth | **Sentinel** | `[DP]` para el patrón completo de permisos; `[DT]` para otras convenciones de seguridad; los primitivos criptograficos y el material de llave son de Cipher (fila criptografia) |
| criptografia / firma digital / PKI / llaves / cifrado / hashing de credenciales | **Cipher** | Sentinel manda en la exposicion del endpoint y sus permisos; Dexter en el contrato/integridad del dato persistido; Amelia en el patron de codigo de la capa donde vive. En junturas aplica el Acuerdo de Juntura (`agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md`) |
| arquitectura / DI / capas / trade-offs estructurales | **Winston** | decide qué capas existen y cómo conectan; **describe, NO desarrolla** — no posee el patrón de código dentro de una capa |
| backend — endpoints / APIs (contratos request/response, status codes, routing, versionado) | **Amelia** | Sentinel manda en la capa de seguridad del endpoint (extracción de sesión, `TienePermiso`, 401/403) |
| backend — lógica de negocio / servicios / SOLID / demostraciones reutilizables de patrones | **Amelia** | Mary manda en las reglas de negocio que la BL implementa; Amelia en cómo se escribe el código |
| datos / schema / persistencia / catálogos / migraciones / contrato de acceso a datos | **Dexter** | normador de persistencia (P-D1..P-D8); Amelia manda en el patrón de código de acceso, Dexter en el contrato/integridad del dato |
| frontend / UI / UX | **Sally** | |
| negocio / reglas de dominio | **Mary** | |
| testing / QA | **Quinn** | |

**Iniciadores sin dominio propio:** Atlas (tech-lead multidisciplinar) detecta e inicia destilados en E3 pero no posee un dominio — delega el contenido al dueño según la tabla. Quinn es dueña de testing y, al iniciar cross-dominio en E4, delega el contenido al dueño. Los dueños de la tabla pueden iniciar en otros dominios delegando el contenido a quien corresponde.

### Protocolo cuando dos expertos chocan sobre el contenido

1. **Separación de capas primero.** Antes de declarar conflicto, comprobar si las posiciones son capas distintas de la misma convención (ej. Dexter: `NOT NULL` con default en BD; Mary: el campo es opcional en el formulario). Si lo son, el standard documenta **ambas capas**, cada experto autoritativo sobre la suya. No hay ganador. La mayoría de los "conflictos" se resuelven aquí.
2. **Dueño del dominio decide.** Si el choque es dentro de un mismo dominio, el dueño de la tabla de arriba tiene la última palabra sobre el contenido.
3. **Escalamiento por contradicción genuina.** Mismo nivel/capa, incompatible, sin dueño único (convención multidisciplinar): el experto registra la discrepancia en la bitácora de la etapa con prefijo `[DT]`, marca la convención `estado_destilado: diferido` con `diferido_razon: conflicto-activo`, y Alfred la sube al usuario. La decisión del usuario se vuelve la autoridad del standard y se registra en él (sección "Por que existe en este repo").

### Punto de entrada: escalación desde el disparador B de `consolidar`

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/mantenimiento/learn.md subcomando "/alfred learn consolidar". El disparador B que escala aqui. NO duplicar. -->

`[DT]` tiene un punto de entrada adicional a los descritos en "Cuando se invoca": fuera de todo work activo, el **disparador B** (memoria vs standard) de `/alfred learn consolidar` confronta la memoria viva de cada experto de dominio (`patterns.md`, o `normas-tacitas.md`/`derivas/` en Dexter) contra los standards vigentes de su dominio. Cuando encuentra una entrada que contradice un standard y el standard resulta **stale** (git-date viejo) o la memoria "parece mejor ley" que el standard vigente, B no retira la memoria: **escala a `[DT]`** para que el dueño del dominio (tabla de arriba) evalúe promover esa memoria al standard, como **actualización** del archivo existente (ver "Si la ruta sugerida YA existe" en el Paso 1) — no un archivo nuevo.

Reglas de esta escalación:
- La promoción (memoria -> standard) la **confirma siempre el humano** — nunca es automática, ni siquiera en `nivel: maxima` (que sí permite auto-jubilación en el disparador A de `consolidar`).
- Lo que rompe el auto-juicio de la escalación es la **confirmación del humano**, no la jerarquía de autoridad de dominio de esta sección por sí sola: el experto que escala suele ser el mismo dueño del dominio de esa memoria, así que la jerarquía sola no evita que se auto-apruebe.

### Doctrina del sistema vs standard del consumidor

`agent-os/doctrina/` contiene la **doctrina propia del sistema** (DRY, cohesión, capas, comentarios con merito): se entrega por espejo-en-update y el consumidor NO la edita (un update la sobre-escribiría, igual que un skill del sistema). Es el **piso**.

Cuando un repo consumidor discrepa de una doctrina del sistema, NO edita el archivo de `agent-os/doctrina/`: crea un standard en SU zona (`agent-os/standards/`) que cubra el mismo tema. Ante conflicto, **el standard del consumidor tiene precedencia** sobre la doctrina del sistema — el consumidor conoce su realidad; la doctrina es el default sensato, no una imposición. La zona `agent-os/doctrina/` queda prístina y sobre-escribible.

## Cuando NO destilar (deferir intencionalmente)

Hay casos donde la convencion debe quedar como `pendiente_destilar` con justificacion en lugar de destilarse en el work actual:

- **Cobertura insuficiente**: solo se ven 1 sitio en el codigo. La convencion puede ser local, no general — espera mas works.
- **Conflicto activo no resuelto**: hay 2+ sitios que hacen cosas inconsistentes, o dos expertos chocan sobre el contenido. Aplicar primero el protocolo de la sección "Autoridad y resolución de conflictos" (separación de capas -> dueño de dominio -> escalamiento). Solo si tras ese protocolo el conflicto sigue sin resolverse (escalado pero pendiente de decisión del usuario), se difiere con `diferido_razon: conflicto-activo` y se deja como work futuro de auditoría.
- **Dependencia externa pendiente**: la convencion solo aplica si X libreria/version/decision queda confirmada. Hasta entonces, prematuro escribir.

En cualquier caso, registrar en el work-record:

```yaml
descubrimiento_producto:
  convenciones_a_destilar:
    - convencion: "..."
      estado_destilado: "diferido"
      diferido_razon: "{cobertura-insuficiente | conflicto-activo | dependencia-externa | otro: explicar}"
      diferido_decision_de: "{experto-que-evaluo}"
      revisar_en: "{cuando-tiene-sentido-volver-a-evaluar}"
```

Quinn en E4 audita estos `diferido` y los acepta si la razon es valida; si no, los devuelve al experto para destilar antes del cierre.

## Composicion con otras capacidades

- `[DP]` de Sentinel (documentar patron de permisos): es un caso especifico de `[DT]` con procedimiento mas profundo. Si la convencion es el patron de permisos del repo, usar `[DP]`. Si es otra convencion de seguridad, usar `[DT]`.
- `[VS]` de Quinn: en E4, audita que `convenciones_a_destilar` quedaron resueltos (destiladas o diferidas con justificacion). Bloquea cierre de work si hay convenciones huerfanas.
- Comando `/discover-standards`: barre el codebase para detectar candidatos a destilar fuera de un work. Es complementario, no sustituto.

## Anti-patrones de destilado

- **Destilar sin evidencia**: escribir un standard basado en lo que el experto cree que es la convencion, sin grep ni sitios canonicos. Resulta en standards aspiracionales que el codigo no respalda.
- **Standard generico**: copiar contenido de internet o de otro proyecto. El standard debe ser de **este repo**, basado en sus archivos.
- **Standard demasiado granular**: destilar cada minucia. La regla operativa: si la convencion no tiene 2+ sitios donde aplique consistentemente, no se destila aun.
- **Standard demasiado abstracto**: redactar en abstracto sin ejemplo concreto. Snippet con archivo+linea es obligatorio.
- **Standards huerfanos**: escribir el standard pero no referenciarlo desde ningun lado. El index.yml + el work-record que lo origino son la red minima para que sobreviva.
