---
name: estampa-tiempo
description: Estampado cronologico RFC 3161 — protocolo TSQ/TSR, que prueba y que no prueba, seleccion de TSA, verificacion fail-closed y resellado LTV.
---

# Estampa cronologica (RFC 3161)

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

## Protocolo

- **TSQ (Time-Stamp Query):** el solicitante envia el HASH del documento (nunca el documento) mas un `nonce` aleatorio que evita reintentos/replay, y opcionalmente identifica la politica de la TSA que quiere usar.
- **TSR (Time-Stamp Response):** la TSA (Time Stamping Authority) responde firmando una estructura que incluye ese mismo hash, el `nonce` recibido, la hora certificada y su politica — la TSA nunca ve el contenido del documento, solo su huella.
- **Politica de la TSA:** un identificador (OID) que declara bajo que reglas opera la TSA (nivel de precision del reloj, sincronizacion, auditoria) — relevante para decidir si su estampa es aceptable para el caso de uso.

## Que prueba y que NO prueba una estampa

- **Prueba:** que un contenido con ese hash exacto existia en el instante certificado.
- **NO prueba autoria** — eso es responsabilidad de la firma, no de la estampa.
- **NO prueba integridad futura sin cadena de resellado** — una estampa aislada no protege contra la obsolescencia de su propio algoritmo; ver resellado LTV mas abajo.

## Estampa sobre documento vs estampa sobre firma (contrafirma temporal)

Se puede estampar directamente el documento, o estampar el VALOR de una firma ya producida (contrafirma temporal). Para alcanzar el nivel B-T (ver `./firma-digital.md`), se estampa el valor de la firma, no el documento — esto certifica "en este instante ya existia esta firma", que es la garantia que B-T necesita.

## Seleccion de TSA

- **Colombia, valor probatorio pleno:** estampa cronologica certificada, emitida por una entidad acreditada ante ONAC — la unica que produce fecha cierta con efecto legal (ver `./marco-normativo.md`).
- **TSA publicas (ej. freetsa y equivalentes):** SOLO para desarrollo o pruebas. JAMAS en produccion cuando el documento tiene valor legal — no tienen acreditacion ni garantia de disponibilidad/auditoria.

## Verificacion de una estampa (fail-closed, P-C3)

Una estampa valida requiere TODO lo siguiente; si algo falla o es indeterminado, la estampa se trata como ausente:

1. La firma de la TSA sobre la respuesta es criptograficamente valida.
2. El certificado de la TSA tiene el `ExtendedKeyUsage` `timeStamping` (y su propia cadena es valida).
3. El hash dentro de la respuesta coincide exactamente con el hash del documento/firma que se queria estampar.
4. La politica de la TSA es aceptable para el caso de uso.

Fail-closed: una estampa que no verifica equivale a un documento SIN fecha cierta, nunca se interpreta como "probablemente valida".

## Renovacion y resellado para largo plazo (LTV)

Cuando el algoritmo de hash o de firma usado en una estampa envejece (deja de considerarse seguro), la estampa se resella ANTES de que caduque la confianza en ese algoritmo: se produce una nueva estampa que certifica la validez de la anterior, extendiendo la cadena de confianza hacia el futuro. Este resellado periodico es lo que distingue B-LTA de B-LT (ver `./firma-digital.md`) y es responsabilidad de un proceso de custodia documental de largo plazo, no de la firma inicial.
