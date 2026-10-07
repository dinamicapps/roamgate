# step-07: Modelado por proceso

> Anfitrion: Mary. Instancia el molde del regimen `modelo`. Lee completo, ejecuta en orden.
> Loop por proceso. Termina con P/C cuando todos estan modelados. Solo C avanza.

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". El ciclo completo vive alli. Aqui solo lo propio de esta etapa. NO duplicar el molde — para modificar, editar la fuente. -->

## Lo propio de esta etapa

| | |
|---|---|
| Subgrafo de entrada | los `proceso` con su actor (`INICIA`) y su work (`CONTIENE`), mas las `pantalla` que el FOCO dejo abiertas |
| Consume | `proceso`, `actor`, `pantalla` |
| Emite | `escenario` y aristas `VERIFICA`; **cierra** las `pantalla` que el FOCO dejo abiertas, completando su `cadena_navegacion`, mas las aristas `LLEGA_POR` y `REQUIERE` |
| Valida | `agentos modelo validar --slug {slug} --etapa modelado` |
| Frontera del artefacto | el contrato del proceso: entre los marcadores la proyeccion (que ahora trae Llegada y Escenarios); fuera, el mockup ASCII y el flujo interno, que son de Mary y de Sally |

## Pre-condicion

- step-06 cerrado: todo proceso esta dentro de un work.

## Mision

Para cada proceso: como llega el actor hasta el, y con que escenarios se verifica. El
modelado de datos NO vive aqui — es el cimiento producido por Dexter en la etapa de datos.
Esta etapa modela el **transporte del dato al usuario** y su **verificacion**.

## Pasos

**Para cada proceso Pn:**

1. **Mockup ASCII (si tiene UI).** Mary propone un primer borrador y lo itera con el
   usuario. **No va al grafo**: es prosa del experto y vive fuera de los marcadores.

   **Si el UI es no trivial, INVITAR A SALLY:**

```
A-Mary: Detecto componente UX no trivial. Invito a Sally.

I-Sally: Propongo {patron clean enterprise / lista master-detail / ...}.
Componentes aplicables: {grid / dropdown / tooltip / ...}.
{Aporta criterio de UX, no escribe codigo}.
```

2. **Flujo interno en mermaid (si tiene branching).** Tampoco va al grafo, por la misma
   razon: el grafo dice que hay, la prosa dice como se ve.

3. **Escenarios: 3-5 por proceso.** Un happy path, uno o dos edge cases, uno de error o
   validacion fallida. Cada uno con su **receta de dato de prueba**: como fabricar o
   localizar en el tenant de pruebas el dato minimo para recorrerlo. Ese campo es el unico
   del modelo que viaja hasta el work — lo consume el plan de prueba de la etapa de
   verificacion.

   **Si un escenario revela algo no modelado, INVITAR AL DUEÑO DEL DOMINIO (freno):**

   Los escenarios son el ultimo filtro antes de consolidar el brief: es normal que revelen
   un dato o una operacion que los artefactos de primera clase no tienen.

```
A-Mary: El escenario {cual} de P{n} revela {un dato | una operacion criptografica}
que no esta en {datos.md | criptografia.md}. Invito a {Dexter | Cipher}.

I-{Dexter | Cipher}: {Confirmo que el artefacto lo cubre | Refino el artefacto
(es vivo, refinamiento conjunto) | Freno: el escenario asume {premisa no
verificada}, necesito resolverlo antes de cerrar el modelado}.
```

   <!-- FUENTE del freno deliberativo de Dexter: agent-os/experts/bmad-agent-dexter/references/modelar-datos.md seccion "Freno deliberativo". FUENTE de los principios de Cipher: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". NO duplicar. -->

   Si el artefacto criptografico NO existe porque el gate de entrada de step-03b declaro que
   el diseño no tenia dimension criptografica, esa declaracion queda SUPERADA: Cipher lo
   instancia aqui y lo registra en bitacora.

4. **Emitir por lote, cuando todos los procesos estan modelados:**

   ```bash
   # 1) Write tool -> .tmp-lote.json
   echo '{
     "nodos": [
       {"id": "PAN_Agenda", "tipo": "pantalla", "estado": "resuelto",
        "campos": {"nombre": "Agenda del dia", "cadena_navegacion": "Menu > Citas > Agenda"}},
       {"id": "ESC_Feliz", "tipo": "escenario", "estado": "resuelto",
        "campos": {"accion": "reprograma a fecha valida",
                   "precondicion": "cita vigente del paciente demo",
                   "resultado": "la cita queda reprogramada",
                   "receta_dato_prueba": "crear cita futura con el paciente DEMO-001"}}
     ],
     "aristas": [
       {"tipo": "LLEGA_POR", "de": "P1", "a": "PAN_Agenda"},
       {"tipo": "VERIFICA", "de": "ESC_Feliz", "a": "P1"}
     ]
   }' > .tmp-lote.json
   agentos modelo emitir --slug {slug} --etapa modelado --input .tmp-lote.json
   rm .tmp-lote.json

   agentos modelo validar --slug {slug} --etapa modelado
   ```

   **La `pantalla` se cierra, no se crea.** El FOCO pudo haberla emitido abierta, y el
   emisor hace upsert por id: esta etapa completa su `cadena_navegacion` y la resuelve.
   Emitir una pantalla nueva con otro id duplicaria el nodo.

   Dos hallazgos propios: `PROCESO_SIN_LLEGADA` (actor humano sin pantalla alcanzable) y
   `PROCESO_SIN_ESCENARIO` (ningun escenario lo verifica).

5. **Proyectar el contrato de cada proceso:**

   ```bash
   agentos modelo proyectar --slug {slug} --vista contrato --proceso {id}
   ```

   Ahora trae dos secciones que antes salian vacias o no existian: **Llegada del actor** y
   **Escenarios**. Reemplaza lo que hay entre los marcadores; el mockup y el flujo interno
   quedan fuera.

6. **Bitacora:**

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## {fecha} — step-07 cerrado

{N} procesos modelados: {M} pantallas cerradas, {K} escenarios emitidos.
{Sally invitada en {J} procesos | Sally no invitada}.
" >> agent-os/disenos/{slug}/bitacora.md
```

## Cierre

```
A-Mary: Modelado completo:

- P1: mockup {si/no}, flujo {si/no}, {N1} escenarios.
- P2: ...

`modelo validar --etapa modelado` limpio.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):
  P — invitar a Winston/Sally si quedo decision pendiente
  C — continuar a step-08 (consolidar brief)
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". Mary declara anchor (mockup/flujo vs codebase) antes de P. NO duplicar la regla — para modificar, editar la fuente. -->

## Post-condicion

- Cada proceso tiene su llegada y sus escenarios en el modelo, y
  `modelo validar --etapa modelado` sale limpio.
- Cada contrato de proceso con su bloque proyectado al dia, y su mockup/flujo fuera de los
  marcadores.
- Si C: avanzar a step-08.

## Prohibiciones

- NO escribir el brief consolidado aun.
- NO crear pantallas duplicadas: la que el FOCO abrio se cierra por su id.
- NO editar `modelo.yml` a mano.
- NO leer step-08.
