---
description: Lanza el arqueólogo de sistema para explorar un módulo
argument-hint: "[modulo]"
allowed-tools: Read, Write, Glob, Grep
---

## Modo `--desde-work {work-id}`

Ver `commands/agent-os/documentar.md` seccion "Modo `--desde-work {work-id}`" para detalle del flujo cuando se invoca con flag.

Sin flag: continuar con el flujo descrito abajo.

# Explorar Módulo: $1

Voy a lanzar una exploración autónoma del módulo **$1** usando el agente `doc-system-archaeologist`.

## Protocolo de Exploración

### 1. Verificar exploración previa
Buscar en `.claude/rol-documentacion/workflows/` si ya existe:
- `{workflow-activo}/01-exploracion/hallazgos-$1.md`
- `{workflow-activo}/01-exploracion/preguntas-$1.md`

Si existe, preguntar al usuario si quiere:
- Continuar desde donde quedó
- Empezar de nuevo (sobrescribir)

### 2. Identificar punto de entrada
Buscar en el código:
```
- Controllers/*$1*Controller.cs
- Areas/*$1*/Controllers/
- BL$1/ (proyecto de Business Logic)
```

### 3. Ejecutar agente arqueólogo
Lanzar `doc-system-archaeologist` con el módulo identificado.

El agente debe:
1. Trazar flujos desde UI hasta BD
2. Documentar lo obvio inmediatamente
3. Generar lista de preguntas para lo complejo

### 4. Guardar resultados
Crear archivos en:
```
.claude/rol-documentacion/workflows/{workflow-activo}/01-exploracion/
├── hallazgos-$1.md
└── preguntas-$1.md
```

### 5. Mostrar resumen
Al finalizar, mostrar:
- Componentes identificados
- Cantidad de preguntas pendientes
- Próximo comando: `/doc-sesion $1`

---

## Módulos Conocidos del Proyecto

Para referencia rápida:
| Módulo | Proyecto BL | Descripción |
|--------|-------------|-------------|
| Agenda | BLAgenda | Citas y programación |
| Facturacion | BLFacturacion | Facturación y cobros |
| HistoriaClinica | BLHistoriaClinica | Historia clínica |
| Farmacia | BLFarmacia | Dispensación medicamentos |
| Laboratorio | BLLaboratorio | Resultados de laboratorio |
| Cartera | BLCartera | Cuentas por cobrar |
| GestorDocumental | BLGestorDocumental | Documentos digitales |

---

**IMPORTANTE**:
- El agente NO modifica código fuente
- Documenta MIENTRAS explora (no acumula)
- Referencias específicas: archivo:línea
