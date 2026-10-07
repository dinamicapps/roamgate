---
grupo_nombre: "{NOMBRE_GRUPO}"
id_bridge: "{UUID_GRUPO_BRIDGE}"
work_contenedor: "{NOMBRE_WORK}"
fecha_creacion: "{YYYY-MM-DD}"
etapa_que_lo_creo: "{0|1|2|3|4}"
estado_grupo: exploracion
listo_para_alimentar_cas: false
---

# Grupo bridge: {NOMBRE_GRUPO}

## Participantes

Ver `participantes.md`.

## Objetivo del grupo

{DESCRIPCION_CORTA_OBJETIVO}

## Estado actual

- **Estado:** exploracion
- **Fecha creacion:** {YYYY-MM-DD}
- **Etapa del work que lo creo:** {N}

## Checklist listo-para-alimentar-CAs (hibrido, saltable con justificacion)

- [ ] Endpoints identificados y contactabilidad verificada (ver `endpoints.md`).
- [ ] Contrato borrador por cada endpoint relevante (ver `contratos/borradores/`).
- [ ] Al menos un smoke end-to-end realizado (ver `sesiones/` o `bitacora.md`).
- [ ] Hallazgos bloqueantes resueltos o documentados como deuda (ver `hallazgos/bloqueantes.md`).

Cuando los 4 items pasen (o se justifique saltarlos), cambiar `listo_para_alimentar_cas: true` y `estado_grupo: acordado`, y emitir `manifiesto.yml` v2.

### Justificaciones para items saltados

(Si se salta algun item, anotar aqui con fecha y razon)

## Sesiones de prueba ejecutadas

| Fecha | Nombre | Resultado | Reporte |
|-------|--------|-----------|---------|

## Contratos referenciados por este grupo

| Endpoint logico | Sistema destino | Version actual en repo | Version en discusion |
|-----------------|-----------------|-------------------------|----------------------|

## Indice de archivos

- `manifiesto.yml` - manifiesto versionado del grupo
- `participantes.md` - rol, alcance, restricciones de cada participante
- `endpoints.md` - endpoints identificados con nombre logico
- `descubrimientos.md` - hallazgos conjuntos no clasificados como bloqueantes ni propuestas
- `bitacora.md` - dialogo del grupo con cross-ref a CA-NNN / T-NNN
- `hallazgos/bloqueantes.md` - hallazgos que impiden continuar (resolver en sesion)
- `hallazgos/propuestas.md` - hallazgos no bloqueantes (usuario decide)
- `contratos/borradores/` - contratos en discusion
- `contratos/acordados/` - contratos firmados por participantes
- `correcciones-aplicadas.md` - cambios de codigo aplicados a raiz del grupo
- `evidencia/` - evidencia de sesiones de prueba
- `sesiones/` - una carpeta por sesion de prueba
