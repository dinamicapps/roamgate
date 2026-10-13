---
completedAt: "2026-10-13"
file_type: plan-etapa-2
inputDocuments:
  - README.md
status: approved
---
# Plan de implementacion - Etapa 2

**Anfitrion**: Bob
**Fecha**: 2026-10-13
**Modo**: normal
**Nivel**: normal

El instalador del dist orquesta piezas que ya existen en el server: `roamgate herdr setup` y `roamgate service install`. A eso suma dos ajustes pequenos en el server: tareas sin ventana y autostart de un Herdr ya vivo.

Bob materializa sin elevar a Winston. No cambia la frontera de ningun modulo ni hay eleccion entre patrones: la tarea programada por usuario ya es el patron del repo (`server/src/config/service-definitions.ts:150-171`).

## Decisiones tecnicas

| # | Decision | Valor final | Justificacion |
|---|---|---|---|
| D1 | Mecanismo de arranque automatico | Tarea programada por usuario (`roamgate service install` y `roamgate herdr setup`), no servicio de Windows | El pipe de Herdr se deriva de %APPDATA% del usuario (`server-config.ts:337-360`) y las terminales ConPTY necesitan su sesion |
| D2 | Sin ventana | Accion de ambas tareas = `conhost.exe --headless <exe> <args>` | Decision del usuario. Replica la edicion manual que ya corre en esta maquina |
| D3 | Herdr faltante | Descargar `https://herdr.dev/install.ps1` a un temporal y ejecutarlo con `powershell -NoProfile -ExecutionPolicy Bypass -File`; despues refrescar el PATH de la sesion desde el registro (Machine + User) | Decision del usuario: canal oficial. El script no es interactivo (sin Read-Host) y verifica SHA-256 |
| D4 | Herdr vivo sin tarea | `herdr setup` registra la tarea sin reiniciar el server en ejecucion (solo Windows); hoy devuelve `already-running` sin registrar (`bootstrap.ts:135-141`) | Reiniciar mataria las terminales del usuario; sin registrar, Herdr no arrancaria en el proximo inicio de sesion |
| D5 | Parametros de install.ps1 | `-Puerto` (default: PORT del .env o 8787), `-Ip` (default: HOST del .env o primera IP de Tailscale o 127.0.0.1), `-Password`, `-SinServicio` | `$Host` es variable automatica de PowerShell y no puede usarse como parametro |
| D6 | Contrasena | Orden: `-Password`, luego `ROAMGATE_PASSWORD` del .env si es valida (15..1024), luego `$env:ROAMGATE_PASSWORD` si es valida, luego generar 20 caracteres alfanumericos y mostrarla una vez | Sin interaccion; el limite de 15 lo impone `assertValidAuthPassword` |
| D7 | .env | install.ps1 fija HOST, PORT, ROAMGATE_PASSWORD y `ROAMGATE_DISABLE_UPDATE_CHECK=1` en `%APPDATA%\roamgate\roamgate.env` y preserva las demas lineas; si no existe, parte de la plantilla | `service install` preserva el .env (`service-manager.ts:311-317`). El updater apunta a upstream (FM-19) |
| D8 | Actualizar con la tarea viva | Si la tarea de Roamgate corre: `schtasks /End` y esperar a que no quede roamgate.exe de esta carpeta, extraer, y `service install` re-registra y arranca. Si el exe vivo no es de la tarea (manual), abortar como hoy | El exe en uso no se puede sobrescribir |
| D9 | `-SinServicio` | No toca ninguna tarea: solo extrae, como hoy, y avisa si existe la tarea de Roamgate | Conserva el modo manual con roamgate.cmd |
| D10 | Puerto en esta maquina | Verificacion con `-Puerto 8789` | El v0.7.8 del usuario usa 8787 |

## Criterios de aceptacion

| ID | Criterio | Tareas |
|---|---|---|
| CA-01 | Las tareas de Herdr y de Roamgate se registran con `conhost.exe --headless` como ejecutable, y al correr no abren ventana | T-001, T-005 |
| CA-02 | Con Herdr ya corriendo y sin tarea registrada, `roamgate herdr setup` en Windows registra la tarea sin reiniciar el server y lo informa. Con tarea existente no cambia el comportamiento actual | T-002 |
| CA-03 | install.ps1 detecta Herdr en el PATH o en el directorio gestionado de Roamgate. Si falta, lo instala desde herdr.dev (probado en entorno aislado con HERDR_HOME y PATH sin herdr) y deja Herdr corriendo como tarea | T-003, T-005 |
| CA-04 | install.ps1 escribe HOST, PORT, ROAMGATE_PASSWORD y ROAMGATE_DISABLE_UPDATE_CHECK en roamgate.env preservando las demas lineas, con el orden de contrasena de D6; una contrasena generada se muestra al final | T-003 |
| CA-05 | Instalacion limpia: install.ps1 deja Roamgate como tarea escuchando en Ip:Puerto con la version publicada. Reinstalar la misma version es idempotente. Actualizar con la tarea corriendo detiene, extrae y rearranca sin abortar | T-003, T-005 |
| CA-06 | Con `-SinServicio` no se registra ni se modifica ninguna tarea y roamgate.cmd sigue arrancando en primer plano | T-003, T-005 |
| CA-07 | El README del dist documenta la instalacion todo en uno, los parametros, la actualizacion, como ver el estado y logs, y como desinstalar las tareas | T-004 |
| CA-08 | En esta maquina el dist .4 queda como tarea en la IP de Tailscale y el puerto 8789, conectado a Herdr. La tarea de Herdr y las sesiones de AURORA y EME_DCOM siguen intactas y el v0.7.8 del 8787 no se toca | T-005 |

## Riesgos

- La verificacion toca la tarea real de Herdr del usuario. Antes de tocarla se exporta su XML a la carpeta de evidencia. Con Herdr vivo y tarea existente, el instalador no la toca (CA-02), asi que no deberia cambiar nada.
- `conhost.exe --headless` no esta documentado por Microsoft. El usuario ya lo usa en su maquina. Si un Windows no lo soporta, la tarea falla visible en `Get-ScheduledTaskInfo` (LastTaskResult).
- El instalador oficial de Herdr agrega su carpeta al PATH de usuario. En la sesion actual hay que refrescar `$env:PATH` antes de invocar `roamgate herdr setup`.

## Permisos nuevos a registrar

Ninguno. Las tareas son del usuario (RunLevel Limited) y no requieren elevacion.
