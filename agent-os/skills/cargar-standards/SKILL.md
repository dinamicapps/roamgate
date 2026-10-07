# Inferir dominios y cargar standards (reference compartida)

> **Reference reusable** invocada desde steps de Bob (E2-plan), Amelia/Atlas (E3-ejecucion), Quinn (E4-verificacion), y Atlas-sabueso (steps-bugfix). Define la **mecanica unica** de descubrimiento dinamico de standards aplicables a una tarea, sin mapping declarativo por archivo.

## Proposito

Cuando un experto se activa en un step y va a materializar / ejecutar / verificar / investigar una tarea, debe tener en su contexto los standards del repo aplicables al dominio que esa tarea toca. La carga es **dinamica**: se infiere desde los paths que la tarea declara y se resuelve contra `agent-os/standards/index.yml` del proyecto destino.

## Pre-condicion

- El experto sabe que tarea esta procesando (ID + contenido + paths que toca).
- El experto tiene acceso al filesystem del proyecto destino.
- El experto puede leer archivos `.md`.

## Procedimiento

### Paso 1 — Localizar el indice de standards

```
1. Resolver `{project-root}` (raiz del repo destino).
2. Verificar `{project-root}/agent-os/standards/index.yml`.
3. Si NO existe:
   - Anunciar: "Sin standards definidos en este proyecto. Continuo sin carga dinamica."
   - Retornar lista vacia.
4. Si existe: leer su contenido como mapa carpeta → archivos.
```

El index.yml es generado dinamicamente por el instalador del sistema recorriendo `agent-os/standards/` del proyecto destino. NO requiere edicion manual.

### Paso 2 — Identificar paths de la tarea

```
1. Leer la tarea (T-NNN-{nombre}.md).
2. Recolectar paths del bloque `## Archivos` (Create / Modify / Delete / Test).
3. Recolectar paths citados en `## Subtareas` o `## Dev Notes` si tienen forma `path:linea` o `path/`.
4. Si no hay paths declarados (tarea muy abstracta o de configuracion):
   - Continuar a paso 3 con dominio inferido por title de la tarea + tipo_tarea.
```

### Paso 3 — Inferir dominios

Aplicar la siguiente heuristica sobre la lista de paths. Un path puede activar **mas de un dominio**.

| Senal en path | Dominio activado |
|---|---|
| `Controllers/`, `*Controller.cs`, `Routes/`, `Endpoints/`, declaracion `[HttpGet]` / `[HttpPost]` / `@router.get` / `app.get` en notas | `backend`, `api` |
| `Services/`, `*Service.cs`, `BL*.cs`, `*Service.ts`, `Application/`, `UseCases/` | `backend` |
| `Models/`, `Entities/`, `Schema/`, `Migrations/`, `*.sql`, `EF Core` mencionado | `database` |
| `Repositories/`, `*Repository.cs`, queries SQL inline | `database` |
| `*.tsx`, `*.jsx`, `*.vue`, `components/`, `views/`, `pages/`, `Pages/` | `frontend` |
| `*.scss`, `*.css`, `styles/`, `*.module.css` | `frontend` |
| `*.test.*`, `*.spec.*`, `Tests/`, `__tests__/`, `cypress/`, `e2e/`, `playwright/` | `testing` |
| Auth / token / permission / roles mencionados en titulo o subtareas | `security` |
| `.documentacion/`, `*.md` editado por humanos, README, CHANGELOG | `documentacion` |
| `*.yml` config, `.github/workflows/`, `Dockerfile`, `docker-compose` | `global` (si existe), sino sin dominio |

**Reglas adicionales:**
- Si tarea tiene `capa_seguridad.aplica: true` en frontmatter: `security` se activa siempre, **independiente de paths**.
- Si tarea tiene `tipo_tarea: codigo` y NO matchea ningun patron: inferir desde el primer segmento del path (`src/api/X` → `api/backend`; `src/ui/X` → `frontend`).
- Si tarea es `tipo_tarea: documentacion`: solo dominio `documentacion`.

### Paso 4 — Resolver standards aplicables

```
Por cada dominio inferido:
   1. Buscar entrada en index.yml: `{dominio}:` (top-level).
   2. Si existe: listar archivos de esa seccion.
   3. Construir paths absolutos: `{project-root}/agent-os/standards/{dominio}/{archivo}.md`.
   4. Verificar que cada archivo existe en filesystem (graceful: si falta, omitir).
   5. Retornar lista.

Adicional:
   - Tambien revisar `root:` del index.yml para standards globales (commit-format, naming, tech-stack).
   - Estos cargan SIEMPRE (no dependen de dominio inferido), porque son universales.
```

### Paso 4b — Cargar doctrina del sistema (agent-os/doctrina/)

La doctrina del sistema (DRY / cohesion / acoplamiento / arquitectura en capas) vive en `agent-os/doctrina/` (zona de sistema, espejo-en-update). Se carga ADEMAS de los standards del consumidor:

1. Si NO existe `{project-root}/agent-os/doctrina/`: omitir TODO este paso en silencio (instalacion previa a la capa de doctrina — graceful, no bloquea).
2. Cargar SIEMPRE `agent-os/doctrina/global/principios-ingenieria.md` (vocabulario agnostico universal, como los `root:` globales).
3. Resolver el perfil activo: leer `{project-root}/.claude/CLAUDE.md`, linea `Perfil instalado: {PERFIL}`. Si no se resuelve, cargar solo el global y omitir las capas por perfil.
4. Por cada dominio inferido en el Paso 3:
   - `backend` / `api` / `database` activos -> `agent-os/doctrina/{PERFIL}/backend/arquitectura-capas.md`.
   - `frontend` activo -> `agent-os/doctrina/{PERFIL}/frontend/arquitectura-capas.md`.
5. Verificar existencia de cada archivo (graceful: si falta, omitir sin anunciar).

**Precedencia:** la doctrina del sistema es el PISO. Si un standard del consumidor (`agent-os/standards/`) cubre el mismo tema, el del consumidor GANA. El experto aplica esta precedencia al resolver conflictos. <!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Doctrina del sistema vs standard del consumidor". NO duplicar. -->

### Paso 5 — Carga al contexto

```
1. Por cada path resuelto (standards del Paso 4 + doctrina del Paso 4b), leer el archivo (Read tool).
2. Sostener el contenido en memoria conversacional durante la ejecucion del step.
3. NO persistir a archivo del work-record (es contexto temporal).
4. Si el experto materializa tarea nueva (Bob), persiste lista de paths cargados en frontmatter:
   `standards_cargados: ["agent-os/standards/backend/api-response.md", "agent-os/doctrina/global/principios-ingenieria.md", ...]`.
   Los paths de doctrina resueltos en el Paso 4b se anexan a este mismo arreglo (no hay campo separado).
   Esto permite que Amelia/Atlas/Quinn no re-infieran al activarse en E3/E4 — solo cargan.
```

## Casos borde

### Caso A: index.yml ausente

Comportamiento: anunciar **"Sin standards definidos en este proyecto. Continuo sin carga dinamica."** y proceder. NO bloquea el step.

### Caso B: dominio inferido sin standards en index.yml

Comportamiento: silencioso. Pasar al siguiente dominio. NO anunciar a menos que TODOS los dominios queden vacios (entonces anunciar "Standards no aplicables a los dominios de esta tarea").

### Caso C: tarea sin paths declarados

Comportamiento: inferir desde titulo + tipo_tarea. Si el titulo no da senal:
- `tipo_tarea: codigo` → cargar solo `root:` (globales).
- `tipo_tarea: documentacion` → cargar `documentacion/` si existe + `root:`.
- `tipo_tarea: frente-investigacion` o `seccion-documento` → solo `root:`.

### Caso D: index.yml malformado o incompleto

Comportamiento: anunciar **"index.yml malformado: {detalle}. Continuo cargando solo `root:`."** Si root tambien falla: caso A.

### Caso E: standard listado en index.yml pero archivo no existe en disco

Comportamiento: anunciar **"index.yml referencia `{path}` pero el archivo no existe. Omitido."** Continuar con el resto. Sugerir al usuario ejecutar `/index-standards` para regenerar el indice.

### Caso F: tarea con `capa_seguridad.aplica: true`

Este caso es **invariante de primera clase** y NO se cubre por este reference. El patron de `permisos-repo.md` (Sentinel obligatorio + CS-2/CS-3 en E4) sigue su flujo propio. La carga de `agent-os/standards/security/permisos-repo.md` ocurre tambien aqui (dominio `security`), pero la **verificacion activa** es responsabilidad de Sentinel via `[VP]`, no de este mecanismo.

## Output esperado

Tras invocar este reference, el experto tiene:

1. Lista de paths absolutos a archivos `.md` cargados en contexto.
2. Conocimiento de que dominios fueron activados.
3. Cualquier hallazgo del proceso (caso D/E) registrado para anuncio al usuario si aplica.

Si el experto es Bob (E2-plan): persiste `standards_cargados[]` en frontmatter de la tarea materializada.

Si el experto es Amelia/Atlas (E3) o Quinn (E4): consume el output sin persistir (la lista ya esta en frontmatter desde E2, salvo fallback a inferencia on-the-fly cuando viene de work pre-2026-05-05b).

## Coexistencia con patron `permisos-repo.md`

Este reference **NO reemplaza** el patron de seguridad declarativo. Tabla de coexistencia:

| Aspecto | Standards generales (este reference) | Patron permisos-repo (existente) |
|---|---|---|
| Activacion | Inferencia desde paths | Declarativo: `capa_seguridad.aplica: true` |
| Experto invocado | Ningun experto especifico — los standards son lectura | Sentinel obligatorio cuando aplica |
| Verificacion en E4 | Quinn audita en CS-4 (cumplimiento general) | Sentinel ejecuta probes 401/403/200 (CS-2/CS-2b) |
| Bloqueo de cierre | No bloquea cierre por default (salvo hallazgo CS-4 de severidad ALTO, que dispara reevaluacion) | CS-2/CS-2b fallidos son bloqueantes |
| Tarea sin senal explicita | Carga dinamica via inferencia | No aplica |

**Regla de oro:** si el patron de permisos detecta una violacion, prevalece. La auditoria CS-4 (Quinn) NO duplica CS-2/CS-2b (Sentinel) — son verificaciones complementarias.

## Patrones de implementacion en cada experto

### Bob (E2 step-03-plan)

Invoca este reference en el Paso 0 antes de descomponer tareas. Cada tarea materializada lleva `standards_cargados[]` en frontmatter. La doctrina del sistema se carga por el Paso 4b y se anexa a ese mismo arreglo (determinista, no depende del bullet de cognicion del experto).

### Amelia/Atlas (E3 step-04-ejecucion)

Invocan este reference en el pre-flight de cada tarea. Si frontmatter ya tiene `standards_cargados[]`: solo leen los archivos (incluye doctrina si Bob la anexo por el Paso 4b). Si no (work pre-2026-05-05b): inferencia on-the-fly, incluyendo el Paso 4b.

### Quinn (E4 step-05-verificacion)

Invoca este reference para deduplicar `standards_cargados[]` de todas las tareas done. Carga una sola vez, incluida la doctrina resuelta por el Paso 4b. Sostiene durante Fase 2 (pruebas guiadas) + auditoria CS-4.

**Auditoria CS-4 (Quinn en E4):** tras CS-1/CS-2/CS-2b/CS-3, Quinn ejecuta CS-4 buscando violaciones de los standards cargados en archivos modificados. Severidades: ALTO (bloqueante meta -> reevaluar), MEDIO (informativo), BAJO (drift menor). NO sustituye CS-2/CS-2b -- son complementarias.

**Calibracion:** las violaciones de la doctrina de comentarios (`agent-os/doctrina/global/principios-ingenieria.md`, seccion "Comentarios: el por que, no el que") se reportan como **MEDIO**. ALTO bloquearia un cierre por un comentario sobrante, desproporcionado; BAJO haria que nunca se corrija.

### Atlas sabueso (steps-bugfix)

Invoca este reference en step-01-investigacion despues de identificar archivos sospechosos. Standards cargados informan la propuesta de solucion en step-02 (publicada al usuario) y la validacion final en step-03.

## Referencias cruzadas

- Tabla de dominios canonicos: `agent-os/skills/destilar-standard/SKILL.md` seccion "Mapeo de dominios a rutas".
- Generacion de index.yml: la genera el instalador del sistema al desplegar el proyecto.
- Comando para regenerar indice: `commands/agent-os/index-standards.md`.
- Patron permisos-repo: `agent-os/standards/security/permisos-repo.md` + `agent-os/skills/cargar-standards/references/permisos-repo-detection.md`.
- Spec del work que introdujo este mecanismo: `agent-os/work-records/20260505-standards-dinamicos-en-steps/`.
