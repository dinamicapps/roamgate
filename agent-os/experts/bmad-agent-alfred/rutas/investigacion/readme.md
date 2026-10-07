# Ruta: investigacion

> Entregable: conocimiento consumido por otro work. Anfitriona del discovery: **Mary**. Es una de las DOS rutas que conservan E1 (la otra es `documentacion`).

## Cuando aplica

El abordaje destilo que el entregable es **conocimiento** (analisis de opciones, research, auditoria de codigo, inventario tecnico) que sera consumido por otro work o decision tecnica — NO prosa para un humano lector (eso es `documentacion`).

## Sub-flow (E1 + E2 + E3 + E4)

A diferencia de `acotado`/`diseno`, esta ruta SI tiene E1 (discovery) porque el discovery es real, no absorbible por el abordaje.

```
abordaje (ya hecho; Fase 4 captura el campo especial `consumido_por`)
   |
   E1  Mary anfitriona: profundiza preguntas investigativas -> CAs de cobertura
       (cobertura de preguntas, trazabilidad de fuentes, suficiencia para consumido_por)
   |
   E2  piezas/plan.md (modo investigacion): Winston frentes, Bob materializa frente-investigacion
   |
   E3  piezas/ejecucion.md (modo investigacion): Mary ejecuta frentes (technical/domain/market research)
   |
   E4  piezas/verificacion.md (modo investigacion): Quinn verifica cobertura; Mary + Paige invitados
```

## Campo especial: consumido_por

Alfred pregunta `consumido_por` (slug del work consumidor o descripcion del destinatario tecnico) en el abordaje, Fase 4, y lo persiste en frontmatter al abrir el work. Ancla la meta a un destinatario.

<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Campos especificos del modo `investigacion`". NO duplicar el schema de consumido_por/disponible_como_insumo -- editar la fuente. -->
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/fase-4-proponer.md seccion "Campos que exige la ruta al abrir el work". El momento y la mecanica de captura viven alli. NO duplicar -- editar la fuente. -->

## E1 — discovery con Mary

Mary (`A-Mary:`) profundiza las preguntas investigativas y produce CAs de cobertura del insumo. Roster invitable: Winston (arquitectura), Sentinel (compliance), Paige (trazabilidad), Quinn (testeabilidad), Bob (materializacion). Gate: CAs cubren el espectro, cada CA con owner, Quinn valida testeabilidad, usuario aprueba.

## Sub_modo single-repo vs multi-repo

Si la investigacion involucra dos repos integrados, Mary conduce E3 con capacidad RM via grupo bridge (cierre asimetrico: cada repo produce su brief; el director ademas produce brief ejecutivo para devs). Detector: senales multi-repo del registry de Mary. (La integracion bridge se difiere a iteraciones posteriores de Alfred — ver alcance v1; en v1 default `single-repo`.)

## Cierre

Al cerrar como COMPLETADO, marcar el work como consumible via runtime: `echo '{"disponible_como_insumo":true,"consumidores":[]}' | agentos work set-fm --slug <slug>` (no editar el README a mano; ver `../../gestion/set-fm.md`). Asi otro work lo encadena via `insumos_origen`.

## Reevaluacion

Caminos (a)/(b)/(c)/(d). El entregable a contrastar es cobertura de preguntas + trazabilidad + suficiencia para `consumido_por`. Ver `piezas/reevaluacion.md`.
