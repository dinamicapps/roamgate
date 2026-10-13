# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: descomponer
  categoria: fallo-de-logica
  causa_atribuida: Se modelo el instalador como corriendo en una consola limpia.
  disparador: Cuando se planea un instalador o CLI para usuarios de una herramienta que define su propio entorno (multiplexor, IDE, shell gestionada).
  evidencia:
    - ancla: scripts/instalador/install.ps1:488
      tipo: codebase
  fecha: "2026-10-13"
  leccion_candidata: Al planear, incluye como escenario el entorno desde el que el usuario realmente ejecutara el script y las variables que ese entorno hereda.
  observacion: El plan no anticipo que el instalador se corre desde una terminal de Herdr, que inyecta HERDR_SOCKET_PATH y hace fallar herdr setup.
  verificacion:
    detalle: el plan de un instalador declara el entorno de ejecucion esperado y sus variables heredadas
    tipo: humana
  work: "20261013-instalador-todo-en-uno"
