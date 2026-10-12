---
cas:
  - CA-05
depende_de:
  - T-002
ejecutor: null
evidencia_requerida:
  api: false
  bd: false
  descartes: []
  ui: false
file_type: tarea-etapa-2
standards_cargados: []
status: pending
tipo_tarea: codigo
verificador: null
---
# Tarea 003: Primera publicacion en dinamicapps/roamgate-dist

Clonar el repo dist vacio en E:\DinamicAPPSoamgate-dist y publicar la primera version.

## Subtareas

1. git clone git@github.com:dinamicapps/roamgate-dist.git E:\DinamicAPPSoamgate-dist.
2. Correr scripts/publicar-dist.ts hacia ese espejo con push.
3. Verificar remoto: commit, tag y ausencia del .exe.

## Verificacion

1. git ls-remote muestra main y el tag.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-05 | dinamicapps/roamgate-dist tiene el commit y el tag roamgate-v0.7.15-dinamicapps.1; el .exe no esta versionado |
