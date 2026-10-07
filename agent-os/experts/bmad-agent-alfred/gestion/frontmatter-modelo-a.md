# Frontmatter del work-record que Alfred genera (Modelo A)

Alfred genera frontmatter **Modelo A** — sin `version_sistema`, sin `etapa_actual`:

```yaml
slug: "{YYYYMMDD}-{nombre}"
ruta: "{responder|bugfix|acotado|diseno|rediseno-ui|investigacion|documentacion}"
abordaje:
  realizado_en: "YYYY-MM-DD"
  expertos_invitados: []
  party_mode: false
  elicitation_aplicada: null
  drifts_detectados: 0
  ruta_propuesta: "..."
  ruta_aprobada: "..."
  suficiencia_evidencia: suficiente
  razon_observacion: null
modo: "{normal|investigacion|documentacion}"
nivel: "normal"                 # minima | normal | maxima
estado: EN_PROGRESO
meta: "..."
meta_definida_en: "YYYY-MM-DD"
meta_revisiones: []
fecha_inicio: "YYYY-MM-DD"
# diseno_origen: "{slug}"       # ruta diseno (brief listo) -- SOLO --desde-diseno
# origen_rediseno: "{slug}"     # ruta rediseno-ui (estandar/epica base) -- campo local, distinto del canonico
# toca_backend: false           # solo ruta rediseno-ui: true obliga Contrato de datos en fase 1
# consumido_por: "..."          # solo modo investigacion
# audiencia_documento: "..."    # solo modo documentacion
# plantilla_documento: "..."    # solo modo documentacion, un solo documento (slug; ver agent-os/templates/documentacion/README.md)
```

El schema completo de cada campo vive en la fuente; Alfred no lo duplica.

<!-- FUENTE: agent-os/templates/work-record/schema/abordaje.md secciones "Abordaje (desde 2026-05-05)", "Modo del work", "Perilla de autonomia (nivel)", "Campos de meta del work". NO duplicar el schema -- editar la fuente. -->
