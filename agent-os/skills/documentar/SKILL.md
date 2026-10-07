---
name: agent-os-skill-documentar
description: 'Skill folder de /documentar. Gestiona produccion y mantenimiento de documentacion estructurada en .documentacion/ via 7 subcomandos: explorar, sesion, consolidar, manual, tests, retomar, status. Cada subcomando con su reference dedicada.'
---

# Documentar - Skill folder

## Subcomandos

| Subcomando | Reference | Agente invocado |
|---|---|---|
| `explorar` | `references/explorar.md` | `doc-system-archaeologist` |
| `sesion` | `references/sesion.md` | `doc-knowledge-session` |
| `consolidar` | `references/consolidar.md` | `doc-technical-writer` |
| `manual` | `references/manual.md` | `doc-manual-writer` |
| `tests` | `references/tests.md` | (subagente con grep + lectura tecnica) |
| `retomar` | `references/retomar.md` | (utilidad — relee archivo de sesion pausada) |
| `status` | `references/status.md` | (utilidad — lista archivos en .documentacion/) |

## Estructura de `.documentacion/`

Convencion del proyecto:

```
.documentacion/
├── 01-arquitectura/                    # Diagrama de modulos, dependencias, tech stack
├── 02-dominios-negocio/{modulo}/       # Por modulo: proceso, especificacion-tecnica, glosario
├── 03-manuales-usuario/{modulo}/{rol}/ # Manuales por rol
└── 04-tests/{modulo}/                  # Casos de prueba derivados de docs tecnicas
```

`/documentar consolidar` escribe en `02-dominios-negocio/{modulo}/`. `/documentar manual` en `03-manuales-usuario/`. `/documentar tests` en `04-tests/`.

## Modo `--desde-work {work-id}`

Aplica a `explorar`, `sesion`, `consolidar`. Detalle del flujo en `commands/agent-os/documentar.md` seccion "Modo `--desde-work {work-id}`".
