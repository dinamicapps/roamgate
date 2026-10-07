# Doctrina del sistema agent-os

Standards **propios del sistema agent-os** (no del proyecto consumidor): principios de ingeniería y arquitectura que el sistema custodia y versiona. A diferencia de `agent-os/standards/` (patrones que el consumidor destila de SU codebase, zona INTOCABLE), esta zona se **entrega por espejo en cada actualización** — misma familia que `agent-os/skills/` y `agent-os/experts/`.

## Organización

- `global/` — doctrina agnóstica de stack (principios de ingeniería).
- `{perfil}/` — doctrina específica por stack (`default/`, `dotnet-react/`, `dotnet-angularjs/`).

## Precedencia

Esta doctrina es el **piso**. Un consumidor no edita estos archivos (un update los sobre-escribe); si discrepa, crea un standard en su zona `agent-os/standards/` y ese gana.

<!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Doctrina del sistema vs standard del consumidor". Regla completa de precedencia alli. NO duplicar. -->
