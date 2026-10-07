# Pieza: Reevaluacion

> Pieza compartida por todas las rutas que crean work-record. Se dispara cuando hay drift entre la meta declarada y la realidad del work.

## Quien dispara

- El anfitrion activo de una pieza, al detectar una senal de drift inequivoca.
- El anfitrion de una pieza al **rechazar su propio entregable** por brecha fundamental: plan no viable (`plan.md` seccion "Si el anfitrion rechaza el plan"), ejecucion bloqueada (`ejecucion.md` senal de drift), verificacion fallida con hallazgo bloqueante (`verificacion.md` Fase 2). El rechazo del entregable ES una senal estructural, no un estado intermedio sin dueno.
- Un invitado, levantando bandera (`I-{experto}: detecto posible drift, motivo: {senal}`); el anfitrion decide elevar.
- El usuario explicitamente (`/alfred reevaluar [razon]`).

**Quien juzga si una senal es "inequivoca":** el **anfitrion activo** es el responsable. No requiere confirmacion de Alfred ni de un invitado — el invitado solo levanta bandera; el anfitrion decide elevar o desestimar. Esta autoridad es la misma del nucleo, no se redefine aqui.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift" (parrafo "Quien detecta: el anfitrion activo es el responsable... decide si elevar a work o desestimar"). NO duplicar -- editar la fuente. -->

## Senales y arbol (REF->)

Las senales de drift, el arbol de 3 pasos, y los caminos de reevaluacion **no se redefinen aqui**. Viven en host-protocol y Alfred los hereda.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift". NO duplicar el listado de senales -- editar host-protocol. -->
<!-- FUENTE: agent-os/skills/host-protocol/references/reevaluacion-y-gates.md seccion "Procedimiento de reevaluacion". NO duplicar el arbol de 3 pasos -- editar host-protocol. Aqui solo se documenta como el arbol se aplica relativo a cada ruta de Alfred. -->

## El arbol, relativo a la ruta

Alfred toma el hilo (`S-sistema:`, momento estructural), conduce el arbol de 3 pasos de host-protocol y aplica el camino segun la ruta:

| Ruta | Caminos de reevaluacion aplicables |
|---|---|
| `diseno` | (a) continuar, (b) reescribir meta + regresar a pieza, (c) ajuste por brecha, (d) work nuevo, **(e) regresar a `/disenar`** (drift de discovery del brief; aplica solo aqui porque solo `diseno` tiene `diseno_origen`). |
| `acotado` | (a), (b), (c), (d). NO (e) — no hay brief que refinar. |
| `rediseno-ui` | (a), (b), (c), (d), igual que `acotado`. NO (e): no porta el `diseno_origen` canonico (su `origen_rediseno` es un campo local distinto, ver `rutas/rediseno-ui/readme.md`). Ademas `/alfred retroceder-a-diseno` — la mecanica del camino (e) — esta explicitamente acotado a "solo ruta diseno" (`gestion/readme.md`, lista de subcomandos). No hay mecanica de regreso a `/disenar` para `rediseno-ui`. |
| `bugfix` | propia: si el sabueso detecta que el fix excedio scope focal (>3 modulos, >3 actores, ya no es bug sino comportamiento nuevo), ofrece promover a ruta `diseno` (la investigacion ya hecha se inyecta como bootstrap). Ver `rutas/bugfix/conversacion.md`. |
| `hotfix` | propia: sin protocolo de 5 etapas que reabrir (no aplica (b)), sin `meta` formal que redactar (no aplica (c): el frontmatter de su bitacora maestra — plantilla `agent-os/templates/work-record/hotfix/bitacora.md` — no porta `meta` ni `meta_revisiones[]`, solo `contexto` y el disparo verbatim del sintoma; la honestidad equivalente es la `causa_raiz` declarada al cerrar cada frente, ver `rutas/hotfix/fase-6-cierre.md`) y sin `diseno_origen` que portar (no aplica (e)) — el arbol generico de 3 pasos no gobierna esta ruta. El criterio propio vive en sus hard stops: Stop 1 (4to frente con 3 abiertos) difiere por default, equivalente a (a) continuar; Stop 2 (F6, 6to frente total) obliga a elegir entre cerrar el hotfix y abrir uno nuevo, o cerrar el hotfix y promover a `/alfred fix`/`/alfred iniciar` el resto del incidente — equivalente a (d) abrir work nuevo. Ver `rutas/hotfix/fase-4-investigacion-frentes.md` secciones "Stop 1 — Carga cognitiva: 4to frente con 3 abiertos" y "Stop 2 — Alcance: F6 (6to frente total acumulado)". |
| `investigacion` / `documentacion` | (a), (b), (c), (d). El "entregable" a contrastar es cobertura de preguntas (investigacion) o secciones vs TOC + audiencia (documentacion). |

## Contradiccion fuerte con insumo de sesion grabada (no pasa por esta pieza)

En la ruta `documentacion` con insumo de sesion grabada, una contradiccion entre el material audiovisual y la documentacion o el codigo **no es senal de drift y no entra a este arbol**: escala al humano en el gate G2 de la ruta, que la resuelve por sus tres desenlaces. La jerarquia de fuente de verdad del sistema (codigo > docs > sintesis) tampoco la resuelve por rango. Confundirla con drift la sacaria de su gate y la haria decidir por reevaluacion, que es exactamente lo que ese gate existe para impedir.

<!-- FUENTE: agent-os/skills/destilar-sesion/SKILL.md seccion "Escalamiento de contradiccion fuerte". Los tres desenlaces, el papel de `codigo_confirma` y los dos disparadores del descenso a codigo viven alli. Aqui solo se declara que ese escalamiento es propio de la ruta y no pasa por esta pieza. NO duplicar -- para modificar, editar la fuente. -->

## Refactor de fundacion con muchos consumidores

Para refactors de fundacion que habilitan muchos consumidores, el anfitrion propone expand + prueba-en-un-consumidor y difiere explicitamente el resto (`COMPLETADO_CON_BRECHA`) — no arrastrar todos los consumidores al mismo work.

## Distincion (b) vs (e) en ruta `diseno`

Ambos atacan drift de discovery. (e) propaga el aprendizaje al brief — preferir cuando el brief tiene consumidores activos o futuros. (b) preserva el audit en el work-record — apropiado si el brief es single-use u `OBSOLETO`. Default sugerido (e); override del usuario (b). Alfred pregunta cuando ambos aplican.

## Registro

Cada decision se registra en `meta_revisiones[]` del README. El schema de la entrada vive en host-protocol / frontmatter-schema.

<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Schema de cada entrada en `meta_revisiones[]`". NO duplicar -- editar la fuente. -->

## Re-abordaje

Si el drift es de discovery (la ruta inicial fue mal destilada), Alfred re-ejecuta el abordaje con la evidencia ya recolectada + lo nuevo. Bloque `## Re-abordaje (fecha)` al README; el original se conserva. Ver `abordaje/readme.md`.
