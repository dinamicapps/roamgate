# Ruta rediseno-ui — Fase 4: Cierre

> Gobierno del cierre: Alfred (`S-sistema:`, transicion estructural del protocolo — no es anfitrion). Sally destila al estándar. Dos estados posibles: `COMPLETADO` o `COMPLETADO_CON_BRECHA`.

## Mision

Cerrar el work-record con estado declarado, registrar las brechas si las hay, y convertir lo aprendido en capital reutilizable: Sally destila los patrones y antipatrones del trabajo al estándar de frontend, para que la próxima vista del mismo tipo no empiece desde cero.

## Gobierno del cierre

Alfred gobierna el cierre con prefijo `S-sistema:` — gobierna la transicion del protocolo, no encarna una persona-experto. No rediseña ni implementa — solo ejecuta el protocolo de cierre del runtime y coordina la destilación. Sally destila al estándar al final.

## Pre-condiciones de cierre

Antes de iniciar el cierre, Alfred verifica:

- La fase 3 cerró sin hallazgos bloqueantes pendientes (Quinn lo confirmó).
- Todos los hitos están registrados en `## Hitos` del README con sus commits.
- Si `toca_backend: true`: **Dexter** confirmó que la sección `## Contrato de datos` refleja el estado final implementado (es quien la mapeó en la fase 1). Alfred no compara el artefacto contra el codigo: registra la confirmacion.
- **Sally** confirmó que `etapa-1/01-patron-diseno.md` refleja el patrón tal como quedó (incluyendo variantes o ajustes de la iteración).

Si alguna pre-condición falla, Alfred no cierra: informa a Sally y al usuario lo que falta.

## Estado del cierre

Alfred declara uno de dos estados:

### COMPLETADO

Todas las vistas/componentes planificados fueron implementados, verificados y aprobados sin brechas relevantes. La metodología Atomic Design + BEM + tokens se aplicó de forma consistente.

Alfred puebla `## Cierre` en el README:

```markdown
## Cierre

COMPLETADO el {fecha}. {1 frase: lo que se implementó y el criterio de calidad cumplido}.
```

### COMPLETADO_CON_BRECHA

Una o más brechas fueron declaradas y aceptadas por el usuario: vistas fuera de scope, deuda CSS aceptada, hitos diferidos. El work cierra igualmente, pero las brechas quedan registradas para seguimiento.

Alfred puebla `## Cierre` en el README y el campo `brechas_aceptadas` en el frontmatter:

```markdown
## Cierre

COMPLETADO_CON_BRECHA el {fecha}. {1 frase del resultado general}.

### Brechas aceptadas

| Brecha | Motivo de aceptacion | Capas futuras |
|---|---|---|
| {descripcion de la brecha} | {por qué se acepta ahora} | {work o epica para resolverla} |
```

El campo frontmatter `brechas_aceptadas` se actualiza vía runtime. `work set-fm` recibe
un fragmento JSON por `--input <archivo>` o stdin (NO tiene flags `--campo/--valor`):

```
# escribir el fragmento al scratchpad de la sesión, p.ej. brechas.json:
#   {"brechas_aceptadas": "{resumen de las brechas de la tabla}"}
agentos work set-fm --slug {slug} --input {ruta-scratchpad}/brechas.json
```

## Cierre via runtime

Alfred ejecuta el cierre estructural via runtime, NO editando el archivo a mano:

```
agentos work close --slug {slug} --estado COMPLETADO
```

o

```
agentos work close --slug {slug} --estado COMPLETADO_CON_BRECHA
```

El binario archiva la carpeta, actualiza catálogos y registra `fecha_fin`. Alfred no escribe `estado` ni `fecha_fin` directamente al frontmatter.

## Destilacion al estandar (Sally)

Después de que el runtime confirma el cierre, Alfred pasa la palabra a Sally para destilar lo aprendido. Sally invoca `documentar-standard-frontend.md` (REF→ `agent-os/experts/bmad-agent-sally/references/documentar-standard-frontend.md`) para:

1. **Identificar patrones nuevos o confirmados** — si en el trabajo se definió o validó un patrón de tipo de pieza que no estaba cubierto (o estaba cubierto de forma ambigua) en el catálogo, documentarlo en el catálogo de patrones de frontend del standard instalado (`agent-os/standards/frontend/catalogo-patrones-frontend.md`) como sección nueva o variante.

2. **Documentar antipatrones observados** — si el trabajo encontró CSS in-line, componentes duplicados, orígenes de listas hardcodeados u otras deudas que viola el estándar, registrarlas en la sección `## Antipatrones observados en producción` del catálogo con: síntoma observable, causa técnica, por qué duele, y el patrón correcto.

3. **Aplicar anti-mentira** — no documentar patrones sin evidencia de uso real en este trabajo. Cada entrada lleva referencia al slug del work-record (`creado_por_work`). Si el patrón solo se usó en un lugar, se registra como candidato diferido (`estado_destilado: diferido`) hasta que aparezca en un segundo trabajo del mismo tipo.

4. **Si se propone agregar al catálogo un patrón definido en la fase 1** — Sally pregunta al usuario si persiste formalmente (la decisión es del usuario, no de Sally). La declaración local en `etapa-1/01-patron-diseno.md` persiste siempre.

Sally publica el resumen de destilación:

```
A-Sally: Destilacion completa.

Patrones documentados en el catalogo: {N} (o "ninguno nuevo").
Antipatrones registrados: {N}.
Candidatos diferidos: {N} (en espera de segundo uso).

Standard actualizado: agent-os/standards/frontend/catalogo-patrones-frontend.md
```

## Anuncio de cierre (Alfred)

Alfred anuncia el cierre estructural sin ofrecer pasos futuros no solicitados (anti-patrón del cierre con expansión):

```
S-sistema: Work {slug} cerrado como {COMPLETADO | COMPLETADO_CON_BRECHA}.

Hitos: {N}.
Vistas/componentes: {lista corta}.
Brechas aceptadas: {ninguna | lista corta}.
Destilacion: {resumen de Sally en 1 linea}.
```

## Prohibiciones

- Alfred: NO cerrar si las pre-condiciones de cierre no se cumplen.
- Alfred: NO escribir `estado` ni `fecha_fin` directamente al frontmatter — usar el runtime.
- Alfred: NO ofrecer pasos futuros no solicitados al anunciar el cierre (anti-patrón del cierre con expansión).
- Sally: NO documentar patrones sin evidencia de uso real en este trabajo (anti-mentira).
- Sally: NO documentar un patrón como estándar formal si solo se usó en un lugar — usar `estado_destilado: diferido`.

<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work (campo `Estado` en README.md)". Estados COMPLETADO y COMPLETADO_CON_BRECHA. NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Anti-patron del cierre con expansion". NO duplicar -- editar la fuente. -->
