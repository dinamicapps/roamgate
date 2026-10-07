# step-04: Procesos y contratos

> Lee completo, ejecuta en orden. Loop por proceso. Termina con P/C cuando
> TODOS los procesos tienen contrato. Solo C avanza.

> El modelado por procesos de este step ES la aplicacion canonica del principio 7 del MANIFIESTO (Trabajo Conectado): los procesos que aqui se modelan son los flujos de trabajo que las funcionalidades forman, y sus puntos de contacto quedan explicitos en los contratos.

## Lo propio de esta etapa

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". El ciclo completo vive alli. Aqui solo lo propio de esta etapa. NO duplicar el molde — para modificar, editar la fuente. -->

| | |
|---|---|
| Subgrafo de entrada | las `capacidad` con su clasificacion, las `regla` heredadas, las `entidad` que la etapa de datos modelo, y los `actor` del FOCO |
| Consume | `capacidad`, `regla`, `entidad`, `actor` |
| Emite | nodos `proceso` con su contrato, `endpoint`, `regla` nueva, y las aristas `DERIVA_DE`, `INICIA`, `ACCEDE`, `APLICA`, `EXPONE` |
| Valida | `agentos modelo validar --slug {slug} --etapa procesos` |
| Frontera del artefacto | el contrato de cada proceso: entre los marcadores la proyeccion; fuera, el flujo interno y la narrativa del proceso, que son de Mary |

## Pre-condicion

- step-03 cerrado (datos.md producido con persistencia_resuelta: true).
- Mary tiene mapa del modulo huesped y banderas de seguridad.
- El contrato de cada proceso referencia entidades de datos.md (no inventa persistencia nueva).

## Mision

Identificar los procesos del feature y producir un contrato por cada uno.
Procesos y contratos van JUNTOS — un proceso sin contrato no esta identificado;
un contrato sin proceso es huerfano.

## Pasos

0. **Partir del grafo.** Mary lee las capacidades con su `clasificacion`, las reglas con
   `origen: heredada`, las entidades que la etapa de datos ya modelo, y los actores del FOCO.
   Las capacidades `nueva` y `se_modifica` son las que **exigen** proceso.

1. **Mary identifica procesos con el usuario:**

```
A-Mary: Vamos a descomponer el feature en procesos. Un proceso tiene:

- Un actor concreto (medico, farmaceuta, cajero, sistema, cron).
- Un trigger especifico (al guardar X, cuando llega Y, al cerrar turno).
- Un contrato propio (entrada, reglas, salida).

¿Cuantos procesos crees que hay aqui? Si son varios actores haciendo
cosas distintas en momentos distintos, son procesos separados.
```

2. **Recibir lista tentativa de procesos.** Mary los nombra brevemente:

```
A-Mary: Tentativamente entiendo {N} procesos:

P1 — {nombre}: {actor}, {trigger}.
P2 — {nombre}: {actor}, {trigger}.
P3 — {nombre}: {actor}, {trigger}.

¿Esta descomposicion captura lo que tienes en la cabeza? Podemos fusionar,
dividir, o reordenar antes de modelar contratos.
```

3. **Iterar hasta que el usuario apruebe la descomposicion.**

4. **Loop por proceso. Para cada Pn:**

   a. Crear archivo del proceso via runtime:

   <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

   ```bash
   # 1) Escribir el cuerpo con Write a un temporal:
   #    Write tool -> .tmp-body.md con el contrato completo (Actor, Trigger, Datos, Reglas, Salida)
   # 2) Invocar con --body-file (sin contenido en el JSON):
   echo '{
     "diseno_slug": "{slug}",
     "ruta_relativa": "procesos/P{n}-{slug-proceso}.md",
     "file_type": "diseno-proceso-contrato",
     "frontmatter": {
       "proceso_id": "P{n}",
       "diseno_slug": "{slug}",
       "nombre": "{nombre corto del proceso}",
       "actor": "{quien ejecuta}",
       "trigger": "{cuando se ejecuta}",
       "modulo_huesped": "{ruta en codebase}",
       "hallazgos_aplicados": []
     }
   }' | agentos diseno file create --body-file .tmp-body.md
   # 3) rm .tmp-body.md
   ```

   b. Mary llena el contrato seccion por seccion conversando con el usuario:

   ```
   A-Mary: Proceso P{n} — {nombre}.

   Actor: {ya declarado}.
   Trigger: {ya declarado}.

   Hablemos de la ENTRADA. ¿Que datos necesita este proceso para ejecutarse?
   Lista los obligatorios y los opcionales.
   ```

   c. Tras entrada, REGLAS HEREDADAS:

   ```
   A-Mary: De las reglas heredadas que el FOCO dejo en el modelo, ¿cuales aplican a P{n}?
   {Mary lista las candidatas proyectando la vista:
    `agentos modelo proyectar --slug {slug} --vista reglas-heredadas`}. Marca las que aplican.

   ¿Hay reglas heredadas adicionales que tu sepas pero el codigo no las
   hace evidentes? (ej. "sede dispensadora se hereda de usu.idsede, NO
   seleccionable", "validez calculada por params del sistema").
   ```

   d. **Si aparecen permisos/auditoria/datos sensibles, INVITAR A SENTINEL:**

   ```
   A-Mary: Detecto bandera de seguridad. Invito a Sentinel.

   I-Sentinel: Para P{n}, identifico:
     - Endpoint previsto: {GET/POST /...}
     - Naturaleza: {restriccion-acceso | modulacion-comportamiento}
     - Permiso reutilizable: {AE090 | ...} o nuevo: {BS-XXX propuesto}

   Anoto preanuncio en la seccion "Capa de seguridad preanunciada" del
   contrato.
   ```

   e. **Si aparecen reglas operativas/contables, INVITAR A JOHN:**

   ```
   A-Mary: Detecto regla operativa/contable. Invito a John.

   I-John: Para P{n}, la regla "{regla}" tiene impacto contable porque {razon}.
   Sugiero documentar como heredada del modulo de facturacion/inventario/...
   ```

   f. REGLAS NUEVAS:

   ```
   A-Mary: ¿Hay reglas nuevas que P{n} introduce? Cada una con justificacion
   (por que se necesita, que problema resuelve, que alternativa hubo).
   ```

   Cada regla nueva acordada nace como nodo `regla` con `origen: nueva` en el lote del
   paso 5, y P{n} la aplica con `APLICA`. La justificacion queda en la prosa del contrato,
   **anclada al nodo** con `<!-- nodo: {id} -->` — ver "Cierre de la etapa".

   g. SALIDA:

   ```
   A-Mary: ¿Que produce P{n}? Documentos, registros en BD, eventos,
   notificaciones. ¿Esa salida es la entrada de P{n+1} o va a otro lado?
   ```

   **Si la salida del proceso toca persistencia, INVITAR A DEXTER (freno):**

   ```
   A-Mary: La salida de P{n} escribe/lee datos. Invito a Dexter para validar
   contra el pre-diseño de persistencia (datos.md).

   I-Dexter: La salida de P{n} toca {entidades}. {Confirmo que coinciden con
   datos.md | Detecto una entidad faltante: vuelvo a refinar datos.md
   (refinamiento conjunto) | Freno: esta salida asume {premisa no verificada sobre la BD},
   necesito resolverlo antes de cerrar el contrato}.
   ```

   <!-- FUENTE del freno deliberativo: agent-os/experts/bmad-agent-dexter/references/modelar-datos.md seccion "Freno deliberativo". NO duplicar. -->

   Si Dexter detecta entidad faltante, datos.md se refina (es vivo). Si frena por
   premisa no verificada, no se cierra el contrato hasta resolver.

   **Si el contrato introduce o consume una operacion criptografica, INVITAR A CIPHER (freno):**

   Disparadores: el proceso firma o sella un documento, emite o valida un token,
   cifra o descifra un dato, deriva o compara un hash de credencial, o consume una
   llave/certificado.

   ```
   A-Mary: El contrato de P{n} toca una operacion criptografica. Invito a Cipher
   para validar contra el pre-diseño criptografico (criptografia.md).

   I-Cipher: P{n} {firma | sella | emite token | cifra | hashea} {que}. {Confirmo
   que coincide con criptografia.md | Detecto una operacion no modelada: vuelvo a
   refinar criptografia.md (refinamiento conjunto) | Freno: este contrato asume
   {premisa no verificada sobre llaves/algoritmo/valor probatorio}, necesito
   resolverlo antes de cerrar el contrato}.
   ```

   <!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". El COMO del modelado vive en agent-os/experts/bmad-agent-cipher/references/modelar-cripto.md. NO duplicar. -->

   Si el contrato toca ADEMAS esquema de datos (token persistido, columna de hash) o
   superficie de API (endpoint que firma), la validacion es una juntura: Cipher, Dexter
   y/o Sentinel emiten veredicto anclado y objetan cruzado antes de cerrar el contrato.

   <!-- FUENTE del protocolo de juntura: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Protocolo (4 reglas)". NO duplicar. -->

   Si Cipher detecta operacion no modelada, criptografia.md se refina (es vivo). Si frena
   por premisa no verificada, no se cierra el contrato hasta resolver.

   Si criptografia.md NO existe porque el gate de entrada de step-03b declaro que el diseño
   no tenia dimension criptografica, esa declaracion queda SUPERADA: Cipher instancia el
   artefacto aqui (ver agent-os/experts/bmad-agent-cipher/references/modelar-cripto.md) y lo
   registra en bitacora — la omision previa deja de ser valida como entrada
   no-aplica-sin-cripto del handoff.

   h. Mary consolida el contrato y lo muestra al usuario en bloque para
   validacion final del proceso.

5. **Emite el lote y valida.** Unico camino de escritura al grafo:

   ```bash
   # 1) Write tool -> .tmp-lote.json con el lote (nodos `proceso`, `endpoint` y las
   #    `regla` nuevas; aristas INICIA/DERIVA_DE/APLICA/ACCEDE/EXPONE
   #    — ver "Cierre de la etapa" abajo)
   agentos modelo emitir --slug {slug} --etapa procesos --input .tmp-lote.json
   # 2) rm .tmp-lote.json
   # 3) Anclar en cada contrato la prosa de su proceso y de sus reglas nuevas
   #    (ver "Cierre de la etapa") — antes de validar
   agentos modelo validar --slug {slug} --etapa procesos
   ```

   Este paso respalda las tres validaciones de "Cierre de la etapa": sin emitir aqui, los
   predicados no tienen nada que evaluar.

6. **Cuando todos los procesos tienen contrato, registrar en bitacora:**

<!-- bitacora: append manual hasta el verbo transversal 'bitacora add' (fuera de corte B). -->
```bash
echo "
## {fecha} — step-04 cerrado

{N} procesos identificados con contrato completo.
{K} reglas heredadas aplicadas (lookup a los nodos regla del modelo).
{L} reglas nuevas introducidas con justificacion.
{M} preanuncios de capa de seguridad (Sentinel invitado).
" >> agent-os/disenos/{slug}/bitacora.md
```

## Cierre de la etapa

<!-- FUENTE: agent-os/skills/disenar/ciclo-de-etapa.md seccion "Los ocho pasos". Aqui solo lo especifico de la etapa de procesos. NO duplicar el molde — para modificar, editar la fuente. -->

<!-- FUENTE: agent-os/templates/diseno/schema/modelo.md secciones "Que nodos citan" y "Que nodos exigen prosa". La tabla completa por tipo vive alli; aqui solo se instancia lo que la etapa de procesos emite. NO duplicar la regla — para modificar, editar la fuente. -->

**Que emite esta etapa** (lote unico, `--etapa procesos`, paso 5 arriba):

- nodos `proceso`. Un proceso `resuelto` exige **`trigger` y `modulo`** — `modulo` es el
  `modulo_huesped` del frontmatter del contrato: mismo dato, dos nombres. Entradas y salidas
  van en `campos`; las consume la etapa de pipeline. **Un proceso no cita** —es lo que el
  work va a construir— pero si lleva **prosa anclada**: el marcador `<!-- nodo: {id} -->` que
  la plantilla `proceso-contrato.md` trae bajo el titulo, en el contrato instanciado del
  proceso (`procesos/P{n}-*.md`). **Esta etapa es la que lo cierra `resuelto`**: el FOCO lo
  dejo `abierto` justamente porque su prosa vive aqui.
- nodos `endpoint`. Uno `resuelto` exige `naturaleza` y `decision_permiso` — esta ultima es
  la decision de permiso reutilizable-o-nuevo que esta tarjeta ya toma (paso 4d, con
  Sentinel). Un endpoint cuya decision no este tomada nace `abierto`, y eso no bloquea esta
  etapa. **El `decision_permiso` parte en dos, igual que la entidad y la regla:** el que
  `reutilizar` **cita** —donde el permiso que se reusa esta declarado hoy, que es lo que
  prueba que existe—; el que es `nuevo` **no cita**, porque el permiso todavia no existe, y su
  ausencia de cita es correcta. Un endpoint nuevo tampoco exige prosa: su porque cabe en
  `naturaleza` y en el contrato del proceso que lo expone. Citar el `reutilizar` al emitir,
  aunque `modelo validar --etapa procesos` no lo reclame, se paga por lo mismo que en la etapa
  de datos: quien lo cuenta es `NODO_SIN_CITA` al cerrar el FOCO, y sin la cita el regreso
  revienta una etapa ya cerrada — ver step-03-pre-diseno-persistencia.md seccion "Por que la
  cita se exige aqui a la entidad existente aunque `modelo validar --etapa datos` no la
  reclame".
- nodos `regla` **nuevos** — los que el paso 4f elicita. Su identidad es `enunciado`; uno
  `resuelto` exige `origen`, y en los que nacen aqui `origen` vale **`nueva`** (las
  `heredada` ya existen en el modelo desde el FOCO, y esta etapa no las vuelve a emitir: las
  aplica). Sin emitir el nodo, la arista `APLICA` hacia ella apunta a un id inexistente y el
  lote falla por integridad referencial.

  Cada `regla` con `origen: nueva` **no lleva cita** —no hay codigo que la implemente
  todavia— y en su lugar lleva **prosa anclada**: un bloque `<!-- nodo: {id} -->` en el
  contrato del proceso que la aplica (`procesos/P{n}-*.md`, instanciado de
  `proceso-contrato.md`), seccion "Justificacion de las reglas nuevas", con el porque, el
  problema que resuelve y la alternativa que hubo — exactamente lo que 4f elicita. Las reglas
  con `origen: heredada` si citan: donde el codigo las implementa hoy, y esa cita ya viene
  del FOCO. **Esta etapa es la que cierra `resuelto` la regla nueva**, por la misma razon que
  cierra el proceso: su prosa vive en su contrato.
- las aristas cuyo origen es un proceso, **con esta direccion**:

  | arista | de | a |
  |---|---|---|
  | `DERIVA_DE` | **proceso** | **capacidad** |
  | `APLICA` | proceso | regla |
  | `ACCEDE` | proceso | entidad |
  | `EXPONE` | proceso | endpoint |

  La direccion de `DERIVA_DE` se lee "el proceso deriva de la capacidad" y es facil
  escribirla al reves. Emitirla invertida falla por forma.

- **`INICIA`, unica excepcion a la regla de arriba**, porque no sale de un proceso:

  | arista | de | a |
  |---|---|---|
  | `INICIA` | **actor** | **proceso** |

  La emite esta etapa igual, y por una razon: **es aqui donde el actor de cada proceso se
  identifica** (paso 1 lo pide como parte de la definicion misma de proceso, y el paso 2 lo
  nombra por proceso). Ninguna otra etapa tiene el dato, y el contrato proyectado lee su
  seccion "Actor" de estas aristas — sin ellas, todo contrato de todo proceso queda con el
  actor vacio. El actor como **nodo** viene del FOCO; lo que nace aqui es la relacion.
  Ojo con la direccion: va del actor HACIA el proceso, al reves que las cuatro de arriba.

**Que valida antes de cerrar** (paso 5 arriba corre este mismo comando):

    agentos modelo validar --slug {slug} --etapa procesos

- `CAPACIDAD_SIN_PROCESO` — toda capacidad `nueva` o `se_modifica` necesita al menos un
  proceso que derive de ella.
- `REGLA_HEREDADA_SIN_TRATAR` — toda regla heredada esta aplicada por algun proceso o
  descartada con razon.
- `ENTIDAD_SIN_ACCESO` — toda entidad necesita al menos un proceso que la toque. Una entidad
  que ningun proceso de este diseno usa se descarta con razon.

**Regenerar el bloque proyectado de cada contrato**, uno por proceso:

    agentos modelo proyectar --slug {slug} --vista contrato --proceso {id-del-proceso}

reemplazando con su salida lo que hay entre `<!-- modelo:start vista=contrato -->` y
`<!-- modelo:end -->`. La prosa anclada del proceso, la justificacion de las reglas nuevas, la
capa de seguridad preanunciada y los hallazgos aplicados quedan fuera y se escriben a mano —
por eso sobreviven a cada regeneracion.

## Cierre

**Si algo choca con lo que el FOCO o la etapa de datos decidieron**, leer la `etapa` del nodo
y ofrecer el regreso. Ver `ciclo-de-etapa.md` seccion "El regreso".

```
A-Mary: {N} procesos modelados. Cada uno con contrato completo:

- P1 ({actor}): {N1} reglas heredadas, {M1} reglas nuevas.
- P2 ({actor}): ...
- ...

Capa de seguridad preanunciada en {M} endpoints (Sentinel valido).

Menu (la opcion P requiere anchor declarado — ver
advanced-elicitation/SKILL.md seccion "Gate de anchor en evidencia"):

  P — invocar otro experto. Mary declara anchor del experto invitado:
      "{Experto} leera {archivos especificos} antes de pronunciarse sobre
      {pregunta concreta}".

  C — continuar a step-05 (pipeline integrador).
```

**Cuando P (experto) produce hallazgos:** Mary NO los absorbe directo al contrato/proceso. Los presenta al usuario via el loop de validacion de hallazgos: en pantalla los 3 bloques (analisis + hallazgos + solucion propuesta) y los 4 caminos en el cuerpo (A de acuerdo / B profundizar con otra tecnica o experto / C cancelar y volver al gate / D opinion-contexto). El camino B — traer otra tecnica/experto — es escalada adversarial legitima, no señal de que la anterior fallo. Solo lo aceptado (camino A) se absorbe. Este loop ocurre ANTES del menu P/C de cierre del step y es un momento distinto: el loop valida los hallazgos que produjo el experto invitado; el menu P/C cierra el step (avanzar/reabrir).

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Los 4 caminos". Distinguir: este loop valida los hallazgos que produjo el experto invitado por P; el menu P/C de arriba cierra el step. Son momentos distintos. NO duplicar la regla — para modificar, editar la fuente. -->

## Post-condicion

- `procesos/P1-*.md` ... `procesos/PN-*.md` poblados.
- README actualizado con tabla de procesos.
- Si C: avanzar a step-05.

## Prohibiciones

- NO escribir mockups.
- NO crear pipeline diagram.
- NO leer step-05.
