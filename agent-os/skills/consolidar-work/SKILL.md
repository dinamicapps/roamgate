---
name: consolidar-work
description: 'Consolida un work completado en la epica y specs del proyecto. Genera spec de epica, actualiza _roadmap.yml y specs/_indice.yml. Invocable desde /alfred (Etapa 4, Paso 7) o standalone para consolidar works viejos.'
---

# Consolidar Work — Persistencia en Epica y Specs

## Overview

Al cerrar un work, sus hallazgos y decisiones deben persistir en dos destinos:
- **Spec del modulo** (`agent-os/specs/`): conocimiento tecnico acumulado del modulo
- **Spec de la epica** (`agent-os/product/roadmap/EP-{NNN}-*/specs/`): registro del work dentro de la epica

Esto evita que cada work futuro redescubra terreno ya cubierto.

## Invocacion

- **Desde /alfred Etapa 4 Paso 7:** automatico, recibe contexto del work
- **Standalone:** `/consolidar-work` para consolidar works viejos que se cerraron sin este paso

## On Activation

1. Determinar contexto:
   - Si desde /alfred: usar el work activo, `work_output_path`, y artefactos ya cargados
   - Si standalone: buscar works en un terminal de entrega (COMPLETADO, COMPLETADO_VERIFICACION_DIFERIDA, COMPLETADO_CON_BRECHA) sin consolidacion

2. Si standalone, listar works candidatos:

   AskUserQuestion:
     question: "Works sin consolidar:"
     options: (dinamicas, uno por work candidato)

### Paso 1: Determinar modulo y epica

Si desde /alfred, estos ya estan determinados (Etapa 4 Paso 6). Si standalone:

1. Leer README.md del work para extraer epica vinculada y archivos modificados
2. Inferir modulo desde los archivos principales modificados

AskUserQuestion:
  question: "Modulo: {area}/{modulo}. Epica: {EP-NNN o 'sin-epica'}. Confirmar?"
  options:
    - label: "Confirmar"
    - label: "Corregir"

### Paso 2: Generar/actualizar spec del modulo

Leer artefactos del work:
- `etapa-0/contexto.md` — contexto y standards (works legacy v1; en works nuevos: ## Abordaje en README)
- `etapa-1/01-discovery.md` — CAs y alcance
- `etapa-2/03-plan.md` — arquitectura elegida
- `etapa-3/06-hallazgos.md` — decisiones de implementacion
- `etapa-4/07-verificacion.md` — resultado de verificacion

**Si modo = pool (desde /alfred):**
Lanzar Paige como subagente (Patron A) — `agent-os/experts/bmad-agent-paige/SKILL.md` capacidad `DPR`.

**Si modo = atlas (desde /alfred):**
Lanzar Atlas como subagente (Patron A) — `agent-os/experts/bmad-agent-atlas/SKILL.md` capacidad `DOC`.

**Si standalone:**
Lanzar Paige como subagente (Patron A) con los artefactos del work.

El subagente genera/actualiza `agent-os/specs/{epica-o-sin-epica}/{modulo}.md` con:
- Descripcion del modulo
- Arquitectura actual
- Decisiones tecnicas vigentes
- CAs verificados
- Archivos principales
- Fecha de ultima actualizacion

### Paso 3: Actualizar indice de specs

Leer `agent-os/specs/_indice.yml`. Si no existe, crearlo.

Agregar o actualizar entrada:
```yaml
modulos:
  "{area}/{modulo}":
    archivo: "{epica-o-sin-epica}/{modulo}.md"
    epica: "{EP-NNN o null}"
    ultimo_work: "{YYYYMMDD-nombre}"
    fecha: "{YYYY-MM-DD}"
```

### Paso 4: Consolidar en epica (si hay epica vinculada)

Si no hay epica vinculada, saltar este paso.

1. Verificar que la carpeta de la epica existe: `agent-os/product/roadmap/EP-{NNN}-*/`
   Si no existe, informar al usuario y sugerir `/roadmap crear`.

2. Generar spec del work en la epica:
   `agent-os/product/roadmap/EP-{NNN}-*/specs/{YYYYMMDD}-{nombre}.md`

   Contenido:
   ```markdown
   # {Nombre del work}

   Fecha: {YYYY-MM-DD}
   Estado: {COMPLETADO | COMPLETADO_VERIFICACION_DIFERIDA | COMPLETADO_CON_BRECHA}
   Modulo: {area}/{modulo}

   ## Objetivo
   {objetivo del work}

   ## CAs verificados
   Total: {N}/{N} MUST verificados
   - PASS: {N}
   - FAIL: {N}
   - BLOCKED: {N}

   ## Archivos modificados
   {lista de archivos}

   ## Decisiones clave
   {decisiones del README del work}
   ```

3. Actualizar `work-records.yml` dentro de `agent-os/product/roadmap/EP-{NNN}-*/`:
   ```yaml
   works:
     - nombre: "{YYYYMMDD-nombre}"
       fecha: "{YYYY-MM-DD}"
       estado: "{estado}"
       modulo: "{area}/{modulo}"
       cas_verificados: {N}
       cas_total: {N}
   ```

4. Actualizar `agent-os/product/roadmap/_roadmap.yml`:
   - Incrementar contadores `trabajos` y `specs` de la epica

### Paso 5: Confirmar

```
=== CONSOLIDACION COMPLETADA ===
Spec del modulo: agent-os/specs/{epica}/{modulo}.md ({creada | actualizada})
Indice de specs: agent-os/specs/_indice.yml ({creada | actualizada})
{Si epica:}
Spec de epica: agent-os/product/roadmap/EP-{NNN}-*/specs/{YYYYMMDD}-{nombre}.md
Roadmap: _roadmap.yml actualizado (trabajos: {N}, specs: {N})
```
