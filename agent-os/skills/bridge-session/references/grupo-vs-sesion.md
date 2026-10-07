# Grupo vs Sesion de prueba

Dos ciclos de vida distintos sobre el mismo canal bridge.

## Grupo

- **Que es:** contenedor de coordinacion multi-repo.
- **Ciclo de vida:** nace cuando el director ejecuta `/alfred grupo crear {nombre}` en cualquier etapa del work. Muere cuando se ejecuta `/alfred grupo archivar {nombre}` o al cerrar el work.
- **Donde vive:** `{work}/grupo-{nombre}/` dentro del work-record.
- **Contenido:** manifiesto, participantes, endpoints, descubrimientos, bitacora, hallazgos, contratos borrador/acordados, correcciones aplicadas, sesiones.
- **Estados:** exploracion | acordado | archivado.
  - **exploracion:** recien creado, dialogo abierto, `fases: []` y `cas_por_participante: {}` validos.
  - **acordado:** checklist listo-para-CAs paso, manifiesto v2 con fases y CAs.
  - **archivado:** cerrado, no acepta mensajes ni sesiones nuevas.
- **Colaboradores al unirse:** si `estado_grupo == exploracion`, NO crean work-record fastrak. Solo acusan recibo y participan en dialogo.

## Sesion de prueba

- **Que es:** evento acotado dentro de un grupo con objetivo especifico de prueba.
- **Ciclo de vida:** nace cuando director o colaborador propone ejecutar un ciclo de pruebas dentro del grupo. Muere al cerrar con reporte.
- **Donde vive:** `{work}/grupo-{nombre}/sesiones/{YYYY-MM-DD-slug}/`.
- **Contenido:** plan, ejecucion, hallazgos, reporte (basados en ISO-29119).
- **Precondicion:** grupo en estado `acordado` (o justificacion explicita en bitacora para ejecutar sesion en estado `exploracion` — smoke exploratorio).
- **Gate de cierre:** no se cierra verde si hay bloqueantes abiertos o contratos pendientes de propagar.

## Relacion

- Un grupo puede tener 0, 1 o varias sesiones a lo largo del work.
- Las sesiones comparten el estado del grupo (participantes, contratos acordados vigentes).
- Las fases ISO-29119 del skill `bridge-session` se ejecutan por sesion, no por grupo.

## Decision clave en Fase 1 de bridge-session

Si el director esta creando un grupo nuevo: `estado_grupo: exploracion` por default.
Si el director esta iniciando una sesion dentro de un grupo acordado existente: se invoca el flujo de sesion (Fase 2-6 del skill).
