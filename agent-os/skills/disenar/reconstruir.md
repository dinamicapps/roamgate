# Reconstruir el modelo de un diseño `lineal`

> Tarjeta de salida para los diseños en vuelo. Anfitrion **Winston**, capacidad `CM`.
> No repite el procedimiento del FOCO: lo corre.

<!-- FUENTE: agent-os/skills/disenar/modo-inicial/step-01-foco.md seccion "El lazo — las cinco mociones". Las cinco mociones, la emision por lote y las cuatro condiciones de cierre viven alli. Aqui solo se declara cuando la reconstruccion se dispara, que no rehace y como cierra. NO duplicar el procedimiento — para modificar, editar la fuente. -->

## Que es

El lazo del FOCO corrido sobre un diseño que **ya existe**, para que gane el modelo que le
falta y pueda seguir avanzando.

Un diseño con `flujo: lineal` (o sin el campo) se hizo con el frente anterior: intencion y
contexto en prosa, sin `modelo.yml` debajo. Ese diseño no queda atrapado — reanuda y
retrocede como siempre. Lo que no puede es **cerrar una etapa nueva** sin el modelo que las
etapas nuevas validan.

## Que NO es

**No es transcribir la prosa existente a nodos.** Eso seria la transcripcion a mano que este
rediseño ataca, con un paso mas.

Los artefactos que el diseño ya tiene — `intent.md`, `contexto.md`, `discovery.md`,
`reglas-heredadas.md`, los contratos de `procesos/`, `datos.md` — entran como **una fuente
mas**, sujeta a la jerarquia de fuente de verdad donde el **codigo deployado gana sobre la
prosa**. Cada nodo nace bajo la misma regla que en un diseño nuevo: cita, prosa anclada o
ninguna de las dos, segun lo que su tipo exige
(`agent-os/templates/diseno/schema/modelo.md`).

Lo que la prosa aporta es **cobertura y velocidad, no autoridad**: dice donde mirar y que ya
se penso, no que sea cierto. Una afirmacion de la prosa que el codigo contradice se resuelve
como cualquier divergencia del FOCO — con la cita real y un nodo `decision` que registra la
divergencia, decidida por el humano.

## Cuando se dispara

Cuando un diseño `lineal` intenta **cerrar una etapa nueva**. Reanudar y retroceder no lo
exigen: se puede volver al diseño, leer lo que habia y procesar hallazgos sin reconstruir
nada.

El gate vive en el comando `/disenar reanudar`, seccion "Gate de reconstruccion".

## Como corre

Anfitrion **Winston** con `CM`. **Mismas cinco mociones y mismas cuatro condiciones de
cierre** que la tarjeta del FOCO — es la misma maquinaria, sobre un diseño que ya tiene
material. Winston lee `modo-inicial/step-01-foco.md` completo y lo ejecuta, con dos
diferencias de arranque:

1. **El diseño ya existe.** No se crea la estructura ni el README: se siembra el
   `modelo.yml` si falta, desde `agent-os/templates/diseno/modelo.yml`, y se abre una entrada
   de bitacora que declara que empieza la reconstruccion.
2. **Los artefactos existentes se leen en la mocion 1**, junto con el codebase, y se declaran
   como fuente en la tabla de contrastacion cuando se solapan con el (bloqueante 1 del FOCO).

`modelo emitir` es el unico camino de escritura del modelo, igual que en un diseño nuevo.

## Como se emite: un lote por etapa, no un lote unico

`Fusionar` sella la procedencia al NACER y jamas la sobrescribe. Un lote unico con
`--etapa foco` marcaria como decisiones de Winston lo que decidieron Dexter o Mary en
etapas que este diseno ya cerro — y despues el regreso llevaria el aprendizaje al experto
equivocado. Eso es peor que un nodo sin procedencia, del que el sistema si sabe defenderse:
lo declara y pregunta.

Por eso la reconstruccion emite **varios lotes, cada nodo con la etapa que le corresponde**:

| Que se emite | Con que etapa |
|---|---|
| nodos `entidad` y aristas `RELACIONA`, cuando la etapa de datos ya estaba cerrada | `--etapa datos` |
| nodos `proceso`, `endpoint`, las `regla` nuevas y sus aristas, cuando la etapa de procesos ya estaba cerrada | `--etapa procesos` |
| todo lo demas — capacidades, actores, restricciones, reglas heredadas, pantallas, y cualquier nodo de una etapa que el diseno aun no habia cerrado | `--etapa foco` |

El criterio es **que etapa lo decidio en el diseno original**, no de que artefacto se leyo.
Si el diseno se detuvo antes de cerrar datos, sus entidades son del FOCO y van en el lote
`foco`: no se les inventa una procedencia que nadie tuvo.

## Que no rehace

**Las etapas ya cerradas siguen cerradas.** Lo que se reconstruye es el modelo que les
faltaba debajo, no su contenido ni su aprobacion.

Si al reconstruir aparece algo que **contradice** una etapa ya cerrada, eso es un **hallazgo**
y va por el modo retroceso (`modo-retroceso/`), no por aqui. La reconstruccion no reabre
etapas: las describe.

## Al cerrar

Cumplidas las cuatro condiciones de cierre del FOCO:

```bash
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "README.md",
  "frontmatter": { "flujo": "modelo" }
}' | agentos diseno file set-fm
```

El diseño **continua por donde iba**: la etapa que quiso cerrar cuando se disparo el gate
ahora puede cerrar, y de ahi en adelante es un diseño de regimen `modelo` como cualquier
otro. Con una salvedad: si el diseño estaba detenido en step-01 o step-02, el FOCO los
**sustituye** —es exactamente lo que esos dos hacian— y el diseño continua en step-03. El
ruteo exacto lo declara el gate.
