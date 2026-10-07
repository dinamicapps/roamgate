---
description: Genera manual de usuario por rol
argument-hint: "[modulo] [rol]"
allowed-tools: Read, Write, Glob
---

# Generar Manual: $1 para $2

Voy a generar un manual de usuario del módulo **$1** para el rol **$2** usando el agente `doc-manual-writer`.

## Roles Disponibles

| Rol | Descripción | Nivel Técnico |
|-----|-------------|---------------|
| `clinico` | Médicos, enfermeras, admisiones | Bajo |
| `administrativo` | Facturación, cartera, archivo | Bajo-Medio |
| `tecnico` | Administradores, soporte IT | Alto |

## Proceso de Generación

### 1. Leer documentación técnica
Buscar y leer:
```
.documentacion/02-dominios-negocio/$1/proceso-*.md
.documentacion/02-dominios-negocio/$1/especificacion-tecnica-*.md
```

Si no existe:
- Informar al usuario
- Sugerir ejecutar `/doc-consolidar $1` primero

### 2. Identificar tareas por rol
Filtrar de la documentación técnica:
- Qué acciones puede realizar el rol $2
- Qué menús/pantallas son relevantes
- Qué información necesita ver

### 3. Traducir a lenguaje accesible
Según el rol:

**clinico**:
- Términos médicos OK
- Evitar jerga técnica de sistema
- Paso a paso detallado
- Ejemplos con casos clínicos

**administrativo**:
- Términos de negocio/facturación OK
- Explicar impacto de cada acción
- Paso a paso con contexto de negocio

**tecnico**:
- Términos técnicos aceptables
- Más conciso, menos paso a paso
- Incluir configuración y troubleshooting

### 4. Generar manual
Crear archivo:
```
.claude/rol-documentacion/workflows/{workflow-activo}/05-manuales/
└── manual-$2-$1.md
```

### 5. Identificar screenshots necesarios
Crear archivo:
```
.claude/rol-documentacion/workflows/{workflow-activo}/05-manuales/
└── pendientes-capturas-$1.md
```

## Formato del Manual

```markdown
# Manual de Usuario: $1

**Rol**: $2
**Versión**: {versión}
**Actualizado**: {fecha}

---

## Introducción
### ¿Qué es $1?
{Explicación en lenguaje del rol}

### ¿Para qué lo uso?
- {Tarea 1}
- {Tarea 2}

---

## Acceso al Módulo
1. Inicie sesión en eMedico
2. Vaya a **{Menú}** > **{Opción}**

📷 *[Captura: Navegación]*

---

## Tareas Comunes

### {Tarea 1}: {Nombre}
**Cuándo usar**: {contexto}

#### Pasos
1. **{Paso 1}**
   📷 *[Captura]*

2. **{Paso 2}**
   💡 *Consejo: {ayuda}*

#### ¿Qué pasa si...?
| Situación | Solución |
|-----------|----------|
| {problema} | {solución} |

---

## Preguntas Frecuentes
### ¿{Pregunta}?
{Respuesta}

---

## Glosario
| Término | Significado |
|---------|-------------|
| {término} | {explicación} |
```

### 6. Mostrar resumen
```
╔════════════════════════════════════════════════════╗
║ Manual Generado                                    ║
╠════════════════════════════════════════════════════╣
║ Módulo: $1                                         ║
║ Rol: $2                                            ║
║ Archivo: manual-$2-$1.md                           ║
╠════════════════════════════════════════════════════╣
║ Contenido:                                         ║
║ • Secciones: {N}                                   ║
║ • Tareas documentadas: {M}                         ║
║ • Capturas pendientes: {X}                         ║
╠════════════════════════════════════════════════════╣
║ Próximo paso:                                      ║
║ Tomar capturas según pendientes-capturas-$1.md    ║
╚════════════════════════════════════════════════════╝
```

---

**PRINCIPIOS DE ESCRITURA**:
- Lenguaje accesible según rol
- Pasos verificables y accionables
- No asumir conocimiento del sistema
- Identificar TODAS las capturas necesarias
- Basarse solo en documentación técnica (no inventar)
