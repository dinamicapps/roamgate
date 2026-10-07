# step-r3: Proponer mitigacion

## Mision

Mary propone el cambio **al grafo**, con su razon: que nodos nacen, cuales quedan `obsoleto`
y con que sucesor. Los artefactos en prosa se re-proyectan despues (r4), no al reves — la
inversion que este regimen vino a corregir es actualizar la prosa y dejar la fuente vieja.

El cambio puede tocar:

- Nodos que dejan de valer -> pasan a `obsoleto` con su razon, y `reemplazado_por` si hay
  sucesor. **No se descartan**: `descartado` significa "nunca existio", y usarlo para algo
  que si se construyo borraria la diferencia que un work cerrado necesita para saber contra
  que se valido.
- Nodos nuevos (un proceso que se parte en dos, una entidad que aparece).
- Aristas que cambian (una transicion que se redirige, un acceso nuevo).
- El contrato del proceso afectado, el mockup, el pipeline: **derivados** de lo anterior.

## Decisión de camino en diseño paraguas (solo si `es_paraguas: true`)

Con el inventario de works terminales elegibles afectados (de step-r2: `COMPLETADO` y
`COMPLETADO_VERIFICACION_DIFERIDA`), Mary evalúa DOS disparadores de bifurcación a diseño
nuevo, ANTES de proponer mitigación del brief:

**(a) ¿El hallazgo toca el `intent` o el `out_of_scope` del diseño?** Si modifica la frase de
intent o mueve el alcance -> el diseño dejó de ser contrato válido. Independiente del conteo
de works (dispara aunque el inventario esté vacío).

**(b) ¿La realineación es masiva?** Medido SOLO sobre los works del inventario de step-r2: si
afecta a varios works cerrados y desplegados, o implica cambios estructurales de DB que rompen
datos en producción -> el costo de realinear supera el de rehacer.

<!-- FUENTE: agent-os/skills/disenar/modo-retroceso/step-r2-analizar-hallazgo.md. Que estados terminales cuentan como base construida (y por que la verificacion diferida cuenta: cumplio su meta al 100%, solo falta la ventana de comprobacion) vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

### Si (a) O (b) → bifurcar a diseño nuevo

```
A-Mary: Este hallazgo {toca el intent del diseño | exige realinear {N} works ya desplegados}.
Seguir parchando este brief lo dejaría sucio/obsoleto. Recomiendo un diseño NUEVO que herede
los aciertos y errores de este, con discovery fresco de codebase + meta.

El diseño actual quedaría OBSOLETO. El nuevo nacería con hereda_de: {slug} y una sección de
herencia (qué procesos sobreviven, qué works desplegados quedan como base o se revierten).
¿Bifurco a diseño nuevo, o prefieres realinear dentro de este (asumiendo el riesgo)?
```

- Si acepta: marcar este diseño `OBSOLETO`, arrancar `/disenar iniciar` para el nuevo con
  `hereda_de: {slug}` y la sección de herencia. Fin del retroceso aquí.

  <!-- El estado OBSOLETO del DISEÑO no es el estado `obsoleto` de un NODO del modelo: uno habla del documento, el otro de una afirmacion del mundo. Ver agent-os/templates/diseno/schema/modelo.md seccion "Dos palabras parecidas que no son lo mismo". -->

- Si rechaza: documentar la decisión (riesgo de diseño sucio asumido, `[OVERRIDE]` en bitácora)
  y proceder con realineación (abajo).

### Si ni (a) ni (b) → realineación dentro del paraguas

El hallazgo se mitiga en el brief compartido (step-r4) Y se materializa un **work de
realineación de primera clase** en `plan_works[]`:

- Nueva entry con `estado: realineacion`, `depende_de: [works del inventario que realinea]`, y el
  work-record que lo ejecute llevará `realinea_works: [...]`.
- Planifica/ejecuta/verifica la realineación: revertir archivos de un commit anterior,
  rediseñar páginas, refactorizar, migrar tablas/campos. Lo gobiernan los expertos (Dexter si
  persistencia, Sentinel si seguridad, Cipher si criptografia) como cualquier work. NO es un parche silencioso.
- Los works aún no iniciados ven el brief actualizado por path (ya funciona).

**Caso trivial:** si el work que disparó la reevaluación aún no inició y el cambio no afecta
ningún work del inventario -> realineación trivial (solo brief, step-r4), sin work de realineación.

<!-- Los dos disparadores de bifurcacion (cambio incompatible en brief.md/procesos/ vs. cambio aditivo) y el work de realineacion se diseñaron en una spec dedicada del repo fuente del sistema (no se distribuye a este proyecto). -->

## Pasos

1. **Mary publica propuesta:**

```
A-Mary: Propuesta de mitigacion para HZ-{NNN}.

Cambio al modelo:
  - `{id}` queda OBSOLETO. Razon: {por que dejo de valer}.
    {si hay sucesor}: lo reemplaza `{id-nuevo}`.
  - Nace `{id-nuevo}` ({tipo}): {que afirma}.
  - {aristas que cambian}.

Etapas a re-recorrer: {etapas del calculo de r2}.

Lo que se re-proyecta despues: {contrato P{n} | datos.md | pipeline.md | brief.md}.

  - Razon: {2 lineas explicando por que el hallazgo justifica este cambio}.

¿Apruebas la mitigacion como esta, o quieres ajustar?
```

2. **Iterar con usuario hasta aprobacion.**

3. **Si usuario aprueba: avanzar a step-r4.**

4. **Si usuario rechaza:** opciones:
   - Volver a step-r2 con nuevo diagnostico.
   - Cerrar hallazgo como `descartado` con razon "usuario rechazo todas las propuestas de mitigacion".
