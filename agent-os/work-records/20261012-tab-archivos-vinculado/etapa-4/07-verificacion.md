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

Fase 1 en verde tras T-009 (build de produccion dentro de presupuesto, typecheck limpio, suite sin fallas nuevas). Fase 2 ejecutada con Playwright sobre el Herdr real del usuario y un workspace aislado `fm-prueba` (creado y cerrado en la sesion). Veredicto provisional: la meta NO se cumple completa por el hallazgo H-E4-01 (raiz del tab de archivos), pendiente de decision del usuario; el resto del comportamiento verificado pasa.

## Resumen ejecutivo

| Criterio | Resultado |
|----------|-----------|
| Meta cumplida | CON_BRECHA (pendiente decision sobre H-E4-01) |
| CAs declarados | 17 PASS, 1 FAIL, 1 no evaluable, 9 pendientes manuales (5 cubiertos por pruebas unitarias) |
| Smoke + suite automatizada | PASS (build 160/160 archivos; 1267 pass, 9 fail previas en terminalComposer.test.ts) |
| Auditoria capa de seguridad | N/A (sin endpoints ni permisos) |
| Auditoria de evidencia (EV-N) | Parcial: pares antes/despues en CA-01 y CA-24; despues en CA-09, CA-11, CA-13, CA-22 |

## Verificacion por CAs

| CA | Resultado | Evidencia |
|----|-----------|-----------|
| CA-01 | PASS | Arbol de accesibilidad identico al baseline; CA-01-antes/despues.png |
| CA-02 | PASS | Menu de consola y boton Files reusan el tab; un solo tab por consola |
| CA-03 | PASS (U) | filesTabResource.test.ts (merge por owner) |
| CA-04 | PASS (U) | filesTabResource.test.ts (barrera) |
| CA-05 | PASS (U) | filesTabResource.test.ts (barrido) |
| CA-06 | PASS parcial | Recarga restaura vinculo y pestanas; reinicio de Herdr no ejercitado (afectaria al usuario) |
| CA-07 | PASS | AGENTS.md restaurado al reabrir y al recargar |
| CA-08 | PASS | Tabs de api y web con claves y vinculos separados |
| CA-09 | PASS | Tab pegado a su consola, sin numero; CA-09-despues.png |
| CA-10 | PENDIENTE | El composer de anotaciones no se ejercita con seleccion sintetica |
| CA-11 | FAIL | H-E4-01: la raiz sigue al pane enfocado del workspace; CA-11-despues.png |
| CA-12 | NO EVALUABLE | Depende del modelo de raiz de H-E4-01 |
| CA-13 | PASS | Boton Files y Ctrl+Alt+E alternan; CA-13-despues.png |
| CA-14 | PENDIENTE (U) | filesTabOwner.test.ts; clic en link de xterm no reproducible con eventos sinteticos |
| CA-15 | PASS | Browse files de otro workspace lo enfoca y abre el tab de su consola activa |
| CA-16 | PENDIENTE | Abrir desde Changes no ejercitado (diff del servidor falla en este Windows) |
| CA-17 | PASS | Cierre externo (herdr tab close) y local (x + confirmacion) eliminan tab y vinculo |
| CA-18 | PASS | Ctrl+Alt+W cierra solo el tab, sin dialogo, 5 consolas intactas |
| CA-19 | PASS | Esc limpia busqueda y luego vuelve a la terminal; tab sigue en el strip |
| CA-20 | PENDIENTE | El perfil local es browser-local: tampoco la consola sigue el foco externo (previo) |
| CA-21 | PENDIENTE (U) | tabDragHover.test.ts; arrastre HTML5 no reproducible con eventos sinteticos |
| CA-22 | PASS | Nav mobile 390x844 alterna Files/Terminal; CA-22-despues.png |
| CA-23 | PASS (U) | workspaceResource.test.ts (saneo files a changes sin reescribir) |
| CA-24 | PASS | Inspector con Changes/Commits/History; CA-24-antes/despues.png |
| CA-25 | PENDIENTE | Requiere crear un worktree |
| CA-26 | PASS | Changes del preview abre el Inspector con el archivo seleccionado |
| CA-27 | PASS | FEATURES.md, ARCHITECTURE.md y SCREENSHOTS.md revisados |
| CA-28 | PASS | Postbuild 160/160, JS inicial 776.4/800 KiB |

## Hallazgos

| ID | Hallazgo | Rumbo propuesto |
|----|----------|-----------------|
| H-E4-01 | En workspaces sin worktree la raiz del explorador es el cwd del pane enfocado del workspace (server/src/workspace/files.ts:79-95), no el de la consola duena: el tab de web mostro web/src y luego la raiz del repo; en workspaces con consolas en repos distintos el tab puede mostrar el repo de otra consola. Previo al work (el Inspector se comportaba igual) pero contradice la intencion del diseno. Arreglarlo toca el contrato file.* (freno DEC_freno_operaciones_archivo) | Decision del usuario: retroceder a diseno o cerrar con brecha |
| H-E4-02 | git.diff_file falla con invalid Git patch size en este Windows (server/src/workspace/git-diff.ts:408) | post-works (previo, fuera de alcance) |
| H-E4-03 | En mobile el strip no se desplaza hasta el tab de archivos activo | post-works (cosmetico) |
| H-E4-04 | Prop embedded de DiffContentView sin llamador; escritura legada de workspaceInspectorFile al borrar worktree | post-works (limpieza) |
| H-E4-05 | La captura roamgate-desktop-files muestra Files en el Inspector | post-works (regenerar captura) |
