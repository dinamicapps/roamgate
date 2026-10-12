# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: decidir
  categoria: acierto-repetible
  causa_atribuida: Fase 2 con exploraciones paralelas por sistema (file manager, tabs, layout) hizo visible la frontera con Herdr.
  disparador: cuando el usuario pide convertir una superficie de UI en otra forma (tab, panel, modal) sin saber como esta compuesta hoy
  evidencia:
    - ancla: 20261007-investigacion-filemanager-tabs/T-004
      tipo: work-record
  fecha: "2026-10-07"
  leccion_candidata: Recolectar evidencia de la composicion actual y de quien es dueno del modelo (cliente vs sistema externo) antes de proponer ruta; declarar el drift entre la pregunta y el codigo.
  observacion: El usuario pidio 'que sea un tab o un panel'; el abordaje con evidencia mostro que ya era un panel no independiente y que los tabs son de Herdr, y la ruta investigacion con consumido_por evito saltar a diseno o codigo.
  verificacion:
    detalle: works de reestructura de UI que no requieren re-abordaje por premisa de contenedor equivocada
    tipo: outcome
  work: "20261007-investigacion-filemanager-tabs"
- arte: verificar
  categoria: acierto-repetible
  causa_atribuida: La primera ronda evito manipular Herdr por seguridad de la sesion y dejo CAs sin probar; el workspace aislado resolvio el riesgo sin renunciar a la prueba.
  disparador: cuando la verificacion de UI debe correr sobre un sistema vivo que tambien es el entorno de trabajo del usuario (Herdr, la misma sesion)
  evidencia:
    - ancla: 20261012-tab-archivos-vinculado/T-010
      tipo: work-record
    - ancla: server/src/workspace/files.ts:79
      tipo: codebase
  fecha: "2026-10-12"
  leccion_candidata: Montar un entorno de prueba aislado en el sistema real, con permiso del usuario, antes de declarar pendientes los CAs que dependen de interaccion viva.
  observacion: Las pruebas guiadas de E4 se corrieron en workspaces aislados creados y cerrados por CLI (fm-prueba, fm-prueba2), sin tocar las consolas reales del usuario, y destaparon el hallazgo de la raiz que ninguna prueba unitaria veia.
  verificacion:
    detalle: el operador confirma que E4 de works de UI corre en entorno aislado y no en sus sesiones
    tipo: humana
  work: "20261012-tab-archivos-vinculado"
- arte: decidir
  categoria: correccion-de-usuario
  causa_atribuida: Confundi la limitacion de mi tecnica de prueba (eventos sinteticos) con una limitacion del ambiente.
  disparador: cuando un CA falla con eventos sinteticos o parece requerir un entorno que no esta montado
  evidencia:
    - ancla: 20261012-tab-archivos-vinculado/T-011
      tipo: correccion-usuario
    - ancla: 20261012-tab-archivos-vinculado/T-013
      tipo: work-record
  fecha: "2026-10-12"
  leccion_candidata: Antes de proponer verificacion diferida, agotar input real (mouse/teclado de Playwright), entornos aislados y la correccion del bloqueante; la diferida solo para lo que de verdad no existe en el ambiente.
  observacion: Recomende cerrar con verificacion diferida seis CAs etiquetados como no reproducibles; el usuario lo rechazo y al verificarlos con input real aparecieron cuatro defectos de Windows que el cierre habria escondido.
  verificacion:
    detalle: el operador no vuelve a ver propuestas de diferir CAs verificables en el host
    tipo: humana
  work: "20261012-tab-archivos-vinculado"
