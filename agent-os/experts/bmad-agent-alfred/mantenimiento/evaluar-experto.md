# Mantenimiento: evaluar-experto (learning loop, gate estático)

> Conduce una iteración del learning loop de expertos sobre UN experto, con la
> señal estructural (cobertura vs el contrato de alta de 19 puntos, subconjunto
> de capacidades: puntos 4, 6, 8, 9, 11, 19). Nebulosa-only. El gate es del
> director; nada se auto-aprueba.
>
> FUENTE de la rúbrica: docs/arquitectura/onboarding-experto.md (los 19 puntos). <!-- FUENTE: docs/arquitectura/onboarding-experto.md seccion "Onboarding de experto — el contrato de alta". Los 19 puntos de contacto que fundamentan la rúbrica de evaluar-experto; docs/ es nebulosa-only y este comando nunca corre en el consumidor (ver Precondición abajo). NO duplicar la regla — para modificar, editar la fuente. lint:allow C3 -->
> Spec: docs/superpowers/specs/2026-07-15-etapa1-learning-loop-expertos-design.md. <!-- FUENTE: docs/superpowers/specs/2026-07-15-etapa1-learning-loop-expertos-design.md seccion "Etapa 1 — Learning loop de expertos (gate estático, piloto Paige)". Diseño del learning loop que evaluar-experto implementa; docs/ es nebulosa-only y este comando nunca corre en el consumidor. NO duplicar la regla — para modificar, editar la fuente. lint:allow C3 -->

## Precondición
- Solo en la nebulosa (repo agent-os origen). Si es un consumidor, detente: los
  expertos solo existen como fuente aquí.

## Paso 1 — EVALUAR (mecánico)
Corre: `agentos experto evaluar-cobertura --experto {slug}`.
Lee el JSON: `brechas` (mecanizadas, puntos 4/6) y `pendientes_juicio` (8/9/11).

## Paso 2 — DIAGNOSTICAR (cognitivo — tu juicio)
Para cada punto en `pendientes_juicio`, camínalo a mano contra la fuente:
- **Punto 8** — ¿las tarjetas de etapa (`agent-os/skills/host-protocol/etapas/etapa-N.md`
  + la tabla maestra en etapas/README.md) que deberían invitar a este experto lo
  listan en su roster, según su `rol_por_modo`?
- **Punto 9** — ¿algún experto coordina su trabajo? Si sí, ¿el SKILL.md del
  coordinador lo declara? (Principio: quien coordina no produce.)
- **Punto 11** — ¿su dominio genera incidentes? Si sí, ¿está cableado en las rutas
  de presión (bugfix `investigacion.md` + `capacidades_fix`; hotfix filtros)? Si su
  dominio NO genera incidentes, declara el punto **N/A explícitamente** (no lo omitas).
Para el **punto 6**, además de la brecha mecánica de secciones, juzga la CALIDAD de
Principles (es la conciencia crítica del experto, no una lista de reglas).

## Paso 3 — PROPONER (cognitivo)
Por cada brecha real (mecánica o de juicio), redacta la propuesta: qué archivo(s)
tocar, qué cambio, y el efecto esperado en la cobertura. Registra cada una:
`echo '{"tipo":"cobertura","punto":N,"evidencia":"...","efecto_esperado":"...","propuesta":"..."}' | agentos experto brecha --experto {slug}`
Luego muévela a `propuesta`:
`echo '{"evidencia":"...","razon":"propuesta redactada"}' | agentos experto brecha-estado --experto {slug} --id {id} --estado propuesta`

## Paso 4 — GATE DEL DIRECTOR (obligatorio, nunca [AUTO])
Presenta al director las brechas en estado `propuesta` con su propuesta concreta.
Espera aprobación EXPLÍCITA. Solo con su OK:
`echo '{"evidencia":"aprobado por el director","razon":"..."}' | agentos experto brecha-estado --experto {slug} --id {id} --estado aprobada`
Si el director rechaza o pide ajustes, vuelve la brecha a `abierta` y re-redacta.

## Paso 5 — APLICAR (solo tras aprobación)
Edita la fuente aprobada (SKILL.md / _registry.yml / tarjetas de etapa). Cambios
quirúrgicos: solo lo que la propuesta declara.

## Paso 6 — RE-EVALUAR y CERRAR
Re-corre `agentos experto evaluar-cobertura --experto {slug}`. Si la brecha ya no
aparece, ciérrala con la evidencia de la re-evaluación:
`echo '{"evidencia":"re-eval sin la brecha","razon":"aplicado y verificado"}' | agentos experto brecha-estado --experto {slug} --id {id} --estado cerrada`
Si persiste, déjala en `reabierta` y reporta por qué.

## Nota de rol (arquitectura del ecosistema)
Aquí Alfred es el **driver**. El **improver** dedicado y el ejercicio en contexto
fresco pertenecen a la Etapa 2a (requieren el laboratorio). En Etapa 1 no hay
ejercicio: el diagnóstico se hace contra la fuente.
