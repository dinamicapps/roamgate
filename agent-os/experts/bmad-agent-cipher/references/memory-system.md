---
name: memory-system
description: Capacidad OC (observar deriva criptografica) + disciplina del sidecar de memoria de Cipher. Derivas historicas, normas tacitas, puente memoria->estandar.
menu-code: OC
---

# Memoria de Cipher (sidecar de derivas) + [OC]

Ubicacion: `{project-root}/_bmad/memory/cipher-sidecar/`.

## Que guarda la memoria (lo que el estandar escrito NO captura)

| | Estandar escrito (agent-os/standards/security/criptografia/) | Memoria (este sidecar) |
|---|---|---|
| Guarda | La regla que DEBE cumplirse | El hecho observado y su historia |
| Naturaleza | Prescriptivo, versionable, publico | Descriptivo, acumulado, contexto |
| Quien lee | Todo el sistema (carga dinamica E2/E4) | Solo Cipher, al activarse |

Contenido:
- **Derivas observadas:** inconsistencias historicas de la capa criptografica del repo. Ejemplos: "SHA-1 vivo en el modulo X (legacy 2019) vs SHA-256 en el resto", "certificado de firma vence 2026-09-15", "dos formatos de token de activacion conviven".
- **Normas tacitas:** convenciones de facto que nadie escribio pero el codebase respeta (ej. "los tokens de sesion siempre se derivan con el mismo KDF, nunca hash directo").
- **Decisiones de diseno criptografico pasadas** y su razon (coherencia entre works: por que se eligio PAdES B-LTA sobre B-T en un modulo, por que una llave rota anualmente y otra no).

## Estructura del sidecar

- `index.md`: resumen cargado al activar. Lista de derivas abiertas + decisiones pendientes + certificados por vencer.
- `derivas/{nombre}.md`: una deriva por archivo (descripcion, modulos/procesos afectados, genealogia, estado, decision).
- `normas-tacitas.md`: lista de convenciones de facto.
- `retirados.md` / `reconciliados.md`: libros-mayor MAQUINA, gestionados por el runtime (verbos `learn retirar` / `learn reconciliar`). **NO cargan al activar.** El cuerpo activo de Cipher (`normas-tacitas.md` + `derivas/`, clave `estado`) sigue siendo markdown propiedad de la cognicion — cuando una norma/deriva queda superada, es la propia cognicion quien la remueve del cuerpo activo al consolidar; la lapida uniforme va a `retirados.md`, sin logica especial por ser Cipher.
- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto: libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## [OC] — Observar deriva criptografica (protocolo)

Cuando Cipher toca un algoritmo/certificado/formato con inconsistencia tacita:
1. **Registra** la deriva en el sidecar (o actualiza si existia).
2. **Alerta** inline: "Detecto fractura en el hash de integridad: SHA-1 en el modulo X (legacy 2019); SHA-256 en el resto del repo. El tema esta abierto." o "El certificado de firma del modulo Y vence 2026-09-15 — quedan {N} dias."
3. **Propone** norma canonica para el elemento nuevo + opcionalmente promover a estandar escrito. El usuario decide.
4. **Regla dura:** no consolida lo viejo sin autorizacion (brownfield), pero impide que lo nuevo agrande la fractura — ningun diseno/tarea nueva adopta el algoritmo o formato legacy a sabiendas.

## Regla dura de contenido: el sidecar JAMAS almacena material sensible

El sidecar guarda **metadatos** de la deriva (nombres de modulo, fechas de vencimiento, ubicaciones logicas de la llave/certificado, algoritmo observado), nunca el material en si. Prohibido de forma absoluta, sin excepcion de conveniencia:

- Material de llave privada (en claro, cifrado, fragmentado o codificado).
- Secretos (contrasenas, tokens, connection strings) de cualquier ambiente.
- Fragmentos de certificado privado (la clave privada asociada; el certificado publico en si — sin su llave privada — no es sensible y puede citarse por huella/thumbprint).

Esta regla es mas estricta que la de Dexter (que solo evita datos de negocio sensibles): aqui el riesgo de un secreto filtrado en un archivo de memoria markdown es directamente explotable. Cipher que detecta la tentacion de pegar un valor real en la memoria lo sustituye siempre por su metadato (huella, ubicacion, fecha), nunca por el valor.

## Puente memoria -> estandar

Una deriva madura en memoria. Cuando el usuario decide canonizarla, Cipher la promueve a `agent-os/standards/security/criptografia/` via capacidad DT (destilar-standard). A partir de ahi el sistema entero la aplica por carga dinamica. La memoria es donde gestan reglas antes de ser ley.

## Primera vez

Si no existe `_bmad/memory/cipher-sidecar/`, crear la estructura al primer uso con un `index.md` vacio. No bloquear si no existe — degradar graceful.
