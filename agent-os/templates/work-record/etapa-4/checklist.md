# Checklist Etapa 4 - Gate de Verificacion

Verificar cada item antes de presentar el gate. Si algun item no pasa, resolver primero.

## Criterios de entrada
- [ ] Build exitoso y documentado
- [ ] Todas las tareas de Etapa 3 completadas
- [ ] test-env.local.json existe y tiene datos validos
- [ ] Sistema de pruebas accesible (health check OK)

## Plan de prueba
- [ ] Plan de prueba generado (etapa-4/plan-prueba.md)
- [ ] Checkpoints definidos con CAs asociados, precondiciones y resultado esperado
- [ ] Cada CA MUST tiene al menos 1 checkpoint asignado
- [ ] Plan aprobado por el usuario

## Ejecucion de verificacion
- [ ] Verificacion ejecutada por subagentes segun plan de prueba, no por work
- [ ] Si pool: Sentinel (IL) ejecutado como subagente
- [ ] Si pool: Amelia (CR) ejecutada como subagente
- [ ] Si pool: Tessa (E2E) ejecutada como subagente
- [ ] Si pool: Sentinel (PA) ejecutado como subagente
- [ ] Si pool: Quinn (VC) consolido como subagente
- [ ] Pruebas E2E ejecutadas (o usuario autorizo omision explicita)

## Protocolo de calidad
- [ ] Cada fallo investigado con protocolo forense (no especulacion)
- [ ] Cada incidente tiene ID unico (INC-NNN) con severidad y prioridad
- [ ] No se ejecutaron acciones manuales sin autorizacion (anti-manipulacion)
- [ ] Bugs preexistentes clasificados (Tipo A/B/C) y decididos por usuario
- [ ] Negative provenance documentada (que NO paso y debia pasar)
- [ ] Logs forenses removidos despues de diagnostico

## Cobertura y artefactos
- [ ] Todos los CAs del discovery tienen al menos una prueba asociada
- [ ] Tabla de cobertura de CAs completa con resultado por cada uno
- [ ] Tests E2E deterministas generados en etapa-4/e2e/specs/
- [ ] Screenshots de evidencia en etapa-4/e2e/screenshots/
- [ ] 07-verificacion.md generado con template (12 secciones)

## Cierre
- [ ] Postcondiciones verificadas (BD, codigo, sistema, git)
- [ ] Desviaciones del plan documentadas
- [ ] Lecciones aprendidas registradas
- [ ] Spec del modulo generada/actualizada por subagente (Paige/Atlas)
- [ ] Consolidacion en epica/specs completada (skill consolidar-work ejecutado)
- [ ] Cierre git ejecutado (skill cerrar-work-git ejecutado)
