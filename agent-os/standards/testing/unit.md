# Standard: Pruebas Unitarias

## Cuando escribir pruebas unitarias

- Logica de negocio en la capa de aplicacion/servicios
- Validaciones complejas
- Calculos o transformaciones de datos
- NO para controllers/endpoints simples (CRUD sin logica)
- NO para modelos o DTOs

## Estructura y ubicacion

La estructura del proyecto/suite de pruebas (casa unica, agrupacion por modulo, ubicacion de archivos, framework/runner) la manda `agent-os/standards/testing/modelo-pruebas.md` del repo -- fundado por Quinn con la capacidad `[MP]` al leer el stack real del repo destino. Este standard NO prescribe una estructura de proyecto propia ni un framework fijo: esa decision es del modelo, no de este documento.

## Estructura basica (Arrange-Act-Assert)

Cada test se organiza en tres bloques: **Arrange** (prepara el estado y las dependencias), **Act** (ejecuta la unidad bajo prueba), **Assert** (compara contra el resultado observable esperado, nunca un assert trivial o tautologico).

> Ejemplo (.NET/xUnit):
> ```csharp
> [Fact]
> public void CalcularDescuento_ClientePreferente_Aplica15Porciento()
> {
>     // Arrange
>     var servicio = new ServicioEmpresa();
>     var cliente = new Cliente { Tipo = "PRF", MontoCompra = 1000 };
>
>     // Act
>     var descuento = servicio.CalcularDescuento(cliente);
>
>     // Assert
>     Assert.Equal(150, descuento);
> }
> ```

> Ejemplo (TypeScript/Jest):
> ```typescript
> test("calcularDescuento_clientePreferente_aplica15Porciento", () => {
>   // Arrange
>   const servicio = new ServicioEmpresa();
>   const cliente = { tipo: "PRF", montoCompra: 1000 };
>
>   // Act
>   const descuento = servicio.calcularDescuento(cliente);
>
>   // Assert
>   expect(descuento).toBe(150);
> });
> ```

## Convenciones

- Naming: `{metodo}_{escenario}_{resultadoEsperado}` (o el equivalente idiomatico del framework elegido por el modelo)
- Aislar dependencias externas (BD, HTTP, filesystem) con un doble de prueba nativo del framework elegido -- ver `agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md` seccion 1.1 para el criterio de "capa de aplicacion testeable" vs "capa opaca"
- No testear metodos/funciones privadas directamente

## Configuracion de base de datos para tests

Para pruebas unitarias que requieren acceso a BD, leer el connection string de `test-env.local.json` (raiz del proyecto, schema v2):
- Connection string: `baseDatos.connectionString`
- Nombre BD: `baseDatos.nombre`

**IMPORTANTE**: Nunca hardcodear connection strings en el codigo de tests. Usar `test-env.local.json` o variables de entorno.

## Ejecucion de tests unitarios

Dentro de /alfred (etapas 3 y 4, modo normal, o el flujo `rediseno-ui`), el comando para ejecutar los tests NO se construye ad-hoc. Se invoca via el skill `run-system`:

```
run-system accion=test componente=backend
```

El skill lee `sistema.backend.test.comando` de `test-env.local.json`. Si el campo esta vacio, pregunta al usuario el comando correcto, lo ejecuta, y si funciona lo persiste al archivo con confirmacion + entrada en bitacora (ver `agent-os/skills/run-system/SKILL.md`).

Fuera de /alfred, un dev ejecuta el comando nativo del runner de pruebas del repo directamente, pero dentro del flujo de work se pasa por el contrato.
