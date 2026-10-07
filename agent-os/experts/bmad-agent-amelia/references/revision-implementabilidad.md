---
name: Revision de Implementabilidad
description: Valida que las stories sean implementables contra el codebase real - archivos, patrones, dependencias existentes
menu-code: RI
---

# Revision de Implementabilidad

**Goal:** Validar que las stories son factibles tal como estan escritas comparandolas contra el codebase real del proyecto. Identificar archivos que no existen, patrones incorrectos, dependencias no consideradas y conflictos con codigo existente.

**Your Role:** Dev senior validando factibilidad tecnica. No estas revisando calidad de stories (eso es Bob) ni testeabilidad (eso es Quinn). Tu pregunta es una sola: "?Esto se puede construir tal como esta escrito, dado el codigo que existe HOY?"

**Escalacion:** Si durante la revision encuentras que la factibilidad de una story depende de decisiones arquitectonicas (no de implementacion), puedes recomendar que Winston (Arquitecto) haga una segunda opinion. Esto NO es delegacion - es escalacion documentada para el orquestador.

---

## Entradas

| Entrada | Descripcion | Requerida |
|---------|-------------|-----------|
| Stories generadas | Archivos de stories a validar | Si |
| Bitacora de etapa | Contexto de decisiones | Si |
| Codebase del proyecto | Acceso de lectura al repositorio | Si |

El invocador (work.md u orquestador) debe proporcionar las rutas a los archivos de stories y bitacora. El codebase se accede directamente via filesystem.

---

## Criterios de evaluacion

### 1. Existencia de archivos referenciados

- ?Los archivos mencionados en la story (dev notes, referencias) existen en el repo?
- ?Las rutas son correctas y corresponden a la estructura actual?
- ?Los modulos/componentes referenciados estan donde se espera?
- Si la tarea declara el campo estructurado `archivos` (lista `{ruta, accion}`, desde 2026-07-14): `accion: modificar` exige que el archivo EXISTA; `accion: crear` exige que NO exista. La accion invertida o la ruta incorrecta es hallazgo.

### 2. Consistencia con patrones del codebase

- ?Los patrones que la story asume (naming, estructura, convenciones) coinciden con los del proyecto?
- ?Las tecnologias/frameworks mencionados son los que el proyecto usa?
- ?Las convenciones de API, BD, o frontend son las correctas?

### 3. Dependencias y conflictos

- ?Las dependencias (paquetes, servicios, modulos) existen y estan disponibles?
- ?Hay conflictos con codigo existente (funciones que ya hacen algo similar, nombres colisionantes)?
- ?La story requiere cambios en archivos que otras stories tambien modifican? Si dos tareas declaran el campo `archivos` (desde 2026-07-14) con la misma `ruta` y no declaran `depende_de` entre si, es solape no declarado (ver tabla "Conflictos entre stories" abajo).

**Por que importa el solape no declarado:** el anfitrion de E3 decide que tareas corren en
paralelo comparando `archivos`. Un solape no declarado hace que dos subagentes escriban el
mismo archivo a la vez.
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Orquestacion". La regla de paralelizacion vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

### 4. Factibilidad tecnica

- ?La solucion propuesta es coherente con los patrones del proyecto?
- ?Hay restricciones tecnicas (permisos, infraestructura, integraciones) no contempladas?
- ?El alcance de la story es realista dado el estado actual del sistema?

---

## Proceso

1. Leer TODAS las stories de la etapa
2. Para cada story, extraer: archivos referenciados, patrones asumidos, dependencias, modulos involucrados
3. Verificar contra el codebase real:
   - Glob/grep para archivos y patrones
   - Revisar package.json/csproj/etc para dependencias
   - Leer archivos clave para confirmar convenciones
4. Evaluar cada story contra los 4 criterios
5. Clasificar cada story como: FACTIBLE, FACTIBLE CON AJUSTES, NO FACTIBLE

---

## Output

Escribir reporte en la ruta indicada por el invocador (por defecto: `calidad-amelia-implementabilidad.md`).

Formato del reporte:

```markdown
# Revision de Implementabilidad - Amelia (Dev)

**Fecha:** {date}
**Fuente:** {ruta de stories}
**Codebase:** {ruta del proyecto}

## Resumen

| Total Stories | Factibles | Con ajustes | No factibles |
|---------------|-----------|-------------|--------------|
| N             | N         | N           | N            |

## Detalle por Story

### Story X.Y: [titulo]

- **Estado:** FACTIBLE | FACTIBLE CON AJUSTES | NO FACTIBLE
- **Archivos referenciados:** OK | [archivos que no existen o ruta incorrecta]
- **Patrones:** OK | [discrepancias con convenciones del proyecto]
- **Dependencias:** OK | [paquetes faltantes, conflictos]
- **Factibilidad tecnica:** OK | [restricciones no contempladas]
- **Requiere segunda opinion de Winston:** Si/No [solo si hay dudas arquitectonicas, no de codigo]
- **Ajustes necesarios:** [solo si FACTIBLE CON AJUSTES - que cambiar en la story]

## Conflictos entre stories

| Story A | Story B | Archivo/modulo en conflicto | Tipo de conflicto |
|---------|---------|----------------------------|-------------------|
| X.Y     | X.Z     | archivo.ts                 | Modificacion concurrente |

## Veredicto

[PASA | PASA CON AJUSTES | NO PASA]

Si NO PASA: listar las stories no factibles y que debe cambiar para que lo sean.
Si PASA CON AJUSTES: listar los ajustes minimos requeridos en cada story.
```

## Verificacion del campo `archivos` (desde 2026-07-14)

Cada tarea con `tipo_tarea: codigo` declara `archivos` (lista de `{ruta, accion}`). Bob lo
declaro **sin haber tocado el codigo**. La existencia (criterio 1) y el solape entre tareas
(criterio 3) ya quedan cubiertos arriba. Verificar ademas, por cada entrada, lo que solo un
contraste linea a linea contra el codebase puede confirmar:

| Chequeo | Que confirmar | Si falla |
|---|---|---|
| **RI-A3 — presencia** (precondicion de los otros dos) | Que la tarea con `tipo_tarea: codigo` **declare** el campo. **La AUSENCIA de `archivos` es un hallazgo**, no un caso neutro que se salta: sin el campo no hay nada que contrastar contra el codebase, y en E3 la tarea queda fuera de todo lote paralelo. | Hallazgo: *"T-NNN es `tipo_tarea: codigo` y no declara `archivos`"*. Vuelve a Bob (Regla 6 de `create-story.md`). No se "aprueba con nota": el gate `[RI]` no cierra con un hallazgo abierto. |
| **RI-A1 — pertenencia** | El metodo/clase/endpoint que la tarea describe vive REALMENTE en el archivo declarado. Cita `path:linea`. | Hallazgo: *"T-NNN declara X.cs pero el metodo vive en Y.cs"*. El caso mas comun. |
| **RI-A2 — completitud** | La modificacion descrita no exige tocar OTROS archivos no declarados (interfaz, DI, migracion, test). | Hallazgo: la lista esta incompleta → el paralelismo (criterio 3) la creeria disjunta y no lo es. |

Las tareas que NO son `tipo_tarea: codigo` (`frente-investigacion`, `seccion-documento`) estan
exentas: RI-A3 no aplica a ellas.

Toda afirmacion lleva cita `path:linea`. Un hallazgo sin cita no es un hallazgo. (RI-A3 es la
unica excepcion natural: la cita es la ausencia del campo en el frontmatter de la tarea.)
