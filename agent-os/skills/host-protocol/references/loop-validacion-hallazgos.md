# Loop de validación de hallazgos adversariales con el usuario

> Fuente única. Define cómo un anfitrión devuelve al usuario los hallazgos
> producidos por una técnica adversarial (TR-NN), un party-mode, o una objeción
> cruzada no resuelta del Acuerdo de Juntura, disparados dentro de un gate, ANTES
> de anexarlos a cualquier artefacto.
>
> Consumidores (punteros): advanced-elicitation/SKILL.md,
> advanced-elicitation/plantillas/edge-case-hunter.md, party-mode/SKILL.md,
> disenar/ciclo-de-etapa.md, disenar/modo-inicial/step-01 (el FOCO), step-04, step-08,
> el step-02 del regimen `lineal` (disenar/lineal/), y el Acuerdo de Juntura
> (`agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md`
> sección "Escalamiento del desacuerdo", que mapea sus objeciones a los 4 caminos
> y declara que se comporta como productor bloqueante).

## Principio

La técnica adversarial NO es un editor del artefacto: es un instrumento de
elicitación con el usuario. Cuando produce hallazgos dentro de un gate, el
anfitrión los presenta al usuario y el usuario decide qué se absorbe. El
momento clave es donde el usuario cierra huecos mentales de su requerimiento
y aporta contexto/precisiones que no entregó en la conversación.

Inversión del flujo respecto al comportamiento previo:

    ANTES:   técnica -> anfitrión clasifica -> anexa al artefacto -> propaga
    DESPUÉS: técnica -> presenta hallazgos crudos al usuario -> loop -> anexa SOLO lo aceptado

## Los 4 caminos

Tras producir hallazgos, el anfitrión los presenta AUTOCONTENIDOS en pantalla
(el usuario ve el hallazgo completo, no "ver archivo X"). El menú NO se presenta
vía AskUserQuestion: el anfitrión escribe los 4 caminos con su explicación en el
CUERPO del mensaje y el usuario responde en el PROMPT LIBRE (ver "Menú en el
cuerpo + prompt libre"):

| | Etiqueta (literal en el cuerpo) | Naturaleza | Acción |
|---|---|---|---|
| A | Estoy de acuerdo, continuar | Cierre que ABSORBE | Única salida que anexa. Recién aquí se anexa lo aceptado (incl. solución propuesta) al artefacto y se propaga downstream. |
| B | Profundizar con otra técnica adversarial | Escalada adversarial (NO fracaso) | Otra TR-NN o experto party hereda TODO lo acumulado + mensaje del usuario y escarba desde otro ángulo. |
| C | Cancelar y volver al gate | Salida SIN absorber | No anexa nada. Comportamiento según tipo de técnica (ver "Asimetría de C"). El step vuelve a su menú P/C de cierre. |
| D | Opinión, comentario o contexto adicional | Profundizar el mismo eje | Dos sub-comportamientos según qué hace el texto con la base de la técnica (ver "D: aclaración vs. rebase"). |

Las 4 opciones se listan completas, con explicación, en CADA turno del loop (no
se abrevian tras el primer turno). Son texto fijo y corto; la concisión aplica a
los bloques de contenido, no al menú.

## Framing del camino B: escalada, no fracaso

Cambiar de técnica es PARTE del método adversarial, no un plan B. Encadenar
técnicas es cómo el proceso adversarial ilumina caras distintas del mismo
material. El lenguaje NO debe connotar descarte:

- Correcto: "Profundizar con otra técnica", "escarbar desde otro ángulo".
- Prohibido: "cambiar de técnica porque esta no sirvió", "probar otra a ver si".

B y D son ambos "seguir escarbando": D profundiza el mismo eje (misma
técnica, más contexto); B abre un eje nuevo (otra técnica, mismo material
acumulado).

## Menú en el cuerpo + prompt libre

El menú NO usa AskUserQuestion. El anfitrión escribe las 4 opciones con su
explicación en el cuerpo y el usuario responde en el prompt libre: solo la letra
(A), letra + texto (ej. "D, el Estado 3 se alcanza automático al guardar
credenciales"), o solo texto. El prompt libre decanta una respuesta consciente y
es naturalmente componible.

Regla de inferencia (respuesta sin letra) — el anfitrión infiere el camino del
contenido y actúa de inmediato (no re-pregunta):

| El usuario escribe... | Anfitrión infiere... |
|---|---|
| Una precisión, aclaración, corrección de un hallazgo, o contexto nuevo | D — profundiza el mismo eje (sub-comportamiento según "D: aclaración vs. rebase"). |
| "ok" / "de acuerdo" / "sigue" / "continúa" / asentimiento inequívoco | A — absorbe y propaga. |
| "probemos otra cosa" / pide otra técnica o experto | B — escalada adversarial heredando lo acumulado. |
| "déjalo" / "cancela" / "no aplica" / "volvamos" | C — salida sin absorber. |
| Cualquier cosa ambigua o que no infiere claramente A/B/C | D (default) — asume contexto del usuario, profundiza el mismo eje (sub-comportamiento según "D: aclaración vs. rebase"). |

Default-D ante ambigüedad: toda respuesta cuya intención NO infiera claramente a
A, B o C se asume D. El anfitrión NO re-pregunta ni adivina entre A/B/C. Razón:
A/B/C tienen consecuencias (absorber / escalar / cancelar-descartar); D es el
único camino reversible y no-destructivo — solo incorpora el texto y vuelve a
presentar, así que si el anfitrión malinterpretó, el siguiente turno corrige sin
daño. La letra explícita siempre gana sobre la inferencia.

## D: aclaración vs. rebase

D puede llegar por respuesta explícita del usuario o por inferencia (ver "Menú en
el cuerpo + prompt libre"); en ambos casos aplica el mismo test de
sub-comportamiento. Elegir D NO significa siempre re-lanzar la técnica. El
anfitrión infiere qué hizo el texto del usuario con la BASE de la técnica (su
anchor + sus datos de entrada):

| Sub-comportamiento | Criterio |
|---|---|
| D-aclaración (común) | El usuario aclara una duda, destraba una tensión o aporta matiz SIN mover la base: anchor sigue vivo, datos de entrada no cambian. |
| D-rebase (obligatorio cuando ocurre) | El texto CAMBIA las bases: el resultado anterior quedó sobre cimientos que ya no son verdaderos. |

Acción según sub-comportamiento:

- **D-aclaración → NO re-lanza.** Trabaja sobre los hallazgos YA producidos,
  incorporando la aclaración. Vuelve a presentar con el menú.
- **D-rebase → re-lanza la técnica** con la base corregida, heredando el contexto
  acumulado. El resultado previo se marca "sobre base obsoleta" en `bitacora.md`.

Gatillos de D-rebase (re-lanzamiento obligatorio):

- (a) Anchor muerto: el usuario aclara que el archivo / método / doc tomado como
  anchor de la técnica YA NO es código vivo (deprecated, reemplazado, eliminado).
  La técnica se ancló en evidencia inválida → re-lanzar con anchor correcto (o
  declarar anchor vacío si no hay reemplazo, según el "Gate de anchor en evidencia"
  de `advanced-elicitation/SKILL.md`).
- (b) Datos base alterados: el usuario incluye una arista, visión o dato que
  aporta / sesga / cambia los datos de entrada de la técnica (ej. "el operador
  soporte SÍ es tenant", "ese flujo pasa por otro servicio"). El input cambió →
  el razonamiento anterior corrió sobre datos parciales o equivocados → re-lanzar.

En ausencia de ambos gatillos, D es aclaración: se trabaja sobre el resultado
existente, sin re-lanzar la técnica. El criterio es exactamente "¿se movió el
anchor o el input?": una técnica es válida solo mientras su base empírica sea
verdadera.

## Asimetría de C

C (cancelar y volver al gate) se comporta distinto según cómo se invocó la técnica:

| Tipo de técnica | C hace... | Razón |
|---|---|---|
| Voluntaria (menú P del step, técnica propuesta con anchor por señal concreta, o party voluntario) | Descarta el hilo completo, SIN rastro en bitacora.md. Incluye las entradas de turnos previos B/D del mismo hilo (enlazadas por hereda_de:): se eliminan todas. El step vuelve a su menú P/C de cierre como si la técnica no se hubiera corrido. | Fue una exploración que el usuario abortó; no contamina la bitácora. (Rompe "suma siempre" en este caso particular, por decisión del usuario.) |
| Bloqueante (TR-10 en el FOCO, TR-02 step-08, Acuerdo de Juntura) | Equivale al override registrado existente: el step puede cerrar, PERO queda en bitacora.md la decisión de no absorber + el riesgo asumido (invariantes-puente / superficie no cubierta podrían emerger en E3/E4). NO elimina entradas previas. | En un gate obligatorio hay que trazar por qué se saltó. Reutiliza el formato de override que ya existe en el FOCO y step-08. |

## Contrato de pantalla: 3 bloques

Antes de abrir el menú, cada técnica/experto presenta AUTOCONTENIDO en pantalla
tres bloques:

    [Análisis]            razonamiento del experto + anchor en evidencia (cita verificable)
    [Hallazgos]           los hallazgos crudos identificados (H1, H2, ...)
    [Solución propuesta]  por cada hallazgo: qué propone el experto resolver y cómo

Autocontenido: el usuario ve todo en pantalla y NUNCA debe remitirse a un archivo
para saber qué está pasando. Concisión: los tres bloques dan suficiente contexto
para decidir, sin convertirse en un best-seller. Si un hallazgo necesita más, se
parte en varios hallazgos concisos, no en párrafos largos. La concisión NO aplica
al menú (texto fijo corto).

El "A) Estoy de acuerdo" aplica sobre la SOLUCIÓN propuesta, no solo el
diagnóstico. Como las soluciones están en el cuerpo (no en el menú), aceptar
puede significar "de acuerdo con el conjunto de soluciones" — incluyendo mezclas.
El usuario no escoge una solución; acepta o no el conjunto razonado.

**Regla soluciones-en-cuerpo:** las soluciones propuestas van SIEMPRE en el bloque
[Solución propuesta] del cuerpo. NUNCA como opciones de un menú clickeable; nunca
vía AskUserQuestion. El menú es SIEMPRE los 4 caminos fijos escritos en el cuerpo.
Si una técnica produce varias soluciones-candidatas, las lista todas en
[Solución propuesta] (puede recomendar una o señalar que son combinables); el
usuario reacciona con A/B/C/D en el prompt libre.

## Reglas duras

1. **Todo hallazgo abre el loop.** No hay umbral de relevancia. Es donde el
   usuario cierra huecos del requerimiento y aporta contexto no entregado antes.
2. **Contrato de pantalla de 3 bloques.** Análisis + Hallazgos + Solución
   propuesta, autocontenidos y concisos. El usuario nunca debe remitirse a un
   archivo para saber qué está pasando.
3. **Soluciones en el cuerpo, menú fijo de 4 caminos.** Nunca soluciones como
   opciones de un menú clickeable; nunca AskUserQuestion para el menú del loop.
4. **Respuesta consciente, con o sin letra; default-D ante ambigüedad.** Ver
   "Menú en el cuerpo + prompt libre".
5. **Suma siempre, salvo cancelación voluntaria.** Cada turno B/D hereda TODOS
   los hallazgos acumulados + el mensaje del usuario. La excepción: C en técnica
   voluntaria descarta el hilo. (Suma siempre difiere a propósito del "discard
   memory" del elicitation BMAD original, que NO se modifica.)
6. **Autocontenido en pantalla + bitácora por turno.** Cada turno escribe una
   entrada en bitacora.md (ver "Persistencia"). Excepción: C en técnica voluntaria
   no escribe entrada y elimina las previas del hilo.

## El loop no termina por agotamiento de la técnica

A es la ÚNICA salida. B y D son ambas "seguir". El loop converge cuando
el usuario está satisfecho con la cobertura, no cuando la herramienta se cansó.
El anfitrión puede recordar que A es la salida, sin presionar.

## Persistencia: una entrada por técnica, enlazada

Cada técnica/party escribe su propia entrada en bitacora.md (formato estándar
`## YYYY-MM-DD — ...`, compatible con /alfred maintain audit-tareas), con el campo
`hereda_de:` análogo al `escucho_a:` de party-mode. El hilo se reconstruye
siguiendo `hereda_de:`.

    ## YYYY-MM-DD — TR-10 data-flow-backtrace (turno 1)
    hereda_de: ninguno
    hallazgos_presentados: [INV-PUENTE-01, INV-PUENTE-02]
    camino_usuario: D opinion/contexto
    sub_comportamiento: D-rebase
    base_obsoleta: "el resultado asumio que el operador soporte NO es tenant; el usuario corrige el dato base"
    mensaje_usuario: "el operador soporte SÍ es tenant en este caso, no lo dije antes"

    ## YYYY-MM-DD — TR-10 data-flow-backtrace (turno 2)
    hereda_de: TR-10 turno 1
    nota: re-lanzada con la base corregida (datos alterados)
    hallazgos_presentados: [INV-PUENTE-01 revisado, INV-PUENTE-03 nuevo]
    camino_usuario: B otra tecnica

    ## YYYY-MM-DD — TR-02 red-team (turno 3)
    hereda_de: TR-10 turno 2
    hallazgos_presentados: [INV-PUENTE-04]
    camino_usuario: A acepto
    absorbido_al_artefacto: "contexto.md ## Invariantes-puente"

Valores de camino_usuario: `A acepto` | `B otra tecnica` | `C cancelado` |
`D opinion/contexto`. Cuando `camino_usuario: D`, el campo `sub_comportamiento:`
registra `D-aclaracion` (no re-lanza) o `D-rebase` (re-lanza); en `D-rebase` el
campo `base_obsoleta:` resume qué dejó de ser verdadero. Cancelación voluntaria
(C no bloqueante) NO escribe entrada y elimina las entradas previas del hilo;
cancelación en bloqueante escribe la entrada de override existente y conserva los
turnos ya registrados.

## Separación: loop de hallazgos vs menú P/C de cierre

Son DOS momentos distintos. El loop valida los hallazgos de UNA técnica; el
menú P/C cierra el STEP (avanzar / reabrir). Secuencia:

    1. LOOP DE HALLAZGOS  -> termina cuando el usuario elige A
    2. Anexar lo aceptado + propagar downstream
    3. MENÚ P/C DE CIERRE -> avanzar / reabrir (sin cambios)

El loop NO infla el menú de cierre. Los anti-patrones de host-protocol/SKILL.md
(no ofrecer "A — TR-XX por si acaso" en el cierre) siguen vigentes.

## Interacción con técnicas bloqueantes (TR-10 en el FOCO, TR-02 step-08)

Las técnicas bloqueantes tienen doble condición:

- Condición de gate: la técnica debe haberse ejecutado y registrado (resultado
  distinto de "saltada"), salvo override del usuario. El step no firma sin ello.
- Condición de loop: sus hallazgos pasan por el loop como cualquier otro.

El camino A ES lo que satisface la condición de gate: aceptar cierra el hilo y
habilita el menú de cierre. Si el usuario sigue en B/D, el step no llega aún
a su cierre — no es un bloqueo nuevo, es el gate esperando que el proceso
adversarial converja. En bloqueantes, el camino C equivale al override registrado
de esa técnica (ver "Asimetría de C"): el step puede cerrar con el riesgo
documentado. El override de la técnica bloqueante (saltar TR-10/TR-02) salta
también su loop y se registra como hoy.

## Aplicabilidad por modo conversacional

El loop aplica AUNQUE el work esté en nivel `normal` o `maxima`. Es elicitación
sustantiva (cierre de huecos del requerimiento), no ritual de cierre. En esos
niveles el resto del cierre es ligero, pero este loop consulta siempre — igual que
scope/meta/destructivo siguen consultando en `normal` o `maxima`.

## Compatibilidad

Diseños/works iniciados antes de 2026-06-02 no exigen `hereda_de:` ni el loop.
El comportamiento anterior sigue siendo válido para hilos legacy en curso. La
regla aplica a técnicas/party disparadas desde 2026-06-02 en adelante.
