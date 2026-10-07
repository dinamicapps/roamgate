# Ruta bugfix — Investigacion forense

> Anfitrion: Atlas (sabueso). Dexter invitado para la dimension de produccion. Silenciosa: se reconstruye el evento ocurrido; no se implementa.

## Mision

Reconstruir el evento que YA ocurrio para identificar su **causa raiz**. La forense produce un **diagnostico de raiz** con evidencia citada, o —si la evidencia actual no alcanza— la declaracion honesta de `caso_en_seguimiento` (instrumentar y seguir). No se adivina ni se parcha el sintoma antes de diagnosticar.

## Triaje de dimensiones (primero)

Atlas decide que dimensiones aplican segun el reporte. Un bug de CSS no toca produccion; un "no me deja guardar" si. No aplicar todas las dimensiones a bugs triviales.

- **Dim 1 — Codigo / persistencia / logging.** Casi siempre aplica. El codigo del area, la capa de datos, el logging existente.
- **Dim 2 — Parametrizacion (produccion).** Aplica cuando el reporte sugiere que una configuracion/parametrizacion de una entidad real podria estar bloqueando o permitiendo la accion. Invita a Dexter.
- **Dim 2b — Material criptografico (produccion).** Aplica cuando el sintoma toca firma, estampa, cifrado, token firmado o credencial: la llave/certificado real puede haber expirado o rotado, el algoritmo efectivamente configurado puede no ser el que el codigo asume, o la politica de verificacion desplegada puede estar en fail-open. Invita a Cipher.
- **Dim 3 — Flujo de datos (logs).** DIFERIDA (AWS X-Ray, mejora siguiente). En este flujo, si la forense necesita logs que no existen, el desenlace es `caso_en_seguimiento`: se cablean logs ahora, se revisan cuando reincida.

## Dim 1 — Codigo / persistencia / logging

1. Lee la descripcion del bug del README (poblada por el abordaje).
2. Despacha un subagente `Explore` (medio) con prompt acotado: identifica (a) max 5 archivos candidatos, (b) patrones relevantes, (c) tests existentes, (d) reglas de negocio implicitas, (e) **que logging existe** en el area. <500 palabras.
3. Reconstruye el evento: que datos se escribieron/leyeron, en que orden, que rama tomo el codigo.
4. **Carga standards del area** inferidos de los paths sospechosos (REF-> `agent-os/skills/cargar-standards/SKILL.md`). Interno; se comunica en la conversacion. <!-- FUENTE: agent-os/skills/cargar-standards/SKILL.md. La mecanica de inferencia de dominios y carga vive alli; aqui solo se invoca. NO duplicar -- editar la fuente. -->
5. Verifica la hipotesis de raiz con lectura puntual (`archivo:linea`, funciones sospechosas).
6. **Superficie con paraguas activo (contencion R4).** Atlas verifica si el area
   del bug pertenece a un diseño paraguas activo: busca en `agent-os/disenos/*/README.md`
   diseños no cerrados cuyo `modulo_huesped` o procesos cubran la pantalla/modulo
   afectado (cita anclada de la fila de `plan_works[]` que lo cubre). Si pertenece:
   el alcance del fix se declara LIMITADO al un-break en el diagnostico; el
   rediseño/feature de esa superficie pertenece al paraguas. Mutar el alcance exige
   decision explicita del usuario registrada como hallazgo al paraguas (señal 11 de
   drift). <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift". La señal 11 (scope-creep sobre paraguas activo) vive alli. NO duplicar la regla — para modificar, editar la fuente. -->

## Dim 2 — Parametrizacion en produccion (Dexter invitado)

Cuando el triaje la marca, Atlas invita a Dexter (`I-Dexter:`). Dexter lee la BD de **produccion** en **solo lectura** (P-D4) para verificar la configuracion real de las entidades del reporte: ¿una parametrizacion esta bloqueando/permitiendo indebidamente la accion? ¿el dato de prod contradice lo que el codigo asume?

- Solo lectura, nunca escritura (los guards `block-db-clients`/`block-destructive-sql` ya protegen).
- Si no hay conexion a prod disponible, Dexter lo declara y la Dim 2 **degrada** (no bloquea la forense; se anota como hueco).

<!-- FUENTE: agent-os/experts/bmad-agent-dexter/SKILL.md y references/disciplina-produccion.md (P-D4). La disciplina de lectura libre en produccion vive alli; aqui solo se invoca para la Dim 2. NO duplicar -- editar la fuente. -->

## Dim 2b — Material criptografico en produccion (Cipher invitado)

Cuando el triaje la marca, Atlas invita a Cipher (`I-Cipher:`). Cipher inspecciona el material criptografico realmente desplegado en **solo lectura de metadatos** (P-C8): vigencia y cadena del certificado/llave en uso, algoritmo y parametros efectivamente configurados, politica de verificacion (¿el camino de error niega o deja pasar?), y estado del proveedor externo (TSA, KMS/HSM, entidad de certificacion) si el flujo depende de uno. La pregunta es la misma que la de Dim 2 sobre otro sustrato: ¿la realidad desplegada contradice lo que el codigo asume?

- Solo lectura de metadatos: vigencia, cadena, uso declarado, ubicacion logica. **JAMAS** extraer, exportar, mover ni ejercitar material privado productivo (P-C8).
- Ningun fragmento de llave privada, secreto o certificado privado entra al work-record, a la bitacora ni a la conversacion — solo metadatos.
- Si no hay acceso a los metadatos del material productivo, Cipher lo declara y la Dim 2b **degrada** (no bloquea la forense; se anota como hueco).
- Si el hallazgo cae en una juntura (credencial persistida, token en tabla, endpoint que firma), el veredicto es conjunto con Dexter y/o Sentinel.

<!-- FUENTE de los principios P-C1..P-C8 (P-C8: produccion y material vivo intocables): agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". FUENTE del protocolo de juntura: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Protocolo (4 reglas)". NO duplicar -- editar la fuente. -->

## Pool ensanchado de lentes (siempre-activo, senal-driven)

> Step **aditivo siempre-activo**. El pool de lentes es rigor, no una opcion: corre cuando las
> `senales_codebase` matchean, en cualquier `nivel`. El `nivel` solo modula **cuanto se confirma
> con el humano** el despacho y la fusion (a `minima`, Atlas confirma antes de despachar; a
> `maxima`, despacha y funde solo, registrando `[AUTO]`). No altera el triaje ni las Dims.

Tras el triaje de dimensiones (intacto) y antes de clasificar:

1. Atlas evalúa las `senales_codebase` del registry contra los **archivos candidatos** que el
   `Explore` de Dim 1 ya identificó (umbral "plausible", no "inequívoco"). Si ninguna señal
   matchea, la forense usa solo el `Explore` de Dim 1 + Dexter (Dim 2).
2. Despacha **en paralelo** (subagentes `Explore`/expertos) los expertos cuyas señales matchean
   — típicamente Winston (impacto arquitectónico), Quinn (lógica/tests), Sentinel (auth), Cipher (firma/llaves/cifrado). Cada
   uno produce un lente `<300 palabras`.
3. Atlas **funde** los lentes en `## Diagnostico forense` (subsección "Lentes del pool") antes
   de clasificar el desenlace. Los lentes **informan**, no votan (no son un panel de aprobación).
4. El triaje de dimensiones sigue filtrando: un bug de CSS no invita a Dexter ni Sentinel.

<!-- FUENTE: agent-os/experts/_registry.yml seccion senales_codebase. El mapeo experto<->patron vive alli; aqui solo se evalua. NO duplicar — editar la fuente. -->

## Salida de la forense

Atlas escribe en el README la seccion `## Diagnostico forense`:

- **Dimensiones investigadas** (cuales aplicaron y por que).
- **Evidencia con cita anclada:** cada eslabon de la cadena causal (dato escrito ->
  rama tomada -> efecto observado) lleva `archivo:linea` + fragmento literal
  (`tabla.columna` + valor leido para la Dim 2 de Dexter). Eslabon sin cita =
  `sin-evidencia`. Antes de publicar el diagnostico, Atlas corre
  `agentos citas verificar` sobre las citas del diagnostico y corrige las movidas.
  <!-- FUENTE: agent-os/skills/host-protocol/references/cita-anclada.md seccion "Formato". Formato, invalidez y verificacion viven en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->
- **Causa raiz identificada** — o, si la evidencia no alcanzo, **hueco honesto** + declaracion de `caso_en_seguimiento` (que logs faltan, que se cableara, que reincidencia esperar).
- **Flujo de trabajo roto (MANIFIESTO P7):** que flujo de trabajo rompia el bug. La reconstruccion del evento ya lo recorre — nombrarlo es parte del diagnostico de raiz, y alimenta la verificacion (el fix se valida contra el flujo, no solo contra el sintoma).

## Anti-parche (regla dura)

La forense produce el diagnostico de raiz **antes** de tocar codigo. NO se aplica fix sin diagnostico (o sin declarar `caso_en_seguimiento`/`replanteo`). El 60-70% de los casos se parchan sin confirmar la raiz; este step lo frena.

## Cierre (publicacion al usuario)

```
A-Atlas: Investigue el bug en forense. Lo que reconstrui:

Dimensiones: {Dim 1 [+ Dim 2 si aplico] [+ Dim 2b si aplico]}.
Causa raiz: {2-3 frases con evidencia citada} -- o -- No concluyente: {hueco honesto}.
Evidencia: {archivo:linea / tabla.columna / config de prod}.

{Si concluyente:} Mi lectura del desenlace probable es {tipo}. Lo confirmamos en la conversacion?
{Si no concluyente:} Propongo cerrar como caso_en_seguimiento: cableo {logs} y reabrimos si reincide. De acuerdo?
```

## Prohibiciones

- NO escribir codigo ni modificar archivos del codebase.
- NO escribir el desenlace al README aun (se clasifica en `conversacion.md`).
- NO aplicar fix sin diagnostico de raiz declarado.
- Dexter: NO escribir en produccion bajo ninguna circunstancia.
- NO clasificar el desenlace apoyandose en eslabones `sin-evidencia`: la cadena causal que sostiene el desenlace va completa con citas ancladas verificadas (o el desenlace honesto es `caso_en_seguimiento`).
- NO expandir el fix a rediseño sobre superficie cubierta por un paraguas activo sin decision explicita del usuario registrada como hallazgo al paraguas (señal 11 de drift).
