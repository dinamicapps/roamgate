---
completedAt: null
file_type: verificacion-etapa-4
inputDocuments:
  - ../etapa-2/03-plan.md
status: in_progress
---
# Verificacion - Etapa 4

**Anfitrion**: Quinn
**Fecha**: 2026-10-12

Fase 1 en verde tras T-009 (build de produccion dentro de presupuesto, typecheck limpio, suite sin fallas nuevas). Fase 2 ejecutada con Playwright sobre el Herdr real del usuario y un workspace aislado `fm-prueba` (creado y cerrado en la sesion). H-E4-01 (raiz del tab de archivos) se corrigio con T-010 por decision del usuario (ajuste acotado con [OVERRIDE]) y se re-verifico en un segundo workspace aislado `fm-prueba2`. Veredicto: meta cumplida en lo verificado; quedan CAs pendientes de prueba manual que no bloquean.

## Resumen ejecutivo

| Criterio | Resultado |
|----------|-----------|
| Meta cumplida | SI (comprobacion pendiente declarada en VD) |
| CAs declarados | 22 PASS, 6 PENDIENTE (verificacion diferida) |
| Smoke + suite automatizada | PASS (build 160/160 archivos; suite web sin fallas nuevas; files.test 10/10) |
| Auditoria capa de seguridad | N/A (sin endpoints nuevos; tab_id validado contra el workspace y sin rutas del cliente) |
| Auditoria de evidencia (EV-N) | PASS parcial: pares antes/despues en CA-01 y CA-24; despues en CA-09, CA-11, CA-13, CA-22 |

## Verificacion por CAs

| CA | Tareas relacionadas | Resultado | Notas |
|----|---------------------|-----------|-------|
| CA-01 | T-001 | PASS | Arbol de accesibilidad identico al baseline; CA-01-antes/despues.png |
| CA-02 | T-002, T-004 | PASS | Menu de consola y boton Files reusan el tab; un solo tab por consola |
| CA-03 | T-002 | PASS | Prueba unitaria de merge por owner (filesTabResource.test.ts) |
| CA-04 | T-002 | PASS | Prueba unitaria de la barrera del primer snapshot |
| CA-05 | T-002 | PASS | Prueba unitaria del barrido de huerfanos |
| CA-06 | T-002, T-005 | PASS | Recarga restaura vinculo y pestanas; poda verificada con cierre externo (CA-17); reinicio de Herdr no ejercitado |
| CA-07 | T-002, T-003 | PASS | AGENTS.md restaurado al reabrir y al recargar |
| CA-08 | T-003, T-010 | PASS | Cada consola con su raiz, cache y vinculo separados (fm-prueba2) |
| CA-09 | T-003 | PASS | Tab pegado a su consola, sin numero; CA-09-despues.png |
| CA-10 | T-003 | PENDIENTE | El composer de anotaciones requiere interaccion real con el editor del preview |
| CA-11 | T-004, T-010 | PASS | web abre en la raiz git con web/src expandido y la conserva al mover el foco; CA-11-despues.png |
| CA-12 | T-004, T-010 | PASS | Consola fuera de un repo abre en su cwd |
| CA-13 | T-004 | PASS | Boton Files y Ctrl+Alt+E alternan; CA-13-despues.png |
| CA-14 | T-004 | PENDIENTE | Clic en link de xterm no reproducible con eventos sinteticos; cubierto por filesTabOwner.test.ts |
| CA-15 | T-004 | PASS | Browse files de otro workspace lo enfoca y abre el tab de su consola activa |
| CA-16 | T-004 | PENDIENTE | Abrir desde Changes requiere el diff del servidor, que falla en este Windows (H-E4-02) |
| CA-17 | T-005 | PASS | Cierre externo (herdr tab close) y local (x + confirmacion) eliminan tab y vinculo |
| CA-18 | T-005 | PASS | Ctrl+Alt+W cierra solo el tab, sin dialogo, consolas intactas |
| CA-19 | T-005 | PASS | Esc limpia busqueda y luego vuelve a la terminal; el tab sigue en el strip |
| CA-20 | T-005 | PENDIENTE | Requiere un perfil shared; el perfil local es browser-local y la consola tampoco sigue el foco externo |
| CA-21 | T-006 | PENDIENTE | Arrastre HTML5 no reproducible con eventos sinteticos; cubierto por tabDragHover.test.ts |
| CA-22 | T-006 | PASS | Nav mobile 390x844 alterna Files/Terminal; CA-22-despues.png |
| CA-23 | T-007 | PASS | Prueba unitaria del saneo files a changes sin reescribir |
| CA-24 | T-007 | PASS | Inspector con Changes/Commits/History; CA-24-antes/despues.png |
| CA-25 | T-007 | PENDIENTE | Requiere crear un worktree en Herdr |
| CA-26 | T-007 | PASS | Changes del preview abre el Inspector con el archivo seleccionado |
| CA-27 | T-008 | PASS | FEATURES.md, ARCHITECTURE.md y SCREENSHOTS.md revisados |
| CA-28 | T-009 | PASS | Postbuild 160/160 archivos, JS inicial 776.4/800 KiB |

## Hallazgos

| ID | Hallazgo | Rumbo propuesto |
|----|----------|-----------------|
| H-E4-01 | En workspaces sin worktree la raiz del explorador es el cwd del pane enfocado del workspace (server/src/workspace/files.ts:79-95), no el de la consola duena: el tab de web mostro web/src y luego la raiz del repo; en workspaces con consolas en repos distintos el tab puede mostrar el repo de otra consola. Previo al work (el Inspector se comportaba igual) pero contradice la intencion del diseno. Arreglarlo toca el contrato file.* (freno DEC_freno_operaciones_archivo) | Corregido en T-010 ([OVERRIDE] en Decisiones clave) |
| H-E4-02 | git.diff_file falla con invalid Git patch size en este Windows (server/src/workspace/git-diff.ts:408) | post-works (previo, fuera de alcance) |
| H-E4-03 | En mobile el strip no se desplaza hasta el tab de archivos activo | post-works (cosmetico) |
| H-E4-04 | Prop embedded de DiffContentView sin llamador; escritura legada de workspaceInspectorFile al borrar worktree | post-works (limpieza) |
| H-E4-05 | La captura roamgate-desktop-files muestra Files en el Inspector | post-works (regenerar captura) |
| H-E4-06 | relativePathWithinCheckout distingue mayusculas en Windows; file.resolve de links de terminal no usa la consola duena; foco de teclado no va al directorio inicial | post-works |
