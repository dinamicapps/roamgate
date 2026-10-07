---
name: propose-evolution
description: Escribe la propuesta formal con matriz de 5 decisiones, invariantes como contrato, y plan de implementacion.
menu-code: PE
---

# PE — Propose evolution (propuesta formal antes/despues)

> **Voz Sally:** La propuesta formal es el contrato tangible del rediseno.
> Pero antes del contrato hay una historia — por que este cambio, que protegemos,
> que simplificamos. Abre la propuesta con narrativa; la matriz y las tablas
> vienen despues.

Produce la propuesta de rediseno formal con matriz de 5 decisiones,
invariantes como contrato verificable, e inventario detallado.

**Cuando usar:**
- Invocada desde RD Sub-fase 5.c (standalone).
- Invocada desde LE en Etapa 2 del flujo gobernado (`/alfred`).
- Invocable directa si el usuario ya tiene direccion aprobada y prototipo
  aceptado, y solo pide formalizar la propuesta.

**Pre-requisitos:** debes tener prototipo aprobado y direccion elegida.

## Destino del archivo

- Si invocada desde el gobernador (`/alfred`): `etapa-2/02-propuesta-rediseno.md`.
- Si invocada standalone: `redesign-proposal-{YYYYMMDD}.md` en la ubicacion
  acordada con el usuario.

## Estructura obligatoria

Sigue `./evolution-templates/propuesta.md` exactamente. Las secciones criticas:

### 1. Resumen ejecutivo

3-5 lineas: que se redisena, decision principal, impacto esperado.

### 2. Estado actual vs propuesta (antes/despues)

Tabla comparativa por bloque funcional. Ejemplo:

| Bloque | Estado actual | Propuesta | Decision |
|--------|---------------|-----------|----------|
| Header | 8 controles | 3 controles | SIMPLIFICAR |
| Acciones | 12 botones | 5 botones | FUSIONAR + ELIMINAR |

### 3. Matriz de 5 decisiones detallada

Cada control/accion del scope debe aparecer en esta tabla. Es la fuente de
verdad. Si algun control del inventario no aparece, falta completar.

| ID | Control/Accion | Decision | Justificacion |
|----|----------------|----------|---------------|
| A-001 | Boton "Exportar XLS" | ELIMINAR | No usado en ultimo semestre (log) |
| A-002 | Campo "Observaciones" | MANTENER | Regla R-012 |

**Matriz de 5 decisiones:**

| Decision | Significado |
|----------|-------------|
| MANTENER | Funciona bien, no se toca |
| SIMPLIFICAR | Se conserva funcion, se reduce complejidad |
| FUSIONAR | Dos o mas elementos se combinan |
| ELIMINAR | La funcion deja de ofrecerse (requiere justificacion fuerte) |
| MIGRAR PROGRESIVO | Se reescribe con stack moderno; convive con legacy hasta corte |

### 4. Invariantes (contrato verificable)

Cada regla no-visible critica que el rediseno se compromete a preservar:

| ID | Invariante | Origen | Verificacion manual |
|----|------------|--------|---------------------|
| INV-001 | Log de auditoria registra todo save | Mary (compliance) | 1. Hacer save. 2. Verificar tabla audit_log tiene registro nuevo. 3. Confirmar campos usuario/timestamp. |
| INV-002 | Rol "enfermera" no ve campos financieros | Mary (regla negocio) | 1. Login como enfermera. 2. Abrir ventana. 3. Confirmar ausencia de seccion "Costos". |

**Regla:** cada invariante tiene ID, descripcion, origen (experto que la
identifico), y procedimiento manual de verificacion con pasos numerados y
resultado esperado concreto.

### 5. Plan de implementacion

- Lista de archivos afectados (frontend/backend/db).
- Orden sugerido de cambios.
- Si aplica: seccion "Migracion progresiva" con ventana de coexistencia,
  criterio de corte, feature flags, legacy a deprecar.

### 6. Metricas objetivo (para VE)

Tabla de metricas con objetivo cuantificable:

| Metrica | Actual | Objetivo | Como se medira |
|---------|--------|----------|----------------|
| Densidad visual (controles visibles) | 28 | 17 | Inspeccion del DOM |
| Pasos para crear entidad | 12 | 5 | Flujo manual cronometrado |

## Validaciones antes de cerrar

Antes de considerar la propuesta lista:

- [ ] Cada control del inventario tiene fila en la matriz detallada.
- [ ] Cada invariante tiene ID unico, origen identificado, verificacion con pasos ejecutables.
- [ ] Plan de implementacion lista archivos reales (no placeholders).
- [ ] Metricas son medibles (no "mejor UX" — si "menos de X controles visibles").

Si algo falla, no cierras PE — iteras hasta que este completo.

## Al cerrar

- Si bajo el gobernador (`/alfred`): devuelves control con "Propuesta lista en etapa-2/02-propuesta-rediseno.md. Invariantes declaradas: {N}. Solicito revisiones cruzadas."
- Si standalone: presentas al usuario con resumen y ruta del archivo. Si el usuario pide ajustes, iteras.

Sigue Session Close del SKILL.md de Sally.
