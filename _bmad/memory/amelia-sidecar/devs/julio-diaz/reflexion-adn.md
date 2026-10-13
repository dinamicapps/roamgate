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
- arte: verificar
  categoria: error-en-sistema
  causa_atribuida: 'Las pruebas usan un runCommand falso: validan la secuencia de comandos, no el arbol de procesos real.'
  disparador: 'Cuando se cambia COMO un supervisor (Task Scheduler, systemd, launchd) lanza un proceso: wrapper, shell intermedio, conhost.'
  evidencia:
    - ancla: server/src/config/service-manager.ts:237
      tipo: codebase
    - ancla: 20261013-instalador-todo-en-uno/T-001
      tipo: work-record
  fecha: "2026-10-13"
  leccion_candidata: Al introducir un proceso intermedio en un supervisor, verifica en vivo que detener y reiniciar terminan al nieto, no solo al hijo directo.
  observacion: Envolver la tarea en conhost --headless paso todas las pruebas unitarias, pero schtasks /End dejaba vivo al roamgate.exe hijo con el puerto tomado; solo se vio al reinstalar en vivo.
  verificacion:
    detalle: el operador ve en la verificacion una prueba de stop/restart que cuenta procesos del binario final
    tipo: humana
  work: "20261013-instalador-todo-en-uno"
