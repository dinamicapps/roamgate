# Schema de frontmatter — Abordaje

> Fragmento de `frontmatter-schema.md` (ver indice). El bloque `abordaje{}`/`ruta` vigente y su predecesor obsoleto `descubrimiento_producto{}`.

## Descubrimiento de producto (OBSOLETO desde 2026-05-05)

> **OBSOLETO.** El bloque `descubrimiento_producto{}` y los archivos `etapa-0/descubrimiento-producto.md` + `etapa-0/contexto.md` fueron eliminados por el spec `2026-05-05-abordaje-evidencia-primero-design.md`. Su contenido fue reemplazado por el bloque `abordaje{}` en frontmatter + seccion `## Abordaje (fecha)` inline en el README. Ver seccion "Abordaje (desde 2026-05-05)" mas abajo.
>
> Esta seccion se conserva como referencia historica para works iniciados antes de 2026-05-05 que aun no cierran.

Aplicable al README.md del work-record. Resumen estructural del descubrimiento de producto realizado en Fase B de Etapa 0. El detalle vivia en `etapa-0/descubrimiento-producto.md`; aqui iban los datos discretos que otros artefactos consumian.

Works iniciados antes de la E0 enriquecida no tienen este bloque retroactivamente; works iniciados entre 2026-04 y 2026-05-04 lo tienen.

```yaml
descubrimiento_producto:
  ejecutado_en: "YYYY-MM-DD"
  dominios_tecnicos: ["string", ...]      # de E.1 dominio principal + dominios puente + E.2 modulos transversales
  roles_consumidores: ["string", ...]     # de E.3
  modulos_upstream: ["string", ...]       # de E.2 (alimentan al work)
  modulos_downstream: ["string", ...]     # de E.2 (consumen producto del work)
  patrones_candidatos:                    # de E.5
    - path: "ruta:linea"
      cobertura_estimada: "string"        # ej. "70%"
      modo_uso: "reuso-directo | espejo-con-ajustes | inspiracion | no-reuso"
      razon: "string"
  standards_aplicables: ["ruta1", ...]    # de E.5 - paths a standards del repo aplicables
  preguntas_abiertas_para_e1: ["string", ...]  # "no se" del usuario o de work durante el descubrimiento
  convenciones_a_destilar:                # de E.5 - convenciones tacitas del repo no documentadas como standards
    - convencion: "string"
      ambito: "datos | bl | frontend | catalogos | dominios | seguridad | testing | ..."
      destino_sugerido: "ruta-standard-propuesta"
      detectado_por_experto: "string"     # quien detecto la convencion (work | mary | sentinel | winston | atlas | amelia | sally | quinn)
      detectado_en_etapa: "etapa-0 | etapa-1 | etapa-2 | etapa-3 | etapa-4"
      estado_destilado: "pendiente_destilar | completado | diferido | pendiente_post_cierre | agregado_en_etapa_posterior"
      destilado_por_experto: "string | null"
      destilado_en_etapa: "etapa-0 | etapa-1 | etapa-2 | etapa-3 | etapa-4 | null"
      destilado_en_fecha: "YYYY-MM-DD | null"
      ruta_final: "ruta-real-del-standard | null"
      diferido_razon: "cobertura-insuficiente | conflicto-activo | dependencia-externa | otro: explicar | null"
      diferido_decision_de: "string | null"
      revisar_en: "string | null"
  cohesion_alerta_disparada: true | false # true si N>2 o M>2
  cohesion_decision: "a-mantener" | "b-partir" | "c-reformular" | null
  mermaid_integrador_aprobado: true       # true tras aprobacion visual del usuario
```

### Quien actualiza

- Work al cerrar Fase B de Etapa 0 (con aprobacion del usuario).
- Si en E1, E2, E3 o E4 aparecen convenciones tacitas adicionales, el experto correspondiente puede agregar entradas a `convenciones_a_destilar[]` (no se eliminan; solo se agregan).
- Si en una reevaluacion la decision es (b) partir, este work-record se marca como REPLANTEADO_PARTICION y NO acumula mas updates.

### Quien consume

- Mary al activarse en E1: lee `descubrimiento-producto.md` completo + este bloque resumen como insumo principal del discovery.
- Winston al activarse en E2: lee `patrones_candidatos`, `standards_aplicables`, `dominios_tecnicos`, `modulos_upstream/downstream` para fundamentar decisiones arquitectonicas.
- Bob al materializar tareas en E2: lee `convenciones_a_destilar` para asignar tareas de destilado a Sentinel/Mary cuando aplica.
- Sentinel cuando es invitado: lee `convenciones_a_destilar` filtradas a su dominio (seguridad).
- Quinn en E4: chequea contra `dominios_tecnicos` y `roles_consumidores` que la verificacion cubra la cohesion declarada en E0.
- `/alfred maintain`: puede auditar `convenciones_a_destilar` que quedaron sin destilar al cerrar el work.


## Abordaje (desde 2026-05-05)

Campos del frontmatter del README del work-record que registran el resultado del abordaje (primera fase interna de `/alfred`). Reemplaza al bloque obsoleto `descubrimiento_producto{}`.

### `ruta` (string, obligatorio)

Enum vigente (rutas canonicas, MATRIZ Tabla A): `responder` \| `bugfix` \| `acotado` \| `diseno` \| `rediseno-ui` \| `investigacion` \| `documentacion`. (`hotfix` no usa este campo — ver nota de "ruta-y-modo" arriba.)

- `responder` — respuesta informativa, no se crea work-record (campo solo aparece si por alguna razon se persiste).
- `bugfix` — bugfix focal, investigacion forense.
- `acotado` — feature pequeña sin modelado.
- `diseno` — feature con modelado, paso por `/disenar`.
- `rediseno-ui` — rediseno UI/UX sobre base existente, flujo propio de 4 fases (Sally anfitriona).
- `investigacion` — entregable es conocimiento.
- `documentacion` — entregable es prosa.

**Legacy tolerado en lectura:** `fix`, `desarrollo-acotado`, `desarrollo-via-diseno` — valores retirados que solo aparecen en works legacy. No crear works nuevos con ellos.

> **Vocabulario legacy tolerado en lectura.** Alfred (entrada canonica) hornea `bugfix`/`acotado`/`diseno`; los works legacy
> pueden tener los valores retirados/legacy `fix`/`desarrollo-acotado`/`desarrollo-via-diseno`. El schema (`RutasWork` del schema de
> cognitivos del runtime) acepta ambos para `ruta_propuesta`/`ruta_aprobada`. El campo
> `ruta` de primer nivel es string libre.
> <!-- FUENTE de la equivalencia: agent-os/experts/bmad-agent-alfred/gestion/equivalencia-rutas.md. NO duplicar — editar la fuente. -->

### `abordaje` (objeto, obligatorio)

```yaml
abordaje:
  realizado_en: "YYYY-MM-DD"          # fecha en que cerro Fase 4
  expertos_invitados: []               # lista de expertos invitados en Fase 2 (ej. ["sentinel"])
  party_mode: false                    # true si se activo party mode
  elicitation_aplicada: null           # null o string identificando tecnica (ej. "TR-10")
  drifts_detectados: 0                 # numero de drifts entre claims usuario y evidencia
  ruta_propuesta: "..."                # ruta inicial sugerida por work
  ruta_aprobada: "..."                 # ruta confirmada por usuario (puede diferir)
  suficiencia_evidencia: suficiente    # suficiente | requiere-observacion. Default: suficiente.
  razon_observacion: null              # string corto si suficiencia_evidencia=requiere-observacion; null si suficiente.
  reconocimiento_slug: null            # slug del reconocimiento origen, si el work nacio de 'work open --desde-reconocimiento'
  etapa: null                          # numero de la etapa (fila del plan del reconocimiento) que este work abre; solo junto a reconocimiento_slug
```

`reconocimiento_slug`/`etapa` solo aparecen cuando el work nace de la fila activable del plan de un reconocimiento (fase de reconocimiento del abordaje, dominio `reconocimiento`). Es el reverse-link del lado work: el lado reconocimiento vive en `agent-os/reconocimientos/{slug}/etapas.yml`, donde la fila `n` queda `estado: en_work` con `produjo: {slug del work}`.

### Quien actualiza

Work al cerrar Fase 4 del abordaje (con confirmacion del usuario).

Si se dispara re-abordaje (`/alfred reevaluar`), `abordaje{}` original se conserva intacto. Los datos del re-abordaje se reflejan en bloque `## Re-abordaje (fecha)` agregado al README; el frontmatter mantiene los valores del abordaje original.

### Quien consume

- Bob al materializar tareas en E2 (ruta `acotado`): lee evidencia y ruta. Si `suficiencia_evidencia=requiere-observacion`, aplica patron "dos olas" (ver `agent-os/experts/bmad-agent-alfred/piezas/plan.md`).
- Winston en `/disenar` step-01 (el FOCO, ruta `diseno`): recibe evidencia como contexto pre-validado.
- Quinn en E4: verifica que la meta cumple lo declarado en abordaje.
- bridge-session Fase 0: si `suficiencia_evidencia=requiere-observacion` y el work tiene grupo bridge anticipado, emite manifiesto inicial obligatoriamente en `estado_grupo: exploracion` con CAs vacios (ver `bridge-session/references/manifiesto-versionado.md`).
- Auditoria post-hoc: comparar `ruta_propuesta` vs `ruta_aprobada` para detectar divergencias.

## Campos eliminados (desde 2026-05-05)

Los siguientes campos del frontmatter, presentes en works iniciados antes de 2026-05-05, ya no se generan ni se validan en el flujo nuevo:

- `descubrimiento_producto` (objeto entero) — reemplazado por `abordaje{}` + bloque `## Abordaje` inline.
- `cohesion_alerta_disparada`, `cohesion_decision`, `mermaid_integrador_aprobado` — eliminados con la Fase B de E0.
- `etapa_actual` (campo numerico E0..E4) — las rutas no usan numeracion de etapas; el flujo interno de `/alfred` lo determina segun `ruta`.

Works activos pre-2026-05-05 que aun no cierran conservan estos campos en sus frontmatter; el dev decide si los cierra como esten, los cancela, o los traslada a flujo nuevo. Rollback via git, no via flags legacy.

