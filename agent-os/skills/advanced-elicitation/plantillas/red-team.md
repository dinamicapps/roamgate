# Plantilla: Red team vs Blue team (TR-02)

## Contexto

El brief es la posicion oficial. El red team ataca buscando superficie no cubierta. El blue team defiende con argumentos del brief actual. Las rondas son tres y son **dimensiones**, no iteraciones: funcional, tecnica y regulatoria. Las tres se recorren. Lo que no tiene numero es la **profundidad dentro de cada una**: una ronda se cierra cuando el red team deja de encontrar superficie nueva en esa dimension, no al llenar una cuota de items. Antes de empezar, el red team declara el denominador: sobre cuantos procesos/entidades/contratos del grafo opera, y cual es el criterio de seleccion si no son todos.

## Pasos

**Ronda 1 — Superficie funcional**

- Red team: lista los escenarios funcionales que el brief NO cubre (no son edge cases — son flujos legitimos olvidados), declarando sobre cuantos candidatos busco. Una lista corta sobre denominador declarado informa; una lista de tamano fijo sobre denominador desconocido simula cobertura.
- Blue team: para cada uno, ¿el brief lo cubre implicitamente? ¿lo deriva de algun proceso? ¿es out_of_scope explicito?
- Decision: cubierto / añadir al brief / aceptar como out_of_scope.

**Ronda 2 — Superficie tecnica**

- Red team: lista las invariantes tecnicas que el brief asume sin declarar (concurrencia, idempotencia, ordering, transacciones), diciendo cuantas reviso y sobre que parte del grafo.
- Blue team: para cada una, ¿el brief lo declara? ¿lo deriva del modulo huesped?
- Decision: declarar invariante en el contrato del proceso / aceptar riesgo / out_of_scope.

**Ronda 3 — Superficie regulatoria**

- Red team: lista las regulaciones del dominio que podrian aplicar, diciendo contra que catalogo o fuente las contrasto.
- Blue team: para cada una, ¿el brief la cubre? ¿requiere consulta a Sentinel o experto compliance?
- Decision: invitar experto / aceptar / out_of_scope.

## Salida esperada

Bloque anexado al brief:

```
## Red team review

### Ronda 1 — Funcional
- [Cubierto] {escenario 1} → cubierto por proceso P{n} regla R{m}
- [Añadir] {escenario 2} → propuesta: nuevo proceso P{n+1} en ...
- [Out of scope] {escenario 3} → razon: ...

### Ronda 2 — Tecnica
...

### Ronda 3 — Regulatoria
...
```
