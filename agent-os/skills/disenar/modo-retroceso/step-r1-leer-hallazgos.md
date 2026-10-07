# step-r1: Leer hallazgos pendientes

> Pre-step de modo retroceso. Filtra y ordena hallazgos. Anuncia al usuario.

## Pre-condicion

- Diseño existe en `agent-os/disenos/{slug}/`.
- Comando: `/disenar reanudar {slug}`.

## Mision

Identificar hallazgos pendientes. Detectar contradicciones cross-work (caso 2). Iniciar procesamiento ordenado.

## Pasos

1. **Leer todos los archivos `agent-os/disenos/{slug}/hallazgos/HZ-*.md`.**

2. **Filtrar por estado:**
   - `pendiente_analisis` y `en_analisis`: pendientes.
   - `mitigado`, `aplicado`, `obsoleto_por_replanteamiento`, `descartado`, `descartado_por_cancelacion`: cerrados.

3. **Ordenar pendientes:**
   - Bloqueantes primero.
   - Por fecha de disparo ascendente.

4. **Detectar contradicciones cross-work:** ver `agent-os/skills/disenar/modo-retroceso/casos-no-felices.md` (Caso 2). Si dos hallazgos pendientes proponen cambios opuestos en el mismo proceso, escalar a step-r2 con bandera.

5. **Sincronizar el estado del diseño con el runtime.** El retroceso (`EN_RETROCESO`) es estado derivado del conteo de hallazgos pendientes; no se setea a mano. Tras confirmar que hay pendientes:

```bash
# Deriva EN_RETROCESO si hay hallazgos pendientes (detectar binario y parsear
# {ok,data}; patron en gestion/readme.md de Alfred).
agentos diseno sincronizar --slug {slug}
```

5b. **Comprobar que cada pendiente declara el nodo que invalida.** El hallazgo entra al grafo,
   y para eso la ficha tiene que decir CUAL nodo pone en duda:

   - Si la ficha trae `invalida: {id}` en su frontmatter, no hay nada que hacer: el nodo se
     emite solo, en la transicion de r2.
   - Si NO lo trae, Mary lo pregunta antes de seguir con ese hallazgo:

```
A-Mary: HZ-{NNN} no dice que nodo del modelo pone en duda.

Por el sintoma, mi lectura es que apunta a `{id-candidato}` ({nombre}).
Sin ese dato el hallazgo se procesa igual, pero queda fuera del grafo: no
se puede calcular que etapas hay que re-recorrer, y tampoco frena a `work
open` — el freno cruza por `invalida`, asi que un hallazgo sin nodo deja
abrir el work que toca justo lo que el hallazgo pone en duda.

¿Es `{id-candidato}`, es otro, o lo dejamos sin nodo?
```

   Con la respuesta, agregar `invalida: {id}` al frontmatter de la ficha. **No se adivina**:
   `proceso_afectado` es texto para el lector, no un id resoluble, y ascenderlo a referencia
   produciria un nodo apuntando a la nada.

6. **Anunciar al usuario sin pregunta-eco:**

```
A-Mary: Reactivada por retroceso al diseño {slug}.

Hallazgos pendientes (orden de procesamiento):
  - HZ-002: {titulo} — bloqueante — invalida `P2` (despacho)
  - HZ-003: {titulo} — observacion — invalida `P3` (facturacion)

{si hay contradicciones}: Detecto contradiccion entre HZ-002 y HZ-005
(este ultimo ya aplicado). Voy a abordar la contradiccion antes de
mitigar HZ-002.

Empiezo por HZ-002. Voy a leer el archivo + procesos/P2-*.md + codigo
en evidencia anexa. Te aviso cuando tenga propuesta.
```

## Post-condicion

- Estado del diseño = `EN_RETROCESO` (derivado por `diseno sincronizar`).
- Cada pendiente declara `invalida`, o quedo explicitamente sin nodo por decision del usuario.
- Lista de pendientes priorizada.
- Contradicciones detectadas (si las hay).
- Avance a step-r2 con primer hallazgo.
