---
name: lead-evolution
description: Orquesta el proceso de rediseno cuando Sally es invocada desde el gobernador (`/alfred`) bajo la ruta `rediseno-ui`. Thin overlay encima de redesign.
menu-code: LE
---

# LE — Lead evolution (cuando Sally es invocada desde el gobernador)

> **Voz Sally:** Cuando trabajas bajo el gobernador (`/alfred`) sigues siendo tu. Los artefactos
> quedan en carpetas fijas, pero el tono hacia el usuario se mantiene: cuentas
> que estas haciendo y por que, no reportas como robot.

Thin overlay encima de `./redesign.md`. El proceso procedimental vive en RD
como unico source of truth. LE solo especifica los ajustes cuando el
gobernador orquesta las etapas externamente.

**Cuando usar:** el gobernador (`/alfred`) te invoca en Etapa 1, 2 o 4 con capacidad `LE`.
**Cuando NO usar:** usuario te invoca fuera del gobernador → usa `RD` en su lugar.

## Contexto que te pasa el gobernador al invocarte

En el prompt de invocacion, el gobernador te entrega:

- **Etapa actual** (1, 2 o 4) — determina que sub-fases ejecutas.
- **Descripcion del work** y senales detectadas.
- **etapa-0/contexto.md** y **etapa-0/bitacora.md** (works legacy v1 — en works nuevos: ## Abordaje en README).
- Si Etapa 2+: **etapa-1/01-discovery.md** y **etapa-1/01-discovery-distillate.md** con `direccionElegida`.
- Si Etapa 4: **etapa-2/02-propuesta-rediseno.md** con invariantes declaradas.
- **Catalogo de capacidades** si ya existe en sidecar.

## Diferencias vs RD standalone

| Aspecto | RD (standalone) | LE (dentro del flujo gobernado) |
|---|---|---|
| Orquestacion de etapas | Sally maneja todo internamente | el gobernador gestiona; LE trabaja etapa a etapa |
| Archivos de salida | `redesign-*.md` en ubicacion libre | Rutas fijas dentro de `etapa-{N}/` |
| Gates | Sally los presenta directo al usuario | el gobernador los ejecuta con expertos de calidad (Bob, Quinn) tras LE |
| Revisiones cruzadas | Opcionales | Obligatorias (Bob/Quinn/Amelia en sus etapas) |
| Consolidacion en spec | Manual | Automatica via `/consolidar-work` |

## Que ejecutas por etapa

### Cuando el gobernador te invoca en Etapa 1

Ejecutas **Sub-fases 1-4 de RD** (ver `./redesign.md`). Ajustes especificos cuando estas bajo el gobernador:

- **Sub-fase 1 (Inventario):** escribe en `etapa-1/01-estado-actual.md` usando plantilla `./evolution-templates/estado-actual.md`. A Mary y Winston los lanza el gobernador como subagentes paralelos — no los invocas tu directamente.
- **Sub-fase 2 (Divergencia):** output en `etapa-1/01-ideacion-bruta.md`.
- **Sub-fase 3 (Roundtable):** el gobernador lanza Winston/Mary/John cuando tu se lo pides. Tu consolidas en `etapa-1/01-ideacion.md`.
- **Sub-fase 4 (Viabilidad):** output en `etapa-1/01-viabilidad.md`.

Al terminar, devuelves control al gobernador con resumen y la short-list. El gobernador ejecuta el gate con esa short-list; la direccion elegida va al frontmatter de `01-discovery.md` como `direccionElegida: <ID>`.

### Cuando el gobernador te invoca en Etapa 2

Ejecutas **Sub-fase 5 de RD** (ver `./redesign.md`). Ajustes especificos:

- **Prototipo (5.a/5.b):** va a `etapa-2/mockups/rediseno-{nombre}.{html|md}`. Referencias externas a `etapa-2/mockups/referencias.md`.
- **Propuesta formal (5.c):** invocas `PE` con destino `etapa-2/02-propuesta-rediseno.md`.

Al terminar devuelves al gobernador con resumen y numero de invariantes declaradas. El gobernador lanza revisiones cruzadas (Winston factibilidad, John preparacion para tareas); si hay ajustes te re-invoca. Cuando todos aprueban, el gobernador delega a Bob CS para generar tareas con campo `invariantes: [INV-001, ...]` y `migracion_progresiva: true` cuando aplique.

### Cuando el gobernador te invoca en Etapa 4

Ejecutas **capacidad `VE`** (ver `./validate-evolution.md`). Ajustes especificos cuando estas bajo el gobernador:

- Outputs a rutas fijas: `etapa-4/04-invariantes.md`, `etapa-4/04-revalidacion-ux.md`, `etapa-4/04-back-to-exploracion.md`.
- El gobernador lanza a Quinn en paralelo para validar que tus verificaciones de invariantes son ejecutables. Sus outputs son insumo: `etapa-4/validacion-invariantes-sally.md` y `etapa-4/validacion-invariantes-quinn.md`.
- **Regla de gate:** invariantes en FALLA bloquean el gate de Etapa 4. Metricas UX en PARCIAL o NO alcanzado NO bloquean — son informativas.

## Anfitriona de la ruta rediseno-ui

Sally conduce las 4 fases de la ruta `rediseno-ui` con capacidad `LE`.

- **Flujo de 4 fases (la ruta):** `agent-os/experts/bmad-agent-alfred/rutas/rediseno-ui/readme.md` (Frente 3).
- **Fase 1 — definir patron de diseno:** `./definir-patron-diseno.md` (detectar o definir patron con el usuario antes de iterar).
- **Cierre — documentar standard de frontend:** `./documentar-standard-frontend.md` (registrar patron correcto + antipatron observado en el standard).
- **Invariante de calidad UI:** Atomic Design + BEM sobre design tokens; sin CSS in-line nuevo no declarado como excepcion. Standard canónico: `agent-os/standards/frontend/`.

## Al cerrar la sesion LE

Sigue instruccion de Session Close en SKILL.md. Si aprendiste algo no-trivial
sobre alguna herramienta usada, actualiza `capabilities-notebook.md`.
