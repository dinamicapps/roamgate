---
name: conocimiento-mssql
description: Conocimiento técnico MSSQL de Dexter, heredado del subagente sql-server-dba. Motor, planes, índices, T-SQL, refactor con equivalencia funcional.
---

# Conocimiento MSSQL de Dexter

> Heredado y adaptado del subagente `~/.claude/agents/sql-server-dba.md`. Aquel sigue vivo para optimización puntual fuera de /disenar + el gobernador (`/alfred`); este reference es el conocimiento que Dexter aplica al modelar y verificar.

## Dominio técnico

- Arquitectura interna SQL Server: Storage Engine, Query Processor, Buffer Pool.
- Planes de ejecución: scans vs seeks, key lookups, spills, implicit conversions, cardinalidad estimada vs real.
- Índices: clustered, non-clustered, filtered, columnstore, covering. Impacto de estadísticas.
- T-SQL avanzado: CTEs recursivas, window functions, APPLY, MERGE.
- SPs, funciones, triggers, vistas. Bloqueos y deadlocks. Query hints (cuando son apropiados).

## Tipos de dato: criterios de elección

- `nvarchar(N)` vs `nvarchar(max)`: `max` va off-row, no indexable como key, penaliza. NUNCA es default — exige justificación explícita (ver GE en modelar-datos.md). Elegir `N` acotado al requerimiento real destilado.
- Numéricos: `INT`/`BIGINT` según rango real; `DECIMAL(p,s)` para montos (jamás `FLOAT` para dinero).
- Fechas: `DATETIME2` sobre `DATETIME` legacy salvo coherencia brownfield.
- Nulabilidad: explícita siempre. NULL es decisión de modelado, no descuido.

## Refactor con equivalencia funcional garantizada

Cuando se refactoriza un SP/función/consulta existente:
1. El resultado debe ser funcionalmente idéntico al original, salvo que el usuario pida cambio de lógica explícito.
2. Documentar qué cambios son de optimización/estructura vs funcionales.
3. Mantener la misma interfaz (parámetros entrada/salida) salvo instrucción contraria.
4. Si se detecta un bug en el original, notificar pero NO corregir sin autorización.

## Estándares de código SQL (piso universal)

- No `SELECT *` en código de producción.
- Nombres calificados con schema (`schema.objeto`).
- `SET NOCOUNT ON` en SPs.
- Parametrizar siempre (nunca concatenar strings — prevención de injection).
- `TRY/CATCH` en SPs transaccionales.
- Transacciones explícitas para operaciones multi-tabla.

Estas reglas son el piso innegociable de Dexter. Las convenciones específicas del proyecto (prefijos, naming local) viven en `agent-os/standards/database/` y las custodia vía DT.

## ORM sobre SQL Server: peligros operativos que el build no atrapa

Un ORM que mapea objetos a SQL Server tiene fallas que NO aparecen en compilación y solo explotan en runtime; para cualquier toque al mapeo o a un binding resuelto por strings, build-verde no es prueba: hay que ejercitar la ruta real (al menos el arranque/precarga de la aplicación que materializa el mapeo).

- **IN-query sin cota:** una cláusula de pertenencia que traduce una colección en memoria a un `IN (...)` genera N parámetros SQL; con más de 2100 falla por el límite de parámetros del protocolo TDS de SQL Server. Si la colección viene de datos reales (no de constantes del código), su tamaño es arbitrario en producción aunque sea pequeño en pruebas. Patrón seguro: batching sobre rangos (preserva el tipo de proyección, no requiere tipado dinámico ni tocar el código aguas abajo) o una alternativa set-based en la propia BD.
- **SQL crudo invalida el cache de identidad del contexto:** tras ejecutar un comando/consulta SQL crudo sobre una tabla ya cargada en el contexto del ORM, hay que refrescar esas entidades (recargar sobreescribiendo valores en memoria) antes de cualquier guardado o borrado posterior; de lo contrario el ORM detecta un conflicto de concurrencia y aborta, dejando filas huérfanas.
- **Sin hints de bloqueo en el DML del ORM:** muchos ORM no emiten `ROWLOCK`/`UPDLOCK` en su DML generado. Cuando la correctitud exige concurrencia segura (p.ej. una activación exclusiva), bajar a SQL crudo dentro de una transacción explícita, documentando inline la excepción al standard con su razón técnica.
- **Strings de asociación / display:** errores en las claves de relación del mapeo (qué columna une dos entidades) o un campo de despliegue no validado solo revientan al resolver en runtime (excepción en el arranque, o rechazo de un consumidor externo del contrato). Tras regenerar el mapeo, ejercitar el arranque/precarga, no solo compilar.
- **N+1 disfrazado en un `select new` de LINQ-to-SQL:** cada `FirstOrDefault` (o subconsulta escalar) dentro de una proyección `select new` genera una query adicional por fila — patrón invisible al build y al caso feliz, que solo aparece en runtime con volumen. Reescribir con joins integrados en la composición principal.

## Herramientas de generación/inspección: quirks conocidos

- **SqlMetal + SET FMTONLY:** SqlMetal (NETFX2008) usa SET FMTONLY (deprecado) para inferir result sets de SPs; falla con múltiples result sets, lógica condicional o SQL dinámico — workarounds: shape explícito o `sys.dm_exec_describe_first_result_set`.
- **SqlDataAdapter no lee DMVs en PowerShell:** SqlDataAdapter no devuelve filas en consultas a DMVs/catálogos de sistema vía PowerShell/ADO.NET; usar SqlDataReader directo para esos casos.
