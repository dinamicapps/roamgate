# Validacion experto graduada (fastrak, Pieza 2)

> Aplica en F1 (Paso 7 de fase-7-work-colaborador.md) cuando `autonomia_fastrak.nivel` es `normal` o `maxima`.
> Anfitrion: Atlas (Amelia en cambios simples, segun naturaleza).

## Roster signal-driven (acumulativo, independiente del nivel)

Atlas analiza que tocara la orden de cambio y deriva el roster por `senales_codebase` del
`_registry.yml` activo del repo colaborador:

- toca campo / persistencia -> Dexter
- + mueve permisos / auth -> + Sentinel
- + toca infra / APIs / logica de negocio -> + Winston
- (otras senales -> otros expertos del registry)

<!-- FUENTE: agent-os/experts/_registry.yml seccion senales_codebase. El catalogo de senales->experto vive alli. NO duplicar. -->

## Obligatoriedad por nivel

- `minima`: Atlas consulta a discrecion (comportamiento de hoy).
- `normal`: Atlas DEBE obtener el lente de cada experto signal-matched ANTES de tocar
  codigo (subagentes Patron B; un pase de validacion pre-ejecucion).
- `maxima`: Atlas valida CADA paso con el experto del dominio (validacion incremental).

## Deliberacion party final (desde normal)

Antes de publicar `cambio-ejecutado` al grupo, los expertos invitados deliberan el
resultado en conjunto (party-mode): correcto, completo, sin efectos colaterales. El aval
+ los lentes individuales se documentan en `etapa-1/validacion-experto.md`.

## Garantia dual

A `minima`/`normal`, el actor que autorizo el cambio (Pieza 5) lo recibe reportado y
sabe que se hizo; a `maxima`, la validacion paso-a-paso + la deliberacion garantizan y
documentan el cambio aun sin humano mirando.
