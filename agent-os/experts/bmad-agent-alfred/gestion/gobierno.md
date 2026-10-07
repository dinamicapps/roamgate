# /alfred gobierno {on|off} [definitivo]

Gestiona la puerta unica de la conversacion. Con el gobierno activo, toda peticion de
trabajo del usuario se canaliza via `/alfred` (los hooks de sesion y de prompt
reorientan). Este subcomando es la via canonica para cancelarlo o reactivarlo.

## Los dos alcances (multi-instancia)

| Forma | Alcance | Mecanismo |
|---|---|---|
| `on\|off` (a secas) | SOLO esta sesion | marcador efimero `.claude/agent-os-sesiones/gobierno-{session8}.off` — no afecta otras instancias del repo ni sesiones futuras |
| `on\|off definitivo` | TODO el repo | config `alfred.gobierno` via `agentos config set` — afecta todas las instancias; sesiones con marcador propio conservan su override |

## Pasos

1. **Determinar `{session8}`.** El bloque `[agent-os]` inyectado al arranque de la
   sesion lo trae: `(sesion: {session8})`. Si NO esta en el contexto (sesion muy
   vieja o contexto truncado), NO adivinar ni listar archivos de otras sesiones:
   ofrecer al usuario el alcance `definitivo` o continuar tras el proximo arranque.
2. **`off` (sesion):** crear el marcador
   `.claude/agent-os-sesiones/gobierno-{session8}.off` (crear el directorio si falta;
   contenido: una linea con fecha y razon corta si el usuario la dio).
   **`on` (sesion):** borrar ese marcador si existe.
3. **`off definitivo` / `on definitivo`:** confirmar el alcance con el usuario
   ("esto afecta TODAS las instancias del repo") y ejecutar:

   ```
   agentos config set --archivo agent-os-local --ruta alfred.gobierno --valor {false|true}
   ```

   Parsear `{ok}`; si `ok:false`, detenerse y reportar el error.
4. **Confirmar el estado resultante** al usuario, con su alcance. El cambio de sesion
   aplica desde el proximo mensaje (el hook de prompt lo lee); el de repo aplica a
   cada instancia segun su propio marcador.
5. **Prosa:** si el usuario lo pide en lenguaje natural ("deja de usar alfred",
   "vuelve a alfred"), detectar la intencion, proponer la forma y el alcance
   (sesion vs definitivo) y ejecutar al confirmar.

<!-- Contexto: la clave alfred.gobierno y su default viven en el config del runtime (agentos config get --archivo agent-os-local --ruta alfred.gobierno); los hooks alfred-gobierno-start.sh / alfred-gobierno-prompt.sh son los ejecutores del regimen. NO duplicar la semantica de resolucion (marcador gana sobre config) -- vive en los hooks distribuidos. -->

## Gate por trabajo activo (desde v0.9.2)

Con un work o diseño activo en la sesión (archivo de sesión con `work_slug`, `rol` o
`diseno_slug` distintos de null), los hooks del gobierno callan: los mensajes en prosa
pertenecen al hilo del anfitrión del trabajo (incluida la consulta directa a un experto).
El recordatorio de canalizar via `/alfred` solo aplica sin trabajo activo. Esto NO cambia
el estado del gobierno (config/marcador): solo silencia la inyección mientras dura el
trabajo.
