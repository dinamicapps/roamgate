---
name: plan-y-verificar-cripto
description: Capacidad PC (plan criptografico en E2), SC (sign-off criptografico en E3) y VF (verificacion CR-N en E4). Como Cipher co-disena, firma y audita la dimension criptografica bajo el gobernador (/alfred).
menu-code: PC
---

# Plan criptografico ([PC]), Sign-off ([SC]) y Verificacion CR-N ([VF])

> Aplica los principios P-C1..P-C8 (fuente unica en SKILL.md). Schema de `capa_seguridad.dominios`: campo `dominios` opcional con valor `cripto`.

<!-- FUENTE de los principios P-C1..P-C8: agent-os/experts/bmad-agent-cipher/SKILL.md seccion "Principles". Aqui solo la mecanica de las capacidades. NO duplicar los principios — para modificar, editar la fuente. -->

## [PC] — Plan criptografico en E2

Cipher es invitado obligatorio a E2 cuando el brief tiene `criptografia.md` con operaciones declaradas, o cuando alguna tarea materializada por Bob toca firma, estampa, llaves, cifrado o hashing de credenciales.

Por cada tarea cuyo alcance toque una de esas superficies, Cipher revisa el bloque `capa_seguridad` co-disenado por Bob y exige:

1. `capa_seguridad.dominios: ["cripto"]` (o el arreglo que incluya `cripto` junto a otros dominios tocados).
2. Que el bloque declare la operacion criptografica en si: que primitivo se usa, que llave, que verificacion corre al final (no basta con nombrar la tarea "firmar documento" — el bloque debe decir CON QUE primitivo, CON QUE llave, y COMO se verifica el resultado).

Cipher co-disena el bloque con Bob — asistencia analoga a la de Sentinel con `capa_seguridad` de permisos: no es un revisor tardio, participa en la redaccion del bloque antes de que la tarea quede materializada.

**Senal de drift (canonica #12).** <!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Las 12 senales de drift" (senal 12). NO duplicar la senal -- para modificar, editar la fuente. -->

## [SC] — Sign-off criptografico en E3

Para toda tarea con `capa_seguridad.dominios` conteniendo `cripto`, el post-flight del ejecutor **no basta**: Cipher emite el sign-off autoritativo de la dimension criptografica antes de que la tarea cierre.

- **Pre-flight:** Cipher lee el bloque declarado y anticipa el patron del standard del repo (`agent-os/standards/security/criptografia/`) que la tarea deberia seguir.
- **Escalamiento pre-codigo:** si el bloque es deficiente (dominios declarado pero sin primitivo/llave/verificacion resueltos), el ejecutor escala a Cipher ANTES de escribir codigo. No se procede sobre una interpretacion propia del bloque incompleto.
- **Sign-off antes del cierre**, verificando:
  - Primitivo estandar y parametrizado (P-C1/P-C5): libreria auditada, sin esquema casero, con parametros explicitos.
  - Llave con custodia declarada y sin material en codigo/config/logs (P-C2): grep de patrones de material sensible sobre los archivos que la tarea toco.
  - Toda verificacion es fail-closed (P-C3): ningun camino de error de verificacion continua el flujo como si hubiera validado.
  - Comparaciones de secretos (hash de contrasena, HMAC, token) en tiempo constante — nunca `==` directo sobre el valor en claro derivado.

<!-- FUENTE: agent-os/skills/host-protocol/etapas/etapa-3/capa-seguridad.md. El gate de pre-flight/post-flight/sign-off vive alla (mecanica general de capa_seguridad); aqui vive el COMO del veredicto criptografico especifico. NO duplicar el gate — para modificar el gate, editar la fuente. -->

## [VF] — Verificacion en E4: auditoria CR-N

Quinn coordina E4; Cipher produce la evidencia criptografica. Checklist estilo CD-N/CS-N/EV-N: cada chequeo tiene un artefacto verificable, no una afirmacion en prosa. Evidencia bajo `etapa-4/evidencia/cripto/`.

| Chequeo | Que audita | Artefacto |
|---------|------------|-----------|
| **CR-1 Interoperabilidad** | La firma valida en el verificador independiente aplicable (P-C6): Adobe Reader/validador ETSI para PAdES, openssl para CMS/X.509, segun el tipo de documento. | Salida del validador (captura o log) por tipo de documento. |
| **CR-2 Estampa** | El TSR (respuesta de estampa) verifica: firma de la TSA valida, EKU `timeStamping` presente, el hash del TSR coincide con el hash del documento estampado. | Log de verificacion del TSR. |
| **CR-3 Cadena** | La cadena de certificados completa valida hasta la raiz esperada, con la revocacion (CRL/OCSP) consultada y sin resultado revocado. | Salida de la validacion de cadena. |
| **CR-4 Custodia** | Las llaves viven donde `criptografia.md` (o el plan de la tarea) declaro; ningun material de llave o secreto nuevo aparece en codigo, config plana o log. | Resultado del barrido (grep de patrones de material sensible sobre los archivos tocados por la tarea). |
| **CR-5 Fail-closed** | Los caminos de error de verificacion niegan (verificacion falla o es indeterminada = no confiable), demostrado con test o inspeccion de rama. | Evidencia de la rama de rechazo ejercitada (test que la dispara, o cita archivo:linea con el codigo de la rama). |
| **CR-6 Parametrizacion** | Algoritmos, tamanos de llave e iteraciones se leen de config versionada, no estan cableados en el codigo. | Cita archivo:linea de la config que fija el parametro. |

### Regla de cierre

CR-1 a CR-5 fallidos son **bloqueantes**: el work no cierra hasta resolverlos. CR-6 fallido tambien es bloqueante, **salvo** descarte deliberado del usuario registrado con `[OVERRIDE]` en la bitacora de E4 (mismo patron de descarte deliberado de EV-N: sin el marcador, la falta de artefacto es brecha bloqueante).

### Resolucion de fallos CR-N

Un CR-N fallido en E4 se trata como hallazgo bloqueante de la verificacion:

1. Cipher documenta el fallo con evidencia (que verificador/chequeo fallo, artefacto) en `etapa-4/evidencia/cripto/`.
2. Quinn detiene la verificacion y dispara la reevaluacion del flujo (camino (b): regreso a E3 con scope acotado a la correccion) — no se "anota como deuda" un fallo criptografico: P-C3 aplica al proceso mismo.
3. El ejecutor corrige con Cipher en acompanamiento (escalamiento pre-codigo si el bloque `capa_seguridad` resulto deficiente).
4. Cipher re-ejecuta el chequeo fallido (y los dependientes: un CR-3 de cadena invalida re-ejecuta CR-1); el resultado nuevo REEMPLAZA al fallido en la evidencia, con nota de la iteracion.
5. Excepcion unica: descarte deliberado del usuario registrado (`evidencia_requerida.descartes[]` eje `cripto` + `[OVERRIDE]` en bitacora), que exime el guard `CR_SIN_RESULTADO`.

### Verificacion proporcional (espejo del principio de Sentinel)

Si el mecanismo nuevo reduce a un precedente identico ya verificado en el mismo repo (misma libreria, mismo patron de firma/estampa, config sin tocar), la revision estructural del codigo basta: no repetir la prueba de interoperabilidad (CR-1) ya probada para ese mismo patron. La proporcionalidad no exime CR-4 (custodia) ni CR-5 (fail-closed) por precedente — esos se verifican siempre porque dependen de la instancia concreta de llaves y ramas de error de la tarea, no del patron de libreria.
