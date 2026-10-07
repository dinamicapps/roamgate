---
name: run-system
description: Contrato duro para compilar, iniciar, detener y ejecutar tests del sistema bajo un work activo. Lee test-env.local.json como fuente de verdad, ejecuta, aprende del usuario si el comando es desconocido, y escribe el archivo con confirmacion y bitacora.
---

# Run System — Contrato de ejecucion del sistema

## Proposito

Encapsular el ciclo **leer → validar → ejecutar → aprender → escribir** para todas las acciones que operen el sistema:

- `build` — compilar backend/frontend.
- `run` — iniciar backend/frontend, esperar readiness.
- `test` — ejecutar la suite de pruebas del componente.
- `stop` — detener limpiamente.

`test-env.local.json` (en el root del proyecto) es la **fuente de verdad** de los comandos. Este skill lo lee antes de ejecutar, lo actualiza cuando descubre comandos nuevos con confirmacion del usuario, y registra cada cambio en bitacora.

**Regla de oro:** si un anfitrion o invitado necesita compilar, iniciar, probar o detener el sistema dentro de un work activo, DEBE invocar este skill. No se permite construir el comando ad-hoc.

## Interfaz de invocacion

```
run-system accion={build|run|stop|test} componente={backend|frontend} [--reinicio]
```

- `accion` (obligatorio): una de las 4 acciones del contrato.
- `componente` (obligatorio): `backend` o `frontend`.
- `--reinicio` (opcional, solo aplica a `run`): forzar stop+run aunque haya proceso vivo.

Valor de retorno: `{ exito: bool, salida_resumida: string, url_sistema: string|null, pid: int|null }`.

## Pre-requisitos

- `test-env.local.json` existe en el root del proyecto (descubrible via `git rev-parse --show-toplevel`).
- El archivo tiene `$version: 2` (schema con campos build/run/test/stop por componente).

Si falta o es legacy, el skill aborta con instruccion al usuario:

```
El contrato de ejecucion del sistema requiere test-env.local.json en el root con $version: 2.
Estado actual: {no existe | $version: 1 (legacy)}.

Ejecuta:
  /alfred maintain regenerar-entorno

Eso copia el template nuevo y te guia a llenar los campos minimos.
```

## Flujo detallado

### Paso 1 — Leer

Leer `test-env.local.json` desde `{project-root}/test-env.local.json`. Validar:

- Archivo parseable como JSON.
- `$version >= 2`.
- Existe la rama `sistema.{componente}.{accion}`.

Si falla cualquiera: abortar con mensaje al usuario. Si el archivo existe pero es `$version: 1`, sugerir `/alfred maintain regenerar-entorno`.

### Paso 2 — Validar completitud

Leer `sistema.{componente}.{accion}.comando`. Evaluar:

- `null` o string vacio → el comando no esta poblado. Saltar a **Aprender**.
- String que contiene placeholder tipo `{...}` (heuristica: regex `\{[A-Za-z_][A-Za-z0-9_]*\}`) → template sin llenar. Saltar a **Aprender**.
- String concreto → saltar a **Ejecutar**.

Tambien leer `cwd` (default: `.`), `url` y `healthCheck` si `accion=run`.

### Paso 3 — Ejecutar

Ejecutar el comando con la siguiente semantica por accion:

**`build`:**
- Ejecutar el comando en el `cwd` declarado.
- Exito = exit code 0.
- Al terminar (exito o fallo), actualizar silenciosamente en el archivo:
  - `sistema.{componente}.build.ultima_verificacion = "{fecha YYYY-MM-DD}"`
  - `sistema.{componente}.build.ultimo_resultado = "success" | "failure"`
  - NO cambia `comando`. Esto es telemetria, no aprendizaje.

**`run`:**
- Ejecutar en background (background tool de la shell). Registrar `pid` devuelto.
- Esperar readiness con health check:
  - Si `url` + `healthCheck` presentes: hacer GET a `{url}{healthCheck}` cada 2 segundos hasta 30 segundos totales. Exito si responde 2xx.
  - Si no hay health check declarado: esperar 5 segundos y asumir exito si el proceso sigue vivo.
- Actualizar telemetria (`ultima_verificacion`, `ultimo_resultado`).
- Guardar `pid` y `componente` en memoria de sesion del skill para poder hacer `stop` luego.

**`test`:**
- Ejecutar en foreground. Exito = exit code 0.
- Actualizar telemetria.

**`stop`:**
- Si el comando esta declarado en el archivo: ejecutarlo.
- Si no hay comando declarado: usar PID registrado en memoria de sesion (del run previo) y enviar SIGTERM (Windows: `taskkill /PID {pid} /T /F` con advertencia al usuario; Unix: `kill {pid}`). Ir a **Aprender** para pedir al usuario como lo haria el idealmente (ej. puerto, contenedor docker).
- Limpiar el PID de la memoria de sesion.

### Paso 4 — Si ejecucion falla

Cuando `build`/`run`/`test` retorna exit code no-zero o readiness falla:

1. Capturar stderr y los ultimos 20 lineas de stdout.
2. Mostrar al usuario un resumen narrativo:
   ```
   Intente ejecutar "{comando}" en {cwd}. Fallo con exit {code}.

   Ultimas lineas de salida:
   {resumen}

   ¿Como procedemos?
   ```
3. AskUserQuestion con 3 opciones:
   - **Corregir comando** — el comando en test-env.local.json esta incorrecto; me dices el bueno.
   - **Ambiente mal** — el comando es correcto pero mi ambiente local no esta listo (BD caida, dependencias faltantes). No modifica el archivo.
   - **Cancelar** — aborto la accion. El anfitrion decide como seguir.
4. Si **Corregir comando** → Aprender. Si **Ambiente mal** → actualizar solo `ultimo_resultado: "failure"` y devolver al anfitrion con `exito: false`. Si **Cancelar** → devolver `exito: false` sin tocar archivo.

### Paso 5 — Aprender (comando nuevo o correccion)

1. AskUserQuestion con campo libre:
   ```
   ¿Cual es el comando correcto para {accion} el {componente}?

   Actual: {comando_actual o "null"}
   cwd actual: {cwd}

   Responde con el comando completo. Si el cwd tambien cambia, incluyelo en la respuesta (formato: "cwd={...} {comando}").
   ```
2. Parsear la respuesta (detectar prefijo `cwd=...` opcional).
3. Ejecutar el comando nuevo (paso 3).
4. Si **tambien falla**: volver al paso 4 (el usuario puede reintentar o declarar ambiente malo).
5. Si **exito**: proponer escritura al archivo con diff visible:
   ```
   Comando funciono. Propongo actualizar test-env.local.json:

   sistema.{componente}.{accion}:
   - comando: {old}
   + comando: {new}
   - cwd: {old_cwd}
   + cwd: {new_cwd}

   ¿Guardo el cambio?  (si | no, solo usar en esta sesion | no, cancelar accion)
   ```
6. Si **si**: escribir el archivo (preservando el resto de campos intactos), registrar en bitacora.
7. Si **solo sesion**: NO escribir; guardar en memoria de sesion del skill. Siguiente invocacion vuelve a preguntar.
8. Si **cancelar**: devolver exito (el comando ya se ejecuto) pero sin persistir.

### Paso 6 — Registrar en bitacora

Cuando el archivo se escribe (paso 5 rama **si**), anadir entrada en `etapa-N/bitacora.md` donde N es la etapa actual del work (leer de README del work-record). Si no hay work activo, escribir en `agent-os/bitacora-run-system.md` del proyecto como fallback.

Formato de entrada:

```markdown
## {YYYY-MM-DD HH:MM} — test-env.local.json actualizado por run-system

- Invocacion: `run-system accion={accion} componente={componente}`
- Campo modificado: `sistema.{componente}.{accion}.comando`
- Valor anterior: `{old}` (o "null")
- Valor nuevo: `{new}`
- cwd anterior: `{old_cwd}` → nuevo: `{new_cwd}` (si cambio)
- Contexto: tarea T-{NNN} (si aplica) | invocacion standalone
- Aprobado por usuario en esta sesion.
```

## Modo de operacion: init (subproceso)

Cuando `/alfred maintain regenerar-entorno` o el validador de entrada del abordaje (Fase 2) detecta que el archivo falta, invoca a este skill en modo `init`:

```
run-system init
```

Flujo de `init`:

1. Si `test-env.local.json` ya existe: no hacer nada, retornar OK.
2. Copiar `agent-os/templates/test-env.local.json` (o en ausencia, el template del repo agent-os) al root del proyecto.
3. Informar al usuario:
   ```
   Copie test-env.local.json al root. Todos los campos estan en null.

   Los skills de build/run/test preguntaran el comando cuando los invoque el flujo.
   Si prefieres pre-llenarlos ahora, abre el archivo y pon los comandos que ya conozcas.
   ```
4. NO forzar llenado ahora — el auto-aprendizaje los pobla al primer uso.

## Idempotencia y seguridad

- **Reinicio:** si se invoca `run componente=backend` y ya hay un PID vivo registrado en memoria de sesion, preguntar al usuario: "ya hay un backend corriendo (PID {pid}). ¿Reiniciar (stop + run) o mantener?". Con `--reinicio`: saltar la pregunta y reiniciar.
- **Cierre limpio al pausar/cancelar work:** al recibir signal de cierre (pause, cancelar, fin de sesion), invocar `stop` sobre todos los componentes con PID vivo en memoria. Esto cumple la directiva de work.md: *"SIEMPRE detener servidores iniciados para pruebas"*.
- **Nunca ejecutar destructivamente:** si el comando aprendido contiene patrones peligrosos (`rm -rf`, `drop database`, `--force-push` a main), el skill pide confirmacion adicional antes de ejecutar.
- **Comandos interactivos (login, 2FA):** el skill detecta timeout (readiness falla tras 30s sin output) y cede al usuario: *"el comando parece requerir interaccion. Ejecutalo tu manualmente: `{comando}` desde `{cwd}`, y cuando el sistema este arriba responde aqui."* El archivo NO se actualiza hasta que el usuario confirma que funciono.

## Invocadores tipicos

| Invocador | Cuando invoca |
|-----------|----------------|
| Amelia/Atlas (E3, modo `normal`, o el flujo `rediseno-ui`) | Antes de ejecutar cada tarea de tipo codigo que requiera compilar, iniciar o testear. |
| Quinn (E4, modo `normal`, o el flujo `rediseno-ui`) | Al iniciar verificacion: build → run → tests → al cerrar: stop. |
| Tessa (invitada por Quinn) | Nunca directamente. Quinn ya tiene el sistema corriendo cuando la invita. |
| Sentinel (invitada por Quinn) | Nunca directamente. Quinn ya tiene el sistema corriendo. |
| Amelia CR (invitada por Quinn) | Nunca directamente. Quinn ya compilo. |
| Mary (E3, modo investigacion) | Solo si un frente investigativo requiere ejecutar un script (ej. extraer datos). No para "compilar el sistema". |
| Paige (E2/E3, modo documentacion) | Solo si la generacion del documento requiere ejecutar algo (ej. generar diagramas). No para "compilar el sistema". |

## Referencias

- Template del archivo: `agent-os/templates/test-env.local.json` (en el repo agent-os) y `test-env.local.json` en el root de cada proyecto instalado.
- Directiva de stop al pausar: gobernada por `/alfred pausar` (`agent-os/experts/bmad-agent-alfred/gestion/pausar.md`); el motor `/work` legacy fue retirado de circulacion (git es el archivo historico).
- Validacion de entrada: `agent-os/experts/bmad-agent-alfred/abordaje/fase-2-recolectar.md` seccion "Validaciones que Fase 2 puede accionar".
- Hooks obligatorios: `agent-os/skills/host-protocol/etapas/etapa-3.md` y `etapas/etapa-4.md` seccion "Contrato de ejecucion del sistema".
