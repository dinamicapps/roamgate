# Schema de frontmatter — Cierre, guards, campos de diseno y resto

> Fragmento de `frontmatter-schema.md` (ver indice). Bolsa de dominio de cierre/archivado, guards bloqueantes del runtime, campos de diseno (sistema dual, paraguas, artefactos), rumbos del hallazgo, y los dos tipos de work-record fastrak.

## Tipo colaborador-fastrak (work-record desde bridge)

Cuando un repo participa como colaborador en una sesion bridge, su work-record es fastrak (F0/F1/F2 en vez de etapa-1..4). El frontmatter del README incluye campos adicionales:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `tipo` | string | `colaborador-fastrak` (discrimina de work normal) |
| `director_work` | string | Nombre kebab del work del director (ej: `20260415-bridge-integracion`) |
| `director_instancia` | string | Nombre del .bridge.local del director |
| `director_repo` | string | URL del repo del director |
| `bridge_grupo` | string | UUID del grupo bridge |
| `manifiesto_version_aceptada` | number | Ultima version del manifiesto que el colaborador acepto |
| `etapa_actual` | string | `F0` o `F1` o `F2` (en lugar de `etapa-N`) |

Ejemplo:

---
tipo: colaborador-fastrak
director_work: "20260415-bridge-integracion"
director_instancia: "dinamicapps"
director_repo: "https://github.com/..."
bridge_grupo: "uuid-del-grupo"
manifiesto_version_aceptada: 2
estado: EN_PROGRESO
etapa_actual: F1
autor: Julio Diaz
fecha_inicio: 2026-04-15
---

Filtros relacionados:
- `/alfred continuar` debe permitir filtrar por `tipo` (mostrar fastrak separados de works normales).
- `/alfred listar` debe distinguir visualmente.


## Campo `grupos_bridge` (nuevo)

Lista de grupos bridge creados dentro del work.

**Tipo:** array de objetos.

**Cuando se llena:** al ejecutar `/alfred grupo crear {nombre}`.

**Campos por grupo:**
- `nombre` (string): nombre kebab-case del grupo.
- `id_bridge` (string): UUID asignado por MCP bridge.
- `fecha_creacion` (YYYY-MM-DD).
- `estado` (enum): `activo` | `archivado`. Reflejo simplificado del ciclo de vida desde la perspectiva del work-record (¿el grupo sigue existiendo y siendo coordinable, si o no?).
- `etapa_que_lo_creo` (int o string): etapa del work donde se creo (0-4 o `bajo-demanda-etapa-N`).

**Distincion con `estado_grupo` del manifiesto bridge:**

El manifiesto del grupo bridge (`{work}/grupo-{nombre}/manifiesto.yml`) lleva un campo `estado_grupo` con 3 valores: `exploracion | acordado | archivado`. Es el contrato del flujo bridge-session (ver `agent-os/skills/bridge-session/references/grupo-vs-sesion.md`).

El campo `estado` aqui descrito (en `grupos_bridge[]` del README del work) es un **agregado para auditoria del work**, no el estado del flujo bridge. Mapeo:

| `estado_grupo` (manifiesto bridge) | `estado` (grupos_bridge del work) |
|------------------------------------|-----------------------------------|
| `exploracion` | `activo` |
| `acordado` | `activo` |
| `archivado` | `archivado` |

Para gobernar el flujo de coordinacion multi-repo, leer `estado_grupo` del manifiesto. Para validar cierre del work, leer `estado` aqui.

**Validacion al cerrar work:** todos los grupos deben estar `estado: archivado` o el work debe estar `PAUSADO` (no `COMPLETADO`).

## Sistema dual /alfred + /disenar (desde 2026-04-29)

Tres campos nuevos discriminan entre flujo legacy y flujo nuevo. Solo aplican a works iniciados despues de 2026-04-29 y a works derivados de un diseño.

### `version_sistema`

| Tipo | Valores | Default | Aplicabilidad |
|------|---------|---------|---------------|
| string | "1" \| "2" | "1" | Todos los works |

- `"1"`: flujo legacy (motor /work con SKILLs monoliticos de etapa, retirado en 2026). Default para works iniciados antes de 2026-04-29; valor historico de solo-lectura.
- `"2"`: flujo vigente conducido por `/alfred` con los datos de etapa en `agent-os/skills/host-protocol/etapas/etapa-N.md`. Lo setea automaticamente `/alfred iniciar`.

El SKILL.md raiz de `/alfred` lee este campo como primer paso y delega al pipeline correspondiente. Si ausente, asume `"1"`.

### `proveedor_ia`

Proveedor de IA que **abrio** el work (origen/gobernador inicial). Enum cerrado:
`claude | codex | desconocido`. Opcional: ausencia = `desconocido` (works legacy).
**Inmutable:** lo fija `work open` una sola vez; ningun otro comando lo reescribe. Si
el work se abre en Claude y se continua en Codex, el work conserva su `proveedor_ia`
de origen; el operador actual se registra en el archivo de sesion (ver "Control de
edicion por sesion"). Un valor explicito fuera del enum es rechazado por `work open`
y por la validacion de schema (`OptEnum`, fuente unica `schema.ProveedoresIa`).

### Versionado y migracion asistida (v1→v2)

El discriminador `version_sistema: "2"` distingue works gestionados por el runtime Go (`agentos`) de los works legacy. Un work con `version_sistema` ausente o con valor distinto de `"2"` es tratado como legacy.

**Deteccion sin fallo.** El runtime detecta works legacy sin error ni interrupcion:
- `agentos meta doctor` incluye `works_requieren_migracion: N` en su salida si hay works legacy en `agent-os/work-records/`.
- `agentos work get --slug X` sobre un work legacy devuelve `{requiere_migracion: true, version_detectada, estado_detectado}` en lugar de error.

**Clases de version que el runtime distingue:**

| Clase | Criterio |
|-------|----------|
| `v2` | Frontmatter con `version_sistema: "2"` |
| `v1` | Frontmatter presente pero sin `version_sistema: "2"` |
| `legacy-sin-fm` | Sin frontmatter YAML; estado en el cuerpo como `- **Estado**: VALOR` |
| `desconocido` | Ninguno de los anteriores |

**Flujo de migracion asistida.** Los tres verbos del runtime ejecutan la migracion de forma incremental:

1. `agentos work migrate --slug X` — extrae lo determinístico del legacy (estado del cuerpo tomando el ultimo `- **Estado**:`, fecha del slug en formato `YYYYMMDD-`), mapea estados no canonicos (`CERRADO → COMPLETADO`), materializa el esqueleto v2 con frontmatter minimo preservando el cuerpo intacto, y devuelve `{ok: true, campos_pendientes: [...]}` con la lista de campos que la IA debe completar (`autor`, `modo`, `tipo`, `version_sistema`, etc.).

2. `agentos work set-fm --slug X` (stdin: fragmento JSON) — merge incremental del fragmento sobre el frontmatter existente. Acepta partes del frontmatter, no exige el bloque completo. Rechaza el campo `estado` (se mueve con `transition`/`close`). Devuelve `{ok: true, campos_mutados: N}`.

3. `agentos work validate --slug X` — verifica que todos los campos requeridos esten presentes y tengan valores validos. Devuelve `{valido: true}` o lista los problemas. Es el gate final antes de operar el work con el runtime.

**Principio de completitud diferida.** El frontmatter se construye por fragmentos: `set-fm` acepta partes y nunca exige el bloque completo. La completitud solo se exige en gates (`validate`, `transition`, `close`). Esto permite que la IA complete los campos en pasos separados sin perder el progreso acumulado.

### `diseno_origen`

| Tipo | Valores | Default | Aplicabilidad |
|------|---------|---------|---------------|
| string \| null | slug de un diseño en `agent-os/disenos/` | null | Solo cuando work se inicio con `/alfred iniciar --desde-diseno={slug}` |

Cuando esta poblado, el work hereda el brief del diseño por **referencia por path** (no copia). El protocolo de retroceso bidireccional usa este campo para enrutar hallazgos. Cuando ausente o null, el work no tiene diseño asociado y `/alfred retroceder-a-diseno` se rechaza.

### Campos de diseño paraguas (solo cuando el work pertenece a un diseño fragmentado)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `work_paraguas` | string \| null | id de la casilla en `plan_works[]` del diseño (ej. `W2`). Solo cuando `diseno_origen` apunta a un diseño con `es_paraguas: true`. Refina `diseno_origen` indicando QUÉ work del plan ejecuta este work-record. Default `null`. |
| `realinea_works` | array \| null | lista de ids de works COMPLETADO que realinea (ej. `[W1]`). Solo cuando este work-record es de realineación (nacido de una reevaluación del paraguas). Vacío/ausente en works normales. Default `null`. |

Ambos campos son opcionales. Works sin diseño paraguas no los tienen; su ausencia no rompe nada. El plan de works (la fuente) vive en el README del diseño (`plan_works[]`); aquí solo se guarda el reverse-link a la casilla.

<!-- FUENTE: agent-os/templates/diseno/README.md seccion "Plan de works (fragmentación)". La fragmentacion y el plan de works viven en el diseño; el work-record solo guarda el ancla work_paraguas. NO duplicar el plan -- editar el README del diseño. -->

### `aterrizaje_omitido_razon`

| Tipo | Valores | Default | Aplicabilidad |
|------|---------|---------|---------------|
| string \| null | razon textual del usuario | null | Solo cuando step-01 detecto senales y el usuario decidio NO ir a /disenar |

Cuando step-01-contexto detecta >=2 senales de aterrizaje y sugiere `/disenar`, si el usuario insiste en seguir con `/alfred` (ruta `acotado`/`bugfix`), este campo registra la razon textual ("lo veo claro", "es un experimento corto", "ya tengo el diseño en la cabeza"). Quinn lo audita en step-05. Si el work entra en reevaluacion mas tarde, este campo es evidencia para la pregunta "¿valio la pena saltarse aterrizaje?".

## Optimizacion bugfix+desarrollo (2026-04-29)

### Campos nuevos en tareas (`etapa-2/tareas/T-NNN-*.md`)

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `ejecutor` | string \| null | nombre del agente | Quien ejecuto la tarea. Vacio al crear; se llena al iniciar bloque `## Ejecutor`. |
| `verificador` | string \| null | nombre del agente | Quien verifico la tarea. Vacio al crear; se llena al iniciar bloque `## Verificador`. |

### Estados del work-record (extension)

Estados existentes (preservados): `EN_PROGRESO | EN_PAUSA | EN_PAUSA_POR_DISENO | PRE_CIERRE | COMPLETADO | COMPLETADO_CON_BRECHA | REPLANTEADO`.

Estado nuevo:

| Estado | Significado |
|--------|-------------|
| `TRASLADADO_A_DISENO` | Work-record originado como bugfix que excedio scope focal y fue trasladado a `/disenar` + `/alfred iniciar --desde-diseno`. Estado terminal. |

Campos asociados:

| Campo | Tipo | Aplicabilidad | Descripcion |
|-------|------|---------------|-------------|
| `trasladado_a` | string \| null | Solo cuando `estado: TRASLADADO_A_DISENO` | Slug del diseño al que se traslado. |
| `trasladado_en` | string \| null | Solo cuando `estado: TRASLADADO_A_DISENO` | Fecha ISO `YYYY-MM-DD` del traslado. |
| `trasladado_razon` | string \| null | Solo cuando `estado: TRASLADADO_A_DISENO` | Razon textual: por que excedio fix focal. |

### Vocabulario de tags acotado para README (tabla de tareas)

La tabla `## Tareas` del README.md del work usa columna `Tags` con vocabulario cerrado:

| Tag | Cuando |
|-----|--------|
| `hallazgo:N` | N hallazgos durante ejecucion (numero acumulado) |
| `bloqueada-por:T-XXX` | Depende de tarea aun no completa |
| `decision-pendiente` | Espera decision del usuario para continuar |
| `verificacion-rechazo` | Quinn rechazo el resultado, tarea reabierta |
| `deuda` | La tarea genero deuda tecnica documentada |

**Limite: 2 tags por tarea.** Si una tarea acumula >2, se conserva el mas relevante; los demas viven en el archivo de la tarea.

### Politica de archivos (eliminados)

A partir de 2026-04-29, los siguientes archivos NO se generan:

- `etapa-N/calidad-{experto}.md` (las revisiones se embeben en el archivo principal de la etapa)
- `etapa-N/experto-{nombre}.md` (idem)
- `etapa-N/bitacora.md` (la bitacora vive en cada tarea bajo `## Ejecutor`)
- `etapa-2/02-opciones.md` (decisiones embebidas en `03-plan.md`)
- `etapa-1/01-discovery-distillate.md` (sin distillate; el discovery vive en el brief de `/disenar`)
- `etapa-2/03-plan-distillate.md` (idem)
- `etapa-3/05-ejecucion.md` (la ejecucion vive en cada tarea bajo `## Ejecutor`)
- `etapa-3/06-hallazgos.md` (los hallazgos viven en cada tarea + tabla de README)
- `etapa-4/06-hallazgos.md` (idem, viven en cada tarea bajo `## Verificador`)

Works iniciados antes de 2026-04-29 conservan sus plantillas viejas.

## Hallazgos del retroceso bidireccional (desde 2026-04-29)

Aplicable a artefactos `agent-os/disenos/{slug}/hallazgos/HZ-NNN.md` cuando el sistema dual `/alfred` + `/disenar` enruta hallazgos desde un work hacia su diseño origen.

<!-- FUENTE: agent-os/templates/diseno/hallazgo.md (frontmatter del template). Aqui se enumeran los valores del enum `estado` solo para auditoria cruzada con el schema general; el detalle de cada campo y su poblado vive en el template del archivo de hallazgo y en los skills de modo-retroceso de `/disenar`. NO duplicar la regla — para modificar, editar la fuente. -->

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `estado` | string | `pendiente_analisis` \| `en_analisis` \| `mitigado` \| `aplicado` \| `obsoleto_por_replanteamiento` \| `descartado` \| `descartado_por_cancelacion` | Estado del hallazgo en su ciclo de vida desde que el work lo dispara hasta que el diseño lo absorbe o descarta. |

**Significado por valor:**

- `pendiente_analisis` — hallazgo recien creado por el work, esperando ser leido por `/disenar` modo-retroceso.
- `en_analisis` — `/disenar` esta evaluando el hallazgo, decidiendo si modifica el brief.
- `mitigado` — el brief absorbio el hallazgo con un cambio que resuelve la regla descubierta.
- `aplicado` — un work derivado ya consumio el brief actualizado (`aplicado_por_work` y `aplicado_por_work_en` poblados).
- `obsoleto_por_replanteamiento` — el diseño se replanteo de forma que el hallazgo dejo de aplicar.
- `descartado` — cerrado sin modificar el brief porque Mary y el usuario no encontraron mitigacion viable (el work origen sigue vivo; distinto de `descartado_por_cancelacion`). El work resuelve internamente via `/alfred reevaluar` si lo necesita.
- `descartado_por_cancelacion` — el work origen se cancelo antes de que el hallazgo fuera procesado.

Otros campos del frontmatter (`hallazgo_id`, `work_origen`, `work_etapa_origen`, `work_iteracion`, `work_anfitrion`, `disparado_en`, `disparado_por`, `proceso_afectado`, `contrato_afectado`, `severidad`, `diseno_slug`, `aplicado_por_work`, `aplicado_por_work_en`): ver template canonico en `agent-os/templates/diseno/hallazgo.md`.

## Rumbos del hallazgo (2026-05-02)

Aplica a hallazgos en `### Hallazgos` de tareas (`etapa-2/tareas/T-NNN-*.md`) y a hallazgos consolidados en E1 (`etapa-1/01-discovery.md`) y E4 (`etapa-4/07-verificacion.md`). Works iniciados antes de 2026-05-02 conservan la estructura sin `rumbo` (compatibilidad legacy).

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Principio del huevo y rumbos del hallazgo". Aqui solo se documenta el campo del frontmatter; el detalle del principio, los criterios de clasificacion, la mecanica de curaduria y la tabla resumen viven en host-protocol. NO duplicar la regla — para modificar, editar la fuente. -->

### Campo `rumbo` por hallazgo

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `rumbo` | int | `1` \| `2` \| `3` | Clasificacion del hallazgo en uno de los tres rumbos: 1=dentro del work (bloqueante de meta o CA), 2=post-work (resolver pronto, no bloqueante), 3=capas de cebolla (futuro, mejora del entregable). |
| `rumbo_razon` | string | razon corta | Por que se clasifico asi. Una linea, futura-legible. |
| `rumbo_clasificado_por` | string | nombre experto | Quien propuso la clasificacion. |
| `rumbo_confirmado_por` | string \| null | nombre anfitrion + usuario | Quien confirmo al cierre de etapa. Null hasta que pase por curaduria. |

Ejemplo en `### Hallazgos` de una tarea:

```yaml
- id: HG-T003-01
  rumbo: 2
  rumbo_razon: "Logging de auth poco granular para investigar fallos productivos. No bloquea meta del work pero deberia resolverse en proximo sprint."
  rumbo_clasificado_por: sentinel
  rumbo_confirmado_por: "quinn + usuario"
  resumen: "Endpoint /auth/login no registra contexto de IP/user-agent en fallos."
  decidio: usuario
```

### Campos en README.md del work-record (trazabilidad de volcado)

Aplican al cierre del work cuando hubo volcado a destinos fisicos.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `post_works_volcados` | array | Lista de hallazgos rumbo 2 volcados al cierre. Cada entry: `{id, resumen, volcado_en: "YYYY-MM-DD", linea_destino: int}`. Permite auditoria sin abrir el archivo destino. |
| `capas_volcadas` | array | Lista de hallazgos rumbo 3 volcados al cierre. Cada entry: `{id, resumen, volcado_en: "YYYY-MM-DD", area: "string", archivo_destino: "ruta", area_nueva: bool}`. |

Ejemplo:

```yaml
post_works_volcados:
  - id: HG-T003-01
    resumen: "Logging de auth poco granular"
    volcado_en: "2026-05-02"
    linea_destino: 47
capas_volcadas:
  - id: HG-T005-02
    resumen: "Refactor capa servicios facturas"
    volcado_en: "2026-05-02"
    area: "facturacion"
    archivo_destino: "agent-os/capas-futuras/facturacion.md"
    area_nueva: false
```

### Compatibilidad

- **Works pre-2026-05-02:** sin campo `rumbo` en hallazgos. No se exige migracion. Quinn en E4 NO clasifica retroactivamente.
- **Works post-2026-05-02:** campo `rumbo` obligatorio en hallazgos nuevos registrados a partir de esa fecha.

## Status nuevos en tareas (2026-04-30)

Hallazgos en prueba real motivaron extender el enum de `status` para tareas con dos valores adicionales:

| Status | Significado | Cuando usar |
|--------|-------------|-------------|
| `done_con_brecha` | Tarea completada con limitacion conocida y documentada. La meta de la tarea se cumple parcialmente; lo que NO se cumple esta declarado en `### Hallazgos` con decisor explicito. | Cuando la tarea entrega lo principal pero hay aspecto medible que no se logro completar (ej: tests automatizados bloqueados por harness preexistente, smoke E2E imposible sin sistema externo migrado). NO usar como sinonimo de `done` con dudas — solo cuando hay brecha medible declarada. |
| `deferido` | Tarea pospuesta conscientemente con riesgo aceptado. NO es `blocked` (no espera que se desbloquee algo); es decision activa de no implementarla en este work. | Cuando el usuario explicitamente acepta el riesgo de no implementar la tarea (ej: hardening proactivo cuyo riesgo se materializaria en escenario raro). El bloque `### Hallazgos` registra la decision con `decidio: usuario` y la razon. |
| `placeholder-pendiente-observacion` | Tarea declarada como existente pero sin frontmatter completo. Se materializa cuando una tarea anterior produce los hallazgos necesarios. | Aplica solo a works con `abordaje.suficiencia_evidencia: requiere-observacion`. Bob crea estos placeholders en Ola 1 con frontmatter minimo (`id`, `status`, `descripcion`); al cerrar la tarea de observacion de Ola 1, Bob es re-invocado para materializar Ola 2 con frontmatter completo. Ver `agent-os/skills/host-protocol/etapas/etapa-2.md` seccion "Patron \"dos olas\" cuando `requiere-observacion: true`". |

**Diferencia con `done`:**
- `done` = tarea cumple su meta sin brecha medible.
- `done_con_brecha` = tarea cumple meta principal, brecha declarada y aceptada.
- `deferido` = tarea NO se ejecuto, decision consciente.

**Diferencia con `blocked`:**
- `blocked` = tarea no puede continuar por dependencia externa o tecnica. Espera resolucion.
- `deferido` = tarea no se hara en este work. Decision tomada.

**Tags asociados sugeridos en el README del work:** tareas con `done_con_brecha` o `deferido` llevan tag `deuda` o `verificacion-en-rollup` segun contexto. Quinn audita en E4 que cada caso tenga `### Hallazgos` con la decision explicita.

**Aplicabilidad:** desde 2026-04-30. Works pre-2026-04-30 conservan enum corto (`pending | in_progress | done | blocked`) por compatibilidad.

## Guards del runtime (gates bloqueantes) (desde 2026-06-30)

> **FUENTE DE VERDAD de los guards estructurales.** Esta sección documenta los gates bloqueantes que el binario `agentos` emite (vía `salida.Fallo(codigo, mensaje)`) leyendo el frontmatter del work-record o del diseño. Es lo que un autor de work-records necesita entender para no chocar con un cierre rechazado. La lista autoritativa de **todos** los códigos de gate (incluidos los puramente técnicos: `IO`, `SCHEMA`, `NO_EXISTE`, `JAULA`, etc.) vive en el runtime, en las llamadas a `salida.Fallo(...)` de cada verbo.

Un guard bloquea la operación con exit code 1 y un envelope `{ok:false, error:{codigo, mensaje}}`. Los guards estructurales (los que leen el frontmatter) son:

| Guard (código) | Verbo | Dispara cuando | Lee del frontmatter | Detalle interno |
|---|---|---|---|---|
| `CIERRE` | `work close` | transición a estado terminal ilegal (siempre, incluido `CANCELADO`); **o** `frentes_abiertos[]` no vacío en un cierre distinto de `CANCELADO` | `estado`, `frentes_abiertos[]` | helper `work.FrentesAbiertos()` |
| `BRIDGE` | `work close` | algún item de `grupos_bridge[]` con `estado != archivado` (excepto cierre a `CANCELADO`) | `grupos_bridge[]` | helper `work.GruposBridgeNoArchivados()` |
| `DESENLACE_NO_DECLARADO` | `work close` | ruta `bugfix` (alias legacy `fix`) + `version_sistema: "2"` cierra a `COMPLETADO`/`COMPLETADO_CON_BRECHA` con `desenlace` vacío | `ruta`, `version_sistema`, `desenlace` | misma logica de `work close` |
| `DEPENDENCIA_INSATISFECHA` | `work open` (payload `desde_diseno` con `work_paraguas`) | el Wn depende de filas de `plan_works[]` del diseño no `completado` | `plan_works[]` (diseño origen) | función `diseno.DependenciasInsatisfechas`; se resuelve cerrando la dependencia, reordenando el plan, o pasando `override_dependencias: "{razon}"` en el payload (razon queda en bitácora) |
| `HALLAZGOS_ACTIVOS_EN_PROCESOS` | `work open` (idem) | hallazgos `HZ` en `pendiente_analisis`/`en_analisis` cuyo `invalida` (id de nodo) cae en lo alcanzable por el Wn mas el propio nodo del Wn | hallazgos del diseño (`invalida`, estado) | función `diseno.HallazgosActivosEnNodos`; se resuelve absorbiendo/rechazando los hallazgos en el diseño, o pasando `override_hallazgos: "{razon}"` |
| `DISENO_TERMINAL` | `work open` (payload `desde_diseno`) | el diseño esta `CERRADO`/`OBSOLETO` | `estado` del diseño | helper `maquina.EsTerminalDiseno`; no se abre un work desde un diseño terminal — revisar el slug o reabrir el trabajo via un diseño vigente |
| `VERIFICADOR_FALTANTE` | `work close` (v2, cierre `COMPLETADO`/`COMPLETADO_CON_BRECHA`) | tarea con `evidencia_requerida.ui` en status terminal (`done`/`done_con_brecha`/`done_verificacion_diferida`/`complete`) sin `verificador` | `evidencia_requerida.ui`, `status`, `verificador` (por tarea) | registrar el verificador de la tarea, o descartar el eje `ui` con razon en `evidencia_requerida.descartes[]` (via `work file set-fm`) + `[OVERRIDE]` en bitácora |
| `CU_SIN_RESULTADO` | `work close` (idem) | `evidencia_requerida.ui` activa sin `etapa-4/evidencia/ui/_indice.md`, o sin la sección "Calidad UI (CU)" en ese archivo | `evidencia_requerida.ui` | ejecutar la rúbrica CU-1..CU-5 con resultado escrito (tarjeta `agent-os/skills/host-protocol/etapas/etapa-4/calidad-ui.md`), o descarte del eje `ui` con razon via `work file set-fm` |
| `LLEGADA_SIN_VERIFICAR` | `work close` (idem) | `etapa-4/evidencia/ui/_indice.md` sin la sección "Llegada" | — (verifica contenido del archivo, no frontmatter) | recorrer la llegada como usuario y registrarla (reference E2E de Tessa), o declarar la excepción en el plan de prueba y el descarte correspondiente |
| `COBERTURA_INCOMPLETA` | `diseno transition --a BRIEF_LISTO` | el brief se declara listo con algún requisito de cobertura sin resolver (ni cubierto ni diferido aprobado) | `requisitos_cubiertos` | función `diseno.RequisitosPendientes` |
| `MODELO_AUSENTE` | `diseno transition --a BRIEF_LISTO` | el diseño declara `flujo: modelo` en frontmatter pero no existe `modelo.yml` en disco | `flujo` (frontmatter) + existencia de `modelo.yml` | función `evaluarModeloDelDiseno` |
| `MODELO_LECTURA` | `diseno transition --a BRIEF_LISTO` | `modelo.yml` existe pero `modelo.CargarEn` no puede leerlo (YAML mal formado, error de E/S) | modelo del diseño (`modelo.yml`), no el frontmatter | función `evaluarModeloDelDiseno`, error de `modelo.CargarEn` |
| `MODELO_FORMA` | `diseno transition --a BRIEF_LISTO` | el modelo cargado no pasa `modelo.ValidarForma` — corre antes que los predicados: evaluar cobertura sobre un modelo mal formado da hallazgos engañosos, o ninguno | modelo del diseño (`modelo.yml`), no el frontmatter | función `evaluarModeloDelDiseno`, `modelo.ValidarForma` |
| `PROSA_LECTURA` | `diseno transition --a BRIEF_LISTO` | `modelo.EscanearProsa` no puede leer la prosa del diseño que los predicados de prosa consultan | prosa del diseño (bitácora y demás), no el frontmatter | función `evaluarModeloDelDiseno`, `modelo.EscanearProsa` |
| `ETAPA` | `diseno transition --a BRIEF_LISTO` | `modelo.Evaluar` devuelve error para alguna etapa de `modelo.Etapas` — hoy inalcanzable (las etapas salen del propio enum); se reporta en vez de ignorarse para que una etapa nueva sin predicado no se coma el gate | modelo del diseño (`modelo.yml`), no el frontmatter | función `evaluarModeloDelDiseno`, `modelo.Evaluar` |
| `MODELO_INCOMPLETO` | `diseno transition --a BRIEF_LISTO` | tras correr los predicados de las **8 etapas** de `modelo.Etapas` (foco, datos, cripto, procesos, pipeline, fragmentacion, modelado, brief) sobre el modelo y deduplicar por `{codigo, nodo, detalle}`, queda algún hallazgo sin cumplir | modelo del diseño (`modelo.yml`): nodos, su `Historial` y la prosa del diseño | función `evaluarModeloDelDiseno`; el payload trae `data.hallazgos[]` con `{codigo, nodo, detalle}` y `data.hallazgos_total` |
| `OBSOLETO_BLOQUEADO` | `diseno transition --a OBSOLETO` | se intenta archivar un diseño con hallazgos en estado pendiente | estados de hallazgos del diseño | logica de `diseno transition` |
| `CAMPO` | `work set` | el campo a setear no está en `{modo, conversacion (legacy), nivel, tipo}` (el estado se cambia por `transition`/`close`; los cognitivos del README raíz por `set-fm`) | — (valida el nombre del campo) | mapa `work.CamposSetables` |
| `USO` (entrada stdin) | verbos con entrada JSON por stdin (`work open`, `work tarea ejecutor/verificador`, `work file *`, `diseno file *`, ...) | stdin vacío, o no es JSON válido (el runtime tolera el BOM UTF-8 que PowerShell antepone) | — | funciones `leerJSON`/`falloEntrada` |
| `VERIFICACION_DIFERIDA_INCOMPLETA` | `work close`, `work tarea ejecutor`, `work set-fm`, `work file set-fm` | un bloque `verificacion_diferida{}` existe pero le falta un campo obligatorio, `causa` fuera de enum, `evidencia_sustituta` sin ancla valida, o `revisar_el` no es fecha ISO real (excepto cierre a `CANCELADO`). Un payload que trae su propio `id` es otra cosa: `FORMA` | `verificacion_diferida{}` (README y/o tarea) | <!-- FUENTE: agent-os/templates/work-record/schema/verificacion-diferida.md seccion "Guards". El detalle de cada condicion vive alla. NO duplicar la regla — para modificar, editar la fuente. --> |
| `CIERRE_SIN_DECLARAR_PENDIENTES` | `work close` (cierre a `COMPLETADO` o `COMPLETADO_CON_BRECHA`) | existe un pendiente (tarea `done_verificacion_diferida`, o CA con `Resultado: PENDIENTE`) que ningun bloque cubre en su `alcance` | `status` de tareas, `verificacion_diferida{}`, tabla de cobertura de `etapa-4/07-verificacion.md` | <!-- FUENTE: agent-os/templates/work-record/schema/verificacion-diferida.md seccion "Guards". NO duplicar la regla — para modificar, editar la fuente. --> |
| `ESTADO_NO_DERIVABLE` | `work close` | se pide `--estado COMPLETADO_VERIFICACION_DIFERIDA` directamente | `--estado` solicitado | <!-- FUENTE: agent-os/templates/work-record/schema/verificacion-diferida.md seccion "Guards". NO duplicar la regla — para modificar, editar la fuente. --> |
| `FILA_NO_EXISTE` | `verificacion registrar` | el par `{work_slug, id}` del payload no tiene una fila `diferida-abierta` sin resolver en `agent-os/verificaciones/ledger.md` | ledger de verificaciones | <!-- FUENTE: agent-os/templates/work-record/schema/verificacion-diferida.md seccion "Guards". NO duplicar la regla — para modificar, editar la fuente. --> |
| `HORNEADO` | `work open` (payload `desde_diseno` con `work_paraguas`) | el subgrafo del Wn no se pudo derivar del modelo del diseño, por una de **cuatro** causas — el mensaje conserva el error original y nombra cual | modelo del diseño (`modelo.yml`), no el frontmatter | **el work NO se borra**: ya existe con su README y su abordaje. Reparar en el diseño segun la causa que el mensaje nombra, y rehacer con `agentos work terreno --slug {work}`:<br>**1. sin procesos** — el nodo del work no tiene aristas `CONTIENE` hacia sus procesos → agregarlas.<br>**2. `CONSTRUYE` no alcanza** — hay una arista `CONSTRUYE`, pero declara un work que no alcanza el nodo → corregir el work que nombra o **quitarla**; no crear una nueva.<br>**3. sin alcanzador** — ningun work llega al nodo → reparar la alcanzabilidad, no las aristas `CONSTRUYE`.<br>**4. compartido sin arbitro** — varios works alcanzan el nodo y ninguno lo declara → **agregar** la arista `CONSTRUYE` que falta (`/disenar` step-06).<br>Las causas 2 y 4 piden reparaciones opuestas sobre la misma arista: en la 2 sobra un `CONSTRUYE` roto, en la 4 falta uno — agregar uno donde sobra empeora el estado |
| `TERRENO` | `work open` (idem) | el modelo se horneo pero el bloque `<!-- modelo:start vista=terreno -->` … `<!-- modelo:end -->` no se pudo escribir. Dos negativas declaradas, y por debajo cualquier fallo de E/S sobre el archivo raiz: **(a) marcadores malformados** — el par esta duplicado, o el fin va antes del inicio (`agentos work terreno` a secas lo dice con `MARCADORES_AUSENTES`); **(b) el molde no hospeda el bloque** — el cuerpo del archivo raiz no trae ni el bloque ni una **seccion ancla** (`## Decisiones clave` o `## Archivos modificados`) antes de la cual sembrarlo, que es el caso de la bitacora del `hotfix` y del README del `colaborador-fastrak` (a secas lo dice con `MOLDE_SIN_TERRENO`). Un cuerpo sin ningun marcador **pero con** seccion ancla no dispara este guard: ahi el bloque se siembra solo | — (verifica el cuerpo del archivo raiz del work, no el frontmatter) | **en (a)** reponer un unico par de marcadores bajo `## Terreno` y rehacer con `agentos work terreno --slug {work}`. **En (b) no hay nada que reponer**: ese work no lleva terreno, y ponerle los marcadores a mano seria escribirlo justo donde este guard existe para impedirlo. En los dos casos el archivo queda intacto y la salida conserva la `frontera[]` ya calculada |

**Por qué algunos guards de cierre exceptúan `CANCELADO`:** un work se cancela como salida de emergencia; exigir frentes cerrados o grupos bridge archivados para cancelar dejaría works imposibles de cerrar. El cierre "limpio" (`COMPLETADO` y variantes) sí exige esas precondiciones.

**Relación con los gates de política (cobertura/desenlace):** `COBERTURA_INCOMPLETA` y `DESENLACE_NO_DECLARADO` parecen "política de negocio". No lo son en el sentido prohibido: gatean por **decisión no registrada** (¿el experto pobló el campo?), nunca por el contenido de la decisión — el runtime nunca evalua si la decision tomada fue buena o mala, solo si existe.


## Artefactos de diseño: pipeline (desde 2026-06-17)

Aplicable a `agent-os/disenos/{slug}/pipeline.md` cuando el diseño modela la cadena de procesos encadenados.

<!-- FUENTE: agent-os/templates/diseno/pipeline.md (frontmatter del template). Aqui se enumeran los campos para auditoria cruzada con el schema general; el detalle del contenido del archivo vive en el template. NO duplicar la regla — para modificar, editar la fuente. -->

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `diseno_slug` | string | slug del diseño en `agent-os/disenos/` | Obligatorio. Vincula este pipeline al diseño origen. |
| `brief_version` | number | entero positivo | Obligatorio. Version del brief desde la cual se derivo este pipeline. Se incrementa si el pipeline se rehace tras una nueva version del brief. |

## Artefactos de diseño: fragmentacion (desde 2026-06-17)

Aplicable a `agent-os/disenos/{slug}/fragmentacion.md` cuando un diseño paraguas se descompone en works independientes.

<!-- FUENTE: agent-os/templates/diseno/fragmentacion.md (frontmatter del template). Aqui se enumeran los campos para auditoria cruzada con el schema general; el detalle del contenido del archivo vive en el template. NO duplicar la regla — para modificar, editar la fuente. -->

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `slug` | string | slug del diseño en `agent-os/disenos/` | Obligatorio. Identifica el diseño que este archivo fragmenta. |
| `es_paraguas` | bool | `true` | Obligatorio. Siempre `true`; marca el diseño como contenedor de works dependientes. |
| `n_works` | number | entero positivo | Obligatorio. Cantidad de works declarados en el plan de fragmentacion. |
| `fecha_fragmentacion` | string | `YYYY-MM-DD` | Obligatorio. Fecha en que se produjo la fragmentacion. |

## Artefactos de diseño: proceso-contrato (desde 2026-06-17)

Aplicable a `agent-os/disenos/{slug}/procesos/P{N}-{nombre}.md`, un archivo por proceso modelado en el diseño.

<!-- FUENTE: agent-os/templates/diseno/proceso-contrato.md (frontmatter del template). Aqui se enumeran los campos para auditoria cruzada con el schema general; el detalle del contenido del archivo vive en el template. NO duplicar la regla — para modificar, editar la fuente. -->

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `proceso_id` | string | `P{N}` (ej. `P1`, `P2`) | Obligatorio. Identificador unico del proceso dentro del diseño. |
| `diseno_slug` | string | slug del diseño en `agent-os/disenos/` | Obligatorio. Vincula el proceso a su diseño origen. |
| `nombre` | string | nombre corto del proceso | Obligatorio. Nombre legible del proceso (ej. `"Solicitud de despacho"`). |
| `actor` | string | rol que ejecuta | Obligatorio. Rol especifico que ejecuta el proceso (ej. `"medico"`, `"sistema"`). NO `"el usuario"` generico. |
| `trigger` | string | evento concreto de activacion | Obligatorio. Cuando se ejecuta el proceso (ej. `"al guardar evento de atencion HC con flag X"`). |
| `modulo_huesped` | string | ruta en codebase | Obligatorio. Ruta relativa al modulo del codebase que hospeda este proceso (ej. `"src/atencion/hc"`). |
| `hallazgos_aplicados` | sequence | lista de IDs de hallazgos (`HZ-NNN`) | Opcional. Hallazgos del retroceso bidireccional ya incorporados a este proceso-contrato. Vacio al crear; se puebla al aplicar un hallazgo via `/disenar` modo-retroceso. |

## Snapshot del piloto de autonomia por ruta (`autonomia_fix`) — LEGACY

> **LEGACY.** Snapshot del piloto de autonomia por ruta (ruta legacy `fix`, 3 toggles) que precedio a la
> perilla unica `nivel` (unificacion 2026-07-03, v0.4.0). Solo lectura en works legacy `fix`/`bugfix`
> abiertos antes de esa fecha; no se genera en works nuevos. El modelo vigente de autonomia es
> la perilla unica `nivel` (ver `agent-os/templates/work-record/schema/perilla-y-meta.md` seccion "Perilla de autonomia (nivel)").

Aplicaba (legacy) a works de ruta `fix` (`version_sistema: "2"`) abiertos antes de la unificacion. Snapshot
**congelado al abrir el work** de los toggles `autonomia.rutas.fix` del config local
(`.claude/agent-os.local.json`). Lo horneaba el runtime (`work open`) desde el JSON de stdin que
armaba Alfred; los hooks de la ruta leian este snapshot — NO el config global — para que un cambio
de config a mitad de un work no mutara el work en vuelo.

```yaml
autonomia_fix:
  pool_ensanchado: true            # Pieza 2 (Clase A): mas lentes expertos en la forense
  verificacion_obligatoria: true   # Pieza 3 (Clase B): verificacion no-opt-in por desenlace
  emision_aprendizaje: false       # Pieza 4 (Clase A): candidato a ADN al cerrar/promover
```

**Open-world / default-OFF:** ausente = la ruta se comporta como hoy. Works no-fix no lo
llevan. La cadencia `conversacion` es legacy (el campo canonico vigente es `nivel`); `autonomia_fix`
era un snapshot inmutable durante el work, propio del piloto pre-unificacion.

<!-- La forma del bloque la define el schema de cognitivos del runtime (CamposReadme); este doc la describe. NO duplicar la regla de tipo — para modificar, editar el schema. -->

## Colaborador-fastrak (file_type readme-colaborador-fastrak)

README raiz del work `tipo: colaborador-fastrak` que crea `bridge-session` (Fase 7) cuando este repo participa como colaborador en un grupo bridge. Frontmatter PROPIO (no usa slug/modo/conversacion del readme-work). Horneado por `work open` desde el sub-objeto `fastrak{}` del stdin.

| Campo | Tipo | Req | Nota |
|---|---|---|---|
| tipo | enum {colaborador-fastrak} | si | discriminador de schema |
| director_work | string | si | id del work del director |
| director_instancia | string | si | instancia bridge del director |
| bridge_grupo | string | si | uuid del grupo |
| estado | enum {EN_PROGRESO, COMPLETADO} | si | enum propio del fastrak |
| etapa_actual | enum {F0,F1,F2} | si | fase del fastrak |
| autor | string | si | |
| autor_kebab | string | no | derivado de Kebab(autor); siempre presente en el horneado |
| fecha_inicio | string | si | YYYY-MM-DD |
| fecha_fin | string/null | no | siempre null en SP1; campo para cierre futuro |
| director_repo | string/null | no | url del repo director |
| manifiesto_version_aceptada | number | no | |
| autonomia_fastrak | mapping | no | Snapshot de autonomia del fastrak. Campos: `nivel` enum `minima\|normal\|maxima` (eje de autonomia; ausente = `normal` — el horneado omite el default); `historial_nivel[]` secuencia de reajustes `{de, a, por (operador\|orquestador), instancia, cuando, razon}`. El nivel es mutable SOLO via `work fastrak-nivel` (reajuste gobernado con auditoria); no se edita a mano. |

El slug del fastrak NO es fecha-based: `{nombre-director}-colaborador` (validado por `ValidarSlugFastrak`).
