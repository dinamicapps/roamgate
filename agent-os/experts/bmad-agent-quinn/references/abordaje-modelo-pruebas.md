---
name: abordaje-modelo-pruebas
description: Funda el modelo de pruebas de reglas de negocio del repo destino -- agnostico de stack, casa unica, regla_id anclado, contrato BR-1..BR-4. Quinn define el modelo, coordina la implementacion y audita.
menu-code: MP
---

# Abordaje de Modelo de Pruebas

**Goal:** conducir, en el repo destino, la fundacion (o el refuerzo) del modelo de pruebas de **reglas de negocio** -- no una barrida estructural de cobertura -- de forma que "?se rompio una regla?" deje de ser un juicio y pase a ser "?se puso roja una prueba?".

**Invariante agnostico:** este abordaje NO trae un framework, un runner ni una estructura de carpetas hechos en la nebulosa. Lo unico que es universal son los conceptos -- `regla_id` anclado a superficie de codigo, el contrato `BR-1..BR-4`, procedencia, casa unica, cuarentena de activos muertos -- **no un lenguaje ni un comando**. El abordaje elige el framework y la estructura leyendo el repo destino, con el mismo criterio que cualquier otra decision de diseno.

**Tu rol:** sos la anfitriona de esta fundacion. Decidis el modelo con criterio (no lo prescribis desde afuera), lo escribis como estandar del repo, y coordinas -- no ejecutas vos misma -- la implementacion de las primeras pruebas. Ver `## 2. Salida del abordaje` para la frontera entre "definir" y "escribir tests".

---

## 1. Que decide el abordaje, por repo

Cuatro decisiones, en este orden. Ninguna se hornea antes de leer el repo destino.

### 1.1 Stack y donde viven las reglas

Primero identificas el lenguaje/plataforma dominante del repo y, dentro de el, **donde vive la logica de decision**: en una capa de aplicacion testeable (codigo que corre en el proceso, invocable sin infraestructura pesada) o en una capa de datos/opaca (donde probar exige un motor de base de datos real, un trigger, o codigo generado que no se invoca directo).

Esta distincion es la que fija la estrategia de datos:

| Donde vive la regla | Estrategia de datos por defecto |
|---|---|
| Capa de aplicacion testeable | Mock aislado, o nada de BD |
| Capa de datos/opaca, sin alternativa inmediata | Aislado con reversion -- **solo si se justifica**; nunca contra una BD compartida o de produccion |

> Ejemplo (.NET): la logica de decision vive en clases del proyecto BL (Business Logic) que reciben sus dependencias por constructor -- probables con un stub manual o `Moq`, sin levantar `SQL Server`. Un `stored procedure` que calcula un descuento es la contraparte opaca: para probarlo hoy hace falta una BD real; migrarlo a la capa de aplicacion es el arreglo de fondo (go-forward, nunca big-bang).

> Ejemplo (Go): la logica de decision vive en un paquete de dominio (`internal/facturacion`) que recibe sus dependencias por interfaz -- probable con un stub en memoria, sin levantar la base real. Una vista materializada o un trigger de la base es la contraparte opaca.

**El diferenciador no es cobertura estructural.** No se trata de tocar cada metodo publico; se trata de cubrir **reglas de decision** -- elegibilidad, transiciones de estado, tarifas/topes, validaciones con significado de negocio. Un CRUD sin logica de decision no es el objetivo de este abordaje.

### 1.2 Framework nativo del repo

Elegis el framework de pruebas **nativo del ecosistema del repo** -- el que ya tiene soporte de primera clase en ese lenguaje/plataforma, no uno que traigas vos por preferencia.

> Ejemplo (.NET): el repo es .NET -- el framework nativo es `xUnit`, `NUnit` o `MSTest` (el que ya tenga precedente en el repo, o el mas idiomatico si no hay ninguno).

> Ejemplo (TypeScript): el repo es un proyecto Node/TypeScript -- el framework nativo es `Jest` o `Vitest` (el que ya use el `package.json`).

### 1.3 Activos de prueba existentes: reusar o poner en cuarentena

Antes de crear nada, inventarias lo que ya existe. Dos caminos, nunca un tercero:

- **Reusar el patron:** si hay un proyecto/paquete de pruebas vivo, con convenciones sanas y referenciado por el pipeline autoritativo (build/CI/comando de test declarado), lo extendes.
- **Cuarentena:** si hay proyectos/paquetes de pruebas **muertos** -- nunca referenciados por el comando autoritativo, sin evidencia de haberse corrido, o abandonados -- los declaras **inertes**. Cuarentena no es revivir ni borrar: es **excluir explicitamente** esos activos de la suite autoritativa y del alcance derivado, documentando la exclusion, para que no emitan una senal falsa (ni un verde mentiroso, ni un rojo que nadie va a resolver).

No hay un tercer camino ("dejarlos como estan sin declarar nada") -- un activo de prueba sin resolucion explicita es ambiguedad que el proximo agente hereda.

### 1.4 Que reglas de decision importan

El foco final: dentro del inventario de logica de negocio, priorizas las reglas cuya violacion cambia un resultado observable para el usuario o el negocio (una autorizacion que deberia negarse y no se niega, un calculo que cruza un limite, una transicion de estado que no debia ocurrir) por sobre una barrida estructural de "cada metodo tiene un test".

---

## 2. Salida del abordaje

El abordaje produce dos cosas, en este orden:

**(a) El modelo escrito como estandar del repo.** Dos archivos:
- `agent-os/standards/testing/modelo-pruebas.md` -- el esqueleto de la seccion 3.
- `agent-os/standards/testing/reglas-negocio.yml` -- el registro de la seccion 4.

Ambos existen **antes** de que exista la primera prueba. El registro no se llena retroactivamente para justificar un test ya escrito -- una regla se registra, y luego se prueba.

**De donde sale la cola de trabajo.** Que reglas alimentan el modelo no se decide de memoria ni releyendo el registro entero: `agentos pruebas consultar --sin-prueba` cruza `reglas-negocio.yml` contra el ledger y devuelve las reglas **registradas sin prueba vigente** (sin `creada`/`modificada`, o con una `retirada` posterior), con su `superficie`, `modulo` y `suite_selector`. Esa lista es el insumo de (b) en la fundacion y de cada iteracion del lazo de la seccion 8: se prioriza dentro de ella con el criterio de 1.4 (reglas cuya violacion cambia un resultado observable), nunca al reves. Si sale vacia, no hay deuda de reglas registradas — lo que falte esta en el descubrimiento, no en la cola.

**(b) Las primeras pruebas regla-a-regla, implementadas bajo el modelo.** Aca la frontera de rol importa: **el ejecutor de la Etapa 3 (el experto de desarrollo del work -- Amelia/Atlas segun el repo) escribe las pruebas**; **Quinn audita** que cumplan el contrato `BR-1..BR-4`. Quinn no se auto-audita, y el ejecutor no se autocertifica -- el mismo patron de roles que ya rige la auditoria de evidencia (productor/auditor, EV-1..EV-4).

### Handoff con E3 (Quinn <-> ejecutor)

Frontera productor/auditor, mismo patron que `EV-1..EV-4` (`agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`): **el ejecutor de E3 (Amelia/Atlas segun el repo) produce** -- escribe la prueba y captura los artefactos `BR-2` bajo el modelo que Quinn fundo; **Quinn audita** -- nunca produce ella misma una prueba de negocio ni un artefacto de captura. Ninguno de los dos roles se auto-audita: el ejecutor no certifica su propio cumplimiento del contrato, y Quinn no implementa lo que despues audita.

**Artefactos esperados por `regla_id`** (producidos por el ejecutor de E3, guardados en `etapa-4/evidencia/mp/{regla_id}/` -- misma carpeta de evidencia que Quinn audita en E4, mismo ciclo que `EV-N`):

| Artefacto | Contenido | Eje que soporta |
|---|---|---|
| El archivo de test (ubicacion la fija la casa unica del modelo, seccion 3) | Assert sobre el resultado observable de la regla + comentario de procedencia (`regla_id` + slug del work de origen) | BR-1, BR-3, BR-4-F1 |
| `red.log` | Salida completa de la corrida filtrada por modulo, capturada CON la condicion productiva mutada (BR-2 paso 2, seccion 5) | BR-2 |
| `green.log` | Salida completa de la corrida filtrada por modulo, capturada DESPUES de restaurar la condicion productiva (BR-2 paso 4, seccion 5) | BR-2 |
| Entrada en `agent-os/standards/testing/reglas-negocio.yml` | `regla_id` + `superficie` + `modulo` + `suite_selector` (seccion 4 de este reference) | BR-3, BR-4-F1 |

**Lo que audita Quinn (nunca produce):**

| Chequeo | Que hace Quinn | Bloqueante |
|---|---|---|
| BR-1 | Lee el assert y confirma que compara contra el resultado observable real, no un assert trivial. | Si |
| BR-2 | Lee `red.log` y `green.log`: confirma que el rojo corresponde a la mutacion declarada, el verde a la restauracion, y que el control de versiones muestra el archivo productivo limpio (paso 3 del procedimiento, seccion 5). Sin ambos logs, o con logs que no muestran el contraste rojo->verde, el eje falla. | Si |
| BR-3 | Confirma que el `regla_id` referenciado en el test existe en `reglas-negocio.yml` -- nunca un `regla_id` inventado en el momento de escribir el test. | Si |
| BR-4-F1 | Confirma el comentario de procedencia en el test (`regla_id` + slug del work de origen) Y que ese `regla_id` tenga entrada en `reglas-negocio.yml` con la `superficie` que el test ejercita. El registro NO guarda el work: la atadura prueba<->work vive en el ledger y se audita en BR-4-runtime. | Si |
| BR-4-runtime | Confirma, con `agentos pruebas consultar --regla-id {id}`, que la operacion (creada/modificada/retirada) del `regla_id` esta anotada en el ledger para el `work_slug` que el comentario del test declara, y que las operaciones creada/modificada traen `red_capturado:true` (ver seccion 5 y 7). | Si |

Si un chequeo falla, Quinn devuelve la tarea al ejecutor de E3 con el chequeo especifico que fallo -- no completa ella misma el artefacto faltante ni corrige el test. El ejecutor corrige y vuelve a entregar; Quinn re-audita. Loop identico al de "Resolucion de fallos EV-N" (`etapa-4/evidencia.md`): Quinn invita/devuelve, nunca suple.

---

## 3. Esqueleto agnostico de `modelo-pruebas.md`

El estandar que el abordaje escribe en el repo destino sigue este esqueleto. Cada campo marcado *(variable)* es una decision de la seccion 1, nunca un valor fijo de la nebulosa.

```markdown
# Modelo de pruebas de reglas de negocio -- {repo}

## Framework
{framework} *(variable -- seccion 1.2)*, version(es) pinneadas.

## Casa unica
Una sola suite/proyecto de pruebas para todo el repo: `{ruta_de_la_suite}`.
Agregar un modulo nuevo = referenciar la unidad de codigo + 1 carpeta dentro
de la casa unica. Jamas una suite/proyecto nueva por modulo.

## Agrupacion de modulo
{mecanismo_nativo_de_agrupacion} *(variable -- el mecanismo propio del
framework elegido: atributo/tag/build-tag/carpeta -- ver seccion 1.2)*.

## Filtrado por modulo
{mecanismo_nativo_de_filtrado} *(variable -- el flag/convencion propia del
runner elegido para correr solo un modulo)*.

## Procedencia y `regla_id`
Formato: `<Modulo>.<Superficie>.<Regla>`. Ver seccion 4 -- anclado al
metodo/condicion de codigo real, no un rotulo libre.

## Contrato BR-1..BR-4
Ver seccion 5 de este reference. Toda prueba de regla lo cumple.

## Cuarentena
| Activo | Estado | Razon |
|---|---|---|
| {activo_muerto_1} | inerte, excluido | {razon} |

## Mapeo archivo -> modulo (fuente de verdad)
| Archivo / superficie de codigo | Modulo | Nota |
|---|---|---|
| {archivo} | {modulo} | {si es codigo compartido: union de modulos} |

## Economia observada
{costo de fundacion + costo por regla->test + fricciones -- se llena
despues de las primeras pruebas, no antes}
```

Puntos que no son negociables dentro de este esqueleto:

- **Casa unica.** Una sola suite para todo el repo. Agregar cobertura de un modulo nuevo es una referencia a la unidad de codigo + una carpeta dentro de la casa existente -- **nunca** una suite/proyecto de pruebas nueva por modulo. Fragmentar en N suites reintroduce el costo de mantenimiento que este abordaje existe para evitar.
- **Agrupacion y filtrado son el mecanismo nativo del framework elegido**, no una convencion inventada por la nebulosa.
- **La tabla de mapeo archivo->modulo es la fuente de verdad.** El alcance de que suite corre cuando un work toca ciertos archivos se deriva de esta tabla, no se infiere a ojo. Cuando un archivo es codigo compartido entre modulos (logica de negocio comun, controladores delgados que delegan a varios servicios), mapea a **mas de un modulo**, y el alcance derivado es la **union**.

> Ejemplo (.NET) -- agrupacion y filtrado: el mecanismo nativo de agrupacion es el atributo `[Trait("Modulo", "<Modulo>")]` sobre la clase o el metodo de test; el mecanismo nativo de filtrado es `dotnet test --filter Modulo=<Modulo>`. La casa unica es un unico proyecto `csproj` de pruebas referenciado por el `.sln`, con una carpeta por modulo (ej. `Facturacion/`, `GestorDocumental/`).

> Ejemplo (Go) -- agrupacion y filtrado: el mecanismo nativo de agrupacion es un build tag (`//go:build modulo_facturacion`) o, mas simple, un paquete por modulo dentro de un mismo modulo Go raiz; el mecanismo nativo de filtrado es `go test ./facturacion/... -run TestNombre` o `-tags modulo_facturacion`. La casa unica es el modulo Go raiz del repo, con un paquete de test por carpeta de dominio.

> Ejemplo (TypeScript) -- agrupacion y filtrado: el mecanismo nativo de agrupacion es la carpeta/archivo (`facturacion/*.test.ts`) mas el nombre del bloque `describe`; el mecanismo nativo de filtrado es `--testPathPattern=facturacion` (o el equivalente del runner elegido en la seccion 1.2). La casa unica es un unico directorio raiz de pruebas (o pruebas colocadas junto al codigo, si esa es la convencion existente del repo) con una carpeta por modulo.

---

## 4. Esquema de `reglas-negocio.yml`

El registro es el segundo artefacto de la seccion 2(a). Existe **antes** de la primera prueba: el flujo es "se descubre/declara la regla -> se registra -> se prueba", nunca al reves.

Cada entrada:

| Campo | Descripcion |
|---|---|
| `regla_id` | Identidad estable de la regla. Formato `<Modulo>.<Superficie>.<Regla>`. |
| `superficie` | El ancla a codigo: `<ruta-relativa>::<simbolo>`. Estable ante edicion interna del metodo; cambia solo al renombrar o mover, que es cuando debe reevaluarse. |
| `modulo` | El modulo segun la tabla de mapeo de la seccion 3. |
| `suite_selector` | Como el runner selecciona esta suite. String opaco que define el estandar de pruebas del repo (ver seccion 1.2). |
| `enunciado` | Opcional. La condicion en prosa (ej. `"estado in {3,8} => campo vacio"`). Documenta la regla; no es su ancla. |

```yaml
reglas:
  - regla_id: "<Modulo>.<Superficie>.<Regla>"
    superficie: "<ruta/al/archivo>::<NombreDelSimbolo>"
    modulo: "<Modulo>"
    suite_selector: "<selector del runner>"
    enunciado: "<condicion en prosa>"
```

**Ancla estable, no rotulo libre.** El `regla_id` no es un nombre que la cognicion inventa cada vez que quiere: se ancla a la ubicacion semantica real de la regla (`superficie`). Si alguien "reformula" la regla con un `regla_id` nuevo sobre la misma superficie de codigo, eso **no es una regla nueva** -- es una modificacion de la existente, y cae bajo el mismo candado de autorizacion que cualquier otra modificacion (seccion 6). Acunar un `regla_id` nuevo sobre una superficie ya registrada exige justificacion de retiro+alta explicita, nunca una creacion silenciosa.

---

## 5. Contrato BR-1..BR-4

Cuatro ejes, analogos en espiritu al checklist `EV-1..EV-4` de auditoria de evidencia: una prueba de regla solo cuenta como cobertura si cumple los cuatro. Quinn audita este contrato al cierre; el ejecutor de E3 lo cumple al escribir.

### BR-1 -- La prueba asevera sobre el resultado de la regla

El assert compara contra el **resultado observable** que la regla produce (el valor calculado, el estado permitido/denegado, el error especifico emitido) -- nunca un assert trivial o tautologico que pasaria aunque la regla no existiera.

### BR-2 -- Sensibilidad RED demostrada, con artefacto capturado

No basta con que la prueba pase en verde: tiene que demostrarse que **se pone roja cuando la regla se viola de verdad**. El procedimiento, siempre en este orden:

1. Mutar temporalmente la **condicion productiva** que implementa la regla (el codigo de negocio, nunca el test).
2. Correr la suite filtrada por el modulo correspondiente y **capturar la salida completa** de la corrida en rojo (el artefacto -- no una afirmacion de que "se puso roja").
3. **Restaurar** el codigo productivo exactamente como estaba, y **verificar con el control de versiones que el diff del archivo productivo queda limpio** antes de seguir. Si el restore no deja el archivo productivo identico al original, se detiene y se reporta -- nunca se sigue con codigo de negocio mutado sin resolver.
4. Volver a correr y **capturar la salida en verde**.

Una prueba que nunca se pondria roja ante la violacion de su propia regla no es cobertura -- es decoracion.

> Ejemplo (.NET) -- mutacion productiva: la regla vive en `FurValidador.ValidarCascadasNivelCampo`, condicion `estadoaseguramiento in {3,8} => placa vacia`. Se invierte temporalmente esa condicion en el `.cs` productivo, se corre `dotnet test --filter Modulo=Facturacion`, se guarda la salida en `red.log`, se restaura el archivo, se confirma `git diff` vacio sobre ese archivo, y se vuelve a correr guardando `green.log`.

> Ejemplo (Go) -- mutacion productiva: la regla vive en `facturacion.ValidarEstado`, condicion `estado in {Anulado, Cerrado} => transicion denegada`. Se comenta/invierte temporalmente esa condicion en el `.go` productivo, se corre `go test ./facturacion/... -run TestValidarEstado`, se guarda la salida en `red.log`, se restaura el archivo, se confirma `git diff` vacio, y se vuelve a correr guardando `green.log`.

### BR-3 -- `regla_id` y procedencia presentes

La prueba referencia su `regla_id` (existente en el registro de la seccion 4, nunca inventado en el momento) y declara su procedencia -- de que work surgio o que work la modifico por ultima vez.

### BR-4 -- Trazabilidad al work, en dos niveles

Este eje tiene dos niveles, y **no son intercambiables**:

- **BR-4-F1 (exigible):** procedencia **localmente verificable** -- un comentario en el propio archivo de test que declara `regla_id` + el slug del work de origen, mas la entrada de ese `regla_id` en `reglas-negocio.yml` (seccion 4), que lo ancla a su `superficie`. Se verifica leyendo dos archivos; no requiere infraestructura adicional. El registro **no declara el work**: su esquema es `regla_id`/`superficie`/`modulo`/`suite_selector`/`enunciado` y nada mas, porque la relacion prueba<->work es historia append-only y vive en el ledger, no en un campo que habria que reescribir en cada modificacion. Ese lado lo cubre BR-4-runtime.
- **BR-4-runtime (exigible):** el libro-mayor append-only del runtime (`agent-os/pruebas/ledger.md`) ata cada prueba a cada operacion de work que la creo/modifico/retiro, consultable por `regla_id`/`work`/`superficie`. Se acuña con el verbo `agentos pruebas anotar` -- nunca a mano, ver seccion 7 para el contrato completo y el gate mecanico de cierre que lo hace exigible.

---

## 6. Candados de autonomia

Una prueba de regla no es un archivo mas: encoda una garantia de negocio. Su edicion esta sujeta a candados explicitos.

- **Actualizacion autonoma, solo bajo dos condiciones simultaneas:** (1) el work en curso cambia **deliberadamente** el comportamiento que la prueba encoda, y (2) ese cambio esta respaldado por una **fuente de intencion autorizada** -- la meta del work, un criterio de aceptacion, el brief, o un requisito de expediente que declara explicitamente el nuevo comportamiento. El agente **no puede autocertificar** "esto fue deliberado" sin esa fuente externa.
- **Cualquier otra edicion de una prueba de regla existente requiere autorizacion humana** -- usuario, orquestador, u operador via el mecanismo de escalamiento del repo -- **nunca marcada `[AUTO]`**, sin importar el nivel de autonomia configurado. Esto cierra la puerta a que el agente "ponga en verde" una prueba rota editandola en vez de arreglando el codigo.
- **Una prueba roja nunca se resuelve en silencio.** Dispara analisis forense (?se rompio por el cambio actual, o por otra causa?), se clasifica la conducta segun corresponda (arreglo de codigo si es regresion, actualizacion de prueba si es cambio deliberado y autorizado), y **siempre** requiere la autorizacion humana descrita arriba antes de cerrarse -- incluso en el nivel de autonomia mas alto que el repo tenga configurado.

**El patron forense no se reinventa para MP -- se reusa el de la ruta `bugfix`.** Cuando la suite de reglas de negocio del modulo tocado se pone roja al correrla antes de cerrar, es el mismo Atlas (anfitrion sabueso) el que investiga, con el mismo metodo: reconstruye la causa raiz (?rompio el work actual, o es otra causa?), clasifica la conducta (mismo criterio de fondo que el `desenlace` de la ruta bugfix, aqui reducido a dos salidas: correccion de codigo si es regresion; actualizacion de la prueba -- sujeta a los dos candados de arriba, jamas `[AUTO]` -- si es cambio deliberado y respaldado por una fuente de intencion autorizada), y verifica con el metodo repro->verde hasta volver a verde. El filtro "Quinn obligatoria" de esa misma ruta aplica sin cambios: casi toda resolucion de una regla de negocio toca logica de validacion o agrega un test.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/rutas/bugfix/investigacion.md (patron forense completo: triaje de dimensiones, evidencia con cita anclada, diagnostico de raiz), rutas/bugfix/conversacion.md (enum y clasificacion de `desenlace`), rutas/bugfix/ejecucion-verificacion.md (metodo repro->verde y filtros opt-in, incluido "Quinn OBLIGATORIO si..."). Los tres archivos viven alli integros; aqui solo se declara que una suite de reglas de negocio en rojo dispara el mismo patron. NO duplicar -- editar las fuentes. -->

---

## 7. Frontera runtime/cognicion

Lo que esta seccion NO implementa, porque no le corresponde a la cognicion -- ya construido y operativo en el runtime:

- **El libro-mayor append-only prueba<->work** (BR-4-runtime, seccion 5) vive en `agent-os/pruebas/ledger.md`, propiedad del runtime. Se escribe **solo** con el verbo `agentos pruebas anotar` -- payload `regla_id`, `superficie` (ancla `<archivo>::<simbolo>`), `work_slug`, `operacion` (`creada|modificada|retirada`), mas `razon`/`fuente_intencion` cuando aplica y `red_capturado` (bool, BR-2). El runtime inyecta `id` y `fecha`; una superficie ya registrada bajo otro `regla_id` no se acuña como creacion silenciosa (anti-lavado). Nunca se edita a mano: un guard de canal en el hook de escritura del repo bloquea cualquier edicion directa del archivo fisico, para cualquier agente o subagente. `agentos pruebas consultar` lee el ledger filtrado por `regla_id`/`work`/`superficie`, y con `--sin-prueba` invierte la consulta: cruza el registro contra el ledger y devuelve las reglas registradas que aun no tienen prueba vigente (la cola de trabajo de la seccion 2); `agentos pruebas alcance --work <slug>` deriva -- de forma determinista, sin inferencia -- la union de suites que un work debe dejar verde, cruzando `reglas-negocio.yml` con los archivos que sus tareas declaran tocar.
- **El gate de obligaciones de prueba** al cierre de un work ya es mecanico, no una declaracion de intencion: si el alcance derivado incluye una regla que el work toco y esa regla no tiene anotacion en el ledger de ESE work, el cierre falla (`OBLIGACION_PRUEBAS_NO_DECLARADA`) -- salvo exencion explicita via un descarte en `pruebas_requeridas.descartes`. Si la anotacion existe pero es `creada`/`modificada` sin `red_capturado:true`, el cierre falla igual (`BR2_RED_NO_CAPTURADO`): BR-2 (seccion 5) tambien paso de auditado a mecanico. Un registro `reglas-negocio.yml` presente pero corrupto falla-cerrado -- el gate nunca se apaga en silencio por un YAML roto.

Lo que esta seccion SI hace, y sigue siendo trabajo exclusivo de la cognicion -- el runtime no lo reemplaza: Quinn conduce la **fundacion cognitiva** -- decide el modelo, lo escribe como estandar del repo, coordina la implementacion de las primeras pruebas, y audita el contrato `BR-1..BR-4` completo, BR-4-runtime incluido, leyendo el ledger con `agentos pruebas consultar`. Quinn tampoco escribe el ledger ella misma: audita lo que el ejecutor de E3 ya anoto al entregar (seccion 2).

---

## 8. El lazo de aprendizaje: regla descubierta -> prueba

La fundacion (seccion 2) no es un evento unico: es el arranque de un lazo que sigue corriendo mientras el repo se sigue trabajando. Cada vez que un work, un diseno o una investigacion forense de bugfix hace emerger una regla de negocio -- nueva o con comportamiento modificado -- ese descubrimiento se registra y se prueba con el mismo contrato `BR-1..BR-4`, nunca como una excepcion aparte:

- **Regla nueva:** entra a `reglas-negocio.yml` (seccion 4) y su prueba se acuna anotando el ledger con operacion `creada`.
- **Regla existente que cambia de comportamiento:** la entrada se actualiza (seccion 4) y la prueba se acuna anotando el ledger con operacion `modificada` -- bajo los candados de la seccion 6 (deliberado + fuente de intencion autorizada).

Este es el mismo mecanismo -- ledger append-only, verbo de anotacion, gate de obligaciones -- que ya describe la seccion 7; aca no se agrega contrato nuevo, se nombra el patron: **la red de reglas cubiertas crece con el trabajo del repo, no con una campana de cobertura separada.** El disparador mas frecuente de este lazo despues de la fundacion es la obligacion derivada que ya corre en Etapa 3 cuando el runtime detecta que un work toca reglas ya registradas -- ver el tejido completo en la fuente de abajo --, pero el lazo tambien se dispara con reglas que nunca estuvieron registradas: la primera vez que aparecen, en cualquier work, diseno o bugfix, se registran y se prueban en el momento, no se difiere para una campana aparte.
<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-3.md seccion "Anfitrion por modo" parrafo "Obligacion derivada (independiente de que este work haya activado [MP])" para el disparo automatico sobre reglas ya registradas; seccion 7 de este mismo archivo para el contrato completo del ledger, el verbo de anotacion y el gate de cierre. NO duplicar -- editar las fuentes. -->
