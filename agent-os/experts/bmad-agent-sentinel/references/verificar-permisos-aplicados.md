---
name: verificar-permisos-aplicados
description: Run active probes (CS-2/CS-2b) and code inspection (CS-1, CS-3) against capa_seguridad blocks declared in the governed flow's tareas at Etapa 4.
menu-code: VP
---

# Verificar Permisos Aplicados (E4)

Ejecutar las verificaciones CS-1, CS-2, CS-2b y CS-3 sobre los bloques `capa_seguridad` declarados en las tareas del work activo (bajo el gobernador, `/alfred`). Se invoca desde Quinn en Etapa 4 (modo `normal`, o la ruta `rediseno-ui`) cuando `permisos_repo_estado` es `documentado` o `documentado_externo`.

## When to use

- Invocada por Quinn en Etapa 4 como parte del checklist de cierre.
- Invocable standalone para auditar un work ya cerrado o un branch en revision.

## Outcome

Tabla de resultados por endpoint declarado, con veredicto PASS / FAIL / SKIP por chequeo. Reporte escrito a `etapa-4/07-verificacion.md` seccion "Capa de seguridad" + `etapa-4/evidencia/seguridad-{ts}.md` con detalle de pruebas activas.

## Pre-requisitos

- `agent-os/standards/security/permisos-repo.md` (o el archivo apuntado por `permisos_repo_path`) accesible.
- `test-env.local.json` v2 con `sistema.{componente}.run.url` poblado y el sistema corriendo (Quinn ya invoco `run-system run`).
- Credenciales de prueba para al menos dos perfiles: uno con permisos plenos y uno con permisos limitados que permita simular "con sesion sin permiso X". Si el repo no tiene mecanismo facil de generar perfiles de prueba, documentar la limitacion y degradar pruebas activas a inspeccion de codigo.

## Procedure

### CS-1 — Cobertura declarativa (inspeccion estatica de bloques)

Para cada `etapa-2/tareas/*.md` con `capa_seguridad.aplica: true`:

1. Verificar que `metodos[]` no esta vacio.
2. Verificar que toda entrada con `naturaleza: modulacion-comportamiento` tiene `modula_que` no nulo ni vacio.
3. Verificar que toda entrada con `accion_crud in [create, update, delete]` y `naturaleza: restriccion-acceso` tiene `requiere_permiso: true` o `justificacion_si_publico` poblada.
4. Verificar que `permiso_codigo` matchea regex declarado en seccion 3 del standard.
5. Si `decision_permiso: reutilizar`, verificar que el codigo existe en seccion 4 (catalogo vivo) del standard.

Resultado por tarea: PASS / FAIL con detalle. Tareas con todos los items PASS pasan CS-1.

### CS-2 — Cobertura aplicada (restricciones de acceso, pruebas activas)

Por cada entrada con `naturaleza: restriccion-acceso` en cada tarea con `aplica: true`:

1. **Sin sesion:** invocar el endpoint sin headers de autenticacion. Esperar `401 Unauthorized`. Si retorna otro status (200, 500, etc.), FAIL.
2. **Con sesion sin el permiso:** invocar el endpoint con sesion legitima de un usuario que NO tiene `permiso_codigo`. Esperar `403 Forbidden`. Si retorna 200, FAIL grave (escalation).
3. **Con sesion con el permiso:** invocar el endpoint con sesion legitima de un usuario que SI tiene `permiso_codigo`. Esperar el codigo de exito esperado (200, 201, 204 segun el endpoint). Si retorna 401/403, FAIL (configuracion incorrecta).

Si la entrada usa atajo grupal (`aplica_a_todos_los_metodos_del_archivo: true`), seleccionar muestra representativa: al menos un metodo por verbo HTTP presente en el Controller. Aplicar las 3 pruebas a cada uno. Si todos pasan, atajo PASS; si alguno falla, atajo FAIL y reportar el metodo.

Si el endpoint requiere body con datos validos para retornar 200, usar fixtures preexistentes o construir minimo viable. Documentar fixtures usados en el reporte.

#### Artefacto de evidencia API (works desde 2026-06-09, modo normal o ruta `rediseno-ui`)

Cuando la tarea declara `evidencia_requerida.api: true`, el detalle request/response de cada llamada
se escribe a `etapa-4/evidencia/api/T-NNN-{endpoint}.md` (sub-estructura por eje), ademas del
consolidado `seguridad-{ts}.md`. Formato por llamada: metodo+URL+headers+body+status+response. No
basta reportar el status: el log es el artefacto que Quinn audita en EV-1..EV-4. Aplica a APIs
locales y externas; un GET publico que un CA verifica tambien se loguea. El `seguridad-{ts}.md`
consolidado se conserva como vista por-endpoint de seguridad; el `api/T-NNN-{endpoint}.md` es la
vista por-tarea que la auditoria de evidencia consume. Contrato en
`agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`.

### CS-2b — Cobertura aplicada (modulaciones de comportamiento)

Por cada entrada con `naturaleza: modulacion-comportamiento` en cada tarea con `aplica: true`:

1. **Con el permiso:** invocar el endpoint que dispara el metodo BL/service con sesion legitima de un usuario que tiene `permiso_codigo`. Verificar que el comportamiento descrito en `modula_que` ocurre observablemente. Ej. si `modula_que: "aplica descuento del 15% a la tarifa base"`, comparar el campo de tarifa en la respuesta con la tarifa base esperada.
2. **Sin el permiso:** invocar el mismo endpoint con sesion legitima de un usuario que NO tiene `permiso_codigo`. Verificar que el comportamiento por defecto ocurre, sin retornar 403.

Si no es practico ejecutar (proceso interno sin endpoint trigger directo, ej. job programado), degradar a inspeccion de codigo:

- Localizar el metodo BL/service declarado en `endpoint`.
- Verificar que existe una rama condicional que consulta el permiso (ej. `if (TienePermiso("EX012", usu)) { ... } else { ... }`).
- Verificar que las dos ramas hacen cosas distintas y que ninguna retorna `Unauthorized`/`Forbidden`/`403`.
- Documentar archivo, lineas, codigo de la rama, y declarar la prueba como `SKIP-CODE-REVIEWED` con razon.

### CS-3 — Sincronizacion con standard (grep + diff)

1. Acumular `permisos_nuevos_a_crear[].codigo` de todas las tareas con `aplica: true`.
2. Leer seccion 4 (catalogo vivo) del standard del repo y extraer codigos.
3. Verificar que cada codigo en el acumulado aparece en el catalogo. Si falta alguno, FAIL CS-3.
4. Hacer grep en el codebase: `TienePermiso\("([A-Z]{2}\d{3})"\)` (o regex segun standard del repo). Extraer codigos referenciados en codigo.
5. Comparar con catalogo:
   - **Codigo en codigo pero no en catalogo:** catalogo desactualizado. Reportar.
   - **Codigo en catalogo pero no en codigo:** catalogo "infla". Investigar si fue borrado del codigo sin actualizar catalogo. Reportar.
6. Verificar que el commit que introdujo cada `permiso_codigo` nuevo en codigo es el mismo que lo agrego al catalogo (busqueda en git log de los archivos). Si no coinciden, advertencia (no FAIL — la sincronizacion se logro, solo no fue atomica).
7. **Valor literal, no nombre descriptivo:** verificar que cada entrada del catalogo (codigo/idgrupo/sigla) copia el valor LITERAL del codigo fuente (los archivos que definen los permisos en codigo, p.ej. la clase de configuracion de permisos y la vista que arma el menu), no un nombre descriptivo inventado. Si el standard dice un identificador legible pero el atributo en codigo usa un codigo corto distinto, el standard esta mal y se corrige hacia el valor del codigo.
8. **Colision de sigla/prefijo antes de adoptar:** antes de fijar el prefijo de un permiso nuevo o la sigla de un modulo, grep del candidato en el catalogo de prefijos (`agent-os/standards/security/permisos-repo.md`) y en los archivos fuente que definen los permisos. El diseno/brief puede proponer un prefijo que ya pertenece a otro modulo (p.ej. una sigla candidata que ya esta tomada por otro modulo). Una sigla por modulo, rango continuo.
9. **Huerfano: grep antes de clasificar:** antes de marcar un permiso como huerfano en un retiro, grep del codigo del permiso en TODO el repo y los contratos externos (specs/manifiestos de API). Puede sobrevivir en actions hermanas del mismo controller; un retiro reduce el alcance, no necesariamente lo elimina.
10. **Declarar todos los codigos del modulo en el work fundacional:** un permiso declarado sin endpoint es inocuo; un endpoint sin permiso declarado es un hueco. En el work que crea el catalogo de un modulo, declarar todos sus codigos aunque el endpoint que los usa llegue en un work posterior, para no dejar ventana temporal con catalogo incompleto.

## Reporte

Tabla resumen al inicio de `etapa-4/07-verificacion.md` seccion "Capa de seguridad":

| Tarea | CS-1 | CS-2 | CS-2b | CS-3 | Notas |
|-------|------|------|-------|------|-------|
| T-001 aprobar-lote | PASS | PASS (3/3 endpoints) | N/A | PASS | EA047 sincronizado en commit a4f2c1b |
| T-002 rechazar-lote | PASS | FAIL (sin sesion → 200) | N/A | PASS | endpoint POST /api/empresa/Facturas/RechazarLote no extrae sesion |

Detalle completo de pruebas activas (request/response, fixtures usados) en `etapa-4/evidencia/seguridad-{ts}.md`.

## Resolucion de fallos

- **CS-1 FAIL:** anfitrion de E2 (Winston/Bob) corrige el bloque o se retorna a E2 con `/alfred reevaluar` camino b.
- **CS-2 FAIL "sin sesion → 200":** vulnerabilidad seria (acceso sin autenticar). Bloqueante. Quinn dispara reevaluacion con prioridad.
- **CS-2 FAIL "sin permiso → 200":** vulnerabilidad de autorizacion. Bloqueante. Igual.
- **CS-2 FAIL "con permiso → 401/403":** error de configuracion (permiso mal asignado, sesion no valida). Bloqueante pero corregible inline.
- **CS-2b FAIL:** comportamiento no modula como declarado. El bloque o el codigo estan inconsistentes. Quinn decide con el usuario si corregir codigo o ajustar declaracion.
- **CS-3 FAIL "codigo no en catalogo":** tarea correctiva inline. Agregar al catalogo en commit nuevo. No requiere reevaluacion.
- **CS-3 FAIL "catalogo infla":** investigar. Puede ser limpieza pendiente. Quinn decide si bloquear.

## Outputs

- Tabla resumen en `etapa-4/07-verificacion.md` seccion "Capa de seguridad".
- Detalle de pruebas en `etapa-4/evidencia/seguridad-{ts}.md`.
- Veredicto consolidado entregado a Quinn: PASS / FAIL-MENOR / FAIL-BLOQUEANTE.
