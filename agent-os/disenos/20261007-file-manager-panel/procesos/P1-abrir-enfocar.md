---
actor: Usuario de Roamgate
diseno_slug: 20261007-file-manager-panel
file_type: diseno-proceso-contrato
hallazgos_aplicados: []
modulo_huesped: web/src
nombre: Abrir o enfocar el tab de archivos de la consola activa
proceso_id: P1
trigger: cualquier entrada a Files
---
# Proceso P1 — Abrir o enfocar el tab de archivos de la consola activa





<!-- nodo: PRO_P1_abrir_enfocar -->
Es la puerta de entrada al tab de archivos y el lugar donde se cumple el requisito central del humano: una consola remite a su tab de archivos ya abierto en vez de abrir otro. Todas las entradas a Files convergen aqui (boton Files de la barra y menu del tab de consola por DEC_D6_boton_y_menu; atajo, paleta, nav mobile, arbol y links como hoy, con destino nuevo). Si el vinculo de la consola existe se enfoca; si no, se crea con el directorio inicial del pane enfocado. Activar el tab es local: no emite RPC de foco (INV-11). Solo cuando la entrada apunta a un workspace no enfocado se enfoca antes ese workspace, como hoy hace el Inspector (DEC_P1_otro_ws_enfocar). Alternativa descartada: abrir un tab de archivos por cada entrada (rompe el 1:1).

<!-- nodo: DEC_P1_otro_ws_enfocar -->
El humano eligio conservar la semantica actual de "Browse files" sobre otro workspace: enfocar ese workspace y su consola activa y despues abrir su tab de archivos. El RPC de foco (en shared) es sobre la consola y el workspace, como hoy; el tab virtual sigue sin emitir foco.

<!-- nodo: DEC_P1_changes_cierra_inspector -->
El humano eligio que abrir un archivo desde Changes cierre el Inspector y active el tab de archivos con ese archivo seleccionado, para dar todo el espacio al archivo.

<!-- nodo: DEC_P1_cwd_fuera_raiz -->
El humano confirmo el comportamiento heredado: si el cwd del pane esta fuera de la raiz del checkout, el tab abre en la raiz. El modo filesystem sigue siendo una accion aparte.

<!-- modelo:start vista=contrato -->
### Actor

- Usuario de Roamgate en el navegador (desktop o mobile) (`ACT_usuario`)

### Trigger

el usuario usa una entrada a Files: boton Files de la barra, 'Abrir archivos de esta consola' en el menu del tab, Ctrl+Alt+E, paleta, Files de la nav mobile, arbol de workspaces, boton Files del ciclo de vida de worktrees, link de archivo en la terminal o abrir archivo desde Changes

### Modulo huesped

`web/src`

### Llegada del actor

- entra por `PAN_panel_files`

### Datos requeridos (entrada)

- connectionId y generation vigentes
- ownerTabId: consola activa del workspace o la consola del menu
- workspaceId de la consola
- destino opcional: archivo o directorio (link, Changes, arbol)

### Resultado producido (salida)

- tab de archivos de la consola visible y activo en la superficie principal
- vinculo en filesTabLinks[ownerTabId] creado o reutilizado
- pestanas del vinculo en filesTabFiles:{ownerTabId} con el destino abierto si lo hubo
- Inspector cerrado si la entrada fue Changes
- vinculo activo (ownerTabId) y su scope
- superficie local activa (consola o tab de archivos de una consola)

### Reglas que aplica

#### Heredadas

- **REG_INV01_gating_seleccion_scope** — INV-PUENTE-01: la seleccion y vista previa activa solo se aceptan para el scope del Inspector; el tab de archivos necesita su propio gating por el scope de su vinculo (N5)
- **REG_INV02_reset_por_generacion** — INV-PUENTE-02: al avanzar la generacion de la conexion se resetea el estado del Inspector y la seleccion; el estado de sesion del panel debe invalidarse con la misma generacion
- **REG_INV03_remontaje_por_scope** — INV-PUENTE-03: cada superficie se remonta con clave resourceUiKey + owner de SU scope; el tab de archivos monta con key propia del vinculo y puede mostrar un workspace distinto al del Inspector
- **REG_INV04_raiz_pane_enfocado** — INV-PUENTE-04: sin worktree, la raiz del explorador en el backend es el cwd del pane enfocado en Herdr; el directorio inicial del tab se calcula al crear (REG_P1_raiz_al_crear), pero la raiz del backend puede cambiar si cambia el pane enfocado
- **REG_INV05_guarda_foco_terminal** — INV-PUENTE-05: la terminal solo deja de robar el foco a los selectores listados; el tab de archivos debe agregarse (N6)
- **REG_INV07_foco_compartido** — INV-PUENTE-07: en modo shared abrir y cerrar el Inspector emiten RPC de foco a Herdr que mueven a todos los clientes; el tab de archivos no emite foco (INV-11) salvo al enfocar otro workspace (DEC_P1_otro_ws_enfocar)
- **REG_INV11_foco_virtual_local** — INV-PUENTE-11: activar o cerrar el tab de archivos nunca emite RPC de foco ni redefine focused, active_tab_id o el pane activo de Herdr; en shared la consola duena se deriva del foco Herdr observado y el estado virtual local solo decide la superficie que se renderiza
- **REG_cwd_fuera_raiz_abre_raiz** — Si el cwd del pane queda fuera de la raiz del checkout, relativePathWithinCheckout devuelve undefined y el explorador abre en la raiz

#### Nuevas

- **REG_P1_raiz_al_crear** — El directorio inicial del vinculo se calcula una sola vez al crearlo, desde el cwd del pane enfocado de la consola relativo a la raiz; reabrir un vinculo existente no lo recalcula
- **REG_idempotencia_abrir_tab_archivos** — Abrir o enfocar el tab de archivos es idempotente por (connectionId, generation, ownerTabId): si el vinculo existe se enfoca, si no se crea; ante conflicto con un refresh prevalece el snapshot vigente
- **REG_sync_storage_panel** — El tab de archivos se suscribe con subscribeLocalStorage a filesTabLinks y filesTabFiles:{ownerTabId} para reflejar entre pestanas del mismo navegador la creacion, cierre y pestanas de cada vinculo (el listener de App.tsx:3505-3513 solo filtra preferencias del Inspector)
- **REG_reset_sesion_panel_generacion** — El estado de sesion del tab de archivos (superficie activa, transitorios) se anula en el mismo efecto de cambio de generacion que hoy llama commitInspectorState(null) (App.tsx:2763-2771); los vinculos persistidos sobreviven y se revalidan contra el primer snapshot de la nueva generacion
- **REG_link_resuelve_pane_dueno** — Una entrada desde un link de terminal resuelve ownerTabId desde el paneId de origen (pane -> tab_id) y no desde la consola activa
- **REG_files_toggle** — files.toggle con el tab de archivos de la consola activa visible vuelve a la consola; en cualquier otro estado ejecuta abrir o enfocar
- **REG_merge_por_owner** — Escribir filesTabLinks es lectura-merge-escritura por ownerTabId: una pestana del navegador solo agrega o modifica la entrada de su consola; las bajas solo ocurren por cierre del tab o de su consola o por reconciliacion con el snapshot
- **REG_barrera_primer_snapshot** — Hasta recibir el primer snapshot vigente de la conexion y generacion, los vinculos persistidos no se muestran ni se eliminan

### Entidades que toca

- ENT_vinculo_tab_archivos
- ENT_pestanas_por_vinculo
- ENT_preferencias_inspector
- ENT_resource_file_tabs

### Endpoints que expone

_(ninguno declarado)_

### Escenarios

#### pulsar el boton Files de la barra

- **Precondicion:** consola '2 web' activa, sin tab de archivos, con el pane en src/web
- **Resultado:** aparece el tab de archivos a la derecha de '2 web', activo, abierto en src/web
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; en la consola ejecutar cd src/web

#### pulsar Ctrl+Alt+E y luego 'Abrir archivos de esta consola' en el menu de '2 web'

- **Precondicion:** '2 web' ya tiene su tab de archivos
- **Resultado:** se enfoca el mismo tab; no se crea un segundo tab de archivos para '2 web'
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; abrir antes el tab de archivos de '2 web' y volver a la consola

#### en el arbol de workspaces, Browse files sobre el workspace B no enfocado

- **Precondicion:** workspace A enfocado; workspace B con consola activa
- **Resultado:** B queda enfocado y se abre o enfoca el tab de archivos de su consola activa
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; crear un segundo workspace B con una consola

#### en el Inspector en Changes, abrir el archivo modificado

- **Precondicion:** Inspector abierto en Changes con un archivo modificado
- **Resultado:** el Inspector se cierra y el tab de archivos de la consola activa queda visible con ese archivo seleccionado
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### pulsar el boton Files

- **Precondicion:** consola sin tab de archivos con el pane en /tmp (fuera del checkout)
- **Resultado:** el tab de archivos abre en la raiz del checkout
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; en la consola ejecutar cd /tmp

#### en la consola '1 api' (no activa, con dos panes) pulsar un link de archivo emitido por su segundo pane

- **Precondicion:** consola activa '2 web'; '1 api' con dos panes
- **Resultado:** se activa '1 api' y se abre o enfoca su tab de archivos con el archivo del link; no se abre el de '2 web'
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; dividir '1 api' en dos panes y hacer que el segundo imprima una ruta de archivo

#### pulsar Ctrl+Alt+E dos veces seguidas

- **Precondicion:** consola '2 web' activa
- **Resultado:** la primera vez aparece su tab de archivos, la segunda vuelve a '2 web'
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### en dos pestanas del navegador abrir a la vez el tab de archivos de '1 api' en una y de '2 web' en la otra

- **Precondicion:** dos pestanas del navegador con la misma conexion
- **Resultado:** ambos vinculos quedan en filesTabLinks; ninguna pestana borra el de la otra
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; abrir Roamgate en dos pestanas del navegador
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


<!-- nodo: REG_P1_raiz_al_crear -->
**REG_P1_raiz_al_crear** — El humano pidio que el tab parta del directorio de trabajo de la consola; el red-team mostro que seguir cada cambio de pane o de cwd seria otra decision. Calcularlo solo al crear da un punto de partida predecible y no mueve al usuario mientras navega. Alternativa: seguir dinamicamente el cwd (descartada por ahora).

<!-- nodo: REG_idempotencia_abrir_tab_archivos -->
**REG_idempotencia_abrir_tab_archivos** — Sin idempotencia, dos navegadores o una accion local que coincide con un refresh podrian crear dos tabs de archivos para la misma consola, rompiendo el 1:1 que pidio el humano (hallazgo T2 del red-team). La llave (connectionId, generation, ownerTabId) es la identidad del vinculo; el snapshot vigente gana porque es la unica fuente que sabe si la consola sigue viva. Alternativa: bloqueo entre pestanas (descartada: mas complejo y no cubre otros clientes).

<!-- nodo: REG_sync_storage_panel -->
**REG_sync_storage_panel** — Los vinculos y sus pestanas viven en localStorage compartido por las pestanas del mismo navegador. Sin escuchar el evento storage de sus claves, cerrar un tab de archivos en una pestana del navegador lo dejaria vivo en otra, y la ultima en escribir pisaria a las demas (hallazgo de Winston en datos). El listener actual solo filtra preferencias del Inspector. Alternativa: releer al enfocar (descartada: deja ventanas desincronizadas mientras se ven).

<!-- nodo: REG_reset_sesion_panel_generacion -->
**REG_reset_sesion_panel_generacion** — Al reconectar, la generacion avanza y hoy el Inspector anula su estado (INV-02). El tab de archivos hace lo mismo con su estado de sesion; los vinculos persistidos no se borran, se revalidan contra el primer snapshot de la nueva generacion (INV-09). Asi una reconexion no deja una superficie apuntando a otra conexion ni pierde los vinculos validos.

<!-- nodo: REG_link_resuelve_pane_dueno, DEC_R1_link_pane_dueno -->
**REG_link_resuelve_pane_dueno** — El humano decidio (hallazgo R1 del red-team del brief) que un link de archivo abra el tab de la consola duena del pane que lo emitio. El evento ya trae el paneId de origen (TerminalView.tsx:842-848, App.tsx:2430-2434); usar la consola activa abriria los archivos en el contexto equivocado.

<!-- nodo: REG_files_toggle, DEC_R3_files_toggle_real -->
**REG_files_toggle** — El humano decidio (R3) conservar el significado de toggle de Ctrl+Alt+E: hoy cierra el Inspector si Files esta abierto (App.tsx:2321-2340); con el tab, la segunda pulsacion vuelve a la consola.

<!-- nodo: REG_merge_por_owner -->
**REG_merge_por_owner** — Dos pestanas del navegador comparten el registro filesTabLinks; sin merge por ownerTabId la ultima escritura borraria el vinculo creado por la otra (R5). Las bajas se reservan al cierre y a la reconciliacion con el snapshot, que es la unica fuente que sabe si la consola sigue viva.

<!-- nodo: REG_barrera_primer_snapshot -->
**REG_barrera_primer_snapshot** — Tras recargar o reconectar, los vinculos persistidos no pueden validarse hasta el primer snapshot (R6); mostrarlos antes podria pintar tabs de consolas muertas y podarlos antes borraria vinculos validos. Mismo criterio que hoy usa App.tsx:2932-2944 para cerrar por ausencia solo despues de refresh.

## Capa de seguridad preanunciada

No aplica: el proceso no crea ni modifica endpoints; usa el contrato file.* existente y los RPC de foco actuales.

## Hallazgos aplicados a este proceso

| HZ-NNN | Fecha | Cambio aplicado |
|--------|-------|-----------------|
