# Cruce y destinos

Reference de `agent-os/skills/destilar-sesion/SKILL.md`. Dos reglas mecanicas
que un agente necesita al cerrar cada afirmacion del corpus: a que `destino`
mapea el resultado del cruce, y como desempata el `tipo` cuando hay duda.

## Mapeo obligatorio de `cruce.estado` a `destino`

Sin este mapeo, un agente tiene que improvisar el destino de cada afirmacion.

**Para `autoridad: fuente`**, el destino depende del estado del cruce:

| `cruce.estado` | Destino |
|-----------------|---------|
| `confirma` | `doc` — se agrega procedencia de negocio a lo ya documentado |
| `agrega` | `doc` — seccion nueva; si el tipo afirma capacidad o regla, exige descenso a codigo y `codigo_confirma: si` |
| `matiza` | `doc` — se precisa la redaccion existente |
| `contradice-fuerte` | `pregunta` hasta que G2 decida; luego `doc` o `hallazgo` segun los tres desenlaces del escalamiento |
| `sin-cruce` | `doc` si el tipo no afirma capacidad ni regla; si la afirma, el descenso a codigo obliga a resolver antes de asignar destino |

**Para `autoridad: receptor`, el estado del cruce es irrelevante**: el destino
es siempre `hallazgo`, con una unica excepcion — una afirmacion de cubeta
`modelo-trabajo-cliente` promovida en G2, que va a `doc` con `decision_g2` y
`seccion_destino` bajo el marcador de contexto de cliente
(`<!-- agent-os:contexto-cliente sesion=... -->`).

Las cubetas `solicitud`, `falsa-afirmacion` y `comparacion-otro-sistema` **no
son promovibles por ninguna via**. Un receptor no confirma, no agrega y no
contradice nada sobre el sistema; cruzar sus afirmaciones contra la
documentacion produciria estados que sugieren autoridad que no tiene. Por eso
el cruce **nunca se intenta** para afirmaciones de receptor — no se calcula y
se descarta, simplemente no se calcula — y `cruce.estado` queda en
`sin-cruce`.

Una afirmacion promovida tampoco colisiona con la invariante de tipos: un
receptor no puede producir `capacidad-sistema` ni `regla-negocio`. Una pieza
de `modelo-trabajo-cliente` es `flujo-operativo` o `vocabulario` — describe
como opera la IPS, no que hace el sistema ni que regla lo gobierna.

Toda afirmacion de `tipo: ambiguo` va a `pregunta`, cualquiera sea su
autoridad o cruce.

## Regla de desempate al clasificar el tipo

**Para `autoridad: fuente`:** si hay duda entre `capacidad-sistema` /
`regla-negocio` y `flujo-operativo` / `vocabulario`, se clasifica como
**capacidad o regla**. El error cuesta un descenso al codigo de mas; el error
inverso deja pasar una capacidad falsa sin verificar. La clasificacion falla
hacia el lado caro, nunca hacia el lado ciego.

**Para `autoridad: receptor`** la regla no aplica: la invariante de tipos
prohibe `capacidad-sistema` y `regla-negocio`, y ambas instrucciones no
podrian cumplirse a la vez. Ahi el desempate es otro: **si un receptor parece
estar afirmando una capacidad del sistema, esa apariencia es justamente la
senal de que se trata de una `solicitud` o una `falsa-afirmacion`**, y se
tipifica en la cubeta correspondiente. Si no se puede determinar cual, se
clasifica `ambiguo` y va a `pregunta`.
