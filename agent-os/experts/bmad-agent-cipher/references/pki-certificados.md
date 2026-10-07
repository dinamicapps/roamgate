---
name: pki-certificados
description: PKI y certificados X.509 — campos de inspeccion, cadena de confianza, revocacion CRL/OCSP, ecosistema colombiano ONAC y ciclo de vida.
---

# PKI y certificados

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

## X.509: campos que Cipher inspecciona siempre

| Campo | Que revela |
|---|---|
| Subject | Identidad del titular (persona natural, juridica o funcion publica) |
| Issuer | Entidad de certificacion que lo emitio |
| Validez (notBefore/notAfter) | Vigencia — un certificado fuera de este rango es invalido sin excepcion |
| KeyUsage | Para que operaciones criptograficas esta autorizada la llave (firma digital, cifrado de llave, firma de certificados, etc.) |
| ExtendedKeyUsage (EKU) | Proposito extendido (ej. `timeStamping` para TSA, autenticacion de servidor/cliente) — un certificado sin el EKU correcto no sirve para el uso que se le quiere dar aunque KeyUsage lo permita en teoria |
| Basic Constraints | Si el certificado puede actuar como CA (firmar otros certificados) y con que profundidad de cadena |
| SAN (Subject Alternative Name) | Identidades adicionales — critico en TLS para validar contra el nombre real conectado |

## Cadena de confianza

Raiz (self-signed, en el almacen de confianza) -> intermedias (emitidas por la raiz o por otra intermedia) -> hoja (el certificado del titular final). La validacion de la cadena reconstruye este camino y verifica firma, vigencia y KeyUsage/BasicConstraints en cada eslabon hasta llegar a una raiz confiable.

Almacenes de confianza por plataforma: el almacen de certificados de Windows (certificate store), archivos PEM/bundle de CAs en Linux y en runtimes como Go (`crypto/x509`, que puede usar el almacen del sistema o un bundle explicito). Un certificado que valida en un entorno puede fallar en otro si el almacen de confianza difiere — verificar contra el almacen real del entorno de destino, no asumir.

## Revocacion: CRL vs OCSP vs OCSP stapling

- **CRL (Certificate Revocation List):** lista firmada y publicada periodicamente por la CA con los seriales revocados — simple, pero puede estar desactualizada entre publicaciones.
- **OCSP (Online Certificate Status Protocol):** consulta en tiempo real el estado de un certificado especifico — mas fresco, pero depende de disponibilidad de red hacia el respondedor OCSP.
- **OCSP stapling:** el propio servidor obtiene y adjunta ("engrapa") la respuesta OCSP firmada, evitando que el cliente tenga que consultar por separado.
- **Cuando la fuente de revocacion no responde:** fail-closed cuando el certificado tiene valor legal (una firma no verificable por indisponibilidad de la fuente de revocacion se trata como NO confiable, P-C3). En escenarios internos sin valor probatorio se puede degradar, pero esa decision se documenta explicitamente, nunca es un default silencioso.

## Ecosistema colombiano

Las entidades de certificacion digital que emiten certificados con valor de firma digital operan bajo acreditacion de ONAC (Organismo Nacional de Acreditacion de Colombia). El catalogo vivo de cuales entidades estan acreditadas y vigentes se consulta en el directorio oficial de ONAC (onac.org.co) en cada diseno — no se cablea una lista de entidades en el standard ni en el codigo, porque la acreditacion cambia en el tiempo.

Tipos de certificado por titular: persona natural, persona juridica (representa a una organizacion) y funcion publica (representa un cargo/rol dentro de una entidad estatal) — cada uno con implicaciones distintas de a quien vincula la firma.

## Ciclo de vida del certificado

Emision -> renovacion (antes del vencimiento, con periodo de solape para no interrumpir operacion) -> revocacion (si el certificado o su llave se ve comprometido, o cambia la relacion con el titular). El monitoreo de vencimientos proximos es una deriva observable que Cipher registra y alerta (capacidad OC en `SKILL.md`), no algo que se descubre cuando el certificado ya vencio.

## CSR y custodia

El CSR (Certificate Signing Request) es la solicitud que contiene la llave PUBLICA y los datos de identidad a certificar. La llave PRIVADA se genera en el mismo dispositivo/servicio donde va a vivir permanentemente (HSM, Key Vault) y jamas sale de ahi: el CSR viaja hacia la entidad de certificacion, la llave privada no (P-C2, P-C8). Un flujo donde la llave privada se genera en un lugar y se "transporta" hacia su custodia final es en si mismo un hallazgo — la generacion fuera del dispositivo de custodia es la excepcion, no la norma.
