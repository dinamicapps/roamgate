# step-r4: Aplicar el cambio — grafo primero, prosa despues

## Mision

Emitir al grafo el cambio aprobado, re-recorrer las etapas que el impacto marco, re-proyectar
los artefactos y recien entonces subir `brief_version`. El orden **es** el contenido de este
step: emitir despues de escribir la prosa dejaria la fuente describiendo el mundo de antes,
que es exactamente lo que este regimen vino a corregir.

## Pasos

1. **Emitir al grafo.** Los nodos que dejan de valer pasan a `obsoleto` con su razon; los
   nuevos nacen; las aristas cambian:

```bash
# 1) Write tool -> .tmp-lote.json
echo '{
  "nodos": [
    {"id": "P3", "estado": "obsoleto", "razon": "la sede se hereda de usu.idsede, no se selecciona",
     "campos": {"reemplazado_por": "P3b"}},
    {"id": "P3b", "tipo": "proceso", "estado": "resuelto",
     "campos": {"nombre": "despacho con sede heredada", "trigger": "al guardar", "modulo": "farmacia"}}
  ],
  "aristas": []
}' > .tmp-lote.json
agentos modelo emitir --slug {slug} --etapa {etapa-del-nodo-invalidado} --input .tmp-lote.json
rm .tmp-lote.json
```

   La `--etapa` es la del nodo que se esta corrigiendo: es quien sella la procedencia de lo
   que nazca aqui, y el regreso pregunta por que nacio asi.

   **`obsoleto`, no `descartado`.** El nodo sigue vivo y navegable: un work cerrado que se
   valido contra el lo encuentra donde siempre estuvo, marcado como lo que es.

2. **Re-recorrer las etapas** que `modelo impacto` devolvio en r2, en orden. Cada una la
   conduce su anfitrion con el grafo nuevo delante.

   <!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "El regreso". Que significa re-recorrer y por que no basta re-validar vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

3. **Re-proyectar los artefactos tocados**, reemplazando lo que hay entre los marcadores
   `modelo:start`/`modelo:end`. Lo de afuera es del experto y no se toca:

```bash
agentos modelo proyectar --slug {slug} --vista datos
agentos modelo proyectar --slug {slug} --vista contrato --proceso {id}
agentos modelo proyectar --slug {slug} --vista pipeline
```

4. **Marcar la prosa de fuera de los marcadores** que el hallazgo cambio, con la marca inline
   al final de cada linea modificada:

```
| RH-1 | sede heredada... | usu.idsede | <!-- HZ-002 -->
```

5. **Explicar la obsolescencia en prosa.** El nodo obsoleto conserva su exigencia de prosa
   anclada, y la prosa es justamente donde se documenta **por que** dejo de valer y que lo
   sucede. Anclarla con `<!-- nodo: {id} -->` en su propia linea.

6. **Validar que el modelo cierra:**

```bash
agentos modelo validar --slug {slug} --etapa brief
```

   **`MODELO_ABIERTO` sobre el nodo del hallazgo es lo esperado, y no se cierra en r5.** El
   hallazgo pasa a `mitigado` —el diseño hizo su parte— pero el nodo **sigue `abierto` hasta
   que un work consuma el cambio** y alguien transicione la ficha a `aplicado`. Es la
   diferencia entre "el diseño ya lo corrigio" y "el cambio ya llego al codigo", y el grafo
   lleva la segunda.

   Eso NO bloquea nada ahora: el diseño vuelve a `EN_USO` y los works consumen el brief sin
   correr esta compuerta. Lo que si hace es impedir que el diseño **vuelva a cerrar un brief**
   con un cambio pendiente de aplicar — que es exactamente lo que debe pasar.

   Cualquier otro `MODELO_ABIERTO` —sobre un nodo que no sea el del hallazgo— si es trabajo
   sin terminar de este retroceso.

7. **Actualizar brief.md:**

   - Resumen ejecutivo si la mitigacion lo afecta.
   - Tabla "Hallazgos aplicados": agregar fila.
   - Incrementar `brief_version` en frontmatter.

8. **Anotar en bitacora del diseño:**

```bash
echo "
## $(date +%Y-%m-%d) — HZ-{NNN} mitigado

Cambio al modelo: {nodos obsoletos} -> {sucesores}. {nodos nuevos}.
Etapas re-recorridas: {etapas}.
Artefactos re-proyectados: {archivos}.
Razon: {razon textual}.
brief_version: {N+1}.
" >> agent-os/disenos/{slug}/bitacora.md
```

9. **Avanzar a step-r5.**
