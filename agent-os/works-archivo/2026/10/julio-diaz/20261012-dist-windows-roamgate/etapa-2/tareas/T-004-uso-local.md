---
cas:
  - CA-06
depende_de:
  - T-003
ejecutor: amelia
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
file_type: tarea-etapa-2
standards_cargados: []
status: done
tipo_tarea: codigo
verificador: quinn
---
# Tarea 004: Uso en esta maquina

Instalar y arrancar el build desde la carpeta dist en 8789.

## Subtareas

1. En E:\DinamicAPPSoamgate-dist: .\install.ps1.
2. Arrancar roamgate.cmd con ROAMGATE_PORT=8789 (sin tocar el v0.7.8 de 8787).
3. Verificar en navegador: conecta a Herdr, version visible, tab de archivos operativo.

## Verificacion

1. Captura en navegador y health OK.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-06 | En esta maquina el build nuevo corre en 8789, conecta a Herdr y muestra la version, sin tocar el v0.7.8 de 8787 |

## Ejecutor: amelia

### Que hizo

- install.ps1 en E:/DinamicAPPS/roamgate-dist extrae roamgate.exe; git status del dist queda limpio (el .exe esta ignorado).
- roamgate.cmd con ROAMGATE_PORT=8789 escucha en la IP de Tailscale junto al v0.7.8 de 8787, sin tocarlo.
- Navegador: login con contrasena, interfaz con v0.7.15-dinamicapps.2 tras actualizar, tab de archivos operativo (CA-06-despues.png).

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | El arranque fallo: ROAMGATE_PASSWORD de maquina tiene 12 caracteres y esta version exige 15 (el v0.7.8 aceptaba menos) | Contrasena generada de 20 caracteres pasada solo al proceso de 8789, por decision del usuario; aviso agregado al dist en T-005 | usuario |

## Verificador: quinn

### Que verifico

- CA-06: en navegador, login y version v0.7.15-dinamicapps.2 en 8789 con el v0.7.8 intacto en 8787.

### Hallazgos de verificacion

(ninguno)
