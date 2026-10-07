# Ruta: hotfix

> Respuesta a incidente con presion temporal real. Anfitrion unico: **Atlas** (conductor de emergencia). Sub-flow propio de 6 fases. Distinto de `bugfix`: bitacora cronologica plana (maestra + frentes), pausa el work de la sesion actual (si su modo no es hotfix; si la sesion ya conduce un hotfix, el nuevo sintoma entra como frente), limites duros de frentes, filtros Sentinel/Quinn/Cipher OBLIGATORIOS.

## Cuando aplica

El abordaje destilo: incidente bajo presion (demo, prod caida, cliente esperando). NO es bugfix deliberado (eso es `bugfix`).

## Sub-flow (6 fases)

```
abordaje comprimido (/alfred hotfix "{sintoma}")
   |
   fase-1-validacion       (mensaje canonico + contrato + limites)
   fase-2-pausa            (pausa el work de la sesion actual, si aplica)
   fase-3-bitacora-maestra (carpeta + bitacora maestra cronologica)
   fase-4-investigacion-frentes (investigacion + apertura de frentes paralelos + convergencia)
   fase-5-filtros-obligatorios  (Sentinel/Quinn/Cipher OBLIGATORIOS si disparador aplica)
   fase-6-cierre           (cierre de frentes + cierre del hotfix + entry post-works)
```

## Anfitrion

Atlas conduce las 6 fases con prefijo `A-Atlas:`. No hay handoff a otros anfitriones. Sentinel/Quinn/Cipher entran solo como filtros obligatorios (fase 5).

## Work-record

Plantilla `agent-os/templates/work-record/hotfix/` (bitacora maestra + frentes). Slug `{YYYYMMDD-HHMM}-hotfix-{slug-incidente}`. Frontmatter `modo: hotfix` (NO usa campo `ruta`).

## Diferencias con bugfix (por que es ruta propia)

| Dimension | bugfix | hotfix |
|---|---|---|
| Bitacora | README con secciones | Maestra + frentes paralelos, cronologica |
| Work activo | No pausa | Pausa el work de la sesion actual (o lo absorbe como frente si ya es hotfix) |
| Limites | Ninguno | 3 frentes abiertos / <6 totales (hard stops) |
| Filtros Sentinel/Quinn/Cipher | opt-in | OBLIGATORIOS |

## Freno reflexivo (presion vigente vs presion pasada)

> **Puente de escalada (G6):** cuando el incidente deja de ser acotado, promueve a `bugfix` (bug focal ya sin urgencia) o a `diseno` (requiere modelado). Cada ruta conserva su criterio; ver `rutas/bugfix/readme.md` seccion "Puente de escalada entre rutas (G6)".

Los hard stops (Stop 1 / Stop 2) limitan la *cantidad* de frentes, pero no juzgan si un nuevo sintoma o una deuda recien observada **merece** entrar al hotfix. El freno reflexivo es un gate de PERTINENCIA contra la **inercia del propio agente** de abrir frentes o encadenar hotfixes por su cuenta — NO contra lo que el usuario pide.

**Linea delgada (importante).** Cuando el usuario instruye con claridad un nuevo frente o un hotfix encadenado, Atlas EJECUTA sin friccion: el freno no autoriza discutir, justificar ni resistir cada peticion del usuario. El freno aplica solo cuando es Atlas quien, por inercia de "ya estabamos en emergencia", propondria abrir o encadenar algo que el usuario no pidio. La confirmacion de pertinencia es **un turno breve**, sin ceremonia ni justificacion repetida; resuelta, se avanza.

Dentro de ese alcance, Atlas confirma con el usuario antes de abrir un frente adicional o encadenar otro hotfix por iniciativa propia:

- **Presion vigente vs presion pasada.** El hotfix existe por presion temporal real (demo en curso, prod caida, cliente esperando). Si el sintoma original ya quedo COMPLETADO, la presion que justificaba la urgencia se extinguio: lo que aparezca despues (deuda de schema, fragilidad observada, mejora) NO hereda esa urgencia. Encadenar otro hotfix por inercia confunde "ya estaba en modo emergencia" con "esto es una emergencia". Si no hay presion vigente sobre el nuevo hallazgo, reencauzarlo a `/alfred fix` (con diagnostico) o a un work deliberado.
- **Crecimiento de alcance.** Cuando el frente crece mas alla del sintoma que lo abrio (toca otra capa, otro modulo, otro actor), preguntar en un turno si cabe en este hotfix o merece frente/work dedicado **antes** de abrir bitacora de frente o escribir codigo. Un turno de latencia evita avanzar en la direccion equivocada.

Esto es P1 (Think Before Coding) aplicado a la *topologia de frentes*, no solo a las lineas de codigo: la decision barata es preguntar antes de abrir, no deshacer despues. Es un gate de PERTINENCIA sobre la iniciativa del agente, ortogonal a los gates de CANTIDAD.

<!-- FUENTE: ./fase-4-investigacion-frentes.md seccion "Hard stops del sistema". Los hard stops de cantidad (Stop 1: 4to frente con 3 abiertos; Stop 2: F6/6to frente total) viven alli. Este freno reflexivo es ortogonal: juzga PERTINENCIA del nuevo frente, no su numero. NO duplicar -- editar la fuente. -->

## Gobierno autonomo (sin dependencia legacy)

El gobierno completo de las 6 fases (mensaje canonico, hard stops Stop 1/Stop 2, disciplina invariante, filtros obligatorios, cierre) vive en los archivos `fase-1`..`fase-6` de esta carpeta, de forma autonoma y autocontenida — no depende de ningun motor externo (el arbol legacy que alguna vez conducia `/work hotfix` fue retirado). Las plantillas de bitacora se reusan de `agent-os/templates/work-record/hotfix/` (formato compartido).

<!-- FUENTE: .claude/MANIFIESTO.md. Los principios del MANIFIESTO que la disciplina invariante de hotfix declara por frente (P7 exento: un-break). NO duplicar -- editar la fuente. -->
