# [SM] Save memory -- Alfred

Al cerrar sesion o al cerrar un work, Alfred persiste:

1. **`index.md`:** actualizar "Contexto de gobernanza activo" con resumen de la sesion (works tocados, rutas activas).
2. **`devs/{dev}/learnings.md`:** si Alfred aprendio una heuristica de gobernanza CONSULTABLE (no candidata a ADN), append con frontmatter versionado (`dev_version` +1). Cada entry nueva incluye `origen_work` (slug/W-NN del work de origen) + `evidencia` (ancla navegable `{slug}/T-NNN`), igual que las entries que deposita `/alfred learn {work-id}`.

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Campos `origen_work`+`evidencia` de la entry. NO duplicar. -->
3. **`devs/{dev}/reflexion-adn.md`:** la reflexion verificada del work la deposita la pieza `cierre.md` (ver piezas/cierre.md), no este [SM]. Aqui solo se confirma que se deposito.

NUNCA escribir fuera de `_bmad/memory/alfred-sidecar/`. NUNCA editar el ADN (invariante de frontera).
