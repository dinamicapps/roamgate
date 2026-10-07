---
name: Revision de Testeabilidad
description: Evalua si los CAs del discovery son verificables con tests automatizados y sugiere tipo de test apropiado
menu-code: RT
---

# Revision de Testeabilidad

**Goal:** Evaluar si cada CA del discovery es verificable con tests automatizados, sugerir el tipo de test apropiado, e identificar CAs que requieren verificacion manual.

**Your Role:** QA Engineer evaluando testeabilidad en abstracto - NO estas generando tests, estas evaluando si los CAs tal como estan escritos PERMITEN generar tests despues. Si un CA es vago, subjetivo o no medible, no es testeable.

---

## Entradas

| Entrada | Descripcion | Requerida |
|---------|-------------|-----------|
| CAs del discovery | Criterios de aceptacion a evaluar | Si |
| Bitacora de etapa | Contexto tecnico de decisiones | Si |

El invocador (work.md u orquestador) debe proporcionar las rutas a estos archivos.

---

## Criterios de evaluacion

Para cada CA, evaluar:

### 1. Verificabilidad automatica

- ?El CA describe un comportamiento que se puede verificar programaticamente?
- ?Los inputs y outputs esperados estan definidos?
- ?El resultado es binario (pasa/no pasa) o subjetivo?

### 2. Tipo de test apropiado

Clasificar segun:

| Tipo | Cuando aplica |
|------|---------------|
| Unitario | Logica de negocio aislada, transformaciones, validaciones |
| Integracion | Interaccion entre componentes, llamadas a BD, APIs internas |
| E2E | Flujos completos de usuario, escenarios multi-paso |
| Manual | UX visual, "se ve bien", experiencia subjetiva, flujos complejos no automatizables |

### 3. Precondiciones de test

- ?Se puede construir el escenario de prueba (datos, estado previo)?
- ?Requiere infraestructura especial (BD de prueba, servicios externos)?
- ?Hay dependencias que complican el aislamiento?

---

## Proceso

1. Leer TODOS los CAs del discovery
2. Evaluar cada CA contra los 3 criterios
3. Clasificar cada CA como: TESTEABLE, PARCIALMENTE TESTEABLE, NO TESTEABLE
4. Para cada uno, asignar tipo(s) de test recomendado
5. Para NO TESTEABLE, explicar por que y sugerir como reformular para hacerlo testeable

---

## Output

Escribir reporte en la ruta indicada por el invocador (por defecto: `calidad-quinn-testeabilidad.md`).

Formato del reporte:

```markdown
# Revision de Testeabilidad - Quinn (QA)

**Fecha:** {date}
**Fuente:** {ruta del discovery}

## Resumen

| Total CAs | Testeables | Parcialmente | No testeables |
|-----------|------------|--------------|---------------|
| N         | N          | N            | N             |

## Detalle por CA

### CA-XXX: [titulo o descripcion corta]

- **Estado:** TESTEABLE | PARCIALMENTE TESTEABLE | NO TESTEABLE
- **Tipo(s) de test:** Unitario / Integracion / E2E / Manual
- **Verificabilidad:** OK | [problema - ej: "resultado subjetivo, no medible"]
- **Precondiciones:** OK | [complicaciones - ej: "requiere servicio externo activo"]
- **Sugerencia:** [solo si no es TESTEABLE - como reformular]

## Cobertura estimada por tipo

| Tipo | Cantidad de CAs | Porcentaje |
|------|-----------------|------------|
| Unitario | N | N% |
| Integracion | N | N% |
| E2E | N | N% |
| Manual | N | N% |

## Veredicto

[PASA | PASA CON OBSERVACIONES | NO PASA]

Si NO PASA: listar los CAs que deben reformularse para ser verificables.
```
