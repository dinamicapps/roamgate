# Plan Product

Establish foundational product documentation through an interactive conversation. Creates mission, roadmap, and tech stack files in `agent-os/product/`.

## Uso

```
/plan-product                              # Conversacion interactiva desde cero
/plan-product --desde-work {work-id}       # Actualizar producto desde work cerrado
```

## Important Guidelines

- **Always use AskUserQuestion tool** when asking the user anything
- **Keep it lightweight** - gather enough to create useful docs without over-documenting
- **One question at a time** - don't overwhelm with multiple questions

## Modo `--desde-work {work-id}`

Cuando un work cierra `COMPLETADO`, su impacto en producto puede no estar reflejado en `mission.md`/`roadmap.md`/épicas. Este modo audita y actualiza:

1. Verificar que el work esta `COMPLETADO`. Si no:
   > "Solo se puede actualizar producto desde works completados. Estado actual: {estado}."
   Detener.
2. Verificar `cosecha.producto.ejecutado` en frontmatter del README del work. Si es `true`:
   AskUserQuestion: "Producto ya cosechado el {fecha} por {por}. Re-ejecutar (acumula) o saltar?"
3. Leer work-record + frontmatter `epica: EP-NNN` (si existe).
4. Mary o el experto designado lee y propone:
   - Si el work cerro una capacidad nueva relevante a `mission.md`: proponer entry a logros/capacidades clave.
   - Si el work cerro un item de roadmap: actualizar item en `roadmap.md` (status, fecha cierre).
   - Si el work tiene `epica` declarada: actualizar `agent-os/product/roadmap/EP-NNN/work-records.yml` + `EP-NNN/README.md` con decisiones arquitectonicas significativas.
5. AskUserQuestion por cada actualizacion propuesta antes de escribir.
6. Al cerrar exitosamente, actualizar `cosecha.producto` del README del work:
   ```yaml
   cosecha:
     producto:
       ejecutado: true
       fecha: "{fecha de hoy}"
       por: "{dev-name}"
       artefactos_actualizados: [{lista de paths actualizados}]
       nota: "string corta opcional"
   ```
   Si re-ejecucion: acumular `artefactos_actualizados[]` sin duplicados.

**Sin flag** `--desde-work`: comportamiento actual (conversacion interactiva para crear/actualizar mission/roadmap/tech-stack desde cero).

## Process

### Step 1: Check for Existing Product Docs

Check if `agent-os/product/` exists and contains any of these files:
- `mission.md`
- `roadmap.md`
- `tech-stack.md`

**If any files exist**, use AskUserQuestion:

```
I found existing product documentation:
- mission.md: [exists/missing]
- roadmap.md: [exists/missing]
- tech-stack.md: [exists/missing]

Would you like to:
1. Start fresh (replace all)
2. Update specific files
3. Cancel

(Choose 1, 2, or 3)
```

If option 2, ask which files to update and only gather info for those.
If option 3, stop here.

**If no files exist**, proceed to Step 2.

### Step 2: Gather Product Vision (for mission.md)

Use AskUserQuestion:

```
Let's define your product's mission.

**What problem does this product solve?**

(Describe the core problem or pain point you're addressing)
```

After they respond, use AskUserQuestion:

```
**Who is this product for?**

(Describe your target users or audience)
```

After they respond, use AskUserQuestion:

```
**What makes your solution unique?**

(What's the key differentiator or approach?)
```

### Step 3: Gather Roadmap (for roadmap.md)

Use AskUserQuestion:

```
Now let's outline your development roadmap.

**What are the must-have features for launch (MVP)?**

(List the core features needed for the first usable version)
```

After they respond, use AskUserQuestion:

```
**What features are planned for after launch?**

(List features you'd like to add in future phases, or say "none yet")
```

### Step 3b: Organize Roadmap by Epics (optional)

After gathering the roadmap information, use AskUserQuestion:

```
?Como deseas organizar el roadmap?

1. Por epicas - Agrupar funcionalidades en epicas con /roadmap (recomendado para proyectos con multiples features relacionadas)
2. Roadmap plano - Un solo archivo roadmap.md (como antes, para proyectos simples)

(Elige 1 o 2)
```

**If option 1:**
1. Review the MVP and post-launch features gathered in Step 3
2. Use AskUserQuestion to propose grouping into epics:
   ```
   Basandome en las funcionalidades que describiste, sugiero estas epicas:

   EP-001: {nombre sugerido} - {features agrupadas}
   EP-002: {nombre sugerido} - {features agrupadas}

   ?Estas de acuerdo? Puedes ajustar nombres, agregar o quitar epicas.
   ```
3. For each confirmed epic, create the epic structure using the same process as `/roadmap crear`:
   - Create `agent-os/product/roadmap/EP-{NNN}-{nombre-slug}/` with README.md, specs/, work-records.yml
   - Update `agent-os/product/roadmap/_roadmap.yml`
4. Still generate `roadmap.md` but include a reference to the epics:
   ```markdown
   # Product Roadmap

   ## Organization

   This roadmap is organized by epics. See `agent-os/product/roadmap/` for detailed epic information.

   | Epic | Name | Features | Priority |
   |------|------|----------|----------|
   | EP-001 | {name} | {features} | {priority} |

   ## Phase 1: MVP
   [features mapped to epics]

   ## Phase 2: Post-Launch
   [features mapped to epics]
   ```

**If option 2:** Generate `roadmap.md` as before (original Step 5 logic).

### Step 4: Establish Tech Stack (for tech-stack.md)

First, check if `agent-os/standards/global/tech-stack.md` exists.

**If the tech-stack standard exists**, read it and use AskUserQuestion:

```
I found a tech stack standard in your standards:

[Summarize the key technologies from global/tech-stack.md]

Does this project use the same tech stack, or does it differ?

1. Same as standard (use as-is)
2. Different (I'll specify)

(Choose 1 or 2)
```

If they choose option 1, use the standard's content for tech-stack.md.
If they choose option 2, proceed to ask them to specify (see below).

**If no tech-stack standard exists** (or they chose option 2 above), use AskUserQuestion:

```
**What technologies does this project use?**

Please describe your tech stack:
- Frontend: (e.g., React, Vue, vanilla JS, or N/A)
- Backend: (e.g., Rails, Node, Django, or N/A)
- Database: (e.g., PostgreSQL, MongoDB, or N/A)
- Other: (hosting, APIs, tools, etc.)
```

### Step 5: Generate Files

Create the `agent-os/product/` directory if it doesn't exist.

Generate each file based on the information gathered:

#### mission.md

```markdown
# Product Mission

## Problem

[Insert what problem this product solves - from Step 2]

## Target Users

[Insert who this product is for - from Step 2]

## Solution

[Insert what makes the solution unique - from Step 2]
```

#### roadmap.md

```markdown
# Product Roadmap

## Phase 1: MVP

[Insert must-have features for launch - from Step 3]

## Phase 2: Post-Launch

[Insert planned future features - from Step 3, or "To be determined" if they said none yet]
```

#### tech-stack.md

```markdown
# Tech Stack

[Organize the tech stack information into logical sections]

## Frontend

[Frontend technologies, or "N/A" if not applicable]

## Backend

[Backend technologies, or "N/A" if not applicable]

## Database

[Database choice, or "N/A" if not applicable]

## Other

[Other tools, hosting, services - or omit this section if nothing mentioned]
```

### Step 6: Confirm Completion

After creating all files, output to user:

```
✓ Product documentation created:

  agent-os/product/mission.md
  agent-os/product/roadmap.md
  agent-os/product/tech-stack.md

Review these files to ensure they accurately capture your product vision.
You can edit them directly or run /plan-product again to update.
```

## Tips

- If the user provides very brief answers, that's fine - the docs can be expanded later
- If they want to skip a section, create the file with a placeholder like "To be defined"
- The `/shape-spec` command will read these files when planning features, so having them populated helps with context
