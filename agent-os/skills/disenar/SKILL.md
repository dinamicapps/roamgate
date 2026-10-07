---
name: disenar
description: Comando para aterrizaje de feature/producto en sistema vivo. Produce un modelo validable del diseño y un brief modelado por procesos antes de que el work consumidor toque codigo. Winston conduce el frente (FOCO, step-01) y Mary los steps 04 a 09; cada step cierra con menu P/C. Tiene modo inicial (step-01 FOCO + step-03..09, sin step-02) para crear el diseño desde cero, y modo retroceso (step-r1..r5) para procesar hallazgos emitidos por works consumidores. Los diseños creados antes del modelo corren el regimen lineal.
---

> **Antes de cualquier accion: lee `MANIFIESTO.md` (raiz del repo).** Los principios universales del MANIFIESTO aplican a /disenar en modo inicial y modo retroceso. En particular: (P1) el anfitrion del frente lee TODAS las referencias del usuario antes de proponer intent, (P2) brief modulado por procesos sin secciones especulativas, (P5) detector de codigo del sistema externo accesible es contrato canonico (no las docs solas), (P6) cada step audita sus bloqueantes antes de cerrar (solo `C` avanza), (P9) cada pregunta del discovery nombra el caso y pega el fragmento; una decision por turno cuando estan encadenadas.

# /disenar

Comando del usuario para aterrizar una idea de feature/producto antes de implementarla. Produce un brief en `agent-os/disenos/{slug}/` que works consumidores referencian via `/alfred iniciar --desde-diseno={slug}`.

## Subcomandos

- `/disenar iniciar "{descripcion}"` — crea diseño nuevo en modo inicial.
- `/disenar iniciar --desde-reconocimiento={slug} --etapa=N` — crea diseño nuevo heredando el
  catalogo ya confrontado de esa etapa de un reconocimiento (capacidades citadas, contratos
  externos, out_of_scope de etapas posteriores). Ver "Insumo del reconocimiento" en
  `modo-inicial/step-01-foco.md`.
- `/disenar reanudar {slug}` — reactiva diseño en modo retroceso (procesar hallazgos pendientes).
- `/disenar estado {slug}` — muestra estado del diseño + works consumidores + hallazgos.
- `/disenar listar` — lista todos los diseños del proyecto con estado y consumidores.
- `/disenar archivar {slug}` — marca diseño como OBSOLETO. Works consumidores siguen ejecutables con brief congelado.
- `/disenar consolidar-brief {slug}` — crea snapshot limpio brief.v{N}.md preservando hallazgos como historial.

## Cuando usar

Use este comando cuando la idea de feature/producto requiere modelado antes de codigo. Senales:

- Toca >2 modulos del sistema.
- >3 actores distintos en el flujo.
- Meta menciona "nuevo proceso" o "integracion con".
- Usuario duda en preguntas de UX/datos clave.
- Descripcion menciona "como X pero adaptado".

Si la idea es estable y acotada (bug fix, ajuste focal, refactor), use `/alfred iniciar` directamente.

## Modos

### Modo inicial

**Fuente unica de la topologia del flujo.** Esta seccion, mas la tarjeta de cada step, define
quien conduce, que steps existen y en que orden. Cualquier otro archivo que lo describa es un
puntero a aqui.

Activado por `/disenar iniciar "{descripcion}"`. **Ocho steps numerados** (step-01 y step-03
a step-09) mas el condicional step-03b. Son de Mary salvo los anotados:

- **step-01 — FOCO** (**Winston [CM]**: lazo de cinco mociones contra el codebase que produce
  `modelo.yml` con nodos y aristas tipados -- cita, prosa anclada o ninguna de las dos segun
  el tipo (ver `agent-os/templates/diseno/schema/modelo.md`) --, y el encuadre
  `intent`/`out_of_scope` que Mary confirma en la mocion 5). EL PUNTO DE PARTIDA.
- **step-03 — pre-diseño de persistencia** (**Dexter [MD]**: E/R + diccionario + matriz CRUD
  en datos.md). EL CIMIENTO.
- **step-03b — pre-diseño criptografico** (condicional; **Cipher [MC]**: inventario +
  decisiones + custodia de llaves en criptografia.md. Solo si el diseño tiene dimension
  criptografica).
- **step-04 — procesos-y-contratos** (loop por proceso; Dexter freno si toca datos, Cipher freno si toca cripto).
- **step-05 — pipeline** (diagrama integrador).
- **step-06 — fragmentacion** (¿el diseño se parte en N works verticales? gate anti-capa).
- **step-07 — modelado** (loop por proceso: mockup UI, flujo, escenarios; el ER vive en datos.md; freno de Dexter/Cipher si un escenario revela algo no modelado).
- **step-08 — brief** (consolidar todo; Dexter y Cipher sello anti-evasion antes de red-team).
- **step-09 — handoff** (gate de cierre; verifica persistencia_resuelta y confianza_resuelta; anuncia works del plan).

**El hueco en el 02 es deliberado.** El FOCO absorbio lo que el frente anterior repartia
entre intencion (step-01) y contexto (step-02): escanear el codebase y fijar el encuadre son
el mismo lazo, no dos etapas. Los numeros del 03 al 09 no se corrieron para que los diseños
en vuelo y las citas del corpus sigan resolviendo.

Cada etapa del regimen `modelo` instancia el molde de `ciclo-de-etapa.md`: parte del grafo,
emite por lote, valida su cobertura, genera su prosa desde el modelo, y ofrece el regreso
cuando lo que descubre toca una etapa anterior.

**Regimen `lineal`.** Los diseños creados antes de que el modelo existiera (`flujo: lineal` o
ausente en su README) corren el frente anterior, que sigue vivo en `lineal/step-01-intencion.md`
y `lineal/step-02-contexto.md`. Reanudan y retroceden por ahi; para cerrar una etapa nueva
reconstruyen su modelo primero (ver `reconstruir.md`).

Cada step termina con menu P/C. Solo `C` avanza al siguiente.

### El ciclo investigativo (principio rector)

La fuente de verdad es el codebase y la DB, luego el usuario. `/disenar` concentra
la fuerza investigativa asi:

1. **el modelo (step-01, FOCO)** — las 5 preguntas del aterrizaje respondidas en nodos del
   modelo: que / como / que-existe-reutilizable-o-mejorable / como-conecta / como-accede.
   Gate bloqueante: el FOCO no cierra sin las cuatro condiciones de cierre -- cita, prosa
   anclada o ninguna de las dos segun el tipo de nodo; el detalle vive en
   `modo-inicial/step-01-foco.md` seccion "Las cuatro condiciones de cierre".
2. **tecnica/party con anchor (step-01..08)** — toda tecnica voluntaria declara su anchor en
   el codebase antes de invocarse; las dos bloqueantes (TR-10 en el FOCO, TR-02 en step-08)
   lo tienen implicito por diseño (ver advanced-elicitation "Gate de anchor en evidencia").
   **Ningun step ofrece tecnica al cerrar:** se invoca cuando hay senal concreta que la
   justifique, o cuando su gatillo bloqueante se dispara. Lo que el menu de cierre ofrece es
   `P` (invitar experto), con su propio anchor declarado.
3. **loop de validacion de hallazgos** — los hallazgos de la tecnica vuelven al
   usuario con 4 caminos (ver host-protocol/references/loop-validacion-hallazgos.md).
4. **absorber lo aceptado** al artefacto correspondiente.

Adversariar sin codebase escaneado es opinion flotante. Specs:
`2026-06-02-disenar-fuerza-investigativa-design.md` (este ciclo) +
`2026-06-02-loop-validacion-hallazgos-adversariales-design.md` (paso 3).

### Modo retroceso

Activado por `/disenar reanudar {slug}` cuando hay hallazgos pendientes. Mary aplica step-r1..r5 por cada hallazgo. Ver `modo-retroceso/` para detalles.

## Dimension conversacional

Solo `minima`. `/disenar` no acepta `normal` ni `maxima` como nivel — diseñar requiere consulta. Si el usuario fuerza `maxima`, work registra `[OVERRIDE]` y Mary procede con menu P/C "telegrafico" pero igual consulta en gate de step-08.

## Anfitriones

Winston, con capacidad `CM`, conduce el **frente** (step-01, FOCO): construye el modelo del
diseño contra el codebase y convoca al dueño de cada dominio que el modelo señala. Capability
file en `agent-os/experts/bmad-agent-winston/references/construccion-modelo.md`.

Mary conserva los **steps 04 a 09** (procesos-y-contratos, pipeline, fragmentacion, modelado,
brief, handoff), entra en la mocion 5 del FOCO a confirmar o corregir el encuadre, y conduce
el modo retroceso completo. En el regimen `lineal` conduce tambien step-01 y step-02. Sus
capabilities son `[DI]` (modo inicial) y `[DRT]` (modo retroceso), con capability files
separados en `agent-os/experts/bmad-agent-mary/references/`:

- `disenar-modo-inicial.md` — `[DI]`.
- `disenar-modo-retroceso.md` — `[DRT]`.

Mary lee `SKILL.md` siempre + el reference correspondiente al contexto.

Dexter, con capability `[MD]`/`[GE]`, conduce step-03 (pre-diseño de persistencia) e interviene con freno en step-04/step-07. Capability files en `agent-os/experts/bmad-agent-dexter/references/`.

Cipher, con capability `[MC]`, conduce step-03b (pre-diseño criptografico, condicional) e interviene como dueno del dominio cripto en junturas de step-04/step-07. Capability files en `agent-os/experts/bmad-agent-cipher/references/`.

## Salida del comando

```
agent-os/disenos/{slug}/
├── README.md            (frontmatter: flujo, intent, out_of_scope, estado)
├── modelo.yml           (step-01, vivo; el modelo del diseño — nodos y aristas tipados: cita,
│                          prosa anclada o ninguna de las dos segun el tipo)
├── contexto.md          (step-01, ACOTADO: modulo huesped + tabla de drifts, solo si hubo contrastacion entre fuentes)
├── datos.md             (step-03, vivo; capa de datos protagonista)
├── criptografia.md      (step-03b, condicional; capa de confianza criptografica)
├── procesos/            (step-04)
│   ├── P1-{slug}.md
│   └── P2-{slug}.md
├── pipeline.md          (step-05)
├── fragmentacion.md     (step-06, solo si es_paraguas)
├── brief.md             (step-08, vivo)
├── hallazgos/           (vacia inicialmente; se puebla via retroceso)
└── bitacora.md
```

**`modelo.yml` es la fuente, y de el se proyectan dos vistas que NO estan en el arbol:**
`discovery` (las 5 preguntas del aterrizaje con evidencia) y `reglas-heredadas` (los nodos
`regla` heredados con su cita). Se piden cuando alguien quiere leerlas en prosa —
`agentos modelo proyectar --slug {slug} --vista {vista}` — y no se escriben a disco ni se
versionan: son derivado puro. Buscar un `discovery.md` en la carpeta de un diseño `modelo`
es buscar un archivo que nunca existio.
El `intent` vive en el frontmatter del README, no en un archivo aparte.

**Regimen `lineal`:** los diseños previos al modelo tienen en cambio `intent.md`,
`contexto.md` completo, `discovery.md` y `reglas-heredadas.md` escritos a mano, y no tienen
`modelo.yml` hasta que reconstruyen.

## Estados del diseño

| Estado | Significado |
|--------|-------------|
| EN_DISENO | step-01 a step-09 en curso |
| BRIEF_LISTO | step-09 (handoff) aprobado, esperando consumidor |
| EN_USO | works consumidores activos sin hallazgos pendientes |
| EN_RETROCESO | hay hallazgos en pendiente_analisis o en_analisis |
| CERRADO | todos los works consumidores cerraron sin pendientes |
| OBSOLETO | reemplazado o abandonado via /disenar archivar |

`EN_USO` y `EN_RETROCESO` son mutuamente excluyentes. Cuando todos los hallazgos cierran (mitigado/aplicado o descartado), el estado vuelve a `EN_USO`.

## Marca de sesion (diseno_slug)

**FUENTE DE VERDAD de cuándo se escribe `diseno_slug`.** El esquema del archivo de sesión
vive en `agent-os/templates/work-record/schema/catalogos-y-sesion.md` sección "Control de
edicion por sesion".

Al **entrar a conducir un diseño** (iniciar, reanudar, modo retroceso), el anfitrion del
diseño — Winston al abrir el FOCO, Mary en el resto — escribe en
`agent-os/work-records/_sesiones/{session_id}.yml` la clave plana `diseno_slug: "{slug}"`
(refresca `actualizado`; crea el archivo si no existe, con el resto de campos en null y
`session_id` correcto). Al **salir** — handoff aprobado (step-09), archivar, pausar el
diseño o cambiar de foco a otra cosa — la devuelve a `diseno_slug: null`.

Efecto: los hooks del gobierno Alfred callan mientras la sesión conduce un diseño (los
mensajes en prosa pertenecen al hilo de Mary). El campo NO otorga permisos de edición de
código — deliberadamente no se usa `rol: anfitrion` para diseño.

## Ciclo git (checkpoints y colapso)

Un diseño que toca archivos del repo vive en una rama con worktree, igual que un work (ver
`agent-os/skills/bridge-session/references/ciclo-worktree.md`, fuente unica del ciclo). Cada
commit del diseño en esa rama — el cierre de un step (menu P/C en `C`), un
`agentos modelo emitir`, cualquier checkpoint intermedio — lleva el trailer `Diseno: {slug}`.
Sin el, el commit queda fuera de todo segmento y `worktree colapsar`/`worktree merge` lo
rechazan con `COMMIT_HUERFANO`.

<!-- FUENTE: agent-os/skills/cerrar-work-git/SKILL.md seccion "Reglas de git". El formato del
trailer vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

`agentos diseno transition` **no colapsa la unidad** (a diferencia de `work close`, que lo
hace solo). En step-09 (handoff), cuando el usuario aprueba y el diseño pasa a `BRIEF_LISTO`,
el diseño termina su tramo activo en la rama: el anfitrion invoca
`agentos worktree colapsar --slug {slug} --asunto "{resumen}"` justo despues de la
transicion, antes de que un work consumidor pueda sumarse a la misma rama con
`agentos worktree sumar` (que exige la unidad activa colapsada).

## Spec referenciada

El sistema dual `/disenar` + `/alfred` (brief modelado por procesos antes de tocar codigo) se diseño en una spec dedicada del repo fuente del sistema (no se distribuye a este proyecto).
