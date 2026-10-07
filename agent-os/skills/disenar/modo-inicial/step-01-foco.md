# step-01: FOCO

> **Anfitrion: Winston, capacidad `CM`.** Lee este archivo completo antes de actuar.
> Este step **no es una secuencia: es un lazo.** Cada vuelta escanea el codebase, propone
> nodos —citados los que describen lo existente— y cierra por lote contra el humano.
> Termina con menu P/C; solo C avanza.
> Reemplaza al frente anterior (intencion + contexto): no se ejecuta ademas de ellos.

<!-- FUENTE de la capacidad CM (que es, el principio extendido, la frontera de dominios prestados): agent-os/experts/bmad-agent-winston/references/construccion-modelo.md. Aqui solo se documenta la mecanica del step. NO duplicar — para modificar, editar la fuente. -->

<!-- FUENTE del contrato de campos del modelo (identidad, campos minimos, dominio de valores, extremos por arista, estados, forma del id): agent-os/templates/diseno/schema/modelo.md seccion "Campos por tipo de nodo". Quien emite se rige por ese documento. NO duplicar la tabla aqui. -->

## Pre-condicion

- Comando invocado: `/disenar iniciar "{descripcion}"`.
- No existe diseño con el slug derivado de la descripcion.

## Mision

Producir el **punto de partida del modelo**: `agent-os/disenos/{slug}/modelo.yml` poblado
con los nodos y aristas de partida — los que el codebase sostiene, cada uno con su cita, y
los que el diseño propone, cerrados con su prosa anclada solo cuando explicarlos le toca a
este step y no a una etapa posterior. Y el **encuadre**:
`intent` y `out_of_scope` en el frontmatter del diseño, confirmados contra lo que el
codebase mostro.

**Todo nodo que este step cierre `resuelto` y que afirme algo del mundo preexistente
lleva cita completa** — archivo, linea y fragmento. Sin ella no cierra el step: la
reclama `NODO_SIN_CITA`. Un nodo que **propone** algo que todavia no existe no cita, y
su ausencia de cita es correcta — ver "Que cita cada nodo" abajo.

Lo que NO se hace aqui: modelar la persistencia (es la etapa de Dexter), la criptografia
(la de Cipher), los contratos de proceso, el pipeline, los mockups.

### Que cita cada nodo

<!-- FUENTE: agent-os/templates/diseno/schema/modelo.md seccion "Que nodos citan". La tabla completa por tipo vive alli; aqui solo se instancia lo que el FOCO emite. NO duplicar la regla — para modificar, editar la fuente. -->

Un nodo cita cuando **afirma algo del mundo preexistente**. El discriminador ya vive en
sus campos, y de los tipos que este step emite:

| Nodo del FOCO | Cita cuando | Que cita |
|---|---|---|
| capacidad | clasificacion se_conserva / se_modifica / desaparece | **el codebase**: `archivo:linea` mas el fragmento textual |
| entidad | existencia existente | la estructura donde esta declarada |
| regla | origen heredada | donde el codigo la implementa |
| endpoint | decision_permiso reutilizar | donde el permiso esta declarado |
| restriccion | siempre | el codebase, o **la norma** (archivo o documento, con el articulo como fragmento) si `tipo: normativa` |
| actor | siempre | donde el codebase lo evidencia: tabla de roles, claim, job programado |
| capacidad nueva o no_aplica, entidad nueva, regla nueva, endpoint nuevo | nunca | nada: proponen algo que no existe |
| proceso, pantalla | nunca | nada: son lo que el work va a construir; la evidencia de lo existente esta un salto mas alla, en la `capacidad` que el proceso usa |
| decision, pregunta, hallazgo, riesgo | nunca | nada: son actos del diseño, no hechos del mundo |

**Por que una decision no cita.** Citar "la bitacora del diseño" seria citar un documento
que el propio agente acaba de escribir: una prueba autorreferencial no prueba. El porque de
una decision vive en su **prosa anclada**, que `NODO_SIN_PROSA` reclama y que no finge ser
evidencia.

### Que nodos exigen prosa

<!-- FUENTE: agent-os/templates/diseno/schema/modelo.md seccion "Que nodos exigen prosa". Los cinco tipos y su condicion viven alli; aqui solo donde los ancla el FOCO. NO duplicar la regla — para modificar, editar la fuente. -->

Cinco tipos llevan **prosa anclada** cuando cierran `resuelto`. Cuatro de ellos pueden nacer
en el FOCO: `decision` y `proceso` siempre, `regla` con `origen: nueva` y `entidad` con
`existencia: nueva`. El quinto —`operacion_cripto`— nace en la etapa criptografica y no
aparece aqui. El ancla es un marcador `<!-- nodo: {id} -->` en su propia linea, dentro de un
`.md` del diseño.

**De esos cuatro, el FOCO cierra `resuelto` uno solo: `decision`** — y lo ancla en
`bitacora.md`. Los otros tres los deja `abierto`, con los campos que el escaneo ya
determino, y los cierra la etapa dueña de su artefacto: el `proceso` en
`proceso-contrato.md`, la `entidad` nueva en `datos.md`, la `regla` nueva en la
justificacion del contrato de su proceso.

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "El principio". La regla uniforme —ninguna etapa cierra resuelto un nodo cuya prosa viva en el artefacto de una etapa posterior— y su porque (el mecanismo del indice de prosa y el doble daño de anclar antes de tiempo) viven alli, porque valen para toda etapa. Aqui solo su instancia: que tipos deja abiertos el FOCO y cual cierra. NO duplicar la regla — para modificar, editar la fuente. -->

Ese reparto **no es una regla del FOCO: es la regla del molde aplicada aqui.** El FOCO no
cierra `resuelto` ningun nodo cuya prosa viva en el artefacto de una etapa posterior, y de
los cuatro que nacen aqui la `decision` es el unico que no cae en ese caso: su casa **es** el
argumento, y no hay artefacto mas adelante que se lo dispute.

**El marcador nombra un id, asi que se escribe cuando el nodo ya existe:** primero se
emite el lote, despues se ancla la prosa. `PROSA_SIN_NODO` reclama el marcador que nombra
un id que el modelo no tiene.

## Principio rector: jerarquia de fuente de verdad

La fuente de verdad es el codebase y la DB, luego el usuario. Cuando hay varias fuentes
describiendo lo mismo:

```
1. Codigo deployado del sistema externo (si accesible) — verdad operativa.
2. Codigo de sistema gemelo que ya consume el sistema externo en produccion — evidencia de uso real.
3. Docs del sistema externo — pueden tener drift, son referencia secundaria.
4. Sintesis del usuario — puede tener brechas, valida con codigo cuando se puede.
```

**Razon:** las docs describen contratos pero el contrato canonico es el codigo. Sistemas
gemelos en produccion son evidencia de que el contrato funciona. Cuando hay desacuerdo
entre fuentes, el codigo gana sobre las docs.

**Anti-patron observado en prueba real.** En el diseño `20260429-granja-registry-link` las
docs decian "X-App-Id puede ser `GRJ-` o `APP-` segun caso". El codigo real del activador
validaba estricto contra `APP-{64hex}`. Se asumio docs = verdad y se diseñaron endpoints con
identidad por-granja. En E4 del work consumidor el drift contractual emergio (HF-E4-004) con
costo de regreso a E1 mas refactor de 4 tareas. Auditar el codigo real en el frente lo habria
evitado.

<!-- FUENTE del principio de autoridad epistemologica en brownfield: agent-os/skills/host-protocol/references/autoridad-brownfield.md seccion "Autoridad epistemologica en brownfield". El usuario es autoridad sobre QUE quiere lograr; el codigo es autoridad sobre COMO esta hecho lo que ya existe. Aqui solo la mecanica operativa del FOCO. NO duplicar el principio — para modificar, editar la fuente. -->

## Quien conduce y a quien convoca

- **Winston (`A-Winston:`) conduce todo el lazo.** Construye y sostiene el modelo.
- **Mary (`A-Mary:`) entra en la mocion 5 (encuadre)**, a confirmar o corregir `intent` y
  `out_of_scope` contra lo que el codebase mostro.
- **Dexter, Sentinel o Cipher se convocan cuando el modelo los señala** — no cuando alguien
  se acuerda. La señal es un nodo, no una intuicion:

| Señal en el modelo | A quien convoca | Para que |
|---|---|---|
| nodo `entidad` (nueva o existente tocada) | Dexter | confirmar la entidad antes de que el nodo se cierre: si es existente, que su cita es real; si es nueva, que hace falta |
| nodo `regla`/`restriccion` sobre permisos, auditoria o datos sensibles; nodo `endpoint` | Sentinel | confirmar el permiso citado y si `decision_permiso` es `reutilizar` o `nuevo` |
| nodo que toca firma, estampas, llaves, cifrado o hashing de credenciales | Cipher | confirmar el inventario criptografico antes de que el nodo se cierre |

**Winston no decide el contenido de esos dominios: convoca al dueño.** La persistencia
sigue siendo de Dexter, la criptografia de Cipher, los permisos de Sentinel. Winston deja
el nodo en el modelo con lo que lo sostiene; **modelarlo** es la etapa de su dueño, con su propio
anfitrion y su propio gate.

## Antes de la primera vuelta

### Paso 0 (obligatorio antes de cualquier pregunta): leer las referencias del usuario

**Antes de plantear pregunta alguna**, Winston identifica y lee TODAS las referencias
declaradas explicitamente por el usuario en `/disenar iniciar "..."`:

1. **Paths absolutos o relativos** mencionados.
2. **Nombres de sistemas, repos, modulos o componentes** (ej. "el activador", "registry").
3. **Documentacion** referenciada por nombre ("ver la documentacion de X", "el README declara que...").
4. **Identidad del repo huesped:** verificar SIEMPRE `README.md`, `agent-os/product/` (si
   existe) y el nombre real del repo via `git config --get remote.origin.url` o el path
   actual. **NO asumir** que el nombre del slug derivado del comando es la identidad del repo.

Para cada referencia: si es un path, `Read` o subagent `Explore` acotado a esa ruta; si es
un nombre de sistema, localizarlo via `Glob` o con una pregunta minima si el path no es
deducible; si es documentacion, leer al menos el README/index/overview.

**Detector de sistema externo accesible.** Si las referencias incluyen docs de un sistema
externo (paths tipo `~/.claude/{sistema}/`, archivos que describen "endpoints", "APIs" o
"contratos" de un sistema X) o nombres de sistemas externos, buscar si ese sistema tiene
**codigo accesible** en el mismo workspace o en repos hermanos:

1. Listar repos hermanos (`ls {parent-del-repo-actual}/`) o preguntar al usuario la ruta.
2. Si hay match, el **codigo es fuente primaria** y las docs quedan secundarias.
3. Si el usuario lo menciono y no hay match accesible, preguntarle si tiene acceso y donde esta.

**Resultado del paso 0:** una lista de fuentes a escanear, con su tipo declarado. Es la
entrada de la mocion 1.

```yaml
fuentes_a_escanear:
  modulo_huesped:   { path: "src/{Modulo}",       tipo: primaria-local }
  sistema_externo:  { path: "{workspace}/{repo}", tipo: primaria-canonica }
  sistema_gemelo:   { path: "{workspace}/{repo}", tipo: evidencia-uso-real }
  docs_ecosistema:  { path: "{path-docs}",        tipo: secundaria-referencial }
```

**Anti-patron a evitar:** preguntar, recibir la intencion del usuario, redactar el intent y
solo entonces leer las referencias. Eso produce intent erroneo que exige retroceso. Si la
descripcion declara referencias, leerlas primero es contrato, no opcion.

**Excepcion:** si la descripcion NO declara referencias explicitas, Winston lo declara —
`A-Winston: La descripcion no menciona referencias externas. Arranco el lazo con el modulo
huesped.` — y avanza.

### Insumo del abordaje (cuando aplica)

Cuando `/disenar` se invoca **internamente desde `/alfred`** (ruta `diseno` destilada del
abordaje), llega un bloque de evidencia ya recolectada y validada:

```yaml
abordaje_origen:
  realizado_en: "YYYY-MM-DD"
  evidencia: [...]              # bullets con citas path:linea
  drifts_detectados: [...]      # tabla
  expertos_invitados: [...]     # quien aporto que
  ruta_propuesta: "diseno"
```

Winston lo lee al activarse y:

1. **NO redescubre lo que ya esta validado.** Las citas del abordaje son insumo: entran al
   modelo como cita de su nodo, no como pregunta a re-validar. Las referencias que ya estan
   en `abordaje_origen.evidencia` no se releen — se citan.
2. **Procesa los drifts pendientes primero.** Si el abordaje marco drifts como
   `pendiente_validacion_codebase: true`, se abordan antes que cualquier otra cosa.
3. **Cubre solo los huecos.** Si la evidencia no responde algo que el modelo necesita,
   se despachan subagentes solo para eso.

Beneficio: el lazo arranca con nodos ya citados en vez de con el modelo vacio.

Si `/disenar` se invoca **directamente por el usuario**, `abordaje_origen` no existe y el
lazo arranca desde cero.

### Insumo del reconocimiento (cuando el diseño nace de una etapa)

Cuando el comando trae `--desde-reconocimiento={slug} --etapa=N`, el diseño no arranca de una
descripcion en prosa: arranca de una fila ya confrontada del catalogo de un reconocimiento
(`agent-os/reconocimientos/{slug}/`). **La descripcion es opcional en este camino** — si el
usuario no la dio, Winston la deriva de la `entrega` de la fila `N` en `etapas.yml` (es
literalmente la razon de ser de la etapa) mas los nombres de sus capacidades; si el usuario SI
la dio, se usa junto con ese insumo, no en su lugar.

**El orden de etapas no lo verifica Winston: lo impide el runtime.** Antes de crear cualquier
archivo del diseño, con el slug ya derivado (mismo paso que "Derivar el slug y crear la
estructura" mas abajo, solo que corre primero aqui), sincroniza el reconocimiento y recien
despues abre la fila:

```bash
agentos reconocimiento sincronizar --slug {slug}
agentos reconocimiento etapa transition --slug {slug} --n {N} --a en_diseno --produjo {diseno-slug}
```

El primer paso no es opcional: si `/disenar iniciar --desde-reconocimiento` se invoca
directamente (sin pasar por `/alfred`, que ya sincroniza al listar — ver `abordaje/readme.md`
seccion "Reconocimiento en curso"), una etapa anterior pudo haber cerrado su diseño/work sin que
nadie corriera `sincronizar` todavia. Esa fila seguiria `en_diseno`/`en_work` en `etapas.yml`
(es el UNICO camino por el que una fila llega a `cerrada`) y bloquearia esta apertura con
`ETAPA_EN_CURSO` aunque el trabajo real ya haya terminado.

Si el verbo falla —`ETAPA_NO_ACTIVABLE` (la activable derivada es otra fila; el mensaje ya la
nombra) o `ETAPA_EN_CURSO` (hay otra fila `en_diseno`/`en_work` sin cerrar)—, **el FOCO no
arranca**: Winston reporta el fallo tal cual el runtime lo devolvio y no crea el directorio del
diseño. Winston NO re-implementa esa comprobacion en prosa ni la adivina antes de invocar el
verbo — duplicarla invitaria a que las dos versiones se separen, y la unica que manda es el
guard.

Con la etapa abierta, Winston:

1. **Lee `etapas.yml` completo, no solo la fila N.** `Read` sobre
   `agent-os/reconocimientos/{slug}/etapas.yml`: la fila `n: N` y su lista `capacidades` son
   los ids que le tocan a este diseño; las filas `n > N` son las que alimentan la fila de
   `out_of_scope` de abajo — Winston cruza contra el plan directamente, no contra el campo
   `etapa` del catalogo (ese campo lo recomputa `reconocimiento etapa emitir` como comodidad de
   lectura para humanos, ej. `reconocimiento proyectar --vista plan`; no es la fuente que este
   paso consulta, para no depender de que ese recompute haya corrido). Sobre
   `agent-os/reconocimientos/{slug}/catalogo.yml`, resuelve cada id a su fila completa
   (`contactos`, `consumidores`, `realizable`, `sustento`, `fuente`, `razon`).
2. **NO redescubre lo que la confrontacion ya valido.** Los `contactos` (`archivo:linea`) de
   cada capacidad activada entran al modelo como cita de su nodo, no como pregunta a
   re-verificar — es la mitad del valor de este insumo: el FOCO arranca con evidencia, no con
   el modelo vacio.
3. **Que un contacto exista y resuelva no prueba que sea el correcto.** Heredar la cita no es
   heredar el juicio: si al construir el nodo un contacto no sostiene lo que la capacidad
   afirma, es una cita irrelevante y una cita irrelevante es evidencia falsa — se descarta y se
   busca lo que realmente sostiene la afirmacion, o el nodo queda sin cita y `NODO_SIN_CITA` lo
   reclama al cerrar el step.

**Traduccion al modelo**, por cada capacidad de la fila `N`:

| Del catalogo del reconocimiento | Al modelo del FOCO |
|---|---|
| la capacidad misma | nodo `capacidad`, `clasificacion: nueva` (no cita: por schema `nueva` nunca cita — la evidencia vive en sus `contactos`, no en la afirmacion de que ya existe) |
| cada `contacto` (`archivo:linea`) de una capacidad activada | cita ya verificada en el nodo que ese contacto realmente sostiene (`entidad`, `regla`, `endpoint`, `restriccion`... segun lo que muestra, no segun donde vivia en el catalogo) |
| capacidad con `sustento: externo` (`fuente` es la URL) | nodo `restriccion` `tipo: tecnica`, citando `agent-os/reconocimientos/{slug}/barrido.md:NN` — la fila `EXT-NNN` cuyo `url` es esa fuente. La URL viaja **dentro del fragmento citado**, no como cita: `citas.go` rechaza toda ruta vacia o absoluta, asi que una URL nunca puede ser la cita, pero el archivo del repo que la contiene si — lo externo entra al grafo por transitividad |
| capacidad de una etapa POSTERIOR a `N` (aparece en la lista `capacidades` de una fila `n > N` de `etapas.yml`) | `out_of_scope` con razon `"etapa {n} del reconocimiento {slug}"` |
| capacidad `activada: false` (descartada en el menu) | `out_of_scope` permanente, con la `razon` del catalogo tal cual — no se re-redacta |
| capacidad con `sustento: intencion` (sin contacto ni fuente, solo la intencion del usuario) | nodo `pregunta` con `motiva` apuntando al nodo `capacidad` que nace de ella |
| capacidad `realizable: con-previo` sin resolver | nodo `pregunta` con severidad (Winston la fija segun el impacto de dejarla abierta), o nodo `decision` si el catalogo ya trae la resolucion (contactos/razon que muestran que el previo se cerro) |

`modulo_huesped` del README sale casi solo de los `contactos` heredados: es donde ya viven, no
algo que Winston vuelva a preguntar.

**El anti-retroceso.** `out_of_scope` deja de nacer vacio: llega con la poda ya hecha,
consentida (el usuario la declaro al emitir el menu/plan del reconocimiento) y fechada (la
fecha del reconocimiento). Lo que el usuario recuerde a mitad del FOCO ("y tambien deberiamos...")
ya esta escrito como etapa `N+1` o como descarte con razon — no obliga a retroceder, obliga a
esperar a que le toque su etapa.

**Al crear el README del diseño**, ademas de lo que "Derivar el slug y crear la estructura"
ya exige, se escribe en el frontmatter:

- `reconocimiento_origen: "{slug}"`
- `etapa: N`

El schema del README de diseño (`CamposDisenoReadme`) valida forma open-world: una clave que no
esta en su lista explicita no se rechaza, solo no se le valida tipo — el mismo camino que abrio
paso a `expediente_origen`.

Si `/disenar iniciar` se invoca SIN `--desde-reconocimiento`, este bloque no aplica y el lazo
sigue por el camino que le toque (insumo del abordaje, insumo del expediente, o desde cero).

### Insumo del expediente (cuando el diseño nace de un expediente)

Cuando el usuario expresa **en prosa** que quiere diseñar asociado a un expediente
("diseñemos la fase de contratacion del expediente SIIFA"), Winston NO pide flags:

1. **Resolver el expediente.** `agentos expediente listar`. Si la prosa nombra uno y
   matchea, usarlo; si hay ambiguedad, `AskUserQuestion` con la lista. Si no existe ninguno
   que matchee, decirlo y ofrecer crearlo con `/expediente` primero (NO crearlo inline).
2. **Desplegar los requisitos.** `agentos expediente requisitos --slug {slug}`. Presentar la
   lista legible (tabla: `id · enunciado corto · estado_gap · [ya trazado a diseño Y]`).
   Seleccion: si caben en <=4 grupos, `AskUserQuestion` multiSelect; si son muchos, listar
   numerados y el usuario indica en prosa cuales cubre. NO obligar a teclear IDs.
3. **Cada requisito seleccionado nace como nodo `restriccion`** con `tipo: normativa` y
   **cita de la norma** (no del expediente: la norma es la fuente).
4. El `intent` se **sintetiza** de los requisitos seleccionados: Winston redacta la
   frase-objetivo que los engloba y el usuario la aprueba o la ajusta en el encuadre.

**El gap ya investigado es discovery hecho.** El `estado_gap` / `accion` / evidencia BD de
cada requisito los produjo Dexter en el expediente: entran al modelo como nodos con la cita
del expediente, no como preguntas a re-investigar. El lazo investiga unicamente lo que el
expediente no responde.

**El trazado sigue siendo trazado.** Al crear la estructura, el README hornea:

- `expediente_origen: {slug}`
- `requisitos_cubiertos:` con cada requisito seleccionado en `estado: pendiente`.

Y cada uno se traza, para cerrar el lazo con el expediente:

```bash
for id in {ids seleccionados}; do
  agentos expediente trazar --slug {expediente} --requisito $id --diseno {diseno-slug}
done
```

El gate de cobertura de esos requisitos vive en el cierre del diseño (step-09) mas el guard
del runtime, no aqui.

Si `/disenar` se invoca SIN expediente (caso normal), este bloque no aplica.

### Derivar el slug y crear la estructura

Slug: `{YYYYMMDD}-{slug-corto-de-descripcion}` — ej. `20260429-solicitud-insumos-medicamentos`.

```bash
mkdir -p agent-os/disenos/{slug}/{procesos,hallazgos}
```

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

El README se crea via runtime. **`flujo: modelo` no es opcional**: es lo que declara que a
este diseño lo gobierna el modelo. `out_of_scope` nace **vacio** a proposito — se acumula
de los nodos `decision` durante el lazo, no se declara a ciegas al principio.

**El cuerpo del README sale de la plantilla**
`agent-os/templates/diseno/README.md`: sus secciones (Intent, Out of scope, Estado, Procesos,
Plan de works, Bitacora, Hallazgos) no se transcriben aqui para que exista una sola fuente del
artefacto. Leerla antes de escribir el temporal.

```bash
# 1) Escribir el cuerpo con Write a un temporal (sin escapado):
#    Write tool -> .tmp-body.md con el cuerpo del README, instanciado de la plantilla
# 2) Invocar con --body-file (metadata por stdin, sin contenido):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "README.md",
  "file_type": "diseno-readme",
  "frontmatter": {
    "slug": "{slug}",
    "intent": "{intent tentativo; el encuadre lo confirma o lo corrige}",
    "out_of_scope": [],
    "flujo": "modelo",
    "estado": "EN_DISENO",
    "brief_version": 1,
    "fecha_inicio": "{YYYY-MM-DD}",
    "fecha_fin": null,
    "autor": "{nombre usuario activo}",
    "modulo_huesped": "",
    "procesos": [],
    "es_paraguas": false,
    "plan_works": [],
    "hallazgos_pendientes": 0,
    "hallazgos_aplicados": 0,
    "persistencia_resuelta": false,
    "datos_md_version": 1
  }
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

**Sembrar el `modelo.yml` vacio** desde `agent-os/templates/diseno/modelo.yml`:

```bash
cp agent-os/templates/diseno/modelo.yml agent-os/disenos/{slug}/modelo.yml
```

Sin esto, la primera vuelta emitiria sobre un archivo inexistente. `modelo emitir` lo
tolera, pero el diseño quedaria sin el artefacto hasta la primera emision y `modelo validar`
responderia `MODELO_AUSENTE` a quien mirara antes. Sembrarlo hace que el modelo exista desde
que existe el diseño.

### Inicializar la bitacora

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
cat > agent-os/disenos/{slug}/bitacora.md <<'EOF'
# Bitacora del diseño

## {fecha} {hora} — FOCO abierto

Slug: {slug}. Flujo: modelo.
Referencias leidas en paso 0: {lista de paths/fuentes, 1 linea de sintesis cada una}.
Insumo: {abordaje_origen | expediente_origen {slug} | ninguno}.

Anfitrion: Winston [CM].
EOF
```

Registrar las referencias leidas permite a las etapas siguientes saber que material esta en
contexto sin re-leerlo.

## El lazo — las cinco mociones

Cada vuelta recorre las cinco. La vuelta termina con una emision por lote y un freno del
humano. El lazo termina cuando se cumplen **las cuatro condiciones de cierre** a la vez.

### Mocion 1 — Revision detallada del codebase

Motor: **subagents `Explore` en paralelo, uno por fuente**. Para 1-3 fuentes, despachar
todos en el mismo turno.

**Prompt para el modulo huesped:**

```
Subagent Explore (medium): escanea {modulo-huesped}. Reporta en <500 palabras:

(a) Patrones de Controllers/Views/BL existentes (3-5 ejemplos representativos),
    con archivo:linea de cada uno.
(b) Reglas heredadas detectables en codigo: validaciones, transformaciones,
    asunciones sobre datos del usuario logueado, dependencias inyectadas.
    Cada una con archivo:linea y el fragmento textual.
(c) Tablas de BD tocadas por el modulo (max 10). Para cada una, si es accesible:
    nombre, proposito aparente y columnas clave. Esta lista es INSUMO de la
    etapa de persistencia (Dexter): cuanto mas completa, mejor el cimiento de
    datos.
(d) Standards aplicables encontrados en agent-os/standards/.
(e) Si existe agent-os/standards/security/permisos-repo.md, lista los permisos
    relacionados al modulo (max 10) con su codigo.

NO escribir codigo. Solo reportar. Toda afirmacion con archivo:linea.
```

**Prompt para el sistema gemelo** (si aplica):

```
Subagent Explore (medium): escanea {repo-gemelo} buscando el patron de
{tema del diseño}. Reporta:

(a) Como el gemelo implementa este patron: archivos clave, clases, estructura,
    naming — con archivo:linea.
(b) Decisiones tecnicas observables (politica de cifrado, manejo de errores,
    cache, retries, tolerancia a fallos).
(c) Diferencias estructurales con el modulo huesped que afecten copia selectiva
    (multi-tenancy distinta, framework distinto).
(d) Que conviene copiar literal vs adaptar.

NO escribir codigo. Solo reportar. Toda afirmacion con archivo:linea.
```

**Prompt para docs de ecosistema** (si aplica):

```
Subagent Explore (medium): lee {path-docs}. Reporta en <500 palabras:

(a) Contratos del ecosistema relevantes al diseño (APIs, formatos, flujos de
    auth, headers, codigos de error).
(b) Reglas y politicas declaradas (rate limits, TTL, fallback, sincronizacion).
(c) Modelos de datos del lado del ecosistema que el diseño debe respetar.
(d) Gaps: preguntas sin responder en la doc que el implementador necesitara aclarar.

NO escribir codigo. Solo reportar. Cita archivo y seccion de cada afirmacion.
```

En la primera vuelta, si el modulo huesped no esta declarado, Winston pregunta:

```
A-Winston: ¿En que modulo del codebase vivira principalmente esto?
Ejemplos: HistoriaClinica/, Farmacia/, BackOffice/. Si toca varios, nombra el principal.
```

En las vueltas siguientes, la mocion 1 no re-escanea todo: escanea **lo que la vuelta
anterior abrio** — el nodo `abierto` cuya resolucion exige leer mas codigo.

### Mocion 2 — Definicion del punto de partida

Con los reportes en mano, Winston nombra **de que se parte**: que existe hoy, que se
conserva, que se modifica, que desaparece, que es nuevo. Es el juicio que decide cuales de
las afirmaciones de los reportes merecen ser un nodo.

**Los claims del usuario se resuelven aqui, y no son un paso aparte.** Toda frase del
usuario del tipo "esto se conecta con X", "hereda auth de Y", "consume el service Z / la
tabla T / el endpoint E", "reusa el contrato/patron/contexto W", "el actor resuelve sesion
/ permisos / tenant asi", "en el sistema gemelo esto funciona asi", "el flujo actual hace X
y vamos a hacerlo Y" es una **afirmacion sobre codigo existente**. Cada una nace como nodo,
y **el nodo que afirma lo existente no cierra sin cita**: eso es lo que hace estructural lo
que antes era un paso bloqueante que se podia saltar con un override. Cuando la afirmacion
mapea a un nodo que no cita —el "flujo actual" que se vuelve un `proceso`— lo que la
sostiene es la `capacidad` que ese proceso usa, y esa si cita.

Tres desenlaces, y el modelo los distingue por si mismo:

| Desenlace | Que pasa en el modelo |
|---|---|
| **El codigo confirma** la afirmacion | nodo `resuelto` con la cita real (`archivo:linea` + fragmento), si es de los que citan; si no, el nodo queda con lo que el escaneo determino y la cita vive en el nodo vecino que si afirma lo existente |
| **El codigo la contradice** | el nodo se resuelve con lo que dice el codigo, y la divergencia nace como nodo `decision` con su razon. La decision es del humano, no de Winston (ver abajo) |
| **Queda ambigua** tras profundizar | nodo `pregunta` con su `severidad` y su `motiva` (el id del nodo que la pregunta condiciona) |

**Una `pregunta` con `severidad: critica` o `alta`, y `estado: abierto`, bloquea el cierre de
CUALQUIER etapa, incluida esta.** No es un pendiente que se arrastra: es una pared. Un claim con
`severidad: critica` o `alta` sin resolver no pasa inadvertido ni depende de que alguien recuerde
escribir un override en la bitacora — pero tampoco se cierra el FOCO con el ahi. **Cuatro salidas,
y las cuatro son del humano:**

| Salida | Que queda en el modelo | Cuando |
|---|---|---|
| **Resolverla** | `resuelto`, y lo que el codebase contesto entra citado en el nodo que su `motiva` señala | se profundizo y el codebase contesto |
| **Cerrarla por decision humana** | `resuelto`, mas un nodo `decision` que registra lo que el humano decidio, con su prosa anclada | **hay respuesta**: el codigo no la da, pero el humano la dio y quedo constancia |
| **Bajarle la severidad por debajo de `alta`** | sigue **`abierto`**, con `severidad` en `media`/`baja`/`informativa` y su razon en el campo `razon` **del nodo** (se emite con el nodo — ver el reparto de `razon` mas abajo; la bitacora puede narrar la conversacion, pero la que el gate lee es la del nodo). Bajarla solo a `alta` no libera el cierre: sigue bloqueando igual que `critica` | **NO hay respuesta todavia**, y el humano juzga que esta etapa puede seguir sin ella |
| **Descartarla** | `descartado` con razon | no se va a contestar |

**La diferencia entre las dos del medio importa y se confunden facil.** *Cerrar por decision
humana* significa que **hay respuesta** — la que el humano dio, escrita con sus palabras en
la bitacora y anclada al nodo `decision` que la registra.
*Bajar la severidad por debajo de `alta`* significa que **no hay respuesta todavia** y esta
etapa no la necesita: la pregunta **sigue viva y visible en el modelo**, deja de bloquear el
cierre de esta etapa, y la reclama la etapa a la que si le importa (`motiva` apunta al nodo que
la espera).

**Bajar la severidad no es un atajo para deshacerse de la pregunta.** Es la unica salida
honesta cuando algo importa pero no para *esta* etapa. Sin ella, la tarjeta empujaria a cerrar
por decision humana algo que **nadie decidio** — o sea a fabricar una respuesta para satisfacer
un predicado, que es exactamente lo contrario de lo que este rediseño busca.

El silencio no es salida: las cuatro dejan rastro.

**Cuando el codigo contradice al usuario, Winston presenta la divergencia con las tres
salidas y NO elige por defecto** (`AskUserQuestion`):

```
A-Winston: Aqui tengo divergencia. Dijiste "{claim}". El codigo dice otra cosa:

        - {archivo:linea}: {fragmento textual}
        - {archivo:linea}: {fragmento textual}
        - Conclusion: {que se rompe por construccion si diseñamos sobre el claim}.

        Tres caminos. ¿Cual eliges?

        (a) Tu memoria estaba imprecisa — usemos lo que dice el codigo. El nodo
            se resuelve con la cita real y sigo.
        (b) El codigo tiene un bug — deberia funcionar como dijiste. Si tomamos
            este camino, es cambio al codigo existente y nace como nodo decision
            explicito. Eso amplia el alcance del work consumidor; ¿lo aceptas?
        (c) Quieres que en el futuro funcione asi, pero entiendes que requiere
            refactor previo. Eso es otro work o un sub-objetivo declarado de este.
            ¿Cual?
```

**NO se reescribe el codigo en silencio. NO se reescribe el intent en silencio.** Cualquier
cambio al codigo existente es decision del humano por el camino (b) o (c), nunca
consecuencia colateral de una descripcion imprecisa.

**Anti-patron a evitar:** anunciar "voy a validar" sin nombrar las afirmaciones una por una.
Sin la lista explicita, el humano no puede corregir una afirmacion que Winston capturo mal.

### Mocion 3 — Construccion del modelo: nodos citados o propuestos

Cada afirmacion del punto de partida se vuelve un nodo tipado. El campo de identidad, los
campos minimos y el dominio de valores de cada tipo estan en el contrato de campos (ver el
marcador FUENTE del encabezado). **El id calza `^[A-Za-z_][A-Za-z0-9_]*$`** — un id como
`P-1` produce una proyeccion sintacticamente invalida, y las comillas no lo arreglan.

Donde aterriza lo que el escaneo produjo:

| Lo que el escaneo encontro | Nodo | Campo que lo fija |
|---|---|---|
| capacidad que hoy existe, o que el diseño trae | `capacidad` | `clasificacion`: se_conserva / se_modifica / desaparece / no_aplica / nueva |
| flujo de trabajo concreto que el diseño crea o modifica | `proceso` | `trigger` (el evento que lo dispara) + `modulo` (donde vive en el codebase) |
| regla implicita en codigo (validacion, transformacion, asuncion) | `regla` | `origen: heredada`, con la fuente citada |
| regla que el diseño introduce | `regla` | `origen: nueva`; queda `abierto` — su justificacion la escribe la etapa de procesos, y es ella quien la cierra |
| patron del codebase que el diseño debe imitar | `restriccion` | `tipo: arquitectonica`, citando el propio codebase |
| requisito de norma (via expediente) | `restriccion` | `tipo: normativa`, citando la norma |
| **contrato o politica de un sistema externo** que el diseño debe respetar (endpoints, headers, formato de respuesta, rate limit, TTL, fallback) | `restriccion` | `tipo: tecnica`, citando la fuente de mayor rango segun la jerarquia (codigo del sistema externo si es accesible; la doc si no) |
| tabla o entidad que el diseño tocara | `entidad` | `existencia`: nueva / existente |
| quien dispara o consume | `actor` | `tipo`: humano / rol / sistema / servicio / programado |
| permiso existente relacionado al modulo | `endpoint` | `decision_permiso`: reutilizar / nuevo |
| freno de alcance confirmado por el humano | `decision` | `razon` + `que_resolvio` + `afecta` (el id del nodo sobre el que decide) |
| lo que quedo sin resolver | `pregunta` | `severidad` + `motiva` |

Un nodo que todavia no esta determinado nace **`abierto`**: solo se le exige su campo de
identidad. Pedirle los campos minimos seria impedir representarlo mientras se investiga —
pero **admitir no es exigir**: un nodo `abierto` puede traer los campos que el escaneo ya
determino, y traerlos no lo cierra.

Se cierra `resuelto` cuando concurren dos cosas: el escaneo lo determino **y** su
explicacion no es de una etapa posterior. Entonces **exige sus campos minimos**; la cita se
la exige `NODO_SIN_CITA` solo si afirma algo del mundo preexistente, y la prosa anclada
`NODO_SIN_PROSA` solo a los tipos que la piden (ver las dos tablas de arriba). De los cuatro
que pueden nacer aqui, **el unico que el FOCO cierra es `decision`**: el `proceso`, la `entidad`
nueva y la `regla` nueva quedan `abierto` con lo que se sepa de ellos, y los cierra la
etapa dueña de su artefacto.

**Sobre el nodo `proceso`: el FOCO lo deja `abierto`; cerrarlo es de otra etapa.** Aqui se
declara que el proceso **existe**, cual es su `trigger` y en que `modulo` vive — nada mas, y
esos dos campos viajan en el nodo `abierto` sin cerrarlo. Sus entradas y salidas, sus
contratos, sus reglas aplicadas y sus transiciones son de la etapa de procesos, conducida por
Mary, que es quien lo cierra `resuelto` cuando `proceso-contrato.md` ya explica por que
existe. La prohibicion de "NO modelar los contratos de proceso" prohibe eso, no el nodo: sin
nodos `proceso` no habria a que enlazar las entidades en la mocion 4, y el gate de TR-10 —que
cuenta capacidades con `USA` entrante **desde un proceso**— no podria dispararse. Ninguna de
las dos cosas necesita que el nodo este `resuelto`: una arista solo exige que el nodo exista.

**Sobre los contratos del ecosistema externo:** cuando hay **una sola** fuente de docs no hay
contrastacion que hacer (el bloqueante 1 solo se activa con dos o mas fuentes solapadas), pero
el reporte del subagente de docs igual tiene destino: cada contrato y cada politica relevante
nace como nodo `restriccion` con `tipo: tecnica` y su cita. Un contrato externo que el diseño
debe respetar y que no esta en el modelo es exactamente lo que reaparece como drift en E4.

Las **banderas para Sentinel** ya no se escriben en una seccion aparte: se derivan del
modelo. Un nodo de permisos, auditoria o datos sensibles ES la bandera, y la convocatoria de
la tabla "Quien conduce y a quien convoca" se dispara desde el.

#### Copiar de un sistema gemelo: literal vs adaptado

Cuando hubo escaneo de un sistema gemelo, su reporte responde "que conviene copiar literal y
que adaptar". **Esa respuesta no se queda en el reporte: cada pieza que el diseño va a imitar
nace como nodo `restriccion` con `tipo: arquitectonica`**, citando el archivo del gemelo, y su
enunciado dice cual de los dos es:

- **copia literal** — el enunciado nombra el patron y el diseño lo reproduce sin cambios.
- **copia adaptada** — el enunciado nombra el patron **y la adaptacion, con su razon
  estructural** (multi-tenancy distinta, framework distinto, otro modelo de permisos).

**Anti-patron a evitar: copia mecanica sin justificacion.** Un nodo `restriccion` que dice
"imitar el patron X del gemelo" sin declarar si se copia literal o adaptado —y por que— no es
una restriccion util: es un encargo de trabajo sin criterio, y quien implemente va a resolver
la diferencia estructural adivinando. El gemelo es evidencia de que el contrato funciona **en
su contexto**; que funcione en este es lo que hay que declarar.

### Mocion 4 — Enlaces y destinos: aristas, con cita cuando afirman lo existente

Los nodos sueltos no son un modelo. La identidad de una arista es la terna `(tipo, de, a)`;
sus extremos permitidos estan en el contrato de campos. Una arista tambien lleva cita cuando
afirma algo sobre el codigo existente: que un proceso **ya** accede a una entidad, o que
**ya** consume una capacidad reusable, es una afirmacion verificable.

Aqui es donde el modelo empieza a crecer por **transiciones y prerequisitos**: enlazar un
nodo suele revelar el siguiente. Eso es el lazo funcionando, no un desborde.

### Mocion 5 — Encuadre: Mary confirma o corrige

**Mary entra** (`A-Mary:`) y contrasta el `intent` tentativo y el `out_of_scope` acumulado
contra lo que el codebase mostro.

El `intent` es **1 frase de 15-30 palabras** que declara que producto o feature debe quedar
LISTO PARA IMPLEMENTAR al cerrar este diseño. Se valida contra cuatro reglas:

- Estado del producto a implementar, no proceso del diseño.
- Autocontenida (un lector en 6 meses entiende sin contexto).
- Verificable (un PM puede decir "esto se logro o no").
- Anti-redundancia (eliminar clausulas cubiertas por otras).

**Estas cuatro reglas ganan peso en el modelo, no lo pierden: el intent es el ancla del
freno de alcance.** Si viola alguna, Mary propone reescritura y consulta. NO se avanza con
un intent que las viole, salvo override explicito del usuario registrado en `bitacora.md`.

Si el intent del usuario es vago ("hacer X mejor", "limpiar Y"), Mary refina:

```
A-Mary: Para que el diseño tenga un cierre claro: ¿que sera posible hacer al cerrar
el diseño que hoy NO es posible? ¿que componentes existiran y que producirian?
```

Y confronta el intent contra el modelo: si el modelo contradice el intent (el intent dice
que esto es para el repo X pero las citas indican que X no existe o tiene otra naturaleza),
Mary lo nombra y pide aclaracion. Es mas barato aqui que en E3/E4 del work consumidor.

Mary tambien puebla `modulo_huesped` en el README, ahora que el escaneo lo determino.

El **razonamiento** — por que este diseño existe ahora, que motivo concreto lo dispara, que
se gana al lograrlo — se registra en la bitacora al cerrar el encuadre, transcrito de la
conversacion sin embellecer. No hay artefacto de intencion aparte: el `intent` y el
`out_of_scope` viven en el frontmatter del diseño, donde el schema del runtime ya los conoce.

## Como emite

Al cerrar cada vuelta, **por lote**:

```bash
# 1) Write tool -> .tmp-lote.json con el lote de la vuelta
agentos modelo emitir --slug {slug} --etapa foco --input .tmp-lote.json
# 2) rm .tmp-lote.json
```

**Nunca editando `modelo.yml` a mano.** El verbo es el unico camino de escritura y es quien
custodia el contrato de campos.

Forma del lote — `id`, `tipo`, `estado` y `cita` son del nodo; lo propio de cada tipo va
**dentro de `campos`**.

**`razon` existe en los dos niveles y no es el mismo campo — y dentro del nivel `del nodo`, tampoco
significa lo mismo en todo estado.** El reparto:

| Donde va | Que es | Cuando se exige |
|---|---|---|
| `razon` **del nodo** (hermana de `id`/`tipo`/`estado`) | la razon del **descarte** | cuando el nodo entra `estado: descartado`; la exige la forma |
| `razon` **del nodo** (mismo campo, otro estado) | la razon de **bajar la severidad de una `pregunta` por debajo de `alta`**, manteniendola `abierto` | mientras el nodo sigue `abierto`; la exige `predSeveridadDegradada` (`SEVERIDAD_DEGRADADA_SIN_RAZON`) |
| `razon` **dentro de `campos`** | campo minimo del nodo `decision` | cuando una `decision` entra `resuelto`, junto con `que_resolvio` y `afecta` |

Es el mismo campo del nodo en las dos primeras filas, no dos campos distintos: lo que cambia es
que significa segun el `estado` vigente — nunca las dos cosas a la vez. Un nodo `decision` que se
descarta llevaria la primera fila y la tercera, y no se contradicen: una dice por que se descarto
el nodo, la otra por que se decidio lo que la decision decide. El ejemplo DEC de abajo usa la de
`campos` porque su `decision` esta `resuelto`.

```json
{
  "nodos": [
    {
      "id": "CAP_solicitud_insumos",
      "tipo": "capacidad",
      "estado": "resuelto",
      "cita": {
        "archivo": "src/Farmacia/Controllers/InsumosController.cs",
        "linea": 84,
        "fragmento": "public ActionResult Solicitar(int idAplicacion)"
      },
      "campos": { "nombre": "Solicitud de insumos", "clasificacion": "se_modifica" }
    },
    {
      "id": "PRO_solicitar_insumo",
      "tipo": "proceso",
      "estado": "abierto",
      "campos": {
        "nombre": "Solicitar insumo para aplicacion",
        "trigger": "el enfermero abre la aplicacion de medicamento y pide el insumo",
        "modulo": "src/Farmacia"
      }
    },
    {
      "id": "ENT_SolicitudInsumo",
      "tipo": "entidad",
      "estado": "abierto",
      "campos": { "nombre": "SolicitudInsumo" }
    },
    {
      "id": "DEC_sin_migracion_historica",
      "tipo": "decision",
      "estado": "resuelto",
      "campos": {
        "enunciado": "La migracion de solicitudes historicas queda fuera",
        "razon": "el volumen previo no tiene consumidor declarado; el humano confirmo el freno",
        "que_resolvio": "freno confirmado",
        "afecta": "ENT_SolicitudInsumo"
      }
    }
  ],
  "aristas": [
    { "tipo": "ACCEDE", "de": "PRO_solicitar_insumo", "a": "ENT_SolicitudInsumo" }
  ]
}
```

Cuatro cosas que este lote muestra a proposito:

- `ENT_SolicitudInsumo` entra `abierto` con solo su identidad: el FOCO la identifico, y la
  etapa de Datos la cerrara `resuelta` con sus columnas y —si resulta `existente`— con su
  cita. Eso es la fusion por id trabajando entre etapas.
- `PRO_solicitar_insumo` **entra `abierto` aunque el escaneo ya sepa su `trigger` y su
  `modulo`**: un nodo `abierto` admite los campos que ya se conocen, y quien lo cierra es la
  etapa de procesos, que es donde vive su prosa. Cerrarlo aqui obligaria a anclar esa prosa
  en la bitacora y dejaria `proceso-contrato.md` fuera del alcance del indice.
- `DEC_sin_migracion_historica` **cierra `resuelto` sin cita, y eso es correcto**: una
  decision es un acto del diseño, no un hecho del mundo, asi que `NODO_SIN_CITA` no la
  reclama. Declara `afecta` para no quedar flotando en el grafo, y su porque va en prosa
  anclada en la bitacora, que es lo que `NODO_SIN_PROSA` si reclama.
- La arista `ACCEDE` puede referenciar `PRO_solicitar_insumo` porque el nodo viene en el mismo
  lote y los nodos se aplican antes que las aristas.

Lo que hay que saber para usarlo bien:

- **El lote entra entero o no entra.** La forma se valida sobre el modelo ya fusionado; si
  no pasa, no se escribe nada.
- **Nunca borra.** Un nodo que sobra se marca `descartado` con la **`razon` del nodo** (la
  del descarte, no la de `campos`). El override queda auditable en vez de desaparecer.
- **Fusiona por id.** Un id nuevo se agrega; uno existente se fusiona (claves nuevas entran,
  repetidas se sobrescriben). Asi el FOCO puede dejar una entidad `abierta` que la etapa de
  Datos cierra `resuelta`.
- **Un id repetido dentro del mismo lote es error de uso**, no una fusion implicita.
- **Primero todos los nodos, despues todas las aristas.** Por eso una arista puede
  referenciar un nodo que viene en el mismo lote — el caso normal cuando una vuelta abre un
  nodo y lo enlaza de inmediato. Lo que la arista no puede es apuntar a un id que no esta ni
  en el modelo ni en el lote.
- **La identidad de una arista es la terna `(tipo, de, a)`.** Repetirla es idempotente.
- **Reabrir un nodo `descartado` es legitimo** pero exige traer el `estado` nuevo explicito;
  la respuesta lo reporta destacado como reapertura.
- **No corre predicados.** La cobertura la comprueba `modelo validar`, que es otro verbo y
  otro momento.

**El reporte del verbo va a la bitacora**: nodos agregados, nodos modificados, aristas
agregadas, reaperturas, cierres sin cita, y la lista `cambios` con el **valor anterior** de
cada campo sobrescrito. Sin eso, un campo aparece modificado sin autor.

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## $(date +%Y-%m-%d) — FOCO vuelta {N}

Fuentes escaneadas: {lista}.
Emitido: {A} nodos agregados, {M} modificados, {R} aristas. Reaperturas: {K}.
Cierres sin cita señalados: {J}.
Sobrescrituras: {campo: valor anterior -> nuevo, ...}.
Frenos confirmados por el humano: {ids de los nodos decision}.
" >> agent-os/disenos/{slug}/bitacora.md
```

**La bitacora se escribe dos veces por vuelta, y el orden importa:**

1. **Despues de emitir** — el reporte del verbo (el bloque de arriba).
2. **Despues del reporte** — la **prosa anclada de cada `decision` que la vuelta cerro**:
   el freno que el humano confirmo, con su razon textual y sus palabras, bajo su marcador
   `<!-- nodo: {id} -->`. Solo `decision`: los otros tres tipos que exigen prosa el FOCO no
   los cierra, asi que su marcador no va aqui.

El orden es este y no el inverso porque **el marcador nombra un id**: anclar antes de emitir
deja el ancla apuntando a un nodo que el modelo todavia no tiene, y eso es exactamente lo
que `PROSA_SIN_NODO` reclama.

```markdown
<!-- nodo: DEC_sin_migracion_historica -->
El humano freno la migracion de solicitudes historicas: el volumen previo no tiene
consumidor declarado y nadie pidio consultarlo. Si aparece un consumidor, entra como
work aparte.
```

### Ritmo

Por lote, al cerrar cada vuelta. `autonomia.rutas.diseno.nivel` puede bajarlo a uno por uno:
el humano frena nodo por nodo en vez de por lote.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Perilla de autonomia". La semantica del nivel vive alli. NO duplicar — para modificar, editar la fuente. -->

## El freno semantico

Lo que detiene el crecimiento del modelo **no es un criterio tecnico sino semantico: la
primera señal es el alcance del intent**. Cuando algo cae fuera, Winston lo presenta y **el
humano confirma el freno y su razon**. Ese freno nace como nodo `decision` con su `razon`, su
`que_resolvio: freno confirmado`, su `afecta` (el nodo que el freno deja fuera) y **su prosa
anclada en la bitacora**, con las palabras del humano — se emite el nodo primero, se ancla
la prosa despues.

**`out_of_scope` se deriva de esos nodos.** No se declara a ciegas al principio: se
construye por acumulacion de decisiones reales, cada una con su razon. Cualquier cosa NO
frenada queda como "podria entrar si surge".

## Bloqueantes antes de cerrar

Los cuatro corren **antes** de presentar el menu P/C, en este orden.

### 1. Contrastacion entre fuentes, cuando hay mas de una

Cuando **dos o mas fuentes describen el mismo contrato externo** (docs del ecosistema mas
codigo gemelo mas codigo del sistema externo), la contrastacion es analisis y no cabe dentro
de un nodo:

1. Listar los puntos del contrato: autenticacion (headers, firma), endpoints (rutas,
   verbos), formatos de respuesta (envoltura, campos), reglas (rate limit, TTL, fallback).
2. Para cada punto, contrastar que dice cada fuente: ¿las docs describen lo mismo que el
   codigo del sistema externo? ¿el codigo gemelo implementa lo que dicen las docs?
3. Si hay drift, **NO asumir cual es la verdad**: aplicar la jerarquia de fuente de verdad y
   dejar la resolucion escrita. Si la jerarquia no alcanza, el punto queda como nodo
   `pregunta`.
4. Cada drift resuelto **se propaga al modelo** como `regla` o `restriccion` con su cita. No
   se queda solo en la tabla — la tabla es el rastro del analisis, el nodo es lo que obliga.

Eso es lo unico que `contexto.md` conserva: el modulo huesped y la tabla de drifts.

```bash
# 1) Write tool -> .tmp-body.md con el modulo huesped y la tabla de drifts
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "contexto.md",
  "file_type": "diseno-contexto"
}' | agentos diseno file create --body-file .tmp-body.md
# 2) rm .tmp-body.md
```

```markdown
## Modulo huesped

{ruta-relativa} — {por que este y no otro}

## Drifts observados entre fuentes

| Punto del contrato | Docs dicen | Codigo gemelo hace | Codigo del sistema externo hace | Resolucion | Nodo |
|---|---|---|---|---|---|
| Identidad para registry | "X-App-Id puede ser GRJ- o APP-" | usa APP- siempre | valida estricto contra APP-{64hex} | codigo gana: APP- por empresa-licencia | REST_identidad_registry |
```

**Cuando saltarla:** si las fuentes describen aspectos NO superpuestos (el modulo huesped
describe la arquitectura interna del repo y las docs describen contratos externos, sin
solapamiento), Winston lo declara: `A-Winston: Las fuentes no se solapan en contratos. Salto
la contrastacion.`

**Anti-patron a evitar:** cerrar con nodos de cada fuente por separado SIN contrastar entre
si. Los drifts emergen en E4 del work consumidor con costo alto. Contrastar aqui cuesta
15-30 minutos y ahorra horas de reevaluacion.

### 2. Las afirmaciones sin resolver

Ninguna afirmacion del humano sobre codigo existente queda pendiente sin nodo. Si tras
profundizar sigue ambigua, **escalar al humano** en vez de dejarla flotando.

**Anti-patron a evitar:** dejar afirmaciones puntuales sin resolver con la idea de que
"TR-10 las va a cubrir". **TR-10 es barrido sistematico sobre el catalogo del modelo; no es
validacion de una afirmacion puntual del humano.** Son dos cosas distintas y la segunda no
se deduce de la primera. Una afirmacion sin resolver contamina todo lo que se modele despues.

### 3. TR-10 Data flow back-trace

**TR-10 bloquea porque el modelo cuenta**, no porque alguien declaro algo en prosa:

- `>=1` nodo `capacidad` con arista `USA` entrante desde un proceso (dependencia reusable), **o**
- `>=2` nodos `actor` distintos.

Razon: TR-10 mira hacia adentro del codigo existente y declara **invariantes-puente** que el
diseño debe respetar. Red-team mira hacia afuera y no caza contradicciones
internas entre diseño y codigo. Sin TR-10, los invariantes-puente emergen en E3/E4 del work
consumidor con costo de reevaluacion alta. **Caso real:** el work
`20260430-backoffice-eri-impl` reevaluo E3->E1 por el invariante-puente "operador ERI no es
tenant", que el frente no habia declarado.

**Si aplica:** ejecutar `agent-os/skills/advanced-elicitation/plantillas/data-flow-backtrace.md`
sobre el modelo. Los `INV-PUENTE-NN` detectados son hallazgos crudos: **antes de anexarlos
pasan por el loop de validacion de hallazgos** con el humano. Solo lo que el humano acepta
entra al modelo — cada invariante-puente aceptado nace como nodo `regla` (si es una regla que
el diseño debe aplicar) o `restriccion` (si limita el modelado), con su cita.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Interacción con técnicas bloqueantes (TR-10 en el FOCO, TR-02 step-08)". Aqui solo se indica que los invariantes-puente de TR-10 pasan por el loop antes de entrar al modelo. NO duplicar la regla — para modificar, editar la fuente. -->

**Si NO aplica** (el modelo cuenta 0 reusables y 1 solo actor), declararlo en `bitacora.md`
con la cuenta que lo justifica:

```
## YYYY-MM-DD — TR-10 no aplica en el FOCO

Razon: el modelo declara {0} capacidades con USA entrante y {1} actor.
```

**Override del humano** (saltarlo aunque aplique) — tambien en bitacora, con el riesgo asumido:

```
## YYYY-MM-DD — Override TR-10 en el FOCO

Humano salto TR-10. Razon: {razon textual}.
Riesgo asumido: invariantes-puente no detectados podrian emerger en E3/E4 del
work consumidor con costo de reevaluacion alta.
```

Elegir el camino C del loop de hallazgos (cancelar y volver al gate) **equivale a este
override**: TR-10 es bloqueante, asi que C no descarta en silencio.

**El FOCO no cierra sin una de las tres entradas** (ejecutado / no aplica / override).

### 4. Verificacion mecanica de las citas

Las citas **ya no se recolectan de la prosa: viven en los nodos**. El payload de
verificacion es una proyeccion mecanica del campo `cita` de los nodos `resuelto` que la
llevan, no una lista armada a mano:

```bash
# 1) Write tool -> .tmp-citas.json con {"citas":[{"archivo","linea","fragmento"}, ...]}
#    proyectado del campo `cita` de los nodos resuelto del modelo que citan
agentos citas verificar --input .tmp-citas.json
# 2) rm .tmp-citas.json
```

Se proyectan las citas que **existen**: las de los nodos que afirman algo del mundo
preexistente (ver "Que cita cada nodo"). Un nodo que propone no tiene cita que verificar, y
su ausencia no es un hueco del payload.

- `fragmento_movido` -> actualizar la linea del nodo con `modelo emitir` (drift menor, no bloquea).
- `fragmento_no_encontrado` / `archivo_no_existe` -> la afirmacion se degrada a
  `sin-evidencia`: re-anclar el nodo releyendo la fuente real, o retirarlo (descartarlo con
  razon) antes de firmar. **El FOCO no cierra con ningun nodo `sin-evidencia`.**

Esta es la **primera capa** de la cita. `NODO_SIN_CITA` solo comprueba que la cita exista;
que el fragmento siga estando donde dice lo comprueba este verbo. La **segunda capa** — que
la fuente diga lo que la afirmacion sostiene — es juicio de Winston, y no la hace ningun verbo.

<!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Verificacion en dos capas". Aqui solo el procedimiento de invocacion en el FOCO; la semantica de los veredictos y la congruencia viven en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

## Las cuatro condiciones de cierre

El FOCO cierra cuando se cumplen **las cuatro a la vez**:

1. **La ultima vuelta no abrio ningun nodo nuevo.**
2. **Las cinco preguntas del descubrimiento tienen respuesta en el modelo.** Una respuesta
   vacia es legitima **solo declarada**: nace como nodo `decision` con su `razon`, su
   `que_resolvio`, su `afecta` y su prosa anclada en la bitacora.
3. **`agentos modelo validar --slug {slug} --etapa foco` sale limpio** — `NODO_SIN_CITA` en
   cero (recorre los nodos `resuelto` que describen algo existente; ver "Que cita cada
   nodo"), `NODO_SIN_PROSA` en cero, `PROSA_SIN_NODO` en cero, y
   `PREGUNTA_ABIERTA` tambien (corre al cerrar cualquier etapa, incluida esta).
   **Esta condicion NO exige que toda pregunta quede resuelta o descartada:** una `pregunta`
   `abierta` con severidad `media`, `baja` o `informativa` sale limpia y se lleva viva a la
   etapa siguiente. Una `critica` o una `alta` **detienen el cierre**: el umbral subio porque
   `alta` era donde se estacionaba lo que nadie queria declarar critico. Las cuatro salidas
   estan en la mocion 2.
4. **El humano aprueba el encuadre** (`intent` y `out_of_scope`).

**Por que la condicion 2 no es decorativa.** Sin ella las otras tres se satisfacen en la
vuelta 1 con el modelo vacio: nadie abrio nodos, no hay nodos `resuelto` sin cita, y el
humano aprueba. Un modelo vacio valida con cero hallazgos, y es correcto que lo haga — un
predicado no puede reclamar lo que no existe. **El freno tiene que estar donde se decide que
el descubrimiento termino, no en el predicado.**

Donde cae cada pregunta:

| # | Pregunta | Donde tiene que estar la respuesta |
|---|---|---|
| 1 | *Que se va a hacer* | nodos `capacidad` con `clasificacion: nueva` o `se_modifica`. La `se_modifica` cita lo que hoy existe; la `nueva` no cita — todavia no hay que citar |
| 2 | *Como se va a hacer* (patron a imitar) | nodo `restriccion` con `tipo: arquitectonica` cuya fuente citada es el propio codebase |
| 3 | *Que existe y se puede reutilizar o mejorar* | la `clasificacion` de cada `capacidad`. **"No hay nada reutilizable" solo cuenta como el contraste corrido con resultado cero**, con la busqueda citada — no como ausencia de contraste |
| 4 | *Como se conecta con lo existente* | aristas con cita; las dependencias reusables por la arista `USA`; los invariantes-puente de TR-10 como `regla` o `restriccion` |
| 5 | *Como accede el usuario* | nodo `pantalla` con `cadena_navegacion`, nodo `actor`, nodo `endpoint` con su `decision_permiso`. **Antes de preguntarle al usuario:** consultar `agent-os/product/mapa-llegada.md` si existe — las entradas de pantallas vecinas que un work ya verifico responden parte de esto con evidencia fresca y citada, y por la jerarquia de fuente de verdad pesan mas que la memoria del usuario. El FOCO deja estos nodos identificados; los `prerequisitos` y la receta del dato de prueba se completan en la etapa de modelado |

Una pregunta que no aplica se declara con razon estructural (ej. `decision` con
`razon: "greenfield: el modulo no existe, no hay patron previo a imitar"`), nunca se deja en
blanco.

## Cierre

```
A-Winston: Modelo de partida construido en {N} vueltas.

- Nodos: {total} ({A} abiertos, {R} resueltos, {D} descartados).
- Aristas: {total}.
- Capacidades: {n} ({nuevas} nuevas, {mod} se_modifica, {cons} se_conserva).
- Entidades tocadas: {n}. Actores: {n}. Reglas heredadas: {n}. Restricciones: {n}.
- Dependencias reusables (capacidad con USA entrante): {Q}.

{Si TR-10 ejecutado:}   TR-10 detecto {K} invariantes-puente, {aceptados} aceptados por ti.
{Si no aplica/override:} TR-10 {no aplicaba (0 reusables, 1 actor) | saltado por override}. En bitacora.

Citas verificadas: {ok} ok, {mov} re-ancladas, {sin} sin-evidencia (resueltas antes de firmar).
modelo validar --etapa foco: {limpio | {N} hallazgos}.
Las 5 preguntas: {todas con respuesta en el modelo | pendiente(s): {cuales}}.
Preguntas que van vivas a la etapa siguiente: {n} ({ids con su severidad y a que nodo
  motivan} | ninguna). Ninguna critica ni alta: eso lo verifico el gate.
Encuadre: intent "{intent}" — out_of_scope: {N} frenos confirmados.

Convocatorias que el modelo señala para las etapas siguientes:
  {Dexter por {n} entidades | Sentinel por {n} nodos de permisos | Cipher por {n} nodos cripto | ninguna}

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):

  P — invitar a un experto (Sentinel si hay nodos de permisos, Dexter si hay
      decision de arquitectura de datos pesada, Cipher si hay nodos cripto).
      Winston declara que nodos y archivos leera el invitado antes de opinar.
  C — continuar a step-03 (pre-diseño de persistencia, Dexter).
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". El gate de las 4 condiciones de cierre es bloqueante del FOCO; el gate de anchor aplica a P. NO duplicar la regla — para modificar, editar la fuente. -->

**Bloqueante:** NO ofrecer C mientras alguna de las cuatro condiciones de cierre falle. Si
el humano fuerza el cierre, registrar override en bitacora con el riesgo asumido. Y si
Winston no puede declarar anchor (encontrado / vacio-justificado) para invitar a un experto:
NO ofrecer P.

**Al tomar C, antes de pasar a step-03, escribir la entrada de cierre.** Es la misma marca
que escribe cada uno de los nueve steps, y es la que la reanudacion lee para saber por donde
volver: sin ella, las entradas `FOCO vuelta {N}` parecen una pausa a mitad del lazo y el
diseño reabriria el FOCO ya cerrado.

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## $(date +%Y-%m-%d) — step-01 cerrado

FOCO cerrado en {N} vueltas. Anfitrion: Winston [CM].
Modelo: {total} nodos ({R} resueltos, {A} abiertos, {D} descartados), {E} aristas.
Las 4 condiciones de cierre: cumplidas{, con override: {cual y riesgo asumido}}.
modelo validar --etapa foco: limpio.
Encuadre aprobado por el humano: intent \"{intent}\", {N} frenos en out_of_scope.
Preguntas vivas a la etapa siguiente: {ids con severidad | ninguna}.
Convocatorias señaladas: {Dexter/Sentinel/Cipher por {que} | ninguna}.
" >> agent-os/disenos/{slug}/bitacora.md
```

## Post-condicion

- `agent-os/disenos/{slug}/` existe con `README.md`, `modelo.yml` y `bitacora.md`.
- Estructura `procesos/` y `hallazgos/` creadas vacias.
- README con `flujo: modelo`, `intent` aprobado, `out_of_scope` derivado de los nodos
  `decision`, y `modulo_huesped` poblado.
- `modelo.yml` con los nodos de partida: los que describen algo existente, `resuelto` con su
  cita verificada; los `decision`, `resuelto` con su prosa anclada por `<!-- nodo: {id} -->`
  en la bitacora; y los que propone y no le toca explicar —`proceso`, `entidad` nueva,
  `regla` nueva—, `abierto` con lo que el escaneo determino.
- `contexto.md` **solo si hubo contrastacion entre fuentes** (ver el bloqueante 1): el modulo
  huesped y la tabla de drifts. Si las fuentes no se solapan, no se crea.
- `bitacora.md` con una entrada por vuelta (con el reporte de emision), el estado de TR-10
  (ejecutado / no aplica / override) y, si se tomo C, la entrada
  `## {fecha} — step-01 cerrado`.
- Si hay expediente: `expediente_origen` y `requisitos_cubiertos` en el README, y cada
  requisito trazado.
- Si C: avanzar a `step-03-pre-diseno-persistencia.md`.

## Prohibiciones

- NO plantear pregunta alguna antes de ejecutar el paso 0 (leer TODAS las referencias
  declaradas por el usuario).
- NO asumir que el slug derivado del comando es la identidad del repo huesped — verificarla
  siempre via README / git remote / path actual.
- NO editar `modelo.yml` a mano. El unico camino de escritura es `agentos modelo emitir`.
- NO cerrar un nodo `resuelto` **que describa algo existente** sin cita completa. Un nodo
  que propone —`decision`, una `entidad` nueva, una `regla` nueva— no cita: su porque va en
  prosa anclada. Ni transcribir una afirmacion del humano como hecho sin haberla
  contrastado contra el codigo o dejado como nodo `pregunta`.
- NO fabricar una cita para apagar un hallazgo. Citar la bitacora del diseño es citar un
  documento que el propio agente acaba de escribir: no prueba nada y el predicado ya no la
  pide.
- NO cerrar `resuelto` un `decision` sin anclar su prosa con `<!-- nodo: {id} -->` en la
  bitacora, ni dejar un marcador nombrando un id que el modelo no tiene.
- NO cerrar `resuelto` un `proceso`, una `entidad` nueva ni una `regla` nueva: su prosa vive
  en el artefacto de una etapa posterior, y la regla del molde lo prohibe (ver "Que nodos
  exigen prosa" arriba, y el porque en su marcador FUENTE). Quedan `abierto` con lo que el
  escaneo determino.
- NO modificar codigo del repo "para que cuadre con la descripcion del usuario" sin
  autorizacion explicita registrada como nodo `decision`.
- NO declarar `out_of_scope` a ciegas al principio: se deriva de los nodos `decision`.
- NO decidir el contenido de un dominio ajeno (persistencia, criptografia, permisos):
  convocar a su dueño.
- NO cerrar sin una de las tres entradas de TR-10 en la bitacora.
- NO cerrar con ningun nodo `sin-evidencia`.
- NO modelar la persistencia, la criptografia, los contratos de proceso, el pipeline ni los
  mockups aqui.
- NO leer step-03 antes de C.
