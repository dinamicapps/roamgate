# Hotfix Fase 2: Pausa del work activo

Atlas pausa **el work que `work_slug` del archivo de sesion señala** (cuyo modo NO es hotfix — ese caso lo desvio la fase-1 a la fase-4 como frente). NO se pausa "cualquier work EN_PROGRESO en disco": works de otras sesiones no se tocan. Esto previene mezclar la traza del incidente con el work activo y pausar trabajo ajeno.

Pausar el work activo via runtime: `agentos work transition --slug <slug-activo> --a PAUSADO` (ver `gestion/transition.md`). Pasar su slug como `work_pausado` al crear la maestra (fase 3). Lo cognitivo (razon de la pausa) se anota aparte.

Si **no hay work activo de la sesion** (`repo_maneja_works: false`, archivo de sesion ausente, o `work_slug` null/ausente — casos 1 y 2 de la regla de seleccion de fase-1), esta fase se omite por completo, en silencio.

<!-- FUENTE: agent-os/templates/work-record/schema/nucleo.md seccion "Estados del work (campo `Estado` en README.md)". El estado PAUSADO vive alli y lo setea el binario (work transition). La razon de la pausa se anota cognitivamente (entrada de bitacora) y el slug pausado viaja como work_pausado en la maestra del hotfix. NO duplicar el estado PAUSADO -- editar la fuente. -->
<!-- FUENTE: agent-os/templates/work-record/schema/catalogos-y-sesion.md seccion "Control de edicion por sesion (desde 2026-05-21)". Esquema del archivo de sesion (work_slug, repo_maneja_works) vive alli. La regla de seleccion (que work pausar) vive en fase-1-validacion.md. NO duplicar -- editar la fuente. -->
