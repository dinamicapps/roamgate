---
description: Inicia una sesión interactiva de descubrimiento con el usuario
argument-hint: "[tema]"
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
---

## Modo `--desde-work {work-id}`

Ver `commands/agent-os/documentar.md` seccion "Modo `--desde-work {work-id}`" para detalle del flujo cuando se invoca con flag.

Sin flag: continuar con el flujo descrito abajo.

# Sesión de Conocimiento: $1

Voy a iniciar una sesión interactiva de descubrimiento sobre **$1** usando el agente `doc-knowledge-session`.

## Preparación de la Sesión

### 1. Cargar contexto previo
Buscar y leer:
- `*/preguntas-*$1*.md` - Preguntas pendientes del arqueólogo
- `*/hallazgos-*$1*.md` - Lo que ya se descubrió
- Sesiones anteriores pausadas sobre el tema

### 2. Preparar agenda
Presentar al usuario:
```
╔════════════════════════════════════════════════════╗
║ Sesión de Conocimiento: $1                         ║
╠════════════════════════════════════════════════════╣
║ Preguntas pendientes: {N}                          ║
║ Tiempo estimado: {M} minutos                       ║
╠════════════════════════════════════════════════════╣
║ Temas a cubrir:                                    ║
║ 1. {Tema más crítico}                              ║
║ 2. {Segundo tema}                                  ║
║ 3. {Tercer tema}                                   ║
╚════════════════════════════════════════════════════╝
```

### 3. Confirmar disponibilidad
Preguntar al usuario:
- ¿Tiene tiempo para la sesión completa?
- ¿Prefiere sesión corta (15 min) o completa?
- ¿Hay algún tema específico que priorizar?

## Durante la Sesión

### Protocolo de Preguntas
1. Hacer UNA pregunta a la vez
2. Esperar respuesta completa
3. Si no está claro, pedir ejemplo o código
4. Documentar inmediatamente el hallazgo

### Checkpoints (cada 3-5 hallazgos)
```markdown
---
## Checkpoint {N} - {hora}
### Hallazgos:
- {Hallazgo 1}
- {Hallazgo 2}
---
```

### Si el Usuario Dice "No sé"
1. Preguntar quién podría saberlo
2. Documentar como "Pendiente de consulta con {persona}"
3. Pasar a siguiente pregunta

### Si el Usuario Dice "Pausa"
1. Guardar checkpoint inmediatamente
2. Documentar punto exacto de pausa
3. Listar preguntas pendientes
4. Marcar sesión como PAUSADA

## Al Finalizar

### Sesión Completa
1. Generar resumen ejecutivo
2. Listar documentación a actualizar
3. Guardar con estado COMPLETADA
4. Indicar: `/doc-consolidar $1`

### Sesión Pausada
1. Guardar estado actual
2. Documentar cómo retomar
3. Indicar: `/doc-retomar {archivo-sesion}`

## Ubicación de Archivos

```
.claude/rol-documentacion/workflows/{workflow-activo}/02-sesiones/
└── sesion-{fecha}-$1.md
```

---

**COMPORTAMIENTO CRÍTICO**:
- **ESCRIBIR INMEDIATAMENTE** cada hallazgo
- **NO acumular** información en memoria
- **CONFIRMAR entendimiento** antes de documentar
- **CHECKPOINTS frecuentes** para evitar pérdida
