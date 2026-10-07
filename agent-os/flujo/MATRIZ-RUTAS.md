# Matriz de Rutas — Índice canónico del flujo de trabajo

> **Qué es esto.** El mapa único del flujo de trabajo del sistema agent-os. Responde, en una pantalla: para una ruta dada, qué modo/etapa/pieza/anfitrión/autonomía aplica y **dónde está definido cada uno**.
>
> **Cómo usarlo.** Esto es un ÍNDICE, no un contenedor de reglas. Cada celda apunta a la fuente canónica que define el comportamiento. **Para modificar una regla, edita su archivo fuente — no esta matriz.** La matriz solo se actualiza si nace/muere una ruta o cambia un mapeo, no cuando cambia el contenido de una regla.
>
> Resuelve la brecha G1 del análisis tripilar (meta-doc de la nebulosa).

## Tabla A — Identidad de ruta

| Ruta canónica | Alias legacy | Cuándo se activa | Modo derivado | Estructura | Anfitrión(es) | Definición |
|---------------|--------------|------------------|---------------|------------|---------------|------------|
| `acotado` | `desarrollo-acotado` (deprecado) | feature pequeña, sin modelado de datos/proceso | `normal` / `evolucion` | piezas | Bob/Winston → Amelia/Atlas → Quinn → Alfred | `agent-os/experts/bmad-agent-alfred/rutas/acotado/readme.md` |
| `diseno` | `desarrollo-via-diseno` (deprecado) | feature con modelado de datos/proceso | `normal` / `evolucion` | `/disenar` + piezas | Winston al frente (`/disenar` FOCO) → Mary (`/disenar` resto) → Winston/Bob → Amelia/Atlas → Quinn → Alfred | `agent-os/experts/bmad-agent-alfred/rutas/diseno/readme.md` |
| `bugfix` | `fix` (alias legacy) | bug focal acotado (1-3 archivos) | n/a (flujo propio) | propia: investigación → conversación → ejecución-verificación | Atlas | `agent-os/experts/bmad-agent-alfred/rutas/bugfix/` |
| `hotfix` | — | incidente urgente, pausa el work activo | n/a (flujo propio); persiste `modo: hotfix` (ruta-y-modo, sin campo `ruta`) | propia: 6 fases (bitácora plana) | Atlas | `agent-os/experts/bmad-agent-alfred/rutas/hotfix/` |
| `rediseno-ui` | ninguno | rediseño UI/UX sobre base existente con discovery acotado de datos | n/a (flujo propio); `modo: normal` por convención | propia: 4 fases (discovery-acotado → iteracion → verificacion → cierre) | Sally | `agent-os/experts/bmad-agent-alfred/rutas/rediseno-ui/readme.md` |
| `investigacion` | — | research consumible por otro trabajo | `investigacion` | E1..E4 | Mary (E1) / Winston (E2) → Quinn → Alfred | `agent-os/experts/bmad-agent-alfred/rutas/investigacion/readme.md` |
| `documentacion` | — | prosa para una audiencia humana | `documentacion` | E1..E4 | Paige (E1-E3) → Quinn → Alfred | `agent-os/experts/bmad-agent-alfred/rutas/documentacion/readme.md` |
| `responder` | — | pregunta informativa, sin cambio de código | n/a (sin work-record) | inline | experto dueño del dominio; Alfred sólo si la pregunta no tiene dueño | `agent-os/experts/bmad-agent-alfred/rutas/responder/readme.md` |

<!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Modo inicial". La topologia del flujo de la ruta `diseno` (quien conduce, que steps, en que orden) vive alli. Aqui solo se indexa el anfitrion de entrada. NO duplicar la regla — para modificar, editar la fuente. -->

## Tabla B — Correspondencia etapa ↔ pieza ↔ anfitrión por modo

> La equivalencia E2=plan, E3=ejecución, E4=verificación. El anfitrión por etapa/modo es fuente en `etapas/README.md`; el anfitrión por pieza es fuente en `piezas/`. Esta tabla solo enlaza.

| Etapa (host-protocol) | Pieza (Alfred) | `normal` | `evolucion` (deprecado, ver "Vocabulario en deprecación") | `investigacion` | `documentacion` | Fuente del anfitrión |
|-----------------------|----------------|----------|-------------|-----------------|-----------------|----------------------|
| E1 insumo | (absorbido salvo inv./doc.) | no corre (absorbido por el abordaje) | no corre (absorbido por el abordaje) | Mary | Paige | `agent-os/skills/host-protocol/etapas/etapa-1.md` |
| E2 plan | `plan` | Winston | Winston | Winston | Paige | `agent-os/experts/bmad-agent-alfred/piezas/plan.md` |
| E3 ejecución | `ejecucion` | Amelia (host) / Atlas invitado cross-lens | Amelia / Atlas invitado (+Sally) | Mary | Paige | `etapa-3.md` (contrato del pool) + `piezas/ejecucion.md` |
| E4 verificación | `verificacion` | Quinn | Quinn | Quinn | Quinn | `agent-os/experts/bmad-agent-alfred/piezas/verificacion.md` |
| — | `cierre` | Alfred | Alfred | Alfred | Alfred | `agent-os/experts/bmad-agent-alfred/piezas/cierre.md` |
| (cualquiera, ante drift) | `reevaluacion` | anfitrión activo → Alfred | idem | idem | idem | `agent-os/experts/bmad-agent-alfred/piezas/reevaluacion.md` |

**Roster completo de invitables por modo:** `agent-os/experts/_registry.yml` (rol_por_modo, capacidades, señales).
**Tabla maestra anfitriones-por-etapa:** `agent-os/skills/host-protocol/etapas/README.md`.

## Tabla C — Perilla de autonomía por ruta

| Perilla | Aplica a | Valores | Definición |
|---------|----------|---------|------------|
| `nivel` (frontmatter del work; config por ruta `autonomia.rutas.{ruta}.nivel`) | todas las rutas | `minima` / `normal` / `maxima` | `agent-os/skills/host-protocol/SKILL.md` §"Perilla de autonomia" |

Perilla **única**: `nivel` gobierna cuántas confirmaciones/gates ve el humano; el rigor (pool de lentes, verificación, aprendizaje) es siempre-activo. `conversacion` y `modo_clasificacion` quedan deprecados/derivados (ver "Vocabulario en deprecación").

**Claves válidas de `autonomia.rutas.{ruta}.nivel`:** `bugfix`, `acotado`, `diseno`, `rediseno-ui`, `investigacion`, `documentacion`, `hotfix` (rutas con work-record, ver Tabla A) más `fastrak`. El enum vive en el schema de config del runtime — no se duplica el path aquí. `fastrak` **no es una ruta destilada del abordaje** (no aparece en Tabla A): es el tipo de work que nace de una sesión `bridge-session` cuando este repo participa como colaborador; comparte el mismo dominio de `nivel` por consistencia de perilla, pero su work no pasa por abordaje/Tabla A. El reader de Alfred (`gestion/readme.md` paso 2.5) resuelve `autonomia.rutas.{ruta_aprobada}.nivel` para cualquiera de estas claves; solo `bugfix` tiene fallback legacy adicional (`autonomia.rutas.fix.nivel`).

## Nota: ruta y modo son ejes ortogonales

`ruta` y `modo` son ejes ortogonales — no son redundantes. `ruta` determina el flujo completo (etapas, piezas, anfitriones). `modo` es el valor declarado en el frontmatter del work que recablea anfitriones dentro de las rutas de piezas (`acotado`, `diseno`). Las rutas de flujo propio (`bugfix`, `rediseno-ui`) no usan el eje `modo` para gobernar su flujo; declaran `modo: normal` por convencion. La ruta `hotfix` es la excepción: persiste `modo: hotfix` (ruta-y-modo, ver Tabla A).

## Vocabulario en deprecación

| Vocabulario transitorio | Por qué es transitorio | Lo reemplaza | Estado |
|-------------------------|------------------------|--------------|--------|
| `desarrollo-acotado`, `desarrollo-via-diseno` (en enum `RutasWork`) | alias legacy del modelo `/work`; retirados del enum en Ola 2 | `acotado`, `diseno` | **RETIRADO** (Ola 2 — eliminados de `cognitivos.go`; works legacy preexistentes conservan el valor en frontmatter pero no se pueden crear nuevos) |
| `fix` (en enum `RutasWork` y como nombre de ruta) | nombre de ruta reemplazado por el nombre descriptivo canónico | `bugfix` | **RETIRADO** del enum (works legacy cierran via gate que acepta ambos; no usar `fix` en works nuevos) |
| `autonomia_fix` / `autonomia.rutas.fix` (clave de config) | claves de config del piloto de autonomia; reemplazadas por la clave canonica | `autonomia.rutas.bugfix.nivel` | deprecado — fallback cognitivo (el reader de Alfred en gestion/readme.md): si `autonomia.rutas.bugfix.nivel` ausente, lee `autonomia.rutas.fix.nivel` |
| `conversacion` (frontmatter del work) | dimensión conversacional reemplazada por la perilla única | `nivel` (alias legacy: `guiada→minima`, `flow→normal`, `yolo→maxima`) | deprecado — works legacy se leen por el mapeo; el runtime deriva `nivel` de `conversacion` si falta |
| `modo_clasificacion` (config `rumbos.modo_clasificacion`) | dejó de ser dial independiente; ahora efecto derivado | derivado de `nivel` (`minima→manual`, `normal→asistido`, `maxima→autonomo`) | deprecado — fallback legacy: se usa solo si el work no declara `nivel` |
| `autonomia.rutas.bugfix.pool_ensanchado` / `.verificacion_obligatoria` / `.emision_aprendizaje` (3 toggles) | el rigor dejó de ser opt-in (siempre-activo); un solo `nivel` por ruta | `autonomia.rutas.bugfix.nivel` | **RETIRADO** del schema (tolerado open-world; configs legacy con los booleanos se ignoran) |
| `autonomia.fastrak.nivel` dominio `asistido`/`guiado`/`autonomo` (enum deprecado) | dominio unificado con el resto de rutas | `autonomia.rutas.fastrak.nivel` con `minima`/`normal`/`maxima` | dominio migrado (E1a); enum viejo deprecado, rechazado por el schema |
| `modo: evolucion` | rediseño de UI/flujos ahora tiene ruta propia con flujo dedicado | ruta `rediseno-ui` | deprecado (conservado por compatibilidad con works activos; no usar en works nuevos) |

<!-- FUENTE: agent-os/flujo/MATRIZ-RUTAS.md (este archivo) ES la fuente canónica del mapeo de vocabularios del flujo. Las reglas de cada comportamiento viven en los archivos referenciados en cada celda. NO copiar reglas aquí — para modificar una regla, editar su archivo fuente. -->
