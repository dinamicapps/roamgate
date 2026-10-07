# Ruta bugfix — Conversacion

> Anfitrion: Atlas. Itera con el usuario hasta acordar solucion concreta o detectar scope excedido.

## Mision

Partiendo del diagnostico de raiz de la forense, **clasificar el desenlace** del caso y acordar la accion correcta por tipo. Sistematiza el "ojo clinico": el 30-40% de los "bugs" no lo son (es un mensaje ausente, una restriccion faltante, una parametrizacion). Llegar a (A) desenlace clasificado + accion acordada, o (B) `replanteo`/scope excedido -> promover a `diseno`.

## Clasificacion del desenlace

Tras la forense, Atlas (con el usuario) clasifica el caso en un `desenlace` — campo de primera clase del README. El runtime exige que exista antes de cerrar (gate `DESENLACE_NO_DECLARADO`), pero el contenido del diagnostico es juicio de Atlas.

| `desenlace` | Que significa | Accion |
|---|---|---|
| `correccion_codigo` | Bug real en el codigo | Corregir el codigo (fix clasico) |
| `restriccion_faltante` | Mal procedimiento del usuario que el sistema **no restringe** | Agregar la restriccion/validacion que el sistema debio tener |
| `parametrizacion_no_controlada` | Una parametrizacion bloquea/permite indebidamente y el sistema **no lo controla/informa** | Corregir parametrizacion **+** agregar el control/mensaje |
| `notificacion_faltante` | El sistema actuo bien pero el mensaje es **ausente o poco claro** | Agregar/clarificar la notificacion |
| `logging_faltante` | Falta logging para diagnosticar | Instrumentar logging |
| `caso_en_seguimiento` | La forense **no concluyo** con la evidencia actual | Cablear logs + cerrar en seguimiento; reincidencia documentada |
| `replanteo` | El parche seria superficial; el arreglo de fondo es **replantear el proceso/ventana** | Escalar a `diseno` (promocion `bugfix->diseno`) |

`restriccion_faltante` / `parametrizacion_no_controlada` / `notificacion_faltante` son los casos "mejora, no bug": se resuelven en el mismo bugfix si la accion es acotada, o se reencauzan a un work de mejora si exceden el scope focal.

## Donde corregir (consistencia del contrato)

Un mismo bug suele admitir fix en varias capas (presentacion, logica de negocio, persistencia) y todas "funcionan". Antes de acordar la accion, Atlas no elige la primera capa que apaga el sintoma: evalua cual preserva la consistencia semantica del contrato para los **futuros callers**.

- Un fix en una capa baja (persistencia/logica) que compensa una inconsistencia semantica originada arriba la *disfraza*: el sintoma desaparece, pero el contrato sigue mintiendo y el proximo caller heredara el mismo problema.
- El fix de fondo corrige la causa semantica donde nace, aunque exija mas analisis. Cuando hay varios planes funcionalmente validos, el de menor riesgo a largo plazo es el que deja el contrato coherente con el ecosistema, no el mas cercano al sintoma.
- Esto justifica el analisis historico/de ecosistema *antes* de cerrar la accion: ver como consumen ese contrato otros puntos del sistema desempata entre capas. Si el analisis revela que el arreglo de fondo es replantear el proceso, es senal de `replanteo` (promover a `diseno`).

## Clasificacion del desenlace (gobernada por nivel)

> La clasificacion del `desenlace` es **rigor siempre-activo**: Atlas siempre la produce desde la
> forense. El `nivel` solo decide **quien sostiene el gate** — cuanto se confirma con el humano
> antes de escribirla. Los `## Pasos` de abajo son la rama `normal` (default), intacta.

```
segun nivel:
  maxima:
    1. Atlas corre el DETECTOR DETERMINISTA de replanteo (criterios del "## Pasos" paso 3):
       diagnostico de fondo "parche superficial", o scope excedido (>=2 de: >3 modulos,
       >3 actores, comportamiento nuevo, modelar procesos).
    2. si MATCHEA  -> FORZAR consulta (piso no-negociable): ofrecer promocion a diseno
       (protocolo "## /alfred bugfix promover-a-diseno"). Atlas NO auto-decide un replanteo.
    3. si NO matchea -> Atlas clasifica el `desenlace` SOLO desde la forense + lentes del pool;
       registra `[AUTO]` (clasificacion + evidencia citada) en `## Diagnostico forense`;
       escribe el desenlace via `agentos work set-fm --slug <slug>` (`desenlace: {valor}`);
       avanza a ejecucion-verificacion.md.
  normal (default):
    -> loop conversacional (los "## Pasos" de abajo, intactos): Atlas clasifica con criterio,
       propone el desenlace con su evidencia y agrupa la confirmacion al cierre.
  minima:
    -> Atlas clasifica igual (mismo rigor), pero CONFIRMA el desenlace con el humano antes de
       escribirlo. El humano sostiene el gate en cada clasificacion.
```

El detector de replanteo es el **guard** que impide que Atlas auto-decida un replanteo: ante
match, frena y consulta (conservador — al matchear cualquier criterio fuerte, frena). Scope/meta
y destructivo siguen consultando siempre (piso no-negociable), en todos los niveles incluido `maxima`.

La rama de `maxima` reusa los criterios de la seccion "Pasos" (paso 3, detector de scope/replanteo) y de "/alfred bugfix promover-a-diseno" de este mismo archivo; no los redefine.

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion del registro [AUTO]. La convencion [AUTO] vive alli. NO duplicar — editar la fuente. -->

## Pasos

1. Recibe la respuesta del usuario al diagnostico forense.
2. Itera: Atlas refina la causa raiz, propone el desenlace probable con su evidencia, pregunta ambiguedades.
3. **Disparadores de `replanteo`** (cada turno). Promover a `diseno` cuando se cumple **>=1** de:
   - **Diagnostico de fondo:** la forense determino que el parche seria superficial y el arreglo correcto es replantear el proceso/ventana (disparador NUEVO del Flujo 2).
   - **Scope excedido (>=2 de):** modificar >3 modulos; >3 actores distintos; la descripcion ya no es bug sino comportamiento nuevo/rediseno; Atlas necesitaria modelar procesos en vez de localizar una pista.

   Si aplica, ofrecer promocion (ver "## /alfred bugfix promover-a-diseno"):
   ```
   A-Atlas: Esto es replanteo, no parche. Detecto que:
   - {diagnostico de fondo o condicion de scope, con dato concreto}.

   Recomendacion: promover a ruta diseno. La forense que ya hice se inyecta como bootstrap del brief.
   Alternativa: continuar como bugfix con scope acotado a {scope reducido}, el resto como deuda.
   Que decides?
   ```

4. Si el usuario confirma promocion: el desenlace es `replanteo`; Alfred enruta a `diseno` (cierre `TRASLADADO_A_DISENO`, la forense se inyecta). Atlas termina.
5. Si el usuario rechaza la promocion: Atlas continua con scope acotado y clasifica el desenlace real (no `replanteo`).
6. **Cuando se acuerda desenlace + accion:** Atlas registra el `desenlace` en el README (frontmatter `desenlace: {valor}` via `agentos work set-fm --slug <slug>`, ver `gestion/set-fm.md`) y la accion en `## Diagnostico forense`/`## Solucion`, anuncia el plan ligero (incluyendo standards consultados) y avanza a `ejecucion-verificacion.md`.

## Prohibiciones

- NO modificar codigo aun (eso es `ejecucion-verificacion.md`).
- NO invitar expertos (filtros opt-in en la etapa siguiente).

## /alfred bugfix promover-a-diseno (protocolo de ejecucion)

Cuando el desenlace es `replanteo` (diagnostico de fondo, o scope excedido >=2 de: >3 modulos, >3 actores, comportamiento nuevo, modelado de procesos) y el usuario confirma promover:

1. Atlas confirma con el usuario: slug del bugfix, razon textual, slug de diseno propuesto.
2. Cerrar el bugfix como trasladado: invocar `agentos work close --slug <slug> --estado TRASLADADO_A_DISENO` (ver `gestion/cerrar.md`). Los campos cognitivos del traslado (`trasladado_a`, `trasladado_razon`) se registran en `## Decisiones clave`/`## Cierre` antes de cerrar; el binario setea el estado terminal + `fecha_fin` y archiva. Anadir seccion `## Traslado a diseno` al README.
3. Invocar `/disenar iniciar "{descripcion}"` pasando la investigacion preliminar de Atlas (hipotesis, ubicacion sospechosa, modulos, reglas) como **insumo del FOCO**, con el campo de trazabilidad `work_origen_bugfix`. No se escribe en artefactos de prosa: la investigacion entra al lazo como **una fuente mas** —sujeta a la jerarquia, donde el codigo gana— y lo que sobreviva nace como nodo del modelo con su cita. La hipotesis que el codigo no confirme nace como nodo `pregunta`, no como hecho heredado.
4. Winston (anfitrion del FOCO) toma el hilo desde donde Atlas lo dejo; Mary entra en el encuadre.

Si el usuario rechaza: el bugfix continua con scope acotado; Atlas registra la decision en `## Sabueso > Notas`.

<!-- El detector de scope que dispara este protocolo vive en "## Pasos" paso 3 de este mismo archivo. -->
<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work". Estado TRASLADADO_A_DISENO. NO duplicar -- editar la fuente. -->
