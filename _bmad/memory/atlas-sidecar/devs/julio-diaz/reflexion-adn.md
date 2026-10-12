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
- arte: diagnosticar
  categoria: acierto-repetible
  causa_atribuida: El canal global state.error no es visible con un modal abierto y un refresh lo limpiaba antes de leerlo.
  disparador: cuando un dialogo muestra un mensaje generico en lugar del error real de una llamada al backend
  evidencia:
    - ancla: 20261012-bugfix-worktree-error-real/T-001
      tipo: work-record
    - ancla: web/src/store.ts:1957
      tipo: codebase
  fecha: "2026-10-12"
  leccion_candidata: 'Seguir el error desde el rechazo hasta el pixel: quien lo atrapa, quien lo borra y si la capa donde se pinta queda visible; preferir una opcion explicita a cambiar un contrato compartido.'
  observacion: La forense separo dos defectos encadenados (rechazo convertido en undefined y error borrado por un refresh antes de leerlo) y verifico donde se pinta state.error frente al z-index del modal; el arreglo uso una opcion explicita sin tocar el contrato de 37 llamadores.
  verificacion:
    detalle: errores del backend visibles en los dialogos sin regresiones en otros llamadores
    tipo: outcome
  work: "20261012-bugfix-worktree-error-real"
