# step-06: Fragmentacion en works

> Anfitrion: Mary. Instancia el molde del regimen `modelo`. Lee completo, ejecuta en orden.
> Termina con P/C. Solo C avanza.
> Step INVARIANTE (siempre se ejecuta) pero su salida puede ser trivial (diseño de 1 work).

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". El ciclo completo vive alli. Aqui solo lo propio de esta etapa. NO duplicar el molde — para modificar, editar la fuente. -->

## Lo propio de esta etapa

| | |
|---|---|
| Subgrafo de entrada | los `proceso` y las `TRANSICION` que la etapa de pipeline encadeno |
| Consume | `proceso`, `entidad`, `endpoint`, `regla`, `pantalla`, `operacion_cripto`, `llave` |
| Emite | nodos `work`, aristas `CONTIENE` y las `CONSTRUYE` del arbitraje |
| Deriva | `DEPENDE_DE` la calcula el runtime desde las transiciones que cruzan de un work a otro |
| Valida | `agentos modelo validar --slug {slug} --etapa fragmentacion` |
| Frontera del artefacto | `fragmentacion.md`: entre los marcadores la proyeccion; fuera, la justificacion anti-capa de cada work, que es juicio |

## Pre-condicion

- step-05 cerrado: las transiciones existen en el modelo y `--etapa pipeline` salio limpio.

## Mision

Decidir si el diseño se fragmenta en N works verticales y, en cualquier caso, dejar cada
proceso dentro de un work.

## Principio rector (anti-patron PROHIBIDO)

Cada work es una **rebanada vertical** por subproceso: atraviesa DB + logica + API +
frontend de SU(s) subproceso(s) y es desplegable de forma autonoma. NUNCA fragmentar por
capa tecnica (un work jamas es "el de la DB" o "el de las APIs"). Si un work no puede
desplegarse y entregar valor solo, la fragmentacion esta mal hecha.

## Pasos

1. **Partir del grafo.** Mary lee los procesos y sus transiciones. La cadena ya esta
   declarada: no se reconstruye leyendo `pipeline.md` en prosa.

2. **Decidir la agrupacion con el usuario.** Cada work = uno o mas procesos CONTIGUOS que
   juntos forman una rebanada vertical desplegable.

3. **El caso de un solo work TAMBIEN emite.**

   Aunque el diseño no se fragmente, se emite **un work unico que contiene todos los
   procesos**. Sin el, `PROCESO_SIN_WORK` dispararia para cada proceso del diseño: el
   predicado no puede distinguir "un solo work" de "ningun work", y no deberia — un proceso
   sin work es un proceso que nadie va a construir.

   Lo que NO cambia: `es_paraguas: false` en el frontmatter del README, y `plan_works[]`
   **no se deriva** (paso 7). El tablero de `plan_works` es la coordinacion de un paraguas;
   en un diseño de un work no hay nada que coordinar, y una fila que el flujo nunca marca es
   peor que ninguna.

4. **Gate anti-capa (BLOQUEANTE, y cognitivo).** Por cada work propuesto, Mary verifica que
   atraviesa las capas de su(s) subproceso(s). **No se mecaniza**: "desplegable de forma
   autonoma" no es contable, y ningun predicado lo comprueba ni deberia intentarlo.

```
A-Mary: El work {Wn} agrupa {procesos} pero no es desplegable de forma autonoma:
{razon — ej. "solo crea tablas, sin endpoint ni UI que las use"}.
Eso es fragmentacion por capa, no por subproceso.
Opciones:
(a) Reagrupar: mover {proceso} de otro work aqui para completar la rebanada vertical.
(b) Fusionar {Wn} con {Wm} para que juntos desplieguen valor.
¿Cual?
```

   No se avanza hasta que TODOS los works pasen el gate.

5. **Emitir por lote:**

   ```bash
   # 1) Write tool -> .tmp-lote.json
   echo '{
     "nodos": [
       {"id": "W1", "tipo": "work", "estado": "resuelto"},
       {"id": "W2", "tipo": "work", "estado": "resuelto"}
     ],
     "aristas": [
       {"tipo": "CONTIENE", "de": "W1", "a": "P1"},
       {"tipo": "CONTIENE", "de": "W2", "a": "P2"}
     ]
   }' > .tmp-lote.json
   agentos modelo emitir --slug {slug} --etapa fragmentacion --input .tmp-lote.json
   rm .tmp-lote.json

   agentos modelo validar --slug {slug} --etapa fragmentacion
   ```

   **`DEPENDE_DE` no se declara**: la calcula el runtime desde las transiciones que cruzan
   de un work a otro. Declararla a mano solo duplica lo que ya se deriva.

   Dos hallazgos propios: `PROCESO_SIN_WORK` (ningun work lo contiene) y `PROCESO_EN_N_WORKS`
   (contenido por mas de uno).

6. **Arbitrar los nodos compartidos (BLOQUEANTE).** Un nodo alcanzable desde dos o mas
   works —una entidad que ambos tocan, un endpoint que ambos usan— tiene que declarar de
   quien es la ENTREGA. El grafo sabe quien lo usa; no sabe quien responde por el, y de esa
   diferencia depende la cobertura de cada work.

   **Va DESPUES de emitir**, no antes: la alcanzabilidad se calcula desde los procesos que
   cada work `CONTIENE`, asi que hasta el paso 5 no existe el dato que funda el arbitraje.
   Los candidatos son exactamente los hallazgos `NODO_COMPARTIDO_SIN_ARBITRO` de la
   validacion que cierra el paso 5 — no hay que buscarlos a mano ni hay verbo que los liste
   aparte: para eso existe el predicado.

   Si la validacion no reporto ninguno, no hay nada que arbitrar y se sigue al paso 7.

   Por cada hallazgo, Mary presenta el nodo y el usuario decide, uno por uno:

   ```
   A-Mary: `{ENT_Cita}` la tocan {W1} y {W2}. Uno la construye y el otro la consume.
   ¿Cual de los dos la entrega?
   ```

   Solo se declara donde hay conflicto: un nodo que alcanza un solo work no lleva arista.
   **Se declara unicamente lo que la derivacion no puede saber** — la alcanzabilidad es
   geometria del grafo; la propiedad es una decision humana.

   Se re-emite el lote, ahora con las `CONSTRUYE`, y se vuelve a validar:

   ```bash
   # 1) Write tool -> .tmp-arbitraje.json
   echo '{
     "aristas": [
       {"tipo": "CONSTRUYE", "de": "W1", "a": "ENT_Cita"}
     ]
   }' > .tmp-arbitraje.json
   agentos modelo emitir --slug {slug} --etapa fragmentacion --input .tmp-arbitraje.json
   rm .tmp-arbitraje.json

   agentos modelo validar --slug {slug} --etapa fragmentacion
   ```

   No se avanza hasta que la validacion salga sin `NODO_COMPARTIDO_SIN_ARBITRO`. Ojo: el
   mismo hallazgo vuelve si la arista apunta a un work que **no alcanza** el nodo (un id mal
   escrito, o una reagrupacion del paso 2 que dejo la arista huerfana). El detalle lo dice;
   se corrige la arista, no se ignora.

7. **Solo si `es_paraguas: true`, derivar el tablero:**

   ```bash
   agentos diseno derivar-plan-works --slug {slug}
   ```

   El grafo es la fuente; `plan_works[]` es su proyeccion operativa. **No se edita a mano**:
   el verbo conserva las filas reactivas y el estado de cada work, y si el alcance de un work
   ya iniciado cambio, rechaza con `CONFLICTO_ALCANCE` y pide resolverlo explicitamente en
   vez de reescribirlo.

8. **Instanciar y proyectar el artefacto — solo si `es_paraguas: true`.**

   En un diseño de un solo work **no se instancia `fragmentacion.md`**: no hay fragmentacion
   que documentar. El grafo igual tiene su work (paso 3), que es lo que el predicado necesita.

   Primero instanciar el archivo, si no existe:

   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

   ```bash
   # 1) Write tool -> .tmp-body.md con el DAG mermaid, los marcadores
   #    <!-- modelo:start vista=fragmentacion --> / <!-- modelo:end -->, y la
   #    tabla de justificacion anti-capa (ver la plantilla del artefacto)
   echo '{
     "diseno_slug": "{slug}",
     "ruta_relativa": "fragmentacion.md",
     "file_type": "diseno-fragmentacion",
     "frontmatter": {
       "slug": "{slug}",
       "es_paraguas": true,
       "n_works": {N},
       "fecha_fragmentacion": "{YYYY-MM-DD}"
     }
   }' | agentos diseno file create --body-file .tmp-body.md
   rm .tmp-body.md
   ```

   Y despues proyectar dentro de sus marcadores:

   ```bash
   agentos modelo proyectar --slug {slug} --vista fragmentacion
   ```

   Reemplaza lo que hay entre `<!-- modelo:start vista=fragmentacion -->` y
   `<!-- modelo:end -->`. La justificacion anti-capa de cada work queda **fuera**: es juicio
   de Mary y el grafo no la contiene.

   Un ciclo de dependencias entre works sale por `MODELO_CICLO`: es un defecto del modelo, y
   se resuelve reagrupando antes de seguir.

9. **Bitacora:**

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## {fecha} — step-06 cerrado

Fragmentacion: {N works | 1 work (no paraguas)}.
{Si paraguas: DAG con {K} dependencias duras derivadas, gate anti-capa pasado por los {N} works.}
" >> agent-os/disenos/{slug}/bitacora.md
```

## Cierre

```
A-Mary: Fragmentacion {trazada | trivial (1 work)}.

{Si paraguas: {N} works verticales. W1 ({procesos}) elegible primero; {dependencias}.
 Cada uno desplegable solo. Detalle en fragmentacion.md.}
{Si no: diseño de 1 work, se consume con un solo --desde-diseno.}

`modelo validar --etapa fragmentacion` limpio.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):
  P — invocar Winston si la fragmentacion revelo una decision arquitectonica
  C — continuar a step-07 (modelado)
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". Mary declara anchor antes de P. NO duplicar la regla — editar la fuente. -->

## Post-condicion

- Todo proceso esta dentro de un work y `modelo validar --etapa fragmentacion` sale limpio.
- Si paraguas: `plan_works[]` derivado, `fragmentacion.md` con su bloque proyectado, gate
  anti-capa pasado.
- Si no-paraguas: `es_paraguas: false`, sin derivar tablero.
- Si C: avanzar a step-07 (modelado).

## Prohibiciones

- NO escribir mockups (eso es step-07).
- NO consolidar brief (step-08).
- NO crear works reales (eso lo hace Alfred al consumir): aqui son nodos del modelo.
- NO editar `plan_works[]` a mano ni `modelo.yml` a mano.
- NO declarar `DEPENDE_DE`: se deriva.
- NO leer step-07.
