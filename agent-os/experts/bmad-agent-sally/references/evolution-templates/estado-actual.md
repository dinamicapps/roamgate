````markdown
# Plantilla: etapa-1/01-estado-actual.md

**Uso:** Sally genera este artefacto en la Sub-fase 1 del guion. Mary completa "Reglas de dominio" y Winston completa "Dependencias tecnicas" en paralelo. `inputDocuments` referencia `etapa-0/contexto.md` y `etapa-0/bitacora.md` (works legacy v1 — en works nuevos: `## Abordaje` en README).

**Regla no-negociable:** la columna "Alcance" distingue `solo-frontend` vs `llega-a-backend`. Si una accion toca backend, identifica el endpoint/SP/servicio en la columna "Reglas aplicadas".

## Estructura

```markdown
---
status: in_progress
completedAt: null
inputDocuments:
  - etapa-0/contexto.md
  - etapa-0/bitacora.md
---

# Estado actual: {area del scope}

## Ventanas/flujos afectados
- {ruta archivo} — {rol en el flujo}
- ...

## Inventario de acciones (detallado)

### Ventana: {nombre}

| ID | Control/Accion | Tipo | Alcance | Reglas aplicadas |
|----|----------------|------|---------|------------------|
| A-001 | Boton "Guardar" | Accion | llega-a-backend | Dispara SP auditoria_pacientes; valida permisos rol admin |
| A-002 | Campo "Fecha nacimiento" | Input | solo-frontend | Mascara dd/mm/yyyy; validacion rango 1900-actual |
| A-003 | Tab "Historial" | Navegacion | llega-a-backend | Carga lazy via GET /api/pacientes/{id}/historial |
| A-NNN | ... | ... | ... | ... |

### Flujo: {nombre multi-ventana} (si aplica)

Incluye columna extra "actor" y "ventana origen/destino":

| ID | Paso | Actor | Ventana | Accion | Alcance | Reglas |
|----|------|-------|---------|--------|---------|--------|
| F-001 | Iniciar agendamiento | Recepcionista | `pacientes/buscar` | Busqueda por documento | llega-a-backend | Cache 30s |
| F-002 | Seleccionar servicio | Recepcionista | `agenda/crear` | Lista desplegable | llega-a-backend | Filtrado por permisos |

## Reglas de dominio aplicadas (no visibles) — Mary

- R-001: {regla} — aplicada en {archivo:linea o SP/trigger}
- R-002: {regla} — {origen}

## Dependencias tecnicas — Winston

- D-001: {dependencia} — {archivo/servicio/API}
- D-002: {dependencia} — {detalle}

## Observaciones finales (Sally)

{Narracion corta con voz de Sally: como es la experiencia actual, que capas de historia tiene la ventana, que heredo de decisiones anteriores}
```
````
