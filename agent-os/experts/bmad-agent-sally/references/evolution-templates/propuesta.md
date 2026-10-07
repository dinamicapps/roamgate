````markdown
# Plantilla: etapa-2/02-propuesta-rediseno.md

**Uso:** Sally genera este artefacto en la Sub-fase 5.c del guion, despues de que el usuario aprueba el prototipo.

**Reglas no-negociables:**
1. El inventario detallado es la fuente de verdad — incluye todos los controles del scope.
2. La matriz de 5 decisiones aparece DOS veces: agrupada por bloque funcional (vista principal) y detallada (referenciable).
3. Cada invariante declarada va con verificacion manual descrita paso a paso.

## Estructura

```markdown
---
status: in_progress
completedAt: null
inputDocuments:
  - etapa-1/01-discovery-distillate.md
  - etapa-1/01-viabilidad.md
  - etapa-1/cas-consolidados.md
  - etapa-2/mockups/rediseno-{nombre}.{html|md}
---

# Propuesta de rediseno: {scope}

## Resumen
- Direccion aprobada: {ID + titulo de la short-list}
- Metricas objetivo: {lista concreta — ej: "densidad -40%", "clicks flujo agendamiento: 12 → 5"}
- Prototipo: mockups/rediseno-{nombre}.{html|md}

## Matriz de decisiones (vista agrupada por bloque funcional)

### Bloque: Cabecera
- Decision global: SIMPLIFICAR
- Resumen: reduccion de controles de header; fusion de Tab Historial con Tab Auditoria
- Expandir detalle → ver inventario detallado abajo

### Bloque: Acciones
- Decision global: MIGRAR PROGRESIVO
- Resumen: migracion de validaciones a stack moderno; eliminacion de export PDF sin uso
- Expandir detalle → ver inventario detallado abajo

## Inventario detallado (fuente de verdad)

| ID | Control | Bloque | Decision | Justificacion | Invariante |
|----|---------|--------|----------|---------------|------------|
| A-001 | Boton Guardar | Cabecera | MANTENER | Accion critica | INV-001 |
| A-002 | Campo Fecha | Cabecera | SIMPLIFICAR | Mascara automatica elimina 2 clicks | — |
| A-003 | Tab Historial | Cabecera | FUSIONAR con Tab Auditoria | Ambos muestran eventos temporales | INV-003 |
| A-004 | Boton Exportar PDF | Acciones | ELIMINAR | Sin uso en los ultimos 12 meses (log de auditoria) | — |
| A-005 | Form validacion email | Acciones | MIGRAR PROGRESIVO | Parte de migracion a stack moderno | INV-005 |

## Invariantes (checklist verificable en Etapa 4)

| ID | Invariante | Origen | Verificacion |
|----|------------|--------|--------------|
| INV-001 | Boton Guardar sigue disparando SP auditoria_pacientes | Mary | Manual: abrir ventana, hacer cambio, Guardar, verificar registro en tabla auditoria_pacientes con timestamp actual |
| INV-002 | Permisos rol Enfermera no cambian | Mary | Manual: login como enfermera, intentar acciones admin (ej: eliminar paciente), debe mostrar "acceso denegado" |
| INV-003 | Calculo de edad mantiene formato existente | Mary | Manual: paciente con fecha_nacimiento = 1990-01-01, abrir ficha, verificar que edad se muestra como "34" (no "34 anos", no "34a") |
| INV-005 | Validacion de email sigue rechazando formatos invalidos durante la migracion progresiva | Winston | Manual: intentar guardar con email "invalido@" — ambas versiones (legacy y nueva) deben rechazar con mensaje equivalente |

## Plan de implementacion

### Archivos afectados
- {ruta 1} — {cambio breve}
- {ruta 2} — {cambio breve}

### Orden de implementacion
1. {paso 1}
2. {paso 2}

### Migracion progresiva (si hay decisiones MIGRAR PROGRESIVO)
- Convivencia legacy/nuevo: {descripcion}
- Criterio de corte: {cuando se deprecia el legacy}
- Archivos legacy afectados: {lista}
- Archivos nuevos: {lista}

### Dependencias externas
- {integraciones, APIs, SPs afectados}
```
````
