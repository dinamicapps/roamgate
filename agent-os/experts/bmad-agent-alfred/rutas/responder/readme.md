# Ruta: responder

> Pieza minima. Sin sub-flow, sin work-record.

## Cuando aplica

El abordaje destilo que la intencion es una **pregunta informativa** que no requiere cambiar codigo. El entregable es la respuesta con citas.

## Quien responde

La pregunta la responde **el experto dueno del dominio**, despachado como subagente consultor
— el mismo ruteo que ya usa la Fase 2 del abordaje (auth/permisos/PHI → Sentinel;
arquitectura/dependencias → Winston; persistencia/BD → Dexter; UX/flujos → Sally;
tests/cobertura → Quinn; cripto → Cipher). Responde con su voz `A-{experto}:` y cita
obligatoria (`path:linea`, URL, doc, commit) por cada afirmacion sustantiva.

Si la pregunta **no tiene dueno de dominio** (¿donde vive X?, ¿cuantos callers tiene Y?), va a
`subagent_type: Explore` (solo lectura) y Alfred transcribe el resultado con `S-sistema:`. No
hay juicio de dominio que ceder: no toda pregunta necesita un experto.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/fase-2-recolectar.md. El ruteo por dominio de la pregunta y el criterio experto-vs-Explore viven alli. NO duplicar la regla — para modificar, editar la fuente. -->

## Que hace Alfred

1. **Enruta** la pregunta a su dueno (o a `Explore` si no lo tiene). NO responde el mismo cuando
   hay dueno: no afirma sobre codigo (`SKILL.md`).
2. **No crea work-record.** El abordaje vivio solo en chat.
3. **Cierra** sin ofrecer pasos futuros (anti-patron del cierre con expansion — ver host-protocol).

## Escalamiento

Si de la respuesta del experto (o de `Explore`) surge que la pregunta en realidad esconde un cambio de codigo (bug, feature), Alfred NO improvisa: declara el hallazgo y propone la ruta correcta (`bugfix`, `acotado`, `diseno`) via `AskUserQuestion`. Esto es re-destilar la ruta, no expandir el cierre.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Anti-patron del cierre con expansion". Aqui se aplica al cierre de la ruta responder. NO duplicar la regla -- editar la fuente. -->
