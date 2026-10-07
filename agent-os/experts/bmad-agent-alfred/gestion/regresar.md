# /alfred regresar [pieza]

Retrocede a una pieza anterior del sub-flow de la ruta, archivando las piezas posteriores. Work permanece EN_PROGRESO; cambia el punto actual.

> **Equivalencia con `/work regresar [etapa-N]`:** en el Modelo A las unidades del sub-flow son **piezas** (plan, ejecucion, verificacion, cierre), no las 5 etapas fijas del legacy. `/alfred regresar [pieza]` cubre el mismo proposito que `/work regresar [etapa-N]` — elegir un punto anterior y archivar lo posterior — con el vocabulario de piezas. El usuario puede especificar el destino (paso 2) igual que en el legacy.

Pasos:
1. Buscar work EN_PROGRESO. Si no hay: informar y terminar.
2. Si no se especifica destino: AskUserQuestion con piezas anteriores disponibles.
3. AskUserQuestion para documentar la razón.
4. Archivar artefactos de piezas posteriores: renombrar `{archivo}.md` → `{archivo}.v{N}.md`.
5. Actualizar README: Iteraciones, Decisiones clave, punto actual, Progreso.
6. Actualizar tareas visuales. (El catalogo no se actualiza a mano: se deriva en memoria del README en la siguiente lectura.)
7. Activar al anfitrión de la pieza destino. Alfred escribe `rol: anfitrion` + `anfitrion: {nombre}` en `_sesiones/{session_id}.yml`.

<!-- FUENTE: agent-os/skills/host-protocol/references/fases-de-conduccion.md seccion "Sincronizacion del rol en la transicion de etapa". NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion". NO duplicar -- editar la fuente. -->

## /alfred retroceder-a-diseno

Aplica SOLO si el work tiene `diseno_origen` y el diseño NO está OBSOLETO. Emite un hallazgo HZ-NNN al diseño origen y pausa el work. Es la mecánica del camino (e) de reevaluación, expuesta como subcomando.

Pasos:
1. Validar `diseno_origen` poblado y diseño no OBSOLETO. Si OBSOLETO: ofrecer reactivar / resolver en work / abrir diseño nuevo.
2. Pedir al usuario: título corto, severidad (bloqueante|observación), proceso afectado, síntoma.
3. Auto-completar el resto del hallazgo (work_origen, pieza, anfitrión, contexto de bitácora, hipótesis, evidencia, sugerencia).
4. Calcular número HZ: glob `agent-os/disenos/{diseno_slug}/hallazgos/HZ-*.md`, contar +1, formato 3 dígitos.
5. Crear archivo desde `agent-os/templates/diseno/hallazgo.md`.
6. Cambiar estado del work a `EN_PAUSA_POR_DISENO`.
7. Anotar en bitácora del work y del diseño. Publicar al usuario los pasos siguientes (`/disenar reanudar`).

## /alfred cancelar-retroceso

Aplica si el work está `EN_PAUSA_POR_DISENO` y TODOS sus hallazgos están en `pendiente_analisis`.

Pasos:
1. Validar estado + que todos los hallazgos del work están en `pendiente_analisis`. Si alguno avanzó: rechazar (no se puede cancelar lo ya analizado).
2. Listar hallazgos a descartar. Confirmar (AskUserQuestion).
3. Marcar cada hallazgo: `estado: descartado_por_cancelacion`, `cancelado_en`, `cancelado_razon`.
4. Regresar el work al estado anterior (consultar bitácora).
5. Anotar en bitácora del work y del diseño.

<!-- FUENTE: agent-os/skills/host-protocol/references/reevaluacion-y-gates.md seccion "Procedimiento de reevaluacion". El arbol de 3 pasos y los caminos (incluido e) viven alli. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Estado EN_PAUSA_POR_DISENO. NO duplicar -- editar la fuente. -->
