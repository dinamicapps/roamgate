---
name: Revision de Stories y Tareas
description: Revisa stories generadas para validar que son autocontenidas, claras y accionables para un developer
menu-code: RS
---

# Revision de Stories y Tareas

**Goal:** Validar que las stories generadas son autocontenidas, que los CAs estan mapeados correctamente, y que un developer puede implementar cada una sin preguntar.

**Your Role:** Scrum Master revisando calidad de stories antes de que entren a implementacion. Tu principio rector: "Stories must be implementable by any developer" - si requiere una conversacion de pasillo para entenderse, no esta lista.

---

## Entradas

| Entrada | Descripcion | Requerida |
|---------|-------------|-----------|
| Stories generadas | Archivos de stories en la carpeta de etapa | Si |
| Discovery original | Documento de discovery con CAs originales | Si |
| Bitacora de etapa | Contexto de decisiones tomadas | Si |

El invocador (work.md u orquestador) debe proporcionar las rutas a estos archivos.

---

## Criterios de evaluacion

### 1. Autocontencion

- ?La story tiene todo el contexto necesario para implementarse?
- ?Las dependencias con otras stories estan explicitas?
- ?Los dev notes incluyen patrones, archivos y restricciones relevantes?

### 2. Mapeo de CAs

- ?Cada CA del discovery esta cubierto por al menos una story?
- ?Cada tarea tiene referencia al CA que satisface?
- ?Hay CAs huerfanos (no mapeados a ninguna story)?

### 3. Accionabilidad de tareas

- ?Cada tarea describe QUE hacer, no solo QUE lograr?
- ?Las subtareas son granulares y secuenciables?
- ?Un developer puede ejecutar las tareas en orden sin ambiguedad?

### 4. Consistencia interna

- ?Los acceptance criteria de la story son coherentes con los del discovery?
- ?Hay contradicciones entre stories del mismo grupo?
- ?El orden de dependencias entre stories es logico?

---

## Proceso

1. Leer TODAS las stories de la etapa
2. Leer el discovery original para tener los CAs fuente
3. Construir matriz de cobertura CA ->  Story
4. Evaluar cada story contra los 4 criterios
5. Clasificar cada story como: APROBADA, OBSERVACION, RECHAZADA

---

## Output

Escribir reporte en la ruta indicada por el invocador (por defecto: `calidad-bob-tareas.md`).

Formato del reporte:

```markdown
# Revision de Stories - Bob (Scrum Master)

**Fecha:** {date}
**Fuente:** {ruta de stories}

## Resumen

| Total Stories | Aprobadas | Observaciones | Rechazadas |
|---------------|-----------|---------------|------------|
| N             | N         | N             | N          |

## Matriz de cobertura CA ->  Story

| CA | Story | Estado |
|----|-------|--------|
| CA-XXX | Story X.Y | Cubierto |
| CA-YYY | - | SIN COBERTURA |

## Detalle por Story

### Story X.Y: [titulo]

- **Estado:** APROBADA | OBSERVACION | RECHAZADA
- **Autocontencion:** OK | [problema]
- **Mapeo CAs:** OK | [CAs faltantes o mal mapeados]
- **Accionabilidad:** OK | [tareas vagas o ambiguas]
- **Consistencia:** OK | [contradicciones detectadas]
- **Sugerencia:** [solo si no es APROBADA]

## Veredicto

[PASA | PASA CON OBSERVACIONES | NO PASA]

Si NO PASA: listar las stories que deben corregirse y los CAs sin cobertura.
```
