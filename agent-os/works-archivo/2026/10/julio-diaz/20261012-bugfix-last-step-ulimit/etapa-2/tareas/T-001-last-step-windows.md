---
archivos:
  - accion: modificar
    ruta: server/src/workspace/git-snapshot.ts
  - accion: modificar
    ruta: server/src/workspace/git-snapshot.test.ts
  - accion: modificar
    ruta: docs/ARCHITECTURE.md
cas:
  - CA-01
  - CA-02
  - CA-03
  - CA-04
ejecutor: atlas
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 001: Snapshots de Last step en Windows

Aplica la solucion acordada (ver ## Solucion del README): ulimit degradado solo en MSYS/Cygwin, ruta de alternates comprensible por el git nativo en MSYS, documentacion y pruebas rojo->verde.

## Verificacion

1. git-diff.test.ts sin fallas por ulimit; git-snapshot.test.ts sin fallas por ulimit ni alternates.
2. Prueba que fija el fail-closed fuera de MSYS.
3. Navegador: Last step muestra los cambios del ultimo paso de un agente.

## CAs que implementa

| ID | Criterio | Origen |
|---|---|---|
| CA-01 | Un snapshot de Last step se completa en Windows (MSYS) | FM-12 |
| CA-02 | Fuera de MSYS, si ulimit -f falla la captura sigue abortando | REG_limite_tamano_snapshot |
| CA-03 | El snapshot ve los objetos del repo real en Windows (alternates) | Diagnostico forense |
| CA-04 | La vista Last step muestra los cambios del ultimo paso en este host | Meta |

## Ejecutor: atlas

### Que hizo

- git-snapshot.ts detecta MSYS/Cygwin con uname -s: ahi un ulimit -f fallido se tolera; en el resto la captura sigue abortando (fail-closed intacto).
- En MSYS el alternates se escribe con cygpath -m para que el git.exe nativo resuelva los objetos del repo; antes fallaba con unable to normalize alternate object path.
- Anfitriona: gitShellCommandArgv parte en trozos de 7000 caracteres los scripts largos en Windows y los une dentro del shell (MSYS trunca cualquier argumento de mas de ~8 KiB).
- Arnes de pruebas reconstruye el script desde los trozos; docs/ARCHITECTURE.md declara la excepcion de Windows.
- Pruebas: git-diff 12/20 -> 32/0; git-snapshot 3/22 -> 20/10 (10 ajenas: symlinks, NTFS, chmod, autocrlf del host, timeouts); git-shell 23/0 con 2 nuevas; tsc limpio.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | MSYS trunca en silencio cualquier argumento de mas de ~8170 caracteres; el script de captura ya mide ~7900 mas la raiz | Corregido en este work con la particion de argumentos (git-shell.ts) y prueba con el Git Bash real | atlas |
| 2 | core.autocrlf=true en C:/Program Files/Git/etc/gitconfig explica 3 fallas de sparse-checkout en git-snapshot.test.ts:474 | Configuracion del host, no del codigo; registrado en post-works | atlas |
| 3 | Durante un repro, mktemp -d fallo y el ejecutor creo .git, a y q en C:/Users/julio; los borro tras comprobar que eran suyos | Anfitriona verifico que no queda nada; los repros deben fijar cwd explicito | atlas |
| 4 | Archivos no declarados: git-shell.ts y git-shell.test.ts | Aceptados: limite de argumentos que rompia la captura en Windows | atlas |

## Verificador: quinn

### Que verifico

- CA-01/CA-02/CA-03: pruebas rojo->verde y prueba del fail-closed fuera de MSYS; alternates resuelve el HEAD del repo con el git nativo.
- CA-04: en navegador, dos pasos de agente simulados en un repo temporal; Last step muestra solo el cambio del segundo paso mientras Working tree acumula (CA-04-despues.png).

### Hallazgos de verificacion

(ninguno)
