# step-05: Pipeline integrador

> Anfitrion: Mary. Instancia el molde del regimen `modelo`. Lee completo, ejecuta en orden.
> Termina con P/C. Solo C avanza.

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". El ciclo completo vive alli. Aqui solo lo propio de esta etapa: su subgrafo de entrada, que emite, que valida y su frontera de artefacto. NO duplicar el molde — para modificar, editar la fuente. -->

## Lo propio de esta etapa

| | |
|---|---|
| Subgrafo de entrada | los `proceso` que la etapa de procesos cerro, con sus `entradas` y `salidas` |
| Consume | `proceso` |
| Emite | aristas `TRANSICION` con su campo `dato`; los campos `es_inicial`/`es_terminal` sobre los procesos extremos |
| Valida | `agentos modelo validar --slug {slug} --etapa pipeline` |
| Frontera del artefacto | `pipeline.md`: entre los marcadores va la proyeccion; fuera queda el diagrama mermaid y la lectura del encadenamiento, que son de Mary |
| Ancla prosa | ninguna: esta etapa no cierra `resuelto` ninguno de los cinco tipos que exigen prosa |

## Pre-condicion

- step-04 cerrado: todos los procesos tienen contrato, con `entradas` y `salidas` emitidas.

## Mision

Encadenar los procesos: declarar que dato viaja de cada uno al siguiente, y cuales abren y
cierran la cadena. La inconsistencia entre la salida de uno y la entrada del otro deja de
depender de que alguien la note leyendo.

## Pasos

1. **Partir del grafo.** Mary lee los `proceso` con sus `entradas` y `salidas`. No relee los
   contratos en prosa para reconstruir lo que la etapa anterior ya declaro.

2. **Proponer la cadena con el usuario.** Que proceso dispara a cual, y con que dato. Es
   trabajo de juicio: el grafo no sabe que P2 sigue a P1.

3. **Emitir por lote:**

   ```bash
   # 1) Write tool -> .tmp-lote.json
   echo '{
     "nodos": [
       {"id": "P1", "tipo": "proceso", "campos": {"es_inicial": true}},
       {"id": "P4", "tipo": "proceso", "campos": {"es_terminal": true}}
     ],
     "aristas": [
       {"tipo": "TRANSICION", "de": "P1", "a": "P2", "campos": {"dato": "solicitud registrada"}},
       {"tipo": "TRANSICION", "de": "P2", "a": "P3", "campos": {"dato": "solicitud aprobada"}}
     ]
   }' > .tmp-lote.json
   agentos modelo emitir --slug {slug} --etapa pipeline --input .tmp-lote.json
   rm .tmp-lote.json
   ```

   **`es_inicial` y `es_terminal` son booleanos de verdad**, no el texto `"true"`. Un valor
   de texto es error de forma y el verbo lo rechaza — antes se degradaba a `false` en
   silencio y devolvia un `PROCESO_SIN_TRANSICION` que nadie sabia apagar.

   **El `dato` de cada transicion se exige** y no puede venir vacio: sin el, la comparacion
   con las entradas y salidas se hace contra la nada.

   El lote **completa** procesos que ya existen (el emisor hace upsert por id): no se crean
   procesos nuevos aqui.

4. **Validar:**

   ```bash
   agentos modelo validar --slug {slug} --etapa pipeline
   ```

   Dos hallazgos propios de la etapa:

   - `PROCESO_SIN_TRANSICION` — un proceso que no encadena y no declaro ser extremo.
   - `TRANSICION_SIN_CORRESPONDENCIA` — el `dato` no figura en las `salidas` del origen y
     en las `entradas` del destino.

5. **Cuando aparece una inconsistencia, el dialogo sigue siendo de Mary.** Lo que cambia es
   quien la detecta: antes habia que notarla leyendo los contratos, ahora la nombra el
   validador. Las tres salidas son del usuario:

```
A-Mary: P1 produce {salida X}. P2 espera entrada {Y}. {Y - X} no esta cubierto.
Opciones:

(a) P1 deberia producir tambien {Y - X} → regreso a la etapa de procesos a
    editar el contrato de P1.
(b) P2 deberia derivar {Y - X} de otra fuente → se declara la fuente
    alternativa en el contrato de P2.
(c) Aparece un proceso intermedio P1.5 que transforma → regreso a la etapa de
    procesos.

¿Cual?
```

   Si el resultado es regresar, se sigue el regreso del molde.

   <!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "El regreso". Que hace el anfitrion de la etapa de origen y que pasa con las etapas ya cerradas vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

6. **Instanciar y proyectar el artefacto.**

   Primero instanciar `pipeline.md`, si no existe:

   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

   ```bash
   # 1) Write tool -> .tmp-body.md con el bloque mermaid integrador y los
   #    marcadores <!-- modelo:start vista=pipeline --> / <!-- modelo:end -->
   #    (ver la plantilla del artefacto)
   echo '{
     "diseno_slug": "{slug}",
     "ruta_relativa": "pipeline.md",
     "file_type": "diseno-pipeline",
     "frontmatter": {
       "diseno_slug": "{slug}",
       "brief_version": 1
     }
   }' | agentos diseno file create --body-file .tmp-body.md
   rm .tmp-body.md
   ```

   Y despues proyectar dentro de sus marcadores:

   ```bash
   agentos modelo proyectar --slug {slug} --vista pipeline
   ```

   La salida reemplaza lo que hay entre `<!-- modelo:start vista=pipeline -->` y
   `<!-- modelo:end -->` en `pipeline.md`. Lo de afuera —el mermaid integrador y la lectura
   del encadenamiento— es de Mary y no se toca.

7. **Bitacora:**

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## {fecha} — step-05 cerrado

Pipeline con {N} procesos encadenados y {K} transiciones.
Extremos: {P inicial} abre, {P terminal} cierra.
{branching: 0 | si hay, descripcion breve}.
" >> agent-os/disenos/{slug}/bitacora.md
```

## Cierre

```
A-Mary: Pipeline trazado:

{texto del mermaid simplificado: P1 → P2 → P3 → resultado}

{N} transiciones. `modelo validar --etapa pipeline` limpio.
{0/N} inconsistencias de correspondencia resueltas.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):
  P — invocar Winston si aparecio decision arquitectonica del pipeline
  C — continuar a step-06 (fragmentacion: ¿el diseño se parte en N works?)
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". Mary declara anchor (evidencia del pipeline/codebase) antes de P. NO duplicar la regla — para modificar, editar la fuente. -->

## Post-condicion

- Las transiciones existen en el modelo y `modelo validar --etapa pipeline` sale limpio.
- `pipeline.md` con su bloque proyectado al dia.
- Si C: avanzar a step-06.

## Prohibiciones

- NO escribir mockups aun.
- NO escribir brief consolidado aun.
- NO crear procesos nuevos: esta etapa encadena los que existen.
- NO editar `modelo.yml` a mano.
- NO leer step-06.
