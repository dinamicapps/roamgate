---
name: plan-y-verificar-bd
description: Capacidad PD (plan-BD en E2 del flujo gobernado, bloques capa_datos) + VD (verificación CD-N en E4). Cómo Dexter materializa y verifica la capa de datos bajo el gobernador (`/alfred`).
menu-code: PD
---

# Plan-BD ([PD]) y Verificación de BD ([VD])

> Aplica los principios P-D1..P-D4 (fuentes en SKILL.md y disciplina-produccion.md). Schema de capa_datos: fuente única en agent-os/templates/work-record/schema/capa-datos-y-evidencia.md.

## [PD] — Plan-BD en E2 del flujo gobernado (`/alfred`) (step-03-plan)

Dexter es invitado obligatorio si el brief tiene `datos.md` con estructura nueva/modificada, o si alguna tarea toca persistencia (simétrico a Sentinel para capa_seguridad).

Por cada tarea que toca BD, Dexter co-diseña el bloque `capa_datos` (schema en `schema/capa-datos-y-evidencia.md`):
- `entidades[]`: tablas/SP que la tarea toca.
- `operacion`: create/alter/drop/data.
- `ddl_sugerido`: del datos.md, marcado SUGERENCIA no contrato (el DDL real puede diferir al ejecutar; hereda regla de Winston).
- `saneamiento_requerido`: bool + referencia a estrategia (si aplica P-D1).

**Freno (P-D2):** ninguna tarea crea estructura nueva sin la justificación de no-redundancia resuelta (en /disenar, o aquí si el work es directo). Dexter levanta la mano antes de cerrar el plan.

## [VD] — Verificación de BD en E4 del flujo gobernado (`/alfred`) (auditoría CD-N)

Invitado por Quinn. Solo lectura (P-D4: jamás escribe contra producción).

- **CD-1 estructural:** los bloques capa_datos de tareas done son consistentes con datos.md del brief.
- **CD-2 contra BD real (si hay MCP):** estructura implementada (tablas/campos/SP/FK) coincide con el diccionario. Tipos, nulabilidad, constraints. Solo lectura; si el único entorno es producción, solo metadatos.
  - **Artefacto de evidencia obligatorio (works desde 2026-06-09, modo normal o ruta `rediseno-ui`):** cuando la
    tarea declara `evidencia_requerida.bd: true`, Dexter produce `etapa-4/evidencia/bd/T-NNN-{entidad}.md`
    con las cuatro evidencias: (1) schema via INFORMATION_SCHEMA, (2) SELECT post-escritura que muestra
    la fila, (3) EXEC del SP/Func + SELECT del efecto colateral, (4) OBJECT_DEFINITION. La escritura de
    prueba la dispara el flujo de la app (via API/UI) contra `test-env.local.json`, nunca produccion
    (P-D4). Quinn audita este artefacto en EV-1..EV-4. Detalle del contrato en
    `agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`.
- **CD-3 saneamiento:** si una tarea declaró saneamiento_requerido, verificar que se ejecutó y los datos quedaron íntegros. En prod lo ejecuta un humano; Dexter verifica resultado por lectura.
- **CD-4 no-redundancia post-hoc:** ninguna tabla/campo nuevo fuera de lo justificado en el plan.

**CD-2 fallido es bloqueante de cierre** (simétrico a CS-2). Drift que bloquea meta -> protocolo del huevo / reevaluación (no "deuda técnica").

## Diagnóstico BD-first (bugs de integridad/datos)

Para un bug de integridad referencial, dato faltante o predicado inerte, el orden correcto es observación -> BD -> código, no código -> hipótesis -> BD. Ejecuto queries de solo lectura (via MCP en entorno no-producción, P-D4) ANTES de abrir un solo archivo: las consultas encadenadas cierran el espacio de hipótesis y convierten la lectura de código en confirmación dirigida, no en exploración abierta. Un SELECT sobre la fila sospechosa que muestra una FK cruzada —el valor que debía coincidir entre cabecera y detalle no coincide— prueba la causa con certeza empírica; un conteo prueba que un predicado nunca matchea (registros cuya columna de filtro vale siempre cero); una distribución de cardinalidad fundamenta una decisión de presentación. La BD es fuente de verdad antes que el código y antes que la prosa del usuario.

## Cierre de migración: el lado de lectura y los consumidores

Migrar el modelo de escritura (nuevo campo, nuevo catálogo, nueva tabla de config) sin auditar el lado de lectura es una migración solo a medias que deja gates validando contra datos borrados y catálogos hijo vacíos sin lanzar error. Checklist anti-medias-tintas, parte de mi auditoría CD-N:
1. Listar TODOS los gates/lecturas que consumen el modelo migrado, incluidos los consumidores indirectos (controladores con métodos privados propios) y los catálogos hijo que filtran por el código del catálogo padre.
2. Verificar que cada uno lee del modelo nuevo.
3. Cuando se introduce un valor nuevo en un catálogo padre, propagarlo a los catálogos hijo en el MISMO deploy.
4. Propagación multi-tenant: un ALTER aplicado solo a la BD de desarrollo NO es un cambio completo; el script de sincronización multi-tenant se actualiza en el mismo commit, o se marca tarea de post-work con owner y fecha. El drift de esquema entre la BD de prueba y el designer del ORM (works paralelos sin desplegar) bloquea endpoints con errores tipo 'Invalid column name': aplicar el ALTER idempotente del work paralelo a la BD de prueba antes de verificar la Fase 2.

## Semántica empírica de columnas reutilizadas (corolario de P-D6)

> Línea-gancho en SKILL.md, principio P-D6 (fuente única del principio). Aquí vive la casuística que no cabe en el bullet angular.

Una BD madura reutiliza columnas con significado distinto según el tipo de registro. El nombre y el tipo de la columna no revelan esa semántica: hay que leerla empíricamente en la BD real.

Ejemplo observado: una columna que solo se llena para un subtipo de registro y vale 0 para todos los demás, que guardan el dato real en OTRA columna. Si un predicado compara dos registros de tipos distintos asumiendo simetría de columnas —comparando la misma columna 'A' en ambos lados cuando el segundo tipo en realidad guarda su dato en la columna 'B'— colapsa a `0 == 0`, siempre-verdadero, sin lanzar ningún error: pasa la prueba feliz y revienta en el caso cruzado.

Disciplina antes de usar una columna como discriminador o como lado de un predicado que cruza tipos:

1. Verificar EMPÍRICAMENTE el valor real de la columna para CADA tipo de registro en la BD (auditoría sobre los registros reales, no sobre el caso de prueba único).
2. Nunca asumir simetría de columnas entre tipos: si el subtipo A llena la columna 'A' y el subtipo B llena la columna 'B', el predicado debe ramificar por el discriminador de tipo, no comparar la misma columna en ambos.
3. Sospechar del predicado inerte: un `0 == 0` o `NULL == NULL` que nunca falla en la prueba feliz es la firma de una columna asumida.

## DataContext del ORM: aislamiento por método BL

Cada método BL abre su propio DataContext del ORM; nunca recibir ni pasar un DataContext por parámetro entre métodos. Un change-tracker compartido filtra estado entre operaciones y ha causado fallos en producción.

## Equivalencia funcional sin baseline vivo (EXCEPT bidireccional)

Para verificar equivalencia funcional de un SP refactorizado cuando el baseline ya no existe en la BD viva (el SP fue alterado), reconstruyo el body original inline desde el archivo de backup y corro EXCEPT bidireccional (viejo MINUS nuevo y nuevo MINUS viejo = 0 filas). No requiere restaurar una BD separada.
