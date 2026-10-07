---
description: Reactivar un diseño interrumpido. Dos casos: modo inicial (ruteado por regimen — `modelo` entra por el FOCO con Winston, `lineal` por sus steps con Mary y pasa por el gate de reconstruccion) o modo retroceso para procesar hallazgos pendientes emitidos por works consumidores.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /disenar reanudar {slug}

Reactiva un diseño. Dos casos segun su estado: **modo inicial interrumpido**
(diseño en `EN_DISENO` que quedo a mitad del modo inicial) o **modo retroceso**
(diseño con hallazgos pendientes emitidos por works consumidores).

## Pre-requisitos

- Diseño existe en `agent-os/disenos/{slug}/`.
- Diseño NO esta en `OBSOLETO`.

## Despacho por estado

Leer el frontmatter del README del diseño — **`estado` y `flujo`** — y decidir:

- **`estado: EN_DISENO`** -> reanudar **modo inicial** (ver abajo). El anfitrion depende del
  regimen: `flujo: modelo` entra por el FOCO (Winston `CM`); `flujo: lineal` o **ausente**
  entra por los steps del regimen lineal (Mary [DI]).
- **`estado` en `BRIEF_LISTO` / `EN_USO` / `EN_RETROCESO` con >=1 hallazgo en `pendiente_analisis` o `en_analisis`** -> reanudar **modo retroceso**. Mary [DRT].
- **cualquier otro caso (sin hallazgos pendientes y no `EN_DISENO`)** -> nada que reanudar:

```
A-Mary: El diseño {slug} no tiene nada pendiente que reanudar. Estado actual: {estado},
hallazgos pendientes: 0.
```

Una vez determinado el modo de reanudación (diseño cargado), el anfitrion marca la sesión:
`diseno_slug: "{slug}"` en el archivo de sesión.
<!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Marca de sesion (diseno_slug)". Aqui solo el paso; la regla completa (entrada/salida) vive en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

## Reanudar modo inicial (`EN_DISENO` interrumpido)

El diseño quedo a mitad del modo inicial (el usuario pauso, o la sesion se corto). **La
secuencia y la zona de los step files dependen del regimen** (`flujo` del README).

<!-- FUENTE: agent-os/skills/disenar/SKILL.md seccion "Modo inicial". La topologia del flujo (quien conduce, que steps, en que orden) vive alli. Aqui solo se rutea la reanudacion. NO duplicar la regla — para modificar, editar la fuente. -->

### Regimen `modelo` (`flujo: modelo`)

1. Winston lee `disenar/SKILL.md` + `references/construccion-modelo.md` de Winston + `bitacora.md` del diseño.
2. **Determinar el ultimo step cerrado** desde la bitacora (cada step cierra con una entrada `## {fecha} — step-NN cerrado`). El siguiente de la secuencia es el de reanudacion; la secuencia es step-01 (FOCO) y de step-03 en adelante — **no hay step-02**.
   - Si la bitacora registra una pausa intra-step, reabrir ESE step, no el siguiente. **La señal de pausa intra-FOCO son entradas `## {fecha} — FOCO vuelta {N}` SIN una entrada `## {fecha} — step-01 cerrado` despues**; con la de cierre presente el FOCO esta cerrado y lo que sigue es step-03. Al reabrir el FOCO se entra en la vuelta siguiente: lo emitido ya vive en `modelo.yml` y el lazo no reempieza de cero.
   - Si la bitacora es ambigua o no concluyente, preguntar al usuario que step reabrir, listando la secuencia del regimen (step-01 FOCO, 03, 03b, 04..09).
3. Reactivar en el step determinado leyendo su tarjeta en `disenar/modo-inicial/`: el FOCO en `step-01-foco.md`, los demas en `step-NN-*.md`. Prefijo del anfitrion de ese step (`A-Winston:` en el FOCO, `A-Dexter:` en step-03, `A-Cipher:` en step-03b, `A-Mary:` de step-04 a step-09).
4. Continua el flujo normal de modo inicial hasta step-09 (handoff).

### Regimen `lineal` (`flujo: lineal` o ausente)

Diseños creados antes de que el modelo existiera. Mary [DI] conduce.

1. Mary lee `disenar/SKILL.md` + `references/disenar-modo-inicial.md` de Mary + `bitacora.md` del diseño.
2. **Determinar el ultimo step cerrado** igual que arriba; la secuencia es step-01..09 completa, con step-02 incluido.
   - Si la bitacora registra una pausa intra-step (ej. claims pendientes de step-01 sin cerrar), reabrir ESE step, no el siguiente.
   - Si la bitacora es ambigua o no concluyente, Mary pregunta al usuario que step reabrir (lista step-01..09 como en step-09 paso 4).
3. Mary lee el step file en la zona que le corresponde: **step-01 y step-02 en `disenar/lineal/`**, step-03 en adelante en `disenar/modo-inicial/`.
4. **Aplicar el gate de reconstruccion** (abajo) antes de trabajar el step.

### Gate de reconstruccion (solo regimen `lineal`)

Un diseño `lineal` puede reanudarse y puede correr su modo retroceso. Lo que no puede es
**cerrar una etapa nueva** sin el modelo que las etapas nuevas validan.

Si el step de reanudacion implica **cerrar una etapa que aun no cerro**, Mary no continua:
anuncia la reconstruccion y despacha `agent-os/skills/disenar/reconstruir.md` (anfitrion
Winston, capacidad `CM`).

```
A-Mary: El diseño {slug} viene del flujo lineal y no tiene modelo. Puedo reanudar
lo que ya estaba y procesar hallazgos, pero para cerrar {etapa} hace falta
reconstruir el modelo primero. Lo conduce Winston y no rehace lo ya cerrado.
```

**El gate se anuncia al reanudar, no al final del step.** El destino de reabrir un step es
cerrarlo; descubrir el freno cuando el trabajo del step ya esta hecho lo desperdicia.

**Lo que el gate NO frena:** volver al diseño a leer lo que habia, revisar artefactos, o
procesar hallazgos por modo retroceso. El freno es sobre el cierre, no sobre la entrada.

Cuando la reconstruccion cierra, el README pasa a `flujo: modelo` y la reanudacion sigue por
el regimen `modelo`. Donde retoma depende de donde estaba:

- **si el step de reanudacion era step-01 o step-02**, la reconstruccion los **sustituye** —
  el FOCO es exactamente lo que esos dos hacian— y el diseño continua en step-03;
- **si era del step-03 al step-09**, la reconstruccion corre por debajo sin tocarlo y el
  diseño vuelve a ese step, ahora con modelo.

## Reanudar modo retroceso (hallazgos pendientes)

1. Mary lee `disenar/SKILL.md` + `disenar/modo-retroceso/step-r1-leer-hallazgos.md` + `references/disenar-modo-retroceso.md` de Mary.
2. Mary inicia step-r1 con prefijo `A-Mary:`.
3. Itera step-r1 -> r2 -> r3 -> r4 -> r5 -> volver a r1 hasta que la cola se vacie.
4. Cuando todos cierran, anuncia que works pueden reanudarse via `/alfred continuar` (o `/work continuar` para works legacy en curso).

Detalle de cada step en `disenar/modo-retroceso/step-rN-*.md`.
