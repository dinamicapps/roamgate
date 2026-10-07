# Disciplina de participante en sesiones bridge

> Fuente unica del **cierre por archivado** (seccion 2) que todo participante (director o
> colaborador) de un grupo bridge aplica, graduado por autonomia. `SKILL.md`,
> `fase-7-work-colaborador.md` y el gobierno de Alfred apuntan aqui para esa disciplina; no
> la duplican. El **cuidado de contexto** (seccion 1) es general del sistema y su fuente
> vive en `host-protocol/SKILL.md`; aqui solo se documenta el matiz propio del bridge.

## 1. Cuidado de contexto

Las sesiones bridge intercambian muchos mensajes y inflan el contexto mas rapido que un work
normal. La disciplina que aplica es la **general del sistema**, sin variacion propia del bridge.

**Matiz del bridge:** ademas de la bitacora de la etapa/pieza, el checkpoint incluye el estado
de la sesion bridge (operacion en curso, respuestas pendientes, estado del grupo). Reusa la
resumibilidad existente (re-join de Fase 1).

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Higiene de contexto". La senal (`agentos telemetry get`), el invariante de reset sin perdida, las fronteras y la matriz por nivel viven alli. Aqui solo se documenta el matiz del bridge (que va dentro del checkpoint). NO duplicar la regla — para modificar, editar la fuente. -->

## 2. Cierre por archivado

Cuando el director archiva el grupo (`bridge_archivar_grupo`), cada participante (incluido
el director en su lado), ANTES de confirmar limpieza:
1. **Documentar** el work actual. Lo conduce el anfitrion de la etapa segun su ritual de
   cierre (Quinn en E4, Atlas en fix, etc.); esta disciplina delega, no reinventa.
2. **Commit (local)** de todo lo realizado, como red de seguridad. Respeta git-flow (rama
   de feature, no `main` directo). El **push permanece gated al usuario**; toda fusion se hace
   en **local** (invariante git del ciclo). Instancias con origen launcher: este paso se cumple
   con el protocolo de cierre del ciclo worktree (commit en `work/{slug}` + merge a default +
   limpieza aprobada).
   <!-- FUENTE: agent-os/skills/bridge-session/references/ciclo-worktree.md seccion "Cierre — 3 pasos en orden estricto" (incl. el Invariante git del Paso 2). Aqui solo se nombra el invariante y su aplicacion al cierre; la regla completa (verbos remotos permitidos, comando de fusion vetado) vive en la fuente. NO duplicar -- editar la fuente. -->
3. **Decidir compactar vs limpiar** segun necesidad y autonomia (ver matriz): mas trabajo
   en la misma sesion → compactar (preserva hilo); work cerrado y commiteado → limpiar.

Enriquece "Cierre obligatorio de grupo" (SKILL.md), el cierre del colaborador
(`fase-7-work-colaborador.md`) y el gate de `/alfred grupo archivar`.

## 3. Matriz de variacion por autonomia

<!-- FUENTE: agent-os/skills/host-protocol/SKILL.md seccion "Higiene de contexto" (sub-seccion "Matriz por nivel"). NO duplicar la regla — para modificar, editar la fuente. -->

La matriz que gradua checkpoint / documentar+commit / compactar / limpiar por `nivel` es la
general del sistema. **Lo unico invariante del bridge:** documentar + commit al archivar el
grupo son **obligatorios en los tres niveles** (ver seccion 2) — no son una recomendacion
graduable, son la red de seguridad del cierre.
