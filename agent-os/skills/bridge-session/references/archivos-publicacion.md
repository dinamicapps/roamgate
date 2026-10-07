# Archivos Publicados - API Real (EP-010) y Modo Degradado

## API entregada por bridge (EP-010, 2026-04-15)

Tools MCP disponibles tras EP-010:

bridge_subir_adjunto(id_grupo, ruta, nombre?, destinatarios?, tipo?, etiquetas?, sobrescribir?, changelog_entry?)
  destinatarios: string[]   # IDs o nombres de miembros. Omitir = broadcast a todos los miembros.
                            # NO acepta primitivas de rol. Resolver "director" o "colaborador:X" a IDs primero.
  tipo: string libre        # convencion cliente (no enum). Sugerido: "manifiesto" | "evaluacion" | "evaluacion-cruce" | "evidencia" | "hallazgo" | "acta-mesa" | "solicitud-autorizacion" | "contexto-soporte"
  etiquetas: string[]       # libres, filtrables por match exacto
  sobrescribir: boolean     # default false. true = nueva version del nombre logico existente
  changelog_entry: string   # max 500 chars

bridge_listar_adjuntos(id_grupo, destinatario?, tipo?, etiqueta?, solo_ultima_version?, nombre?)
  destinatario: "all" (solo broadcast) | "mios" (broadcast + dirigidos a mi) | "{id_o_nombre}"
  tipo: string con wildcards (ej "manifiesto*")
  etiqueta: match exacto
  solo_ultima_version: true | false
  nombre: match exacto del nombre logico

bridge_leer_archivo(id_grupo, nombre, version: N | "ultima")
  Default version: "ultima".
  Si version=N no existe -> 404 con `versiones_disponibles: number[]`.

bridge_historial_archivo(id_grupo, nombre)
  Lista versiones ordenadas ASC con: version, adjunto_id, fecha, emisor_nombre, hash, tamano, changelog_entry, url.

## Resolucion rol -> ID (responsabilidad de la skill)

El bridge NO entiende roles ("director", "colaborador:emedico"). La skill DEBE resolverlos a IDs antes de cualquier publicacion dirigida:

```
miembros = bridge_listar_miembros(id_grupo)
director_id = miembros.filter(m -> m.rol == "director")[0].id
colaboradores_ids = miembros.filter(m -> m.rol == "colaborador").map(m -> m.id)
```

Cachear el resultado al inicio de la sesion. Re-resolver si cambia la membresia (raro).

## Encabezado obligatorio en archivos publicados

Todo archivo publicado lleva frontmatter:

---
tipo: manifiesto | evaluacion | evaluacion-cruce | evidencia | hallazgo | acta-mesa
emisor: {instancia}
version: {N}                        # asignado por bridge al subir
emitido: {ISO-8601}
hash: {sha256}                      # calculado por bridge
supersede: {version-anterior o "inicial"}
changelog:
  - version: {N}
    fecha: {timestamp}
    cambios: "{descripcion breve}"
---

`version` y `hash` los retorna el bridge en la respuesta de `bridge_subir_adjunto`. La skill NO los precomputa.

## Invariante: siempre asociar upload con bridge_publicar

El bridge purga adjuntos sin mensaje asociado tras un TTL (default 3600s). La skill DEBE ejecutar `bridge_publicar` con referencia al `adjunto_id` inmediatamente despues de `bridge_subir_adjunto`:

resultado = bridge_subir_adjunto(id_grupo, ruta: "manifiesto.yml", destinatarios: [...resolved_ids], tipo: "manifiesto", sobrescribir: true, changelog_entry: "v2: reasignacion fase F-003")
bridge_publicar(id_grupo, "contexto", "MANIFIESTO v{resultado.version} publicado.", adjunto_id: resultado.adjunto_id, metadata: '{"subtipo": "manifiesto-actualizado"}')

Si la skill se interrumpe entre los dos pasos, el adjunto se purga. Tratar ambos como una sola operacion logica.

## Versionado y HTTP 409

Identidad del archivo = `(id_grupo, nombre)`. Re-subir con mismo `nombre`:
- Sin `sobrescribir=true` -> HTTP 409 con `version_actual` y `ultimo_id` en el cuerpo. La skill DEBE manejar este caso: o reintentar con `sobrescribir=true`, o renombrar.
- Con `sobrescribir=true` -> nueva version (N+1), conserva todas las anteriores accesibles via `bridge_historial_archivo`.

Race condition conocida: dos instancias con `sobrescribir=true` simultaneamente pueden generar dos `version=N+1` (no hay UNIQUE constraint). Mitigacion: solo el director publica manifiesto y autorizaciones - serializa naturalmente. Para publicaciones del colaborador, cada colaborador es emisor unico de sus propias publicaciones - sin race.

## Modo degradado para acuse de recibo (F-5 diferida)

`bridge_acusar_archivo` y `bridge_estado_acuses` NO existen en EP-010. Quedan diferidas a EP-011. Modo degradado obligatorio:

Acuse:
bridge_publicar(id_grupo, "response", "Acuse de {nombre} v{N}: aplicado",
  destinatarios: [id_emisor],
  respuesta_a: id_mensaje_que_llevo_el_adjunto,
  metadata: '{"subtipo": "acuse-archivo", "archivo": "{nombre}", "version": N, "estado": "aplicado"}')

Verificacion de acuses pendientes (responsabilidad de la skill emisora):
1. Listar mensajes con `respuesta_a == id_mensaje_original` y `metadata.subtipo == "acuse-archivo"`.
2. Comparar emisores de los acuses contra lista de destinatarios afectados.
3. Si faltan acuses tras timeout configurable (default 24h para manifiesto, 72h para mesa): notificar al usuario emisor.

La skill bloquea operaciones dependientes hasta que destinatarios afectados acusen "aplicado" en versiones criticas (manifiesto, autorizaciones).

## Deteccion de capacidades (sin endpoint dedicado)

El bridge NO retorna `bridge_estado.capacidades`. Detectar EP-010 al iniciar la skill por **presencia de tools en la lista MCP**:

if "bridge_leer_archivo" in mcp_tools:
  modo = "ep010"
else:
  modo = "legacy"   # bridge previo sin versionado ni dirigidos

Registrar en `bitacora.md` de la etapa que invoca:

## [Orquestador] Modo bridge detectado
fecha: {timestamp}
modo: ep010 | legacy
tools_disponibles: [bridge_subir_adjunto, bridge_leer_archivo, bridge_historial_archivo, ...]

## Modo legacy (bridge pre-EP-010)

Si los tools de EP-010 no estan disponibles:
- Sin destinatarios -> todo es broadcast. Filtrado en cliente segun convencion de nombre.
- Sin versionado -> version implicita en el nombre del archivo (`manifiesto.v2.yml`). Re-subir con nombre distinto, no `sobrescribir`.
- Sin acuse nativo -> mismo modo degradado descrito arriba (es identico al modo EP-010 ya que F-5 no esta entregada).

Adjuntos previos (pre-EP-010):
- `version=1`, `destinatarios=NULL`, `tipo=NULL`, `etiquetas=[]`, `hash=NULL`, `changelog_entry=NULL`.
- Visibles en listados con campos nuevos como null. Descargables sin cambio.

## Trazabilidad

API documentada en respuesta del equipo bridge: `docs/solicitudes-bridge/2026-04-15-publicacion-dirigida-versionado-mesa-RESPUESTA.md`.
EP-010 implementada en repo claude-mcp-bridge, branch `dev`, pendiente de aplicar al broker de produccion.
