---
slug: 20261013-instalador-todo-en-uno
autor: julio-diaz
autor_kebab: julio-diaz
fecha_inicio: "2026-10-13"
fecha_fin: "2026-10-13"
estado: COMPLETADO
modo: normal
nivel: normal
tipo: feature
version_sistema: "2"
proveedor_ia: claude
ruta: acotado
abordaje:
  realizado_en: "2026-10-13"
  expertos_invitados: []
  party_mode: false
  ruta_propuesta: acotado
  ruta_aprobada: acotado
meta: "En un PC Windows con el clon de dinamicapps/roamgate-dist, un dev ejecuta .\\install.ps1 (con -Port/-Host opcionales) y queda: Herdr instalado (herdr.dev si faltaba) y corriendo como tarea por usuario; Roamgate 0.7.15-dinamicapps.4 corriendo como tarea por usuario en la IP de Tailscale (o la indicada) y el puerto elegido, con contrasena valida en %APPDATA%\\roamgate\\roamgate.env y sin chequeo de updates del upstream; ambas tareas sin ventana visible y arrancando al iniciar sesion. Re-ejecutar install.ps1 tras git pull actualiza deteniendo y re-arrancando la tarea. -SinServicio conserva el modo manual con roamgate.cmd."
meta_definida_en: "2026-10-13"
cosecha:
  memoria_expertos:
    ejecutado: true
    fecha: "2026-10-13"
    por: julio-diaz
    reflexion_depositada: true
    reflexiones_por_agente: 1
---
# Work: Instalador todo-en-uno del dist Windows

> Estado: **EN_PROGRESO** · Ruta: acotado · Modo: normal · Nivel: normal · 2026-10-13

## Objetivo

Que install.ps1 del dist Windows de Roamgate deje todo listo de una vez: verifica o instala Herdr desde el canal oficial, registra el arranque automatico de Herdr y de Roamgate como tareas por usuario (sin ventana, via conhost --headless) y actualiza sin abortar cuando la tarea esta corriendo.

## Abordaje (2026-10-13)

Evidencia:

1. **El arranque automatico ya existe en el server.**
   - `roamgate.exe service install` registra la tarea por usuario `dev.roamgate-<hash>`, AtLogOn, Interactive, Limited, RestartCount 999 (`server/src/config/service-definitions.ts:150-171`).
   - Ejecuta `<exe> service run %APPDATA%\roamgate\roamgate.env`; la plantilla del .env es `HOST=0.0.0.0`, `PORT=8787` (`service-definitions.ts:17-36`).
   - Valida contrasena y puerto antes de tocar nada (`server/src/service/service-manager.ts:367-397`). Exige `--force` si la tarea no la genero Roamgate (`service-manager.ts:640-654`).
2. **Herdr tambien tiene setup.** `roamgate.exe herdr setup` (`server/src/herdr/bootstrap.ts:126-180`):
   - instala Herdr 0.9.0 fijado en `%APPDATA%\roamgate\herdr\` si no hay binario (`server/src/herdr/release.ts:14-15,73-81`);
   - si hay herdr en el PATH, usa ese (`bootstrap.ts:74-89`);
   - registra la tarea `dev.roamgate.herdr-<hash>` con `herdr.exe server` directo (`server/src/herdr/service.ts:149-170`).
3. **Un servicio de Windows clasico no sirve.** El pipe de Herdr se deriva de `%APPDATA%` (`server/src/config/server-config.ts:337-360`) y las terminales ConPTY necesitan la sesion del usuario.
4. **El dist actual (`scripts/instalador/install.ps1`) no hace nada de esto.**
   - Solo avisa si no hay herdr en el PATH (l.114-120) y si la contrasena es corta (l.128-133).
   - Aborta si roamgate.exe esta vivo desde la carpeta del dist (l.153-172).
   - `roamgate.cmd` arranca en primer plano en la IP de Tailscale.
5. **Canal oficial de Herdr.** `https://herdr.dev/install.ps1` lee `latest.json` (hoy 0.9.3, protocolo 22) y verifica SHA-256. Instala en `~\.herdr\packages\standalone` y agrega la carpeta de la version al PATH de usuario.
6. **En esta maquina la tarea de Herdr fue editada a mano.**
   - `dev.roamgate.herdr-82e89b83b57e2645` corre `conhost.exe --headless herdr.exe server`; el respaldo esta en `~\.herdr\task-backup-*.xml`.
   - La plantilla del repo no lleva conhost.
7. **Updates del upstream.** El updater interno apunta a upstream (`server/src/http/update.ts:41-42`, FM-19); `ROAMGATE_DISABLE_UPDATE_CHECK=1` lo apaga (`update.ts:423`).

Decisiones del usuario:

- Ruta acotado.
- Herdr faltante se instala desde el canal oficial herdr.dev, y luego `roamgate herdr setup` solo registra la tarea.
- `conhost --headless` pasa a la plantilla del repo (tareas de Herdr y Roamgate), con build y dist .4.

Fuera de alcance: servicio de Windows clasico, install.sh (macOS/Linux) y el resto de FM-19.

Riesgo: verificar sobre esta maquina toca las tareas reales del usuario (Herdr de AURORA y EME_DCOM). Requiere respaldo y restauracion; el v0.7.8 del 8787 no es tarea y no se toca.

## Terreno

<!-- modelo:start vista=terreno -->
_(pendiente: lo escribe `agentos work terreno`)_
<!-- modelo:end -->

## Decisiones clave

| Fecha | Etapa | Decision | Resolucion |
|-------|-------|----------|------------|
| 2026-10-13 | abordaje | Herdr faltante desde canal oficial herdr.dev | Usuario |
| 2026-10-13 | abordaje | conhost --headless en las plantillas de tarea del repo | Usuario |
| 2026-10-13 | plan | Tarea programada por usuario, no servicio de Windows (D1); D2-D10 en 03-plan.md | Bob |

## Tareas

| T | Titulo | Status | Verif | Tags |
|---|--------|--------|-------|------|
| T-001 | Tareas de Herdr y Roamgate sin ventana | done | PASS | server |
| T-002 | herdr setup registra el autostart de un Herdr ya vivo | done | PASS | server |
| T-003 | install.ps1 todo en uno | done | PASS | instalador |
| T-004 | README del dist todo en uno | done | PASS | docs |
| T-005 | Version .4, dist local y verificacion en esta maquina | done | PASS | dist |

## Iteraciones

| # | Fecha | Accion | Desde etapa | Hacia etapa | Razon |
|---|-------|--------|-------------|-------------|-------|

## Pausas

| Fecha inicio | Etapa | Razon | Fecha reanudacion |
|--------------|-------|-------|--------------------|

## Archivos modificados

- server/src/config/service-definitions.ts
- server/src/config/service-manager.ts
- server/src/config/service-manager.test.ts
- server/src/herdr/service.ts
- server/src/herdr/service.test.ts
- server/src/herdr/bootstrap.ts
- server/src/herdr/bootstrap.test.ts
- server/src/herdr/cli.ts
- scripts/instalador/install.ps1
- scripts/instalador/README.md
- package.json
- server/package.json
- web/package.json
- herdr-plugin.toml
- bun.lock
- agent-os/post-works/_pendientes.md

## Cierre

COMPLETADO el 2026-10-13. Meta cumplida: 8/8 CAs en PASS (etapa-4/07-verificacion.md).

Flujo de trabajo (P7): despliegue interno del fork. El repo fuente publica con `scripts/publicar-dist.ts` al espejo `dinamicapps/roamgate-dist`; ahi el dev hace `git pull` + `.\install.ps1`, que ahora deja Herdr y Roamgate corriendo como tareas del usuario. No hay epica vinculada.

Lo entregado:
- **Tareas sin ventana.** Las tareas de Windows corren con `conhost --headless` (`server/src/config/service-definitions.ts:153`).
- **Detener detiene de verdad.** `endWindowsTask` termina el programa hospedado (`server/src/config/service-manager.ts:237`), y service install detiene la tarea antes de reemplazar su definicion (`server/src/config/service-manager.ts:742`).
- **Autostart de un Herdr ya vivo.** `herdr setup` registra su tarea sin reiniciarlo (`server/src/herdr/service.ts:282`, `server/src/herdr/bootstrap.ts:161`).
- **install.ps1 todo en uno:**
  - parametros validados al inicio (`scripts/instalador/install.ps1:170`);
  - Herdr desde herdr.dev (`scripts/instalador/install.ps1:217`);
  - actualizacion con la tarea viva (`scripts/instalador/install.ps1:278`);
  - variables de socket de un pane de Herdr (`scripts/instalador/install.ps1:488`).

Publicado:
- dev: 134cc84 y 7eea2c9, pusheados.
- Dist: `dinamicapps/roamgate-dist` main 351f7f6 + tag `roamgate-v0.7.15-dinamicapps.4`, pusheados.
- En esta maquina: tarea `dev.roamgate-82e89b83b57e2645` en 100.82.222.117:8789.

Pendientes (rumbo 2, en post-works):
- FM-27: logs de la tarea.
- FM-28: guard de socket de herdr setup.
- FM-29: `defaultSocketPath` en Windows.
- FM-30: 21 fallas de pruebas Windows preexistentes.

Sin verificar en vivo: el arranque tras un nuevo inicio de sesion (trigger AtLogOn comprobado en la definicion) y la instalacion en el otro PC sin Herdr (cubierta por el escenario aislado e).
