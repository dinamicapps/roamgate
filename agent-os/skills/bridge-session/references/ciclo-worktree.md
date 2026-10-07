# Ciclo rama+worktree (particion por unidad)

> Fuente unica de la disciplina de aislamiento, commits y cierre para **toda unidad** (work
> o diseño) que toque archivos del repo — instancia desplegada por el launcher del bridge o
> sesion manual, da igual. `fase-7-work-colaborador.md`, `disciplina-participante.md`, el
> hook de origen y el CLAUDE.md del proyecto apuntan aqui; no duplican estas reglas.
> La mecanica git la ejecutan los verbos deterministas del runtime (`agentos worktree *`);
> esta reference define CUANDO se invocan y que hace la cognicion entre verbo y verbo.

## Cuando aplica

- **Todo trabajo que toque archivos del repo** — work o diseño, instancia de launcher o
  manual — abre worktree o se suma a uno existente antes del primer `Edit`/`Write`. Trabajo
  que no toca archivos (responder, consultas) no lo necesita.
- Si el binario no conoce los verbos (`comando desconocido`: instalacion vieja), anunciar
  la degradacion y aplicar la disciplina previa (rama feature, push gated). No improvisar
  la mecanica git a mano.

## Regimen de commits: la rama es una particion por unidad

Un worktree puede contener **mas de una unidad** en su vida (un diseño mas sus works
consumidores, o dos works sueltos acotados), pero solo **una activa a la vez**. Los commits
de la rama, desde donde diverge de la default hasta `HEAD`, forman una **particion
ordenada**: un segmento por unidad, sin huecos ni solapes.

- El `base_commit` de la primera unidad es el punto de divergencia con la default; el de
  cada unidad siguiente es el commit colapsado de la anterior. Vive en el bloque
  `worktree{}` de su frontmatter y no cambia nunca.
- **Trailer obligatorio.** Todo commit de la rama — checkpoint intermedio o commit
  colapsado — lleva una linea `Work: {slug}` o `Diseno: {slug}` en el mensaje. Es lo que
  reconstruye la particion; un commit sin trailer, o con el trailer de una unidad que no
  vive en esa rama, queda `COMMIT_HUERFANO` / `UNIDAD_NO_DECLARADA`.
  <!-- FUENTE: agent-os/skills/cerrar-work-git/SKILL.md seccion "Reglas de git". El formato exacto
  del trailer vive alli. NO duplicar — para modificar, editar la fuente. -->
- **Una unidad a la vez.** Mientras una unidad este activa (sin colapsar), ninguna otra
  unidad de la misma rama commitea. Commits de dos unidades intercalados no se pueden
  separar despues: el colapso los rechaza con `HISTORIA_INTERCALADA`.
- **No sincronizar con la default mientras la rama vive.** Ni `git merge {default}` hacia
  dentro ni `git rebase {default}`: un merge entrante rompe la linealidad del rango
  (`RANGO_NO_LINEAL`) y un rebase invalida el `base_commit` de cada unidad (reescribe los
  hashes, `BASE_HUERFANO`). La divergencia se resuelve una sola vez, en el merge final hacia
  la default.

## Apertura — antes del primer cambio a archivos

Gate: ningun Edit/Write a archivos del repo sin worktree abierto o sumado.

```
agentos worktree abrir --slug {slug}
```

- Crea la rama y el worktree en `~/.claude-worktrees/{repo}/{slug}` (raiz unica en el home;
  override: `.claude/agent-os.local.json` campo `worktrees.raiz`). El nombre de la rama sale
  del tipo de la unidad que la abre: `diseno/{slug}` si es un diseño, `work/{slug}` si es un
  work suelto — nunca se construye a mano.
- Si el work/diseño ya existia sin commitear en el checkout principal, el verbo LO MUEVE al
  worktree (`work_movido: true`) y hornea el bloque
  `worktree{rama,ruta,creado_en,base_commit}` en su frontmatter
  (`frontmatter_horneado: true`). `base_commit` es el `HEAD` de la rama al momento de abrir
  — el ancla del colapso — y no se re-hornea despues. Si el work aun no existe, crear el
  work y re-invocar `worktree abrir` (es idempotente) para que hornee el bloque.
- Desde aqui, TODA la operacion (codigo, work-record, evidencia) ocurre EN el worktree:
  cambiar el directorio de trabajo a `ruta_worktree` y operar alli.
- `RAMA_OCUPADA`: la rama existe sin worktree registrado (resto de un ciclo anterior).
  No pisar: inspeccionar con `git log`, decidir con el usuario/director si retomarla
  (crear worktree manualmente) o renombrarla.
- `UNIDAD_AMBIGUA`: el slug existe como work Y como diseño a la vez; declarar cual es.

## Sumar una unidad a una rama existente

Cuando un diseño ya abrio worktree y un work consumidor (`diseno_origen` = ese diseño)
quiere trabajar en la misma rama, o cuando un segundo work suelto acotado se suma a otro
(cotas de composicion: un diseño admite N works propios; un work suelto admite hasta 2), no
se abre worktree nuevo:

```
agentos worktree sumar --slug {slug} --a {rama}
```

- Precondicion: la unidad activa de esa rama debe estar colapsada. Si no,
  `UNIDAD_ACTIVA_SIN_COLAPSAR` — colapsarla primero (siguiente seccion) y reintentar. Con
  eso, `HEAD` de la rama es siempre el commit colapsado de la unidad anterior, y ese es el
  `base_commit` que se hornea para la unidad que entra.
- `YA_SUMADA`: la unidad ya pertenece a esa rama (no hay nada que hacer).
- `YA_EN_OTRA_RAMA`: la unidad ya tiene bloque `worktree{}` apuntando a una rama distinta —
  no se pisa un vinculo existente por un `--a` equivocado.

## Colapsar una unidad

Consolida los checkpoints de la unidad activa en **un** commit sobre su `base_commit`, sin
tocar los commits de las unidades vecinas de la misma rama:

```
agentos worktree colapsar --slug {slug} --asunto "{resumen para el commit}"
```

Se invoca **automaticamente** dentro de `agentos work close` para un work (no hay paso
manual que recordar). **No** para un diseño: `agentos diseno transition` no colapsa por su
cuenta — el anfitrion invoca `worktree colapsar` a mano cuando el diseño termina su tramo
activo en la rama (ver "Cierre", Paso 1).

Antes de tocar la historia valida, en orden: worktree limpio (`WORKTREE_SUCIO`), que la
unidad sea la activa de la rama (`UNIDAD_NO_ACTIVA`), que el rango `base_commit..HEAD` sea
lineal y sin merges (`RANGO_NO_LINEAL`), que la particion completa de la rama sea coherente
(`HISTORIA_INTERCALADA`, `COMMIT_HUERFANO`, `UNIDAD_NO_DECLARADA`, `PARTICION_INVALIDA`) y
que `base_commit` siga siendo ancestro de `HEAD` (`BASE_HUERFANO` si la historia se
reescribio; `BASE_AUSENTE` si la unidad nunca tuvo `base_commit` — regimen previo, no
historia reescrita). `NADA_QUE_COLAPSAR` no es un fallo: una unidad sin commits propios
cierra igual. Es **idempotente**: si la unidad ya tiene un solo commit, lo devuelve sin
reescribirlo (su hash sigue siendo el `base_commit` de la unidad siguiente).

## Cierre — 3 pasos en orden estricto

Detonante: el trabajo termino (fastrak: F2 verificada y grupo archivado; work normal:
gate de cierre de E4 aprobado; diseño: gate de handoff aprobado).

### Paso 1 — Checkpoint final y colapso

- Commit del ultimo checkpoint pendiente, con el trailer de la unidad. El colapso exige el
  arbol trackeado limpio.
- **Work:** `agentos work close --slug {slug} --estado {COMPLETADO|COMPLETADO_CON_BRECHA|CANCELADO}`
  ejecutado CONTRA EL WORKTREE (el runtime resuelve el workspace desde el cwd). Colapsa la
  unidad automaticamente antes de archivar: los checkpoints quedan en UN commit.
- **Diseño:** `agentos diseno transition --slug {slug} --a {estado terminal}` NO colapsa. El
  anfitrion invoca `agentos worktree colapsar --slug {slug} --asunto "..."` justo despues de
  la transicion, mientras el diseño sigue siendo la unidad activa de su rama — antes de que
  un work consumidor pueda sumarse (`worktree sumar` exige la unidad activa colapsada).

### Paso 2 — Merge a la rama default

**Invariante git (todo el ciclo).** El trabajo git ocurre SIEMPRE en local: el merge, la
resolucion de conflictos y cualquier checkout se hacen en el checkout local; contra el remote
SOLO `fetch`/`pull`/`push`. NUNCA se fusiona en el remote (`gh pr merge`) — esta bloqueado
mecanicamente por el hook `block-remote-merge.sh` (guarda siempre activa). La fusion es local;
el push la publica cuando el humano decide.

```
agentos worktree merge --slug {slug}
```

Antes de fusionar (`--no-ff`), valida la **particion completa** de la rama — no solo la
unidad que se esta cerrando: todas las unidades declaradas deben cubrir
`divergencia..HEAD` sin huecos ni solapes, y cada segmento debe ser exactamente un commit
con el trailer de su unidad. `--slug` puede nombrar la unidad raiz o cualquier unidad
sumada; la salida enumera `unidades[]`, todas las que viajan en el merge.

- **Limpio** -> `{merge_commit}`. Continuar al paso 3.
- **`UNIDAD_SIN_COLAPSAR`** -> alguna unidad de la particion tiene mas de un commit.
  Colapsarla (paso anterior) y reintentar.
- **`COMMIT_HUERFANO`** / **`UNIDAD_NO_DECLARADA`** / **`PARTICION_INVALIDA`** -> la
  historia de la rama no cuadra con las unidades declaradas (commit sin trailer, trailer de
  una unidad ajena, segmentos que se solapan o dejan hueco). Investigar con `git log` antes
  de forzar nada.
- **`MERGE_CONFLICTO`** -> el verbo ya aborto (default intacto) y listo los archivos.
  La resolucion es COGNITIVA, en el checkout principal:
  1. `git merge --no-ff {rama}` de nuevo, inspeccionar los conflictos.
  2. Resolver con criterio; re-ejecutar la verificacion sobre lo afectado ANTES de
     commitear el merge.
  3. Registrar en la bitacora de la unidad: archivos, criterio de resolucion, evidencia.
  4. Escalar por bridge SOLO si la resolucion excede tu confianza o pisa trabajo EN
     CURSO de otra instancia (DM al director; operador via `dashboard-usuario` destino
     fijo, `timeout_seg` amplio). No es paso obligatorio.
  Mientras el merge no este resuelto: el worktree y la rama se conservan y las unidades
  contenidas permanecen (o se reabren a) estado no terminal.

  **No usar `--amend` sobre un commit ya colapsado tras un intento de merge fallido**: su
  hash es el `base_commit` de la unidad siguiente de la particion, y un amend lo invalidaria
  (`BASE_HUERFANO`).
- **Push: NO.** El protocolo termina en el merge local; el push lo decide el humano.

### Paso 3 — Residuos y limpieza

```
agentos worktree cerrar --slug {slug}
```

- Guard `RAMA_NO_FUSIONADA`: sin fusion (por verbo o manual) no hay limpieza.
- **`RESIDUOS_PENDIENTES`** -> `data.residuos` trae el inventario `{ruta, ignorado, bytes}`.
  **Preguntar SIEMPRE** (en todos los niveles de autonomia): publicar el inventario por
  bridge al director/operador con la recomendacion propia (que copiar, que descartar) y
  esperar la decision. Sin respuesta: el worktree persiste y la limpieza queda pendiente
  — nada se borra sin aprobacion (la limpieza es post-cierre; las unidades pueden quedar
  cerradas igual).
- Con la decision, escribir `{"aprobados":["ruta", ...]}` a un archivo y:

```
agentos worktree cerrar --slug {slug} --aprobados {archivo}
```

  Copia los aprobados al checkout principal (misma ruta relativa), descarta el resto,
  remueve el worktree y borra la rama. Lista vacia (`{"aprobados":[]}`) = descarte total
  aprobado.
- Registrar la tabla inventario/decision (residuo -> copiado|descartado -> quien aprobo)
  en la bitacora de la unidad.

## Secuencia canonica

```
caso feliz (work):     checkpoint (trailer) -> work close (colapsa)
                        -> worktree merge (ok) -> worktree cerrar
                        (RESIDUOS_PENDIENTES -> aprobacion por bridge -> cerrar --aprobados)

caso feliz (diseño):   checkpoint (trailer) -> diseno transition -> worktree colapsar
                        -> worktree merge (ok) -> worktree cerrar
                        (solo si el diseño no sigue recibiendo works sumados en la misma rama)

con conflicto:          checkpoint (trailer) -> work close|diseno transition (+colapsar)
                        -> worktree merge (MERGE_CONFLICTO)
                        -> resolucion cognitiva del merge -> worktree cerrar (guard pasa) -> ...
```

Nada de "commit final" despues de que la unidad quedo colapsada (por `work close` o por
`worktree colapsar` manual): el colapso ya dejo UN commit para esa unidad, y uno posterior
le agregaria un segundo, que `worktree merge` rechazaria con `UNIDAD_SIN_COLAPSAR`.

## Contrato de verbos (referencia rapida)

| Verbo | Devuelve | Errores propios |
|---|---|---|
| `worktree abrir --slug` | `{rama, ruta_worktree, base_commit, ya_existia, work_movido, frontmatter_horneado}` | `RAMA_OCUPADA`, `SIN_DEFAULT`, `UNIDAD_AMBIGUA` |
| `worktree sumar --slug --a {rama}` | `{rama, ruta_worktree, base_commit}` | `SIN_WORKTREE`, `SIN_DEFAULT`, `YA_SUMADA`, `YA_EN_OTRA_RAMA`, `UNIDAD_ACTIVA_SIN_COLAPSAR`, `PARTICION_INVALIDA`, `RANGO_NO_LINEAL`, `BASE_HUERFANO`, `BASE_AUSENTE`, `COMMIT_HUERFANO`, `UNIDAD_NO_DECLARADA`, `HISTORIA_INTERCALADA` |
| `worktree colapsar --slug --asunto` | `{commit, unidad, commits_colapsados}` | `UNIDAD_SIN_WORKTREE`, `WORKTREE_SUCIO`, `UNIDAD_NO_ACTIVA`, `NADA_QUE_COLAPSAR`, `RANGO_NO_LINEAL`, `HISTORIA_INTERCALADA`, `COMMIT_HUERFANO`, `UNIDAD_NO_DECLARADA`, `BASE_HUERFANO`, `BASE_AUSENTE`, `PARTICION_INVALIDA`, `BASE_INCONSISTENTE`, `ASUNTO_VACIO`, `SIN_DEFAULT`, `UNIDAD_AMBIGUA`, `UNIDAD_NO_ENCONTRADA` |
| `worktree estado --slug` | `{rama, ruta, existe, sucio, fusionada_en_default, unidades[]}` | `SIN_WORKTREE`, `UNIDAD_SIN_WORKTREE`, `UNIDAD_NO_ENCONTRADA`, `UNIDAD_AMBIGUA` |
| `worktree merge --slug` | `{merge_commit, unidades[]}` | `SIN_WORKTREE`, `SIN_DEFAULT`, `WORKTREE_SUCIO`, `DEFAULT_NO_CHECKED_OUT`, `DEFAULT_SUCIO`, `MERGE_CONFLICTO`, `UNIDAD_SIN_COLAPSAR`, `COMMIT_HUERFANO`, `UNIDAD_NO_DECLARADA`, `HISTORIA_INTERCALADA`, `PARTICION_INVALIDA`, `BASE_HUERFANO`, `BASE_AUSENTE`, `RANGO_NO_LINEAL`, `UNIDAD_SIN_WORKTREE`, `UNIDAD_NO_ENCONTRADA`, `UNIDAD_AMBIGUA` |
| `worktree cerrar --slug [--aprobados]` | `{copiados, descartados, worktree_removido, unidades[]}` | `SIN_WORKTREE`, `SIN_DEFAULT`, `RAMA_NO_FUSIONADA`, `WORKTREE_SUCIO`, `RESIDUOS_PENDIENTES` (con `data.residuos`), `WORKTREE_REMOVE_FALLO`, `BRANCH_DELETE_FALLO`, `UNIDAD_SIN_WORKTREE`, `UNIDAD_NO_ENCONTRADA`, `UNIDAD_AMBIGUA` |

`--slug` en `estado`/`merge`/`cerrar` acepta la unidad raiz o cualquier unidad sumada: la
rama se resuelve leyendo el frontmatter de esa unidad, nunca construyendola desde el slug.

En fallos de `cerrar`, `data` trae `resultado_parcial` (copiados/descartados/worktree_removido) — leerlo antes de reintentar: las operaciones previas al fallo NO se revierten.
