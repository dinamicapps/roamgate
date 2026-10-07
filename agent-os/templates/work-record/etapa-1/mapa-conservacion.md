# Mapa de conservacion -- {documento nuevo}

<!-- Artefacto de E1 del re-plantillado (ruta documentacion). Un bloque como este por cada
     entregable que declara Origen en la seccion ## Entregables del README. Quinn lo contrasta
     en E4 contra el archivo de origen real, no contra este mapa. -->

| Campo | Valor |
|---|---|
| Origen | {ruta del documento fuente} |
| Documento nuevo | {ruta; distinta del origen} |
| Plantilla destino | {slug}@{version} ({repo o sistema}) |
| Works que produjeron el origen | {slugs, o "ninguno"} |

## Origen -> plantilla

Una fila por bloque del origen: cada encabezado, cada tabla, cada figura y cada nota destacada.

| # | Bloque del origen (tipo y titulo o primera linea) | Resolucion | Seccion destino o razon |
|---|---|---|---|
| O-1 | {encabezado "## 1. Contexto"} | seccion destino | {"## 1. Introduccion"} |
| O-2 | {tabla "Permisos nuevos"} | descartado | {razon} |
| O-3 | {nota "Advertencia de lectura"} | sin lugar | {desviacion declarada: donde se agrega} |

Resoluciones validas: `seccion destino`, `descartado`, `sin lugar`.

## Plantilla -> origen

Una fila por seccion de la plantilla.

| # | Seccion de la plantilla | Resolucion | Detalle |
|---|---|---|---|
| P-1 | {"## 1. Introduccion"} | contenido del origen | {O-1} |
| P-2 | {"## 4. Anatomia de cada ficha"} | hueco | {se llena con el llenado: amplia el alcance; decision del usuario: si o no} |
| P-3 | {"## 9. Glosario"} | no aplica | {razon} |

Resoluciones validas: `contenido del origen`, `hueco`, `no aplica`. Todo `hueco` lleva la
decision del usuario.

## Hallazgos de contenido

Contenido del origen que parece desactualizado. No se corrige en este work salvo que el usuario
amplie la meta.

| # | Bloque | Por que parece desactualizado | Decision |
|---|---|---|---|
