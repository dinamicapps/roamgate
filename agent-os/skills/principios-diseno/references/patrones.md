# Patrones de diseno -- el mejor momento para aplicarlos

Seis patrones, una ficha cada uno. El campo mas importante es **NO apliques cuando**:
es lo que separa una buena decision de la sobre-ingenieria. Recuerda la regla de oro
(`SKILL.md`): sin un dolor concreto, el patron es deuda.

## Singleton

- **Problema:** garantizar una unica instancia compartida de algo costoso o con estado global.
- **Aplica cuando:** un recurso debe ser unico de verdad (cache en memoria, pool de
  conexiones, config inmutable cargada una vez).
- **NO apliques cuando:** lo usas para acceso global comodo -- se vuelve estado global
  oculto, mata la testeabilidad y esconde dependencias. Casi nunca lo necesitas a mano.
- **Smell que lo sugiere:** pasas el mismo objeto por todos lados, o lo reconstruyes en cada capa.
- **Ejemplo MVC/C#:** un proveedor de configuracion de solo lectura cargado al arranque.
- **Nota .NET nativa:** usa el contenedor DI con `services.AddSingleton<IConfigProvider, ConfigProvider>()`.
  El ciclo de vida singleton lo gobierna el contenedor; NO escribas `private static instance`
  con doble-checked locking a mano.

## Observer

- **Problema:** notificar a multiples interesados cuando algo cambia, sin que el emisor
  conozca a los receptores.
- **Aplica cuando:** un evento tiene N reacciones independientes que pueden crecer
  (al confirmar una factura: emitir correo, actualizar inventario, registrar auditoria).
- **NO apliques cuando:** hay un solo receptor y una llamada directa es mas clara; o
  cuando el flujo necesita el resultado de cada receptor (eso es orquestacion, no observacion).
- **Smell que lo sugiere:** el emisor acumula llamadas a servicios no relacionados cada
  vez que aparece una reaccion nueva (tambien huele a OCP).
- **Ejemplo MVC/C#:** publicar un evento de dominio `FacturaConfirmada` y que varios
  handlers reaccionen.
- **Nota .NET nativa:** `event`/`EventHandler` para in-process simple; `IObservable<T>`
  (Rx) para flujos; `INotifyPropertyChanged` en binding. Antes de implementar el patron
  a mano, usa el mecanismo del framework.

## Factory

- **Problema:** crear objetos sin que el consumidor sepa la clase concreta ni la logica
  de construccion.
- **Aplica cuando:** la clase a instanciar se decide en runtime por datos, o la
  construccion tiene pasos no triviales que no deberian ensuciar al consumidor.
- **NO apliques cuando:** solo hay un tipo y un `new` directo basta. Una factory que
  siempre devuelve lo mismo es indireccion vacia.
- **Smell que lo sugiere:** un `switch` que mapea un codigo a `new ClaseConcreta(...)`
  repetido en varios sitios.
- **Ejemplo MVC/C#:** elegir el generador de reporte (`PdfReporte` vs `ExcelReporte`)
  segun el formato pedido.
- **Nota .NET nativa:** el contenedor DI YA es una factory. Para construccion diferida
  inyecta `Func<T>` o resuelve via `IServiceProvider`; para familias usa keyed services.
  Reserva la factory custom para cuando la decision depende de datos de runtime que el
  contenedor no conoce.

## Strategy

- **Problema:** intercambiar un algoritmo o regla en runtime sin condicionales por tipo.
- **Aplica cuando:** hay varias formas de hacer lo mismo (calcular descuento, comision,
  impuesto) y se elige una segun contexto; o quieres aislar la regla para testearla.
- **NO apliques cuando:** solo hay una estrategia y no se prevee otra -- es OCP prematuro.
- **Smell que lo sugiere:** el `switch` de OCP; metodos largos con ramas que hacen
  calculos distintos.
- **Ejemplo MVC/C#:** `IDescuento` con `DescuentoPorVolumen`, `DescuentoPorCliente`;
  la BL recibe la estrategia y la aplica.
- **Nota .NET nativa:** en .NET, inyectar una interfaz YA ES Strategy. No necesitas
  andamiaje extra: define `IDescuento`, registra la implementacion en DI, recibela por
  constructor. Para elegir en runtime, combina con Factory/keyed services.

## Decorator

- **Problema:** anadir responsabilidades a un objeto sin modificarlo ni heredar de el.
- **Aplica cuando:** quieres apilar comportamientos opcionales (logging, cache,
  reintentos, validacion) sobre un servicio, en combinaciones variables.
- **NO apliques cuando:** el comportamiento extra es fijo y unico -- metelo en la clase o
  usa composicion simple. Apilar decoradores que nunca varian es complejidad gratis.
- **Smell que lo sugiere:** subclases que combinan flags (`ServicioConLogYCache`), o
  copy-paste de logging/cache en cada implementacion.
- **Ejemplo MVC/C#:** `IRepositorio` real envuelto por `RepositorioConCache : IRepositorio`
  que delega al interno.
- **Nota .NET nativa:** el pipeline de middleware de ASP.NET MVC YA es el patron decorator
  sobre el request. Para servicios, registra decoradores en DI (Scrutor `.Decorate<>()` o
  registro manual envolviendo la implementacion).

## Builder

- **Problema:** construir un objeto complejo paso a paso, separando construccion de
  representacion.
- **Aplica cuando:** la construccion es condicional o tiene muchas partes opcionales que
  un constructor con 8 parametros volveria ilegible; o quieres un objeto inmutable armado
  por fases.
- **NO apliques cuando:** el objeto tiene pocos campos y un object initializer o un
  constructor claro alcanza. Un builder para un POCO de 3 propiedades es ceremonia.
- **Smell que lo sugiere:** constructores telescopicos (multiples overloads que agregan
  parametros), o objetos a medio inicializar pasando por varios metodos.
- **Ejemplo MVC/C#:** armar un filtro de busqueda complejo donde cada criterio es opcional.
- **Nota .NET nativa:** prefiere object initializer (`new Filtro { ... }`) o `record`
  con `with` para variaciones inmutables. El builder se gana su lugar cuando hay logica
  condicional real en la construccion (no solo asignar campos). El patron Options de .NET
  y los builder fluidos del framework (ej. `StringBuilder`, configuracion fluida) son la
  referencia idiomatica.

---

## Patrones vecinos

Existen mas patrones utiles que estos seis no cubren -- entre ellos **Repository** (aislar
el acceso a datos detras de una interfaz, omnipresente en MVC/C#) y **Adapter** (envolver
una API incompatible para que cumpla la interfaz que tu codigo espera). No se detallan
aqui; reconocelos por su problema y aplica el mismo criterio: dolor concreto antes que patron.
