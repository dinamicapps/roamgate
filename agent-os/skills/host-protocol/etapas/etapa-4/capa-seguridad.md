# Etapa 4 — Verificacion de capa de seguridad (CS-1..CS-3)

> Tarjeta por-chequeo de Etapa 4. Se carga SOLO cuando `agentos work checklist-cierre --slug {slug}` marca CS-1, CS-2, CS-2b o CS-3 como aplicables. Movido desde `etapas/etapa-4.md` (Ola 5 T7, doctrina AI-friendly).

## Verificacion de capa de seguridad (modo normal, incl. legacy evolucion)

Aplica si `permisos_repo_estado` del README es `documentado` o `documentado_externo`. Quinn orquesta los chequeos invocando a Sentinel para las pruebas activas (capacidad `[VP]`). Resultados en `etapa-4/07-verificacion.md` seccion "Capa de seguridad".

### CS-1 — Cobertura declarativa

Cada tarea con `capa_seguridad.aplica: true` tiene su bloque consistente:

- `metodos[]` no vacio.
- Toda entrada con `naturaleza: modulacion-comportamiento` tiene `modula_que` no nulo.
- Toda entrada con `accion_crud in [create, update, delete]` y `naturaleza: restriccion-acceso` tiene `requiere_permiso: true` o `justificacion_si_publico` poblada.
- `permiso_codigo` matchea regex del standard.
- Si `decision_permiso: reutilizar`, codigo existe en seccion 4 (catalogo vivo) del standard.

### CS-2 — Cobertura aplicada (restricciones de acceso)

Sentinel ejecuta `[PA] pruebas-activas` sobre cada entrada con `naturaleza: restriccion-acceso`. Por endpoint, tres llamadas:

1. **Sin sesion** → esperar `401 Unauthorized`.
2. **Con sesion sin el permiso** → esperar `403 Forbidden`.
3. **Con sesion con el permiso** → esperar `200 OK` (o el codigo de exito esperado por el endpoint).

Si la entrada usa atajo grupal (`aplica_a_todos_los_metodos_del_archivo: true`), Sentinel selecciona una muestra representativa de los metodos publicos del archivo (al menos uno por verbo HTTP) y ejecuta las 3 pruebas en cada uno.

### CS-2b — Cobertura aplicada (modulaciones de comportamiento)

Para cada entrada con `naturaleza: modulacion-comportamiento`, Sentinel ejecuta dos llamadas con sesion legitima al endpoint que dispara el metodo BL/service:

1. **Con el permiso** → verificar que el comportamiento descrito en `modula_que` ocurre.
2. **Sin el permiso** → verificar que el comportamiento por defecto ocurre, sin retornar 403.

Si no es practico ejecutar (proceso interno sin endpoint trigger directo, ej. un job programado), el chequeo se documenta como **inspeccion de codigo** del path condicional referenciado, registrando el archivo y la rama del `if` que ramifica.

### CS-3 — Sincronizacion con standard

Verificar que cada codigo en `permisos_nuevos_a_crear` (acumulado de todas las tareas) quedo escrito en seccion 4 (catalogo vivo) de `agent-os/standards/security/permisos-repo.md` (o el archivo apuntado por `permisos_repo_path` si `documentado_externo`), y que el commit que lo introdujo es el mismo que introdujo el codigo del permiso.

Sentinel hace grep en el codebase de `TienePermiso\("([A-Z]{2}\d{3})"\)` (regex segun standard del repo) y compara con el catalogo vivo. Discrepancias se reportan.

### Resolucion de fallos

- **CS-1 falla:** anfitrion de E2 (Winston/Bob) corrige el bloque o retorna a E2 con `/alfred reevaluar` camino b.
- **CS-2 o CS-2b falla:** bloqueante de cierre. Anfitrion de E3 corrige codigo. Disparar `/alfred reevaluar` camino b (regreso a E3 con tarea correctiva).
- **CS-3 falla:** tarea correctiva inline (agregar codigos faltantes al catalogo vivo en commit nuevo). No requiere reevaluacion completa si solo es documentar; pero si hay codigos en el catalogo que no estan en codigo (catalogo "infla"), Sentinel investiga si fueron borrados sin actualizar el catalogo.
