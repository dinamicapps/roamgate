# Materializar un work de rediseno-ui via runtime

La ruta `rediseno-ui` usa el mismo ciclo open/transition/close que las demas rutas (README raiz,
`readme-work`), con dos campos propios (`origen_rediseno`, `toca_backend`) y una bitacora de hitos
que se gestiona con `work file set-section`. Sally conduce el flujo; Alfred abre el work y
gobierna el cierre. Patron:

1. **Detectar el binario:** buscar `.claude/agent-os-bin/agentos` (o `agentos.exe` en Windows).
   Si NO existe: informar "Runtime de agent-os requerido para crear el work. Reinstala el
   runtime de agent-os (instalador del paquete)." y NO crear a mano.
2. **Abrir el work** (al confirmar ruta en el abordaje): invocar con slug `{YYYYMMDD}-rediseno-{slug-corto}`,
   entregando el JSON via `--input <ruta>` (recomendado; scratchpad) — stdin sigue valido en invocacion simple:

   ```
   agentos work open --slug <slug> --autor "<autor>" --modo normal --tipo rediseno-ui --nivel <nivel> --input <ruta-json>
   ```

   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->

   JSON:

   ```json
   {
     "proveedor_ia": "claude",
     "titulo": "<titulo>",
     "objetivo": "<objetivo>",
     "meta": "<meta>",
     "ruta": "rediseno-ui",
     "origen_rediseno": "<slug-epica-o-estandar>",
     "toca_backend": false,
     "abordaje": { "realizado_en": "<YYYY-MM-DD>", "expertos_invitados": [], "party_mode": false,
                   "ruta_propuesta": "rediseno-ui", "ruta_aprobada": "rediseno-ui",
                   "prosa": "<bloque ## Abordaje>" }
   }
   ```

   - `origen_rediseno`: slug, epica o nombre del estandar que autoriza saltar discovery amplio.
     Omitir si no hay base de diseno previa declarada.
   - `toca_backend`: `true` si el work reorganiza origenes de datos (listas desplegables, catalogos,
     SPs, endpoints) — obliga a producir `## Contrato de datos` en la fase 1. `false` si el cambio
     es puramente cosmético (layout/estilos sin tocar orígenes).

3. **Parsear la respuesta** `{ok, data}`: si `ok:false`, mostrar `error.mensaje` y detenerse;
   si `ok:true`, activar la fase 1 de la ruta (`rutas/rediseno-ui/fase-1-discovery-acotado.md`)
   con `data.slug` y `data.frontmatter`.

   Tras ese `work open`, esta ruta tambien siembra el grafo del work.
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Sembrar el grafo del work". Aqui solo se declara que la ruta rediseno-ui tambien lo aplica tras su propio work open, con su misma ancla. NO duplicar la regla — para modificar, editar la fuente. -->

4. **Poblar la bitacora de hitos** (fase 2, en vivo): cada hito se registra via `work file set-section`.
   Recomendado: escribir el JSON al scratchpad y pasar `--input <ruta>`; stdin sigue valido para el
   payload de una fila:

   ```
   agentos work file set-section --input <ruta-json>
   ```
   (JSON: `{"work_slug":"<slug>","ruta_relativa":"README.md","seccion":"Hitos","contenido":"| <hito> | <componentes> | <cambios> | <commit> |"}`;
   equivalente por stdin: `echo '...' | agentos work file set-section`.)

   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->

   La tabla `## Hitos` no se edita a mano — se actualiza por esta via. El binario preserva el
   cuerpo existente del README y solo reemplaza la seccion nombrada.

5. **Cerrar el work** (fase 4): `agentos work close --slug <slug> --estado COMPLETADO`
   (o `COMPLETADO_CON_BRECHA` si hay brechas aceptadas). Antes: poblar `## Cierre`,
   `## Archivos modificados` y `## Decisiones clave` via `work file set-section`
   (igual que el cierre estandar; ver `gestion/cerrar.md`).

6. **Parsear** `{ok,data}` en cada invocacion: si `ok:false`, mostrar `error.mensaje` y detenerse.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/rutas/rediseno-ui/readme.md (campos origen_rediseno/toca_backend, flujo de 4 fases). El schema readme-work y los verbos work open/close/set-section viven en el runtime. Aqui se documenta como Alfred invoca los verbos para esta ruta; NO duplicar los schemas -- para modificar, editar el runtime. -->
