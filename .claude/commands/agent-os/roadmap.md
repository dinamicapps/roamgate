# Roadmap - Gestion de Epicas del Producto

Gestiona el roadmap del producto organizado por epicas. Las epicas agrupan trabajos relacionados y sus specs consolidadas.

## Directrices

- **Siempre usar AskUserQuestion** para toda interaccion con el usuario
- Las epicas se almacenan en `agent-os/product/roadmap/`
- Los IDs son secuenciales: EP-001, EP-002, etc.
- Las specs se consolidan automaticamente al cerrar trabajos vinculados con `/alfred`

## Uso

```
/roadmap                    - Resumen del roadmap actual
/roadmap crear "nombre"     - Crear nueva epica interactivamente
/roadmap listar             - Tabla de epicas desde _roadmap.yml
/roadmap estado EP-NNN      - Detalle de una epica con specs y trabajos
/roadmap actualizar EP-NNN  - Actualizar estado/prioridad/fechas de una epica
```

## Proceso

### Sin argumentos: Resumen del roadmap

1. Leer `agent-os/product/roadmap/_roadmap.yml`
2. Si no existe o esta vacio, informar:
   ```
   No hay epicas en el roadmap.
   Usa /roadmap crear "nombre" para crear la primera epica.
   ```
3. Si hay epicas, mostrar resumen:
   ```
   Roadmap del producto - {N} epica(s)

   | ID | Nombre | Estado | Prioridad | Trabajos | Specs |
   |----|--------|--------|-----------|----------|-------|
   | EP-001 | {nombre} | {estado} | {prioridad} | {N} | {N} |

   Usa /roadmap estado EP-NNN para ver detalle.
   Usa /roadmap crear "nombre" para agregar epica.
   ```

### Subcomando: crear "nombre"

1. Verificar que el argumento "nombre" fue proporcionado. Si no, pedir con AskUserQuestion.

2. Leer `agent-os/product/roadmap/_roadmap.yml` para determinar el siguiente ID secuencial.
   - Si no existe el archivo, crearlo desde template y usar EP-001.
   - Si existe, leer epicas y calcular EP-{N+1}.

3. Recopilar informacion con AskUserQuestion (una pregunta a la vez):

   **Pregunta 1:**
   ```
   Creando epica: {nombre}

   ?Cual es el foco principal de esta epica?

   (Describe en 1-2 oraciones que busca lograr)
   ```

   **Pregunta 2:**
   ```
   ?Que incluye y que excluye esta epica?

   Incluye: (lista de lo que cubre)
   Excluye: (lista de lo que NO cubre, o "nada especifico")
   ```

   **Pregunta 3:**
   ```
   ?Cuales son las ventajas esperadas de completar esta epica?

   (Lista los beneficios principales)
   ```

   **Pregunta 4:**
   ```
   ?Que modulos del sistema se ven afectados?

   (Ej: CRM, COM, IA, TW, o describe los modulos)
   ```

   **Pregunta 5:**
   ```
   Configuracion de la epica:

   Prioridad: (Alta / Media / Baja)
   Fecha estimada: (YYYY-MM-DD o "sin estimar")
   ```

4. Crear estructura de la epica:
   ```
   agent-os/product/roadmap/EP-{NNN}-{nombre-slug}/
   ├── README.md           (desde template epic-README.md, llenado con respuestas)
   ├── specs/              (carpeta vacia - se llena al cerrar works vinculados)
   └── work-records.yml    (desde template work-records.yml)
   ```

   Para generar el slug: lowercase, reemplazar espacios con `-`, remover caracteres especiales, max 40 chars.

5. Actualizar `agent-os/product/roadmap/_roadmap.yml`:
   ```yaml
   epicas:
     - id: EP-{NNN}
       nombre: "{nombre}"
       estado: PLANIFICADA
       prioridad: {prioridad}
       fecha_creacion: {YYYY-MM-DD}
       fecha_estimada: {fecha o null}
       carpeta: EP-{NNN}-{nombre-slug}
       trabajos: 0
       specs: 0
   ```

6. Confirmar al usuario:
   ```
   Epica creada: EP-{NNN} - {nombre}

   Carpeta: agent-os/product/roadmap/EP-{NNN}-{nombre-slug}/
   Estado: PLANIFICADA
   Prioridad: {prioridad}

   Para vincular trabajos a esta epica, usa /alfred "descripcion"
   y selecciona esta epica en el paso de vinculacion.
   ```

### Seccion opcional de la epica: Flujos de trabajo (MANIFIESTO P7)

Cada epica PUEDE llevar una seccion `## Flujos de trabajo` con los flujos que sus funcionalidades componen: pasos del flujo, funcionalidades participantes y puntos de contacto entre ellas (que invoca a que, que dispara despues, que datos/pantallas/contratos comparten). NO es obligatoria al crear la epica: se llena cuando el primer work la toca, y los works que tocan la epica la actualizan al cierre (pieza cierre, P7). Es la memoria de producto de los flujos — el discovery la consulta antes de re-derivarlos.

### Subcomando: listar

1. Leer `agent-os/product/roadmap/_roadmap.yml`
2. Si no hay epicas, informar que el roadmap esta vacio.
3. Si hay epicas, mostrar tabla ordenada por prioridad y luego por ID:

   ```
   Roadmap - {N} epica(s)

   | ID | Nombre | Estado | Prioridad | Trabajos | Specs | Fecha estimada |
   |----|--------|--------|-----------|----------|-------|----------------|
   | EP-001 | {nombre} | {estado} | Alta | {N} | {N} | {fecha} |
   | EP-002 | {nombre} | {estado} | Media | {N} | {N} | sin estimar |
   ```

### Subcomando: estado EP-NNN

1. Buscar la epica en `_roadmap.yml` por ID.
2. Si no existe, informar error.
3. Si existe, leer el README.md de la carpeta de la epica.
4. Leer `work-records.yml` de la epica.
5. Leer archivos en `specs/` de la epica.
6. Presentar detalle completo:

   ```
   === EP-{NNN}: {nombre} ===

   Estado: {estado} | Prioridad: {prioridad}
   Creada: {fecha} | Estimada: {fecha}

   Foco: {foco}

   Alcance:
   - Incluye: {incluye}
   - Excluye: {excluye}

   Specs consolidadas ({N}):
   | # | Spec | Trabajo | Criterios | Fecha |
   |---|------|---------|-----------|-------|
   | 1 | {spec} | {trabajo} | {N}/{total} verificados | {fecha} |

   Trabajos vinculados ({N}):
   | # | Trabajo | Estado | Etapa |
   |---|---------|--------|-------|
   | 1 | {trabajo} | {estado} | {etapa} |
   ```

### Subcomando: actualizar EP-NNN

1. Buscar la epica en `_roadmap.yml` por ID.
2. Si no existe, informar error.
3. Mostrar estado actual y preguntar que actualizar con AskUserQuestion:

   ```
   EP-{NNN}: {nombre}
   Estado actual: {estado} | Prioridad: {prioridad} | Fecha estimada: {fecha}

   ?Que deseas actualizar?
   1. Estado (PLANIFICADA ->  EN_PROGRESO ->  COMPLETADA / CANCELADA)
   2. Prioridad
   3. Fecha estimada
   4. Multiples campos

   (Elige opcion)
   ```

4. Segun la opcion, preguntar los nuevos valores.
5. Actualizar `_roadmap.yml` y README.md de la epica.
6. Confirmar los cambios al usuario.
