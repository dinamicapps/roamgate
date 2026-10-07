# Log de Ejecucion (Test Execution Log)

> Template basado en ISO/IEC/IEEE 29119-3 Test Execution Log, adaptado para bridge-session.
> Cada instancia mantiene uno. Se construye durante Fase 4. Es el archivo `integracion-{nombre-grupo}.md`.

---

```markdown
# Log de Ejecucion — {nombre instancia}

grupo: {id}
plan: {nombre del grupo}
rol: director | colaborador
fecha_inicio: {YYYY-MM-DDTHH:MM}
fecha_fin: {YYYY-MM-DDTHH:MM}
commit_inicio: {hash}
commit_final: {hash}

## Registro de checkpoints

### CP-001: {descripcion}
- **Fecha/hora:** {timestamp}
- **CA activo:** {CA-NNN — correlation ID}
- **Resultado:** PASS | FAIL | BLOCKED | INCONCLUSIVE
- **Ejecutado por:** {instancia}
- **Verificado por:** {instancia}
- **Evidencia desde este lado:**
  - {tipo de evidencia}: {contenido o referencia a archivo}
- **Evidencia del otro lado:**
  - {resumen de lo que la otra instancia reporto al bridge}
- **Anomalias/desviaciones:**
  - {si hubo algo inesperado — incluso si el resultado fue PASS}
- **Contribuciones:**
  - {instancia A}: {que hizo — ej: "ejecuto POST /api/pedidos, capturo response 201"}
  - {instancia B}: {que hizo — ej: "verifico en BD que reserva se creo, confirmo stock_reservado"}

### CP-002: {descripcion}
...

## Incidentes detectados

{Referencia a archivos test-incident.md generados — ver template separado}

| INC | Checkpoint | Severidad | Estado | Resolucion |
|-----|-----------|-----------|--------|------------|
| INC-001 | CP-003 | High | Resuelto | FIX en TokenService.cs |
| INC-002 | CP-005 | Medium | Diferido | Bug preexistente — work nuevo |

## Solicitudes de modificacion

| ID solicitud | Solicitante | Destino | Que se pidio | Estado | Cambio ejecutado |
|-------------|------------|---------|-------------|--------|-----------------|
| {id bridge} | {instancia} | {instancia} | {que_cambia} | aprobado/rechazado | {id cambio-ejecutado} |

## Cambios realizados durante la sesion

| Archivo | Que se cambio | Por que | Solicitud origen | Ejecutado por |
|---------|-------------|---------|-----------------|--------------|
| {archivo} | {descripcion} | {evidencia} | {id solicitud} | {instancia} |

## Metricas de sesion

| Metrica | Valor |
|---------|-------|
| Checkpoints ejecutados | {N} / {total} |
| PASS | {N} |
| FAIL | {N} |
| BLOCKED | {N} |
| CAs verificados | {N} / {total} |
| Incidentes Critical | {N} |
| Incidentes High | {N} |
| Incidentes Medium | {N} |
| Incidentes Low | {N} |
| Solicitudes de modificacion | {N} (aprobadas: {N}, rechazadas: {N}) |
| Tiempo total de sesion | {HH:MM} |
```
