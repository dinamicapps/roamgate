---
name: firma-digital
description: Formatos de firma digital de documentos (PAdES/XAdES/CAdES/JWS), niveles ETSI, anatomia CMS y verificacion de interoperabilidad.
---

# Firma digital de documentos

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

## Formatos por tipo de documento

| Formato | Contenedor | Cuando aplica |
|---|---|---|
| PAdES | PDF (firma embebida en el propio PDF) | Documentos PDF con valor legal — el caso mas comun en el ecosistema del repo |
| XAdES | XML | Documentos XML (facturacion electronica, mensajes estructurados con esquema) |
| CAdES | Binario / CMS (RFC 5652, SignedData) | Cualquier contenido binario que no sea PDF ni XML; firma "separada" del documento (detached) o envolvente |
| JWS (JSON Web Signature) | JSON compacto o serializado | Payloads de API, tokens, mensajes entre servicios — NO tiene valor probatorio documental por si solo, es firma de transporte/integridad tecnica |

Regla practica: si el documento tiene que sobrevivir como evidencia ante un tercero (auditoria, litigio, entidad de control), el formato es PAdES/XAdES/CAdES segun el contenedor. JWS es para integridad de mensajes tecnicos, no reemplaza la firma con valor probatorio.

## Niveles ETSI (baseline B-B a B-LTA)

| Nivel | Que agrega | Cuando es suficiente |
|---|---|---|
| B-B (basica) | Firma criptografica + certificado del firmante embebido | Verificacion inmediata, vida corta del documento |
| B-T (+ sello de tiempo) | Estampa cronologica sobre el valor de la firma | Se necesita probar CUANDO se firmo, no solo que se firmo |
| B-LT (+ material de validacion embebido) | CRL/OCSP y cadena de certificacion completa embebidos en el documento, para validar aunque el emisor original ya no este disponible | Documentos con vida legal larga (contratos, actas, expedientes) |
| B-LTA (+ resellado de archivo) | Re-estampado periodico antes de que el algoritmo o el material embebido envejezca | Archivo de muy largo plazo (decadas), custodia documental |

Regla practica: documentos con vida legal larga exigen B-LT o B-LTA. B-B/B-T son insuficientes cuando el documento debe sobrevivir mas alla de la vigencia de los certificados originales.

## Anatomia de una firma CMS/PKCS#7

`SignedData` contiene: el certificado del firmante (y opcionalmente la cadena), el algoritmo de digest, los atributos firmados (`signedAttributes` — incluyen el digest del contenido, el momento de firma declarado, y cualquier atributo adicional que SI queda protegido por la firma) y opcionalmente atributos no firmados (`unsignedAttributes` — tipicamente aqui vive el sello de tiempo RFC 3161 sobre el valor de la firma, que NO esta protegido por la firma misma sino que se valida por su propio mecanismo).

Distincion critica: el digest del CONTENIDO (hash del documento) es distinto del digest FIRMADO (hash de la estructura de atributos firmados, que a su vez incluye el digest del contenido). La firma criptografica se aplica sobre este segundo digest, no directamente sobre el documento.

## Firma visible vs invisible en PDF

- **Visible:** ocupa un campo de firma con representacion grafica (rubrica, sello, texto) en una pagina del PDF.
- **Invisible:** firma criptografica presente en la estructura del PDF sin representacion visual — igualmente valida, solo cambia la UX.
- **Campos de firma:** un PDF puede predefinir campos de firma vacios que distintos firmantes completan en secuencia.
- **Firmas multiples e incrementales:** cada firma adicional sobre un PDF ya firmado se agrega por incremental update (el PDF crece agregando bytes al final, preservando byte a byte las firmas previas) — NUNCA se reescribe el archivo completo, porque eso invalidaria las firmas anteriores.

## Interoperabilidad (P-C6): checklist minimo

P-C6 manda aqui: la validacion propia no demuestra nada — el arbitro es el verificador del tercero. Checklist minimo antes de dar por buena una implementacion:

1. Validar en un verificador PAdES independiente (ej. Adobe Reader) cuando el formato es PDF.
2. Validar con `openssl cms -verify` (o equivalente) cuando el formato es CAdES/CMS.
3. Validar contra un validador ETSI de referencia para confirmar el nivel de baseline alcanzado (B-B/B-T/B-LT/B-LTA).
4. Archivar el artefacto de la prueba (captura, log de salida del validador) como evidencia — sin este artefacto, la interoperabilidad no esta demostrada.

## Errores tipicos

- Firmar el hash equivocado: el digest de la representacion en memoria/serializada en vez del digest del documento final tal como se entrega.
- No incluir la cadena de certificacion completa (falta la intermedia), lo que rompe la validacion en el verificador del tercero aunque funcione en el propio entorno.
- Tratar atributos no firmados como si estuvieran protegidos por la firma — no lo estan; solo lo firmado por `signedAttributes` tiene garantia de integridad de la firma principal.
- Zona horaria del `signingTime`: declarar o interpretar el momento de firma en zona horaria distinta a la esperada por el verificador, generando discrepancias con la estampa de tiempo o con la percepcion de "cuando" se firmo.
