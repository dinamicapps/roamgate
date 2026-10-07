# Hallazgos bloqueantes

Un hallazgo es bloqueante si impide completar las pruebas: campo faltante, tipo mismatch, endpoint inexistente, ruta cambiada, contrato incompatible.

Cada bloqueante se documenta, se discute en sesion del bridge, y se resuelve antes de continuar. La sesion del grupo NO puede cerrarse en verde mientras existan bloqueantes `abierto` o `en-resolucion`.

## B-001 — {titulo corto}

- **Detectado por:** {director | colaborador:{nombre}}
- **Fecha:** {YYYY-MM-DD}
- **Descripcion:** {que se detecto}
- **Impacto:** {que no se puede hacer hasta resolverlo}
- **Resolucion propuesta:**
  - **Opcion elegida:**
  - **Genera CA:** CA-NNN en etapa-{N} (si aplica)
  - **Genera tarea:** T-NNN en etapa-{N} (si aplica)
  - **Genera nueva version de contrato:** {endpoint}/v{N}-draft.yml (si aplica)
- **Estado:** abierto | en-resolucion | cerrado
- **Evidencia de cierre:** {link a commit / evidencia de prueba / mensaje bridge}
