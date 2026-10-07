---
id: {R-NNN}
origen:
  norma: "{id-norma en fuentes[]}"
  ancla: "{Art.X / Anexo Y / Sección Z}"
enunciado: "{qué exige la norma, en una frase verificable}"
nacido_en_version: {N}
derogado_en_version: null
estado_gap: no_evaluado     # no_evaluado | ausente | parcial | cubierto
severidad: medio            # critico | alto | medio | bajo
accion: null                # qué hacer para cerrar el gap (ej. "agregar columna X a tabla Y")
estado_revision: vigente    # vigente | requiere_revision | derogado
trazas:
  disenos: []
  works: []
  tests: []
---

# {R-NNN}: {título corto del requisito}

## Enunciado detallado

{Desglose del requisito: qué exige exactamente, con cita textual a la norma.}

## Gap analysis (repo + BD)

{Evidencia de brecha: qué tiene el sistema hoy (cita `archivo:linea` / `tabla.columna`),
qué falta, severidad. Dexter aporta la dimensión BD; Sentinel la de seguridad si aplica.}
