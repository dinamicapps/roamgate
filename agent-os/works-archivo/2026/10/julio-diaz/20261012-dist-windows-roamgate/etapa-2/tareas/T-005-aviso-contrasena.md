---
archivos:
  - accion: modificar
    ruta: scripts/instalador/install.ps1
  - accion: modificar
    ruta: scripts/instalador/install.sh
  - accion: modificar
    ruta: scripts/instalador/README.md
cas:
  - CA-07
depende_de:
  - T-004
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
# Tarea 005: Aviso de contrasena corta y version .2

Al arrancar el build en esta maquina fallo con `Login password must contain at least 15 characters`: el usuario tiene ROAMGATE_PASSWORD de 12 caracteres a nivel de maquina, que el v0.7.8 aceptaba. Esta tarea hace que el dist lo avise.

## Subtareas

1. install.ps1/install.sh avisan si ROAMGATE_PASSWORD tiene menos de 15 caracteres.
2. README del dist: requisito de 15+ y modo de token generado.
3. Version 0.7.15-dinamicapps.2 y publicacion.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-07 | install.ps1 avisa una ROAMGATE_PASSWORD de menos de 15 caracteres y el README explica el requisito |

## Ejecutor: amelia

### Que hizo

- install.ps1 e install.sh avisan si ROAMGATE_PASSWORD tiene menos de 15 caracteres, sin abortar.
- README del dist explica el requisito de 15+ y el modo de token generado (la consola muestra la ruta del token, no la contrasena).
- Version 0.7.15-dinamicapps.2 publicada (tag roamgate-v0.7.15-dinamicapps.2); install.ps1 actualizo de .1 a .2 y mostro el aviso.

### Hallazgos

(ninguno)

## Verificador: quinn

### Que verifico

- CA-07: install.ps1 mostro el aviso con la variable de 12 caracteres de esta maquina.

### Hallazgos de verificacion

(ninguno)
