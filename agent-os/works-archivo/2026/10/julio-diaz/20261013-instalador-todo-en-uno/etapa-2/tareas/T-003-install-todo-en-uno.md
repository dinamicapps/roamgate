---
archivos:
  - accion: modificar
    ruta: scripts/instalador/install.ps1
cas:
  - CA-03
  - CA-04
  - CA-05
  - CA-06
depende_de:
  - T-002
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
# Tarea 003: install.ps1 todo en uno

Reescribir el flujo de `scripts/instalador/install.ps1` segun D3 y D5-D9 del plan. Se conservan los pasos actuales: Windows-only, lectura de VERSION-roamgate, extraccion verificada por `--version`.

## Flujo

1. `param([int]$Puerto, [string]$Ip, [string]$Password, [switch]$SinServicio)`.
2. Herdr, cuando no es `-SinServicio`:
   - Buscar `herdr` en el PATH, luego en `%APPDATA%\roamgate\herdr\*\herdr.exe`.
   - Si falta, descargar `https://herdr.dev/install.ps1` a un temporal, ejecutarlo con `powershell -NoProfile -ExecutionPolicy Bypass -File` y refrescar `$env:PATH` desde el registro.
   - Abortar con mensaje claro si sigue sin aparecer.
3. Si roamgate.exe esta vivo desde esta carpeta:
   - Si lo lanzo la tarea de Roamgate (nombre `dev.roamgate-<hash>`, calculado como en `service-definitions.ts:52-66`, o leido de la definicion), `schtasks /End` y esperar hasta 15 s.
   - Si no, abortar como hoy.
4. Extraer y verificar version, como hoy. Si ya esta al dia no se extrae, pero se sigue con la configuracion: idempotente.
5. `-SinServicio`: terminar aqui con el mensaje actual de roamgate.cmd y avisar si existe la tarea.
6. .env (`%APPDATA%\roamgate\roamgate.env`):
   - Crear desde la plantilla si falta, con la misma plantilla que `DEFAULT_SERVICE_ENV_FILE`.
   - Fijar HOST, PORT, ROAMGATE_PASSWORD y ROAMGATE_DISABLE_UPDATE_CHECK=1 reemplazando o agregando lineas; el resto se preserva.
   - Escribir en UTF-8 sin BOM.
7. `.\roamgate.exe herdr setup`: cubre Herdr no corriendo y Herdr vivo sin tarea (T-002).
8. `.\roamgate.exe service install`. Si falla porque la tarea existe sin definicion, mostrar el error y la instruccion; no usar `--force` por defecto.
9. Esperar hasta 20 s a que `Ip:Puerto` responda HTTP. Mostrar URL, contrasena (solo si se genero) y comandos de estado.

## Pruebas

- PSScriptAnalyzer si esta disponible.
- Ejecucion real en T-005.
- La instalacion de Herdr se prueba aislada: HERDR_HOME y HERDR_INSTALL_DIR apuntando a un temporal, PATH sin herdr y solo el paso de Herdr. El usuario no pierde su instalacion.

## Ejecutor: amelia

### Que hizo

- install.ps1 con -Puerto/-Ip/-Password/-SinServicio validados al inicio; Herdr desde herdr.dev si falta, con refresco de PATH
- Escribe roamgate.env (HOST, PORT, ROAMGATE_PASSWORD, ROAMGATE_DISABLE_UPDATE_CHECK) preservando el resto, y anuncia la contrasena generada al escribirla
- Actualizar con la tarea viva: /End + termina el roamgate.exe 'service run' de esta carpeta, extrae, herdr setup y service install; espera el puerto

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | StrictMode: funciones que devuelven @() vacio entregan $null y [0] sobre arreglo vacio lanza | @(...) en los llamadores y Select-Object -First 1 | amelia |

## Verificador: quinn

### Que verifico

- Escenarios a, a', b, b', c, d, e con salidas en evidencia/; CA-03..CA-06 en PASS
- Validacion temprana de -Password y -Puerto aborta antes de tocar nada

### Hallazgos de verificacion

(ninguno)
