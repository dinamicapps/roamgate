# Checkpoint (Test Case Specification)

> Template basado en ISO/IEC/IEEE 29119-3 Test Case Specification, adaptado para bridge-session.
> Un archivo por checkpoint. Generado por el Director en Fase 2.

---

```markdown
# CP-{NNN}: {titulo descriptivo}

## Identificacion
- **ID:** CP-{NNN}
- **CA asociados:** {lista de CAs del work que este checkpoint valida — funciona como correlation ID}
- **Prioridad:** P1-Critico | P2-Alto | P3-Medio | P4-Bajo
- **Critico:** Si | No {si falla, detiene la sesion}
- **Idempotente:** Si | No {se puede re-ejecutar sin efectos secundarios}
  - Si No: {que hacer para limpiar datos antes de re-ejecutar}

## Responsables
- **Ejecuta:** {instancia que realiza la accion}
- **Verifica:** {instancia que verifica desde su lado}

## Precondiciones
{Estado requerido ANTES de ejecutar. Todo debe cumplirse.}
- [ ] {Sistema X levantado en {URL}}
- [ ] {Checkpoint CP-{NNN-1} completado con PASS}
- [ ] {Dato X existe en BD de sistema Y}
- [ ] {Token/credencial Z disponible}

## Accion (Inputs)
{Paso a paso de lo que la instancia ejecutora debe hacer:}
1. {Paso 1 — ej: Llamar POST /api/pedidos con payload {...}}
2. {Paso 2 — ej: Verificar response status 201}
3. {Paso 3 — ej: Capturar pedido_id del response}

## Resultado esperado
{Que se considera PASS:}
- {Sistema A: response 201 con pedido_id valido}
- {Sistema B: reserva creada con estado "activa" y stock_reservado incrementado}
- {Ambos: sin errores en consola/logs}

## Postcondiciones
{Estado esperado del sistema DESPUES de ejecutar exitosamente:}
- {Sistema A: pedido en estado "reservado"}
- {Sistema B: stock_disponible reducido en la cantidad solicitada}
- {BD de ambos: registros consistentes}

## Evidencia requerida
{Que capturar para documentar el resultado:}
- [ ] Response body del endpoint
- [ ] Log del servidor destino (entrada de la request)
- [ ] Screenshot si hay UI involucrada
- [ ] Query de verificacion en BD: {SQL o endpoint de consulta}

## Edge cases (opcional)
{Variaciones a probar ademas del happy path:}
- Cantidad = 0
- Producto inexistente
- Token expirado
- Sistema destino no responde (timeout)

## Dependencias
- Depende de: {CP-{NNN} — si aplica}
- Bloquea a: {CP-{NNN} — si aplica}

## Notas
{Observaciones relevantes para la ejecucion}
```
