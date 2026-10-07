# Abordaje Fase 2 — Recolectar evidencia

## Proposito

Producir un mapa verificable del estado actual del codebase (o fuente externa) antes de afirmar nada.

## Reglas duras

- NO Edit, NO Write sobre codigo del repo. Solo lectura.
- Toda afirmacion sustantiva lleva cita: `path:linea`, URL, referencia a doc, commit hash.
- Subagentes en paralelo cuando las preguntas son independientes.

## Que hace Alfred

1. Formula preguntas especificas derivadas del objetivo de Fase 1.
2. Despacha subagentes en paralelo (0-6 segun complejidad), **eligiendo el tipo por dominio de la pregunta**:
   - **Pregunta con dueno de dominio** (auth/permisos/PHI → Sentinel; arquitectura/dependencias → Winston; persistencia/BD → Dexter; UX/flujos → Sally; tests/cobertura → Quinn; cripto → Cipher) → despacha **al experto como subagente consultor**. Trae su ADN, no solo ojos.
   - **Pregunta sin dueno de dominio** (¿donde vive X?, ¿cuantos callers tiene Y?) → `subagent_type: Explore`, solo lectura. Sigue siendo la opcion correcta: no toda pregunta necesita un experto.

   Catalogo de senales por experto: `agent-os/experts/_registry.yml`.
   <!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md secciones "Prompt de encarnacion" y "Las dos clases". El prompt de encarnacion y el contrato del consultor viven alli. Aqui solo se declara COMO elegir el tipo en Fase 2. NO duplicar la regla — para modificar, editar la fuente. -->

3. Mientras los subagentes trabajan, Alfred puede comentar el plan pero NO afirma sobre codigo.
4. Consolida los reportes en un mapa de evidencia con citas.
5. Consulta el catalogo de archivo para contexto historico: invoca `agentos catalog show --archivo` y parsea `data.works`. Selecciona works afines al abordaje actual -- misma `ruta`, o `archivos_tocados` que solapen con los archivos ya citados en la evidencia del paso 4 -- y toma los 3-5 mas recientes por `cerrado_en`. Los agrega al output de Fase 2 como "works previos relacionados" (slug, ruta, archivos tocados): es contexto, NO evidencia. No abre sus READMEs salvo pedido explicito del usuario. Es un puntero de lectura sobre el cache ya fresco/auto-sanado, no un motor de similaridad.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/listar.md. La mecanica de invocacion y parseo de `catalog show --archivo` (`{ok,data}`, campos de `data.works`) vive en los pasos de gobierno de ese comando. NO duplicar -- editar la fuente. -->

- **Flujos de trabajo y puntos de contacto (MANIFIESTO P7).** Identificar el/los flujos de trabajo que la funcionalidad toca y sus puntos de contacto: que la invoca, que dispara despues, con que otras funcionalidades comparte datos/pantallas/contratos. Toda funcionalidad pertenece a un flujo — si no se puede nombrar, la evidencia esta incompleta. Ante incertidumbre aplica P8 (Honestidad Epistemica): declarar "no lo se aun" y hacer grounding — codebase actual, luego docs/work-records del repo, luego internet — ANTES de proponer ruta.

## Profundizacion adversarial bajo demanda (REF->)

Tres mecanismos opt-in. Activacion: Alfred por senales detectadas, o el usuario por solicitud explicita.

1. **Invitar experto puntual.** Sentinel (auth/permisos/PHI), Winston (arquitectura/refactor), Sally (UX/flujos), Quinn (tests/cobertura), Dexter (persistencia), Cipher (cripto). Se invita **despachandolo como subagente consultor**: aporta seccion `I-{experto}:` con cita. Catalogo de senales por experto: `agent-os/experts/_registry.yml`.
2. **Party mode** cuando hay tension entre dominios. Modelo de rondas (R1 paralela, R2 reaccion cruzada, R3+ condicional). REF-> `agent-os/experts/bmad-agent-alfred/abordaje/references/party-mode.md`. <!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/references/party-mode.md. El modelo de rondas vive alli; aqui solo se nombra cuando activarlo. NO duplicar -- editar la fuente. -->
3. **Advanced elicitation** (TR-10 data-flow-backtrace, TR-02 red-team) cuando la evidencia parece "sospechosamente limpia" o el riesgo es alto. REF-> `agent-os/skills/advanced-elicitation/`. <!-- FUENTE: agent-os/skills/advanced-elicitation/. El catalogo de tecnicas TR-NN vive alli; aqui solo se nombran las aplicables. NO duplicar -- editar la fuente. -->

## Validaciones que Fase 2 puede accionar

La recoleccion de evidencia es el momento en que se conoce el terreno, asi que aqui se
resuelven dos pre-requisitos que antes colgaban del cierre de la Etapa 0 (retirada):

- **Patron de permisos del repo:** si la ruta producira codigo, cargar `agent-os/standards/security/permisos-repo.md`. Si no esta documentado, marcar que Sentinel sera co-anfitrion (capacidad DP) en la pieza de plan. Para clasificar el estado (`permisos_repo_estado`: `documentado` | `documentado_externo` | `no_documentado`), que se hornea al abrir el work, aplicar la heuristica de `agent-os/skills/cargar-standards/references/permisos-repo-detection.md`.
  <!-- FUENTE: agent-os/skills/cargar-standards/references/permisos-repo-detection.md. El algoritmo de clasificacion vive alli. NO duplicar -- editar la fuente. -->
- **Contrato de ejecucion** (`test-env.local.json` `$version: 2`): si falta o es legacy, anotar que la ejecucion requerira `run-system` antes de correr/probar, segun `agent-os/skills/run-system/SKILL.md` seccion "Pre-requisitos" (dueno del contrato). Si falta, invocar ese skill en modo `init`.
  <!-- FUENTE: agent-os/skills/run-system/SKILL.md seccion "Pre-requisitos". Aqui solo se declara CUANDO se valida; el contrato del archivo vive alla. NO duplicar -- editar la fuente. -->

## Suficiencia de evidencia

Marca el bloque de evidencia con uno de:

- `suficiente` (default): la evidencia textual basta para planear.
- `requiere-observacion`: la evidencia exige observar el sistema corriendo (prueba contra externo vivo, bug intermitente, validacion contra deployment real). Senal: el usuario pidio "instrumentar/observar/reproducir", o la evidencia cita codigo que "existe pero no funciona contra X", o hay ciclo multi-prueba.

Se persiste en `abordaje.suficiencia_evidencia` del frontmatter (ver `agent-os/templates/work-record/schema/abordaje.md`). La pieza de plan aplica patron "dos olas" si es `requiere-observacion`.

Las **señales heuristicas** que distinguen `suficiente` de `requiere-observacion` (usuario pidio "instrumentar/observar/reproducir"; codigo existe pero no funciona contra X; integracion bilateral viva; ciclo multi-prueba) viven en el reference y no se duplican aqui.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/abordaje/references/observacion-previa.md. Las 4 senales heuristicas viven alli. NO duplicar -- editar la fuente. -->

## Output de Fase 2

Bloque estructurado en conversacion (aun NO archivo): evidencia recolectada (citas), drifts detectados, profundizacion experta (si aplico), pre-requisitos detectados, suficiencia de evidencia, works previos relacionados (contexto historico, ver paso 5).
