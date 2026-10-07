# Ruta rediseno-ui — Fase 1: Discovery acotado

> Anfitriona: Sally (LE). Dexter/Atlas/Winston acotados a la pieza. Silenciosa sobre el sistema global; vocal sobre la cadena de datos de la pieza concreta.

## Mision

Mapear la **cadena de datos existente** de la pieza a reemplazar — frontend (vista/modal/proceso, formularios, listas desplegables) ↔ backend (controllers/endpoints) ↔ BL/APIs utilitarias y catálogos ↔ DB — y definir el patrón de diseño con el usuario. Ambos productos deben existir **antes** de entrar a la fase 2: sin ellos, la iteración reorganizará orígenes a posteriori (el dolor recurrente).

**Regla anti-retrabajo (invariante de fase):** mapear los orígenes de listas desplegables, formularios y catálogos ANTES de implementar la primera vista. Cualquier reestructuración de orígenes descubierta durante la iteración es señal de que la fase 1 fue insuficiente.

## Anfitriona y expertos invitados

- **Sally (LE):** conduce la fase. Define/confirma el patrón de diseño. Produce el artefacto `etapa-1/01-patron-diseno.md`.
- **Dexter (invitado, acotado):** mapea la cadena de datos existente de la pieza — orígenes de listas/catálogos, SPs, DB. Solo lectura (P-D4). NO modela datos nuevos: su rol aquí es cartografiar, no diseñar.
- **Atlas/Winston (invitados, acotados):** auditan el lado backend de la pieza (controllers/endpoints/BL existentes). Acotados a la cadena de la pieza, no al sistema completo.

Si el campo `origen_rediseno` del frontmatter declara el estándar o épica de origen, Sally lo consulta como referencia directa y puede reducir el alcance del discovery (los estándares ya documentan parte de la cadena).

## Producto de la fase

### (a) Patron de diseño — artefacto obligatorio

Sally invoca `definir-patron-diseno.md` (REF→ `agent-os/experts/bmad-agent-sally/references/definir-patron-diseno.md`) para:

1. Identificar el tipo de pieza (tablero, formulario, wizard, modal, listado, combinación).
2. Buscar el patrón en el catálogo de patrones de frontend del standard instalado (`agent-os/standards/frontend/catalogo-patrones-frontend.md`, si el perfil del repo lo provee).
3. Confirmar el patrón con el usuario (o definirlo desde cero si no existe en el catálogo).

El resultado se escribe en **`etapa-1/01-patron-diseno.md`** con estructura mínima:

```markdown
# Patron de diseño: {tipo de pieza}

## Tipo
{tablero | formulario | wizard | modal | listado}

## Patron acordado
{descripcion del patron confirmado o definido}

## Componentes nv-* que lo realizan
| Componente | Nivel (atomo/molecula/organismo) | Rol |
|---|---|---|

## Estados que deben estar diseñados
| Estado | Descripcion |
|---|---|
| cargando | ... |
| vacio | ... |
| error | ... |
| exito | ... |

## Variante declarada (si aplica)
{descripcion de la variante acordada con el usuario, o "ninguna"}

## Antipatrones detectados en la pieza actual
{lista de antipatrones observados al auditar el estado inicial; referencia a catalogo}
```

Este artefacto es el **contrato de la iteración**: ninguna vista se implementa en la fase 2 sin que el patrón esté declarado aquí.

### (b) Contrato de datos (si `toca_backend: true`)

Si el frontmatter declara `toca_backend: true`, Dexter mapea y Sally documenta en el README del work-record la sección `## Contrato de datos` usando `work file set-section` — NO se edita el archivo a mano. Payload recomendado via `--input <ruta>` (scratchpad); stdin sigue valido para invocaciones simples:

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->

```markdown
## Contrato de datos

| Componente/vista | Origen (endpoint/BL/API/lista/catalogo) | DB/SP | Cambio en backend |
|---|---|---|---|
| {vista o formulario} | {nombre del endpoint o factory} | {tabla/SP} | {ninguno | reorganizar | nuevo} |
```

La tabla cubre:
- Cada lista desplegable y de dónde sale su catálogo (endpoint, factory Angular, SP directo).
- Cada dato de formulario que viene del backend (qué controller/endpoint lo provee).
- Qué cambios en backend requiere la pieza (reorganizar orígenes, ajustar contratos existentes).

Si `toca_backend: false` (cambio puramente cosmético sin reorganizar orígenes de datos), la tabla se omite. Este es el caso minoritario; por defecto se prefiere auditar.

### (c) Horneado del work-record

Al completar el discovery, Sally (con Alfred) hornea el work-record:

1. Crear el directorio `agent-os/work-records/{slug}/etapa-1/` si no existe.
2. Colocar `etapa-1/01-patron-diseno.md` con el contenido producido.
3. Actualizar el README del work-record: poblar `## Estado actual` (captura del estado antes del rediseño) y marcar la sección `## Contrato de datos` si aplica.
4. Invocar `agentos work file create` (payload via `--input <ruta>`, recomendado; stdin sigue valido) para registrar el artefacto en el runtime (si el verbo está disponible en la versión instalada); si no, Sally lo documenta en el README.
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->

## Señal de salida de la fase

La fase 1 cierra cuando:
- `etapa-1/01-patron-diseno.md` existe y fue confirmado con el usuario.
- Si `toca_backend: true`: la sección `## Contrato de datos` del README está completa.
- No quedan orígenes de datos desconocidos para las vistas que se iterarán en la fase 2.

Sally publica el resumen de cierre antes de pasar a la fase 2:

```
A-Sally: Discovery completo para {slug-pieza}.

Patron definido: {tipo} — {1 frase del patron acordado}.
Componentes nv-* identificados: {lista corta}.
Origenes mapeados: {N orígenes; tabla en ## Contrato de datos}.
Antipatrones detectados en el estado actual: {lista o "ninguno"}.
Artefacto: etapa-1/01-patron-diseno.md generado y confirmado.

Listo para iterar en fase 2. Continuo?
```

## Prohibiciones

- NO implementar ninguna vista antes de que `etapa-1/01-patron-diseno.md` esté escrito.
- NO iniciar la fase 2 si `toca_backend: true` y la tabla `## Contrato de datos` está incompleta.
- Dexter y Atlas/Winston: NO modelar datos nuevos ni proponer rediseño de schema. El scope es cartografiar lo existente.
- Sally: NO asumir el patrón sin confirmación del usuario (aunque parezca obvio del catálogo).
