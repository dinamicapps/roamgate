# Fase 5: Evidencia Bidireccional

## Objetivo

Cada instancia documenta que vio desde su lado — no solo pass/fail sino la narrativa completa con trazabilidad de quien emitio y contribuyo a cada resultado.

## Archivo de evidencia

Cada instancia genera un archivo local en `{work_output_path}/`:

**Nombre:** `integracion-{nombre-grupo}.md`

**Contenido:**

```markdown
# Evidencia de Integracion — {nombre instancia}

grupo: {id}
rol: {director | colaborador}
tipo_sesion: {pruebas-con-ajustes | desarrollo-con-pruebas}
fecha_inicio: {timestamp}
fecha_fin: {timestamp}
commit_inicio: {hash}
commit_final: {hash}

## Checkpoints

### CP-001: {descripcion}
- **Resultado:** PASS | FAIL
- **Ejecutado por:** {instancia}
- **Verificado por:** {instancia}
- **Evidencia desde este lado:**
  - {log, screenshot, response body — lo que se capturo}
- **Evidencia del otro lado:**
  - {resumen de lo que la otra instancia reporto}
- **Hallazgos:**
  - {si hubo algo inesperado, documentarlo}
- **Contribuciones:**
  - {instancia A}: {que hizo — ej: "ejecuto el endpoint, capturo response 200"}
  - {instancia B}: {que hizo — ej: "verifico logs de backend, confirmo que el request llego"}

### CP-002: {descripcion}
...

## Solicitudes de modificacion

| ID solicitud | Solicitante | Destino | Que se pidio | Estado | Cambio ejecutado |
|-------------|------------|---------|-------------|--------|-----------------|
| {id} | {instancia} | {instancia} | {que_cambia} | aprobado | {id cambio-ejecutado} |
| {id} | {instancia} | {instancia} | {que_cambia} | rechazado | — |

## Cambios realizados durante la sesion

| Archivo | Que se cambio | Por que | Solicitud origen | Ejecutado por |
|---------|-------------|---------|-----------------|--------------|
| {archivo} | {descripcion} | {razon con evidencia} | {id solicitud} | {instancia} |

## Hallazgos que requirieron desarrollo

| Hallazgo | Descubierto por | Resuelto por | Acciones | Solicitud ID | Cambio ID |
|---------|----------------|-------------|---------|-------------|----------|
| {descripcion} | {instancia + evidencia} | {instancia} | {que se hizo} | {id} | {id} |

## Decisiones tomadas

| Decision | Razon | Escalada al usuario | Resultado |
|---------|-------|-------------------|----------|
| {decision} | {razon} | si/no | {que se decidio} |
```

## Cuando generar

- Se va construyendo durante Fase 4 (ejecucion) — despues de cada checkpoint se agrega la entrada.
- Al completar todos los checkpoints (o al cerrar la sesion), se agrega la seccion final de cambios y decisiones.

## Publicacion al grupo

Al completar la evidencia, publicar al grupo como mensaje tipo `contexto` con subtipo `evidencia-final`:

```
bridge_publicar(id_grupo, "contexto", "{resumen ejecutivo de la evidencia}", metadata: '{"subtipo": "evidencia-final"}')
```

La otra instancia recibe esto y lo guarda como referencia cruzada.
