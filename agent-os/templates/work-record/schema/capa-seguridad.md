# Schema de frontmatter — Capa de seguridad (permisos)

> Fragmento de `frontmatter-schema.md` (ver indice). El bloque `capa_seguridad` por tarea y los campos de pre-requisito en el README del work.

## Capa de seguridad (permisos) (obligatorio desde 2026-04-26)

Aplicable al README.md del work-record (estado del pre-requisito) y al frontmatter de cada `etapa-2/tareas/{NNN}-*.md` (declaracion por metodo). Works iniciados antes de 2026-04-26 no tienen estos campos retroactivamente; works iniciados despues los exigen segun modo.

### En README.md del work-record

| Campo | Tipo | Valores | Descripcion |
|-------|------|---------|-------------|
| `permisos_repo_estado` | string | `documentado` \| `documentado_externo` \| `no_documentado` \| `no_aplica_por_modo` \| `override_usuario` | Estado del pre-requisito. Clasificado por el abordaje (Fase 2). Determina si Sentinel se invita como co-anfitrion de la pieza de plan (E2). |
| `permisos_repo_path` | string \| null | ruta relativa al repo | Solo si `permisos_repo_estado: documentado_externo`. Apunta al archivo donde el repo documenta el patron fuera de la ruta canonica `agent-os/standards/security/permisos-repo.md`. |
| `permisos_no_aplica` | boolean | `true` \| `false` \| ausente | `true` solo si el usuario declaro override explicito durante el abordaje (Fase 2) ("este work no aplica permisos"). Implica `permisos_repo_estado: override_usuario`. |
| `permisos_no_aplica_razon` | string | razon narrativa | Obligatorio si `permisos_no_aplica: true`. Quinn la revisa en E4 como decision auto-tomada que afecta meta. |
| `roster_e1_extra` | array | lista de slugs de expertos | Lista de invitados obligatorios que quien hospeda la pieza de plan (E2, Winston o Bob por default) debe sumar al iniciar. Hoy puede contener `sentinel` cuando `permisos_repo_estado: no_documentado`. Reservado a expansion futura. |

**Significado por valor de `permisos_repo_estado`:**

- `documentado` — `agent-os/standards/security/permisos-repo.md` existe y supera la heuristica de "documento sustantivo" (>300 chars no-template + secciones 3 y 5 pobladas). Caso normal.
- `documentado_externo` — patron documentado en otra ubicacion del repo. `permisos_repo_path` apunta al archivo. El abordaje propone migracion al lugar canonico (no bloqueante).
- `no_documentado` — archivo ausente o solo stub. Activa contingencia: Sentinel co-anfitrion obligatorio de la pieza de plan (E2, mision `[DP]`); si esa pieza no produce el documento, T-001 INDISPENSABLE-PRE-EJECUCION queda pendiente.
- `no_aplica_por_modo` — modo `investigacion` o `documentacion`; el flujo de permisos no se evalua.
- `override_usuario` — usuario declaro `permisos_no_aplica: true` con razon. Registrado como `[OVERRIDE]` en bitacora del abordaje.

### En frontmatter de cada `etapa-2/tareas/{NNN}-*.md`

Bloque `capa_seguridad` con declaracion por metodo. Bob lo pobla en E2 al materializar tareas con `tipo_tarea: codigo`. El default operativo es **restriccion-acceso a nivel endpoint/controller**; `modulacion-comportamiento` en BL es la excepcion para casos donde el permiso altera el flujo sin negar el acceso.

```yaml
capa_seguridad:
  aplica: true                          # false solo con justificacion explicita
  dominios: ["cripto"]                  # opcional; dominios de seguridad adicionales que exigen sign-off propio
  metodos:
    - endpoint: "POST /api/empresa/Tercero/Crear"   # o nombre BL/Service si naturaleza:modulacion
      naturaleza: "restriccion-acceso"               # restriccion-acceso | modulacion-comportamiento
      capa: "controller"                              # controller | endpoint-api | service | bl | sp | hub
      accion_crud: "create"                           # create | read | update | delete | execute | transversal
      requiere_permiso: true
      decision_permiso: "reutilizar"                  # reutilizar | nuevo
      permiso_codigo: "EA020"
      permiso_descripcion: "Crear terceros en empresa"
      sesion_aplicable: "UsuarioEmpresaSesion"        # UsuarioEmpresaSesion | UsuarioTerceroSesion | RegistryEndpoint | publico
      justificacion_si_publico: null                  # obligatorio si requiere_permiso=false
      modula_que: null                                # solo si naturaleza:modulacion-comportamiento
      origen_decision: "T-003-CA-007"                 # tarea/CA que motivo el endpoint
  aplica_a_todos_los_metodos_del_archivo: false       # atajo opcional para Controllers homogeneos
  archivo_grupal: null                                 # ruta si atajo true
  permisos_nuevos_a_crear:
    - codigo: "EA047"
      descripcion: "Aprobar facturas en lote"
      dominio: "EA"
      registro_en: "agent-os/standards/security/permisos-repo.md catalogo-vivo"
  notas_de_aplicacion: |
    {Excepciones, dependencias, razon de reutilizar/crear}
```

**Reglas de validacion (Bob las aplica al materializar):**

- `aplica: true` para toda tarea con `tipo_tarea: codigo` cuando `permisos_repo_estado` no es `no_aplica_por_modo` ni `override_usuario`. Para declarar `aplica: false`, justificar en `notas_de_aplicacion`.
- `accion_crud in [create, update, delete]` con `naturaleza: restriccion-acceso` → `requiere_permiso: true` salvo override con `justificacion_si_publico` explicita.
- `naturaleza: modulacion-comportamiento` → `modula_que` obligatorio (no puede ser null ni vacio).
- `permiso_codigo` debe matchear el regex declarado en seccion 3 del standard del repo.
- Si `decision_permiso: reutilizar`, el codigo debe existir en seccion 4 (catalogo vivo) del standard. Si no existe, Bob lo trata como `nuevo` y pide confirmacion.
- `permisos_nuevos_a_crear` se preanuncia en E2 dentro de `etapa-2/03-plan.md`, pero el delta se aplica al standard en E3 (atomico con el commit del codigo que crea el permiso).
- `dominios` (opcional, lista de strings): dominios de seguridad adicionales de la tarea. Valor conocido: `cripto` (firma digital, estampa de tiempo, PKI, llaves, cifrado, hashing de credenciales). Si contiene `cripto`: (1) Bob invita a Cipher a co-disenar el bloque en E2, (2) en E3 el cierre de la tarea exige sign-off de Cipher ADEMAS del de Sentinel, (3) en E4 Quinn invita a Cipher para la auditoria CR-N. Ausencia del campo = tarea sin dimension criptografica (works existentes no requieren migracion). En el cierre (works v2), el runtime aplica el guard `CR_SIN_RESULTADO`: dominio `cripto` vigente sin `etapa-4/evidencia/cripto/` poblada bloquea `work close` (exencion: descarte del eje `cripto` con razon en `evidencia_requerida.descartes[]` + `[OVERRIDE]` en bitacora).

### Quien actualiza y consume

- `permisos_repo_estado`, `permisos_repo_path`, `permisos_no_aplica`, `permisos_no_aplica_razon`, `roster_e1_extra`: work durante el abordaje (Fase 2).
- `capa_seguridad` en tareas: Bob al materializar tareas en E2 (asistido por Sentinel si esta invitado).
- Quien hospeda la pieza de plan (E2, Winston o Bob por default): consume `permisos_repo_estado` y `roster_e1_extra` al activarse.
- Anfitrion de E3 (Amelia/Atlas): consume `capa_seguridad` de cada tarea como mapa endpoint→permiso al iniciar la etapa.
- Quinn en E4: consume `capa_seguridad` para CS-1/CS-2/CS-2b/CS-3.
- Sentinel: lee el standard del repo al activarse en cualquier etapa y valida coherencia entre bloques `capa_seguridad` y catalogo vivo.
- Cipher: lee `dominios` de cada tarea; si contiene `cripto`, co-disena el bloque en E2, emite sign-off en E3 y produce la auditoria CR-N en E4. Protocolo de juntura con Sentinel/Dexter: ver `agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md`.

### etapa-1/01-discovery.md (adicional)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `direccionElegida` | string/null | ID de la direccion elegida por el usuario en el gate de Etapa 1 (short-list). Solo presente en works legacy con `modo: evolucion` (deprecado); la ruta vigente `rediseno-ui` tiene su propio flujo de 4 fases y no usa este archivo. |

### etapa-2/tareas/{NNN}-{nombre}.md (adicionales)

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `invariantes` | array | Lista de IDs de invariantes (INV-NNN) que la tarea debe respetar. Solo presente cuando aplica — no vacio. |
| `migracion_progresiva` | boolean | `true` si la tarea proviene de una decision MIGRAR PROGRESIVO de la matriz. Solo presente cuando aplica. |

### _catalogo.yml

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `modo` | string | Uno de `normal`, `evolucion` (deprecado, legacy), `investigacion`, `documentacion`, `hotfix`. Refleja el `modo` del README del work. Permite filtrar el catalogo por modo. |

---

### etapa-1/01-discovery.md

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `rondasCompletadas` | number | Rondas de discovery ejecutadas |

### etapa-2/02-opciones.md

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `opcionElegida` | string/null | Nombre de la opcion seleccionada por el usuario |

### etapa-2/03-plan.md

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `tareasGeneradas` | number | Cantidad de tareas generadas en etapa-2/tareas/ |

### etapa-2/tareas/{NNN}-{nombre}.md

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `cas` | array | IDs globales de CAs que implementa (CA-NNN) |

### etapa-4/07-verificacion.md

Solo campos comunes. El detalle de verificacion esta en el contenido del artefacto.

