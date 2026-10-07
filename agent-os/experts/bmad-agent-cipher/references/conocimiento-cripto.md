---
name: conocimiento-cripto
description: Base de conocimiento criptografico de fondo de Cipher — vocabulario, mapa de subdominios, errores frecuentes. Se carga siempre al activar.
---

# Conocimiento base de Cipher

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

Este archivo es contexto permanente (carga en On Activation, paso 2b). El resto de la base de conocimiento se carga selectivamente por subdominio — mantener este archivo corto es una obligacion de diseno, no una preferencia.

## Mapa de subdominios

| Subdominio | Archivo | Senal tipica que dispara la carga |
|---|---|---|
| Firma de documentos | `./firma-digital.md` | PAdES/XAdES/CAdES, PKCS#7/CMS, firmar un PDF/XML, nivel B-B/B-T/B-LT/B-LTA |
| Evidencia temporal | `./estampa-tiempo.md` | RFC 3161, TSA, sello de tiempo, fecha cierta, B-T |
| Identidad y confianza | `./pki-certificados.md` | X.509, cadena de confianza, CRL/OCSP, entidad de certificacion, CSR |
| Ciclo de vida de llaves | `./gestion-llaves.md` | HSM, KMS, Key Vault, rotacion, custodia, secreto/API key |
| Cifrado y hashing | `./cifrado-y-hashing.md` | AES/TLS, hash de contrasenas, KDF, token aleatorio, comparacion de secretos |
| Marco legal | `./marco-normativo.md` | Valor probatorio, Ley 527, Decreto 2364, ONAC, jurisdiccion distinta a Colombia |
| Juntura con otro dominio | `./juntura-multi-dominio.md` | El artefacto toca ademas credenciales/tokens de Sentinel o persistencia de Dexter |

## Vocabulario minimo compartido

- **Firma vs cifrado vs hash vs MAC.** Firma: prueba autoria e integridad — se produce con la llave privada y cualquiera con la llave publica puede verificarla. Cifrado: oculta el contenido, es reversible con la llave correcta (simetrica o privada). Hash: funcion de una via, no reversible, prueba integridad pero no autoria (cualquiera puede recalcularlo). MAC (o HMAC): hash con llave secreta compartida, prueba integridad Y que quien lo genero conocia el secreto — no es firma porque no hay par publico/privado, no distingue quien entre los tenedores del secreto.
- **Simetrico vs asimetrico.** Simetrico: una sola llave cifra y descifra (AES) — rapido, el problema es distribuir la llave. Asimetrico: par publico/privado (RSA, ECDSA/EdDSA) — la llave publica cifra o verifica, la privada descifra o firma; mas lento, resuelve distribucion. En la practica ambos se combinan: asimetrico para intercambiar una llave de sesion, simetrico para el volumen de datos.
- **Certificado vs llave.** La llave (privada/publica) es el material matematico. El certificado (X.509) es un documento firmado por un tercero (entidad de certificacion) que ata una llave publica a una identidad durante un periodo de validez. Una llave sin certificado no prueba identidad; un certificado vencido o revocado invalida el uso de la llave que contiene, no la matematica.
- **Firma electronica vs firma digital (distincion legal colombiana).** Firma electronica es el genero: cualquier metodo que identifique al firmante y vincule su voluntad al mensaje (desde un checkbox hasta un OTP). Firma digital es una especie de firma electronica: usa criptografia asimetrica con certificado emitido por una entidad de certificacion acreditada, lo que le da presuncion de confiabilidad reforzada. Detalle normativo completo en `./marco-normativo.md`.

## Los 5 errores de implementacion mas frecuentes

Cipher los busca primero, antes de revisar cualquier otra cosa:

1. **Llave o secreto en codigo o config plana** — commiteado, en appsettings/web.config sin cifrar, en variable de entorno versionada.
2. **Verificacion que se traga el error (fail-open)** — una excepcion de validacion de firma/certificado/estampa que cae a un catch generico y el flujo continua como si hubiera validado.
3. **Algoritmo o tamano cableado sin version de esquema** — el formato persistido no declara que algoritmo/parametros se usaron, imposibilitando rotacion sin migracion masiva.
4. **Hash sin sal o con algoritmo rapido para credenciales** — SHA-256/MD5 crudo sobre una contrasena, o KDF sin sal por registro.
5. **Comparacion de secretos no constante en tiempo** — `==` o `Equals` sobre un HMAC/token/hash de credencial, vulnerable a timing attack.

## Regla de oro de seleccion (P-C1)

Si hay que elegir un primitivo o esquema, se elige la construccion COMPLETA recomendada por el estandar aplicable (ej. AES-GCM completo, no AES-CBC + HMAC armado a mano; PAdES-B-LT completo, no CMS a medida). Nunca se arma la propia combinacion de primitivos, aunque cada primitivo individual sea solido. Detalle de la regla en `SKILL.md` (P-C1).
