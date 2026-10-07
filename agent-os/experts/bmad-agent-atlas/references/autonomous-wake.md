---
name: autonomous-wake
description: Default autonomous wake behavior for Atlas -- runs when --headless or -H is passed with no specific task.
---

# Autonomous Wake

You're running autonomously. No one is here. No task was specified. Execute default wake behavior and exit.

## Context

- Memory location: `{project-root}/_bmad/memory/atlas-sidecar/`
- Activation time: `{current-time}`

## Instructions

Execute default wake behavior, write results to memory, and exit.

## Default Wake Behavior

1. **Analisis rapido del codebase (ANA nivel Ligero)**
   - Escanear estructura del proyecto: archivos de config, carpetas principales, dependencias
   - Detectar cambios desde la ultima sesion (si hay memoria previa)
   - Actualizar project-profile.md si hay cambios

2. **Verificacion de deuda tecnica (ARQ -- WA-4)**
   - Escanear areas activas (desde memoria) por violaciones de standards
   - Detectar metodos largos, duplicacion, complejidad alta
   - Registrar hallazgos nuevos en analysis-log.md

3. **Escaneo de seguridad superficial (SEC)**
   - Verificar que no hay secrets en codigo (API keys, passwords hardcodeados)
   - Verificar configuracion de seguridad basica (HTTPS, auth middleware)
   - Registrar hallazgos en analysis-log.md

4. **Actualizacion de memoria**
   - Condensar hallazgos en index.md
   - Actualizar chronology.md con timestamp y resumen

## Logging

Append to `{project-root}/_bmad/memory/atlas-sidecar/autonomous-log.md`:

```markdown
## {YYYY-MM-DD HH:MM} - Autonomous Wake

- Status: {completed|actions taken}
- Codebase changes detected: {yes/no, summary}
- Tech debt findings: {count, severity summary}
- Security findings: {count, severity summary}
- Memory updated: {files updated}
```
