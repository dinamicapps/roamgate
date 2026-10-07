# SOLID -- los cinco principios

Cada principio: que dice, el sintoma de que se viola, como se ve en MVC/C#, y el
refactor que lo corrige. El objetivo no es "cumplir SOLID" como fin, sino reducir el
costo de cambiar el codigo manana.

## SRP -- Responsabilidad unica

**Dice:** una clase debe tener una sola razon para cambiar.

**Sintoma de violacion:** la clase cambia por motivos no relacionados; su nombre lleva
"y" o "Manager"/"Helper" generico; un metodo orquesta, valida, persiste y formatea.

**En MVC/C#:** un Controller que valida el request, ejecuta la regla de negocio, llama
a la BD y arma el ViewModel viola SRP. Razones de cambio distintas (validacion, regla,
persistencia, presentacion) viven juntas.

```csharp
// Viola SRP: el controller hace de todo
public ActionResult CrearFactura(FacturaDto dto) {
    if (dto.Monto <= 0) return BadRequest();          // validacion
    var impuesto = dto.Monto * 0.19m;                 // regla de negocio
    db.Facturas.Add(new Factura { ... });             // persistencia
    db.SubmitChanges();
    return View(new FacturaVm { ... });               // presentacion
}
```

**Refactor:** el Controller orquesta; la regla vive en una BL/servicio; la persistencia
en un repositorio. Cada uno cambia por su propia razon.

## OCP -- Abierto/cerrado

**Dice:** abierto a extension, cerrado a modificacion. Agregar un caso nuevo no deberia
obligar a editar codigo que ya funciona.

**Sintoma de violacion:** un `switch`/`if-else` por tipo que crece cada vez que aparece
una variante nueva.

```csharp
// Viola OCP: cada medio de pago nuevo edita este switch
decimal CalcularComision(string medio, decimal monto) {
    switch (medio) {
        case "tarjeta": return monto * 0.03m;
        case "transferencia": return monto * 0.01m;
        // cada caso nuevo modifica este metodo probado
    }
}
```

**Refactor:** modelar la variabilidad con una abstraccion (interfaz `IComision` con una
implementacion por medio). Ver patron Strategy en `patrones.md`. Agregar un medio es
agregar una clase, no editar el switch.

## LSP -- Sustitucion de Liskov

**Dice:** un subtipo debe poder usarse donde se espera el tipo base sin romper el
contrato.

**Sintoma de violacion:** una subclase lanza `NotSupportedException` en un metodo
heredado, o exige chequear su tipo concreto antes de usarla.

**En MVC/C#:** un `RepositorioSoloLectura : IRepositorio` que tira excepcion en
`Guardar()` viola LSP: rompe a cualquier consumidor que recibe un `IRepositorio`.

**Refactor:** segregar la interfaz (ver ISP) -- `IRepositorioLectura` e
`IRepositorioEscritura` -- para que cada consumidor dependa solo de lo que el subtipo
realmente cumple.

## ISP -- Segregacion de interfaces

**Dice:** ningun cliente debe depender de metodos que no usa. Mejor varias interfaces
pequenas y cohesivas que una grande.

**Sintoma de violacion:** una interfaz "gorda" que obliga a las implementaciones a
dejar metodos vacios o lanzar excepciones.

```csharp
// Viola ISP: no todo servicio exporta Y importa Y notifica
public interface IServicio {
    void Exportar(); void Importar(); void Notificar();
}
```

**Refactor:** partir en `IExportador`, `IImportador`, `INotificador`. Cada clase
implementa solo lo suyo.

## DIP -- Inversion de dependencias

**Dice:** los modulos de alto nivel no deben depender de los de bajo nivel; ambos
dependen de abstracciones. No instancies tu dependencia: recibela.

**Sintoma de violacion:** `new` de una clase concreta de infraestructura dentro de la
logica de negocio; imposible testear sin tocar la BD real.

```csharp
// Viola DIP: la BL clava la implementacion concreta
public class FacturacionBL {
    private readonly RepositorioSql repo = new RepositorioSql(); // no testeable
}
```

**Refactor:** depender de `IRepositorio` y recibirlo por el constructor (inyeccion).
En .NET el contenedor DI (`services.AddScoped<IRepositorio, RepositorioSql>()`) lo
resuelve. Habilita tests con un doble y desacopla la regla de la infraestructura.
