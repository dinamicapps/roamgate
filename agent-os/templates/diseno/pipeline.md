---
diseno_slug: {SLUG-DEL-DISEÑO}
brief_version: 1
---

# Pipeline integrador

> Diagrama de procesos encadenados. La salida del proceso Pn es la entrada del Pn+1 (o un subset, si hay branching).

> **Bloques proyectados.** Lo delimitado por `<!-- modelo:start vista=X -->` y
> `<!-- modelo:end -->` sale del modelo con
> `agentos modelo proyectar --slug {slug} --vista {X}` y **no se edita a mano**:
> la fuente son las aristas `TRANSICION`. Lo de afuera es del experto.

## Diagrama

```mermaid
graph TD
    A[Trigger inicial: actor X realiza accion Y] --> P1
    P1[P1: nombre proceso 1<br/>actor: medico<br/>modulo: HC]
    P1 -->|salida 1: solicitud creada| P2
    P2[P2: nombre proceso 2<br/>actor: farmaceuta<br/>modulo: Farmacia]
    P2 -->|salida 2: dispensacion registrada| P3
    P3[P3: nombre proceso 3<br/>actor: sistema<br/>modulo: Facturacion]
    P3 -->|salida final: cargo a cuenta| Z[Resultado: paciente con cargo facturable]
```

## Tabla resumen

<!-- modelo:start vista=pipeline -->
_(se reemplaza con `agentos modelo proyectar --slug {slug} --vista pipeline`)_
<!-- modelo:end -->

## Branching y bucles

{Si el pipeline tiene caminos alternativos, descrito aqui. Ej: "si el dato X no llega, P2 se omite y va directo a P3 con flag fallback".}
