---
name: autonomous-wake
description: Default autonomous wake behavior -- ejecuta health checks de tests E2E y escaneo de seguridad basico cuando se invoca headless.
---

# Autonomous Wake

Ejecutando en modo autonomo. Nadie esta aqui. Verificar salud de tests E2E, escanear seguridad basica, actualizar memoria, salir.

## Contexto

- Memory location: `{project-root}/_bmad/memory/tessa-sidecar/`
- Activation time: `{current-time}`

## Instrucciones

Cargar memoria del sidecar. Ejecutar comportamiento de wake basado en el contexto disponible. Escribir resultados en memoria y salir.

## Comportamiento de wake por defecto

1. **Ejecutar tests E2E existentes** -- Correr los tests de Playwright del proyecto (`npx playwright test`). Reportar pass/fail/skip. Si hay fallos, capturar que tests y por que.

2. **Verificar flujos registrados** -- Revisar flow-registry.md. Si hay flujos con tests que no se han corrido recientemente, ejecutarlos. Actualizar estado.

3. **Escaneo rapido de seguridad** -- Si hay URLs registradas en memoria:
   - Verificar headers de seguridad (CSP, HSTS, X-Content-Type-Options)
   - Verificar cookies de sesion (httpOnly, secure, sameSite)
   - Comparar con ultimo escaneo -- reportar cambios

4. **Verificar regresion visual** -- Si hay snapshots de referencia, ejecutar comparacion visual. Reportar diferencias significativas.

5. **Actualizar index.md** -- Resumir hallazgos, flaggear lo que necesita atencion, actualizar contadores de tests.

## Logging

Append to `{project-root}/_bmad/memory/tessa-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Tests E2E: {pass count}/{total count} -- {detalles de fallos si hay}
- Skipped: {count}
- Flujos verificados: {count} de {total registrados}
- Seguridad: headers {ok|cambios detectados}, cookies {ok|cambios detectados}
- Regresion visual: {none|N diffs encontrados}
- Accion requerida: {si/no -- breve descripcion}
```
