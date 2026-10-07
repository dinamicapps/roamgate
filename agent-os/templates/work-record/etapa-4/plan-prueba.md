---
status: pending
completedAt: null
inputDocuments:
  - etapa-1/cas-consolidados.md
  - etapa-2/tareas/
  - etapa-3/06-hallazgos.md
---

# Plan de Prueba — {nombre del work}

fecha: {YYYY-MM-DD}

## Riesgos de prueba

| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|-------------|---------|------------|
| RP-001 | {descripcion del riesgo para las pruebas} | Alta/Media/Baja | Alto/Medio/Bajo | {como se mitiga} |

## Checkpoints

Cada checkpoint es un test case formal. Cada CA MUST debe tener al menos 1 checkpoint.

Checkpoints de UI ademas declaran su **ruta de llegada** en el detalle (navegar como usuario es parte de la prueba; `browser_navigate` directo a la URL es una excepcion que se declara con razon, no el default).

| CP | Descripcion | CAs | Tipo | Ejecuta | Precondiciones | Resultado esperado |
|----|------------|-----|------|---------|----------------|-------------------|
| CP-001 | {que se prueba} | CA-{NNN}, CA-{NNN} | Unitario / E2E / Seguridad / Review | {agente: Quinn/Tessa/Sentinel/Amelia/Atlas} | {que debe estar listo: build, datos, otro CP} | {que se considera PASS — verificable, no ambiguo} |

### Detalle de checkpoints

#### CP-001: {titulo}

- **CAs asociados:** CA-{NNN}, CA-{NNN}
- **Tipo:** Unitario | E2E | Seguridad | Review
- **Ejecuta:** {agente}
- **Precondiciones:**
  - [ ] {Build exitoso}
  - [ ] {CP-{NNN} completado con PASS}
  - [ ] {Dato X existe}
- **Ruta de llegada (obligatoria si el checkpoint toca UI):**
  - {los 3 componentes del contexto de llegada: cadena de navegacion que el
    ejecutor recorre COMO USUARIO para llegar a la pantalla + prerequisitos del actor (IDs/codigos, de que pantalla salen, con formato) + receta del dato de prueba. Consultar y citar la entrada de `agent-os/product/mapa-llegada.md` si existe.}
  - {o "EXCEPCION DECLARADA: URL directa — razon: {pantalla sin entrada de menu / re-iteracion de un camino ya recorrido y verificado en este mismo work}"}
  <!-- FUENTE: ../../diseno/schema/modelo.md seccion "Contexto de llegada". La definicion de contexto de llegada (3 componentes) vive alli; aqui se instancia por checkpoint de UI. NO duplicar la regla — para modificar, editar la fuente. -->
- **Accion:**
  1. {Paso concreto}
  2. {Paso concreto}
- **Resultado esperado:**
  - {Criterio verificable — ej: response 201 con campo id}
  - {Criterio verificable — ej: registro en BD con estado X}
- **Postcondiciones:**
  - {Estado esperado despues de ejecutar — ej: pedido en estado reservado}

## Orden de ejecucion

{Derivado de las cadenas criticas de CAs y las precondiciones de cada checkpoint.}

CP-001 → CP-002 → [CP-003, CP-004] (paralelo) → CP-005
{Si hay dependencias: CP-003 depende de CP-001}

## Criterios de exito

- Todos los CAs MUST verificados por al menos 1 checkpoint PASS
- 0 incidentes Critical sin resolver al cerrar
- Cobertura: {N}% de CAs con prueba real

## Resumen de cobertura

| CA | Descripcion | Checkpoint(s) |
|----|------------|---------------|
| CA-{NNN} | {desc} | CP-001, CP-003 |
| CA-{NNN} | {desc} | CP-002 |
| CA-{NNN} | {desc} | — (sin checkpoint: {razon}) |
