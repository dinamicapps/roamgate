# Manifiesto Versionado

## Schema YAML

Works `version_sistema: "1"` (legacy): el manifiesto vive en disco en `etapa-0/manifiesto.yml`
(lado director) -- artefacto legacy, camino de lectura conservado (los works v1 siguen
existiendo). Works `version_sistema: "2"`: no hay archivo fisico -- el manifiesto se
construye inline desde el bloque `## Abordaje` del README (mas el plan de E2 si existe) y
vive solo en memoria hasta publicarse. Ver `fase-0-manifiesto.md` seccion "Flujo (Director) /
Paso 1". En ambos casos, una vez cargado o construido, se publica al bridge como adjunto
con el schema siguiente:

manifiesto_version: 1
emitido: {ISO-8601 timestamp}
hash: {sha256 del contenido sin estos 3 campos meta + changelog}
work: {nombre-director-kebab}
director:
  instancia: {nombre del .bridge.local}
  repo: {url-git}
  branch: {branch-actual}
objetivo: |
  {descripcion del work}
alcance:
  incluye: [{item1}, {item2}]
  excluye: [{item1}]
analisis_consolidado: |
  {resumen de la evidencia del abordaje (Fase 2) en works v2, o de etapa-0/contexto.md en works v1 legacy; max 2000 chars}
  # Referencia completa: bridge_archivos -> "contexto-director.md"
fases:
  - id: F-001
    descripcion: "{texto}"
    ejecuta: director | colaborador:{instancia} | compartida
    cas_relacionados: [CA-001]
cas_por_participante:
  director: [CA-001, CA-002]
  "colaborador:emedico": [CA-003]
changelog:
  - version: 1
    fecha: {timestamp}
    cambios: "emision inicial"

## Campo estado_grupo (nuevo)

**Obligatorio desde version 2 del schema.** Valores validos:

- `exploracion`: grupo recien creado. `fases: []` y `cas_por_participante: {}` son validos. Colaboradores NO crean work-record fastrak al unirse, solo acusan recibo.
- `acordado`: checklist listo-para-CAs del grupo paso. Manifiesto v2 con `fases` y `cas_por_participante` rellenos. Colaboradores crean fastrak en esta transicion.
- `archivado`: grupo cerrado. No acepta nuevos mensajes, sesiones ni transiciones.

**Transicion exploracion -> acordado:** el director verifica que el checklist del grupo paso (ver `grupo-{nombre}/README.md`), emite manifiesto v2 con fases y CAs, y publica al bridge con tipo `contexto` y metadata `{"transicion": "exploracion-a-acordado"}`. Los colaboradores al recibir crean fastrak.

**Transicion a archivado:** el director publica manifiesto con `estado_grupo: archivado` y ejecuta `bridge_archivar_grupo`.

### Ejemplo: manifiesto v1 en modo exploracion

```yaml
manifiesto_version: 1
estado_grupo: exploracion
grupo_nombre: ciclo-licencia-legacy
work_contenedor: 20260419-activacion-licencia-legacy-empresa-10
# ... resto de campos
fases: []                      # valido en exploracion
cas_por_participante:
  director: []                  # valido en exploracion
```

### Vinculo con senal `requiere-observacion` del abordaje

Cuando el work-director del bridge tiene `abordaje.suficiencia_evidencia: requiere-observacion` en el frontmatter de su README, el manifiesto inicial publicado al bridge **debe** salir en `estado_grupo: exploracion` con `fases: []` y `cas_por_participante: {}` vacios.

Razon: en works exploratorios los CAs bilaterales no son conocidos antes del primer ciclo de observacion. Acordar CAs bilaterales sobre supuestos produce contratos que se invalidan al primer hallazgo y obligan a re-emision inmediata (manifiesto v2) consumiendo costo de coordinacion bilateral sin beneficio.

**Flujo correcto en works exploratorios:**

1. Director publica manifiesto v1 con `estado_grupo: exploracion`, meta unica, setup, plan de instrumentacion bilateral.
2. Colaborador acusa recibo y prepara su instrumentacion local (no crea fastrak todavia — regla existente para `exploracion`).
3. Ambos ejecutan primera observacion bilateral (Ola 1 del lado director).
4. Director consolida hallazgos del primer ciclo, materializa Ola 2 local (ver `agent-os/skills/host-protocol/etapas/etapa-2.md`), y emite manifiesto v2 en `estado_grupo: acordado` con CAs bilaterales materializados desde la observacion.
5. Colaborador crea fastrak en la transicion exploracion->acordado.

Esto reemplaza el patron anti-optimo donde el manifiesto v1 sale con 8-12 CAs adivinados y se reescribe v2 a las pocas horas.

**Compatibilidad:** works sin `abordaje.suficiencia_evidencia` o con valor `suficiente` mantienen comportamiento actual — manifiesto inicial puede salir directamente en `estado_grupo: acordado` con CAs si el director tiene contrato claro.

## Manifiesto minimo

Solo `manifiesto_version`, `emitido`, `hash`, `objetivo`, `alcance.incluye`, `changelog`. Sin work, sin fases, sin CAs.

## Regla de re-emision

Cualquier cambio en `objetivo`, `alcance`, `analisis_consolidado`, `fases` o `cas_por_participante` obliga a:

1. Incrementar `manifiesto_version`.
2. Actualizar `emitido`, recalcular `hash`, agregar entrada a `changelog` con descripcion del cambio.
3. Re-publicar al bridge (ver bridge-session/references/archivos-publicacion.md). El bridge no entiende roles - resolver IDs primero y aplicar invariante upload+publicar:

```
miembros = bridge_listar_miembros(id_grupo)
todos_los_ids = [m.id for m in miembros]

resultado = bridge_subir_adjunto(id_grupo,
  ruta: "{ruta-local}/manifiesto.yml",
  nombre: "manifiesto.yml",
  destinatarios: todos_los_ids,         # broadcast explicito a todos los miembros
  tipo: "manifiesto",
  sobrescribir: true,
  changelog_entry: "v{N}: {descripcion}")

bridge_publicar(id_grupo, "contexto",
  "MANIFIESTO v{resultado.version} publicado. Cambios: {changelog reciente}. Colaboradores: releer y re-aceptar.",
  destinatarios: todos_los_ids,
  adjunto_id: resultado.adjunto_id,
  metadata: '{"subtipo": "manifiesto-actualizado", "version": resultado.version}')
```
4. Registrar en bitacora del work-director: `etapa-{actual}/bitacora.md` -> entrada `[Orquestador] Manifiesto re-emitido v{N}`.

## Disparadores que exigen re-emision

- `/alfred regresar` que cambie analisis/fases/CAs.
- Resolucion de hallazgo que modifique alcance.
- Usuario edita objetivo/alcance.
- Director reasigna fase de director <-> colaborador.

## Reaccion del colaborador

Al recibir broadcast `manifiesto-actualizado` o detectar version > local:
1. Descargar `etapa-0/manifiesto-recibido.v{N}.yml` (conservar anteriores).
2. Diff vs version previa, mostrar al usuario que campos cambiaron.
3. AskUserQuestion: re-aceptar / objetar via bridge / alto total.
4. Si afecta CAs ya ejecutados: F1-ejecucion pausa automaticamente para items afectados; F0 se re-abre solo para esos items.
5. Acusar recibo en modo degradado (F-5 no entregada en EP-010, ver archivos-publicacion.md):

```
bridge_publicar(id_grupo, "response",
  "Acuse manifiesto v{N}: aplicado",
  destinatarios: [id_director],
  respuesta_a: id_mensaje_que_llevo_el_manifiesto,
  metadata: '{"subtipo": "acuse-archivo", "archivo": "manifiesto.yml", "version": N, "estado": "aplicado"}')
```

## Invariante

Version del manifiesto que el colaborador usa para ejecutar nunca puede ser menor que la ultima emitida. Si detecta desfase, pausa.
