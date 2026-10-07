---
description: Diseña casos de prueba desde documentación técnica
argument-hint: "[modulo]"
allowed-tools: Read, Write, Glob, Grep
---

# Diseñar Tests: $1

Voy a diseñar especificaciones de casos de prueba para el módulo **$1** usando el agente `doc-test-case-designer`.

## Proceso de Diseño

### 1. Leer documentación consolidada
Buscar y leer:
```
.documentacion/02-dominios-negocio/$1/proceso-*.md
.documentacion/02-dominios-negocio/$1/especificacion-tecnica-*.md
```

Si no existe documentación consolidada:
- Informar al usuario
- Sugerir ejecutar `/doc-consolidar $1` primero

### 2. Revisar tests existentes
Buscar en el proyecto:
```
IntegrationTest/**/*$1*.cs
TSFacturacion/**/*$1*.cs (si aplica)
```

Identificar:
- Qué ya está probado
- Qué patrones de test usa el proyecto
- Gaps de cobertura

### 3. Identificar flujos a probar
Categorizar por prioridad:
```
CRÍTICO (probar primero):
□ Flujos de dinero
□ Datos sensibles de paciente
□ Integraciones RIPS/FEV/DIAN
□ Seguridad y permisos

IMPORTANTE:
□ Flujos principales de negocio
□ Validaciones de entrada
□ Transiciones de estado

DESEABLE:
□ Edge cases
□ Combinaciones de parámetros
```

### 4. Diseñar casos de prueba
Para cada flujo identificado:
1. Caso exitoso (happy path)
2. Validaciones fallidas
3. Reglas de negocio violadas
4. Errores de integración

### 5. Generar especificación
Crear archivo:
```
.claude/rol-documentacion/workflows/{workflow-activo}/04-tests/
└── specs-tests-$1.md
```

## Formato de Especificación

```markdown
# Especificaciones de Tests: $1

## Resumen
**Documentación base**: {archivo fuente}
**Tests existentes**: {cantidad}
**Nuevos tests propuestos**: {cantidad}

---

## Test Suite: {Nombre del Flujo}

### TC-001: {Nombre} (Happy Path)
**Prioridad**: Alta
**Tipo**: Integración

#### Precondiciones
- {Condición 1}

#### Datos de Entrada
| Campo | Valor |
|-------|-------|
| {campo} | {valor} |

#### Pasos
1. {Paso}

#### Resultado Esperado
- {Resultado}

#### Verificaciones
- [ ] {Verificación BD}
- [ ] {Verificación respuesta}

---

### TC-002: {Nombre} - Validación Fallida
...

---

## Matriz de Cobertura

| Regla de Negocio | Tests |
|------------------|-------|
| RN-001 | TC-001, TC-003 |

---

## Datos de Prueba Requeridos
| Entidad | Cantidad | Características |
|---------|----------|-----------------|
| {entidad} | {N} | {descripción} |
```

### 6. Mostrar resumen
```
╔════════════════════════════════════════════════════╗
║ Especificaciones Generadas: $1                     ║
╠════════════════════════════════════════════════════╣
║ Casos de prueba diseñados: {N}                     ║
║   - Críticos: {X}                                  ║
║   - Importantes: {Y}                               ║
║   - Deseables: {Z}                                 ║
╠════════════════════════════════════════════════════╣
║ Archivo: specs-tests-$1.md                         ║
╠════════════════════════════════════════════════════╣
║ Próximo paso:                                      ║
║ Implementar tests en IntegrationTest/              ║
╚════════════════════════════════════════════════════╝
```

---

**IMPORTANTE**:
- **Solo especificaciones**, no código de tests
- Referenciar documentación fuente
- Considerar tests existentes para evitar duplicación
- Priorizar por criticidad de negocio
