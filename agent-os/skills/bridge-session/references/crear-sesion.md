# Fase 1: Establecimiento de Sesion

## Objetivo

Crear el grupo en el bridge con gobernanza completa, o unirse a uno existente. Al terminar esta fase, ambas instancias tienen el mismo entendimiento de reglas, roles y limites.

## Flujo

### Si esta instancia inicia la sesion (Director)

1. Preguntar al usuario el objetivo de la coordinacion:

   AskUserQuestion:
     question: "Describe el objetivo de la coordinacion multi-sistema. Que se va a probar o desarrollar?"

2. Preguntar intencion inicial:

   **Atajo:** si la skill fue invocada desde `/alfred` con `modo: investigacion` y `sub_modo: multi-repo`, el manifiesto cargado en Fase 0 tiene `tipo: "investigacion-multi-repo"`. En ese caso la intencion ya esta decidida — saltar este AskUserQuestion y proceder con `estado_grupo = "exploracion"` y `tipo_grupo = "investigacion-multi-repo"`. Los colaboradores SI crean fastrak al unirse (variante research, no prueba).

   AskUserQuestion (solo si no es atajo):
     question: "Cual es la intencion inicial del grupo?"
     options:
       - label: "Exploracion multi-repo (recomendado)"
         description: "Todavia no sabemos que probar. Vamos a dialogar, verificar endpoints, discutir contratos. Los colaboradores NO crean fastrak al unirse. El grupo promueve a 'acordado' cuando el checklist pasa."
       - label: "Sesion de prueba directa (solo si ya hay manifiesto acordado)"
         description: "Ya existe contrato estable, plan de prueba y CAs. Requiere grupo en estado 'acordado'. Colaboradores crean fastrak. Flujo: Fase 2-6 ISO-29119."
       - label: "Investigacion multi-repo coordinada"
         description: "Ambos repos analizan su lado de una integracion existente y comparten hallazgos. NO es prueba — es research compartido. El director produce brief-repo-director + brief-devs (ejecutivo); el colaborador produce solo brief-repo-colaborador. Colaboradores crean fastrak research al unirse. Cierre cuando ambos briefs por repo estan publicados y el director consolido el brief-devs."

   Si "Exploracion multi-repo":
     estado_grupo = "exploracion"
     tipo_sesion_continua = null (se decide al promover a acordado)
     tipo_grupo = "exploracion"
   Si "Sesion de prueba directa":
     estado_grupo = "acordado" (requisito)
     tipo_grupo = "prueba"
     Preguntar:
       AskUserQuestion:
         question: "Tipo de sesion de prueba:"
         options:
           - label: "Pruebas con ajustes"
             description: "Sistemas ya implementados. Probar integraciones y ajustar lo necesario."
           - label: "Desarrollo con pruebas en caliente"
             description: "Implementando feature que cruza sistemas. Desarrollo y pruebas en tiempo real."
   Si "Investigacion multi-repo coordinada":
     estado_grupo = "exploracion"
     tipo_grupo = "investigacion-multi-repo"
     fases_aplicables = ["F0-explorar-codebase", "F1-intercambio-hallazgos", "F2-revision-cruzada", "F3-cierre-consolidacion"]
     # NO aplican Fase 2-6 ISO-29119 (plan-prueba, datos-compartidos, ejecucion,
     # evidencia, reporte). El flujo investigativo lo conduce Mary en E3 del
     # work director / colaborador, no las fases de bridge-session.

3. Definir reglas del grupo con el usuario:

   a. **Alcance:** Usar la descripcion del objetivo como regla tipo `alcance`.

   b. **Archivos protegidos:**
   AskUserQuestion:
     question: "Archivos o carpetas que NO se deben modificar en NINGUN repo (ej: Auth/**, *.csproj, Middleware/Authentication/**). Separar con comas. Dejar vacio si no aplica."

   c. **Decisiones reservadas al usuario:**
   AskUserQuestion:
     question: "Decisiones que SOLO el usuario humano puede tomar (ej: cambiar patron de autenticacion, modificar schema BD, cambiar contratos API). Separar con comas."

   d. **Direccion arquitectonica fija (opcional):**
   AskUserQuestion:
     question: "Decisiones ya tomadas que NO estan sujetas a debate (ej: se usa JWT estandar de DinamicCOM). Dejar vacio si no aplica."

4. Crear grupo en el bridge:

   ```
   bridge_crear_grupo(
     nombre: "{nombre descriptivo}",
     descripcion: "{objetivo}",
     reglas: [
       {tipo: "alcance", valor: "{alcance}"},
       {tipo: "archivo_protegido", valor: "{patron}"},   // uno por cada patron
       {tipo: "decision_reservada", valor: "{decision}"}, // una por cada decision
       {tipo: "direccion_arquitectonica", valor: "{direccion}"} // si aplica
     ],
     rol_default: "colaborador",
     metadata: {
       "estado_grupo": "exploracion",  // o "acordado" para prueba directa
       "tipo_grupo": "exploracion"     // "exploracion" | "prueba" | "investigacion-multi-repo"
     }
   )
   ```

5. Registrar punto de restauracion git:
   ```
   commit_actual = ejecutar "git rev-parse HEAD"
   branch_actual = ejecutar "git branch --show-current"
   ```
   Registrar en bitacora:
   ```markdown
   ## [Orquestador] Sesion bridge establecida
   fecha: {timestamp}
   bridge_grupo: {id}
   bridge_nombre: {nombre}
   rol: director
   tipo_sesion: {pruebas-con-ajustes | desarrollo-con-pruebas}
   punto_restauracion:
     commit: {hash}
     branch: {branch}
   reglas: {resumen}
   ```

6. **Subir manifiesto al grupo (obligatorio).**

   El manifiesto es el contrato base del grupo. Se sube inmediatamente despues
   de crear el grupo y antes de emitir la invitacion: si el colaborador se une
   antes de que el manifiesto este publicado, descargara un grupo vacio.

   ```
   resultado_manifiesto = bridge_subir_adjunto(
     id_grupo: {id},
     ruta: "{path-al-manifiesto.yml}",
     nombre: "manifiesto.yml",
     destinatarios: omitir,        # broadcast; aun no hay colaboradores resolvibles
     tipo: "manifiesto",
     sobrescribir: false,           # primera version
     changelog_entry: "v1: manifiesto inicial del grupo"
   )

   bridge_publicar(
     id_grupo: {id},
     tipo: "contexto",
     mensaje: "MANIFIESTO v1 publicado.",
     adjunto_id: resultado_manifiesto.adjunto_id,
     metadata: '{"subtipo": "manifiesto-inicial"}'
   )
   ```

   Recordar invariante: bridge_subir_adjunto + bridge_publicar son operacion
   logica unica. El bridge purga adjuntos sin mensaje asociado tras 3600s.

7. **Subir brief si el work tiene diseno_origen (condicional).**

   Si el work tiene campo `diseno_origen` poblado en su README y existe el
   archivo `agent-os/disenos/{diseno_origen}/brief.md`, subirlo:

   ```
   resultado_brief = bridge_subir_adjunto(
     id_grupo: {id},
     ruta: "agent-os/disenos/{diseno_origen}/brief.md",
     nombre: "brief.md",
     destinatarios: omitir,
     tipo: "contexto-soporte",
     sobrescribir: false,
     changelog_entry: "v1: brief del diseno origen del work director"
   )

   bridge_publicar(
     id_grupo: {id},
     tipo: "contexto",
     mensaje: "BRIEF v1 publicado (diseno origen del work director).",
     adjunto_id: resultado_brief.adjunto_id,
     metadata: '{"subtipo": "brief-diseno"}'
   )
   ```

   Si el work NO viene de /disenar (sin `diseno_origen`), saltar este paso
   sin error.

8. **Preguntar archivos adicionales del alcance del grupo (opcional).**

   AskUserQuestion:
     question: "Hay archivos adicionales que el grupo necesita ver desde el inicio (contratos externos, mockups, especificaciones, etc.)? Indica paths separados por coma. Dejar vacio si no aplica."

   Para cada path indicado, validar que el archivo existe localmente. Si
   no existe, advertir al usuario y permitir reintentar o saltar ese path.
   Para cada archivo valido, ejecutar bridge_subir_adjunto + bridge_publicar
   con `tipo: "contexto-soporte"` y `nombre` igual al basename del path.
   Acumular paths exitosos en `archivos_subidos[]` para incluir en la
   invitacion.

9. **Detectar ecosistema del colaborador.**

   AskUserQuestion:
     question: "El o los colaboradores que se uniran a este grupo, ¿usan agent-os-dinamicapps en su repo?"
     options:
       - label: "Si, usan agent-os"
         description: "Reciben invitacion con comando directo /bridge-session unirse {UUID}. Flujo formal del skill."
       - label: "No / no estoy seguro"
         description: "Reciben invitacion con instrucciones manuales explicitas (asume menos del entorno del colaborador)."
       - label: "Mixto (algunos si, otros no)"
         description: "Recibe la version mas explicita (instrucciones manuales). Quien tenga agent-os puede inferir el comando."

   Guardar la respuesta como `ecosistema_colaborador in [agent-os | manual | mixto]`.

### Invitar por discovery (P3, si el MCP lo expone)

Camino primario cuando el colaborador ya tiene su sesion Claude conectada al bridge:
1. `bridge_listar_instancias` → lista instancias conectadas con su `disponibilidad`.
2. Presentar al usuario (AskUserQuestion) las instancias conectadas+disponibles como
   opciones — sin comando nuevo. Nunca ofrecer una instancia `no_disponible`.
3. Al elegir destino: `bridge_invitar { destino: <instancia_id>, id_grupo, rol }`. La
   invitacion llega por push; el invitado decide con `bridge_unirse` (no se auto-une).

Fallback: si `bridge_invitar`/`bridge_listar_instancias` NO estan en las tools del MCP, o
no hay instancia conectada (cold-start), usar el bloque copy/paste (Variantes A/B abajo).
<!-- Detalle en el repo del bridge: claude-mcp-bridge/docs/uso-bridge-para-agent-os.md seccion 6. Contrato formal del bridge, repo externo (ni nebulosa ni consumidor); NO duplicar — editar allá. -->

10. **Emitir invitacion lista para pegar al usuario.**

    Construir el bloque de invitacion segun el `ecosistema_colaborador`
    detectado en paso 9. Imprimirlo en pantalla. NO se guarda en archivo
    (decision del usuario: solo pantalla).

    ### Variante A — `ecosistema_colaborador: "agent-os"`

    ```
    ============================================================
    INVITACION GRUPO BRIDGE
    ============================================================

    Copia este bloque completo y pegalo en la sesion de Claude del otro repo
    (asegurate que claude-bridge MCP este conectado en ese repo: ejecuta
    `bridge_estado` y debe responder).

    ------------------------------------------------------------
    /bridge-session unirse {UUID}

    Grupo: "{nombre-del-grupo}"
    Director: {nombre-instancia-director}
    Estado del grupo: {exploracion | acordado}
    {Si acordado:} Tipo de sesion: {pruebas-con-ajustes | desarrollo-con-pruebas}

    Objetivo:
    {objetivo del grupo en 1-2 lineas}

    Archivos publicados ({N} disponibles para descarga al unirse):
    - manifiesto.yml v1 (hash: {hash-corto})
    {si subio brief:}
    - brief.md v1 (hash: {hash-corto})
    {por cada archivo adicional:}
    - {nombre} v1 (hash: {hash-corto})

    Reglas del grupo:
    - Alcance: {alcance}
    {por cada archivo protegido:}
    - Archivo protegido: {patron}
    {por cada decision reservada:}
    - Decision reservada al usuario: {decision}
    {si hay direccion arquitectonica:}
    - Direccion arquitectonica fija: {direccion}

    Al ejecutar /bridge-session unirse {UUID} en tu repo, el skill te pedira:
    - Identidad: se deriva sola, determinista por sesion (no tecleas nada).
      Varias sesiones del mismo repo coexisten como nombre#session_corto.
      (Consumidores no-Claude como Codex: setear BRIDGE_SESSION_ID.)
    - Alcance local: que va a hacer tu instancia en el grupo.
    - Restricciones: acciones que tu instancia NO puede hacer.
    - Acciones que requieren autorizacion del director antes de ejecutar.

    Tras unirte, el manifiesto y los archivos publicados se descargan
    automaticamente. En modo channel (default) los mensajes del grupo llegan
    solos como <channel ...> — NO necesitas /loop. (Solo si tu instalacion
    esta en modo polling, jala con bridge_leer.)
    ------------------------------------------------------------
    ============================================================
    ```

    ### Variante B — `ecosistema_colaborador: "manual"` o `"mixto"`

    ```
    ============================================================
    INVITACION GRUPO BRIDGE (instrucciones manuales)
    ============================================================

    Copia este bloque completo y enviaselo a la(s) persona(s) que conducen
    los otros repos. Quien lo reciba debe tener Claude Code abierto en su
    repo con el MCP claude-bridge conectado (ejecutar `bridge_estado` y
    debe responder).

    ------------------------------------------------------------
    Te invito a un grupo bridge para coordinar trabajo entre nuestros sistemas.

    DATOS DEL GRUPO:
    - UUID: {UUID}
    - Nombre: "{nombre-del-grupo}"
    - Director: {nombre-instancia-director}
    - Estado del grupo: {exploracion | acordado}
    {si acordado:} - Tipo de sesion: {pruebas-con-ajustes | desarrollo-con-pruebas}

    OBJETIVO:
    {objetivo del grupo en 1-2 lineas}

    ARCHIVOS PUBLICADOS QUE NECESITAS LEER ({N} archivos):
    - manifiesto.yml v1 (hash: {hash-corto}) — contrato base del grupo
    {si hay brief:}
    - brief.md v1 (hash: {hash-corto}) — diseño origen del work director
    {por cada archivo adicional:}
    - {nombre} v1 (hash: {hash-corto}) — {tipo o descripcion breve}

    REGLAS DEL GRUPO (compromiso al unirte):
    - Alcance: {alcance}
    {por cada archivo protegido:}
    - NO modificar: {patron}
    {por cada decision reservada:}
    - Decision reservada al usuario humano: {decision}
    {si hay direccion arquitectonica:}
    - Direccion arquitectonica fija (no debatible): {direccion}

    PASOS PARA UNIRTE (sin agent-os):

    1. Verifica que claude-bridge MCP esta conectado:
       En Claude Code, ejecutar la herramienta bridge_estado. Debe responder
       sin error. Si falla, conectar con:
         claude mcp add -s user claude-bridge -- bun run {ruta}/src/server.ts

    2. Unirte al grupo con bridge_unirse:
       bridge_unirse(
         id_grupo: "{UUID}",
         identidad: "{nombre-de-tu-repo}",
         alcance: "{que va a hacer tu instancia — ej: probar endpoint de
                    autologin, revisar contrato de epicrisis}",
         restricciones: ["{acciones que NO puedes hacer}"],
         requiere_autorizacion: ["{acciones que necesitan OK del director
                                 antes de ejecutar}"]
       )

    3. Descargar archivos publicados:
       bridge_listar_adjuntos(id_grupo: "{UUID}", destinatario: "mios")
       Por cada archivo listado:
         bridge_leer_archivo(id_grupo: "{UUID}", nombre: "{nombre}", version: "ultima")

    4. Confirmar recepcion al grupo:
       bridge_publicar(
         id_grupo: "{UUID}",
         tipo: "contexto",
         mensaje: "Me uni como colaborador. Manifiesto y archivos descargados.
                   Mi alcance: {alcance}. Quedo a la espera."
       )

    5. Recepcion de mensajes (push-first):
       En modo channel (default desde el rediseno 2026-06), los mensajes del grupo
       LLEGAN SOLOS como <channel source="claude-bridge" grupo="..." from="..."
       tipo="..." msg_id="...">contenido</channel> — NO hace falta /loop. Procesa
       cada <channel> y responde con bridge_publicar (usa respuesta_a con el msg_id).
       Solo si la instalacion esta en modo polling (o el channel se degrada, verificable
       con bridge_estado), activa el loop de pull como fallback:
       /loop 1m "Usa bridge_leer del grupo {UUID} con recientes:true y limite:5.
                 Si hay mensajes de otros miembros que no hayas visto ni
                 respondido, procesalos y responde con bridge_publicar.
                 Si el ultimo mensaje es tuyo o ya respondiste, no digas nada."

    Cualquier cambio que requiera modificar archivos protegidos o tomar
    decisiones reservadas se canaliza por bridge_publicar tipo "request"
    al director, no se hace directamente.
    ------------------------------------------------------------
    ============================================================
    ```

    Tras imprimir la invitacion, registrar en bitacora:

    ```markdown
    ## [Orquestador] Invitacion emitida
    fecha: {timestamp}
    bridge_grupo: {UUID}
    archivos_publicados:
      - manifiesto.yml v1 ({hash-corto})
      {si aplica:} - brief.md v1 ({hash-corto})
      {por cada adicional:} - {nombre} v1 ({hash-corto})
    ecosistema_colaborador: {agent-os | manual | mixto}
    variante_invitacion: {A | B}
    ```

### Si esta instancia se une (Colaborador)

1. Pedir ID del grupo al usuario:
   AskUserQuestion:
     question: "ID del grupo al que unirse (UUID proporcionado por la otra instancia):"

2. Preguntar alcance y restricciones de esta instancia:

   AskUserQuestion:
     question: "Que va a hacer esta instancia en la sesion? (ej: revisar endpoint de autologin, probar flujo de epicrisis)"

   AskUserQuestion:
     question: "Acciones que esta instancia NO puede hacer bajo ninguna circunstancia (ej: no modificar middleware de autenticacion). Separar con comas."

   AskUserQuestion:
     question: "Acciones que necesitan aprobacion del Director antes de ejecutar (ej: agregar dependencias, cambiar contratos API). Separar con comas."

3. Unirse al grupo:
   ```
   bridge_unirse(
     id_grupo: "{id}",
     identidad: "{nombre-del-proyecto}",
     alcance: "{alcance}",
     restricciones: ["{cada restriccion}"],
     requiere_autorizacion: ["{cada accion}"]
   )
   ```

4. La respuesta de `bridge_unirse` incluye las reglas del grupo. Presentarlas al usuario:
   ```
   === REGLAS DEL GRUPO ===
   Alcance: {alcance}
   Archivos protegidos: {lista}
   Decisiones reservadas: {lista}
   Direccion arquitectonica: {lista}
   Tu rol: Colaborador
   ```

5. **Descargar archivos publicados por el director.**

   Al unirse, hay manifiesto + posibles archivos adicionales (brief, contratos,
   mockups) que el director publico antes de emitir la invitacion. Listarlos
   y descargarlos:

   ```
   adjuntos = bridge_listar_adjuntos(
     id_grupo: "{id}",
     destinatario: "mios",         # broadcast + dirigidos a mi
     solo_ultima_version: true
   )
   ```

   Para cada adjunto:
   ```
   contenido = bridge_leer_archivo(
     id_grupo: "{id}",
     nombre: "{adjunto.nombre}",
     version: "ultima"
   )
   guardar_local(ruta: "agent-os/work-records/{nombre-director}-colaborador/etapa-0/bridge-archivos/{adjunto.nombre}", contenido)
   ```

   Validar el manifiesto descargado: `manifiesto_version`, `objetivo`,
   `alcance`, `emitido`, `hash` deben estar. Si falla, abortar union y
   notificar al director via `bridge_publicar tipo "request"` con error.

   Presentar al usuario:
   ```
   Archivos descargados ({N}):
     - manifiesto.yml v{N} -> agent-os/work-records/{nombre}-colaborador/etapa-0/bridge-archivos/manifiesto.yml
     {si aplica:} - brief.md v{N} -> {ruta}
     {por cada adicional:} - {nombre} v{N} -> {ruta}
   ```

6. Registrar punto de restauracion git (mismo que Director, paso 5).

7. Confirmar al grupo que se recibieron reglas y archivos:
   ```
   bridge_publicar(
     id_grupo,
     "contexto",
     "Me uni como Colaborador. Reglas recibidas. Mi alcance: {alcance}.
      Restricciones: {restricciones}. Archivos descargados: {N}
      (manifiesto.yml{, brief.md si aplica}{, ...}). Quedo a la espera."
   )
   ```

### Recepcion de mensajes (push-first; loop solo como fallback)

Desde el rediseno 2026-06 el transporte por default es **push** (modo channel): tras crear
o unirse, los mensajes del grupo **llegan solos** como `<channel ...>` y se procesan/responden
con `bridge_publicar`. **No sugieras `/loop` para recibir en modo channel** — es redundante
(el stream SSE ya entrega y marca leido).

Activa el loop de pull SOLO si la instalacion esta en modo polling, o como fallback puntual si
`bridge_estado` reporta el channel degradado:
```
/loop 1m "Usa bridge_leer del grupo {UUID} con recientes:true y limite:5.
Si hay mensajes de otros miembros que no hayas visto ni respondido,
procesalos y responde con bridge_publicar.
Si el ultimo mensaje es tuyo o ya respondiste, no digas nada."
```

Nota de identidad (2026-06): cada sesion tiene identidad propia y estable; **varias sesiones del
mismo repo coexisten** como miembros distintos (etiqueta `nombre#session_corto`). Al reconectar la
misma sesion se conserva membresia y cursor. Para consumidores no-Claude (Codex), setear
`BRIDGE_SESSION_ID` para identidad estable. Ver guia del bridge:
`claude-mcp-bridge/docs/uso-bridge-para-agent-os.md`.
