<!-- Plantilla del bloque '## Abordaje (fecha)' que se inserta inline en el README del work-record.
     NO se persiste como archivo separado — esta plantilla solo sirve como referencia para work
     al construir el bloque al cerrar Fase 4 del abordaje. -->

## Abordaje ({YYYY-MM-DD})

### Objetivo

{1-2 lineas con el objetivo entendido del usuario, fruto de Fase 1.}

### Evidencia recolectada

{Lista de bullets, cada uno con cita verificable: path:linea, URL, doc, commit hash.}

- {cita 1}
- {cita 2}
- ...

### Drifts detectados

{Si hubo drift entre lo que dijo el usuario y lo que muestra la evidencia, tabla:}

| Claim del usuario | Evidencia | Resolucion acordada |
|---|---|---|
| {claim} | {evidencia} | {resolucion} |

{Si no hubo drift: "Ninguno."}

### Profundizacion experta

{Si en Fase 2 se invitaron expertos, se activo party mode, o se aplico advanced elicitation:
bloque consolidado con quien aporto que.

Ejemplo:
- I-Sentinel: revision de auth — no detecte riesgos en los endpoints listados.
- Party (Winston + Sally): tension entre arquitectura DI y UX flow resuelta a favor de UX.
- TR-10 aplicada: 0 invariantes-puente ocultos detectados.

Si no aplico: "No fue necesaria. Evidencia suficientemente clara."}

### Pre-requisitos detectados

{Si la ruta probable producira codigo:
- permisos-repo: {documentado | documentado_externo | no_documentado | no_aplica_por_modo | override_usuario}
- test-env.local.json: {presente_v2 | regenerado_en_e0 | pendiente_regenerar | ausente_ok_por_modo}

Si nada aplica: omitir esta seccion.}

### Ruta destilada

**{ruta}**: {razon principal}.

Razon de NO ruta `{otra-1}`: {por que no aplica}.
Razon de NO ruta `{otra-2}`: {por que no aplica}.

### Decision del usuario

{Aprobada / Redirigida a {otra-ruta} / Ajuste de alcance}, {YYYY-MM-DD}.

{Si fue redirigida o ajustada: bullet con la razon del cambio.}
