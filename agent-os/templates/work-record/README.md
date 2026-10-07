---
slug: "{YYYYMMDD}-{slug-corto}"
ruta: "acotado"              # responder | bugfix | acotado | diseno | rediseno-ui | investigacion | documentacion
                             # (legacy tolerado en lectura: fix, desarrollo-acotado, desarrollo-via-diseno)
modo: "normal"               # normal | evolucion (deprecado, legacy) | investigacion | documentacion (destilado de la ruta)
nivel: "normal"              # minima | normal | maxima (perilla de autonomia; legacy: conversacion guiada|flow|yolo)
estado: "EN_PROGRESO"        # EN_PROGRESO | PAUSADO | EN_PAUSA | EN_PAUSA_POR_DISENO | PRE_CIERRE | COMPLETADO | COMPLETADO_CON_BRECHA | REPLANTEADO | TRASLADADO_A_DISENO | CANCELADO
fecha_inicio: "{YYYY-MM-DD}"
fecha_fin: null
autor: "{nombre del usuario}"

# Abordaje (primera fase interna de /alfred):
abordaje:
  realizado_en: "{YYYY-MM-DD}"
  expertos_invitados: []     # ej. ["sentinel"] si fueron invitados en Fase 2
  party_mode: false          # true si se activo party mode
  elicitation_aplicada: null # null o string identificando tecnica (ej. "TR-10")
  drifts_detectados: 0       # numero de drifts entre claims usuario y evidencia
  ruta_propuesta: "{ruta inicial sugerida por work}"
  ruta_aprobada: "{ruta confirmada por usuario; puede diferir}"

# Modo desarrollo via diseño (cuando aplica):
# diseno_origen: "{slug del diseño}"

# Estado TRASLADADO_A_DISENO (cuando aplica):
# trasladado_a: "{slug del diseño nuevo}"
# trasladado_en: "{YYYY-MM-DD}"
# trasladado_razon: "{razon textual}"

# Otros campos opcionales segun se necesiten:
# meta: "{frase de meta del work, destilada del abordaje}"
# meta_definida_en: "{YYYY-MM-DD}"
# meta_revisiones: []
# epica: "{EP-NNN}"
# zoho_items: []
# work_relacionado: []
# permisos_repo_estado: "documentado"  # documentado | documentado_externo | no_documentado | override_usuario | no_aplica_por_modo
---

# Work: {titulo descriptivo}

> Estado: **{EN_PROGRESO}** · Ruta: {acotado} · Modo: {normal} · Nivel: {normal}

## Objetivo

{2-3 lineas describiendo que se va a lograr.}

## Abordaje ({YYYY-MM-DD})

<!-- Insertar aqui el bloque construido segun
     agent-os/templates/work-record/abordaje-seccion.md.
     NO eliminar este bloque ni reescribirlo en otra ubicacion.
     Excepcion: rutas `responder` no crean work-record (este archivo no existe en ese caso).
     Re-abordajes posteriores se agregan como bloques `## Re-abordaje (fecha)` debajo. -->

## Terreno

<!-- Seccion INCONDICIONAL en este molde: se siembra siempre al crear el
     work, ya no depende de que existan las coordenadas del diseño. Si el
     work nace derivado (frontmatter con `diseno_origen` + `work_paraguas`,
     y el diseño de origen con su propio `modelo.yml`), `work open` hornea
     el subgrafo y proyecta el bloque en el mismo acto de apertura. Si falta
     alguna de esas tres condiciones, el sistema lo llena igual, de oficio,
     por el camino reconstruido: nada mas abrir el work, la cognicion emite
     el grafo desde `## Abordaje` (`modelo emitir --portador work --desde
     abordaje`) y corre `agentos work terreno`. Que el bloque quede vacio un
     instante entre esos dos pasos es legal, no un error.
     El bloque entre los marcadores lo escribe `agentos work terreno` desde
     `modelo.yml` del work; no editarlo a mano y no mover los marcadores.
     Contrato: agent-os/templates/work-record/schema/modelo-del-work.md -->

<!-- modelo:start vista=terreno -->
<!-- modelo:end -->

## Decisiones clave

| Fecha | Etapa | Decision | Resolucion |
|-------|-------|----------|------------|
|       |       |          |            |

<!-- Bob/Winston al cierre de E2 crean la tabla siguiente con todas las
     tareas en `pending`, sin verif, sin tags. Amelia/Atlas en E3
     actualizan Status y Tags. Quinn en E4 actualiza Verif. -->

## Tareas

| T | Titulo | Status | Verif | Tags |
|---|--------|--------|-------|------|

<!-- Si el work es modo bugfix trivial (1 fix de 1 archivo, 0 tareas):
     omitir esta tabla y agregar las secciones siguientes en su lugar:

     ## Sabueso: atlas
     ### Hipotesis
     ### Solucion
     ### Fix aplicado
     ### Hallazgos

     ## Verificacion

     ## Cierre
-->

## Iteraciones

| # | Fecha | Accion | Desde etapa | Hacia etapa | Razon |
|---|-------|--------|-------------|-------------|-------|

## Pausas

| Fecha inicio | Etapa | Razon | Fecha reanudacion |
|--------------|-------|-------|--------------------|

## Archivos modificados

<!-- Se llena al cierre del work con git diff. -->

## Cierre

{1 frase resumen al cerrar.}
