---
name: cerrar-work-git
description: 'Estandariza el cierre git de un work: branch, commit con formato convencional, PR opcional. Invocable desde /alfred (Etapa 4, Paso 8) o standalone.'
---

# Cerrar Work Git — Cierre estandarizado con git

## Overview

Estandariza el proceso de commit/branch/PR al cerrar un work para que sea consistente independientemente del desarrollador o la sesion de Claude. Define formato de branch, mensaje de commit, y flujo de PR.

## Invocacion

- **Desde /alfred Etapa 4 Paso 8:** automatico, recibe contexto del work
- **Standalone:** `/cerrar-work-git` para cerrar un work que ya paso verificacion

## On Activation

1. Determinar contexto:
   - Si desde /alfred: usar el work activo y sus artefactos
   - Si standalone: buscar works COMPLETADOS sin commit registrado

2. Verificar estado git:
   - `git status` para ver archivos modificados
   - `git branch` para ver branch actual
   - Si no hay cambios en el working tree: informar y terminar

### Paso 1: Revisar cambios

Leer `modo` del README del work activo para adaptar el resumen y el flujo a la naturaleza del entregable.

Mostrar resumen de cambios al usuario (las categorias cambian por `modo`):

**modo:`normal`** (o el flujo `rediseno-ui`) — entregable principal es codigo:
```
=== CAMBIOS POR COMMITEAR ===
Branch actual: {branch}
Modo del work: {modo}
Archivos modificados: {N}
  Codigo: {N} archivos
  Work-records: {N} archivos
  Specs: {N} archivos
  Otros: {N} archivos
```

**modo:investigacion** — entregable principal es insumo:
```
=== CAMBIOS POR COMMITEAR ===
Branch actual: {branch}
Modo del work: investigacion
Archivos modificados: {N}
  Insumo investigativo: {N} archivos (ej. etapa-3/investigacion/, etapa-3/insumo-consolidado.md)
  Work-records: {N} archivos
  Otros: {N} archivos

Nota: este work no modifica codigo productivo — no se espera categoria "Codigo".
```

**modo:documentacion** — entregable principal es documento:
```
=== CAMBIOS POR COMMITEAR ===
Branch actual: {branch}
Modo del work: documentacion
Archivos modificados: {N}
  Documento producido: {N} archivos en {ruta destino ej. .documentacion/manuales/}
  Diagramas/screenshots: {N} archivos
  Work-records: {N} archivos
  Otros: {N} archivos

Nota: este work no modifica codigo productivo — no se espera categoria "Codigo".
```

### Paso 2: Branch

AskUserQuestion:
  question: "Branch para el commit:"
  options:
    - label: "Crear branch nueva"
      description: "Crear {tipo}/{nombre-work} desde la branch actual."
    - label: "Branch actual ({nombre})"
      description: "Commitear en la branch donde estamos."

Si "Crear branch nueva":
- Determinar tipo segun el `modo` del work (prioritario) y la descripcion (secundario):
  - `modo: documentacion` → `docs/`
  - `modo: investigacion` → `research/`
  - flujo `rediseno-ui` → `evolve/`
  - `modo: normal` con descripcion que contiene "fix", "corregir", "bug" → `fix/`
  - `modo: normal` con descripcion que contiene "refactor" → `refactor/`
  - `modo: normal` por default → `feature/`
- Crear branch: `git checkout -b {tipo}/{nombre-work}`

### Paso 3: Staging

Las opciones de staging cambian por `modo`:

**modo:`normal`** (o el flujo `rediseno-ui`):
AskUserQuestion:
  question: "Que incluir en el commit:"
  options:
    - label: "Codigo + work-records + specs"
      description: "Todo: implementacion, registros de trabajo y specs generadas."
    - label: "Solo codigo"
      description: "Solo los archivos de implementacion. Work-records se commitean aparte."
    - label: "Revisar archivo por archivo"
      description: "Seleccionar manualmente que archivos incluir."

**modo:investigacion:**
AskUserQuestion:
  question: "Que incluir en el commit:"
  options:
    - label: "Insumo + work-records"
      description: "Todo: insumo investigativo y registros de trabajo."
    - label: "Solo insumo"
      description: "Solo archivos del insumo (etapa-3/investigacion/, insumo-consolidado.md)."
    - label: "Revisar archivo por archivo"
      description: "Seleccionar manualmente."

**modo:documentacion:**
AskUserQuestion:
  question: "Que incluir en el commit:"
  options:
    - label: "Documento + work-records"
      description: "Todo: documento producido, diagramas/screenshots y registros de trabajo."
    - label: "Solo documento"
      description: "Solo archivos del documento en su ruta destino del repo."
    - label: "Revisar archivo por archivo"
      description: "Seleccionar manualmente."

Si "Revisar archivo por archivo": mostrar lista con AskUserQuestion para cada grupo.

Ejecutar `git add` con los archivos seleccionados.

### Paso 4: Commit

Generar mensaje de commit usando el template (ver abajo). Mostrar preview al usuario:

AskUserQuestion:
  question: |
    === PREVIEW DE COMMIT ===
    ```
    {mensaje completo}
    ```
  options:
    - label: "Confirmar"
      description: "Crear el commit con este mensaje."
    - label: "Editar mensaje"
      description: "Modificar el mensaje antes de commitear."
    - label: "Cancelar"
      description: "No hacer commit."

Si "Editar mensaje": AskUserQuestion para que el usuario escriba el mensaje.

Ejecutar `git commit`.

### Paso 5: PR (opcional)

AskUserQuestion:
  question: "Crear Pull Request?"
  options:
    - label: "Si, crear PR"
      description: "Push a remote y crear PR con resumen del work."
    - label: "Solo push"
      description: "Push a remote sin crear PR."
    - label: "No"
      description: "Solo commit local. Push manual despues."

Si PR: usar `gh pr create` con titulo y body generados desde el work.
Si push: `git push -u origin {branch}`.

### Paso 6: Registrar

Registrar en `etapa-4/bitacora.md`:
```markdown
## [Orquestador] Cierre git
fecha: {timestamp}
branch: {branch}
commit: {hash corto}
archivos: {N} ({N} codigo, {N} work-records, {N} specs)
pr: {URL o "no creado"}
```

## Template de mensaje de commit

```
{tipo}: {descripcion breve del work} (max 50 chars)

Modo: {normal | rediseno-ui | investigacion | documentacion}
CAs verificados: {N}/{N} MUST
Estado: {COMPLETADO | COMPLETADO_VERIFICACION_DIFERIDA | COMPLETADO_CON_BRECHA}

Archivos principales:
{lista de archivos modificados segun modo, max 10}

{Si hay decisiones clave:}
Decisiones:
- {decision 1}
- {decision 2}

Work: {YYYYMMDD-nombre}
```

`Estado` es el que el runtime **horneo** — el que devolvio el envelope de `work close` (o el que
quedo en el README del work), no el que se pidio con `--estado`. Un cierre con bloque
`verificacion_diferida{}` se pide como `COMPLETADO` y termina en `COMPLETADO_VERIFICACION_DIFERIDA`.

La linea final `Work: {YYYYMMDD-nombre}` (`Diseno: {slug}` si la unidad es un diseno en vez de un
work) es el trailer de pertenencia del regimen git: agrupa los commits de una rama en un segmento
por unidad, y sin ella el commit queda fuera de todo segmento — `worktree colapsar` y
`worktree merge` lo rechazan con `COMMIT_HUERFANO`.

### Tipos de commit por modo

**Resolucion:** el `modo` del work tiene prioridad sobre la descripcion.

| modo | Tipo default | Override segun descripcion |
|------|--------------|----------------------------|
| `documentacion` | `docs` | — |
| `investigacion` | `docs` (con prefijo narrativo `research:` en el body) | — |
| `rediseno-ui` (flujo) | `refactor` | — |
| `normal` | `feat` | Si descripcion contiene "fix/corregir/bug" → "fix". Si "refactor" → `refactor`. Si "test/prueba" → `test`. Si "chore/mantenimiento" → `chore`. |

Nota: en modo `investigacion` y `documentacion`, la seccion "Archivos principales" del template lista los artefactos del insumo/documento, no archivos de codigo.

## Reglas de git

- Nombres de branch descriptivos: `feature/sistema-pedidos-crud` no `feature/cambios`
- Commits atomicos en destino: al fusionar, cada unidad deja UN commit en `dev`/`main`.
  Mientras la unidad esta activa, los checkpoints se fragmentan libremente (por tarea, por
  ronda de gate); `worktree colapsar` los consolida en uno antes del merge — nunca es el
  operador quien tiene que recordar fragmentar menos.
- Todo commit de una rama de trabajo lleva el trailer de su unidad (`Work: {slug}` o
  `Diseno: {slug}`), incluidos los checkpoints intermedios — no solo el commit final: el regimen
  git particiona la rama leyendo esa linea en CADA commit, y un checkpoint sin ella deja la
  particion incompleta (`worktree colapsar`/`worktree merge` rechazan con `COMMIT_HUERFANO`)
- No sincronizar la rama de trabajo con la default mientras vive: ni `git merge {branch-base}`
  hacia dentro ni `git rebase {branch-base}`. Un merge entrante rompe la linealidad del rango que
  el regimen git exige para particionar la rama, y un rebase invalida el `base_commit` de cada
  unidad (reescribe los hashes). La divergencia se resuelve una sola vez, en el merge final hacia
  la default.
- No hacer push directo a `dev` o `main` — preferir PR
- No incluir archivos sensibles: `.env`, credenciales, `test-env.local.json`
