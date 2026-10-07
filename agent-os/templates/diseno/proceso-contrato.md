---
proceso_id: P{N}
diseno_slug: {SLUG-DEL-DISEÑO}
nombre: "{nombre corto}"
actor: "{quien ejecuta}"
trigger: "{cuando se ejecuta}"
modulo_huesped: "{ruta en codebase}"
hallazgos_aplicados: []
---

# Proceso P{N} — {nombre}

<!-- nodo: {id-del-nodo-proceso-en-el-modelo} -->
{La narrativa del proceso: que problema resuelve, por que se decidio asi, que
alternativas hubo. El archivo entero es de este proceso -- su frontmatter ya lo
dice con `proceso_id` -- y este marcador lo declara tambien en el modelo, que es
donde el chequeo lo busca.}

{**Ojo: el id del marcador NO es el `proceso_id` del frontmatter.** Son dos
identificadores distintos que conviven en este archivo: `proceso_id` numera los
procesos del diseño (P1, P2...), y el id del nodo es el que quien emite le puso al
nodo `proceso` en `modelo.yml` -- del tipo `PRO_solicitar_insumo`. Poner aqui el
`proceso_id` deja un ancla muerta que `PROSA_SIN_NODO` reclama. Copiarlo del modelo,
no del frontmatter de arriba.}

> **Bloques proyectados.** Lo delimitado por `<!-- modelo:start vista=X -->` y
> `<!-- modelo:end -->` se regenera desde el modelo; lo de afuera se escribe a mano y
> sobrevive. Un bloque por vista y por archivo. Si un marcador queda huerfano (start sin
> end, o al reves) o duplicado, el anfitrion **no escribe** y lo reporta: un reemplazo a
> ciegas sobre un delimitador roto se come prosa que los marcadores existen para proteger.

<!-- FUENTE: ./schema/modelo.md seccion "Contexto de llegada". La definicion de contexto de llegada y sus 3 componentes vive alli; el bloque proyectado abajo instancia el tramo que aplica a ESTE proceso, dentro de "Llegada del actor". NO duplicar la regla — para modificar, editar la fuente. -->

<!-- modelo:start vista=contrato -->
<!-- Se proyecta con `agentos modelo proyectar --slug {slug} --vista contrato --proceso {id}`.
     No editar a mano. La capa de seguridad preanunciada y los hallazgos aplicados
     quedan FUERA y son del anfitrion. -->
<!-- modelo:end -->

## Justificacion de las reglas nuevas

{Un bloque por cada regla que el bloque proyectado lista bajo "Nuevas". El enunciado
sale del modelo; el porque NO cabe en un campo y vive aqui, fuera de los marcadores
proyectados, donde sobrevive a cada regeneracion.}

<!-- nodo: {id-de-la-regla} -->
**{REG_xxx}** — {por que se necesita} {que problema resuelve} {que alternativa hubo}.

## Capa de seguridad preanunciada

| Endpoint/metodo previsto | Naturaleza | Decision permiso | Permiso codigo |
|--------------------------|------------|-------------------|-----------------|
| {endpoint que el work creara} | {restriccion-acceso \| modulacion-comportamiento} | {reutilizar \| nuevo} | {AE090 \| nuevo: BS-XXX} |

## Hallazgos aplicados a este proceso

{Tabla autoactualizada cuando Mary aplica hallazgos relacionados con este proceso.}

| HZ-NNN | Fecha | Cambio aplicado |
|--------|-------|-----------------|
