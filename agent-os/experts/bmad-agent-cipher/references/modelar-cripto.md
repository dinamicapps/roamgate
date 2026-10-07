---
name: modelar-cripto
description: Capacidad MC (modelar la capa criptografica en /disenar) + sello anti-evasion. Como Cipher conduce el pre-diseno criptografico y produce criptografia.md.
menu-code: MC
---

# Modelar la capa criptografica ([MC])

> Conduce el step de pre-diseno criptografico en /disenar (cuando el diseno tiene dimension criptografica). Produce `agent-os/disenos/{slug}/criptografia.md`.

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo la mecanica de la capacidad. NO duplicar los principios — para modificar, editar la fuente. -->

## Mision

Producir `criptografia.md` cuando el diseno tiene alguna operacion criptografica: firmar, estampar, cifrar o hashear algo, en cualquier proceso del diseno. La confianza del documento resultante no se hereda por default — se modela antes de escribir la primera linea de codigo.

## Secciones del artefacto

1. **Inventario de operaciones criptograficas del diseno.** Por proceso: que se firma, que se estampa, que se cifra, que se hashea. Cita el proceso de origen (nombre del proceso en el diseno, no una operacion suelta sin dueno).
2. **Decisiones por operacion.** Para cada operacion del inventario:
   - Formato y nivel de firma (ej. PAdES B-LTA; ver `./firma-digital.md`).
   - Proveedor de estampa cronologica (TSA) y su acreditacion vigente (ver `./marco-normativo.md` seccion ONAC).
   - Algoritmos y parametros exactos, con version de esquema declarada (P-C5) — nunca un nombre de algoritmo sin sus parametros (tamano de llave, modo de operacion, iteraciones de KDF).
   - Topologia de custodia de llaves: donde vive cada llave (HSM/KMS/Key Vault), quien tiene acceso de uso vs de administracion, plan de rotacion (ver `./gestion-llaves.md`).
   - Cadena de confianza esperada: hasta que raiz debe validar, que CRL/OCSP se consulta.
3. **Valor probatorio declarado por documento (P-C4).** Cada documento firmado/estampado declara explicitamente en cual escalon de la escala de `./marco-normativo.md` (firma electronica simple / confiable / firma digital con certificado acreditado) queda, y por que ese escalon es suficiente para el riesgo del documento.
4. **Matriz operacion-llave.** Tabla que cruza cada proceso/operacion con la llave que usa y el proposito unico de esa llave (una llave, un uso — corolario de P-C2). Sirve para detectar reuso indebido de una misma llave entre operaciones de proposito distinto.
5. **Derivas observadas.** Lo que Cipher detecto al leer el codebase/certificados/config reales (P-C7) que no coincide con lo que el diseno asume: algoritmo legacy vivo, certificado por vencer, formato de token duplicado. Ver `./memory-system.md` para el registro persistente.

## Sello anti-evasion (espejo de P-D3 de Dexter)

Antes de cerrar el step, Cipher ejecuta un chequeo explicito sobre `criptografia.md` y rechaza cualquiera de estas senales:

- Lenguaje de decision diferida: "alli veremos", "TBD", "por definir", "pendiente", "luego se decide el proveedor" (o equivalentes).
- Algoritmo mencionado sin parametros (nombre solo, sin tamano de llave/modo/iteraciones).
- Llave mencionada sin custodia resuelta (sin HSM/KMS declarado, sin plan de rotacion).
- Operacion de firma/estampa sin valor probatorio declarado (seccion 3 incompleta para esa operacion).

Si se encuentra alguna de estas senales, **el gate NO cierra**: es un hallazgo bloqueante de meta que dispara reevaluacion (protocolo del huevo), no un veto informal que Cipher resuelve solo con una nota. Solo cuando el chequeo queda limpio, Cipher setea `confianza_resuelta: true` en el frontmatter.

## Rama: el diseno no tiene operacion criptografica (no-aplica-sin-cripto)

<!-- FUENTE: agent-os/skills/disenar/modo-inicial/step-03b-pre-diseno-cripto.md seccion "Activacion (gate de entrada)". Los DOS caminos --Mary omitiendo el step sin artefacto, y Cipher declarando con evidencia-- y cual satisface la entrada del handoff viven alli. Aqui solo el COMO del segundo, cuando Cipher ya se activo. NO duplicar la regla — para modificar, editar la fuente. -->

Esta es la rama **del camino 2**: Cipher ya se activo. (Si el gate de entrada nunca lo
activo, la declaracion va en bitacora y no se instancia artefacto — ver la fuente de arriba.)

Si tras revisar el diseno Cipher determina que **ninguna** operacion criptografica aplica (ningun proceso firma, estampa, cifra ni hashea nada de valor probatorio o de secreto), usa esta rama en lugar del modelado completo. Espejo de la rama `no-aplica-sin-datos` de Dexter: es una declaracion positiva con evidencia, no una evasion.

1. Declara al usuario que **busco** operaciones criptograficas y no las hay, citando que reviso (procesos del diseno, contrato de API si existe, campos sensibles del modelo de datos).
2. Instancia `criptografia.md` con la declaracion y la evidencia de que reviso, sin inventario de operaciones ni matriz operacion-llave.
3. Cierra con `confianza_resuelta: true` y la declaracion positiva registrada en el artefacto.

Si Cipher **no puede probar** que no hay impacto (duda razonable, proceso sin especificar del todo), NO usa esta rama: modela normalmente hasta resolver la duda.

## Instanciacion via runtime

`criptografia.md` se instancia con el file_type `diseno-cripto` (schema: `diseno_slug`, `brief_version`, `confianza_resuelta`, `dominios_tocados` opcional, `derivas_observadas` opcional), mismo patron del step de persistencia de Dexter: cuerpo multilinea con `Write` a un temporal, invocacion con `--body-file`.

```bash
# 1) Escribir el cuerpo con Write a un temporal:
#    Write tool -> .tmp-body.md con el inventario + decisiones + matriz operacion-llave
# 2) Invocar con --body-file (sin contenido en el JSON):
echo '{
  "diseno_slug": "{slug}",
  "ruta_relativa": "criptografia.md",
  "file_type": "diseno-cripto",
  "frontmatter": {
    "diseno_slug": "{slug}",
    "brief_version": 1,
    "confianza_resuelta": false,
    "dominios_tocados": [],
    "derivas_observadas": []
  }
}' | agentos diseno file create --body-file .tmp-body.md
# 3) rm .tmp-body.md
```

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Operacion de work-records via runtime (doctrina)". Idiom --body-file para cuerpos multilinea. NO duplicar — para modificar, editar la fuente. -->

Tras instanciar, Cipher llena cada seccion y solo entonces corre el sello anti-evasion para pasar `confianza_resuelta` a `true`.
