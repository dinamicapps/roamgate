---
cas:
  - CA-05
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

## Ejecutor: amelia

### Que hizo

- Clonado dinamicapps/roamgate-dist (vacio) en E:/DinamicAPPS/roamgate-dist.
- publicar-dist.ts --push: binario 103,6 MB 0.7.15-dinamicapps.1, zip 43,7 MB, VERSION-roamgate sha=d17b0f4.
- Remoto verificado: main y tag roamgate-v0.7.15-dinamicapps.1 en 53f7037; 8 archivos versionados y el .exe fuera de git.

### Hallazgos

(ninguno)
