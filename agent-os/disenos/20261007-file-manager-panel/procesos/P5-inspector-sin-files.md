---
actor: Usuario de Roamgate
diseno_slug: 20261007-file-manager-panel
file_type: diseno-proceso-contrato
hallazgos_aplicados: []
modulo_huesped: web/src
nombre: Abrir el Inspector sin Files
proceso_id: P5
trigger: abrir el Inspector para Changes, Commits o History
---
# Proceso P5 — Abrir el Inspector sin Files



<!-- nodo: PRO_P5_inspector_sin_files -->
El Inspector sigue existiendo para Changes, Commits e History, pero ya no aloja Files. Este proceso garantiza que ninguna preferencia vieja lo lleve a una vista inexistente: view files se sanea a changes al leer, y el tipo InspectorView pierde el miembro files para que el compilador encuentre todos los usos. Sus efectos de foco hacia Herdr no cambian. Alternativa descartada: conservar files como valor no renderizado (valor muerto reutilizable por error).

<!-- nodo: DEC_D3_quitar_files_inspector_view -->
El humano eligio quitar files de InspectorView. WorktreeLifecycleRow y WorktreeLifecycleDialog, que hoy piden la vista files, pasan a abrir el tab de archivos del workspace como cualquier otra entrada (P1).

<!-- modelo:start vista=contrato -->
### Actor

- Usuario de Roamgate en el navegador (desktop o mobile) (`ACT_usuario`)

### Trigger

el usuario abre el Inspector (boton Inspector, inspector.toggle, Review changes) para Changes, Commits o History

### Modulo huesped

`web/src`

### Llegada del actor

- entra por `PAN_inspector`

### Datos requeridos (entrada)

- workspace y scope
- vista pedida (changes, commits, history)
- preferencias del Inspector persistidas (pueden traer view files)

### Resultado producido (salida)

- Inspector abierto en la vista pedida o en changes si la persistida era files
- preferencias saneadas sin view files
- efectos de foco del Inspector como hoy (focusWorkspace, focusTab(returnTabId))
- destino opcional: archivo o directorio (link, Changes, arbol)

### Reglas que aplica

#### Heredadas

- **REG_INV07_foco_compartido** — INV-PUENTE-07: en modo shared abrir y cerrar el Inspector emiten RPC de foco a Herdr que mueven a todos los clientes; el tab de archivos no emite foco (INV-11) salvo al enfocar otro workspace (DEC_P1_otro_ws_enfocar)
- **REG_INV02_reset_por_generacion** — INV-PUENTE-02: al avanzar la generacion de la conexion se resetea el estado del Inspector y la seleccion; el estado de sesion del panel debe invalidarse con la misma generacion

#### Nuevas

- **REG_saneo_view_files** — Leer preferencias del Inspector convierte view files en changes en los dos puntos del read (workspaceResource.ts:275 y :294) y nunca abre una vista inexistente

### Entidades que toca

- ENT_preferencias_inspector

### Endpoints que expone

_(ninguno declarado)_

### Escenarios

#### abrir el Inspector

- **Precondicion:** preferencias guardadas con view files (escribir en localStorage la clave workspaceInspector:{owner} con view files)
- **Resultado:** el Inspector abre en Changes y no intenta mostrar Files
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; antes de abrir, guardar en localStorage las preferencias con view files

#### en el ciclo de vida de worktrees pulsar Files de una fila

- **Precondicion:** workspace con worktree listado
- **Resultado:** se abre o enfoca el tab de archivos de la consola activa de ese workspace; el Inspector no se abre
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace; crear un worktree adicional

#### usar inspector.toggle

- **Precondicion:** Inspector cerrado
- **Resultado:** el Inspector abre con solo Changes, Commits e History en su lista de vistas
- **Receta de dato de prueba:** Herdr corriendo; workspace demo con checkout git (repo con src/ y un archivo modificado sin commitear); al menos dos consolas en el workspace
<!-- modelo:end -->

## Mockup

```
Inspector (sin Files):
┌─────────────────────────────────┐
│ [Changes] [Commits] [History] x │
│ ...                             │
└─────────────────────────────────┘
```

## Justificacion de las reglas nuevas

<!-- nodo: REG_saneo_view_files -->
**REG_saneo_view_files** — Las preferencias persistidas pueden traer view files o no traer view (default files en workspaceResource.ts:275 y :294). Sin saneo, inspector.toggle intentaria abrir una vista que ya no existe (RT-4). Es la mitad de lectura de DEC_migracion_prefs_una_vez.

## Capa de seguridad preanunciada

No aplica: sin endpoints nuevos.

## Hallazgos aplicados a este proceso

| HZ-NNN | Fecha | Cambio aplicado |
|--------|-------|-----------------|
