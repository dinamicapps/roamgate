---
name: research-multi-repo
description: Research multi-repo coordinada via bridge. Capacidad RM de Mary cuando el work es modo:investigacion + sub_modo:multi-repo. Director consolida brief ejecutivo para devs; colaborador produce solo su brief de repo.
menu-code: RM
---

# Research Multi-Repo Coordinada

**Goal:** Conducir analisis investigativo coordinado entre dos repos integrados, produciendo briefs por repo + brief ejecutivo/semitecnico para devs (responsabilidad del director).

**Tu rol:** Anfitriona de E3 cuando el work tiene `modo: investigacion` y `sub_modo: multi-repo`. La asimetria del flujo (director vs colaborador) esta declarada en el manifiesto investigativo del grupo bridge, creado durante el abordaje (Fase 4) al confirmarse `sub_modo: multi-repo`.

**Pre-requisito:** grupo bridge con `tipo_grupo: investigacion-multi-repo` ya creado durante el abordaje (Fase 4) con manifiesto publicado y colaborador unido (verificable con `bridge_listar_miembros`).

---

## Identificacion del rol

Lee el README del work-record. Encuentra `multi_repo.rol`:

- `director`: tu responsabilidad incluye consolidar `brief-devs.md` al cierre.
- `colaborador`: tu responsabilidad termina al publicar `brief-repo-colaborador.md` al bridge.

El resto del flujo se bifurca segun el rol.

---

## Flujo del Director

### Paso D.1 — Drenaje inicial del bridge

Antes de tocar codigo, leer mensajes pendientes del grupo:

```
bridge_leer(id_grupo, recientes: true, limite: 20)
```

Nota: con transporte push (modo channel) los mensajes llegan en vivo; este drenaje es un
catch-up de lo no acusado al iniciar (no un reemplazo de la recepcion por push).

Si hay mensajes sin acusar del colaborador, leerlos y registrar en bitacora `etapa-3/bitacora.md` antes de iniciar frentes propios.

### Paso D.2 — Ejecutar frentes contra el codebase del director

Para cada frente declarado en `etapa-2/02-frentes.md`, aplicar la sub-capability mas adecuada:

- `document-project` para mapeo brownfield del lado del director (modulos, endpoints, dependencias, calidad).
- `technical-research` para frentes que requieren contexto externo (estandares, patrones de mercado).
- `domain-research` para frentes de reglas de negocio.

Cada frente cerrado se escribe en `etapa-3/investigacion/{frente-NNN}.md` con:
- Pregunta investigativa original (de E2).
- Fuentes consultadas (archivo:linea para codigo, URLs para externos).
- Hallazgos.
- Tabla de drift contra el manifiesto si aparece (ver Paso D.3).

### Paso D.3 — Publicacion incremental al bridge

Cada frente con entregable cerrado se publica al grupo bridge inmediatamente:

```
adj = bridge_subir_adjunto(
  id_grupo: {uuid},
  ruta: "etapa-3/investigacion/{frente-NNN}.md",
  nombre: "director-{frente-NNN}.md",
  destinatarios: omitir,
  tipo: "hallazgo-investigativo",
  metadata: '{"repo": "director", "frente": "{NNN}", "estado": "cerrado"}'
)

bridge_publicar(
  id_grupo: {uuid},
  tipo: "hallazgo",
  mensaje: "Director publica frente {NNN}: {titulo corto}.",
  adjunto_id: adj.adjunto_id
)
```

Esto permite al colaborador consumir hallazgos del director sin esperar al cierre completo del director.

### Paso D.4 — Lectura de hallazgos del colaborador

Periodicamente (al cierre de cada frente propio o al iniciar un frente nuevo), leer adjuntos publicados por el colaborador:

```
bridge_listar_adjuntos(id_grupo, destinatario: "mios", filtro_tipo: "hallazgo-investigativo")
```

Descargar a `etapa-3/multi-repo-input/{nombre-archivo}` y referenciar en frentes propios cuando sean relevantes (ej. un endpoint del colaborador que cambia interpretacion de un hallazgo del director).

### Paso D.5 — Revision cruzada (Fase F2 del manifiesto)

Cuando el colaborador publica `brief-repo-colaborador.md` (su entregable final), Mary del director:

1. Descarga el brief a `etapa-3/brief-repo-colaborador.md`.
2. Lee el brief contra los frentes propios + manifiesto.
3. Para cada drift, contradiccion o laguna detectada, publica en bridge:

```
bridge_publicar(
  id_grupo: {uuid},
  tipo: "comentario-revision",
  mensaje: "[Revision cruzada] {observacion}. Refiere a seccion {X} del brief del colaborador. Razonamiento: {breve}."
)
```

El colaborador hace lo mismo con el brief del director.

### Paso D.6 — Consolidacion de brief-devs

Cuando ambos briefs por repo estan cerrados y la revision cruzada termino sin nuevos drifts (o los drifts existentes estan resueltos en bitacora con override del usuario), Mary del director escribe `etapa-3/brief-devs.md`.

**Estructura obligatoria:**

```markdown
# Brief para devs — {nombre integracion}

**Director:** {repo director}
**Colaborador:** {repo colaborador}
**Manifiesto:** {hash}
**Cierre:** {YYYY-MM-DD}

## Resumen ejecutivo

{2-4 parrafos: que es la integracion, por que se documenta ahora, alcance del trabajo derivado, decision pendiente que este brief habilita.}

## Estado actual de la integracion

### Lado {director}
{resumen del brief-repo-director.md — modulos involucrados, endpoints, contratos actuales, deuda tecnica relevante.}

### Lado {colaborador}
{resumen del brief-repo-colaborador.md — equivalente.}

### Bugs y incidentes conocidos
{tabla con bugs reportados al iniciar (durante el abordaje) + bugs descubiertos durante investigacion. Columnas: id, lado afectado (director/colaborador/ambos), severidad, estado actual, referencia.}

## Impacto entre sistemas

{matriz: cambios en {director} afectan a {colaborador} en X; cambios en {colaborador} afectan a {director} en Y. Identificar contratos compartidos, dependencias circulares si las hay, puntos de acoplamiento fuerte.}

## Transicion legacy → nuevo

(Solo si `multi_repo.transicion_legacy_nuevo: si`)

{plan de fases de migracion. Cada fase con: alcance, repos involucrados, riesgo, prerequisitos, criterio de exito. Identificar puntos de no-retorno (decisiones que una vez tomadas no se pueden deshacer sin costo alto).}

{Si no aplica: omitir esta seccion entera o registrar "Transicion no aplica — la integracion no tiene componente legacy a migrar."}

## Estimaciones de alto nivel

{rangos de esfuerzo por repo, NO desgloses finos. Ejemplo:
- Lado director: 3-5 sprints (incluye refactor de M1 + nueva capa de Registry).
- Lado colaborador: 1-2 sprints (incluye actualizacion del cliente + tests).
- Coordinacion: 1 sprint adicional para pruebas integradas.

Las estimaciones finas son trabajo del work consumidor (cuando devs descompongan en tareas).}

## Anexos

- `etapa-3/brief-repo-director.md` — brief tecnico del lado del director.
- `etapa-3/brief-repo-colaborador.md` — brief tecnico del lado del colaborador.
- `manifiesto.yml` (grupo bridge, version {N}) — manifiesto investigativo publicado al grupo.
- Bridge UUID: {uuid} — historial completo de hallazgos y revision cruzada.
```

### Paso D.7 — Cierre de E3

1. Verificar que los tres archivos estan en `etapa-3/`: `brief-repo-director.md`, `brief-repo-colaborador.md`, `brief-devs.md`.
2. Publicar al bridge mensaje de cierre (`tipo: "cierre-fase"`, `mensaje: "Director cierra E3. brief-devs.md publicado al work-record local."`). NO subir `brief-devs.md` al bridge — es entregable interno del work del director, no del grupo.
3. Setear estado del grupo bridge a `acordado` si los CAs del manifiesto se cumplieron (Mary verifica contra el bloque `alcance.incluye` del manifiesto).
4. Ceder a Quinn (E4) con los tres briefs como input de verificacion.

---

## Flujo del Colaborador

### Paso C.1 — Drenaje inicial

Igual que el director: leer mensajes pendientes del grupo antes de iniciar frentes propios.

### Paso C.2 — Ejecutar frentes contra el codebase del colaborador

Igual que el director, pero contra el codebase de SU repo. El work fastrak del colaborador (`{slug}-investigacion-colaborador`) tiene su propio `etapa-2/02-frentes.md` derivado del manifiesto.

### Paso C.3 — Publicacion incremental al bridge

Igual que Paso D.3 pero con `metadata.repo: "colaborador"`.

### Paso C.4 — Cierre con brief-repo-colaborador

Cuando todos los frentes del colaborador estan cerrados:

1. Escribir `etapa-3/brief-repo-colaborador.md` consolidando los frentes propios.
2. Subir al bridge:

```
adj = bridge_subir_adjunto(
  id_grupo: {uuid},
  ruta: "etapa-3/brief-repo-colaborador.md",
  nombre: "brief-repo-colaborador.md",
  tipo: "brief-final",
  metadata: '{"repo": "colaborador", "estado": "cerrado"}'
)

bridge_publicar(
  id_grupo: {uuid},
  tipo: "cierre-fase",
  mensaje: "Colaborador publica brief-repo-colaborador.md final. Listo para revision cruzada.",
  adjunto_id: adj.adjunto_id
)
```

### Paso C.5 — Revision cruzada del brief del director

Cuando el director publica su brief al bridge (probablemente despues que el colaborador), descargarlo y revisar siguiendo los criterios de Paso D.5 invertidos.

### Paso C.6 — Cierre

El colaborador NO escribe `brief-devs.md` — eso es del director. El cierre del colaborador es:

1. `brief-repo-colaborador.md` publicado.
2. Revision cruzada del brief del director publicada como comentarios.
3. Mensaje de cierre al bridge: `"Colaborador cierra E3 fastrak. Esperando cierre del director."`.

El work fastrak del colaborador queda en estado `EN_PAUSA` con razon `"Esperando cierre del director para archivar grupo bridge"`. Cuando el director cierra E3 y archiva el grupo, el colaborador puede cerrar tambien.

---

## Anti-patrones

- **Director consolida brief-devs antes de recibir brief-repo-colaborador:** prohibido. La asimetria es de cierre, no de ejecucion paralela. El brief-devs SOLO se escribe cuando ambos briefs por repo estan cerrados.
- **Colaborador escribe brief-devs:** prohibido. Si el colaborador siente que tiene contexto suficiente, publica un comentario en bridge proponiendo bullets para el brief-devs, pero la responsabilidad redactiva es del director.
- **Director omite revision cruzada:** prohibido. El brief-devs no es la suma mecanica de los dos briefs por repo; es una sintesis con perspectiva inter-sistema. Sin revision cruzada, el director esta volcando dos archivos sin valor agregado.
- **Frentes del director referencian solo codebase propio cuando hay hallazgo del colaborador relevante:** drift fuerte. Si el colaborador publico un hallazgo que cambia interpretacion de un frente del director, Mary del director debe leerlo y referenciarlo (o disputarlo en bridge).
- **Subir brief-devs al bridge:** innecesario. Es entregable interno del work del director. El bridge es para coordinacion entre repos; el brief-devs es para devs internos del equipo del director.

---

## Fin de capacidad

Al cerrar E3 con los tres briefs (director) o con `brief-repo-colaborador.md` + revision cruzada (colaborador), ceder a Quinn (E4). Quinn verifica suficiencia del insumo contra `consumido_por` capturado durante el abordaje (Fase 4) — el destinatario tipico es "el work consumidor de devs/works que implementara la integracion".
