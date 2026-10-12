---
archivos:
  - accion: crear
    ruta: scripts/publicar-dist.ts
  - accion: crear
    ruta: scripts/instalador/install.ps1
  - accion: crear
    ruta: scripts/instalador/install.sh
  - accion: crear
    ruta: scripts/instalador/roamgate.cmd
  - accion: crear
    ruta: scripts/instalador/README.md
cas:
  - CA-02
  - CA-03
  - CA-04
depende_de:
  - T-001
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
file_type: tarea-etapa-2
standards_cargados: []
status: in_progress
tipo_tarea: codigo
verificador: null
---
# Tarea 002: Publicador del dist e instalador

Script de publicacion y fuentes del instalador y lanzador, siguiendo el patron de claude-mcp-bridge-launcher (publicar.ts + scripts/instalador).

## Subtareas

1. scripts/publicar-dist.ts: build:windows-x64, zip del .exe, VERSION-roamgate, copia de instalador/lanzador/README al espejo, commit 'roamgate vX (sha)' y tag; push solo con flag.
2. scripts/instalador/: install.ps1, install.sh (gemelo), roamgate.cmd, README.md del dist, .gitignore del dist (roamgate.exe).
3. Pruebas puras para la logica que se pueda aislar (VERSION, nombres de tag).

## Verificacion

1. Publicacion en un espejo temporal produce la estructura esperada.
2. install.ps1 sobre carpeta temporal extrae el .exe y es idempotente.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-02 | scripts/publicar-dist.ts compila, empaqueta el zip, escribe VERSION-roamgate y deja el espejo con commit y tag por version |
| CA-03 | install.ps1/install.sh extraen roamgate.exe junto al lanzador, no tocan un proceso en ejecucion y son idempotentes con la misma version |
| CA-04 | roamgate.cmd arranca en la IP de Tailscale de la maquina si existe, si no en 127.0.0.1, y respeta ROAMGATE_PORT (8787 por defecto) |
