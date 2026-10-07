---
diseno_slug: {SLUG-DEL-DISEÑO}
brief_version: 1
fecha_aprobacion: null
aprobado_por_usuario: false
hallazgos_aplicados: []
---

# Brief: {titulo del diseño}

> Brief vivo. Cuando un work emite un hallazgo y Mary lo mitiga, este archivo se modifica con marca inline `<!-- HZ-NNN -->` en la linea afectada. Para snapshots limpios, ver `brief.v{N}.md`.

## Resumen ejecutivo

{2-3 parrafos que un PM o stakeholder puede leer en 2 minutos. NO tecnicismo. NO procesos numerados. Lenguaje de producto.}

## Pipeline

Ver `pipeline.md` para el diagrama integrador. Resumen de procesos:

| ID | Proceso | Actor | Trigger |
|----|---------|-------|---------|
| P1 | ... | ... | ... |
| P2 | ... | ... | ... |
| P3 | ... | ... | ... |

## Procesos detallados

Cada proceso tiene su contrato en `procesos/P{n}-{slug}.md`. Aqui solo el resumen.

### P1 — {nombre}

{1 parrafo. Que entrada toma, que reglas aplica, que salida produce. Sin enumeracion exhaustiva — eso esta en el contrato.}

### P2 — {nombre}

...

### P3 — {nombre}

...

## Reglas heredadas globales

{Reglas que aplican a >=2 procesos. Cada regla con fuente. Si una regla aplica a 1 proceso solo, va en el contrato del proceso, no aqui.}

- {Regla 1}: {fuente — modulo X linea Y / standard Z / decision pasada en work W}.
- {Regla 2}: ...

## Reglas nuevas globales

{Idem para reglas nuevas que aplican a >=2 procesos.}

- {Regla 1}: {justificacion}.

## Decisiones arquitectonicas

{ADR ligero. 3-5 decisiones clave con alternativas descartadas. Si Winston fue invitado durante el diseño, sus aportes van aqui.}

- **D-01:** {decision}. Alternativas: {a / b / c}. Razon: {por que la elegida}.

## Restricciones tecnicas

{Limitaciones del modulo huesped que el work consumidor debe respetar. Permisos que vienen del standard. Lock files. Dependencias inyectadas. Etc.}

## Mockups

{Referencias a mockups ASCII o links si se usaron. Si Sally fue invitada en el step de modelado, sus aportes visuales van aqui.}

## Discovery (referencia)

El discovery del diseño (las 5 preguntas con evidencia citada del codebase+DB:
que / como / que-existe-reutilizable-o-mejorable / como-conecta / como-accede)
vive en `modelo.yml`, en los nodos y aristas que las responden. El brief NO lo
duplica — apunta a el. Para leerlo en prosa:
`agentos modelo proyectar --slug {slug} --vista discovery` (es una vista
derivada del modelo, no un archivo del diseño). La pregunta 3 (que existe
reutilizable) es insumo clave de las decisiones de este brief.

{Regimen `lineal` (diseños previos al modelo): el discovery vive en
`discovery.md`, escrito a mano.}

## Capa de seguridad preanunciada

{Lista de endpoints/metodos del codigo que se generara, con su `naturaleza` (restriccion-acceso o modulacion-comportamiento) y `permiso_codigo` propuesto. El work consumidor declara formalmente en su step-03; aqui es solo preanuncio.}

| Endpoint/metodo | Naturaleza | Permiso propuesto |
|-----------------|------------|-------------------|
| {GET /api/X} | restriccion-acceso | AE090 |

## Hallazgos aplicados

{Tabla autoactualizada cuando Mary aplica hallazgos en step-r4. Cada entrada con HZ-NNN, fecha, brief_version resultante.}

| HZ-NNN | Fecha aplicado | Brief version resultante | Resumen |
|--------|----------------|---------------------------|---------|
