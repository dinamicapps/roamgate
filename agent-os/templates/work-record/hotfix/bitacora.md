---
slug: "{YYYYMMDD-HHMM}-hotfix-{slug-incidente}"
modo: hotfix
tipo: maestra
estado: EN_PROGRESO   # EN_PROGRESO | COMPLETADO | PROMOVIDO_A_WORK
fecha_inicio: "{ISO8601}"
fecha_fin: null
disparado_por: usuario
contexto: "{descripcion textual del contexto del incidente}"
work_pausado: null   # slug del work activo pausado al disparar, o null si no habia
frentes_abiertos: []
frentes_cerrados: []
---

# Bitacora maestra del incidente: {slug}

> Hilo cronologico maestro del hotfix. Cada entrada lleva formato `## HH:MM [actor] {titulo}`.
> Las bitacoras de frente (F1-*.md, F2-*.md, ...) viven al mismo nivel que este archivo
> y registran investigacion tecnica detallada por sintoma. Esta maestra registra apertura
> y cierre de frentes, convergencias detectadas, y decisiones de topologia del incidente.

## Entradas obligatorias minimas

Atlas registra estas entradas cronologicamente en este archivo. Las bitacoras de frente
se referencian aqui en su apertura y cierre; el detalle tecnico vive en cada frente.

### 1. Disparo

```
## HH:MM [usuario] Disparo del hotfix

"{descripcion del usuario tal como llego, verbatim}"
```

### 2. Pausa de work activo (si aplica)

```
## HH:MM [sistema] Pause del work activo

Work `{slug-work-pausado}` (etapa-{N}, {tarea-actual}) pausado automaticamente.
Razon registrada en su README: "Pausado por hotfix {slug-hotfix} el {HH:MM}."
```

### 3. Apertura de frente

```
## HH:MM [atlas] Apertura F{N}: {slug-sintoma}

Abro frente F{N} para "{sintoma-corto}". Bitacora del frente: F{N}-{slug-sintoma}.md.
{Nota breve: si parece relacionado con otro frente, indicarlo. Si parece independiente, declararlo.}
```

### 4. Convergencia detectada (cuando aplica)

```
## HH:MM [atlas] Convergencia F{N} + F{M}

F{N} y F{M} comparten causa raiz: {descripcion}. Razon empirica:
{cita codebase o resultado verificacion}.

Procedo a resolver F{M} primero (o F{N}, segun cual sea el upstream). F{M} (o F{N})
quedara absorbido por el commit del otro.
```

### 5. Cierre de frente

```
## HH:MM [atlas] Cierre F{N}

Commit: {hash} "{mensaje de commit}".
Causa raiz declarada: {descripcion en una linea}.
Verificacion: {smoke resultado | suite numero | check manual}.

Entry generada automaticamente en agent-os/post-works/_pendientes.md:
"Revisar si {causa raiz} se manifiesta en otros lugares del sistema — hotfix {slug}
solo arreglo {alcance especifico}."
```

### 6. Cierre del hotfix

```
## HH:MM [atlas] Cierre del hotfix

{N frentes resueltos}. {M commits}. {Frentes convergidos / independientes}.

Estado: COMPLETADO.

{Si habia work pausado:}
Work pausado: {slug-work-pausado}. Para retomar:
  /alfred continuar {slug-work-pausado}

{Si no habia work pausado: omitir las dos lineas anteriores}
```

## Decisiones de topologia (registradas cronologicamente arriba)

A medida que el incidente avanza, Atlas registra arriba:
- Cuando un frente se abre.
- Cuando dos o mas frentes convergen en causa raiz comun.
- Cuando un frente se absorbe en otro (no se resuelve por separado).
- Cuando aplica hard stop por carga (>3 abiertos) o alcance (F6).
- Cuando un frente se promueve a la ruta `bugfix` por exceder tiempo razonable.

La maestra es el indice del incidente. El detalle tecnico esta en cada bitacora de frente.
