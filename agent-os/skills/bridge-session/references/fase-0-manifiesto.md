# Fase 0: Precondicion + Manifiesto

## Objetivo

Antes de establecer el grupo, garantizar que existe un manifiesto valido que describe objetivo, alcance, analisis, fases y CAs por participante. El manifiesto se sube al grupo en Fase 1 paso 6 (justo despues de crear el grupo, antes de emitir la invitacion al colaborador), y se descarga al unirse cada colaborador (Fase 1 paso 5 del flujo colaborador). Esta secuencia garantiza que cuando el colaborador se une, el manifiesto ya esta publicado y listo para descargar.

## Detonante

Esta fase se ejecuta SIEMPRE antes de Fase 1. Para todo work `version_sistema: "2"` el manifiesto se construye inline desde el bloque `## Abordaje` del README (ver Paso 1). Si no hay work o es un work v1 sin manifiesto en disco, se genera aqui.

## Flujo (Director)

### Paso 1: Verificar work activo

Buscar work EN_PROGRESO o PAUSADO del autor en `agent-os/work-records/` cuyo `_catalogo.yml` lo lista.

**Si el work tiene `version_sistema: "1"`:**
- Si tiene `etapa-0/manifiesto.yml`: cargar y continuar a Paso 4. Artefacto legacy en disco -- works v1 siguen existiendo, este camino de lectura no se retira.
- Si NO tiene manifiesto: generarlo aqui mismo (Fase 0, Paso 3). No hay etapa a la que regresar.

**Si el work tiene `version_sistema: "2"` (works nuevos, cualquier ruta):**
- El manifiesto se construye inline desde el bloque `## Abordaje` del README del work + plan E2 (si existe). NO hay `etapa-0/manifiesto.yml`.
- Si el frontmatter del README declara `abordaje.suficiencia_evidencia: requiere-observacion`: el manifiesto generado sale obligatoriamente con `estado_grupo: exploracion`, `fases: []`, `cas_por_participante: {}` (ver `manifiesto-versionado.md` seccion "Vinculo con senal requiere-observacion").
- Si declara `suficiente`: el manifiesto puede salir directamente en `estado_grupo: acordado` con CAs si el director ya tiene contrato claro, o en `exploracion` si el director prefiere abrir dialogo bilateral antes de fijar CAs.
- Continuar a Paso 4 con el manifiesto generado en memoria.

**Si NO existe work activo:** AskUserQuestion para elegir ruta (Paso 2 sin cambios).

### Paso 2: AskUserQuestion (si no hay work)

AskUserQuestion:
  question: "No hay /alfred activo. Como continuar?"
  options:
    - label: "Crear /alfred formal (Recomendado)"
      description: "Salir de bridge-session y ejecutar /alfred normal. El manifiesto se construye inline desde el bloque ## Abordaje del work resultante."
    - label: "Crear fastrak {nombre}-b-director"
      description: "Mini-analisis inline: objetivo, alcance, fases. Genera manifiesto formal sin discovery completo."
    - label: "Sin work (manifiesto minimo)"
      description: "Solo objetivo y alcance. Sin work-record. Sin trazabilidad local de cambios. Modo ad-hoc."

### Paso 3: Generar manifiesto segun ruta

Ver `manifiesto-versionado.md` para schema completo. El manifiesto minimo solo lleva `objetivo` y `alcance.incluye`.

### Paso 4: Validar manifiesto

Verificar campos obligatorios: `manifiesto_version`, `objetivo`, `alcance`, `emitido`, `hash`. Si falta alguno -> error y abortar Fase 0.

### Paso 5: Continuar a Fase 1

Una vez manifiesto valido en memoria, proceder a `crear-sesion.md` (Fase 1).

## Flujo (Colaborador)

Esta fase es no-op para el colaborador. El manifiesto se descarga durante Fase 1 (al unirse). Ver `fase-7-work-colaborador.md` para el consumo.
