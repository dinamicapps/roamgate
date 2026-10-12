# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: diagnosticar
  categoria: acierto-repetible
  causa_atribuida: MSYS2 difiere de POSIX en setrlimit y en la longitud de argumentos; solo la reproduccion directa lo muestra.
  disparador: cuando un script de shell del servidor falla solo en Windows/Git Bash
  evidencia:
    - ancla: 20261012-bugfix-last-step-ulimit/T-001
      tipo: work-record
    - ancla: server/src/workspace/git-shell.ts:95
      tipo: codebase
  fecha: "2026-10-12"
  leccion_candidata: Reproducir el script exacto en el shell que resuelve el servidor y medir los limites de la plataforma antes de proponer el arreglo; acotar la excepcion por uname en el propio script.
  observacion: La forense reprodujo el ulimit en el shell real y midio el truncado de argumentos de MSYS; el arreglo acoto la excepcion a MSYS sin retirar el fail-closed en POSIX, y se verifico con dos pasos simulados que aislan el ultimo.
  verificacion:
    detalle: bugs de Windows en scripts de shell cerrados con evidencia cruda y sin regresion POSIX
    tipo: outcome
  work: "20261012-bugfix-last-step-ulimit"
