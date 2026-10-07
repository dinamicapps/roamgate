---
name: graphviz-vistas
description: Gramatica visual y catalogo de vistas del modelo de diseño (DOT/Graphviz)
menu-code: GV
---

# Gramatica visual del modelo de diseño

Fuente canonica de COMO se ve el modelo. El runtime la implementa: si esta
gramatica cambia, esa implementacion cambia.
Mermaid (capacidad MG) sigue siendo mio para todo lo demas: aqui mando DOT
porque el modelo crece y mermaid no sostiene volumen ni clusters.

## Forma y color por tipo de nodo

| Tipo | shape | fillcolor |
|---|---|---|
| capacidad | box3d | #e8f0fe |
| proceso | box | #e8f0fe |
| actor | ellipse | #fff3cd |
| entidad | cylinder | #d4edda |
| regla | hexagon | #e2d9f3 |
| restriccion | octagon | #e2d9f3 |
| pantalla | note | #ffe5d0 |
| endpoint | component | #d1ecf1 |
| escenario | parallelogram | #f0f0f0 |
| pregunta | diamond | #cfe2ff |
| hallazgo | invtriangle | #f8d7da |
| decision | diamond | #fff3cd |
| riesgo | invhouse | #f8d7da |
| operacion_cripto | doubleoctagon | #f5d0d0 |
| llave | invhouse | #f5e0c0 |
| work | *cluster*, no nodo | borde #666666, style rounded |

**Esta tabla es la fuente y el runtime la implementa.** El contrato tiene dos
lados: aqui se declara que forma, que color, que vistas y que motores existen, y
el runtime los aplica al proyectar. Nadie dibuja el grafo a mano ni retoca un
color en la salida. Para cambiar la gramatica se cambia esta tabla y se reporta
al mantenedor del sistema, que la lleva a la implementacion; un tipo de nodo
nuevo sin fila aqui no tiene tratamiento definido.

## Estado por color

| Estado | Tratamiento |
|---|---|
| abierto | fillcolor #dc3545, fontcolor white — **el hueco tiene que gritar** |
| resuelto | el color de su tipo |
| descartado | style dashed, fillcolor #eeeeee, fontcolor #888888 |
| obsoleto | style dotted, fillcolor #d6d8db, fontcolor #495057, penwidth 2, sufijo "(obsoleto)" en la etiqueta — **fue verdad y dejo de serlo**, distinto de descartado |

El estado gana sobre el tipo: un nodo abierto se ve rojo aunque sea una entidad.
Ver el hueco importa mas que saber de que tipo es.

## Aristas

| Arista | Estilo |
|---|---|
| TRANSICION | solida, label = el dato transferido |
| ACCEDE | punteada, label = C/R/U/D |
| INICIA, LLEGA_POR, REQUIERE | solida, label = el nombre de la relacion |
| DERIVA_DE, USA | solida gris |
| CONTIENE | no se dibuja: es la pertenencia al cluster |
| DEPENDE_DE | solida gruesa entre clusters |
| LIMITA, APLICA, RELACIONA, EXPONE | solida delgada |

## Catalogo de vistas

| Vista | Que incluye | Motor |
|---|---|---|
| `todo` | el modelo completo, works como clusters | dot |
| `datos` | entidades, sus relaciones y los procesos que las acceden | dot |
| `navegacion` | actores, pantallas, procesos y sus llegadas | dot |
| `works` | works y sus dependencias duras; procesos dentro de cada cluster | dot |
| `abiertos` | solo nodos abiertos y sus vecinos inmediatos | fdp |

**La escala se maneja filtrando, no con mejor layout.** Antes de proponer un
motor distinto, propongo una vista mas acotada.

## Enlace a la prosa

Todo nodo lleva `tooltip` con su tipo y su estado. El `href` se emite **solo
cuando el nodo declara donde vive su narrativa** (campo `prosa`): mientras el
anclaje prosa→nodo no exista, un enlace apuntaria a un ancla inexistente. Cuando
ese campo venga poblado, el SVG queda navegable y el modelo pasa a ser el indice
de la prosa.
