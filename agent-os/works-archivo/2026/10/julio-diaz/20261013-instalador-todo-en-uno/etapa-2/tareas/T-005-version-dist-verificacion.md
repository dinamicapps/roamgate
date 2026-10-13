---
archivos:
  - accion: modificar
    ruta: package.json
  - accion: modificar
    ruta: server/package.json
  - accion: modificar
    ruta: web/package.json
  - accion: modificar
    ruta: herdr-plugin.toml
  - accion: modificar
    ruta: bun.lock
cas:
  - CA-01
  - CA-03
  - CA-05
  - CA-06
  - CA-08
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
# Tarea 005: Version .4, dist local y verificacion en esta maquina

## Subtareas

1. Version `0.7.15-dinamicapps.4` en los mismos archivos que c5addb8.
2. Commit de las tareas anteriores. El commit es requisito del gate de arbol limpio de `scripts/publicar-dist.ts`; el push solo cuando el usuario lo pida.
3. `bun scripts/publicar-dist.ts` sin `--push`: build, zip y commit con tag en el espejo local `E:\DinamicAPPS\roamgate-dist`.
4. Antes de tocar nada, exportar el XML de `dev.roamgate.herdr-82e89b83b57e2645` a la carpeta de evidencia.
5. Desde el espejo, `.\install.ps1 -Puerto 8789` con la contrasena de prueba. Comprobar:
   - la tarea de Roamgate queda Running con conhost;
   - no hay ventana visible;
   - escucha en la IP de Tailscale:8789 con la version .4;
   - Herdr es reachable;
   - la tarea de Herdr no cambio (diff del XML).
6. Reinstalar la misma version: idempotente. Simular la actualizacion con la tarea corriendo: no aborta, rearranca.
7. `-SinServicio` en una copia: no toca tareas.
8. Prueba aislada de instalacion de Herdr desde herdr.dev en un temporal.
9. Confirmar que el 8787 (v0.7.8) no fue tocado.

## Ejecutor: amelia

### Que hizo

- Version 0.7.15-dinamicapps.4; commits 134cc84 y 7eea2c9 en dev (sin push)
- Dist .4 publicado en el espejo local E:\DinamicAPPS\roamgate-dist (commit 351f7f6, tag roamgate-v0.7.15-dinamicapps.4, sin push) e instalado desde ahi en 8789
- Escenarios a-e ejecutados con evidencia en etapa-4/evidencia; tarea de Herdr del usuario identica antes y despues

### Hallazgos

(ninguno)

## Verificador: quinn

### Que verifico

- Espejo real con commit 351f7f6 y tag .4 local; instalacion final con un solo proceso .4 en 8789, login 200, Herdr running
- Tarea de Herdr identica byte a byte antes y despues

### Hallazgos de verificacion

(ninguno)
