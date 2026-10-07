---
name: destilar-sesion
description: 'Convierte una grabacion de capacitacion (.mpa + video) en afirmaciones tipadas con autoridad y procedencia, y las cruza contra la documentacion y el codigo del consumidor. Fuente unica de la autoridad por hablante, la elevacion por captura, el escalamiento de contradiccion fuerte y el descenso condicional a codigo. Invocado por Paige (anfitriona) y Mary (cruce documental) en E1 de la ruta `documentacion`, cuando el insumo declarado es una sesion grabada.'
---

# Destilar Sesion

En una transcripcion, "el sistema hace X" y "el sistema deberia hacer X" son
indistinguibles si no se sabe quien habla. Este skill resuelve eso: convierte
segmentos de una grabacion en afirmaciones tipadas (`autoridad`, `tipo`,
`cruce`, `destino`) que la ruta `documentacion` puede escribir con la misma
disciplina que usa para citar `archivo:linea`.

No interpreta el `.mpa` directamente: lee ventanas servidas por el runtime
(`agentos sesion abrir` / `agentos sesion ventana` / `agentos sesion capturar`)
y trabaja tramo a tramo. Este skill nunca carga el archivo `.mpa` completo.

## Autoridad por hablante

Solo el personal de DinamicAPPS es interlocutor valido para afirmar que hace o
no hace el sistema. Lo que dice un receptor de la capacitacion (cliente,
equipo clinico) es aspiracional y se tipifica, **nunca se documenta como
capacidad**.

Cada hablante se rotula `fuente` (DinamicAPPS) o `receptor` **antes de
destilar**, en un gate bloqueante (G1). Sin rotulado no hay destilacion
posible: una transcripcion sin autoridad es una sopa donde "el sistema hace X"
y "el sistema deberia hacer X" son indistinguibles.

Invariante de tipos: `capacidad-sistema` y `regla-negocio` solo admiten
`autoridad: fuente`. Un receptor solo puede producir `flujo-operativo`,
`vocabulario` o `ambiguo` — no puede afirmar que hace el sistema ni que regla
lo gobierna.

Las afirmaciones de `autoridad: receptor` se tipifican en cuatro cubetas:
`solicitud`, `modelo-trabajo-cliente`, `falsa-afirmacion`,
`comparacion-otro-sistema` (campo `cubeta_receptor`, obligatorio si y solo si
`autoridad: receptor`).

Ejemplo real del material (minuto 20):

| Turno | Hablante | Autoridad | Clasificacion |
|-------|----------|-----------|----------------|
| "sugiero que mas que la cedula debe aparecer la tarjeta profesional" | Maira Marrugo | receptor | `solicitud` |
| "Sale ambos. Sale la cedula y sale la tarjeta profesional" | Gustavo (DinamicAPPS) | fuente | afirmacion valida |
| "la tarjeta profesional es la que mas nos exigen" | Maira Marrugo | receptor | `modelo-trabajo-cliente` |

## Elevacion por captura

Si la captura muestra el campo, la afirmacion que lo describe **se eleva a
`autoridad: fuente`** aunque quien hable sea un receptor. La evidencia visual
no hereda la autoridad de quien narra. Aplica solo a lo que **se ve**, no a lo
que se dice sobre la pantalla.

**Alcance estricto.** Esta elevacion resuelve *quien puede afirmar*, que es el
eje de "Autoridad por hablante". **No resuelve** *que afirmacion es valida*
cuando hay conflicto con la documentacion o el codigo — ese eje es
"Escalamiento de contradiccion fuerte" y lo decide un humano. Una captura que
contradice al codigo no cierra el caso: **entra al gate como la evidencia mas
fuerte del lado del material audiovisual**, y ahi se decide. Un agente no
puede usar esta elevacion para saltarse el escalamiento.

`elevada_por_captura: true` exige `requiere_captura: true` y
`procedencia.captura` presente — es obligatoria, no opcional, cuando la
elevacion aplica.

**Sin ffmpeg la elevacion no puede aplicarse.** Si `agentos sesion capturar`
falla por ausencia de `ffmpeg`, la afirmacion queda con
`procedencia.captura: ~` y `procedencia.brecha_captura` declarada: sin
evidencia visual, ninguna afirmacion de receptor se eleva a `fuente`. Un
conflicto que dependa de evidencia visual entra al gate declarando que le
falta esa evidencia, para que el humano decida con ese dato a la vista.

## Escalamiento de contradiccion fuerte

El sistema tiene una jerarquia de fuente de verdad para el resto del trabajo
(codigo deployado > docs > sintesis; cuando hay drift, codigo gana). **Esa
jerarquia no aplica aqui.**

Cuando la diferencia entre el material audiovisual y la documentacion/codigo
define funcionalidad, comportamiento o regla distinta, ninguna fuente gana por
rango: decide el humano en el gate G2. La decision bifurca en tres desenlaces,
no dos. El tercero existe porque *decidir que el material tiene razon* no es
lo mismo que *haber confirmado la capacidad*:

| Decision en G2 | `codigo_confirma` | Desenlace |
|-----------------|--------------------|-----------|
| gana el material | `si` | la documentacion estaba equivocada: se corrige citando codigo y sesion |
| gana el material | `no` / `indeterminado` | **no se documenta como capacidad.** Va a hallazgos como "capacidad afirmada, no confirmada en codigo", con la pregunta abierta asociada |
| gana la documentacion | cualquiera | el material audiovisual afirmo algo falso: hallazgo de error de capacitacion; la documentacion no se toca |

**Nunca se documenta una capacidad que el codigo no confirma**, aunque el
humano crea que el material tiene razon. Esa es la unica lectura compatible
con la honestidad epistemica del sistema: una capacidad que no se pudo
confirmar es una pregunta abierta, no un hecho.

Diferencias que **no** definen funcionalidad distinta (matices de redaccion,
mayor precision, un termino mas exacto) no escalan: son `matiza` y se aplican
directo.

## Cruce documental

Procedimiento operativo completo — un ejecutor sin contexto adicional debe
poder aplicarlo con solo esta seccion:

1. El work declara el dominio al abrirse (en el caso de referencia,
   `consulta-externa`).
2. Se cruza contra **todos** los archivos de
   `.documentacion/02-dominios-negocio/{dominio}/`, recorriendo tambien sus
   subdirectorios (el arbol de referencia tiene `03-procesos/`).
3. Se cruza **ademas** contra los arboles que el README de ese dominio enlace
   como fuente relacionada. La documentacion del consumidor declara esos
   enlaces justamente para no duplicar fuente de verdad, asi que ignorarlos
   produciria `sin-cruce` falsos sobre temas que si estan documentados, en
   otro archivo.
4. Un dominio ausente en `.documentacion/` no es error: todas las
   afirmaciones dan `sin-cruce` y se resuelven por la tabla de destinos (ver
   `references/cruce-y-destinos.md`).
5. **El cruce solo se hace para `autoridad: fuente`.** Las de receptor no se
   cruzan nunca: su destino no depende de la documentacion.

## Descenso a codigo

**Solo aplica a `autoridad: fuente`.** Tiene dos disparadores explicitos:

1. **`contradice-fuerte` contra la documentacion** — para distinguir si la doc
   esta desactualizada o si la afirmacion es falsa.
2. **`agrega` o `sin-cruce` cuando el `tipo` es `capacidad-sistema` o
   `regla-negocio`** — es decir, cuando el material audiovisual afirma una
   capacidad o una regla que la documentacion **no cubre**. Este disparador
   cierra el hueco que de otro modo dejaria pasar el caso mas peligroso: si la
   documentacion no menciona el tema, el cruce documental da `agrega`, la
   contradiccion real vive contra el **codigo**, y sin este disparador nunca
   llegaria al gate.

Las afirmaciones de tipo `flujo-operativo`, `vocabulario` y **todo receptor**
no bajan al codigo: no afirman capacidades del sistema. Ahi el descenso no
aportaria nada y el costo seria total.

En consecuencia, `sin-cruce` es un estado **terminal solo para tipos que no
afirman capacidad**. Para `capacidad-sistema` y `regla-negocio`, `sin-cruce`
obliga al descenso y se resuelve en `agrega` o `contradice-fuerte` contra el
codigo.

El resultado del descenso se registra en `cruce.codigo` (cita `archivo:linea`)
y `cruce.codigo_confirma` (`si | no | indeterminado`).

## Destilacion por ventanas

Procedimiento operativo:

1. `agentos sesion abrir --mpa <ruta>` produce el indice: hablantes, N
   segmentos, duracion, metadata. No interpreta el contenido — solo normaliza
   y valida.
2. Rotulado de autoridad (gate G1): el humano marca `fuente | receptor` por
   hablante sobre el indice producido en el paso 1.
3. `agentos sesion indexar --mpa <ruta> --sesion-id S1 --fecha AAAA-MM-DD
   --autoridad "speaker_0=fuente,speaker_1=receptor" --out
   agent-os/work-records/{slug}/indice-sesiones.yml` persiste el rotulado.
   **Este paso no es opcional y va antes de destilar:** el indice es lo unico
   que sobrevive del material crudo, y sin el toda cita `[S1 · 00:20:55]` que
   la documentacion escriba despues queda huerfana — no hay con que resolver
   quien hablo ni de que sesion salio. El verbo falla si algun hablante quedo
   sin autoridad (`ROTULADO_INCOMPLETO`) o si se rotulo un `speaker_id`
   inexistente (`HABLANTE_DESCONOCIDO`).
4. `agentos sesion ventana --mpa <ruta> (--desde --hasta | --hablante)` sirve
   tramos acotados. Se destila tramo a tramo: emitir afirmaciones tipadas
   sobre la ventana servida, capturar lo necesario con
   `agentos sesion capturar` (por necesidad, no por barrido: se captura cuando
   la afirmacion describe algo que se ve o cuando alimenta un conflicto — la
   captura es evidencia, no decoracion), y cruzar cada afirmacion segun "Cruce
   documental" y "Descenso a codigo".

**Prohibicion explicita: nunca cargar la transcripcion entera del `.mpa`.**
Una sesion de referencia tiene 88 minutos y 234 KB de JSON — un experto que
carga la transcripcion completa degrada su precision justo cuando mas la
necesita. Solo se trabaja con lo que sirve `sesion ventana` para el tramo
activo.

<!-- FUENTE: agent-os/templates/work-record/schema/sesion.md. Los nombres de campo y las 8 invariantes del corpus viven alli. Aqui se documenta COMO se clasifica, no QUE campos existen. NO duplicar el schema — para modificar, editar la fuente. -->
