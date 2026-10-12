---
archivos:
  - accion: modificar
    ruta: package.json
  - accion: modificar
    ruta: server/package.json
  - accion: modificar
    ruta: web/package.json
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
# Tarea 001: Version del fork

Marcar el build como nuestro: 0.7.15-dinamicapps.1.

## Subtareas

1. Cambiar version en package.json, server/package.json y web/package.json.
2. Verificar pruebas de release/version (scripts/*.test.*) con el sufijo.

## Verificacion

1. bun test de scripts relacionados en verde.
2. Binario compilado: roamgate.exe --version.

## CAs que implementa

| ID | Criterio |
|---|---|
| CA-01 | roamgate --version y la interfaz muestran 0.7.15-dinamicapps.1 |

## Ejecutor: amelia

### Que hizo

- Version 0.7.15 -> 0.7.15-dinamicapps.1 en los 3 package.json, las 2 entradas de workspaces de bun.lock y herdr-plugin.toml; bun install --frozen-lockfile sin cambios.
- Pruebas de scripts de version, update.test.ts y web sin fallas nuevas (comparado con git stash); typecheck web y server limpios.
- roamgate.exe --version queda para T-002/T-004, que compilan el binario.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | herdr-plugin.toml:3 duplicaba la version y prepare-release.ts:176-182 exige que coincida | Alineado; archivo no declarado aceptado | amelia |
| 2 | scripts/prepare-release.ts:26,83-85 solo acepta X.Y.Z y aborta con el sufijo | Es el flujo de release del upstream; no aplica al dist Windows. Registrado en post-works | amelia |
| 3 | update.ts:160-189 trata 0.7.15-dinamicapps.1 como menor que 0.7.15 del upstream; en macOS/Linux ofreceria actualizar al upstream. En Windows no aplica (UPDATE_PLATFORMS sin win32) | Registrado en post-works: si el fork llega a macOS/Linux usar ROAMGATE_UPDATE_BASE_URL o ROAMGATE_DISABLE_UPDATE_CHECK, o build metadata | amelia |

## Verificador: quinn

### Que verifico

- CA-01: roamgate.exe --version y la interfaz muestran la version del fork (.1 y luego .2).

### Hallazgos de verificacion

(ninguno)
