---
name: scan-capabilities
description: Escanea skills, MCPs y activos del repo disponibles; mantiene catalogo y libreta curada de herramientas en sidecar.
menu-code: SC
---

# SC — Scan capabilities del entorno

> **Voz Sally:** Aunque este documento es procedimental, ejecutalo con tu
> voz narrativa y empatica. Al escribir el catalogo no enumeres herramientas
> friamente — explica al usuario que significan para su trabajo. El usuario
> no necesita un inventario, necesita saber que puedes hacer con lo que tienes.

**Cuando se activa:**
- El usuario invoca explicitamente la capacidad `SC`.
- Primera activacion de Sally en un proyecto (ver `init.md`).
- Despues de un diff check en activacion posterior si detectas cambios significativos y el usuario pide actualizar.

## Que escanear

### 1. Skills del harness

Lee el bloque `<system-reminder>` con la lista de skills disponibles. Filtra los relevantes a UX/diseno/redesign:

- `frontend-design`, `frontend-design:frontend-design`
- `ui-ux-pro-max`, `ui-ux-pro-max:ui-ux-pro-max`
- `mcp-server-dev:build-mcp-app` (UI widgets en MCP)
- Cualquier otro cuyo description mencione UI, UX, mockup, wireframe, widget, design.

Registra nombre completo del skill, su description (primera frase), y fuente (plugin o core).

### 2. MCPs activos

Escanea la lista de tools disponibles. Filtra los que empiezan con `mcp__` y son relevantes a UX/redesign:

- `mcp__playwright__*` — browser automation, screenshots.
- `mcp__jina__capture_screenshot_url`, `mcp__jina__read_url` — web capture.
- `mcp__excel__*` — exportes, data visual.
- Cualquier otro que habilite render visual, inspeccion de UI, data para UX.

Registra nombre completo de la tool y proposito inferido.

### 3. Activos del repo del proyecto

Solo si el escaneo se hace en contexto de un proyecto. Busca:

- Figma exports (`*.fig`, carpetas `figma/`, links en README).
- Storybook (`.storybook/`, `stories.{js,ts,jsx,tsx}`).
- Design tokens (`tokens.{json,yml}`, `theme.{js,ts}`, `tailwind.config.*`).
- Guias de estilo (`STYLEGUIDE.md`, `docs/design/`).
- Componentes reutilizables ya existentes (carpeta `components/`, `shared/ui/`).

Registra ruta y una linea de proposito.

### Que NO escanear

- Tools que estan listadas pero no puedes invocar desde tu contexto actual.
- Skills cuyo description no tiene relacion con UX/diseno.
- Archivos binarios en el repo que no aporten conocimiento (PDFs, imagenes sueltas sin contexto).

Si algo aparece como "presente pero inutilizable", registralo asi explicitamente en el catalogo con nota `[inutilizable: <razon>]`.

## Archivos a escribir/actualizar

### capabilities-catalog.md

Ubicacion: `{project-root}/_bmad/memory/sally-sidecar/capabilities-catalog.md`.

Estructura:

```markdown
# Catalogo de capacidades de Sally

Ultima actualizacion: YYYY-MM-DD

## Skills disponibles
- <nombre-skill> — <description 1 linea> — fuente: <plugin|core>

## MCPs activos relevantes
- <mcp__tool__name> — <proposito inferido>

## Activos del repo actual
- <ruta> — <proposito 1 linea>
```

Cada vez que haces un escaneo completo (`SC` explicito o init), regeneras este archivo entero. Los diff checks en activaciones posteriores solo actualizan secciones especificas si detectan cambios.

### capabilities-notebook.md

Ubicacion: `{project-root}/_bmad/memory/sally-sidecar/capabilities-notebook.md`.

Estructura general:

```markdown
# Libreta de capacidades de Sally

---

## <nombre-herramienta> (<tipo: skill|mcp-tool|repo-asset>)

**Para que sirve:** <descripcion breve>

**Casos de exito (que funciona bien):**
- <patron concreto>

**Limitaciones conocidas (que no sirve):**
- <limitacion concreta>

**Patrones utiles:**
- <combinaciones, prerequisitos, trucos>

**Ultima revision:** YYYY-MM-DD

---

## Archivadas

### <nombre-herramienta> (<tipo>) — archivada YYYY-MM-DD
<contenido anterior preservado>
```

## Reglas de escritura de la libreta

Escribir en la libreta SOLO cuando el aprendizaje es no-trivial:

1. **Caso de exito relevante** — patron no obvio. NO registres "la use y funciono normal".
2. **Limitacion encontrada** — siempre registrar cuando algo falla o tiene constraint inesperado.
3. **Patron accionable** — combinaciones con otras tools, prerequisitos no documentados, trucos.

NO registrar: cada invocacion, resultados esperados, ruido operacional.

**Primera vez que usas una herramienta:** si no existe seccion en la libreta para esa herramienta, la creas con los campos iniciales **solo si hay aprendizaje no-trivial**. Si la primera invocacion fue rutinaria, no creas seccion. La libreta NO pretende ser indice completo de herramientas (eso lo cubre el catalogo).

## Mantenimiento de la libreta

- Cada seccion se **edita** en cada uso que aporte aprendizaje nuevo.
- Se **archiva** (seccion "Archivadas" al final) si no usaste la herramienta en 6 meses o si desaparecio del catalogo.
- Se **re-activa** moviendola fuera de "Archivadas" si vuelve a aparecer.

No hay rotacion por fechas. El archivo crece solo con herramientas distintas.

## Linea entre sidecar general y libreta

- **Va al sidecar general** (`sally-sidecar/index.md` y hojas de proyecto): conocimiento especifico del proyecto, estado de trabajos, decisiones con el usuario, contexto de dominio.
- **Va a la libreta** (`sally-sidecar/capabilities-notebook.md`): conocimiento sobre **como se comporta una herramienta**, independiente del proyecto.

**Criterio para casos dudosos:** va a la libreta si el aprendizaje se aplicaria igual en otro proyecto. Va al sidecar general si perderia sentido fuera de este proyecto.

## Flujo de la capacidad SC

Cuando el usuario invoca `SC` (o la ejecutas desde init):

1. Escanea las tres fuentes (skills, MCPs, activos del repo si aplica).
2. Escribe/regenera `capabilities-catalog.md` entero.
3. NO escribes en la libreta aqui — la libreta se alimenta por uso, no por escaneo.
4. Resumen breve al usuario: "Encontre X skills, Y MCPs, Z activos del repo relevantes. Catalogo actualizado."

## Diff check (en activaciones posteriores)

En cada activacion interactiva de Sally (ver `SKILL.md` seccion On Activation):

1. Cargas `capabilities-catalog.md` del sidecar.
2. Rapidamente listas los skills y MCPs visibles en el harness actual.
3. Diff conceptual: que hay de nuevo, que desaparecio.
4. Si hay diferencias notables, avisas al usuario con mensaje breve:
   > "Note que ahora tienes `frontend-design` disponible y lo agrego al catalogo. Puede serte util en redesigns."
5. Actualizas solo las secciones afectadas del catalogo. NO regeneras entero.

Este paso NO es un escaneo profundo — es comparacion rapida. El escaneo profundo ocurre solo en init o cuando el usuario invoca `SC`.

## Patron reutilizable (nota para futuros agentes)

Este mecanismo (catalogo + libreta curada + diff en activacion + trigger en Session Close) esta diseniado como patron general. Otros agentes (Winston, Quinn, Mary) podrian adoptarlo en el futuro con sus propios archivos en su sidecar.

**Criterio de adopcion:** el agente debe tener un rol donde conocer la caja de herramientas del entorno influya en sus decisiones de proceso. Un instructivo reusable no transfiere la habilidad de usarlo — exponer la capacidad sin anclaje al rol produce resultados mediocres.
