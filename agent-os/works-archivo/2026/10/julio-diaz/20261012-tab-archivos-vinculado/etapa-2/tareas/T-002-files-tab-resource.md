---
archivos:
  - accion: crear
    ruta: web/src/filesTabResource.ts
  - accion: crear
    ruta: web/src/filesTabResource.test.ts
capa_datos:
  aplica: true
  datos_md_ref: agent-os/disenos/20261007-file-manager-panel/datos.md
  ddl_sugerido: |-
    SUGERENCIA, no contrato (localStorage, sin BD):
    filesTabLinks = { version, links: { [ownerTabId]: { workspaceId, scopeOwner, initialDirectory, navigationRatio, expandedNavigationRatio } } }
    filesTabFiles:{ownerTabId} = forma de ResourceFileTabs v2, max 20 pestanas
  entidades:
    - nombre: localStorage filesTabLinks (ENT_vinculo_tab_archivos)
      operacion: create
    - nombre: localStorage filesTabFiles:{ownerTabId} (ENT_pestanas_por_vinculo)
      operacion: create
  saneamiento_estrategia: ""
  saneamiento_requerido: false
cas:
  - CA-02
  - CA-03
  - CA-04
  - CA-05
  - CA-06
  - CA-07
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
fase: 2
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 002: Modulo filesTabResource: vinculos y pestanas por vinculo

Crear web/src/filesTabResource.ts con la logica pura de persistencia del tab de archivos segun datos.md: filesTabLinks por conexion y filesTabFiles:{ownerTabId}, sin dependencias de React.

## Subtareas

1. Lectura/escritura de filesTabLinks con connectionStorageKey y lectura-merge-escritura por ownerTabId (REG_merge_por_owner).
2. Funcion idempotente de obtener-o-crear vinculo por (connectionId, generation, ownerTabId).
3. Barrera del primer snapshot: sin snapshot vigente no se exponen ni se eliminan vinculos.
4. Reconciliacion contra los tab_id vivos (INV-PUENTE-09) y barrido de claves filesTabFiles huerfanas.
5. filesTabFiles:{ownerTabId} con la forma de ResourceFileTabs v2, tope de 20 pestanas y manejo de QuotaExceededError (podar y reintentar).
6. Suscripcion a eventos storage para sincronizar pestanas del navegador (REG_sync_storage_panel).
7. Pruebas unitarias en web/src/filesTabResource.test.ts por regla.

## Dev Notes

- Fuente de forma y nombres: datos.md (ENT_vinculo_tab_archivos, ENT_pestanas_por_vinculo).
- workspaceInspectorFile:{owner} es legado de solo lectura; no se escribe.

## Verificacion

1. bun test web/src/filesTabResource.test.ts en verde, con al menos una prueba por regla (merge, barrera, idempotencia, reconciliacion, barrido, tope, cuota).
2. typecheck sin errores.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-02 | ESC_P1_reusar_existente: pedir los archivos de una consola que ya tiene tab enfoca el existente, no crea otro | REG_idempotencia_abrir_tab_archivos |
| CA-03 | ESC_P1_dos_pestanas_navegador: dos pestanas del navegador crean vinculos de consolas distintas sin borrarse | REG_merge_por_owner |
| CA-04 | ESC_P4_snapshot_retrasado: antes del primer snapshot no se muestran ni se borran vinculos | REG_barrera_primer_snapshot |
| CA-05 | ESC_P4_barrido_huerfanos: la reconciliacion elimina claves filesTabFiles sin vinculo | REG_cuota_y_barrido |
| CA-06 | ESC_P4_recarga_y_reinicio: tras recargar se restauran los vinculos de consolas vivas; los de consolas muertas se descartan | INV-PUENTE-09 |
| CA-07 | ESC_P2_rehidratar: al volver a un tab de archivos desmontado se restauran pestanas, seleccion y preview | REG_rehidratar_al_remontar |

## Ejecutor: amelia

### Que hizo

- Creo web/src/filesTabResource.ts (logica pura): filesTabLinks y filesTabFiles:{ownerTabId} por conexion via connectionStorageKey.
- Merge por ownerTabId en cada escritura; bajas solo por removeFilesTabLink o reconcileFilesTabLinks.
- obtainFilesTabLink idempotente: initialDirectory se fija solo al crear; updateFilesTabLinkRatios solo toca ratios.
- Barrera: createFilesTabLinkSession no expone ni crea vinculos hasta acceptSnapshot de la generacion vigente.
- Reconciliacion elimina vinculos de consolas muertas y barre claves filesTabFiles huerfanas de esa conexion.
- filesTabFiles reutiliza readResourceFileTabs/writeResourceFileTabs; tope 20 sin descartar activa ni preview; QuotaExceededError poda y reintenta.
- subscribeFilesTabStorage sincroniza pestanas del navegador; 14 pruebas unitarias en verde (anfitriona: 39/39 junto a workspaceResource).

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Archivo no declarado: se exporto finiteNavigationRatio en web/src/workspaceResource.ts:241 (1 linea) para no duplicar el clamp | Aceptado como drift menor: sin solape con T-001 del mismo lote; T-007 tocara el mismo archivo despues | amelia |
| 2 | session.close() no pasa por la barrera del primer snapshot (baja explicita del usuario) | Coherente con REG_barrera_primer_snapshot, que restringe exponer y podar; se verifica en T-005 | amelia |
| 3 | La reconciliacion no usa marcas de tiempo: borra solo owners ausentes del snapshot | Suficiente para INV-PUENTE-09 con la barrera por generacion; se revisa en E4 con ESC_P4_snapshot_retrasado | amelia |
| 4 | Pendientes de integracion: pin de la consola (forgetClosedTabPins) y derivacion inicial desde workspaceInspectorFile legado | Se asignan a T-005 y T-003 respectivamente | amelia |

## Verificador: quinn

### Que verifico

- CA-03, CA-04, CA-05: pruebas unitarias de merge, barrera y barrido en verde; CA-06: recarga restaura vinculo y pestanas en navegador.

### Hallazgos de verificacion

(ninguno)
