# Etapa 3 — Baseline visual antes del primer edit

> Tarjeta consultable de Etapa 3. Se carga SOLO cuando una tarea tiene `evidencia_requerida.ui: true` y modifica una UI que ya existe (vista, modal, componente o formulario ya renderizable). Movido desde `etapas/etapa-3.md` (Ola 5 T9, doctrina AI-friendly).

## Baseline visual antes del primer edit (modo normal, incl. legacy evolucion)

Cuando una tarea **modifica una UI que ya existe** (vista, modal, componente o formulario ya renderizable), el anfitrion captura el **estado original en navegador (Playwright) ANTES del primer edit** y lo guarda como archivo: `etapa-4/evidencia/ui/{CA}-antes.png` (donde `{CA}` identifica el CA o la vista tocada). Es el baseline de la comparacion antes/despues que Quinn audita en E4.

**Por que en E3 y no en E4:** en E4 la UI ya fue modificada — el estado original ya no existe para capturar. El baseline solo se puede tomar antes de tocar el markup. Si se omite aqui, en E4 no hay "antes" y la comparacion se reconstruye de memoria (alucinacion).

**Reglas duras:**
- Aplica solo a UI **existente** que se modifica. UI **nueva** (no habia estado previo) no tiene baseline — solo el "despues" de E4.
- El `{CA}-antes.png` se captura **una sola vez, antes del primer edit**, y **no se re-genera**. Si el estado original ya no esta en vivo, recuperarlo del ultimo commit previo a la tarea; **nunca reconstruirlo de memoria** ni "de como se veia".
- Una descripcion en prosa **no sustituye** al `.png`. La comparacion es visual.
- El archivo vive en `etapa-4/evidencia/ui/` para que Tessa agregue el `{CA}-despues.png` en E4 y Quinn audite el par (EV-1/EV-2).

Aplica cuando la tarea tiene `evidencia_requerida.ui: true` y toca una vista existente (no creacion neta). El anfitrion referencia el path del baseline capturado en el bloque `## Ejecutor` de la tarea.

### Aplicabilidad por modo

| Modo | Aplica | Nota |
|------|--------|------|
| `normal` | Si | Default activo. |
| legacy `evolucion` | Si | Igual que normal; los prototipos tangibles tambien deben tener logs si introducen logica nueva. |
| `investigacion` | No por default | No hay codigo persistente que verificar en E4. |
| `documentacion` | No por default | No aplica. |
