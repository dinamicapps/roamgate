---
slug: 20261012-tab-archivos-vinculado
autor: julio-diaz
autor_kebab: julio-diaz
fecha_inicio: "2026-10-12"
fecha_fin: null
estado: EN_PROGRESO
modo: normal
nivel: normal
tipo: feature
version_sistema: "2"
proveedor_ia: claude
diseno_origen: 20261007-file-manager-panel
ruta: diseno
abordaje:
  realizado_en: "2026-10-12"
  expertos_invitados: []
  party_mode: false
  ruta_propuesta: diseno
  ruta_aprobada: diseno
meta: "Desde cualquier consola, Ctrl+Alt+E, el boton Files o el menu del tab abren (o enfocan, sin duplicar) un tab de archivos pegado a su consola, en el cwd del pane enfocado; el tab se cierra con su consola, rehidrata su estado y el Inspector ya no ofrece la vista Files."
meta_definida_en: "2026-10-12"
work_paraguas: W1_tab_archivos_vinculado
---
# Work: Tab de archivos vinculado a su consola

> Estado: **EN_PROGRESO** · Ruta: diseno · Modo: normal · Nivel: normal · 2026-10-12

## Objetivo

Implementar el diseno 20261007-file-manager-panel: el file manager pasa a ser un tab de archivos del cliente, vinculado 1:1 a su tab de consola, que abre en el directorio de trabajo de esa consola y sale del Inspector (procesos P1-P5).

## Abordaje (2026-10-12)

Abordaje comprimido por --desde-diseno=20261007-file-manager-panel. El diseno esta en BRIEF_LISTO (brief aprobado 2026-10-11, modelo validado en 8 etapas, red-team TR-02 absorbido: 0 criticos, 3 mayores y 5 medios resueltos). No es paraguas: un solo work W1_tab_archivos_vinculado con P1-P5. Validacion de aplicabilidad: no hay commits en web/ ni server/ desde la instalacion de agent-os (90074b9), asi que las citas del brief siguen vigentes. Primer paso N1: extraer el bloque Files de WorkspaceInspectorHost a un componente montable sin cambiar comportamiento.

## Terreno

<!-- modelo:start vista=terreno -->
Proyectado desde `modelo.yml` del work. No editar a mano: la fuente es el modelo.

```mermaid
graph LR
  CAP_vista_files_inspector["CAP_vista_files_inspector<br/>capacidad"]
  CAP_bloque_files["CAP_bloque_files<br/>capacidad"]
  CAP_panel_files["CAP_panel_files<br/>capacidad"]
  CAP_explorador_archivos["CAP_explorador_archivos<br/>capacidad"]
  CAP_pestanas_preview["CAP_pestanas_preview<br/>capacidad"]
  CAP_visor_diffs_changes["CAP_visor_diffs_changes<br/>capacidad"]
  CAP_contrato_backend_archivos["CAP_contrato_backend_archivos<br/>capacidad"]
  CAP_abrir_inspector["CAP_abrir_inspector<br/>capacidad"]
  CAP_abrir_file_explorer["CAP_abrir_file_explorer<br/>capacidad"]
  CAP_atajo_files_toggle["CAP_atajo_files_toggle<br/>capacidad"]
  CAP_preferencias_inspector["CAP_preferencias_inspector<br/>capacidad"]
  CAP_tipo_inspector_view["CAP_tipo_inspector_view<br/>capacidad"]
  CAP_guarda_foco_terminal["CAP_guarda_foco_terminal<br/>capacidad"]
  CAP_activar_superficie_terminal["CAP_activar_superficie_terminal<br/>capacidad"]
  CAP_nav_mobile_files["CAP_nav_mobile_files<br/>capacidad"]
  CAP_foco_compartido_inspector["CAP_foco_compartido_inspector<br/>capacidad"]
  REST_panel_hermano_superficies["REST_panel_hermano_superficies<br/>restriccion"]
  REST_estado_por_conexion["REST_estado_por_conexion<br/>restriccion"]
  REST_foco_rpc_herdr["REST_foco_rpc_herdr<br/>restriccion"]
  REST_mobile_view_cerrada["REST_mobile_view_cerrada<br/>restriccion"]
  ACT_usuario["ACT_usuario<br/>actor"]
  PRO_explorar_archivos["PRO_explorar_archivos<br/>proceso"]
  PAN_panel_files["PAN_panel_files<br/>pantalla"]
  ENT_preferencias_inspector["ENT_preferencias_inspector<br/>entidad"]
  ENT_resource_file_tabs["ENT_resource_file_tabs<br/>entidad"]
  ENT_estado_panel_files["ENT_estado_panel_files<br/>entidad"]
  DEC_opcion_b_mover["DEC_opcion_b_mover<br/>decision"]
  PRG_D2_foco_shared["PRG_D2_foco_shared<br/>pregunta"]
  PRG_D3_tipo_files["PRG_D3_tipo_files<br/>pregunta"]
  PRG_D4_migracion_prefs["PRG_D4_migracion_prefs<br/>pregunta"]
  PRG_D5_seguir_workspace["PRG_D5_seguir_workspace<br/>pregunta"]
  PRG_D6_descubribilidad["PRG_D6_descubribilidad<br/>pregunta"]
  PRG_D7_layout["PRG_D7_layout<br/>pregunta"]
  PRG_D8_subvista_cambios["PRG_D8_subvista_cambios<br/>pregunta"]
  PRG_D9_mobile["PRG_D9_mobile<br/>pregunta"]
  PRG_D10_estado_panel["PRG_D10_estado_panel<br/>pregunta"]
  PRG_esc_cierra_panel["PRG_esc_cierra_panel<br/>pregunta"]
  DEC_freno_operaciones_archivo["DEC_freno_operaciones_archivo<br/>decision"]
  DEC_freno_coexistir["DEC_freno_coexistir<br/>decision"]
  REG_INV01_gating_seleccion_scope["REG_INV01_gating_seleccion_scope<br/>regla"]
  REG_INV02_reset_por_generacion["REG_INV02_reset_por_generacion<br/>regla"]
  REG_INV03_remontaje_por_scope["REG_INV03_remontaje_por_scope<br/>regla"]
  REG_INV04_raiz_pane_enfocado["REG_INV04_raiz_pane_enfocado<br/>regla"]
  REG_INV05_guarda_foco_terminal["REG_INV05_guarda_foco_terminal<br/>regla"]
  REG_INV06_popover_anotaciones["REG_INV06_popover_anotaciones<br/>regla"]
  REG_INV07_foco_compartido["REG_INV07_foco_compartido<br/>regla"]
  REG_INV08_subvista_cambios["REG_INV08_subvista_cambios<br/>regla"]
  PRG_abrir_desde_changes["PRG_abrir_desde_changes<br/>pregunta"]
  RSG_tamano_inspector_ignora_panel["RSG_tamano_inspector_ignora_panel<br/>riesgo"]
  RSG_inspector_overlay_mas_frecuente["RSG_inspector_overlay_mas_frecuente<br/>riesgo"]
  RSG_pares_estrechos_recorte["RSG_pares_estrechos_recorte<br/>riesgo"]
  RSG_esc_global_extraido["RSG_esc_global_extraido<br/>riesgo"]
  DEC_migracion_prefs_una_vez["DEC_migracion_prefs_una_vez<br/>decision"]
  DEC_persistencia_panel_por_scope["DEC_persistencia_panel_por_scope<br/>decision"]
  DEC_estado_panel_modulo_nuevo["DEC_estado_panel_modulo_nuevo<br/>decision"]
  DEC_freno_mover_resource_file_tabs["DEC_freno_mover_resource_file_tabs<br/>decision"]
  REG_sync_storage_panel["REG_sync_storage_panel<br/>regla"]
  REG_reset_sesion_panel_generacion["REG_reset_sesion_panel_generacion<br/>regla"]
  DEC_opcion_a1_tab_vinculado["DEC_opcion_a1_tab_vinculado<br/>decision"]
  DEC_raiz_cwd_pane_enfocado["DEC_raiz_cwd_pane_enfocado<br/>decision"]
  DEC_cierre_con_consola["DEC_cierre_con_consola<br/>decision"]
  DEC_siempre_ligado_activo["DEC_siempre_ligado_activo<br/>decision"]
  CAP_tab_archivos_vinculado["CAP_tab_archivos_vinculado<br/>capacidad"]
  CAP_directorio_inicial_pane["CAP_directorio_inicial_pane<br/>capacidad"]
  CAP_strip_tabs["CAP_strip_tabs<br/>capacidad"]
  CAP_ciclo_vida_tabs["CAP_ciclo_vida_tabs<br/>capacidad"]
  CAP_hoja_tabs_mobile["CAP_hoja_tabs_mobile<br/>capacidad"]
  REST_strip_tabs_herdr["REST_strip_tabs_herdr<br/>restriccion"]
  PRG_vinculo_persistencia["PRG_vinculo_persistencia<br/>pregunta"]
  PRG_cwd_fuera_de_raiz["PRG_cwd_fuera_de_raiz<br/>pregunta"]
  RSG_cerrar_tab_oculto["RSG_cerrar_tab_oculto<br/>riesgo"]
  RSG_reorden_indice_cero["RSG_reorden_indice_cero<br/>riesgo"]
  RSG_pin_virtual["RSG_pin_virtual<br/>riesgo"]
  RSG_strip_mobile_un_tab["RSG_strip_mobile_un_tab<br/>riesgo"]
  ENT_vinculo_tab_archivos["ENT_vinculo_tab_archivos<br/>entidad"]
  REG_INV09_limpieza_vinculo_refresh["REG_INV09_limpieza_vinculo_refresh<br/>regla"]
  REG_INV11_foco_virtual_local["REG_INV11_foco_virtual_local<br/>regla"]
  REG_idempotencia_abrir_tab_archivos["REG_idempotencia_abrir_tab_archivos<br/>regla"]
  PRG_pin_tab_archivos["PRG_pin_tab_archivos<br/>pregunta"]
  PRG_cambio_workspace_activo["PRG_cambio_workspace_activo<br/>pregunta"]
  PRG_identidad_orden_virtual["PRG_identidad_orden_virtual<br/>pregunta"]
  PRG_estado_explorador_remontaje["PRG_estado_explorador_remontaje<br/>pregunta"]
  DEC_vinculo_localstorage_validado["DEC_vinculo_localstorage_validado<br/>decision"]
  DEC_estado_por_vinculo_rehidratado["DEC_estado_por_vinculo_rehidratado<br/>decision"]
  DEC_estado_tab_modulo_nuevo["DEC_estado_tab_modulo_nuevo<br/>decision"]
  ENT_pestanas_por_vinculo["ENT_pestanas_por_vinculo<br/>entidad"]
  DEC_D6_boton_y_menu["DEC_D6_boton_y_menu<br/>decision"]
  PRO_P1_abrir_enfocar["PRO_P1_abrir_enfocar<br/>proceso"]
  REG_P1_raiz_al_crear["REG_P1_raiz_al_crear<br/>regla"]
  REG_cwd_fuera_raiz_abre_raiz["REG_cwd_fuera_raiz_abre_raiz<br/>regla"]
  DEC_P1_otro_ws_enfocar["DEC_P1_otro_ws_enfocar<br/>decision"]
  DEC_P1_changes_cierra_inspector["DEC_P1_changes_cierra_inspector<br/>decision"]
  DEC_P1_cwd_fuera_raiz["DEC_P1_cwd_fuera_raiz<br/>decision"]
  DEC_D8_inspector_changes["DEC_D8_inspector_changes<br/>decision"]
  REG_rehidratar_al_remontar["REG_rehidratar_al_remontar<br/>regla"]
  PRO_P3_navegar_strip["PRO_P3_navegar_strip<br/>proceso"]
  DEC_P3_pegado_a_consola["DEC_P3_pegado_a_consola<br/>decision"]
  DEC_P3_atajos_solo_consolas["DEC_P3_atajos_solo_consolas<br/>decision"]
  DEC_P3_foco_externo_manda["DEC_P3_foco_externo_manda<br/>decision"]
  DEC_P3_sin_pin_propio["DEC_P3_sin_pin_propio<br/>decision"]
  DEC_D9_nav_mobile["DEC_D9_nav_mobile<br/>decision"]
  DEC_D2_foco_local["DEC_D2_foco_local<br/>decision"]
  REG_id_virtual_fuera_de_herdr["REG_id_virtual_fuera_de_herdr<br/>regla"]
  PRO_P4_cerrar["PRO_P4_cerrar<br/>proceso"]
  PRO_P5_inspector_sin_files["PRO_P5_inspector_sin_files<br/>proceso"]
  DEC_esc_cascada_vuelve_consola["DEC_esc_cascada_vuelve_consola<br/>decision"]
  DEC_ctrl_alt_w_cierra_tab_archivos["DEC_ctrl_alt_w_cierra_tab_archivos<br/>decision"]
  DEC_D3_quitar_files_inspector_view["DEC_D3_quitar_files_inspector_view<br/>decision"]
  REG_cierre_consola_cierra_archivos["REG_cierre_consola_cierra_archivos<br/>regla"]
  REG_saneo_view_files["REG_saneo_view_files<br/>regla"]
  PAN_inspector["PAN_inspector<br/>pantalla"]
  ESC_P1_crear_en_subdir["ESC_P1_crear_en_subdir<br/>escenario"]
  ESC_P1_reusar_existente["ESC_P1_reusar_existente<br/>escenario"]
  ESC_P1_otro_workspace["ESC_P1_otro_workspace<br/>escenario"]
  ESC_P1_desde_changes["ESC_P1_desde_changes<br/>escenario"]
  ESC_P1_cwd_fuera_de_raiz["ESC_P1_cwd_fuera_de_raiz<br/>escenario"]
  ESC_P2_dos_consolas_aisladas["ESC_P2_dos_consolas_aisladas<br/>escenario"]
  ESC_P2_rehidratar["ESC_P2_rehidratar<br/>escenario"]
  ESC_P2_ver_cambios["ESC_P2_ver_cambios<br/>escenario"]
  ESC_P3_orden_y_atajos["ESC_P3_orden_y_atajos<br/>escenario"]
  ESC_P3_foco_externo_shared["ESC_P3_foco_externo_shared<br/>escenario"]
  ESC_P3_mobile_nav["ESC_P3_mobile_nav<br/>escenario"]
  ESC_P4_cierre_externo["ESC_P4_cierre_externo<br/>escenario"]
  ESC_P4_ctrl_alt_w["ESC_P4_ctrl_alt_w<br/>escenario"]
  ESC_P4_esc_cascada["ESC_P4_esc_cascada<br/>escenario"]
  ESC_P4_recarga_y_reinicio["ESC_P4_recarga_y_reinicio<br/>escenario"]
  ESC_P5_saneo_view_files["ESC_P5_saneo_view_files<br/>escenario"]
  ESC_P5_worktree_files["ESC_P5_worktree_files<br/>escenario"]
  ESC_P5_toggle_sin_files["ESC_P5_toggle_sin_files<br/>escenario"]
  DEC_R1_link_pane_dueno["DEC_R1_link_pane_dueno<br/>decision"]
  DEC_R2_drag_hover_strip["DEC_R2_drag_hover_strip<br/>decision"]
  DEC_R3_files_toggle_real["DEC_R3_files_toggle_real<br/>decision"]
  REG_link_resuelve_pane_dueno["REG_link_resuelve_pane_dueno<br/>regla"]
  REG_drop_hover_activa_consola["REG_drop_hover_activa_consola<br/>regla"]
  REG_files_toggle["REG_files_toggle<br/>regla"]
  REG_anotaciones_conservadas["REG_anotaciones_conservadas<br/>regla"]
  REG_merge_por_owner["REG_merge_por_owner<br/>regla"]
  REG_barrera_primer_snapshot["REG_barrera_primer_snapshot<br/>regla"]
  REG_cuota_y_barrido["REG_cuota_y_barrido<br/>regla"]
  ESC_P1_link_consola_no_activa["ESC_P1_link_consola_no_activa<br/>escenario"]
  ESC_P1_files_toggle_doble["ESC_P1_files_toggle_doble<br/>escenario"]
  ESC_P1_dos_pestanas_navegador["ESC_P1_dos_pestanas_navegador<br/>escenario"]
  ESC_P2_anotacion_sobrevive["ESC_P2_anotacion_sobrevive<br/>escenario"]
  ESC_P3_drag_ruta_a_terminal["ESC_P3_drag_ruta_a_terminal<br/>escenario"]
  ESC_P4_snapshot_retrasado["ESC_P4_snapshot_retrasado<br/>escenario"]
  ESC_P4_barrido_huerfanos["ESC_P4_barrido_huerfanos<br/>escenario"]
  PRO_explorar_archivos -->|USA| CAP_explorador_archivos
  PRO_explorar_archivos -->|USA| CAP_pestanas_preview
  PRO_explorar_archivos -->|USA| CAP_contrato_backend_archivos
  PRO_explorar_archivos -->|USA| CAP_visor_diffs_changes
  PRO_explorar_archivos -->|USA| CAP_bloque_files
  PRO_explorar_archivos -->|USA| CAP_panel_files
  PRO_explorar_archivos -->|USA| CAP_abrir_file_explorer
  PRO_explorar_archivos -->|USA| CAP_atajo_files_toggle
  PRO_explorar_archivos -->|USA| CAP_nav_mobile_files
  PRO_explorar_archivos -->|USA| CAP_activar_superficie_terminal
  PRO_explorar_archivos -->|USA| CAP_guarda_foco_terminal
  PRO_explorar_archivos -->|USA| CAP_preferencias_inspector
  PRO_explorar_archivos -->|USA| CAP_tipo_inspector_view
  PRO_explorar_archivos -->|USA| CAP_abrir_inspector
  PRO_explorar_archivos -->|USA| CAP_foco_compartido_inspector
  PRO_explorar_archivos -->|DERIVA_DE| CAP_vista_files_inspector
  ACT_usuario -->|INICIA| PRO_explorar_archivos
  PRO_explorar_archivos -->|LLEGA_POR| PAN_panel_files
  PRO_explorar_archivos -->|ACCEDE| ENT_preferencias_inspector
  PRO_explorar_archivos -->|ACCEDE| ENT_resource_file_tabs
  PRO_explorar_archivos -->|ACCEDE| ENT_estado_panel_files
  REST_panel_hermano_superficies -->|LIMITA| CAP_panel_files
  REST_estado_por_conexion -->|LIMITA| ENT_estado_panel_files
  REST_foco_rpc_herdr -->|LIMITA| PRO_explorar_archivos
  REST_mobile_view_cerrada -->|LIMITA| PAN_panel_files
  PRO_explorar_archivos -->|APLICA| REG_INV01_gating_seleccion_scope
  PRO_explorar_archivos -->|APLICA| REG_INV02_reset_por_generacion
  PRO_explorar_archivos -->|APLICA| REG_INV03_remontaje_por_scope
  PRO_explorar_archivos -->|APLICA| REG_INV04_raiz_pane_enfocado
  PRO_explorar_archivos -->|APLICA| REG_INV05_guarda_foco_terminal
  PRO_explorar_archivos -->|APLICA| REG_INV06_popover_anotaciones
  PRO_explorar_archivos -->|APLICA| REG_INV07_foco_compartido
  PRO_explorar_archivos -->|APLICA| REG_INV08_subvista_cambios
  ENT_estado_panel_files -->|RELACIONA| ENT_preferencias_inspector
  ENT_estado_panel_files -->|RELACIONA| ENT_resource_file_tabs
  PRO_explorar_archivos -->|APLICA| REG_sync_storage_panel
  PRO_explorar_archivos -->|APLICA| REG_reset_sesion_panel_generacion
  PRO_explorar_archivos -->|USA| CAP_tab_archivos_vinculado
  PRO_explorar_archivos -->|USA| CAP_directorio_inicial_pane
  PRO_explorar_archivos -->|USA| CAP_strip_tabs
  PRO_explorar_archivos -->|USA| CAP_ciclo_vida_tabs
  PRO_explorar_archivos -->|USA| CAP_hoja_tabs_mobile
  REST_strip_tabs_herdr -->|LIMITA| CAP_tab_archivos_vinculado
  PRO_explorar_archivos -->|ACCEDE| ENT_vinculo_tab_archivos
  PRO_explorar_archivos -->|APLICA| REG_INV09_limpieza_vinculo_refresh
  PRO_explorar_archivos -->|APLICA| REG_INV11_foco_virtual_local
  PRO_explorar_archivos -->|APLICA| REG_idempotencia_abrir_tab_archivos
  ENT_vinculo_tab_archivos -->|RELACIONA| ENT_pestanas_por_vinculo
  ENT_pestanas_por_vinculo -->|RELACIONA| ENT_resource_file_tabs
  ENT_vinculo_tab_archivos -->|RELACIONA| ENT_preferencias_inspector
  ACT_usuario -->|INICIA| PRO_P1_abrir_enfocar
  PRO_P1_abrir_enfocar -->|DERIVA_DE| CAP_tab_archivos_vinculado
  PRO_P1_abrir_enfocar -->|DERIVA_DE| CAP_abrir_file_explorer
  PRO_P1_abrir_enfocar -->|DERIVA_DE| CAP_atajo_files_toggle
  PRO_P1_abrir_enfocar -->|DERIVA_DE| CAP_nav_mobile_files
  PRO_P1_abrir_enfocar -->|DERIVA_DE| CAP_directorio_inicial_pane
  PRO_P1_abrir_enfocar -->|DERIVA_DE| CAP_strip_tabs
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV01_gating_seleccion_scope
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV02_reset_por_generacion
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV03_remontaje_por_scope
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV04_raiz_pane_enfocado
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV05_guarda_foco_terminal
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV07_foco_compartido
  PRO_P1_abrir_enfocar -->|APLICA| REG_INV11_foco_virtual_local
  PRO_P1_abrir_enfocar -->|APLICA| REG_P1_raiz_al_crear
  PRO_P1_abrir_enfocar -->|APLICA| REG_idempotencia_abrir_tab_archivos
  PRO_P1_abrir_enfocar -->|APLICA| REG_cwd_fuera_raiz_abre_raiz
  PRO_P1_abrir_enfocar -->|ACCEDE| ENT_vinculo_tab_archivos
  PRO_P1_abrir_enfocar -->|ACCEDE| ENT_pestanas_por_vinculo
  PRO_P1_abrir_enfocar -->|ACCEDE| ENT_preferencias_inspector
  PRO_P1_abrir_enfocar -->|ACCEDE| ENT_resource_file_tabs
  PRO_P1_abrir_enfocar -->|LLEGA_POR| PAN_panel_files
  PRO_explorar_archivos -->|DERIVA_DE| CAP_bloque_files
  PRO_explorar_archivos -->|APLICA| REG_rehidratar_al_remontar
  PRO_explorar_archivos -->|ACCEDE| ENT_pestanas_por_vinculo
  ACT_usuario -->|INICIA| PRO_P3_navegar_strip
  PRO_P3_navegar_strip -->|DERIVA_DE| CAP_strip_tabs
  PRO_P3_navegar_strip -->|DERIVA_DE| CAP_hoja_tabs_mobile
  PRO_P3_navegar_strip -->|DERIVA_DE| CAP_activar_superficie_terminal
  PRO_P3_navegar_strip -->|DERIVA_DE| CAP_nav_mobile_files
  PRO_P3_navegar_strip -->|DERIVA_DE| CAP_tab_archivos_vinculado
  PRO_P3_navegar_strip -->|APLICA| REG_INV11_foco_virtual_local
  PRO_P3_navegar_strip -->|APLICA| REG_INV07_foco_compartido
  PRO_P3_navegar_strip -->|APLICA| REG_INV09_limpieza_vinculo_refresh
  PRO_P3_navegar_strip -->|APLICA| REG_id_virtual_fuera_de_herdr
  PRO_P3_navegar_strip -->|APLICA| REG_INV05_guarda_foco_terminal
  PRO_P3_navegar_strip -->|ACCEDE| ENT_vinculo_tab_archivos
  ACT_usuario -->|INICIA| PRO_P4_cerrar
  ACT_usuario -->|INICIA| PRO_P5_inspector_sin_files
  PRO_P4_cerrar -->|DERIVA_DE| CAP_ciclo_vida_tabs
  PRO_P4_cerrar -->|DERIVA_DE| CAP_guarda_foco_terminal
  PRO_P4_cerrar -->|DERIVA_DE| CAP_activar_superficie_terminal
  PRO_P5_inspector_sin_files -->|DERIVA_DE| CAP_abrir_inspector
  PRO_P5_inspector_sin_files -->|DERIVA_DE| CAP_preferencias_inspector
  PRO_P5_inspector_sin_files -->|DERIVA_DE| CAP_tipo_inspector_view
  PRO_P5_inspector_sin_files -->|DERIVA_DE| CAP_foco_compartido_inspector
  PRO_P4_cerrar -->|APLICA| REG_INV09_limpieza_vinculo_refresh
  PRO_P4_cerrar -->|APLICA| REG_INV11_foco_virtual_local
  PRO_P4_cerrar -->|APLICA| REG_id_virtual_fuera_de_herdr
  PRO_P4_cerrar -->|APLICA| REG_cierre_consola_cierra_archivos
  PRO_P4_cerrar -->|APLICA| REG_INV05_guarda_foco_terminal
  PRO_P5_inspector_sin_files -->|APLICA| REG_INV07_foco_compartido
  PRO_P5_inspector_sin_files -->|APLICA| REG_INV02_reset_por_generacion
  PRO_P5_inspector_sin_files -->|APLICA| REG_saneo_view_files
  PRO_P4_cerrar -->|ACCEDE| ENT_vinculo_tab_archivos
  PRO_P4_cerrar -->|ACCEDE| ENT_pestanas_por_vinculo
  PRO_P5_inspector_sin_files -->|ACCEDE| ENT_preferencias_inspector
  PRO_P1_abrir_enfocar -->|APLICA| REG_sync_storage_panel
  PRO_P1_abrir_enfocar -->|APLICA| REG_reset_sesion_panel_generacion
  PRO_P4_cerrar -->|APLICA| REG_sync_storage_panel
  PRO_P1_abrir_enfocar -->|TRANSICION| PRO_explorar_archivos
  PRO_P1_abrir_enfocar -->|TRANSICION| PRO_P3_navegar_strip
  PRO_explorar_archivos -->|TRANSICION| PRO_P5_inspector_sin_files
  PRO_P5_inspector_sin_files -->|TRANSICION| PRO_P1_abrir_enfocar
  PRO_P3_navegar_strip -->|TRANSICION| PRO_P4_cerrar
  ESC_P1_crear_en_subdir -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P1_reusar_existente -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P1_otro_workspace -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P1_desde_changes -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P1_cwd_fuera_de_raiz -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P2_dos_consolas_aisladas -->|VERIFICA| PRO_explorar_archivos
  ESC_P2_rehidratar -->|VERIFICA| PRO_explorar_archivos
  ESC_P2_ver_cambios -->|VERIFICA| PRO_explorar_archivos
  ESC_P3_orden_y_atajos -->|VERIFICA| PRO_P3_navegar_strip
  ESC_P3_foco_externo_shared -->|VERIFICA| PRO_P3_navegar_strip
  ESC_P3_mobile_nav -->|VERIFICA| PRO_P3_navegar_strip
  ESC_P4_cierre_externo -->|VERIFICA| PRO_P4_cerrar
  ESC_P4_ctrl_alt_w -->|VERIFICA| PRO_P4_cerrar
  ESC_P4_esc_cascada -->|VERIFICA| PRO_P4_cerrar
  ESC_P4_recarga_y_reinicio -->|VERIFICA| PRO_P4_cerrar
  ESC_P5_saneo_view_files -->|VERIFICA| PRO_P5_inspector_sin_files
  ESC_P5_worktree_files -->|VERIFICA| PRO_P5_inspector_sin_files
  ESC_P5_toggle_sin_files -->|VERIFICA| PRO_P5_inspector_sin_files
  PRO_P3_navegar_strip -->|LLEGA_POR| PAN_panel_files
  PRO_P4_cerrar -->|LLEGA_POR| PAN_panel_files
  PRO_P5_inspector_sin_files -->|LLEGA_POR| PAN_inspector
  PRO_P1_abrir_enfocar -->|APLICA| REG_link_resuelve_pane_dueno
  PRO_P1_abrir_enfocar -->|APLICA| REG_files_toggle
  PRO_P1_abrir_enfocar -->|APLICA| REG_merge_por_owner
  PRO_P1_abrir_enfocar -->|APLICA| REG_barrera_primer_snapshot
  PRO_P3_navegar_strip -->|APLICA| REG_drop_hover_activa_consola
  PRO_explorar_archivos -->|APLICA| REG_anotaciones_conservadas
  PRO_P4_cerrar -->|APLICA| REG_merge_por_owner
  PRO_P4_cerrar -->|APLICA| REG_cuota_y_barrido
  PRO_P4_cerrar -->|APLICA| REG_barrera_primer_snapshot
  ESC_P1_link_consola_no_activa -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P1_files_toggle_doble -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P1_dos_pestanas_navegador -->|VERIFICA| PRO_P1_abrir_enfocar
  ESC_P2_anotacion_sobrevive -->|VERIFICA| PRO_explorar_archivos
  ESC_P3_drag_ruta_a_terminal -->|VERIFICA| PRO_P3_navegar_strip
  ESC_P4_snapshot_retrasado -->|VERIFICA| PRO_P4_cerrar
  ESC_P4_barrido_huerfanos -->|VERIFICA| PRO_P4_cerrar
```

| Nodo | Tipo | Rol | Origen | Cita |
|---|---|---|---|---|
| CAP_vista_files_inspector | capacidad | consume | 20261007-file-manager-panel#CAP_vista_files_inspector | web/src/components/WorkspaceInspectorHost.tsx:677 |
| CAP_bloque_files | capacidad | consume | 20261007-file-manager-panel#CAP_bloque_files | sin cita |
| CAP_panel_files | capacidad | consume | 20261007-file-manager-panel#CAP_panel_files | sin cita |
| CAP_explorador_archivos | capacidad | consume | 20261007-file-manager-panel#CAP_explorador_archivos | web/src/components/FileExplorerDialog.tsx:139 |
| CAP_pestanas_preview | capacidad | consume | 20261007-file-manager-panel#CAP_pestanas_preview | web/src/components/FilePreviewTabs.tsx:6 |
| CAP_visor_diffs_changes | capacidad | consume | 20261007-file-manager-panel#CAP_visor_diffs_changes | web/src/components/WorkspaceInspectorHost.tsx:772 |
| CAP_contrato_backend_archivos | capacidad | consume | 20261007-file-manager-panel#CAP_contrato_backend_archivos | server/src/workspace/files.ts:63 |
| CAP_abrir_inspector | capacidad | consume | 20261007-file-manager-panel#CAP_abrir_inspector | web/src/App.tsx:1738 |
| CAP_abrir_file_explorer | capacidad | consume | 20261007-file-manager-panel#CAP_abrir_file_explorer | web/src/App.tsx:2154 |
| CAP_atajo_files_toggle | capacidad | consume | 20261007-file-manager-panel#CAP_atajo_files_toggle | web/src/shortcutBindings.ts:48 |
| CAP_preferencias_inspector | capacidad | consume | 20261007-file-manager-panel#CAP_preferencias_inspector | web/src/workspaceResource.ts:294 |
| CAP_tipo_inspector_view | capacidad | consume | 20261007-file-manager-panel#CAP_tipo_inspector_view | web/src/workspaceResource.ts:7 |
| CAP_guarda_foco_terminal | capacidad | consume | 20261007-file-manager-panel#CAP_guarda_foco_terminal | web/src/terminalFocus.ts:12 |
| CAP_activar_superficie_terminal | capacidad | consume | 20261007-file-manager-panel#CAP_activar_superficie_terminal | web/src/App.tsx:1645 |
| CAP_nav_mobile_files | capacidad | consume | 20261007-file-manager-panel#CAP_nav_mobile_files | web/src/App.tsx:3982 |
| CAP_foco_compartido_inspector | capacidad | consume | 20261007-file-manager-panel#CAP_foco_compartido_inspector | web/src/App.tsx:1829 |
| REST_panel_hermano_superficies | restriccion | consume | 20261007-file-manager-panel#REST_panel_hermano_superficies | web/src/App.tsx:4195 |
| REST_estado_por_conexion | restriccion | consume | 20261007-file-manager-panel#REST_estado_por_conexion | web/src/connectionStorage.ts:42 |
| REST_foco_rpc_herdr | restriccion | consume | 20261007-file-manager-panel#REST_foco_rpc_herdr | web/src/store.ts:2627 |
| REST_mobile_view_cerrada | restriccion | consume | 20261007-file-manager-panel#REST_mobile_view_cerrada | web/src/App.tsx:349 |
| ACT_usuario | actor | consume | 20261007-file-manager-panel#ACT_usuario | README.md:10 |
| PRO_explorar_archivos | proceso | construye | 20261007-file-manager-panel#PRO_explorar_archivos | sin cita |
| PAN_panel_files | pantalla | construye | 20261007-file-manager-panel#PAN_panel_files | sin cita |
| ENT_preferencias_inspector | entidad | construye | 20261007-file-manager-panel#ENT_preferencias_inspector | web/src/workspaceResource.ts:108 |
| ENT_resource_file_tabs | entidad | construye | 20261007-file-manager-panel#ENT_resource_file_tabs | web/src/workspaceResource.ts:366 |
| ENT_estado_panel_files | entidad | construye | 20261007-file-manager-panel#ENT_estado_panel_files | sin cita |
| DEC_opcion_b_mover | decision | consume | 20261007-file-manager-panel#DEC_opcion_b_mover | sin cita |
| PRG_D2_foco_shared | pregunta | consume | 20261007-file-manager-panel#PRG_D2_foco_shared | sin cita |
| PRG_D3_tipo_files | pregunta | consume | 20261007-file-manager-panel#PRG_D3_tipo_files | sin cita |
| PRG_D4_migracion_prefs | pregunta | consume | 20261007-file-manager-panel#PRG_D4_migracion_prefs | sin cita |
| PRG_D5_seguir_workspace | pregunta | consume | 20261007-file-manager-panel#PRG_D5_seguir_workspace | sin cita |
| PRG_D6_descubribilidad | pregunta | consume | 20261007-file-manager-panel#PRG_D6_descubribilidad | sin cita |
| PRG_D7_layout | pregunta | consume | 20261007-file-manager-panel#PRG_D7_layout | sin cita |
| PRG_D8_subvista_cambios | pregunta | consume | 20261007-file-manager-panel#PRG_D8_subvista_cambios | sin cita |
| PRG_D9_mobile | pregunta | consume | 20261007-file-manager-panel#PRG_D9_mobile | sin cita |
| PRG_D10_estado_panel | pregunta | consume | 20261007-file-manager-panel#PRG_D10_estado_panel | sin cita |
| PRG_esc_cierra_panel | pregunta | consume | 20261007-file-manager-panel#PRG_esc_cierra_panel | sin cita |
| DEC_freno_operaciones_archivo | decision | consume | 20261007-file-manager-panel#DEC_freno_operaciones_archivo | sin cita |
| DEC_freno_coexistir | decision | consume | 20261007-file-manager-panel#DEC_freno_coexistir | sin cita |
| REG_INV01_gating_seleccion_scope | regla | construye | 20261007-file-manager-panel#REG_INV01_gating_seleccion_scope | web/src/App.tsx:1478 |
| REG_INV02_reset_por_generacion | regla | construye | 20261007-file-manager-panel#REG_INV02_reset_por_generacion | web/src/App.tsx:2769 |
| REG_INV03_remontaje_por_scope | regla | construye | 20261007-file-manager-panel#REG_INV03_remontaje_por_scope | web/src/App.tsx:4253 |
| REG_INV04_raiz_pane_enfocado | regla | construye | 20261007-file-manager-panel#REG_INV04_raiz_pane_enfocado | server/src/workspace/files.ts:89 |
| REG_INV05_guarda_foco_terminal | regla | construye | 20261007-file-manager-panel#REG_INV05_guarda_foco_terminal | web/src/terminalFocus.ts:12 |
| REG_INV06_popover_anotaciones | regla | construye | 20261007-file-manager-panel#REG_INV06_popover_anotaciones | web/src/components/AnnotationComposerPopover.tsx:88 |
| REG_INV07_foco_compartido | regla | construye | 20261007-file-manager-panel#REG_INV07_foco_compartido | web/src/App.tsx:1829 |
| REG_INV08_subvista_cambios | regla | construye | 20261007-file-manager-panel#REG_INV08_subvista_cambios | web/src/components/WorkspaceInspectorHost.tsx:772 |
| PRG_abrir_desde_changes | pregunta | consume | 20261007-file-manager-panel#PRG_abrir_desde_changes | sin cita |
| RSG_tamano_inspector_ignora_panel | riesgo | consume | 20261007-file-manager-panel#RSG_tamano_inspector_ignora_panel | sin cita |
| RSG_inspector_overlay_mas_frecuente | riesgo | consume | 20261007-file-manager-panel#RSG_inspector_overlay_mas_frecuente | sin cita |
| RSG_pares_estrechos_recorte | riesgo | consume | 20261007-file-manager-panel#RSG_pares_estrechos_recorte | sin cita |
| RSG_esc_global_extraido | riesgo | consume | 20261007-file-manager-panel#RSG_esc_global_extraido | sin cita |
| DEC_migracion_prefs_una_vez | decision | consume | 20261007-file-manager-panel#DEC_migracion_prefs_una_vez | sin cita |
| DEC_persistencia_panel_por_scope | decision | consume | 20261007-file-manager-panel#DEC_persistencia_panel_por_scope | sin cita |
| DEC_estado_panel_modulo_nuevo | decision | consume | 20261007-file-manager-panel#DEC_estado_panel_modulo_nuevo | sin cita |
| DEC_freno_mover_resource_file_tabs | decision | consume | 20261007-file-manager-panel#DEC_freno_mover_resource_file_tabs | sin cita |
| REG_sync_storage_panel | regla | construye | 20261007-file-manager-panel#REG_sync_storage_panel | sin cita |
| REG_reset_sesion_panel_generacion | regla | construye | 20261007-file-manager-panel#REG_reset_sesion_panel_generacion | sin cita |
| DEC_opcion_a1_tab_vinculado | decision | consume | 20261007-file-manager-panel#DEC_opcion_a1_tab_vinculado | sin cita |
| DEC_raiz_cwd_pane_enfocado | decision | consume | 20261007-file-manager-panel#DEC_raiz_cwd_pane_enfocado | sin cita |
| DEC_cierre_con_consola | decision | consume | 20261007-file-manager-panel#DEC_cierre_con_consola | sin cita |
| DEC_siempre_ligado_activo | decision | consume | 20261007-file-manager-panel#DEC_siempre_ligado_activo | sin cita |
| CAP_tab_archivos_vinculado | capacidad | consume | 20261007-file-manager-panel#CAP_tab_archivos_vinculado | sin cita |
| CAP_directorio_inicial_pane | capacidad | consume | 20261007-file-manager-panel#CAP_directorio_inicial_pane | web/src/App.tsx:2405 |
| CAP_strip_tabs | capacidad | consume | 20261007-file-manager-panel#CAP_strip_tabs | web/src/components/TabBar.tsx:69 |
| CAP_ciclo_vida_tabs | capacidad | consume | 20261007-file-manager-panel#CAP_ciclo_vida_tabs | web/src/store.ts:2709 |
| CAP_hoja_tabs_mobile | capacidad | consume | 20261007-file-manager-panel#CAP_hoja_tabs_mobile | web/src/components/MobileTabSheet.tsx:23 |
| REST_strip_tabs_herdr | restriccion | consume | 20261007-file-manager-panel#REST_strip_tabs_herdr | web/src/types.ts:66 |
| PRG_vinculo_persistencia | pregunta | consume | 20261007-file-manager-panel#PRG_vinculo_persistencia | sin cita |
| PRG_cwd_fuera_de_raiz | pregunta | consume | 20261007-file-manager-panel#PRG_cwd_fuera_de_raiz | sin cita |
| RSG_cerrar_tab_oculto | riesgo | consume | 20261007-file-manager-panel#RSG_cerrar_tab_oculto | sin cita |
| RSG_reorden_indice_cero | riesgo | consume | 20261007-file-manager-panel#RSG_reorden_indice_cero | sin cita |
| RSG_pin_virtual | riesgo | consume | 20261007-file-manager-panel#RSG_pin_virtual | sin cita |
| RSG_strip_mobile_un_tab | riesgo | consume | 20261007-file-manager-panel#RSG_strip_mobile_un_tab | sin cita |
| ENT_vinculo_tab_archivos | entidad | construye | 20261007-file-manager-panel#ENT_vinculo_tab_archivos | sin cita |
| REG_INV09_limpieza_vinculo_refresh | regla | construye | 20261007-file-manager-panel#REG_INV09_limpieza_vinculo_refresh | web/src/store.ts:1352 |
| REG_INV11_foco_virtual_local | regla | construye | 20261007-file-manager-panel#REG_INV11_foco_virtual_local | web/src/store.ts:2627 |
| REG_idempotencia_abrir_tab_archivos | regla | construye | 20261007-file-manager-panel#REG_idempotencia_abrir_tab_archivos | sin cita |
| PRG_pin_tab_archivos | pregunta | consume | 20261007-file-manager-panel#PRG_pin_tab_archivos | sin cita |
| PRG_cambio_workspace_activo | pregunta | consume | 20261007-file-manager-panel#PRG_cambio_workspace_activo | sin cita |
| PRG_identidad_orden_virtual | pregunta | consume | 20261007-file-manager-panel#PRG_identidad_orden_virtual | sin cita |
| PRG_estado_explorador_remontaje | pregunta | consume | 20261007-file-manager-panel#PRG_estado_explorador_remontaje | sin cita |
| DEC_vinculo_localstorage_validado | decision | consume | 20261007-file-manager-panel#DEC_vinculo_localstorage_validado | sin cita |
| DEC_estado_por_vinculo_rehidratado | decision | consume | 20261007-file-manager-panel#DEC_estado_por_vinculo_rehidratado | sin cita |
| DEC_estado_tab_modulo_nuevo | decision | consume | 20261007-file-manager-panel#DEC_estado_tab_modulo_nuevo | sin cita |
| ENT_pestanas_por_vinculo | entidad | construye | 20261007-file-manager-panel#ENT_pestanas_por_vinculo | sin cita |
| DEC_D6_boton_y_menu | decision | consume | 20261007-file-manager-panel#DEC_D6_boton_y_menu | sin cita |
| PRO_P1_abrir_enfocar | proceso | construye | 20261007-file-manager-panel#PRO_P1_abrir_enfocar | sin cita |
| REG_P1_raiz_al_crear | regla | construye | 20261007-file-manager-panel#REG_P1_raiz_al_crear | sin cita |
| REG_cwd_fuera_raiz_abre_raiz | regla | construye | 20261007-file-manager-panel#REG_cwd_fuera_raiz_abre_raiz | web/src/workspaceResource.ts:220 |
| DEC_P1_otro_ws_enfocar | decision | consume | 20261007-file-manager-panel#DEC_P1_otro_ws_enfocar | sin cita |
| DEC_P1_changes_cierra_inspector | decision | consume | 20261007-file-manager-panel#DEC_P1_changes_cierra_inspector | sin cita |
| DEC_P1_cwd_fuera_raiz | decision | consume | 20261007-file-manager-panel#DEC_P1_cwd_fuera_raiz | sin cita |
| DEC_D8_inspector_changes | decision | consume | 20261007-file-manager-panel#DEC_D8_inspector_changes | sin cita |
| REG_rehidratar_al_remontar | regla | construye | 20261007-file-manager-panel#REG_rehidratar_al_remontar | sin cita |
| PRO_P3_navegar_strip | proceso | construye | 20261007-file-manager-panel#PRO_P3_navegar_strip | sin cita |
| DEC_P3_pegado_a_consola | decision | consume | 20261007-file-manager-panel#DEC_P3_pegado_a_consola | sin cita |
| DEC_P3_atajos_solo_consolas | decision | consume | 20261007-file-manager-panel#DEC_P3_atajos_solo_consolas | sin cita |
| DEC_P3_foco_externo_manda | decision | consume | 20261007-file-manager-panel#DEC_P3_foco_externo_manda | sin cita |
| DEC_P3_sin_pin_propio | decision | consume | 20261007-file-manager-panel#DEC_P3_sin_pin_propio | sin cita |
| DEC_D9_nav_mobile | decision | consume | 20261007-file-manager-panel#DEC_D9_nav_mobile | sin cita |
| DEC_D2_foco_local | decision | consume | 20261007-file-manager-panel#DEC_D2_foco_local | sin cita |
| REG_id_virtual_fuera_de_herdr | regla | construye | 20261007-file-manager-panel#REG_id_virtual_fuera_de_herdr | sin cita |
| PRO_P4_cerrar | proceso | construye | 20261007-file-manager-panel#PRO_P4_cerrar | sin cita |
| PRO_P5_inspector_sin_files | proceso | construye | 20261007-file-manager-panel#PRO_P5_inspector_sin_files | sin cita |
| DEC_esc_cascada_vuelve_consola | decision | consume | 20261007-file-manager-panel#DEC_esc_cascada_vuelve_consola | sin cita |
| DEC_ctrl_alt_w_cierra_tab_archivos | decision | consume | 20261007-file-manager-panel#DEC_ctrl_alt_w_cierra_tab_archivos | sin cita |
| DEC_D3_quitar_files_inspector_view | decision | consume | 20261007-file-manager-panel#DEC_D3_quitar_files_inspector_view | sin cita |
| REG_cierre_consola_cierra_archivos | regla | construye | 20261007-file-manager-panel#REG_cierre_consola_cierra_archivos | sin cita |
| REG_saneo_view_files | regla | construye | 20261007-file-manager-panel#REG_saneo_view_files | sin cita |
| PAN_inspector | pantalla | construye | 20261007-file-manager-panel#PAN_inspector | sin cita |
| ESC_P1_crear_en_subdir | escenario | consume | 20261007-file-manager-panel#ESC_P1_crear_en_subdir | sin cita |
| ESC_P1_reusar_existente | escenario | consume | 20261007-file-manager-panel#ESC_P1_reusar_existente | sin cita |
| ESC_P1_otro_workspace | escenario | consume | 20261007-file-manager-panel#ESC_P1_otro_workspace | sin cita |
| ESC_P1_desde_changes | escenario | consume | 20261007-file-manager-panel#ESC_P1_desde_changes | sin cita |
| ESC_P1_cwd_fuera_de_raiz | escenario | consume | 20261007-file-manager-panel#ESC_P1_cwd_fuera_de_raiz | sin cita |
| ESC_P2_dos_consolas_aisladas | escenario | consume | 20261007-file-manager-panel#ESC_P2_dos_consolas_aisladas | sin cita |
| ESC_P2_rehidratar | escenario | consume | 20261007-file-manager-panel#ESC_P2_rehidratar | sin cita |
| ESC_P2_ver_cambios | escenario | consume | 20261007-file-manager-panel#ESC_P2_ver_cambios | sin cita |
| ESC_P3_orden_y_atajos | escenario | consume | 20261007-file-manager-panel#ESC_P3_orden_y_atajos | sin cita |
| ESC_P3_foco_externo_shared | escenario | consume | 20261007-file-manager-panel#ESC_P3_foco_externo_shared | sin cita |
| ESC_P3_mobile_nav | escenario | consume | 20261007-file-manager-panel#ESC_P3_mobile_nav | sin cita |
| ESC_P4_cierre_externo | escenario | consume | 20261007-file-manager-panel#ESC_P4_cierre_externo | sin cita |
| ESC_P4_ctrl_alt_w | escenario | consume | 20261007-file-manager-panel#ESC_P4_ctrl_alt_w | sin cita |
| ESC_P4_esc_cascada | escenario | consume | 20261007-file-manager-panel#ESC_P4_esc_cascada | sin cita |
| ESC_P4_recarga_y_reinicio | escenario | consume | 20261007-file-manager-panel#ESC_P4_recarga_y_reinicio | sin cita |
| ESC_P5_saneo_view_files | escenario | consume | 20261007-file-manager-panel#ESC_P5_saneo_view_files | sin cita |
| ESC_P5_worktree_files | escenario | consume | 20261007-file-manager-panel#ESC_P5_worktree_files | sin cita |
| ESC_P5_toggle_sin_files | escenario | consume | 20261007-file-manager-panel#ESC_P5_toggle_sin_files | sin cita |
| DEC_R1_link_pane_dueno | decision | consume | 20261007-file-manager-panel#DEC_R1_link_pane_dueno | sin cita |
| DEC_R2_drag_hover_strip | decision | consume | 20261007-file-manager-panel#DEC_R2_drag_hover_strip | sin cita |
| DEC_R3_files_toggle_real | decision | consume | 20261007-file-manager-panel#DEC_R3_files_toggle_real | sin cita |
| REG_link_resuelve_pane_dueno | regla | construye | 20261007-file-manager-panel#REG_link_resuelve_pane_dueno | sin cita |
| REG_drop_hover_activa_consola | regla | construye | 20261007-file-manager-panel#REG_drop_hover_activa_consola | sin cita |
| REG_files_toggle | regla | construye | 20261007-file-manager-panel#REG_files_toggle | sin cita |
| REG_anotaciones_conservadas | regla | construye | 20261007-file-manager-panel#REG_anotaciones_conservadas | sin cita |
| REG_merge_por_owner | regla | construye | 20261007-file-manager-panel#REG_merge_por_owner | sin cita |
| REG_barrera_primer_snapshot | regla | construye | 20261007-file-manager-panel#REG_barrera_primer_snapshot | sin cita |
| REG_cuota_y_barrido | regla | construye | 20261007-file-manager-panel#REG_cuota_y_barrido | sin cita |
| ESC_P1_link_consola_no_activa | escenario | consume | 20261007-file-manager-panel#ESC_P1_link_consola_no_activa | sin cita |
| ESC_P1_files_toggle_doble | escenario | consume | 20261007-file-manager-panel#ESC_P1_files_toggle_doble | sin cita |
| ESC_P1_dos_pestanas_navegador | escenario | consume | 20261007-file-manager-panel#ESC_P1_dos_pestanas_navegador | sin cita |
| ESC_P2_anotacion_sobrevive | escenario | consume | 20261007-file-manager-panel#ESC_P2_anotacion_sobrevive | sin cita |
| ESC_P3_drag_ruta_a_terminal | escenario | consume | 20261007-file-manager-panel#ESC_P3_drag_ruta_a_terminal | sin cita |
| ESC_P4_snapshot_retrasado | escenario | consume | 20261007-file-manager-panel#ESC_P4_snapshot_retrasado | sin cita |
| ESC_P4_barrido_huerfanos | escenario | consume | 20261007-file-manager-panel#ESC_P4_barrido_huerfanos | sin cita |

**Frontera** — lo que cruza hacia otros works:

_(ninguna: este work no intercambia datos con otros)_
<!-- modelo:end -->

## Decisiones clave

| Fecha | Decision | Razon | Decidio |
|---|---|---|---|
| 2026-10-12 | Elevar a Winston el plan E2 | Cambia frontera de modulo: Files sale del Inspector y nace filesTabResource.ts | anfitrion |
| 2026-10-12 | T-009: el tab de archivos comparte el lazy boundary del Inspector | Presupuesto de assets 160/160 sin tocar el bundle inicial | anfitrion |
| 2026-10-12 | [OVERRIDE] Levantar el freno DEC_freno_operaciones_archivo solo para la raiz del explorador: file.* acepta la consola duena (sin operaciones nuevas) y se agrega T-010 en este work, sin retroceso a diseno | H-E4-01: en workspaces sin worktree la raiz sigue al pane enfocado del workspace (server/src/workspace/files.ts:79-95) y contradice la intencion del diseno | usuario |

## Tareas

| T | Titulo | Status | Verif | Tags |
|---|--------|--------|-------|------|

## Iteraciones

| # | Fecha | Accion | Desde etapa | Hacia etapa | Razon |
|---|-------|--------|-------------|-------------|-------|

## Pausas

| Fecha inicio | Etapa | Razon | Fecha reanudacion |
|--------------|-------|-------|--------------------|

## Archivos modificados

<!-- Se llena al cierre del work con git diff. -->

## Cierre

