# reconstruir-atlas

> Regenera la capa de dominio de Atlas como vista materializada de los especialistas. SE EJECUTA EN EL REPO ORIGEN. Autoridad: director. Atlas es derivado puro: el conocimiento fluye especialista -> Atlas, nunca al reves.

## Pre-condicion
`cwd` == raiz del repo origen (existe el `CLAUDE.md` fuente de este repo con marcador `agent-os:version` — el mismo que se distribuye como `.claude/CLAUDE.md` en un consumidor, pero aqui en su forma origen). Si se ejecuta en un repo destino, ABORTAR.

## Mapa de derivacion (reference de Atlas <- especialista fuente)
| analysis.md <- mary | architecture.md <- winston | product-requirements.md <- john |
| ux-design.md <- sally | development.md <- amelia | testing.md <- quinn |
| sprint-management.md <- bob | security.md <- sentinel | e2e-browser.md <- tessa |
| documentation.md <- paige | data-modeling.md <- dexter |
quick-flow.md es propio de Atlas: NO se regenera.

## Pasos (por cada reference derivada)
1. **Destilar.** Un subagente lee el ADN del especialista fuente (SKILL.md secciones Principles/Critical Actions + references de dominio) y produce un destilado CONDENSADO para operacion de un-solo-agente. Criterio: "que necesita un Tech Lead que opera solo para aplicar esta lente con criterio, sin ser el especialista". Incluye principios accionables y auto-controles esenciales, en la voz de Atlas; EXCLUYE la persona/identidad/activacion del especialista y el detalle exhaustivo de procedimiento. Agnostico (sin nombres de proyecto). Abre con la marca de derivacion.
2. **Gate de fidelidad.** Un subagente critico verifica: (a) no inventa nada ausente del especialista, (b) no contradice al especialista, (c) esta condensado (no es copia literal), (d) lleva la marca correcta, (e) **conserva los marcadores FUENTE del especialista**: todo marcador FUENTE que acompana un principio que sobrevivio a la condensacion viaja al derivado con su ruta y su seccion intactas, adaptando solo la nota de que-se-documenta-aqui. Un derivado que perdio un marcador no lo denuncia nadie — el lint valida los marcadores que existen, no los que faltan. Veredicto APROBADO/REVISAR/BLOQUEADO; bloquea por defecto ante duda.
3. **Sobrescribir** la reference de Atlas con el destilado aprobado.

## Marca de derivacion (obligatoria al inicio de cada reference derivada)
<!-- DERIVADO de bmad-agent-{especialista}/ ... NO editar a mano ... -->

## Disparador
- Automatico: paso final de consolidar-reflexiones.md.
- Manual: /alfred learn reconstruir-atlas.

## Invariante
Atlas nunca es autoridad de dominio. Su buffer de reflexion de dominio se enruta a los especialistas en consolidar-reflexiones; aqui solo se REGENERA desde ellos. Drift = staleness (curable regenerando), no divergencia.

Los pasos 1-3 (destilar / gate / sobrescribir) son **cognitivos**: subagentes en la nebulosa. El runtime no destila.
<!-- FRONTERA: la destilacion es cognitiva, no del runtime. Ver consolidar-reflexiones.md seccion "Frontera runtime / cognicion". NO duplicar. -->

El diseno completo de Atlas como vista materializada (por que es derivado puro, por que el conocimiento fluye especialista -> Atlas y nunca al reves) esta resumido en este mismo archivo (Mapa de derivacion, Pasos, Invariante); no hay una fuente externa adicional que citar.
