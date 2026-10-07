# Hotfix Fase 3: Carpeta y bitacora maestra

1. **Slug del hotfix:** `{YYYYMMDD-HHMM}-hotfix-{slug-corto-inferido-del-sintoma}`.
2. **Crear la maestra via runtime** (no copiar el template a mano): escribir `{"proveedor_ia":"claude","hotfix":{"contexto":"<incidente>","disparado_por":"usuario","work_pausado":"<slug-pausado o vacio>"}}` al scratchpad y pasarlo con `--input <ruta>` (recomendado) — `agentos work open --slug <slug> --autor "<autor>" --modo hotfix --tipo hotfix --nivel normal --input <ruta-json>`; stdin sigue valido para la invocacion simple. El binario hornea `bitacora.md` con frontmatter canonico y emite heartbeat; el catalogo no se registra -- se deriva en memoria en la siguiente lectura. Ver `bmad-agent-alfred/gestion/hotfix.md`. Si `ok:false`, mostrar `error.mensaje` y detener.
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->
3. **Primera entrada cronologica** en la bitacora: el **disparo del usuario verbatim** (el sintoma tal como llego).
4. Si hubo pausa de work activo en Fase 2, **segunda entrada**: el registro de la pausa (que work, por que, hora).

La carpeta es plana: `bitacora.md` siempre existe (hilo maestro). Los archivos `F1-{slug}.md`, `F2-...` solo se crean cuando hay >1 frente (ver Fase 4). Cuando solo hay 1 frente, la maestra absorbe la investigacion sin crear archivo separado.

El binario `agentos work open` hornea el frontmatter canonico hotfix-maestra y el cuerpo de la bitacora (logica interna del runtime); lo que se materializa lo decide el runtime, no el template.

<!-- FUENTE: agent-os/templates/work-record/hotfix/bitacora.md. Plantilla de referencia humana; el contenido real lo hornea el runtime. NO duplicar -- editar la plantilla si cambia la referencia humana; para cambiar lo horneado, editar el runtime. -->
