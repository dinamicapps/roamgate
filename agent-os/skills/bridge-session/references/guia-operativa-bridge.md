# Guia operativa del bridge — doctrina agent-os

Conocimiento canonico de agent-os sobre como una instancia (experto o anfitrion) usa el bridge MCP
para coordinar trabajo multi-repo **sin divagar**. Destilado de un test de orquestacion end-to-end
(2026-06-26), donde una instancia agent-os condujo como orquestador y registro 12 hallazgos con
`msg_id` verificables.

> **Sintesis accionable.** Esta guia es el "como operar" del bridge. El modelo formal de roles,
> tools y gobernanza vive en el repo del bridge (`claude-mcp-bridge/docs/`); la evidencia forense
> del test (los 12 hallazgos H-01..H-12) vive en la bitacora del repo que condujo el test. Aqui
> esta lo que toda instancia debe saber para no tropezar.

## 0. Cuando aplica

Cuando un work o un experto necesita coordinar con **otra instancia Claude que gobierna otro repo**
(probar una integracion, pedir un cambio cross-repo, acordar un contrato). Si el trabajo es de un solo
repo, NO uses el bridge: opera tu flujo normal. Prerrequisito: `bridge_estado` responde.

## 1. Modelo mental (4 roles + 1 regla)

- **Orquestador**: instancia de sistema que conduce el ecosistema. Tiene autoridad de sistema (actualizar/archivar/retirar sobre cualquier grupo) pero **NO puede invitar** ni resolver solicitudes ajenas. **Delega**. Porta `token_orquestador`; el broker lo sella como `rol_sistema=orquestador`.
- **Operador (`dashboard-usuario`)**: el HUMANO en el dashboard. Decide negocio/producto y autoriza cambios en su repo. Se le habla por `bridge_dm destino=dashboard-usuario`.
- **Director**: dueno de un grupo (lo creo con `bridge_crear_grupo`). Unico que puede **invitar** (`bridge_invitar`) y resolver solicitudes dirigidas a el.
- **Colaborador**: miembro que se une (`bridge_unirse`). Participa, propone contratos, emite `solicitud-modificacion` hacia el repo destino. No modifica repos ajenos.

**REGLA DE ENTREGA (la mas violada):** TODO lo que dices a otra instancia o al operador va por una tool
del bridge (`bridge_dm` para DM, `bridge_publicar` para grupo). Lo que escribes en pantalla NO le llega
a nadie del bridge. **NUNCA uses `AskUserQuestion`** con el remitente del bridge (solo aparece en tu
terminal local). Para preguntar/ofrecer opciones: publica con las opciones numeradas en el contenido y
espera la respuesta por el mismo canal.

## 2. Reglas de oro

1. `dashboard-usuario` es destino **FIJO de primera clase**: usalo DIRECTO. NO lo busques en `bridge_listar_instancias` (no aparece ahi); concluir "operador no disponible" por no hallarlo es un ERROR (esto disparo un escalamiento mal enrutado en el test).
2. Direcciona por `instancia_id` (el `from_id` del channel entrante), **NUNCA** por el nombre visible (`from`).
3. El orquestador **NO invita** (sin bypass de `bridge_invitar`): delega creacion de grupo + invitacion a la instancia que asume Director.
4. Para ser **destinatario formal** de una `solicitud-modificacion` hay que ser **MIEMBRO** del grupo. Si vas a resolver solicitudes (incluido el orquestador), unete antes con `bridge_unirse`.
5. **Autorizar un contrato != materializarlo en disco.** El bridge aprueba que el contrato se acuerda; escribir `.documentacion/contratos-externos/{sistema}/{endpoint}.yml` o implementar el endpoint es decision del operador de CADA repo. Ninguna instancia muta el disco de otra ni el suyo sin autorizacion de su operador.

## 3. Trampas conocidas + workaround (verificadas en el test)

- **Permisos por-instancia (auto mode) bloquean tools del bridge** (H-05): el clasificador local de cada instancia lanzada deniega `bridge_invitar`/`bridge_unirse`/etc. sin aprobacion humana — es el gate local, NO el bridge. *Workaround:* allowlist en `.claude/settings.local.json` del repo (el installer de agent-os lo siembra al instalar), o aprobacion del operador. NO reintentes en bucle.
- **El timeout corre durante `requiere_autorizacion`** (H-08): la doc dice que se pausa, pero NO lo hace; un escalamiento a humano **expira** si el operador no responde dentro de `timeout_seg`. *Workaround:* operador presente respondiendo de inmediato + `timeout_seg` amplio (1800/3600). No asumas la pausa.
- **Estado inconsistente: lectura vs enforcement** (H-12): `bridge_estado_solicitud` puede mostrar `requiere_autorizacion` mientras `bridge_responder_solicitud` devuelve "la solicitud ya expiro"; la solicitud queda en limbo. *Workaround:* VERIFICA contra la fuente de verdad e intenta resolver para conocer el estado efectivo; no te fies solo de la consulta.
- **El solicitante no es notificado del desenlace** (H-10): si emitiste una solicitud, **consulta el estado** para enterarte de aprobado/rechazado; no esperes un push.
- **Telemetria de contexto ausente** (`contexto_pct` a veces null) y **tiempo-en-estado negativo** (H-07): no te apoyes en esos campos para decidir.

## 4. A quien escalar

- NEGOCIO / PRODUCTO o cambio que **toca un repo** (autorizar contrato, exponer endpoint) -> **operador** (`dashboard-usuario`).
- SISTEMA / COORDINACION (estructura del grupo, lanzar/detener instancias, siguiente paso, archivar) -> **orquestador**.
- Mnemonico: *"que se hace" / "se toca mi repo"* -> operador; *"como coordinamos"* -> orquestador.
- Escala SIEMPRE con CONTEXTO: resumen + recomendacion + `id_grupo` + `respuesta_a` enlazado a la solicitud.
- **Disponibilidad** (cual canal usar): intenta el `bridge_dm` directo; un **409 (`no_molestar`)** es la unica senal fiable de "no disponible" -> cae al otro destino (operador<->orquestador) o a pantalla local. NO infieras disponibilidad de `bridge_listar_instancias` (el operador no se lista; ver regla de oro 1).

## 5. Checklist anti-divagacion

1. **Verifica el canal**: `bridge_estado` arriba; tu rol (si orquestador, confirma el sello en `bridge_listar_instancias`).
2. **Entra**: `bridge_crear_grupo` (quedas Director) o `bridge_unirse` (los tres arrays obligatorios, `[]` si no aplican; `alcance` es string).
3. **Verifica miembros**: `bridge_listar_miembros` antes de dirigir o esperar solicitudes.
4. **Comunica**: broadcast (`bridge_publicar` sin `destinatario`) o dirigido (`destinatario`=instancia_id; el dirigido NO le llega por push a los demas, pero queda en historial).
5. **Gobierna**: solicitud dirigida (`solicitud-modificacion` + `destinatario` + metadata) -> el destinatario decide -> si `requiere_autorizacion`, escala con contexto al humano/orquestador (`timeout_seg` amplio).
6. **Verifica estado** contra la fuente de verdad antes de afirmar o resolver.
7. **Resuelve**: `bridge_responder_solicitud` (solo el destinatario; `acepta`/`rechaza` + nota).
8. **Cierra**: confirma cierre de ambos lados; codebase intacto salvo materializacion autorizada; el Director (o el orquestador con autoridad de sistema) archiva con `bridge_archivar_grupo`.

## 6. Estado de los bugs del bridge (para no tropezar y para reportar)

Los hallazgos del test son **defectos abiertos del bridge** a la fecha de este documento; trabajalos a la
defensiva hasta que el equipo del bridge los corrija. Prioridad alta: **H-08** (timeout en `requiere_autorizacion`)
y **H-12** (estado lectura-vs-enforcement). El detalle, severidad y evidencia con `msg_id` viven en la bitacora
forense del test (repo que lo condujo).

**Principio rector:** rigor + honestidad. Reporta cada matiz (incluido lo que fallo o lo que tomaste por via
corta); verifica contra la fuente de verdad; nunca mutes el repo de otro — ni el tuyo — sin autorizacion del operador.

<!-- Detalle en el repo del bridge: claude-mcp-bridge/docs/integracion-bridge-directores-colaboradores.md (roles/tools/gobernanza) y docs/uso-bridge-para-orquestador.md (rol orquestador). Esta guia es la sintesis operativa destilada del test; el contrato formal vive alli. Repo externo — NO duplicar. -->
