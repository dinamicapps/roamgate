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
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
fase: 4
file_type: tarea-etapa-2
standards_cargados: []
status: pending
tipo_tarea: codigo
verificador: null
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
