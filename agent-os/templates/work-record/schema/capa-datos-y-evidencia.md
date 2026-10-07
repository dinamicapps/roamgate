# Schema de frontmatter — Capa de datos y evidencia requerida

> Fragmento de `frontmatter-schema.md` (ver indice). Los bloques `capa_datos`, `evidencia_requerida` y `pruebas_requeridas`, simetricos entre si y a `capa_seguridad`.

## Capa de datos (capa_datos)

> FUENTE UNICA del schema de `capa_datos`. Simetrico a `capa_seguridad`. Las tareas que tocan persistencia declaran este bloque (opt-in). Dexter [PD] co-diseña en E2; Dexter [VD] verifica en E4 (CD-N).

Bloque opt-in en frontmatter de tarea (`agent-os/templates/work-record/etapa-2/tarea.md`):

```yaml
capa_datos:
  aplica: true
  entidades:
    - nombre: "{Tabla_X | sp_dominio_accion}"
      operacion: "create"   # create | alter | drop | data
  ddl_sugerido: |
    {DDL del datos.md, marcado SUGERENCIA no contrato. El DDL real puede
     diferir al ejecutar — convenciones de columnas, indices presentes, etc.}
  saneamiento_requerido: false   # true si una FK/constraint nueva choca con datos historicos
  saneamiento_estrategia: ""     # referencia a la estrategia (datos.md seccion 4) si aplica
  datos_md_ref: "agent-os/disenos/{slug}/datos.md"   # de donde se derivo (si viene de /disenar)
```

Campos:
- `aplica`: bool. Si false o ausente, la tarea no toca persistencia.
- `entidades[]`: tablas/SP que la tarea toca, con su operacion.
- `ddl_sugerido`: sugerencia, no contrato (hereda regla de Winston "DDL como suggestion").
- `saneamiento_requerido` + `saneamiento_estrategia`: para discernimiento de integridad (P-D1).
- `datos_md_ref`: trazabilidad al artefacto de /disenar (vacio si el work es directo).

Verificacion en E4 (Dexter [VD]): CD-1 estructural, CD-2 contra BD real (solo lectura, P-D4), CD-3 saneamiento, CD-4 no-redundancia. CD-2 fallido es bloqueante de cierre.

## Evidencia requerida (evidencia_requerida)

> FUENTE UNICA del schema de `evidencia_requerida`. Simetrico a `capa_seguridad` y `capa_datos`.
> Las tareas que producen comportamiento verificable (API, UI, BD estructural) declaran este bloque
> (opt-in, derivado). El experto de dominio produce el artefacto en E4; Quinn lo audita (EV-N).
> Aplicabilidad: modo `normal` (y works legacy `modo: evolucion`, deprecado), works iniciados desde 2026-06-09. Detalle del flujo de
> auditoria y produccion en `agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`.

Bloque opt-in en frontmatter de tarea (`agent-os/templates/work-record/etapa-2/tarea.md`):

```yaml
evidencia_requerida:
  api:  true        # tarea expone/modifica/consume endpoint -> log peticion+url+resultado (Sentinel [VP])
  ui:   false       # tarea toca UI -> captura(s) por CA + flujo + brecha (Tessa [E2E]). UI modificada: par {CA}-antes.png (baseline E3) + {CA}-despues.png
  bd:   true        # tarea hace cambio estructural BD -> 4 evidencias (Dexter [VD])
  descartes: []     # descarte deliberado del usuario. Sin entrada aqui (ni [OVERRIDE] en bitacora),
                    # el eje es bloqueante de cierre. Ej:
                    #   - eje: ui
                    #     razon: "entorno CI sin display disponible"
                    #     decidido_por: usuario
                    #     fecha: "2026-06-09"
```

Campos:
- `api` | `ui` | `bd`: bool. Cada uno activa el eje de evidencia correspondiente. Si false o ausente, el eje no aplica a la tarea.
- `descartes[]`: lista de descartes deliberados del usuario. Cada entry: `{eje, razon, decidido_por, fecha}`. El descarte tambien se registra como `[OVERRIDE]` en la bitacora de E4 (doble registro: auditable por frontmatter sin abrir bitacora, razon humana en bitacora). `cripto` tambien es descartable: exime el guard `CR_SIN_RESULTADO` aunque `cripto` no sea un eje de `evidencia_requerida` (la dimension se declara en `capa_seguridad.dominios`; el descarte reutiliza este mecanismo para no crear un segundo canal de exencion).

Reglas de derivacion (Bob/Winston las aplican al materializar la tarea en E2):
- `capa_seguridad.aplica: true` -> `evidencia_requerida.api: true`.
- modo `evolucion` legacy (deprecado; hoy ruta `rediseno-ui`) o tarea con paths `*.cshtml` / `*.tsx` / `*.html` -> `evidencia_requerida.ui: true`.
- `capa_datos.aplica: true` con `operacion in [create, alter, drop]` -> `evidencia_requerida.bd: true`.

Quien actualiza y consume:
- Bob/Winston: poblan `evidencia_requerida` al materializar tareas en E2 (derivado de los bloques anteriores).
- Quinn en E4: consume `evidencia_requerida` para EV-1 (completitud). Invita al experto productor de cada eje activo.
- Sentinel [VP] / Tessa [E2E] / Dexter [VD]: producen el artefacto de su eje en `etapa-4/evidencia/{api,ui,bd}/`.

**UI modificada — baseline antes/despues (evita el "antes" alucinado):** cuando `ui: true` y la tarea toca una **vista existente**, el anfitrion de E3 captura el `{CA}-antes.png` **antes del primer edit** y lo guarda en `etapa-4/evidencia/ui/` (el estado original ya no existe en E4); Tessa agrega el `{CA}-despues.png` en E4. EV-1 exige el **par completo**; EV-2 exige que sean visiblemente distintos (no una reconstruccion de memoria). UI **nueva** no tiene baseline (solo `-despues`). Detalle: host-protocol `etapas/etapa-3/baseline-visual.md` seccion "Baseline visual antes del primer edit" y `etapas/etapa-4/evidencia.md`.

Compatibilidad: works iniciados antes de 2026-06-09 no tienen este bloque. Quinn cae a verificacion por prosa segun reglas vigentes a su inicio. Zero migracion forzosa (igual que `capa_seguridad` 2026-04-26 y `capa_datos`).

## Pruebas requeridas (pruebas_requeridas)

> FUENTE UNICA del schema de `pruebas_requeridas`. Bloque opt-in en frontmatter de tarea, molde
> `evidencia_requerida` (opt-in + `descartes[]`). Declara el impacto de la tarea sobre el modelo de
> pruebas de reglas de negocio del repo (capacidad "abordaje de modelo de pruebas", Quinn) y las
> exenciones deliberadas al gate mecanico de cierre que exige, por `regla_id` tocado, una anotacion
> en el libro-mayor `agent-os/pruebas/ledger.md`. El contrato de auditoria (los cuatro ejes BR-1..BR-4,
> incluida la trazabilidad al ledger) y el gate en si (codigo `OBLIGACION_PRUEBAS_NO_DECLARADA`) NO se
> duplican aqui — viven en `agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md`
> secciones 5 y 7. Este fragmento documenta solo la forma del campo.

Bloque opt-in en frontmatter de tarea (`agent-os/templates/work-record/etapa-2/tarea.md`):

```yaml
pruebas_requeridas:
  aplica: true        # la tarea toca/crea una regla de negocio cubierta por el modelo de pruebas
                       # del repo (agent-os/standards/testing/reglas-negocio.yml). Si false o
                       # ausente, el eje no aplica a la tarea.
  descartes: []        # descarte deliberado de un regla_id puntual, exento del gate de cierre.
                       # Sin entrada aqui, una regla que la tarea toca sin anotacion en el ledger
                       # bloquea el cierre. Ej:
                       #   - regla_id: "<Modulo>.<Superficie>.<Regla>"
                       #     razon: "la regla vive en la capa de datos/opaca del stack, con
                       #             cobertura parcial pendiente de migrar a capa de aplicacion"
                       #     decidido_por: usuario
                       #     fecha: "2026-07-21"
```

Campos:
- `aplica`: bool, opcional. Marca que la tarea toca reglas de negocio dentro del alcance del modelo de pruebas.
- `descartes[]`: lista de descartes deliberados del usuario, uno por `regla_id` exento. Cada entry: `{regla_id, razon, decidido_por, fecha?}`. El descarte exime esa regla puntual del gate de cierre sin exigir su prueba en este work — util, por ejemplo, cuando la regla vive en la capa de datos/opaca del stack y solo tiene cobertura parcial pendiente de una migracion posterior a capa de aplicacion.

> Ejemplo de descarte: una regla que hoy solo se puede probar contra un motor de base de datos real
> (la logica vive en la capa de datos/opaca, sin alternativa inmediata en la capa de aplicacion) se
> declara con `razon: "vive en la capa de datos/opaca del stack; cobertura parcial, migracion a capa
> de aplicacion diferida"` y `decidido_por: usuario` — el work no queda bloqueado por una regla que
> no puede resolver de fondo en su alcance.

Quien actualiza y consume:
- Bob/Winston o el usuario: declaran `descartes[]` en E2 cuando una regla tocada por la tarea no puede o no debe probarse en este work.
- El ejecutor de E3: anota el libro-mayor prueba<->work al crear/modificar/retirar una prueba de regla (nunca a mano — via el verbo del runtime).
- Quinn en E4: audita el contrato BR-1..BR-4 (incluido el nivel de trazabilidad al ledger) y consume `descartes[]` para determinar que reglas quedan exentas del gate de cierre.

Compatibilidad: bloque opt-in. Works sin este campo, o repos sin el modelo de pruebas fundado, no activan el gate de cierre correspondiente.

