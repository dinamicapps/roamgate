---
name: gestion-llaves
description: Ciclo de vida de llaves y secretos — custodia, rotacion, separacion por ambiente, roles de acceso y auditoria.
---

# Gestion de llaves y secretos

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo conocimiento del subdominio. NO duplicar los principios — para modificar, editar la fuente. -->

## Ciclo de vida completo (P-C2)

El ciclo de vida completo (P-C2) tiene seis etapas que deben quedar resueltas antes de cualquier cierre:

1. **Generacion:** con entropia adecuada (CSPRNG, nunca semillas debiles), directamente en el dispositivo de custodia — no se genera en un lugar y se mueve a otro.
2. **Custodia:** HSM, Azure Key Vault, AWS KMS u equivalente. Jerarquia KEK/DEK: una Key Encryption Key protegida en el HSM/KMS cifra las Data Encryption Keys que a su vez cifran los datos — la DEK puede rotar sin re-cifrar todo el volumen de datos, solo re-envolviendola con la KEK vigente.
3. **Uso:** principio de proposito unico — una llave, un uso (una llave de firma no cifra datos, una llave de TLS no firma documentos). Mezclar usos amplia el radio de dano de cualquier compromiso.
4. **Rotacion:** calendario regular (ej. anual) mas procedimiento de rotacion de emergencia ante sospecha de compromiso, ambos definidos ANTES de que se necesiten.
5. **Revocacion:** cuando la llave o su certificado asociado deja de ser confiable.
6. **Destruccion:** eliminacion verificable del material cuando ya no tiene uso ni obligacion de retencion.

## Donde NO vive una llave / donde SI

**NO:** codigo fuente, `appsettings`/`web.config` en texto plano, variables de entorno commiteadas al control de versiones, logs de aplicacion, work-records, tickets de soporte, mensajes de chat (regla dura de P-C2; sin excepciones de conveniencia).

**SI:** HSM/KMS/Key Vault con acceso controlado por identidad (no por secreto compartido) y auditoria de cada operacion; para desarrollo local, mecanismos de plataforma como DPAPI (Windows) o keychain del sistema operativo — nunca el mismo material que produccion.

## Separacion por ambiente

Las llaves de produccion NUNCA se comparten con staging o desarrollo. El material de prueba se marca explicitamente como tal (nombres, metadatos, o ambos) para que nadie lo confunda con material productivo ni intente promoverlo sin pasar por generacion propia del ambiente destino.

## Secretos de aplicacion vs llaves criptograficas

Connection strings, API keys y tokens de terceros siguen la misma disciplina de custodia (gestor de secretos + rotacion), pero son conceptualmente distintos de una llave criptografica: el secreto de aplicacion es ROTABLE de forma simple (se genera uno nuevo y se reemplaza), mientras que la llave criptografica implica una CEREMONIA (impacto en material ya firmado/cifrado con la llave anterior, coordinacion de migracion). No tratar ambos con el mismo procedimiento operativo solo porque ambos son "secretos".

## Acceso: uso vs administracion

Quien puede USAR la llave (firmar/cifrar con ella en una operacion puntual) y quien puede ADMINISTRARLA (rotarla, exportarla, cambiar sus politicas) son roles distintos y no deben coincidir por default. La exportabilidad del material (poder sacarlo del HSM/KMS en claro) esta deshabilitada salvo decision documentada y justificada — el default seguro es que la llave nunca sale del dispositivo de custodia.

## Auditoria

Toda operacion de firma o cifrado con una llave de produccion deja rastro: quien la invoco, cuando, sobre que documento/operacion — sin volcar el material sensible ni el contenido protegido al log. La ausencia de este rastro es en si misma un hallazgo, independientemente de si la operacion criptografica fue correcta.
