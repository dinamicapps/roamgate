# Mantenimiento: Learn (cosecha de memoria de expertos + destilado retroactivo)

> Gobierno de la cosecha post-cierre: memoria de expertos (sidecars) + destilado retroactivo de standards. Alfred porta el GOBIERNO (gate de estado terminal de entrega, categorías, cadencia, resolución de conflictos). El MOTOR se invoca directamente: subagentes por experto (Agent tool), capacidad `[DT]` (skill `destilar-standard`). Alfred NO depende del cuerpo de `work-learn.md` legacy.

## Regla fundamental

**Solo works en estado terminal de entrega alimentan el aprendizaje** — `COMPLETADO`,
`COMPLETADO_CON_BRECHA` y `COMPLETADO_VERIFICACION_DIFERIDA`. Gate obligatorio en cada
subcomando que lee un work: si el estado no es uno de esos tres, detener con mensaje.

## Frontera gobierno / motor

| Se porta (gobierno) | Se invoca (motor estable) |
|---|---|
| Gate de estado terminal de entrega, 4 categorías de memoria, cadencia, merge devs→principal, resolución de conflictos (AskUserQuestion), autoridad del humano que consolida / autoridad director para destilar | subagentes por experto (Agent tool), capacidad `[DT]` (skill `destilar-standard`), escritura de sidecars `_bmad/memory/{experto}-sidecar/` |

## Tres canales, cadencias distintas

- **Memoria de expertos** (`{work-id}`, `batch`, `consolidar`, `status`): alimenta sidecars privados con 4 categorías (heurísticas privadas, anti-patrones propios, decisiones de usuario sobre fine-tuning, sintonización de persona). Cada dev procesa; el lead consolida.
- **Standards del repo** (`destilar {work-id}`, `destilar batch`): detecta convenciones tácitas en bitácoras nunca destiladas como standards e invoca `[DT]`. Afecta el repo compartido — autoridad del director.
- **Reflexion verificada -> ADN** (`consolidar-reflexiones`): buffer drenable que cada agente (incluido Alfred) llena al cerrar un work con su reflexion verificada (5 categorias, evidencia anclada). Se cura y promueve al ADN SOLO en el repo origen. Distinto de la memoria viva: la reflexion NO se consulta, se promueve y se vacia. Ver `consolidar-reflexiones.md` y `references/reflexion-adn.md`.

Independientes: un work puede tener memoria extraída sin destilar, y viceversa.

## Subcomandos

> Los comandos `/alfred learn` orquestan lo cognitivo (redactar learnings, destilar estandares, redactar reflexiones). El estado/forma/persistencia los gobierna el runtime, requerido y sin fallback en prosa: `agentos learn pendientes` (backlog de cosecha), `agentos learn marcar --capa {capa}` (registrar dimension cosechada, con validacion anti-mentira), `agentos learn validar-candidato --experto {x}` (validar el schema y depositar la reflexion en el buffer), `agentos learn omitir --razon "..."` (eximir un work de cosecha por decision del usuario; invisible en el backlog, reversible con `--deshacer`).

- `/alfred learn {work-id}` — gate de estado terminal de entrega. Determina `modo` del work (las categorías valiosas cambian por modo y etapa). Deriva participantes de los bloques `## Ejecutor: {agente}` / `## Verificador: {agente}` de las tareas materializadas, mas los prefijos `A-{experto}`/`I-{experto}` del README y la bitácora — **no** de archivos `experto-*.md` (huérfanos eliminados por política del repo, ya no existen como fuente). Por cada experto participante, invoca subagente con prompt de extracción de las 4 categorías + test de pertenencia (excluir standards/reglas de negocio/arquitectura/ya-documentado). Append a `_bmad/memory/{experto}-sidecar/devs/{dev}/learnings.md`, entry con `origen_work` + `evidencia`-ancla (schema abajo). Actualiza `cosecha.memoria_expertos` en el README (no en catálogo). Si ya ejecutado: AskUserQuestion acumular/saltar.
- `/alfred learn batch` — barre works en estado terminal de entrega sin `aprendizaje_extraido`. AskUserQuestion (todos/seleccionar/cancelar). Ejecuta `{work-id}` secuencial.
- `/alfred learn consolidar` — **autoridad del humano que consolida** (quien integra a `main`, en su máquina; gate único y serial, sin concurrencia de writes). Dos fases por experto:

  **Fase aditiva (existente).** Merge `devs/{dev}/learnings.md` → `patterns.md`. Subagente detecta COMPATIBLES/CONFLICTOS/OBSOLETOS entre devs. Conflictos → AskUserQuestion (mantener/adoptar/fusionar/descartar).

  **Fase sustractiva (purga, dos disparadores independientes).**
  - **Disparador A — entrante vs existente.** Agrupa entrante-vs-existente por **mismo tema**: mismo componente/API/identificador mencionado, o misma categoría — nunca coincidencia léxica ni "mismo archivo" (es el centro blando del mecanismo). **Prueba de supersesión:** solo propone retiro ante un reemplazo deliberado del mismo asunto, con la `evidencia`-ancla del entrante como material verificable — nunca ante coexistencia o matiz. Candidata: `por_work` = `origen_work` del entrante, `reemplazada_por` = heurística entrante, `evidencia` = ancla del entrante. Gate por `nivel`: `minima` confirma c/u, `normal` confirma en lote por experto, `maxima` puede **auto-jubilar** (`[AUTO]` + resumen).
  - **Disparador B — memoria vs standard.** Independiente de works. Mapeo estable experto→dominio: Amelia/Sally→`frontend`, Dexter→`database`, Sentinel→`security`, Winston→`architecture` (Mary/Bob/Quinn/Paige no tienen dominio-standard: omiten B). Confronta `patterns.md` texto-vs-texto contra los standards vigentes del dominio. Antes de confrontar un par (entrada, standard), consulta `reconciliados.md`: si el par ya fue dirimido compatible y el standard **no cambió después** (git-date del archivo del standard <= `fecha` del par), lo **salta**. Resultado de un par no reconciliado que contradice el standard:
    - standard **fresco** → candidata a retiro, `por_work: "standard/{ruta}"`. **Siempre confirma** (nunca auto, tampoco en `maxima`).
    - standard **stale** (git-date viejo) o la memoria parece mejor ley → no se retira: **escala a `[DT]`** (capacidad `destilar-standard`; ver marcador FUENTE abajo). B nunca promueve ni enmienda el standard por sí mismo — lo rompe la confirmación del humano, no la jerarquía de dominio de `[DT]` por sí sola.
    - el humano dictamina **compatible** → `agentos learn reconciliar --experto {x}` (no se vuelve a molestar salvo que el standard cambie).

  **Precedencia A/B.** Si ambos disparadores marcan la misma entrada, se deduplica a **una sola lápida** con `por_work` de **A** (más específico, trae evidencia de work); el hallazgo de B se anota en la `razon`.

  **Reintroducción visible.** Un learning entrante que reintroduce algo con lápida en `retirados.md` no se descarta en silencio: pasa a la **lista de conflictos** del humano (mantener jubilado / re-abrir).

  **Jubilación manual.** El humano que consolida puede jubilar una entrada por juicio propio, sin work de por medio: `por_work: "consolidacion-manual/{fecha}"` (exenta de `evidencia`-ancla). Siempre explícita, en cualquier `nivel`.

  **Contradicciones internas** que ningún disparador resuelve se **superficializan** siempre; nunca se auto-retiran.

  **Persistencia (Opción B, desacople runtime/cognición).** Por cada candidata confirmada (o auto-jubilada en `maxima`), la **cognición remueve ella misma la entrada de `patterns.md`** al reescribirlo (formato libre markdown rico; el runtime nunca lo toca) y luego invoca `agentos learn retirar --experto {x}` (registra la lápida en `retirados.md` con guard anti-doble-lápida + purga los pares huérfanos de `reconciliados.md`). Por cada par dirimido compatible, invoca `agentos learn reconciliar --experto {x}` (el `entrada` del par usa el texto exacto de la heurística en `patterns.md`, para que el purgado de huérfanos al retirar la empareje). `index.md` del sidecar registra la corrida: `consolidacion vN: +A adiciones, -R retiros (Ra por-work, Rb por-standard, Rm manual)`. Schema completo de la lápida y del par reconciliado: ver marcador FUENTE abajo.

  **Nota operativa — primera consolidación en frío.** Sin `reconciliados.md` previo, B corre contra todo `patterns.md` de cada experto de dominio vs todos sus standards; puede producir muchas candidatas de golpe — esperado, no un bug. Tratarla como **evento consciente** en `minima`/`normal`; nunca correr esa primera pasada en `maxima`.

  Aplica igual a la forma de Dexter: cuerpo activo `normas-tacitas.md` + `derivas/` en vez de `patterns.md`; la lápida se registra uniforme, sin lógica especial por experto.

  Cierra regenerando `patterns.md`, borrando `learnings.md` de los dev consolidados, y subiendo `version` en `index.md`.
- `/alfred learn status` — reporte: works con/sin extracción de memoria, con/sin destilado retroactivo; tabla por experto (versión, último sync, entries pendientes); standards generados por dominio.
- `/alfred learn destilar {work-id}` — **autoridad director.** Gate de estado terminal de entrega + flag `convenciones_destiladas_retroactivamente`. Detecta convenciones tácitas, invoca `[DT]` por candidata con doble revisión. Marca el flag al completar.
- `/alfred learn destilar batch` — destilado a todos los works en estado terminal de entrega no destilados.
- `/alfred learn consolidar-reflexiones` -- **autoridad director, SOLO repo origen.** Drena el buffer de reflexion de uno o varios agentes hacia el ADN: re-deriva causa, aplica gate constitucional + gate del director, edita el ADN en este repo, vacia el buffer. Ver `consolidar-reflexiones.md`.
- `/alfred learn reconstruir-atlas` -- **autoridad director, SOLO repo origen.** Regenera la capa de dominio de Atlas como vista materializada de los especialistas (destilar + gate de fidelidad + sobrescribir). Ver `reconstruir-atlas.md`.

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Cosecha post-cierre (5 capas)". Schema de cosecha y memoria_expertos. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de la lapida (retirados.md), el par reconciliado (reconciliados.md), la entry de learnings.md (origen_work+evidencia) y el registro de retiros en index.md. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md. Capacidad [DT] que produce los archivos de standard, incluida la escalacion desde el disparador B de consolidar. Se invoca, no se porta. -->
