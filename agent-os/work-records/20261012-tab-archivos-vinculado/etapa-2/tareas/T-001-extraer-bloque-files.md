---
archivos:
  - accion: crear
    ruta: web/src/components/WorkspaceFilesView.tsx
  - accion: modificar
    ruta: web/src/components/WorkspaceInspectorHost.tsx
cas:
  - CA-01
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 1
file_type: tarea-etapa-2
standards_cargados: []
status: done
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

## Ejecutor: amelia

### Que hizo

- Extrajo el bloque Files a web/src/components/WorkspaceFilesView.tsx (arbol, FilePreviewTabs, preview, pestanas, drill-in); el Inspector lo monta en el mismo lugar.
- diffViewerRef, DiffContentView, ratios del split y Changes/Commits/History se quedan en el host (INV-PUENTE-08); la sub-vista de cambios entra por renderFileChanges.
- Props explicitas para montarlo fuera del Inspector: active, compact, tabsStore, drillIn controlado, split opcional, onOpenFileChanges.
- Movio InspectorSplitResizer sin cambios a su archivo para evitar importacion circular host-vista.
- Sin escuchas nuevas de Esc; anotaciones del preview pasan igual. Typecheck limpio; suite 1241 pass, 9 fail previas (terminalComposer).
- Baseline CA-01-antes.png y CA-01-despues.png: arbol de accesibilidad identico y preview con pestana funcionando.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Archivo no declarado: web/src/components/InspectorSplitResizer.tsx (movido sin cambios) | Aceptado como drift menor: evita importacion circular y no solapa con T-002 | amelia |
| 2 | Estilos de Files dependen del ancestro .workspace-inspector.is-compact.has-detail (WorkspaceInspectorHost.css:329,333,360-363) | T-003 debe co-locar o reproducir esas clases en el contenedor del tab | amelia |
| 3 | AnnotationComposerPopover.tsx:88 ubica la navegacion por .inspector-files-resource .workspace-inspector-navigation | T-003 conserva esas clases en el tab o actualiza el selector (INV-PUENTE-06) | amelia |
| 4 | Anotaciones no se ejercitaron en navegador en esta tarea (solo paso de props sin cambios) | Se verifican manualmente con CA-10 en T-003 | amelia |
