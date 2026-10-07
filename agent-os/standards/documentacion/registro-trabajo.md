# Standard: Registro de Trabajo

## Estructura obligatoria

Todo registro de trabajo debe seguir esta estructura:

```
work-records/{nombre-trabajo}/
├── README.md               # Dashboard: estado, progreso, decisiones
├── etapa-0/contexto.md      # Standards cargados, historial, codebase
├── etapa-1/01-discovery.md  # Q&A con el usuario
├── etapa-2/
│   ├── 02-opciones.md      # Opciones evaluadas con pros/contras
│   ├── 03-plan.md          # Plan aprobado
│   └── 04-tareas.md        # Tareas detalladas
├── etapa-3/
│   ├── 05-ejecucion.md     # Log de ejecucion
│   └── 06-hallazgos.md     # Hallazgos encontrados
└── etapa-4/
    └── 07-verificacion.md  # Build, tests, validacion
```

## Naming

- Carpeta: kebab-case, descriptiva (`mejora-mcp-ia-online`, `usuarios-empresa`)
- Archivos: `NN-nombre.md` con numero de secuencia
- Etapas: `etapa-N/` con numero secuencial

## README del registro

Debe contener:
- Objetivo (1 parrafo)
- Estado actual (etapa, porcentaje)
- Tabla de progreso por etapa
- Decisiones clave (tabla fecha|decision|resolucion)
- Archivos clave modificados
- Credenciales de prueba (si aplica)

## Reglas

- No iniciar desarrollo sin completar etapa 1 (discovery)
- No escribir codigo sin aprobar etapa 2 (plan)
- Hallazgos se documentan en etapa-3/06-hallazgos.md, se pausan tareas, se resuelven
- Al cerrar, asegurar que README.md seccion "Archivos modificados" este completa con ruta, tipo de cambio y modulo
