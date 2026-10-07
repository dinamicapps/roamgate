# Ruta rediseno-ui — Fase 2: Iteracion

> Anfitriona: Sally (LE). Implementador: Atlas (o el usuario en pairing). Sin tabla de tareas E2; el trabajo avanza por **hitos** en bitácora viva.

## Mision

Implementar el rediseño vista a vista (o componente a componente), siguiendo el patrón declarado en `etapa-1/01-patron-diseno.md` y aplicando la metodología **Atomic Design + BEM + tokens** (REF→ el standard `agent-os/standards/frontend/atomic-design-bem-tokens.md`, si el perfil del repo lo provee). La iteración es incremental: un hito por vez, con captura antes/después y review de Sally antes de avanzar al siguiente.

## Bitacora viva: ## Hitos

El README del work-record tiene una sección `## Hitos` que actúa como bitácora viva del progreso. No es una tabla de tareas con estados; es el registro cronológico de lo que se hizo y cómo quedó. Se gestiona con `work file set-section` para evitar ediciones directas al archivo:

```
agentos work file set-section --slug {slug} --file README.md --section "Hitos" --content "..."
```

### Estructura de la tabla ## Hitos

```markdown
## Hitos

| Hito | Componentes/vistas | Cambios | Commit |
|---|---|---|---|
| {nombre del hito} | {lista de archivos o componentes nv-*} | {descripcion breve del cambio} | {hash corto} |
```

Cada fila se agrega al cerrar el hito; no se pre-planifican filas vacías. El contenido crece durante la iteración.

## Por hito: el ciclo de implementacion

### Paso 1 — Implementar con Atomic Design + BEM + tokens

Antes de escribir markup o CSS, Sally y el implementador (Atlas o usuario) aplican la metodología del estándar:

**Atomic Design (nivel primero):**
1. Identificar los átomos, moléculas y organismos que la vista requiere.
2. Auditar si existen componentes `nv-*` reutilizables en la librería:
   - Si existe: usar o mejorar el existente (agregar modificador BEM o token nuevo), no crear un clon.
   - Si no existe: crear en el nivel mínimo necesario y declarar por qué no sirvieron los anteriores.
3. Los organismos pueden orquestar lógica Angular (controller/factory), pero no reescriben el CSS de los átomos que consumen.

**BEM (nombre de las clases):**
- Nombrar selectores como `.bloque__elemento--modificador` con prefijo `nv-` para el design system.
- Los modificadores describen estado o variante semántica, nunca apariencia concreta.
- Profundidad máxima: `bloque__elemento` (dos niveles). Si se necesita un tercer nivel, el elemento intermedio es su propio bloque.

**Tokens (valores del CSS):**
- Los estilos no llevan valores hardcodeados (hex, px directos).
- Cadena obligatoria: CSS del componente → token de componente → token semántico → token primitivo.
- CSS in-line `style="..."` está **prohibido**, salvo excepción documentada (ver §Invariante de calidad).

**Verificar contra el patrón:**
- Cada pieza implementada debe ser coherente con lo declarado en `etapa-1/01-patron-diseno.md`.
- Si durante la implementación se descubre que el patrón declarado no aplica, Sally pausa y actualiza el artefacto antes de continuar.

### Paso 2 — Captura antes/después (archivos obligatorios)

**Antes de tocar el markup del hito**, Atlas (o Sally) captura el estado actual en navegador (Playwright) y lo **guarda como archivo**: `etapa-1/evidencia/ui/hito-{N}-antes.png`. Después de implementar, captura el estado nuevo y lo guarda: `etapa-1/evidencia/ui/hito-{N}-despues.png`. El subartefacto `etapa-1/hito-{N}-capturas.md` narra la comparación **referenciando ambos archivos por path** — no reproduce ni describe la imagen en prosa.

**Reglas duras (cierran el agujero que hace alucinar el baseline al iterar):**
- El `-antes.png` se captura **una sola vez, antes del primer edit** del hito, y **no se re-genera** — es el estado original, no un intermedio. Si el estado original ya no existe en vivo, se recupera del último commit previo al hito; **nunca se reconstruye de memoria** ni "de cómo se veía".
- Una descripción en prosa del markup **no sustituye** al `.png` (a lo sumo lo complementa). La comparación es visual: sin los dos archivos no hay comparación.
- En cada ajuste/iteración del hito, el implementador **referencia `hito-{N}-antes.png` por path**; tiene prohibido re-describir el "antes" de memoria. Si el archivo falta, PARAR y recapturarlo del commit base — no inventarlo.

### Paso 3 — Review visual de Sally

Sally revisa la implementación con criterios del estándar:

- ¿El nivel Atomic Design es correcto? (¿se reutilizó o se duplicó?)
- ¿Los nombres BEM son semánticos y con prefijo `nv-`?
- ¿Los valores CSS salen de tokens, no de hardcodes?
- ¿La vista es coherente con el patrón declarado en `etapa-1/01-patron-diseno.md`?
- ¿Hay CSS in-line no declarado como excepción?

Si el review pasa: Sally registra la fila en `## Hitos` y avanza al siguiente. Si hay hallazgos: el implementador ajusta antes de registrar el hito.

### Paso 4 — Ajuste y registro del hito

Al cerrar el hito (review pasado):

1. Hacer commit con el cambio del hito.
2. Invocar `work file set-section` para agregar la fila a `## Hitos` en el README.
3. Sally confirma la fila registrada y propone el siguiente hito, o declara que la iteración de la pieza está completa.

## Invariante de calidad (§3.7 del spec)

Todo lo implementado en esta fase debe cumplir:

1. **Sin CSS in-line nuevo no declarado.** Si se agrega un atributo `style="..."`, debe llevar comentario de excepción en el template (motivo + por qué no puede ir a hoja). Sin comentario → hallazgo bloqueante en la fase 3.
2. **BEM sobre tokens.** Los selectores siguen la convención BEM; sus valores CSS salen de design tokens `--nv-*`, no de literales.
3. **Componentes reutilizables.** Se compone desde la librería `nv-*` existente antes de crear markup nuevo. Crear algo nuevo exige declarar por qué no sirvieron los anteriores.
4. **Coherencia con el patrón declarado.** Cada pieza implementada es coherente con `etapa-1/01-patron-diseno.md` (tipo, estados diseñados, componentes `nv-*` acordados). Si la implementación se desvía, Sally actualiza el artefacto antes de registrar el hito.

Estos cuatro criterios son la lista de chequeo de la fase 3 (verificación). Sally los aplica en el review de cada hito para que la fase 3 no sea una sorpresa; Quinn los verifica formalmente en navegador, lo que no es redundante con el review visual de Sally.

## Señal de salida de la fase

La iteración cierra cuando:
- Todos los hitos planificados con el usuario están registrados en `## Hitos` con commit.
- Cada hito tiene su par `etapa-1/evidencia/ui/hito-{N}-antes.png` + `hito-{N}-despues.png` en disco (Paso 2). Sin el par, el hito no cierra.
- Sally confirma que sus reviews por hito no dejaron CSS in-line sin declaración de excepción pendiente (la verificación final en navegador es de Quinn en la fase 3 y no es redundante con este review visual).
- Sally confirma que las vistas implementadas son coherentes con `etapa-1/01-patron-diseno.md`.

Sally publica el resumen antes de pasar a la fase 3:

```
A-Sally: Iteracion completa para {slug-pieza}.

Hitos completados: {N}.
Vistas/componentes: {lista corta}.
Capturas: par antes/despues (.png) presente en etapa-1/evidencia/ui/ para los {N} hitos.

Listo para verificacion en navegador (fase 3). Continuo?
```

## Prohibiciones

- NO agregar filas a `## Hitos` a mano: usar `work file set-section` para mantener trazabilidad.
- NO avanzar al siguiente hito si el review de Sally detectó hallazgos sin resolver.
- NO crear un componente nuevo sin auditar primero si existe uno reutilizable en `nv-*`.
- NO hardcodear valores CSS (hex, px directos) fuera de la capa de tokens primitivos.
- NO agregar CSS in-line sin declarar la excepción en el template con su motivo.
