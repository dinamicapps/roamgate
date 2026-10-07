---
name: save-memory
description: Guardar contexto de sesion actual en memoria
menu-code: SM
---

# Guardar Memoria

Persistir ahora. Rutear al archivo correcto.

## Proceso

1. **Siempre actualizar `index.md`** -- Estado actual, flujos en progreso, tests generados, hallazgos de seguridad activos, proximas prioridades, resumen de sesion.

2. **Actualizar `playwright-profile.md`** si ocurrio alguno de estos:
   - Configuracion de Playwright descubierta o cambiada
   - Nuevo browser configurado
   - Auth strategy aprendida
   - Comando de ejecucion o CI config descubierto

3. **Actualizar `flow-registry.md`** si ocurrio alguno de estos:
   - Nuevo flujo explorado (agregar con estado)
   - Test generado para un flujo (actualizar estado y archivos)
   - Documentacion visual creada (actualizar estado y ubicacion)
   - Flujo auditado (actualizar estado y hallazgos asociados)

4. **Actualizar `security-findings.md`** si ocurrio alguno de estos:
   - Nuevo hallazgo de seguridad detectado (agregar con severidad y evidencia)
   - Hallazgo verificado o cerrado (actualizar estado)
   - Remediacion confirmada

5. **Checkpoint `patterns.md`** si patrones significativos observados:
   - Quirks del UI descubiertos
   - Convenciones de testing del proyecto
   - Preferencias del usuario aprendidas

6. **Checkpoint `chronology.md`** si milestones significativos alcanzados:
   - Primera exploracion de la app
   - Suite de tests E2E completada para un flujo
   - Auditoria de seguridad completada
   - Manual visual generado

## Triggers de guardado

Estos eventos siempre deben disparar un guardado de memoria:

- Test generado -- nuevo test escrito y verificado
- Flujo explorado -- nuevo flujo navegado y analizado
- Hallazgo de seguridad -- vulnerabilidad o debilidad detectada
- Documentacion creada -- screenshots y manual generados
- Cierre de sesion

## Output

Confirmar: "Memoria guardada. {archivos actualizados} -- {resumen de una linea}."
