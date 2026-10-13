---
completedAt: "2026-10-13"
file_type: verificacion-etapa-4
inputDocuments:
  - ../etapa-2/03-plan.md
status: approved
---
# Verificacion - Etapa 4

**Anfitrion**: Quinn
**Fecha**: 2026-10-13

El instalador todo en uno se ejecuto de verdad en esta maquina: cinco escenarios desde copias del espejo y la instalacion final desde `E:\DinamicAPPS\roamgate-dist`. La verificacion en vivo destapo tres defectos que las pruebas unitarias no veian: el hijo de conhost sobrevivia a `/End`, el `HERDR_SOCKET_PATH` heredado de un pane de Herdr hacia fallar `herdr setup`, y trampas de StrictMode. Los tres quedaron corregidos y re-verificados. Veredicto: meta cumplida en esta maquina, 8/8 CAs en PASS. El push del dist .4 (y de dev) queda a pedido del usuario.

## Resumen ejecutivo

| Criterio | Resultado |
|----------|-----------|
| Meta cumplida | SI (en esta maquina; publicacion a GitHub pendiente de pedido del usuario) |
| CAs declarados | 8/8 PASS |
| Smoke + suite automatizada | PASS: `bun test server/src/herdr server/src/config` 293 pass / 21 fail, las mismas 21 de HEAD (FM-30), comparado en un worktree de HEAD; tsc del server OK; biome format OK |
| Auditoria capa de seguridad | N/A sin endpoints nuevos. La contrasena va solo a `%APPDATA%\roamgate\roamgate.env`, no se versiona ni se escribe en la evidencia; las tareas son del usuario (RunLevel Limited) |
| Auditoria de evidencia (EV-N) | PASS: salidas de cada escenario y XML de la tarea de Herdr antes/despues en `evidencia/` |

## Verificacion por CAs

| CA | Tareas | Resultado | Evidencia |
|----|--------|-----------|-----------|
| CA-01 | T-001, T-005 | PASS | Tarea de Roamgate: `Execute C:\Windows\System32\conhost.exe`, `--headless "...roamgate.exe" service run "...roamgate.env"`; roamgate.exe hijo de conhost; ningun proceso roamgate/conhost con ventana (MainWindowHandle). La plantilla de Herdr genera la misma forma que la tarea editada a mano por el usuario (prueba en vivo de T-002) |
| CA-02 | T-002 | PASS | Unitarias (registra / no toca la existente / no aplica fuera de Windows). En vivo con APPDATA temporal: primera llamada registra (`Ready`, nunca ejecutada), segunda no; el Herdr del usuario conserva el PID 35780 |
| CA-03 | T-003, T-005 | PASS | Escenario e: con PATH sin herdr y HERDR_HOME/INSTALL_DIR temporales, el instalador bajo Herdr 0.9.3 de herdr.dev y lo encontro. El PATH de usuario se restauro identico y la junction real no se toco. Deteccion en el PATH en los escenarios a-d |
| CA-04 | T-003 | PASS | roamgate.env queda con HOST, PORT, ROAMGATE_PASSWORD y ROAMGATE_DISABLE_UPDATE_CHECK=1. Orden de contrasena probado: variable valida (a), generada y anunciada al escribirla (b, login 200), `-Password` (b', login 200). Un `-Password` o `-Puerto` invalido aborta antes de tocar nada |
| CA-05 | T-003, T-005 | PASS | a': instalacion limpia escucha en 100.82.222.117:8789 con .4. b': misma version, reinicio limpio (un solo proceso, PID nuevo). c: .3 corriendo bajo la tarea -> detiene, extrae .4 y rearranca con un solo proceso. Instalacion final desde el espejo real con cambio de ruta del exe: un solo proceso |
| CA-06 | T-003, T-005 | PASS | d: `-SinServicio` dejo identicas las tareas de Roamgate y Herdr, roamgate.env y el proceso de la tarea; avisa que la tarea existe; roamgate.cmd arranco en 127.0.0.1:8791 y respondio |
| CA-07 | T-004 | PASS | README del dist: instalacion, parametros, contrasena, uso, estado, diagnostico, quitar tareas, modo manual, actualizar y rollback |
| CA-08 | T-005 | PASS | Tarea `dev.roamgate-82e89b83b57e2645` corre `E:\DinamicAPPS\roamgate-dist\roamgate.exe` .4 en 100.82.222.117:8789; login 200; `/api/herdr/status` = running 0.9.1. La tarea de Herdr es identica byte a byte antes y despues (`herdr-task-antes.xml` / `herdr-task-despues.xml`); AURORA y EME_DCOM intactos con foco en AURORA. El v0.7.8 no corria al empezar y no se toco |

## Hallazgos

| ID | Hallazgo | Rumbo |
|----|----------|-------|
| H-01 | Con conhost, `schtasks /End` solo terminaba conhost: roamgate.exe quedaba vivo con el puerto y la configuracion vieja (la contrasena nueva daba "wrong password") | Corregido: endWindowsTask (134cc84) y detener antes de reemplazar la definicion (7eea2c9); re-verificado en b', c y la instalacion final |
| H-02 | Dentro de un pane de Herdr, HERDR_SOCKET_PATH viene definida y `herdr setup` la rechaza aunque sea la de defecto | Esquivado en install.ps1; raiz en post-works FM-28 |
| H-03 | Una contrasena generada se perdia si un paso posterior abortaba | Corregido: se anuncia al escribirla |
| H-04 | StrictMode: arreglo vacio devuelto como $null y `[0]` fuera de rango | Corregido en install.ps1 |
| H-05 | Sin redireccion de salida, la tarea no deja logs | post-works FM-27 |
| H-06 | `defaultSocketPath` de bootstrap.ts usa una ruta Unix en Windows | post-works FM-29 |
| H-07 | 21 fallas de pruebas Windows preexistentes en server/config y herdr | post-works FM-30 |

## Pendiente fuera del alcance verificable aqui

- Instalacion en un PC sin Herdr real (el otro PC): lo cubre el escenario e aislado; queda para que el usuario lo confirme tras el push.
- Arranque al iniciar sesion: el trigger es `AtLogOn` del usuario, comprobado en la definicion. No se cerro la sesion de Windows para no cortar el trabajo del usuario.
