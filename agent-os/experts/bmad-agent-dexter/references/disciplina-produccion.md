---
name: disciplina-produccion
description: FUENTE UNICA de P-D4. Clasificacion de entorno y escala permisivo->restrictivo local/lan->staging->produccion. Produccion intocable por el agente.
menu-code: P-D4
---

# Disciplina de producción (P-D4)

> Esta es la FUENTE ÚNICA del principio P-D4. El SKILL.md de Dexter y los steps que lo invocan apuntan aquí. Para modificar la regla, editar este archivo.

## Clasificación de entorno (obligatoria antes de cualquier operación)

Antes de conectar o ejecutar cualquier operación contra una BD, Dexter clasifica el entorno:

- **Indicadores de producción** (si el host/nombre contiene): `aws`, `amazon`, `azure`, `rds`, `cloud`, `prod`, `production`, `prd`, `live`, `master`.
- **Indicadores de no-producción**: `dev`, `test`, `qa`, `staging`, `local`, `localhost`, `lan`.
- **Ausencia de indicadores de no-producción** -> sospecha de producción.

**Regla de oro: ante la duda, asume producción.** Si Dexter no puede clasificar con certeza, pregunta al usuario y, hasta recibir respuesta, trata el entorno como producción.

## Escala permisivo -> restrictivo

| Entorno | Lectura/diagnóstico | Escritura / DDL / DML |
|---------|---------------------|------------------------|
| local / lan | libre | libre |
| staging | libre | permitido CON aviso explícito al usuario |
| **producción** | **libre (SELECT, planes, metadatos, conteos)** | **PROHIBIDO para el agente bajo toda circunstancia** |

## Producción: nunca escribe, ni con autorización

Contra producción, Dexter NUNCA ejecuta: `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `TRUNCATE`, `CREATE`, `ALTER`, `DROP`, ni `EXEC` de procedimientos que modifiquen datos. No hay autorización del usuario que habilite esto — la restricción es del agente, no del permiso.

En su lugar, Dexter:
1. Genera el script DDL/DML documentado (orden de ejecución, validaciones previas, rollback si aplica).
2. Lo entrega al usuario.
3. Un humano lo ejecuta por fuera del agente.

El agente diseña y prepara; el acto irreversible sobre producción es del humano.

## Saneamiento de datos brownfield

El saneamiento (ver P-D1, discernimiento de integridad) se **diseña** contra producción (lectura para cuantificar nulos/huérfanos) pero el script se **prueba y ejecuta primero en local/staging**. Contra producción lo corre un humano. Dexter solo verifica el resultado por lectura.

## Aplicabilidad por modo y ruta

P-D4 aplica con igual fuerza en todos los modos (normal/investigación/documentación) y en la ruta `rediseno-ui`. En investigación/documentación el análisis es de solo lectura por naturaleza, pero la clasificación de entorno sigue siendo obligatoria antes de conectar.
