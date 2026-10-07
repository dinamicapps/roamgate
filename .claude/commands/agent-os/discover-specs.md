# Discover Specs

Genera o actualiza especificaciones tecnicas de modulos del sistema mediante analisis profundo del codigo existente y fuentes de documentacion externas. Paige conduce el analisis y produce specs persistentes en `agent-os/specs/`.

## Uso

```
/discover-specs                              # Paige sugiere que modulos documentar
/discover-specs historia-clinica             # Foco en un area completa
/discover-specs historia-clinica/mcp-ia      # Foco en un modulo especifico
/discover-specs --desde-work {work-id}       # Paige parte del work-record cerrado
```

## Modo `--desde-work {work-id}`

Cuando se invoca con flag `--desde-work {work-id}`:

1. Verificar que el work esta `COMPLETADO`. Si no:
   > "Solo se pueden descubrir specs desde works completados. Estado actual: {estado}."
   Detener.
2. Verificar `cosecha.specs.ejecutado` en frontmatter del README del work. Si es `true`:
   AskUserQuestion: "Specs ya cosechadas el {fecha} por {por}. Re-ejecutar (acumula) o saltar?"
3. Leer el work-record completo:
   - `agent-os/work-records/{work-id}/README.md` (objetivo, meta, abordaje, decisiones).
   - `etapa-2/03-plan.md` (decisiones tecnicas).
   - `etapa-2/tareas/*.md` (cambios concretos hechos).
   - `etapa-3/bitacora.md` y `etapa-4/07-verificacion.md` (hallazgos durante ejecucion).
   - Manifiestos de grupos bridge si existen (`grupo-*/manifiesto-v*.md`) — contratos bilaterales.
4. Paige clasifica el contenido en candidatos a spec:
   - Contratos externos nuevos o modificados (cualquier endpoint con cambio de API).
   - Decisiones arquitectonicas de nivel sistema (no decisiones de implementacion).
   - Modelos de datos nuevos que afectan a >1 modulo.
5. Busqueda dirigida en codebase para validar/profundizar cada candidato (grep dirigido, lectura de archivos modificados en el work).
6. Para cada candidato, AskUserQuestion: crear spec nueva / actualizar spec existente / saltar / diferir.
7. Si el usuario aprueba candidatos, Paige genera/actualiza specs en `agent-os/specs/{modulo}/{spec}.md`.
8. Al cerrar exitosamente, actualizar `cosecha.specs` del README del work:
   ```yaml
   cosecha:
     specs:
       ejecutado: true
       fecha: "{fecha de hoy}"
       por: "{dev-name}"
       specs_creadas_o_actualizadas: [{lista de paths}]
       nota: "string corta opcional"
   ```
   Si re-ejecucion: acumular `specs_creadas_o_actualizadas[]` sin duplicados.

**Sin flag** `--desde-work`: comportamiento actual (analiza codebase desde nombre de modulo o sugerencias).

## Instrucciones de Ejecucion

### 1. Determinar el foco

Si se proporciono un modulo o area como argumento, usarlo directamente.

Si no se proporciono argumento:
- Leer `agent-os/specs/_indice.yml` para ver que specs existen y sus fechas
- Ejecutar `agentos catalog show` para identificar modulos activos sin spec (el catalogo se reconstruye en memoria; no leer el archivo fisico, puede no existir)
- Invocar `agent-os/experts/bmad-agent-paige/SKILL.md` para que explore el proyecto y sugiera los modulos con mayor valor para documentar (prioridad: modulos sin spec + modulos con mas works)
- Presentar sugerencias al usuario con AskUserQuestion

### 2. Confirmar modulo y epica

Usar AskUserQuestion:

```
=== DISCOVER SPECS ===

Modulo a documentar: {modulo confirmado o sugerido}

?A que epica pertenece?
{Si existe _roadmap.yml: listar epicas disponibles}
{Opcion: "sin-epica"}
```

### 3. Recopilar fuentes externas (opcional)

Usar AskUserQuestion:

```
?Tienes documentacion externa de referencia para este modulo?

Ejemplos:
- URLs de reglamentacion aplicable
- Documentacion de APIs externas que consume
- Especificaciones tecnicas o normativas
- Documentacion interna en otra ubicacion

Paige guardara estas fuentes en su memoria y las usara como
base de conocimiento persistente para este modulo.

Proporciona URLs o rutas locales, o escribe "ninguna".
```

### 4. Invocar Paige

Configurar output path:
```yaml
work_output_path: "agent-os/specs/{epica-o-sin-epica}"
```

Invocar `agent-os/experts/bmad-agent-paige/SKILL.md` con:
- Modulo objetivo: `{area}/{modulo}`
- Epica: `{EP-NNN o sin-epica}`
- Foco del analisis: `{argumento del usuario o sugerencia}`
- Fuentes externas: `{URLs/rutas proporcionadas, o ninguna}`
- Historial de works relevantes: obtener via `agentos catalog show` y filtrar works que tocaron el area
- Objetivo: analisis profundo del modulo `{modulo}`, generar o actualizar
  `agent-os/specs/{epica}/{modulo}.md` con documentacion tecnica completa.
  Paige tiene el contexto de agent-os en `agent-os-context.md` y decide
  que herramientas usar (DP para brownfield, WD para redaccion, MG para
  diagramas, VD para validar). Al terminar, actualizar `agent-os/specs/_indice.yml`.

Paige habla directamente con el usuario durante el analisis.

### 5. Al terminar

Informar al usuario:
```
Spec generada/actualizada: agent-os/specs/{epica}/{modulo}.md
_indice.yml actualizado.

{Si Paige registro fuentes: "Fuentes guardadas en memoria de Paige para sesiones futuras."}
```
