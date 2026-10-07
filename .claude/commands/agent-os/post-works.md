# /post-works — Revisar y procesar pendientes post-work

Comando opt-in para revisar el archivo `agent-os/post-works/_pendientes.md` del proyecto, procesar items pendientes uno por uno, y decidir su destino: convertirlos en `/alfred` nuevos, descartarlos con razon, o dejarlos vivos.

**El sistema NO dispara este comando automaticamente.** No hay cron, no hay loop, no hay recordatorio. El usuario lo invoca cuando tiene capacidad o cuando va a planear el siguiente bloque de trabajo.

## Uso

```
/post-works revisar          # flujo principal: lista pendientes y procesa uno por uno
/post-works listar           # solo listar sin procesar
/post-works status           # conteo + antiguedad de pendientes
```

## Por que existe

El rumbo 2 (`agent-os/post-works/_pendientes.md`) acumula hallazgos que deben resolverse "pronto" tras cerrar un work, pero no son bloqueantes del cierre. Sin un mecanismo de procesamiento, ese archivo se convierte en un cementerio de notas que nadie lee. Este comando hace al rumbo 2 procesable sin convertir al sistema en un alarmista.

Ver `agent-os/skills/host-protocol/SKILL.md` seccion "Principio del huevo y rumbos del hallazgo" para el contexto del rumbo 2.

## Flujo de `/post-works revisar`

### Paso 1 — Leer el archivo de pendientes

Ruta: NO hardcodeada. Leer `agentos config get --archivo agent-os-local --ruta rumbos.destino_rumbo_2` (`{ok:true,data:{valor}}`, o `{ok:false,error.codigo:NO_EXISTE}` si ausente -> default `agent-os/post-works/_pendientes.md`). Si no existe el archivo resuelto, mensaje:

```
No existe {ruta resuelta}. Se crea automaticamente cuando un work cierra
con hallazgos rumbo 2. Por ahora, no hay nada que revisar.
```

Termina sin error.

### Paso 2 — Parsear items

El archivo tiene una tabla principal con columnas: `id`, `resumen`, `work_origen`, `volcado_en`, `prioridad`, `estado` (donde `estado in [pendiente | en-proceso | descartado | promovido-a-work | resuelto]`).

Filtrar items con `estado: pendiente` o `estado: en-proceso`.

### Paso 3 — Mostrar resumen agregado

```
El destino configurado (default agent-os/post-works/_pendientes.md) tiene {N} items pendientes:

  - {N1} items de hace mas de 30 dias (potencialmente olvidados)
  - {N2} items de los ultimos 30 dias

Works origen mas frecuentes:
  - {work-1}: {n1} items
  - {work-2}: {n2} items

¿Como quieres revisarlos?
  (a) Uno por uno, en orden de antiguedad (mas viejos primero)
  (b) Filtrar por work origen
  (c) Filtrar por antiguedad
  (d) Solo listar todo y decidir despues
```

`AskUserQuestion` con esas opciones.

### Paso 4 — Procesar item por item

Para cada item seleccionado, mostrar:

```
[{i}/{N}] {id} — {resumen}

Work origen: {slug}
Volcado: {fecha}  ({antiguedad_dias} dias atras)
Prioridad declarada: {prioridad o "no asignada"}

Contexto adicional:
  {parrafo del archivo si hay; si no, "sin contexto adicional"}

Opciones:
  (a) Promover a /alfred nuevo — abre /alfred iniciar con este item como meta
  (b) Descartar               — marcar como `descartado` con razon
  (c) Marcar resuelto         — el item ya fue resuelto fuera del sistema
  (d) Dejar vivo, siguiente   — saltar sin tocar
  (e) Detener revision aqui   — los siguientes quedan sin revisar
```

`AskUserQuestion` con esas opciones.

#### (a) Promover a `/alfred` nuevo

Pregunta al usuario: *"¿Que meta declaras para el work nuevo? Sugerencia basada en el item: '{resumen}'. Puedes editarla."*

Tras confirmar, invoca `/alfred iniciar` con la meta declarada y el flag `--origen-post-work={id}`. El item se marca en `_pendientes.md` con:
- `estado: promovido-a-work`
- `promovido_a_work: {slug-del-nuevo-work}`
- `promovido_en: {fecha}`

#### (b) Descartar

Pregunta razon textual obligatoria. Razones tipicas: "ya no aplica, el codigo cambio", "duplicado de {otro-id}", "decision del equipo: no abordar". Marca:
- `estado: descartado`
- `descartado_en: {fecha}`
- `descartado_razon: "{razon}"`
- `descartado_por: "{git config user.name}"`

#### (c) Marcar resuelto

Pregunta evidencia textual: *"¿Como sabes que se resolvio? (commit, PR, otro work, contexto)"*. Marca:
- `estado: resuelto`
- `resuelto_en: {fecha}`
- `resuelto_evidencia: "{evidencia}"`
- `resuelto_por: "{git config user.name}"`

#### (d) Dejar vivo, siguiente

No toca el item, pasa al siguiente.

#### (e) Detener

Termina el flujo; los items no procesados quedan sin cambio.

### Paso 5 — Resumen al final

```
Revision completada.
  Promovidos a /alfred: {N1}
  Descartados: {N2}
  Marcados resueltos: {N3}
  Dejados vivos: {N4}

Items pendientes restantes: {M}
```

## Flujo de `/post-works listar`

Imprime tabla compacta de items con `estado: pendiente | en-proceso`. Sin interaccion. Util para snapshot rapido.

## Flujo de `/post-works status`

Imprime conteo agregado:

```
El destino configurado (default agent-os/post-works/_pendientes.md)
  Total items: {N}
  Pendientes: {N1}
  En proceso: {N2}
  Promovidos a work: {N3}
  Descartados: {N4}
  Resueltos: {N5}

Antiguedad de pendientes:
  > 90 dias: {Na}
  30-90 dias: {Nb}
  < 30 dias: {Nc}

Works origen con mas pendientes:
  {top 5}
```

## Anti-patrones a evitar

- **NO** auto-descartar items por antiguedad. La decision es del usuario.
- **NO** sugerir promover en bloque (ej. "promover los 5 items de auth a un work nuevo"). Cada item es decision individual; agruparlos crearia works con baja cohesion de scope (ver regla en host-protocol).
- **NO** generar el comando `/alfred` automaticamente sin que el usuario confirme la meta — la meta es invariante del work y debe ser explicita.
- **NO** modificar el destino configurado (default `agent-os/post-works/_pendientes.md`) durante un work activo. Solo `/post-works revisar` y `/alfred` al cerrar pueden escribir alli.

## Compatibilidad

- Works pre-2026-05-02 no generaron `_pendientes.md`. El comando funciona igual contra el archivo del proyecto independientemente de cuando empezo a poblarse.
- Si el archivo tiene formato antiguo (sin columna `estado`), `/post-works revisar` propone migrar al formato actual antes de procesar (preserva contenido).

## Referencias

- Principio del huevo y rumbos: `agent-os/skills/host-protocol/SKILL.md` seccion "Principio del huevo y rumbos del hallazgo".
- Curaduria al cierre de E4: `agent-os/skills/host-protocol/etapas/etapa-4.md` seccion "Curaduria de rumbos 2 y 3 al cierre".
- Schema de campos: `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Rumbos del hallazgo".
- Destino real del archivo: config `rumbos.destino_rumbo_2` (paso 1), default `agent-os/post-works/_pendientes.md`.
