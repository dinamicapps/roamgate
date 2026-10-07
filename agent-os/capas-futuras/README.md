# Capas de cebolla — Roadmap del entregable

Hallazgos clasificados como **rumbo 3** durante el cierre de works completados. Capas de mejora futura (meses/versiones) sobre entregables del repo. Acumulan por `area`: works distintos que tocan la misma area aportan al mismo archivo `{area}.md`.

Este directorio existe para works **standalone** (sin `diseno_origen`). Cuando un work viene de `/disenar`, su rumbo 3 vive en `agent-os/disenos/{slug}/capas-futuras.md` (aporta de vuelta al brief).

## Estructura

```
agent-os/capas-futuras/
├── README.md                       (este archivo)
├── {area-1}.md                     (ej: facturacion.md)
├── {area-2}.md                     (ej: frontend-modernizacion.md)
└── ...
```

**Areas con texto libre, no enum cerrado.** El experto que clasifica el primer item de un work elige el nombre de area (ej: `auth`, `facturacion`, `integracion-zoho`, `observabilidad`). Quinn al cierre de E4 sugiere reusar areas existentes antes de crear una nueva, pero la decision final es del usuario en la tabla resumen.

Razon: un enum cerrado al dia 1 estara mal al dia 30; un enum emergente convergera a las areas reales del proyecto sin imponerlas a ciegas.

## Estructura de cada `{area}.md`

```markdown
# Capas futuras — {area}

Roadmap acumulativo de mejoras futuras al entregable de {area}. Cada item viene
de un work cerrado donde se identifico una capa de cebolla pero no era el
momento de implementarla.

## Items

### YYYY-MM-DD — {resumen breve}
- **Origen:** work `{slug-del-work}`, hallazgo `{id}`.
- **Razon:** {por que es capa de cebolla y no algo bloqueante o post-work}.
- **Notas:** {detalles adicionales si aporta a quien lea esto en el futuro}.

### YYYY-MM-DD — {siguiente item}
- ...
```

**Items en orden cronologico descendente** (mas reciente arriba). Quien lea el archivo a futuro ve primero lo mas reciente y puede hacer scroll hacia atras.

## Quien escribe

- **Quinn** al cierre de E4 (todos los modos), curando hallazgos rumbo 3 con `area` libre tras presentar tabla resumen al usuario.
- **Mary** co-cura cuando el work vino de `/disenar` (pero entonces el destino es `agent-os/disenos/{slug}/capas-futuras.md`, no este directorio).

## Quien lee

- Cualquier persona que va a planear el siguiente bloque de trabajo en `{area}` y quiere ver capas pendientes acumuladas.
- Mary cuando entra a un work nuevo en un area existente y quiere ver el roadmap acumulado para fundamentar el discovery.
- El usuario al ejecutar `/post-works status` opcionalmente con flag `--incluir-capas` (no implementado en v1; placeholder para futuro).

## Anti-patrones a evitar

- **NO** sintetizar tematicamente. Cada item se agrega como bullet cronologico. Si el archivo se vuelve denso y confuso, eso seria un work dedicado a sintetizarlo, no algo que cargue cada cierre.
- **NO** borrar items aunque se vuelvan irrelevantes. Marcar como `[OBSOLETO desde YYYY-MM-DD: razon]` y mantener para auditoria.
- **NO** modificar items volcados por works pasados sin aprobacion del usuario. Cada item es snapshot del momento de su volcado.
- **NO** crear archivos vacios para areas anticipadas. Las areas se crean cuando se vuelca el primer item.

## Referencias

- Principio del huevo y rumbos: `agent-os/skills/host-protocol/SKILL.md` seccion "Principio del huevo y rumbos del hallazgo".
- Curaduria al cierre: `agent-os/skills/work-etapa-4/SKILL.md` seccion "Curaduria de rumbos 2 y 3 al cierre".
- Schema: `agent-os/templates/work-record/schema/cierre-guards-diseno.md` seccion "Rumbos del hallazgo".
