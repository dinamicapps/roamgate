# Tech Stack Base DinamicAPPS

## Backend
- .NET 8.0 / ASP.NET Core
- Entity Framework Core (Code First desde Scaffolding)
- SQL Server

## Herramientas
- Git + GitHub (GitHub Flow)
- Claude Code como asistente de desarrollo
- Playwright para pruebas E2E

## Principios
- No modificar entidades EF Core directamente, usar scaffolding
- Credenciales en appsettings.json, nunca hardcodeadas
- Endpoints publicos usan `[AllowAnonymous]`
