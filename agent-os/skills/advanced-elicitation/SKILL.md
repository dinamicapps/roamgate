---
name: advanced-elicitation
description: Catalogo de 3 tecnicas adversariales para validar diseños y planes. Cada una tiene plantilla completa y se ejecuta literal. 2 son BLOQUEANTES de cierre con gatillos automaticos no-saltables salvo override explicito del usuario.
---

# Advanced Elicitation

Skill compartido. Permite a un anfitrion aplicar una tecnica adversarial para encontrar
superficie no cubierta antes de seguir.

## Que recibe una tecnica

Tres insumos. La tecnica **declara cuales uso** en su salida:

1. **El grafo** — el subgrafo de la etapa (`agentos modelo proyectar --slug {slug} --vista
   {vista}`, o el `modelo.yml` directo). Es lo que da la lista contra la cual barrer: sin
   una lista declarada, "por cada dato de entrada" es una intencion y lo que queda es que el
   anfitrion recuerde cuales habia.
2. **La prosa de la etapa** — el artefacto vigente (brief, contrato de proceso, plan de
   work, mockup).
3. **El hilo previo** — las aclaraciones del usuario y del anfitrion ya registradas en la
   bitacora del diseno. No solo el turno anterior de una cadena de tecnicas: el contexto
   acumulado.

**Una etapa que todavia no emite al modelo no tiene grafo que dar.** En ese caso la tecnica
**declara la ausencia** y trabaja con los otros dos — no la fabrica ni la omite en silencio:

    Insumos: prosa de la etapa + hilo previo. Sin grafo (esta etapa no emite al modelo).

## Cuando se invoca

Tres vias, y **ninguna es un menu**. No sobrevive ninguna via de eleccion-por-menu sobre este catalogo: las tarjetas de etapa de `/alfred` (`agent-os/skills/host-protocol/etapas/`) no declaran menu de cierre, y el ofrecimiento de rutina que las nueve tarjetas de `/disenar` hacian al cerrar se retiro. Las dos tecnicas bloqueantes se disparan solas; la tercera se propone por senal concreta.

- **Bloqueante de cierre de step-01 (el FOCO)** en `/disenar`: TR-10 data-flow-backtrace cuando el modelo declara >=1 dependencia reusable o >=2 actores distintos. En diseños del regimen `lineal` el bloqueo vive en el cierre de step-02. El anfitrion no la ofrece ni el usuario la elige: el gatillo la nombra.
- **Bloqueante de cierre de step-08** en `/disenar`: TR-02 red-team sobre el brief completo. Idem — sin eleccion.
- **Opt-in de la Fase 2 del abordaje** (`/alfred`): TR-10 o TR-02 cuando la evidencia parece "sospechosamente limpia" o el riesgo es alto. Lo activa Alfred por senal detectada, o el usuario por solicitud explicita. Tampoco hay lista que mostrar: la fase nombra las dos tecnicas aplicables.
  <!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/fase-2-recolectar.md seccion "Profundizacion adversarial bajo demanda (REF->)". Cuando se activa el mecanismo y con que senales vive alli; aqui solo que es una via de entrada a este catalogo. NO duplicar la regla — para modificar, editar la fuente. -->

**TR-08 no tiene gatillo ni llamador de rutina.** Es la unica tecnica del catalogo que ninguna de las tres vias nombra: se invoca cuando el anfitrion detecta la senal concreta —la etapa declara datos tipados cuyos extremos el artefacto no dice como trata— y la propone con el anchor del gate de abajo declarado.

**Los menus `A` que quedan en el corpus no desembocan aqui.** El cierre de la Fase 3 del abordaje y los loops de autorizacion del bridge ofrecen `A`, pero ninguno declara este catalogo como destino de esa opcion. Los moldes de Sally (`create-ux-design`) y de Winston (`create-architecture`) si definen su `A` como advanced elicitation, pero invocan un skill con otro nombre que no existe; esa via esta rota y su arreglo no es de este catalogo. Quien vaya a agregar una via de menu tiene que construirla, no darla por existente.

## Tecnicas bloqueantes (no se saltan sin override)

Dos tecnicas son contrato del cierre de su step. El step NO firma sin que la bitacora del diseño registre que la tecnica se ejecuto (con resultado distinto de "saltada").

### TR-10 Data flow back-trace — bloqueante de step-01 (el FOCO)

**Mira hacia adentro del codigo existente.** Cruza datos criticos / actores / dependencias reusables del brief con su definicion en el codigo del repo huesped y reusables, y declara invariantes-puente cuando el brief contradice un invariante implicito del codigo.

Razon: red-team mira fallos externos (produccion, regulaciones, escenarios) y no caza contradicciones internas entre el brief y el codigo real. TR-10 cubre ese hueco. Sin TR-10, los invariantes-puente emergen en E3/E4 del work con costo de reevaluacion alta.

**Cuando aplica el bloqueo:** el modelo (o el brief, en el regimen `lineal`) declara >=1 dependencia reusable (ej: "dependencias inyectadas existentes (reusables): IhceDbContext, ITenantContext, ...") **o** >=2 actores distintos (ej: usuario empresa + operador soporte).

**Cuando NO aplica:** el diseño no toca codigo existente (modulo nuevo aislado, sin dependencias reusables, un solo actor). En ese caso el step declara explicitamente *"TR-10 no aplica: 0 dependencias reusables y 1 solo actor."* y firma. Override por brief especialmente pequeño tambien posible con razon en bitacora.

Ver `plantillas/data-flow-backtrace.md`.

### TR-02 Red team — bloqueante de step-08

**Mira hacia afuera del brief.** Busca superficie no cubierta en 3 dimensiones: funcional, tecnica, regulatoria.

Razon: el brief recopila lo que el modelador penso. Red-team obliga a buscar lo que NO penso. Sin red-team, el cierre del brief firma sobre lo que esta — no sobre lo que falta.

**Cuando aplica el bloqueo:** siempre que step-08 vaya a firmar el cierre del brief. No hay caso de "no aplica" — incluso un brief minimo se beneficia de 3 rondas cortas.

**Override valido (solo con razon en bitacora):** brief experimental de exploracion (modo investigacion en `/disenar` cuando ese modo exista), o brief refinamiento de uno previo donde red-team se aplico recientemente al brief padre.

Ver `plantillas/red-team.md`.

## Como se invoca

Ninguna de las tres vias de arriba abre el catalogo para que el usuario elija entre las tres: la tecnica ya viene nombrada por el gatillo, por el opt-in de Fase 2, o por la propuesta anclada del anfitrion. El skill:

1. **Resuelve cual corre** con lo que la via ya dijo. Solo si el usuario pregunta que hay en el catalogo se le muestra `tecnicas.csv` con sus columnas reales — `codigo | categoria | nombre | descripcion` —; no es un paso del procedimiento. Cual es bloqueante y con que gatillo **no esta en el CSV**: sale de la seccion "Tecnicas bloqueantes (no se saltan sin override)" de este archivo.
2. Lee la plantilla en `plantillas/{tecnica}.md` y la ejecuta literal: las tres tienen plantilla, no hay tecnica que se improvise desde el `output_pattern`.
3. La salida NO se anexa directo al artefacto. Pasa por el **loop de validación de hallazgos con el usuario**: la técnica presenta en pantalla los 3 bloques (análisis + hallazgos + solución propuesta) y abre los 4 caminos (A de acuerdo / B profundizar con otra técnica / C cancelar y volver al gate / D opinión-contexto). Solo lo que el usuario acepta (camino A) se anexa al artefacto; cada turno se registra en `bitacora.md` con `hereda_de:`.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Los 4 caminos". Aqui solo se indica que la salida de una tecnica TR-NN entra al loop; la mecanica de los 4 caminos y la persistencia viven en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

**La juntura no es una TR-NN.** El **Acuerdo de Juntura** (artefactos con 2+ dueños de dominio: criptografía, seguridad de APIs, datos) es un protocolo de dominio, no una técnica de este catálogo: no tiene código, no se elige de la lista de 3, y no se agrega a `tecnicas.csv`. Se convoca por solape de dominios, y sus objeciones cruzadas no resueltas entran al mismo loop de validación que los hallazgos de una TR-NN.

<!-- FUENTE: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Escalamiento del desacuerdo". Aqui solo se aclara que la juntura NO pertenece a este catalogo. NO duplicar la regla — para modificar, editar la fuente. -->

## Gate de anchor en evidencia (obligatorio antes de invocar)

Antes de invocar cualquier tecnica TR-NN (excepto las dos bloqueantes TR-10 y TR-02 que tienen anchor implicito por diseño), el anfitrion declara el estado del anchor. Dos estados posibles:

### Estado 1 — Anchor encontrado

El anfitrion buscó evidencia en el codebase del repo huesped y/o reusables y encontro piso concreto. Declara cita verificable:

```
A-{experto}: Propongo TR-08 edge case hunter sobre {los datos concretos que
declara la etapa}. Anchor: {archivo:linea | tabla | esquema} define esos datos
con {tipos, longitudes, nulabilidad concretas}. Procedo con la tecnica anclada
en esa evidencia.
```

Ejemplo valido:
```
A-Mary: Propongo TR-08 edge case hunter sobre las 7 entradas del contrato de
P2 (alta de nodo). Anchor: NodosController.cs lineas 142-167 y la tabla
dbo.Nodo declaran esos campos con sus tipos, longitudes y nulabilidad.
Barrere los cinco extremos por dato contra lo que el contrato dice que pasa
con cada uno.
```

### Estado 2 — Anchor buscado vacio

El anfitrion buscó pero no hay piso de codebase para esta afirmacion. Declara el intento y la razon estructural de ausencia:

```
A-{experto}: Propongo TR-08 edge case hunter sobre {los datos que declara la
etapa}. Anchor vacio declarado: busqué {que busco: grep X, Read Y, subagente
Z}, resultado: no hay esquema ni codigo que defina esos datos porque {razon
estructural}. Procedo con la tecnica sabiendo que los extremos se contrastan
solo contra el contrato declarado en la prosa.
```

Razones estructurales legitimas:
- **Greenfield**: el diseño es modulo nuevo aislado, no hay codigo previo que confrontar.
- **Afirmacion abstracta no contrastable**: la afirmacion es regla declarativa que no tiene contraparte en codigo existente (ej. "el sistema debe respetar privacidad" no se confronta contra archivo especifico).
- **Zona aun sin codigo**: el modulo huesped existe pero la zona especifica que cubre la afirmacion no tiene implementacion aun.

Ejemplo valido:
```
A-Mary: Propongo TR-08 edge case hunter sobre los 12 campos de las 3
entidades nuevas. Anchor vacio declarado: ejecute Glob "**/Nodo*.cs" y
consulte el esquema de la BD; ninguna de las 3 tablas existe todavia
(greenfield para esta funcionalidad). Procedo con la tecnica sabiendo que los
extremos se contrastan contra el diccionario del diseño, no contra un esquema
desplegado.
```

### Por que dos estados y no uno

La regla "siempre anchor en codebase o no invocar" rompe en greenfield. La regla
"no invocar si no hay codebase" deja diseños de arranque limpio sin herramientas
adversariales. La distincion clave NO es "hay anchor / no hay anchor" sino
**"intente / no intente"**: el intento honesto que resulta vacio por razon
estructural es legitimo. No intentar no es un estado que se declare — es no
haber hecho el trabajo, y la tecnica no se invoca.

### Extension al menu P (party mode)

Cuando el anfitrion propone invitar a otro experto via menu P, declara el anchor del experto invitado:

```
A-Mary: Invito a Winston para pesar B-W1/B-W2/B-W3. Anchor de Winston:
leera {archivos especificos del codebase} y comparara con {decisiones
arquitectonicas del brief} antes de pronunciarse.
```

Si Winston no tiene anchor declarado (solo "Winston opinara sobre la arquitectura"), aplicar Estado 2 (anchor vacio justificado) o no invitarlo aun: sin intento de busqueda declarado, la invitacion no procede.

## Auditoria de gatillos bloqueantes

Cuando un step con tecnica bloqueante intenta cerrar, el step debe verificar en `bitacora.md` del diseño:

- step-01 cierra (el FOCO; step-02 en el regimen `lineal`): ¿hay entrada `## YYYY-MM-DD — TR-10 ...` con resultado (incluso "0 invariantes-puente detectados, razon: ...")? Si NO: rechazar cierre y forzar invocacion.
- step-08 cierra: ¿hay entrada `## YYYY-MM-DD — TR-02 ...`? Idem.

El override explicito del usuario es valido pero queda registrado:

```
## YYYY-MM-DD — Override TR-10 en el FOCO

Usuario salto TR-10 en cierre del FOCO. Razon: {razon textual del usuario}.
Riesgo asumido: invariantes-puente no detectados podrian emerger en E3/E4
del work consumidor.
```

## Catalogo

Ver `tecnicas.csv` para el catalogo completo. Las tres tienen plantilla operativa en `plantillas/`. Cuales son bloqueantes de cierre y con que gatillo se declara en las secciones "Tecnicas bloqueantes (no se saltan sin override)" y "Auditoria de gatillos bloqueantes" de este mismo archivo.
