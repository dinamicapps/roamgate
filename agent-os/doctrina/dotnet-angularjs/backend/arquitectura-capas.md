# Doctrina de capas: backend (perfil dotnet-angularjs)

<!-- FUENTE: agent-os/doctrina/global/principios-ingenieria.md seccion "Los anti-patrones canonicos". El vocabulario (DRY, acoplamiento, cohesion) y la definicion general del Fat/God Controller viven alli. Este archivo solo aterriza el remedio concreto para el perfil dotnet-angularjs (.NET Framework, MVC clasico, LINQ-to-SQL). NO duplicar la regla -- para modificar el vocabulario, editar la fuente. -->

Aplica al codigo **nuevo** en el backend .NET Framework (MVC clasico) del perfil dotnet-angularjs. Codigo existente tocado sigue el arbol de decision de la doctrina de expertos (guia+hallazgo sin garantia de prueba; sugerencia de refactor con garantia de prueba) -- este archivo no fuerza refactor de legacy, define el objetivo cuando se construye o se refactoriza.

Precedencia: si el repo consumidor tiene un standard propio en `agent-os/standards/` que cubre lo mismo, ese gana sobre esta doctrina del sistema. <!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Doctrina del sistema vs standard del consumidor". Regla completa de precedencia alli. NO duplicar. -->

## Las 3 capas minimas

Traduccion del consenso Clean/Onion/Hexagonal (Robert C. Martin) al idioma .NET Framework / ASP.NET MVC clasico: sin contenedor de inyeccion de dependencias, las clases se instancian directo por convencion del proyecto (`new NombreClase(...)`), pero eso no exime de separar capas -- la separacion vive en QUE clase conoce QUE, no en el mecanismo de instanciacion.

### 1. Capa de datos -- el `DataContext` detras de una clase dedicada

Ninguna clase de logica de negocio ni ningun controller instancia el `DataContext` (LINQ-to-SQL) directo. Una clase de acceso a datos lo encapsula y expone metodos con nombre de negocio, no queries sueltas.

```csharp
namespace BLStatic.Codigo.Logica
{
    public class Indicador030Datos
    {
        private readonly TablasDataContext db;

        public Indicador030Datos(int idEmpresaCentral)
        {
            db = new TablasDataContext(idEmpresaCentral);
        }

        public string ObtenerNitSede(int idSede) =>
            db.SEDE.Where(s => s.id == idSede).FirstOrDefault()?.facturanit;

        public List<FilaIndicador030> ObtenerIndicador030(
            DateTime fechaInicio, DateTime fechaFin, int idEmpresa, int idSede) =>
            db.SP_VW_INDICADOR030(fechaInicio, fechaFin, idEmpresa, idSede).ToList();

        public List<EN_ENCUESTA> ObtenerEncuestasCerradas(
            int idEmpresa, List<int> idsFormato, DateTime fechaInicio, DateTime fechaFin) =>
            (from enc in db.EN_ENCUESTA
             where enc.idempresa == idEmpresa && enc.idestado == "G"
                && idsFormato.Contains(enc.idformato)
                && enc.fechacrea.Date >= fechaInicio.Date && enc.fechacrea.Date <= fechaFin.Date
             select enc).ToList();
    }
}
```

### 2. Logica de negocio + DTOs -- clases `BL*`

Una clase `BL*` (o una clase de logica sin ese prefijo si el modulo ya usa otra convencion, lo que importa es la responsabilidad, no el nombre) orquesta la clase de datos y los parametros de negocio, y calcula el resultado UNA sola vez. Los objetos que cruzan hacia el controller son filas/DTOs de salida, no entidades del `DataContext` filtradas a mano.

```csharp
namespace BLStatic.Codigo.Logica
{
    public class BLIndicador030
    {
        private readonly Indicador030Datos datos;

        public BLIndicador030(int idEmpresaCentral)
        {
            datos = new Indicador030Datos(idEmpresaCentral);
        }

        public List<FilaIndicador030> Calcular(
            int idEmpresa, int idSede, DateTime fechaInicio, DateTime fechaFin)
        {
            var filas = datos.ObtenerIndicador030(fechaInicio, fechaFin, idEmpresa, idSede);

            foreach (var fila in filas.Where(f => f.ind == "I.4.1.0"))
            {
                var (numerador, denominador) = CalcularSatisfaccionEncuestas(idEmpresa, fechaInicio, fechaFin);
                fila.num = numerador;
                fila.den = denominador;
                fila.prom = denominador > 0 ? numerador / Convert.ToDecimal(denominador) : 0;
            }

            return filas;
        }

        // La regla de negocio "satisfaccion de encuestas del indicador I.4.1.0" vive
        // UNA sola vez aqui. Antes de esta clase, el mismo bloque de mas de 30 lineas
        // estaba copiado y pegado entre getXLS y getArchivo del controller -- DRY roto
        // (ver anti-patron abajo).
        private (int Numerador, int Denominador) CalcularSatisfaccionEncuestas(
            int idEmpresa, DateTime fechaInicio, DateTime fechaFin)
        {
            var idsFormato = Utiles.traerParametro("ENPLACONT", idEmpresa, "0")
                .Split(',').Select(int.Parse).ToList();
            var preguntaSatisfaccion = Utiles.traerParametro("ENSATGLO", idEmpresa, "*");
            if (preguntaSatisfaccion == "*") return (0, 0);

            var encuestas = datos.ObtenerEncuestasCerradas(idEmpresa, idsFormato, fechaInicio, fechaFin);
            var satisfechas = encuestas.Count(e => EsRespuestaSatisfactoria(e, preguntaSatisfaccion));
            return (satisfechas, encuestas.Count);
        }
    }
}
```

### 3. API + control de acceso -- controller delgado (`ControladorBase`)

El controller hereda de `ControladorBase`, recibe la peticion, valida sesion/licencia (`validarUsuario()`), instancia la clase `BL*` una vez por accion, y formatea la respuesta. No contiene queries, no contiene reglas de negocio, no instancia el `DataContext`.

```csharp
public class Indicador030Controller : ControladorBase
{
    public XlsResult getXLS(int idsede, DateTime fechai, DateTime fechaf)
    {
        if (!validarUsuario()) return null;

        var filas = new BLIndicador030(usu.idempresacentral)
            .Calcular(ObtenerIdEmpresaActual(), idsede, fechai, fechaf);

        return new XlsResult(filas, "Resolucion_0256_Registro2.xls");
    }

    public FileResult getArchivo(int idsede, DateTime fechai, DateTime fechaf)
    {
        if (!validarUsuario()) return null;

        var filas = new BLIndicador030(usu.idempresacentral)
            .Calcular(ObtenerIdEmpresaActual(), idsede, fechai, fechaf);

        var csv = ExportadorCSV.ExportCSV(filas, new StringBuilder(), ",");
        return File(Encoding.ASCII.GetBytes(csv), "text/plain", "Indicador_030.txt");
    }
}
```

## La Regla de Dependencia

Las dependencias de codigo apuntan **hacia adentro**, hacia la logica de negocio, aun sin contenedor de inyeccion:

```
Controller (ControladorBase) --usa--> BL* (logica) --usa--> Clase de datos --usa--> DataContext
        |                                  |                       |
  validarUsuario(), mapeo            reglas de negocio,      queries LINQ-to-SQL,
  de parametros, formato             orquestacion, calculo    SP, DataContext
```

- El controller conoce la clase `BL*` por su rol de negocio, nunca por sus detalles de datos.
- La clase `BL*` conoce la clase de datos por su rol, nunca instancia el `DataContext` ella misma con logica de conexion propia distinta a la clase de datos.
- Nunca al reves: la clase de datos no llama a la clase `BL*`; la clase `BL*` no arma respuestas HTTP ni conoce `ActionResult`/`XlsResult`/`FileResult`.

## Anti-patron: Fat/God Controller

**Definicion:** un controller que mezcla en un solo archivo responsabilidades de las tres capas -- acceso a datos (`DataContext` instanciado directo dentro del metodo), logica de negocio (calculos, reglas, condicionales de dominio), control de acceso (validacion de sesion/licencia) y serializacion/formato de salida. Viola la Regla de Dependencia y el Single Responsibility Principle.

**Caso ilustrativo (olor real, `Indicador030Controller`), las cuatro responsabilidades mezcladas en el mismo metodo:**

- **Acceso a datos:** `getXLS` y `getArchivo` instancian `new BLStatic.Datos.TablasDataContext(usu.idempresacentral)` directo dentro del metodo -- capa de datos mezclada con la capa de API.
- **Logica de negocio:** ambos metodos calculan la satisfaccion de encuestas del indicador `I.4.1.0` -- parsear el JSON de respuestas de cada encuesta, contar cuantas responden "4" o "5" a la pregunta de satisfaccion, sacar el promedio -- con el **mismo bloque de mas de 30 lineas copiado y pegado** entre los dos metodos hermanos. Esto es DRY roto real, no cosmetico: la misma pieza de conocimiento de negocio tiene dos representaciones que ya pueden divergir (un ajuste aplicado a `getXLS` que no llegue a `getArchivo`).
- **Control de acceso:** la validacion de sesion (`validarUsuario()`) esta inline junto a la logica de negocio, sin separacion clara entre "quien puede entrar" y "que se calcula".
- **Serializacion/formato:** el formato de salida (`XlsResult` en un metodo, `File(...)` con CSV en el otro) esta entrelazado con el calculo -- cambiar el calculo obliga a tocar el mismo metodo que arma la respuesta HTTP.

**Sintomas generales (no exclusivos de este caso):** metodos de controller de mas de 50-80 lineas; queries LINQ-to-SQL o SP inline en el controller; bloques `if`/`switch` de reglas de negocio en el controller; el mismo calculo repetido en dos metodos hermanos del mismo controller.

**Remedio: skinny controller.** Extraer el calculo a una clase `BL*` (`BLIndicador030.Calcular`, invocada UNA vez por accion y consumida por ambos metodos como en el ejemplo de la seccion 2-3 arriba) y el acceso a datos a una clase dedicada (`Indicador030Datos`). El controller queda con: recibir parametros, validar sesion, instanciar la clase `BL*`, formatear la respuesta. El DRY se resuelve solo: `getXLS` y `getArchivo` llaman al mismo `Calcular`, no hay dos copias que puedan divergir.
