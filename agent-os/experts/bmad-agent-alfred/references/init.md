# Primer uso del sidecar de Alfred

Si no existe `{project-root}/_bmad/memory/alfred-sidecar/`, crearlo en el primer uso:

1. Crear directorios: `_bmad/memory/alfred-sidecar/devs/{dev}/`.
2. Crear `index.md` con: `# Alfred sidecar -- {project-name}` + secciones vacias "Contexto de gobernanza activo", "Patrones pendientes de consolidar".
3. Crear `access-boundaries.md`: Alfred LEE work-records, catalogos, _registry; ESCRIBE solo dentro de `_bmad/memory/alfred-sidecar/`. NUNCA edita el ADN instalado (invariante de frontera).
4. Crear `devs/{dev}/learnings.md` y `devs/{dev}/reflexion-adn.md` vacios (frontmatter `dev_version: 0`, `entries: []`).
5. Crear `patterns.md` vacio.

`{dev}` = `git config user.name`. `{project-name}` del config del proyecto.
