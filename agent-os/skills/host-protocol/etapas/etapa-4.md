---
name: etapa-4
description: Etapa 4 Verificacion - Anfitrion Quinn clasifica CAs y coordina pruebas por capa (local + bridge). Reporte consolidado al cierre.
---

# Work Etapa 4 — Verificacion

## Anfitrion

<!-- FUENTE de la tabla maestra de anfitriones por etapa: agent-os/skills/host-protocol/etapas/README.md seccion "Tabla maestra — Anfitriones por etapa y modo". Aqui solo se documenta info especifica de E4 (roster por modo, senales, criterio de cierre, fases de verificacion). NO duplicar la tabla maestra. -->

**Quinn** — `agent-os/experts/bmad-agent-quinn/SKILL.md`

Prefijo de voz en cada mensaje: `A-Quinn:`.

## Roster de invitables por modo

Quinn es anfitriona de Etapa 4 en **todos los modos**. Lo que cambia es a quien invita y que observables se verifican.

### Modo `normal`

| Experto | Cuando invitarlo |
|---------|------------------|
| Amelia | Code review (CR) como parte de verificacion |
| Sentinel | **Pruebas activas obligatorias contra cada endpoint declarado en bloques `capa_seguridad` (capacidad `[VP]`)**. Tambien pruebas activas adhoc si surgen senales de seguridad. |
| Cipher | **Auditoria criptografica CR-1..CR-6 obligatoria cuando alguna tarea declara `capa_seguridad.dominios` conteniendo `cripto` (capacidad `[VF]`)**: interoperabilidad con verificador independiente, estampa, cadena, custodia de llaves, fail-closed, parametrizacion. Evidencia en `etapa-4/evidencia/cripto/`. |
| Tessa | E2E en browser (si existe y aplica). Con `evidencia_requerida.ui: true` ademas produce la rubrica CU-1/2/4/5 (tarjeta `etapas/etapa-4/calidad-ui.md`) |
| Sally | Veredicto de usabilidad (CU-3 adherencia al standard + juicio perceptual de CU-4) cuando alguna tarea declara `evidencia_requerida.ui: true` — capacidad `[VU]`, tarjeta `etapas/etapa-4/calidad-ui.md` |
| Atlas | Cruce de disciplinas en verificacion (SEC + E2E + PERF simultaneo) |

### Modo `evolucion` (legacy, deprecado -> ruta `rediseno-ui`)

Mismos invitables que `normal` + **Sally** con capacidad VE (validate-evolution): verifica que los artefactos cumplen los invariantes LE. En works legacy (abiertos antes de 2026-05-05, cuando E1 corria en todos los modos) esos invariantes se definieron en E1/E2; en works `evolucion` nuevos (modo deprecado, sin E1) se definen en E2.

### Modo `investigacion`

| Experto | Cuando invitarla |
|---------|------------------|
| Mary | Validar cobertura de frentes, exhaustividad de opciones evaluadas, trazabilidad de fuentes |
| Paige | Revision editorial del insumo consolidado con capacidad `validate-doc` (claridad, consistencia, estructura) |
| Winston | Revisar validez tecnica de opciones si el insumo tiene dimension arquitectonica |
| Sentinel | Revisar validez de conclusiones de seguridad si el insumo toca compliance/auth |
| Cipher | Revisar validez de conclusiones criptograficas si el insumo toca firma digital, PKI, llaves o cifrado |

Amelia, Atlas, Tessa NO son invitados: no hay codigo ni UI que verificar.

### Modo `documentacion`

| Experto | Cuando invitarla |
|---------|------------------|
| Paige | Revision editorial con `validate-doc` por documento: cobertura de audiencia, completitud del TOC (contrastado contra el derivado de su plantilla; desviacion sin registro en E1 = brecha), consistencia |
| Tessa | Si el documento incluye screenshots, validar que estan actualizados y coinciden con la UI real |
| Mary | Validar que el documento cubre los CAs de E1 desde la perspectiva del lector objetivo |
| Winston | Validar exactitud tecnica de secciones arquitectonicas |
| Sentinel | Validar exactitud de secciones sobre seguridad/compliance |
| **Usuario objetivo** | Si es alcanzable, validacion con un lector real del rol declarado en `audiencia_documento`. Si no es alcanzable en el work, registrar brecha (`COMPLETADO_CON_BRECHA`). |

Amelia, Atlas NO son invitados: no hay codigo que revisar.

## Senales a detectar por modo

### Modo `normal` (incl. legacy `evolucion`)

- CA toca endpoints/API → invitar Sentinel.
- CA toca UI → invitar Tessa si aplica.
- CA requiere review de codigo → invitar Amelia.
- Test case con `alcance: bridge` → ejecutar sesion dentro del grupo bridge correspondiente.
- Contrato acordado pendiente de propagacion → invocar flujo de propagacion al cierre.
- Legacy modo `evolucion`: invariante LE no verificable → invitar Sally (VE) para reescritura de la verificacion.

### Modo `investigacion`

- Frente con entregable vacio o incompleto → invitar Mary para consolidacion.
- Insumo sin trazabilidad de fuentes → bloquear cierre, pedir citas.
- `consumido_por` declarado en el abordaje no puede evaluar el insumo (el destinatario no tiene suficiencia para decidir) → escalar como brecha estructural, disparar `/alfred reevaluar`.

### Modo `documentacion`

- Seccion incompleta respecto al TOC aprobado en E2 → regresar a Paige.
- Screenshots desactualizados (la UI cambio) → invitar Tessa para recaptura.
- Audiencia no alcanzable para validacion real → registrar como brecha.

## Criterio de cierre

La lista consolidada de chequeos aplicables a ESTE work la emite el runtime: `agentos work checklist-cierre --slug {slug}` (deriva del frontmatter que aplica y que no). La prosa de esta etapa define el COMO de cada chequeo; el verbo enumera el QUE — no re-derivar la lista a mano.

**Carga AI-friendly: solo la tarjeta del chequeo aplicable.** El COMO de cada chequeo NO vive todo en este archivo — vive en tarjetas por-chequeo bajo `agent-os/skills/host-protocol/etapas/etapa-4/`, cargadas SOLO si el checklist las marca `aplica: true`:

| Chequeo(s) del checklist | Tarjeta a cargar |
|---|---|
| `CS-1`, `CS-2`, `CS-2b`, `CS-3` | `etapas/etapa-4/capa-seguridad.md` |
| `CR-1`..`CR-6` | `agent-os/experts/bmad-agent-cipher/references/plan-y-verificar-cripto.md` (capacidad [VF]; Quinn coordina, Cipher produce) |
| `EV-1`, `EV-2`, `EV-3`, `EV-4` | `etapas/etapa-4/evidencia.md` (incluye remocion de instrumentacion temporal) |
| `BR-1`..`BR-4` | `agent-os/experts/bmad-agent-quinn/references/abordaje-modelo-pruebas.md` seccion "5. Contrato BR-1..BR-4" (capacidad `[MP]`; el checklist del runtime los marca `aplica:true` cuando el work toco reglas de negocio registradas — misma condicion que el gate de cierre del work (codigo `OBLIGACION_PRUEBAS_NO_DECLARADA`, verbo `work close`), no por tratarse de un abordaje MP; E3 produce, Quinn audita; `BR-4-runtime` es Fase 2) |
| `CU-1`..`CU-5` | `etapas/etapa-4/calidad-ui.md` |
| `LLEGADA` | Sin tarjeta local — reference E2E de Tessa (`agent-os/experts/bmad-agent-tessa/references/explore-and-test.md`, secciones "Primera pasada: llegada como usuario (obligatoria por pantalla)" y "Llegada verificada -> mapa de llegada") |
| `CITAS` | `etapas/etapa-4/evidencia.md` seccion "Chequeo transversal de citas (pre-cierre)" |
| `convenciones` | `etapas/etapa-4/convenciones-a-destilar.md` |
| `PRE_CIERRE` | `etapas/etapa-4/pre-cierre-zoho.md` |
| `CD-1`, `CD-2`, `CD-3`, `CD-4` | Sin tarjeta local — usar `agent-os/experts/bmad-agent-dexter/references/plan-y-verificar-bd.md` (auditoria CD-N) |
| `meta`, `rumbos` | Este mismo archivo (CORE, siempre aplican) |

**Nota sobre `BR-1`..`BR-4`:** no figuran en la lista "Constante" siguiente — siguen siendo DERIVADOS, no constantes. El disparador de aplicabilidad es "el work toco reglas de negocio registradas" (lo determina el checklist del runtime, misma condicion que el gate de cierre del work, codigo `OBLIGACION_PRUEBAS_NO_DECLARADA`), ya no "el work es un abordaje de modelo de pruebas". Auditados por Quinn al cierre con el mismo patron productor (E3) / auditor (Quinn) que `EV-1`..`EV-4`. Ver fila `BR-1`..`BR-4` en la tabla anterior.

### Constante (todos los modos)

- `etapa-4/07-verificacion.md` completo segun las secciones condicionales por modo (ver plantilla).
- Cobertura de CAs documentada (PASS / FAIL / PENDIENTE con razon) — en modos investigacion/documentacion los CAs son sobre suficiencia/cobertura, no sobre ejecucion de codigo.
- Si hay grupos bridge activos: todos en estado `archivado` o work en pausa (no completado).
- Chequeo de cumplimiento de meta ejecutado por Quinn sin brecha estructural no resuelta.
- **Verificacion de capa de seguridad ejecutada (CS-1, CS-2, CS-2b, CS-3) sin brecha estructural no resuelta.** Aplica en modo `normal` (incl. legacy `evolucion`) cuando `permisos_repo_estado` no es `no_aplica_por_modo` ni `override_usuario`. Detalle en `etapas/etapa-4/capa-seguridad.md`.
- **Auditoria general de standards ejecutada (CS-4) sin hallazgo ALTO no resuelto.** Aplica cuando alguna tarea done declara `standards_cargados[]` no vacio; si ninguna lo declara, el chequeo se omite sin error. Quinn audita violaciones de los `standards_cargados[]` en archivos modificados. Un hallazgo ALTO no resuelto dispara `/alfred reevaluar`; MEDIO y BAJO son informativos y no bloquean. Complementaria a CS-1..CS-3, no las sustituye. Detalle en `agent-os/skills/cargar-standards/SKILL.md` seccion "Quinn (E4 step-05-verificacion)".
- **Auditoria criptografica ejecutada (CR-1..CR-6) sin brecha no resuelta.** Si alguna tarea declara `capa_seguridad.dominios` conteniendo `cripto`: auditoria CR-1..CR-6 producida por Cipher con evidencia en `etapa-4/evidencia/cripto/` (guard determinista `CR_SIN_RESULTADO`; exencion solo por descarte del eje cripto con razon + `[OVERRIDE]`).
- **Auditoria de evidencia ejecutada (EV-1, EV-2, EV-3, EV-4) sin brecha no resuelta.** Aplica en modo `normal` (incl. legacy `evolucion`) para works iniciados desde 2026-06-09 cuando alguna tarea declara `evidencia_requerida` activa. Cada eje requerido tiene su artefacto producido por el experto de dominio y auditado por Quinn. Detalle en `etapas/etapa-4/evidencia.md`.
- **Rubrica de calidad de UI ejecutada (CU-1..CU-5) con resultado escrito y sin FAIL bloqueante no resuelto.** Aplica cuando alguna tarea declara `evidencia_requerida.ui: true`. Tessa produce, Sally emite veredicto (capacidad `VU`), Quinn audita. Detalle en `etapas/etapa-4/calidad-ui.md`.
- Chequeo transversal de citas (pre-cierre): aplica en TODO work, tenga o no `evidencia_requerida` — Quinn verifica las citas ancladas que sostienen el cierre (mecanica via `agentos citas verificar` + congruencia). Procedimiento: `agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md` seccion "Chequeo transversal de citas (pre-cierre)".
- **Fase 2 (pruebas guiadas) ejecutada o explicitamente saltada con override del usuario.** En modo `normal` (incl. legacy `evolucion`), smoke-test no es suficiente para cerrar; Fase 2 debe completarse o registrarse `[OVERRIDE]` con razon en bitacora.
- **Hallazgos bloqueantes de meta resueltos via reevaluacion, NO documentados como deuda tecnica ni diferidos a otro work.** Si durante Fase 2 surgio bloqueante de meta, debe haber pasada por `/alfred reevaluar` y resolucion antes de cerrar (o cierre explicito como `COMPLETADO_CON_BRECHA` con el bloqueante registrado en `meta_revisiones[]`).
- **Instrumentacion temporal removida** (modos normal/evolucion). Todos los `#region WORK-DEBUG-LOG` y `#region SENTINEL-SECURITY-LOG` instrumentados en E3 retirados (o promovidos explicitamente con justificacion documentada). Codebase compila limpio tras la remocion. Commit de remocion presente en la rama. Procedimiento en `etapas/etapa-4/evidencia.md`.
- **Curaduria de rumbos 2 y 3 ejecutada** (works iniciados desde 2026-05-02). Hallazgos clasificados como rumbo 2 o rumbo 3 quedaron volcados a sus archivos destino con tabla resumen aprobada por el usuario, o explicitamente cancelados con razon en bitacora. Detalle en seccion "Curaduria de rumbos 2 y 3 al cierre" abajo.
- **Auditoria de convenciones a destilar ejecutada** (works con E0 enriquecida). Cada convencion declarada en `descubrimiento_producto.convenciones_a_destilar[]` esta en estado `completado`, `diferido` con razon valida, o `pendiente_post_cierre` con override explicito del usuario. Detalle en `etapas/etapa-4/convenciones-a-destilar.md`.
- Usuario aprueba el gate "Etapa 4 completa" para cierre de work.

### Especifico por modo

| Modo | Criterio adicional |
|------|--------------------|
| `normal` / legacy `evolucion` | Todos los test cases (local + bridge) ejecutados con resultado definitivo. Contratos acordados pendientes: propagados al repo en `.documentacion/contratos-externos/` o diferidos con razon. |
| `investigacion` | Cada frente con entregable revisado. Insumo consolidado legible y suficiente para `consumido_por`. Al cerrar como `COMPLETADO`, marcar `disponible_como_insumo: true` via `work set-fm` (ver "Transicion a cierre de work"). |
| `documentacion` | Cada documento commiteado en su ruta destino, con sus salidas declaradas. Screenshots actualizados. Validacion con lector objetivo ejecutada o diferida como brecha documentada (`COMPLETADO_CON_BRECHA`). Chequeos de entregables: ver "Documentacion: entregables y re-plantillado". |

### Documentacion: entregables y re-plantillado

Chequeos de Quinn en E4 para works de la ruta `documentacion`. Cualquier falla es brecha.

**Salidas (todo work de documentacion):** cada salida declarada para un documento existe como
archivo en el repo. Quinn las ubica en `etapa-3/documento-indice.md`, que lista los archivos producidos por documento.

**Cruce tareas-entregables (solo si el README tiene `## Entregables`):**

- toda tarea documental (`seccion-documento` o `documentacion`) tiene `entregable`, y coincide con una fila de la columna Documento;
- toda fila tiene al menos una tarea;
- toda fila con salidas distintas de `md` tiene su tarea `alcance: generar-salidas`.

Un work sin `## Entregables` conserva la verificacion previa (TOC contra `plantilla_documento`,
si la declaro) y no se le exige `entregable`.

**Re-plantillado (entregables con columna Origen):**

1. **Totalidad del mapa:** Quinn enumera en el **archivo de origen** sus encabezados (lineas que
   empiezan con `#`, fuera de los bloques de codigo), sus tablas (bloques de lineas que empiezan con `|`) y sus figuras (`![`),
   y los contrasta con las filas "origen -> plantilla" de `etapa-1/mapa-conservacion.md`. Un
   bloque del archivo sin fila es brecha. El conteo sale del archivo y no del mapa: es la unica
   forma de ver un bloque que el mapa omitio.
2. **Conformidad:** el documento nuevo sigue el TOC de su plantilla, y toda desviacion esta
   declarada (filas "sin lugar" del mapa o desviaciones de E1).
3. **Salidas:** cada salida declarada existe como archivo (chequeo general de arriba).
4. **Origen intacto:** el Documento nuevo es un archivo distinto del Origen, y `git diff` sobre
   el rango de commits del work no muestra cambios en el Origen.

<!-- FUENTE: agent-os/templates/work-record/schema/perilla-y-meta.md seccion "Seccion Entregables del README". Columnas y reglas de la tabla viven alli. NO duplicar -- para modificar, editar la fuente. -->

## Artefacto integrador esperado

- `agent-os/work-records/{slug}/etapa-4/07-verificacion.md` — reporte consolidado.
- Evidencia de pruebas:
  - Local: `etapa-4/evidencia/{test-case}.md`.
  - Bridge: `{work}/grupo-{nombre}/sesiones/{fecha}/reporte.md`.
- Contratos propagados al repo (si aplica).

Material de SOPORTE (logs crudos, exports, capturas auxiliares que no son la evidencia EV-N core) se adjunta gobernado: `agentos work file add` (payload `{work_slug, categoria, nombre, ruta_origen|contenido, proposito}`; categoria kebab LIBRE — `tareas`, `evidencia` y `zoho-items` estan reservadas, igual que los prefijos `etapa-*` y `grupo-*`). Queda registrado en `_archivos.yml`. La evidencia core EV-N sigue en `etapa-4/evidencia/` como hasta ahora.

<!-- FUENTE de la tabla canonica de estados del work: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Aqui solo se listan los estados terminales relevantes para Quinn al cerrar E4. NO duplicar el catalogo completo. -->

Estado final del work al cerrar E4 (ver definiciones completas en `agent-os/templates/work-record/schema/nucleo.md`):
- `COMPLETADO`: meta vigente alcanzada, verificada por Quinn.
- `COMPLETADO_VERIFICACION_DIFERIDA`: meta vigente alcanzada entera; comprobacion no ejecutable en este ambiente. El runtime lo deriva de `--estado COMPLETADO` (nunca se pide) cuando hay bloque `verificacion_diferida{}` valido. No pasa por reevaluacion.
- `COMPLETADO_CON_BRECHA`: usuario acepto brecha; meta ajustada en `meta_revisiones[]`.
- `REPLANTEADO`: drift total; work archivado, work nuevo abierto.
- `EN_PAUSA`: reevaluacion pendiente de input del usuario.
- `PRE_CIERRE`: E4 cerrada con items Zoho asociados, esperando QA externa.

Estados legacy (`VERIFICACION_PENDIENTE`, `COMPLETADO-SIN-PRUEBAS`) aplicables solo a works pre-2026-04-23 — Quinn NO los ofrece como opcion en works nuevos.

## Test cases con alcance local/bridge

Cada test case lleva campo `alcance`:
- `local`: ejecucion en el repo actual con evidencia local.
- `bridge`: ejecucion via sesion del grupo bridge referenciado.

El reporte consolida ambos.

## Contrato de ejecucion del sistema (obligatorio en modo normal, incl. legacy evolucion)

Quinn, como anfitriona de Etapa 4, **esta obligada** a invocar el skill `run-system` cuando la verificacion requiere ejecutar el sistema. La verificacion se conduce en **dos fases distintas** que NUNCA deben confundirse: smoke-test (paso necesario pero no suficiente) y pruebas guiadas con el usuario (paso donde la meta del work se valida realmente).

### Fase 1 — Smoke-test (necesario pero NO suficiente)

```
run-system accion=build componente=backend   # y frontend si aplica
run-system accion=run   componente=backend   # iniciar con health check
run-system accion=test  componente=backend   # suite automatizada
```

**Resultado esperado:** build limpio, sistema arranca, suite automatizada en verde.

**Anti-patron PROHIBIDO:** Quinn NO debe sugerir al usuario que la verificacion esta completada solo con el resultado del smoke-test. El smoke confirma que el sistema **arranca y compila**, no que la **meta del work se cumplio**. Aun si la suite automatizada esta en verde, Quinn debe pasar a la Fase 2 a menos que el usuario decida explicitamente saltarsela (ver "Excepcion: salto de Fase 2 por decision del usuario" abajo).

Si el smoke falla (build rojo, healthcheck timeout, suite con tests rojos): regresar a E3 con `/alfred reevaluar` camino b. No avanzar a Fase 2 con sistema roto.

### Fase 2 — Pruebas guiadas con el usuario

Al pasar el smoke, Quinn anuncia explicitamente que la verificacion **continua** con pruebas guiadas. Texto canonico al usuario:

```
A-Quinn: Smoke-test paso (build limpio, sistema arriba, suite automatizada {N}/{N} verde).
         Esto NO es la verificacion completa — solo confirma que el sistema arranca.
         Sigo con las pruebas guiadas para validar la meta del work contra el sistema vivo.

         Pasos que voy a ejecutar:
         1. Activar logs de debug instrumentados en E3 para que pueda diagnosticar
            comportamiento durante las pruebas.
         2. Validar contigo los datos del archivo de pruebas (test-env.local.json) —
            credenciales de prueba, fixtures, URLs — y actualizarlos si han cambiado.
         3. Decidir contigo quien conduce el navegador (yo via Playwright, o tu
            mientras yo monitoreo consola y logs).
         4. Ejecutar los flujos de los CAs verificables del work y observar resultado.

         Comenzamos?
```

#### Paso 2.1 — Activar logs (instrumentacion de E3 + capacidad [IL] de Sentinel)

Quinn lee `logs_temporales_instrumentados` del frontmatter de cada tarea de E2 (poblado por el anfitrion de E3 — ver `agent-os/skills/host-protocol/etapas/etapa-3/instrumentacion-logs.md` seccion "Instrumentacion temporal de logs"). Identifica:

- Archivos con `marcador: WORK-DEBUG-LOG` — logs de debug funcional.
- Archivos con `marcador: SENTINEL-SECURITY-LOG` — logs de seguridad (Sentinel los gestiona via capacidad `[IL]`).
- Archivos con `marcador: N/A` — codigo sin logger disponible; Quinn lo asume y diagnostica via inspeccion directa si surge problema.

Si el sistema permite verbosidad de logs en runtime (ej. nivel `Information` o superior accesible sin reiniciar), Quinn confirma que esta activa. Si no, sugiere reiniciar con flag adecuado solo si es necesario para una prueba especifica.

Si alguna tarea con `capa_seguridad.aplica: true` requiere logs de auditoria adicionales (ej. para CS-2 / CS-2b), Quinn invita a Sentinel con capacidad `[IL]` para inyectar instrumentacion adicional **temporal** que se removera junto con la de E3 al cierre.

#### Paso 2.2 — Validar/actualizar datos de prueba con el usuario

Quinn abre conversacion sobre `test-env.local.json`:

```
A-Quinn: Datos de prueba que voy a usar para los flujos del work.

         {Listar campos relevantes: credenciales, URLs, fixtures, etc.,
          en lenguaje claro — no volcar el JSON crudo.}

         Estos datos siguen vigentes? Algun cambio que deba aplicar?
```

Si el usuario indica cambios, Quinn invoca `run-system` (o lo edita directamente segun politica del repo) y confirma. Si los datos parecen vigentes pero alguno no funcional al primer uso (ej. credencial expirada), Quinn pregunta antes de re-intentar.

#### Paso 2.3 — Decidir quien conduce las pruebas

Quinn pregunta al usuario explicitamente:

```
A-Quinn: Para los flujos a probar, dos opciones:

         (a) Yo conduzco el navegador via Playwright (o invito a Tessa si esta
             disponible) — ejecuto cada paso, capturo resultado y screenshots,
             tu observas y validas.
         (b) Tu conduces — yo te indico que probar y monitoreo consola del
             navegador y logs del backend en paralelo, alerto si veo algo
             anomalo aunque tu no lo notes.

         Cual prefieres?
```

Si Tessa esta disponible (capacidad `[E2E]`), Quinn la invita en cualquiera de los dos casos para apoyo. La diferencia:

- **Opcion (a):** Quinn (o Tessa via Playwright MCP) ejecuta clicks/inputs, captura snapshots, lee respuestas. El usuario observa y aprueba/rechaza por flujo.
- **Opcion (b):** el usuario ejecuta manualmente. Quinn no toca el navegador; en paralelo tail-ea logs del backend y monitorea consola del navegador (si el usuario abre devtools y comparte stream o screenshots periodicos). Reporta lo que ve sin esperar a que el usuario lo note.

#### Paso 2.4 — Ejecucion de flujos y manejo de hallazgos

Quinn ejecuta o supervisa los flujos derivados de los CAs verificables. Por cada flujo: PASS / FAIL / PENDIENTE con razon, registrado en `etapa-4/07-verificacion.md` con evidencia (screenshots, logs relevantes).

**Manejo de hallazgos no contemplados durante la prueba** — esto es el **anti-patron criticco** que codifica esta seccion:

Si durante la Fase 2 aparece un problema (bug, comportamiento inesperado, error de logica, regresion en otra parte del sistema, falla de seguridad descubierta) que **no estaba contemplado en el abordaje/E2/E3**, Quinn evalua:

1. **¿Es bloqueante para cumplir la meta del work?** No "esta dentro de los CAs/tareas", sino "¿impide que la meta vigente se considere alcanzada?". La meta puede cubrir mas que lo que los CAs nominan; si el problema ataca la meta, es bloqueante aunque no aparezca explicito en ningun CA.

2. **Si SI es bloqueante para la meta:**
   - **PROHIBIDO** sugerir al usuario "marcarlo como deuda tecnica" o "resolverlo en otro work".
   - **PROHIBIDO** sugerir "como esta fuera de los CAs no nos toca arreglarlo aqui".
   - Quinn **debe** sugerir detener la prueba y disparar `/alfred reevaluar` hasta donde se requiera (el abordaje -- re-abordaje, ver `references/reevaluacion-y-gates.md` paso 1 -- si la premisa cambio, E2 si el plan no contemplo el caso, E3 si la implementacion fallo). El work no cierra hasta que el bloqueante este resuelto o el usuario decida explicitamente cerrar como `COMPLETADO_CON_BRECHA` con el bloqueante registrado en `meta_revisiones[]`.
   - Texto canonico:
     ```
     A-Quinn: Detengo la prueba. Encontre {descripcion del problema}.
              Esto bloquea la meta del work ({meta vigente en una linea})
              porque {razon de bloqueo en una linea}.

              No esta en los CAs ni en las tareas, pero la meta no se considera
              cumplida si esto queda asi. No es candidato a deuda tecnica ni a
              otro work — propongo /alfred reevaluar para regresar a la etapa
              {N} y resolverlo dentro de este work.

              ¿Procedo con la reevaluacion?
     ```

3. **Si NO es bloqueante para la meta:** Quinn registra el hallazgo en `etapa-4/07-verificacion.md` seccion "Hallazgos secundarios" y pregunta al usuario si quiere abrir un work nuevo para abordarlo, sin bloquear el cierre del actual. Aqui si es legitimo "trabajo separado" — pero la decision la toma el usuario, no Quinn anticipadamente.

### Excepcion: salto de Fase 2 por decision del usuario

El usuario puede decidir explicitamente saltarse la Fase 2 cuando el work es de naturaleza tal que el smoke + suite automatizada cubren todo (ej. cambio puramente backend con cobertura de tests integral; refactor sin cambio funcional). En ese caso:

1. Quinn lo plantea explicitamente, no lo asume:
   ```
   A-Quinn: La Fase 2 (pruebas guiadas) es donde valido la meta contra el sistema
            vivo. Para este work concreto, ¿queres que la salte y cierre con el
            smoke + suite automatizada? Solo aceptable si el cambio es de
            naturaleza tal que los tests cubren la meta sin observacion humana
            del flujo.
   ```
2. Si el usuario aprueba, Quinn registra en `etapa-4/bitacora.md` con prefijo `[OVERRIDE]` la decision y razon. Quinn deja constancia explicita en `07-verificacion.md` seccion "Notas de cierre": *"Fase 2 omitida por decision del usuario. Razon: {razon}. Verificacion sustentada en: smoke + suite automatizada de N/N tests."*
3. La regla "bloqueante de meta -> reevaluar" sigue aplicando si el smoke o la suite descubren algo bloqueante; el override no es licencia para cerrar con bloqueantes.

### Cierre de la verificacion

Al terminar la Fase 2 (o el smoke + override), Quinn:

```
run-system accion=stop componente=backend   # y frontend si aplica
```

Y procede a la **Remocion de instrumentacion temporal**, tarjeta `etapas/etapa-4/evidencia.md`.

Al cerrar la Fase 2 conducida por el usuario, Quinn registra el veredicto del operador POR EXPERTO participante: `aceptado` para cada experto sin correccion en el work, `corregido`/`rechazado` (con `categoria_error`) para los que el usuario corrigio — `agentos learn veredicto`, `origen: fase2-e4`. Los gates `[AUTO]` de nivel `maxima` NUNCA emiten `aceptado` (salvaguarda: el veredicto lo emite el operador, no el proceso). El anfitrion muestra las lineas registradas.

La verificacion valida los CAs CONTRA el flujo de trabajo declarado (MANIFIESTO P7): el flujo completo al que pertenece la funcionalidad sigue funcionando de punta a punta, no solo la tarea aislada. Si el work no puede nombrar su flujo, ese ES un hallazgo de la verificacion.

Los invitados consumen la URL del sistema desde el valor devuelto por `run-system` o desde `test-env.local.json` (`sistema.{componente}.run.url`), pero no construyen comandos de ejecucion por su cuenta.

**Aplicabilidad por modo:**

| Modo | Contrato aplica | Nota |
|------|-----------------|------|
| `normal` / legacy `evolucion` | Si | Obligatorio para Fase 1 y Fase 2 (salvo override explicito del usuario para Fase 2). |
| `investigacion` | No | Quinn verifica suficiencia de insumo, no ejecuta sistema. |
| `documentacion` | No por default | Quinn puede invocar opcionalmente si el documento incluye instrucciones verificables (ej. "ejecuta X y verifica Y" en un manual). |

Ver `agent-os/skills/run-system/SKILL.md` para el flujo completo del skill.

## Remocion de instrumentacion y auditoria de evidencia (EV-1..EV-4)

Tras la Fase 2 (o el smoke + override), Quinn retira los logs temporales instrumentados en E3 (`#region WORK-DEBUG-LOG` / `#region SENTINEL-SECURITY-LOG`) y, si alguna tarea declara `evidencia_requerida` activa (works desde 2026-06-09), audita como tercero independiente los artefactos que producen los expertos de dominio: EV-1 completitud, EV-2 suficiencia, EV-3 coherencia cruzada, EV-4 trazabilidad de brechas. Procedimiento completo (mapa de logs, grep de marcadores, remocion, tabla de productores por eje, los cuatro chequeos y resolucion de fallos): tarjeta `etapas/etapa-4/evidencia.md`.

## Chequeo de cumplimiento de meta (obligatorio antes del cierre)

Antes de proponer el cierre del work, Quinn debe ejecutar el chequeo de meta vigente. Es la responsabilidad final del anfitrion de Etapa 4 — el work no se cierra como `COMPLETADO` si Quinn detecta drift sin resolver.

**Desde 2026-06-09 (modo normal, incl. legacy evolucion):** cuando hay tareas con `evidencia_requerida` activa, el
chequeo de meta contrasta **la evidencia** (artefactos de `etapa-4/evidencia/`), no solo los
entregables (archivos/endpoints). Quinn declara la meta cumplida leyendo los artefactos que la
prueban, tras haber pasado EV-1..EV-4. Ejemplo de afirmacion correcta: "la evidencia EV-3 demuestra
que la solicitud se crea: el flujo de UI (`evidencia/ui/_indice.md` captura 3) creo la solicitud
8842, persistida en BD (`evidencia/bd/T-012.md`), via endpoint que retorno 201 (`evidencia/api/T-012.md`)".

**Pasos del chequeo:**

1. **Leer meta vigente** del README del work-record (`meta` y ultima entrada de `meta_revisiones[]` si existe).
2. **Leer `modo`** del README para saber contra que observables contrastar.
3. **Comparar lo entregado contra la meta** segun el modo:

   | Modo | Observables a listar | Criterio de "sin brecha" |
   |------|---------------------|--------------------------|
   | `normal` | Archivos modificados, endpoints nuevos, tests que pasan, deploys | La meta declaraba estado del sistema que ahora es verificable ejecutando los observables. |
   | legacy `evolucion` | Archivos modificados + invariantes LE verificadas | Archivos coinciden con el prototipo tangible; invariantes LE de Sally todos verificables. |
   | `investigacion` | Frentes con entregable + insumo consolidado + `consumido_por` en README | El insumo cubre las preguntas declaradas; el destinatario en `consumido_por` tiene lo necesario para decidir. |
   | `documentacion` | Secciones redactadas vs TOC aprobado en E2 + screenshots + diagramas | Documento completo segun TOC; audiencia declarada en el abordaje puede leerlo y entenderlo (validacion con lector real o diferida como brecha). |

4. **Decidir el escenario de cierre:**
   - **Sin brecha:** lo entregado calza con la meta vigente → proponer cierre como `COMPLETADO`. Si modo `investigacion`, marcar el work como consumible via runtime (`work set-fm` con `disponible_como_insumo:true`; ver "Transicion a cierre de work", escenario 1).
   - **Meta cumplida, verificacion no ejecutable en este ambiente:** lo entregado calza con la meta vigente pero la comprobacion solo es posible fuera de este ambiente (produccion, dato solo-productivo, integracion externa sin sandbox, evento de negocio pendiente, dispositivo no disponible) → Quinn propone el bloque `verificacion_diferida{}` con `AskUserQuestion` (causa del enum, evidencia sustituta con anclas, plan con `revisar_el` y responsable), nunca lo asume, y cierra con `--estado COMPLETADO`. **No dispara reevaluacion ni toca `meta_revisiones[]`** — el runtime deriva `COMPLETADO_VERIFICACION_DIFERIDA` (rechaza pedirlo explicito con `ESTADO_NO_DERIVABLE`).
   - **Brecha aceptable:** hay diferencia entre meta original y resultado, pero el resultado es valido y el usuario puede aceptar ajustar la redaccion → disparar `/alfred reevaluar` (camino c — ajuste por brecha) → cierre como `COMPLETADO_CON_BRECHA`. Tipico en modo `documentacion` cuando el lector objetivo no es alcanzable en el work (brecha: "pendiente validacion con lector objetivo").
   - **Brecha estructural:** hay diferencia significativa que requiere correccion → disparar `/alfred reevaluar` (camino b — regresar a etapa anterior) o (camino d — abrir work nuevo).

**Mensaje de Quinn al usuario al detectar brecha:**

```
A-Quinn: ALERTA DE DRIFT en cierre de Etapa 4.

Meta vigente: "{meta}".
Lo que entrego: "{descripcion narrativa de lo entregado}".
Brecha: "{descripcion narrativa de la diferencia}".

Diagnosis: {brecha aceptable | brecha estructural}.

Propongo /alfred reevaluar para que tu decidas como cerrar.
```

Quinn cede al gobernador, el gobernador conduce el arbol de tres pasos definido en `agent-os/skills/host-protocol/references/reevaluacion-y-gates.md` seccion "Procedimiento de reevaluacion" (disparado por `/alfred reevaluar`).

## Auditoria de convenciones a destilar (obligatoria antes del cierre)

Aplica a works iniciados con E0 enriquecida (con bloque `descubrimiento_producto` en README). Quinn audita que las convenciones tacitas detectadas durante el work quedaron en `completado`, `diferido` con razon valida, o `agregado_en_etapa_posterior`. Procedimiento completo (paso 0 de re-indexado, los 6 pasos de auditoria, mensajes canonicos y decisiones posibles): tarjeta `etapas/etapa-4/convenciones-a-destilar.md`.

## Verificacion de capa de seguridad (modo normal, incl. legacy evolucion)

Aplica si `permisos_repo_estado` del README es `documentado` o `documentado_externo`. Quinn orquesta los chequeos invocando a Sentinel para las pruebas activas (capacidad `[VP]`). Resultados en `etapa-4/07-verificacion.md` seccion "Capa de seguridad". Detalle de CS-1/CS-2/CS-2b/CS-3 y resolucion de fallos: tarjeta `etapas/etapa-4/capa-seguridad.md`.

## Curaduria de rumbos 2 y 3 al cierre (obligatoria, 2026-05-02)

<!-- FUENTE del principio del huevo, los 3 rumbos, modos de clasificacion y la tabla resumen obligatoria: agent-os/skills/host-protocol/SKILL.md seccion "Principio del huevo y rumbos del hallazgo". Aqui solo se documenta la mecanica de curaduria al cierre de E4 ejecutada por Quinn. NO duplicar la regla — para modificar el principio, editar host-protocol. -->

Antes del cierre del work (despues del chequeo de cumplimiento de meta y antes de generar el reporte final), Quinn ejecuta la **curaduria de rumbos 2 y 3** sobre los hallazgos consolidados de todas las etapas. Aplica a works iniciados desde 2026-05-02. Works legacy se omiten de esta seccion sin error.

### Procedimiento

1. **Recolectar hallazgos clasificados.** Quinn lee:
   - `### Hallazgos` de cada tarea de E2 (con sus campos `rumbo`, `rumbo_razon`, `rumbo_clasificado_por`).
   - `etapa-1/01-discovery.md` seccion de hallazgos si existe.
   - Bitacoras `etapa-N/bitacora.md` buscando hallazgos no clasificados.

2. **Filtrar por rumbo.** Los destinos NO estan hardcodeados: se leen de config con `agentos config get --archivo agent-os-local --ruta {clave}` (`{ok:true,data:{valor}}`, o `{ok:false,error.codigo:NO_EXISTE}` si ausente -> usar el default indicado).
   - Rumbo 1: ya viven en el work (CAs, tareas). NO se vuelcan.
   - Rumbo 2: candidatos a `rumbos.destino_rumbo_2` (NO_EXISTE -> default `agent-os/post-works/_pendientes.md`).
   - Rumbo 3: candidatos a `rumbos.destino_rumbo_3_standalone` (NO_EXISTE -> default `agent-os/capas-futuras/{area}.md`, work standalone) o `rumbos.destino_rumbo_3_desde_diseno` (NO_EXISTE -> default `agent-os/disenos/{slug}/capas-futuras.md`, work con `diseno_origen`).

3. **Curar (deduplicar + reescribir + descartar lo que no aplica):**
   - **Deduplicar:** abrir el archivo destino y buscar items semanticamente similares ya registrados. Si encuentra, marcar el candidato como duplicado y proponer descartarlo (con su razon: "ya registrado en linea N del archivo destino").
   - **Reescribir vagos:** todo item futura-legible. Quien lea esto en 6 meses sin contexto del work debe entenderlo. Reglas: estado del sistema observable, no proceso interno; sin nombres de expertos ("Sentinel dijo"); sin IDs efimeros.
   - **Descartar lo que no aplica:** si durante el work el item dejo de tener sentido (ej. el codigo ya no existe, la deuda fue absorbida por otra tarea), Quinn lo propone descartar con razon.

4. **Si modo legacy `evolucion` o `diseno_origen` poblado:** Quinn invita a Mary para co-curar rumbo 3 (Mary tiene capacidad de leer brief de `/disenar` y proponer back-link al brief para HZ-NNN si aplica).

5. **Detectar areas para rumbo 3 (work standalone):**
   - Listar archivos existentes en `agent-os/capas-futuras/*.md`.
   - Para cada item rumbo 3, sugerir reuso de un area existente si encaja semanticamente. Si no encaja, marcar como area NUEVA con propuesta de nombre (texto libre, no enum).

6. **Determinar el modo de clasificacion:** se DERIVA del `nivel` del work (`minima→manual`, `normal→asistido`, `maxima→autonomo`). Legacy: si el work no tiene `nivel`, cae a `.claude/agent-os.local.json` campo `rumbos.modo_clasificacion` (default `asistido`).

7. **Presentar la tabla resumen al usuario** (estructura obligatoria definida en host-protocol seccion "Tabla resumen obligatoria antes de volcar"):
   - Encabezado de cierre.
   - Explicacion corta de cada item (1-2 lineas por item, ANTES de la tabla — sin esto la tabla es opaca).
   - Tabla resumen.
   - Resumen agregado.
   - `AskUserQuestion` segun el modo de clasificacion derivado del nivel (paso 6).

8. **Volcar segun la decision del usuario:**
   - Aprobar todo / Continuar (segun modo): escribir entradas a archivos destino, registrar en `post_works_volcados[]` y `capas_volcadas[]` del README del work.
   - Editar item por item: el usuario marca cambios; Quinn aplica y vuelve a presentar tabla revisada para confirmacion final.
   - Descartar items: Quinn elimina los marcados de la lista; vuelve a presentar tabla.
   - Cancelar volcado: hallazgos rumbo 2/3 quedan registrados en sus tareas/etapas pero sin volcado a destinos. Quinn registra `[CANCELADO_VOLCADO]` en bitacora con razon. El work puede cerrar igual; no existe hoy un verbo dedicado para volcar despues — el usuario (o quien retome el work archivado) repite manualmente el procedimiento de esta seccion (pasos 1-8: recolectar hallazgos con `rumbo`, curar, presentar tabla resumen, escribir a los destinos de config leidos en el paso 2).

9. **Confirmar al usuario** lista final volcada con paths, antes de proceder al gate de cierre del work.

### Mensaje canonico de Quinn al iniciar la curaduria

```
A-Quinn: Antes del gate de cierre, voy a curar los hallazgos no bloqueantes
         del work. Cada hallazgo se clasifico en uno de tres rumbos:

         - Rumbo 1: dentro del work (ya quedo resuelto en CAs/tareas).
         - Rumbo 2: post-work (resolver pronto, no bloquea cierre) -> _pendientes.md
         - Rumbo 3: capas de cebolla (futuro, mejora del entregable) -> capas-futuras/{area}.md

         Tengo {N} hallazgos candidatos a rumbo 2 o 3. Voy a presentarte
         la tabla en {M} segundos con explicacion previa de cada uno
         para que apruebes el volcado.
```

### Restriccion de cierre

El work NO cierra como `COMPLETADO` o `COMPLETADO_CON_BRECHA` mientras haya hallazgos rumbo 2/3 sin curar (estado pendiente_curaduria) salvo que el usuario haya elegido explicitamente "Cancelar volcado" en el paso 8. La cancelacion deja constancia en bitacora y permite cerrar el work — pero Quinn advierte que los hallazgos quedan en sus tareas y no en los archivos buscables.

### Compatibilidad con works legacy

Works iniciados antes de 2026-05-02 no tienen campo `rumbo` en hallazgos. Quinn registra en bitacora: *"Work legacy sin clasificacion por rumbos. Hallazgos permanecen en sus tareas/etapas sin volcado."* y procede al cierre normal sin tabla.

## Cierre con items Zoho asociados (PRE_CIERRE)

Si el work tiene `zoho_items[]` no vacio en el README, al cerrar E4 Quinn **no cierra el work directamente**: entra en estado `PRE_CIERRE` hasta que QA externa apruebe. Procedimiento completo (flujo de entrada, mensajes canonicos, restricciones y comandos aceptados durante `PRE_CIERRE`): tarjeta `etapas/etapa-4/pre-cierre-zoho.md`.

## Estados de cierre

| Estado | Significado | Cuando aplica |
|--------|-------------|---------------|
| `PRE_CIERRE` | E4 cerrada, esperando revision QA externa en Zoho. Quinn sigue anfitriona. No acepta pausa/cancelacion/agregar items | Cierre de E4 con items Zoho asociados (via skill zoho-sprints-integration) |
| `COMPLETADO` | Meta vigente alcanzada, verificada por Quinn sin brecha | Caso ideal |
| `COMPLETADO_VERIFICACION_DIFERIDA` | Meta vigente alcanzada entera; comprobacion no ejecutable en este ambiente. Derivado por el runtime a partir de `--estado COMPLETADO`, nunca pedido. No pasa por reevaluacion | Cierre con bloque `verificacion_diferida{}` valido (README o alguna tarea) |
| `COMPLETADO_CON_BRECHA` | Usuario acepto brecha; meta ajustada via reevaluacion (camino c) | Cierre tras ajuste de redaccion |
| `REPLANTEADO` | Drift total; work archivado, work nuevo abierto bajo idea general (camino d) | Cierre tras reevaluacion estructural |
| `EN_PAUSA` | Reevaluacion pendiente de input del usuario | Si el usuario no responde al arbol de reevaluacion |

<!-- FUENTE de la tabla canonica de estados (incluyendo CANCELADO, MIGRADO, y los estados legacy con su tabla de equivalencia): agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". -->

Estados legacy (works iniciados antes de 2026-04-23): `VERIFICACION_PENDIENTE` y `COMPLETADO-SIN-PRUEBAS` documentados en frontmatter-schema con su tabla de equivalencia al modelo nuevo. NO ofrecer como opcion en works post-2026-04-23.

## Activacion

Cuando el gobernador cierra Etapa 3, invoca a Quinn con contextos estandar + `nivel`.

**Primer paso obligatorio de Quinn al activarse:**

1. Leer la **meta vigente** del README del work-record. La meta esta siempre en su contexto durante toda Etapa 4.
2. Leer `nivel` del README (`minima | normal | maxima`, default `normal`; works legacy con `conversacion` se mapean guiada→minima/flow→normal/yolo→maxima). Modula la conducta de Quinn segun tabla en `host-protocol` seccion "Perilla de autonomia (nivel)".
3. **Leer todas las entradas `[AUTO]`** en `etapa-1/bitacora.md`, `etapa-2/bitacora.md`, `etapa-3/bitacora.md` (y `etapa-0/bitacora.md` si el work es legacy, anterior al retiro de la Etapa 0) — son las decisiones que el anfitrion tomo sin consultar al usuario durante el work (solo aplicable si `nivel: normal | maxima`).

**Crear el artefacto de verificación (runtime):** Quinn crea
`etapa-4/07-verificacion.md` con `agentos work file create`
(`file_type: verificacion-etapa-4`, frontmatter `status: pending` + el cuerpo
inicial con las secciones por modo en `contenido`). Al cerrar E4, marca el cierre
con `agentos work file set-fm` (`{"status":"done"}` o el terminal que aplique,
y `completedAt`). No editar el frontmatter a mano. Las secciones del cuerpo
(auditorías EV-N / CS-N, hallazgos, decisión de cierre) se redactan con
`agentos work file set-section`, una por invocación; tampoco se editan a mano.
<!-- FUENTE: agent-os/experts/bmad-agent-alfred/gestion/artefactos-hijos.md. NO duplicar -- editar la fuente. -->

**Revision de entradas `[AUTO]`** (parte del chequeo de cumplimiento de meta):

- Si hay 0 entradas: no aplica, continuar chequeo normal.
- Si hay entradas: clasificarlas:
  - **Decisiones menores coherentes con meta**: simplemente documentarlas en el reporte de E4 para transparencia.
  - **Decisiones que podrian afectar cumplimiento de meta**: señalarlas al usuario en el gate de cierre, pedirle que ratifique o las objete.
  - **Decisiones que contradicen meta/scope**: disparar `/alfred reevaluar` — estas NO debian tomarse sin consultar, son drift.

Ejemplo de clasificacion en gate de E4:

```
A-Quinn: Durante el work hubo 7 decisiones auto-tomadas por Amelia (nivel:maxima).
         5 son menores y coherentes con meta (elecciones de libreria, nombres de archivos).
         2 merecen tu atencion: {decision-1} y {decision-2}.
         ¿Ratificas o quieres discutirlas antes de cerrar?
```

## Transicion a cierre de work

Trigger: Quinn publica `A-Quinn: Etapa 4 cerrada, entregando al gobernador.` (despues del chequeo de cumplimiento de meta).

Accion del gobernador segun el escenario:

**Escenario 1 — Sin brecha (estado COMPLETADO):**
1. Valida artefactos de verificacion.
2. Verifica que no hay grupos bridge activos ni contratos acordados sin propagar (modo normal, incl. legacy evolucion).
3. **Si modo:investigacion**, marca el work como consumible via runtime: `echo '{"disponible_como_insumo":true,"consumidores":[]}' | agentos work set-fm --slug <slug>` (no editar el README a mano; ver `bmad-agent-alfred/gestion/set-fm.md`). Si el binario devuelve `ok:false`, mostrar `error.mensaje` y detener el cierre.
4. Publica `S-sistema: Gate Etapa 4 aprobado. Generando reporte final y archivando el work.`
5. Cerrar el work: invocar `agentos work close --slug <slug> --estado COMPLETADO` (o la variante terminal que corresponda). **Nunca pedir `--estado COMPLETADO_VERIFICACION_DIFERIDA`**: si el work tiene bloque `verificacion_diferida{}` valido, el runtime deriva ese estado por su cuenta a partir de `COMPLETADO` (envelope con `estado_derivado: true`); pedirlo explicito es rechazado con `ESTADO_NO_DERIVABLE`. El runtime escribe el README terminal (estado + `fecha_fin` + `cerrado_en` + `archivos_tocados`), appendea la fila del bloque al libro-mayor `agent-os/verificaciones/ledger.md` (una fila por bloque encontrado), y mueve la carpeta a `agent-os/works-archivo/` de forma atomica. El catalogo no se escribe -- se deriva en memoria del README en la siguiente lectura. No editar el README a mano. Ver `agent-os/templates/work-record/schema/catalogos-y-sesion.md` seccion "Cierre / archivado".

**Escenario 2 — Brecha aceptable (estado COMPLETADO_CON_BRECHA):**
1. Quinn dispara `/alfred reevaluar` (camino c — ajuste por brecha).
2. Usuario aprueba redaccion ajustada.
3. El gobernador registra en `meta_revisiones[]` y procede al cierre.
4. Estado final: `COMPLETADO_CON_BRECHA`. Resto igual al Escenario 1.

**Escenario 3 — Brecha estructural con regreso (estado EN_PROGRESO tras regreso):**
1. Quinn dispara `/alfred reevaluar` (camino b — regresar a etapa anterior).
2. Usuario decide etapa de regreso.
3. El gobernador archiva etapa-4 actual como `etapa-4-v1/` y reactiva la etapa elegida.
4. El cierre del work se posterga hasta nueva pasada por Etapa 4.

**Escenario 4 — Brecha estructural con replanteo (estado REPLANTEADO):**
1. Quinn dispara `/alfred reevaluar` (camino d — abrir work nuevo).
2. Usuario aprueba apertura de work nuevo.
3. El work actual cierra como `REPLANTEADO`, el work nuevo se inicializa con `idea_general_comun` y `work_origen`.

## Bitacora

Ubicacion: `agent-os/work-records/{slug}/etapa-4/bitacora.md`.

## Referencias

- Protocolo universal: `agent-os/skills/host-protocol/SKILL.md`
- Cierre: gestionado por el comando gobernador (Alfred `piezas/cierre.md`; el motor `/work` legacy fue retirado de circulacion — git es el archivo historico)
- Tarjetas por-chequeo (cargar solo la aplicable segun `agentos work checklist-cierre`): `agent-os/skills/host-protocol/etapas/etapa-4/`
