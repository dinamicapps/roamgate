# Reporte de Cierre (Test Completion Report)

> Template basado en ISO/IEC/IEEE 29119-3 Test Completion Report, adaptado para bridge-session.
> Generado por el Director en Fase 6. Artefacto git commiteable.
> Es el archivo `reporte-integracion-{nombre-grupo}.md`.

---

```markdown
# Reporte de Integracion - {nombre del grupo bridge}

reporte_id: {UUID del grupo}
fecha: {YYYY-MM-DD}
tipo_sesion: pruebas-con-ajustes | desarrollo-con-pruebas
estado: completado | suspendido | cancelado

## 1. Participantes

| Instancia | Repo | Rol | Commit inicio | Commit final | Cambios realizados |
|-----------|------|-----|--------------|-------------|-------------------|
| {nombre} | {repo} | director | {hash} | {hash} | {N} archivos |
| {nombre} | {repo} | colaborador | {hash} | {hash} | {N} archivos |

## 2. Reglas del grupo

| Tipo | Valor |
|------|-------|
| Alcance | {alcance} |
| Archivo protegido | {patron} |
| Decision reservada | {decision} |
| Direccion arquitectonica | {direccion} |

## 3. Evaluacion de criterios de completitud

| Criterio | Requerido | Resultado | Cumple |
|---------|-----------|-----------|--------|
| Checkpoints PASS | >= {N}% | {N}% ({pass}/{total}) | Si/No |
| Checkpoints criticos FAIL | 0 | {N} | Si/No |
| CAs verificados | 100% | {N}% ({verificados}/{total}) | Si/No |
| Incidentes Critical abiertos | 0 | {N} | Si/No |

**Veredicto:** APROBADO | NO APROBADO | APROBADO CON RESERVAS
**Justificacion:** {si no aprobado o con reservas, explicar por que}

## 4. Cobertura de Criterios de Aceptacion

| CA | Descripcion | Checkpoints | Resultado |
|----|------------|-------------|-----------|
| CA-001 | {desc} | CP-001, CP-003 | Verificado (PASS) |
| CA-002 | {desc} | CP-004, CP-005 | Verificado (PASS) |
| CA-003 | {desc} | CP-006 | Fallo (resuelto con INC-001) |
| CA-004 | {desc} | - | No verificado (sin checkpoint asociado) |

## 5. Resumen de checkpoints

| CP | Descripcion | CA | Resultado | Incidentes |
|----|-----------|-----|-----------|-----------|
| CP-001 | {desc} | CA-001 | PASS | - |
| CP-002 | {desc} | CA-002 | PASS | - |
| CP-003 | {desc} | CA-001 | PASS | - |
| CP-004 | {desc} | CA-002 | FAIL ->  PASS | INC-001 |
| CP-005 | {desc} | CA-002 | PASS | - |
| CP-006 | {desc} | CA-003 | FAIL ->  PASS | INC-002 |

## 6. Incidentes

| INC | CP | Severidad | Prioridad | Tipo | Estado | Resolucion |
|-----|-----|-----------|----------|------|--------|------------|
| INC-001 | CP-004 | High | P2 | Fallo del work | Resuelto | FIX en TokenService.cs |
| INC-002 | CP-006 | Medium | P3 | Bug preexistente | Diferido | Documentado para work nuevo |

## 7. Solicitudes de modificacion

| # | Solicitante | Destino | Que se pidio | Estado | Tiempo |
|---|-----------|---------|-------------|--------|--------|
| 1 | {inst} | {inst} | {que_cambia} | aprobado | {min} |
| 2 | {inst} | {inst} | {que_cambia} | rechazado | {min} |

## 8. Cambios realizados

| Archivo | Repo | Cambio | Solicitud | Por |
|---------|------|--------|----------|-----|
| {archivo} | {repo} | {desc} | #1 | {inst} |

## 9. Desviaciones del plan original

| Desviacion | Razon | Impacto |
|-----------|-------|---------|
| {ej: CP-007 omitido} | {sistema X no disponible} | {CA-005 no verificado} |
| {ej: Orden cambiado} | {CP-003 depende de fix de INC-001} | {ninguno} |

## 10. Pendientes para futuros works

| Pendiente | Descubierto en | Tipo | Razon de postergacion |
|----------|---------------|------|---------------------|
| {desc} | CP-006 / INC-002 | Bug preexistente | Fuera de alcance |
| {desc} | CP-008 | Feature faltante | Requiere diseno |

## 11. Lecciones aprendidas

| Leccion | Contexto | Recomendacion |
|---------|---------|--------------|
| {ej: El JWT expiraba durante pruebas largas} | CP-004, INC-001 | Usar tokens de larga duracion en entorno de prueba |
| {ej: Los datos de prueba no eran consistentes} | Fase 3 | Definir script de seed compartido |

## 12. Metricas finales

| Metrica | Valor |
|---------|-------|
| Checkpoints totales | {N} |
| PASS | {N} ({%}) |
| FAIL resueltos | {N} |
| FAIL diferidos | {N} |
| BLOCKED | {N} |
| CAs verificados | {N} / {total} |
| Incidentes totales | {N} |
| Solicitudes de modificacion | {N} |
| Cambios ejecutados | {N} archivos en {N} repos |
| Tiempo total | {HH:MM} |
| Ciclos forenses | {N} |

## 13. Aprobacion

| Rol | Instancia | Aprobacion | Fecha |
|-----|-----------|-----------|-------|
| Director | {nombre} | Aprobado | {fecha} |
| Usuario | {nombre} | Aprobado | {fecha} |
```
