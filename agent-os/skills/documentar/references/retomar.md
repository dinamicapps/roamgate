---
description: Retoma una sesión de conocimiento pausada
argument-hint: "[archivo-sesion]"
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
---

# Retomar Sesión: $1

Voy a retomar la sesión pausada **$1**.

## Proceso de Retoma

### 1. Cargar sesión anterior
Leer el archivo de sesión:
```
.claude/rol-documentacion/workflows/*/02-sesiones/$1
```

### 2. Verificar estado
El archivo debe tener:
- **Estado**: PAUSADA
- **Sección "Para Retomar"** con:
  - Último checkpoint
  - Preguntas sin resolver
  - Próximo tema a explorar
  - Contexto necesario

Si el estado es COMPLETADA, informar al usuario y sugerir nueva sesión.

### 3. Mostrar resumen de la sesión anterior
```
╔════════════════════════════════════════════════════╗
║ Retomando: $1                                      ║
╠════════════════════════════════════════════════════╣
║ Última actualización: {fecha-hora}                 ║
║ Checkpoints completados: {N}                       ║
║ Preguntas resueltas: {X} de {Y}                    ║
╠════════════════════════════════════════════════════╣
║ Donde quedamos:                                    ║
║ {Resumen del último checkpoint}                    ║
╠════════════════════════════════════════════════════╣
║ Pendiente:                                         ║
║ • {Pregunta 1}                                     ║
║ • {Pregunta 2}                                     ║
╚════════════════════════════════════════════════════╝
```

### 4. Confirmar con el usuario
Preguntar:
- ¿Continúa el mismo participante o hay alguien nuevo?
- ¿Hay contexto adicional desde la última sesión?
- ¿Listo para continuar?

### 5. Continuar sesión
1. Actualizar estado a EN_PROGRESO
2. Crear nuevo checkpoint con nota "Sesión retomada"
3. Continuar con primera pregunta pendiente
4. Seguir protocolo de sesión normal

## Actualización del Archivo

Al retomar, agregar al archivo existente:
```markdown
---

## Sesión Retomada - {fecha-hora}
**Participante**: {nombre/rol}
**Contexto adicional**: {si hay}

---

## Checkpoint {N+1} - {hora}
### Nota: Sesión retomada desde Checkpoint {N}
...
```

## Ubicación de Archivos

Los archivos de sesión están en:
```
.claude/rol-documentacion/workflows/*/02-sesiones/sesion-*.md
```

Para buscar sesiones pausadas:
```bash
grep -l "Estado.*PAUSADA" .claude/rol-documentacion/workflows/*/02-sesiones/*.md
```

---

**IMPORTANTE**:
- Leer TODO el contexto previo antes de continuar
- No repetir preguntas ya resueltas
- Mantener numeración de checkpoints continua
- Si hay dudas sobre contexto, preguntar al usuario
