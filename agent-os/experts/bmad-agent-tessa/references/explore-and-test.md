---
name: explore-and-test
description: Explorar aplicacion via MCP Playwright y generar tests E2E deterministas
menu-code: E2E
---

# Explorar y Testear con Playwright MCP

**Goal:** Navegar la aplicacion interactivamente via MCP Playwright, explorar flujos de usuario, detectar problemas, y generar tests .spec.ts deterministas que corran en CI sin AI.

## Contexto del usuario

Antes de navegar, entender que se quiere testear:

- URL de la aplicacion y credenciales si requiere auth
- Flujos criticos a cubrir (o explorar para descubrirlos)
- Entorno: desarrollo, staging (nunca produccion para pruebas activas)
- Viewport objetivo: desktop, tablet, mobile, o todos

Si el usuario no tiene flujos definidos, explorar la app y proponer los top 5-10 flujos criticos basados en la complejidad y el riesgo observado.

## Herramientas MCP Playwright disponibles

### Navegacion
- `browser_navigate(url)` -- navegar a URL
- `browser_navigate_back` -- atras
- `browser_forward` -- adelante
- `browser_reload` -- recargar
- `browser_tab_list` / `browser_tab_new(url?)` / `browser_tab_select(index)` / `browser_tab_close(index?)` -- gestion de tabs

### Observacion (core del loop)
- `browser_snapshot()` -- accessibility tree completo (PREFERIDO -- barato en tokens, rico en estructura)
- `browser_take_screenshot(raw?)` -- captura visual (solo cuando se necesita validacion visual)
- `browser_console_messages` -- errores y warnings de consola
- `browser_network_requests` -- requests HTTP (detectar 4xx, 5xx, requests lentos)

### Interaccion (siempre verificar ref en snapshot antes de usar)
- `browser_click(element, ref)` -- click por referencia del accessibility tree
- `browser_type(element, ref, text, submit?)` -- escribir texto
- `browser_select_option(element, ref, values)` -- seleccionar en dropdown
- `browser_check(element, ref)` / `browser_uncheck(element, ref)` -- checkboxes
- `browser_hover(element, ref)` -- hover
- `browser_press_key(key)` -- tecla especifica
- `browser_file_upload(paths)` -- subir archivos
- `browser_handle_dialog(accept, promptText?)` -- manejar alerts/confirms/prompts
- `browser_drag(startElement, startRef, endElement, endRef)` -- drag and drop

### Generacion de tests
- `browser_generate_playwright_test()` -- genera .spec.ts a partir de las acciones MCP realizadas (KILLER FEATURE)

### Utilidades
- `browser_evaluate(expression)` -- ejecutar JavaScript en la pagina
- `browser_resize(width, height)` -- cambiar viewport
- `browser_close` -- cerrar browser

## Flujo de exploracion

El loop central es: **navigate -> snapshot -> analyze -> act -> snapshot**

### Primera pasada: llegada como usuario (obligatoria por pantalla)

La PRIMERA vez que la exploracion toca una pantalla del alcance, se llega COMO
USUARIO: desde el home autenticado, recorriendo la cadena de navegacion (menus,
acciones, pantallas previas donde se recolectan los prerequisitos), no con
`browser_navigate` directo a la URL destino. La ruta es el **contexto de llegada**
de la pantalla (concepto definido en la pregunta 5 del discovery de /disenar; sin
marcador FUENTE aqui porque la ruta relativa al template difiere entre nebulosa y
consumidor): sale del plan de prueba (campo "Ruta de llegada" del checkpoint) o
de la entrada de la pantalla en `agent-os/product/mapa-llegada.md`.

- La secuencia de llegada se captura como evidencia (snapshots/capturas de los
  pasos clave — ver "Artefacto de evidencia UI" abajo).
- Si la llegada FALLA (menu ausente, permiso que bloquea, prerequisito
  inalcanzable), eso es un hallazgo de primera clase del work — no un obstaculo
  a esquivar navegando directo.
- Iteraciones posteriores sobre la misma pantalla ya verificada pueden usar
  `browser_navigate` directo por eficiencia.
- Excepcion declarada (pantalla sin entrada de menu: tool dev gateada,
  deep-link): se navega directo y se registra la razon en el checkpoint.

### Patron defensivo

Antes de cada interaccion:
1. Tomar snapshot
2. Verificar que el elemento objetivo existe (buscar ref en el accessibility tree)
3. Si no existe, diagnosticar: esta cargando? hay un dialog bloqueante? cambio la pagina?
4. Solo interactuar cuando el ref esta confirmado

### Monitoreo continuo

Durante toda la exploracion mantener atencion a:
- Errores de consola (`browser_console_messages`) -- JavaScript errors, warnings, deprecations
- Requests fallidos (`browser_network_requests`) -- 4xx, 5xx, timeouts
- Estados de la UI: loading spinners que no desaparecen, formularios sin validacion, botones deshabilitados sin razon aparente

### Multi-viewport

Para flujos criticos, repetir en al menos 2 viewports:
- Desktop: `browser_resize(1280, 720)`
- Mobile: `browser_resize(375, 812)`

Reportar diferencias significativas (elementos que desaparecen, layouts rotos, interacciones que fallan en mobile).

## Generacion de tests

Despues de explorar un flujo completo:

1. Llamar `browser_generate_playwright_test()` para obtener el .spec.ts basado en las acciones realizadas
2. Revisar el test generado: locators semanticos, assertions significativas, waits apropiados
3. El test debe ser determinista -- debe correr sin AI, sin MCP, directamente con `npx playwright test`
4. Si el test necesita ajustes (mejores locators, assertions adicionales, manejo de estados intermedios), aplicarlos
5. Guardar en la ubicacion apropiada del proyecto (generalmente `tests/e2e/` o `e2e/`)

### Criterios de calidad del test generado

- Locators semanticos (getByRole, getByLabel, getByText) sobre selectores CSS fragiles
- Assertions que validan el resultado visible del usuario, no implementacion interna
- Sin hardcoded waits -- usar auto-wait de Playwright o waitFor explicitos cuando necesario
- Independencia: cada test arranca desde un estado conocido
- Nombres descriptivos: `should complete checkout with valid credit card` no `test checkout 1`

## Validacion de estados

Cada flujo explorado debe verificar al menos estos estados:
- **Happy path** -- flujo completo exitoso
- **Error** -- que pasa con datos invalidos
- **Empty** -- como se ve sin datos
- **Loading** -- transiciones y estados intermedios

## Output

Al completar la exploracion y generacion:

> **Flujo:** {nombre del flujo}
> **Pasos explorados:** {N}
> **Tests generados:** {archivos .spec.ts creados}
> **Errores detectados:** {consola, red, UI}
> **Accesibilidad:** {hallazgos rapidos del accessibility tree}
> **Coverage de estados:** happy path / error / empty / loading

Actualizar memoria con los flujos explorados y su estado.

## Artefacto de evidencia UI (works desde 2026-06-09, modo normal o ruta `rediseno-ui`)

Cuando la tarea declara `evidencia_requerida.ui: true`, Tessa produce en `etapa-4/evidencia/ui/`
(reusando la mecanica de captura+anotacion de `visual-documentation.md`):
- Una captura del estado final que prueba cada CA de UI (`T-NNN-CA-NNN-{paso}.png`).
- La secuencia completa para flujos multi-paso (wizard de 3 pantallas = 3 capturas ordenadas).
- Si hay brecha: captura del estado defectuoso, anotada con esperado vs visto.
- Un `_indice.md` que narra cada captura por CA (obligatorio; sin el, el PNG es opaco).

Si el usuario conduce el navegador (opcion b de Fase 2), Tessa sigue siendo responsable del artefacto:
captura o solicita las capturas y arma el indice. Quinn audita en EV-1..EV-4. Contrato en
`agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`.

### Llegada verificada -> mapa de llegada

Cuando la primera pasada verifico la llegada de una pantalla, Tessa ademas:

- Incluye en `_indice.md` la subseccion "Llegada" de esa pantalla: cadena
  recorrida, prerequisitos usados (y de donde salieron) y receta del dato de
  prueba empleado.
- **Actualiza `agent-os/product/mapa-llegada.md`**: crea o refresca la entrada
  de la pantalla (schema del seed `agent-os/templates/mapa-llegada/mapa-llegada.md`;
  si el archivo vivo no existe, lo crea desde ese seed). La entrada lleva citas
  ancladas y el campo Verificado con fecha + work.
- Si la entrada previa del mapa estaba podrida (el camino real difiere), la
  corrige en este mismo work y lo anota como hallazgo en `_indice.md`.

### Produccion de la rubrica CU (calidad de UI)

Cuando la tarea declara `evidencia_requerida.ui: true`, Tessa ademas produce
los chequeos CU-1 (controles), CU-2 (estados), CU-4 (medicion perceptual sobre
el DOM) y CU-5 (vista de produccion, no harness) y escribe el resultado por
pantalla en `_indice.md` seccion "Calidad UI (CU)". Sally emite el veredicto de
CU-3 y el juicio de CU-4; Quinn audita.

<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-4/calidad-ui.md seccion "La rubrica CU". Los chequeos, roles y formato del resultado escrito viven alli. NO duplicar la regla — para modificar, editar la fuente. -->
