<!-- agent-os:start -->
<!-- agent-os:version v0.42.0 -->

> **PRIMERO: lee `.claude/MANIFIESTO.md`.** 9 principios universales (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution, Source-of-Truth Hierarchy, Audit Before Closing, Trabajo Conectado, Honestidad Epistemica, Interlocucion Concreta) que cualquier agente del sistema aplica SIEMPRE.

# Agent OS DinamicAPPS

Este proyecto usa Agent OS DinamicAPPS: trabajo estructurado con etapas, gates de aprobacion y standards de codigo. Este archivo es solo el arranque; la mecanica del flujo se lee bajo demanda (ver "Donde vive la mecanica del flujo").

## Comportamiento al iniciar sesion

**OBLIGATORIO**: al inicio de cada conversacion nueva, ANTES de responder al usuario:

1. Obtener los works activos con `agentos catalog show` (el runtime reconstruye el catalogo en memoria a partir de los README; no hay archivo fisico que leer). Incluye EN_PROGRESO, PAUSADO, EN_PAUSA, EN_PAUSA_POR_DISENO, PRE_CIERRE.
2. Si hay trabajos activos, informar al usuario:

   ```
   Proyecto con Agent OS. {N} trabajo(s) activo(s):
   - {nombre}: Etapa {N} - {descripcion_etapa} [{Estado}]

   Usa `/alfred continuar` para retomar, o continua con lo que necesites.
   ```

3. Si NO hay trabajos activos, solo mencionar brevemente:

   ```
   Proyecto con Agent OS activo. Usa /alfred "descripcion" para iniciar trabajo estructurado.
   ```

4. Luego, responder normalmente al usuario.

## Entrada canonica: `/alfred`

Toda peticion de trabajo se canaliza via `/alfred`, que destila la ruta correcta en su abordaje. Con `alfred.gobierno: true` (default) los hooks de sesion y de prompt reorientan hacia el; se cancela con `/alfred gobierno off` (solo esta sesion) o `/alfred gobierno off definitivo` (config del repo).

| Comando | Funcion |
|---------|---------|
| `/alfred "descripcion"` | Iniciar trabajo. Abordaje -> ruta -> piezas |
| `/alfred continuar` | Retomar trabajo en progreso o pausado |
| `/alfred estado` | Ver estado del trabajo activo |
| `/disenar iniciar "descripcion"` | Atajo a la ruta de diseno |
| `/expediente` | Cumplimiento normativo: norma -> requisitos -> gap |
| `/roadmap` | Epicas del roadmap del producto |
| `/post-works` | Pendientes post-work no bloqueantes |
| `/discover-standards`, `/inject-standards` | Extraer o inyectar standards del codebase |
| `/agent-os-doctor` | Salud de la instalacion y activacion de knobs |
| `/agent-os-actualizar-claude-md` | Sincronizar este bloque con el template |

Los subcomandos de `/alfred` (`listar`, `history`, `nivel`, `regresar`, `pausar`, `reevaluar`, `grupo`, `contrato`, `maintain`, `learn`, `zoho-*`, `revisar-qa`) estan documentados en `.claude/commands/agent-os/alfred.md`, que se carga al invocarlo.

### Invocacion del runtime (agentos)

El binario del runtime NO esta en PATH. En este repo se invoca SIEMPRE como:

    .claude/agent-os-bin/agentos.exe <dominio> <verbo> [flags]

Toda la prosa del sistema escribe `agentos X` como NOTACION; esta seccion es la
regla de resolucion (fuente unica). Contrato de cualquier verbo (flags, payload,
ejemplo, guards): `agentos help <dominio> <verbo>`; descubrimiento: `agentos help`.
Un error de USO siempre apunta al help del verbo. NUNCA concluir "el CLI no esta"
sin probar la ruta completa.

Para saber cuando y donde corre esta sesion (fecha, dia de semana, hora local,
offset UTC, instante UTC, zona horaria y pais) invoca `agentos session entorno`. El hook de
arranque emite el instante de inicio, pero envejece durante la sesion: **para la
hora actual, re-invoca el verbo** en vez de citar la del arranque o inferirla.
Si reporta `lugar_declarado: false`, la zona y el pais no estan configurados y
`/agent-os-doctor` los declara.

## Estructura del proyecto

- `agent-os/standards/` â€” standards de codigo del proyecto (indice en `index.yml`)
- `agent-os/product/` â€” mision, roadmap, tech-stack, mapa de llegada
- `agent-os/work-records/` â€” works activos; al cerrar se archivan solos en `agent-os/works-archivo/AAAA/MM/autor/`
- `agent-os/post-works/_pendientes.md` â€” pendientes no bloqueantes que sobreviven al work
- `.claude/commands/agent-os/` â€” comandos del sistema
- `.claude/agent-os.local.json` â€” ajustes de comportamiento por repo (gitignoreado; si falta un campo se usan defaults, sin error)

Los README de los works son la fuente de verdad; `agentos catalog show` es la via confiable para listarlos y consultarlos sin abrir cada uno.

## Standards

Antes de escribir codigo fuera de un work gestionado por `/alfred`, consultar `agent-os/standards/index.yml` para identificar standards aplicables y leer los relevantes. Dentro de un work, los expertos los cargan por su cuenta segun el dominio de cada tarea.

## Donde vive la mecanica del flujo

No leas nada de esto hasta necesitarlo: cada comando y cada skill carga su propia cadena al activarse. Esta tabla existe para que sepas que la regla existe y donde esta.

| Tema | Fuente |
|------|--------|
| Etapas, anfitriones, prefijos, senales de drift, perilla de autonomia, rumbos del hallazgo, higiene de contexto | `agent-os/skills/host-protocol/SKILL.md` |
| Autoridad en brownfield, cita anclada, interlocucion concreta (el como de P9), despacho de subagentes, herramientas diferidas | `agent-os/skills/host-protocol/references/` |
| Capa de seguridad, evidencia verificable, calidad de UI, logs temporales, verificacion en dos fases | `agent-os/skills/host-protocol/etapas/` |
| Rutas canonicas, abordaje con evidencia, bugfix forense, gobierno, cierre y aprendizaje | `agent-os/experts/bmad-agent-alfred/` |
| Schema del work-record y de la tarea | `agent-os/templates/work-record/frontmatter-schema.md` |
| Carga de standards, ejecucion del sistema, Zoho Sprints, expediente normativo | `agent-os/skills/cargar-standards/`, `agent-os/skills/run-system/`, `agent-os/skills/zoho-sprints-integration/`, `agent-os/skills/expediente/` |
| Bridge multi-repo: grupos, sesiones de prueba, ciclo worktree | `agent-os/skills/bridge-session/` |
| Doctrina propia del sistema: DRY, cohesion, capas, comentarios con merito | `agent-os/doctrina/` |

## Perfil

Perfil instalado: default

## Mantenimiento de este archivo

El contenido entre `<!-- agent-os:start -->` y `<!-- agent-os:end -->` se sincroniza con el repo agent-os. Para actualizarlo:

```
/agent-os-actualizar-claude-md
```

El comando lee la version embebida (`<!-- agent-os:version vX.Y.Z -->`), la compara con la del template, muestra el changelog aplicable y actualiza con tu confirmacion. **Contenido fuera de los marcadores es tuyo y no se toca.** Si agregas contenido dentro del bloque, el comando lo detecta y te ofrece preservarlo.

Tras actualizar (o periodicamente), corre `/agent-os-doctor`: reconcilia los knobs de config nuevos sembrandolos en OFF, reporta la salud de los archivos gestionados, detecta drift de version del distribuible y ofrece activar autonomia por ruta. Nunca activa nada sin tu confirmacion.
<!-- agent-os:end -->

## Memoria de este repositorio

> Esto es tuyo. agent-os no lo toca. Escribe aqui solo lo que se necesita SIEMPRE;
> lo extenso vive en `agent-os/product/`, `agent-os/standards/` o su propio documento.

### Stack y como se corre

### Convenciones no obvias

### Trampas conocidas

### Documentos propios

| Documento | Cuando leerlo |
|-----------|---------------|
