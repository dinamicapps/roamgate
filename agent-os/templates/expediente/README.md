---
slug: {SLUG-DEL-EXPEDIENTE}
dominio: "{NOMBRE-DOMINIO, ej. SIIFA}"
estado: EN_ANALISIS
version_expediente: 0
fecha_inicio: {YYYY-MM-DD}
fecha_fin: null
autor: "{nombre}"
fuentes: []                # poblado por `expediente ingestar-fuente`. Cada entry:
                           #   - norma: "res-948-2026"
                           #     tipo: resolucion
                           #     fecha_vigencia: "2026-05-14"
                           #     version: 2
                           #     fuente_cruda: "ruta a la fuente cruda (no se duplica)"
                           #     deroga: [res-2275-2023]
                           #     modifica: []
                           #     derogada_por: []
requisitos_total: 0
requisitos_en_revision: 0
requisitos_sin_evaluar: 0
requisitos_derogados: 0
---

# Expediente de cumplimiento: {dominio}

## Estado

- **Estado:** {EN_ANALISIS | VIGENTE | EN_REVISION | ARCHIVADO}
- **Versión del expediente:** {N}
- **Anfitriona:** Mary (Dexter para BD, Sentinel si hay compliance)

## Fuentes normativas

Ver `fuentes[]` en el frontmatter y los snapshots en `versiones/`. Las fuentes crudas
(PDF/resoluciones) se referencian por path; NO se duplican aquí.

## Requisitos

Un archivo por requisito en `requisitos/R-NNN.md`. Cada uno trazable a su artículo de
norma (`origen.ancla`) y a los diseños/works/tests que lo implementan (`trazas`).

## Gap analysis

Prosa del análisis de brecha repo+BD en `gap/`, citada desde cada requisito.

## Trazabilidad

`trazabilidad.md` es la vista derivada (regenerable) de la matriz requisito ↔ diseño ↔ work ↔ test.

## Bitácora

Ver `bitacora.md` para el historial cronológico (ingesta de normas, revisiones).
