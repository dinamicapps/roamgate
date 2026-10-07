---
slug: "{YYYYMMDD}-bugfix-{slug-corto}"
modo: "normal"
nivel: "normal"          # minima | normal | maxima (perilla de autonomia; nace de autonomia.rutas.bugfix.nivel en .claude/agent-os.local.json, ausente = normal)
estado: "EN_PROGRESO"   # EN_PROGRESO | COMPLETADO | TRASLADADO_A_DISENO
etapa_actual: 0          # bugfix no usa etapas formales; queda en 0
fecha_inicio: "{YYYY-MM-DD}"
fecha_fin: null
autor: "{nombre del usuario}"
sabueso: "atlas"
ruta: "bugfix"
version_sistema: "2"
# desenlace: se declara con `agentos work set-fm` al clasificar (correccion_codigo | restriccion_faltante | parametrizacion_no_controlada | notificacion_faltante | logging_faltante | caso_en_seguimiento | replanteo)
modo_bugfix: true
---

# Work: bugfix-{titulo descriptivo}

> Estado: **{EN_PROGRESO}** · Modo: bugfix · Sabueso: atlas · {fecha_inicio}

## Descripcion del bug

{Descripcion del usuario tal como llego.}

---

## Diagnostico forense

> Lo llena Atlas en `investigacion.md` ANTES de tocar codigo. Anti-parche: sin diagnostico no hay fix.

**Dimensiones investigadas:** {Dim 1 codigo/persistencia/logging [+ Dim 2 parametrizacion prod (Dexter)] [+ Dim 2b material criptografico prod (Cipher)]}.

**Evidencia:**
- `archivo:linea` — {que muestra}
- `tabla.columna` / config prod — {que muestra} (si aplico Dim 2)
- vigencia/algoritmo/politica de verificacion (metadatos, P-C8) — {que muestra} (si aplico Dim 2b)

**Causa raiz:** {causa identificada con evidencia} — o — **No concluyente:** {hueco honesto; que logs faltan; que reincidencia esperar}.

**Desenlace:** `{valor del enum}` (se confirma en `conversacion.md` y se persiste via `work set-fm`).

---

<!-- VARIANTE 1: Bugfix trivial (1 fix de 1 archivo, 0 tareas separadas).
     El README absorbe la tarea. Mantener estas secciones. Omitir la
     seccion '## Tareas' al final. -->

## Sabueso: atlas

### Hipotesis

{Hipotesis del bug tras investigacion privada (~5 min): que esta roto, donde, por que.}

### Solucion

{Solucion acordada con el usuario tras la conversacion.}

### Fix aplicado

- `ruta/archivo:linea` — {descripcion 1 linea de la modificacion}

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|

(ninguno)

## Verificacion

- {prueba concreta}: PASS
- Build limpio: PASS

## Cierre

COMPLETADO el {YYYY-MM-DD}. Desenlace: `{valor}`. {1 frase de resumen.}

---

<!-- VARIANTE 2: Bugfix con >=1 tareas formales. Eliminar las secciones
     '## Sabueso: atlas' a '## Cierre' de arriba. Usar la siguiente tabla
     de tareas en su lugar. -->

## Tareas

| T | Titulo | Status | Verif | Tags |
|---|--------|--------|-------|------|

## Cierre

COMPLETADO el {YYYY-MM-DD}. {1 frase de resumen.}

---

<!-- ESCENARIO ESPECIAL: Si Atlas detecta durante la conversacion que el
     fix excedio scope focal (>3 modulos, >3 actores, comportamiento
     nuevo), traslada a /disenar:

       /alfred bugfix promover-a-diseno

     El estado cambia a TRASLADADO_A_DISENO. Frontmatter se popula con:
       trasladado_a: "{slug del diseño}"
       trasladado_en: "{fecha}"
       trasladado_razon: "{razon textual}"

     Y se agrega seccion final: -->

## Traslado a diseño

**Trasladado a:** `{slug-diseno}`
**Fecha:** {YYYY-MM-DD}
**Razon:** {razon textual concreta}

**Insumo entregado al diseño:** la investigacion de Atlas (hipotesis, ubicacion sospechosa, modulos involucrados) entra al FOCO del diseño nuevo como una fuente mas, y lo que el codigo sostiene queda como nodos del modelo con su cita, trazados a este bugfix por `work_origen_bugfix`.

Para continuar: una vez `/disenar` produzca brief, ejecutar `/alfred iniciar --desde-diseno={slug-diseno}`.
