---
hallazgo_id: HZ-{NNN}
work_origen: {slug-work}
work_etapa_origen: {N}
work_iteracion: {n}
work_anfitrion: {experto}
disparado_en: {ISO-timestamp}
disparado_por: {usuario}
estado: pendiente_analisis
proceso_afectado: P{n}-{slug}
contrato_afectado: P{n}/reglas/heredadas
invalida: {id-del-nodo-del-modelo}
severidad: bloqueante
diseno_slug: {slug-diseno}
aplicado_por_work: null
aplicado_por_work_en: null
---

<!--
`invalida` es el id del NODO del modelo que este hallazgo pone en duda (ej.
ENT_Cita, P3). Es lo que permite calcular el impacto con `agentos modelo impacto`
y emitir el nodo `hallazgo` al grafo. `proceso_afectado` y `contrato_afectado`
siguen siendo texto para el lector: no son ids y no se resuelven contra el modelo.
Si todavia no se sabe que nodo toca, dejar `invalida` vacio -- el hallazgo se
procesa igual, pero sin nodo en el grafo, sin calculo de impacto y sin frenar a
`agentos work open`: ese guard cruza por `invalida`, asi que un hallazgo sin
nodo no impide abrir el work que toca lo que el hallazgo pone en duda.

El titulo de abajo NO es decorativo: de el sale el `enunciado` del nodo. Conservar
la forma `# Hallazgo HZ-NNN: {titulo}`.
-->

# Hallazgo HZ-{NNN}: {titulo}

## Contexto del work al momento del hallazgo

{Que estaba haciendo el work cuando emergio el hallazgo. Tarea T-NNN actual. Estado del codigo.}

## Sintoma observado

{2-3 lineas. Que se observo concretamente. Si es bug: el output erroneo. Si es regla descubierta: la condicion que la dispara.}

## Hipotesis del work sobre la causa

{La ultima entrada [ANALISIS] o [HALLAZGO] de la bitacora del work. Por que el work cree que esto requiere modificar el brief.}

## Por que no se resuelve dentro de work

{Justificacion explicita: por que esto es regla que pertenece al brief y no decision local del work. Si no esta clara, el hallazgo deberia rechazarse en step-r1.}

## Evidencia anexa

{Lista de archivos modificados, snippets de codigo, screenshots, mensajes de error. Solo lo relevante.}

- {archivo:linea} — {por que es relevante}

## Lo que diseño debe revisar (sugerencia)

{Lookup a `procesos/P{N}-*.md`. Mary lo recibe como punto de partida pero puede divergir.}

## Mitigacion aplicada por diseño

{VACIO al inicio. Mary lo llena en step-r3 con diff explicito al brief y razon.}

## Aplicado por work

{VACIO al inicio. Work lo llena en pre-flight de /alfred continuar tras aplicar el diff a la tarea afectada. Incluye: tarea T-NNN actualizada, fecha, snippet del cambio.}
