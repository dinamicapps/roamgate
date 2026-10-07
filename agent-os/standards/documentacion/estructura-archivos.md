# Standard: Estructura de Archivos de Documentacion

## Tamano de archivos

- Maximo ~500 lineas por archivo markdown
- Si un archivo crece demasiado, dividir por responsabilidad
- Preferir varios archivos pequenos sobre uno grande y denso

## Tablas de progreso

Usar formato consistente:

```markdown
| Etapa | Descripcion | Tareas | Completadas | Estado |
|------|-------------|--------|-------------|--------|
| 0    | Contexto    | -      | -           | HECHO  |
| 1    | Discovery   | 5      | 5           | HECHO  |
| 2    | Plan        | 3      | 3           | HECHO  |
| 3    | Ejecucion   | 12     | 8           | EN PROGRESO |
| 4    | Verificacion| 0      | 0           | PENDIENTE |
```

## Formato de tareas

```markdown
### T-001: Descripcion de la tarea
- **Tipo**: Backend | Frontend | BD | Integracion
- **Archivos**: `ruta/archivo.cs`, `ruta/otro.js`
- **Estado**: PENDIENTE | EN PROGRESO | HECHO
- **Pasos**:
  1. Paso especifico
  2. Otro paso
```

## Formato de hallazgos

```markdown
### H-001: Descripcion del hallazgo
- **Severidad**: CRITICO | ALTO | MEDIO | BAJO
- **Detectado en**: Etapa 3, tarea T-005
- **Impacto**: Que afecta
- **Resolucion**: Que se hizo para resolverlo
- **Estado**: RESUELTO | PENDIENTE
```
