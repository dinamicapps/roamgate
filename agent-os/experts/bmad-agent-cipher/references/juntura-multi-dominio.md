---
name: juntura-multi-dominio
description: Protocolo de Acuerdo de Juntura para artefactos en la interseccion de 2+ dominios (cripto, seguridad de APIs, datos) + catalogo semilla de junturas conocidas. Fuente unica; Sentinel y Dexter apuntan aqui.
---

# Acuerdo de Juntura multi-dominio

Cuando un artefacto cae en la interseccion de 2 o mas dominios con dueno propio
(criptografia = Cipher, seguridad de APIs/permisos = Sentinel, datos/persistencia = Dexter,
y cualquier otro dueno de la tabla de autoridad de `agent-os/skills/destilar-standard/SKILL.md`),
la participacion de cada dueno NO es una invitacion de cortesia ni un requisito formal.
Un "me parece bien" sin analisis anclado no cuenta.

## Convocatoria

El anfitrion de la pieza (step de /disenar, tarea de E3, verificacion de E4) identifica
que dominios toca el artefacto y convoca a TODOS sus duenos. El protocolo aplica siempre
que haya 2 o mas duenos convocados. No esta cableado a un trio fijo: la juntura se define
por el solape de dominios, no por una lista cerrada de casos.

## Protocolo (4 reglas)

1. **Veredicto anclado por dueno.** Cada dueno produce su veredicto explicito desde su
   lente, anclado en evidencia leida del codebase/BD/config (anchor declarado). El
   anfitrion RECHAZA veredictos sin anchor y los pide de nuevo.
2. **Ronda adversarial cruzada.** Cada dueno intenta objetar el diseno de los otros en la
   zona de contacto. Ejemplos del tipo de objecion esperada: el tipo de columna (Dexter)
   trunca el hash (Cipher)? el mensaje de error del endpoint (Sentinel) filtra el estado
   del token que Cipher protege? el indice (Dexter) expone por timing lo que la
   comparacion constante (Cipher) oculta? El acuerdo se declara SOLO cuando las
   objeciones cruzadas estan resueltas o registradas como aceptadas.
3. **El desacuerdo escala, no se diluye.** Si tras la ronda adversarial persiste el
   choque, el anfitrion aplica primero la deliberacion del protocolo de conflictos
   (separacion de capas -> dueno del dominio): la mayoria de los "conflictos" son
   capas distintas de la misma decision y se documentan ambas, sin ganador.
   <!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Autoridad y resolución de conflictos". Aqui se reusan sus dos primeros pasos como deliberacion previa. NO duplicar la regla — para modificar, editar la fuente. -->
   Si el choque sobrevive a esa deliberacion, la objecion cruzada NO resuelta se
   trata como HALLAZGO y entra al loop de validacion con el usuario (ver
   "Escalamiento del desacuerdo"). PROHIBIDO cerrar con desacuerdo silencioso o
   por mayoria simple.
4. **El acuerdo queda escrito** en el artefacto correspondiente (brief o criptografia.md
   en /disenar; bloque de la tarea en E3; 07-verificacion.md en E4) con las firmas de
   los duenos: que reviso cada uno, que objeto, como se resolvio. Sin las firmas de los
   dominios tocados, el gate de esa pieza NO cierra — se tipifica como HALLAZGO
   BLOQUEANTE DE META (dispara la pieza de reevaluacion del flujo), no como veto
   informal de un invitado. Unica excepcion: el override registrado del usuario por
   el camino C del loop (ver "El camino C en una juntura es bloqueante"): el gate
   cierra con la decision y el riesgo escritos.

## Formato de la firma escrita

```
### Acuerdo de juntura: {artefacto}
- Dominios convocados: {cripto, seguridad, datos}
- {Experto} ({dominio}): reviso {que leyo, con anchor}; objeto {que}; resolucion {como}.
- {Experto} ...
- Estado: ACORDADO | ESCALADO_AL_USUARIO (decision: {que decidio}; si el usuario cerro sin acuerdo por el camino C, la decision registra el override y el riesgo asumido)
```

## Escalamiento del desacuerdo

La juntura NO tiene canal de escalamiento propio: reusa el **loop de validacion de
hallazgos** del sistema. Una objecion cruzada que sobrevive a la ronda adversarial
y a la deliberacion de la regla 3 es un hallazgo adversarial como cualquier otro,
y el anfitrion de la pieza la devuelve al usuario con el contrato del loop: los 3
bloques en pantalla (analisis con anchor / hallazgos / solucion propuesta) y el
menu fijo de 4 caminos en el cuerpo del mensaje.

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Los 4 caminos". Aqui solo se mapea que hace cada camino con el acuerdo de juntura; la mecanica del loop (contrato de pantalla, prompt libre, default-D, persistencia con hereda_de:) vive en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

Mapeo de los 4 caminos a la juntura:

| Camino | En una juntura significa... |
|---|---|
| A | El usuario acepta la resolucion propuesta. El acuerdo se escribe con `Estado: ACORDADO` (o `ESCALADO_AL_USUARIO` con la decision que el usuario tomo) y el gate de la pieza puede cerrar. Unica salida que absorbe. |
| B | Escalada adversarial: se convoca a otro dueno de dominio, o se aplica una tecnica adversarial sobre la zona de contacto, heredando todo lo acumulado. |
| C | Override registrado (NUNCA descarte del hilo). Ver "El camino C en una juntura es bloqueante". |
| D | El usuario aporta contexto que mueve la base del choque (un dato del entorno, una restriccion normativa, un uso real). Los duenos re-emiten veredicto con la base corregida si el aporte es un rebase. |

La juntura NO es una tecnica adversarial del catalogo (no tiene codigo `TR-NN`): es un
protocolo de dominio. Se convoca por solape de dominios, no eligiendola de un menu.

### El camino C en una juntura es bloqueante

La regla 4 exige las firmas de los dominios tocados para que el gate cierre. Por eso,
en el loop, una juntura se comporta como **productor bloqueante**: el camino C NO
descarta el hilo ni borra las entradas de `bitacora.md`. Equivale al override
registrado — queda escrita la decision de cerrar sin el acuerdo y el riesgo asumido
(la deuda de la zona de contacto puede emerger en E3/E4). Sin override explicito del
usuario, la falta de firmas se tipifica como HALLAZGO BLOQUEANTE DE META (regla 4).

<!-- FUENTE: agent-os/skills/host-protocol/references/loop-validacion-hallazgos.md seccion "Asimetría de C". Aqui solo se declara que la juntura se comporta como productor bloqueante; el comportamiento del camino C vive en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

### Que NO escala por aqui

El choque sobre el **contenido de un standard** (dos duenos discrepan de la convencion
que se va a escribir en `agent-os/standards/`) no es una objecion de juntura: es un
conflicto de destilacion y escala por la capa `[DT]` de `agent-os/skills/destilar-standard/SKILL.md`
(prefijo `[DT]` en la bitacora, `estado_destilado: diferido` con `diferido_razon: conflicto-activo`).
La juntura resuelve el ARTEFACTO de la pieza (brief, criptografia.md, bloque de tarea de
E3, verificacion de E4); la capa `[DT]` resuelve la LEY del repo.

<!-- FUENTE: agent-os/skills/destilar-standard/SKILL.md seccion "Autoridad y resolución de conflictos". Aqui solo se delimita que choque NO escala por la juntura; la mecanica de la capa [DT] vive en la fuente. NO duplicar la regla — para modificar, editar la fuente. -->

## Catalogo semilla de junturas conocidas

No exhaustivo — crece por aprendizaje (reflexion -> consolidar). El anfitrion lo usa
como detector rapido, no como limite.

| Juntura | Duenos y lente de cada uno |
|---|---|
| Credenciales de login (tabla de usuarios que inician sesion) | Dexter: esquema, tipos, longitud de columna del hash, constraints. Cipher: KDF correcto y parametrizado, sal, agilidad del formato. Sentinel: endpoint de login, enumeracion de usuarios, rate-limit, mensajes de error. |
| Tokens de activacion de accesos / reset / invitacion | Cipher: entropia CSPRNG, firma/HMAC, expiracion, formato. Sentinel: validacion en endpoint, un-solo-uso, codigos HTTP que no revelan estado del token/tenant. Dexter (si se persiste): tipo de columna, indice, purga de expirados. |
| Interconexion entre sistemas (payloads firmados, mTLS, secretos compartidos) | Cipher: mTLS, firma de payloads (JWS/JWE), rotacion del secreto compartido. Sentinel: contrato entre sistemas (validacion de contratos), superficie expuesta, permisos del canal. Dexter (si hay intercambio persistido): contrato de datos de lo intercambiado. |
| Firma digital de documentos expuesta por API | Cipher: esquema de firma, estampa, custodia de la llave firmante. Sentinel: quien puede invocar el endpoint de firma (permiso), auditoria de invocaciones. Dexter: persistencia del documento firmado y su evidencia. |
| Cifrado de campos sensibles en BD | Cipher: algoritmo autenticado, jerarquia KEK/DEK, rotacion. Dexter: tipo/longitud de columna del blob, columnas de decision legibles separadas del blob opaco. Sentinel: quien lee/escribe el campo via API. |
