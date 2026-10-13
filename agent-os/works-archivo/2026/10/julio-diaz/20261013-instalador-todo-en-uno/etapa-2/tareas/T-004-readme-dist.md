---
archivos:
  - accion: modificar
    ruta: scripts/instalador/README.md
cas:
  - CA-07
depende_de:
  - T-003
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
# Tarea 004: README del dist todo en uno

Actualizar `scripts/instalador/README.md`.

1. Hoy dice "Deja la consola abierta" (README.md:99) y que el instalador solo avisa si falta Herdr (README.md:38-44).
2. Documentar:
   - instalacion todo en uno y sus parametros (`-Puerto`, `-Ip`, `-Password`, `-SinServicio`);
   - de donde sale la contrasena y como cambiarla (editar roamgate.env + `roamgate.exe service restart`);
   - actualizar (`git pull` + `.\install.ps1`, sin cerrar nada a mano);
   - estado (`roamgate.exe service status`, `roamgate.exe herdr status`, `Get-ScheduledTask dev.roamgate*`);
   - logs;
   - desinstalar (`roamgate.exe service uninstall` y la tarea de Herdr con `Unregister-ScheduledTask`).
3. `install.sh` queda fuera de alcance: mencionarlo solo si su README lo describe.

## Ejecutor: amelia

### Que hizo

- README del dist: instalacion todo en uno, parametros, contrasena, uso, estado, diagnostico, quitar tareas, modo manual, actualizar y rollback a versiones previas a .4

### Hallazgos

(ninguno)

## Verificador: quinn

### Que verifico

- README revisado contra el comportamiento observado en los escenarios (parametros, contrasena, actualizar, quitar tareas)

### Hallazgos de verificacion

(ninguno)
