# Reporte de Incidente (Test Incident Report)

> Template basado en ISO/IEC/IEEE 29119-3 Test Incident Report, adaptado para bridge-session.
> Uno por fallo encontrado. Generado por la instancia que detecta el fallo en Fase 4.

---

```markdown
# INC-{NNN}: {titulo descriptivo del incidente}

## Identificacion

| Campo | Valor |
|-------|-------|
| ID | INC-{NNN} |
| Checkpoint | CP-{NNN} |
| CA asociado | {CA-NNN - correlation ID} |
| Fecha deteccion | {YYYY-MM-DDTHH:MM} |
| Detectado por | {instancia} |
| Sistema afectado | {nombre del sistema donde se manifesto} |
| Estado | Nuevo | Abierto | En investigacion | Resuelto | Diferido | Cerrado |

## Clasificacion

| Campo | Valor |
|-------|-------|
| Severidad | Critical - bloquea el flujo completo entre sistemas |
|  | High - funcionalidad de integracion no opera pero hay workaround |
|  | Medium - funcionalidad parcialmente afectada |
|  | Low - cosmetico o menor |
| Prioridad | P1-Inmediata | P2-Alta | P3-Media | P4-Baja |
| Tipo | Fallo del work actual | Bug preexistente | Fuera de alcance |
| Reproducible | Siempre | Intermitente | No reproducido |

## Descripcion del incidente

### Que se esperaba
{Resultado esperado del checkpoint - copiado del test case}

### Que ocurrio
{Resultado real observado - solo hechos, sin diagnostico}

### Pasos para reproducir
1. {Paso 1}
2. {Paso 2}
3. {Paso 3}

### Impacto
{Que funcionalidad queda afectada. Que usuarios/flujos no pueden operar.}

## Evidencia

### Evidencia del sistema que detecto
- {Stack trace / error message}
- {Response HTTP: status {code}, body: {contenido}}
- {Screenshot: {referencia a archivo o adjunto bridge}}
- {Network request: {metodo} {url} ->  {status}}

### Evidencia forense (Fase 4 protocolo forense)
- **Logs instrumentados por:** {instancia destino}
- **Log en {archivo}:{linea}:** {variable} = {valor} (esperado: {valor esperado})
- **Log en {archivo}:{linea}:** {descripcion de lo observado}
- **Causa raiz identificada:** {descripcion factual basada en logs}

### Evidencia del otro sistema (si aplica)
- {Lo que la otra instancia reporto al bridge}

## Resolucion

| Campo | Valor |
|-------|-------|
| Resuelto por | {instancia} |
| Fecha resolucion | {YYYY-MM-DDTHH:MM} |
| Solicitud de modificacion | {ID del bridge - si se uso solicitud-modificacion} |
| Cambio ejecutado | {ID del bridge - si se publico cambio-ejecutado} |

### Descripcion de la solucion
{Que se hizo para resolver}

### Archivos modificados
| Archivo | Repo | Cambio |
|---------|------|--------|
| {archivo} | {repo} | {descripcion del cambio} |

### Verificacion post-fix
- Checkpoint CP-{NNN} re-ejecutado: PASS | FAIL
- Logs forenses removidos: Si | No
- Build verifica: Si | No

## Negative provenance (que NO paso)
{Si aplica: que debio pasar y no paso}
- {ej: "El request nunca llego al endpoint /api/reservas - el log en server.ts:45 no muestra actividad"}
- {ej: "El evento de stock_reservado no se emitio - el listener en StockService.ts:120 no se activo"}
```
