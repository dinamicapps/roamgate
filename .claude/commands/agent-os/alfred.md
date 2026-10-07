---
description: Comando /alfred, gobernador del flujo de trabajo. Abordaje -> ruta -> piezas. Subcomandos iniciar, continuar, estado, reevaluar, pausar + atajos fix y --desde-diseno. Convive con /work legacy.
argument-hint: <subcomando> [args]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /alfred

Gobernador del flujo de trabajo de agent-os. Conduce: abordaje -> ruta -> piezas. Delega toda la mecanica al SKILL `agent-os/experts/bmad-agent-alfred/SKILL.md`.

> `/alfred` es la entrada canonica. `/work` es legacy en retiro: works nuevos nacen con `/alfred`, y los works en curso (incluidos los creados con `/work`) se retoman con `/alfred continuar` (CA-11, formato compartido). Alfred NO edita ningun archivo del flujo legacy. Ver `agent-os/experts/bmad-agent-alfred/gestion/convivencia-work.md`.

## Identidad

Alfred **gobierna** el flujo: recibe la intencion, ejecuta el abordaje, destila una de las rutas canonicas (MATRIZ Tabla A), y activa a los expertos en las piezas. NO analiza codigo, disena, ejecuta tareas ni revisa. Lee primero `MANIFIESTO.md`.

## Uso

```
/alfred "{descripcion}"                  # = /alfred iniciar; arranca abordaje
/alfred iniciar "{descripcion}"
/alfred iniciar --desde-diseno={slug}    # salta abordaje, ruta diseno con brief listo
/alfred fix "{descripcion}"              # atajo a ruta bugfix (alias legacy; abordaje comprimido)
/alfred hotfix "{descripcion}"          # atajo a ruta hotfix (abordaje comprimido)
/alfred continuar [slug]
/alfred estado
/alfred reevaluar [razon]
/alfred pausar "razon"
/alfred cancelar "razon"                 # terminal irreversible (estado CANCELADO + archivado)
/alfred nivel {minima|normal|maxima}     # cambia la perilla de autonomia en vivo (cadencia derivada)
                                         # alias legacy: /alfred conversacion {guiada|flow|yolo}
/alfred gobierno {on|off} [definitivo]  # puerta unica de conversacion (cancelar/reactivar; sesion o repo)
```

Estado de migración: gobierno de las 6 fases del roadmap portado; motor de bridge/zoho/learn/maintain se invoca, no se porta. El gobierno de `learn` y `maintain` está portado limpio: Alfred gobierna autónomo e invoca el motor estable, sin depender del cuerpo legacy. El retiro de `/work` (legacy) sigue siendo un gate humano, no comprometido. Roadmap y decisiones: specs internas de la nebulosa (no distribuidas).

## Proceso

1. **Guard de raiz de proyecto:** verificar `cwd` == `git rev-parse --show-toplevel`. Si no, abortar pidiendo `cd` a la raiz.
2. **Evaluar el argumento:**
   - `continuar | estado | reevaluar | pausar` -> leer y ejecutar `agent-os/experts/bmad-agent-alfred/gestion/{subcomando}.md`.
   - `grupo | contrato` -> leer y ejecutar `agent-os/experts/bmad-agent-alfred/integraciones/bridge.md` seccion correspondiente.
   - `listar | evaluar | inactivar | history | cancelar` -> leer y ejecutar `gestion/{subcomando}.md`.
   - `nivel` (o el alias legacy `conversacion`) -> leer y ejecutar `gestion/nivel.md`.
   - `gobierno` -> leer y ejecutar `agent-os/experts/bmad-agent-alfred/gestion/gobierno.md`.
   - `regresar | retroceder-a-diseno | cancelar-retroceso` -> `gestion/regresar.md`.
   - `fix promover-a-diseno` -> `rutas/bugfix/conversacion.md` seccion protocolo de promocion.
   - `bugfix promover-a-diseno` -> `rutas/bugfix/conversacion.md` seccion protocolo de promocion.
   - `revisar-qa` -> `piezas/cierre.md` seccion revisar-qa.
   - `zoho-agregar-item | zoho-listar-items | zoho-quitar-item | zoho-comentarios | zoho-comentar` -> `integraciones/zoho.md`.
   - `zoho-projects` -> `integraciones/zoho.md` seccion "Zoho Projects (ingesta de bugs/temas)".
   - `learn` (incl. `consolidar-reflexiones`) -> `mantenimiento/learn.md`; el drenaje a ADN detalla en `mantenimiento/consolidar-reflexiones.md`.
   - `maintain` -> `mantenimiento/maintain.md`.
   - `iniciar` (o descripcion sin subcomando, o `--desde-diseno`, o `fix` — alias legacy de `bugfix`) -> leer y ejecutar el SKILL: arranca abordaje (o comprimido segun atajo).
3. **Delegar al SKILL.** Toda la mecanica vive en `agent-os/experts/bmad-agent-alfred/SKILL.md` y sus carpetas (`abordaje/`, `rutas/`, `piezas/`, `gestion/`). Este comando solo enruta.

## Tabla canonica de rutas

Ver `agent-os/experts/bmad-agent-alfred/SKILL.md` seccion "Tabla canonica de rutas". (Las rutas canonicas viven en la Tabla A de `agent-os/flujo/MATRIZ-RUTAS.md`.)

`investigacion`, `documentacion` y `hotfix` son ruta Y modo a la vez (coinciden por diseno); las demas rutas usan el campo `ruta`. Detalle en la nota de SKILL.md.

## No colision con el flujo legacy `/work`

`/alfred` es un comando separado de `/work`. No comparte nombre de subcomando que cause ambiguedad: el usuario invoca `/alfred ...` explicitamente. El flujo legacy `/work` permanece intacto.
