---
status: pending
cas: []
tipo_tarea: codigo
ejecutor: null
verificador: null

# Campos opcionales — agregar solo si aplican (descomentar y poblar):
# capa_seguridad:
#   aplica: true
#   metodos:
#     - endpoint: "{POST /api/...}"
#       naturaleza: "restriccion-acceso"
#       capa: "controller"
#       accion_crud: "create"
#       requiere_permiso: true
#       decision_permiso: "reutilizar"
#       permiso_codigo: "{ej. EA020}"
#       permiso_descripcion: "{descripcion canonica}"
#       sesion_aplicable: "UsuarioEmpresaSesion"
#       origen_decision: "{T-NNN o CA-NNN}"
#   permisos_nuevos_a_crear: []
#   notas_de_aplicacion: |
#     {Excepciones, dependencias, justificacion}
#
# capa_datos (schema completo en agent-os/templates/work-record/schema/capa-datos-y-evidencia.md):
#   aplica: true
#   entidades:
#     - nombre: "{Tabla_X | sp_dominio_accion}"
#       operacion: "alter"   # create | alter | drop | data
#   ddl_sugerido: |
#     {DDL del datos.md, SUGERENCIA no contrato}
#   saneamiento_requerido: false
#   saneamiento_estrategia: ""
#   datos_md_ref: "agent-os/disenos/{slug}/datos.md"
#
# evidencia_requerida (schema completo en agent-os/templates/work-record/schema/capa-datos-y-evidencia.md):
#   Derivado por Bob/Winston en E2: capa_seguridad->api, modo evolucion legacy (deprecado; hoy
#   ruta rediseno-ui)/paths UI->ui, capa_datos create/alter/drop->bd. Bloqueante de cierre en
#   E4 (EV-1..EV-4) salvo descarte registrado en descartes[] + [OVERRIDE] en bitacora.
#   api: true
#   ui: false
#   bd: true
#   descartes: []
#
# depende_de: [T-NNN]
#
# archivos — archivos que la tarea va a crear o modificar. Lo declara Bob en E2;
#   Amelia [RI] lo verifica contra el codebase real antes de que abra E3.
#   El anfitrion de E3 lo usa para decidir que tareas puede despachar en PARALELO:
#   dos tareas solo corren a la vez si no comparten ninguna `ruta`.
#   Es una PREDICCION: el ejecutor reporta los archivos que realmente toco, y una
#   divergencia es senal de drift (no un error).
# archivos:
#   - ruta: "src/Controllers/PagoController.cs"
#     accion: "modificar"   # crear | modificar
# fase: N
# zoho_items_relacionados: [DE-INNNN]
# logs_temporales_instrumentados: []
#
# standards_cargados (desde 2026-05-05b):
#   Paths relativos a project-root, poblado por Bob al materializar
#   segun la heuristica path -> dominio del skill
#   agent-os/skills/cargar-standards/SKILL.md.
#   Lista vacia [] si no hay standards aplicables o si el proyecto no
#   tiene agent-os/standards/index.yml. Amelia/Atlas (E3) y Quinn (E4)
#   leen esta lista para cargar los archivos sin re-inferir.
# standards_cargados: []
#
# Tarea documental (modo documentacion; tipo_tarea: seccion-documento o documentacion,
#   los dos valores existen en uso real y cargar-standards los trata distinto):
# audiencia: "{lector de esta seccion}"
# alcance: "{que cubre la seccion}"          # generar-salidas en la tarea que produce los formatos
# referencias_de_entrada: ["{ruta o fuente}"]
# formato: "{md | tabla | diagrama | ...}"
# entregable: "{ruta relativa al repo}"      # OBLIGATORIO si el README del work tiene ## Entregables:
#                                            # igual a una fila de su columna Documento. Sin esa
#                                            # seccion no se exige. Lo leen Paige (E3) y Quinn (E4).
---

# Tarea NNN: {titulo descriptivo}

{1-2 lineas de descripcion del proposito de la tarea. Que existe o se sabe al completarla que antes no?}

<!-- Secciones opcionales: incluir SOLO las que aporten valor.
     Si una seccion diria "N/A" o "ninguno (planeacion)", omitirla.
     Quinn audita en E4 que las que aplican esten pobladas. -->

## Subtareas
<!-- Solo si la tarea tiene >=2 pasos no obvios. Pasos triviales se omiten. -->

1. {Paso concreto, prosa, sin codigo}
2. {Paso concreto}

## Dev Notes
<!-- Solo si hay patron, restriccion o contrato no obvio. -->

- **{Patron/Restriccion}**: {explicacion}

## Archivos
<!-- Solo si toca >=2 archivos o si el archivo no esta en el titulo. -->

- `ruta/archivo.ext` ({crear | modificar})

## Verificacion
<!-- Solo si requiere mas que build/test estandar del proyecto. -->

1. {Que ejecutar y que resultado esperar}

## CAs que implementa
<!-- Solo si la tarea tiene >=1 CA en frontmatter. -->

| ID | Descripcion resumida | Origen |
|----|---------------------|--------|
| CA-{NNN} | {descripcion del CA} | {experto que lo propuso} |

---

<!-- Bloque Ejecutor: lo escribe `work tarea ejecutor` (NO editar a mano).
     Forma y reglas en el runtime; doctrina en host-protocol. -->

## Ejecutor: {agente}

---

<!-- Bloque Verificador: lo escribe `work tarea verificador` (NO editar a mano). -->

## Verificador: {agente}
