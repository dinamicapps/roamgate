# Evidencia UI - 20261012-dist-windows-roamgate

Captura con Playwright sobre el binario publicado en el dist (E:\DinamicAPPS\roamgate-dist\roamgate.exe), arrancado con roamgate.cmd en http://100.82.222.117:8789 y login por contrasena, junto al v0.7.8 en 8787.

## Capturas por CA

| Archivo | CA | Que muestra |
|---|---|---|
| `CA-06-despues.png` | CA-06 | Roamgate del dist en 8789 tras el login, con v0.7.15-dinamicapps.2 en la interfaz |

## Calidad UI (CU)

### Interfaz del build del dist (sin cambios de UI en este work)
- CU-1: PASS — evidencia: login con contrasena, Files abre el tab de archivos de la consola.
- CU-2: PASS — evidencia: estado de login (no autenticado -> autenticado) y version visible.
- CU-3: DEGRADADO (sin standard frontend en agent-os/standards, senal DT emitida). No se modifico UI.
- CU-4: PASS — sin cambios de layout.
- CU-5: PASS (vista real: binario compilado del dist en http://100.82.222.117:8789/).

## Llegada

- roamgate.cmd imprime la URL -> navegador -> pantalla de login -> aplicacion. Verificada.
