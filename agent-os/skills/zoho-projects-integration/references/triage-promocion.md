# Fase 2: Triage + Promocion

## Triage
Presentar las filas con `estado_triage == pendiente` del `_pendientes.md` (AskUserQuestion por item o en lote). Acciones por item:
- **Promover** -> Fase de promocion (abajo).
- **Descartar** -> `estado_triage = descartado` (registrar razon breve en una nota del doc).
- **Posponer** -> `estado_triage = pospuesto` (queda para una proxima sesion).

El sistema NO auto-promueve: cada accion es decision del usuario.

## Promocion (item -> work)
1. Construir la **semilla**: titulo + descripcion del item (del payload) como prosa para el abordaje. El `item_tipo` Zoho se ofrece como **pista** de ruta (issue -> sugiere `bugfix`; task -> sugiere acotado/diseno), pero el abordaje normal de /alfred DESTILA la ruta — no se fija.
2. Invocar `/alfred` con esa semilla (el abordaje corre normal: comprender -> evidencia -> proponer ruta).
3. Al crear el work, pasar el bloque `origen_externo` a `agentos work open`. Recomendado:
   escribir el JSON al scratchpad y usar `--input <ruta>`; stdin sigue valido para la
   invocacion simple:
   ```json
   {"origen_externo":{"sistema":"zoho-projects","item_tipo":"issue","item_id":"...","item_no":"AUTH-50","item_url":"...","proyecto":"...","proyecto_id":"...","descargado_en":"2026-06-24"}}
   ```
   (junto con titulo/meta/abordaje/ruta que produce el abordaje). El runtime lo persiste al frontmatter.
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->
4. Actualizar el `_pendientes.md`: `estado_triage = promovido`, `work_slug = {slug}`.

<!-- FUENTE: agent-os/templates/work-record/schema/zoho.md seccion "Origen externo (origen_externo)". El schema del bloque vive alli. NO duplicar -- editar la fuente. -->
