---
archivos:
  - accion: modificar
    ruta: web/src/components/TabBar.tsx
  - accion: modificar
    ruta: web/src/App.tsx
cas:
  - CA-21
  - CA-22
depende_de:
  - T-003
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 4
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 006: Arrastre al strip y navegacion mobile

Conservar el gesto de arrastrar rutas a la terminal y adaptar la navegacion mobile al tab de archivos.

## Subtareas

1. Durante un arrastre de ruta, mantener el puntero sobre el tab de una consola la activa (REG_drop_hover_activa_consola).
2. Mobile: los botones Files y Terminal de la nav alternan entre el tab de archivos y la consola (MobileView App.tsx:349).
3. El tab de archivos no cuenta para mostrar el strip ni se lista en MobileTabSheet.

## Verificacion

1. Manual: CA-21 en desktop y CA-22 en viewport mobile.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-21 | ESC_P3_drag_ruta_a_terminal: arrastrar una ruta sobre el tab de una consola la activa para soltar en su terminal | REG_drop_hover_activa_consola |
| CA-22 | ESC_P3_mobile_nav: en mobile Files/Terminal alternan; el tab no cuenta para el strip ni aparece en MobileTabSheet | DEC_D9_nav_mobile |

## Ejecutor: amelia

### Que hizo

- tabDragHover.ts: createDragHoverActivator (500 ms, temporizador inyectable) y showsTabStrip; 8 pruebas.
- TabBar: el tab de consola activa su superficie tras 500 ms de hover con una ruta (application/x-roamgate-path); el reorder por pointer events no se afecta.
- Nav mobile: Files abre o enfoca el tab de la consola activa y Terminal vuelve a la consola (showConsoleSession); el active refleja la superficie visible.
- El tab de archivos no cuenta para showTabStrip ni se lista en MobileTabSheet; se elimino openFileExplorer sin llamadores.
- Anfitriona: MobileTabSheet onShowSession pasa a showConsoleSession para que elegir la consola duena muestre la consola (P3).
- Suite 1266+ pass, 9 fail previas; navegador mobile 390x844: Files/Terminal alternan con active correcto y badge 5 sin contar el tab; captura CA-22-despues.png.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | MobileTabSheet onShowSession no limpiaba el tab de archivos al elegir la consola duena (App.tsx:4158) | Corregido por la anfitriona: usa showConsoleSession | amelia |
| 2 | En mobile el strip no se desplaza hasta el tab de archivos activo, que queda fuera de pantalla | Cosmetico; se registra para E4 sin bloquear | amelia |
| 3 | FilesTabSurface.css conserva borde y radio de 10px en mobile, a diferencia de las demas vistas mobile | Cosmetico; se consolida con los estilos en T-007 | amelia |
| 4 | CA-21 (hover de arrastre) no se ejercito en navegador: el arrastre HTML5 no se reproduce con eventos sinteticos de forma fiable y activaria otra consola del Herdr real | Cubierto por pruebas unitarias; verificacion manual en E4 | amelia |

## Verificador: quinn

### Que verifico

- CA-22: nav mobile 390x844 alterna Files/Terminal con active correcto y el tab no cuenta en el badge (CA-22-despues.png).

### Hallazgos de verificacion

| # | Hallazgo | Severidad | Estado |
|---|----------|-----------|--------|
| 1 | CA-21 (arrastre HTML5) diferido; cubierto por tabDragHover.test.ts | menor | diferido |
