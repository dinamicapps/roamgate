# Despacho de expertos como subagentes

> **FUENTE UNICA.** Las tarjetas de etapa (`etapas/etapa-2.md`, `etapas/etapa-3.md`), el
> abordaje (`agent-os/experts/bmad-agent-alfred/abordaje/fase-2-recolectar.md`) y los
> expertos apuntan aqui. NO duplicar estas reglas — para modificar, editar este archivo.

## Por que existe

Un experto no es un sombrero que el agente principal se pone: es una **mente**. Cuando
Sentinel, Dexter y Winston "participan" dentro de la misma ventana de contexto, comparten
la misma atencion saturada y la misma memoria contaminada. El resultado observado es doble:
la doctrina se **diluye** (la tarjeta de etapa compite con todo lo anterior) y la revision
pierde **independencia** (quien revisa ya vio el razonamiento de quien produjo).

Despachar al experto como subagente le da lo que no tiene de otra forma: **una ventana
limpia que contiene su ADN y su mision, y nada mas.**

## Prompt de encarnacion

Un experto se materializa con `Agent` (`subagent_type: general-purpose`) y un prompt que
ordena, como PRIMER paso, leer su propio `SKILL.md`:

```
Encarna a {Experto} (agent-os/experts/bmad-agent-{experto}/SKILL.md).
Lee tu SKILL.md primero: es tu ADN. Si tu capacidad tiene reference propia
(references/{capacidad}.md), leela tambien.

MISION: {la mision concreta}
REGLAS: {las reglas de la clase — ver "Las dos clases"}
DEVUELVE: {el contrato de retorno de la clase}
```

**Por que asi y no con agent types nativos:** el `SKILL.md` sigue siendo la **unica fuente**
del ADN. Generar un agente por experto duplicaria el ADN en dos lugares y exigiria un
regenerador determinista para evitar drift. El subagente **lee** su tarjeta; no hay copia,
asi que no hay drift posible.

## Las dos clases

|  | **Consultor** | **Ejecutor** |
|---|---|---|
| Escribe | nada (solo lectura) | **solo codigo** |
| Paralelo | si, N a la vez | si, bajo las reglas de "Orquestacion" |
| Devuelve | bloque `I-{Experto}:` con citas `path:linea` | ver "Contrato del ejecutor" |
| Se usa en | abordaje Fase 2, frentes de investigacion (E3), invitados de E3, gate `[RI]` de E2 | tareas de E3 |

El **consultor** no toma decisiones de implementacion: lee, audita, cita y reporta. Por eso
no tiene gate de autonomia — es seguro en cualquier `nivel`.

**A quien encarna cada clase.** El **consultor** encarna al **dueno del dominio** de la
pregunta (Sentinel para auth, Dexter para persistencia, Winston para arquitectura...); el
catalogo de dominios vive en `agent-os/experts/_registry.yml`. El **ejecutor** encarna al
**anfitrion que lo despacha** —Amelia despacha subagentes-Amelia; Atlas, subagentes-Atlas—
salvo que la tarea tenga senal de dominio que justifique a otro experto (y entonces el
anfitrion la nombra explicitamente en el prompt de encarnacion).

## Contrato del ejecutor

**El subagente ejecutor escribe codigo. Nada mas.**

- **No commitea.** Dos subagentes escribiendo el mismo indice de git lo corrompen.
- **No escribe la bitacora.** Dos escritores concurrentes sobre el mismo archivo se pisan.
- **No cierra su tarea.** El verbo de cierre lo invoca el anfitrion.
- **No ejecuta el sistema.** No compila, no levanta servidores, no corre la suite: **no invoca
  `run-system`**. Ese skill aprende del usuario cuando el comando no esta poblado y escribe
  `test-env.local.json` — dos cosas que un subagente no puede hacer.

**Escribe el codigo Y sus tests, pero no los ve correr.** Quien corre la suite es el
**anfitrion**, al recibir el bloque. Si sale **roja**, el anfitrion **re-despacha al mismo
ejecutor con el output del fallo** hasta que pasa o el ejecutor escala.

**Consecuencia declarada (no la escondemos):** el ejecutor no vive el ciclo rojo→verde dentro
de su ventana. **El ciclo TDD se mueve un nivel arriba: lo cierra el anfitrion con la suite
real.** El precio se paga a cambio de que `run-system` —que conversa con el usuario y persiste
config— nunca viva dentro de un subagente.

**Instrumenta los logs temporales.** Instrumentar es parte de escribir codigo, y el codigo lo
escribe el ejecutor: pone los marcadores (`#region WORK-DEBUG-LOG` / `#region
SENTINEL-SECURITY-LOG`) y **devuelve la lista** en `logs_instrumentados`, con la **misma forma**
que exige el frontmatter (`archivo`, `marcador`, `cantidad_regiones`) — el ejecutor es quien
instrumento y sabe exactamente que marcador uso y cuantas regiones abrio. Quien la **persiste**
en el frontmatter de la tarea (`logs_temporales_instrumentados`) es el anfitrion, **tal cual**
la recibe, sin re-derivar marcador ni conteo por grep — el subagente no toca el work-record.
<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-3/instrumentacion-logs.md. Que instrumentar, el formato de las regiones y cuando NO instrumentar viven alli. Aqui solo quien lo hace y como se devuelve. NO duplicar la regla — para modificar, editar la fuente. -->

Devuelve al anfitrion:

```yaml
estado: completado | escalado
archivos_reales:                 # los que REALMENTE toco (no los que le dijeron)
  - ruta: "src/Controllers/PagoController.cs"
    accion: "modificar"
logs_instrumentados:             # regiones de log temporal, forma identica al frontmatter (vacio si no aplica)
  - archivo: "src/Controllers/PagoController.cs"
    marcador: "WORK-DEBUG-LOG"
    cantidad_regiones: 1
bloque_ejecutor: |               # el cuerpo del bloque `## Ejecutor:` de la tarea
  ### Que hizo
  - {bullet, max 2 lineas}
  ### Hallazgos
  | ... |
pregunta: null                   # poblado SOLO si estado: escalado
```

El **anfitrion** —que es uno solo— recibe esto y entonces si: corre la suite via `run-system`,
commitea, escribe la bitacora, persiste `logs_temporales_instrumentados` en el frontmatter de
la tarea y la cierra con el verbo del runtime.

**Consecuencia:** la unica escritura concurrente que existe en el sistema es sobre archivos
de codigo. De eso protege la declaracion de `archivos`.

## Orquestacion

**Exclusiva del anfitrion.** Ningun subagente despacha a otro subagente.

El anfitrion despacha en **paralelo** las tareas que cumplen **ambas** condiciones:

1. `depende_de` **satisfecho** — todas sus predecesoras estan cerradas, y
2. **sin solape de `archivos`** — no comparte ninguna `ruta` con otra tarea del mismo lote.

El resto va **secuencial**.

Las dos condiciones son garantias **distintas y ambas necesarias**: `depende_de` da el
**orden**; `archivos` da la **exclusion mutua**. Dos tareas pueden no depender una de otra y
aun asi tocar el mismo controller.

**Fallback fail-safe: la ausencia de dato NO es una garantia.** Una tarea que **no declara
`archivos`** va **SECUENCIAL** — nunca entra a un lote paralelo. La condicion 2 se evalua
sobre datos **presentes**: si el campo falta, la condicion **no se cumple**; no se cumple
"vaciamente" por no haber ruta que solape. Una tarea sin `archivos` no es una tarea disjunta:
es una tarea **sin garantia de exclusion mutua**, y el sistema trata la falta de garantia como
riesgo, no como permiso. El campo es opcional por compatibilidad con works previos — el precio
de omitirlo es **perder el paralelismo**, jamas arriesgar el pisado. Basta con que UNA tarea
del lote candidato no declare `archivos` para que esa tarea salga del lote (las demas, que si
lo declaran y no solapan entre si, pueden seguir en paralelo).

### Verificacion posterior: la prediccion no se cree, se comprueba

`archivos` lo declaro quien planeo, **sin haber tocado el codigo**. Por eso el ejecutor
devuelve `archivos_reales`. Al recibirlos, el anfitrion compara:

- **Coinciden** → sigue.
- **Divergen** → es una **senal de drift**, no un error. El anfitrion la procesa con el arbol
  de reevaluacion. Si ademas el archivo no declarado esta declarado por OTRA tarea del lote
  paralelo, hay riesgo de pisado: el anfitrion detiene el lote y reevalua.

## Contrato de escape

Un subagente **no puede hablar con el usuario**: no tiene `AskUserQuestion` frente a el.

Cuando el ejecutor topa con algo que excede su mandato, **no decide**: devuelve
`estado: escalado` con la **pregunta exacta**. El anfitrion —que si tiene la atencion del
usuario— pregunta, y re-despacha con la respuesta.

Disparadores de `escalado`:

- cambio de scope,
- ambiguedad de meta,
- comando destructivo,
- bloqueo tecnico real,
- **senal #10 de drift** — aparece un endpoint nuevo o un metodo con efecto CRUD persistente
  que NO esta declarado en el bloque `capa_seguridad` de la tarea. El ejecutor **no lo
  resuelve** dentro de su ventana: quien decide (consultar al usuario o registrar `[AUTO]`
  segun `nivel`, con Sentinel validando) es el anfitrion.
  <!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-3.md seccion "Senales a detectar por modo". La doctrina de la senal #10 y su resolucion por nivel viven alli. Aqui solo se declara que, bajo despacho, quien la ve es el subagente y por eso escala. NO duplicar la regla — para modificar, editar la fuente. -->

## Gate por nivel

En `nivel: minima` el anfitrion debe consultar cada decision intermedia de implementacion.
Un subagente no puede consultar. Despachar un ejecutor ahi **romperia la perilla en
silencio**: el usuario creeria que controla y no controlaria. Eso viola el principio 8 del
MANIFIESTO (Honestidad Epistemica).

| `nivel` | Ejecucion de E3 |
|---|---|
| `minima` | **En la sesion principal.** Sin subagentes ejecutores. Quien pide maxima supervision acepta maxima carga de contexto. |
| `normal` | Subagentes ejecutores, orquestados. |
| `maxima` | Subagentes ejecutores, orquestados. |

Los subagentes **consultores** NO tienen este gate: son de solo lectura y no toman decisiones
de implementacion. Corren en los tres niveles.

## Que NO es esto

Despachar un subagente **no** es un workaround para un anfitrion que no puede editar.
<!-- FUENTE: agent-os/skills/host-protocol/references/fases-de-conduccion.md seccion "Anti-patron del despacho como workaround". La distincion completa entre despacho-como-diseno y despacho-como-workaround vive alli. NO duplicar la regla — para modificar, editar la fuente. -->
