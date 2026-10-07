---
name: cifrado-y-hashing
description: Cifrado autenticado, TLS, hashing de credenciales e integridad, comparacion en tiempo constante y generacion de tokens aleatorios.
---

# Cifrado y hashing

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

## Cifrado autenticado por defecto

- **Default:** AES-GCM o ChaCha20-Poly1305 — cifran y autentican en una sola construccion, detectando manipulacion del ciphertext.
- **NUNCA ECB** — el modo Electronic Codebook no oculta patrones del texto plano (bloques identicos producen ciphertext identico) y es hallazgo bloqueante en cualquier contexto.
- **CBC solo legado**, y unicamente combinado con un MAC en construccion encrypt-then-MAC (cifrar primero, autenticar el ciphertext despues) — CBC sin autenticacion es vulnerable a ataques de padding oracle.
- **El IV/nonce nunca se repite con la misma llave.** En GCM en particular, reutilizar un nonce con la misma llave es catastrofico: compromete la autenticacion y puede filtrar la llave de autenticacion derivada. Generar el nonce de forma que la unicidad este garantizada (contador, o aleatorio con espacio suficiente para la tasa de uso esperada), nunca reusar ni derivar de datos predecibles.

## En reposo vs en transito

- **En reposo:** TDE (Transparent Data Encryption) o cifrado de disco protege contra robo fisico del medio, pero NO sustituye el cifrado de campo para datos sensibles especificos — un atacante con acceso a la aplicacion o a la base de datos en caliente ve el dato en claro si solo hay TDE.
- **En transito:** TLS 1.2 como piso, 1.3 preferido. La validacion de certificado NUNCA se deshabilita para resolver un error de conexion: un `ServicePointManager` permisivo que acepta cualquier certificado, o un `InsecureSkipVerify: true` (u opcion equivalente en cualquier stack), es hallazgo bloqueante — inutiliza toda la garantia de TLS.

## Hashing de credenciales

KDF (Key Derivation Function) lenta y con sal por registro: Argon2id es la opcion preferida; PBKDF2 y bcrypt son aceptables si sus parametros (iteraciones, memoria, costo) estan vigentes segun guias actuales, no son un valor copiado de un tutorial antiguo. El costo del KDF es configuracion viva, no constante del codigo (P-C5): tiene que poder endurecerse cuando el hardware del atacante mejore, con re-hash progresivo de los registros existentes en el siguiente login. NUNCA MD5, SHA-1 o SHA-256 crudo (sin KDF) para contrasenas — son funciones rapidas, disenadas para velocidad, exactamente lo contrario de lo que se necesita para resistir ataques de fuerza bruta offline.

## Hashing de integridad

Para verificar integridad de datos (no credenciales): SHA-256, SHA-384 o SHA-512. SHA-1 y MD5 estan PROHIBIDOS para cualquier uso de seguridad (colisiones practicas conocidas) — solo son aceptables como checksum declarado explicitamente como no-seguridad (ej. deduplicacion de archivos sin adversario).

## Comparacion en tiempo constante

Comparar MACs, tokens o hashes de credencial con un operador de igualdad estandar (`==`, `Equals`) filtra informacion por temporizacion (cuantos bytes iniciales coinciden se infiere del tiempo de respuesta). Usar siempre la funcion de comparacion en tiempo constante que provea la plataforma (ej. las que integran algoritmos de hash de contrasenas, o una comparacion dedicada de bytes de tiempo fijo) para cualquier secreto que se compara contra un valor recibido de fuera del sistema.

## Tokens aleatorios (activacion, reset, sesion)

Generados con el CSPRNG del sistema (`RandomNumberGenerator` en .NET, `crypto/rand` en Go — nunca un generador pseudoaleatorio de proposito general como `Random`/`math/rand`), con al menos 128 bits de entropia, y codificados de forma segura para URL (base64url o hex, evitando caracteres que rompan el transporte). Estos tokens expiran y son de un solo uso; la validacion del "un solo uso" (invalidar el token tras el primer consumo, detectar reintentos) es dominio compartido con Sentinel — ver la juntura en `./juntura-multi-dominio.md`.
