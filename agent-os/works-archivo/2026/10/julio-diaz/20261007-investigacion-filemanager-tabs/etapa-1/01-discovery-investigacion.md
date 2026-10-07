# Etapa 1 — Discovery de investigacion (resumen ejecutivo)

Anfitriona: Mary. Invitados: Winston (arquitectura), Quinn (testeabilidad). Fecha: 2026-10-07.

## Preguntas investigativas

La pregunta "tab o panel" son dos preguntas de profundidad distinta: el file manager ya es un panel acoplable (vista `files` del Workspace Inspector), pero no independiente; los tabs son de Herdr (multiplexor externo en servidor) y solo alojan terminales. Ver evidencia en `## Abordaje (2026-10-07)` del README.

Se descompone en cinco frentes con orden F1 -> F2 -> (F3 || F4) -> F5:

- F1 File manager hoy: anatomia, puntos de entrada, contrato backend, acoplamientos con el Inspector.
- F2 Tabs hoy: ciclo de vida cliente <-> bridge <-> Herdr, frontera del modelo, modos shared/browser-local.
- F1+F2 Matriz de estado T-EST (10 piezas).
- F3 Opcion A: A1 tab virtual en cliente; A2 tab nativo de Herdr (solo viabilidad).
- F4 Opcion B: panel independiente fuera del Inspector.
- F5 Comparativa, nucleo comun y recomendacion.

Detalle de frentes, salidas, formato de ficha y CAs: `cas-cobertura-insumo.md`.

## Decisiones de alcance (usuario, 2026-10-07)

| Decision | Resolucion |
|---|---|
| Profundidad de A2 (tab nativo Herdr) | Verificar viabilidad contra codigo/spec de Herdr; si no es verificable, `por-definir` |
| Mover vs coexistir | Se evalua como subdecision de cada opcion (A1, A2, B) |
| Capacidades faltantes (rename/move/mkdir/editar) | Fuera de alcance; solo se registran |

## Aportes de invitados

- I-Winston: Herdr es sistema externo, su extensibilidad es hipotesis hasta verificarla; A se parte en A1 (cliente) y A2 (protocolo); el costo de la composicion hardcodeada de `App.tsx` puede ser comun a A y B y debe medirse aparte (origen de T-NUC).
- I-Quinn: CAs verificables tras definir tallas operativamente y fijar el contenido exigido de la recomendacion.

## Auditoria adversarial (Codex, 3 rondas)

| Ronda | CRITICO | MAYOR | MEDIO | MENOR | Correcciones principales |
|---|---|---|---|---|---|
| 1 | 0 | 4 | 4 | 0 | Regla transversal de evidencia (verificado/inferencia/hipotesis/por-definir); A2 no estimable sin evidencia; ficha de 9 campos por opcion; matriz T-EST; tabla de operaciones del strip; flujos mobile; orden de frentes; clasificacion de cambios confirmado/condicional/hipotesis |
| 2 | 0 | 1 | 5 | 0 | Filas minimas obligatorias; pieza de estado efimero del Inspector; talla en dos pasos con `no-estimable`; T-NUC con comun-a-todas/compartido/condicional; rastro obligatorio de hipotesis/por-definir; T-F4 vistas del Inspector |
| 3 | 0 | 1 | 1 | 0 | Filas minimas tambien para T-F1c, T-F2b, T-F2c; definicion de modulo extendida a web/src, server/src y shared/ en cualquier nivel |

Severidades confirmadas por la anfitriona en las tres rondas (ninguna reclasificada). Tras la ronda 3 quedo 1 MAYOR + 1 MEDIO; el usuario decidio (freno 2) corregir y cerrar el gate sin ronda 4. Correcciones aplicadas en v4.

Leccion del proceso: el patron "verificar forma pero no sustancia" aparecio en las tres rondas; el barrido de la ronda 2 cubrio 5 tablas y omitio 3. Al aplicar un patron, enumerar TODAS las tablas/artefactos afectados antes de corregir.

## Fuera de alcance registrado (CA-07)

- Capacidades faltantes: renombrar, mover, crear carpeta, editar (`server/src/workspace/local-files.ts`, `server/src/workspace/remote-files.ts`).
- Modal `FileExplorerDialog` sin importadores (`web/src/components/FileExplorerDialog.tsx:108`).
- Esc no cierra el panel de archivos (`web/src/App.tsx:3096`).
