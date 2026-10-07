# T-004 Viabilidad de A2: acceso y extensibilidad de Herdr (frente F3)

Fecha de investigacion: 2026-10-07. Repo Roamgate en `dev` @ d703e6f.
Alcance: solo evidencia. No estima esfuerzo ni recomienda opciones (eso corresponde a la ficha A2 y a F5).

## Fuentes externas revisadas (2026-10-07)

| ID | Fuente | Ref / version |
|----|--------|---------------|
| EXT-1 | https://github.com/herdrdev/herdr (API GitHub `repos/herdrdev/herdr`) | `private: false`, licencia `Apache-2.0`, rama `master`; HEAD `4e624cd50e26f1284fed6e89f557479c235fcb8d` (2026-10-07T14:48:40Z) |
| EXT-2 | Ultimo release (API GitHub `releases/latest`) | `v0.9.3`, publicado 2026-09-29T19:29:23Z |
| EXT-3 | `docs/next/api/herdr-api.schema.json` en tag `v0.9.0` (ref de tag `cca4af8dfad160bc5fb5ae133b70882b5fe28f61`) | JSON Schema 2020-12 con `"protocol": 22`, `"schema_version": 1` (lineas 1-5) |
| EXT-4 | `docs/next/website/src/content/docs/socket-api.mdx` en tag `v0.9.0` | tabla de metodos (l.97-112), pane graphics (l.178-199), `plugin.pane.open` (l.628-640), `pane.report_metadata` (l.750-770) |
| EXT-5 | `docs/next/website/src/content/docs/plugins.mdx` en tag `v0.9.0` | l.31-33 limites de plugin v1 |
| EXT-6 | https://herdr.dev/docs/socket-api/ y https://herdr.dev/docs/plugins/ (sitio publicado, sin commit) | leidas 2026-10-07; corresponde a la version publicada vigente (v0.9.3 segun EXT-2) |

Nota: las lineas de EXT-3..EXT-5 son del archivo en el tag `v0.9.0` (la version que Roamgate instala y verifica); `agentos citas verificar` no aplica a fuentes externas.

## a) Accesibilidad del codigo/spec de Herdr

**Veredicto: `verificado` — accesible.**

| Afirmacion | Estado | Evidencia |
|---|---|---|
| El codigo fuente de Herdr es publico, en Rust, licencia Apache-2.0 | verificado | EXT-1 (API GitHub: `private:false`, `spdx_id: Apache-2.0`, HEAD 4e624cd5) |
| Existe spec formal del protocolo de control (JSON Schema) versionada con el numero de protocolo | verificado | EXT-3 (`"protocol": 22`, `"schema_version": 1`, tag v0.9.0) |
| Existe documentacion publicada del socket API y del sistema de plugins | verificado | EXT-4, EXT-5, EXT-6 |
| Roamgate descarga binarios oficiales desde ese mismo repo | verificado | `server/src/herdr/release.ts:65` (`https://github.com/herdrdev/herdr/releases/download/v${version}/`) |
| Roamgate fija la version verificada de Herdr en 0.9.0 / protocolo 22 | verificado | `server/src/herdr/release.ts:14`, `server/src/herdr/release.ts:15` |
| Roamgate se declara cliente comunitario independiente de Herdr (no es parte de Herdr) | verificado | `package.json:5` |
| El ultimo release de Herdr (v0.9.3) es posterior a la version que Roamgate verifica (0.9.0) | verificado | EXT-2 vs `server/src/herdr/release.ts:14` |
| La spec en el repo de Herdr esta bajo `docs/next/`; no se verifico si existe un schema distinto por release posterior a v0.9.0 | por-definir | Pregunta bloqueada: el schema de v0.9.3/master difiere en tabs/panes? Fuentes revisadas: EXT-3 (solo tag v0.9.0), EXT-6 (sitio vigente). Condicion de cierre: diff de `docs/next/api/herdr-api.schema.json` entre tag v0.9.0 y v0.9.3 (o HEAD 4e624cd5) en github.com/herdrdev/herdr |

## b) Contrato de tabs que usa el bridge hoy

**Veredicto: `verificado`.**

### Transporte y versionado

| Afirmacion | Estado | Evidencia |
|---|---|---|
| El bridge habla con Herdr por dos sockets: `herdr.sock` (control NDJSON) y `herdr-client.sock` (terminal binario) | verificado | `docs/ARCHITECTURE.md:17` |
| Rango de protocolo soportado: 14-20 y 22 (21 y desconocidos se rechazan) | verificado | `server/src/bridge/protocol-compat.ts:1`, `server/src/bridge/protocol-compat.ts:2`, `server/src/bridge/protocol-compat.ts:14`, `docs/DEPLOYMENT.md:24` |
| El protocolo se resuelve una vez por bridge | verificado | `server/src/bridge/terminal-bridge.ts:143` |
| Protocolo 22 = modo endpoint ("terminal hello"); habilita navegacion `browser-local`, si no `shared` | verificado | `server/src/bridge/protocol-compat.ts:20`, `server/src/bridge/terminal-bridge.ts:149` |

### Metodos tab.* y gating

| Metodo / evento | Quien lo invoca | Gating / tratamiento en bridge | Estado | Evidencia |
|---|---|---|---|---|
| `tab.list` | web (refresh) y runtime del server | passthrough | verificado | `web/src/store.ts:1335`, `server/src/connections/runtime.ts:414` |
| `tab.focus` | web | passthrough | verificado | `web/src/store.ts:2627` |
| `tab.create` | web | si trae `browser_source`, el bridge lo intercepta (`createFromTerminal`) y exige modo endpoint (protocolo 22); si no, passthrough | verificado | `web/src/store.ts:2643`, `server/src/index.ts:942`, `server/src/bridge/terminal-bridge.ts:953`, `server/src/bridge/terminal-bridge.ts:961`, `server/src/bridge/terminal-bridge.ts:974` |
| `tab.close` | web | passthrough | verificado | `web/src/store.ts:2715` |
| `tab.rename` | web | passthrough | verificado | `web/src/store.ts:2727` |
| `tab.move` | web | gating por version: protocolo >= 16 (Herdr 0.7.2+); el bridge expone `tab_move_supported` en `workspace.list` y el cliente bloquea si es falso | verificado | `server/src/bridge/terminal-bridge.ts:159`, `server/src/bridge/terminal-bridge.ts:160`, `server/src/index.ts:1285`, `web/src/store.ts:2735`, `web/src/store.ts:2745`, `docs/DEPLOYMENT.md:30` |
| Resto de metodos (incluido el passthrough general) | server | `herdr.call(method, params)` sin transformar | verificado | `server/src/index.ts:1271` |
| Eventos push `tab.created`, `tab.closed`, `tab.renamed`, `tab.focused` | runtime del server | suscritos y reenviados | verificado | `server/src/connections/runtime.ts:81`, `server/src/connections/runtime.ts:84` |
| `tab.get` (existe en Herdr) no se usa en el cliente web | inferencia | Deriva de: la busqueda de literales `"tab.*"` en `server/src`, `shared`, `web/src` (2026-10-07) devolvio solo list/focus/create/close/rename/move y los eventos; EXT-4 l.105 lista `tab.get` |

### Forma de los datos de tab

| Afirmacion | Estado | Evidencia |
|---|---|---|
| El tipo `Tab` del cliente tiene `tab_id`, `workspace_id`, `number`, `label`, `focused`, `pane_count`, `agent_status`; sin campo de tipo/kind ni metadata | verificado | `web/src/types.ts:66`, `web/src/types.ts:70`, `web/src/types.ts:73` |
| `TabInfo` de Herdr tiene exactamente esos mismos campos (`agent_status`, `focused`, `label`, `number`, `pane_count`, `tab_id`, `workspace_id`) | verificado | EXT-3 l.1032 (`TabInfo`), tag v0.9.0 |
| `TabCreateParams` de Herdr acepta `cwd`, `env`, `focus`, `label`, `workspace_id`; no acepta tipo/kind ni metadata | verificado | EXT-3 l.4339 (`TabCreateParams`), tag v0.9.0 |

## c) Punto de extension para tabs/panes de contenido no-terminal

**Veredicto: `verificado` — no existe en protocolo 22 / plugin v1 un punto de extension nativo para tabs o panes de contenido no-terminal.** Existen mecanismos adyacentes, todos sobre panes de terminal, listados abajo.

| Afirmacion | Estado | Evidencia |
|---|---|---|
| Herdr declara que la UI de plugin nativa no-terminal no forma parte de plugin v1 ("Runtime action registration and native non-terminal plugin UI are not part of plugin v1") | verificado | EXT-5 l.31-33 (tag v0.9.0); repetido en EXT-6 (https://herdr.dev/docs/plugins/, leida 2026-10-07) |
| Los panes de plugin (`[[panes]]`) se lanzan como pane de terminal respaldado por argv; `placement` admite `overlay`, `popup`, `split`, `tab`, `zoomed` | verificado | EXT-4 l.628-640 (`plugin.pane.open` ... "argv-backed terminal pane") |
| Roamgate ya usa ese mecanismo: su manifest declara un pane `panel` que ejecuta un comando y, con `--placement tab`, aparece como pane normal visible para otros clientes | verificado | `herdr-plugin.toml:4`, `herdr-plugin.toml:16`, `herdr-plugin.toml:28` |
| No hay campo de tipo de pane/tab en el schema (TabInfo/TabCreateParams sin kind; PaneInfo sin kind) | verificado | EXT-3 l.1032, l.4339, l.760 (tag v0.9.0) |
| Metadata reportable existe solo a nivel pane (`pane.report_metadata`: title, display_agent, state_labels, tokens) y workspace (`workspace.report_metadata`: tokens); es de presentacion ("display-only"); no hay equivalente `tab.report_metadata` | verificado | EXT-4 l.103, l.106, l.750-770 (tag v0.9.0); la fila Tab de EXT-4 l.105 no incluye report_metadata |
| Pane graphics (`pane.graphics.*`) permite a un plugin colocar imagenes sobre un pane de terminal; depende de `[terminal].kitty_graphics` | verificado | EXT-4 l.106, l.178-199 (tag v0.9.0) |
| Si alguna version posterior a 0.9.0 (0.9.1-0.9.3 o master) anade tipos de pane/tab no-terminal | por-definir | Pregunta bloqueada: hay cambios en tabs/panes/plugins entre v0.9.0 y HEAD 4e624cd5? Fuentes revisadas 2026-10-07: EXT-3..EXT-5 (tag v0.9.0), EXT-6 (sitio vigente, sin commit; sigue diciendo "plugin v1" sin UI no-terminal). Condicion de cierre: revisar `docs/next/CHANGELOG.md` y el diff del schema entre v0.9.0 y v0.9.3/HEAD en github.com/herdrdev/herdr |

## Resumen de veredictos

| Pregunta | Veredicto | Estado |
|---|---|---|
| a) Codigo/spec accesible | Si: repo publico Apache-2.0 + JSON Schema del protocolo 22 + docs | verificado (delta posterior a v0.9.0: por-definir) |
| b) Contrato de tabs del bridge | list/focus/create/close/rename/move + 4 eventos; tab.move gated por protocolo >= 16; tab.create con `browser_source` exige protocolo 22 | verificado |
| c) Punto de extension para tabs no-terminal | No existe en protocolo 22 / plugin v1; solo panes de plugin de terminal, metadata de pane/workspace y graphics sobre pane | verificado (versiones posteriores: por-definir) |
