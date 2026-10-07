# Casos donde la evidencia requiere observacion previa

> Consumido por la fase 2 del abordaje de Alfred.

Casos donde la evidencia textual es suficiente (default):
- Features acotadas con reusables identificados.
- Fixes focales con bug reproducible y causa identificable por lectura.
- Refactors localizados.
- Investigacion / documentacion.

Casos donde la evidencia requiere observacion previa (`requiere-observacion: true`):
- Pruebas de integracion bilateral contra sistema externo vivo (lo que falla solo se sabe al ejecutar).
- Bug intermitente cuyo trigger no es identificable por lectura del codigo.
- Validacion de contrato externo contra deployment real (drift entre doc y comportamiento).
- Activacion / configuracion productiva contra cliente especifico cuyos datos cambian el resultado.

### Heuristica operativa para work

1. La fase 1 (objetivo) usa palabras como "instrumentar", "observar", "reproducir", "ver que pasa", "validar contra cliente real"? -> senal alta.
2. La evidencia textual de Fase 2 cita codigo que **existe y parece correcto**, pero el usuario reporta que **no funciona contra X especifico**? -> senal alta.
3. El work probable involucrara bridge bilateral con sistema externo en tiempo real? -> senal alta.
4. Hay 2+ ciclos esperados de prueba->fix donde cada ciclo descubre cosas distintas? -> senal alta.

Si >=1 senal alta: declarar `suficiencia_evidencia: requiere-observacion` con razon citada (que senal aplica).

**Anti-patron:** declarar `requiere-observacion` por inseguridad ("no se bien que va a pasar"). La senal es objetiva: la evidencia util aun no existe y se crea con instrumentacion. NO es defensiva.
