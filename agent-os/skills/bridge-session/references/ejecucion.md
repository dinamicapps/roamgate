# Fase 4: Ejecucion de Checkpoints

## Objetivo

Ejecutar el plan de prueba checkpoint por checkpoint, con protocolo forense para fallos y solicitudes de modificacion formales para cambios.

## Protocolo por checkpoint

Para cada checkpoint del plan (en orden definido):

### 1. Anunciar inicio

La instancia responsable de ejecutar publica:
```
bridge_publicar(id_grupo, "contexto", "Iniciando CP-{NNN}: {descripcion}", metadata: '{"subtipo": "checkpoint-inicio", "checkpoint": "CP-{NNN}"}')
```

### 2. Ejecutar

La instancia ejecuta la accion definida en el checkpoint (llamar endpoint, navegar UI, ejecutar test, etc.).

Si la accion requiere que la otra instancia haga algo primero (ej: "levanta el servidor"), usar `bridge_publicar` tipo `request` y `bridge_esperar` para coordinar.

### 3. Capturar evidencia

Todo lo definido en el checkpoint: logs, screenshots (via adjunto), network requests, response bodies, stack traces.

### 4. Publicar resultado

```
bridge_publicar(id_grupo, "contexto", "CP-{NNN}: {PASS|FAIL}. {evidencia resumida}", metadata: '{"subtipo": "checkpoint-resultado", "checkpoint": "CP-{NNN}", "resultado": "pass|fail"}')
```

Si FAIL: publicar SOLO el sintoma con evidencia. NO el diagnostico ni la solucion propuesta.

### 5. Verificacion cruzada

Si el checkpoint requiere verificacion del otro lado, la otra instancia verifica independientemente y publica su propia evidencia.

### 6. Registrar en bitacora local

```markdown
## CP-{NNN}: {descripcion}
fecha: {timestamp}
resultado: PASS | FAIL
ejecutado_por: {instancia}
verificado_por: {instancia}
evidencia: {resumen}
contribuyeron: {lista de instancias y que hizo cada una}
solicitudes_generadas: {IDs de solicitud-modificacion si aplica}
cambios_ejecutados: {IDs de cambio-ejecutado si aplica}
```

### 7. Director actualiza metadata del grupo

```
bridge_actualizar_grupo(id_grupo, metadata: '{"plan_de_prueba": {"checkpoints": [{...CP-NNN con estado actualizado...}]}}')
```

### 8. Siguiente checkpoint

Solo avanzar si el checkpoint paso. Si fallo, seguir el protocolo de fallos (abajo). Solo el usuario puede decidir continuar a pesar de un fallo.

---

## Cuando un checkpoint falla

### Regla de instrumentacion obligatoria (2 intercambios max)

**PROHIBIDO especular.** Las instancias tienden a intercambiar hipotesis indefinidamente en vez de instrumentar logs. Esta regla lo previene con un trigger duro:

1. **PRIMER mensaje:** Reportar sintoma con evidencia factual (Paso 1 abajo)
2. **SEGUNDO mensaje:** La otra parte puede hacer UNA contraverificacion rapida (ej: "del lado mio veo X", "mis logs existentes dicen Y")

**→ Si despues del SEGUNDO mensaje no hay causa raiz identificada con evidencia concreta de logs: INSTRUMENTAR LOGS FORENSES ES OBLIGATORIO. No hay tercer intercambio especulativo.**

**Detector de especulacion ��� mensajes INVALIDOS despues del segundo intercambio:**
- "quizas sea...", "podria ser que...", "probablemente..."
- "intenta cambiar...", "sugiero revisar..." (sin haber instrumentado primero)
- "puede que...", "me parece que...", "a lo mejor..."
- Cualquier hipotesis sin evidencia de logs reales ejecutados

Si una instancia publica un mensaje especulativo despues del segundo intercambio, DEBE eliminarlo y reemplazarlo con instrumentacion de logs forenses.

**Quien instrumenta:** Si el fallo involucra interaccion entre ambos sistemas, AMBAS partes instrumentan logs simultaneamente — el origen en su punto de envio, el destino en su punto de recepcion. No es solo responsabilidad del destino.

---

### Protocolo forense coordinado

#### Paso 1: Reportar sintoma

La instancia que detecto el fallo publica al grupo SOLO el sintoma con evidencia factual:

```
bridge_publicar(id_grupo, "request", "CP-{NNN} FAIL. Sintoma: {que se esperaba vs que ocurrio}. Evidencia: {stack trace / response code / screenshot / log}. NO es diagnostico — es lo que se observo.",
  metadata: '{"subtipo": "checkpoint-fallo", "checkpoint": "CP-{NNN}"}')
```

Solo hechos. No incluir diagnostico, causa probable, ni solucion propuesta.

#### Paso 2: Contraverificacion rapida (1 mensaje, opcional)

La otra parte puede publicar UNA verificacion rapida con datos que ya tiene (logs existentes, estado visible, config conocida). Este mensaje NO es para especular — es para aportar evidencia observable sin instrumentacion adicional.

Si este mensaje identifica la causa con evidencia concreta → resolver directamente (saltar a Paso 5).
Si NO identifica la causa → pasar OBLIGATORIAMENTE a Paso 3.

#### Paso 3: Instrumentacion bilateral de logs forenses

**AMBAS partes** instrumentan logs en paralelo (no solo el destino):

**El destino (quien recibe la accion) instrumenta:**
1. Entrada de la request (que llego, con que datos)
2. Validaciones y puntos de decision (if/else, permisos, auth)
3. Valores de variables criticas (tokens, IDs, payloads)
4. Punto de generacion de la response (que se devuelve y por que)

**El origen (quien ejecuta la accion) instrumenta:**
1. Construccion del request (que parametros, como se arma la URL/payload)
2. Respuesta recibida (status code, headers, body)
3. Interpretacion de la respuesta (que hace con lo que recibio)

Marcar todos los logs con `// FORENSE-LOG [CP-{NNN}]: {proposito}`.

Confirmar al grupo:
```
bridge_publicar(id_grupo, "contexto", "Logs forenses instrumentados en {N} puntos de {lista de archivos}. Listo para repetir.", metadata: '{"subtipo": "forense-instrumentado"}')
```

**Esperar a que AMBAS partes confirmen instrumentacion antes de continuar.**

#### Paso 4: Repetir la accion

El origen repite la accion exactamente como la primera vez. No cambia nada — solo repite para que los logs de AMBOS lados capturen el flujo completo.

```
bridge_publicar(id_grupo, "contexto", "Accion repetida. Checkpoint CP-{NNN} ejecutado de nuevo.", metadata: '{"subtipo": "forense-repeticion"}')
```

#### Paso 5: Analizar logs y determinar causa

AMBAS partes publican lo que sus logs revelaron:

```
bridge_publicar(id_grupo, "contexto", "Evidencia forense desde {mi instancia}:
- Log en {archivo}:{linea}: {variable} = {valor} (esperado: {valor esperado})
- Log en {archivo}:{linea}: {observacion factual}
Conclusion: {hecho basado en logs, NO hipotesis}",
  metadata: '{"subtipo": "forense-evidencia"}')
```

Con evidencia de AMBOS lados, la causa raiz debe ser localizable:

**Si la causa esta en el destino:** El destino corrige → continuar a Paso 7.

**Si la causa esta en el origen:** El origen corrige → continuar a Paso 7.

**Si la causa esta en la interaccion** (ej: encoding, redirects, headers perdidos): Determinar de que lado se arregla y proceder.

**Si la causa no es clara despues de un ciclo:** Repetir pasos 3-5 con logs mas especificos. Maximo 2 ciclos forenses totales. Si despues de 2 ciclos no se determina la causa → escalar al usuario.

#### Paso 7: Resolver dentro del marco de permisos

Con la causa raiz identificada, clasificar y actuar segun lo que cada parte puede y no puede hacer:

**a) Si el cambio esta en MI repo y dentro del alcance:**
Ejecutar el cambio, documentar, publicar `cambio-ejecutado`.

**b) Si el cambio esta en el OTRO repo:**
Usar solicitud-modificacion formal. El bridge no entiende roles - resolver IDs primero (ver `archivos-publicacion.md`):
```
miembros = bridge_listar_miembros(id_grupo)
id_destinatario = [m.id for m in miembros if m.nombre == "{instancia que debe cambiar}"][0]

bridge_publicar(id_grupo, "solicitud-modificacion", "{descripcion del cambio basada en evidencia forense}",
  destinatarios: [id_destinatario],
  metadata: '{"que_cambia": "{archivos/funciones}", "por_que": "{evidencia de logs que demuestra la causa}", "impacto_esperado": "{que se espera despues del cambio}"}'
)
```
El bridge inyecta reglas del grupo, restricciones, advertencias. La instancia destino evalua, responde con decision, y si aprueba ejecuta y publica `cambio-ejecutado`.

**c) Si el cambio toca archivos protegidos o decisiones reservadas:**
Publicar tipo `alerta` con `metadata.escalamiento: true`. Solo el usuario autoriza.

**d) Si es bug preexistente (no introducido por el trabajo actual):**
Documentar como hallazgo. Preguntar al usuario si abordar aqui o en work nuevo.

**e) Si es cambio mayor o fuera de alcance:**
Escalar al usuario. El usuario decide.

#### Paso 7: Documentar hallazgo y solucion

Registrar en la bitacora local Y publicar al grupo:

```markdown
## Hallazgo CP-{NNN}
fecha: {timestamp}
sintoma: {lo que se observo}
causa_raiz: {determinada por logs forenses}
evidencia:
  - {instancia A}: log en {archivo}:{linea} mostro {valor}
  - {instancia B}: log en {archivo}:{linea} mostro {valor}
resolucion: {que se hizo}
archivos_modificados: {lista con repo}
ejecutado_por: {instancia}
solicitud_id: {id de solicitud-modificacion si aplica}
cambio_id: {id de cambio-ejecutado si aplica}
clasificacion: ajuste | bug_preexistente | fuera_de_alcance
```

#### Paso 8: Desmontar logs forenses

AMBAS instancias remueven los logs forenses (`// FORENSE-LOG`) de sus repos:
1. Buscar todos los marcadores `// FORENSE-LOG`
2. Eliminar las lineas de log
3. Verificar que el sistema compila/funciona sin los logs
4. Confirmar al grupo:
   ```
   bridge_publicar(id_grupo, "contexto", "Logs forenses removidos de {N} archivos. Sistema limpio.", metadata: '{"subtipo": "forense-limpieza"}')
   ```

**Esperar a que AMBAS instancias confirmen limpieza antes de continuar.**

#### Paso 9: Re-probar checkpoint

Repetir el checkpoint CP-{NNN} para verificar que la solucion funciono. Si pasa → continuar al siguiente checkpoint. Si falla de nuevo → volver al Paso 3 (maximo 2 ciclos forenses adicionales, luego escalar al usuario).

---

## Broadcasts obligatorios del Director

El Colaborador NO tiene acceso al work-record, la bitacora, ni los CAs del Director. Opera a ciegas si el Director no publica activamente el estado.

El Director DEBE publicar al grupo (tipo `contexto`) en estos momentos:

### 1. Al iniciar cada checkpoint

```
bridge_publicar(id_grupo, "contexto",
  "## Estado: CP-{NNN} → {CA-XXX}\nObjetivo: {que se verifica}\nNecesito de {colaborador}: {accion concreta}\nCriterio de exito: {observable}",
  metadata: '{"subtipo": "broadcast-estado", "cp": "CP-{NNN}", "cas": ["CA-XXX"]}'
)
```

### 2. Cuando el usuario toma una decision que afecta al Colaborador

Publicar inmediatamente: decision tomada, su impacto, y si cambia el alcance, URLs, parametros o expectativas.

### 3. Cuando un CA se marca PASS/FAIL

Publicar: ID del CA, resultado, evidencia resumida, y si el Colaborador contribuyo (atribucion).

### 4. Cuando se cierra un tema y se abre otro

```
"CP-{NNN} cerrado: {resultado}. Pasamos a CP-{NNN+1}: {objetivo}. Necesito de {colaborador}: {que}."
```

**Prohibicion:** El Director NO puede enviar un `request` al Colaborador sin antes haber publicado un broadcast de estado que contextualice el request. Un request sin broadcast previo es INVALIDO — el Colaborador no tiene por que adivinar el contexto.

---

## Tipos de mensaje por situacion

| Situacion | Tipo correcto | Quien |
|-----------|---------------|-------|
| Pedir accion/informacion al otro | `request` | Cualquiera |
| Compartir hallazgo/evidencia | `contexto` | Cualquiera |
| Responder a un request | `response` | Quien recibio el request |
| Sugerir que el otro haga pruebas | `contexto` (sugerencia, NO orden) | Colaborador |
| Informar estado/progreso | `contexto` | Director (obligatorio) |
| Reportar fallo de checkpoint | `request` (activa protocolo forense) | Quien ejecuto |

**REGLA:** El Colaborador NUNCA usa `request` para comunicar un hallazgo. Los hallazgos se publican como `contexto`. Solo usa `request` cuando necesita algo concreto del otro lado para poder continuar su propio trabajo.

**REGLA:** El Director NUNCA envia un `request` sin broadcast de estado previo.

---

## Desarrollo en caliente (Escenario B)

En sesiones de desarrollo con pruebas en tiempo real:

1. La instancia implementa en su repo (respetando limites del grupo).
2. Si el cambio requiere algo del otro lado → solicitud-modificacion formal.
3. Publica `cambio-ejecutado` con diff resumido cuando termine.
4. La otra instancia re-ejecuta el checkpoint afectado.
5. Ciclo: implementar → probar → ajustar → probar hasta que pase.

---

## Alto Total (detencion de emergencia)

Cuando la situacion se sale de control — cambios descontrolados, sistemas inestables, instancias actuando fuera del alcance — cualquier miembro puede solicitar un **Alto Total** que detiene TODAS las operaciones del grupo.

### Cuando usar

- Un cambio rompio funcionalidad critica en uno o ambos sistemas
- Una instancia esta haciendo cambios no autorizados que no se pueden revertir facilmente
- El flujo de checkpoints se desvio significativamente del plan y el usuario necesita intervenir
- Se detectaron datos corruptos o perdida de informacion
- El protocolo forense revelo un problema de mayor envergadura que requiere detenerse completamente

### Como funciona

**Si esta instancia es Director:**
```
bridge_solicitar_alto_total(id_grupo, motivo: "{descripcion de la emergencia}")
```
Se auto-confirma inmediatamente. El grupo pasa a estado `detenido`:
- TODOS los mensajes se bloquean (solo alerta de alto total)
- Las solicitudes-modificacion en curso se pausan con estado preservado
- Cada instancia recibe notificacion de alto total

**Si esta instancia es Colaborador:**
```
bridge_solicitar_alto_total(id_grupo, motivo: "{descripcion de la emergencia}")
```
La solicitud queda pendiente hasta que el Director confirme:
- Si el Director confirma en 120s → alto total se ejecuta
- Si el Director no responde en 120s → el broker notifica que el Director esta ausente
- Si TODOS los miembros activos solicitan → se ejecuta por **consenso de emergencia** (unanimidad)

### Despues del alto total

1. Registrar en bitacora local:
   ```markdown
   ## [Orquestador] Alto Total ejecutado
   fecha: {timestamp}
   motivo: {motivo}
   solicitado_por: {instancia}
   estado_grupo: detenido
   checkpoint_activo: CP-{NNN}
   solicitudes_pausadas: {N}
   ```

2. Evaluar la situacion con el usuario:

   AskUserQuestion:
     question: "=== ALTO TOTAL === El grupo fue detenido. Motivo: {motivo}. Que hacer?"
     options:
       - label: "Rollback y reanudar"
         description: "Revertir al punto de restauracion git y reanudar desde un checkpoint anterior."
       - label: "Reanudar sin rollback"
         description: "Continuar desde donde estamos despues de resolver el problema."
       - label: "Cerrar sesion"
         description: "Archivar el grupo y cerrar la sesion de integracion."

3. Para reanudar (solo Director):
   ```
   bridge_reanudar_grupo(id_grupo, motivo: "{razon de reanudacion}")
   ```
   Las solicitudes-modificacion pausadas vuelven a su estado anterior con timeouts recalculados.

---

## Rollback (sin alto total)

Para rollback de codigo sin detener la sesion completa:

1. Ejecutar `git stash` o `git checkout {commit-del-punto-de-restauracion}`.
2. Publicar al grupo: "Rollback ejecutado al commit {hash}. Razon: {razon}."
3. El grupo decide: reiniciar desde un checkpoint anterior o continuar.
