# Mesa Redonda (protocolo cliente sobre primitivas bridge)

## Estado de la API

El equipo bridge **rechazo** mesa redonda como capacidad nativa (ver respuesta EP-010). La skill `bridge-session` implementa el protocolo encima de las primitivas existentes:
- Mensajes con `metadata.subcanal: "mesa-{NNN}"` para agrupar logicamente.
- Mensajes con `metadata.ronda: N` para distinguir rondas.
- Etiquetas en adjuntos para identificar artefactos de cada mesa.
- (Opcional, no requerido): crear sub-grupo efimero por mesa via `bridge_crear_grupo` y archivarlo al cerrar.

## Cuando convocar

- Desacuerdo que trasciende dos instancias (3+ afectados).
- Decision que impacta el plan global y requiere consenso.
- Hallazgo con multiples posturas contrapuestas publicadas en bridge.
- Director detecta >3 mensajes cruzados sin resolucion sobre el mismo tema.

## Convocatoria (director como moderador por defecto)

El director resuelve IDs de los participantes y publica el aviso al grupo:

```
miembros = bridge_listar_miembros(id_grupo)
participantes_ids = [
  miembro.id for miembro in miembros
  if miembro.rol in ["director", "colaborador"] and aplica_a_la_mesa(miembro)
]

mesa_id = "mesa-{NNN}"   # NNN = secuencial por grupo, mantener en bitacora local

bridge_publicar(id_grupo, "contexto",
  "MESA REDONDA #{NNN} convocada.\n
   Tema: {descripcion}.\n
   Convocados: {nombres_legibles}.\n
   Prioridad de palabra: {orden}.\n
   Artefactos referencia: {nombres_logicos_de_adjuntos}.\n
   Acudir: respondan con metadata.subcanal: '{mesa_id}' cuando reciban la palabra.",
  destinatarios: participantes_ids,
  metadata: '{"subtipo": "mesa-convocada", "subcanal": "{mesa_id}", "tema": "{descripcion}", "participantes_ordenados": [{lista con id, prioridad, razon}], "escalamiento_usuario": false}')
```

Si `escalamiento_usuario: true` en convocatoria -> skip rondas, director presenta al usuario directo.

Efectos locales (responsabilidad de la skill):
- En cada participante convocado, F1 suspende items del manifiesto marcados con la etiqueta del tema (campo aplicable en clasificacion.yml).
- La skill local registra el `mesa_id` en `etapa-1/bitacora.md` con estado `convocada`.

## Ronda 1: posturas iniciales

El director publica un mensaje "palabra a {instancia}" indicando turno explicito:

bridge_publicar(id_grupo, "request",
  "Palabra a {nombre_instancia} en mesa #{NNN} ronda 1.",
  destinatarios: [id_de_quien_habla],
  metadata: '{"subtipo": "mesa-palabra", "subcanal": "{mesa_id}", "ronda": 1, "instancia_turno": "{nombre}"}')

El destinatario:
1. Recibe el mensaje por push (modo channel) como `<channel ...>` (sin /loop). En
   polling o channel degradado, `bridge_leer` como fallback.
2. Internamente ejecuta `party-mode` con sus expertos relevantes + artefactos referenciados.
3. Forma postura.
4. Publica su postura al grupo:

bridge_publicar(id_grupo, "response",
  "{postura formada por mis expertos. Argumentos clave. Posicion concreta sobre el tema.}",
  destinatarios: [id_director, ...id_otros_participantes],
  respuesta_a: id_del_mensaje_de_palabra,
  metadata: '{"subtipo": "mesa-postura", "subcanal": "{mesa_id}", "ronda": 1, "emisor": "{mi-instancia}"}')

El director continua dando palabra al siguiente segun prioridad. Asi hasta que todos los convocados publiquen postura en ronda 1.

## Evaluacion de unanimidad

Tras la ultima postura de la ronda, el director:

1. Lee todas las posturas de la ronda con:
   `bridge_listar_mensajes(id_grupo, filtro_metadata: {subcanal: "{mesa_id}", ronda: N})`

2. Compara posturas (puede invocar internamente un experto consolidador o evaluar manualmente).

3. Si todas las posturas convergen -> cerrar con acuerdo unanime (ver Cierre con acta).
   Si no convergen -> abrir Ronda 2 (max 1 ronda adicional).

## Ronda 2 (si no hay unanimidad en ronda 1)

Director resume disidencias:

bridge_publicar(id_grupo, "contexto",
  "Mesa #{NNN}: cerro ronda 1 sin unanimidad. Disidencias: {resumen}. Abriendo ronda 2.",
  destinatarios: participantes_ids,
  metadata: '{"subtipo": "mesa-ronda-cerrada", "subcanal": "{mesa_id}", "ronda": 1, "resultado": "no-unanime"}')

Da la palabra otra vez en mismo orden, con `metadata.ronda: 2`. Cada participante re-forma postura tras leer las posturas de los demas en ronda 1.

Al cerrar ronda 2, evaluacion como en ronda 1.

## Cierre tras 2 rondas

Si tras ronda 2 NO hay unanimidad, el director NO abre una tercera ronda. Presenta posturas finales al usuario director:

AskUserQuestion local:
  question: "Mesa #{NNN}: tras 2 rondas no hay unanimidad. Posturas finales: {resumen por participante}. Decision:"
  options:
    - label: "Aceptar postura de {instancia A}"
    - label: "Aceptar postura de {instancia B}"
    - label: "Decision propia (texto libre)"

Decision se publica como acta vinculante (ver siguiente seccion).

## Escalamiento desde ronda 1 (atajo)

En cualquier momento durante la mesa, el director puede saltar al cierre por usuario:

bridge_publicar(id_grupo, "contexto",
  "Mesa #{NNN} escalada al usuario director. Razon: {por que}. Saltando rondas restantes.",
  destinatarios: participantes_ids,
  metadata: '{"subtipo": "mesa-escalada-usuario", "subcanal": "{mesa_id}", "razon": "{texto}"}')

Procede directo a la AskUserQuestion del Cierre. Util cuando tras ronda 1 es obvio que el desacuerdo es de negocio, no tecnico.

## Cierre con acta (artefacto versionable)

Generar `acta-mesa-{NNN}.md` v1 localmente con:

---
tipo: acta-mesa
emisor: {instancia-director}
version: 1
emitido: {ISO-8601}
mesa_id: "mesa-{NNN}"
tema: "{descripcion}"
participantes_ordenados: [...]
artefactos_referencia: [...]
rondas:
  - numero: 1
    posturas:
      - emisor: "{instancia-A}"
        contenido: "{texto}"
        ref_mensaje: "{id_bridge}"
      - emisor: "{instancia-B}"
        ...
  - numero: 2 (si aplica)
    ...
resolucion: "unanimidad" | "decision-usuario-director"
acuerdos:
  - "{acuerdo 1: que se hara, quien, cuando}"
  - "{acuerdo 2}"
---

Subir y publicar (recordar invariante upload+publicar):

resultado = bridge_subir_adjunto(id_grupo, ruta: "acta-mesa-{NNN}.md",
  destinatarios: participantes_ids,    # solo los convocados, NO "all"
  tipo: "acta-mesa",
  etiquetas: ["mesa-{NNN}"],
  changelog_entry: "v1: emision inicial")

bridge_publicar(id_grupo, "contexto",
  "Mesa #{NNN} cerrada. Acta v1 publicada. Resolucion: {resolucion}. Acuerdos vinculantes: {N}.",
  destinatarios: participantes_ids,
  adjunto_id: resultado.adjunto_id,
  metadata: '{"subtipo": "mesa-cerrada", "subcanal": "{mesa_id}", "resolucion": "{texto}"}')

Acta versionable: si un acuerdo se revisa despues, re-subir con `sobrescribir: true` y nueva entrada en changelog.

Acuerdos vinculantes que afecten el manifiesto disparan re-emision del manifiesto (ver manifiesto-versionado.md).

## Anti-stall

- Maximo 2 rondas. Despues -> decision usuario (no hay ronda 3).
- Si participante no toma palabra en 24h tras recibirla -> director publica "ausente en ronda {N}", continua. Acta registra la ausencia. Sin nuevo intento.
- Si en 72h no hay cierre, moderador DEBE cerrar con acuerdo parcial o escalar al usuario director.

## Diferencia con party-mode local

`party-mode` opera con expertos de UNA instancia. Mesa redonda opera entre instancias. Cada instancia internamente puede usar `party-mode` para formar su postura antes de hablar en la mesa.

## Trazabilidad

Decision del equipo bridge: `docs/solicitudes-bridge/2026-04-15-publicacion-dirigida-versionado-mesa-RESPUESTA.md` seccion "Sobre F-6 mesa redonda nativa".
