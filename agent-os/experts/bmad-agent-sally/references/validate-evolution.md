---
name: validate-evolution
description: Revalidacion post-implementacion contra invariantes declaradas y metricas objetivo.
menu-code: VE
---

# VE — Validate evolution (revalidacion post-implementacion)

> **Voz Sally:** Validar invariantes no es tick-box. Cada invariante representa
> una regla que le prometiste al usuario preservar. Al ejecutar la verificacion,
> nota como se siente el rediseno implementado — y si algo falla, cuentale al
> usuario con honestidad: aqui no cumplimos, esto fue lo que paso.

Despues de implementar el rediseno, valida que las invariantes declaradas
en la propuesta se preservan Y mide las metricas objetivo.

**Cuando usar:**
- Usuario te invoca directo tras implementar un RD standalone.
- El gobernador (`/alfred`) te invoca en Etapa 4 con capacidad `VE`.

**Pre-requisitos:** debe existir propuesta formal (output de PE) y codigo
implementado que realiza el rediseno.

## Inputs

- **Propuesta** (`etapa-2/02-propuesta-rediseno.md` o `redesign-proposal-*.md`).
- Codigo implementado (archivos afectados en el plan de la propuesta).
- Prototipo aprobado para comparacion visual.

## Outputs

### 1. Validacion de invariantes

**Destino:**
- Bajo el gobernador: `etapa-4/04-invariantes.md`.
- Standalone: `redesign-invariants-{YYYYMMDD}.md`.

**Accion:** por cada invariante declarada, ejecutas el procedimiento manual
descrito. Resultado: PASA / FALLA / NO VERIFICABLE.

Estructura:

```markdown
---
status: in_progress | complete
---

# Validacion de invariantes

Total: {N} — {N} PASA, {N} FALLA, {N} NO VERIFICABLE

| ID | Invariante | Verificacion ejecutada | Resultado | Evidencia |
|----|------------|------------------------|-----------|-----------|
| INV-001 | ... | <pasos efectivos> | PASA | <captura/log> |
| INV-002 | ... | <pasos> | FALLA | <razon: X no se registra> |
```

**Regla:** invariante en FALLA = hallazgo bloqueante. Bajo el gobernador entra al
ciclo de resolucion estandar. Standalone: comunicas al usuario y propones
fix antes de cerrar VE.

Si el gobernador te invoca, lanza a Quinn en paralelo para validar que
tus verificaciones son ejecutables. Sus outputs: `etapa-4/validacion-invariantes-quinn.md`.

### 2. Revalidacion UX

**Destino:**
- Bajo el gobernador: `etapa-4/04-revalidacion-ux.md`.
- Standalone: `redesign-ux-revalidation-{YYYYMMDD}.md`.

**Accion:**
1. Lees seccion "Metricas objetivo" de la propuesta.
2. Exploras la app implementada (Grep/Glob/Read). Si `playwright` esta en
   `capabilities-catalog.md`, usalo para capturar screenshots.
3. Mides cada metrica.

Estructura:

```markdown
# Revalidacion UX

## Metricas objetivo vs medidas
| Metrica | Objetivo | Medida actual | Delta | Estado |
|---------|----------|---------------|-------|--------|
| Densidad visual | -40% (28→17) | 16 | -43% | SUPERADO |
| Pasos para crear | 12→5 | 6 | -50% | PARCIAL |

## Observaciones cualitativas
<Narras con tu voz como se comporta el rediseno en escenarios reales>

## Veredicto
- Objetivo alcanzado: SI / PARCIAL / NO
- Justificacion: <texto>
- Recomendacion: aceptar / documentar deuda / iteracion adicional
```

**Regla:** metricas en PARCIAL o NO alcanzado NO bloquean el gate
automaticamente — son informativas. El usuario decide si acepta o pide iteracion.

### 3. Back-to-exploracion

**Destino:**
- Bajo el gobernador: `etapa-4/04-back-to-exploracion.md`.
- Standalone: `redesign-back-to-explore-{YYYYMMDD}.md`.

**Accion:** lista ventanas/flujos cuyo comportamiento observable cambio y
cuya documentacion/exploracion debe refrescarse.

Estructura:

```markdown
# Back-to-exploracion

Flujos afectados cuyo estado documentado ya no refleja realidad:

- `<ruta-flujo>` — cambio: <que cambio observablemente>. Impacto doc: <ruta-doc-a-revisar>.
- `<ruta-flujo>` — ...
```

Este archivo se archiva; no genera tarea automatica.

## Al cerrar VE

- Si bajo el gobernador: devuelves al gobernador con resumen: "Invariantes: N total, N PASA, N FALLA. Metricas: N alcanzadas, N parcial, N no. Back-to-explorar: N items."
- Si standalone: presentas resumen al usuario. Si hay FALLAS criticas, propones fix antes de cerrar definitivamente.

Sigue Session Close del SKILL.md — si aprendiste algo no-trivial sobre
herramientas usadas (ej. playwright en ciertos patrones), actualiza libreta.
