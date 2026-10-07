---
name: etapa-3
description: Etapa 3 Ejecucion - Anfitrion por modo (Amelia/Atlas en normal, Mary en investigacion, Paige en documentacion). Ejecuta las tareas del plan.
---

# Work Etapa 3 — Ejecucion

## Anfitrion por modo

<!-- FUENTE de la tabla maestra de anfitriones por etapa: agent-os/skills/host-protocol/etapas/README.md seccion "Tabla maestra — Anfitriones por etapa y modo". Esta tabla local enriquece con naturaleza de la ejecucion por modo y la decision Amelia vs Atlas en modo normal (incl. legacy `evolucion`). NO duplicar la tabla maestra. -->

El anfitrion de Etapa 3 depende del `modo` del work. Cada anfitrion ejecuta las tareas materializadas por Bob en Etapa 2 segun el tipo de tarea correspondiente.

| Modo | Anfitrion | Prefijo | Naturaleza de la ejecucion |
|------|-----------|---------|----------------------------|
| `normal` | **Amelia** (anfitriona, duena del codigo) / **Atlas** invitado cross-lens (anfitrion fijo en bugfix/hotfix) | `A-Amelia:` / `A-Atlas:` | Codigo + tests. La anfitriona **conduce** la ejecucion: despacha cada tarea a un ejecutor y recibe (en `nivel` `minima` la teclea ella misma; ver "Despacho de tareas a subagentes"). Corre la suite, commitea en la rama de trabajo. |
| legacy `evolucion` (deprecado -> ruta `rediseno-ui`) | **Amelia** (anfitriona, duena del codigo) / **Atlas** invitado + **Sally** con capacidad LE | `A-Amelia:` / `A-Atlas:` | Codigo construido a partir del prototipo tangible de Sally. Misma conduccion que `normal`. |
| `investigacion` | **Mary** | `A-Mary:` | Ejecucion de frentes de investigacion via `technical-research`, `domain-research`, `market-research` o `document-project`. Entregable: reportes/matrices/analisis. |
| `documentacion` | **Paige** | `A-Paige:` | Redaccion de secciones via `write-document`. Diagramas via `mermaid-gen`. Entregable: documento terminado. |

**Contrato del pool de ejecución (E3).** En modo `normal` (y works legacy `evolucion`) (rutas `acotado` y diseño-derivadas), **Amelia es la anfitriona y la dueña del código** — coordina el pool: **conduce** la ejecución de código+tests (despachando ejecutores y recibiendo sus bloques; solo en `nivel: minima` teclea ella misma) y puede invitar a Atlas por una tarea cross-lens (UX+ARQ+SEC simultáneos). **Atlas** es anfitrión fijo de las rutas forenses `bugfix`/`hotfix` — no es un "escape" de E3, es su hogar (ver `agent-os/experts/bmad-agent-alfred/rutas/bugfix/` y `.../hotfix/`).

**Qué significa `anfitrion-E3-pool`** (rol del `_registry.yml`): el host de E3 coordina el pool de ejecutores + invitables, con autoridad de coordinación pero **last-word por dominio**: Amelia tiene la última palabra del código; Atlas, de la lectura cross-lens/estructura; Sentinel, de la seguridad. Un choque cross-dominio se resuelve con el protocolo de `agent-os/skills/destilar-standard/SKILL.md` sección "Autoridad y resolución de conflictos" (capas → dueño de dominio → escalamiento).

Si Quinn activa `[MP]` para este work, E3 implementa las pruebas bajo `agent-os/standards/testing/modelo-pruebas.md` del repo; Quinn audita.

**Obligacion derivada (independiente de que este work haya activado `[MP]`).** Cuando el runtime deriva que el work toca reglas de negocio ya registradas (`agentos pruebas alcance --work <slug>` devuelve `reglas_tocadas`), E3 evalua la cobertura de esas reglas contra el modelo vigente del repo y, coordinado por Quinn, define/actualiza/implementa las pruebas correspondientes antes de proponer el cierre de la etapa.
<!-- FUENTE: agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md secciones "Handoff con E3 (Quinn <-> ejecutor)" y "Frontera runtime/cognicion". El contrato completo (artefactos esperados, frontera productor/auditor, derivacion determinista del alcance, gate de cierre) vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

**Rigor siempre-activo.** El pool forense (lentes por senal) y la verificacion del
experto de dominio NO son opt-in: corren en todos los works de la ruta cuando sus
senales matchean. La perilla `nivel` del work solo modula QUIEN confirma (frecuencia
de gates humanos), nunca si el rigor corre.

## Roster de invitables por modo

### Modo `normal`

| Experto | Cuando invitarlo |
|---------|------------------|
| Sentinel | **Obligatorio (no on-demand) si alguna tarea tiene `capa_seguridad.aplica: true`.** Tambien si surge hallazgo de seguridad durante ejecucion (SQL injection, XSS, etc.) |
| Quinn | Tests fallando que requieren diagnosis de cobertura o flaky detection |
| Atlas | Cruce de disciplinas en una tarea especifica (si Amelia es anfitriona y la tarea toca UX+SEC+ARQ simultaneo) |
| Bob | Course correction si se detecta cambio mayor durante ejecucion |

### Modo `evolucion` (legacy, deprecado -> ruta `rediseno-ui`)

Mismos invitables que `normal` + **Sally** con capacidad LE como compania permanente mientras se ejecutan tareas con invariantes LE.

### Modo `investigacion`

| Experto | Cuando invitarlo |
|---------|------------------|
| Winston | Frente que exige **leer arquitectura del codigo**: grafo de dependencias, contratos entre capas, inventario de callers. Tambien para validar arquitectonicamente una opcion candidata dentro de un frente. |
| Dexter | Frente que toca **persistencia**: modelo de datos, procedimientos, migraciones, lectura de esquema real. |
| Atlas | Frente que exige **lectura cross-lens** del codigo (varias disciplinas a la vez sobre el mismo modulo). |
| Sentinel | Frente que toca seguridad/compliance. |
| Paige | Formatear un hallazgo de frente como diagrama o tabla estructurada. |
| Bob | Course correction si aparece un frente nuevo no planeado. |

**Mary conduce; no lee codigo sola.** Las senales que la hacen anfitriona de esta etapa
incluyen "auditar codigo", "analisis brownfield" y "mapear codebase". Conducir eso es su
trabajo; **leerlo** es el de los duenos del dominio. Mary **despacha a cada experto como
subagente consultor** por frente, y hace lo que si es su ADN: elicitar, contrastar fuentes,
sintetizar y producir los CAs de cobertura del insumo.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Las dos clases". El contrato del consultor vive alli. NO duplicar — para modificar, editar la fuente. -->

**Amelia no es invitada:** no hay codigo que **escribir**. (Atlas si lo es — no para ejecutar,
sino para **leer** cross-lens.)

### Modo `documentacion`

| Experto | Cuando invitarla |
|---------|------------------|
| Mary | Validar que una seccion cubre correctamente el CA o la audiencia declarada |
| Tessa | Capturar screenshots via Playwright para inclusion en el documento |
| Winston | Revisar exactitud tecnica de secciones arquitectonicas |
| Sentinel | Revisar exactitud de secciones sobre seguridad/compliance |
| Bob | Course correction si aparece una seccion nueva no planeada |

Amelia/Atlas NO son invitados: no hay codigo que ejecutar.

## Senales a detectar por modo

### Modo `normal` (incl. legacy `evolucion`)

- Error/bug/test rojo → aplicar principle `systematic-debugging` del anfitrion (reproducir, aislar, hipotesis, verificar, fix).
- Hallazgo de seguridad en codigo → invitar Sentinel.
- Tests fallando repetido → invitar Quinn.
- Tarea requiere perspectiva multi-capa → invitar Atlas (solo si anfitrion es Amelia).
- Cambio mayor detectado → escalamiento: invitar Bob para course correction.
- **Senal #10 (drift): endpoint nuevo o metodo con efecto CRUD persistente aparece durante implementacion que NO esta en el bloque `capa_seguridad` de su tarea.** Drift fuerte: la implementacion esta adelantando un contrato de seguridad que no fue declarado en E2. Aplica solo en modo `normal` (incl. legacy `evolucion`). El anfitrion: (a) en nivel `minima`/`normal` consulta al usuario antes de avanzar; (b) en nivel `maxima` registra `[AUTO]` en bitacora con compromiso de retornar a E2 al cierre de la tarea para actualizar el bloque y, si hay nuevos permisos, agregarlos al delta. Sentinel valida la decision.

### Modo `investigacion`

- Frente termina con opciones no exhaustivas → Mary decide si abrir subfrente o cerrar con nota.
- Hallazgo contradice premisa declarada en E1 → disparar `/alfred reevaluar` (senal de drift #4 en host-protocol).
- Un frente requiere perspectiva arquitectonica o de seguridad → invitar Winston o Sentinel.

#### Sub_modo `multi-repo` (capacidad RM de Mary)

Cuando el README declara `sub_modo: multi-repo` y `multi_repo.rol: director`, Mary conduce E3 con capacidad `RM` (research-multi-repo) en lugar del flujo single-repo (asimetria director/colaborador via bridge). Procedimiento completo (drenaje obligatorio, publicacion incremental, revision cruzada, los tres entregables de cierre del director, responsabilidad acotada del colaborador, senales de cierre coordinado): tarjeta `etapas/etapa-3/multi-repo.md`.

### Modo `documentacion`

- Seccion redactada no coincide con audiencia declarada → reescritura.
- Falta insumo de codigo/arquitectura que no existe documentado → invitar Winston para extraer.
- Screenshots necesarios → invitar Tessa con descripcion del flujo a capturar.

## Criterio de cierre por modo

### Constante (todos los modos)

- Todas las tareas del plan en un `status` terminal (`etapa-2/tareas/{NNN}-*.md` frontmatter): `done`, `done_con_brecha`, `deferido`, o `done_verificacion_diferida` — este ultimo lo hornea el runtime a partir de `done` + bloque `verificacion_diferida{}` valido, y es una tarea CERRADA, no una tarea pendiente.
- `etapa-3/06-hallazgos.md` completo segun el modo (ver secciones condicionales en la plantilla).
- Usuario aprueba el gate "Etapa 3 completa".

### Especifico por modo

| Modo | Criterio adicional | Evidencia |
|------|--------------------|-----------|
| `normal` | Todos los commits relevantes publicados en la rama de trabajo. **Para cada tarea con `capa_seguridad.aplica: true`, post-flight paso (3 chequeos sin brecha).** **Logs temporales instrumentados** en cada tarea con codigo nuevo/modificado no trivial, con marcadores `#region WORK-DEBUG-LOG` y/o `#region SENTINEL-SECURITY-LOG`, registrados en frontmatter `logs_temporales_instrumentados`. | Archivos modificados + commits referenciados en `06-hallazgos.md`. Catalogo vivo del standard sincronizado si hubo permisos nuevos. Mapa de logs temporales por tarea para que Quinn los use y luego los retire en E4. |
| legacy `evolucion` | Invariantes LE de Sally cumplidas en los artefactos. **Mismo criterio de post-flight de seguridad y logs temporales que `normal`.** | Archivos + commits + referencia a invariantes verificadas. |
| `investigacion` (single-repo) | Cada frente tiene entregable cerrado en `etapa-3/investigacion/{frente-NNN}.md` con fuentes trazadas. | Reportes por frente + indice consolidado. |
| `investigacion` (multi-repo, director) | Frentes del director cerrados + `brief-repo-colaborador.md` descargado del bridge + `brief-devs.md` consolidado escrito por director. Bridge con todos los hallazgos publicados de ambos lados. | `etapa-3/brief-repo-director.md` + `etapa-3/brief-repo-colaborador.md` (descargado) + `etapa-3/brief-devs.md` (escrito por director) + adjuntos publicados al bridge. |
| `investigacion` (multi-repo, colaborador) | Frentes del colaborador cerrados + `brief-repo-colaborador.md` publicado al bridge + revision cruzada del brief del director publicada como comentarios en bridge. | `etapa-3/brief-repo-colaborador.md` + comentarios de revision en bridge. |
| `documentacion` | Documento completo commiteado en la ruta destino (ej. `.documentacion/manuales/`). | Archivos de documento + diagramas + screenshots. |

## Artefacto integrador esperado

### Constante

- `agent-os/work-records/{slug}/etapa-3/06-hallazgos.md` — resumen de ejecucion (con secciones condicionales por modo, ver plantilla).
- Actualizacion de frontmatter de tareas en `etapa-2/tareas/`.

### Por modo

| Modo | Artefactos adicionales |
|------|------------------------|
| `normal` / legacy `evolucion` | Commits en el branch de trabajo (referenciados en `06-hallazgos.md`). |
| `investigacion` | `etapa-3/investigacion/{frente-NNN}.md` por frente + `etapa-3/insumo-consolidado.md` con el cuerpo entregable para el consumidor. |
| `documentacion` | Cada documento de `## Entregables` (o el unico documento) en su ruta destino del repo, con **todas sus salidas declaradas** generadas por su via, + `etapa-3/documento-indice.md` que lista los archivos producidos por documento. |

## Activacion

Cuando el gobernador cierra Etapa 2, invoca al anfitrion segun `modo`:

- `normal` (incl. legacy `evolucion`) → Amelia o Atlas (el gobernador decide).
- `investigacion` → Mary.
- `documentacion` → Paige.

Contextos estandar a pasar: etapa-2/tareas/, etapa-1/cas-consolidados.md, etapa-2/03-plan.md, modo, nivel.

**Primer paso obligatorio del anfitrion al activarse** (complementa a la lectura de meta):

1. Leer `nivel` del README del work (uno de `minima | normal | maxima`, default `normal` si ausente). Works legacy con `conversacion` se leen mapeando `guiada→minima`, `flow→normal`, `yolo→maxima`.
2. Leer el historial del valor si existe (`historial_nivel`, o `conversacion_cambios` en works legacy) — entender como llego a su valor actual.
3. Modular conducta segun el valor (cadencia derivada del nivel):
   - `minima`: consultar cada decision intermedia de implementacion; cierres de tarea siguen siendo ligeros (ver `host-protocol` seccion "Granularidad del cierre segun unidad") pero los puntos de decision se resuelven con el usuario.
   - `normal`: decidir implementacion con criterio profesional; agrupar preguntas acumuladas para presentarlas al cierre de etapa en la plantilla narrativa.
   - `maxima`: decidir implementacion con criterio profesional; registrar cada decision no trivial en `etapa-3/bitacora.md` con prefijo `[AUTO]` (ver plantilla en `host-protocol` seccion "Bitacora de decisiones auto-tomadas"); solo consultar en: cambios de scope, ambiguedad de meta, comandos destructivos, bloqueos tecnicos reales.

**Override implicito:** independientemente del valor, si una decision afecta scope (entregable, CAs, alcance) o meta → consultar al usuario. Si es destructiva (borrar archivos existentes, drop DB, force-push) → confirmar explicitamente.

**Cuarto paso obligatorio en modo `normal` (incl. legacy `evolucion`) con tareas de seguridad:**

4. Leer `agent-os/standards/security/permisos-repo.md` (o el archivo apuntado por `permisos_repo_path` si `permisos_repo_estado: documentado_externo`) y todos los bloques `capa_seguridad` de tareas con `tipo_tarea: codigo`. Construir mentalmente un mapa endpoint→permiso para tener presente durante la ejecucion. Si alguna tarea tiene `capa_seguridad.aplica: true`, Sentinel queda invitado obligatorio para toda la etapa.

## Pre-flight y post-flight de seguridad por tarea (modo normal, incl. legacy evolucion)

Aplica a cada tarea con `capa_seguridad.aplica: true`. No aplica si `permisos_repo_estado` es `no_aplica_por_modo` u `override_usuario`. El anfitrion anuncia el bloque de seguridad antes de tocar archivos (pre-flight) y verifica permiso/modulacion/catalogo antes de cerrar la tarea (post-flight); si el bloque esta vacio, ausente o contradictorio, escala a Sentinel antes de escribir codigo (G5). El cierre de la dimension de seguridad exige ademas el sign-off autoritativo de Sentinel — los 3 chequeos del anfitrion son necesarios pero no suficientes. Procedimiento completo (mensaje canonico de pre-flight, los 3 chequeos de post-flight, resolucion si falla algun chequeo): tarjeta `etapas/etapa-3/capa-seguridad.md`.

## Despacho de tareas a subagentes (modo normal, incl. legacy evolucion)

El anfitrion de E3 no ejecuta las tareas dentro de su propia ventana de contexto: **las
despacha como subagentes ejecutores** (`nivel` `normal` o `maxima`). Cada tarea corre en una
ventana limpia que contiene su tarjeta de etapa, su tarea y nada mas.

**En `nivel: minima` no se despacha:** el anfitrion ejecuta en la sesion principal.

<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md secciones "Orquestacion", "Contrato del ejecutor" y "Gate por nivel". Las condiciones de paralelizacion, los pasos del anfitrion al recibir cada subagente y el porque del gate por nivel viven alli. Aqui solo se declara CUANDO aplica en E3. NO duplicar la regla — para modificar, editar la fuente. -->

## Marcar inicio y cierre de tarea (runtime, via unica)

Aplica a TODAS las tareas de Etapa 3, tengan o no `capa_seguridad.aplica: true`.

**Marcar inicio (runtime):** antes de despachar la tarea al subagente ejecutor, el
**anfitrion** la pone en progreso
con `echo '{"work_slug":"<slug>","ruta_relativa":"etapa-2/tareas/T-NNN-{nombre}.md","frontmatter":{"status":"in_progress"}}' | agentos work file set-fm`.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/artefactos-hijos.md. NO duplicar -- editar la fuente. -->

**Marcar cierre (runtime, via unica):** el **anfitrion** cierra la tarea (nunca el subagente ejecutor, que solo escribe codigo) EXCLUSIVAMENTE con
`agentos work tarea ejecutor` (payload por `--input`/stdin: bloque + status terminal
del schema — `done` | `done_con_brecha` | `deferido`; `done_verificacion_diferida` NO es
pedible, lo hornea el runtime cuando se pide `done` sobre una tarea con bloque
`verificacion_diferida{}` valido — en una operacion
atomica). `work file set-fm` NO es via para el status de CIERRE de tarea; el binario
valida el enum contra el schema. Los estados NO terminales de una tarea (`in_progress`,
`blocked`) se fijan con `agentos work file set-fm` (fragmento `{"status": ...}`) — la
prohibicion de set-fm aplica SOLO a los cierres terminales, que exigen el bloque
Ejecutor atomico.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/piezas/ejecucion.md seccion "Que hace el anfitrion". NO duplicar -- editar la fuente. -->

## Instrumentacion temporal de logs (modo normal, incl. legacy evolucion)

Todo codigo nuevo o modificado lleva logs temporales (marcadores `#region WORK-DEBUG-LOG` / `#region SENTINEL-SECURITY-LOG`) en los puntos clave del flujo afectado, para que Quinn diagnostique en E4 sin agregar prints. Son temporales por contrato: E4 los retira al cerrar pruebas exitosamente.

**Quien los pone:** el **ejecutor** — instrumentar es parte de escribir codigo, y el codigo lo escribe quien lo escribe (el subagente ejecutor en `nivel` `normal`/`maxima`; el anfitrion en `minima`, donde no se despacha). El ejecutor devuelve la lista en `logs_instrumentados`. **Quien la persiste:** el **anfitrion**, que la escribe al frontmatter `logs_temporales_instrumentados` de la tarea con `tipo_tarea: codigo` — el subagente no toca el work-record.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Contrato del ejecutor". El contrato de retorno (incl. `logs_instrumentados`) vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

Procedimiento completo (que instrumentar, formato de las regiones, registro en frontmatter, cuando NO instrumentar): tarjeta `etapas/etapa-3/instrumentacion-logs.md`.

## Baseline visual antes del primer edit (modo normal, incl. legacy evolucion)

Cuando una tarea **modifica una UI que ya existe** y tiene `evidencia_requerida.ui: true`, el anfitrion captura el **estado original en navegador (Playwright) ANTES del primer edit** (`etapa-4/evidencia/ui/{CA}-antes.png`) — el baseline no se puede reconstruir despues de tocar el markup (en E4 el estado original ya no existe). UI nueva no tiene baseline. Reglas completas (captura unica sin re-generar, recuperacion desde commit previo, aplicabilidad por modo): tarjeta `etapas/etapa-3/baseline-visual.md`.

## Drain bridge obligatorio

Al iniciar cada tarea con `alcance: bridge`, el anfitrion ejecuta drain del grupo bridge correspondiente antes de proceder (ver `agent-os/skills/bridge-session/` para detalle). Aplica en todos los modos.

## Contrato de ejecucion del sistema (obligatorio en modo normal, incl. legacy evolucion)

Cuando una tarea con `tipo_tarea: codigo` requiere **compilar, iniciar, ejecutar tests o detener** el sistema como parte de su ejecucion o verificacion local, **quien invoca el skill `run-system` es el ANFITRION (Amelia/Atlas), nunca el subagente ejecutor** — el anfitrion lo corre **al recibir el bloque** de cada ejecutor. No se permite ejecutar comandos ad-hoc de `dotnet build`, `npm start`, `dotnet test`, etc. sin pasar por el skill.

**Por que el anfitrion y no el ejecutor:** el skill conversa con el usuario cuando el comando no esta poblado y escribe `test-env.local.json`; un subagente no puede hacer ninguna de las dos. El ejecutor escribe el codigo **y sus tests**, pero no los corre: si la suite sale roja, el anfitrion re-despacha con el output del fallo.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Contrato del ejecutor". Lo que el ejecutor NO hace y el loop de re-despacho ante suite roja viven alli. NO duplicar la regla — para modificar, editar la fuente. -->

Esto garantiza que:
- El comando se lee desde `test-env.local.json` (fuente de verdad).
- Si el comando no esta poblado, el skill aprende del usuario y actualiza el archivo con confirmacion + bitacora.
- La telemetria (`ultima_verificacion`, `ultimo_resultado`) queda registrada por componente y accion.
- Al pausar o cancelar el work, los servidores se detienen limpiamente via `run-system accion=stop` (cumple la directiva de `work.md` *"SIEMPRE detener servidores iniciados"*).

**Invocacion tipica desde una tarea:**

```
run-system accion=build componente=backend
run-system accion=run componente=backend
run-system accion=test componente=backend
run-system accion=stop componente=backend
```

**Aplicabilidad por modo:**

| Modo | Contrato aplica | Nota |
|------|-----------------|------|
| `normal` | Si | Obligatorio para cualquier tarea que toque build/run/test. |
| legacy `evolucion` | Si | Igual que normal; Sally (LE) no cambia el contrato. |
| `investigacion` | No por default | Mary puede invocar `run-system` opcionalmente si un frente requiere ejecutar un script. |
| `documentacion` | No por default | Paige puede invocar `run-system` opcionalmente si el documento requiere generar diagramas que corran un script. |

Ver `agent-os/skills/run-system/SKILL.md` para el flujo completo del skill.

## Transicion a Etapa 4

Trigger: anfitrion publica `A-{Amelia|Atlas|Mary|Paige}: Etapa 3 cerrada, entregando al gobernador.`

Accion del gobernador:
1. Valida que todas las tareas estan completas.
2. Publica `S-sistema: Gate Etapa 3 aprobado. Activando a Quinn como anfitriona de Etapa 4.`
3. Invoca a Quinn con contextos estandar + `modo` + `nivel` (Quinn adapta el roster de E4 segun el modo y lee entradas `[AUTO]` de bitacoras previas si `nivel` es `normal` o `maxima`).

## Bitacora

Ubicacion: `agent-os/work-records/{slug}/etapa-3/bitacora.md`.

## Referencias

- Protocolo universal: `agent-os/skills/host-protocol/SKILL.md`
- Tarjetas consultables (cargar solo si aplica la condicion nombrada en el indice de esta etapa): `agent-os/skills/host-protocol/etapas/etapa-3/`
- Siguiente etapa: `agent-os/skills/host-protocol/etapas/etapa-4.md`
- Modo investigacion: `agent-os/experts/bmad-agent-mary/references/{technical-research,domain-research,market-research,document-project}.md`
- Modo documentacion: `agent-os/experts/bmad-agent-paige/references/{write-document,document-project}.md`
