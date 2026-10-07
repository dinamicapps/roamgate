# Interlocucion concreta — el como de P9

> Detalle consultable de P9. Aqui viven las tres piezas del anclaje, cuando se paga, y el
> criterio para serializar o enumerar. El principio y su regla operativa viven en
> `.claude/MANIFIESTO.md` seccion "9. Interlocucion Concreta" — esto es material de referencia.

P9 no inventa esta disciplina. La autocontencion informacional ya rige los gates formales; lo
que P9 agrega es el ambito (todo turno que espera respuesta), el rotulo del caso, y la
serializacion.

<!-- FUENTE: agent-os/skills/host-protocol/references/reevaluacion-y-gates.md seccion "Autocontencion informacional del gate". Alli la forma inline por tipo de pregunta y el limite de tamano del gate. Aqui solo lo que P9 agrega sobre eso. NO duplicar la tabla — para modificar, editar la fuente. -->

## Las tres piezas del anclaje

**1. El rotulo del caso, en lenguaje del dominio.** Antes de cualquier tecnicismo. El usuario
puede tener tres asuntos en curso; el rotulo le dice cual es este. Un identificador de codigo
no es un rotulo: `:214` no nombra nada para quien no tiene el archivo abierto.

**2. El hecho observable.** Que le pasa a una persona usando el sistema, no que dice el codigo.
"Un auxiliar sin permiso recibe 'no tienes permiso' cuando deberia leer 'esta anulada'" es un
hecho observable; "el guard precede a la validacion" es una descripcion de implementacion.

**3. El fragmento pegado**, no la ruta sola. El formato es el de la cita anclada.

<!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Formato". Alli el formato de la cita (ruta:linea + fragmento literal) y que la invalida. Aqui solo su uso en el dialogo con el usuario. NO duplicar el formato — para modificar, editar la fuente. -->

Ejemplo completo:

```
-- Remisiones rechazadas por permisos --

Hoy, si un auxiliar sin permiso intenta guardar una remision YA anulada,
el sistema le responde "no tienes permiso" en vez de "esta remision esta
anulada".

Areas/HistoriaClinica/Controllers/RemisionController.cs:214 (`RemisionController.Guardar`)
> if (!TienePermiso(Permisos.REMISION_CREAR)) return new HttpStatusCodeResult(403);

Invertir el orden expone el estado de la remision a quien no tiene
permiso de verla. Lo dejamos asi?
```

## Cuando se paga el anclaje

**Se paga al abrir un caso y al cambiar de caso. No en cada turno del mismo hilo.** Si el turno
anterior ya establecio de que se habla y el hilo sigue ahi, se continua sin re-rotular. Un ida
y vuelta de cuatro turnos sobre un mismo asunto ancla una vez.

**Los turnos que solo informan avance quedan libres.** `Tarea 3 de 7 lista, sigo con el guard
de estado` no necesita anclaje: no espera respuesta.

El anclaje se paga cuando hay algo en juego. Aplicarlo a todo mensaje lo convierte en ceremonia
y choca con la prosa de voz humana que rige la conversacion.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Lenguaje narrativo en gates y conversacion". Alli la regla de prosa humana y su excepcion calificada. Aqui solo la cadencia del anclaje. NO duplicar la regla — para modificar, editar la fuente. -->

## Serializar o enumerar

**El test, en forma operativa:** *puedo redactar hoy las opciones de la pregunta B sin conocer
la respuesta a la pregunta A?*

- **No puedo** -> estan encadenadas. Se serializa: se pregunta A, y B se formula despues, con
  la respuesta de A ya en la mano. Empaquetarlas es un error, no un atajo: las opciones de B
  todavia no existen.
- **Si puedo** -> son independientes. Se enumeran con numeracion explicita, de modo que el
  usuario responda "1b, 2a" en un solo turno. Cada una lleva su propio rotulo de caso, breve.

La formulacion es deliberadamente sobre **poder escribir la pregunta**, no sobre causalidad
abstracta: es verificable por quien redacta, en el momento de redactar.

**Zona gris declarada.** Casos que comparten archivo, modulo o riesgo, pero cuyas opciones son
redactables por separado, cuentan como **independientes**. La dependencia que obliga a
serializar es la que impide formular, no la que sugiere parentesco tematico.

## Anti-patrones

| Anti-patron | Por que duele |
|---|---|
| Nombrar el caso solo por su ruta de codigo | El usuario reconstruye el caso leyendo archivos antes de poder responder |
| Preguntar por la implementacion en vez del efecto | "Invertimos el orden del guard?" no dice que se gana ni que se pierde para quien usa el sistema |
| Empaquetar un arbol de decision secuencial | Las opciones de la segunda pregunta dependen de la primera: no existen todavia |
| Citar la ruta sin pegar el fragmento | Obliga a abrir el archivo, que es exactamente lo que P9 prohibe |
| Re-rotular el caso en cada turno del mismo hilo | Ceremonia: el hilo ya estaba establecido |

**Senal de que P9 se violo:** el usuario responde "amplia", "de cual caso hablas", o contesta
una pregunta distinta de la que se hizo. Esa reaccion es el indicador observable declarado en
`.claude/MANIFIESTO.md`.
