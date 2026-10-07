# Mantenimiento: ejercitar-experto (learning loop, señal de desempeño)

> Conduce una iteración del learning loop sobre UN experto con la señal de
> **desempeño**: ejercicio en contexto fresco, en un consumidor sintético
> instalado por el pipeline real. Nebulosa-only. El gate es del director; nada
> se auto-aprueba.
>
> Paralelo a `evaluar-experto.md`, que corre la señal **estructural** (cobertura
> vs el contrato de alta, contra la fuente). Estructural pregunta "¿está bien
> armado?"; desempeño pregunta "¿sirve cuando corre?".
>
> La mecánica del laboratorio vive en `_laboratorio/README.md`. <!-- FUENTE: _laboratorio/README.md seccion "Ejecutar una prueba". La mecanica de despliegue y ejecucion; _laboratorio/ es nebulosa-only y este comando nunca corre en el consumidor (ver Precondicion). NO duplicar la regla — para modificar, editar la fuente. lint:allow C3 -->

## Precondición
- Solo en la nebulosa (repo agent-os origen). Si es un consumidor, detente: los
  expertos solo existen como fuente aquí, y el laboratorio no se distribuye.

## Paso 1 — ELEGIR (reutilizar antes de construir)
<!-- lint:allow C1 laboratorio-nebulosa-only: ruta válida solo bajo la Precondición (nebulosa-only) declarada arriba -->
Lee `_laboratorio/labs.md` y `_laboratorio/banco/`. Elegí el lab cuyo stack
dispare al experto, y la prueba del banco que lo ejercite. Si ninguno sirve,
construí uno nuevo y catalogalo.

## Paso 2 — EJERCITAR (subagente)
<!-- lint:allow C1 laboratorio-nebulosa-only: ruta válida solo bajo la Precondición (nebulosa-only) declarada arriba -->
Despachá el improver (`_laboratorio/agentes/improver.md`) con el lab, la prueba
y el slug del experto. Corre una iteración: siembra, ejercita A/B, juzga
(mecánico + cognitivo), diagnostica UNA brecha y redacta UNA propuesta.

Si devuelve `"prueba_no_calibrada": true`, la brecha está en la prueba, no en el
experto. Endurecela — toda trampa nueva fundada en un principio del canon, jamás
un chequeo elegido porque sabés que el experto falla ahí — y volvé al paso 2.
Cada iteración de calibración queda en la bitácora.

## Paso 3 — GATE DEL DIRECTOR (obligatorio, nunca [AUTO])
Presentá la brecha en estado `propuesta` con su propuesta concreta y la
evidencia del ejercicio. Esperá aprobación EXPLÍCITA. Solo con su OK:
`echo '{"evidencia":"lab/P-001-dexter-tabla-sp@a1b2c3d","razon":"aprobado por el director"}' | agentos experto brecha-estado --experto {slug} --id {id} --estado aprobada`
Si rechaza o pide ajustes, volvé la brecha a `abierta` y re-redactá.

## Paso 4 — APLICAR (solo tras aprobación)
Editá la fuente aprobada (el SKILL.md del experto). Cambios quirúrgicos: solo lo
que la propuesta declara. **El improver no aplica**: aplicás vos.

## Paso 5 — RE-EJERCITAR y CERRAR
Re-sembrá (`lab-sembrar.sh` es idempotente: re-ejecutarlo ES el re-install) y
re-ejercitá la misma prueba. Si el experto ya esquiva la trampa, cerrá la brecha
con la evidencia del re-ejercicio:
`echo '{"evidencia":"lab/P-001-dexter-tabla-sp@a1b2c3d","razon":"re-ejercicio: A esquiva T-N, aplicado y verificado"}' | agentos experto brecha-estado --experto {slug} --id {id} --estado cerrada`
Si persiste, dejala `reabierta` y reportá por qué. **Eso también es cerrar el
ciclo**: el lazo prueba que la señal viaja, no que toda propuesta acierta.

## Nota de rol (arquitectura del ecosistema)
Alfred es el **driver conceptual**: el método. El **ejecutor es el operador (una
IA) invocando comandos** — aquí no hay `/alfred`, porque la nebulosa es la
fábrica y Alfred solo existe instalado en un consumidor. Todo paso que pueda ser
comando ES un comando; el juicio se aporta donde no hay comando posible.
