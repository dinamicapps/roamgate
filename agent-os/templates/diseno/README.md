---
slug: {SLUG-DEL-DISEÑO}
intent: "{1 frase: que producto/feature debe quedar listo para implementar al cerrar este diseño}"
flujo: modelo                        # modelo | lineal. Ausente = lineal (diseños previos al modelo)
out_of_scope: []                     # se acumula: cada freno confirmado nace como nodo decision con su razon
estado: EN_DISENO
brief_version: 1
fecha_inicio: {YYYY-MM-DD}
fecha_fin: null
autor: "{nombre}"
modulo_huesped: "{ruta-relativa-en-codebase}"
# worktree:                          # horneado por `agentos worktree abrir`/`worktree sumar` (opcional; ausente = regimen previo, sin migracion forzosa)
#   rama: "diseno/{slug}"
#   ruta: "{ruta-absoluta-del-worktree}"
#   creado_en: "{YYYY-MM-DD}"
#   base_commit: "{hash}"
procesos:
  - id: P1
    nombre: "{nombre corto del proceso}"
    actor: "{quien lo ejecuta}"
  - id: P2
    nombre: "..."
    actor: "..."
es_paraguas: false                   # true si el diseño se fragmenta en N works verticales
# hereda_de: null                    # solo si este diseño nace de bifurcar un paraguas OBSOLETO
plan_works: []                       # poblado por step-06 si es_paraguas. Cada entry:
                                     #   - id: W1
                                     #     procesos: [P1, P2]        # rebanada vertical (no por capa)
                                     #     depende_de: []            # ids con dependencia DURA
                                     #     despliegue_autonomo: true # gate anti-capa (step-06)
                                     #     estado: pendiente         # pendiente|en_progreso|completado|realineacion
                                     #     work_slug: null           # slug real al iniciarse (reverse-link)
hallazgos_pendientes: 0
hallazgos_aplicados: 0
persistencia_resuelta: false
datos_md_version: 1
# expediente_origen: null            # slug del expediente si el diseño nace de uno (spec 2)
# requisitos_cubiertos: []           # poblado por step-01 si hay expediente_origen. Cada entry:
                                      #   - id: R-001
                                      #     estado: pendiente   # cubierto | diferido_aprobado | pendiente
                                      #     proceso: P2          # si cubierto
                                      #     razon: "..."         # si diferido_aprobado
                                      #     aprobado_por: usuario
---

# Diseño: {titulo}

## Intent

{Parrafo breve que expande la frase del frontmatter. Que producto/feature debe quedar listo para implementar al cerrar este diseño. NO usar la palabra "meta" — esta vive en el work consumidor.}

## Out of scope

{Se acumula, no se declara a ciegas al inicio: cada freno confirmado durante el diseño nace como nodo `decision` con su razon, y de esos nodos se deriva esta lista. Cualquier cosa NO listada queda como "podria entrar en el diseño si surge".}

## Estado

<!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Anfitriones". El reparto de anfitriones por tramo vive alli; aqui solo se declara quien conduce ESTE diseño ahora. NO duplicar la regla — para modificar, editar la fuente. -->

- **Estado:** {EN_DISENO | BRIEF_LISTO | EN_USO | EN_RETROCESO | CERRADO | OBSOLETO}
- **brief_version:** {N}
- **Anfitrion del tramo en curso:** {Winston si el FOCO | Dexter si persistencia | Cipher si cripto | Mary de step-04 a step-09}
- **Procesos identificados:** {N}
- **Works consumidores activos:** {lista de slugs o "ninguno"}
- **Persistencia resuelta:** {true | false} (datos.md)
- **Worktree:** {worktree.rama, ej. "diseno/{slug}" | "sin regimen de rama (previo)"}
<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Bloque `worktree` (work o diseño)". Schema completo del bloque worktree{}. NO duplicar — para modificar, editar la fuente. -->
<!-- FUENTE: agent-os/skills/bridge-session/references/ciclo-worktree.md. Doctrina del ciclo (apertura, colapso, cierre). NO duplicar — para modificar, editar la fuente. -->

## Procesos

| ID | Nombre | Actor | Modulo huesped |
|----|--------|-------|----------------|
| P1 | ... | ... | ... |

## Plan de works (fragmentación)

> Solo si `es_paraguas: true`. Poblado en step-06. Cada work es una rebanada vertical
> por subproceso (atraviesa DB+lógica+API+frontend de SU subproceso), desplegable solo.
> NUNCA fragmentar por capa técnica.

| Work | Procesos | Depende de | Despliegue autónomo | Elegible ahora | Estado | Work-record |
|------|----------|------------|---------------------|----------------|--------|-------------|
| W1   | ...      | —          | sí                  | sí             | pendiente | —         |

"Elegible ahora" se deriva: todas las `depende_de` en estado `completado`.
DAG completo + justificación anti-capa por work: ver `fragmentacion.md`.

## Bitacora

Ver `bitacora.md` para historial cronologico.

## Hallazgos

Ver `hallazgos/` para hallazgos del retroceso bidireccional.
