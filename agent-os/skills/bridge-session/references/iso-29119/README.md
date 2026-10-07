# ISO/IEC/IEEE 29119 — Templates para Bridge Session

Templates adaptados del estandar internacional de testing para el protocolo de integracion multi-sistema.

Cada template mapea a un artefacto de ISO 29119-3 (Test Documentation) adaptado al contexto de dos o mas instancias de Claude Code coordinando pruebas via claude-bridge.

## Templates

| Archivo | ISO 29119-3 | Fase del skill | Quien lo genera |
|---------|-------------|----------------|-----------------|
| `test-plan.md` | Test Plan | Fase 2 | Director |
| `test-case.md` | Test Case Specification | Fase 2 (por checkpoint) | Director |
| `test-environment.md` | Test Environment Requirements + Readiness | Fase 3 | Cada instancia |
| `test-execution-log.md` | Test Execution Log | Fase 4 | Cada instancia |
| `test-incident.md` | Test Incident Report | Fase 4 (por fallo) | Instancia que detecta |
| `test-completion.md` | Test Completion Report | Fase 6 | Director |

## Correlation ID

El CA (Criterio de Aceptacion) activo funciona como correlation ID. Cada checkpoint mapea a CAs del work. Los mensajes del bridge, los logs forenses, y los reportes se agrupan por CA.

## Tools MCP del bridge

| Tool | Proposito en el protocolo |
|------|--------------------------|
| `bridge_crear_grupo` | Fase 1: crear grupo con reglas de gobernanza |
| `bridge_unirse` | Fase 1: unirse con alcance, restricciones, autorizaciones |
| `bridge_actualizar_grupo` | Fases 2-6: Director actualiza metadata (plan, datos, reporte) |
| `bridge_publicar` | Fases 3-5: mensajes (y dirigido a un miembro con `destinatario`), solicitud-modificacion, cambio-ejecutado |
| (recepcion) | Modo channel (default): los mensajes llegan por **push** como `<channel ...>`, sin /loop |
| `bridge_leer` | Fallback de pull (modo polling o channel degradado); con /loop si se quiere continuo |
| `bridge_disponibilidad` | (P3) Marcar la instancia `disponible`/`no_disponible`. Solo si el MCP la expone. |
| `bridge_listar_instancias` | (P3) Discovery de instancias conectadas + disponibilidad (director elige a quien invitar). |
| `bridge_invitar` | (P3, director) Invitar a una instancia concreta (conectada+disponible) por `instancia_id`. |
| `bridge_dm` | (P3) Mensaje directo durable fuera de grupo (destino `disponible`). |
| `bridge_historial` | Todas: consultar historial con filtros |
| `bridge_ver_mensaje` | Todas: leer mensaje completo |
| `bridge_esperar` | Fase 4: esperar respuesta a solicitud (max 60s) |
| `bridge_estado_solicitud` | Fase 4: consultar estado de solicitud-modificacion |
| `bridge_solicitar_alto_total` | Emergencia: detener todas las operaciones |
| `bridge_confirmar_alto_total` | Emergencia: Director confirma alto total |
| `bridge_reanudar_grupo` | Post-emergencia: Director reanuda grupo detenido |
| `bridge_listar_grupos` | Fase 1: buscar grupo existente |
| `bridge_listar_miembros` | Todas: ver miembros y roles |
| `bridge_estado` | Pre-activacion: verificar que bridge esta conectado |
| `bridge_archivar_grupo` | Fase 6: cerrar grupo al finalizar |
| `bridge_salir` | Cierre: salir del grupo |
| `bridge_retirar_miembro` | Director: retirar miembro problematico |

Las tools P3 requieren MCP actualizado; invocarlas solo si aparecen en las tools
disponibles (`if "bridge_invitar" in mcp_tools`). Catalogo completo: la guia del bridge.
<!-- Detalle en el repo del bridge: claude-mcp-bridge/docs/uso-bridge-para-agent-os.md secciones 4-6. Contrato formal del bridge, repo externo; NO duplicar — editar allá. -->

## Uso

El skill bridge-session usa estos templates como base para generar los artefactos de cada sesion. Los archivos generados se escriben en `{work_output_path}/` y son commiteables.
