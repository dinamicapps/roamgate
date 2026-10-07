# Cita anclada — formato y verificacion

> FUENTE canonica de la disciplina de citas del sistema agent-os. Los artefactos
> que exigen citas (discovery de /disenar, investigacion forense del sabueso,
> gates de plan/brief/verificacion) apuntan aqui con marcador FUENTE. Motivo:
> una afirmacion sobre el codebase sin anclaje verificable es el vector #1 de
> alucinacion y de registro podrido (citas a codigo que nunca existio o que
> cambio en silencio).

## Formato

Toda afirmacion de un experto sobre el codebase — "este proceso existe", "esta
accion se dispara aqui", "el flujo llega por este metodo", "este componente se
reutiliza" — se declara asi:

```
{ruta relativa a la raiz del repo}:{linea} [+ `Clase.Metodo` cuando aplique]
> fragmento literal (1-2 lineas copiadas TEXTUALMENTE de la fuente)
```

Ejemplo:

```
Areas/HistoriaClinica/Controllers/RemisionController.cs:214 (`RemisionController.Guardar`)
> if (!TienePermiso(Permisos.REMISION_CREAR)) return new HttpStatusCodeResult(403);
```

El fragmento literal es la pieza clave: vuelve la cita verificable mecanicamente.
Si la linea se movio, el fragmento se re-localiza; si el fragmento no existe, la
cita es alucinacion o esta podrida. Para BD el ancla es `tabla.columna` (o el
objeto: `dbo.SP_NOMBRE`) + el fragmento de la definicion consultada.

## Cuando es obligatoria

- Afirmaciones de existencia o comportamiento de codigo existente (existe /
  se conecta / se dispara / valida / persiste).
- Cada eslabon de la cadena causal de la investigacion forense (ruta bugfix).
- El inventario de reutilizacion y las 5 preguntas del discovery de /disenar.
- Afirmaciones sobre configuracion/parametrizacion real (Dexter: cita a
  `tabla.columna` + valor leido).

NO aplica a: juicios de diseño u opinion ("propongo...", "conviene..."),
elementos declarados "nuevo, a diseñar", o greenfield justificado. La evidencia
de busqueda vacia ("no existe X") se declara como tal: patron buscado + donde.

## Estado sin-evidencia

Una afirmacion sustantiva sin cita anclada se marca literalmente `sin-evidencia`
en el artefacto. Una afirmacion `sin-evidencia` NO puede sostener una decision
de diseño, la clasificacion de un desenlace, ni un cierre de gate — se resuelve
(anclandola o retirandola) antes de firmar.

## Que invalida una cita

- El archivo no existe (`archivo_no_existe`).
- El fragmento no aparece en el archivo (`fragmento_no_encontrado`): cita
  podrida o alucinada.
- El fragmento es parafrasis, no copia literal — parafrasear anula la
  verificabilidad; se corrige copiando el texto real.
- Citar docs cuando el codigo esta accesible: la jerarquia de fuente de verdad
  (codigo > docs) es la de autoridad-brownfield; una cita a docs vale solo si
  declara por que el codigo no era accesible.

## Verificacion en dos capas

**Capa mecanica (runtime).** El verbo `agentos citas verificar` recibe
`{"citas":[{"archivo","linea","fragmento"}]}` via `--input {archivo}` o stdin y
devuelve veredicto por cita: `ok` | `fragmento_movido` (existe, en otra linea:
actualizar la linea) | `fragmento_no_encontrado` | `archivo_no_existe`.
Tolerancia de drift: +/-2 lineas sigue siendo `ok`. Quien la corre y cuando:

- Winston al cerrar el FOCO (step-01 de /disenar), sobre las citas de los nodos
  `resuelto` del modelo. En el regimen `lineal`, Mary al cerrar el gate de
  discovery (step-02).
- Mary en la revision del brief (step-08).
- Atlas (sabueso) antes de publicar el diagnostico forense de la ruta bugfix.
- Quinn en el pre-cierre de E4 (antes de proponer cierre).
- Bob al cerrar la materializacion de tareas en E2 (citas de las tareas).

Citas `fragmento_movido` se corrigen (actualizar linea); `no_encontrado` /
`archivo_no_existe` degradan la afirmacion a `sin-evidencia` hasta re-anclarla.

**Capa cognitiva (congruencia).** La mecanica prueba que la cita EXISTE, no que
DIGA lo que se afirma. El validador del gate re-abre las citas que sostienen
decisiones (de diseño, desenlace de bugfix, cierre de work) y juzga congruencia:
la fuente respalda la afirmacion. Incongruencia = la afirmacion se degrada a
`sin-evidencia` y la decision que sostenia se re-examina.

> Enforcement (desde SP5): `agentos work checklist-cierre` emite el codigo
> `CITAS` en TODO work — la tarjeta del chequeo transversal se carga siempre en
> el pre-cierre. La congruencia sigue siendo juicio cognitivo del gate; la
> mecanica es el verbo `citas verificar`.
