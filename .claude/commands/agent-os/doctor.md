# /agent-os-doctor - Salud de la instalacion y ajustes guiados

Revisa la salud de la instalacion agent-os del repo actual, reconcilia knobs de
config nuevos (sin activar nada), reporta drift de version del distribuible, y
ofrece activacion asistida de autonomia por ruta. De cara al usuario: prosa +
seleccion; los verbos del runtime se invocan internamente.

## Uso

```
/agent-os-doctor
```

Sin argumentos. Opera sobre el repo actual (cwd).

## Cuando ejecutarlo

- Despues de actualizar el distribuible (project-install) en este repo.
- Cuando Claude mencione knobs/comportamientos que tu config no refleja.
- Como chequeo periodico de salud.

## Flujo

### Paso 0 - Detectar binario

Buscar `.claude/agent-os-bin/agentos` (o `agentos.exe`). Si NO existe: informar
"Runtime de agent-os requerido. Instalalo con el instalador del sistema." y abortar
(sin fallback).

### Paso 1 - Reconciliar config (no activa nada)

Invocar `agentos config migrate --all`. Parsear `{ok,data.resultados}`. Reportar
por archivo: claves agregadas (`cambios`) o "ya al dia". Esto solo rellena knobs
nuevos en OFF y normaliza versiones; **nunca** activa autonomia ni clobbea valores.

### Paso 2 - Declarar el lugar (zona horaria y pais)

Invocar `agentos session entorno`. Si el verbo falla (directorio no-git, binario
roto), reportarlo en una linea -- no es bloqueante -- y seguir al paso siguiente.

Si `data.lugar_declarado` es `true`, reportar en una linea el lugar declarado y
seguir al paso siguiente.

Si es `false`, detectar candidatos segun la plataforma y **proponerlos**:

| Plataforma | Pais | Zona horaria |
|------------|------|--------------|
| Windows | `/c/Windows/System32/reg.exe query "HKCU\Control Panel\International\Geo" //v Name` <!-- lint:allow C1 ruta-de-sistema-windows-fija --> — el valor es el codigo ISO-3166 alpha-2 | `TimeZoneKeyName` de `HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation`, traducido a IANA |
| Linux / macOS | region de `$LANG` (ej. `es_CO.UTF-8` -> `CO`) | `readlink /etc/localtime`, quedandose con el tramo tras `zoneinfo/` |

Notas de invocacion:
- En Git Bash, `reg.exe` va por **ruta absoluta** y sus flags con **doble barra**
  (`//v`): MSYS convierte `/v` en una ruta y la llamada falla. `tzutil` no sirve
  por la misma razon.
- No existe una tabla de mapeo Windows->IANA en el repo: la traduccion (ej.
  `SA Pacific Standard Time` -> `America/Bogota`) se apoya en el conocimiento
  general del agente sobre nombres de zona de Windows y su equivalente IANA.
  Si no reconoce la zona con confianza, decirlo y pedir el valor al usuario
  en vez de adivinar.

Presentar lo detectado y **pedir confirmacion explicita** antes de escribir. Con
la confirmacion, sembrar con:
`agentos config set --archivo agent-os-local --ruta entorno.zona_horaria --valor <zona>`
y `agentos config set --archivo agent-os-local --ruta entorno.pais --valor <pais>`.
Si la deteccion no da resultado, decirlo y ofrecer captura manual. **Nunca inventar un pais.**

Aclarar al usuario, en una linea, que `entorno.pais` es **donde corre la
maquina** — no la jurisdiccion normativa del producto, que es otro dato y no
sale de aqui.

### Paso 3 - Diagnosticar salud

Invocar `agentos config doctor`. Reportar la tabla: por archivo gestionado,
`existe`/`valido`/`version`/`problemas`. Si algun archivo es invalido, mostrar los
problemas y sugerir como corregirlos (no auto-corregir mas alla de migrate).

Invocar tambien `agentos meta doctor` y revisar el check `catalogo_versionado`:
si es `true`, alguno de los `_catalogo.yml` (derivados en memoria; el runtime
los reconstruye y el fisico se elimina solo) sigue trackeado en git. El
runtime solo detecta -- no muta git (frontera runtime/cognicion) -- asi que
el comando ejecuta el destrackeo:
```bash
git rm --cached --ignore-unmatch agent-os/work-records/_catalogo.yml agent-os/works-archivo/_catalogo.yml
```

Invocar tambien `agentos verificacion pendientes`. Lista las comprobaciones que
works ya cerrados dejaron diferidas al ambiente real, con su `responsable` y su
`revisar_el`. Reportar el total y, una por linea, las que traen `vencida: true`:
esas son confirmaciones que alguien debia hacer y no hizo — la fecha de revision
ya paso y el desenlace sigue sin registrarse. No es bloqueante y el comando no
resuelve ninguna: quien la comprueba registra su desenlace con
`agentos verificacion registrar`. Si el total es 0, una linea y seguir.

### Paso 4 - Drift del distribuible

Leer el marcador `<!-- agent-os:version vX.Y.Z -->` de `.claude/CLAUDE.md` del
proyecto y compararlo con el del template del repo agent-os (resolver `AGENT_OS_BASE`
como en `/agent-os-actualizar-claude-md` Paso 0). Si difieren, informar el drift y
sugerir `/agent-os-actualizar-claude-md` (NO ejecutarlo aqui).

### Paso 5 - Seed puntual de standards del sistema nuevos

Los standards que el sistema agrega en releases posteriores NO llegan solos a repos
ya instalados: `agent-os/standards/` es zona intocable en update (el paso "Instalar
standards" del installer solo corre en instalacion nueva). Este paso detecta y ofrece
cerrar ese rezago, sin tocar nada sin permiso:

1. Resolver la ubicacion del paquete/dist con el mismo mecanismo del Paso 4
   (`.claude/.agent-os-base`, con los mismos fallbacks — ver `/agent-os-actualizar-claude-md`
   Paso 0).
2. Listar los `.md` de `{AGENT_OS_BASE}/profiles/default/standards/` (o su equivalente
   en el dist) y compararlos por ruta relativa contra los `.md` que ya existen en
   `agent-os/standards/` del proyecto. Se compara siempre contra el perfil `default`
   del paquete — es el representante canonico (mismo criterio que el mapeo inverso
   del lint); los standards de overlay de otros perfiles son del proyecto y NO se
   comparan.
3. Si hay archivos del paquete ausentes en el proyecto, ofrecerlos con **AskUserQuestion**
   **uno a uno** (no en bloque) para que el usuario decida cada copia por separado.
4. **Nunca sobreescribir un archivo existente** en `agent-os/standards/` — es zona del
   proyecto; el usuario pudo haberlo editado. Este paso solo agrega lo que falta.
5. Si no hay faltantes, informar "standards al dia" y continuar.

### Paso 6 - Ajuste paso a paso del nivel de autonomia (el ajuste)

Leer el `nivel` de autonomia por ruta presente en config:
`agentos config get --archivo agent-os-local --ruta autonomia.rutas.bugfix.nivel`
(y el de otras rutas que existan, ej. `autonomia.rutas.fastrak.nivel`). El valor es
`minima` / `normal` / `maxima`; ausente = `normal` (comportamiento de hoy).

Ofrecer ajuste con **AskUserQuestion** (seleccion, no texto libre) por ruta:

- `minima` — el humano confirma cada decision intermedia (maxima supervision).
- `normal` (default) — confirma en gates de etapa; lo intermedio se agrupa.
- `maxima` — el modelo decide y registra `[AUTO]`; la verificacion automatica sostiene el gate.

El `nivel` gobierna solo cuantas confirmaciones ve el humano; el rigor (pool de lentes,
verificacion, aprendizaje) es siempre-activo en todos los niveles. Al confirmar:
`agentos config set --archivo agent-os-local --ruta autonomia.rutas.{ruta}.nivel --valor <nivel>`
(el runtime valida contra el schema `minima|normal|maxima`). Al declinar, NO tocar nada.
**El skill nunca cambia el nivel sin confirmacion explicita.**

### Paso 7 - Cierre

Resumir: reconciliacion aplicada, salud, drift de version (si lo hay), standards
nuevos copiados (si aplica), y autonomia activada/sin cambios. Sin proponer pasos
futuros no solicitados.

## Verbos de diagnostico (uso humano/directo)

Estos verbos no forman parte del flujo automatico de este comando; son para que
el mantenedor los invoque directo desde la terminal cuando necesita inspeccionar
el repo sin pasar por un agente.

| Verbo | Que hace | Cuando usarlo |
|-------|----------|----------------|
| `agentos config validate [--archivo <clave>]` | Valida el schema de uno o todos los archivos de config gestionados. | Tras editar un config a mano o antes de depender de un valor nuevo. |
| `agentos meta version` | Devuelve la version embebida del binario instalado. | Confirmar que version del runtime esta corriendo en este repo. |
| `agentos work list [--estado --autor --modo]` / `agentos work search --texto <texto>` / `agentos work tree --slug <slug>` | Consultas directas sobre works activos (listar/filtrar, buscar por texto en slug/meta, listar archivos de un work con su manifiesto). | Inspeccion humana rapida en terminal; el flujo gobernado usa `catalog show` en su lugar. |
| `agentos work file get --slug <slug> --ruta <ruta>` | Lee un archivo del work (frontmatter + cuerpo) sin pasar por Read/Edit. | Inspeccionar un artefacto hijo puntual desde la terminal. |

<!-- Los contratos de los verbos `config migrate`/`config doctor`/`config get`/`config set`, `session entorno` y de `meta doctor` (incluye el check catalogo_versionado) viven en el runtime. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Perilla de autonomia". La semantica del nivel vive alli. FUENTE de `autonomia.rutas`: agent-os/templates/work-record/schema/perilla-y-meta.md. NO duplicar. -->
<!-- FUENTE: .claude/commands/agent-os/actualizar-claude-md.md Paso 0. La resolucion de AGENT_OS_BASE vive alli; aqui solo se reusa para el drift de version. NO duplicar. -->
