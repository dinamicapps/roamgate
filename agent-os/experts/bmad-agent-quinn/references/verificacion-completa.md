---
name: verificacion-completa
description: Orquesta la verificacion completa de un work - clasifica CAs, ejecuta pruebas por capa, coordina agentes y reporta estado final.
menu-code: VC
---

# Verificacion Completa

Verificar el trabajo contra los CAs. Ejecutar pruebas reales, no simulaciones. Coordinar con Amelia, Tessa y Sentinel segun corresponda. Reportar estado final a work.md.

## Entradas requeridas

- `etapa-1/01-discovery.md` - CAs a verificar
- `etapa-2/stories/` - stories implementadas
- `etapa-3/06-hallazgos.md` - archivos modificados
- `test-env.local.json` (schema v2) - contrato de entorno (URL, BD, credenciales, comandos build/run/test/stop por componente)

Si `test-env.local.json` no existe o es schema legacy, NO pedirlo manualmente — invocar `/alfred maintain regenerar-entorno` (subproceso de `run-system init`). Sin el contrato no hay verificacion en modo `normal` (o la ruta `rediseno-ui`).

## Clasificacion de CAs

Leer los CAs del discovery y clasificar cada uno por tipo de verificacion:

| Tipo | Quien verifica | Cuando aplica |
|------|---------------|---------------|
| Tests automatizados (unitarios, API) | Quinn + Amelia | Siempre que haya logica de negocio o endpoints |
| E2E en browser | Tessa | Cuando el trabajo toca UI |
| Seguridad activa | Sentinel | Cuando el trabajo toca endpoints, auth o permisos |
| Verificacion manual | Usuario | Cuando no es automatizable (UX visual, flujos complejos) |

Un CA puede requerir mas de un tipo de verificacion. Presentar la clasificacion al usuario antes de ejecutar.

## Ejecucion por capa

Ejecutar en entorno real usando las credenciales de `test-env.local.json`. Nunca contra produccion.

**Ciclo obligatorio via `run-system`** (en modo normal, o la ruta `rediseno-ui`):

```
run-system accion=build componente=backend   # compilar limpio antes de verificar
run-system accion=run   componente=backend   # iniciar + health check
# ... delegaciones a invitados con el sistema corriendo ...
run-system accion=stop  componente=backend   # detener al terminar
```

El `run` devuelve la URL real del sistema, que Quinn pasa a los invitados.

### Tests automatizados

Invocar `run-system accion=test componente=backend` (o `frontend`). El skill lee el comando de `sistema.{componente}.test.comando` en `test-env.local.json` y lo ejecuta.

Si la cobertura de CAs es insuficiente - faltan tests para CAs criticos - invocar a Amelia para code review orientado a identificar que tests faltan y generarlos.

### E2E en browser (si aplica)

Invocar a Tessa con:
- URL del sistema (devuelta por `run-system accion=run`, o leida de `sistema.backend.run.url` en el contrato)
- Flujos afectados (derivados de los CAs clasificados como E2E)
- Credenciales de prueba por perfil (de `credenciales.admin` o `credenciales.perfiles[N]`)

### Seguridad (si aplica)

Invocar a Sentinel con:
- URL del sistema (devuelta por `run-system accion=run`)
- Endpoints afectados (derivados de hallazgos y tareas)
- Credenciales de prueba

**NUNCA ejecutar verificacion de seguridad contra produccion.**

### Notas de gate: arbol real, patron sistemico e instrumentacion

- **Git es la fuente de verdad del estado, no la bitacora.** Verifico `git diff/status` en cada gate: (1) al iniciar E4 confirmo que los cambios de etapas previas siguen aplicados — procesos paralelos (hooks/linters, regeneracion de codegen del usuario) pueden revertir o sobrescribir el arbol entre etapas; (2) el inventario de cierre sale de git diff, no de la bitacora, que incluye reversiones; (3) corro el build/prueba de forma independiente y compruebo el estado del arbol (artefactos esperados, .bak, timestamps), no el reporte del ejecutor.
- **Fix sistemico en todos los sitios del patron; dataset que ejerce todas las ramas.** Cuando Fase 2 revela un bug causado por un patron repetido (mismatch alias POCO/SP, campo de presentacion faltante) en N sitios, aplico el fix en TODOS los sitios del mismo patron: la verificacion proactiva cuesta menos que un segundo ciclo E4. Y un fix sobre un generador/switch multi-rama no esta completo hasta que el dataset de prueba ejerce TODAS las ramas — un dataset homogeneo deja deuda latente en las ramas no ejercidas.
- **Higiene de la instrumentacion temporal de diagnostico.** (1) grep de regiones existentes antes de agregar nuevas y reusar si cubren el punto de observacion; (2) instrumentar en el camino real ANTES de formular hipotesis; (3) retirar al cierre seguido de smoke build — si el build rompe al retirar los logs, el artefacto tenia dependencia del log (defecto de diseno, no del retiro).

## Falsos verdes: lo que el build NO ve

Un smoke con `exit=0` del compilador, en un stack donde parte del codigo no se compila (lenguaje tipado + scripts interpretados servidos sin compilar), es necesario pero nunca suficiente. Antes de tratarlo como base de verificacion, descarto explicitamente estas trampas:

| Trampa | Por que pasa el build | Como lo detecto |
|--------|----------------------|-----------------|
| Sintaxis rota en codigo interpretado | El compilador del lenguaje tipado no toca los scripts; una llave huerfana en un script grande da build verde y rompe el flujo solo en runtime | Corro el chequeo de sintaxis del propio interprete (p.ej. `node --check`) en todo cambio sobre un script grande antes de Fase 2 |
| Archivo nuevo fuera del manifiesto de compilacion | Sin inclusion por wildcard, un archivo fisicamente presente pero no listado en el manifiesto del proyecto compila verde y da 404 / no-encontrado en runtime | Verifico que cada archivo nuevo este referenciado en el manifiesto de compilacion |
| Rama de compilacion condicional inactiva | Con el build en una configuracion, la rama activa de un condicional de compilacion puede ser la otra; un cambio en la rama inactiva es invisible al build actual | Confirmo en que configuracion compila y reviso la rama que de verdad se activa |
| Restricciones de la base de datos | El compilador no toca la BD: NOT NULL, ramas de actualizacion faltantes y el mapeo del ORM desincronizado del esquema pasan verde | Verifico contra la BD real del contrato de entorno, no contra el build |
| Codigo muerto | Una clase rota sin consumidores produce 0 errores en runtime, no un fallo — la ausencia de error no es correctitud | No infiero correctitud de la ausencia de error; ejercito el codigo o declaro la brecha |
| Artefacto viejo servido tras recompilar | El host web (IIS lockea la DLL, o un bundle cacheado por hash) sigue sirviendo el binario anterior aunque el build de codigo fuente de verde | Detengo el host, recompilo y confirmo que el artefacto nuevo cargo (timestamp del binario / reciclar el host + recarga sin cache) antes del veredicto runtime |
| UI interpretada renderiza pero no inicializa/bindea | Un controller que no registra, DI faltante o un tipo de input incorrecto rompen solo en runtime; el render/fetch de la UI da verde igual | Emparejo la captura visual con un probe del scope/DOM (getComputedStyle, eval del scope) para verificar inicializacion, bindings y tipos |

## Triage del dueno del fallo

Antes de bloquear un cierre o reabrir un work por un rojo en verificacion, determino de quien es el fallo. Tres categorias donde el rojo NO era del codigo bajo prueba:

- **Dato de seed atipico.** Un test de invariante aritmetico (dos lados que deben cuadrar) fallo porque un registro sintetico del seed traia una configuracion atipica, no por el fix. Mitigacion: elijo fixtures con la configuracion mas simple posible (el caso minimo donde el invariante se cumple trivialmente).
- **Tipo inyectado por el instrumento.** Errores de validacion de formato aparecieron al inyectar por script un valor del tipo equivocado (un texto crudo en un campo que el framework espera tipado); la interaccion real del usuario nunca dispara ese error. Mitigacion: inyecto el tipo que el framework espera, no un sustituto.
- **Borde del propio instrumento.** Un extractor por patron del validador, corriendo sobre un archivo enorme, absorbio la ultima region en su captura y produjo un falso negativo del validador, no del codigo generado. Mitigacion: verifico los bordes del instrumento antes de creerle su veredicto.

## Auditoria de evidencia EV-N (works desde 2026-06-09, modo normal o ruta `rediseno-ui`)

Cuando hay tareas con `evidencia_requerida` activa, Quinn audita los artefactos producidos por los
expertos de dominio (Sentinel/Tessa/Dexter) con cuatro chequeos: EV-1 completitud, EV-2 suficiencia,
EV-3 coherencia cruzada, EV-4 trazabilidad de brechas. **Quinn coordina; el experto produce.** Quinn
NO captura pantallas, NO ejecuta SQL, NO llama endpoints: invita al productor de cada eje. Si el
experto no fue invitado a E4, lo invita antes de marcar el eje como verificado. EV-3 (coherencia
cruzada) detecta el "exito aparente" y es bloqueante: si ataca la meta, dispara `/alfred reevaluar`, no
deuda tecnica. Detalle (incluyendo el principio de roles) en
`agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`.

## Resultados consolidados

Presentar al usuario una tabla resumen:

```
CA       | Tipo        | Agente   | Estado  | Evidencia
---------|-------------|----------|---------|----------
CA-001   | Unit/API    | Quinn    | PASS    | 4/4 tests green
CA-002   | E2E         | Tessa    | PASS    | Flujo login verificado
CA-003   | Seguridad   | Sentinel | PASS    | Headers OK, CORS OK
CA-004   | Manual      | Usuario  | PENDIENTE | Requiere verificacion visual
```

## Taxonomia de brechas al cierre

Clasifico cada limitacion de Fase 2 en tres tipos: (a) limitacion de alcance deliberada -> `COMPLETADO_CON_BRECHA` aceptable, brecha registrada en `meta_revisiones[]`; (b) error logico o mal cableado del work (gate en codigo muerto, gate nunca ejecutado) -> reevaluacion obligatoria, NO se traslada a otro work; (c) limitacion externa del entorno (permiso/DMV denegada, cuenta de prueba sin rol, modulo inaccesible, deploy no disponible) -> la meta SI se cumple, solo la comprobacion queda pendiente: declaro el bloque `verificacion_diferida{}` (causa del enum, evidencia sustituta con anclas, plan de confirmacion con `revisar_el` y responsable) y cierro con `--estado COMPLETADO` -> el runtime deriva `COMPLETADO_VERIFICACION_DIFERIDA`, sin reevaluacion ni descuento de meta. Criterio del corte a..c: la meta se cumple en el camino real?

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/piezas/verificacion.md seccion "Chequeo de meta y rumbos del hallazgo". Las 4 salidas del chequeo de meta y el bloque verificacion_diferida{}. NO duplicar el schema del bloque -- editar la fuente. -->

Si Fase 1 esta verde, ejecuto Fase 2 en la siguiente sesion disponible o declaro brecha explicita en el momento; diferirla (subordinada a otro work o a un deploy combinado) produce works zombie que otro work supera antes de verificar. Y no acepto "sin candidatos en los datos de prueba": un candidato que nunca dispara en Fase 2 es senal de bug de fondo (nivel de id, filtro que siempre excluye), no de datos insuficientes -> disparar reevaluacion antes de aceptar la brecha.

## Manejo de pruebas no ejecutadas

Si el usuario no puede o no quiere ejecutar pruebas, el eje que decide la salida ya no es "hay pruebas si/no": es si la **meta** se cumplio.

### La meta se cumplio, la comprobacion no es ejecutable aqui (sin acceso, entorno no configurado, delegado a QA externo)

No es un estado de pausa: el work **cierra**. Declaro el bloque `verificacion_diferida{}` con `AskUserQuestion` (nunca lo asumo) -- causa del enum, evidencia sustituta con anclas, plan de confirmacion con `revisar_el` y responsable -- y cierro con `--estado COMPLETADO`. El runtime deriva `COMPLETADO_VERIFICACION_DIFERIDA`; no pasa por reevaluacion ni toca `meta_revisiones[]`. Nunca pido `--estado COMPLETADO_VERIFICACION_DIFERIDA` directo: el runtime lo rechaza con `ESTADO_NO_DERIVABLE`.

### La meta NO se cumplio del todo y el usuario acepta cerrar igual

Requiere **doble confirmacion**. Antes de aceptar, presento:

> "Estas cerrando este work con una brecha de meta: {brecha en una frase}. Si algo falla en produccion, no hay red de seguridad para esa parte. ?Confirmas que quieres cerrar con esta brecha?"

Solo si el usuario confirma explicitamente por segunda vez -> disparo `/alfred reevaluar` (camino c) y cierro como `COMPLETADO_CON_BRECHA` con la brecha registrada en `meta_revisiones[]`.

`VERIFICACION_PENDIENTE` y `COMPLETADO-SIN-PRUEBAS` son estados legacy (works pre-2026-04-23): no los ofrezco en works nuevos, y el runtime ya no los acepta como terminal pedible.

## Estados resultantes

| Estado | Significado |
|--------|-------------|
| `COMPLETADO` | Meta vigente alcanzada, verificada sin brecha |
| `COMPLETADO_VERIFICACION_DIFERIDA` | Meta vigente alcanzada entera; comprobacion no ejecutable en este ambiente. Derivado por el runtime a partir de `--estado COMPLETADO`, nunca pedido |
| `COMPLETADO_CON_BRECHA` | Usuario acepto brecha de meta; meta ajustada en `meta_revisiones[]` |

<!-- FUENTE de la tabla completa de estados terminales y su definicion: agent-os/skills/host-protocol/etapas/etapa-4.md seccion "Estados de cierre". Aqui solo los tres que Quinn puede proponer al cerrar E4 en modo normal. NO duplicar mas alla de estos tres -- editar la fuente. -->

## Output

Escribir resultados en `{work_output_path}/pruebas-quinn.md` con:
- Tabla de CAs verificados por agente
- Resultado de cada capa de pruebas
- Estado final
- Timestamp

Tessa y Sentinel escriben sus propios reportes:
- `{work_output_path}/pruebas-tessa-e2e.md`
- `{work_output_path}/pruebas-sentinel-seguridad.md`

Informar a work.md el estado final y los CAs verificados.
