# Materializar y cerrar un hotfix via runtime

La ruta hotfix tiene paridad total con works: su ciclo open/transition/close lo
gobierna el binario, igual que un work normal, salvo que su artefacto raiz es
`bitacora.md` (no `README.md`) y su schema es `hotfix-maestra` (sin `ruta`, con
`frentes_*`). Atlas ya no crea la bitacora ni archiva a mano. Patron:

1. **Detectar el binario:** buscar `.claude/agent-os-bin/agentos` (o `agentos.exe`).
   Si NO existe: informar "Runtime de agent-os requerido para gestionar el hotfix.
   Reinstala el runtime de agent-os (instalador del paquete)." y NO crear/archivar a mano.
2. **Crear la maestra** (fase 3): escribir el JSON al scratchpad y pasar `--input <ruta>` (recomendado); stdin sigue valido para la invocacion simple:
   `agentos work open --slug <slug> --autor "<autor>" --modo hotfix --tipo hotfix --nivel normal --input <ruta-json>`
   JSON: `{"proveedor_ia":"claude","hotfix":{"contexto":"<descripcion del incidente>","disparado_por":"usuario","work_pausado":"<slug-pausado o vacio>"}}`.
   El binario hornea `bitacora.md` (con `modo:hotfix` en el frontmatter) y emite heartbeat; el catalogo no se escribe -- se deriva en memoria a partir del frontmatter en la siguiente lectura.
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->
3. **Frentes** (fase 4): cada `F{N}` es un artefacto hijo. Crear escribiendo el JSON
   al scratchpad y pasando `--input <ruta>` (recomendado; stdin valido en invocacion simple):
   `agentos work file create --input <ruta-json>`
   (JSON: `{"work_slug":"<slug>","ruta_relativa":"F{N}-<sintoma>.md","file_type":"hotfix-frente","frontmatter":{"frente":"F{N}","slug":"<sintoma>","tipo":"frente","sintoma_inicial":"...","estado":"abierto","fecha_apertura":"<ISO>"},"contenido":"<cuerpo>"}`;
   equivalente por stdin: `echo '...' | agentos work file create`.)
   Registrar el frente en la maestra (mismo criterio --input/stdin):
   `agentos work set-fm --slug <slug> --input <ruta-json>` (JSON: `{"frentes_abiertos":["F1","F2"]}`;
   equivalente: `echo '{"frentes_abiertos":["F1","F2"]}' | agentos work set-fm --slug <slug>`).
4. **Cerrar un frente** (fase 6): mutar su frontmatter (mismo criterio --input/stdin):
   `agentos work file set-fm --input <ruta-json>` (JSON: `{"work_slug":"<slug>","ruta_relativa":"F{N}-<sintoma>.md","frontmatter":{"estado":"cerrado","causa_raiz":"...","commit_cierre":"<hash>"}}`;
   equivalente por stdin: `echo '...' | agentos work file set-fm`),
   y mover `F{N}` en la maestra: `agentos work set-fm --slug <slug> --input <ruta-json>`
   (JSON: `{"frentes_abiertos":[...],"frentes_cerrados":[...]}`;
   equivalente: `echo '...' | agentos work set-fm --slug <slug>`).
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->
5. **Cerrar el hotfix** (fase 6): `agentos work close --slug <slug> --estado COMPLETADO`.
   El binario **rechaza** (`CIERRE`) si quedan `frentes_abiertos` no vacios (salvo `CANCELADO`),
   mueve la carpeta completa (bitacora + frentes) a `works-archivo/{AAAA}/{MM}/{autor-kebab}/`
   y emite heartbeat; el catalogo no se escribe (se deriva en memoria en la siguiente lectura).
6. **Pausar el work activo al disparar** (fase 2): `agentos work transition --slug <activo> --a PAUSADO`.
7. **Parsear** `{ok,data}` en cada invocacion: si `ok:false`, mostrar `error.mensaje` y detenerse
   (`OPEN`, `SCHEMA`, `CIERRE`, `JAULA`, `NO_EXISTE`, `FILE_TYPE`, `EXISTE`).

La raiz por modo, el horneado de la bitacora, los schemas `hotfix-maestra`/`hotfix-frente` y el guard de frentes abiertos al cierre viven en el runtime. Aqui se documenta como Atlas invoca los verbos; NO duplicar -- para modificar, editar el runtime.
