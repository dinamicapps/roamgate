# Etapa 3 — Sub_modo multi-repo (capacidad RM de Mary)

> Tarjeta consultable de Etapa 3. Se carga SOLO cuando el work tiene `modo: investigacion` y el README declara `sub_modo: multi-repo`. Movido desde `etapas/etapa-3.md` (Ola 5 T9, doctrina AI-friendly).

#### Sub_modo `multi-repo` (capacidad RM de Mary)

Cuando el README declara `sub_modo: multi-repo` y `multi_repo.rol: director`, Mary conduce E3 con capacidad `RM` (research-multi-repo) en lugar del flujo single-repo. Asimetria explicita decidida en P2.ii del diseno.

**Director (este repo):**

1. **Drenaje obligatorio del grupo bridge al iniciar E3** y al iniciar cada subtarea (regla universal de bridge — ver seccion "Drain bridge obligatorio" en `etapas/etapa-3.md`). Mensajes nuevos del colaborador puede contener hallazgos relevantes.
2. **Frentes propios:** ejecutar los frentes de E2 contra el codebase del director (igual que single-repo: `document-project`, `technical-research`, etc).
3. **Publicacion incremental al bridge:** cada frente con entregable cerrado se publica al grupo bridge como adjunto (`tipo: "hallazgo-investigativo"`, `metadata.repo: director`). El colaborador hace lo mismo desde su lado.
4. **Lectura de hallazgos del colaborador:** descargar adjuntos publicados por el colaborador a `etapa-3/multi-repo-input/{nombre-archivo}` y referenciarlos en hallazgos como input cruzado.
5. **Revision cruzada (F2 del manifiesto):** Mary lee el brief del colaborador y publica en el grupo bridge mensajes con `tipo: "comentario-revision"` cuando detecta drift, contradiccion o lagunas. El colaborador hace lo mismo con el brief del director.
6. **Cierre de E3 con tres entregables (responsabilidad del director):**
   - `etapa-3/brief-repo-director.md` — brief tecnico del lado del director (igual estructura que single-repo investigacion: hallazgos, dependencias, calidad, refactors potenciales, transicion legacy si aplica al lado del director).
   - `etapa-3/brief-repo-colaborador.md` — descargado del bridge al cerrar la fase de intercambio. Mary del director NO lo escribe; lo recibe.
   - `etapa-3/brief-devs.md` — brief ejecutivo/semitecnico para el equipo de devs/works que despues haran el trabajo. Lo escribe el director consolidando ambos briefs por repo. Estructura obligatoria:
     - **Resumen ejecutivo:** que es la integracion, por que se documenta ahora, alcance del trabajo derivado.
     - **Estado actual:** mapa de la integracion legacy/parcial con bugs conocidos por sistema.
     - **Impacto entre sistemas:** que cambios en repo A afectan repo B y viceversa; contratos compartidos.
     - **Transicion legacy → nuevo:** solo si `multi_repo.transicion_legacy_nuevo: si`. Plan de fases de migracion, riesgos, rollback.
     - **Estimaciones:** rangos de esfuerzo de alto nivel por repo (no estimacion fina — eso es trabajo del work consumidor).
     - **Anexos:** referencias a `brief-repo-director.md` y `brief-repo-colaborador.md` para detalle tecnico.

**Colaborador (otro repo):**

El colaborador opera con un work fastrak `{slug}-investigacion-colaborador` creado al unirse al grupo bridge (mecanica existente, ver `bridge-session/references/fase-7-work-colaborador.md`). Su responsabilidad acotada:

1. Drenaje del bridge al iniciar.
2. Ejecutar frentes contra el codebase del colaborador.
3. Publicar `brief-repo-colaborador.md` al bridge cuando cierre E3.
4. Hacer revision cruzada del brief del director (publicar comentarios en bridge).
5. **NO escribe brief-devs** — eso es del director.

**Senales de cierre coordinado:**

- Director NO cierra E3 hasta que `brief-repo-colaborador.md` este publicado en el bridge.
- Si el colaborador se demora, director puede pausar el work (`/alfred pausar`) y reanudar cuando el colaborador publique.
- Si el colaborador abandona o pierde contacto, dispara `/alfred reevaluar` (camino c — ajuste por brecha) y declara que el brief-devs se cierra con la informacion disponible solo del lado director (registro explicito de la brecha).
