---
actor: Usuario de Roamgate
diseno_slug: 20261007-file-manager-panel
file_type: diseno-proceso-contrato
hallazgos_aplicados: []
modulo_huesped: web/src
nombre: Moverse entre consolas y tab de archivos en el strip
proceso_id: P3
trigger: clic en el strip, atajos, nav mobile o foco externo
---
# Proceso P3 — Moverse entre consolas y tab de archivos en el strip





<!-- nodo: PRO_P3_navegar_strip -->
Es donde el tab virtual convive con los tabs de Herdr, y donde el red-team ubico el mayor riesgo de A1. La regla de fondo es que el tab de archivos es una superficie local pegada a su consola: aparece a su derecha, no recibe numero, no tiene pin propio y su id nunca llega a Herdr. El foco de Herdr sigue mandando: si cambia desde fuera, se muestra la consola enfocada; activar el tab de archivos o volver a su propia consola no emite RPC. En mobile la alternancia la hacen los botones Files y Terminal de la nav. Alternativa descartada: tratar el tab de archivos como un tab mas del strip (rompe tab.move, pins y numeracion).

<!-- nodo: DEC_P3_pegado_a_consola, DEC_P3_atajos_solo_consolas, DEC_P3_foco_externo_manda, DEC_P3_sin_pin_propio -->
El humano eligio las cuatro reglas del strip: el tab de archivos va pegado a la derecha de su consola y se mueve con ella; Ctrl+1..9 sigue numerando solo consolas mientras siguiente/anterior si pasa por el tab de archivos; ante foco externo o cambio de workspace se muestra la consola enfocada y el vinculo queda intacto; y no hay pin propio, el tab acompana a su consola.

<!-- nodo: DEC_D9_nav_mobile -->
El humano eligio que en mobile la alternancia la hagan los botones de la nav: Files abre o enfoca el tab de archivos de la consola activa y Terminal vuelve a la consola. El tab de archivos no cuenta para mostrar el strip ni se lista en MobileTabSheet.

<!-- nodo: DEC_D2_foco_local -->
El humano confirmo la semantica de foco: activar el tab de archivos o volver a su consola es local porque el foco de Herdr ya esta en esa consola; ir a otra consola emite focusTab como hoy; el foco externo manda.

<!-- modelo:start vista=contrato -->
### Actor

- Usuario de Roamgate en el navegador (desktop o mobile) (`ACT_usuario`)

### Trigger

el usuario hace clic en el strip, usa Ctrl+1..9 o siguiente/anterior, cambia de workspace, usa Files/Terminal en la nav mobile, o en shared otro cliente o la TUI cambia el foco

### Modulo huesped

`web/src`

### Llegada del actor

- entra por `PAN_panel_files`

### Datos requeridos (entrada)

- strip de tabs de Herdr del workspace y vinculos vivos
- superficie local activa (consola o tab de archivos de una consola)
- foco de Herdr observado (shared) o navegacion local (browser-local)
- accion de navegacion

### Resultado producido (salida)

- superficie visible actualizada: consola o su tab de archivos
- RPC tab.focus solo al ir a otra consola (como hoy)
- strip con el tab de archivos inmediatamente a la derecha de su consola, sin numero
- vinculo (ownerTabId) y superficie activa

### Reglas que aplica

#### Heredadas

- **REG_INV11_foco_virtual_local** — INV-PUENTE-11: activar o cerrar el tab de archivos nunca emite RPC de foco ni redefine focused, active_tab_id o el pane activo de Herdr; en shared la consola duena se deriva del foco Herdr observado y el estado virtual local solo decide la superficie que se renderiza
- **REG_INV07_foco_compartido** — INV-PUENTE-07: en modo shared abrir y cerrar el Inspector emiten RPC de foco a Herdr que mueven a todos los clientes; el tab de archivos no emite foco (INV-11) salvo al enfocar otro workspace (DEC_P1_otro_ws_enfocar)
- **REG_INV09_limpieza_vinculo_refresh** — INV-PUENTE-09: una consola puede desaparecer sin pasar por closeTab local (TUI u otro navegador); la reconciliacion del vinculo corre al aceptar un snapshot vigente de la misma conexion y generacion, elimina el vinculo cuyo ownerTabId no esta vivo junto con su estado local y su pin, y no sobrescribe una accion local mas reciente. La limpieza optimista tras closeTab (store.ts:2715) es valida pero no unica
- **REG_INV05_guarda_foco_terminal** — INV-PUENTE-05: la terminal solo deja de robar el foco a los selectores listados; el tab de archivos debe agregarse (N6)

#### Nuevas

- **REG_id_virtual_fuera_de_herdr** — El id virtual files:{ownerTabId} nunca llega a operaciones de Herdr (tab.move, tab.close, tab.focus, tab.rename) ni a tabPins.v1; las operaciones del strip sobre el tab de archivos se resuelven localmente o sobre su consola
- **REG_drop_hover_activa_consola** — Durante un arrastre de ruta, mantener el puntero sobre el tab de una consola en el strip la activa para permitir soltar en su terminal; el tab de archivos de origen no se cierra

### Entidades que toca

- ENT_vinculo_tab_archivos

### Endpoints que expone

_(ninguno declarado)_

### Escenarios

#### pulsar Ctrl+2 y despues arrastrar '2 web' a la primera posicion

- **Precondicion:** '2 web' con su tab de archivos abierto
- **Resultado:** Ctrl+2 activa la consola '2 web' (no el tab de archivos); al arrastrar, el tab de archivos se mueve pegado a su consola y ningun tab de Herdr salta al indice 0
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace

#### desde la TUI de Herdr enfocar '1 api'

- **Precondicion:** modo shared, tab de archivos de '2 web' activo en el navegador
- **Resultado:** el navegador muestra '1 api'; el tab de archivos de '2 web' sigue en el strip y se vuelve a el con un clic
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; navegacion shared; tener la TUI de Herdr abierta

#### en layout mobile pulsar Files y luego Terminal en la nav

- **Precondicion:** layout mobile, una sola consola
- **Resultado:** Files muestra su tab de archivos y Terminal vuelve a la consola; el strip sigue oculto y MobileTabSheet no lista el tab de archivos
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; forzar ?layout=mobile y dejar una sola consola

#### arrastrar App.tsx desde el arbol y mantenerlo sobre el tab '2 web' del strip; soltar en la terminal

- **Precondicion:** tab de archivos de '2 web' activo
- **Resultado:** se activa '2 web' y la ruta se inserta en su terminal; el tab de archivos sigue en el strip
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


<!-- nodo: REG_id_virtual_fuera_de_herdr -->
**REG_id_virtual_fuera_de_herdr** — El strip, los pins y los atajos operan sobre ids que Herdr lista (TabBar.tsx:110-128, tabReorder.ts:9-21, tabPins.ts:151-163). Un id virtual que llegue a tab.move, tab.close o tabPins.v1 produce los fallos que el red-team y el insumo describieron (R4, RSG_pin_virtual, RT-1). Resolver localmente o sobre su consola cualquier operacion del strip que toque el tab de archivos los evita por construccion. Alternativa: registrar el tab en Herdr (descartada por el freno Herdr).

<!-- nodo: REG_drop_hover_activa_consola, DEC_R2_drag_hover_strip -->
**REG_drop_hover_activa_consola** — Hoy se arrastra una ruta del arbol a la terminal (FileExplorerDialog.tsx:1438, TerminalView.tsx:1968-1975). Con el tab de archivos ocupando la superficie la terminal no se ve (R2). El humano eligio que mantener el arrastre sobre el tab de una consola en el strip la active para soltar en su terminal, el patron habitual de cambio de pestana durante un arrastre.

## Capa de seguridad preanunciada

No aplica: no hay endpoints nuevos; los RPC tab.* existentes no cambian.

## Hallazgos aplicados a este proceso

| HZ-NNN | Fecha | Cambio aplicado |
|--------|-------|-----------------|
