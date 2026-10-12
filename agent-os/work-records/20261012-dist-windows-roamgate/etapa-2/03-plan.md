---
completedAt: "2026-10-12"
file_type: plan-etapa-2
inputDocuments:
  - README.md
status: approved
---
# Plan de implementacion - Etapa 2

**Anfitrion**: Bob
**Fecha**: 2026-10-12
**Modo**: normal
**Nivel**: normal

Publicar nuestra version de Roamgate como dist Windows siguiendo el patron de los *-dist (publicar.ts + scripts/instalador). Bob materializa sin elevar a Winston: no hay tradeoff arquitectonico (no cambia frontera de modulo ni capas del producto).

## Decisiones tecnicas

| # | Decision | Valor final | Justificacion |
|---|---|---|---|
| D1 | Version | 0.7.15-dinamicapps.1 en los package.json | La version se embebe desde server/package.json; el usuario eligio el sufijo |
| D2 | Binario | zip de 45,8 MB en bin/, .exe en .gitignore | GitHub limita a 100 MB por archivo; el .exe pesa 108,6 MB |
| D3 | Carpeta | E:\DinamicAPPS\roamgate-dist es el clon del repo dist | Decision del usuario: uso y publicacion desde la misma carpeta |
| D4 | Lanzador | roamgate.cmd con IP de Tailscale o localhost y ROAMGATE_PORT | Sin IP fija por dev |
| D5 | Convivencia | 8789 en esta maquina | El v0.7.8 sigue en 8787 hasta que el usuario decida |

## Criterios de aceptacion

| ID | Criterio | Tareas |
|---|---|---|
| CA-01 | roamgate --version y la interfaz muestran 0.7.15-dinamicapps.1 | T-001 |
| CA-02 | scripts/publicar-dist.ts compila, empaqueta el zip, escribe VERSION-roamgate y deja el espejo con commit y tag por version | T-002 |
| CA-03 | install.ps1/install.sh extraen roamgate.exe junto al lanzador, no tocan un proceso en ejecucion y son idempotentes con la misma version | T-002 |
| CA-04 | roamgate.cmd arranca en la IP de Tailscale de la maquina si existe, si no en 127.0.0.1, y respeta ROAMGATE_PORT (8787 por defecto) | T-002 |
| CA-05 | dinamicapps/roamgate-dist tiene el commit y el tag roamgate-v0.7.15-dinamicapps.1; el .exe no esta versionado | T-003 |
| CA-06 | En esta maquina el build nuevo corre en 8789, conecta a Herdr y muestra la version, sin tocar el v0.7.8 de 8787 | T-004 |
