---
archivos:
  - accion: modificar
    ruta: server/src/herdr/service.ts
  - accion: modificar
    ruta: server/src/config/service-definitions.ts
  - accion: modificar
    ruta: server/src/herdr/service.test.ts
  - accion: modificar
    ruta: server/src/config/service-manager.test.ts
cas:
  - CA-01
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 001: Tareas de Herdr y Roamgate sin ventana

Las dos plantillas de tarea programada de Windows ejecutan el binario directo (`server/src/herdr/service.ts:149-170`, `server/src/config/service-definitions.ts:150-171`). Una app de consola lanzada por una tarea Interactive abre una ventana. En esta maquina el usuario corrigio a mano la tarea de Herdr con `conhost.exe --headless`; esta tarea lleva eso a las plantillas (D2).

## Subtareas

1. En ambas plantillas, la accion pasa a `-Execute "$env:SystemRoot\System32\conhost.exe"` (o la ruta resuelta al registrar) con argumento `--headless "<exe>" <args>`, citando bien rutas con espacios. El WorkingDirectory de Herdr se conserva.
2. Mantener los marcadores (`HERDR_SERVICE_MARKER`, `GENERATED_MARKER`) para que reinstalar siga reconociendo la definicion como propia.
3. Comprobar que `schtasks /End` sigue deteniendo el proceso hijo (roamgate.exe / herdr.exe) y no solo conhost. Si no lo detiene, ajustar `restartWindowsTask` o documentar la alternativa.
4. Revisar si Roamgate deja log en archivo cuando corre como tarea. Si no hay forma de ver errores sin ventana, registrarlo como post-work (no ampliar alcance).
5. TDD: actualizar las pruebas de las plantillas (`service.test.ts:78`, `service-manager.test.ts:178`) primero en rojo.

## Ejecutor: amelia

### Que hizo

- windowsHeadlessTaskAction en service-definitions.ts: ambas plantillas de tarea ejecutan conhost --headless <exe> <args>
- renderWindowsTaskDefinition acepta {direct}: la deteccion legacy 0.7.0 sigue comparando contra la plantilla directa publicada
- endWindowsTask: lista los hijos del conhost de la tarea, hace /End y los termina; lo usan restart, uninstall y service install

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Con conhost, schtasks /End solo terminaba conhost: roamgate.exe quedaba huerfano con el puerto y la contrasena vieja (detectado en vivo) | endWindowsTask + detener la tarea antes de reemplazar su definicion (commit 7eea2c9) | amelia |
| 2 | En Windows la tarea declara roamgate.stdout.log pero no redirige la salida: sin ventana no hay logs | post-work FM-27; el README indica correr service run en primer plano | amelia |

## Verificador: quinn

### Que verifico

- CA-01 en vivo: accion conhost --headless, roamgate.exe hijo de conhost, sin ventanas
- endWindowsTask probado contra la tarea real: tras /End no queda roamgate.exe ni el puerto 8789

### Hallazgos de verificacion

(ninguno)
