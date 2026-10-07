# Fase 7: Work-Colaborador / Verificar Work-Director

## Detonante

Esta fase se ejecuta tras Fase 1 (establecimiento). El comportamiento difiere segun rol.

## Si soy Director

No-op. Verificar que el manifiesto generado en Fase 0 se publico correctamente con `bridge_listar_adjuntos(id_grupo, tipo: "manifiesto", destinatario: "all")`. Continuar a Fase 2.

## Si soy Colaborador

### Paso 1: Descargar manifiesto

bridge_listar_adjuntos(id_grupo, tipo: "manifiesto") -> debe retornar 1 archivo.

bridge_leer_archivo(id_grupo, archivo: "manifiesto.yml", version: "ultima")

Guardar en: `{repo}/agent-os/work-records/{nombre-director}-colaborador/etapa-0/manifiesto-recibido.yml`

Si el manifiesto es minimo (sin work-record asociado del director): operar tambien en modo minimo - no crear work-record fastrak, registrar advertencia y delegar coordinacion al canal de mensajes de bridge.

### Paso 1.5 (NUEVO): Guardia estado_grupo

Leer `manifiesto.estado_grupo` descargado en Paso 1.

- **Si `estado_grupo == exploracion`:**
  - NO crear work-record fastrak.
  - NO publicar autorizaciones/restricciones proactivamente.
  - Solo acusar recibo via `bridge_publicar` tipo `response` con: "Unido al grupo en modo exploracion. Quedo a la espera de dialogo antes de arrancar fastrak."
  - Recepcion por push (modo channel, default): los mensajes del grupo llegan solos
    como `<channel ...>` — NO montar `/loop`. Solo en polling/degradado, fallback con
    `bridge_leer` (ver crear-sesion.md seccion "Recepcion de mensajes").
  - Saltar a **Paso Espera-Promocion** (ver abajo).
- **Si `estado_grupo == acordado`:**
  - Continuar con Paso 2 (crear fastrak) normalmente.
- **Si `estado_grupo == archivado`:**
  - Rechazar union. El grupo no acepta nuevos miembros.

### Paso Espera-Promocion (solo si estado_grupo == exploracion)

Mientras el grupo siga en `exploracion`:
- Responder a mensajes del director/otros colaboradores.
- Participar en dialogo de descubrimiento.
- NO crear archivos de fastrak.

Cuando el director publique mensaje con metadata `{"transicion": "exploracion-a-acordado"}` y manifiesto v2 adjunto:
- Descargar manifiesto v2.
- AHORA SI ejecutar Paso 2 (crear fastrak) con manifiesto v2 como base.
- Continuar flujo F0->F1->F2 normalmente.

### Paso 2: Crear work-record fastrak (via runtime)

El README raiz lo hornea el runtime (NO se escribe a mano). Invocar:

Payload recomendado via `--input <ruta>` (escribir el JSON al scratchpad de la sesion); stdin sigue valido para la invocacion simple.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->

**Leer el nivel de autonomia** (antes de invocar `work open`). `config get` devuelve
escalares, asi que se lee el nivel directo:

```
agentos config get --archivo agent-os-local --ruta autonomia.rutas.fastrak.nivel
```

Devuelve `{ok:true,data:{valor:"minima"|"normal"|"maxima"}}`, o `{ok:false}` con
`NO_EXISTE` si esta ausente -> tratar como `normal` (default que siembra `config migrate`).
Si el nivel es `minima` o `maxima`, agregar al `fastrak{}` del stdin de `work open`:
`"autonomia_fastrak": { "nivel": "<nivel>" }`. Si es `normal` (default), NO incluir el
bloque -- el runtime omite el default al hornear. **Bloque ausente en el README = `normal`**:
los gates de pieza de `normal` SI aplican (ausente NO significa "sin gates").

Tras crear: anunciar `S-sistema: autonomia_fastrak congelada: nivel=<nivel>`.

Escribir al scratchpad (`autonomia_fastrak` solo si nivel != normal; omitir si normal):
`{"fastrak":{"director_work":"{id}","director_instancia":"{instancia}","director_repo":"{url}","bridge_grupo":"{uuid}","manifiesto_version_aceptada":{N},"etapa_actual":"F0","autonomia_fastrak":{"nivel":"maxima"}}}`

```
agentos work open --slug {nombre-director}-colaborador --autor "{git user.name}" \
    --modo colaborador-fastrak --tipo colaborador-fastrak --input <ruta-json>
```

(equivalente por stdin en invocacion simple: `echo '{...}' | agentos work open ...`)

- El slug es `{nombre-director}-colaborador` (no fecha-based; el runtime lo valida con esa forma).
- `--modo`/`--tipo` son `colaborador-fastrak` por contrato del verbo; el horneado del fastrak los ignora (su frontmatter es propio). El discriminador real es el sub-objeto `fastrak{}`.
- El runtime crea `{nombre-director}-colaborador/README.md` con frontmatter `tipo: colaborador-fastrak` y lo registra en el catalogo.
- **El nivel de autonomia** se lee del config (arriba) y se pasa solo si != `normal` (el default no se hornea; ausente = `normal`).

Los sub-artefactos de etapa-0/1/2 (manifiesto-recibido, evaluacion-expertos, clasificacion, publicaciones, autorizaciones, tareas, evidencia) los sigue creando este skill (sin cambio).

Estructura:

{nombre-director}-colaborador/
- README.md                         # frontmatter tipo=colaborador-fastrak
- etapa-0/                          # F0: Aceptacion
  - manifiesto-recibido.yml
  - manifiesto-recibido.v1.yml
  - evaluacion-expertos.md
  - clasificacion.yml
  - publicaciones/
    - para-director.md
    - para-colaborador-{X}.md
  - autorizaciones/
    - A-{NNN}-director.md
    - A-{NNN}-usuario.md
  - bitacora.md
  - experto-{nombre}.md
- etapa-1/                          # F1: Ejecucion
  - tareas/
    - T-{NNN}-{slug}.md
  - cambios-ejecutados.md
  - bitacora.md
- etapa-2/                          # F2: Verificacion
  - evidencia.md
  - hallazgos.md
  - bitacora.md

### Paso 3: F0-Aceptacion

**Antes de lanzar expertos:** cachear lista de miembros y resolver roles a IDs.

```
miembros = bridge_listar_miembros(id_grupo)
id_director = [m.id for m in miembros if m.rol == "director"][0]
ids_colaboradores_otros = [m.id for m in miembros if m.rol == "colaborador" and m.id != mi_instancia_id]
```

Resolver SIEMPRE por `instancia_id` (no por `nombre`): varias sesiones del mismo repo
coexisten como `nombre#session_corto`. `bridge_listar_miembros` reporta tambien la
presencia (`conectada`/`desconectada`) — usarla para saber quien esta vivo, NO un
estado "inactivo" por heartbeat. `mi_instancia_id` se obtiene de `bridge_estado()`
(campo de identidad de la sesion local).

Estos IDs se usan en Paso 4 para publicaciones dirigidas. Si la membresia cambia durante F0, re-resolver.

Lanzar pool de expertos en Patron B (revisor funcional) - ver `agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md` seccion "Principio de roles (no negociable)" para el patron de despacho vigente (SKILL cargado o subagente) - del colaborador segun `_registry.yml` activo del repo.

Cada experto recibe: manifiesto completo + reglas del grupo + configuracion del repo local. Escribe `experto-{nombre}.md` con tabla de hallazgos. Cada hallazgo con campos:

| id | manifiesto_ref | clasificacion | publicacion | destinatarios | razon_publicacion | evidencia |

Clasificaciones (ver autorizacion-dual.md): SI | NO | AUTORIZAR-A | AUTORIZAR-B | INFORMATIVO
Publicacion (ver mas abajo): privada | director | cruce

Skill consolida en `clasificacion.yml`:

```
items:
  - ref: F-002
    estado: aprobado | rechazado | pendiente_autorizacion_a | pendiente_autorizacion_b
    razon: "{si rechazado o pendiente}"
```

### Paso 4: Generar publicaciones dirigidas

Leer todos los `experto-*.md`, agrupar hallazgos por destinatario:

publicaciones/para-director.md -> hallazgos con publicacion=director
publicaciones/para-colaborador-{X}.md -> hallazgos con publicacion=cruce y X en destinatarios

Cada archivo lleva frontmatter version=1 (ver archivos-publicacion.md).

Subir al bridge con destinatario explicito:

```
resultado_dir = bridge_subir_adjunto(id_grupo,
  ruta: "{ruta-local}/publicaciones/para-director.md",
  nombre: "f0-{mi-instancia}-para-director.md",
  destinatarios: [id_director],     # resuelto via bridge_listar_miembros al inicio de F0
  tipo: "evaluacion",
  changelog_entry: "v1: F0-aceptacion inicial")

bridge_publicar(id_grupo, "response", "Mi evaluacion para director publicada (v1).",
  destinatarios: [id_director],
  adjunto_id: resultado_dir.adjunto_id,
  metadata: '{"subtipo": "f0-evaluacion-director"}')

# Por cada colaborador X con publicaciones de tipo cruce:
resultado_x = bridge_subir_adjunto(id_grupo,
  ruta: "{ruta-local}/publicaciones/para-colaborador-{X}.md",
  nombre: "f0-{mi-instancia}-para-{X}.md",
  destinatarios: [id_colaborador_x],   # resuelto via bridge_listar_miembros
  tipo: "evaluacion-cruce",
  changelog_entry: "v1: cruce detectado en F0")

bridge_publicar(id_grupo, "response", "Mi evaluacion-cruce para {X} publicada (v1).",
  destinatarios: [id_colaborador_x],
  adjunto_id: resultado_x.adjunto_id,
  metadata: '{"subtipo": "f0-evaluacion-cruce", "destinatario_logico": "colaborador:{X}"}')
```

Publicar broadcast resumen:

```
bridge_publicar(id_grupo, "response", "Mi F0-aceptacion concluida. Aprobados: N. Rechazados: N. Pendientes A: N.",
  metadata: '{"subtipo": "f0-aceptacion", "aceptadas": N, "rechazadas": N, "pendientes_a": N}')
```

### Paso 5: Resolver Tipo A y B

Tipo A: ver autorizacion-dual.md flujo Tipo A.
Tipo B: AskUserQuestion loop A/P/C local. Decision se registra solo en archivos locales.

> **Escalamiento por bridge (trampas verificadas en el test de orquestacion).** Cuando una
> autorizacion se escala a un actor del bridge (operador o orquestador), aplica las reglas de
> `./guia-operativa-bridge.md`: `dashboard-usuario` es destino FIJO (no lo busques en
> `bridge_listar_instancias`; un 409 `no_molestar` es la unica senal fiable de no-disponible),
> usa `timeout_seg` amplio porque el timeout corre durante `requiere_autorizacion` (la solicitud
> expira esperando al humano), y verifica el estado contra la fuente de verdad antes de afirmar
> resuelto. NO uses `AskUserQuestion` con el operador del bridge (solo aparece en tu terminal
> local, no le llega). La graduacion de cuando auto-aprobar vs escalar segun el nivel de
> autonomia es trabajo de la perilla del fastrak (snapshot `autonomia_fastrak`).
> <!-- FUENTE: ./guia-operativa-bridge.md secciones 2-4. NO duplicar las trampas -- editar la guia. -->

### Paso 6: Gate F0 -> F1

No avanzar a F1 mientras existan items con estado `pendiente_autorizacion_*`. Gate duro.

Cuando todos resueltos:
- `agentos work fastrak-etapa --slug {slug} --a F1` (la mini-maquina valida el orden).
- Re-emitir publicaciones/para-director.md v2 con cambios en changelog (ver archivos-publicacion.md).

### Paso 7: F1-Ejecucion

**Gate de creacion obligatoria (Pieza 1, Clase B).** Lee `autonomia_fastrak.nivel` (ausente = `normal`):

```
si nivel es normal o maxima:
    el work-record fastrak DEBE existir antes de tocar el sistema. Si se va a modificar
    el sistema y el fastrak no fue creado (Paso 2) -> crearlo primero (no se ejecuta
    ningun cambio sin fastrak). En maxima es bloqueante: sin fastrak no se toca codigo.
    (En estado_grupo: exploracion no hay F1 -> el gate no aplica todavia.)
si nivel es minima:
    -> comportamiento base (creacion discrecional; modo minimo permitido).
```

**Gate de worktree (instancias launcher).** Si esta instancia tiene origen launcher:
antes del primer cambio a archivos del repo, `agentos worktree abrir --slug {slug}` y
operar EN el worktree hasta el cierre.
<!-- FUENTE: agent-os/skills/bridge-session/references/ciclo-worktree.md seccion "Apertura — antes del primer cambio a archivos". NO duplicar la mecanica -- editar la fuente. -->

**Validacion experto (Pieza 2).** Si `nivel` (ausente = `normal`) es `normal` o `maxima`, Atlas aplica el
protocolo de `./validacion-experto-fastrak.md` (roster signal-driven + obligatoriedad por
nivel + deliberacion party) antes de publicar `cambio-ejecutado`. En `minima`, ejecucion
base (subagente Patron A, sin validacion experto obligatoria).

Solo tareas con `estado: aprobado` o `autorizado`. Cada tarea ejecuta en subagente Patron A (Amelia/Atlas del colaborador).

Si durante ejecucion un experto detecta que la tarea toca algo fuera de lo evaluado en F0 -> stop, reclasificar (mini-F0 para ese item).

Cambios commiteados -> bridge_publicar tipo "cambio-ejecutado" con diff resumido.

Gate F1 -> F2: cuando la ejecucion concluye, `agentos work fastrak-etapa --slug {slug} --a F2` (la mini-maquina valida el orden).

### Paso 8: F2-Verificacion

**Verificacion obligatoria (Pieza 3, Clase B).** Lee `autonomia_fastrak.nivel` (ausente = `normal`):

```
si nivel es normal o maxima:
    el colaborador NO reporta "cambio hecho/verificado" al grupo sin evidencia local
    (etapa-2/evidencia.md) + la deliberacion party de la Pieza 2. En maxima es
    bloqueante de cierre/reporte: sin verificacion documentada no avanza.
si nivel es minima:
    -> verificacion base (participa en el plan de prueba del director, evidencia opcional).
```

Participacion en plan de prueba del director (Fases 2-6 existentes). Evidencia local en `etapa-2/evidencia.md`. Publicar al grupo como tipo=evidencia, destinatario director o all.

Hallazgos registrados localmente; si aplican al director, publicados como `contexto` con metadata.

## Cierre

Colaborador no puede cerrar su work-fastrak mientras grupo bridge siga activo. Al archivarse el grupo: `agentos work close --slug {slug} --estado COMPLETADO` (el runtime exige etapa F2; el hecho "grupo archivado" lo garantiza este skill — el runtime no ve el bridge), alimentar memoria de expertos del colaborador (patron `/alfred learn` existente).

**Instancias launcher — protocolo de 3 pasos.** El `work close` de arriba es el paso 1;
siguen `worktree merge` (paso 2; conflicto = resolucion cognitiva) y `worktree cerrar`
(paso 3; residuos con aprobacion por bridge, luego limpieza). El push NO forma parte.
<!-- FUENTE: agent-os/skills/bridge-session/references/ciclo-worktree.md seccion "Cierre — 3 pasos en orden estricto". NO duplicar los pasos -- editar la fuente. -->

Si el grupo se disuelve antes de F2 (aborto), la salida gobernada es CANCELADO: `agentos work close --slug {slug} --estado CANCELADO` (legal en cualquier etapa; el runtime lo exime de la restriccion de F2 igual que el guard generico de bridge exime CANCELADO).

**Emision de aprendizaje (Pieza 4, Clase A POST).** Si `autonomia_fastrak.nivel` (ausente = `normal`) es `normal` o `maxima`,
ademas de la cosecha al cierre, emitir candidatos a ADN en los puntos de decision
(clasificacion en F0, autorizacion resuelta, cambio ejecutado + deliberacion) via
`agentos learn validar-candidato` (payload via `--input <ruta>`, recomendado; stdin con
candidato anclado sigue valido). Aditivo; no bloquea. El dial solo emite; nunca cura el
ADN (invariante de frontera).
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/mantenimiento/consolidar-reflexiones.md (frontera runtime/cognicion: el runtime emite, no cura). NO duplicar. -->

Aplica la disciplina de cierre del participante (documentar + commit + compactar/limpiar
segun autonomia) antes de confirmar.
<!-- FUENTE: agent-os/skills/bridge-session/references/disciplina-participante.md seccion "2. Cierre por archivado". NO duplicar -- editar la fuente. -->
