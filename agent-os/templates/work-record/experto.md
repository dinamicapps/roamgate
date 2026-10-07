---
status: active
agente: "{nombre}"
rol: "{rol}"
invocaciones: 0
---

# {Nombre} — {Rol}

<!-- Archivo append-only. Canal directo del experto.
     Contiene: analisis individuales, intervenciones en party mode,
     y respuestas del usuario dirigidas a este experto.
     El experto recibe ESTE archivo al ser re-invocado para saber donde quedo.
     Work lee estos archivos para construir contexto entre rondas de party mode. -->

---

<!-- === ANALISIS INDIVIDUAL === -->

## [{Nombre}] Analisis inicial
fecha: {YYYY-MM-DDTHH:MM}
capacidad: {capacidad invocada}
{hallazgos con evidencia de codebase — archivos y lineas citados}

### Resumen de hallazgos

| # | Severidad | Hallazgo | Archivo | Requiere accion |
|---|-----------|----------|---------|-----------------|
| {Prefijo}-001 | CRITICO / ALTO / MEDIO / BAJO | {descripcion} | {ruta:linea} | Si / No |

---

<!-- === INTERACCION CON USUARIO === -->

## [Usuario] Respuesta
fecha: {YYYY-MM-DDTHH:MM}
> {respuesta directa del usuario}

## [{Nombre}] Respuesta a usuario
fecha: {YYYY-MM-DDTHH:MM}
{respuesta del experto con evidencia}

---

<!-- === PARTY MODE === -->

## [{Nombre}] Party Mode — R{N}: Perspectiva inicial
fecha: {YYYY-MM-DDTHH:MM}
tema: "{tema del debate}"
ronda: {N} | agentes: [{lista de participantes}]
escucho_a: [ninguno]
{respuesta completa — hallazgos, posicion, evidencia}

## [{Nombre}] Party Mode — R{N}: Replica
fecha: {YYYY-MM-DDTHH:MM}
tema: "{tema del debate}"
ronda: {N} | agentes: [{lista de participantes}]
escucho_a: [{lista de agentes cuyas respuestas leyo}]
{reaccion — que cambio o se mantuvo, referencias directas a otros agentes}

---

<!-- === HILO ADVERSARIAL (técnica TR-NN o party dentro de gate) === -->

Cuando una técnica adversarial o party-mode corre dentro de un gate y devuelve
hallazgos al usuario via el loop de validacion, cada turno se registra como
entrada de bitácora con `hereda_de:` — análogo a `escucho_a:` de party-mode.
El hilo se reconstruye siguiendo `hereda_de:`.

## [{Técnica|Party}] {nombre} (turno {N})
fecha: {YYYY-MM-DDTHH:MM}
hereda_de: {ninguno | {técnica anterior} turno {N-1}}
hallazgos_presentados: [{IDs de hallazgos}]
camino_usuario: {(a) acepto | (b) aporto contexto | (c) profundizar con {técnica/experto}}
mensaje_usuario: "{precisión o contexto que aportó el usuario, si camino b/c}"
absorbido_al_artefacto: "{artefacto y sección, solo si camino a}"

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Persistencia: una entrada por técnica, enlazada". Aqui solo el formato de entrada; la mecanica del loop vive en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

---

<!-- === HALLAZGOS === -->

## Hallazgos (formato estandar)

Cada hallazgo se registra como bloque con metadata. Cuando el work participa en una sesion bridge, los campos `clasificacion`, `publicacion`, `destinatarios` y `manifiesto_ref` son obligatorios. En works single-repo son opcionales.

### Hallazgo H-NNN

severidad: critico | alto | medio | bajo
descripcion: |
  {texto}
archivo: {ruta:linea}
clasificacion: SI | NO | AUTORIZAR-A | AUTORIZAR-B | INFORMATIVO    # solo en bridge
publicacion: privada | director | cruce                              # solo en bridge
destinatarios: [director, "colaborador:{instancia}"]                 # si publicacion != privada
manifiesto_ref: F-NNN | CA-NNN | -                                    # item del manifiesto que toca
razon_publicacion: "{por que lo saben los destinatarios}"            # si publicacion != privada
evidencia: |
  {detalle observable, citas archivo:linea}
