# /alfred inactivar [experto]

Desactiva un experto del pool de invitables para las piezas restantes.

Pasos:
1. Buscar work activo. Si no hay: informar y terminar.
2. Si no se especifica experto: AskUserQuestion con lista de invitables del roster actual.
3. Confirmar + documentar razón (AskUserQuestion con opciones "No aporta valor" / "Interferencia" + texto libre).
4. Registrar en bitácora de la pieza activa (bloque `## [Gobernador] Experto inactivado` con fecha, experto, razón, pieza).
5. Actualizar README sección "Decisiones clave".
6. El experto no será invitable en piezas posteriores; sus archivos `experto-{nombre}.md` se preservan como historial.

<!-- FUENTE: agent-os/experts/_registry.yml. Roster de expertos y sus roles. NO duplicar -- editar la fuente. -->
