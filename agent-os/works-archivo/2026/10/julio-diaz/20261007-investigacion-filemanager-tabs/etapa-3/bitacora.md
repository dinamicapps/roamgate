# Bitacora Etapa 3

## Desvios y drifts

- [DESVIO] Ruta de entregables: el protocolo de E3 (modo investigacion) sugiere `etapa-3/investigacion/`; el plan aprobado (D2 de `etapa-2/03-plan.md`) usa `etapa-3/frentes/`. Se mantiene lo aprobado.
- [DRIFT] Abordaje: `store.ts:2232` se describio como push+poll; el push es `handleHerdrEvent` (`store.ts:2212`) que solo agenda refresh, y el poll de 5s (`store.ts:1539`) es respaldo. Corregido en T-F2a (T-002). El bloque `## Abordaje` del README no se reescribe.
- [DRIFT] Abordaje: algunas lineas citadas se desplazaron (p. ej. estado cerrado del slot en `app.css:767-768`). Corregidas en T-001.

## Ola 1 (T-001, T-002, T-004)

- T-004: Herdr publico (github.com/herdrdev/herdr, Apache-2.0); sin punto de extension para tabs no-terminal en protocolo 22 / plugin v1. Roamgate fija Herdr 0.9.0; ultimo release v0.9.3 (dos afirmaciones por-definir).
- T-002: 112 citas ok. Sin evento de movimiento de tab en la suscripcion; reorden remoto llega por poll.
- T-001: 219 citas ok. Hipotesis sobre posicionamiento del menu contextual bajo container-type: size.

## Ola 3 (T-005, T-006, T-007)

- T-005: A1 L/L (solo cliente, >5 modulos); riesgo tab.close con Files activo cierra tab oculto.
- T-007: B mover L, coexistir M (sensible a L por foco compartido); supuestos S1/S2 por confirmar.
- T-006: A2 no-estimable/no-estimable.
- [CONFLICTO] T-002 a12.1 vs T-006 tab.moved: reconciliar en T-008.
- [CONFLICTO] Boton Terminal mobile (T-001 cierra Inspector vs T-006 mobileView=session): reconciliar en T-008.

## Ola 4 (T-008)

- T-008: insumo consolidado publicado. Recomendacion B mover; primer paso N1 (extraer bloque Files del host a componente montable).
- Conflictos: tab.moved compatible (Herdr lo declara, Roamgate no lo suscribe; FA-5); boton Terminal mobile compatible (activateTerminalSurface hace ambas cosas, App.tsx:1645-1650).
- [NOTA E4] citas verificar valida existencia de linea, no que sostenga la afirmacion; muestrear contenido.

## Cierre de E4

- [OVERRIDE] Q-1..Q-3 (MENOR, de la re-verificacion vuelta 2 de 2) corregidos en texto sin nueva verificacion independiente, por decision del usuario (tope de 2 vueltas alcanzado). Q-1: B mover con DP-B2=a tambien cuenta como cambio del foco compartido cuando panel e Inspector conviven; sin efecto en talla. Q-2: SN-4 a DP-1..DP-6. Q-3: C16 y K7 de T-005 reflejan DP-6=b.
- N-1..N-5 corregidos y re-verificados (vuelta 2 de 2: 10/10 PASS, 12/12 citas congruentes).
