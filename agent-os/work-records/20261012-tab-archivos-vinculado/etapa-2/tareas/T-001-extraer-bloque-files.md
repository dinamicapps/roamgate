---
archivos:
  - accion: crear
    ruta: web/src/components/WorkspaceFilesView.tsx
  - accion: modificar
    ruta: web/src/components/WorkspaceInspectorHost.tsx
cas:
  - CA-01
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 1
file_type: tarea-etapa-2
standards_cargados: []
status: in_progress
tipo_tarea: codigo
verificador: null
---
# Tarea 001: Extraer el bloque Files del Inspector (N1)

Sacar de WorkspaceInspectorHost el bloque Files (arbol FileExplorerPanel, FilePreviewTabs, preview, navegacion por split y manejo de pestanas) a un componente montable fuera del Inspector. El Inspector lo sigue montando: el comportamiento visible no cambia.

## Subtareas

1. Identificar en WorkspaceInspectorHost.tsx (aprox. lineas 266-300, 305, 319-460 y 668-760) el estado y los handlers que pertenecen solo a Files.
2. Crear el componente (nombre tentativo WorkspaceFilesView) con props explicitas: recurso, scope, pestanas, seleccion, callbacks de anotaciones y de abrir cambios.
3. Dejar en el host diffViewerRef y todo lo de Changes/Commits/History (INV-PUENTE-08).
4. No mover ni agregar escuchas de Esc en window (FileExplorerDialog.tsx:689 queda fuera del componente).
5. Montar el componente desde el host en el mismo lugar y correr las pruebas existentes.

## Dev Notes

- Extraccion pura: cualquier cambio de comportamiento es drift.
- El codigo del repo esta en ingles; se mantiene el idioma del codigo circundante.

## Verificacion

1. bun test web/src/components/FilePreviewTabs.test.ts web/src/components/FileExplorerDialog.test.ts web/src/workspaceResource.test.ts en verde.
2. bun run --filter roamgate-web typecheck sin errores.
3. Manual: abrir el Inspector en Files, navegar, previsualizar, crear una anotacion: igual que antes (captura antes/despues).

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-01 | N1 sin regresion: el Inspector sigue mostrando Files igual que hoy usando el componente extraido; anotaciones (lectura, creacion, reanclaje) intactas; diffViewerRef queda en el host; ninguna escucha de Esc en window | REG_anotaciones_conservadas, INV-PUENTE-08 |
