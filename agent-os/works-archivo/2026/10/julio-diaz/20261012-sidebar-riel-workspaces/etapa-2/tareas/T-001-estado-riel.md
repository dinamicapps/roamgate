---
archivos:
  - accion: modificar
    ruta: web/src/App.tsx
  - accion: modificar
    ruta: web/src/app.css
  - accion: modificar
    ruta: web/src/styles/layout/sidebar.css
  - accion: modificar
    ruta: web/src/components/WorkspaceTree.tsx
cas:
  - CA-01
  - CA-08
depende_de: []
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 001: Estado del riel en App: persistencia, ancho, botones y mobile

El sidebar gana el estado `sidebarRail` (D1-D4 del plan).

## Subtareas

1. `sidebarRail` en App.tsx, leido y escrito con `roamgateLocalStorage` bajo la clave `sidebarRail`, como `sidebarWidth` (App.tsx:255, 386-396, 3757-3764). Helper puro de parseo con prueba.
2. `gridTemplateColumns` usa 52 px en riel y `!mobile`; `sidebarWidth` no cambia. El `.resizer` no arrastra en riel (App.tsx:4361-4365, startResize :3892).
3. WorkspaceTree recibe `rail` y `onRailChange` (solo desktop): boton de colapsar en el header de Workspaces y boton de ampliar arriba del riel (el riel en si lo pinta T-003; aqui un contenedor minimo).
4. `sidebarHidden`, Ctrl+Alt+B y Zen siguen igual (App.tsx:1661-1675): ocultan lo que haya y al volver se conserva el estado.
5. En mobile no se ofrece el boton y `rail` llega en falso.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-01 | Boton de colapsar y de ampliar, ancho previo, persistencia, sin efecto en mobile |
| CA-08 | Ctrl+Alt+B y Zen conservan el estado riel o ampliado |

## Ejecutor: amelia

### Que hizo

- sidebarRail.ts (clave sidebarRail, parse/serialize, 2 pruebas); App.tsx guarda y sincroniza entre pestanas el estado como sidebarWidth
- Riel de 52 px en gridTemplateColumns solo con !mobile; sidebarWidth intacto; resizer inerte en riel; LAYOUT_CHANGE_EVENT tambien al cambiar de riel
- WorkspaceTree recibe rail y onRailChange: boton Collapse sidebar en el header (tambien en estado vacio) y nav.workspace-rail con Expand sidebar
- sidebarHidden, Ctrl+Alt+B y Zen sin cambios; prueba de render del riel en WorkspaceTree.test.ts

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | terminalComposer.test.ts falla 9 pruebas en la suite web completa tambien en HEAD sin este work; pasa 20/20 aislado (dependencia de orden) | No lo causa este work; se vuelca a post-works al cierre | amelia |

## Verificador: quinn

### Que verifico

- CA-01: Collapse lleva al riel de 52 px y Expand vuelve a 340 px; sidebarRail persiste tras recargar; mobile 390x844 sin riel ni boton
- CA-08: Ctrl+Alt+B y Zen ocultan el sidebar y al volver conservan el riel

### Hallazgos de verificacion

(ninguno)
