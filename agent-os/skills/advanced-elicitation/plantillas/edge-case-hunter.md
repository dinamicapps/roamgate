# TR-08 Edge case hunter

> Tecnica de validacion. Busca valores extremos por cada dato declarado, y comprueba que el
> artefacto diga que pasa con ellos.

## Por que dejo de ser aspiracional

Esta tecnica pedia "5 valores extremos por dato de entrada" sin que existiera una lista de
datos de entrada. "Por cada dato" era una intencion, y lo que quedaba era que el anfitrion
recordara cuales habia. Con el modelo, los datos estan declarados como campos tipados: el
barrido es sobre una lista real, y el resultado es contable.

## Insumos

- **Grafo (obligatorio si la etapa emite):** los campos que declaran datos. Segun la etapa:
  - **Columnas de las entidades:** `agentos modelo proyectar --slug {slug} --vista datos`.
  - **Entradas y salidas de un proceso:** `agentos modelo proyectar --slug {slug} --vista
    contrato --proceso {id}`.
  - **Transiciones (step-05) y fronteras de works (step-06):** todavia no hay vista
    dedicada — se leen del `modelo.yml` directo.
- **Prosa de la etapa:** el artefacto vigente, que es donde debe estar escrito el
  comportamiento esperado.
- **Hilo previo:** si el usuario ya decidio algo sobre un extremo, no se vuelve a preguntar.

Si la etapa no emite al modelo, declararlo y barrer sobre lo que la prosa enumere.

## Procedimiento

1. **Listar los datos** desde el grafo. Nombrar cuantos son: el numero es el denominador de
   la cobertura.
2. **Por cada dato, cinco extremos**: vacio/nulo, maximo, negativo o invertido, unicode o
   caracteres fuera del alfabeto esperado, y dependiente (un valor que solo es valido en
   funcion de otro).
3. **Por cada extremo, buscar en la prosa** si el comportamiento esperado esta declarado.
   Tres veredictos: `cubierto`, `no cubierto`, `parcial`.
4. **No inventar el comportamiento correcto.** Un extremo no cubierto es un hallazgo, y lo
   resuelve el usuario por el loop, no la tecnica.

## Salida

    Insumos: {grafo | sin grafo (razon)} + prosa + hilo previo.
    Datos barridos: {N}. Extremos evaluados: {N*5}.

    | dato | extremo | comportamiento esperado | veredicto |
    |---|---|---|---|
    | ... | ... | ... | cubierto / no cubierto / parcial |

    No cubiertos: {M}. {Lista de los que exigen decision del usuario.}

## Despues

Los hallazgos **no se anexan solos** al artefacto: pasan por el loop de validacion de
hallazgos, y solo lo que el usuario acepta se anexa.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Los 4 caminos". Aqui solo se indica que la salida de esta tecnica pasa por el loop. NO duplicar la regla — para modificar, editar la fuente. -->
