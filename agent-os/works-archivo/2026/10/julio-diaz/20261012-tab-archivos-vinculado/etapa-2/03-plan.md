---
completedAt: "2026-10-12"
file_type: plan-etapa-2
inputDocuments:
  - agent-os/disenos/20261007-file-manager-panel/brief.md
  - agent-os/disenos/20261007-file-manager-panel/datos.md
  - agent-os/disenos/20261007-file-manager-panel/procesos/P1-abrir-enfocar.md
  - agent-os/disenos/20261007-file-manager-panel/procesos/P2-explorar-previsualizar.md
  - agent-os/disenos/20261007-file-manager-panel/procesos/P3-navegar-strip.md
  - agent-os/disenos/20261007-file-manager-panel/procesos/P4-cerrar.md
  - agent-os/disenos/20261007-file-manager-panel/procesos/P5-inspector-sin-files.md
status: approved
---
# Plan de implementacion - Etapa 2

**Anfitrion**: Winston (elevado: cambia una frontera de modulo; Files sale del Inspector y nace `filesTabResource.ts`)
**Fecha**: 2026-10-12
**Modo**: normal
**Nivel**: normal

Implementa el diseno `20261007-file-manager-panel` (brief aprobado 2026-10-11): el file manager pasa a ser un tab de archivos del cliente, vinculado 1:1 a su consola. El orden protege al usuario: primero se extrae el bloque Files sin cambiar comportamiento (N1) y se construye la persistencia como logica pura; luego aparece el tab con sus entradas, cierre y navegacion; al final se retira Files del Inspector, cuando el tab ya cubre todas las entradas.

## Decisiones tecnicas

| # | Decision | Valor final | Justificacion |
|---|----------|-------------|---------------|
| D1 | Elevacion a Winston | Si | Cambia frontera de modulo: Files sale de WorkspaceInspectorHost y nace filesTabResource.ts (D-03 del brief) |
| D2 | N1 primero y sin cambio de comportamiento | T-001 extraccion pura | Todo lo nuevo se apoya en un componente ya probado dentro del Inspector |
| D3 | Persistencia como modulo puro | T-002 sin React, con pruebas unitarias | Merge, barrera, idempotencia y barrido son reglas verificables en aislamiento |
| D4 | Retirar Files del Inspector al final | T-007 depende de T-004 | Evita una ventana sin acceso a archivos |
| D5 | Paralelismo | Ola 1 {T-001, T-002}; ola 2 {T-003}; ola 3 {T-004, T-005, T-006} en serie por compartir App.tsx; ola 4 {T-007}; ola 5 {T-008} | Las tareas de ola 3 comparten App.tsx y TabBar.tsx |
| D6 | Idioma del codigo | Ingles, como el codigo circundante | El repo es upstream en ingles; la prosa del work va en espanol |
| D7 | Capa de seguridad | No aplica | Sin endpoints nuevos; se usan file.* y tab.* existentes |

## Estructura de fases

### Fase 1: Extraer
T-001 (N1): bloque Files a componente montable.

### Fase 2: Datos
T-002: filesTabResource.ts con sus reglas y pruebas.

### Fase 3: Tab
T-003: tab en el strip y superficie. T-004: P1, todas las entradas.

### Fase 4: Cierre y navegacion
T-005: P4, cierre, Esc, Ctrl+Alt+W y foco externo. T-006: arrastre y mobile.

### Fase 5: Inspector sin Files
T-007: P5. T-008: documentacion.

## Modelo de datos

Sin BD. Claves de localStorage por conexion (`connectionStorageKey`), definidas en `agent-os/disenos/20261007-file-manager-panel/datos.md`: `filesTabLinks` (T-002), `filesTabFiles:{ownerTabId}` (T-002) y saneo de preferencias del Inspector (T-007).

## Verificacion

Tipos por la Matriz de verificacion del brief: U (bun test sobre modulos puros), D (componente) y M (manual guiada con la receta del escenario).

## Criterios de aceptacion

| ID | Criterio | Origen | Tareas |
|---|---|---|---|
| CA-01 | N1 sin regresion: el Inspector sigue mostrando Files igual que hoy usando el componente extraido; anotaciones (lectura, creacion, reanclaje) intactas; diffViewerRef queda en el host; ninguna escucha de Esc en window | REG_anotaciones_conservadas, INV-PUENTE-08 | T-001 |
| CA-02 | ESC_P1_reusar_existente: pedir los archivos de una consola que ya tiene tab enfoca el existente, no crea otro | REG_idempotencia_abrir_tab_archivos | T-002, T-004 |
| CA-03 | ESC_P1_dos_pestanas_navegador: dos pestanas del navegador crean vinculos de consolas distintas sin borrarse | REG_merge_por_owner | T-002 |
| CA-04 | ESC_P4_snapshot_retrasado: antes del primer snapshot no se muestran ni se borran vinculos | REG_barrera_primer_snapshot | T-002 |
| CA-05 | ESC_P4_barrido_huerfanos: la reconciliacion elimina claves filesTabFiles sin vinculo | REG_cuota_y_barrido | T-002 |
| CA-06 | ESC_P4_recarga_y_reinicio: tras recargar se restauran los vinculos de consolas vivas; los de consolas muertas se descartan | INV-PUENTE-09 | T-002, T-005 |
| CA-07 | ESC_P2_rehidratar: al volver a un tab de archivos desmontado se restauran pestanas, seleccion y preview | REG_rehidratar_al_remontar | T-002, T-003 |
| CA-08 | ESC_P2_dos_consolas_aisladas: dos tabs de archivos de consolas distintas no comparten estado | INV-PUENTE-01 | T-003 |
| CA-09 | ESC_P3_orden_y_atajos: el tab va pegado a la derecha de su consola, sin numero en Ctrl+1..9, sin pin, y su id no llega a Herdr | REG_id_virtual_fuera_de_herdr, INV-PUENTE-11 | T-003 |
| CA-10 | ESC_P2_anotacion_sobrevive: una anotacion creada en el tab sobrevive al ir y volver | REG_anotaciones_conservadas | T-003 |
| CA-11 | ESC_P1_crear_en_subdir: el tab nace en el cwd del pane enfocado relativo a la raiz del checkout | REG_P1_raiz_al_crear | T-004 |
| CA-12 | ESC_P1_cwd_fuera_de_raiz: con cwd fuera del checkout el tab abre en la raiz | REG_cwd_fuera_raiz_abre_raiz | T-004 |
| CA-13 | ESC_P1_files_toggle_doble: Ctrl+Alt+E abre y la segunda vez vuelve a la consola | REG_files_toggle | T-004 |
| CA-14 | ESC_P1_link_consola_no_activa: un link de archivo resuelve la consola duena desde su pane | REG_link_resuelve_pane_dueno | T-004 |
| CA-15 | ESC_P1_otro_workspace: una entrada sobre otro workspace lo enfoca antes de abrir | DEC_P1_otro_ws_enfocar | T-004 |
| CA-16 | ESC_P1_desde_changes: abrir un archivo desde Changes cierra el Inspector y abre el tab | DEC_P1_changes_cierra_inspector | T-004 |
| CA-17 | ESC_P4_cierre_externo: cerrar la consola (local o desde Herdr/otro navegador) cierra su tab de archivos | REG_cierre_consola_cierra_archivos | T-005 |
| CA-18 | ESC_P4_ctrl_alt_w: Ctrl+Alt+W con el tab activo cierra solo el tab de archivos | DEC_ctrl_alt_w_cierra_tab_archivos | T-005 |
| CA-19 | ESC_P4_esc_cascada: Esc despeja lo transitorio y luego vuelve a la consola sin cerrar el tab | DEC_esc_cascada_vuelve_consola | T-005 |
| CA-20 | ESC_P3_foco_externo_shared: ante foco externo o cambio de workspace se muestra la consola enfocada | DEC_P3_foco_externo_manda, INV-PUENTE-07 | T-005 |
| CA-21 | ESC_P3_drag_ruta_a_terminal: arrastrar una ruta sobre el tab de una consola la activa para soltar en su terminal | REG_drop_hover_activa_consola | T-006 |
| CA-22 | ESC_P3_mobile_nav: en mobile Files/Terminal alternan; el tab no cuenta para el strip ni aparece en MobileTabSheet | DEC_D9_nav_mobile | T-006 |
| CA-23 | ESC_P5_saneo_view_files: una preferencia guardada con view files se lee como changes | REG_saneo_view_files | T-007 |
| CA-24 | ESC_P5_toggle_sin_files: el Inspector no ofrece Files | DEC_D3_quitar_files_inspector_view | T-007 |
| CA-25 | ESC_P5_worktree_files: la accion de archivos del ciclo de worktree abre el tab de archivos | DEC_D3_quitar_files_inspector_view | T-007 |
| CA-26 | ESC_P2_ver_cambios: ver cambios de un archivo abre el Inspector en Changes al costado | DEC_D8_inspector_changes | T-007 |
| CA-27 | FEATURES.md y docs/ARCHITECTURE.md describen el tab de archivos y el Inspector sin Files | Matriz de verificacion del brief | T-008 |
