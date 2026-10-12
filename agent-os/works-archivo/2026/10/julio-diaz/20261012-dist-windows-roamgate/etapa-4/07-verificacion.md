---
completedAt: "2026-10-12"
file_type: verificacion-etapa-4
inputDocuments:
  - ../etapa-2/03-plan.md
status: approved
---
# Verificacion - Etapa 4

**Anfitrion**: Quinn
**Fecha**: 2026-10-12

Dist publicado en dinamicapps/roamgate-dist (tags roamgate-v0.7.15-dinamicapps.1 y .2) e instalado y arrancado desde E:\DinamicAPPS\roamgate-dist en esta maquina. La verificacion local destapo que la contrasena de 12 caracteres del usuario no sirve para esta version; se resolvio con una contrasena generada para el proceso y un aviso en el instalador (T-005). Veredicto: meta cumplida, 7/7 CAs en PASS.

## Resumen ejecutivo

| Criterio | Resultado |
|----------|-----------|
| Meta cumplida | SI |
| CAs declarados | 7/7 PASS |
| Smoke + suite automatizada | PASS (publicar-dist.test.ts 19/0; build web dentro de presupuesto; pruebas de version sin fallas nuevas) |
| Auditoria capa de seguridad | N/A (sin endpoints; la contrasena generada no se guarda en el repo) |
| Auditoria de evidencia (EV-N) | PASS (CA-06-despues.png) |

## Verificacion por CAs

| CA | Tareas relacionadas | Resultado | Notas |
|----|---------------------|-----------|-------|
| CA-01 | T-001 | PASS | roamgate.exe --version e interfaz con 0.7.15-dinamicapps.1 y luego .2 |
| CA-02 | T-002, T-003 | PASS | publicar-dist.ts publico .1 y .2 con VERSION-roamgate, commit y tag |
| CA-03 | T-002, T-004 | PASS | install.ps1 extrae, es idempotente, actualiza .1 -> .2 y no toca un exe en ejecucion |
| CA-04 | T-002, T-004 | PASS | roamgate.cmd usa la IP de Tailscale y ROAMGATE_PORT=8789 |
| CA-05 | T-003 | PASS | dinamicapps/roamgate-dist con main y tags .1 y .2; el .exe no esta versionado |
| CA-06 | T-004 | PASS | En 8789 con login, Herdr conectado y version .2 visible; v0.7.8 intacto en 8787 (CA-06-despues.png) |
| CA-07 | T-005 | PASS | install.ps1 aviso la ROAMGATE_PASSWORD de 12 caracteres de esta maquina |

## Hallazgos

| ID | Hallazgo | Rumbo |
|----|----------|-------|
| H-01 | Esta version exige ROAMGATE_PASSWORD de 15+ caracteres; el v0.7.8 aceptaba menos | Resuelto en T-005 (aviso del instalador y README) |
| H-02 | update.ts trata 0.7.15-dinamicapps.N como menor que 0.7.15 del upstream (solo macOS/Linux) | post-works |
| H-03 | prepare-release.ts solo acepta X.Y.Z | post-works |
| H-04 | build:windows-x64 sin postbuild de limpieza de *.bun-build | post-works |
