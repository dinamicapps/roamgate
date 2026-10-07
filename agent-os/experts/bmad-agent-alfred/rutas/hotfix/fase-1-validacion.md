# Hotfix Fase 1: Validacion inicial

Antes de pausar nada o crear archivos, Atlas publica un mensaje unico pidiendo confirmacion con contrato explicito y limites declarados. El usuario debe ver exactamente que va a pasar antes de que pase.

## Regla de seleccion del work activo (por sesion)

Antes de publicar el mensaje, Atlas determina el work activo **de la sesion actual** leyendo el
archivo de sesion `agent-os/work-records/_sesiones/{session_id}.yml` (campo `work_slug`). NO se
escanean work-records en disco: eso confundiria "existe un work EN_PROGRESO" con "esta sesion lo
orquesta", y podria pausar el work de otra sesion (otro dev, otra ventana). Los works de otras
sesiones son responsabilidad de su propia sesion.

Decision en este orden:

1. **`repo_maneja_works: false`, o el archivo de sesion no existe** → no hay work activo de la
   sesion. Mensaje canonico sin paso de pausa. La fase-2 se omite.
2. **`work_slug` es `null` o ausente** → la sesion no orquesta ningun work. Igual que el caso 1.
3. **`work_slug` apunta a un work con `modo: hotfix`** → **redireccion a frente** (ver seccion
   abajo). Las fases 2 y 3 se omiten.
4. **`work_slug` apunta a un work con cualquier otro modo** (`normal` (incl. el flujo
   `rediseno-ui`) / `investigacion` / `documentacion`) → ese es el work que la fase-2 pausara.
   En el mensaje canonico, `{slug-del-work-activo}` ES ese `work_slug`.

La degradacion de los casos 1 y 2 es silenciosa (graceful): no se avisa, no se pregunta, no se
escanea — coherente con como el hook `work-block-direct-edits.sh` se comporta cuando no puede
decidir.

## Mensaje canonico (sustituir placeholders)

```
A-Atlas: Voy a iniciar hotfix con esto:
  Sintoma(s) reportado(s): "{descripcion del usuario tal como llego}"
  Work activo detectado: {slug-del-work-activo} (etapa-{N}, {tarea-actual})

Si confirmas, hare exactamente esto:
  1. Pausar {slug-del-work-activo} con razon registrada en su README.
  2. Crear carpeta agent-os/work-records/{YYYYMMDD-HHMM}-hotfix-{slug-inferido}/
     con bitacora.md como hilo maestro.
  3. Investigar (pisar codebase, buscar works relacionados, aplicar los
     principios del MANIFIESTO con P7 exento: un-break) y registrar todo en bitacora cronologica.
  4. Si aparece >1 sintoma o se ramifica, abrir bitacora F-N independiente
     por cada uno (todas al mismo nivel que la maestra).
  5. Cada frente cerrado genera commit + entry en post-works/_pendientes.md
     recordando revisar causa raiz.
  6. Al cerrar el hotfix, te quedaras con el work {slug-del-work-activo}
     pausado — para retomarlo: /alfred continuar {slug-del-work-activo}.

LIMITES DEL HOTFIX (te freno si los exceden):
  - Maximo 3 frentes abiertos simultaneamente. Si aparece 4to sintoma
    con 3 ya abiertos, te pido cerrar uno o diferirlo.
  - Maximo 5 frentes totales (cerrados + abiertos). En F6 te pido
    cerrar este hotfix y abrir uno nuevo o promover a /alfred fix.

¿Confirmas? (escribir "si" o ajustar el sintoma reportado)
```

Si **no hay work activo de la sesion** (casos 1 y 2 de la regla de seleccion), omitir el paso 1 (pausa), la linea "Work activo detectado" y el paso 6 (recordatorio de retomar).

## Ramas de respuesta

- **"si" o confirmacion equivalente:** procede a Fase 2.
- **Ajuste del sintoma:** Atlas re-publica el mensaje con el sintoma actualizado y vuelve a esperar.
- **Negativa:** Atlas no procede. Sugiere `/alfred fix` si el caso no es realmente urgente.

## Redireccion a frente (la sesion ya conduce un hotfix)

Caso 3 de la regla de seleccion: `work_slug` señala un work con `modo: hotfix`. El nuevo sintoma
NO abre un hotfix nuevo ni pausa nada — pausar un hotfix para abrir otro fragmentaria la traza del
mismo incidente en dos work-records. Atlas publica:

```
A-Atlas: Ya conduces el hotfix {slug-hotfix-vigente}. Agrego "{sintoma}" como
nuevo frente de ese hotfix — no abro hotfix nuevo ni pauso nada.
Aplican los hard stops vigentes (max 3 frentes abiertos, max 5 totales).
```

y salta directo a la **fase-4** (apertura de frente F{N}) del hotfix vigente, omitiendo las fases
2 y 3. Los hard stops de fase-4 (Stop 1 y Stop 2) se verifican alli, como con cualquier frente
nuevo — si el limite ya se alcanzo, decide el flujo de fase-4, no esta fase.

**Contencion sobre paraguas activo:** si la superficie del incidente pertenece a un
diseño paraguas activo (fila en `plan_works[]` pendiente/en progreso), el hotfix se
limita al un-break; el trabajo de fondo va al work planeado del paraguas (o entra
como work reactivo con `work_origen`, heredando linaje). Mutar el hotfix a rediseño
= señal 11 de drift. <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift". NO duplicar la regla — para modificar, editar la fuente. -->

<!-- FUENTE: .claude/MANIFIESTO.md. Los principios universales que la investigacion aplica (P7 exento en hotfix: un-break). NO duplicar -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion (desde 2026-05-21)". Esquema del archivo de sesion (work_slug, repo_maneja_works) vive alli. Aqui solo se documenta como la fase-1 lo consume. NO duplicar el esquema -- editar la fuente. -->
