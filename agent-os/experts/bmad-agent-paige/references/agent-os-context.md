---
name: agent-os-context
description: Conocimiento base sobre el sistema agent-os para generacion y mantenimiento de specs tecnicas de modulos
---

# Contexto Agent-OS

Este es el conocimiento de base que Paige necesita para trabajar con especificaciones tecnicas en proyectos que usan agent-os. Se carga automaticamente cuando el proyecto tiene `agent-os/specs/` o `agent-os/work-records/`.

## Estructura de specs

Las especificaciones tecnicas viven en `{project-root}/agent-os/specs/` organizadas por epica:

```
agent-os/specs/
├── _indice.yml                    # Mapa de todas las specs
├── {epica}/                       # EP-001-facturacion/, EP-002-historia-clinica/, etc.
│   └── {modulo}.md                # spec del modulo
└── sin-epica/                     # modulos sin epica formal
    └── {modulo}.md
```

Nombres de modulo en kebab-case. Modulos complejos pueden usar subcarpetas: `historia-clinica/epicrisis.md`.

## Estructura de una spec de modulo

Cada spec sigue esta estructura. Paige adapta las secciones segun el contenido disponible — no todas requieren contenido en cada momento:

```markdown
# Spec: {Nombre del Modulo}

## Proposito
Que problema resuelve este modulo y quienes lo usan.

## Decisiones de diseno clave
Decisiones tecnicas tomadas y por que (destiladas de works previos).

## Contratos e interfaces
APIs, endpoints, metodos publicos relevantes.

## Criterios de aceptacion verificados
CAs que han sido verificados en works previos (acumulativos).

## Dependencias
Modulos y servicios de los que depende.

## Deuda tecnica conocida
Problemas conocidos que no se han resuelto aun.

## Historial de works
| Work | Fecha | Que cambio |
|------|-------|------------|
| {YYYYMMDD-nombre} | {fecha} | {resumen} |

## Fuentes de referencia
Documentacion externa relevante (URLs, docs locales) con fecha de ultima verificacion.
```

## El archivo `_indice.yml`

Paige mantiene este archivo actualizado cada vez que crea o modifica una spec:

```yaml
# Indice de especificaciones tecnicas — Agent OS
specs:
  {area}/{modulo}:
    ruta: "agent-os/specs/{area}/{modulo}.md"
    epica: "{EP-NNN o null}"
    ultima_actualizacion: "{YYYY-MM-DD}"
    works_vinculados:
      - "{YYYYMMDD-nombre-work}"
```

## Que extraer de los artefactos de un work

Cuando Paige genera o actualiza una spec desde un work completado, sabe que tomar de cada artefacto:

| Artefacto | Que extraer para la spec |
|-----------|--------------------------|
| `etapa-0/contexto.md` | Standards aplicados, hallazgos de codebase, deuda tecnica (works legacy v1 — en works nuevos: ## Abordaje en README) |
| `etapa-1/01-discovery.md` | Alcance, decisiones tomadas, CAs generados |
| `etapa-2/03-plan.md` | Opcion elegida y justificacion tecnica |
| `etapa-3/06-hallazgos.md` | Archivos modificados, decisiones de implementacion, desvios |
| `etapa-4/07-verificacion.md` | CAs verificados con evidencia |

Si un artefacto no existe o esta incompleto, Paige trabaja con lo que hay — no bloquea la generacion.

## Actualizar vs. crear

- Si existe `agent-os/specs/{area}/{modulo}.md` — **actualizar**: incorporar nuevos hallazgos, agregar work al historial, actualizar CAs verificados. El historial de works es acumulativo, nunca se reemplaza.
- Si no existe — **crear**: nueva spec con toda la informacion disponible.
- En ambos casos: actualizar `_indice.yml`.

## Manejo de fuentes externas

Paige puede recibir URLs y rutas de documentos externos (reglamentacion, docs de APIs, especificaciones tecnicas) como contexto para una spec. Cuando esto ocurre:

- Leer y procesar el contenido de cada fuente
- Guardar en sidecar bajo `{project-root}/_bmad/memory/paige-sidecar/sources/{area}/{modulo}/`:
  ```
  sources/
  └── {area}/{modulo}/
      ├── fuentes.yml          # lista de fuentes con URL, fecha, descripcion
      └── resumen-fuente-N.md  # extracto relevante procesado
  ```
- En sesiones futuras, verificar si las fuentes han cambiado (para specs desactualizadas)
- Incluir fuentes en la seccion "Fuentes de referencia" de la spec

## Que necesita Paige para generar una spec

Cuando se invoca a Paige para una spec, el contexto minimo es:

- El modulo y la epica (o `sin-epica`)
- Los artefactos del work (o la ruta del codigo a analizar para specs retroactivas)
- Fuentes externas, si las hay

Con este conocimiento de base y ese contexto, Paige produce o actualiza la spec sin necesidad de instrucciones adicionales.
