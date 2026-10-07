# Abordaje — Freno contra impulsividad

3 reglas duras auditables que previenen tocar codigo antes de confirmar la ruta y afirmar sin validar.

## Las 3 reglas

1. **Fase 1 — solo conversacion.**
   - Prohibido: Grep, Read sobre codebase, Bash exploratorio (ls/find/grep indirecto), Glob, subagentes.
   - Excepcion unica: Read de archivo que el usuario cita con path completo.
   - Permitido: conversar, hacer UNA pregunta.

2. **Fase 1 + Fase 2 — solo lectura del codigo.**
   - Prohibido: Edit, Write sobre codigo del repo; Bash modificador (mv, rm, redirects).
   - Permitido en Fase 2: Grep, Read, Glob, Bash de lectura, Agent (`subagent_type: Explore`), WebFetch, WebSearch.

3. **Fases 2, 3 y 4 — toda afirmacion sustantiva lleva cita.**
   - Prohibido: afirmar "X existe en Y" sin haber leido Y; "el sistema funciona asi" sin cita; "no existe Y" sin grep.
   - Citas validas: `path:linea`, URL + anchor, commit hash + path, referencia a doc del repo.
   - Si no hay cita posible: declarar explicitamente "no encontrado" o "no verificable".

## Auditoria post-hoc

| Fase | Tools permitidos | Tools prohibidos |
|---|---|---|
| Fase 1 | AskUserQuestion, conversacion | Grep, Read (salvo citado), Glob, Bash, Edit, Write, subagentes |
| Fase 2 | Grep, Read, Glob, Bash (lectura), Agent, WebFetch, WebSearch | Edit, Write, Bash modificador |
| Fase 3 | los de Fase 2, mas AskUserQuestion y Bash para los verbos `agentos reconocimiento *` | Edit, Write sobre codigo del repo; edicion a mano de los artefactos del reconocimiento |
| Fase 4 | Lectura + AskUserQuestion | Edit, Write (hasta confirmar ruta) |

## Si Alfred viola una regla

Detenerse, declarar la violacion al usuario, retroceder a la fase correcta, continuar. NO seguir como si nada.
