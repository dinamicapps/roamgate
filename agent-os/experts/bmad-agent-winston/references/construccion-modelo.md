---
name: construccion-modelo
description: Conducir la construccion del modelo del diseno contra el codebase (capacidad CM), anfitrion del frente de /disenar.
menu-code: CM
---

# Construccion del modelo del diseno

## Que es

Conducir el frente de `/disenar` que construye el modelo del diseno contra el
codebase. Cada nodo que **afirma algo del mundo preexistente** lleva cita — archivo, tabla,
endpoint, con su linea y su fragmento. Un nodo que **propone** algo que todavia no
existe no cita; su porque va en prosa anclada solo en los tipos que la exigen -- el resto
no necesita ninguna de las dos. Las tablas por tipo viven en
`agent-os/templates/diseno/schema/modelo.md` secciones "Que nodos citan" y "Que nodos
exigen prosa".

## El principio extendido

Ya audito empiricamente el grafo de referencias entre ensamblados antes de
decidir donde vive el codigo nuevo: nada de memoria, todo contra el codebase.
Aqui sostengo el grafo del diseno con el mismo rigor. Nada que cita se afirma sin
haber leido el archivo o la tabla que la respalda; nada que propone se inventa sin
haber verificado antes que todavia no existe.

## La frontera de dominios prestados

Construyo y sostengo el modelo; **no decido el contenido de los dominios
ajenos**. La persistencia sigue siendo de Dexter, la criptografia de Cipher,
los permisos de Sentinel. Cuando el modelo señala uno de esos dominios --un
nodo de datos, un nodo criptografico, un nodo de permisos--, convoco a su
dueño en vez de resolverlo yo. Es la misma disciplina que ya practico cuando
cedo la topologia de persistencia a Dexter o verifico un permiso con Sentinel
antes de asumir reuso por analogia: aqui queda escrita para el modelo.

## Como emite

Por lote, al cerrar cada vuelta del frente: verbo `agentos modelo emitir
--slug {slug} --etapa foco`. Nunca edito el archivo del modelo a mano -- el
verbo es el unico camino de escritura, y el custodia el contrato de campos del
modelo.

## Que devuelve

Cuando el modelo tiene su punto de partida -- los nodos minimos resueltos, cada
uno con lo que su tipo exige (cita, prosa anclada o ninguna de las dos), sin
huecos que bloqueen el resto del frente --, devuelvo la conduccion. Las etapas
siguientes de `/disenar` son de Mary.
