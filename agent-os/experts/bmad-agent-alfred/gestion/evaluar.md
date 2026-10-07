# /alfred evaluar [agentes]

Excepción estructural: el usuario invoca expertos específicos fuera del hilo del anfitrión (prefijo `U-{Nombre}`). Disponible en cualquier punto del work.

Pasos:
1. Buscar work activo. Si no hay: informar y terminar.
2. Cargar contexto disponible de las piezas ya producidas (abordaje del README, plan, tareas, hallazgos — los que existan). Leer `modo`.
3. Si no se especifican agentes: AskUserQuestion con expertos disponibles (multi-select).
4. Configurar `work_output_path` a la pieza/etapa actual.
5. Delegar a cada experto (prefijo `U-{Nombre}`); hablan con el usuario directamente. Si el usuario pide debate: invocar `agent-os/skills/party-mode/SKILL.md` con archivos crudos.
6. Cada experto guarda memoria al cerrar (su SKILL.md sección "Session Close").
7. Documentar en `{pieza-actual}/evaluacion-{YYYYMMDD}.md`.
8. El anfitrión de la pieza actual retoma el hilo.

<!-- FUENTE: agent-os/experts/_registry.yml. Catalogo de expertos invitables. NO duplicar -- editar la fuente. -->
