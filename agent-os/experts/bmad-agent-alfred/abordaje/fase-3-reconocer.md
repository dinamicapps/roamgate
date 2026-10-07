# Abordaje Fase 3 — Reconocer

> Conduce Alfred, ejecuta Mary. Alfred no investiga: convoca (capacidad `ANA` de Mary,
> `agent-os/experts/bmad-agent-mary/references/external-context.md`). Termina en menu A/P/C;
> solo `C` avanza a Fase 4.

## Mision

Definir **que es realizable aqui, a que costo e impacto**, y por lo tanto **en cuantas etapas
auditables** se parte la idea. Tres consecuencias que ordenan todo lo que sigue:

1. El barrido externo es insumo, no fin: produce el menu de lo que el usuario podria querer,
   pero lo que gobierna es la confrontacion contra el codebase.
2. Cada capacidad activada se confronta. Un requerimiento que nadie confronto contra el codigo
   es una intencion, no un requerimiento.
3. La entrega es un plan de etapas, no un alcance. Un alcance grande no se rechaza: se parte.

### Que NO se hace aqui

- No se propone ni confirma ruta (`responder|bugfix|acotado|diseno|...`) — eso es Fase 4.
- No se abre work-record ni diseno. Fase 4 y sus rutas lo hacen, opcionalmente heredando el
  catalogo y el plan que esta fase deja escritos.
- Cero Edit, cero Write sobre codigo del repo. Cero edicion a mano de los artefactos del propio
  reconocimiento (`README.md`, `catalogo.yml`, `etapas.yml`, `barrido.md`): todo pasa por los
  verbos `agentos reconocimiento *` — ver "Como se emite".

## Reglas duras

- Bash restringido a los verbos `agentos reconocimiento *` (mas la lectura ya permitida en
  Fase 2: Grep, Read, Glob, Bash de lectura, Agent, WebFetch, WebSearch).
- Todo hallazgo externo se sostiene en una URL leida (regla dura de R1).
- El corte en etapas es rebanada vertical (regla dura de R3).
- Los `.yml` del reconocimiento **nunca se editan a mano**: los verbos son el unico camino de
  escritura, y son quienes custodian el conteo — `dimension` y `sustento` no se escriben, se
  recomputan.

## Que la dispara

Por **naturaleza, no por tamano**. Al cerrar Fase 2, la pregunta es: **lo que el usuario nombra
ya existe en este repo?**

- **Propone algo que no existe** (capacidad, producto, integracion, "quiero algo tipo X") ->
  la fase corre. `agentos reconocimiento crear --slug {slug} --intencion "{intencion cruda}"`.
- **Apunta a algo que existe y falla o se ajusta** (bugfix, hotfix, refactor, ajuste focal) ->
  no corre.

Gatillar por tamano estaria mal por construccion: el tamano es lo que esta fase produce.
Gatillar por senales lexicas repetiria el defecto conocido del juez lexico — castigar a quien
describe bien sin usar la palabra clave.

**El descarte se declara con su razon, nunca en silencio:**

```
S-sistema: Fase 3 no aplica. Lo que pediste toca {X}, que ya existe en {archivo:linea}.
No hay terreno que reconocer. Sigo a Fase 4 a proponer ruta.
```

## R1 — Barrido y menu (Mary, capacidad ANA)

Mary ejecuta `external-context.md` con el tipo que clasifique la intencion, incluyendo el tipo
nuevo:

| Tipo | Que busca |
|---|---|
| competencia | competidores directos, soluciones similares |
| regulatorio | normativa aplicable al dominio |
| tecnico | docs y APIs de sistemas externos |
| dominio | patrones de industria |
| `prior-art` | proyectos y repos que resuelven lo mismo, y que se puede tomar prestado |

**Regla dura: todo hallazgo se sostiene en una URL leida** (`read_url` / WebFetch), no en el
titulo de un resultado de busqueda ni en lo que el modelo cree recordar. `NO SE` es salida
valida y preferible a rellenar (MANIFIESTO P8).

> **Lo que esto NO cubre.** El guard `HALLAZGO_SIN_URL` de `reconocimiento hallazgo add`
> comprueba que el flag `--url` este presente y no en blanco — nada mecanico impide pegar una
> URL plausible de memoria, ni una URL real cuyo contenido nadie leyo. Esa disciplina es
> cognitiva: se audita en el laboratorio, no algo que el runtime pueda verificar sin depender de
> conectividad. Decirlo asi, no fingir que el runtime lo cubre.

**El barrido no se resume: se desagrega.** No *"n8n es una plataforma de workflows"*, sino la
lista de lo que esos sistemas **hacen**, una capacidad por fila: disparadores por evento,
disparadores programados, reintentos con backoff, versionado de flujos, custodia de
credenciales, ejecucion parcial, replay, observabilidad de corridas, sub-flujos, manejo de error
por nodo. Una celda de `--hallazgo` que describe mas de una capacidad esta mal formada: partirla
en varias llamadas al verbo. Ese desglose es el menu, y es donde vive el valor de la fase.

Presupuesto: 3-5 busquedas base, hasta 3 de profundizacion. Por cada hallazgo que sobrevive:

```
agentos reconocimiento hallazgo add --slug {slug} --tipo prior-art \
  --hallazgo "{una capacidad, desagregada}" --url {url} --presta "{que se toma prestado}"
```

### Cuando no hay busqueda disponible

`external-context.md` degrada sin bloquear cuando Jina o WebSearch no estan. Eso no contradice
la regla de la URL: la regla dice que un hallazgo externo sin URL leida no entra, no que la fase
se detenga.

Si no hay busqueda: declararlo con el verbo, y el menu **no nace del barrido** — nace del
codebase (lo que Fase 2 encontro) y del usuario. Toda capacidad de ese menu nace con
`sustento: codebase` o `sustento: intencion`, ninguna con `externo`. R1, R2, R3 y R4 corren
igual: confrontar y cortar en etapas no dependen del barrido.

```
agentos reconocimiento barrido declarar --slug {slug} --ejecutado false \
  --razon "{herramienta de busqueda no disponible en esta sesion}"
```

Si el barrido si corrio, declararlo tambien (puede hacerse antes de la primera fila, o despues:
`--ejecutado true` limpia `razon_sin_barrido`):

```
agentos reconocimiento barrido declarar --slug {slug} --ejecutado true
```

## R2 — Activacion y confrontacion (lazo)

```
usuario activa (lotes <=4)  ->  se confronta lo activado  ->  se devuelve el costo
        ^                                                            |
        |___________ re-clasifica con el costo en la mano ___________|
```

**El acto del usuario es binario: la quiero / no la quiero.** No clasifica por etapa — el
*cuando* depende del costo, que todavia no conoce. Presentar por lotes de <=4 con
`AskUserQuestion` (cargar con `ToolSearch select:AskUserQuestion` si esta diferida).
**Recomendar es del agente; activar es del humano.**

1. Emitir el lote de capacidades del menu (nuevas o el resultado de re-clasificar):
   ```
   agentos reconocimiento capacidad emitir --slug {slug} --input {archivo-json}
   ```
   (upsert por `id`: una capacidad ya presente se actualiza, una nueva se agrega, ninguna se
   borra).
2. Activar o descartar segun la decision del usuario:
   ```
   agentos reconocimiento capacidad set --slug {slug} --id {id} --campo activada --valor true
   ```

**La confrontacion la ejecutan los mismos subagentes que ya usa Fase 2**: `Explore` cuando la
pregunta no tiene dueno, experto-consultor cuando si (Dexter si toca datos, Sentinel si toca
permisos o auditoria, Cipher si toca cripto, Winston si toca arquitectura). Catalogo de senales
por experto: `agent-os/experts/_registry.yml`.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md secciones "Prompt de encarnacion" y "Las dos clases". El prompt de encarnacion y el contrato del consultor viven alli. Aqui solo se declara COMO elegir el tipo en R2. NO duplicar la regla — para modificar, editar la fuente. -->

**Que emite la confrontacion de una capacidad: la lista de lo que toca, cada punto con
`archivo:linea`.** Nada mas. Los tres juicios se derivan de esa lista, nunca a ojo:

| De la lista | Se lee | Campo |
|---|---|---|
| volumen de puntos de contacto | **costo** | `contactos` |
| consumidores ajenos que cuelgan de esos puntos | **impacto** (aislado / transversal / estructural) | `consumidores` |
| puntos que no existen o exigen refactor previo | **realizable** (`aqui` / `con-previo` / `no-aqui`) | `realizable` |

```
agentos reconocimiento confrontar --slug {slug} --id {id} --input {archivo-json}
```
payload: `{"contactos":["archivo:linea", ...],"consumidores":["ModuloX", ...],"realizable":"aqui"}`.

> **Lo que esto NO cubre.** El guard `CAPACIDAD_SIN_CONTACTO` (R4) comprueba que la capacidad
> tenga al menos un `contacto`, y `agentos citas verificar` comprueba que cada `archivo:linea`
> resuelva contra el arbol de trabajo — ninguno de los dos comprueba que ese punto sea **de la
> capacidad que dice sostener**. Una cita real pero irrelevante (existe, resuelve, y no toca lo
> que la capacidad hace) pasa ambos chequeos igual que una cita correcta. Que los puntos de
> contacto sean los que la capacidad **realmente** toca es juicio del experto que confronto —
> el mismo que decide `costo`, `impacto` y `realizable` de esa lista — no algo que el runtime
> pueda auditar sin entender la capacidad. Pesa: de esos puntos se derivan costo e impacto, y son
> las citas que despues hereda el diseno como evidencia — una cita irrelevante contamina las dos
> cosas. No vender determinismo donde no lo hay.

**Una capacidad `con-previo` no muere: puede volverse la etapa 0** — ver la excepcion declarada
en R3.

### Como saber que ya se confronto todo lo activado

`agentos reconocimiento validar --slug {slug}` es de solo lectura y reporta, entre otros
problemas, `CAPACIDAD_SIN_CONTACTO` por cada capacidad activada que todavia no tiene ningun
`contacto` registrado. Correrlo tras cada lote de activaciones es el chequeo mecanico: mientras
liste `CAPACIDAD_SIN_CONTACTO`, el lazo no cerro. No es un juicio del anfitrion — es el mismo
guard que bloqueara el cierre de la fase en R4, adelantado para que el lazo sepa cuando parar.

**El lazo cierra cuando una vuelta no cambia ninguna activacion.**

## R3 — Corte en etapas (Mary)

**Criterio: rebanada vertical. Una etapa cierra cuando un actor puede hacer de punta a punta
algo que antes no podia.**

- La etapa 1 es el nucleo mas pequeno que ya le sirve a alguien.
- Las siguientes lo engordan.
- Una etapa que sea "primero toda la persistencia" **no es valida**: no hay nada que auditar
  hasta que llegue la ultima.

Mary propone el corte con su razon por etapa (que entrega, a que actor, por que ese limite y no
otro); el usuario lo aprueba o mueve capacidades entre etapas. Emitir el plan completo (upsert
por `n`, nunca pisa `estado`/`produjo` de una fila ya en curso):

```
agentos reconocimiento etapa emitir --slug {slug} --input {archivo-json}
```
payload: `{"etapas":[{"n":1,"entrega":"{que}","actor":"{quien}","capacidades":["A","B"]}]}`.

Si la idea entra entera en una etapa, el plan tiene una sola fila. Eso es un resultado legitimo,
y alimenta el desempate de Fase 4 hacia `acotado`.

> **Lo que el guard de cierre NO caza.** `ETAPA_SIN_ENTREGA` (guard de R4) comprueba que
> `entrega` nombre un actor y una accion — no que esa accion sea de punta a punta. Una etapa
> llamada "el administrador configura la base de datos" **pasa el guard**: nombra actor
> (administrador) y accion (configura). El runtime no distingue eso de una rebanada vertical
> real. Que el corte sea vertical y no por capa es **juicio del anfitrion (Mary/Alfred)**, no
> algo que el runtime detecte — decirlo asi, no vender determinismo donde no lo hay.

### La unica excepcion: la etapa 0

Una capacidad `con-previo` habilita, no entrega: un refactor no le da a ningun actor algo que
hacer de punta a punta, asi que por el criterio de arriba no seria etapa valida. Se admite como
**etapa 0** bajo tres condiciones, y solo tres — el guard `ETAPA_CERO_SIN_CONDICIONES` exige las
tres juntas:

1. Se numera `0`, no `1` — el numero declara que es habilitante, no entregable.
2. Declara **que capacidad de que etapa posterior habilita**, por nombre (campo `habilita`).
3. Declara **por que no cabe dentro de esa etapa** (campo `por_que_aparte`; tipicamente: la
   habilita a ella y a otras, o su tamano ahogaria la rebanada).

Sin las tres, la capacidad `con-previo` **entra dentro de la etapa que la necesita**, y esa etapa
carga el costo. La etapa 0 es una excepcion declarada, no la puerta de atras por la que vuelve el
corte por capa que R3 existe para impedir. `PLAN_MALFORMADO` rechaza ademas: numeros duplicados,
huecos en la secuencia, mas de una etapa 0, y un plan cuya unica fila sea la etapa 0 (un
habilitante sin habilitado no entrega nada).

## R4 — Cierre

Cada capacidad activada declara su `sustento` (campo `sustento` de `capacidad set`):

| `sustento` | Significa | Lleva |
|---|---|---|
| `externo` | alguien alla afuera lo resuelve asi | URL leida + que se toma prestado (`fuente`) |
| `codebase` | este repo ya tiene con que | `archivo:linea` en `contactos` |
| `intencion` | solo el usuario lo quiere; nada detras | nada, **y se declara asi** |

```
agentos reconocimiento capacidad set --slug {slug} --id {id} --campo sustento --valor intencion
```

`sustento: intencion` no es un defecto a rellenar: es MANIFIESTO P8 aplicado al aterrizaje. Lo
que no tiene nada detras se nombra, no se disfraza de hecho.

**Antes de cerrar**, correr en modo reporte:

```
agentos reconocimiento validar --slug {slug}
```

Reporta (sin bloquear) los mismos problemas que bloquearan el cierre, mas `SIN_DESCARTES` si al
cerrar R2 no se desactivo ninguna capacidad — un menu que solo agrega no esta podando, y podar es
para lo que existe. `SIN_DESCARTES` es observacion, no guard: no bloquea el cierre.

**Cierre con menu A/P/C. Solo `C` avanza a Fase 4:**

```
agentos reconocimiento transition --slug {slug} --a LISTO
```

Guards que este verbo exige antes de dejar cerrar: `HALLAZGO_SIN_URL`, `BARRIDO_VACIO` (cerrar
con `barrido_ejecutado: true` y cero hallazgos — o hubo barrido y dejo rastro, o se declara
`false` con su razon), `CAPACIDAD_SIN_CONTACTO`, `ETAPA_SIN_ENTREGA`,
`ETAPA_CERO_SIN_CONDICIONES`, `PLAN_VACIO`, `PLAN_MALFORMADO`. Si falla, `reconocimiento validar`
expone todos los problemas a la vez.

## Como se emite

Los verbos son el unico camino de escritura de la zona `agent-os/reconocimientos/{slug}/`.
**Nunca se editan los `.yml` a mano**: `dimension` y `sustento` del README no se escriben, se
recomputan tras cada mutacion.

| Momento | Verbo |
|---|---|
| al abrir la fase | `agentos reconocimiento crear --slug {slug} --intencion "{...}"` |
| declarar el desenlace del barrido | `agentos reconocimiento barrido declarar --slug {slug} --ejecutado true\|false [--razon "..."]` |
| por hallazgo del barrido | `agentos reconocimiento hallazgo add --slug {slug} --tipo prior-art --hallazgo "{...}" --url {url}` |
| el menu, por lote | `agentos reconocimiento capacidad emitir --slug {slug} --input {archivo}` |
| activar o descartar | `agentos reconocimiento capacidad set --slug {slug} --id {id} --campo activada --valor true` |
| tras confrontar una capacidad | `agentos reconocimiento confrontar --slug {slug} --id {id} --input {archivo}` |
| el corte en etapas | `agentos reconocimiento etapa emitir --slug {slug} --input {archivo}` |
| antes del menu A/P/C | `agentos reconocimiento validar --slug {slug}` |
| al cerrar la fase | `agentos reconocimiento transition --slug {slug} --a LISTO` |

Contrato completo de cada verbo (flags, payload, guards, ejemplo): `agentos help reconocimiento
{verbo}`.
