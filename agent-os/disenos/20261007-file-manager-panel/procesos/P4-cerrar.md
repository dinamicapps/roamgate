---
actor: Usuario de Roamgate
diseno_slug: 20261007-file-manager-panel
file_type: diseno-proceso-contrato
hallazgos_aplicados: []
modulo_huesped: web/src
nombre: Cerrar el tab de archivos o su consola
proceso_id: P4
trigger: cerrar el tab de archivos, Esc, Ctrl+Alt+W o cierre de la consola
---
# Proceso P4 — Cerrar el tab de archivos o su consola




<!-- nodo: PRO_P4_cerrar -->
Cierra el ciclo del vinculo 1:1. El tab de archivos se cierra solo, nunca cierra a su consola; la consola si arrastra a su tab de archivos, sea el cierre local o externo (TUI u otro cliente, detectado en el snapshot por INV-09). Esc no cierra: despeja lo transitorio y luego vuelve a la consola dejando el tab en el strip. Ctrl+Alt+W con el tab de archivos activo cierra solo ese tab, evitando el cierre de una consola oculta (RT-1). El foco de teclado vuelve a la terminal. Alternativa descartada: que Esc cierre el tab (el humano prefirio no perderlo).

<!-- nodo: DEC_esc_cascada_vuelve_consola -->
El humano eligio Esc en cascada: primero lo transitorio, luego volver a la consola sin cerrar el tab de archivos. Solo con el foco dentro del tab; Esc nunca se escucha en window, para no cerrar nada mientras se usa vim en la terminal.

<!-- nodo: DEC_ctrl_alt_w_cierra_tab_archivos -->
El humano eligio que Ctrl+Alt+W con el tab de archivos activo cierre solo ese tab y muestre su consola. Hoy el atajo calcula el destino con el tab de Herdr enfocado; con el tab de archivos visible ese tab esta oculto y se cerraria sin verlo.

<!-- modelo:start vista=contrato -->
### Actor

- Usuario de Roamgate en el navegador (desktop o mobile) (`ACT_usuario`)

### Trigger

el usuario cierra el tab de archivos (boton, menu, Ctrl+Alt+W con el tab activo) o pulsa Esc dentro de el, o la consola duena se cierra aqui o desde la TUI u otro cliente

### Modulo huesped

`web/src`

### Llegada del actor

- entra por `PAN_panel_files`

### Datos requeridos (entrada)

- vinculo (ownerTabId) y superficie activa
- origen del cierre: tab de archivos, Esc, consola local o consola externa (snapshot)
- estado transitorio del explorador (busqueda, menu)

### Resultado producido (salida)

- Esc: transitorio despejado o vuelta a la consola sin cerrar el tab
- cierre del tab de archivos: vinculo y sus pestanas eliminados, consola visible
- cierre de la consola: su tab de archivos eliminado en el mismo paso o en el snapshot siguiente (INV-09)
- foco de teclado devuelto a la terminal

### Reglas que aplica

#### Heredadas

- **REG_INV09_limpieza_vinculo_refresh** — INV-PUENTE-09: una consola puede desaparecer sin pasar por closeTab local (TUI u otro navegador); la reconciliacion del vinculo corre al aceptar un snapshot vigente de la misma conexion y generacion, elimina el vinculo cuyo ownerTabId no esta vivo junto con su estado local y su pin, y no sobrescribe una accion local mas reciente. La limpieza optimista tras closeTab (store.ts:2715) es valida pero no unica
- **REG_INV11_foco_virtual_local** — INV-PUENTE-11: activar o cerrar el tab de archivos nunca emite RPC de foco ni redefine focused, active_tab_id o el pane activo de Herdr; en shared la consola duena se deriva del foco Herdr observado y el estado virtual local solo decide la superficie que se renderiza
- **REG_INV05_guarda_foco_terminal** — INV-PUENTE-05: la terminal solo deja de robar el foco a los selectores listados; el tab de archivos debe agregarse (N6)

#### Nuevas

- **REG_id_virtual_fuera_de_herdr** — El id virtual files:{ownerTabId} nunca llega a operaciones de Herdr (tab.move, tab.close, tab.focus, tab.rename) ni a tabPins.v1; las operaciones del strip sobre el tab de archivos se resuelven localmente o sobre su consola
- **REG_cierre_consola_cierra_archivos** — Cerrar la consola duena elimina su tab de archivos, su vinculo y sus pestanas: en el mismo paso si el cierre es local (closeTab) y en la reconciliacion del snapshot si es externo (INV-09)
- **REG_sync_storage_panel** — El tab de archivos se suscribe con subscribeLocalStorage a filesTabLinks y filesTabFiles:{ownerTabId} para reflejar entre pestanas del mismo navegador la creacion, cierre y pestanas de cada vinculo (el listener de App.tsx:3505-3513 solo filtra preferencias del Inspector)
- **REG_merge_por_owner** — Escribir filesTabLinks es lectura-merge-escritura por ownerTabId: una pestana del navegador solo agrega o modifica la entrada de su consola; las bajas solo ocurren por cierre del tab o de su consola o por reconciliacion con el snapshot
- **REG_cuota_y_barrido** — Cada vinculo guarda como maximo 20 pestanas de archivo (se descartan las mas antiguas); una escritura que falla por QuotaExceededError no rompe la UI y se reintenta tras podar; al reconciliar se barren las claves filesTabFiles:{ownerTabId} sin vinculo
- **REG_barrera_primer_snapshot** — Hasta recibir el primer snapshot vigente de la conexion y generacion, los vinculos persistidos no se muestran ni se eliminan

### Entidades que toca

- ENT_vinculo_tab_archivos
- ENT_pestanas_por_vinculo

### Endpoints que expone

_(ninguno declarado)_

### Escenarios

#### cerrar la consola '2 web' desde la TUI de Herdr

- **Precondicion:** '2 web' con su tab de archivos abierto en el navegador
- **Resultado:** tras el refresh siguiente el tab de archivos de '2 web' desaparece junto con su vinculo y sus pestanas
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; tener la TUI de Herdr abierta

#### con el tab de archivos de '2 web' activo pulsar Ctrl+Alt+W

- **Precondicion:** tab de archivos de '2 web' activo
- **Resultado:** se cierra solo el tab de archivos y se muestra '2 web'; ninguna consola se cierra
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### con la busqueda del explorador abierta pulsar Esc dos veces; despues, en la consola dentro de vim, pulsar Esc

- **Precondicion:** tab de archivos activo con la busqueda abierta
- **Resultado:** el primer Esc cierra la busqueda, el segundo vuelve a la consola sin cerrar el tab; el Esc dentro de vim no afecta al tab de archivos
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; abrir vim en la consola

#### recargar el navegador; despues reiniciar Herdr de modo que los tab_id cambien y recargar

- **Precondicion:** '2 web' con su tab de archivos y pestanas abiertas
- **Resultado:** tras recargar se restaura el tab de archivos; tras reiniciar Herdr con ids nuevos los vinculos se descartan y no aparecen tabs de archivos huerfanos
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### recargar el navegador con la red lenta

- **Precondicion:** vinculos persistidos de '1 api' y '2 web'
- **Resultado:** mientras no llega el primer snapshot no se muestran ni se borran tabs de archivos; al llegar se restauran los vivos
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; throttling de red en devtools antes de recargar

#### recargar tras dejar en localStorage una clave filesTabFiles de una consola inexistente

- **Precondicion:** clave filesTabFiles:{id inexistente} escrita a mano
- **Resultado:** tras la reconciliacion la clave huerfana se elimina
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; escribir en localStorage una clave filesTabFiles con un ownerTabId que Herdr no lista
<!-- modelo:end -->

## Justificacion de las reglas nuevas


<!-- nodo: REG_cierre_consola_cierra_archivos -->
**REG_cierre_consola_cierra_archivos** — Implementa DEC_cierre_con_consola en los dos canales por los que una consola desaparece: el cierre local (closeTab, store.ts:2709) y el externo, que solo se ve en el snapshot (store.ts:1352). Sin el segundo canal quedarian tabs de archivos huerfanos cuando la TUI u otro cliente cierra la consola (hallazgo F2 del red-team).

<!-- nodo: REG_cuota_y_barrido -->
**REG_cuota_y_barrido** — Las pestanas de cada vinculo viven en claves independientes; sin limite ni barrido, muchos vinculos o una limpieza interrumpida acumularian claves huerfanas y podrian agotar la cuota de localStorage (R7). Veinte pestanas por vinculo cubren el uso normal; el barrido corre en la misma reconciliacion que poda los vinculos.

## Capa de seguridad preanunciada

No aplica: no hay endpoints nuevos; tab.close existente no cambia y el id virtual no lo alcanza.

## Hallazgos aplicados a este proceso

| HZ-NNN | Fecha | Cambio aplicado |
|--------|-------|-----------------|
