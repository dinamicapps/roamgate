---
autor: Julio Diaz
brief_version: 1
datos_md_version: 1
es_paraguas: false
estado: CERRADO
fecha_fin: null
fecha_inicio: "2026-10-07"
file_type: diseno-readme
flujo: modelo
hallazgos_aplicados: 0
hallazgos_pendientes: 0
intent: El file manager funciona como un tab de archivos del cliente, vinculado 1:1 a su tab de consola, que abre en el directorio de trabajo de esa consola y sale del Inspector.
modulo_huesped: web/src
out_of_scope:
  - Operaciones de archivo nuevas (renombrar, mover, crear carpeta, editar) y cambios al contrato backend file.* (DEC_freno_operaciones_archivo)
  - Cambios en Herdr o su protocolo; tab nativo A2 (DEC_freno_herdr)
  - 'Variante coexistir: Files no queda tambien en el Inspector (DEC_freno_coexistir)'
persistencia_resuelta: true
plan_works: []
procesos:
  - actor: Usuario
    id: P1
    nombre: Abrir o enfocar el tab de archivos de la consola activa
  - actor: Usuario
    id: P2
    nombre: Explorar y previsualizar dentro del tab
  - actor: Usuario
    id: P3
    nombre: Moverse entre consolas y tab de archivos en el strip
  - actor: Usuario
    id: P4
    nombre: Cerrar el tab de archivos o su consola
  - actor: Usuario
    id: P5
    nombre: Abrir el Inspector sin Files
slug: 20261007-file-manager-panel
---
# Diseño: File manager como panel independiente

## Intent

El file manager deja de ser la vista Files del Workspace Inspector y pasa a ser un panel propio del layout, hermano del Inspector, con su estado, su montaje en desktop y mobile y sus puntos de entrada definidos, listo para implementar empezando por la extraccion del bloque Files a un componente montable (N1). Insumo previo: work `20261007-investigacion-filemanager-tabs` (opcion B, variante mover).

## Out of scope

Se acumula desde los nodos `decision` del modelo.

## Estado

- **Estado:** EN_DISENO
- **brief_version:** 1
- **Anfitrion del tramo en curso:** Winston (FOCO)
- **Procesos identificados:** 0
- **Works consumidores activos:** ninguno
- **Persistencia resuelta:** false (datos.md)
- **Worktree:** sin regimen de rama (previo)

## Procesos

| ID | Nombre | Actor | Modulo huesped |
|----|--------|-------|----------------|
| P1 | Abrir o enfocar el tab de archivos de la consola activa | Usuario | web/src |
| P2 | Explorar y previsualizar dentro del tab | Usuario | web/src |
| P3 | Moverse entre consolas y tab de archivos en el strip | Usuario | web/src |
| P4 | Cerrar el tab de archivos o su consola | Usuario | web/src |
| P5 | Abrir el Inspector sin Files | Usuario | web/src |

## Plan de works (fragmentación)

> Solo si `es_paraguas: true`. Poblado en step-06.

## Bitacora

Ver `bitacora.md` para historial cronologico.

## Hallazgos

Ver `hallazgos/` para hallazgos del retroceso bidireccional.
