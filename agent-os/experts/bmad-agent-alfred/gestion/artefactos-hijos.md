# Materializar artefactos hijos via runtime (work file create / set-fm)

Los artefactos hijos del work-record/diseño con frontmatter (tareas, plan,
verificación, datos.md) los crean y mutan los expertos **a través del binario**,
no a mano. El binario valida el frontmatter contra el schema del `file_type`,
estampa `file_type`, y escribe atómico dentro de la jaula del work. Patrón
(lo reusan Bob, los ejecutores, Quinn y Dexter):

1. **Detectar el binario:** buscar `.claude/agent-os-bin/agentos` (o `agentos.exe`
   en Windows). Si NO existe: informar "Runtime de agent-os requerido para
   materializar artefactos. Reinstala el runtime de agent-os (instalador del paquete)." y NO crear/
   mutar a mano (sin fallback en Write).
2. **Crear** (frontmatter validado + cuerpo completo, en una operación): escribir el
   JSON al scratchpad de la sesion y pasar `--input <ruta>` (recomendado); el JSON por
   stdin sigue siendo valido para invocaciones simples:
   `agentos work file create --input <ruta-json>`
   (JSON: `{"work_slug":"<slug>","ruta_relativa":"<ruta dentro del work>","file_type":"<tipo>","frontmatter":{...},"contenido":"<cuerpo markdown completo>"}`;
   equivalente por stdin: `echo '...' | agentos work file create`.)
3. **Mutar frontmatter** (preserva el cuerpo): mismo criterio — `--input <ruta>`
   recomendado, stdin valido en invocaciones simples:
   `agentos work file set-fm --input <ruta-json>`
   (JSON: `{"work_slug":"<slug>","ruta_relativa":"<ruta>","frontmatter":{<solo los campos a cambiar>}}`;
   equivalente por stdin: `echo '...' | agentos work file set-fm`.)
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->
4. **Parsear** `{ok, data}`: si `ok:false`, mostrar `error.mensaje` y detenerse
   (`SCHEMA` = frontmatter inválido contra el schema; `FILE_TYPE` = tipo
   desconocido; `EXISTE` = el archivo ya existe; `JAULA` = ruta fuera del work).
   Si `ok:true`, continuar.

**Los `file_type` de los artefactos hijos** (registrados en el runtime):

| Artefacto | `file_type` | ruta_relativa típica | Quién |
|---|---|---|---|
| Tarea | `tarea-etapa-2` | `etapa-2/tareas/T-NNN-{nombre}.md` | Bob crea; ejecutores mutan `status` NO terminal (`in_progress`/`blocked`) via `set-fm`. Los cierres terminales (`done`/`done_con_brecha`/`deferido`) van SOLO por `work tarea ejecutor` (ver etapa-3.md seccion "Marcar cierre (runtime, via unica)") |
| Plan | `plan-etapa-2` | `etapa-2/03-plan.md` | Bob |
| Verificación | `verificacion-etapa-4` | `etapa-4/07-verificacion.md` | Quinn |
| Datos (diseño) | `diseno-datos` | `agent-os/disenos/{slug}/datos.md` | Dexter (ver nota) |

**Cuerpo vs frontmatter:** `create` lleva el cuerpo inicial completo en `contenido`.
El binario gobierna **las dos capas**: el frontmatter con `create` + `set-fm`, y cada
sección del cuerpo con `set-section` (stdin `{..._slug, ruta_relativa, seccion,
contenido}`), que reemplaza o inserta esa sección sin tocar las hermanas. `set-fm` solo
toca frontmatter y preserva el cuerpo. **No se usa Edit ni Write sobre un artefacto que
tiene verbo.**

Dos secciones quedan fuera de `set-section` y no por omisión: `## Ejecutor` y
`## Verificador` de una tarea las escribe EXCLUSIVAMENTE `work tarea
ejecutor|verificador` — ver `agent-os/skills/host-protocol/etapas/etapa-2.md`.

**Nota sobre datos.md del diseño:** vive en `agent-os/disenos/{slug}/`, fuera de la jaula
de `work file` (que opera en `work-records/`), y tiene sus propios verbos: se crea con
`diseno file create` (`file_type: diseno-datos`, registrado en el runtime), su frontmatter
se fusiona con `diseno file set-fm` y su cuerpo con `diseno file set-section`. Los verbos
del lado diseño (`create`, `set-fm`, `set-section`, `rm`, `mv`) son gemelos de los del
work y se invocan igual, cambiando `work_slug` por `diseno_slug`.

Los schemas de cada `file_type` viven en el runtime (verbos `work file create`/`work file set-fm`). Aqui solo se documenta como los expertos invocan los verbos; NO duplicar los schemas -- para modificar campos, editar el runtime.
