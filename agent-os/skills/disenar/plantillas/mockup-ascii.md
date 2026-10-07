# Plantilla: mockup ASCII

Convencion para mockups ASCII en el step de modelado. Mantener simple, legible
en monospace, expresar layout sin pretender ser pixel-perfect.

## Reglas

- Bordes con `+ - |`.
- Inputs con `[_______]` (vacio) o `[texto]` (prefilled).
- Botones con `[ Aceptar ]` (con espacios alrededor del label).
- Dropdowns con `[Seleccionar ▾]`.
- Checkbox con `[ ]` (vacio) o `[x]` (marcado).
- Tablas con `+--+--+`, columnas alineadas.
- Comentarios inline con `<!-- ... -->`.
- Anotaciones de comportamiento con `→` apuntando al elemento.

## Ejemplo: lista master-detail

```
+----------------------------------+
| Solicitudes pendientes  [+ Nuevo] |
+----------------------------------+
| #1234  Paciente: Perez J.        |  ← seleccionado
| #1235  Paciente: Rodriguez M.    |
| #1236  Paciente: Gomez A.        |
+----------------------------------+
                |
                v (al seleccionar muestra panel a la derecha)
+----------------------------------+
| Detalle solicitud #1234           |
| Sede: Hospital Central (heredada) |  ← NO seleccionable
| Prioridad: [Rutina  ▾]           |
| Insumos:                         |
|   [x] Guantes esteriles  x2      |
|   [x] Gasa 10x10  x5             |
|   [ ] Suero fisiologico          |
+----------------------------------+
| [ Cancelar ]    [ Confirmar ]    |
+----------------------------------+
```

## Ejemplo: form embebido

```
+--- Evento atencion HC: paciente XYZ ---+
| Header HC reducido en modo Constructor |
| Formulacion | Aplicacion | Solicitudes |  ← tabs
+----------------------------------------+
| Tab Solicitudes activo:                |
|                                        |
| [ + Nueva solicitud de insumos ]       |
|                                        |
| Solicitudes existentes:                |
|   #1234 Borrador (badge)  → editar     |
|   #1230 Despachada (badge) → ver       |
+----------------------------------------+
| [ ← Volver ]  (preserva borrador)      |
+----------------------------------------+
```

## Cuando NO usar mockup ASCII

- Si el componente es estandar reutilizable (Sally lo nombra: "kendo-grid
  con configuracion X"). Bastan 1-2 lineas de descripcion.
- Si la UX es completamente igual a un componente existente del modulo
  huesped. Referenciar al ejemplar.

## Aprobacion

El mockup ASCII vale como acuerdo entre Mary y usuario. step-04 ejecucion
del work consumidor NO puede divergir del mockup aprobado sin disparar
/alfred retroceder-a-diseno.
