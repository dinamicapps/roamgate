# Doctrina de vocabulario: principios de calidad estructural

Doctrina agnostica de stack. Define con rigor el vocabulario de calidad estructural (DRY, acoplamiento, cohesion) y la disciplina de comentarios del codigo, que el resto del sistema (cognicion de expertos, doctrina de capas por perfil) referencia por puntero FUENTE. NO redefine KISS/YAGNI (ya son P2 del MANIFIESTO, ver seccion 4) ni prescribe capas concretas (eso vive en la doctrina por perfil, ver seccion 5).

## 1. DRY — Don't Repeat Yourself

**Definicion:** cada pieza de *conocimiento* tiene una representacion unica, inequivoca y autoritativa dentro de un sistema. DRY NO es sobre lineas de codigo identicas — es sobre duplicacion de conocimiento/intencion de negocio.

**Fuente:** Hunt & Thomas, *The Pragmatic Programmer* (1999; ed. 20 aniversario 2019). https://media.pragprog.com/titles/tpp20/dry.pdf ; https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

**Olores:**
- El mismo cambio de negocio obliga a editar N archivos que deben quedar sincronizados a mano.
- Copy-paste con variaciones que divergen con el tiempo (un bug se arregla en un sitio, no en los otros).
- Reglas de validacion replicadas en DTO, modelo y stored procedure.

**Remedio:** extraer el conocimiento a una fuente unica (funcion, servicio, constante, standard) y hacer que el resto dependa de ella.

**Caveat del FALSO DRY (obligatorio):** dos fragmentos que HOY lucen iguales pero cambian por razones distintas NO se fusionan. Acoplar dos cosas que solo coinciden por casualidad crea una abstraccion equivocada, mas cara de mantener que la duplicacion que evita. Regla practica: unificar solo cuando ambos fragmentos cambiarian *por la misma razon*. https://thevaluable.dev/dry-principle-cost-benefit-example/

## 2. Acoplamiento (Coupling)

**Definicion:** grado de interdependencia entre modulos. **Meta: bajo acoplamiento.**

**Fuente:** Stevens/Myers/Constantine (1974); Yourdon & Constantine, *Structured Design* (1979); metricas aferente/eferente de Robert C. Martin. https://en.wikipedia.org/wiki/Coupling_(computer_programming)

**Espectro, del peor al mejor:**

| Tipo | Descripcion |
|---|---|
| Content | un modulo toca los internos de otro directamente |
| Common | estado global mutable compartido entre modulos |
| Control | un flag/parametro dicta el flujo interno de otro modulo |
| Stamp | se pasa una estructura completa aunque solo se use parte |
| Data | solo se pasan los datos elementales que se necesitan |
| Message | interaccion solo via interfaces/mensajes |

**Olores:**
- Un cambio en el modulo A rompe B/C/D sin relacion aparente.
- Flags booleanos que ramifican el comportamiento interno de otro modulo.
- Singletons o estado global mutable; cadenas de acceso tipo `pedido.cliente.direccion.ciudad.codigo` (viola la Ley de Demeter).

**Remedio:** programar contra interfaces (inversion de dependencias), pasar solo los datos que se usan, reemplazar flags de control por polimorfismo, eliminar estado global compartido.

## 3. Cohesion (Cohesion)

**Definicion:** grado en que los elementos de un modulo sirven a un proposito unico. **Meta: alta cohesion (funcional).** Complemento del acoplamiento: buena arquitectura = alta cohesion + bajo acoplamiento.

**Fuente:** Constantine & Yourdon, *Structured Design* (1979). https://www.geeksforgeeks.org/coupling-and-cohesion-in-system-design/

**Escala, del peor al mejor:** coincidental (cajon de sastre "Utils") -> logica (agrupado por categoria, seleccion por flag) -> temporal (mismo momento, ej. `init()`) -> procedimental (orden de ejecucion) -> comunicacional (mismos datos) -> secuencial (salida de uno = entrada del siguiente) -> funcional (una sola tarea bien definida).

**Olores:**
- Clases/modulos "God", "Manager", "Utils" que acumulan responsabilidades sin relacion.
- Un nombre que necesita "y" para describirse (ej. `ValidadorYExportador`).
- Metodos que no usan los campos de su propia clase (feature envy — el metodo "quiere" vivir en otro lado).

**Remedio:** Single Responsibility Principle (una sola razon para cambiar); dividir clases God; extraer metodos hacia donde viven los datos que usan.

## 4. KISS y YAGNI: ya son P2

<!-- FUENTE: .claude/MANIFIESTO.md seccion "2. Simplicity First". KISS y YAGNI ya son P2 Simplicity First del MANIFIESTO; aqui solo se nombran para completitud del vocabulario. NO duplicar la regla — para modificar, editar la fuente. -->

KISS (Keep It Simple, Stupid) y YAGNI (You Aren't Gonna Need It) no se re-legislan en esta doctrina: ya existen como **P2 Simplicity First** del MANIFIESTO ("¿esto se necesita HOY para cumplir la meta declarada?" es, literalmente, YAGNI aplicado). Esta seccion solo los nombra para que el vocabulario de calidad estructural quede completo.

## 5. Los anti-patrones canonicos

Dos anti-patrones observables, uno por capa, son **el mismo problema** (baja cohesion + alto acoplamiento) manifestado en sitios distintos:

- **Fat/God Controller (backend):** un controller que mezcla control de acceso, conexion a datos, logica de negocio y serializacion en un solo archivo. Viola la Regla de Dependencia (Clean Architecture) y SRP. Remedio concreto por perfil: `agent-os/doctrina/{perfil}/backend/arquitectura-capas.md`.
- **God Component / archivo todo-en-uno (frontend):** un modulo que mezcla markup, CSS inline, fetch/HTTP y logica de UI en un solo archivo. Equivalente frontend del fat controller. Remedio concreto por perfil: `agent-os/doctrina/{perfil}/frontend/arquitectura-capas.md`.

`{perfil}` es el perfil de stack del proyecto consumidor (ej. `dotnet-react`, `dotnet-angularjs`).

## 6. Comentarios: el por que, no el que

**Regla:** un comentario se gana su lugar solo si responde POR QUE, y el por que no es deducible del codigo. El limite no es de longitud sino de merito.

**Merece comentario:**
- Una regla de negocio no obvia, con su fuente cuando existe (resolucion, norma, acuerdo contractual).
- Una decision contra-intuitiva: por que NO se tomo el camino evidente.
- Un invariante que el codigo asume pero no verifica.
- Deuda declarada y vigente.

**No merece comentario:**
- Lo que el codigo ya dice: el QUE y el COMO.
- La procedencia del cambio: work, tarea, criterio de aceptacion, quien lo pidio, en que etapa se decidio.
- La historia de como se llego a la solucion: alternativas descartadas, quien reviso.

**Sin tope de lineas.** Si quince lineas explican una regla de negocio real, van. Si tres lineas cuentan de que trabajo salio el cambio, sobran las tres.

**Las tres capas y sus duenos.** El codigo lleva el por que del negocio — atemporal, lo lee alguien sin contexto dentro de anos. El commit lleva el por que del cambio. El registro del trabajo lleva la historia completa. Un comentario que narra procedencia esta escribiendo en la capa equivocada.

**Un comentario narra el presente, no historia vieja.** Debe ser cierto HOY sobre el codigo que acompana. Cuando la logica se reubica en un refactor, su comentario de justificacion viaja con ella; cuando se borra codigo, se actualizan los comentarios que aun lo describen como activo. Git guarda la historia; la fuente debe ser cierta ahora.

**Excepcion — deuda vigente si nombra su trabajo de origen**, porque ahi la referencia sigue siendo util para quien lee el codigo despues:

```
// DEUDA: sin indice hasta migrar a v2 (work 20260811-verificacion-diferida)
```

**Fuera de alcance de esta regla:** la instrumentacion temporal (`#region WORK-DEBUG-LOG` y equivalentes) la gobierna el MANIFIESTO en "Cuando saltarse este manifiesto", y se remueve cuando el protocolo lo manda.

## Nota transversal

KISS + YAGNI controlan la complejidad entrante; DRY controla la redundancia; bajo-acoplamiento + alta-cohesion son las dos metricas de la modularidad. **La arquitectura en capas es la aplicacion estructural de esas dos metricas** — cada capa tiene una sola responsabilidad (cohesion) y las dependencias apuntan en una sola direccion hacia abstracciones (bajo acoplamiento). El fat controller y el god component son el mismo anti-patron visto en dos capas.
