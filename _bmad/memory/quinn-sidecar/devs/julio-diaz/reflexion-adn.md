# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: verificar
  categoria: acierto-repetible
  causa_atribuida: Los ejecutores tomaban el fragmento de la propia linea citada, con lo que la verificacion mecanica no podia fallar.
  disparador: cuando un insumo de investigacion se sostiene en cientos de citas path:linea
  evidencia:
    - ancla: 20261007-investigacion-filemanager-tabs/T-008
      tipo: work-record
  fecha: "2026-10-07"
  leccion_candidata: En E4 muestrear siempre la congruencia de citas priorizando las que sostienen la recomendacion, y exigir que toda afirmacion de ausencia declare su metodo (rango leido, busqueda).
  observacion: citas verificar solo comprueba que la linea existe cuando el fragmento se copia de la misma linea; el muestreo de congruencia (abrir la linea y juzgar) encontro citas parciales y una cita que afirmaba una ausencia sin metodo.
  verificacion:
    detalle: 07-verificacion.md reporta conteo de congruencia y no solo el resultado mecanico
    tipo: humana
  work: "20261007-investigacion-filemanager-tabs"
- arte: verificar
  categoria: acierto-repetible
  causa_atribuida: El presupuesto vive en un postbuild que ninguna prueba unitaria ejercita.
  disparador: cuando un work agrega o mueve imports dinamicos (lazy) en el cliente web
  evidencia:
    - ancla: 20261012-tab-archivos-vinculado/T-009
      tipo: work-record
    - ancla: scripts/check-web-assets.mjs:7
      tipo: codebase
  fecha: "2026-10-12"
  leccion_candidata: Correr siempre el build de produccion completo en Fase 1 y comparar contra la base, no solo typecheck y suite.
  observacion: La Fase 1 con build de produccion detecto que el work subio el conteo de assets de 160 a 165 sobre un presupuesto de 160, cuando typecheck y suite estaban verdes.
  verificacion:
    detalle: regresiones de presupuesto de build detectadas antes del cierre
    tipo: outcome
  work: "20261012-tab-archivos-vinculado"
- arte: verificar
  categoria: acierto-repetible
  causa_atribuida: Los eventos sinteticos no pasan por la captura de puntero ni por el drag nativo, y las pruebas unitarias no corren en el shell de Git for Windows.
  disparador: cuando un work de UI corre en un host Windows o toca rutas y eventos de puntero
  evidencia:
    - ancla: 20261012-tab-archivos-vinculado/T-011
      tipo: work-record
    - ancla: 20261012-tab-archivos-vinculado/T-012
      tipo: work-record
    - ancla: 20261012-tab-archivos-vinculado/T-013
      tipo: work-record
  fecha: "2026-10-12"
  leccion_candidata: En E4 de UI, ejercitar cada CA con input real del navegador en el host del usuario antes de dar el CA por cubierto con pruebas unitarias.
  observacion: 'Verificar con input real y entornos aislados destapo defectos que las pruebas unitarias y el typecheck no veian: diff con mktemp en /tmp, captura de puntero que se tragaba el clic, rutas de Windows enviadas como rama.'
  verificacion:
    detalle: defectos de entorno detectados en E4 y no despues del cierre
    tipo: outcome
  work: "20261012-tab-archivos-vinculado"
- arte: verificar
  categoria: acierto-repetible
  causa_atribuida: Los fallos estaban en la interaccion con el SO (arbol de procesos, entorno heredado de Herdr, StrictMode) que ninguna prueba aislada reproduce.
  disparador: Cuando el entregable es un script de instalacion o despliegue que toca estado del sistema operativo.
  evidencia:
    - ancla: 20261013-instalador-todo-en-uno/T-005
      tipo: work-record
  fecha: "2026-10-13"
  leccion_candidata: Verifica instaladores corriendolos de verdad por escenario, aislando el estado real (respaldo del registro, APPDATA/HOME temporales, nombres de tarea distintos) en vez de conformarte con parseo y unitarias.
  observacion: Ejecutar el instalador real en escenarios (limpio, misma version, actualizar con tarea viva, -SinServicio, Herdr aislado) destapo 3 defectos que unitarias y parseo no veian.
  verificacion:
    detalle: la verificacion de un instalador lista escenarios ejecutados con su salida en evidencia/
    tipo: humana
  work: "20261013-instalador-todo-en-uno"
