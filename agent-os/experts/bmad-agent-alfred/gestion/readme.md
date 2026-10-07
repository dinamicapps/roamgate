# Gestion de Alfred — subcomandos y work-record

## Subcomandos v1

```
/alfred iniciar "{descripcion}"          # arranca abordaje
/alfred iniciar --desde-diseno={slug}    # salta abordaje, ruta diseno con brief listo
/alfred fix "{descripcion}"              # atajo a ruta bugfix (abordaje comprimido; alias legacy)
/alfred hotfix "{descripcion}"          # atajo a ruta hotfix
/alfred continuar [slug]                         # gestion/continuar.md
/alfred estado                                   # gestion/estado.md
/alfred reevaluar [razon]                        # gestion/reevaluar.md
/alfred pausar "razon"                           # gestion/pausar.md
/alfred cancelar "razon"                         # gestion/cancelar.md (terminal, irreversible)
/alfred nivel {minima|normal|maxima}             # gestion/nivel.md (alias legacy: conversacion)
/alfred gobierno {on|off} [definitivo]      # gestion/gobierno.md
/alfred grupo crear {nombre}                     # delega a integraciones/bridge.md
/alfred grupo listar                             # delega a integraciones/bridge.md
/alfred grupo archivar {nombre}                  # delega a integraciones/bridge.md
/alfred contrato listar                          # delega a integraciones/bridge.md
/alfred listar [filtros]                         # gestion/listar.md
/alfred evaluar [agentes]                        # gestion/evaluar.md
/alfred inactivar [experto]                      # gestion/inactivar.md
/alfred history [término]                        # gestion/history.md
/alfred regresar [pieza]             # gestion/regresar.md
/alfred retroceder-a-diseno          # gestion/regresar.md (solo ruta diseno)
/alfred cancelar-retroceso           # gestion/regresar.md
/alfred fix promover-a-diseno        # rutas/bugfix/conversacion.md (alias legacy)
/alfred revisar-qa [slug|--todos]    # piezas/cierre.md
/alfred zoho-agregar-item            # integraciones/zoho.md
/alfred zoho-listar-items            # integraciones/zoho.md
/alfred zoho-quitar-item {item_no}   # integraciones/zoho.md
/alfred zoho-comentarios [item_no]   # integraciones/zoho.md
/alfred zoho-comentar {item_no} "txt" # integraciones/zoho.md
/alfred learn {work-id|batch|consolidar|status|destilar ...}   # mantenimiento/learn.md
/alfred maintain {audit|auditar-coherencia|archivar|...} # mantenimiento/maintain.md
```

Estado de migración: el gobierno de las 6 fases del roadmap está portado. El motor de bridge/zoho/learn/maintain se **invoca, no se porta**. El gobierno de `learn` y `maintain` está portado limpio a `mantenimiento/learn.md` y `mantenimiento/maintain.md`: Alfred gobierna autónomo e invoca el motor estable (git, grep, subagentes, `[DT]`) sin depender de ningún cuerpo legacy. El flujo `/work` (incluidos `work-learn.md`/`work-maintain.md`) fue retirado de circulación; git es su archivo histórico — Alfred no lo referencia ni depende de él.

## /alfred iniciar

1. **Guard de raiz de proyecto:** verificar que el `cwd` es la raiz del repo (`git rev-parse --show-toplevel`). Si no, abortar pidiendo `cd` a la raiz. Toda ruta posterior se resuelve relativa a la raiz validada.
2. Si trae `--desde-diseno={slug}`: validar que el diseno existe en estado `BRIEF_LISTO`/`EN_USO`; arrancar ruta `diseno` con abordaje comprimido.
3. Si no: arrancar `abordaje/readme.md` (Fase 1 -> 2 -> 3).
4. Al confirmar ruta: si la ruta es `responder`, enrutar al experto dueno del dominio (o a `Explore` si no tiene dueno) y cerrar sin work-record. Si la ruta crea work-record, materializar via el runtime (ver subseccion abajo).

### Materializar el work-record (runtime)

La creacion del work-record es deterministica: la ejecuta el binario `agentos`, no se escribe a mano.

1. **Detectar el binario:** buscar `.claude/agent-os-bin/agentos` (o `agentos.exe` en Windows). Si NO existe: informar al usuario "Runtime de agent-os requerido para crear works. Reinstala el runtime de agent-os (instalador del paquete)." y NO crear el work (no hay fallback en prosa).
2. **Construir el JSON de creacion** con el contexto del abordaje:
   `{ "proveedor_ia": "claude", "titulo", "objetivo", "meta", "ruta": "<tipo de abordaje aprobado: responder|bugfix|acotado|diseno|rediseno-ui|investigacion|documentacion>", "abordaje": { "realizado_en", "expertos_invitados", "party_mode", "ruta_propuesta", "ruta_aprobada", "prosa": "<bloque ## Abordaje>" } }`

> El harness Claude declara su identidad pasando `"proveedor_ia":"claude"` a nivel raiz del
> stdin de `work open`. Es el contrato primario de proveedor. El equivalente
> Codex lo declara desde `AGENTS.md` con `"proveedor_ia":"codex"`.

2.5. **Leer el `nivel` de autonomia de la ruta aprobada** (cualquier ruta con work-record:
   `bugfix`, `acotado`, `diseno`, `rediseno-ui`, `investigacion`, `documentacion`, `hotfix`) y
   agregarlo al JSON de creacion como `nivel`. `config get` devuelve un escalar:

   ```
   agentos config get --archivo agent-os-local --ruta autonomia.rutas.{ruta_aprobada}.nivel
   ```

   Devuelve `{ok:true,data:{valor:"minima"|"normal"|"maxima"}}`, o `{ok:false}` con
   `error.codigo: NO_EXISTE` si la clave esta ausente. **Si `ruta_aprobada` es `bugfix`** y
   resuelve a NO_EXISTE, caer ademas a la clave legacy `autonomia.rutas.fix.nivel` (configs
   anteriores al rename de ruta):

   ```
   agentos config get --archivo agent-os-local --ruta autonomia.rutas.fix.nivel
   ```

   Si NO_EXISTE (o, para `bugfix`, tras agotar ambos fallbacks) -> tratar como `normal`
   (default, = comportamiento de hoy). Agregar el valor al stdin de `work open` como
   `"nivel": "<valor>"`.

   **El `nivel` gobierna cuantas confirmaciones ve el humano; el rigor es siempre-activo.** El pool
   de lentes, la verificacion y la emision de aprendizaje ya NO dependen de toggles. Configs legacy
   con los 3 booleanos (`pool_ensanchado`/`verificacion_obligatoria`/`emision_aprendizaje`) se
   ignoran (open-world): el runtime ya no hornea el snapshot `autonomia_bugfix`.

   Tras crear el work, anunciar: `S-sistema: nivel de autonomia: {nivel}`.

El enum de `nivel` (`autonomia.rutas.{ruta}.nivel`) vive en el runtime (schema de config); no se duplica aqui. Perilla unica; el rigor es siempre-activo.
<!-- Fallback: configs legacy usan autonomia.rutas.fix.nivel; configs nuevos usan autonomia.rutas.bugfix.nivel. Alfred intenta bugfix primero; si NO_EXISTE, lee fix; si ninguno, normal. -->


3. **Entregar el payload** (ver "Contrato de insumo (--input vs stdin)" mas abajo):
   `agentos work open --slug <slug> --autor "<autor>" --modo <modo> --nivel <nivel> --tipo <tipo> --input <ruta-json>` (o el JSON por stdin en invocaciones simples/pipeline; `--nivel` ausente = el runtime deriva de `conversacion` legacy o cae a `normal`).
4. **Parsear la respuesta** `{ok, data}`: si `ok:false`, mostrar `error.mensaje` al usuario y detenerse; si `ok:true`, continuar el protocolo de etapas con `data.slug` / `data.frontmatter`.

El binario escribe el README completo (con `generado_por: agentos` en el frontmatter), crea el archivo de sesion y emite la telemetria `crear`. El catalogo no se escribe en `work open` -- se deriva en memoria del frontmatter en la siguiente lectura. Alfred ya no toca esos archivos a mano.

5. **Recomendar higiene de contexto.** Tras el `work open` exitoso, Alfred aplica la recomendacion de limpieza de la frontera **abordaje → apertura del work**: todo lo que el abordaje quemo leyendo el codebase ya quedo horneado en el README, asi que el reset es sin perdida por construccion. Alfred **recomienda**; nunca limpia por su cuenta.
<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Higiene de contexto". La senal (`agentos telemetry get`), el invariante de reset sin perdida, las dos fronteras y la matriz por nivel viven alli. Aqui solo se dispara en la frontera. NO duplicar la regla — para modificar, editar la fuente. -->

### Sembrar el grafo del work

**Solo si `data.modelo_horneado` es `false`.** Ese campo de la respuesta de `work open` esta siempre, y dice si el work ya obtuvo su `modelo.yml` derivandolo del modelo de su diseño. Con `true` el grafo ya esta ahi y el bloque `## Terreno` ya trae la proyeccion real, no un placeholder: emitir encima sellaria un modelo **derivado** como reconstruido desde el abordaje —declarando de si mismo algo falso— y congelaria su `cobertura_declarada` para siempre. Con `true` no se hace nada de esta seccion.

Con `false`, el work trae el bloque `## Terreno` con un placeholder y ningun grafo (`data.modelo_no_horneado_razon` dice por que). Es lo normal en `acotado`, `bugfix`, `investigacion` y `documentacion`, que no ven ningun diseño, y tambien en un work de la ruta `diseno` al que el camino derivado no le aplico. Alfred llena el bloque emitiendo el grafo desde la evidencia que el abordaje acaba de dejar:

1. **Emitir los nodos.** Del `## Abordaje` del README recien horneado — su evidencia recolectada y sus drifts — construir el lote y aplicarlo:
   `agentos modelo emitir --portador work --slug {slug} --desde abordaje --cobertura-declarada "{que sostiene la data y que no}" --input <ruta-json>`
   <!-- FUENTE del contrato de campos del modelo (identidad, campos minimos, dominio de valores, estados, forma del id): agent-os/templates/diseno/schema/modelo.md seccion "Campos por tipo de nodo". La tipologia es la misma en los dos portadores; aqui la emite `modelo emitir --portador work` sobre el lote reconstruido. NO duplicar la regla — para modificar, editar la fuente. -->
   Cada nodo declara `origen: work:{slug}#abordaje` y su `rol` (`construye` si es entrega de este work, `consume` si es terreno que se respeta). El `--desde abordaje` no es opcional: sin el, el work vivo queda sellado como reconstruido de un dossier historico.
2. **Escribir el terreno:** `agentos work terreno --slug {slug}`.
3. **Parsear la respuesta `{ok, data}` en los dos pasos.** Si `ok:false`, mostrar `error.mensaje` y no arrancar el paso siguiente. El work **no** se aborta: ya existe, y su README y su abordaje costaron una conversacion entera. El camino de recuperacion depende de que paso fallo, y se nombra el que corresponde:
   - **Fallo el paso 1** (`modelo emitir`): el work se quedo sin `modelo.yml`, asi que `agentos work terreno` a secas no lo repara — responde `SIN_DISENO_ORIGEN` cuando al work le falta alguna de las dos coordenadas (`diseno_origen`, `work_paraguas`), y `HORNEADO` cuando las trae ambas pero el diseño de origen no tiene `modelo.yml`. En los dos casos no hay de donde derivar el terreno. Una vez corregida la causa se re-ejecuta `modelo emitir`, y despues `agentos work terreno --slug {slug}`.
   - **Fallo el paso 2** (`work terreno`), con el `modelo.yml` ya escrito: basta re-ejecutar `agentos work terreno --slug {slug}` una vez corregida la causa.

   En los dos casos se sigue con el protocolo de etapas sabiendo que el terreno quedo pendiente.

Un caso no es fallo: si la respuesta trae `WORK_ARCHIVADO`, ese work no reconstruye su terreno y no lo tendra. Se comunica como limite, no como error a reintentar.

### Tras crear el work desde diseno (EN_USO + hallazgos aplicados)

Si el work nace con `--desde-diseno={slug}`, dos conductores del ciclo de vida del diseno quedan a cargo de Alfred justo despues del `work open` exitoso — el runtime no los dispara solo:

1. **Promover el diseno a EN_USO:** si el diseno origen esta en `BRIEF_LISTO`, promoverlo: `agentos diseno transition --slug {diseno} --a EN_USO` (primer consumidor abre; sin esto el retroceso derivado — `/alfred retroceder-a-diseno` — nunca engancha).
2. **Marcar hallazgos absorbidos como aplicados:** si el brief absorbio hallazgos en `estado: mitigado` que este work consume, marcarlos: `agentos diseno hallazgo --slug {diseno} --id HZ-NNN --a aplicado --work {slug-del-work}`. El verbo sella `aplicado_por_work` y `aplicado_por_work_en`; no hay que poblarlos aparte.

### Contrato de insumo (--input vs stdin)

**Entregar el payload.** Para payloads grandes o con prosa (tipico de `work open`): escribir el JSON al scratchpad de la sesion y pasar `--input <ruta>` — `agentos work open --slug ... --input <ruta>`. Para invocaciones simples o en pipeline, el JSON por stdin sigue siendo valido. Si se pasan ambos, gana `--input`. El runtime tolera el BOM UTF-8. **Este es el contrato de insumo para todos los verbos del runtime que reciben un JSON** — no es una lista cerrada: aplica por igual a `work open`, `work file create`, `work file set-fm`, `work file set-section`, `work set-fm`, `work tarea`, `diseno file`, `expediente ...`, `learn marcar`, `learn validar-candidato`, `work fastrak-nivel`, y cualquier verbo nuevo del runtime que reciba JSON.

## Indice de subcomandos y patrones

Esta seccion (apertura de `/alfred iniciar`) es lo unico que cada flujo carga al arrancar. El resto de la gestion vive en archivos propios — se cargan solo cuando el subcomando o patron aplica:

| Tema | Archivo |
|---|---|
| Gestionar el estado via runtime (transition) | `gestion/transition.md` |
| Cerrar el work via runtime (close) | `gestion/cerrar.md` |
| Archivar en lote via runtime (maintain archivar) | `gestion/archivar-lote.md` |
| Reabrir un work archivado | `gestion/reabrir.md` |
| Materializar artefactos hijos via runtime (work file create / set-fm) | `gestion/artefactos-hijos.md` |
| Setear campos del work-record via runtime (work set-fm) | `gestion/set-fm.md` |
| Materializar y cerrar un hotfix via runtime | `gestion/hotfix.md` |
| Materializar un work de rediseno-ui via runtime | `gestion/rediseno-ui.md` |
| `/alfred continuar [slug]` | `gestion/continuar.md` |
| `/alfred estado` | `gestion/estado.md` |
| Sesion abandonada (work EN_PROGRESO sin actividad) | `gestion/sesion-abandonada.md` |
| `/alfred reevaluar [razon]` | `gestion/reevaluar.md` |
| `/alfred pausar "razon"` | `gestion/pausar.md` |
| Frontmatter del work-record que Alfred genera (Modelo A) | `gestion/frontmatter-modelo-a.md` |
| Separacion motor-artefacto (CA-8, CA-11) | `gestion/separacion-motor-artefacto.md` |
| Convivencia con Work | `gestion/convivencia-work.md` |
| Equivalencia de nombres de ruta | `gestion/equivalencia-rutas.md` |
| `/alfred cancelar` / `nivel` / `listar` / `evaluar` / `inactivar` / `history` / `regresar` | `gestion/{subcomando}.md` (ya existian) |
| `/alfred gobierno {on|off} [definitivo]` | `gestion/gobierno.md` |
| Ciclo rama+worktree via runtime (worktree abrir/estado/merge/cerrar) | `agent-os/skills/bridge-session/references/ciclo-worktree.md` |
