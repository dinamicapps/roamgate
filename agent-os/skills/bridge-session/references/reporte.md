# Fase 6: Reporte Consolidado

## Objetivo

Un artefacto git commiteable que muestre los resultados de ambos lados. Solo el Director lo genera, usando la evidencia de todos los participantes.

## Solo el Director ejecuta esta fase

Si esta instancia es Colaborador, publicar la evidencia bidireccional (Fase 5) y esperar a que el Director genere el reporte. Al recibirlo, confirmar y hacer commit de los artefactos locales.

## Flujo (Director)

### 1. Recopilar evidencia de todos los participantes

Leer del grupo:
- Mensajes tipo `contexto` con subtipo `evidencia-final` de cada participante
- Metadata del grupo (plan de prueba con estados de checkpoints)
- Historial de solicitudes de modificacion y cambios ejecutados

### 2. Generar reporte

**Nombre:** `reporte-integracion-{nombre-grupo}.md`
**Ubicacion:** `{work_output_path}/`

```markdown
# Reporte de Integracion — {nombre del grupo}

fecha: {timestamp}
grupo_bridge: {id}
tipo_sesion: {pruebas-con-ajustes | desarrollo-con-pruebas}

## Participantes

| Instancia | Repo | Rol | Commit inicio | Commit final |
|-----------|------|-----|--------------|-------------|
| {nombre} | {repo} | director | {hash} | {hash} |
| {nombre} | {repo} | colaborador | {hash} | {hash} |

## Reglas del grupo

- Alcance: {alcance}
- Archivos protegidos: {lista}
- Decisiones reservadas: {lista}
- Direccion arquitectonica: {lista}

## Resumen de resultados

- Total checkpoints: {N}
- Pasaron: {N}
- Fallaron: {N}
- Omitidos: {N} (con autorizacion del usuario)
- Criticos: {N}/{N}

## Checkpoints detallados

### CP-001: {descripcion}
- Resultado: PASS | FAIL
- Ejecutado por: {instancia}
- Verificado por: {instancia}
- Evidencia {instancia 1}: {resumen}
- Evidencia {instancia 2}: {resumen}
- Cambios requeridos: {si hubo solicitudes de modificacion}

### CP-002: {descripcion}
...

## Solicitudes de modificacion

| # | Solicitante | Destino | Que se pidio | Estado | Tiempo resolucion |
|---|-----------|---------|-------------|--------|-----------------|
| 1 | {inst} | {inst} | {que_cambia} | aprobado | {minutos} |
| 2 | {inst} | {inst} | {que_cambia} | rechazado | {minutos} |

## Cambios realizados

| Archivo | Repo | Que cambio | Solicitud | Ejecutado por |
|---------|------|-----------|----------|--------------|
| {archivo} | {repo} | {desc} | #{N} | {instancia} |

## Hallazgos que requirieron desarrollo

| Hallazgo | Descubierto por | Resuelto por | Tipo |
|---------|----------------|-------------|------|
| {desc} | {instancia} | {instancia} | ajuste | bug preexistente | fuera de alcance |

## Decisiones tomadas

| Decision | Escalada | Resultado |
|---------|---------|----------|
| {desc} | si/no | {que se decidio} |

## Pendientes para futuros works

| Pendiente | Descubierto en | Razon de postergacion |
|----------|---------------|---------------------|
| {desc} | CP-{NNN} | {razon} |
```

### 3. Presentar al usuario

AskUserQuestion:
  question: "=== REPORTE DE INTEGRACION === {N} checkpoints, {N} pass, {N} fail. {N} solicitudes de modificacion. Revisar reporte."
  options:
    - label: "Aprobar reporte"
      description: "El reporte es correcto. Publicar al grupo y cerrar."
    - label: "Ajustar"
      description: "Necesito corregir algo en el reporte."

### 4. Publicar y cerrar

1. Publicar reporte al grupo:
   ```
   bridge_publicar(id_grupo, "contexto", "{resumen ejecutivo}", metadata: '{"subtipo": "reporte-final"}')
   ```

2. Actualizar metadata del grupo con reporte:
   ```
   bridge_actualizar_grupo(id_grupo, metadata: '{"reporte_final": {"fecha": "...", "checkpoints_pass": N, "checkpoints_fail": N, "solicitudes": N, "estado": "completado"}}')
   ```

3. Cada instancia confirma estado de su repo:
   - Archivos limpios (sin cambios pendientes)
   - Commit realizado con artefactos de integracion

4. Preguntar si archivar el grupo:

   AskUserQuestion:
     question: "Archivar el grupo del bridge?"
     options:
       - label: "Archivar"
         description: "Cerrar el grupo. Notifica a todos los miembros."
       - label: "Mantener"
         description: "Dejar activo para futuras sesiones."

5. Si archivar: `bridge_archivar_grupo(id_grupo, razon: "Integracion completada. {N}/{N} checkpoints pass.")`

### 5. Artefactos commiteables

Estos archivos deben incluirse en el commit del work:
- `integracion-{nombre-grupo}.md` — evidencia bidireccional de esta instancia
- `reporte-integracion-{nombre-grupo}.md` — reporte consolidado (solo Director)
- Referencia en `07-verificacion.md` si se invoco desde /alfred Etapa 4

## Propagacion de contratos acordados (nuevo)

Antes de marcar sesion como cerrada, ejecutar flujo de propagacion de contratos. Ver `propagacion-contrato.md` para detalle completo.

Resumen:
1. Listar `grupo-{nombre}/contratos/acordados/*.yml` con contratos de esta sesion.
2. Para cada uno: verificar `ambos_lados_confirmaron: true` en `ejecucion.md`.
3. Si si: copiar a `.documentacion/contratos-externos/{sistema}/{endpoint}.yml`, actualizar `_indice.yml`, registrar en bitacora + reporte.
4. Si no: documentar razon en `reporte.md` y dejar contrato en `acordados/` pendiente de propagacion futura.

Gate: la sesion no se puede marcar `resultado: aprobada` si hay contratos acordados sin decision de propagacion.
