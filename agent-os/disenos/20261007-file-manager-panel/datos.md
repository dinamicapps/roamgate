---
brief_version: 1
derivas_observadas:
  - Pestanas y seleccion de archivos por scope, no por consola (workspaceResource.ts:128)
  - 'Prefijo historico workspaceInspectorFile: (workspaceResource.ts:128)'
  - Ranger no persiste ancho y su modo usa clave global (AssistantPanel.tsx:774, App.tsx:1320)
diseno_slug: 20261007-file-manager-panel
file_type: diseno-datos
mcp_sqlserver_disponible: false
persistencia_resuelta: true
---
# Datos del diseño: file manager como panel independiente

**Anfitrion:** Dexter [MD]. **Modo de entrada:** proactivo. **Medio de persistencia:** localStorage del navegador (`roamgateLocalStorage`), con claves namespaceadas por conexion (`herdr.connection/{id}/...`, `web/src/connectionStorage.ts:42`). No hay base de datos ni MCP aplicable.

## Proyeccion del modelo

<!-- modelo:start vista=datos -->
### Entidades

| id | existencia | columnas | procedencia |
|---|---|---|---|
| ENT_preferencias_inspector | existente | clave, view, dock, expanded, expandedNavigationRatios, rightSize, bottomSize, filesNavigationRatio, changesNavigationRatio | foco |
| ENT_resource_file_tabs | existente | clave, version, paths, activePath, previewPath | foco |
| ENT_estado_panel_files **(obsoleto)** | nueva | clave, version, width, expanded, navigationRatio, expandedNavigationRatio | foco |
| ENT_vinculo_tab_archivos | nueva | clave, version, links[].ownerTabId, links[].workspaceId, links[].scopeOwner, links[].initialDirectory, links[].navigationRatio, links[].expandedNavigationRatio | foco |
| ENT_pestanas_por_vinculo | nueva | clave, version, paths, activePath, previewPath | datos |

### Diccionario de columnas

| entidad | columna | tipo | nulo | PK | FK | default |
|---|---|---|---|---|---|---|
| ENT_preferencias_inspector | clave | connectionStorageKey(connectionId, 'workspaceInspector:{owner}'): herdr.connection/{id}/workspaceInspector:{owner}, o workspaceInspector:{owner} sin prefijo con legacy-default (connectionStorage.ts:41) | no | si |  |  |
| ENT_preferencias_inspector | view | InspectorView; tras B mover solo changes\|commits\|history (files se sanea a changes al leer) | no | no |  | changes tras la migracion |
| ENT_preferencias_inspector | dock | right\|bottom | no | no |  | right |
| ENT_preferencias_inspector | expanded | boolean | no | no |  | false |
| ENT_preferencias_inspector | expandedNavigationRatios | Partial<Record<files\|changes, number>>; la entrada files queda sin uso tras migrar | no | no |  | map[] |
| ENT_preferencias_inspector | rightSize | number px | no | no |  | 520 |
| ENT_preferencias_inspector | bottomSize | number px | no | no |  | 360 |
| ENT_preferencias_inspector | filesNavigationRatio | number 0..1; sin uso tras migrar (fuente de la derivacion del panel) | no | no |  | 0.4 |
| ENT_preferencias_inspector | changesNavigationRatio | number 0..1 | no | no |  | 0.4 |
| ENT_resource_file_tabs | clave | connectionStorageKey(connectionId, 'workspaceInspectorFile:{owner}'): herdr.connection/{id}/workspaceInspectorFile:{owner}, o workspaceInspectorFile:{owner} sin prefijo con legacy-default (connectionStorage.ts:41) | no | si |  |  |
| ENT_resource_file_tabs | version | 1\|2 (se escribe 2) | no | no |  | 2 |
| ENT_resource_file_tabs | paths | string[] rutas abiertas | no | no |  | [] |
| ENT_resource_file_tabs | activePath | string\|null | si | no |  |  |
| ENT_resource_file_tabs | previewPath | string\|null | si | no |  |  |
| ENT_estado_panel_files **(obsoleto)** | clave | connectionStorageKey(connectionId, 'filesPanel:{owner}'): herdr.connection/{id}/filesPanel:{owner}, o filesPanel:{owner} sin prefijo con legacy-default (connectionStorage.ts:41) | no | si |  |  |
| ENT_estado_panel_files **(obsoleto)** | version | number | no | no |  | 1 |
| ENT_estado_panel_files **(obsoleto)** | width | number px (finiteSize) | no | no |  | 520 |
| ENT_estado_panel_files **(obsoleto)** | expanded | boolean (maximizado) | no | no |  | false |
| ENT_estado_panel_files **(obsoleto)** | navigationRatio | number 0..1 (finiteNavigationRatio); derivado de filesNavigationRatio si la clave no existe | no | no |  | 0.4 |
| ENT_estado_panel_files **(obsoleto)** | expandedNavigationRatio | number 0..1; derivado de expandedNavigationRatios.files si existe | si | no |  |  |
| ENT_vinculo_tab_archivos | clave | connectionStorageKey(connectionId, 'filesTabLinks'): herdr.connection/{id}/filesTabLinks, o filesTabLinks sin prefijo con legacy-default (connectionStorage.ts:41) | no | si |  |  |
| ENT_vinculo_tab_archivos | version | number | no | no |  | 1 |
| ENT_vinculo_tab_archivos | links[].ownerTabId | string tab_id de Herdr de la consola duena (llave dentro del registro) | no | si |  |  |
| ENT_vinculo_tab_archivos | links[].workspaceId | string workspace de la consola al crear | no | no |  |  |
| ENT_vinculo_tab_archivos | links[].scopeOwner | string resourceOwnerKey del scope al crear (checkout o workspace) | no | no |  |  |
| ENT_vinculo_tab_archivos | links[].initialDirectory | string\|null relativo a la raiz, calculado solo al crear (DEC_raiz_cwd_pane_enfocado) | si | no |  |  |
| ENT_vinculo_tab_archivos | links[].navigationRatio | number 0..1 (finiteNavigationRatio) | no | no |  | 0.4 |
| ENT_vinculo_tab_archivos | links[].expandedNavigationRatio | number 0..1 | si | no |  |  |
| ENT_pestanas_por_vinculo | clave | connectionStorageKey(connectionId, 'filesTabFiles:{ownerTabId}'): herdr.connection/{id}/filesTabFiles:{ownerTabId}, o filesTabFiles:{ownerTabId} sin prefijo con legacy-default (connectionStorage.ts:41) | no | si |  |  |
| ENT_pestanas_por_vinculo | version | number (forma de ResourceFileTabs, version 2) | no | no |  | 2 |
| ENT_pestanas_por_vinculo | paths | string[] rutas abiertas | no | no |  | [] |
| ENT_pestanas_por_vinculo | activePath | string\|null | si | no |  |  |
| ENT_pestanas_por_vinculo | previewPath | string\|null | si | no |  |  |

### Relaciones

- `RELACIONA` ENT_estado_panel_files -> ENT_preferencias_inspector
- `RELACIONA` ENT_estado_panel_files -> ENT_resource_file_tabs
- `RELACIONA` ENT_vinculo_tab_archivos -> ENT_pestanas_por_vinculo
- `RELACIONA` ENT_pestanas_por_vinculo -> ENT_resource_file_tabs
- `RELACIONA` ENT_vinculo_tab_archivos -> ENT_preferencias_inspector

### Matriz CRUD proceso <-> entidad

| proceso | entidad | operaciones |
|---|---|---|
| PRO_explorar_archivos | ENT_preferencias_inspector |  |
| PRO_explorar_archivos | ENT_resource_file_tabs |  |
| PRO_explorar_archivos | ENT_estado_panel_files |  |
| PRO_explorar_archivos | ENT_vinculo_tab_archivos |  |

<!-- modelo:end -->

## E/R y cardinalidad

Regreso 2026-10-10: el diseño paso de panel independiente a tab de archivos vinculado 1:1 a una consola. `ENT_estado_panel_files` quedo obsoleta, reemplazada por `ENT_vinculo_tab_archivos`.

La clave fisica la arma siempre `connectionStorageKey` (con prefijo `herdr.connection/{id}/` o sin el en `legacy-default`, `web/src/connectionStorage.ts:41`).

```
ENT_vinculo_tab_archivos (filesTabLinks)            ENT_pestanas_por_vinculo (filesTabFiles:{ownerTabId})
  links[ownerTabId] (1) -------------------------- (1)  paths, activePath, previewPath
        |                                                    |
        | derivacion unica de ratios (0..1)                  | derivacion unica (0..1) del primer vinculo del scope
        v                                                    v
ENT_preferencias_inspector (workspaceInspector:{owner})    ENT_resource_file_tabs (workspaceInspectorFile:{owner}, legado)
```

- `links[ownerTabId]`: un registro por consola duena; su existencia ES el vinculo. Se poda en cada snapshot vigente contra los `tab_id` vivos (INV-09), y al cerrar la consola localmente.
- `ENT_pestanas_por_vinculo` reutiliza la forma de `ResourceFileTabs` con clave por `ownerTabId`; dos consolas del mismo workspace tienen estado separado. Al crear el primer vinculo de un scope se puede derivar de `workspaceInspectorFile:{owner}` (legado), que deja de escribirse.
- `navigationRatio` del vinculo se deriva de `filesNavigationRatio` de las preferencias del Inspector al crearse (DEC_migracion_prefs_una_vez).
- La cache del arbol (`explorerCache`, memoria) sigue por scope.
- Ubicacion en codigo: `filesTabResource.ts` (DEC_estado_tab_modulo_nuevo).

Matriz CRUD preliminar (los procesos se re-definen en step-04): el tab lee/escribe `ENT_vinculo_tab_archivos` y `ENT_pestanas_por_vinculo`; lee una vez `ENT_preferencias_inspector` y `ENT_resource_file_tabs` para derivar; el Inspector sigue con `ENT_preferencias_inspector` y `view` saneado.

Ajustes del red-team del brief (2026-10-11):
- Escritura de `filesTabLinks`: lectura-merge-escritura por `ownerTabId`; una pestana del navegador solo agrega o modifica su entrada; las bajas solo por cierre o reconciliacion (REG_merge_por_owner).
- Barrera: los vinculos persistidos no se muestran ni se eliminan antes del primer snapshot vigente (REG_barrera_primer_snapshot).
- Cuota: maximo 20 pestanas por vinculo en `filesTabFiles:{ownerTabId}`; QuotaExceededError se maneja podando y reintentando; la reconciliacion barre claves `filesTabFiles:` sin vinculo (REG_cuota_y_barrido).

## Justificacion de las estructuras nuevas

<!-- nodo: ENT_vinculo_tab_archivos -->
Hace falta recordar que consola tiene tab de archivos para cumplir el requisito central del humano: una consola remite a su tab de archivos ya abierto en vez de abrir otro, y su tab no sobrevive a la consola. No es redundante con el `Tab` de Herdr porque Herdr no conoce el tab virtual (freno Herdr), ni con las preferencias del Inspector porque el tab ya no es una vista del Inspector. Se valida contra los `tab_id` vivos porque el `tab_id` no se puede suponer estable entre reinicios de Herdr (DEC_vinculo_localstorage_validado).

<!-- nodo: ENT_pestanas_por_vinculo -->
Las pestanas de archivo hoy se guardan por scope; con dos consolas del mismo workspace sus tabs de archivos escribirian la misma clave. Separarlas por `ownerTabId` da a cada consola su propio contexto (DEC_estado_por_vinculo_rehidratado) y reutiliza la forma y las funciones de `ResourceFileTabs` en vez de inventar otra estructura.

## Derivas observadas

| Deriva | Evidencia | Consecuencia |
|---|---|---|
| Pestanas de archivo y seleccion se guardan por scope, no por consola | `FILE_SELECTION_PREFIX = "workspaceInspectorFile:"` (`web/src/workspaceResource.ts:128`) | Con tabs de archivos por consola habria dos escritores sobre la misma clave; se crea `ENT_pestanas_por_vinculo` |
| El prefijo de las pestanas de archivo dice Inspector | mismo prefijo (`web/src/workspaceResource.ts:128`) | La clave legada se conserva solo como fuente de derivacion; deja de escribirse |
| Ranger no persiste su ancho y su modo usa clave global | `useState(380)` (`web/src/components/AssistantPanel.tsx:774`); `getItem("assistantPanelMode")` (`web/src/App.tsx:1320`) | Ya no aplica al tab (sin geometria lateral); se mantiene como observacion del codebase |

## Sello anti-evasion (P-D3)

- Marcadores de evasion en estructuras: ninguno.
- Diccionario completo: 4 entidades vigentes (2 nuevas, 2 existentes) con tipo, nulabilidad y default; 1 obsoleta conservada.
- Justificacion de las estructuras nuevas: anclada (`ENT_vinculo_tab_archivos`, `ENT_pestanas_por_vinculo`); obsoleta anclada (`ENT_estado_panel_files`).
- `modelo validar --etapa datos`: limpio antes de sellar.

## Estructuras obsoletas

<!-- nodo: ENT_estado_panel_files -->
Obsoleta desde el regreso del 2026-10-10. Era el estado del panel lateral (`filesPanel:{owner}` con ancho, maximizado y ratios por scope). Se justificaba porque el panel necesitaba recordar su geometria por workspace. Al cambiar a tab vinculado ya no hay geometria lateral que recordar; la reemplaza `ENT_vinculo_tab_archivos`.
