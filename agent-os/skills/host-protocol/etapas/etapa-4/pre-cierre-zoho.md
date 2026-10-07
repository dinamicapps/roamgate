# Etapa 4 — Cierre con items Zoho asociados (PRE_CIERRE)

> Tarjeta por-chequeo de Etapa 4. Se carga SOLO cuando `agentos work checklist-cierre --slug {slug}` marca el chequeo `PRE_CIERRE` como aplicable (`zoho_items[]` no vacio en el README). Movido desde `etapas/etapa-4.md` (Ola 5 T7, doctrina AI-friendly).

## Cierre con items Zoho asociados (PRE_CIERRE)

Si el work tiene `zoho_items[]` no vacio en el README, al cerrar E4 Quinn **no cierra el work directamente**. El work entra en estado `PRE_CIERRE` y Quinn genera/publica comentarios en Zoho antes de ceder al ciclo QA externo.

### Flujo de entrada a PRE_CIERRE

1. Quinn ejecuta chequeo de cumplimiento de meta (flujo existente, sin cambios).
2. Escribe `etapa-4/07-verificacion.md` (flujo existente).
3. Lee `zoho_items[]`:
   - **Vacio o null:** cierre normal del work (COMPLETADO, con o sin bloque `verificacion_diferida{}` / COMPLETADO_CON_BRECHA segun chequeo de meta). Este flujo termina aqui.
   - **>=1 items:** entra en PRE_CIERRE (pasos 4 en adelante).

4. Cambiar estado del work en README: `estado: PRE_CIERRE`. Basta con el README -- el catalogo se deriva del frontmatter en la siguiente lectura, no se escribe aparte; el work sigue en la raiz, no se archiva hasta el cierre terminal.

5. Por cada item en `zoho_items[]`, invocar skill `zoho-sprints-integration` accion `generar-comentarios-cierre(item_no)`. El skill:
   - Identifica scope del item (tareas con `zoho_items_relacionados`, archivos, commits, CAs).
   - Rellena templates tecnico y ejecutivo en registros distintos (ver spec seccion F5).
   - Escribe drafts a `{work}/etapa-4/pre-cierre/comentarios-{item_no}-{tecnico|ejecutivo}.md`.

6. Quinn presenta resumen al usuario en prosa (no tabla):
   ```
   A-Quinn: Listos los comentarios para cerrar los items asociados al work.

   Para {item_no} ({titulo}):
     - Comentario tecnico: {resumen en 1-2 lineas de que abarca}
     - Comentario ejecutivo: {resumen en 1-2 lineas de que abarca}

   (repetir por cada item)

   Podes revisar los drafts completos en:
     etapa-4/pre-cierre/comentarios-*.md

   Opciones:
   (a) Publico los comentarios y paso los items a "Para Probar".
   (b) Quiero editar alguno antes de publicar.
   (c) Cancelar — no publicar, el work vuelve a EN_PROGRESO en E4.
   ```

7. Segun la eleccion:
   - **(a) Publicar:** por cada item: invocar skill `publicar-comentario` (2 veces por item: tecnico y ejecutivo, con `contexto_automatico=false` pq estos comentarios son entregables formales); luego invocar `cambiar-estado-zoho(item_no, "para_probar")`. Registrar cada `comment_id` devuelto en `pre_cierre.comentarios_publicados[]` del README. Registrar en bitacora con `[ZOHO]`.
   - **(b) Editar:** usuario edita los .md localmente. Al decir "listo", Quinn muestra diff de lo editado y vuelve a confirmar (opciones a/c). Si aprueba → publicar; si cancela → mantener drafts pero no publicar.
   - **(c) Cancelar:** estado del work vuelve a `EN_PROGRESO` en E4. Registrar razon de cancelacion en bitacora. El usuario puede retomar mas adelante invocando cierre nuevamente.

8. Al completar publicacion exitosa (solo camino `a`):
   - `pre_cierre.entrado_en: "{fecha ISO}"`.
   - `pre_cierre.items_en_espera: [item_no, ...]`.
   - `pre_cierre.comentarios_publicados: [{item_no, tecnico_id, ejecutivo_id}, ...]`.
   - Mensaje final de Quinn:
     ```
     A-Quinn: Work en PRE_CIERRE.
     Items pasados a "Para Probar" en Zoho con comentarios publicados.

     Cuando QA termine, ejecuta: /alfred revisar-qa

     Si todos aprueban → cierro como COMPLETADO.
     Si alguno rechaza → se dispara reevaluacion obligatoria del work.

     Mientras esperas, podes iniciar otro work.
     ```

### Restricciones del estado PRE_CIERRE

Durante PRE_CIERRE, el work NO acepta:
- `/alfred pausar`
- `/alfred cancelar`
- `/alfred zoho-agregar-item`

Quinn sigue siendo anfitriona activa. Estos comandos deben rechazarse con mensaje:
```
El work esta en PRE_CIERRE (esperando QA externa). Para cancelar/pausar/agregar items:
1. Ejecuta `/alfred revisar-qa` para resolver el PRE_CIERRE.
2. O desasocia todos los items con `/alfred zoho-quitar-item` para cerrar el PRE_CIERRE sin QA.
```

Comandos que SI se aceptan en PRE_CIERRE:
- `/alfred zoho-comentarios` — seguir el canal dev-ops con Zoho.
- `/alfred zoho-comentar {item_no} "texto"` — publicar comentarios.
- `/alfred revisar-qa` — resolver el PRE_CIERRE.
- `/alfred zoho-quitar-item {item_no}` — desasociar un item. Si tras la desasociacion quedan 0 items asociados, el work se degrada automaticamente a `EN_PROGRESO` en E4 (sale de PRE_CIERRE sin QA) y puede cerrarse por el flujo normal de meta.
- `/alfred estado` / `/alfred listar` — consultas.
