# Doctrina de capas: backend (perfil dotnet-react)

<!-- FUENTE: agent-os/doctrina/global/principios-ingenieria.md seccion "Los anti-patrones canonicos". El vocabulario (DRY, acoplamiento, cohesion) y la definicion general del Fat/God Controller viven alli. Este archivo solo aterriza el remedio concreto para el perfil dotnet-react (.NET 8 + EF Core). NO duplicar la regla — para modificar el vocabulario, editar la fuente. -->

Aplica al codigo **nuevo** en el backend .NET 8 del perfil dotnet-react. Codigo existente tocado sigue el arbol de decision de la doctrina de expertos (guia+hallazgo sin garantia de prueba; sugerencia de refactor con garantia de prueba) — este archivo no fuerza refactor de legacy, define el objetivo cuando se construye o se refactoriza.

Precedencia: si el repo consumidor tiene un standard propio en `agent-os/standards/` que cubre lo mismo, ese gana sobre esta doctrina del sistema. <!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Doctrina del sistema vs standard del consumidor". Regla completa de precedencia alli. NO duplicar. -->

## Las 3 capas minimas

Traduccion del consenso Clean/Onion/Hexagonal (Robert C. Martin) al idioma .NET 8 / ASP.NET Core:

### 1. Capa de datos — repositorios tras interfaces

La logica de negocio depende de una interfaz (`IIndicadorRepository`, `IEmpresaRepository`, ...), nunca de `DbContext`/EF Core directo. La implementacion vive detras de la interfaz y es la unica que conoce EF Core, SQL crudo o el `DataContext` legacy.

```csharp
public interface IIndicadorRepository
{
    Task<List<IndicadorFila>> ObtenerIndicador030Async(
        DateTime fechaInicio, DateTime fechaFin, int idEmpresa, int idSede);

    Task<string?> ObtenerNitSedeAsync(int idSede);
}

public class IndicadorRepository : IIndicadorRepository
{
    private readonly ComunicacionesContext _context;

    public IndicadorRepository(ComunicacionesContext context) => _context = context;

    public Task<List<IndicadorFila>> ObtenerIndicador030Async(
        DateTime fechaInicio, DateTime fechaFin, int idEmpresa, int idSede) =>
        _context.Set<IndicadorFila>()
            .FromSqlInterpolated($"EXEC SP_VW_INDICADOR030 {fechaInicio}, {fechaFin}, {idEmpresa}, {idSede}")
            .AsNoTracking()
            .ToListAsync();

    public Task<string?> ObtenerNitSedeAsync(int idSede) =>
        _context.SEDE.Where(s => s.Id == idSede).Select(s => s.FacturaNit).FirstOrDefaultAsync();
}
```

### 2. Logica de negocio + DTOs — servicios / casos de uso

Un servicio (o caso de uso) orquesta uno o mas repositorios, aplica las reglas de negocio y devuelve DTOs. Los DTOs cruzan la frontera hacia el controller sin filtrar entidades de dominio ni de EF Core (no exponer la entidad scaffolded directo).

```csharp
public interface IIndicador030Service
{
    Task<List<IndicadorFilaDto>> CalcularAsync(int idSede, DateTime fechaInicio, DateTime fechaFin);
}

public class Indicador030Service : IIndicador030Service
{
    private readonly IIndicadorRepository _indicadores;
    private readonly IEncuestaRepository _encuestas;
    private readonly IParametroRepository _parametros;

    public Indicador030Service(
        IIndicadorRepository indicadores, IEncuestaRepository encuestas, IParametroRepository parametros)
    {
        _indicadores = indicadores;
        _encuestas = encuestas;
        _parametros = parametros;
    }

    public async Task<List<IndicadorFilaDto>> CalcularAsync(int idSede, DateTime fechaInicio, DateTime fechaFin)
    {
        var idEmpresa = await ObtenerIdEmpresaActualAsync();
        var filas = await _indicadores.ObtenerIndicador030Async(fechaInicio, fechaFin, idEmpresa, idSede);

        foreach (var fila in filas.Where(f => f.Ind == "I.4.1.0"))
        {
            var (numerador, denominador) = await CalcularSatisfaccionEncuestasAsync(idEmpresa, fechaInicio, fechaFin);
            fila.Num = numerador;
            fila.Den = denominador;
            fila.Prom = denominador > 0 ? numerador / (decimal)denominador : 0;
        }

        return filas.Select(MapearDto).ToList();
    }

    // La regla de negocio "satisfaccion de encuestas del indicador I.4.1.0" vive UNA sola vez.
    // Antes de esta capa, la misma regla estaba copiada linea por linea en dos metodos hermanos
    // del controller (getXLS y getArchivo) — DRY roto (ver seccion siguiente).
    private async Task<(int Numerador, int Denominador)> CalcularSatisfaccionEncuestasAsync(
        int idEmpresa, DateTime fechaInicio, DateTime fechaFin)
    {
        var plantillasHabilitadas = await _parametros.ObtenerListaAsync("ENPLACONT", idEmpresa);
        var preguntaSatisfaccion = await _parametros.ObtenerAsync("ENSATGLO", idEmpresa, valorPorDefecto: "*");
        if (preguntaSatisfaccion == "*") return (0, 0);

        var encuestas = await _encuestas.ObtenerCerradasAsync(idEmpresa, plantillasHabilitadas, fechaInicio, fechaFin);
        var satisfechas = encuestas.Count(e => EsRespuestaSatisfactoria(e, preguntaSatisfaccion));
        return (satisfechas, encuestas.Count);
    }
}
```

### 3. API + control de acceso — controllers skinny

El controller recibe la peticion HTTP, autoriza (`[Authorize]`, validacion de sesion/licencia), mapea parametros a la llamada del servicio, y devuelve el envelope de respuesta. No contiene queries, no contiene reglas de negocio, no instancia `DbContext`.

```csharp
[ApiController]
[Route("api/exportacion/indicador030")]
[Authorize]
public class Indicador030Controller : ControllerBase
{
    private readonly IIndicador030Service _servicio;

    public Indicador030Controller(IIndicador030Service servicio) => _servicio = servicio;

    [HttpGet("xls")]
    public async Task<IActionResult> GetXls(int idSede, DateTime fechaInicio, DateTime fechaFin)
    {
        var filas = await _servicio.CalcularAsync(idSede, fechaInicio, fechaFin);
        return Ok(new { error = false, mensaje = "Operacion exitosa", dato = filas });
    }

    [HttpGet("archivo")]
    public async Task<IActionResult> GetArchivo(int idSede, DateTime fechaInicio, DateTime fechaFin)
    {
        var filas = await _servicio.CalcularAsync(idSede, fechaInicio, fechaFin);
        var csv = ExportadorCsv.Exportar(filas);
        return File(Encoding.ASCII.GetBytes(csv), "text/plain", "Indicador_030.txt");
    }
}
```

## La Regla de Dependencia

Las dependencias de codigo apuntan **hacia adentro**, hacia la logica de negocio:

```
Controller (API)  --depende de-->  IServicio  --depende de-->  IRepositorio
     |                                  |                            |
  HTTP, [Authorize],              reglas de negocio,          EF Core, SQL,
  mapeo DTO, status               orquestacion, DTOs          DataContext
```

- El controller conoce el servicio por su interfaz, no por su implementacion.
- El servicio conoce el repositorio por su interfaz, no por EF Core.
- Nunca al reves: un repositorio no llama a un servicio; un servicio no arma respuestas HTTP.
- La inyeccion de dependencias (constructor injection + contenedor de ASP.NET Core) es el mecanismo que conecta interfaz con implementacion sin que la capa interior conozca la exterior (Dependency Inversion).

## Anti-patron: Fat/God Controller

**Definicion:** un controller que mezcla en un solo archivo responsabilidades de las tres capas — acceso a datos (`DbContext`/`DataContext` instanciado o inyectado y consultado directo), logica de negocio (calculos, reglas, condicionales de dominio), control de acceso (validaciones de sesion) y serializacion/formato de salida. Viola la Regla de Dependencia y el Single Responsibility Principle.

**Caso ilustrativo (olor real, `Indicador030Controller`):**

- `getXLS` y `getArchivo` instancian `new BLStatic.Datos.TablasDataContext(...)` directo dentro del metodo — capa de datos mezclada con la capa de API.
- Ambos metodos calculan la satisfaccion de encuestas del indicador `I.4.1.0` (parsear JSON de respuestas, contar satisfechos, sacar promedio) con el **mismo bloque de ~30 lineas copiado y pegado** entre los dos metodos hermanos — DRY roto: la misma pieza de conocimiento de negocio tiene dos representaciones que ya pueden divergir (un fix aplicado a `getXLS` que no llegue a `getArchivo`).
- La validacion de sesion (`validarUsuario()`) y el chequeo de licencia estan inline junto a la logica de negocio, sin separacion clara entre "quien puede entrar" y "que se calcula".
- El formato de salida (`XlsResult`, `File(...)`) esta entrelazado con el calculo — cambiar el calculo obliga a tocar el mismo metodo que arma la respuesta HTTP.

**Sintomas generales (no exclusivos de este caso):** metodos de controller de mas de 50-80 lineas; queries LINQ-to-Entities o SQL inline en el controller; bloques `if`/`switch` de reglas de negocio en el controller; el mismo calculo repetido en dos endpoints hermanos del mismo controller.

**Remedio: skinny controller.** Extraer el calculo a un servicio (`IIndicador030Service.CalcularAsync`, invocado UNA vez y consumido por ambos endpoints como en el ejemplo de la seccion 2-3 arriba) y el acceso a datos a un repositorio (`IIndicadorRepository`). El controller queda con: recibir parametros, autorizar, invocar el servicio, formatear la respuesta. El DRY se resuelve solo: `getXls` y `getArchivo` llaman al mismo `CalcularAsync`, no hay dos copias que puedan divergir.
