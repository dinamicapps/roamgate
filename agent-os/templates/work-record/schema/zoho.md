# Schema de frontmatter — Integracion Zoho Sprints y origen externo

> Fragmento de `frontmatter-schema.md` (ver indice). Asociacion de items de Zoho Sprints y el bloque `origen_externo` (works nacidos de un item externo, p.ej. Zoho Projects).

## Integracion Zoho Sprints (obligatorio desde 2026-04-24)

Aplicable al README.md del work-record cuando el usuario asocia items de Zoho Sprints al work durante el abordaje o etapas posteriores. Todos los campos son opcionales; un work puede no tener ninguno si el usuario eligio no asociar items.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `zoho_items` | array | Lista de items de Zoho Sprints asociados al work. Cada entry con metadata completa. Default: `[]`. |
| `zoho_items_omitido` | string \| null | Razon por la que el usuario eligio no asociar items durante el abordaje. `null` si se asociaron items o si no se pregunto. |
| `zoho_items_desasociados` | array | Lista de items que fueron asociados pero luego desasociados via `/alfred zoho-quitar-item`. Preserva trazabilidad. Default: `[]`. |
| `pre_cierre` | object \| null | Metadata del estado PRE_CIERRE cuando aplica. Null hasta que Quinn cierre E4 con items asociados. |

### Schema de cada entrada en `zoho_items[]`

```yaml
zoho_items:
  - item_no: "DC-I150"              # identificador humano del item
    item_id: "114312000000555001"   # ID interno de Zoho
    sprint: "2026-04-23"            # nombre del sprint
    sprint_id: "114312000000944075"
    titulo: "Fix validacion email en registro"
    tipo: "Bug"                     # Bug | Task | Story
    asociado_en: "2026-04-24"       # fecha ISO
    asociado_en_etapa: "0"          # etapa cuando se asocio (0, 1, 2, 3, 4)
    estado_zoho_al_asociar: "Open"
    local_path: "zoho-items/DC-I150.json"
```

### Schema de cada entrada en `zoho_items_desasociados[]`

```yaml
zoho_items_desasociados:
  - item_no: "DC-I999"
    desasociado_en: "2026-04-25"
    desasociado_en_etapa: "2"
    razon: "asociado por error, no encaja con meta del work"
    estado_zoho_al_desasociar: "In Progress"
    estado_zoho_tras_desasociar: "To do"
    comentario_publicado_id: "114312000001234999"
```

### Schema del objeto `pre_cierre`

```yaml
pre_cierre:
  entrado_en: "2026-04-25T15:30:00"
  items_en_espera:
    - "DC-I150"
    - "DC-I151"
  comentarios_publicados:
    - item_no: "DC-I150"
      tecnico_id: "114312000001234001"
      ejecutivo_id: "114312000001234002"
    - item_no: "DC-I151"
      tecnico_id: "114312000001234003"
      ejecutivo_id: "114312000001234004"
  resuelto_en: null                          # YYYY-MM-DD cuando /alfred revisar-qa cierre o reevalua
  resultado: null                            # aprobado_completo | rechazado_parcial | rechazado_total
  tareas_correctivas_generadas: []           # Reservado para futuras versiones; v1 no lo usa (la reevaluacion obligatoria regresa a E2/E3 y genera tareas normales, no FIX-*)
  qa_comentarios_aprobacion: []              # si resultado = aprobado_completo, comentarios de aprobacion
```

### Quien actualiza y consume

- `zoho_items`: skill `zoho-sprints-integration` accion `asociar-item` / `quitar-item`.
- `zoho_items_omitido`: work durante el abordaje (Fase 4) si el usuario decide no asociar.
- `zoho_items_desasociados`: skill accion `quitar-item` (flujo F9 de la spec).
- `pre_cierre`: Quinn via skill accion `generar-comentarios-cierre` + publicacion; luego `/alfred revisar-qa` actualiza `resuelto_en`, `resultado`, etc.

### Campos de tarea relacionados con Zoho

Aplicable al frontmatter de cada archivo `etapa-2/tareas/{NNN}-*.md`:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `zoho_items_relacionados` | array | `item_no`s que esta tarea cubre. Bob lo pobla en E2 al materializar. Default: `[]`. |

Ejemplo:

```yaml
zoho_items_relacionados: ["DC-I150"]  # una tarea puede cubrir 1 o mas items
```

### Config local del proyecto consumidor

La integracion Zoho Sprints requiere que cada proyecto consumidor tenga `.claude/sprints-local.json` con la configuracion local (no versionada). Ver schema en `agent-os/templates/sprints-local.schema.json` y ejemplo en `agent-os/templates/sprints-local.example.json`.

El archivo es creado por el skill `zoho-sprints-bootstrap` la primera vez que se usa la integracion. El installer `project-install.sh/ps1` agrega `.claude/sprints-local.json` al `.gitignore` del proyecto consumidor automaticamente.

## Origen externo (origen_externo)

Opt-in. Presente cuando el work nacio de un item externo (p.ej. ingerido de Zoho Projects). Lo persiste el runtime via `work open` (JSON stdin); NO se edita a mano. El gate de cierre lo lee para ofrecer el sync-back.

```yaml
origen_externo:
  sistema: "zoho-projects"        # enum extensible (hoy: zoho-projects)
  item_tipo: "issue"              # issue | task
  item_id: "143120000005550"      # id interno del item en Zoho
  item_no: "AUTH-50"              # numero legible
  item_url: "https://projects.zoho.com/..."
  proyecto: "Authentication"
  proyecto_id: "1431200000111"
  descargado_en: "2026-06-24"
```

Validacion: open-world. Campos conocidos tipados (string); el bloque completo es opcional. Si `sistema == "zoho-projects"`, el gate de cierre (ver `bmad-agent-alfred/integraciones/zoho.md` seccion "Zoho Projects") ofrece sincronizar el estado de vuelta.

