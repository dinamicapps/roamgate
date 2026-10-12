---
aprobado_por_usuario: true
brief_version: 1
diseno_slug: 20261007-file-manager-panel
fecha_aprobacion: "2026-10-11"
file_type: diseno-brief
hallazgos_aplicados: []
---
# Brief: Tab de archivos vinculado a la consola

> Brief vivo. Cuando un work emite un hallazgo y Mary lo mitiga, este archivo se modifica con marca inline `<!-- HZ-NNN -->` en la linea afectada.

## Resumen ejecutivo

Hoy el explorador de archivos de Roamgate vive como una vista del Inspector, un panel lateral que le quita espacio a la consola y que no sabe desde que consola se abrio. Con este cambio, cada consola puede tener su propio tab de archivos: aparece en la barra de tabs, justo al lado de su consola, ocupa toda la superficie cuando esta activo y arranca en la carpeta donde estaba trabajando esa consola. Si el usuario vuelve a pedir los archivos de la misma consola, Roamgate lo lleva al tab que ya existe en lugar de abrir otro.

El tab de archivos acompana a su consola durante toda su vida: se mueve con ella en la barra, recuerda que archivos estaban abiertos al ir y volver, sobrevive a recargar el navegador y desaparece cuando la consola se cierra, aunque se cierre desde la terminal de Herdr o desde otro navegador. El Inspector se queda con lo que le es propio: Changes, Commits e History. Para no perder la puerta de entrada, aparece un boton Files en la barra de tabs y una opcion "Abrir archivos de esta consola" en el menu de cada consola; los atajos, la paleta, la navegacion mobile y los links siguen funcionando, ahora hacia el tab.

El cambio es solo del cliente web: Herdr no se modifica y el tab de archivos es invisible para el. No se agregan operaciones nuevas sobre archivos.

## Pipeline

Ver `pipeline.md` para el diagrama integrador. Resumen de procesos:

| ID | Proceso | Actor | Trigger |
|----|---------|-------|---------|
| P1 | Abrir o enfocar el tab de archivos de la consola activa | Usuario | cualquier entrada a Files (boton, menu de consola, atajo, paleta, nav mobile, arbol, worktree, link, Changes) |
| P2 | Explorar y previsualizar dentro del tab | Usuario | navegar el arbol o abrir/cerrar archivos con el tab activo |
| P3 | Moverse entre consolas y tab de archivos en el strip | Usuario | clic en el strip, atajos, nav mobile o foco externo |
| P4 | Cerrar el tab de archivos o su consola | Usuario | cierre del tab, Esc, Ctrl+Alt+W, cierre local o externo de la consola |
| P5 | Abrir el Inspector sin Files | Usuario | abrir el Inspector para Changes, Commits o History |

Cadena: P1 inicia; P1 -> P2 (vinculo activo y su scope), P1 -> P3 (superficie activa), P2 -> P5 (ver cambios), P5 -> P1 (abrir archivo desde Changes), P3 -> P4; P4 cierra.

## Procesos detallados

Cada proceso tiene su contrato en `procesos/P{n}-*.md`.

### P1 — Abrir o enfocar el tab de archivos de la consola activa

Todas las entradas convergen aqui. Si la consola ya tiene vinculo se enfoca su tab; si no, se crea con el directorio inicial calculado una sola vez desde el cwd del pane enfocado, relativo a la raiz del checkout (en la raiz si el cwd esta fuera). Es idempotente por (connectionId, generation, ownerTabId). Un link de terminal resuelve la consola duena desde el pane que lo emitio, aunque no sea la activa. Ctrl+Alt+E es un toggle: con el tab visible vuelve a la consola. Activar el tab no emite foco a Herdr; solo una entrada sobre otro workspace lo enfoca antes, como hoy. Abrir desde Changes cierra el Inspector. Los vinculos persistidos no se muestran antes del primer snapshot y se escriben con merge por consola.

### P2 — Explorar y previsualizar dentro del tab

Reutiliza el bloque Files extraido del Inspector (N1) sin cambiar su comportamiento, incluidas las anotaciones (lectura, creacion, reanclaje). Las pestanas, la seleccion y el preview son propios del vinculo y se rehidratan al volver a un tab desmontado. Ver los cambios de un archivo abre el Inspector en Changes al costado.

### P3 — Moverse entre consolas y tab de archivos en el strip

El tab de archivos va pegado a la derecha de su consola, no recibe numero en Ctrl+1..9, no tiene pin propio y su id virtual nunca llega a Herdr ni a tabPins.v1. Ante foco externo o cambio de workspace se muestra la consola enfocada. Arrastrar una ruta y mantenerla sobre el tab de una consola la activa para soltar en su terminal. En mobile alternan los botones Files y Terminal de la nav; el tab no cuenta para mostrar el strip ni se lista en MobileTabSheet.

### P4 — Cerrar el tab de archivos o su consola

El tab de archivos se cierra solo, nunca arrastra a la consola; la consola si arrastra a su tab, sea el cierre local (closeTab) o externo (reconciliacion con el snapshot). Esc despeja lo transitorio y luego vuelve a la consola sin cerrar el tab, y nunca se escucha en window. Ctrl+Alt+W con el tab activo cierra solo el tab. Cada vinculo guarda como maximo 20 pestanas y la reconciliacion barre claves huerfanas.

### P5 — Abrir el Inspector sin Files

InspectorView pierde el miembro files; las preferencias con view files se sanean a changes al leer; el ciclo de vida de worktrees abre el tab de archivos en lugar del Inspector. Los efectos de foco del Inspector no cambian.

## Reglas heredadas globales

Aplican a dos o mas procesos. Fuente: nodos `regla` heredada del modelo (`agentos modelo proyectar --slug 20261007-file-manager-panel --vista reglas-heredadas`).

- INV-PUENTE-01 — gating de seleccion por el scope del vinculo: `web/src/App.tsx:1478` (P1, P2).
- INV-PUENTE-02 — reset de estado de sesion por generacion: `web/src/App.tsx:2769` (P1, P5).
- INV-PUENTE-05 — la superficie se agrega a la guarda de foco de la terminal: `web/src/terminalFocus.ts:12` (P1, P3, P4).
- INV-PUENTE-07 — en shared el foco del Inspector es RPC a Herdr; el tab no emite foco salvo al enfocar otro workspace: `web/src/App.tsx:1829` (P1, P3, P5).
- INV-PUENTE-09 — reconciliar vinculos contra los tab_id vivos del snapshot: `web/src/store.ts:1352` (P3, P4).
- INV-PUENTE-11 — activar o cerrar el tab no redefine el foco de Herdr: `web/src/store.ts:2627` (P1, P3, P4).

## Reglas nuevas globales

- REG_id_virtual_fuera_de_herdr — el id virtual files:{ownerTabId} nunca llega a tab.move, tab.close, tab.focus, tab.rename ni a tabPins.v1 (P3, P4).
- REG_sync_storage_panel — suscripcion a filesTabLinks y filesTabFiles:{ownerTabId} para sincronizar pestanas del navegador (P1, P4).
- REG_merge_por_owner — filesTabLinks se escribe con lectura-merge-escritura por ownerTabId; las bajas solo por cierre o reconciliacion (P1, P4).
- REG_barrera_primer_snapshot — sin primer snapshot vigente no se muestran ni se eliminan vinculos (P1, P4).
- REG_idempotencia_abrir_tab_archivos y REG_cierre_consola_cierra_archivos — juntas garantizan el 1:1 sin huerfanos (P1, P4).

## Decisiones arquitectonicas

- **D-01 Tab virtual del cliente (A1), variante mover.** Alternativas: panel lateral independiente (B, descartado por restar espacio a la consola), tab nativo de Herdr (A2, imposible hasta Herdr v0.9.3), coexistir con el Inspector (descartado por dos escritores de estado). Razon: decision del humano en el regreso del 2026-10-09.
- **D-02 Persistencia del vinculo en localStorage validada por ids vivos.** Alternativa: solo sesion. Razon: sobrevive a recargas sin suponer tab_id estable.
- **D-03 Estado propio por vinculo y modulo nuevo `filesTabResource.ts`.** Alternativas: estado compartido por scope; meterlo en `workspaceResource.ts` (472 lineas, tres responsabilidades). Razon: sin dos escritores y dependencia explicita (aporte de Winston).
- **D-04 El foco de Herdr manda; el tab es superficie local.** Alternativa: mantener el tab visible ante foco externo. Razon: no desincronizar lo visible de la consola activa.
- **D-05 Ver cambios abre el Inspector en Changes.** Alternativa: segundo DiffViewerPanel dentro del tab. Razon: reutilizar sin duplicar estado.

## Restricciones tecnicas

- El modelo `Tab` y los RPC `tab.*` son de Herdr (`web/src/types.ts:66`); el tab de archivos convive sin alterarlos.
- Estado persistido con `connectionStorageKey` (`web/src/connectionStorage.ts:42`): con prefijo por conexion o sin el en `legacy-default`.
- Mobile muestra una superficie a la vez con la union cerrada `MobileView` (`web/src/App.tsx:349`).
- Los tabs inactivos se desmontan (`web/src/App.tsx:1047`): el estado del tab se rehidrata, el host monta con key propia del vinculo.
- Sin libreria de layout; superficies cableadas en `App.tsx`.
- Fuera de alcance: operaciones de archivo nuevas, cambios en Herdr, coexistir.

## Mockups

- Strip, tab de archivos y menu contextual (desktop) y nav mobile: `procesos/P1-abrir-enfocar.md`, `procesos/P2-explorar-previsualizar.md`, `procesos/P3-navegar-strip.md`, seccion Mockup.
- Inspector sin Files: `procesos/P5-inspector-sin-files.md`, seccion Mockup.

## Capa de datos

Ver `datos.md` (Dexter, `persistencia_resuelta: true`): `ENT_vinculo_tab_archivos` (filesTabLinks), `ENT_pestanas_por_vinculo` (filesTabFiles:{ownerTabId}), preferencias del Inspector saneadas y `workspaceInspectorFile:{owner}` como legado de solo lectura.

## Capa criptografica

No aplica: step-03b omitido dos veces (2026-10-09 y 2026-10-10, ver `bitacora.md`) tras revisar el modelo; ningun nodo toca firma, cifrado, llaves ni hashing.

## Discovery (referencia)

Vive en `modelo.yml`. Para leerlo en prosa: `agentos modelo proyectar --slug 20261007-file-manager-panel --vista discovery`.

## Primer paso de implementacion

N1: extraer de `WorkspaceInspectorHost` el bloque Files (arbol `FileExplorerPanel`, `FilePreviewTabs`, preview y manejo de pestanas) a un componente montable fuera del Inspector, sin cambiar comportamiento ni llevarse `diffViewerRef` (INV-PUENTE-08) ni la escucha global de Esc (`web/src/components/FileExplorerDialog.tsx:689`).

## Capa de seguridad preanunciada

No aplica: no hay endpoints nuevos ni modificados; se usan el contrato `file.*` y los RPC `tab.*` existentes.

| Endpoint/metodo | Naturaleza | Permiso propuesto |
|-----------------|------------|-------------------|
| (ninguno) | - | - |

## Hallazgos aplicados

| HZ-NNN | Fecha aplicado | Brief version resultante | Resumen |
|--------|----------------|---------------------------|---------|

## Red team review

TR-02 ejecutado el 2026-10-11 por motor independiente (Codex, tarea task-mv3df8ne-q9z6lm, sin permiso de escritura). Denominador: 5 procesos, 5 contratos, 19 reglas, 18 escenarios. Resultado: 0 criticos, 3 mayores, 5 medios. El humano acepto las soluciones propuestas (camino A).

### Ronda 1 — Funcional
- [Añadir] Link desde una consola no activa: P1 resuelve la consola duena desde el pane de origen (REG_link_resuelve_pane_dueno, DEC_R1_link_pane_dueno, ESC_P1_link_consola_no_activa).
- [Añadir] Arrastrar rutas a la terminal: mantener el arrastre sobre el tab de la consola la activa (REG_drop_hover_activa_consola, DEC_R2_drag_hover_strip, ESC_P3_drag_ruta_a_terminal).
- [Añadir] files.toggle con el tab visible vuelve a la consola (REG_files_toggle, DEC_R3_files_toggle_real, ESC_P1_files_toggle_doble).
- [Añadir] Anotaciones desde el preview: dependencias conservadas en N1 (REG_anotaciones_conservadas, ESC_P2_anotacion_sobrevive).
- [Cubierto] Quick open, abrir desde Changes, file.reveal, Pane Jump, Zen, compacto y mobile.

### Ronda 2 — Tecnica
- [Añadir] Escrituras concurrentes de filesTabLinks entre pestanas: merge por ownerTabId (REG_merge_por_owner, ESC_P1_dos_pestanas_navegador).
- [Añadir] Barrera antes del primer snapshot (REG_barrera_primer_snapshot, ESC_P4_snapshot_retrasado).
- [Añadir] Cuota y claves huerfanas (REG_cuota_y_barrido, ESC_P4_barrido_huerfanos).
- [Añadir] Matriz de verificacion: seccion "Matriz de verificacion".

### Ronda 3 — Regulatoria
- [Cubierto] Sin endpoints nuevos ni cambio de permisos; solo metadatos locales de UI por conexion; sin dimension criptografica.

## Matriz de verificacion

Tipos: U = unitaria (vitest sobre modulos puros), D = DOM/componente, M = manual guiada con la receta del escenario (E4).

| Area | Reglas | Escenarios | Tipo |
|---|---|---|---|
| Vinculo: crear, enfocar, idempotencia, merge, barrera, poda, cuota | REG_idempotencia_abrir_tab_archivos, REG_merge_por_owner, REG_barrera_primer_snapshot, REG_cuota_y_barrido, INV-09 | ESC_P1_reusar_existente, ESC_P1_dos_pestanas_navegador, ESC_P4_snapshot_retrasado, ESC_P4_barrido_huerfanos, ESC_P4_cierre_externo, ESC_P4_recarga_y_reinicio | U (filesTabResource.test.ts) + M |
| Directorio inicial y raiz | REG_P1_raiz_al_crear, REG_cwd_fuera_raiz_abre_raiz | ESC_P1_crear_en_subdir, ESC_P1_cwd_fuera_de_raiz | U + M |
| Entradas a P1 | REG_link_resuelve_pane_dueno, REG_files_toggle, DEC_P1_otro_ws_enfocar, DEC_P1_changes_cierra_inspector | ESC_P1_link_consola_no_activa, ESC_P1_files_toggle_doble, ESC_P1_otro_workspace, ESC_P1_desde_changes, ESC_P5_worktree_files | D + M |
| Strip, atajos, foco, drag | REG_id_virtual_fuera_de_herdr, REG_drop_hover_activa_consola, INV-11 | ESC_P3_orden_y_atajos, ESC_P3_foco_externo_shared, ESC_P3_drag_ruta_a_terminal | U (tabReorder, tabShortcuts) + D + M |
| Explorar, rehidratar, anotaciones, ver cambios | REG_rehidratar_al_remontar, REG_anotaciones_conservadas, INV-01, INV-06, INV-08 | ESC_P2_dos_consolas_aisladas, ESC_P2_rehidratar, ESC_P2_anotacion_sobrevive, ESC_P2_ver_cambios | D + M |
| Cierre y Esc | REG_cierre_consola_cierra_archivos, DEC_esc_cascada_vuelve_consola, DEC_ctrl_alt_w_cierra_tab_archivos | ESC_P4_ctrl_alt_w, ESC_P4_esc_cascada | D + M |
| Mobile | DEC_D9_nav_mobile | ESC_P3_mobile_nav | M |
| Inspector sin Files | REG_saneo_view_files, DEC_D3_quitar_files_inspector_view | ESC_P5_saneo_view_files, ESC_P5_toggle_sin_files | U (workspaceResource.test.ts) + M |

Pruebas existentes que hay que actualizar: `web/src/workspaceResource.test.ts` (aserciones sobre view files y ratios de Files), `web/src/components/FilePreviewTabs.test.ts` (monta el Inspector), `web/src/store.test.ts` (cierre de tabs y refresh) y las de `tabReorder`/`tabShortcuts` si cambian sus firmas.

Documentacion a actualizar: `FEATURES.md` (Files como vista del Inspector, atajos) y `docs/ARCHITECTURE.md` (estado del Inspector y superficies).
