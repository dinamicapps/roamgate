# step-03: Pre-diseño de persistencia

> Anfitrión: Dexter [MD]. El cimiento del diseño. Lee completo, ejecuta en orden. Termina con P/C. Solo C avanza.

<!-- FUENTE de los principios P-D1/P-D2/P-D3: agent-os/experts/bmad-agent-dexter/SKILL.md seccion "Principles". FUENTE de P-D4: agent-os/experts/bmad-agent-dexter/references/disciplina-produccion.md. Aqui solo se documenta la mecanica del step. NO duplicar los principios — para modificar, editar la fuente. -->

## Lo propio de esta etapa

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". El ciclo completo vive alli. Aqui solo lo propio de esta etapa. NO duplicar el molde — para modificar, editar la fuente. -->

| | |
|---|---|
| Subgrafo de entrada | los nodos `entidad` que el FOCO abrio y las `capacidad` que los tocan |
| Consume | `entidad`, `capacidad` |
| Emite | cierra las `entidad` con sus columnas, mas las aristas `RELACIONA` |
| Valida | `agentos modelo validar --slug {slug} --etapa datos` |
| Frontera del artefacto | `datos.md`: entre los marcadores la proyeccion (entidades, diccionario, relaciones y matriz CRUD); fuera, el E/R dibujado, la cardinalidad, las derivas observadas y el sello, que son de Dexter |

## Pre-condición

- step-01 (FOCO) cerrado: `modelo.yml` existe con los nodos que Winston dejo.
- El modelo trae los nodos `entidad` que el FOCO identifico (nuevos o existentes tocados) —
  el insumo de Dexter; cada uno abierto con solo su identidad, o resuelto si es **existente**
  y el FOCO alcanzo a citarlo. La entidad **nueva** llega siempre `abierto`, aunque el FOCO
  ya supiera de ella: su prosa vive en `datos.md` y quien la cierra es esta etapa. Puede no
  haber ninguna: eso es lo que la rama `no-aplica-sin-datos` de abajo resuelve, no un
  incumplimiento de esta pre-condicion.
- **Partir del grafo.** Dexter lee los nodos `entidad` que el FOCO abrio y las capacidades
  que los tocan:

      agentos modelo proyectar --slug {slug} --vista datos

  Lo que ahi aparece `abierto` es exactamente el trabajo de esta etapa. **No releer el
  brief para reconstruirlo.**

## Misión

Dexter [MD] produce `agent-os/disenos/{slug}/datos.md`: el primer E/R + diccionario completo + matriz CRUD proceso-entidad. `datos.md` es la proyeccion del subgrafo de datos del modelo — los nodos `entidad` y sus aristas `RELACIONA` — mas lo que Dexter añade sobre ellos: el E/R completo, la cardinalidad y las derivas observadas. El dato precede a procesos, arquitectura y UI (data-first / refinamiento conjunto según requerimiento).

## Pasos

1. **Dexter se activa** con prefijo `A-Dexter:`. Carga su memoria (sidecar de derivas) y el standard `agent-os/standards/database/` si existe.

2. **Hereda el insumo del FOCO:** lee los nodos `entidad` de `agent-os/disenos/{slug}/modelo.yml` (nuevos o existentes, abiertos o resueltos) mas sus aristas `RELACIONA`. NO re-escanea el codebase — parte de ahi. Si hay MCP sqlserver y entorno no-producción (P-D4), enriquece con cardinalidad/índices/dependencias. Si el entorno es producción: solo lectura de metadatos.

3. **Decide modo de entrada** según el requerimiento: proactivo (E/R completo de arranque) o refinamiento conjunto (E/R borrador firme que se refina con procesos en step-04).

4. **Instancia datos.md** via runtime con el schema `diseno-datos`.

   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

   ```bash
   # 1) Escribir el cuerpo con Write a un temporal:
   #    Write tool -> .tmp-body.md con el modelo de datos (E/R + diccionario + matriz CRUD)
   # 2) Invocar con --body-file (sin contenido en el JSON):
   echo '{
     "diseno_slug": "{slug}",
     "ruta_relativa": "datos.md",
     "file_type": "diseno-datos",
     "frontmatter": {
       "diseno_slug": "{slug}",
       "brief_version": 1,
       "persistencia_resuelta": false,
       "mcp_sqlserver_disponible": false,
       "derivas_observadas": []
     }
   }' | agentos diseno file create --body-file .tmp-body.md
   # 3) rm .tmp-body.md
   ```

   <!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->

5. **Llena sección por sección** con estilo narrativa-primero (ver reference modelar-datos.md). Aplica [GE] (gate de evidencia: no fija tipo sin estándar + requerimiento + doc) y [OD] (observa derivas, alerta, propone consolidar).

6. **Discernimiento de integridad** donde aplique (FK sobre datos sucios): cuantifica vía MCP, presenta opciones con costo honesto, recomienda integridad (P-D1).

7. **Emite el lote y valida — antes de sellar.** Unico camino de escritura al grafo:

   ```bash
   # 1) Write tool -> .tmp-lote.json con el lote (nodos `entidad` con
   #    `existencia`/`columnas`; la existente ademas con su cita, aristas `RELACIONA`)
   agentos modelo emitir --slug {slug} --etapa datos --input .tmp-lote.json
   # 2) rm .tmp-lote.json
   # 3) Anclar en datos.md la prosa de las entidades nuevas (ver abajo) — antes de validar
   agentos modelo validar --slug {slug} --etapa datos
   ```

   **Ancla la prosa de las entidades nuevas.** Cada `entidad` con `existencia: nueva` que
   quede `resuelto` lleva su bloque `<!-- nodo: {id} -->` en `datos.md`, seccion
   "Justificacion de las estructuras nuevas". Sin el, `NODO_SIN_PROSA` bloquea el cierre. El
   marcador nombra un id, asi que se escribe **despues** de emitir el lote, nunca antes.

   `ENTIDAD_SIN_MODELAR` reclama toda entidad que quede `estado: abierto`; una entidad que
   no se va a modelar se descarta con su razon. Este paso respalda el sello del siguiente.

8. **Sello anti-evasión (P-D3)** antes de cerrar: chequeo de marcadores de evasión + diccionario completo + justificaciones. **No se fija sin que el paso 7 haya validado sin hallazgos.** Si limpio, setear `persistencia_resuelta: true`. Si no, resolver antes de cerrar. El campo `persistencia_resuelta` pertenece al schema `diseno-datos`; se fusiona con `agentos diseno file set-fm` (`{"diseno_slug":..., "ruta_relativa":"datos.md", "frontmatter":{"persistencia_resuelta":true}}`), no con Edit.

9. **Bitácora:**

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## $(date +%Y-%m-%d) — step-03 cerrado

datos.md producido.
Entidades nuevas: {N}. Campos: {M}. Modificados: {K}. Relaciones: {L}.
Modo de entrada: {proactivo | refinamiento-conjunto}.
MCP disponible: {si | no}.
Derivas observadas: {resumen o 'ninguna'}.
persistencia_resuelta: true
" >> agent-os/disenos/{slug}/bitacora.md
```

## Rama: el diseño no toca persistencia (no-aplica-sin-datos)

Tras el paso 2 (heredar el insumo del FOCO), si Dexter determina que el diseño **NO toca persistencia** —0 tablas nuevas, 0 campos nuevos/modificados, 0 SP, 0 relaciones nuevas; solo lectura de estructuras existentes sin cambio— usa esta rama en lugar del modelado E/R completo.

**Esto NO es evasión de P-D3, es una declaración positiva con evidencia.** El sello anti-evasión se satisface porque la persistencia quedó *resuelta* (resuelta = "no aplica, con prueba"), no diferida con un "allí veremos". **Que no haya tablas ni campos nuevos no exime del paso 7:** las entidades que el FOCO abrio para las estructuras existentes que el diseño lee se resuelven con su cita o se descartan con razon — nunca quedan `abierto`. Dexter:

1. Declara al usuario que **buscó** impacto de persistencia y no lo hay, citando qué revisó (los nodos `entidad` del modelo, MCP sqlserver si está disponible).
2. Instancia `datos.md` solo con la **matriz CRUD de lecturas** (qué procesos leen qué estructuras existentes), sin E/R nuevo.
3. **Pasa por el paso 7 igual que el camino principal:** resuelve cada nodo `entidad` abierto con la cita de la estructura que lee (o lo descarta con razon), emite el lote y corre `agentos modelo validar --slug {slug} --etapa datos` — sin `ENTIDAD_SIN_MODELAR` limpio no se sigue.
4. Cierra con `persistencia_resuelta: true` y registra en bitácora la entrada `no-aplica-sin-datos` con la evidencia de qué buscó y por qué no hay impacto.

Si Dexter **no puede probar** que no hay impacto (duda, estructura no inspeccionada, MCP no disponible y sin doc), NO usar esta rama: modelar normalmente (pasos 3-9). Si puede probarlo, tras el paso 4 de arriba saltar directo al paso 9 (bitácora) y cerrar — nunca antes del paso 3 de esta rama.

## Cierre de la etapa

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". Aqui solo lo especifico de la etapa de datos. NO duplicar el molde — para modificar, editar la fuente. -->

**Que emite esta etapa** (lote unico, `--etapa datos`, paso 7 arriba):

- nodos `entidad` con `existencia` y `columnas`, y **las dos ramas se separan aqui**:
  - la **existente** lleva ademas **su cita** — la estructura real que Dexter leyo
    (archivo:linea del script de esquema, o la lectura del catalogo via MCP). No es adorno de
    la rama `no-aplica-sin-datos`: es lo que distingue una entidad modelada de una supuesta.
  - la **nueva** no cita —no hay codigo que citar todavia— y en su lugar lleva prosa anclada
    con `<!-- nodo: {id} -->` que justifica por que se necesita y por que no es redundante.
- aristas `RELACIONA` entidad -> entidad.

<!-- FUENTE: agent-os/templates/diseno/schema/modelo.md secciones "Que nodos citan" y "Que nodos exigen prosa". La tabla completa por tipo vive alli; aqui solo se instancia lo que la etapa de datos emite. NO duplicar la regla — para modificar, editar la fuente. -->

**Por que la cita se exige aqui a la entidad existente aunque `modelo validar --etapa datos`
no la reclame.** El predicado que la cuenta, `NODO_SIN_CITA`, corre al cerrar el **FOCO**, no
esta etapa. Si datos resuelve entidades existentes sin citarlas, esta etapa sale verde — y
despues, cuando un regreso obliga a re-validar `foco`, revienta una etapa que ya estaba
cerrada. Citar al emitir cuesta una linea; descubrirlo por el regreso cuesta reabrir el
diseno. A la entidad **nueva** no la alcanza este argumento: `NODO_SIN_CITA` no la reclama en
ninguna etapa, y lo que si se le reclama —en esta— es la prosa.

**Por que la entidad nueva la cierra esta etapa y no el FOCO.** Su prosa vive en `datos.md`;
el FOCO la deja `abierto` a proposito. Es el molde, no una regla de datos: ver
`ciclo-de-etapa.md` seccion "El principio".

**No emite `ACCEDE`.** Esa arista va de un `proceso` a una `entidad`, y los procesos no
existen como nodos hasta step-04: emitirla aqui falla por forma. La matriz CRUD de `datos.md`
queda preliminar —lecturas de estructuras existentes, en prosa de Dexter— y se vuelve
proyeccion cuando la etapa de procesos emita las aristas.

**El sello sigue siendo de Dexter.** `persistencia_resuelta: true` (paso 8) es su certeza
declarada; no se fija sin que el paso 7 haya validado limpio primero.

**Regenerar el bloque proyectado** de `datos.md`:

    agentos modelo proyectar --slug {slug} --vista datos

reemplazando con su salida lo que hay entre `<!-- modelo:start vista=datos -->` y
`<!-- modelo:end -->`. El E/R, las derivas, el sello y la justificacion de las estructuras
nuevas quedan fuera y se escriben a mano — por eso sobreviven a cada regeneracion.

## Cierre

**Si algo choca con lo que el FOCO decidio** —una entidad que no existe como se declaro, una
capacidad clasificada sobre un supuesto falso— leer la `etapa` del nodo y ofrecer el regreso.
Ver `ciclo-de-etapa.md` seccion "El regreso".

```
A-Dexter: datos.md producido.

Entidades: {N nuevas, K modificadas}. Campos: {M}. Relaciones: {L}.
Matriz CRUD proceso-entidad: pendiente de confirmar en step-04 (los procesos
aun no estan definidos — la matriz se completa en el refinamiento conjunto).
Derivas observadas: {resumen o 'ninguna'}.
Sello anti-evasion: PASS. persistencia_resuelta: true.

En step-04 los procesos se discuten SOBRE estas entidades. Si un proceso
revela una entidad faltante o un campo incorrecto, Dexter refina datos.md
(refinamiento conjunto). El E/R aqui es firme, no final.

Menu (la opcion P requiere anchor declarado —
ver advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):

  P — invitar a Winston si hay decision de arquitectura de datos pesada.
      Dexter declara: "Winston leera {archivos especificos} antes de
      pronunciarse sobre {pregunta concreta}".

  C — continuar (Mary evalua el gate de entrada de step-03b: pre-diseño criptografico si hay dimension cripto; si no, step-04).
```

<!-- FUENTE: agent-os/skills/advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia". Dexter declara anchor (que tablas/esquema leyo via MCP) antes de P. NO duplicar la regla — para modificar, editar la fuente. -->

## Post-condición

- `agent-os/disenos/{slug}/datos.md` poblado con `persistencia_resuelta: true`.
- README del diseño actualizado (campos de persistencia).
- Si C: Mary evalua el gate de entrada de step-03b (dimension criptografica). Sin dimension cripto: avanzar directo a step-04.

## Prohibiciones

- NO definir procesos aún (eso es step-04).
- NO escribir mockups.
- NO escribir contra producción bajo ninguna circunstancia (P-D4).
- NO cerrar con `persistencia_resuelta: false` (P-D3). La unica alternativa valida a modelar es la rama `no-aplica-sin-datos` (declaracion positiva con evidencia), que cierra con `persistencia_resuelta: true`.
- NO leer step-04 hasta cerrar este step.
