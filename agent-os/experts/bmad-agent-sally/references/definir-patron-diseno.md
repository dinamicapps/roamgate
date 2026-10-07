---
name: definir-patron-diseno
description: Faceta de LE/RD — detectar si existe un patrón claro para la pieza en rediseño; si no, definirlo con el usuario antes de iterar.
menu-code: LE/RD
---

# Definir patrón de diseño con el usuario

> **Voz Sally:** Antes de tocar un pixel, necesito saber qué tipo de pieza
> estamos tratando y cómo se espera que se comporte. No porque sea burocracia —
> sino porque el sistema ya tomó decisiones por nosotros, y si las ignoramos
> vamos a reinventar algo que ya estaba resuelto. "Patterns before pixels" no
> es un eslogan: es lo que evita que la décima vista del módulo se comporte
> distinto a las nueve anteriores.

Faceta de las capacidades `LE` y `RD`. Se ejecuta en la **fase 1** de la ruta
`rediseno-ui` —  justo después de capturar el estado actual y antes de entrar
en ideación — para dejar escrito el patrón de interacción que todas las
iteraciones deben respetar.

## Propósito

Detectar si existe un patrón establecido para el tipo de pieza que se está
rediseñando (tablero, formulario, wizard, modal, listado). Si el patrón existe
en el catálogo, se confirma con el usuario y se convierte en el contrato de la
iteración. Si no existe o es ambiguo, se define con el usuario en el momento y
se propone para agregarlo al catálogo — de modo que la próxima vista del mismo
tipo no empiece desde cero.

El resultado de este paso no es un wireframe: es una declaración escrita del
patrón acordado, incluyendo los estados que deben estar diseñados y los
componentes `nv-*` que lo realizan. Sin esa declaración, la iteración no
empieza.

## Procedimiento

### Paso a — Identificar el tipo de pieza

Antes de buscar en el catálogo, clasifica la pieza con el usuario. Los tipos
del catálogo son:

- **Tablero** — grid navegable con filtros y acciones en masa.
- **Formulario** — captura o edición de un registro con validación del cliente.
- **Wizard** — proceso multi-paso con persistencia parcial entre pasos.
- **Modal** — confirmación o edición acotada sobre un registro ya seleccionado.
- **Listado** — variante ligera del tablero: registros paginados sin filtros
  complejos, típicamente anidado en otra vista.

Si la pieza combina tipos (por ejemplo, un tablero que abre un modal de edición),
identifica el tipo primario y los tipos secundarios por separado.

### Paso b — Buscar el patrón en el catálogo

Consulta `agent-os/standards/frontend/catalogo-patrones-frontend.md`.
Para cada tipo identificado:

1. Lee la sección correspondiente al tipo de pieza.
2. Extrae: componentes `nv-*` que lo realizan, contrato de datos típico, y
   tabla de estados que deben estar diseñados.
3. Revisa la tabla de antipatrones al final del catálogo — si la pieza actual
   cae en uno de ellos, anótalo como hallazgo explícito para esta fase.

Si el catálogo no cubre el tipo o la combinación que tienes enfrente, continúa
al Paso d.

### Paso c — Si el patrón existe: confirmarlo con el usuario

Presenta el patrón encontrado con concisión:

```
El catálogo define el patrón [tipo] con los siguientes componentes: [lista].
Los estados que necesitan diseño son: [tabla de estados].

¿Este patrón aplica a la vista que estamos rediseñando, o hay algo que lo
diferencia que deba quedar declarado?

Opciones:
  - Sí, aplicar el patrón tal cual
  - Aplicar con ajuste (descríbelo y lo anoto como variante)
  - No aplica — definir patrón nuevo (paso d)
```

Si el usuario elige "Aplicar tal cual" o "Aplicar con ajuste", escribe en el
artefacto de la fase (típicamente `etapa-1/01-patron-diseno.md`) el patrón
acordado con sus componentes, estados y la variante si la hay.

### Paso d — Si no existe o es ambiguo: definir el patrón con el usuario

Este paso construye el patrón desde cero con el usuario, sin asumir la
interpretación obvia. Las preguntas que guían el intercambio:

- ¿Qué estados necesita tener esta pieza? (cargando, vacío, error, éxito,
  estado intermedio si aplica)
- ¿Qué componentes `nv-*` pueden realizarlo, o qué se necesita construir?
- ¿Qué contrato de datos espera del backend? (¿trae toda la lista o pagina?
  ¿quién decide el filtro?)
- ¿Hay una vista hermana en el módulo que ya resolvió algo similar?

Documenta el patrón acordado en `etapa-1/01-patron-diseno.md` con la misma
estructura que usa el catálogo (componentes, contrato de datos típico, tabla
de estados).

Al terminar, propone agregarlo al catálogo usando el procedimiento de
`documentar-standard-frontend.md`. La propuesta es una sugerencia — el usuario
decide si persiste formalmente. Lo que sí persiste siempre es la declaración
local en el artefacto de la fase.

## Anti-patrón

**Cada vista reinventa su interacción.** El síntoma: el décimo formulario del
módulo maneja el estado de "guardando" de manera distinta a los nueve anteriores
— a veces spinner inline, a veces botón deshabilitado, a veces ninguno. El
usuario aprende la excepción en vez de internalizar el sistema.

**Aceptar "lo resuelvo y luego vemos" sin patrón declarado.** La promesa de
definirlo después casi nunca se cumple: la iteración avanza, el prototipo se
aprueba, y el patrón no escrito se convierte en el patrón real — con todos
sus huecos. Una vez que el usuario vio y aprobó el prototipo, cambiar la
interacción de base cuesta más que haberla declarado antes.

Ambos anti-patrones son la negación del principio **"Patterns before pixels"**
de Sally: establecer la consistencia de interacción antes de preocuparse por
el pulido visual. Un sistema predecible con estilo sobrio supera a uno hermoso
pero inconsistente. Siempre.
