# Schema de frontmatter — Catalogos de work-records y control de sesion

> Fragmento de `frontmatter-schema.md` (ver indice). El esquema de `_catalogo.yml` (activos y archivo) y el archivo de control de edicion por sesion.

## Catalogos de work-records (desde 2026-05-20)

> **FUENTE DE VERDAD del esquema de catalogos.** `commands/agent-os/alfred.md` y `agent-os/experts/bmad-agent-alfred/gestion/{listar,history}.md` + `mantenimiento/maintain.md` referencian esta seccion por puntero. NO redefinir el esquema en esos archivos.

El sistema mantiene **dos catalogos** con el mismo esquema:

- `agent-os/work-records/_catalogo.yml` — works en estado **activo** (viven en la raiz de `work-records/`).
- `agent-os/works-archivo/_catalogo.yml` — works en estado **terminal** (viven en `agent-os/works-archivo/AAAA/MM/autor-kebab/`).

### Naturaleza del catalogo: derivado puro en-memoria, sin archivo (desde 2026-07-08)

Ningun catalogo se persiste en disco. El README de cada work es la **unica fuente de verdad**; el
catalogo es una vista calculada a partir de esos README en el momento de la lectura, y deja de
existir en cuanto termina esa lectura. No hay cache, no hay archivo que versionar, trackear ni
conflictuar entre instancias.

`agentos catalog show` es la **lectura mediada por el runtime**: invoca al loader `cargarFresco`,
que reconstruye el catalogo completo en memoria recorriendo las carpetas-work y devuelve el
resultado directamente — sin escribir nada a disco. Si `cargarFresco` encuentra un `_catalogo.yml`
fisico (heredado de una instalacion previa, traido por un `pull`, o dejado por otra instancia), lo
elimina como parte de la misma lectura (best-effort: si el borrado falla por permisos o lock, la
lectura en memoria ya se cumplio igual). Un consumidor nunca ve un catalogo corrupto, obsoleto ni
desincronizado porque no hay estado intermedio que pueda corromperse u obsoletarse — cada lectura
recalcula desde cero.

### Estados que determinan en que catalogo va un work

| Grupo | Estados | Catalogo | Ubicacion fisica |
|-------|---------|----------|------------------|
| Activo | `EN_PROGRESO`, `PAUSADO`, `EN_PAUSA`, `EN_PAUSA_POR_DISENO`, `PRE_CIERRE` | `_catalogo.yml` | `work-records/{slug}/` |
| Terminal | `COMPLETADO`, `COMPLETADO_CON_BRECHA`, `REPLANTEADO`, `CANCELADO`, `MIGRADO`, `TRASLADADO_A_DISENO` | `works-archivo/_catalogo.yml` | `agent-os/works-archivo/{AAAA}/{MM}/{autor-kebab}/{slug}/` |

Works legacy: `VERIFICACION_PENDIENTE` se trata como activo; `COMPLETADO-SIN-PRUEBAS` como terminal.

> Los tres estados de pausa (`PAUSADO`, `EN_PAUSA`, `EN_PAUSA_POR_DISENO`) son estados distintos con causas distintas — su significado se define en `agent-os/templates/work-record/schema/nucleo.md` seccion "Estados del work (campo `Estado` en README.md)". A efectos del catalogo todos cuentan como **activo**: el work sigue vivo en la raiz de `work-records/`.

### Esquema de cada catalogo

```yaml
generado_por: agentos                   # siempre "agentos": el runtime lo reconstruye en memoria
actualizado: 2026-05-20                 # fecha de referencia de esta lectura (no se persiste)
works:
  - slug: "20260520-foo"
    ruta: "20260520-foo"                # relativa a work-records/.
                                        # En works-archivo/: "2026/05/julio-diaz/20260103-bar"
    estado: EN_PROGRESO
    modo: normal                         # normal | evolucion (deprecado, legacy) | investigacion | documentacion | hotfix
    abordaje_ruta: acotado                # responder | bugfix | acotado | diseno | rediseno-ui
                                        #  | investigacion | documentacion | null
                                        #  (legacy tolerado en lectura: fix, desarrollo-acotado, desarrollo-via-diseno)
    punto_actual: "etapa-2"              # etapa-N | F0/F1/F2 (fastrak) | "abordaje"
    meta: "Frase de meta truncada a ~100 chars"
    autor: "Julio Diaz"
    fecha_inicio: 2026-05-20
    ultima_actividad: 2026-05-20         # campo derivado en reconstruccion; ver abajo
    tipo: normal                         # normal | colaborador-fastrak
    cerrado_en: null                     # YYYY-MM-DD; solo poblado en works-archivo/_catalogo.yml
    archivos_tocados: []                 # solo poblado en works-archivo/_catalogo.yml; ver abajo
```

### Campo `ultima_actividad`

**Honestidad del campo (desde 2026-07-08):** con la escritura incremental retirada, este campo dejo de ser un historico de la ultima transicion real. El runtime lo fija a la fecha de la reconstruccion (`entradaDe` en `work.go`, invocada por `cargarFresco`) al armar la entry de cada work activo — en la practica, aproximadamente la fecha de la lectura (hoy), no la fecha en que el work cambio de estado por ultima vez. Tampoco viene del mtime de archivos en disco (el mtime no sobrevive a `git clone`/`pull`). Si se necesita el historico real de la ultima transicion, hay que leerlo del propio README del work (bitacora/frontmatter), no del catalogo. Persistir `ultima_actividad` en el frontmatter del README para recuperar ese historico queda como decision pendiente, fuera de este documento.

### Campo `archivos_tocados`

Lista de rutas de archivos modificados por el work. Se puebla **una sola vez**, en el momento del archivado, extrayendola de la seccion "Archivos modificados" del README del work. Es seguro cachearlo porque el work ya esta cerrado y no cambiara. Vacio (`[]`) en `_catalogo.yml` de activos. Lo consume `/alfred history` para responder "que works tocaron este archivo?" sin abrir READMEs.

### Campo `generado_por`

Siempre `agentos`: el catalogo entero lo produce el runtime por reconstruccion en memoria en el momento de la lectura, nunca por escritura incremental ni por un comando de reconstruccion aparte. El campo ya no distingue entre modos de generacion (no hay mas que uno).

### Contrato de escritura incremental — RETIRADO (desde 2026-07-08)

Este contrato existio mientras el catalogo era un archivo persistido que cada transicion de estado debia actualizar en el mismo paso. Ya **no aplica**: el catalogo no se escribe nunca, ni de forma incremental ni completa. El README de cada work es la unica fuente de verdad; ninguna operacion (`/alfred iniciar`, `pausar`, `continuar`, `cancelar`, cierre de etapa, cierre de work) toca un catalogo — todas se limitan a escribir el frontmatter/cuerpo del README (y, en el cierre, a mover la carpeta del work). La vista de catalogo se obtiene recorriendo los README en disco cada vez que se pide (`agentos catalog show`), asi que refleja el estado real sin necesidad de sincronizacion explicita.

### Cierre / archivado — operacion atomica (ejecutada por el runtime)

Cuando un work llega a estado terminal, el cierre y archivado los ejecuta de forma atomica el binario `agentos work close --slug <slug> --estado <TERMINAL>`. **No editar el README a mano.** El binario:

1. Escribe `Estado` terminal + `fecha_fin` en el README del work.
2. Mueve la carpeta `work-records/{slug}/` -> `agent-os/works-archivo/{AAAA}/{MM}/{autor-kebab}/{slug}/`. `AAAA/MM` se derivan de la fecha de cierre. `autor-kebab` = `autor` normalizado a kebab-case.

No hay un tercer paso de catalogo: no existe archivo que "quitar de activos" ni "agregar a archivo". La siguiente vez que algo pide el catalogo (`agentos catalog show`), la reconstruccion en memoria ya encuentra el work en su carpeta nueva y lo reporta como archivado, con `ruta` al nuevo path, `cerrado_en` (`fecha_fin` del README) y `archivos_tocados` extraido de la seccion `## Archivos modificados` del README — sin que el cierre haya tenido que poblar nada de eso explicitamente.

El orden de los dos pasos lo garantiza el binario (el README dice la verdad antes de moverse la carpeta); un fallo a mitad no deja catalogo inconsistente porque no hay catalogo persistido que pueda quedar a medias — la siguiente lectura reconstruye desde el estado real de disco. El cierre via runtime lo invocan los flujos (Alfred `piezas/cierre.md`/`gestion/cancelar.md`; ver tambien `gestion/cerrar.md`).

### Quien actualiza y consume

- **Nadie "actualiza" el catalogo** — no hay escritura que actualizar. `/alfred iniciar`, `/alfred pausar`, `/alfred continuar`, `/alfred cancelar`, cierres de etapa y el flujo de cierre de work escriben unicamente el README del work; el catalogo se deriva de eso en la siguiente lectura. `/alfred maintain archivar` mueve las carpetas terminales a `works-archivo/` en lote (ver "Cierre / archivado") — tampoco escribe catalogo.
- **Consumen** (via `agentos catalog show`, que reconstruye en memoria): `/alfred listar` (lectura pura), `/alfred continuar` (filtra activos retomables), `/alfred history` (lee el catalogo de archivo + `archivos_tocados`).

---

## Control de edicion por sesion (desde 2026-05-21)

> **FUENTE DE VERDAD del esquema del archivo de sesion.** Los hooks `.claude/agent-os-hooks/session-control-start.sh`, `.claude/agent-os-hooks/session-control-end.sh` y `.claude/agent-os-hooks/work-block-direct-edits.sh` referencian esta seccion. NO redefinir el esquema en esos archivos. La **matriz de decision** de que rol puede editar que vive en `agent-os/skills/host-protocol/SKILL.md` seccion "Alcance de edicion durante un work activo" — esta seccion documenta el archivo, no la politica.

El hook `work-block-direct-edits.sh` decide si una sesion de Claude Code puede editar codigo del sistema. La decision NO se basa en escanear READMEs en disco (eso confunde "existe un work `EN_PROGRESO`" con "esta sesion lo orquesta"), sino en un **archivo de control por sesion**.

### Directorio y nomenclatura

```
agent-os/work-records/_sesiones/            # directorio completo en .gitignore
  {session_id}.yml                          # un archivo por sesion de Claude Code
```

Un archivo por `session_id` (identificador unico que Claude Code envia en todos los payloads de hook). El usuario trabaja con varias sesiones en paralelo; un archivo por sesion elimina la condicion de carrera — dos hooks nunca escriben el mismo archivo.

### Esquema de `_sesiones/{session_id}.yml`

Claves planas de nivel raiz (sin anidamiento — parseo trivial en POSIX puro sin `jq`):

```yaml
session_id: "1f9504f4-9cc1-4aa1-..."   # identificador de la sesion (del payload del hook)
repo_maneja_works: true                 # true | false. false en repos que no usan works
                                        #  (ej. el propio agent-os-dinamicapps)
work_slug: "20260520-foo"               # slug del work que esta sesion orquesta; null si ninguno
rol: anfitrion                          # gobernador | anfitrion | null
anfitrion: Amelia                       # nombre del experto cuando rol=anfitrion; null si no
diseno_slug: "20260707-foo"             # slug del diseño que esta sesion conduce con /disenar; null si ninguno
actualizado: "2026-05-21T14:32:00Z"     # ISO-8601 UTC; refrescado por cada hook
proveedor_ia: "claude"   # quien OPERA la sesion actual (claude | codex). Lo escribe
                         # el hook de inicio de sesion del harness (Claude:
                         # .claude/agent-os-hooks/session-control-start.sh; Codex: su equivalente).
```

### Campo `repo_maneja_works`

`true` si el repo tiene `agent-os/work-records/` con works reales; `false` si no. Lo detecta `session-control-start.sh` al arrancar la sesion. Cuando es `false`, el hook de edicion nunca bloquea — el repo no orquesta works y la restriccion no aplica.

### Campo `rol`

El rol que el agente principal encarna en la sesion:

- `gobernador` — work decidiendo gates, sin anfitrion asumido. NO edita codigo (si artefactos de orquestacion).
- `anfitrion` — el agente principal actua como un experto anfitrion (Mary, Winston, Amelia/Atlas, Quinn, Paige) conduciendo una etapa. SI edita, incluido codigo.
- `null` — la sesion no orquesta ningun work.

Es el campo decisivo del hook de edicion. La politica completa (que combinacion de rol permite que) esta en `host-protocol/SKILL.md`.

### Campo `diseno_slug`

Slug del diseño (`agent-os/disenos/{slug}`) que esta sesión conduce con `/disenar`; `null`
si ninguno. Lo mantiene la cognición de `/disenar` (fuente:
`agent-os/skills/disenar/SKILL.md` sección "Marca de sesion (diseno_slug)"). Los hooks de
gobierno lo leen para callar durante un diseño activo. NO otorga permisos de edición:
`work-block-direct-edits.sh` no lo consulta.

### Campo `actualizado`

Timestamp ISO-8601 UTC. Cada hook que toca el archivo lo refresca. `session-control-start.sh` lo usa para **purgar**: archivos con `actualizado` de mas de 48 horas se eliminan (`rm`). Es la red de seguridad para sesiones cuyo `SessionEnd` no disparo (crash, cierre brutal).

### Quien escribe y consume

- **Escriben:** `session-control-start.sh` (crea el archivo, detecta `repo_maneja_works`, purga >48h), `session-control-end.sh` (elimina el archivo de la sesion), `/alfred iniciar`/`/alfred continuar` (escriben `work_slug` + `rol: gobernador`), la fase "greet" del host-protocol (escribe `rol: anfitrion` + `anfitrion` al asumir un anfitrion; vuelve a `rol: gobernador` al cerrar gate), `/disenar` (cognicion de Mary; escribe `diseno_slug`). `work-block-direct-edits.sh` refresca `actualizado` al pasar.
- **Consume:** `work-block-direct-edits.sh` (lee el archivo de su `session_id` y decide); `alfred-gobierno-start.sh`/`alfred-gobierno-prompt.sh` (leen `work_slug`/`rol`/`diseno_slug` como gate de silencio del gobierno).

