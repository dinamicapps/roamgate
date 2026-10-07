# Standard: Pruebas E2E (Playwright)

## Cuando escribir pruebas E2E

- Flujos completos de usuario (login, CRUD, workflows)
- Endpoints criticos que afectan datos
- Integraciones con servicios externos
- NO para logica interna o utilidades

## Ubicacion

- Proyecto de tests: `{Solucion}.Tests.E2E/`
- Archivos: `{Flujo}Tests.cs` (ej: `LoginTests.cs`, `EmpresaCrudTests.cs`)

## Estructura basica

```csharp
[TestClass]
public class EmpresaCrudTests : PageTest
{
    [TestMethod]
    public async Task CrearEmpresa_ConDatosValidos_MuestraEnListado()
    {
        // Arrange - navegar al formulario
        await Page.GotoAsync("/empresas/nueva");

        // Act - llenar y enviar
        await Page.FillAsync("[name='nombre']", "Empresa Test");
        await Page.ClickAsync("button[type='submit']");

        // Assert - verificar resultado
        await Expect(Page.Locator(".lista-empresas")).ToContainTextAsync("Empresa Test");
    }
}
```

## Convenciones

- Naming: `{Accion}_{Condicion}_{ResultadoEsperado}`
- Un archivo por flujo o entidad principal
- Usar Page Object Model solo si hay reutilizacion real entre tests
- Datos de prueba: crear en el test, limpiar al finalizar

## Configuracion de entorno

Las pruebas E2E deben leer la configuracion de `test-env.local.json` (raiz del proyecto, schema v2) para:
- URL base del sistema (`sistema.backend.run.url` o `sistema.frontend.run.url`)
- Credenciales de login (`credenciales.admin` o `credenciales.perfiles[N]`)
- Health check para verificar disponibilidad antes de ejecutar (`sistema.backend.run.healthCheck`)

Este archivo se genera automaticamente en Etapa 0 del flujo /alfred. Si no existe, crearlo manualmente siguiendo el template en el repositorio agent-os (`agent-os/templates/test-env.local.json`).

**IMPORTANTE**: Este archivo contiene credenciales y NUNCA debe commitearse (excluido via `*.local.*` en .gitignore).

## Ciclo build → run → test → stop

Dentro de /alfred (E3/E4 modo normal, o el flujo `rediseno-ui`), el ciclo completo se ejecuta via el skill `run-system`, no con comandos ad-hoc:

```
run-system accion=build componente=backend
run-system accion=run   componente=backend    # inicia + health check
run-system accion=test  componente=backend    # corre la suite E2E
run-system accion=stop  componente=backend    # detiene al terminar
```

El skill aprende los comandos del usuario la primera vez y los persiste en `test-env.local.json` con confirmacion + bitacora. Ver `agent-os/skills/run-system/SKILL.md`.

**IMPORTANTE**: SIEMPRE detener los servidores (backend, frontend) que se hayan iniciado para pruebas cuando se pause, interrumpa o termine la sesion. Dentro de /alfred esto es automatico via `run-system accion=stop`. Fuera de /alfred, es responsabilidad del dev.
