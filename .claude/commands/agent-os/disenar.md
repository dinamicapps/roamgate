---
description: Comando /disenar para aterrizaje de feature/producto. Subcomandos iniciar, estado, listar, archivar. Reanudar y consolidar-brief documentados aparte.
argument-hint: <subcomando> [args]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /disenar

Aterrizaje de feature/producto en sistema vivo. Produce brief modelado por procesos antes de codigo.

Lee `agent-os/skills/disenar/SKILL.md` y delega segun subcomando.

## Subcomandos

### `/disenar iniciar "{descripcion}"`

Crea diseño nuevo en el regimen `modelo`. El frente lo conduce Winston (`CM`); Mary toma los
steps siguientes.

<!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Modo inicial". La topologia del flujo (quien conduce, que steps, en que orden) vive alli. Aqui solo se indexa el arranque. NO duplicar la regla — para modificar, editar la fuente. -->

**Pre-requisitos:**

- Estar en directorio de proyecto con `agent-os/disenos/` instalado (lo crea el installer del sistema).
- No existe diseño con slug derivado de la descripcion.

**Flujo:**

1. Derivar slug `{YYYYMMDD}-{slug-corto}`.
2. Verificar que no existe `agent-os/disenos/{slug}/`.
3. Winston lee `disenar/SKILL.md` + `disenar/modo-inicial/step-01-foco.md` + `references/construccion-modelo.md` de Winston.
4. Winston inicia el FOCO con prefijo `A-Winston:`. El diseño nace con `flujo: modelo` en el README.
5. Winston marca la sesión: `diseno_slug: "{slug}"` en el archivo de sesión.
   <!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Marca de sesion (diseno_slug)". Aqui solo el paso; la regla completa (entrada/salida) vive en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

**Asociación a expediente (spec 2):** si describes en prosa que el diseño es para un expediente
de cumplimiento ("diseñemos la fase X del expediente SIIFA"), Winston resuelve el expediente, te
despliega sus requisitos para que selecciones cuales cubre el diseño, y sintetiza el intent de
ellos. No hay flags: lo expresas en prosa. El diseño no podra cerrar (BRIEF_LISTO) dejando un
requisito sin cubrir o sin diferir-aprobar (gate de cobertura).

**`/disenar iniciar --desde-reconocimiento={slug} --etapa=N`** — la descripcion es opcional en
este camino: el diseño nace de la etapa `N` de un reconocimiento (fase previa del abordaje) en
vez de una idea en prosa. Antes de crear el diseño, el runtime valida que esa etapa sea la
activable del plan (`agentos reconocimiento etapa transition --slug {slug} --n N --a en_diseno
--produjo {diseno-slug}`); si el guard rechaza (`ETAPA_NO_ACTIVABLE`, `ETAPA_EN_CURSO`), el FOCO
no arranca. El catalogo de esa etapa (capacidades activadas con sus puntos de contacto ya
confrontados, contratos externos, out_of_scope de etapas posteriores) entra al modelo como
insumo citado — el FOCO arranca con evidencia, no con el modelo vacio. Ver
`agent-os/skills/disenar/modo-inicial/step-01-foco.md` seccion "Insumo del reconocimiento".

### `/disenar estado {slug}`

Muestra estado del diseño en formato tabla.

**Salida tipica:**

```
Diseño: 20260429-solicitud-insumos-aplicacion-medicamentos
Estado: BRIEF_LISTO
brief_version: 1 (aprobado 2026-04-29)

Procesos: 3
  P1 — Solicitud insumos (medico, modulo HC)
  P2 — Despacho (farmaceuta, modulo Farmacia)
  P3 — Cargo (sistema, modulo Facturacion)

Works consumidores: ninguno aun.

Hallazgos:
  Pendientes: 0
  Aplicados: 0
```

**Si el diseño es paraguas (`es_paraguas: true`),** ademas muestra el tablero de works
desde `plan_works[]`: cada work con su estado (pendiente/en_progreso/completado/realineacion),
sus dependencias, cuales son elegibles ahora (todas sus `depende_de` en `completado`), y el
progreso agregado (ej. "2 de 4 works completados"). Ejemplo:

```
Plan de works (paraguas): 2 de 4 completados
  W1 (P1,P2) — completado    [work: 20260605-solicitud]
  W2 (P3)    — en_progreso   depende: W1 (ok)  [work: 20260606-despacho]
  W3 (P4)    — pendiente      ELEGIBLE (sin deps)
  W4 (P5)    — pendiente      bloqueado por W2
```

**Implementacion:** lee README.md del diseño, parsea frontmatter, lista procesos
por archivo en `procesos/`, cuenta hallazgos por estado. Si `es_paraguas`, lee `plan_works[]`
y deriva elegibilidad + progreso.

### `/disenar listar`

Lista todos los diseños del proyecto en formato tabla compacta.

**Salida tipica:**

```
| Slug | Estado | brief_v | Procesos | Works | Hallazgos pendientes |
|------|--------|---------|----------|-------|----------------------|
| 20260429-solicitud-insumos | BRIEF_LISTO | 1 | 3 | 0 | 0 |
| 20260415-cliente-ihce | EN_USO | 2 | 8 | 1 | 0 |
| 20260410-deprecado-X | OBSOLETO | 1 | 2 | 0 | n/a |
```

La columna **Works** cuenta los works del `plan_works[]` cuando el diseño es paraguas
(formato `completados/total`, ej. `2/4`); para diseños no-paraguas muestra el conteo simple
de works consumidores.

**Implementacion:** glob `agent-os/disenos/*/README.md`, parsea frontmatter
de cada uno, ordena por estado y fecha.

### `/disenar archivar {slug}`

Cambia estado del diseño a `OBSOLETO`. Works consumidores siguen ejecutables
con brief congelado pero `/alfred retroceder-a-diseno` (o el legacy `/work retroceder-a-diseno`) sera rechazado.

**Pre-requisitos:**

- Diseño existe.
- Estado actual NO es ya `OBSOLETO`.

**Flujo:**

1. **Guard de hallazgos pendientes (bloqueante).** Leer `agent-os/disenos/{slug}/hallazgos/HZ-*.md`. Si hay alguno en `pendiente_analisis` o `en_analisis`, NO archivar en silencio: listarlos al usuario y exigir decision —cerrarlos con `agentos diseno hallazgo --slug {slug} --id HZ-{NNN} --a obsoleto_por_replanteamiento` con razon "diseño archivado", o abortar el archivado—. `diseno transition --a OBSOLETO` refuerza el guard: el runtime rechaza si aun quedan pendientes. Un diseño `OBSOLETO` con hallazgos pendientes los dejaria en limbo permanente: ningun `/disenar reanudar` los procesaria (reanudar rechaza `OBSOLETO`).
2. Confirmar con usuario que entiende las consecuencias.
3. Cambiar `estado: OBSOLETO` en frontmatter del README (via `diseno transition` — ver bloque bash abajo).
4. Anotar en bitacora con razon.

```bash
# 1) Cerrar los hallazgos pendientes que el usuario decidio (paso 1 del flujo):
#    agentos diseno hallazgo --slug {slug} --id HZ-{NNN} --a obsoleto_por_replanteamiento
# 2) Archivar (el runtime rechaza si aun quedan pendientes):
agentos diseno transition --slug {slug} --a OBSOLETO
echo "
## $(date +%Y-%m-%d) — diseño archivado

Estado: OBSOLETO.
Razon: {razon dada por usuario}.
" >> agent-os/disenos/{slug}/bitacora.md
```

## Subcomandos no documentados aqui

- `/disenar reanudar {slug}` — ver `commands/agent-os/disenar-reanudar.md` (creado en Fase 4).
- `/disenar consolidar-brief {slug}` — ver `commands/agent-os/disenar-consolidar-brief.md` (creado en Fase 4).
