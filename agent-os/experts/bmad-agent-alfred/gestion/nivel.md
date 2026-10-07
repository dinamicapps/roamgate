# /alfred nivel {minima|normal|maxima}

Cambia la perilla de autonomia del work activo en tiempo real. Util cuando, a mitad del flujo, el usuario descubre que quiere mas (o menos) confirmaciones y gates del anfitrion. No reinicia el work ni cambia su pieza. La cadencia conversacional es un efecto derivado del nivel.

**Alias legacy:** `/alfred conversacion {guiada|flow|yolo}` sobrevive como atajo; traduce al nuevo campo (`guiada→minima`, `flow→normal`, `yolo→maxima`) y escribe `nivel`. No persiste `conversacion`.

Pasos:

1. Buscar work `EN_PROGRESO`. Si no hay: informar y terminar.
2. Validar argumento: debe ser uno de `minima | normal | maxima` (o, via alias legacy, `guiada | flow | yolo`, que se traduce). Si falta o es invalido: mostrar el valor actual + las opciones y AskUserQuestion.
3. Leer `nivel` del README (works legacy sin `nivel`: derivar del `conversacion` existente). Si el nuevo valor coincide con el actual: informar y terminar (sin cambio).
4. Persistir el nuevo `nivel` en el README del work-record con el runtime (no editar el frontmatter a mano):
   ```
   agentos work set --slug <slug> --campo nivel --valor {nuevo}
   ```
   Parsear `{ok, data}`: si `ok:false`, mostrar `error.mensaje` y detenerse.
5. Registrar en la bitacora de la pieza activa con prefijo `S-sistema:` (Alfred gobierna la transicion; no es voz de anfitrion) — esta entrada es el rastro de auditoria del cambio:
   ```
   S-sistema: Nivel cambiado de "{anterior}" a "{nuevo}" por el usuario.
              Aplica desde la siguiente accion del anfitrion.
   ```
6. El anfitrion activo re-lee `nivel` en su siguiente turno y modula su conducta. Las decisiones ya tomadas (entradas `[AUTO]` previas) se preservan como historial.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Perilla de autonomia (nivel: minima | normal | maxima)". El significado de minima/normal/maxima y como cada anfitrion lo aplica viven alli. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Perilla de autonomia (nivel)". Schema de nivel y el mapeo legacy de conversacion. NO duplicar -- editar la fuente. -->
