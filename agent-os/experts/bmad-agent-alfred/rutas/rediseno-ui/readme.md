# Ruta: rediseno-ui

> Rediseño UI/UX iterativo sobre base existente. Anfitriona: **Sally**. Sub-flow propio (no usa piezas/plan.md): discovery acotado -> iteracion -> verificacion -> cierre.

## Cuando aplica

El abordaje destilo `rediseno-ui` cuando concurren:

- El trabajo es **rediseño o ajuste de UI/UX** (re-alinear vistas a un sistema visual, adoptar tokens/componentes, ajustar layout, visualización o carga de datos en pantalla).
- Existe una **base de diseño previa** (standards de UI, design tokens, librería de componentes, o un diseño/épica origen): NO requiere modelar datos o procesos nuevos.
- Requiere **discovery acotado de la cadena de datos existente** de la pieza a reemplazar (de dónde salen las listas desplegables, el origen de los datos del formulario/página, qué SPs o APIs alimentan los catálogos) — pero NO discovery amplio del sistema.
- Es predominantemente **mono-actor** y de cambio visual; toca backend en el contrato de datos del componente (qué consume, qué envía) y en reorganizar orígenes de listas/catálogos, no en lógica de negocio nueva.

Cuando el diseño consumido por el work trae maquetas/artifacts de UI, declarar esta ruta desde el inicio del abordaje e instruir explícitamente "aplicar el diseño" — no "referencia visual", que subpondera el rediseño frente a la funcionalidad.

### Dos modalidades

| Modalidad | Descripción |
|-----------|-------------|
| **migrar** | Llevar una vista al sistema de diseño (caso Nova: re-alinear a tokens/componentes `nv-*`). |
| **corregir-existente** | Sanear una página ya creada que arrastra deuda: CSS in-line, componentes ad-hoc, orígenes de datos desordenados. El objetivo no es solo seguir migrando; es corregir lo ya hecho contra el patrón de diseño y el estándar. |

## Sub-flow

```
abordaje (ya hecho)
   |
   fase-1-discovery-acotado.md   (Sally + Dexter/Atlas/Winston acotados; patrón de diseño
   |                              definido; contrato de datos si toca_backend; hornea work-record)
   |
   fase-2-iteracion.md           (Sally + implementador; bitácora viva ## Hitos;
   |                              por hito: implementar -> captura -> review Sally -> ajuste)
   |
   fase-3-verificacion.md        (Quinn + Playwright; loop acoplado a la iteración;
   |                              invariante de calidad UI: BEM + tokens, sin CSS in-line)
   |
   fase-4-cierre.md              (Alfred; COMPLETADO / COMPLETADO_CON_BRECHA;
                                  Sally destila patrones/antipatrones al estándar)
```

## Anfitrion

Sally conduce las fases 1-3 con prefijo `A-Sally:`. Alfred gobierna el cierre estructural en la fase 4 (como en todas las rutas) — no es anfitrion, es transicion estructural del protocolo; este handoff no es una excepción sino la norma del sistema.

- **Fase 1 — Discovery acotado:** Sally (LE) como anfitriona. Dexter mapea la cadena de datos existente (orígenes de listas, catálogos, SPs, DB) y Atlas/Winston auditan el lado backend (controllers/endpoints/BL), **acotados a la pieza** — mapean lo existente, no modelan datos nuevos.
- **Fase 2 — Iteración:** Sally (LE) conduce el review UX por hito. Atlas (o el usuario en pairing) implementa y aplica ajustes.
- **Fase 3 — Verificación:** Quinn verifica en navegador con Playwright (loop acoplado a la iteración). Atlas aplica ajustes en caliente.
- **Fase 4 — Cierre:** Alfred gobierna el cierre estructural. Sally destila al estándar.

## Work-record

Se crea desde la plantilla `readme-work` existente, frontmatter `ruta: rediseno-ui`. Slug `{YYYYMMDD}-rediseno-{slug-corto}`.

Campos adicionales propios de esta ruta:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `origen_rediseno` | string, opcional | Slug, épica o estándar que esta ruta consume. Su presencia autoriza saltar discovery amplio. Campo propio de esta ruta — distinto del `diseno_origen` canónico que solo puebla `--desde-diseno`. |
| `toca_backend` | bool, default `false` | Si `true`, la fase 1 exige producir el `## Contrato de datos`. Si `false` (cambio puramente cosmético sin reorganizar orígenes), la tabla puede omitirse. |

**Campo `modo`:** esta ruta declara `modo: normal` por convención — igual que `bugfix`. La clasificación real vive en `ruta: rediseno-ui`, no en `modo`. NO se ha agregado `rediseno-ui` a `ModosWork` para no reintroducir la dualidad ruta↔modo.

## Distincion vs diseno

| Dimension | `diseno` | `rediseno-ui` |
|-----------|----------|---------------|
| Modelo de datos | **Crea** modelo nuevo (E/R, tablas, CRUD nuevo) | **Mapea** el existente para preservarlo |
| Discovery | Multi-actor, amplio (sistema + lógica heredada) | Acotado a la cadena de datos de UNA pieza |
| Plan formal | Plan E2 (Winston/Bob/Dexter/Sentinel) | Sin plan E2; bitácora viva por hitos |
| Reglas heredadas | Descubrimiento activo de reglas implícitas | Reglas ya documentadas en estándares |
| Verificación | Gates ceremoniales por etapa | Loop Quinn/Playwright acoplado a la iteración |

**Regla de oro:** `diseno` crea modelo de datos; `rediseno-ui` mapea el existente. Si en el análisis surge la necesidad de modelar datos o procesos nuevos (E/R, tablas, CRUD nuevo, lógica de negocio nueva), es `diseno`, no `rediseno-ui`.
