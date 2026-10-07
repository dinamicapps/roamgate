# Casos no felices del retroceso

> Archivo de referencia consultado por Mary cuando aparecen escenarios fuera del flujo feliz. Cada caso tiene regla explicita para evitar limbo.

## Caso 1 — Cambio de meta del work con hallazgos pendientes

**Trigger:** work entra en `/alfred reevaluar` y resultado es camino (b) o (d), con hallazgos pendientes en el diseño origen.

**Regla:** work pregunta al usuario caso por caso al ejecutar la reevaluacion:

```
S-sistema: Detecto {N} hallazgos pendientes en el diseño {slug-diseno}
emitidos por este work. Para cada uno, decide:

HZ-002 — bloqueante — proceso P2 (despacho)
  (a) Mantener vivo (relevante para la nueva meta).
  (b) Marcar como obsoleto_por_replanteamiento.
  (c) Transferir al nuevo work (solo si camino fue d).
```

**Fallback automatico** si el usuario no responde: marcar como
`obsoleto_por_replanteamiento` con razon `auto: usuario no decidio`.

## Caso 2 — Hallazgos contradictorios entre dos works

**Trigger:** work A emitio HZ-005 endureciendo regla X; work B emite HZ-008
flexibilizandola. Mary detecta al iniciar step-r2.

**Regla:** Mary detiene procesamiento normal y consulta al usuario:

```
A-Mary: Contradiccion detectada en proceso P2.

HZ-005 (work-A, ya aplicado): {regla A}.
HZ-008 (work-B, en analisis): {regla B}.

Posibilidades:
(a) HZ-008 es excepcion legitima a HZ-005 → regla compuesta.
(b) HZ-005 estaba mal y debe revertirse → HZ-009 invalida HZ-005.
(c) Hablamos de dos contextos distintos → desdoblar P2 en P2a y P2b.
```

Mary documenta la contradiccion en `bitacora.md` seccion "Contradicciones resueltas".

## Caso 3 — Cancelacion de retroceso en curso

**Trigger:** usuario invoca `/alfred cancelar-retroceso`.

**Regla:** permitido SOLO si todos los hallazgos del retroceso estan en
`pendiente_analisis`. Si algun hallazgo esta en `en_analisis` o `mitigado`,
rechazar:

```
S-sistema: No puedo cancelar el retroceso. Mary ya esta procesando HZ-002
(estado: en_analisis). Opciones:

(a) Esperar a que Mary cierre HZ-002.
(b) Pedirle a Mary que abandone HZ-002 sin mitigacion.

Una vez todos los hallazgos esten en pendiente_analisis o cerrados,
puedes reintentar.
```

## Caso 4 — Crecimiento ilimitado de hallazgos

**Trigger:** brief acumula >10 hallazgos en estado `aplicado` en un proceso.

**Regla:**
- Sin limite hard.
- Mary sugiere automaticamente consolidar:

```
A-Mary: El proceso P2 acumula 14 hallazgos aplicados. Sugiero consolidar
el brief en una version limpia (brief.v2.md) preservando hallazgos como
historial en hallazgos/archive/v1/. ¿Proceder?
```

- Comando manual `/disenar consolidar-brief {slug}`.

## Caso 5 — Diseño OBSOLETO mientras work lo consume

**Trigger:** usuario archiva diseño con works activos que lo referencian.

**Regla:**
- Work continua su ejecucion normal con brief congelado.
- `/alfred retroceder-a-diseno` se rechaza.
- Quinn, en la verificacion del work consumidor (E4), marca como warning (no bloqueante) que el diseño esta archivado.
