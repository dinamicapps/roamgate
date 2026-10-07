# Hotfix Fase 4: Investigacion y apertura de frentes

Fase nuclear. Atlas investiga con disciplina invariante (NO se sacrifica por urgencia) y abre frentes paralelos si el incidente se ramifica.

## Disciplina invariante

1. **Codebase como fuente de verdad.** Pisar archivos con citas `path:linea`. Hipotesis sin confrontar es opinion, no investigacion.
2. **Buscar works relacionados.** `grep` en `agent-os/work-records/` y `agent-os/disenos/` por palabras clave del sintoma y del path sospechoso. Resultado al registro del frente.
3. **Declarar los principios del MANIFIESTO por frente (P7 exento en hotfix: un-break).** Antes de tocar codigo, Atlas escribe en la bitacora del frente como aplica cada principio del MANIFIESTO a este frente especifico. Checklist activo, no asumido.
4. **Filtros Sentinel/Quinn/Cipher cuando aplica** (ver Fase 5).

## Apertura de frentes

- **Sintoma unico:** la investigacion se vuelca a la bitacora maestra directamente. NO se crea archivo de frente. Frontmatter maestra: `frentes_abiertos: []`, `frentes_cerrados: []`.
- **>1 sintoma (desde inicio, por ramificacion, o redirigido desde fase-1):** Crear cada frente como artefacto hijo via runtime: `agentos work file create` con `file_type: hotfix-frente` (frontmatter `frente`/`slug`/`tipo:frente`/`sintoma_inicial`/`estado:abierto`/`fecha_apertura`). Registrar `F{N}` en la maestra: `agentos work set-fm --slug <slug>` con `{"frentes_abiertos":[...]}`. No editar `bitacora.md` ni los frentes a mano. Ver `bmad-agent-alfred/gestion/hotfix.md`. Antes de abrir, verificar hard stops. Un sintoma **redirigido desde fase-1** (la sesion ya conducia este hotfix cuando llego un nuevo `/alfred hotfix`) recibe tratamiento identico a uno ramificado: verificar hard stops, crear F{N} via runtime, registrar en la maestra.

## Deteccion de convergencia entre frentes

Si Atlas detecta que F_a y F_b comparten causa raiz: registrar entradas espejo en ambas bitacoras (`## HH:MM [atlas] Convergencia con F_x`), actualizar `converge_con[]` en ambos frentes, registrar hito en la maestra, y decidir cual frente se resuelve primero (el upstream/causa raiz); el otro queda **absorbido** (su cierre se da con el commit del primero, no por separado).

## Hard stops del sistema

### Stop 1 — Carga cognitiva: 4to frente con 3 abiertos

Si aparece un nuevo sintoma cuando `frentes_abiertos[]` ya tiene 3 elementos, Atlas NO abre F4. Publica:

```
A-Atlas: Detecte un 4to sintoma "{descripcion}". Pero ya tengo 3 frentes
abiertos (F1, F2, F3) y el limite de carga simultanea es 3.

Opciones:
  (a) Cerrar uno de los abiertos antes de abrir F4. ¿Cual cierro?
      F1 ({estado}): ultima entrada "{ultima entrada cronologica resumida}"
      F2 ({estado}): ultima entrada "{ultima entrada cronologica resumida}"
      F3 ({estado}): ultima entrada "{ultima entrada cronologica resumida}"
  (b) Diferir el 4to sintoma — lo registro como entry en post-works
      del hotfix y lo revisas tras cerrar este.

¿Que decides?
```

Sin decision en tiempo razonable (~10 min), el 4to sintoma queda diferido por default; Atlas registra la decision por defecto en bitacora.

### Stop 2 — Alcance: F6 (6to frente total acumulado)

Si aparece un nuevo sintoma cuando el hotfix ya acumulo 5 frentes totales (`frentes_abiertos[]` + `frentes_cerrados[]` = 5), Atlas NO abre F6. Publica:

```
A-Atlas: Vas a abrir F6 con "{descripcion del nuevo sintoma}".

El hotfix ya acumulo 5 frentes (algunos cerrados, otros abiertos). Abrir F6
significa que este incidente excedio el alcance de hotfix. Necesitas decidir
una de dos rutas:

  (a) Cerrar este hotfix con lo que tienes (los frentes 1-5) y abrir
      hotfix nuevo para este sintoma y los proximos. Trazabilidad:
      bitacora del hotfix nuevo registra "continua incidente del
      hotfix {slug-actual}".

  (b) Cerrar este hotfix con lo que tienes y promover a /alfred fix o
      /alfred iniciar el resto del incidente (los sintomas restantes
      mas el F6). La bitacora del hotfix actual queda como contexto
      del work nuevo.

NO puedo seguir abriendo frentes en este hotfix. ¿Que ruta tomas?
```

Sin decision del usuario el hotfix queda en espera; Atlas no abre F6 bajo ninguna circunstancia, y registra en la bitacora maestra que espera decision.

> **Asimetria con Stop 1 (deliberada, no olvido):** Stop 1 tiene comportamiento por defecto (~10 min -> diferir el 4to sintoma) porque diferir es seguro: el sintoma se atiende despues. Stop 2 NO auto-difiere porque abrir F6 significa que el incidente excedio el alcance de hotfix — esa es una decision de RUTA (cerrar+nuevo hotfix vs promover a fix/iniciar) que solo el usuario puede tomar. Atlas espera indefinidamente sin abrir F6; no hay default seguro que elegir por el.

## Promocion a `/alfred fix` desde un frente

Si Atlas no logra hipotesis verificada en un frente individual tras ~1h, sugiere (no regla):

```
A-Atlas: Llevo ~1h en F{N} sin hipotesis verificada solida. Propongo:
(a) Promover F{N} a /alfred fix con investigacion mas profunda (Atlas
    sigue conduciendo pero con tiempo y disciplina de bugfix focal).
(b) Cerrar F{N} como parche temporal con causa raiz pendiente declarada
    (entry en post-works fuerza revision posterior).
(c) Continuar investigando en hotfix (asumir tiempo adicional).

¿Cual eliges?
```

<!-- FUENTE: .claude/MANIFIESTO.md. Los principios universales que Atlas declara por frente (P7 exento en hotfix: un-break). NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/hotfix/frente.md. Plantilla de la bitacora de frente (frentes_abiertos, converge_con, etc.). NO duplicar -- editar la plantilla. -->
