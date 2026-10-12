---
cas:
  - CA-06
depende_de:
  - T-003
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: true
file_type: tarea-etapa-2
standards_cargados: []
status: pending
tipo_tarea: codigo
verificador: null
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
