---
description: Consolida hallazgos en documentacion estructurada
argument-hint: "[modulo]"
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
version: 2.0
---

## Modo `--desde-work {work-id}`

Ver `commands/agent-os/documentar.md` seccion "Modo `--desde-work {work-id}`" para detalle del flujo cuando se invoca con flag.

Sin flag: continuar con el flujo descrito abajo.

# Consolidar Documentacion: $1

Voy a consolidar los hallazgos del modulo **$1** en documentacion estructurada usando el agente `doc-technical-writer`.

## Changelog
| Version | Fecha | Cambio |
|---------|-------|--------|
| v2.0 | 2025-12-16 | Correccion de rutas, deteccion de workflow, multiples destinos, limpieza |
| v1.0 | 2025-12-07 | Version inicial |

---

## Proceso de Consolidacion

### 0. Detectar workflow activo

Buscar directorio del workflow que contenga "$1" en su nombre (case-insensitive):

```
.claude/rol-documentacion/workflows/exploracion-$1/
.claude/rol-documentacion/workflows/*$1*/
.claude/rol-documentacion/workflows/$1/
```

**Nota**: Convertir `$1` a minusculas para la busqueda (ej: `BLAgenda` -> `blagenda`)

**Si no existe ninguno:**
> No hay workflow de exploracion para **$1**.
> Ejecutar primero: `/doc:explorar $1`

**Si hay multiples coincidencias**, preguntar cual usar.

**Una vez detectado**, usar esa ruta como `{workflow}` para los pasos siguientes.

---

### 1. Recopilar fuentes

Buscar y leer todos los archivos relacionados:

```
{workflow}/01-exploracion/hallazgos-*.md
{workflow}/02-sesiones/sesion-*$1*.md
.documentacion/02-dominios-negocio/$1/
.documentacion/03-entidades-base/
```

---

### 1.5 Verificar sesiones completadas

Para cada sesion encontrada en `{workflow}/02-sesiones/`:
1. Leer archivo y verificar estado
2. Si tiene `Estado: COMPLETADA` -> Proceder
3. Si tiene `Estado: PAUSADA` -> Advertir al usuario

**Si no hay sesiones COMPLETADAS:**
> Hay sesiones pendientes. Completar con `/doc:sesion $1` o continuar sin ellas.

---

### 2. Validar documentacion existente

Para cada documento existente en `.documentacion/`:

1. **Leer documento completo**
2. **Comparar con hallazgos nuevos**
3. **Clasificar cada seccion**:
   - VIGENTE: Mantener sin cambios
   - PARCIAL: Actualizar con nueva info
   - OBSOLETO: Reescribir
   - FALTANTE: Agregar nuevo

---

### 2.5 Determinar destinos de consolidacion

Analizar los hallazgos y clasificar por tipo de destino:

| Tipo de Hallazgo | Destino en .documentacion/ |
|------------------|---------------------------|
| Proceso de negocio (BL*) | `02-dominios-negocio/{modulo}/` |
| Entidad/Modelo de datos | `03-entidades-base/{entidad}.md` |
| Integracion externa | `04-integraciones/{sistema}.md` |
| Patron/Guia desarrollo | `05-desarrollo/{tema}.md` |
| Esquema BD/SP/Vista | `06-base-datos/{area}.md` |
| API/Endpoint | `07-apis-servicios/{api}.md` |
| Permisos/Seguridad | `08-seguridad/{tema}.md` |
| Error/Problema | `09-troubleshooting/{error}.md` |
| Normativa | `10-normativa/{categoria}/` |

**Si hay hallazgos para multiples destinos:**
```
Se encontraron hallazgos para {N} destinos diferentes:
- 02-dominios-negocio/{modulo}/ (X hallazgos)
- 03-entidades-base/{entidad}.md (Y hallazgos)
- 06-base-datos/{area}/ (Z hallazgos)

Consolidar: [T] Todos | [S] Seleccionar | [P] Solo principal
```

---

### 3. Generar reporte de cambios propuestos

Antes de aplicar cambios, mostrar:

```
=====================================================
 Reporte de Consolidacion: $1
=====================================================
 Documentos existentes analizados: {N}
=====================================================
 Cambios propuestos:

 proceso-$1.md
    PARCIAL: Seccion "Flujo Principal" - actualizar
    FALTANTE: Agregar diagrama Mermaid

 especificacion-tecnica-$1.md
    OBSOLETO: Seccion "Componentes" - reescribir
    VIGENTE: Seccion "Modelo de Datos" - mantener
=====================================================

Proceder con los cambios? (s/n)
```

---

### 4. Aplicar consolidacion

Con aprobacion del usuario:

1. Actualizar documentos existentes
2. Crear documentos nuevos si es necesario
3. Generar/actualizar diagramas Mermaid
4. Actualizar indice del dominio (README.md)

---

### 5. Generar reporte final

Crear archivo:
```
{workflow}/03-consolidacion/reporte-consolidacion-$1.md
```

Contenido:
```markdown
# Reporte de Consolidacion: $1

**Fecha**: {fecha}
**Workflow**: {ruta-workflow}
**Version**: 1.0

## Fuentes Procesadas
| Fuente | Tipo | Lineas | Estado |
|--------|------|--------|--------|
| hallazgos-$1.md | Exploracion | {N} | Procesado |
| sesion-{fecha}-$1.md | Sesion | {N} | Procesado |

## Documentos Actualizados
| Documento | Cambios Aplicados |
|-----------|-------------------|
| {doc} | {descripcion} |

## Documentos Creados
- {lista}

## Hallazgos Sin Documentar
<!-- Si quedo algo pendiente -->
- {item pendiente y por que}

## Proximos Pasos
- [ ] `/doc:tests $1` - Disenar casos de prueba
- [ ] `/doc:manual $1 usuario` - Generar manual usuario
```

---

### 6. Limpieza de archivos temporales (Opcional)

Una vez consolidado, preguntar:

```
=====================================================
 Los hallazgos estan consolidados
=====================================================
 Archivos temporales:
 - hallazgos-$1.md ({N} lineas)
 - sesion-{fecha}-$1.md ({N} lineas)
=====================================================
 Desea archivar los archivos temporales?
 [A] Archivar en 03-consolidacion/archivo/
 [M] Mantener para referencia
 [E] Eliminar permanentemente
=====================================================
```

**Si elige Archivar [A]:**
1. Crear directorio `{workflow}/03-consolidacion/archivo/`
2. Mover archivos de `01-exploracion/` y `02-sesiones/`
3. Mantener solo el reporte de consolidacion

**Si elige Mantener [M]:**
- No hacer nada con los temporales

**Si elige Eliminar [E]:**
- Borrar archivos de `01-exploracion/` y `02-sesiones/`
- Advertir que es irreversible

---

## Ubicacion de Documentacion Final

Dependiendo del tipo de hallazgo:

```
.documentacion/
├── 02-dominios-negocio/$1/
│   ├── README.md
│   ├── proceso-$1.md
│   ├── especificacion-tecnica-$1.md
│   └── diagramas/
│       └── flujo-$1.mmd
├── 03-entidades-base/
│   └── {entidad}.md
├── 06-base-datos/
│   └── {area}.md
└── ...
```

---

## Principios de Consolidacion

- **NO borrar informacion vigente**
- **Validar antes de modificar**
- **Pedir aprobacion** antes de cambios mayores
- **Referencias especificas** a codigo (archivo:linea)
- **Diagramas Mermaid** para flujos complejos
- **Generar reporte** siempre, incluso si ya consolidado

## Actualizacion de `cosecha.documentacion` (solo modo `--desde-work`)

Al cerrar exitosamente con flag `--desde-work {work-id}`, escribir en frontmatter del README del work:

```yaml
cosecha:
  documentacion:
    ejecutado: true
    fecha: "{fecha de hoy}"
    por: "{dev-name}"
    archivos_actualizados: [{lista de paths actualizados en .documentacion/}]
    nota: "string corta opcional"
```

Si re-ejecucion (ya `ejecutado: true`): mergear `archivos_actualizados[]` sin duplicados.
