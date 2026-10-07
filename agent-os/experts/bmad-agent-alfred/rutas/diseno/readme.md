# Ruta: diseno

> Feature con modelado real. Invoca `/disenar` (que reusa, no reimplementa) y luego las piezas compartidas.

## Cuando aplica

El abordaje destilo: multi-modulo, multi-actor, reglas heredadas implicitas, o sistema externo nuevo no documentado. La idea requiere modelarse por procesos antes de plan.

## Sub-flow

```
abordaje (ya hecho)
   |
   /disenar  (REF-> subsistema de diseno; su topologia no se enuncia aqui)
   |   - el loop adversarial de 4 caminos vive ALLI, no se reimplementa aqui
   |   - produce agent-os/disenos/{slug}/modelo.yml + brief.md + datos.md
   |
   piezas/plan.md -> piezas/ejecucion.md -> piezas/verificacion.md
```

<!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Modo inicial". La topologia del flujo (quien conduce, que steps, en que orden) vive alli. Aqui solo se indexa la invocacion por referencia. NO duplicar la regla — para modificar, editar la fuente. -->

## Invocacion de /disenar (REF->)

Alfred invoca `/disenar` internamente con la evidencia del abordaje como contexto pre-validado (el FOCO la recibe como insumo, no la redescubre). Alfred **no** reimplementa el flujo de diseno ni el loop de validacion adversarial de hallazgos.

- Subsistema: el comando `/disenar` + `agent-os/skills/disenar/`.
- Loop adversarial de 4 caminos (A acepto / B otra tecnica / C cancela / D contexto): `agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md`.

<!-- FUENTE: agent-os/skills/disenar/SKILL.md y agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md. La ruta diseno INVOCA /disenar por referencia; NO reimplementa steps ni el loop de 4 caminos. -->

## Atajo --desde-diseno

Si el usuario invoca `/alfred iniciar --desde-diseno={slug}`, se salta la invocacion de `/disenar` (el brief ya existe en estado `BRIEF_LISTO`/`EN_USO`) y se arranca directo en las piezas. El work-record nace con `diseno_origen: {slug}`.

## Diseño paraguas (1 diseño → N works)

Si el diseño consumido tiene `es_paraguas: true`, Alfred NO fragmenta ni orquesta cola
automática — **solo valida y registra**. El usuario inicia cada work manualmente.

### Al iniciar (`/alfred iniciar --desde-diseno={slug}`)

1. **Leer `plan_works[]`** del README del diseño. Si `es_paraguas: false`/ausente → flujo
   actual sin cambios (omitir el resto de esta sección).
2. **Identificar el work.** Presentar los works ELEGIBLES (todas sus `depende_de` en estado
   `completado`) vía `AskUserQuestion`. Si solo uno es elegible, confirmarlo. El usuario elige
   cuál ejecutar.
3. **Gates deterministas (los ejecuta el runtime, no Alfred).** `agentos work open`
   con el bloque `desde_diseno{slug, work_paraguas}` en el payload aplica DOS gates
   antes de crear el work-record:
   - **Dependencias duras:** si el work elegido depende de Wx no `completado`, el
     verbo falla con `DEPENDENCIA_INSATISFECHA`. Override del usuario: pasar
     `override_dependencias: "{razon}"` en el payload y registrar la razon en
     bitacora.
   - **Freno de canonizacion (hallazgos):** si hay hallazgos HZ en estado activo
     (`pendiente_analisis`/`en_analisis`) cuyo `invalida` (el id del nodo que
     ponen en duda) cae en lo alcanzable por el Wn a abrir o en el propio nodo
     del Wn, el verbo falla con `HALLAZGOS_ACTIVOS_EN_PROCESOS` — primero se
     absorben al brief o se rechazan (`/disenar` retroceso). Override:
     `override_hallazgos: "{razon}"` (ej. el director decide absorberlos en este
     mismo work), registrado en bitacora. Hallazgos activos SIN `invalida`
     no frenan; el verbo los reporta como aviso y Alfred los menciona al usuario.
4. **Horneado y reverse-link (los hace el runtime en el mismo open):** el work nace
   con `diseno_origen`, `work_paraguas` y `contratos_asignados[]` (las rutas de SUS
   contratos `procesos/P{n}.md`, resueltas de `plan_works[Wn].procesos`) en el
   frontmatter, y la fila del plan pasa a `estado: en_progreso` con `work_slug`
   real. Alfred no edita el README del diseño a mano. Si el verbo reporta
   `contratos_no_encontrados`, Alfred lo eleva al usuario (contrato faltante en el
   diseño = hueco a resolver, no a ignorar).

   Ademas, el mismo `open` **hornea el modelo del work**: deriva el subgrafo de
   `Wn` desde el modelo del diseño (los procesos que contiene y todo lo alcanzable
   desde ellos), lo escribe en `agent-os/work-records/{slug}/modelo.yml` con
   `origen` y `rol` sellados nodo a nodo, y proyecta el bloque `## Terreno` del
   README. La salida trae `modelo_horneado`, la `frontera[]` (lo que cruza hacia
   otros works) y, si el horneado se omitio, `modelo_no_horneado_razon`. Si falla,
   el work NO se borra: se rehace con `agentos work terreno --slug {work}`.
   Ese verbo cubre el modelo que FALTA. Cuando el modelo ya existe pero quedo
   viejo —el diseño gano o perdio nodos despues de abierto el work— no pisa nada
   y responde `modelo_ya_existia: true`: ahi la via es
   `agentos work terreno --slug {work} --rehornear`, que re-proyecta desde el
   diseño conservando lo que el work emitio de propio y declara en
   `data.rehorneado` lo que se perdio en el camino.
   Alfred eleva al usuario tanto la frontera reportada como cualquier razon de
   omision — el borde entre works es justo donde viven las cosas que nadie vio.

### Al cerrar el work (pieza de cierre)

Alfred marca la fila via runtime: `agentos diseno plan-work --slug {diseno} --id {Wn}
--estado completado` → habilita los works que dependian de el. Las filas `RE-{n}`
(works reactivos registrados por el runtime) se cierran igual (`--id RE-{n}`).
Cuando TODOS los `plan_works` están `completado`, el diseño puede pasar a
`CERRADO` (gobernado por `/disenar`).

### Consulta del tablero

`/disenar estado {slug}` muestra works pendientes/en progreso/completados, cuáles elegibles
ahora, y progreso del paraguas. Alfred mantiene la tabla coherente; el usuario decide el ritmo.

<!-- FUENTE: agent-os/templates/diseno/README.md seccion "Plan de works (fragmentación)". El plan de works es fuente unica en el README del diseño; Alfred lo lee y actualiza work_slug/estado. NO duplicar el plan en el work-record. -->
<!-- FUENTE: agent-os/templates/work-record/schema/cierre-guards-diseno.md seccion "Campos de diseño paraguas". Los campos work_paraguas/realinea_works viven alli. NO duplicar -- editar la fuente. -->

## Tras cerrar el diseno

Cuando `/disenar` cierra con `BRIEF_LISTO`, Alfred continua con las piezas (igual que `acotado`, pero el insumo del plan es el brief + `datos.md`).

## Reevaluacion

Caminos (a)/(b)/(c)/(d) **y (e)**. El camino (e) — regresar a `/disenar` para refinar el brief — aplica SOLO en esta ruta (es la unica con `diseno_origen`). Distincion (b) vs (e): ver `piezas/reevaluacion.md`.

## Work-record

Frontmatter `ruta: diseno`, `diseno_origen: {slug}` (+ `work_paraguas: {id}` si el diseño es paraguas). Formato compartido. Ver `gestion/readme.md`.
