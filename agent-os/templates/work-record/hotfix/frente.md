---
frente: F{N}
slug: "{slug-sintoma-corto}"
tipo: frente
sintoma_inicial: "{descripcion del sintoma observado}"
estado: abierto   # abierto | cerrado | absorbido_por_otro
fecha_apertura: "{ISO8601}"
fecha_cierre: null
converge_con: []   # lista de Fn con los que comparte causa raiz
causa_raiz: null   # se llena al cerrar (1-2 lineas)
commit_cierre: null   # hash del commit que cerro este frente
---

# Frente F{N}: {sintoma-corto}

> Bitacora cronologica de la investigacion tecnica de este frente.
> Cada entrada: `## HH:MM [actor] {titulo}`.
> Disciplina: codebase como fuente de verdad, busqueda de works relacionados, principios
> del MANIFIESTO (P7 exento en hotfix: un-break) declarados explicitamente ANTES de tocar
> codigo, filtros Sentinel/Quinn/Cipher obligatorios cuando aplican.

## Entradas obligatorias minimas

Atlas registra estas entradas cronologicamente en este archivo.

### 1. Hipotesis inicial

```
## HH:MM [atlas] Hipotesis inicial

{Que sospecha Atlas que esta roto, en que capa. Hipotesis es declarativa,
verificable contra codebase en el siguiente paso.}
```

### 2. Codebase pisado

```
## HH:MM [atlas] Codebase pisado (P5 source-of-truth)

{Citas verificables: archivo:linea con extracto si es util.}
{Hipotesis confirmada/refinada con base en codebase.}
```

### 3. Works relacionados detectados

```
## HH:MM [atlas] Works relacionados detectados

grep en agent-os/work-records/ y agent-os/disenos/ por terminos clave:
- {slug-work-relacionado-1} ({estado}). {Por que es relevante: invalida hotfix?
  patron reusable? deuda relacionada?}
- {slug-work-relacionado-N} ({estado}). {Idem.}

{Si no hay works relacionados, declararlo: "Sin works previos relevantes."}
```

### 4. Declaracion de los principios del MANIFIESTO (P7 exento en hotfix: un-break)

```
## HH:MM [atlas] Aplicacion de los principios del MANIFIESTO a este frente

(P1) Think before coding: hipotesis verificada en {paso 2}.
(P2) Simplicity first: cambio minimo planeado — {descripcion}. NO refactor adyacente.
(P3) Surgical changes: {N lineas} en {M archivos}. No tocar el resto.
(P4) Goal-driven: goal = {restablecer comportamiento X}. Verificacion: {smoke concreto planeado}.
(P5) Source-of-truth: pise codebase, no asumi. Cita en paso 2.
(P6) Audit before closing: esta bitacora ES el audit.
(P7) Trabajo conectado: exento en hotfix (un-break, sin discovery de flujo).
(P8) Honestidad epistemica: {incertidumbre declarada si la hipotesis no quedo 100% verificada, o "sin incertidumbre" si si}.
(P9) Interlocucion concreta: {las preguntas al usuario en este frente nombraron el caso y pegaron el fragmento; una decision por turno cuando estaban encadenadas}.
```

### 5. Convergencia con otro frente (cuando aplica)

```
## HH:MM [atlas] Convergencia con F{M}

F{M} ({slug-frente-M}) y este frente comparten causa raiz: {descripcion}.
Razon empirica: {cita verificable}.

Frontmatter actualizado: `converge_con: [F{M}]`.
Bitacora de F{M} tambien registra la convergencia con este frente.

Decision: {resuelvo aqui y F{M} queda absorbido | resuelvo en F{M} y este frente
absorbido (estado: absorbido_por_otro)}.
```

### 6. Filtros invocados o razon de no invocar

```
## HH:MM [atlas] Filtros opt-in (en hotfix son obligatorios cuando aplica)

Sentinel: {invocado por toca [Authorize]/permiso/tabla sensible/cookies | no invocado
porque {razon explicita}}.

Quinn: {invocada por modifica logica de validacion/test/bug-con-test-pasando | no
invocada porque {razon explicita}}.

Cipher: {invocado por toca firma/verificacion/estampa/cifrado/llave/certificado/secreto | no
invocado porque {razon explicita}}.
```

### 7. Cambio aplicado

```
## HH:MM [atlas] Cambio aplicado

{Archivo:linea(s) modificadas. Descripcion 1-2 lineas del cambio.}
{Si hay hallazgos no previstos, registrar como sub-entrada.}
```

### 8. Verificacion

```
## HH:MM [atlas] Verificacion

- run-system build: {limpio | errores resueltos | numero de warnings nuevos}.
- Smoke: {descripcion concreta del smoke + resultado}.
- Suite automatizada: {N/N verdes | M fallidos resueltos}.
```

### 9. Cierre del frente

```
## HH:MM [atlas] Cierre F{N}

Causa raiz: {1-2 lineas. Si fue parche por urgencia y la raiz queda por revisar, declararlo}.
Commit: {hash} "{mensaje commit}".

Frontmatter actualizado: `estado: cerrado`, `fecha_cierre`, `causa_raiz`, `commit_cierre`.

Entry generada en agent-os/post-works/_pendientes.md:
"Revisar si {causa raiz} aplica en {otros lugares hipoteticos del sistema} —
hotfix solo arreglo {alcance especifico de este frente}."
```

## Anti-patrones a evitar en este frente

- Saltar paso 4 (declaracion de principios del MANIFIESTO) por urgencia. Es checklist activo, no asumido.
- Saltar paso 6 (filtros) cuando el cambio toca [Authorize], permisos, validacion. La urgencia no es excusa.
- Declarar parche como fix de raiz. Si es parche, decirlo en paso 9.
- Mezclar investigacion de este frente con otro. Si descubres convergencia, registrar en paso 5; no fundir bitacoras.
