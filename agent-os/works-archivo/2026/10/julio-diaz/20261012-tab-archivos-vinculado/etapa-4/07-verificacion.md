---
completedAt: "2026-10-12"
file_type: verificacion-etapa-4
inputDocuments:
  - ../etapa-2/03-plan.md
status: approved
---
# Verificacion - Etapa 4

**Anfitrion**: Quinn
**Fecha**: 2026-10-12

Fase 1 en verde tras T-009 (build de produccion dentro de presupuesto, typecheck limpio, suite sin fallas nuevas). Fase 2 ejecutada con Playwright sobre el Herdr real del usuario y un workspace aislado `fm-prueba` (creado y cerrado en la sesion). H-E4-01 (raiz del tab de archivos) se corrigio con T-010 por decision del usuario (ajuste acotado con [OVERRIDE]) y se re-verifico en un segundo workspace aislado `fm-prueba2`. Tras un primer cierre con verificacion diferida, el work se reabrio: los seis CAs diferidos se verificaron con input real de Playwright, el bridge en modo shared (CA-20) y un worktree de prueba (CA-25) en el workspace aislado `fm-prueba3`, y los defectos que aparecieron se corrigieron en T-011, T-012 y T-013. Veredicto: meta cumplida, 28/28 CAs en PASS.

## Resumen ejecutivo

| Criterio | Resultado |
|----------|-----------|
| Meta cumplida | SI |
| CAs declarados | 28/28 PASS |
| Smoke + suite automatizada | PASS (build 160/160; suite web sin fallas nuevas; pruebas de servidor tocadas en verde) |
| Auditoria capa de seguridad | N/A (sin endpoints nuevos; tab_id y pane_id validados contra el workspace, sin rutas del cliente) |
| Auditoria de evidencia (EV-N) | PASS: pares antes/despues en CA-01 y CA-24; despues en CA-09, CA-10, CA-11, CA-13, CA-16, CA-22, CA-25, CA-26 |

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
| CA-09 | T-003, T-012 | PASS | Tab pegado a su consola, sin numero; el clic en la consola con su tab activo vuelve a ella tras T-012 (CA-09-despues.png) |
| CA-10 | T-003 | PASS | Seleccion real en el preview, Add comment, la anotacion sobrevive al cambio de consola y aparece en Review feedback (CA-10-despues.png) |
| CA-11 | T-004, T-010 | PASS | web abre en la raiz git con web/src expandido y la conserva al mover el foco; CA-11-despues.png |
| CA-12 | T-004, T-010 | PASS | Consola fuera de un repo abre en su cwd |
| CA-13 | T-004 | PASS | Boton Files y Ctrl+Alt+E alternan; CA-13-despues.png |
| CA-14 | T-004, T-012 | PASS | Ctrl+clic en workspace/files.ts y ./index.ts impresos por el pane en server/src, y en una ruta absoluta de Windows, abren el archivo en el tab de archivos de su consola |
| CA-15 | T-004 | PASS | Browse files de otro workspace lo enfoca y abre el tab de su consola activa |
| CA-16 | T-004, T-011 | PASS | Open in Files desde Changes cierra el Inspector y abre TabBar.tsx en el tab de archivos (CA-16-despues.png) |
| CA-17 | T-005 | PASS | Cierre externo (herdr tab close) y local (x + confirmacion) eliminan tab y vinculo |
| CA-18 | T-005 | PASS | Ctrl+Alt+W cierra solo el tab, sin dialogo, consolas intactas |
| CA-19 | T-005 | PASS | Esc limpia busqueda y luego vuelve a la terminal; el tab sigue en el strip |
| CA-20 | T-005 | PASS | Bridge en modo shared: herdr tab focus sobre otra consola muestra esa consola y el tab de archivos queda en el strip |
| CA-21 | T-006 | PASS | Arrastre real de AGENTS.md sostenido sobre la consola web y soltado en su terminal escribe la ruta en el prompt |
| CA-22 | T-006 | PASS | Nav mobile 390x844 alterna Files/Terminal; CA-22-despues.png |
| CA-23 | T-007 | PASS | Prueba unitaria del saneo files a changes sin reescribir |
| CA-24 | T-007 | PASS | Inspector con Changes/Commits/History; CA-24-antes/despues.png |
| CA-25 | T-007, T-013 | PASS | Files de un worktree cerrado abre su workspace y su tab de archivos; el dialogo muestra 2 checkouts sin duplicados (CA-25-despues.png, CA-25-lifecycle.png) |
| CA-26 | T-007, T-011 | PASS | Changes del preview abre el Inspector con el archivo y su diff visible tras T-011 (CA-26-despues.png) |
| CA-27 | T-008 | PASS | FEATURES.md, ARCHITECTURE.md y SCREENSHOTS.md revisados |
| CA-28 | T-009 | PASS | Postbuild 160/160 archivos, JS inicial 776.4/800 KiB |

## Hallazgos

| ID | Hallazgo | Rumbo |
|----|----------|-------|
| H-E4-01 | Raiz del explorador por pane enfocado del workspace | Corregido en T-010 |
| H-E4-02 | git.diff_file fallaba en Windows (mktemp en /tmp no escribible, error oculto) | Corregido en T-011, junto con terminal-upload y update |
| H-E4-03 | Strip mobile no se desplaza al tab activo; foco de teclado no va al directorio inicial | post-works (cosmetico) |
| H-E4-04 | Codigo muerto (prop embedded de DiffContentView) y escritura legada de workspaceInspectorFile | post-works |
| H-E4-05 | Captura roamgate-desktop-files desactualizada | post-works |
| H-E4-07 | Clic en la consola con su tab de archivos activo no volvia (captura de puntero del reorder) | Corregido en T-012 |
| H-E4-08 | Links relativos al pane no resolvian; absolutos de Windows abrian como ruta absoluta | Corregido en T-012 y T-013 |
| H-E4-09 | Worktree Lifecycle en Windows: rutas C:/ enviadas como rama, checkout duplicado, estado Open/Closed incorrecto | Corregido en T-013 |
| H-E4-10 | Snapshots de Last step fallan en Windows (ulimit) | post-works (funcion distinta) |
