---
archivos:
  - accion: modificar
    ruta: server/src/herdr/bootstrap.ts
  - accion: modificar
    ruta: server/src/herdr/service.ts
  - accion: modificar
    ruta: server/src/herdr/cli.ts
  - accion: modificar
    ruta: server/src/herdr/bootstrap.test.ts
cas:
  - CA-02
depende_de:
  - T-001
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
# Tarea 002: herdr setup registra el autostart de un Herdr ya vivo

`setupHerdr` devuelve `already-running` sin registrar la tarea cuando el ping responde (`server/src/herdr/bootstrap.ts:135-141`). Si el usuario arranco Herdr a mano, el instalador nunca dejaria el autostart. Reiniciar el server mataria sus terminales (D4).

## Subtareas

1. En Windows, si Herdr responde y la tarea `dev.roamgate.herdr-<hash>` no existe, escribir la definicion y registrarla SIN `restartWindowsTask`. La tarea arrancara en el proximo inicio de sesion; `MultipleInstances IgnoreNew` evita duplicados.
2. Si la tarea ya existe, comportamiento actual (no tocar). Esto protege la tarea editada a mano del usuario.
3. Nuevo outcome o mensaje en la CLI (`cli.ts`) que diga que se registro el arranque automatico sin reiniciar.
4. Fuera de Windows no cambia nada.
5. TDD en `bootstrap.test.ts` con dependencias inyectadas: running+sin tarea registra sin reiniciar; running+con tarea no registra; no running sigue igual.

## Ejecutor: amelia

### Que hizo

- registerHerdrWindowsAutostart registra la tarea de Herdr sin arrancarla si no existe; si existe no la toca
- setupHerdr con Herdr vivo en win32 la invoca y devuelve autostartRegistered; la CLI lo informa

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | herdr setup rechaza HERDR_SOCKET_PATH aunque sea la ruta por defecto, y dentro de un pane de Herdr siempre viene definida | install.ps1 quita las variables cuando son las de defecto; arreglo de raiz como post-work FM-28 | amelia |

## Verificador: quinn

### Que verifico

- CA-02: unitarias y registro en vivo con APPDATA temporal (Ready sin ejecutar, segunda llamada no registra, Herdr del usuario intacto)

### Hallazgos de verificacion

(ninguno)
