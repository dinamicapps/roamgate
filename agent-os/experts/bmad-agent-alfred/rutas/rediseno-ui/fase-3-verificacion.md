# Ruta rediseno-ui — Fase 3: Verificacion

> Anfitrión: Quinn (verificador). Atlas aplica ajustes en caliente. La verificación está **acoplada a la iteración**: no es una etapa posterior, es un loop que cierra cada hito o conjunto de hitos antes de declarar la fase 2 completa.

## Mision

Verificar en navegador (Playwright) que cada hito implementado en la fase 2 cumple los criterios funcionales, visuales y el **invariante de calidad UI** (instancia de la rubrica CU-1..CU-5 con umbral endurecido — ver seccion "Invariante de calidad UI (instancia de la rubrica CU)"). Hallazgo → ajuste en caliente (Atlas) → re-verificar. El loop cierra cuando Quinn no encuentra hallazgos bloqueantes.

## Anfitrion y participantes

- **Quinn:** conduce la verificación con prefijo `I-Quinn:`. Ejecuta Playwright en el navegador, inspecciona el DOM/CSS resultante, valida el invariante.
- **Atlas:** aplica ajustes en caliente cuando Quinn detecta hallazgos. No rediseña — corrige puntualmente lo que bloquea el invariante.
- **Sally:** no conduce esta fase, pero puede ser consultada por Quinn si hay ambigüedad sobre si un hallazgo viola el patrón declarado en `etapa-1/01-patron-diseno.md`.

## Loop de verificacion

La verificación no es un gate único al final: se ejecuta por hito o por bloque de hitos relacionados, tan pronto como la implementación está lista para abrir en el navegador.

```
[Hito N implementado]
      |
      Quinn abre en navegador (Playwright)
      |
      ¿Hallazgo bloqueante? ──SI──> Atlas ajusta en caliente
      |                              |
      NO                         Re-verificar el ajuste
      |                              |
      Hito N verificado ◄────────────
      |
      [Siguiente hito]
```

Quinn y Atlas iteran hasta que no hay hallazgos bloqueantes. Un hallazgo no bloqueante (observación de mejora futura, deuda conocida y aceptada) se registra en `## Hitos` como nota, no como bloqueante.

## Invariante de calidad UI (instancia de la rubrica CU)

<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-4/calidad-ui.md seccion "La rubrica CU". Los chequeos CU-1..CU-5 y sus roles viven alli; aqui el umbral endurecido, el reparto propio de la ruta (Quinn conduce, resultado en la fila del hito) y el criterio propio de baseline. NO duplicar la regla — para modificar, editar la fuente. -->

Quinn aplica la rubrica CU-1..CU-5 de la tarjeta canonica sobre cada hito, con
el umbral endurecido de esta ruta (una ruta cuyo entregable ES la calidad UI
no admite los margenes del work normal):

| Chequeo | Umbral en rediseno-ui (delta sobre la tarjeta) |
|---------|-------------------------------------------------|
| CU-1 / CU-2 | Igual que la tarjeta (bloqueantes). |
| CU-3 | SIEMPRE bloqueante y sin degradacion: esta ruta presupone standard frontend (fase 1 lo declara o lo crea). `style="..."` solo con comentario de excepcion que declare el motivo; selector sin prefijo del sistema que colisione con legacy = hallazgo (severidad media, deuda registrada); duplicar markup que ya resuelve un componente del catalogo = hallazgo (Atlas refactoriza al componente correcto). |
| CU-4 | Ademas del juicio perceptual: coherencia contra el patron declarado en `etapa-1/01-patron-diseno.md` — desviacion la arbitra Sally (variante legitima que actualiza el patron, o revertir). |
| CU-5 | Igual que la tarjeta; en esta ruta el riesgo tipico es validar solo en la galeria. |

En esta ruta Quinn conduce el navegador directamente (anfitriona del loop) y
Sally arbitra patron/adherencia; Atlas aplica los ajustes en caliente. El
resultado escrito por hito va en la fila del hito de `## Hitos` (no se duplica
el formato del `_indice.md` del work normal).

### Criterio propio de la ruta — Evidencia visual antes/despues (completitud)

Quinn verifica que cada hito tiene su par de capturas **en disco**: `etapa-1/evidencia/ui/hito-{N}-antes.png` y `hito-{N}-despues.png` (Paso 2 de la fase 2).

- **Falta uno de los dos archivos:** hallazgo bloqueante — el hito no cierra. El implementador recaptura (el `-antes.png` desde el commit previo al hito si el estado original ya no existe en vivo). Una descripcion en prosa **no** es sustituto.
- **Ambos presentes pero `-antes.png` identico a `-despues.png`, o no muestra la pieza rediseñada:** hallazgo bloqueante (baseline invalido) — la comparacion no prueba nada.
- Este criterio es el **catcher del baseline**: sin el, tras varias iteraciones el "antes" se pierde y se reconstruye de memoria (alucinacion). El archivo en disco es la unica fuente valida.

## Registro de hallazgos

Quinn registra cada hallazgo con formato mínimo en el README del work-record (sección `## Hallazgos de verificacion` o directamente en la fila del hito en `## Hitos`):

```
[B] Hallazgo bloqueante: {descripcion breve} — {archivo:linea o selector}
[O] Observacion no bloqueante: {descripcion breve} — {archivo o vista}
```

Los hallazgos `[B]` deben resolverse en el loop antes de cerrar el hito. Los `[O]` se registran como deuda aceptada.

## Señal de salida de la fase

La verificación cierra cuando:
- Todos los hitos de la fase 2 tienen al menos un ciclo de verificación Quinn sin hallazgos bloqueantes pendientes.
- Los hallazgos `[O]` están registrados (pueden quedar abiertos como deuda).
- La rubrica CU-1..CU-5 (umbral de esta ruta) pasa sin hallazgos bloqueantes en todos los hitos.
- Cada hito tiene su par `etapa-1/evidencia/ui/hito-{N}-antes.png` + `-despues.png` en disco (criterio propio de baseline).

Quinn publica el resumen antes de pasar a la fase 4:

```
I-Quinn: Verificacion completa para {slug-pieza}.

Hitos verificados: {N}.
Hallazgos bloqueantes resueltos: {N}.
Observaciones registradas (deuda aceptada): {N}.
CU-3 (CSS in-line sin declarar): ninguno / {lista si quedaron como excepcion}.

Listo para cierre (fase 4).
```

## Prohibiciones

- NO cerrar la fase 3 con hallazgos bloqueantes pendientes de resolución.
- NO cerrar un hito sin su par `-antes.png`/`-despues.png` en disco, ni aceptar prosa como sustituto del baseline (criterio propio de baseline).
- NO marcar un `style="..."` como excepción sin que el comentario en el template declare el motivo.
- Quinn: NO rediseñar componentes — su rol es verificar y reportar; Atlas aplica el ajuste.
- NO omitir CU-1/CU-2 (funcionalidad de controles y estados): la calidad CSS (CU-3) es condicion necesaria, no suficiente.
