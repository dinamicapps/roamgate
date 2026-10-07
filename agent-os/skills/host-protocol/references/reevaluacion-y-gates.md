# Reevaluacion y gates — detalle consultable

> Dos piezas de detalle de "Meta como invariante y ciclo de reevaluacion" (nucleo en `host-protocol/SKILL.md`): el arbol de 3 pasos paso a paso de la reevaluacion, y la regla de autocontencion informacional del gate. Movido desde `host-protocol/SKILL.md` (CG-01/05/06).

## Procedimiento de reevaluacion

Cuando se dispara reevaluacion:

1. **Anfitrion publica alerta:** `A-{anfitrion}: ALERTA DE DRIFT. {senal narrada}. Propongo reevaluacion.`
2. **Cede al gobernador:** `S-sistema: Cediendo al gobernador.`
3. **El gobernador conduce el arbol de 3 pasos** en prosa, una pregunta a la vez. Registra cada decision en `meta_revisiones[]`.

**Arbol de 3 pasos:**

**Paso 1 — ¿La meta sigue siendo valida tal como esta escrita?**
- Si → paso 2.
- No, cambio menor/mediano → el gobernador propone redaccion ajustada, usuario aprueba, registrar en `meta_revisiones[]`, decidir etapa de regreso.
- No, cambio total → re-abordar: el gobernador re-ejecuta el abordaje con la evidencia ya recolectada + lo nuevo (bloque `## Re-abordaje (fecha)` en el README, el original se conserva). Etapas previas se archivan como `etapa-N-v1/`.

**Paso 2 — ¿Lo hecho hasta ahora coincide con la meta?**
- Si → continuar.
- No, hay brecha → el gobernador propone ajustar redaccion para reflejar lo hecho. Si usuario aprueba: camino (c). Si rechaza: regresar a etapa de divergencia.

**Paso 3 — ¿El nuevo enfoque se asimila sin volver la meta multi-enfoque?**
- Si → ajustar meta y continuar.
- No → camino (d). Si modifica codigo existente, la regla de cohesion de scope es dura.

**Paso 3b — ¿El drift es del BRIEF de diseño, no del plan del work?**

Aplica solo si el work tiene `diseno_origen`. Heuristica: si "¿esto debio aparecer en el brief de `/disenar`?" se responde "si" → drift de discovery → camino (e). Si "no, el brief ya lo cubria, el plan/codigo se desvio" → caminos a/b/c/d.

**Los 5 caminos posibles:**

- **(a) Continuar** — drift desestimado.
- **(b) Reescribir meta** — version nueva en `meta_revisiones[]`, regresar a etapa que corresponda.
- **(c) Ajustar redaccion por brecha** — meta original era ambigua, la realidad es valida pero divergente. Se ajusta redaccion para honestidad; no se reabre trabajo.
- **(d) Abrir work nuevo** — drift implica enfoque no asimilable. Work actual cierra como `REPLANTEADO`.
- **(e) Regresar a `/disenar`** — solo si el work tiene `diseno_origen`. Mecanica: el gobernador invoca `/alfred retroceder-a-diseno`, anfitrion conduce dialogo de 4 datos, se crea `agent-os/disenos/{slug}/hallazgos/HZ-NNN.md`, el work pasa a `EN_PAUSA_POR_DISENO`, Mary procesa con `[DRT]` (step-r1..r5), brief actualiza con `<!-- HZ-NNN -->`, usuario reanuda con `/alfred continuar`.

**Cuando (b) vs (e):** ambos atacan drift de discovery. (e) propaga aprendizaje al brief — preferir cuando el brief tiene >=1 consumidor activo o consumidores futuros. (b) preserva audit en el work-record — apropiado si el brief es single-use o ya esta `OBSOLETO`. Default sugerido (e); override del usuario (b). El gobernador pregunta explicitamente cuando ambos aplican.

**Relacion entre `/alfred reevaluar` y `/alfred retroceder-a-diseno`:** `/alfred reevaluar` es la puerta unica del drift (conduce el arbol de 3 pasos y los 5 caminos). `/alfred retroceder-a-diseno` es la mecanica del camino (e); no se invoca directo. Si el usuario lo invoca directo, el gobernador primero ejecuta el arbol para confirmar que (e) es el camino correcto.

## Autocontencion informacional del gate

**Principio:** toda pregunta del gate DEBE poder responderse sin abrir archivos. Si el gate pregunta sobre datos especificos (meta literal, listado de CAs, decisiones puntuales), esos datos van inline en formato compacto.

Esta seccion es la realizacion canonica de P9 (MANIFIESTO, "Interlocucion Concreta") para gates formales: P9 rige todo turno que espera respuesta; aqui vive la forma inline especifica del gate.

**Casos tipicos y forma inline correcta:**

| Pregunta del gate | Forma inline |
|---|---|
| "¿La meta captura tu intencion?" | Meta citada literal en blockquote |
| "¿Los N CAs estan completos?" | Tabla `id \| resumen \| owner`. Si N>20, agrupar por familia |
| "¿Apruebas la decision X?" | Decision explicada inline (que, alternativas, costo) |
| "¿Apruebas el plan de N tareas?" | Tabla `id \| resumen \| dependencias` |

Diferencia clave con la regla "el gate no repite" (en `host-protocol/SKILL.md` seccion "Lenguaje narrativo en gates y conversacion"): esa regla aplica a contexto narrativo (lo que entrego, lo que no, avance) — eso se resume en prosa. La excepcion aplica a datos sobre los que el gate pregunta — esos van inline.

**Limite de tamano:** si los datos inline empujan el gate mas alla de 400 palabras, el anfitrion agrupa por familia/dominio o pregunta primero por el conjunto y despliega el subconjunto que el usuario quiera revisar. NO se sacrifica autocontencion por presupuesto.

**Filtro de pregunta genuina.** Antes de incluir una pregunta en "Decision para ti", el anfitrion aplica el filtro: ¿tiene mas de una respuesta razonable dado lo que el usuario ya dijo? Tres tipos:

- **Decision genuina** — descubre algo no determinado por la orden ni turnos previos (umbral 7/8 vs 8/8, eleccion entre arquitecturas viables, scope con consecuencias distintas). Va al gate.
- **Confirmacion ritual** — pregunta sobre algo que la orden ya determino. Ejemplo: orden = *"reemplaza modelo X por gateway"*; preguntar *"¿la meta de reemplazar X por gateway captura tu intencion?"* es eco. Sale del gate; si hubo refinamiento, se narra en "Lo que entendi" y el usuario corrige si discrepa.
- **Decision derivada con matiz** — el experto concreto algo con grados de libertad reales (ej. "interface + 2 impls" vs "in-place"). Va al gate, pero el experto DEBE nombrar el matiz explicitamente.

**Caso limite: gate sin pregunta.** Si todas las preguntas candidatas son rituales, "Decision para ti" se reemplaza por:

```
Avanzo a Etapa N+1 salvo objecion. Si algo no calza con tu intencion, dimelo ahora.
```

**Anti-patron prohibido:** preguntas-eco como *"¿Confirmas el slug X?"* (derivado mecanicamente), *"¿Apruebas reutilizar BS001?"* (la orden lo dicta), *"¿OK con la meta?"* (transcripcion). Educan al usuario a aprobar sin leer.

**Plantilla fija de gate de cierre de etapa:**

```
A-{anfitrion}: Cierre de Etapa N.

Lo que entendi del trabajo: {2-3 lineas en voz humana, sin tecnicismo}.

Lo que voy a entregar: {1 parrafo concreto: "veras X archivos, Y endpoints en Z, W lineas borradas"}.

Lo que NO voy a entregar (y por que): {1 parrafo. Poda, deprecados, cambios de scope}.

Avance hacia la meta: {1 frase. "La meta es {meta}. Lo entregado cubre {parte}. Falta: {parte o nada}"}.

Decision para ti: {pregunta concreta con AskUserQuestion. Si todas son rituales, reemplazar por
"Avanzo a Etapa N+1 salvo objecion..."}
```

**Ejemplo contrastante:** un cierre con tabla de 12 CAs + lista de insights + 3 opciones A/B/C esconde la sustancia bajo estructura decorativa. El mismo cierre en plantilla narrativa ("HomeController paso de 2380 a 625 lineas. 1 controller nuevo en BO-ERI. 48 tests verdes. ¿Cierro como COMPLETADO?") dice exactamente lo que el usuario necesita para decidir.
