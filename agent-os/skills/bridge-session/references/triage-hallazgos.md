# Triage de hallazgos del grupo (P3)

Cuando surge un hallazgo durante una sesion del grupo, se clasifica en uno de dos tipos. El flujo de resolucion difiere.

## Bloqueante

**Criterios:**
- Campo faltante en contrato.
- Tipo de dato mismatch entre sistemas.
- Endpoint inexistente o ruta cambiada.
- Contrato incompatible con codigo actual de alguno de los sistemas.
- Cualquier hallazgo que impide completar los checkpoints de la sesion.

**Flujo:**
1. Quien detecta publica en el bridge: tipo `hallazgo`, subtipo `bloqueante-propuesto`.
2. Director (via AskUserQuestion en su sesion de Claude) confirma clasificacion.
3. Si confirma bloqueante: agregar a `grupo-{nombre}/hallazgos/bloqueantes.md` con id `B-NNN` secuencial, estado `abierto`.
4. Discusion en el bridge para resolver. Puede derivar en:
   - CA nuevo en etapa-{N} del work director.
   - Tarea nueva en etapa-{N}.
   - Nueva version de contrato (`contratos/borradores/{endpoint}-v{N+1}-draft.yml`).
5. Cuando se resuelve (commit, contrato acordado, evidencia): estado pasa a `cerrado` con referencia a evidencia.
6. La sesion NO cierra verde mientras existan bloqueantes `abierto` o `en-resolucion`.

## No bloqueante (propuesta)

**Criterios:**
- Strings vacios permisibles.
- Optimizaciones de rendimiento.
- Mejoras cosmeticas o UX.
- Dudas sobre mejores practicas que no afectan funcionamiento.

**Flujo:**
1. Quien detecta publica en el bridge: tipo `hallazgo`, subtipo `propuesta`.
2. Se agrega a `grupo-{nombre}/hallazgos/propuestas.md` con id `P-NNN` secuencial, decision `pendiente`.
3. Al cierre de la sesion (o al cierre de la etapa activa del work), el director presenta al usuario via AskUserQuestion con 3 opciones:
   - a) Convertir a CA en etapa-{N} del work.
   - b) Diferir a work futuro (nombrar que work).
   - c) Descartar.
4. La decision se registra en `propuestas.md` con justificacion y fecha.
5. Las propuestas NO bloquean cierre de sesion.

## AskUserQuestion estandar para clasificacion

Cuando surge hallazgo en la sesion:

```
question: "Hallazgo detectado: {descripcion-corta}. Como clasificar?"
options:
  - label: "Bloqueante (impide completar pruebas)"
    description: "Campo faltante, tipo mismatch, endpoint inexistente, ruta cambiada, contrato incompatible."
  - label: "Propuesta no bloqueante"
    description: "Mejora, optimizacion, observacion. El usuario decidira al cierre si convertir en CA."
```
