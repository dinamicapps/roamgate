# Sistema de memoria de Alfred

> Misma FORMA que el sidecar de cualquier experto (Bob, Quinn, ...), distinto CONTENIDO (gobernanza). Memory location: `{project-root}/_bmad/memory/alfred-sidecar/`.

## Estructura

```
_bmad/memory/alfred-sidecar/
|-- index.md                       # [cargar al activar] contexto de gobernanza activo
|-- access-boundaries.md           # [cargar al activar] que lee/escribe Alfred
|-- devs/{dev}/learnings.md        # memoria viva: heuristicas de gobernanza consultables
|-- devs/{dev}/reflexion-adn.md    # BUFFER drenable a ADN (ver references/reflexion-adn.md)
|-- patterns.md                    # [cargar al necesitar] gobernanza consolidada, cognitiva
|-- retirados.md                   # libro-mayor MAQUINA (lapidas), NO carga al activar
|-- reconciliados.md               # libro-mayor MAQUINA (pares dirimidos), NO carga al activar
|-- anti-patrones.md                # libro-mayor MAQUINA, NO carga al activar
|-- devs/{dev}/veredictos.md       # libro-mayor MAQUINA (POR DEV), NO carga al activar
`-- adn-*.md                       # (ej. adn-mejoras.md) libro-mayor MAQUINA, NO carga al activar
```

## Que carga al activar

`index.md` + `access-boundaries.md` (paralelo). `patterns.md` se carga on-demand cuando Alfred va a proponer una ruta y quiere consultar gobernanza aprendida. El buffer `reflexion-adn.md` NO se carga para consulta -- es un buffer de salida hacia el ADN.

`retirados.md` (lapidas) y `reconciliados.md` (pares dirimidos) tampoco cargan al activar: son libros-mayor MAQUINA gestionados por el runtime (`agentos learn retirar` / `agentos learn reconciliar`), no por Alfred. `patterns.md` sigue siendo markdown de formato libre propiedad de la cognicion -- el runtime nunca lo toca; la consolidacion es quien remueve una entrada retirada al reescribir `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Distincion memoria viva vs buffer

- `learnings.md` / `patterns.md`: lo que Alfred CONSULTA (heuristicas de gobernanza estables).
- `reflexion-adn.md`: lo que Alfred PROPONE para su ADN; se drena y vacia, no se consulta.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/references/reflexion-adn.md. Doctrina del buffer. NO duplicar. -->
