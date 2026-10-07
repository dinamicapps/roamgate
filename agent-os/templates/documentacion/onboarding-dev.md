---
plantilla: onboarding-dev
tipo: onboarding
descripcion: "Guia de onboarding para desarrolladores nuevos: panorama, setup, arquitectura minima y primer cambio acompañado"
audiencia_sugerida: "Desarrollador nuevo en el equipo, sin contexto del sistema"
destino_sugerido: "docs/onboarding/"
capturas: no_aplica
fuentes:
  - "Diataxis (diataxis.fr) -- tipo dominante: tutorial (aprender haciendo)"
  - "ISO/IEC/IEEE 26514:2022 -- cl. 8.5 informacion conceptual, 8.6 instruccional"
---

# Onboarding de desarrollador: {nombre del sistema}

<!-- Plantilla del catalogo de la ruta documentacion. Punto de partida, no camisa de
     fuerza: Paige puede desviarse declarandolo en el discovery (E1).
     Diataxis: esto es un TUTORIAL — optimiza para que el dev nuevo LOGRE cosas en su
     primera semana, no para completitud. Lo exhaustivo vive en la doc tecnica; aqui se
     enlaza, no se repite. -->

## Metadatos

| Campo | Valor |
|---|---|
| Sistema | {nombre del sistema} |
| Repo(s) | {repos que el dev debe clonar} |
| Audiencia | {audiencia_documento declarada en el work} |
| Fecha de elaboracion | {YYYY-MM-DD} |
| Vigente contra | {version/commit al validar} |

## Indice

{TOC del documento, generado al cierre.}

## 1. Panorama del sistema (30 minutos)

{Que es el sistema y que resuelve, en lenguaje directo. Diagrama de contexto (Mermaid).
Los 3-5 conceptos del dominio que el dev DEBE entender antes de tocar codigo, cada uno
en 2-3 lineas. Enlace a la doc tecnica para profundizar.}

## 2. Setup del entorno (dia 1)

{Checklist ejecutable, en orden, con comandos exactos:}

| Paso | Que | Como | Verificacion |
|---|---|---|---|
| 1 | {herramienta/acceso} | {comando o donde pedirlo} | {como saber que quedo bien} |

{Incluir: clonado de repos, dependencias, base de datos local o de pruebas, configuracion
local (que archivos .local existen y quien te da los valores), como levantar el sistema y
como saber que arranco bien. Si el repo usa test-env.local.json, explicarlo aqui.}

## 3. Arquitectura minima para empezar

{SOLO lo que se necesita para el primer cambio: como fluye un request tipico
(diagrama de secuencia Mermaid), donde vive cada capa en el codigo (tabla capa ->
carpeta), y las 3-5 convenciones que mas sorprenden a un dev nuevo. Enlazar la doc
tecnica completa; no duplicarla.}

## 4. Convenciones y standards

{Como se trabaja en este repo: branching y PRs, formato de commits, estilo de codigo
(enlazar agent-os/standards/index.yml si el repo lo tiene), como se corren los tests,
que valida el CI. Tabla corta, cada fila con su fuente.}

## 5. Primer cambio acompañado (semana 1)

{Un cambio real, pequeño y seguro, elegido como ejercicio (ej: agregar un campo a una
pantalla existente o un test faltante). Procedimiento completo: donde tocar, como probar
localmente, como abrir el PR, quien lo revisa. El objetivo es recorrer el ciclo completo
de desarrollo una vez, con acompañamiento.}

## 6. A quien preguntar

| Tema | Persona/rol | Canal |
|---|---|---|
| {area del sistema} | {quien} | {como} |

## 7. Historial de este documento

| Fecha | Version | Cambio | Autor |
|---|---|---|---|
| {YYYY-MM-DD} | 1.0 | Version inicial | {autor} |
