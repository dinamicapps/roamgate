# Setear campos del work-record via runtime (work set-fm)

Algunos campos **deterministas** del frontmatter del README **raiz** del work se
mutan a traves del binario, no a mano. El binario valida el frontmatter resultante
contra el schema `readme-work` (tipo/enum), escribe atomico y preserva el cuerpo.
A diferencia de `work file set-fm` (que opera sobre artefactos **hijos** con su
propio `file_type`), `work set-fm` opera sobre el **README raiz**. Patron (lo
reusan Quinn al cerrar investigacion y Sentinel al documentar permisos):

1. **Detectar el binario:** buscar `.claude/agent-os-bin/agentos` (o `agentos.exe`
   en Windows). Si NO existe: informar "Runtime de agent-os requerido para setear
   campos del work. Reinstala el runtime de agent-os (instalador del paquete)." y NO editar a mano
   (sin fallback en Edit/Write).
2. **Invocar** (uno o varios campos en un JSON): escribir el fragmento al scratchpad
   y pasar `--input <ruta>` (recomendado para fragmentos grandes):
   `agentos work set-fm --slug <slug> --input <ruta-json>`
   (equivalente por stdin, valido para fragmentos simples:
   `echo '{"<campo>":<valor>,...}' | agentos work set-fm --slug <slug>`.)
   <!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/readme.md seccion "Contrato de insumo (--input vs stdin)". NO duplicar. -->
3. **Parsear** `{ok, data}`: si `ok:false`, mostrar `error.mensaje` y detenerse
   (`SCHEMA` = el valor viola el tipo/enum del schema; `CAMPO` = se intento setear
   `estado`, que va por `transition`/`close`; `NO_EXISTE` = slug desconocido).
   Si `ok:true`, continuar.

**Campos deterministas gobernados por `work set-fm`** (validados contra el schema):

| Campo | Tipo/enum | Quien lo setea |
|---|---|---|
| `disponible_como_insumo` | bool | Quinn/Alfred al cerrar work `investigacion` como COMPLETADO |
| `consumidores` | sequence de slugs | idem (se inicializa `[]`) |
| `permisos_repo_estado` | enum: `documentado` \| `documentado_externo` \| `no_documentado` \| `no_aplica_por_modo` \| `override_usuario` | Alfred lo clasifica en el abordaje, Fase 2 (heuristica de `agent-os/skills/cargar-standards/references/permisos-repo-detection.md`); si `no_documentado`, se actualiza tras la pieza de plan donde Sentinel co-anfitriona (`[DP]`) |
| `permisos_repo_path` | string \| null | idem, si `documentado_externo` |
| `permisos_no_aplica` | bool | abordaje, Fase 2 (junto a la clasificacion de `permisos_repo_estado`), override del usuario |
| `permisos_no_aplica_razon` | string \| null | idem |

**Que NO va por `work set-fm`:**
- `estado`: lo rechaza el binario (`CAMPO`). Va por `transition`/`close`.
- `modo`/`nivel`/`tipo` (y `conversacion` legacy): tienen `work set --campo <c> --valor <v>` (efecto de catalogo).
- Artefactos hijos (tareas, plan, verificacion, datos.md): `work file create`/`work file set-fm`.

El schema de cada campo (que campos son deterministas y sus enums) vive en el runtime (verbo `work set-fm`). Aqui solo se documenta como los expertos invocan el verbo; NO duplicar el schema -- para modificar campos/enums, editar el runtime.
