# Ruta: bugfix

> Bugfix focal. Sabueso: **Atlas**. Sub-flow propio (no usa piezas/plan.md): investigacion -> conversacion -> ejecucion+verificacion.

## Cuando aplica

El abordaje destilo: bug identificable en 1-3 archivos, comportamiento erroneo, no agrega capacidad nueva.

## Sub-flow

```
abordaje (ya hecho)
   |
   investigacion.md          (Atlas forense multidimensional; Dexter invitado para prod; Cipher para material criptografico;
   |                          produce DIAGNOSTICO DE RAIZ o "no concluyente -> seguimiento")
   |
   conversacion.md           (Atlas <-> usuario; CLASIFICA el desenlace; replanteo dispara promocion)
   |
   ejecucion-verificacion.md (accion por desenlace; gate: desenlace declarado antes de cerrar)
```

## Anfitrion

Atlas conduce las tres etapas con prefijo `A-Atlas:`. Es el unico anfitrion de la ruta bugfix; no hay handoff entre expertos (a diferencia de `acotado`/`diseno`). Quinn, Sentinel y Cipher entran solo como filtros opt-in en la ultima etapa.

## Work-record

Se crea desde la plantilla bugfix (`agent-os/templates/work-record/bugfix/`), frontmatter `ruta: bugfix`. Slug `{YYYYMMDD}-bugfix-{slug-corto}`.

## Promocion a diseno

Si en `conversacion.md` Atlas detecta que el fix excedio scope focal, ofrece promover a ruta `diseno` (la investigacion ya hecha se inyecta como bootstrap). Ver `conversacion.md` y `piezas/reevaluacion.md` (fila `bugfix`). La promocion tambien se dispara cuando el diagnostico forense determina que el arreglo de fondo es de proceso (desenlace `replanteo`), no solo por scope excedido.

## Puente de escalada entre rutas (G6)

Cada ruta forense conserva su propio criterio de "esto es demasiado grande" — no se fusionan (miden cosas distintas). El puente de promoción:

- **bugfix → diseño:** cuando la forense concluye `desenlace: replanteo` (el arreglo correcto es replantear el proceso, no parchear), el work promueve a `diseno`. Criterio propio de bugfix: calidad del diagnóstico ("parche superficial") + scope (>3 módulos / >3 actores / deja de ser bug).
- **hotfix → bugfix o diseño:** cuando un incidente deja de ser acotado (ver los Hard Stops de la ruta `hotfix`), promueve a `bugfix` (si es un bug focal reproducible ya sin urgencia) o a `diseno` (si requiere modelado). Criterio propio de hotfix: acumulación de frentes.

Ver el criterio de la otra ruta: `agent-os/experts/bmad-agent-alfred/rutas/hotfix/` (Hard Stops / freno reflexivo).
