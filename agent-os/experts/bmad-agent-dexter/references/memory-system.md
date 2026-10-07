---
name: memory-system
description: Capacidad OD (observar deriva) + disciplina del sidecar de memoria de Dexter. Derivas históricas, normas tácitas, puente memoria->estándar.
menu-code: OD
---

# Memoria de Dexter (sidecar de derivas) + [OD]

Ubicación: `{project-root}/_bmad/memory/dexter-sidecar/`.

## Qué guarda la memoria (lo que el estándar escrito NO captura)

| | Estándar escrito (agent-os/standards/database/) | Memoria (este sidecar) |
|---|---|---|
| Guarda | La regla que DEBE cumplirse | El hecho observado y su historia |
| Naturaleza | Prescriptivo, versionable, público | Descriptivo, acumulado, contexto |
| Quién lee | Todo el sistema (carga dinámica E2/E4) | Solo Dexter, al activarse |

Contenido:
- **Derivas observadas:** inconsistencias históricas (ej. `estado nvarchar(1)` legacy vs `nvarchar(3)` post-2022), con genealogía inferible, tablas afectadas, estado de decisión (abierto/consolidado/aceptado).
- **Normas tácitas:** convenciones de facto que nadie escribió pero la BD respeta (ej. "los `id*` son INT IDENTITY, jamás GUID").
- **Decisiones de modelado pasadas** y su razón (coherencia entre works).

## Estructura del sidecar

- `index.md`: resumen cargado al activar. Lista de derivas abiertas + decisiones pendientes.
- `derivas/{nombre}.md`: una deriva por archivo (descripción, tablas, genealogía, estado, decisión).
- `normas-tacitas.md`: lista de convenciones de facto.
- `retirados.md` / `reconciliados.md`: libros-mayor MAQUINA, gestionados por el runtime (`agentos learn retirar` / `agentos learn reconciliar`). **NO cargan al activar.** Cuerpo activo de Dexter (`normas-tacitas.md` + `derivas/`, clave `norma`) sigue siendo markdown propiedad de la cognición, integrado con el campo `estado` (abierto/consolidado/aceptado) que las derivas ya manejan -- cuando una norma/deriva queda superada, es la propia cognición quien la remueve del cuerpo activo al consolidar; la lápida uniforme va a `retirados.md`, sin lógica especial por ser Dexter.
- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## [OD] — Observar deriva (protocolo)

Cuando Dexter toca un campo/entidad con inconsistencia tácita:
1. **Registra** la deriva en el sidecar (o actualiza si existía).
2. **Alerta** inline: "Detecto fractura en `estado`: nvarchar(1) en X,Y (legacy); nvarchar(3) en Z,W (post-2022). El tema está abierto."
3. **Propone** norma canónica para el elemento nuevo + opcionalmente promover a estándar escrito. El usuario decide.
4. **Regla dura:** no consolida lo viejo sin autorización (brownfield), pero impide que lo nuevo agrande la fractura.

## Puente memoria -> estándar

Una deriva madura en memoria. Cuando el usuario decide canonizarla, Dexter la promueve a `agent-os/standards/database/` via capacidad DT (destilar-standard). A partir de ahí el sistema entero la aplica por carga dinámica (mecanismo 2026-05-05b). La memoria es donde gestan reglas antes de ser ley.

## Primera vez

Si no existe `_bmad/memory/dexter-sidecar/`, crear la estructura al primer uso con un index.md vacío. No bloquear si no existe — degradar graceful.
