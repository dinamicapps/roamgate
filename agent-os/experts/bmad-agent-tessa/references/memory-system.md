# Sistema de Memoria de Tessa

**Memory location:** `{project-root}/_bmad/memory/tessa-sidecar/`

## Principio central

Los tokens son caros. Solo recordar lo que importa. Condensar todo a su esencia.

## Estructura de archivos

### `index.md` -- Fuente primaria

**Cargar en activacion.** Contiene:

- Estado actual: flujos en progreso, tests pendientes, auditorias activas
- Ultimo resumen de sesion: que se exploro, que se genero, que quedo pendiente
- Resumen de coverage E2E: referencia rapida a flow-registry.md
- Hallazgos activos de seguridad: referencia rapida a security-findings.md
- Proximas prioridades: que flujos faltan por explorar, testear, documentar o auditar

**Actualizar:** Cuando cambia el estado de un flujo, se generan tests, se completa una auditoria, o se documenta un flujo.

### `access-boundaries.md` -- Control de acceso

**Cargar en activacion.** Contiene:

- **Read access** -- Codigo fuente, tests, configuracion, specs
- **Write access** -- Memoria propia, directorios de tests E2E, documentacion, reportes
- **Deny zones** -- `.env` con secrets, configs de produccion, datos de usuarios reales

### `playwright-profile.md` -- Infraestructura Playwright

**Cargar en activacion.** Contiene:

- Version de Playwright y browsers configurados
- Auth strategy: storageState path, login flow, credenciales de prueba (referencia, no las credenciales mismas)
- Patron de tests: Page Objects, fixtures, organizacion de archivos
- Comandos de ejecucion: como correr tests, como generar reportes
- CI configuration: pipeline, parallelism, sharding
- MCP tools disponibles y su estado
- Viewport defaults para la app

**Actualizar:** Cuando se descubre nueva configuracion o cambia la infraestructura.

### `flow-registry.md` -- Registro de flujos

**Cargar cuando se explora, testea, documenta o audita.** Contiene:

- Nombre del flujo y descripcion
- Estado: explorado / testado / documentado / auditado (un flujo puede tener multiples estados)
- Archivos de test generados (.spec.ts) y su ubicacion
- Documentacion visual generada y su ubicacion
- Hallazgos de seguridad asociados
- Fecha de ultima actualizacion

**Formato:**
```markdown
## Flujo: {nombre}
- **Estado:** explorado, testado
- **Tests:** tests/e2e/checkout.spec.ts (8 tests, all green)
- **Docs:** _bmad/docs/visual/checkout-manual.md
- **Seguridad:** 1 hallazgo medio (CSP ausente en /payment)
- **Ultima actualizacion:** 2024-01-15
```

**Actualizar:** Inmediatamente cuando cambia el estado de un flujo.

### `security-findings.md` -- Hallazgos de seguridad

**Cargar cuando se audita o se revisan hallazgos.** Contiene:

- Hallazgo con severidad (critica/alta/media/baja/info)
- URL y componente afectado
- Evidencia: header, cookie, response, screenshot
- Estado: abierto / en remediacion / verificado / cerrado
- Remediacion sugerida
- Fecha de deteccion y ultima verificacion

**Actualizar:** Inmediatamente cuando se detecta un hallazgo o cambia su estado.

### `patterns.md` -- Patrones aprendidos

**Cargar cuando necesario.** Contiene:

- Patrones de la app: como se estructuran los formularios, como se manejan errores, quirks del UI
- Convenciones de testing del proyecto
- Elementos problematicos recurrentes (modals que tardan, spinners inconsistentes, etc.)
- Preferencias del usuario descubiertas

### `chronology.md` -- Timeline

**Cargar cuando necesario.** Resumenes de sesion y milestones significativos.

### `retirados.md` / `reconciliados.md` -- Libros-mayor de purga

**NO cargan en activacion.** Libros-mayor maquina gestionados por el runtime (`agentos learn retirar` / `agentos learn reconciliar`), nunca leidos ni escritos directamente por este agente. `retirados.md` guarda lapidas de entradas jubiladas de `patterns.md`; `reconciliados.md` guarda pares entrada-vs-standard dirimidos como compatibles. `patterns.md` sigue siendo markdown de formato libre propiedad de la cognicion -- el runtime nunca lo toca; la consolidacion es quien remueve una entrada retirada al reescribir `patterns.md`.

- `anti-patrones.md`, `devs/{dev}/veredictos.md` y cualquier `adn-*.md` del arbol del experto (ej. `adn-mejoras.md`): libros-mayor maquina — NO se cargan en On Activation (mismo trato que `retirados.md`/`reconciliados.md`).

<!-- FUENTE: agent-os/templates/work-record/schema/cosecha.md seccion "Purga de memoria del experto (retirados y reconciliados)". Schema de lapida/reconciliados. NO duplicar. -->

## Estrategia de persistencia

### Write-Through (Inmediato)

Persistir inmediatamente cuando:

1. Test generado (-> flow-registry.md, index.md)
2. Hallazgo de seguridad detectado (-> security-findings.md, index.md)
3. Flujo documentado visualmente (-> flow-registry.md, index.md)
4. Configuracion de Playwright descubierta (-> playwright-profile.md)
5. Usuario solicita guardar

### Checkpoint (Periodico)

Actualizar periodicamente despues de:

- Completar una capacidad
- Cada 5-10 intercambios significativos
- Antes de cerrar sesion

### Triggers de guardado

**Despues de estos eventos, siempre actualizar memoria:**

- Test generado -- nuevo test escrito y verificado
- Flujo explorado -- nuevo flujo navegado y analizado
- Auditoria completada -- hallazgos clasificados y documentados
- Documentacion generada -- screenshots y manual creados
- Cierre de sesion

**La memoria se actualiza via la capacidad `[SM] - Guardar Memoria`.**

## Disciplina de escritura

Persistir solo lo que importa, condensado al minimo de tokens. Rutear al archivo apropiado segun el tipo de contenido. Actualizar `index.md` cuando otros archivos cambian.

## Mantenimiento de memoria

Periodicamente condensar, podar y consolidar. Mover hallazgos de seguridad cerrados a chronology si revelan un patron. Archivar snapshots de coverage antiguos.

## Primera ejecucion

Si el sidecar no existe, cargar `init.md` para crear la estructura.
