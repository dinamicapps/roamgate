# Etapa 3 — Pre-flight y post-flight de seguridad por tarea

> Tarjeta consultable de Etapa 3. Se carga SOLO para tareas con `capa_seguridad.aplica: true` (no aplica si `permisos_repo_estado` es `no_aplica_por_modo` u `override_usuario`). Movido desde `etapas/etapa-3.md` (Ola 5 T9, doctrina AI-friendly).

## Pre-flight y post-flight de seguridad por tarea (modo normal, incl. legacy evolucion)

Aplica a cada tarea con `capa_seguridad.aplica: true`. No aplica si `permisos_repo_estado` es `no_aplica_por_modo` u `override_usuario`.

### Pre-flight (al iniciar la tarea)

El anfitrion publica con su prefijo el resumen del bloque antes de tocar archivos:

```
A-Amelia: Iniciando T-{NNN}. Capa de seguridad declarada: {N} metodos con
          permiso(s) {codigos}, sesion(es) {sesiones}. Aplicare durante
          la implementacion. Sentinel disponible si surgen dudas.
```

Si el bloque tiene entradas con `naturaleza: modulacion-comportamiento`, mencionarlas explicitamente para distinguir del default de restriccion-acceso.

Si el bloque declara `dominios` conteniendo `cripto`, el anfitrion lo menciona en el pre-flight y anuncia que el cierre exigira el sign-off doble (Sentinel + Cipher).

**Escalamiento pre-código (G5).** Si el bloque `capa_seguridad` está vacío, ausente o contradice lo que la tarea necesita hacer, el anfitrión **escala a Sentinel antes de escribir código** (Sentinel es el dueño del dominio de seguridad — sub-work A/G3); Bob solo se invoca si lo que falta es corrección de scope (volver a E2). No se procede sobre una interpretación propia del bloque deficiente.

### Post-flight (al cerrar la tarea)

El anfitrion verifica:

1. **Por cada entrada con `naturaleza: restriccion-acceso`:** el endpoint/controller declarado tiene en su action: extraccion de sesion + (si `requiere_permiso: true`) chequeo de permiso con codigo declarado. Si la entrada usa atajo grupal (`aplica_a_todos_los_metodos_del_archivo: true`), verificar que todos los metodos publicos del archivo cumplen el patron.
2. **Por cada entrada con `naturaleza: modulacion-comportamiento`:** el metodo BL/service declarado tiene la rama condicional documentada en `modula_que` y consulta el permiso (sin retornar 403; solo cambia comportamiento).
3. **Si la tarea aporta a `permisos_nuevos_a_crear`:** los codigos quedaron persistidos en seccion 4 (catalogo vivo) del standard del repo **en el mismo commit** que el codigo que los introduce.

Si alguno de los 3 chequeos falla, la tarea **no se cierra**. Sentinel revisa, propone fix, anfitrion aplica, se reintenta el post-flight.

**Sign-off de Sentinel (gate de seguridad, G5).** Para tareas con `capa_seguridad.aplica: true`, los 3 chequeos del anfitrión son **necesarios pero no suficientes**: antes de marcar la tarea cerrada, **Sentinel emite el visto bueno autoritativo** de la capa de seguridad (dueño del dominio de seguridad — sub-work A/G3). El anfitrión no auto-cierra la dimensión de seguridad: espera el sign-off de Sentinel. Esto adelanta a E3 una garantía que antes solo se obtenía tarde, en E4 (CS-2).

**Sign-off de Cipher (dominio cripto).** Si el bloque `capa_seguridad` de la tarea declara `dominios` conteniendo `cripto` (firma, estampa, llaves, cifrado, hashing de credenciales), el sign-off de Sentinel NO cubre la dimension criptografica: **Cipher emite un sign-off propio** (capacidad `[SC]`, dueno del dominio cripto) antes del cierre de la tarea, y el ejecutor escala a Cipher pre-codigo cuando el bloque cripto es deficiente (espejo del escalamiento G5 a Sentinel). Ambos sign-offs son independientes y ambos bloquean: la tarea cierra con los dos o no cierra. Si el artefacto es una juntura multi-dominio (credenciales, tokens, interconexion), los veredictos se emiten bajo el Acuerdo de Juntura. <!-- FUENTE del protocolo: agent-os/experts/bmad-agent-cipher/references/juntura-multi-dominio.md seccion "Protocolo (4 reglas)". FUENTE del COMO del veredicto: agent-os/experts/bmad-agent-cipher/references/plan-y-verificar-cripto.md. NO duplicar — para modificar, editar las fuentes. -->

Marcado de inicio/cierre de la tarea en runtime (aplica a TODAS las tareas de E3, no solo las de seguridad): ver `etapas/etapa-3.md` seccion "Marcar inicio y cierre de tarea (runtime, via unica)".
