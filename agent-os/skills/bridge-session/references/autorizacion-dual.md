# Autorizacion Dual (Tipo A / Tipo B)

> **Antes de escalar una autorizacion por bridge, lee `./guia-operativa-bridge.md`** (reglas de
> oro + trampas verificadas): `dashboard-usuario` como destino fijo, `timeout_seg` amplio (el
> timeout corre en `requiere_autorizacion`), verificar el estado contra la fuente de verdad, y la
> heuristica a-quien-escalar (negocio/toca-repo -> operador; coordinacion/sistema -> orquestador).
> <!-- FUENTE: ./guia-operativa-bridge.md. NO duplicar -- editar la guia. -->

## Clasificacion (la hace el experto en F0)

| Criterio | Tipo |
|----------|------|
| Toca contrato API que otro participante consume | A |
| Cambia comportamiento visible desde otros sistemas | A |
| Modifica un item del manifiesto (alcance/fase asignada) | A |
| Matches `decision_reservada` del grupo | B |
| Modifica `archivo_protegido` del grupo | B |
| Schema BD, auth, permisos, datos sensibles locales | B |
| Dependencia nueva / cambio de stack local | B |
| Cualquier duda -> conservador, escalar a B | B |

Si un experto clasifica A y otro B para el mismo item -> prevalece B.

## Clasificaciones del item completo

Ademas de Tipo A o B para autorizaciones, cada item del manifiesto evaluado en F0 recibe una clasificacion final que determina su estado en `clasificacion.yml` y su tratamiento en F1:

| Valor | Significado | Efecto en F1 |
|-------|-------------|--------------|
| SI | Ejecutable sin autorizacion, dentro del alcance del colaborador | Se crea tarea y se ejecuta |
| NO | Rechazado, fuera de alcance o viola archivo_protegido | No se ejecuta. Se publica razon al director |
| AUTORIZAR-A | Ejecutable pero requiere autorizacion del director (ver flujo Tipo A) | Bloqueado hasta resolucion |
| AUTORIZAR-B | Ejecutable pero requiere autorizacion del usuario colaborador (ver flujo Tipo B) | Bloqueado hasta resolucion |
| INFORMATIVO | Hallazgo relevante que no requiere accion del colaborador pero SI informar a alguien | No genera tarea. Se incluye en publicaciones dirigidas segun destinatario |

La clasificacion de autorizacion (A vs B arriba) solo aplica cuando el valor final es AUTORIZAR-A o AUTORIZAR-B.

## Tipo A - Autorizacion del director

**Nota sobre destinatarios:** El bridge no entiende roles ("director", "colaborador:X"). Antes de publicar, resolver los IDs reales:

```
miembros = bridge_listar_miembros(id_grupo)
id_director = [m.id for m in miembros if m.rol == "director"][0]
```

Cachear al inicio de la sesion. Ver `archivos-publicacion.md` seccion "Resolucion rol -> ID".

### Publicacion (colaborador)

bridge_publicar(id_grupo, "solicitud-modificacion",
  "Solicitud autorizacion Tipo A - item {F-NNN}.
   Que cambia: {descripcion}.
   Por que: {evidencia de expertos}.
   Impacto esperado: {consecuencia si se aprueba}.
   Alternativa si se rechaza: {que hare en su lugar}.",
  destinatarios: [id_director],
  metadata: '{"subtipo": "autorizacion-a", "manifiesto_ref": "F-NNN", "solicitud_id": "A-001", "expertos_solicitantes": ["Winston", "Bob"]}')

### Recepcion (director, 3 caminos)

1. Director responde directo:
   bridge_publicar(id_grupo, "response", "A-001 aprobado. Condiciones: {...}.",
     destinatarios: [id_emisor],    # ID del colaborador que envio la solicitud original
     metadata: '{"subtipo": "autorizacion-a-resuelta", "resultado": "aprobado"}')

2. Director remite al usuario director:
   AskUserQuestion local. Resultado:
   bridge_publicar(id_grupo, "response", "A-001 resuelto por usuario director: {decision}. Razon: {...}",
     metadata: '{"subtipo": "autorizacion-a-resuelta", "resuelto_por": "usuario-director"}')

3. Convocar mesa redonda (afecta 3+ participantes). Ver `mesa-redonda.md` para protocolo completo. Resumen:

   ```
   participantes_ids = [m.id for m in bridge_listar_miembros(id_grupo) if aplica(m)]
   bridge_publicar(id_grupo, "contexto",
     "MESA REDONDA #{NNN} convocada. Tema: A-001 {descripcion}. Convocados: {nombres}. Artefactos: solicitud A-001.",
     destinatarios: participantes_ids,
     metadata: '{"subtipo": "mesa-convocada", "subcanal": "mesa-{NNN}", "tema": "A-001: {descripcion}", "participantes_ordenados": [...], "escalamiento_usuario": false}')
   ```

   Acta de la mesa (ver mesa-redonda.md) cierra la autorizacion.

### Veto del usuario colaborador

Mientras A-{NNN} pendiente o resuelta positivamente pero no ejecutada:
bridge_publicar(id_grupo, "contexto", "VETO a A-{NNN}. Razon: {...}",
  metadata: '{"subtipo": "autorizacion-a-vetada"}')

Item se marca `rechazado-veto-usuario-colaborador` en clasificacion.yml. Director es notificado. Si ya estaba aprobado, se bloquea ejecucion.

### Veto post-ejecucion -> alto total automatico

Si veto llega despues de cambio ejecutado:
1. Skill colaborador dispara bridge_solicitar_alto_total(motivo: "veto post-ejecucion de A-{NNN}").
2. Coordinar rollback con director.
3. Director decide reanudar con nueva evaluacion o reabrir mesa.

### Timeout

Director tiene 24h para responder (cualquiera de los 3 caminos). Sin respuesta -> skill colaborador notifica al usuario y AskUserQuestion: esperar mas / escalar a mesa redonda / cancelar solicitud.

## Tipo B - Autorizacion exclusiva del usuario colaborador

NO involucra al director bajo ninguna circunstancia.

### Flujo

1. Skill presenta items Tipo B uno por uno con loop A/P/C estandar:

AskUserQuestion:
  question: "[AUTORIZAR-B] {F-NNN}: {descripcion}. Expertos: {posturas}. Autorizas?"
  options:
    - label: "Autorizar"
    - label: "Rechazar"
    - label: "Profundizar [A]"   # elicitation
    - label: "Debatir [P]"        # party-mode local

2. Decision se registra en `experto-{usuario}.md` (patron existente) y en `clasificacion.yml`.
3. NUNCA se publica al bridge el contenido del debate. Solo el resultado consolidado al director en `publicaciones/para-director.md`:

- F-NNN: autorizado-b | rechazado-b por usuario colaborador. (sin detalle)

## Registro

Cada autorizacion resuelta:
- `etapa-0/autorizaciones/A-{NNN}-director.md` (Tipo A): hilo completo solicitud -> camino -> resolucion -> posible veto.
- `etapa-0/autorizaciones/A-{NNN}-usuario.md` (Tipo B): debate local y decision.
- `bitacora.md` F0: resumen con referencias.

## Gate F0 -> F1

No iniciar F1 mientras haya items `pendiente_autorizacion_*`. Gate duro.
