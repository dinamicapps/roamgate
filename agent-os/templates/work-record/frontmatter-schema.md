# Schema de Frontmatter para Artefactos de Work

Define los campos YAML frontmatter que cada artefacto de work-record debe incluir. El contenido vive fragmentado por dominio bajo `schema/` (cada seccion citada conserva su heading verbatim en su fragmento); este archivo es solo el indice.

| Dominio | Archivo | Secciones |
|---|---|---|
| Nucleo (campos comunes, modo, estados) | `agent-os/templates/work-record/schema/nucleo.md` | Campos comunes, Campos especificos por artefacto, Modo del work, Valores de status, Estados del work |
| Perilla de autonomia y meta | `agent-os/templates/work-record/schema/perilla-y-meta.md` | Perilla de autonomia (nivel), Campos de meta del work |
| Abordaje | `agent-os/templates/work-record/schema/abordaje.md` | Descubrimiento de producto (OBSOLETO), Abordaje, Campos eliminados |
| Cosecha post-cierre | `agent-os/templates/work-record/schema/cosecha.md` | Cosecha post-cierre (5 capas), Campos de aprendizaje en `_catalogo.yml` (DEPRECATED) |
| Integracion Zoho Sprints y origen externo | `agent-os/templates/work-record/schema/zoho.md` | Integracion Zoho Sprints, Origen externo (origen_externo) |
| Capa de seguridad (permisos) | `agent-os/templates/work-record/schema/capa-seguridad.md` | Capa de seguridad (permisos) |
| Capa de datos y evidencia requerida | `agent-os/templates/work-record/schema/capa-datos-y-evidencia.md` | Capa de datos (capa_datos), Evidencia requerida (evidencia_requerida), Pruebas requeridas (pruebas_requeridas) |
| Catalogos de work-records y control de sesion | `agent-os/templates/work-record/schema/catalogos-y-sesion.md` | Catalogos de work-records, Control de edicion por sesion |
| Sesion grabada (corpus, indice, decisiones, hallazgos) | `agent-os/templates/work-record/schema/sesion.md` | (a) Campos de apertura (frontmatter del work), (b) Indice de sesion (`indice-sesiones.yml`), (c) Corpus de afirmaciones (`corpus-afirmaciones.yml`), (d) Decisiones de G2 (`decisiones-g2.yml`), (e) Hallazgos del cliente (`hallazgos-cliente.yml`), Invariante de no-carga |
| Modelo del work (`modelo.yml` reconstruido) | `agent-os/templates/work-record/schema/modelo-del-work.md` | Lo propio del portador work, El historial no viaja, La frontera, Aristas que no viajan, Idempotencia, Quien lo lee, Retrocompatibilidad |
| Verificacion diferida (bloque, derivacion, ledger) | `agent-os/templates/work-record/schema/verificacion-diferida.md` | Por que existe, El bloque `verificacion_diferida{}`, El `id` horneado (VD-NN), Derivacion: bloque fuente, estado/status proyeccion, Precedencia entre ejes, Guards, Doble confirmacion, El libro-mayor (`agent-os/verificaciones/ledger.md`), Los verbos, Compatibilidad |
| Feed de actividad del FOCO (`agent-os/.actividad/foco-YYYY-MM-DD.jsonl`) | `agent-os/templates/work-record/schema/actividad.md` | Por que existe, Donde vive, La forma del registro, `estados`: la transicion de un nodo, Una linea que no se puede interpretar se salta, no interrumpe la lectura, Ciclo de vida: purga a 7 dias, Como se lee: no es para un bucle de polling, Lo que este feed no trae en esta fase |
| Cierre, guards, campos de diseno y resto | `agent-os/templates/work-record/schema/cierre-guards-diseno.md` | Tipo colaborador-fastrak, Campo `grupos_bridge`, Sistema dual /alfred + /disenar, Optimizacion bugfix+desarrollo, Hallazgos del retroceso bidireccional, Rumbos del hallazgo, Status nuevos en tareas, Guards del runtime, Artefactos de diseño (pipeline/fragmentacion/proceso-contrato), Snapshot del piloto de autonomia legacy, Colaborador-fastrak (file_type) |
