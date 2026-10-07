# Datos de etapa del protocolo universal

> Esta carpeta contiene los **datos declarativos por etapa** que `host-protocol/SKILL.md` consume en runtime: anfitrion, roster de invitables, senales a detectar, criterio de cierre, artefacto integrador. Un archivo por etapa (`etapa-1.md` .. `etapa-4.md`). NO son flujo — el flujo lo gobierna el comando (Alfred via piezas/, o `/work` legacy). Aqui viven los datos que casualmente se llamaban `work-etapa-N` antes del retiro de /work.

## Tabla maestra — Anfitriones por etapa y modo

Fuente de verdad de **quien hospeda cada etapa segun el modo del work**. La consumen `host-protocol` (al activar un anfitrion), los datos de etapa (`etapa-N.md`), Alfred (`piezas/`) y los expertos (principio "Host of my stage"). El detalle por etapa (roster completo de invitables, senales, criterio de cierre) vive en cada `etapa-N.md`; aqui solo el mapa anfitrion-por-modo.

| Etapa | `normal` | legacy `evolucion` | `investigacion` | `documentacion` |
|---|---|---|---|---|
| E1 (insumo) | no corre (el abordaje lo cubre) | no corre (el abordaje lo cubre) | Mary | Paige |
| E2 (plan) | Winston | Winston | Winston | Paige |
| E3 (ejecucion) | Amelia/Atlas | Amelia/Atlas (Sally invitada) | Mary | Paige |
| E4 (verificacion) | Quinn | Quinn | Quinn | Quinn |

**La Etapa 0 no existe (retirada 2026-07-14).** El abordaje de `/alfred` la reemplazo por
completo: destila el objetivo, recolecta la evidencia, detecta los drifts, propone la ruta,
captura los campos que cada ruta exige al abrir el work y resuelve los pre-requisitos del repo.
El modelo de etapas empieza en E1.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/readme.md. El abordaje y sus 4 fases viven alli. NO duplicar -- editar la fuente. -->

**E1 solo corre en `investigacion` y `documentacion`** (desde 2026-05-05). En las rutas que
producen codigo (`acotado`, `diseno`, `bugfix`) el discovery fue absorbido por el abordaje: la
evidencia recolectada y el bloque `## Abordaje` del README cubren lo que E1 capturaba.

**Constantes en rutas que producen codigo:** Bob materializa tareas en E2; Amelia/Atlas ejecutan en E3; Quinn verifica en E4.

**Constantes con voz experta:** Sentinel invitado obligatorio cuando alguna tarea tiene `capa_seguridad.aplica: true`; Sally invitada en cambios UX significativos (capacidad LE/PE/VE); Dexter invitado cuando hay persistencia; Cipher invitado obligatorio en E3 cuando alguna tarea declara `capa_seguridad.dominios` conteniendo `cripto` (sign-off [SC]); invitable en E4 ([VF], auditoria CR-1..CR-6).

<!-- FUENTE: agent-os/flujo/MATRIZ-RUTAS.md. Mapeo completo ruta/modo/etapa/pieza y anfitrion por cada una. Esta tabla por etapa sigue siendo la fuente del anfitrion-por-etapa-y-modo; la matriz la referencia. NO duplicar -- para el mapeo, editar la matriz. -->
> **Nota sobre rutas vs etapas.** La correspondencia completa entre rutas, modos, etapas y piezas (y qué anfitrión conduce cada una) es fuente única en la **Matriz de Rutas**: `agent-os/flujo/MATRIZ-RUTAS.md`. Esta tabla por etapa sigue siendo la fuente del anfitrión-por-etapa-y-modo; la matriz la referencia, no la duplica.

<!-- FUENTE: agent-os/experts/_registry.yml. Catalogo de expertos (rol_por_modo, capacidades, senales). El roster detallado por experto vive alli; aqui solo el mapa anfitrion-por-etapa. NO duplicar -- editar la fuente. -->

## Schema de datos por etapa

> Movido desde `host-protocol/SKILL.md` (CG-01/05/06) — es el contrato natural de esta carpeta.

Cada `etapas/etapa-N.md` debe proveer los siguientes datos declarativos:

- **Anfitrion:** nombre del experto + ruta a su SKILL.md.
- **Roster de invitables:** tabla con experto + cuando invitarlo.
- **Senales a detectar:** lista de senales especificas de la etapa → que invitado corresponde.
- **Criterio de cierre:** condicion objetiva que define "etapa completa".
- **Artefacto integrador esperado:** archivo(s) que se producen al cierre, con ruta.
- **Transicion a siguiente etapa:** trigger + accion de work.
- **Bitacora:** ubicacion + responsabilidad de escritura.

El protocolo no define estos datos — los consume.

<!-- FUENTE del schema YAML completo de `capa_seguridad`: agent-os/templates/work-record/schema/capa-seguridad.md seccion "Capa de seguridad (permisos)". Aqui solo se documenta el contrato a nivel conceptual y el mapa de quien lo consume por etapa. NO duplicar el schema. -->

**Contrato `capa_seguridad` (modo normal, incl. legacy `evolucion`):** las etapas que producen o usan codigo deben respetar el contrato de capa de seguridad definido en `agent-os/templates/work-record/schema/capa-seguridad.md` y verificado por `etapas/etapa-2.md` (declaracion), `etapas/etapa-3.md` (aplicacion via pre/post-flight) y `etapas/etapa-4.md` (verificacion CS-1/CS-2/CS-2b/CS-3). El pre-requisito se valida en el abordaje Fase 2. La senal de drift #10 detecta violaciones tardias (ver "Las 12 senales de drift" en `host-protocol/SKILL.md`).
