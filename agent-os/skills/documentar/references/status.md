---
description: Muestra progreso de documentación por módulo
allowed-tools: Read, Glob
---

# Estado de Documentación

Voy a mostrar el progreso actual de documentación del proyecto.

## Proceso

### 1. Escanear workflows activos
Buscar en:
```
.claude/rol-documentacion/workflows/*/
```

### 2. Verificar documentación existente
Para cada módulo conocido, verificar:
```
.documentacion/02-dominios-negocio/{modulo}/
├── README.md           ¿existe?
├── proceso-*.md        ¿existe?
└── especificacion-*.md ¿existe?
```

### 3. Generar reporte

```
╔══════════════════════════════════════════════════════════════════════╗
║ ESTADO DE DOCUMENTACIÓN                                              ║
║ Proyecto: eMedico                                                    ║
║ Fecha: {fecha}                                                       ║
╠══════════════════════════════════════════════════════════════════════╣

┌──────────────────────────────────────────────────────────────────────┐
│ MÓDULOS CON WORKFLOW ACTIVO                                          │
├──────────────────┬───────────┬──────────┬──────────┬────────┬────────┤
│ Módulo           │ Explorac. │ Sesiones │ Consolid.│ Tests  │ Manual │
├──────────────────┼───────────┼──────────┼──────────┼────────┼────────┤
│ {modulo1}        │ ✅        │ 🔄 (2/5) │ ⏳       │ ⏳     │ ⏳     │
│ {modulo2}        │ ✅        │ ✅       │ ✅       │ 🔄     │ ⏳     │
└──────────────────┴───────────┴──────────┴──────────┴────────┴────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ DOCUMENTACIÓN EXISTENTE (.documentacion/)                            │
├──────────────────┬─────────────┬───────────────┬─────────────────────┤
│ Dominio          │ README      │ Procesos      │ Espec. Técnicas     │
├──────────────────┼─────────────┼───────────────┼─────────────────────┤
│ agenda           │ ✅          │ 1             │ 0                   │
│ facturacion      │ ✅          │ 2             │ 1                   │
│ historia-clinica │ ⏳          │ 0             │ 0                   │
│ farmacia         │ ⏳          │ 0             │ 0                   │
│ laboratorio      │ ⏳          │ 0             │ 0                   │
│ cartera          │ ⏳          │ 0             │ 0                   │
│ gestor-documental│ ✅          │ 1             │ 1                   │
└──────────────────┴─────────────┴───────────────┴─────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ SESIONES PAUSADAS                                                    │
├──────────────────────────────────────────────────────────────────────┤
│ • sesion-2024-01-15-facturacion-copagos.md                          │
│   Última actualización: hace 3 días                                  │
│   Retomar con: /doc-retomar sesion-2024-01-15-facturacion-copagos   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ PRÓXIMOS PASOS SUGERIDOS                                             │
├──────────────────────────────────────────────────────────────────────┤
│ 1. /doc-retomar sesion-2024-01-15-facturacion-copagos               │
│    → Completar sesión pausada                                        │
│                                                                      │
│ 2. /doc-explorar historia-clinica                                    │
│    → Módulo sin documentación                                        │
│                                                                      │
│ 3. /doc-consolidar facturacion                                       │
│    → Sesiones completadas listas para consolidar                     │
└──────────────────────────────────────────────────────────────────────┘

╚══════════════════════════════════════════════════════════════════════╝
```

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completado |
| 🔄 | En progreso (X/Y indica sesiones completadas) |
| ⏳ | Pendiente |
| ⚠️ | Requiere atención (sesión pausada, conflicto) |

## Archivos Verificados

### Workflows
```
.claude/rol-documentacion/workflows/
├── {workflow-1}/
│   ├── _index.md
│   ├── 01-exploracion/
│   ├── 02-sesiones/
│   ├── 03-consolidacion/
│   ├── 04-tests/
│   └── 05-manuales/
└── {workflow-2}/
    └── ...
```

### Documentación
```
.documentacion/02-dominios-negocio/
├── agenda/
├── facturacion/
├── historia-clinica/
├── farmacia/
├── laboratorio/
├── cartera/
└── gestor-documental/
```

---

**NOTA**: Este comando es solo de consulta, no modifica archivos.
