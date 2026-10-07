---
# --- declarados: los escribe un verbo con lo que el humano decidio ---
slug: "{YYYYMMDD-slug}"
fecha: "YYYY-MM-DD"
autor: "{nombre}"
intencion: "{1 frase: que quiere el usuario, sin dimensionar}"
barrido_ejecutado: false             # 'reconocimiento barrido declarar --ejecutado true|false'
razon_sin_barrido: null              # obligatoria si barrido_ejecutado: false
ruta_propuesta: null                 # informativo; se puebla cuando Fase 4 confirma una ruta

# --- derivados: los RECOMPUTA el runtime tras cada verbo mutador; NINGUN flag los setea ---
estado: EN_RECONOCIMIENTO            # EN_RECONOCIMIENTO | LISTO | EN_CURSO | CERRADO
dimension:
  capacidades_menu: 0
  activadas: 0
  descartadas: 0
sustento:
  externo: 0
  codebase: 0
  intencion: 0
etapas_total: 0
etapa_activa: null
---

# Reconocimiento: {slug}

{Prosa de la idea: que quiere el usuario, sin dimensionar todavia — eso es lo que las etapas
siguientes producen. Esta prosa y el frontmatter declarado los escribe `reconocimiento crear
--slug {slug} --intencion "{...}"`; no se editan a mano despues. Si la intencion cambia de
verdad, es un reconocimiento nuevo, no una edicion retroactiva de este parrafo.}

## Dossier

Los otros tres archivos de este directorio, todos escritos SOLO por verbo — nunca a mano:

- `barrido.md` — hallazgos externos (`prior-art`, `competencia`, `regulatorio`, `tecnico`,
  `dominio`), o la razon de por que no hubo barrido.
- `catalogo.yml` — las capacidades del menu: activacion, puntos de contacto, consumidores,
  realizable, sustento.
- `etapas.yml` — el corte en etapas auditables, con su estado por fila.

`dimension`, `sustento`, `etapas_total`, `etapa_activa` y `estado` de este README **no se
escriben**: los recomputa el runtime despues de cada verbo mutador. Ningun verbo los acepta como
entrada — pasarlos por flag no existe.

Fuente operativa completa de esta fase (que verbo emitir en cada momento, y por que):
`agent-os/experts/bmad-agent-alfred/abordaje/fase-3-reconocer.md`.
