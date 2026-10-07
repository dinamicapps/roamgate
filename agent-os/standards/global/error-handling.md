# Standard: Manejo de Errores

## Logging

Usar `CustomLogger` (BLStatic.Codigo), NO ILogger en codigo existente:

```csharp
CustomLogger.Log(ex, "Contexto del error");
CustomLogger.Log(ex, "Error en ChatHub", new Dictionary<string, object>
{
    { "idConexion", idConexion },
    { "mensaje", message }
});
```

Escribe a `Logs/{yyyy-MM-dd}.log` y consola.

## Controllers: try/catch con BadRequest

Toda action wrappea en try/catch. El catch retorna BadRequest con RespuestaJSON:

```csharp
try
{
    if (obtenerUsuarioEmpresaSesion() == null) return Unauthorized();
    if (!TienePermiso("EA020")) return StatusCode(403, new RespuestaJSON { ... });
    // logica
    return Ok(resultado);
}
catch (RequiredVarException ex)
{
    return BadRequest(new RespuestaJSON { error = true, mensaje = ex.Message });
}
catch (Exception ex)
{
    return BadRequest(new RespuestaJSON { error = true, mensaje = ex.Message });
}
```

## Codigos de estado (string, no bool/enum)

| Contexto | Codigos |
|----------|---------|
| Terceros | `"AON"` activo online, `"AOF"` activo offline, `"BLO"` bloqueado, `"SUS"` suspendido |
| Usuarios, herramientas | `"A"` activo, `"I"` inactivo, `"P"` pendiente, `"X"` eliminado |
| Documentos IA | `"CR"` crudo, `"NR"` normalizado, `"AN"` analizado, `"VL"` validado, `"PI"` en Pinecone |

## Frontend: badges de estado con config map

```jsx
const config = {
  'A': { clase: 'bg-success text-success', texto: 'Activo' },
  'I': { clase: 'bg-secondary text-secondary', texto: 'Inactivo' },
}
const c = config[val] || { clase: 'bg-secondary', texto: val }
return <span className={`badge ${c.clase} bg-opacity-10`}>{c.texto}</span>
```
