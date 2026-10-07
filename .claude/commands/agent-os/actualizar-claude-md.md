# Actualizar CLAUDE.md - Sincronizacion con el template del repo agent-os

Compara la version del `.claude/CLAUDE.md` del proyecto con la del template en el repo agent-os, muestra el changelog de cambios aplicables, y actualiza con confirmacion del usuario. Preserva contenido fuera del bloque delimitado por marcadores y detecta customizaciones locales dentro del bloque para ofrecer preservarlas.

## Uso

```
/agent-os-actualizar-claude-md
```

Sin argumentos. El comando descubre automaticamente las rutas.

## Cuando ejecutarlo

- Despues de un `git pull` en `~/agent-os` (u otra ubicacion del repo agent-os) para propagar cambios al proyecto actual.
- Cuando sospeches que tu `CLAUDE.md` quedo atras (ej. Claude menciona comandos o conceptos que no estan en tu archivo).
- Como verificacion periodica.

No se ejecuta automaticamente al abrir sesion por diseno — el disparo es manual opt-in.

## Flujo del comando

### Paso 0 — Resolver rutas

1. **Proyecto destino:** `{project-root}/.claude/CLAUDE.md`. Descubrir `project-root` con `git rev-parse --show-toplevel`. Si falla, abortar: *"El comando requiere un repositorio git. Ejecutalo desde un proyecto con agent-os instalado."*.

2. **Repo agent-os (`AGENT_OS_BASE`):** descubrir la ubicacion del clone agent-os-dinamicapps usando el siguiente orden de prioridad (primer match gana):

   **a) Archivo `.claude/.agent-os-base` del proyecto (preferido).** El installer lo escribe. Dos formatos:
   - **JSON (actual):** `{ "version": "vX.Y.Z|dev", "origen": "<ruta-o-URL>" }`. Leer `origen`. Si `origen` es una ruta local que contiene `{ruta}/templates/CLAUDE.md`, usarla como `AGENT_OS_BASE`. Si `origen` es una URL de release (instalacion desde paquete), la sincronizacion remota del template no esta cableada aun (frente SP3): informar al usuario y caer al fallback (b/c/d) o pedir la ruta.
   - **Ruta pelada (legacy):** una sola linea con la ruta absoluta del repo. Leerla y validar que contiene `{ruta}/templates/CLAUDE.md`. (Consumidores pre-SP2; SP4 migra el marcador a JSON.)

   **b) Variable de entorno `AGENT_OS_BASE`.** Si esta definida en el ambiente, leer su valor. Validar igual.

   **c) Ruta convencional `~/agent-os`.** Fallback historico. Validar igual.

   **d) Preguntar al usuario.** Si ninguno de los anteriores resolvio, hacer AskUserQuestion:
   ```
   No encontre automaticamente la ubicacion del repo agent-os-dinamicapps.
   Donde esta clonado en tu maquina?

   Rutas comunes:
     - tu carpeta de usuario de Windows + \agent-os
     - ~/agent-os (linux/mac)
     - la ruta completa del clone de este repo en tu maquina
   ```
   Con la respuesta, validar que existe `{ruta}/templates/CLAUDE.md`. Si valida, preguntar ademas:
   ```
   Quieres que guarde esta ruta en .claude/.agent-os-base para futuras ejecuciones?
   Asi no tengo que preguntarte la proxima vez.
   ```
   Si dice que si: escribir la ruta en `.claude/.agent-os-base`. (Esto regulariza proyectos instalados antes de que el installer registrara la ruta.)

3. **Template:** `{AGENT_OS_BASE}/templates/CLAUDE.md`.
4. **Changelog:** `{AGENT_OS_BASE}/templates/CLAUDE.md.CHANGELOG.md`.

**Nota sobre separadores de ruta:** en Windows, aceptar tanto rutas con `/` como con `\` (normalizar internamente a `/` para comparaciones). Guardar en `.agent-os-base` con el separador que el usuario escribio.

### Paso 1 — Leer versiones

Buscar `<!-- agent-os:version {VER} -->` en ambos archivos. Aceptar dos formatos:

- **Semver (actual):** regex `<!--\s*agent-os:version\s+v?(\d+)\.(\d+)\.(\d+)\s*-->`. Parsear a `(major, minor, patch)`.
- **Fecha (legacy, solo el proyecto):** regex `<!--\s*agent-os:version\s+(\d{4}-\d{2}-\d{2})\s*-->`. Un proyecto con marcador de fecha es una instalacion pre-semver: tratarlo como version `0.0.0` (mas vieja que cualquier semver real).

Reglas de ausencia:
- **Proyecto sin marcador de version:** instalacion pre-versionado. Tratar como `0.0.0`.
- **Template sin marcador semver:** el repo esta roto o desactualizado. Abortar: *"El template del repo agent-os no tiene marcador de version semver. Ejecuta `git pull` en el repo agent-os para actualizar."*.
- **Proyecto sin marcadores `agent-os:start/end`:** el CLAUDE.md no fue generado por agent-os o es muy antiguo. Ofrecer: (a) tratar todo el archivo como controlado por agent-os y reemplazar completo, (b) abortar para revision manual.

### Paso 2 — Comparar versiones

Comparar semver numericamente: primero `major`, luego `minor`, luego `patch`. Un proyecto con
marcador de fecha o sin marcador cuenta como `0.0.0`.

- **`version_proyecto == version_template`** (ambos semver iguales):
  Verificacion adicional de contenido. Extraer el bloque entre `<!-- agent-os:start -->` y
  `<!-- agent-os:end -->` de ambos. Normalizar: ignorar `{PROFILE_NAME}` vs perfil instalado,
  ignorar la linea de version, ignorar whitespace al final de lineas.

  - Bloques identicos: informar *"Tu CLAUDE.md esta al dia (version v{X.Y.Z}). No hay actualizaciones disponibles."* y terminar.
  - Bloques difieren: versiones iguales, contenido distinto. Advertir:
    ```
    Tu CLAUDE.md declara version v{X.Y.Z} igual al template, pero el contenido difiere.
    Diferencias detectadas: {N} lineas.

    Causas posibles:
      - El template se edito sin subir el semver (mal habito del contribuidor del repo agent-os).
      - Tu archivo tiene corrupcion (encoding mal convertido, bloque truncado).

    Puedo resincronizarte al contenido actual del template. ¿Procedo?
    ```
    Si confirma, saltar al Paso 4 y luego 5/6. Mencionar "sin changelog que mostrar, las versiones son iguales".

- **`version_template > version_proyecto`**: continuar al Paso 3. (Incluye el caso comun: proyecto
  con marcador de fecha [= 0.0.0] y template semver — la transicion fecha->semver cae aqui y se
  ofrece la actualizacion normalmente.)

- **`version_proyecto > version_template`** (ambos semver): abortar:
  ```
  Tu CLAUDE.md declara version v{proyecto} pero el template del repo esta en v{template}.
  Causas posibles:
    - Tu clone de agent-os esta desactualizado. Ejecuta `git pull` en el repo agent-os.
    - Alguien edito manualmente la version del proyecto.
  No sincronizo hasta resolver la inconsistencia.
  ```

### Paso 3 — Extraer entradas de changelog aplicables

Leer `{AGENT_OS_BASE}/templates/CLAUDE.md.CHANGELOG.md`. Desde v0.1.0 las entradas llevan encabezado
`## vX.Y.Z (YYYY-MM-DD)`. Las entradas legacy `## YYYY-MM-DD` (anteriores a v0.1.0) son historia
pre-semver y NO se usan para el rango.

Extraer todas las entradas semver con version **mayor que `version_proyecto`** y **menor o igual
que `version_template`** (rango `(proyecto, template]`). Comparar semver numericamente.

- Si `version_proyecto` es `0.0.0` (marcador de fecha o ausente): el rango cubre TODAS las entradas
  semver. La entrada `v0.1.0` explica la transicion fecha->semver; incluirla.
- Si hay >= 1 entradas: preparar texto narrativo con bullets principales (primera linea de cada item).
- Si hay 0 entradas semver coincidentes pero la version cambio: changelog desactualizado. Advertir:
  ```
  La version del template subio de v{proyecto} a v{template} pero no encontre entradas del
  changelog en ese rango. El changelog puede estar desactualizado.
  ```
  Continuar igual pero advertido.

### Paso 4 — Detectar anomalias en el bloque del proyecto

Extraer el contenido entre `<!-- agent-os:start -->` y `<!-- agent-os:end -->` de ambos archivos (proyecto y template).

Comparar linea por linea:
- Ignorar lineas en blanco y diferencias de whitespace.
- Ignorar la linea de `<!-- agent-os:version ... -->` (cambia siempre por diseno).
- Ignorar el valor de `{PROFILE_NAME}` si aparece reemplazado en el proyecto (ej. `dotnet-react` en proyecto vs `{PROFILE_NAME}` en template).
- Listar las **lineas con contenido sustantivo** presentes en el proyecto pero NO en el template. Esas son posibles customizaciones locales del usuario.

Heuristica de "linea sustantiva": una linea cuenta como tal si cumple las siguientes 4 condiciones:

1. **No esta vacia:** no es una linea en blanco ni solo espacios.
2. **No es artefacto del sistema:** no es un comentario HTML (`<!-- ... -->`) ni un marcador `agent-os:*`.
3. **No es un render del mismo boilerplate:** no es el contenido del template repetido con otro formato (encabezados renumerados, listas re-vinetadas, placeholders ya resueltos).
4. **Porta contenido normativo propio del proyecto:** una instruccion, un valor, una ruta o una regla que el template no trae.

Ante la duda, tratarla como sustantiva y preguntarle al usuario: perder una customizacion del proyecto es peor que preguntar de mas.

**Excepcion — reduccion deliberada del template (salto a v0.23.0 o posterior).**
Si `version_proyecto < 0.23.0` y `version_template >= 0.23.0`, el bloque del template
se redujo a proposito de 596 a ~108 lineas: la mecanica del flujo ya no vive en este
archivo, se lee bajo demanda desde su fuente canonica. En ese caso, las lineas del
bloque viejo ausentes del template **NO son customizaciones locales** — son el
contenido que v0.23.0 retiro a proposito. Si tras aplicar este filtro no queda
ninguna linea, tratar el caso como sin anomalias (el Paso 5 sigue su rama sin
anomalias y no ofrece preservar nada, salvo la seccion de la regla siguiente).

Aplicar la deteccion de anomalias **solo** sobre las lineas del proyecto que no
coincidan con NINGUNA linea del bloque de la version instalada. Si no puedes obtener
el bloque de la version instalada (no tienes el template historico), omitir SOLO la
deteccion linea-por-linea en este salto e informarlo. Esta omision **nunca** cubre
la deteccion de la seccion `## Customizaciones locales preservadas` (regla siguiente):
esa seccion se auto-identifica por su encabezado, no depende del template historico
para reconocerse, y se sigue detectando y ofreciendo preservar siempre — incluyendo
cuando `version_proyecto` es `0.0.0` (instalaciones pre-semver, la poblacion mas
vieja y con mas probabilidad de tener esa seccion de una actualizacion previa).

    Salto a v{template}: el bloque se reduce de 596 a ~108 lineas por diseno.
    No presento las lineas sueltas retiradas como customizaciones. Si tenias una
    seccion "Customizaciones locales preservadas", la sigo detectando y
    ofreciendo igual que siempre. Si tenias otras personalizaciones dentro del
    bloque, revisalas con `git diff .claude/CLAUDE.md` despues de aplicar; puedes
    recuperarlas con `git checkout .claude/CLAUDE.md`.

Si hay una seccion existente titulada `## Customizaciones locales preservadas` (de una actualizacion anterior), tratar todo su contenido como anomalia conocida a preservar. Esta regla es incondicional: se aplica se haya obtenido o no el bloque de la version instalada.

### Paso 5 — Presentar al usuario

Usar AskUserQuestion con narrativa en prosa. Estructura:

```
Tu CLAUDE.md esta en version v{proyecto} (o "pre-semver" si tenia marcador de fecha).
El template actual es v{template}.

Cambios aplicables:
{entradas del changelog entre versiones, como bullets concisos — solo primera linea de cada item
 para mantenerlo digerible; el usuario puede leer el CHANGELOG completo despues si quiere detalle}

{Si hay anomalias:}
Detecte {N} linea(s) dentro de tu bloque agent-os que no vienen del template:
  - "{linea 1}"
  - "{linea 2}"
  - ...
Probablemente son customizaciones de tu equipo.
```

Opciones en AskUserQuestion:
- **Si NO hay anomalias**: `(a) Aplicar actualizacion` / `(b) No aplicar, cancelar`.
- **Si SI hay anomalias**: `(a) Aplicar y descartar anomalias` / `(b) Aplicar y preservar anomalias al final del bloque nuevo` (Recommended) / `(c) No aplicar, cancelar`.

### Paso 6 — Aplicar actualizacion

Si el usuario eligio aplicar:

1. Leer el contenido completo del `.claude/CLAUDE.md` del proyecto.
2. Extraer todo lo **anterior** al marcador `<!-- agent-os:start -->` (contenido propio del proyecto — preservar intacto).
3. Extraer todo lo **posterior** al marcador `<!-- agent-os:end -->` (idem).
4. Construir el bloque nuevo:
   - Tomar el bloque completo del template (desde `<!-- agent-os:start -->` hasta `<!-- agent-os:end -->` inclusive).
   - Si el template contiene `{PROFILE_NAME}`, reemplazarlo por el perfil actual del proyecto. Detectar el perfil leyendo el valor que estaba en la linea "Perfil instalado: ..." del CLAUDE.md del proyecto; si no se puede detectar, preguntar al usuario.
   - Si el usuario eligio preservar anomalias: insertar, justo antes de `<!-- agent-os:end -->`, una seccion:
     ```
     ## Customizaciones locales preservadas

     Lineas detectadas en tu bloque agent-os que no vienen del template. Preservadas por `/agent-os-actualizar-claude-md` el {YYYY-MM-DD}:

     {linea 1}
     {linea 2}
     ...
     ```
5. Reconstruir el archivo: `contenido_antes + bloque_nuevo + contenido_despues`.
6. Escribir el archivo.

### Paso 6.5 — Ofrecer el andamio de memoria del repo

Desde v0.23.0 el template trae, **despues** de `<!-- agent-os:end -->`, una seccion
`## Memoria de este repositorio` (vacia, con subtitulos guia). Las instalaciones nuevas
la reciben con el archivo completo; las actualizaciones no, porque el comando nunca
escribe fuera de los marcadores.

Ejecutar solo si se cumplen TODAS estas condiciones:
- **El Paso 6 se ejecuto** (el usuario eligio aplicar la actualizacion). Si el
  usuario eligio "No aplicar, cancelar", el Paso 6.5 no corre — no hay archivo
  actualizado sobre el cual anexar nada.
- `version_template >= 0.23.0`.
- `contenido_despues` (ya escrito por el Paso 6) **no contiene ya** un encabezado
  `## Memoria de este repositorio`. El chequeo es solo sobre esta zona — NO sobre
  el archivo completo — para no dar falso positivo si la cadena aparece en
  `contenido_antes` (ej. un preambulo propio que la mencione) o dentro de una
  seccion `## Customizaciones locales preservadas` de un salto previo. Si
  `contenido_despues` ya tiene el encabezado, el Paso 6.5 no hace ni dice nada: ni
  pregunta de nuevo ni repite el aviso en cada actualizacion futura.

1. Tomar `contenido_despues` (lo posterior a `<!-- agent-os:end -->` en el archivo del
   proyecto **ya reescrito por el Paso 6**).
2. **Si `contenido_despues` esta vacio o es solo whitespace:** preguntar con
   AskUserQuestion:

   ```
   Tu CLAUDE.md no tiene contenido propio fuera del bloque agent-os.
   v{template} trae un andamio para la memoria de este repo: stack y como se corre,
   convenciones no obvias, trampas conocidas, indice de documentos propios.
   Viene vacio y agent-os no lo toca nunca.

   (a) Anexarlo    (b) No, gracias
   ```

   Si acepta: copiar del template todo lo posterior a `<!-- agent-os:end -->`, tal cual,
   y anexarlo al final del archivo del proyecto — esta es una **segunda escritura**
   sobre el mismo archivo, despues de la que ya hizo el Paso 6 (no se reconstruye
   todo de nuevo, solo se agrega al final).

3. **Si `contenido_despues` tiene contenido propio:** no tocar nada. Mencionarlo:

   ```
   Dejo intacto tu contenido fuera de los marcadores. El template v{template} incluye
   un andamio de memoria del repo por si quieres copiarlo:
   {AGENT_OS_BASE}/templates/CLAUDE.md, despues de <!-- agent-os:end -->.
   ```

Nunca anexar sin confirmacion explicita.

### Paso 7 — Confirmar resultado

```
CLAUDE.md actualizado a version v{template}.
{Si se preservaron anomalias:} Tus customizaciones quedan al final del bloque bajo la seccion "Customizaciones locales preservadas".
{Si el Paso 6.5 anexo el andamio:} Se agrego la seccion "## Memoria de este repositorio" al final del archivo, vacia y lista para llenar.

Para revisar el diff:
  git diff .claude/CLAUDE.md

Si no te gusta el resultado:
  git checkout .claude/CLAUDE.md

{Si hay mas pull pendientes:} Recuerda tambien ejecutar `bash ~/agent-os/scripts/project-install.sh` si cambiaron standards, comandos o perfiles.
```

## Limitaciones conocidas

- **Depende de Claude para ejecutar.** No es un script offline; requiere sesion de Claude activa. Tradeoff aceptado: los consumidores de agent-os ya usan Claude por diseno.
- **Deteccion de anomalias es heuristica.** Si el template reorganiza secciones (mismo contenido, distinto orden), el diff puede marcar falsos positivos. Mitigacion: el usuario siempre decide (nunca se descarta sin confirmacion).
- **Un solo perfil detectado por archivo.** Si el CLAUDE.md del proyecto fue generado con un perfil distinto al que esta activo ahora, el reemplazo usa el perfil detectado en el archivo actual — no cambia de perfil por su cuenta.

## Verificacion

1. **Al dia:** ejecutar sobre un proyecto recien instalado. Debe informar "al dia" sin cambios.
2. **Legacy sin version:** ejecutar sobre un proyecto cuyo CLAUDE.md no tenga `<!-- agent-os:version -->`. Debe tratar como `0.0.0` y aplicar todas las entradas del changelog.
3. **Customizacion dentro del bloque:** añadir manualmente una linea dentro del bloque agent-os (ej. `Este equipo usa Convencion X.`). Ejecutar el comando. Debe detectar la anomalia y ofrecer preservarla.
4. **Contenido fuera del bloque:** añadir texto antes de `<!-- agent-os:start -->` o despues de `<!-- agent-os:end -->`. Ejecutar el comando. Ese texto debe preservarse 100% intacto.
5. **Version del proyecto mas nueva que template:** editar manualmente la version del proyecto a `v99.0.0`. Ejecutar el comando. Debe abortar con mensaje claro.
6. **Template sin marcador:** mover temporalmente el marcador de version del template. Ejecutar el comando. Debe abortar con mensaje claro pidiendo `git pull`.
7. **Salto a v0.23.0 sin contenido propio:** ejecutar sobre un proyecto con bloque
   v0.19.0-v0.22.0 cuyo CLAUDE.md termine en `<!-- agent-os:end -->`. Debe (a) NO
   presentar las ~500 lineas retiradas como customizaciones, y (b) ofrecer el andamio.
8. **Salto a v0.23.0 con contenido propio:** igual, pero con texto despues de
   `<!-- agent-os:end -->`. Ese texto debe quedar 100% intacto y el andamio NO debe
   anexarse; solo mencionarse.
9. **Customizacion real sin template historico (camino de riesgo del Paso 4):**
   proyecto con una seccion `## Customizaciones locales preservadas` dentro del
   bloque agent-os, en un salto a v0.23.0 donde no se puede obtener el bloque de la
   version instalada (fallback del Paso 4). Debe seguir detectando esa seccion y
   ofreciendo preservarla, aunque omita la deteccion linea-por-linea del resto del
   bloque. Ejecutar antes de soltar v0.23.0 a los consumidores.

## Referencias

- Template: `{AGENT_OS_BASE}/templates/CLAUDE.md`.
- Changelog: `{AGENT_OS_BASE}/templates/CLAUDE.md.CHANGELOG.md`.
- Instalador base: `{AGENT_OS_BASE}/scripts/project-install.sh` / `project-install.ps1` (se mantienen intocados; este comando es opt-in para actualizaciones posteriores).
