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
- arte: verificar
  categoria: acierto-repetible
  causa_atribuida: La configuracion vive fuera del repo (variables de maquina) y solo aparece en el host real.
  disparador: cuando se publica un binario que reemplaza a una version anterior ya configurada en las maquinas de los devs
  evidencia:
    - ancla: 20261012-dist-windows-roamgate/T-004
      tipo: work-record
    - ancla: server/src/config/auth-token.ts:18
      tipo: codebase
  fecha: "2026-10-12"
  leccion_candidata: Verificar el artefacto publicado arrancandolo con la configuracion real heredada de la version anterior, no solo con una configuracion limpia.
  observacion: Arrancar el binario publicado en la maquina real destapo que la contrasena de 12 caracteres del usuario ya no sirve (minimo 15 en esta version); el publicador y las pruebas no lo podian ver.
  verificacion:
    detalle: incompatibilidades de configuracion detectadas antes de que las reporten los devs
    tipo: outcome
  work: "20261012-dist-windows-roamgate"
