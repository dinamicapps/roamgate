# Schema de frontmatter — Perilla de autonomia y meta

> Fragmento de `frontmatter-schema.md` (ver indice). La perilla `nivel`, sus campos especificos por modo, y los campos de meta del work (invariante + revisiones).

## Perilla de autonomia (nivel) (canonico desde 2026-07-03)

Aplicable al README.md del work-record. Declara **cuantas confirmaciones y gates ve el humano** durante el work. Ortogonal al `modo` — un work puede ser `modo: normal + nivel: maxima` o `modo: documentacion + nivel: minima`. La cadencia conversacional es un **efecto derivado** del nivel; el rigor (expertos por senal, verificacion, aprendizaje) es siempre-activo.

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `nivel` | string | `minima` \| `normal` \| `maxima` | Perilla unificada de autonomia. Default en works nuevos: `normal`. |
| `conversacion` | string (legacy) | `guiada` \| `flow` \| `yolo` | **Deprecado.** Solo en works pre-2026-07-03. Se lee mapeando `guiada→minima`, `flow→normal`, `yolo→maxima`. El campo canonico es `nivel`. |

**Significado por valor:**

- `minima` — rigurosidad maxima de consulta. Cada decision intermedia consulta al usuario; el humano sostiene cada gate. Util para works de alto riesgo o usuario nuevo al flujo.
- `normal` — avance continuo en subtareas y tareas. Decisiones intermedias de implementacion se agrupan para consulta al cierre de etapa. Gates de etapa/pieza siguen confirmando. Default.
- `maxima` — el anfitrion toma decisiones intermedias con criterio profesional y las registra en bitacora `[AUTO]`; la verificacion automatica sostiene el gate. Solo consulta en: gates de etapa, ambiguedad de scope/meta, comandos destructivos, bloqueos tecnicos reales.

**Contrato de deriva:** al hornear el work, el runtime resuelve `nivel` en este orden: `nivel` explicito → derivado de `conversacion` legacy → `normal`. La regla vive en el runtime (funcion `DerivarNivel` del modulo de trabajo) — fuente unica del mapeo.

**Fold de `modo_clasificacion`:** la clasificacion de hallazgos en los 3 rumbos ya no es un dial independiente — se **deriva** de `nivel` (`minima→manual`, `normal→asistido`, `maxima→autonomo`). El campo `rumbos.modo_clasificacion` de la config queda como fallback legacy (se ignora cuando el work declara `nivel`).

**Override implicito:** incluso en `maxima`, si el anfitrion detecta una decision que afecta scope o meta, sube a modo consulta para esa decision especifica y luego vuelve a `maxima`. Piso no-negociable en todos los niveles: discrepancia→humano, produccion→autorizacion, destructivo/scope-meta/reevaluacion/ADN siempre consultan.

**Activacion:**
- En works nuevos, `nivel` nace del config de la ruta (`autonomia.rutas.{ruta}.nivel`) o `normal` si ausente.
- Cambiable en tiempo real con `/alfred nivel {valor}` (alias legacy `/alfred conversacion {valor}`). Registra en bitacora de la etapa actual.

**Bitacora `[AUTO]`:** entradas en `etapa-N/bitacora.md` con prefijo `[AUTO]` registran decisiones tomadas por el anfitrion sin consultar (nivel `normal`/`maxima`). Quinn en E4 las revisa como parte del chequeo de meta — un cumulo de decisiones auto-tomadas que el usuario no aprobaria afecta el cumplimiento.

**Campos de auditoria por chequeos del abordaje:**

| Campo | Tipo | Cuando aparece | Proposito |
|-------|------|-----------------|-----------|
| `modo_meta_override` | string | Solo si durante el abordaje se detecto inconsistencia meta ↔ modo y el usuario declaro override explicito | Narra la razon del override. Permite al equipo evaluar si el work avanza sobre riesgo conocido. |
| `obsoletos_por_cambio_modo` | object | Solo si durante el abordaje el usuario cambio el modo tras declarar campos especificos del anterior | Conserva los campos del modo anterior para auditoria (no se borran). Ej. si pasa de `investigacion` a `documentacion`, `consumido_por` queda archivado aqui. |

### Campos especificos del modo `investigacion` (solo aplicables cuando modo:investigacion)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `consumido_por` | string | Respuesta a la pregunta obligatoria del abordaje (Fase 4): ¿cual es el work o la decision que consumira este insumo? Ancla la meta a un destinatario. Puede ser slug de work planeado o descripcion narrativa. |
| `disponible_como_insumo` | boolean | `true` al cerrarse el work como COMPLETADO. Marca el work como consumible por otros. |
| `obsoleto_como_insumo` | boolean | `true` si este work fue reemplazado por otro posterior. Opcional. |

### Campos especificos del modo `documentacion` (solo aplicables cuando modo:documentacion)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `audiencia_documento` | string | Respuesta a la pregunta opcional del abordaje (Fase 4): roles, nivel tecnico y contexto del lector objetivo del documento (ej: "Cajeros junior, nivel basico de configuracion"). Si el usuario no responde durante el abordaje, el campo queda ausente y Quinn en E4 considera la falta como brecha que afecta el chequeo de meta. Consumido por: Paige al escribir, Quinn al verificar cobertura, lector objetivo en E4 si es alcanzable. |
| `plantilla_documento` | string | Slug de la plantilla del documento del work cuando el work produce **exactamente un** documento con plantilla conocida al abrir. Se resuelve en las dos zonas del catalogo (repo primero, simple o kit; luego sistema, solo simple) con guards `PLANTILLA_NO_ENCONTRADA` y `PLANTILLA_AMBIGUA`; un slug fuera del alfabeto es `USO`. Opcional: ausente = sin plantilla, o work con varios documentos (en ese caso manda la seccion `## Entregables`). Lo hornea `work open` (bloque `documentacion{}` del payload). Consumido por: Paige en E1 (deriva TOC + CAs de la plantilla; desviaciones se declaran en el discovery), Quinn en E4 (contrasta el documento vs el TOC derivado). |

<!-- FUENTE: agent-os/templates/documentacion/README.md seccion "Resolucion de un slug". Zonas, formas, alfabeto y orden de resolucion viven alli. NO duplicar -- para modificar, editar la fuente. -->

### Seccion Entregables del README (modo documentacion)

Seccion `## Entregables` del cuerpo del README de un work de documentacion. Registra que
documentos produce el work y con que plantilla cada uno. La escribe Alfred tras `work open`, o
Paige en E1 si los documentos se definen ahi, con `agentos work file set-section`,
reescribiendola completa cada vez que el conjunto cambia. No es frontmatter: el runtime no la
valida.

| Columna | Contenido |
|---|---|
| Documento | ruta relativa al repo del archivo que el work produce |
| Plantilla | `{slug}@{version} ({zona})` con zona `repo` o `sistema`, o `sin plantilla` |
| Audiencia | solo si difiere de `audiencia_documento` del work |
| Salidas | formatos declarados (`md`, `docx`...), tomados de la plantilla y ajustables por el usuario |
| Origen | solo en re-plantillado: ruta del documento fuente, distinta de Documento |

Reglas:

- Si la seccion existe, manda sobre `plantilla_documento`.
- Un work sin la seccion (todos los anteriores a esta regla) se trata como hasta ahora: un
  documento, con o sin `plantilla_documento`.
- La consumen Paige (E1: TOC por documento; E2: tareas con `entregable`; E3: salidas), Quinn
  (E4: cruce tareas-entregables y salidas) y la curaduria de plantillas de Paige.

Ejemplo:

| Documento | Plantilla | Audiencia | Salidas | Origen |
|---|---|---|---|---|
| `.documentacion/comunicados/COM-0020-cambios.md` | comunicado-cambios-periodo@2 (repo) | | md, docx | |
| `docs/changelog/26.10.01-novedades.md` | changelog-version-publico@1 (repo) | Clientes | md | |

### Bloque `worktree` (work o diseño)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `worktree.rama` | string | Rama de trabajo: `work/{slug}` si la unidad raiz es un work, `diseno/{slug}` si es un diseño. Lo hornea `agentos worktree abrir` (o `worktree sumar` si la unidad se sumo a una rama ya abierta por otra unidad). |
| `worktree.ruta` | string | Ruta absoluta del worktree donde vive el trabajo (con `/`). Permite que `/alfred continuar` desde otra sesion encuentre el work. |
| `worktree.creado_en` | string | Fecha YYYY-MM-DD de apertura. |
| `worktree.base_commit` | string | Hash del commit desde el que arranca esta unidad en su rama. Lo hornea `agentos worktree abrir` (o `worktree sumar`) y **no cambia nunca**: es el ancla de `worktree colapsar`. Si deja de ser alcanzable (historia reescrita a mano), el colapso falla con `BASE_HUERFANO`. |

Ausente = unidad del regimen previo (works/diseños anteriores a este bloque; sin migracion
forzosa). La doctrina del ciclo (apertura, particion por unidad, colapso, cierre en 3 pasos,
residuos) vive en `agent-os/skills/bridge-session/references/ciclo-worktree.md` — aqui solo
el schema.

### Campos de encadenamiento productivo (aplicables a cualquier modo)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `insumos_origen` | array de strings | Slugs de works investigativos/documentales cuyos artefactos alimentaron el abordaje (o E1, en `investigacion`/`documentacion`) de este work. Se pobla en paso 5.5 si el usuario declara works previos. |
| `consumidores` | array de strings | Reverse-link: slugs de works que declararon a este como `insumos_origen`. Se mantiene via `/alfred maintain rebuild-consumers`. Fuente de verdad: `insumos_origen` del consumidor. |

**Diferencia con `idea_general_comun`/`work_origen`:** esas relaciones modelan **replanteo** (un work reemplaza a otro via camino d de reevaluar). `insumos_origen`/`consumidores` modela **encadenamiento productivo** (A produce insumo que B consume). Son relaciones distintas y coexisten.

## Campos de meta del work (obligatorios desde abril 2026)

Aplicables al README.md del work-record. Works iniciados antes de 2026-04-23 no tienen estos campos retroactivamente; works iniciados despues SI son obligatorios.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `meta` | string | Frase clara en prosa, declarada por el usuario y aprobada durante el abordaje. Es el invariante del work. NO puede estar vacia para works post 2026-04-23. |
| `meta_definida_en` | string | Fecha ISO 8601 (`YYYY-MM-DD`) en que se declaro la meta inicial. |
| `meta_revisiones` | array | Lista de revisiones de meta. Default `[]`. Se llena automaticamente cuando hay reevaluacion (ver host-protocol). |
| `idea_general_comun` | string | Solo presente si el work nace por la regla de cohesion de scope (caso de works encadenados). Vincula con la idea macro. Opcional. |

### Schema de cada entrada en `meta_revisiones[]`

```yaml
meta_revisiones:
  - version: 1                      # entero, autoincremental
    meta_anterior: "string"         # frase de la meta antes de esta revision
    fecha: "YYYY-MM-DD"             # fecha del cambio
    motivo: "string narrativo"      # por que se cambio (en prosa, no abstracto)
    decidido_por: "usuario"         # usuario | work | anfitrion
    etapa_de_regreso: "ninguna"     # ninguna | etapa-0 | etapa-1 | etapa-2 | etapa-3 | etapa-4
```

### Quien actualiza meta y meta_revisiones

- `meta` y `meta_definida_en`: work durante el abordaje (Fase 4, con aprobacion del usuario).
- `meta_revisiones[]`: work al ejecutar `/alfred reevaluar` (con aprobacion del usuario).
- `idea_general_comun`: work al crear un work nuevo derivado por aplicacion de regla de cohesion de scope.

### Quien consume

- Cada anfitrion al activarse en su etapa: lee `meta` como primer paso.
- Quinn en Etapa 4: chequea cumplimiento de meta vigente antes de cerrar.
- `/alfred estado`: muestra meta vigente + cantidad de revisiones.
- Auditorias: `meta_revisiones[]` permite trazar como cambio el scope a lo largo del work.

