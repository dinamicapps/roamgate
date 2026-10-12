---
actor: Usuario de Roamgate
diseno_slug: 20261007-file-manager-panel
file_type: diseno-proceso-contrato
hallazgos_aplicados: []
modulo_huesped: web/src
nombre: Explorar y previsualizar archivos dentro del tab
proceso_id: P2
trigger: navegar el arbol o abrir/cerrar archivos con el tab activo
---
# Proceso P2 — Explorar y previsualizar archivos dentro del tab





<!-- nodo: PRO_explorar_archivos -->
Es el trabajo dentro del tab: navegar el arbol, abrir y cerrar pestanas de archivo y previsualizar. Reutiliza el bloque Files extraido del Inspector (N1, CAP_bloque_files) sin cambiar su comportamiento, con dos diferencias: la seleccion y las pestanas pertenecen al vinculo de la consola (no al scope compartido) y ver los cambios de un archivo abre el Inspector en Changes al costado (DEC_D8_inspector_changes). Al volver a un tab desmontado se rehidrata lo que el usuario dejo abierto. Alternativa descartada: diff dentro del tab (duplicaria el visor y su estado).

<!-- nodo: DEC_D8_inspector_changes -->
El humano eligio que ver los cambios de un archivo abra el Inspector en Changes al costado con ese archivo seleccionado. Con el tab de archivos en la superficie central, el Inspector queda libre y reutiliza el DiffViewerPanel sin duplicarlo.

<!-- modelo:start vista=contrato -->
### Actor

- Usuario de Roamgate en el navegador (desktop o mobile) (`ACT_usuario`)

### Trigger

el usuario navega el arbol, abre o cierra una pestana de archivo o pide ver los cambios de un archivo con el tab de archivos activo

### Modulo huesped

`web/src`

### Llegada del actor

- entra por `PAN_panel_files`

### Datos requeridos (entrada)

- vinculo activo (ownerTabId) y su scope
- ruta seleccionada en el arbol o pestana de archivo
- accion: navegar, abrir, cerrar pestana, ver cambios

### Resultado producido (salida)

- seleccion y preview actualizados con gating por el scope del vinculo
- pestanas del vinculo persistidas en filesTabFiles:{ownerTabId}
- Inspector abierto en Changes con el archivo seleccionado cuando se piden sus cambios
- vista pedida (changes, commits, history)

### Reglas que aplica

#### Heredadas

- **REG_INV01_gating_seleccion_scope** — INV-PUENTE-01: la seleccion y vista previa activa solo se aceptan para el scope del Inspector; el tab de archivos necesita su propio gating por el scope de su vinculo (N5)
- **REG_INV02_reset_por_generacion** — INV-PUENTE-02: al avanzar la generacion de la conexion se resetea el estado del Inspector y la seleccion; el estado de sesion del panel debe invalidarse con la misma generacion
- **REG_INV03_remontaje_por_scope** — INV-PUENTE-03: cada superficie se remonta con clave resourceUiKey + owner de SU scope; el tab de archivos monta con key propia del vinculo y puede mostrar un workspace distinto al del Inspector
- **REG_INV04_raiz_pane_enfocado** — INV-PUENTE-04: sin worktree, la raiz del explorador en el backend es el cwd del pane enfocado en Herdr; el directorio inicial del tab se calcula al crear (REG_P1_raiz_al_crear), pero la raiz del backend puede cambiar si cambia el pane enfocado
- **REG_INV05_guarda_foco_terminal** — INV-PUENTE-05: la terminal solo deja de robar el foco a los selectores listados; el tab de archivos debe agregarse (N6)
- **REG_INV06_popover_anotaciones** — INV-PUENTE-06: el popover de anotaciones reconoce la navegacion de archivos por clase dentro del Inspector; la extraccion N1 debe conservar o actualizar ese selector
- **REG_INV07_foco_compartido** — INV-PUENTE-07: en modo shared abrir y cerrar el Inspector emiten RPC de foco a Herdr que mueven a todos los clientes; el tab de archivos no emite foco (INV-11) salvo al enfocar otro workspace (DEC_P1_otro_ws_enfocar)
- **REG_INV08_subvista_cambios** — INV-PUENTE-08: la sub-vista de cambios del preview usa el visor de Changes del mismo host; con el tab, ver cambios abre el Inspector en Changes (DEC_D8_inspector_changes) y N1 no se lleva diffViewerRef
- **REG_INV09_limpieza_vinculo_refresh** — INV-PUENTE-09: una consola puede desaparecer sin pasar por closeTab local (TUI u otro navegador); la reconciliacion del vinculo corre al aceptar un snapshot vigente de la misma conexion y generacion, elimina el vinculo cuyo ownerTabId no esta vivo junto con su estado local y su pin, y no sobrescribe una accion local mas reciente. La limpieza optimista tras closeTab (store.ts:2715) es valida pero no unica
- **REG_INV11_foco_virtual_local** — INV-PUENTE-11: activar o cerrar el tab de archivos nunca emite RPC de foco ni redefine focused, active_tab_id o el pane activo de Herdr; en shared la consola duena se deriva del foco Herdr observado y el estado virtual local solo decide la superficie que se renderiza

#### Nuevas

- **REG_sync_storage_panel** — El tab de archivos se suscribe con subscribeLocalStorage a filesTabLinks y filesTabFiles:{ownerTabId} para reflejar entre pestanas del mismo navegador la creacion, cierre y pestanas de cada vinculo (el listener de App.tsx:3505-3513 solo filtra preferencias del Inspector)
- **REG_reset_sesion_panel_generacion** — El estado de sesion del tab de archivos (superficie activa, transitorios) se anula en el mismo efecto de cambio de generacion que hoy llama commitInspectorState(null) (App.tsx:2763-2771); los vinculos persistidos sobreviven y se revalidan contra el primer snapshot de la nueva generacion
- **REG_idempotencia_abrir_tab_archivos** — Abrir o enfocar el tab de archivos es idempotente por (connectionId, generation, ownerTabId): si el vinculo existe se enfoca, si no se crea; ante conflicto con un refresh prevalece el snapshot vigente
- **REG_rehidratar_al_remontar** — Al remontar un tab de archivos se rehidratan ruta, seleccion y preview desde filesTabFiles:{ownerTabId} y la cache del arbol; el host monta con una key propia del vinculo, no la del pane; el scroll no se garantiza
- **REG_anotaciones_conservadas** — La extraccion N1 conserva las dependencias de anotaciones del preview (lectura, creacion, reanclaje y suspension al cambiar de pestana) y su scope; AnnotationComposerPopover y AnnotationPanel siguen funcionando desde el tab de archivos

### Entidades que toca

- ENT_preferencias_inspector
- ENT_resource_file_tabs
- ENT_estado_panel_files
- ENT_vinculo_tab_archivos
- ENT_pestanas_por_vinculo

### Endpoints que expone

_(ninguno declarado)_

### Escenarios

#### abrir README.md en el tab de archivos de '1 api' y App.tsx en el de '2 web'

- **Precondicion:** dos consolas del mismo workspace, cada una con su tab de archivos
- **Resultado:** cada tab conserva sus propias pestanas; ninguno muestra las del otro
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### abrir un archivo en el tab de '2 web', ir a '1 api' y volver

- **Precondicion:** tab de archivos de '2 web' con un archivo seleccionado
- **Resultado:** al volver se ven la misma ruta, la misma seleccion y el mismo preview
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### en el preview de un archivo modificado pulsar 'Ver cambios'

- **Precondicion:** tab de archivos activo con un archivo modificado seleccionado
- **Resultado:** el Inspector se abre en Changes al costado con ese archivo; el tab de archivos sigue en el centro
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### en el preview de un archivo crear una anotacion, cambiar a otra consola, volver y abrir el panel de anotaciones

- **Precondicion:** tab de archivos con un archivo abierto
- **Resultado:** la anotacion existe, se ve en el panel y el preview la muestra al volver
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace
<!-- modelo:end -->

## Mockup

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [1 api] [2 web] [▣ web] [3 logs]   [+]            [Files*] [Inspector] [Notas]│
│                  └ pegado a su consola, sin numero   * activo: tab visible    │
├───────────────────────────────────────────────────────────────────────────────┤
│ v src/              │  App.tsx  x  │ store.ts x                               │
│   > components/     │------------------------------------------------------   │
│   v web/            │  preview del archivo seleccionado                        │
│     App.tsx  <      │                                       [Ver cambios ->]   │
│ (abre en el cwd del pane enfocado de "2 web", calculado al crear)              │
└───────────────────────────────────────────────────────────────────────────────┘
Menu contextual de "2 web": Focus tab · Rename tab... · Pin tab · Abrir archivos de esta consola · Create tab

Mobile (una consola, strip oculto):
┌──────────────────────┐
│  (tab de archivos)   │
├──────────────────────┤
│ Workspaces  Terminal  Files*  Inspector │  Files abre/enfoca, Terminal vuelve a la consola
└──────────────────────┘
```

## Justificacion de las reglas nuevas


<!-- nodo: REG_rehidratar_al_remontar -->
**REG_rehidratar_al_remontar** — Los tabs inactivos se desmontan (App.tsx:1047-1063); sin rehidratar, volver al tab de archivos perderia ruta, seleccion y preview. El humano eligio rehidratar desde el estado del vinculo con una key propia, no la del pane, que cambia con el pane activo. Alternativa: mantener el host montado oculto (descartada: mas memoria con muchas consolas).

<!-- nodo: REG_anotaciones_conservadas -->
**REG_anotaciones_conservadas** — El host actual le pasa al preview las anotaciones, su creacion y su reanclaje (WorkspaceInspectorHost.tsx:220-224, :766-769). Si N1 extrae el bloque Files sin esas dependencias, las anotaciones dejan de funcionar desde el tab (R4). Se conservan como parte del contrato del componente extraido.

## Capa de seguridad preanunciada

No aplica: usa el contrato file.* existente (list, read, search, resolve, download, upload, delete) sin cambios (DEC_freno_operaciones_archivo).

## Hallazgos aplicados a este proceso

| HZ-NNN | Fecha | Cambio aplicado |
|--------|-------|-----------------|
