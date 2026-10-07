# Evidencia de verificacion — Etapa 4

> Sub-estructura de la carpeta `evidencia/` por eje. La regla de cuando es obligatoria y como se
> audita vive en `agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`. El schema del bloque que la dispara vive en
> `agent-os/templates/work-record/schema/capa-datos-y-evidencia.md` seccion "Evidencia requerida (evidencia_requerida)".
> NO duplicar las reglas aqui — esto es solo el contrato de formato de cada artefacto.

Cada tarea con `evidencia_requerida.{eje}: true` deja su artefacto aqui. El experto de dominio lo
produce; Quinn lo audita (EV-1..EV-4). Coexiste con `evidencia/{test-case}.md` (evidencia de test
cases locales, convencion previa).

## api/ — producido por Sentinel [VP] (dentro de CS-2)

Un archivo por endpoint verificado: `api/T-NNN-{endpoint}.md`. Por cada llamada:

```
## POST /api/solicitudes  (T-012, CA-003)
Peticion:  POST https://localhost:5001/api/solicitudes
           Headers: Authorization: Bearer {sesion con permiso EA020}
           Body: { "sede": "A", "monto": 1500 }
Resultado: 201 Created
Response:  { "id": 8842, "estado": "reservado" }
Ejecutado: {fecha} por Sentinel [VP]
```

Aplica a APIs locales y externas. Un GET publico que un CA verifica tambien se loguea.

## ui/ — producido por Tessa [E2E] (Fase 2, Playwright MCP)

Capturas `ui/T-NNN-CA-NNN-{paso}.png` + un indice `ui/_indice.md` que narra cada captura por CA:

- Una captura del estado final que prueba cada CA de UI.
- Secuencia completa para flujos multi-paso (wizard de 3 pantallas = 3 capturas ordenadas).
- Si hay brecha: captura del estado defectuoso, anotada con esperado vs visto.

El `_indice.md` es obligatorio — sin el, un PNG suelto es opaco para la auditoria.

## bd/ — producido por Dexter [VD] (dentro de CD-2, solo lectura P-D4)

Un archivo por entidad: `bd/T-NNN-{entidad}.md` con las cuatro evidencias:

1. Schema: `INFORMATION_SCHEMA` / describe_table tras el DDL (la estructura existe con el tipo correcto).
2. SELECT post-escritura: ejecutar el flujo, luego SELECT que muestra la fila (el dato se almacena).
3. EXEC + efecto: ejecutar SP/Func con params reales + SELECT del efecto colateral (el SP hace la tarea).
4. Definicion: `OBJECT_DEFINITION` del SP/Func (que logica quedo desplegada).

La escritura de prueba (2/3) la dispara el flujo de la aplicacion (via API/UI) contra el entorno de
`test-env.local.json`, NUNCA produccion ni un INSERT manual de Dexter.
