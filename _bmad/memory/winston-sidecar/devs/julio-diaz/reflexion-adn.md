# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: descomponer
  categoria: acierto-repetible
  causa_atribuida: La decision D1 del plan ordeno la dependencia antes de las fichas.
  disparador: cuando una opcion de un plan depende de un sistema externo cuya extensibilidad es desconocida
  evidencia:
    - ancla: 20261007-investigacion-filemanager-tabs/T-004
      tipo: work-record
    - ancla: 20261007-investigacion-filemanager-tabs/T-006
      tipo: work-record
  fecha: "2026-10-07"
  leccion_candidata: Planificar como primera tarea la verificacion de viabilidad del sistema externo y condicionar a ella la ficha de la opcion dependiente.
  observacion: Adelantar la verificacion de viabilidad del sistema externo (Herdr) a la primera ola permitio que la ficha A2 se apoyara en evidencia verificada en vez de especulacion.
  verificacion:
    detalle: fichas de opciones dependientes de externos sin afirmaciones especulativas marcadas como verificado
    tipo: outcome
  work: "20261007-investigacion-filemanager-tabs"
- arte: descomponer
  categoria: fallo-de-logica
  causa_atribuida: La cita del discovery estaba en el cliente (relativePathWithinCheckout) y no se siguio hasta explorerRoot del servidor.
  disparador: cuando una superficie de UI pasa de ser unica por workspace a ser una por consola o por recurso
  evidencia:
    - ancla: server/src/workspace/files.ts:79
      tipo: codebase
    - ancla: scripts/check-web-assets.mjs:7
      tipo: codebase
  fecha: "2026-10-12"
  leccion_candidata: Al multiplicar una superficie por consola, rastrear en el servidor como se resuelve el recurso (raiz, scope) y planear el chequeo de presupuestos del build como tarea, no como sorpresa de E4.
  observacion: El diseno y el plan asumieron una raiz de checkout estable, pero sin worktree el servidor toma el cwd del pane enfocado del workspace; ademas el plan no incluyo el presupuesto de assets del build.
  verificacion:
    detalle: works de UI sin tareas nacidas en E4 por raiz de recurso o presupuesto de build
    tipo: outcome
  work: "20261012-tab-archivos-vinculado"
