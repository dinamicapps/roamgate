# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: descomponer
  categoria: acierto-repetible
  causa_atribuida: Las reglas eran deterministas y no dependian de React; aislarlas hizo barata su verificacion.
  disparador: cuando una feature de UI tiene reglas de estado persistente entre pestanas y sesiones
  evidencia:
    - ancla: web/src/filesTabResource.ts:1
      tipo: codebase
    - ancla: 20261012-tab-archivos-vinculado/T-002
      tipo: work-record
  fecha: "2026-10-12"
  leccion_candidata: Extraer primero las reglas de estado a un modulo puro con una prueba por regla antes de tocar componentes.
  observacion: Separar la persistencia del tab (merge, barrera, reconciliacion, tope, cuota) en un modulo puro con pruebas unitarias permitio integrarlo en tres tareas sin regresiones y cubrir CAs que no se podian ejercitar en navegador.
  verificacion:
    detalle:
        ambito: web/src/*Resource.test.ts
        patron: describe\(
    tipo: mecanica
  work: "20261012-tab-archivos-vinculado"
