# Schema de frontmatter — Cosecha post-cierre

> Fragmento de `frontmatter-schema.md` (ver indice). El bloque `cosecha{}` de 5 capas y los campos de aprendizaje deprecados que reemplazo.

## Cosecha post-cierre (5 capas)

Aplicable al README.md del work-record cuando el work esta `COMPLETADO` y se ejecutan comandos de cosecha con flag `--desde-work {slug}`. El bloque `cosecha{}` registra que capas ya fueron cosechadas, permitiendo que Quinn al cierre, `/alfred maintain`, y los propios comandos auditen consistentemente sin descubrir.

<!-- El marcado de cada capa lo gobierna `agentos learn marcar --slug {slug} --capa {capa}` (runtime), que valida que los artefactos declarados existan en disco (anti-mentira) y fija ejecutado/fecha/por. La forma del bloque se documenta aqui (fuente unica); el verbo que la escribe vive en el runtime. -->
<!-- El backlog de works sin cosechar lo lista `agentos learn pendientes`; `meta doctor` reporta `works_sin_cosechar`. -->


```yaml
cosecha:
  producto:
    ejecutado: true | false
    fecha: "YYYY-MM-DD" | null
    por: "string (dev-name)" | null
    artefactos_actualizados: ["agent-os/product/roadmap/EP-NNN/README.md", ...]
    nota: "string corta opcional con resumen de cambios"
  specs:
    ejecutado: true | false
    fecha: "YYYY-MM-DD" | null
    por: "string" | null
    specs_creadas_o_actualizadas: ["agent-os/specs/{modulo}/{spec}.md", ...]
    nota: "string opcional"
  standards:
    ejecutado: true | false
    fecha: "YYYY-MM-DD" | null
    por: "string" | null
    standards_generados: ["agent-os/standards/{dominio}/{tema}.md", ...]
    candidatas_descartadas: int  # detectadas pero saltadas/diferidas
    nota: "string opcional"
  documentacion:
    ejecutado: true | false
    fecha: "YYYY-MM-DD" | null
    por: "string" | null
    archivos_actualizados: [".documentacion/02-dominios-negocio/{modulo}/{archivo}.md", ...]
    nota: "string opcional"
  memoria_expertos:
    ejecutado: true | false
    fecha: "YYYY-MM-DD" | null
    por: "string" | null
    expertos_alimentados: ["amelia", "atlas", ...]
    entries_agregadas: int  # total a través de todos los expertos
    reflexion_depositada: true | false   # NUEVO: si los agentes depositaron su reflexion-adn al cerrar
    reflexiones_por_agente: int          # NUEVO: total de entradas de reflexion verificada de este work
    nota: "string opcional"
```

### Exencion de cosecha (cosecha_exenta)

Campo top-level opcional, hermano de `cosecha{}`. Marca un work como exento de cosecha por decision del usuario. Lo gobierna `agentos learn omitir`. Un work exento queda **totalmente invisible** en `agentos learn pendientes` y en `meta doctor` (no se lista ni se cuenta) — no es borrado, es una decision trazable.

```yaml
cosecha_exenta:
  valor: true               # bool -- true = exento de cosecha
  razon: "string"           # obligatorio -- por que no se cosecha
  fecha: "YYYY-MM-DD"       # fijado por el runtime al omitir
  por: "dev-kebab"          # quien decidio (autor_kebab por defecto)
```

Ausencia del campo = work cosechable normal. Reversible con `agentos learn omitir --slug {slug} --deshacer` (elimina el campo). La exencion afecta solo las estadisticas; `learn marcar`/`learn validar-candidato` siguen operando sobre un work exento si el usuario lo pide.

### Semantica de cada flag

- **Ausente o todos `false`:** el work nunca fue cosechado. Quinn al cierre sugiere los 5 comandos. `/alfred maintain auditar-cosecha` lo lista como pendiente completo.
- **Algunos `true`, otros `false`:** cosecha parcial. Quinn lista solo las capas faltantes.
- **Todos `true`:** cosecha completa. `/alfred maintain` valida consistencia (que los archivos referenciados en `artefactos_actualizados[]` / `specs_creadas_o_actualizadas[]` / etc. existan en disco).
- **Re-ejecucion:** si el usuario re-ejecuta un comando `--desde-work` sobre un work ya cosechado en esa capa, los campos acumulan: `fecha` se actualiza a la ultima, listas mergean sin duplicados, `nota` se reemplaza con la ultima.
- **`reflexion_depositada`:** marca que cada agente participante deposito su entrada de reflexion verificada (buffer a ADN) al cerrar. Independiente de `ejecutado` (que es la cosecha de memoria viva). Un work puede tener reflexion depositada sin haber corrido `consolidar-reflexiones` (el buffer se acumula). <!-- FUENTE: agent-os/experts/bmad-agent-alfred/references/reflexion-adn.md. La doctrina completa de la reflexion vive ahi. -->

### Quien actualiza

Cada uno de los 5 comandos al completar exitosamente actualiza su capa correspondiente:

| Comando | Capa que actualiza |
|---|---|
| `/plan-product --desde-work {slug}` | `cosecha.producto` |
| `/discover-specs --desde-work {slug}` | `cosecha.specs` |
| `/discover-standards --desde-work {slug}` | `cosecha.standards` |
| `/documentar consolidar {modulo} --desde-work {slug}` | `cosecha.documentacion` |
| `/alfred learn {slug}` | `cosecha.memoria_expertos` |

NO se modifican manualmente en condiciones normales.

### Quien consume

- **Quinn al cierre del work:** lee `cosecha{}` y muestra checklist `[x]`/`[ ]` por capa. Solo lista comandos pendientes.
- **`/alfred maintain auditar-cosecha [{work-id}]`:** lista works `COMPLETADO` con `cosecha` parcial o ausente. Detecta inconsistencias (capas con `ejecutado: true` cuyos archivos referenciados no existen).
- **Cada comando `--desde-work`:** antes de ejecutar, lee si su capa ya tiene `ejecutado: true`. Si si, AskUserQuestion: re-ejecutar (acumula) o saltar.
- **`/alfred continuar` y `/alfred estado`:** muestran resumen de cosecha si el work esta `COMPLETADO`.

### Migracion de works pre-spec

Works `COMPLETADO` antes de este spec NO tienen el bloque `cosecha{}`. Comportamiento:

- `/alfred maintain auditar-cosecha` los reporta como "cosecha desconocida" (no como pendiente).
- Si el usuario ejecuta un comando `--desde-work {slug-legacy}` sobre uno de esos works, el comando **crea** el bloque `cosecha{}` con su capa especifica `ejecutado: true` y las otras 4 ausentes.
- Migracion explicita NO requerida. Cero migracion forzosa.

### Compatibilidad con bloques viejos

Los bloques `aprendizaje_*` (seccion "Campos de aprendizaje en _catalogo.yml" mas abajo) y `convenciones_destiladas_*` se eliminan en favor del nuevo `cosecha{}`. Equivalencias:

| Bloque viejo | Equivalente nuevo |
|---|---|
| `aprendizaje_extraido` | `cosecha.memoria_expertos.ejecutado` |
| `aprendizaje_fecha` | `cosecha.memoria_expertos.fecha` |
| `aprendizaje_por` | `cosecha.memoria_expertos.por` |
| `convenciones_destiladas_retroactivamente` | `cosecha.standards.ejecutado` |
| `convenciones_destiladas_retroactivamente_fecha` | `cosecha.standards.fecha` |
| `convenciones_destiladas_retroactivamente_por` | `cosecha.standards.por` |
| `standards_generados_retroactivamente[]` | `cosecha.standards.standards_generados[]` |
| `destilado_retroactivo_decisiones[]` | `cosecha.standards.candidatas_descartadas` (int) + `nota` |
| `convenciones_destiladas_retroactivamente_resultado.{candidatas_detectadas, destiladas, saltadas, diferidas}` | `cosecha.standards.candidatas_descartadas` (int) |

Works pre-spec con bloques viejos: el schema documenta los dos formatos por compatibilidad historica; los comandos nuevos leen `cosecha{}` si existe, caen al bloque viejo si no.


## Campos de aprendizaje en _catalogo.yml (DEPRECATED — usar `cosecha{}` en README)

**Estos campos quedaron obsoletos con el bloque `cosecha{}` (seccion "Cosecha post-cierre (5 capas)" arriba).**

Works pre-spec siguen usando los campos viejos en `_catalogo.yml`. Works nuevos NO los escriben — `cosecha.memoria_expertos.ejecutado` cumple la misma funcion en el README del work, no en el catalogo.

Equivalencia de auditoria: `_catalogo.yml` ya NO contiene flags de aprendizaje. Para auditar memoria de expertos extraida, leer `cosecha.memoria_expertos.ejecutado` del README de cada work.

## Purga de memoria del experto (retirados y reconciliados)

> Distinto de `cosecha.memoria_expertos` (arriba): ese bloque vive en el README del work y registra si un work fue cosechado hacia la memoria de un experto. Esta seccion describe los libros-mayor del **sidecar de memoria del experto** (`_bmad/memory/{experto}-sidecar/`), que registran que se jubilo o se dio por compatible durante `/alfred learn consolidar`. Fuente unica de estos cuatro schemas: otros documentos (`learn.md`, `memory-system.md`) apuntan aqui, no los redefinen.

El sidecar separa cuerpo cognitivo de libro-mayor maquina: `patterns.md` (y para Dexter `normas-tacitas.md`/`derivas/`) es markdown rico de formato libre, propiedad de la cognicion — la reescribe al consolidar y remueve ella misma la entrada caduca. `retirados.md` y `reconciliados.md` son los unicos artefactos que el runtime lee/escribe; ninguno de los dos carga en `On Activation`.

### Lapida (retirados.md)

Libro-mayor MAQUINA, gestionado por `agentos learn retirar`. NO carga al activar. Cumple doble funcion: historico de lo jubilado y lista de supresion (`learn consolidar` no resucita una entrada con lapida; una reintroduccion pasa a la lista de conflictos del humano).

```yaml
- heuristica: "$mdDialog sin controllerAs"
  jubilada: "2026-07-10"
  por_work: "nova-consolidacion-galeria/W-04"   # {slug}/W-NN | {slug}/T-NNN | "standard/{ruta}" | "consolidacion-manual/{fecha}"
  reemplazada_por: "componente con controllerAs + bindings"   # o "ninguno (patron eliminado)"
  evidencia: "nova-consolidacion-galeria/T-012"   # ancla navegable (exenta si por_work es consolidacion-manual/)
  razon: "migracion UI nova retiro el patron"
```

Campos, todos obligatorios salvo lo indicado:
- **`heuristica`**: texto de la entrada jubilada, tal como vivia en el cuerpo activo.
- **`jubilada`**: fecha `YYYY-MM-DD` del retiro (la inyecta el verbo si viene ausente).
- **`por_work`**: origen del retiro, una de cuatro formas — `{slug}/W-NN` (work completo), `{slug}/T-NNN` (tarea puntual), `"standard/{ruta}"` (disparador B, standard fresco superó la memoria), `"consolidacion-manual/{fecha}"` (jubilacion manual del humano, sin work de por medio).
- **`reemplazada_por`**: heuristica entrante que la supera, o `"ninguno (patron eliminado)"` si no hay reemplazo.
- **`evidencia`**: ancla navegable (`{slug}/T-NNN` | `{slug}/W-NN` | `"standard/{ruta}"`) del disparador que motivo el retiro. Exenta unicamente cuando `por_work` empieza con `consolidacion-manual/`.
- **`razon`**: explicacion corta en prosa de por que se jubilo.

### Par reconciliado (reconciliados.md)

Libro-mayor MAQUINA, gestionado por `agentos learn reconciliar`. NO carga al activar. Registra que una entrada del cuerpo activo y un standard fueron dirimidos como **compatibles**, para que el disparador B (memoria vs standard) no vuelva a molestar con el mismo par.

```yaml
- entrada: "usar X para Y"
  standard: "agent-os/standards/frontend/nova.md"
  consolidacion_v: 3
  fecha: "2026-07-10"
  razon: "compatibles: el standard permite X"
```

Campos:
- **`entrada`**: texto de la entrada dirimida como compatible. **Contrato de union con retirados:** debe portar el texto VERBATIM de la entrada tal como vive en `patterns.md` (el mismo string que luego sera `heuristica` en la lapida), porque la purga de huerfanos que corre `agentos learn retirar` une `reconciliados.md` con la lapida por igualdad exacta de ese texto; si la entrada se reformula en `patterns.md` entre consolidaciones, la purga no la alcanza (queda una fila huerfana en `reconciliados.md`, sin corrupcion).
- **`standard`**: ruta del standard contra el que se dirimio; el runtime valida que exista en disco.
- **`consolidacion_v`**: caller-supplied, opcional — el runtime no la valida.
- **`fecha`**: inyectada por el runtime (`agentos learn reconciliar` la sobrescribe siempre con la fecha de hoy; no la fija el caller).
- **`razon`**: explicacion corta en prosa de por que se considero compatible.

**Invalidacion:** un par reconciliado se invalida si el standard cambia despues de la reconciliacion (git-date del standard > `fecha` del par) — en ese caso el disparador B vuelve a confrontarlo en la proxima consolidacion.

**Nota de trade-off:** la invalidacion es por git-date del **archivo entero** del standard, no por seccion. Un edit cosmetico en cualquier parte del standard re-superficializa pares que seguian siendo validos. Aceptado como YAGNI para esta fase; un upgrade futuro (hash por seccion) es posible si el ruido resulta costoso en la practica.

### Campos nuevos de la entry de learnings.md

Toda entry nueva en `devs/{dev}/learnings.md` (el buffer de extraccion por dev) agrega dos campos que la conectan con su origen y su evidencia, habilitando que un retiro posterior cite un ancla real:

- **`origen_work`**: slug/W-NN del work del que se extrajo el aprendizaje.
- **`evidencia`**: ancla navegable (`{slug}/T-NNN` tipicamente) al punto exacto del work que sustenta la heuristica.

```yaml
- heuristica: "componente con controllerAs + bindings para dialogos"
  categoria: "heuristica-privada"
  origen_work: "nova-consolidacion-galeria/W-04"
  evidencia: "nova-consolidacion-galeria/T-012"
```

### Registro de retiros en index.md del sidecar

El log de consolidacion del sidecar (`index.md`, carga al activar) versiona cada corrida de `/alfred learn consolidar` con adiciones y retiros, desglosados por disparador:

```
consolidacion vN (fecha): +A adiciones, -R retiros (Ra por-work, Rb por-standard, Rm manual)
```

Donde `Ra` son retiros con `por_work` en forma `{slug}/W-NN` o `{slug}/T-NNN`, `Rb` son retiros con `por_work: "standard/{ruta}"`, y `Rm` son jubilaciones manuales (`por_work: "consolidacion-manual/{fecha}"`). Este registro es distinto de `cosecha.memoria_expertos` en el README del work (que marca si UN work fue cosechado); este vive en el sidecar y acumula TODAS las corridas de consolidacion del experto.

### Honestidad del anti-mentira (forma, no veracidad)

El anti-mentira del runtime (`agentos learn retirar`) valida **forma**: que la lapida traiga los campos obligatorios, que `evidencia` tenga forma de ancla valida, y que la `heuristica` no tenga ya una lapida previa (guard anti-doble-lapida). **NO valida que la cita sea cierta** — no confirma que la entrada realmente vivia en el cuerpo activo ni que el ancla describe fielmente lo que paso en el work. El humano que consolida es el verificador de esa veracidad; el runtime es solo el guardian de la forma.

