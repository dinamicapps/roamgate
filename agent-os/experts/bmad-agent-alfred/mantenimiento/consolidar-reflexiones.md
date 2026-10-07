# /alfred learn consolidar-reflexiones

> El drenaje del buffer de reflexion hacia el ADN. SE EJECUTA SOLO EN EL REPO ORIGEN (este repo del sistema agent-os). Autoridad: director.

## Pre-condicion

`cwd` == raiz del repo agent-os origen (verificar: existe el `CLAUDE.md` fuente de este repo con marcador `agent-os:version` — el mismo que se distribuye como `.claude/CLAUDE.md` en un consumidor, pero aqui vive en su forma origen). Si se ejecuta en un repo destino, ABORTAR: el ADN no se modifica fuera del origen.

## Pasos

0. **Revisar efectos esperados de la consolidacion anterior (cierre del lazo).** `agentos learn revisar-mejoras --experto {x} --consolidacion {vN-actual}` lista las mejoras con plazo cumplido. Por cada una, confrontar su `efecto_esperado` contra la evidencia acarreada (paso 1: veredictos por dev + conteo de works de los consumidores halados; en F1 la medicion es artesanal — conteos + juicio; el humano arbitra). Registrar el desenlace con `agentos learn mejora-estado --experto {x} --id {id} --estado {confirmada|prorrogada|sin_efecto|jubilada}` (revision con evidencia-ancla por stdin). Una mejora `sin_efecto` es candidata a jubilacion: la cognicion retira/ajusta su prosa del ADN y transiciona a `jubilada`. UNA prorroga maxima. El balance (`C confirmadas, S sin_efecto, J jubiladas, K en_conflicto`) se anota en el registro de la consolidacion.

1. **Halar reflexiones.** Recolectar los `reflexion-adn.md` de los sidecars a procesar. Fuente: el director indica de que repo(s) destino se halan (copia manual al area de trabajo, o ruta accesible). Para Alfred y para cada experto con buffer no vacio. Ademas de los buffers, halar de cada consumidor procesado: `_bmad/memory/devs/{dev}/veredictos.md` (todos los devs) y el conteo de works cerrados desde la consolidacion anterior — son la evidencia del paso 0.

### Dos origenes en el mismo buffer

Cada entrada declara **exactamente uno** de `work:` o `diseno:`. Las de `diseno:` nacen de un
**regreso entre etapas de `/disenar`**: una etapa descubrio que algo emitido por otra debia
cambiar, y la leccion es para el anfitrion de la etapa de origen.

**Al consolidar, cuentan aparte.** Esto es un conteo de **entradas del buffer por origen**,
distinto del conteo de works cerrados del paso 0. Una leccion de diseno no significa que se
cerro un work: sumar las entradas `diseno:` a las `work:` inflaria cuantas entradas del
buffer vienen de trabajo cerrado frente a cuantas vienen de un regreso de diseno.

Reportar los dos conteos por separado:

    Reflexiones drenadas: {N} ({W} de works, {D} de disenos).

**Lo que NO cambia en esta capa:** a donde va la leccion. Una reflexion de diseno se destila
igual que una de work y entra al mismo ADN. Que pese distinto —o que vaya a otra seccion—
es decision propia y no esta tomada.

2. **Re-derivar causa-raiz (subagente por agente).** Para cada agente, un subagente AGRUPA las entradas y pregunta: "cual es la causa-raiz REAL de estas N observaciones, y que cambio la corrige?". NO aprueba la `leccion_candidata` ni la `causa_atribuida` crudas -- las re-deriva desde la `evidencia`. Descarta entradas cuya causa no se sostiene con su ancla. Salida: lista de mejoras DERIVADAS, cada una con: causa-raiz, Edit concreto (archivo del ADN en este repo + cambio), categoria origen, evidencia que la sustenta. El subagente agrupa ADEMAS por (experto x `arte`): N incidentes dispersos con el mismo oficio se leen JUNTOS y pueden producir UN candidato de aprendizaje de arte (la generalizacion deja de depender del azar del curador). La agregacion es paso cognitivo puro: los campos son exactos, no requiere verbo.

3. **Clasificar destino de cada mejora derivada:**
   - **a ADN del agente** (`SKILL.md` del experto / Alfred): cuando es estable y de identidad. Sujeto al limite de forma del paso 6.
   - **a artefacto defectuoso** (pieza/ruta/regla/skill citada): cuando la categoria es `artefacto-defectuoso`.

4. **Gate constitucional.** Cada mejora derivada pasa por `gate-constitucional.md`. Las `BLOQUEADA` se reportan y NO avanzan. Las `REVISAR` se ajustan.

4b. **Gate de destilacion (por candidato, antes de tocar prosa).** (i) De-contaminacion: el texto del candidato NO menciona tecnologia/framework/componente concreto — la esencia agnostica va al ADN; el residuo especifico se enruta a memoria local del repo origen, o (si trae `verificacion.tipo: mecanica`) se promueve como anti-patron en el paso 7. (ii) No-contradiccion: confrontar contra standards vigentes, `adn-mejoras.md` y la prosa del ADN del experto; un conflicto se surfacea al humano — si lo deja abierto, se registra con `agentos learn mejora --experto {x} --estado en_conflicto`. (iii) Forma: el verbo rechaza candidatos sin las 4 propiedades.

5. **Gate del director (AskUserQuestion).** Por cada mejora que paso el gate constitucional: mantener / adoptar / fusionar / descartar. El director es el ultimo gate.

6. **Aplicar en el origen.** Para las adoptadas: Edit al archivo del ADN EN ESTE REPO. Si toca el `CLAUDE.md` distribuible de este repo (fuente) o un SKILL distribuible, seguir el contrato de versionado correspondiente.

   Limite de forma al aplicar en el ADN: cada mejora entra como bullet(s) de MAXIMO 2
   lineas en el SKILL del experto; si el aprendizaje requiere mas, el bullet lleva la
   esencia y el detalle va a `references/` del mismo experto (archivo nuevo o existente).
   Un SKILL que crece sin limite deja de caber en contexto — la consolidacion no infla.

6b. **Registrar la mejora en el libro-mayor.** Inmediatamente tras cada Edit de prosa adoptado: `agentos learn mejora --experto {x}` (payload con regimen/arte/disparador/imperativo/verificacion/origen/destino_prosa/`efecto_esperado`/consolidacion). Prosa sin entrada = mejora invisible a la medicion. Self-check al terminar: el diff de prosa del ADN debe corresponder 1:1 con las entradas registradas en esta consolidacion.

7. **Vaciar el buffer.** Las entradas consolidadas (aplicadas o descartadas con decision) se ELIMINAN de `reflexion-adn.md`. Las `BLOQUEADA`/no-resueltas permanecen para el proximo ciclo. El buffer es drenable y acumulable. Antes de vaciar, promover las reflexiones tecnicas con `verificacion.tipo: mecanica` al sidecar del repo de ORIGEN de la reflexion: `agentos -C {consumidor} learn anti-patron --experto {x}` (una por reflexion; el vaciado + promocion + commit en el consumidor son UN paso operativo por consumidor procesado). Sin promocion, el dato estructurado muere con el drenaje.

8. **Redistribuir.** Recordar al director que los cambios al ADN se propagan a destinos via `project-install` / `/agent-os-actualizar-claude-md`.

9. **Regenerar Atlas (vista materializada).** Tras apropiar los aprendizajes al ADN de los especialistas, ejecutar `reconstruir-atlas.md` para que la capa de dominio de Atlas refleje el estado nuevo. Atlas es derivado puro: nunca recibe conocimiento de dominio a mano; se regenera desde los especialistas. Ver `reconstruir-atlas.md`.

## Anti-patron

NO aplicar la `leccion_candidata` tal cual la escribio el agente. Eso es reward-hacking: el agente que fallo define que es el fallo. La curaduria RE-DERIVA desde evidencia.

## Frontera runtime / cognicion (doctrina)

La destilacion y curaduria de ADN es **cognitiva**: se hace en la nebulosa (repo origen) por agentes/Claude — re-derivar causa-raiz desde evidencia, gate constitucional, decidir que entra al ADN, enrutar por dominio, destilar las lentes de Atlas (`reconstruir-atlas.md`). El **runtime** (binario `agentos`) NO destila, no drena el buffer, no promueve a ADN: se limita a **generar / validar / persistir archivos** — captura de reflexiones al buffer (`learn validar-candidato` valida el schema + appendea; `learn marcar`/`pendientes`/`omitir` gestionan estado de cosecha) y NUNCA toca el ADN instalado (invariante de frontera, impuesta por el verbo que valida el candidato en el runtime). El runtime ADEMAS posee los libros-mayor maquina del aprendizaje — `adn-mejoras.md` del experto (escribible SOLO en la nebulosa: guard `ADN_FUERA_DE_ORIGEN` en `learn mejora`/`learn mejora-estado`), `anti-patrones.md` y `devs/{dev}/veredictos.md` del consumidor — pero JAMAS la prosa del ADN. No agregar verbos de runtime que re-deriven, destilen o editen prosa del ADN: ese juicio es de la nebulosa; el runtime cuenta y persiste forma.

<!-- FUENTE: agent-os/experts/bmad-agent-alfred/mantenimiento/gate-constitucional.md. El gate. NO duplicar. -->

El ciclo de drenaje completo (halar reflexiones -> re-derivar causa-raiz -> gate constitucional -> gate del director -> aplicar -> vaciar buffer -> redistribuir -> regenerar Atlas) es el que describen los Pasos de este mismo archivo; no hay una fuente externa adicional que citar.
