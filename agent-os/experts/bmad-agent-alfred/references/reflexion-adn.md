# Reflexion verificada de Alfred (buffer a ADN)

> Alfred es "un experto mas con objetivo de gobernanza". Usa el mismo buffer de reflexion que los demas agentes, con la misma FORMA, distinto CONTENIDO. El schema de cada entrada es canonico y compartido. <!-- FUENTE: agent-os/templates/work-record/reflexion-adn-entry.md. El schema de la entrada (5 categorias, evidencia obligatoria) vive alli. NO duplicar -- aqui solo la taxonomia de gobernanza de Alfred. -->

## Donde vive

`_bmad/memory/alfred-sidecar/devs/{dev}/reflexion-adn.md` del repo destino. Es un BUFFER drenable a ADN, NO memoria que Alfred consulta en runtime. Se acumula hasta que `consolidar-reflexiones` lo drena (en el repo origen).

## INVARIANTE DE FRONTERA

Ningun archivo del ADN de agent-os (skills, prompts, SKILL.md, `.md` del sistema) se modifica fuera del repo origen. En el repo destino, Alfred (y todo agente) SOLO escribe en su sidecar local; NUNCA edita el ADN instalado. La correccion del ADN ocurre exclusivamente en el repo origen durante `consolidar-reflexiones`.

## Taxonomia de gobernanza (como Alfred mapea las 5 categorias)

Las anclas de Alfred son work-records, NO codigo -- pero deben tener una de las
cinco formas navegables (ver reflexion-adn-entry.md seccion "Regla de evidencia"),
igual que cualquier otro agente. Una frase en prosa no es ancla:

- `acierto-repetible` -- "ruta {X} resolvio limpio una problematica de tipo {Y}". Ancla: el work cerrado, `{slug}/W-NN` (o la tarea puntual, `{slug}/T-NNN`, si el acierto es de una tarea).
- `fallo-de-logica` -- "propuse ruta {X} pero el work necesito {Z}". Ancla: el README del work en la linea de la entrada de `meta_revisiones[]` que registra la reevaluacion, `{ruta}:{linea}` (ej. `agent-os/work-records/{slug}/README.md:42`).
- `correccion-de-usuario` -- "el usuario cambio la ruta/cadencia/anfitrion que propuse y funciono mejor". Ancla: el README del work en la linea del campo corregido, `{ruta}:{linea}`.
- `error-en-sistema` -- "una transicion de pieza que goberne dejo el work en estado inconsistente". Ancla: el README del work en la linea que muestra el estado inconsistente observado, `{ruta}:{linea}`.
- `artefacto-defectuoso` -- "una pieza/ruta/regla de Alfred me indujo a gobernar mal". Ancla: `archivo:linea` de la pieza/ruta defectuosa. SOLO se corrige en el origen.

## Que NO va aqui

- Heuristicas de oficio (eso es memoria viva de los EXPERTOS, no de Alfred).
- Reflexion sin evidencia anclada (se rechaza).
- Conocimiento de dominio del proyecto (eso es standards/specs).
