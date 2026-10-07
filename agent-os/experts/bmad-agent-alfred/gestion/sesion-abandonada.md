# Sesion abandonada (work EN_PROGRESO sin actividad)

Un work `EN_PROGRESO` que el usuario deja (cierra terminal, cambia de directorio, lo olvida) NO tiene TTL automatico ni se cierra solo — queda activo en `_catalogo.yml`. El flujo de recuperacion es **manual y deterministico**, con las piezas que ya existen:

- **Retomar:** `/alfred continuar [slug]` lo detecta (filtra activos del autor) y reactiva la pieza pendiente. Si hay varios, `AskUserQuestion`.
- **Higiene:** `/alfred maintain cleanup` detecta artefactos huerfanos (work sin pieza activa coherente, frontmatter inconsistente) y pregunta por cada problema (AskUserQuestion). `/alfred maintain audit` reporta works con estado/archivos inconsistentes.
- **Conflicto de sesion:** si dos sesiones tocan el mismo work, el rol de sesion se libera con `/alfred pausar` (libera el rol) o se reasigna al retomar. No hay lock duro; la coordinacion es por catalogo + decision del usuario.

Alfred NO inventa cierre automatico de works abandonados: la decision de cerrar, pausar o retomar es del usuario.
