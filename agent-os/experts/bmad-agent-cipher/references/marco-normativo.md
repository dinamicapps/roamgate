---
name: marco-normativo
description: Marco normativo colombiano de firma electronica/digital (Ley 527/1999, Decreto 2364/2012, ONAC) y referencia internacional para interoperabilidad.
---

# Marco normativo de firma y evidencia digital

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

## Ley 527 de 1999

Establece la equivalencia funcional del mensaje de datos: un documento electronico tiene la misma validez que uno en papel si cumple los requisitos de la ley — no se le niega efecto juridico solo por ser electronico. Regula la firma electronica y su admisibilidad probatoria. El Articulo 7 fija el criterio de confiabilidad-apropiada: una firma electronica es valida cuando el metodo usado para identificar al firmante y vincular su voluntad al mensaje es confiable y apropiado para el proposito con el que el mensaje fue generado, considerando las circunstancias del caso.

## Decreto 2364 de 2012

Reglamenta la firma electronica dentro del genero de la Ley 527, distinguiendo:

- **Firma electronica simple:** metodo minimo de identificacion (ej. click de aceptacion, OTP).
- **Firma electronica confiable:** cuando el metodo cumple criterios de fiabilidad reforzados (control exclusivo del firmante sobre el mecanismo, deteccion de alteraciones posteriores) o cuando las partes lo acuerdan explicitamente entre ellas (acuerdo entre partes) — genera presuncion de confiabilidad.

Distincion con firma digital: la firma digital (Ley 527 + Decreto 1747 de 2000) exige ademas criptografia asimetrica respaldada por un certificado emitido por una entidad de certificacion digital acreditada — es una especie mas exigente y especifica dentro del genero firma electronica, no un sinonimo.

## Escala de valor probatorio (P-C4)

De menor a mayor fortaleza probatoria ante repudio:

**Firma electronica simple** < **Firma electronica confiable** (Decreto 2364) < **Firma digital con certificado de entidad acreditada ONAC**.

Regla de decision: a mayor riesgo de que el firmante niegue haber firmado (repudio) o mayor consecuencia legal/financiera del documento, mas arriba en la escala debe ubicarse el mecanismo elegido. Un consentimiento de bajo riesgo puede resolverse con firma electronica simple; un contrato o acta con consecuencias legales relevantes exige firma digital con certificado acreditado.

## Estampa cronologica certificada

Cuando la estampa de tiempo (ver `./estampa-tiempo.md`) es emitida por una entidad acreditada, produce efecto de FECHA CIERTA: el momento queda establecido con fuerza probatoria, no solo como metadato tecnico del sistema que firmo.

## ONAC

El Organismo Nacional de Acreditacion de Colombia acredita a las entidades de certificacion digital y a los prestadores de servicios de estampado cronologico. Antes de cualquier diseno que dependa de una entidad de certificacion o TSA, se verifica su acreditacion VIGENTE consultando el directorio oficial de ONAC — nunca se cablea una lista de entidades acreditadas en el standard ni en el codigo, porque la acreditacion se otorga, suspende y revoca en el tiempo.

## Referencia internacional (interoperabilidad y buenas practicas, NO norma aplicable local)

- **eIDAS** (reglamento europeo): define la firma electronica cualificada, equivalente conceptual a la firma digital colombiana — util como referencia de diseno, sin efecto legal en Colombia salvo que el proyecto opere en jurisdiccion europea.
- **ETSI EN 319 122/132/142:** baselines tecnicos de CAdES/XAdES/PAdES respectivamente — son la base tecnica internacional que los niveles B-B a B-LTA (ver `./firma-digital.md`) implementan.
- **RFC 3161/5652:** protocolo de estampado de tiempo y estructura CMS/SignedData — estandares tecnicos de base, no normas legales.

Estos estandares son la base TECNICA que subyace a la implementacion; el valor probatorio LEGAL en Colombia depende de la normativa nacional (Ley 527, Decreto 2364, Decreto 1747, acreditacion ONAC), no de la conformidad tecnica con eIDAS/ETSI por si sola.

## Regla operativa

Todo diseno declara explicitamente la jurisdiccion y la norma aplicable que ancla su valor probatorio. Si el proyecto opera fuera de Colombia, esta seccion normativa del standard del repo se destila de nuevo para la jurisdiccion correspondiente (capacidad DT de Cipher) — no se asume que la norma colombiana aplica por default fuera de Colombia, ni que la norma de otra jurisdiccion aplica aqui.
