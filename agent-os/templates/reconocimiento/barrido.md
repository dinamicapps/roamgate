# Barrido externo: {slug}

Esta tabla la escribe UNICAMENTE `agentos reconocimiento hallazgo add --slug {slug} --tipo {tipo}
--hallazgo "{...}" --url {url} [--presta "{...}"]`, una fila por hallazgo que sobrevive. Nunca se
edita a mano. `id` (`EXT-NNN`) lo deriva el runtime del orden de filas — nunca se recibe por flag.

## Tipos

| Tipo | Que busca |
|---|---|
| competencia | competidores directos, soluciones similares |
| regulatorio | normativa aplicable al dominio |
| tecnico | docs y APIs de sistemas externos |
| dominio | patrones de industria |
| prior-art | proyectos y repos que resuelven lo mismo, y que se puede tomar prestado |

## Hallazgos

| id | tipo | hallazgo | url | presta |
|---|---|---|---|---|
| EXT-001 | prior-art | {una capacidad desagregada — "reintentos con backoff", no "n8n es robusto"} | {URL leida, no de memoria} | {que se toma prestado de esa fuente} |

Regla dura: todo hallazgo se sostiene en una URL **leida** (`read_url` / WebFetch), no en el
titulo de un resultado de busqueda ni en lo que el modelo cree recordar. `NO SE` es salida valida
y preferible a rellenar (MANIFIESTO P8). El barrido no se resume: se desagrega — una capacidad
por fila, nunca un parrafo descriptivo. Una celda de `--hallazgo` que describe mas de una
capacidad esta mal formada: partirla en varias llamadas al verbo.

## No hubo barrido

Cuando no hay herramienta de busqueda disponible en la sesion, este archivo puede quedar sin
crear del todo — un `barrido.md` ausente no es error: son cero hallazgos, no un barrido que
fallo. El desenlace se declara en el README del reconocimiento, no en este archivo:

```
agentos reconocimiento barrido declarar --slug {slug} --ejecutado false \
  --razon "{herramienta de busqueda no disponible en esta sesion}"
```

El menu de esa fase nace entonces del codebase (lo que Fase 2 encontro) y del usuario: ninguna
capacidad lleva `sustento: externo`, y R2, R3 y R4 corren igual — confrontar y cortar en etapas
no dependen del barrido.

Si el barrido si corrio, se declara tambien (`--ejecutado true`), aunque sea despues de la
primera fila.

Fuente operativa completa de esta fase: `agent-os/experts/bmad-agent-alfred/abordaje/fase-3-reconocer.md`.
