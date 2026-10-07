---
name: documentar-standard-frontend
description: Faceta de DT (destilar standard) aplicada a frontend — registrar patrón correcto y antipatrón observado en los estándares tras cada trabajo de rediseño.
menu-code: DT
---

# Documentar standard de frontend

> **Voz Sally:** No documento por disciplina burocrática. Lo hago porque
> la próxima Sally — o cualquier otro experto que abra este repo en seis
> meses — no debería redescubrir lo que ya resolvimos. Un patrón que no
> se escribe después de usarlo es deuda disfrazada de agilidad.

Faceta de la capacidad `DT` (destilar standard) de Sally, aplicada al dominio
de frontend. Se ejecuta al cerrar la fase de implementación de la ruta
`rediseno-ui` — después de que el prototipo fue aprobado y las tareas de
ejecución están listas — para convertir lo aprendido en capital reutilizable
dentro de los estándares del perfil activo.

El procedimiento completo de destilado (evidencia, formato del archivo,
indexación, actualización del work-record) vive en
`agent-os/skills/destilar-standard/SKILL.md`. Esta referencia especifica
**qué** documentar en el dominio frontend y **cómo** distinguir un patrón
real de uno aspiracional.

## Propósito

Tras cada trabajo de rediseño, registrar dos cosas en los estándares del
Frente 1:

1. **El patrón correcto** — la solución de interacción o estructura CSS
   que quedó implementada y aprobada.
2. **El antipatrón observado** — lo que existía antes y causó el problema;
   su corrección y por qué duele dejarlo sin documentar.

La regla de ejecución: si en el trabajo se tomó una decisión de diseño
que no estaba cubierta por el catálogo o que contradecía una convención
tácita, ese es el momento de destilar. No después, no como deuda futura.
La iteración avanza y el prototipo aprobado se convierte en el patrón real
con todos sus huecos — a menos que alguien lo escriba ahora.

## Que se documenta

### Patrón nuevo

Cuando el trabajo define o confirma cómo debe comportarse un tipo de pieza
UI que no estaba cubierto (o estaba cubierto de forma ambigua) en los
estándares, se documenta con la siguiente estructura mínima:

- **Tipo de pieza** — tablero, formulario, wizard, modal, listado, o
  combinación con tipo primario y secundarios identificados.
- **Componentes `nv-*` que lo realizan** — átomo, molécula u organismo
  del design system, con su rol explícito.
- **Tabla de estados** — los estados que deben estar diseñados: cargando,
  vacío, error, éxito, y cualquier estado intermedio relevante.
- **Contrato de datos** — qué espera del backend y quién decide el filtro
  (¿trae toda la lista o pagina? ¿el filtro lo maneja el controller o el
  servidor?).

El patrón entra al catálogo `catalogo-patrones-frontend.md` como sección
nueva bajo el tipo de pieza correspondiente, o como variante documentada
si el tipo ya existe.

### Antipatrón con su corrección

Cuando el trabajo encontró código existente que viola el estándar, se
documenta el antipatrón con su corrección en la sección
`## Antipatrones observados en producción` del catálogo. La entrada incluye:

- **Síntoma observable** — qué se ve o qué falla.
- **Causa técnica** — por qué el código existente lo produce.
- **Por qué duele** — el impacto real: inconsistencia visible, deuda de
  mantenimiento, o bloqueo de futuras migraciones.
- **Patrón correcto** — la alternativa que debe reemplazarlo.

Ejemplo canónico de este tipo de entrada:

| Antipatrón | Patrón correcto |
|------------|-----------------|
| `style="color: #2196F3; font-size: 13px;"` inline en cada vista | Clase BEM con modificador sobre token: `.nv-button--primario` usa `--nv-color-primario` |

El antipatrón `style=` inline es el síntoma más frecuente de un sistema
sin tokens: cada vista hardcodea valores que luego no se pueden actualizar
en un solo lugar. La corrección no es solo quitar el `style=` — es usar
la clase BEM que consume el token `--nv-*` correcto, de modo que un cambio
de tema o de paleta no requiera buscar-y-reemplazar en cien archivos.

### Qué NO se documenta aquí

- Decisiones de layout específicas de una vista (van al artefacto de la
  fase, no al estándar).
- Convenciones de backend o de datos (ver `destilar-standard/SKILL.md`
  para el destino correcto según dominio).
- Patrones que solo se usaron en un lugar — la regla de los 2 sitios
  canónicos del SKILL aplica; sin evidencia de uso, no hay standard.

## Donde

Los estándares de frontend del proyecto viven en:

```
agent-os/standards/frontend/
├── atomic-design-bem-tokens.md   ← metodología de nivel, BEM y tokens
└── catalogo-patrones-frontend.md ← patrones por tipo de pieza + antipatrones
```

**Núcleo agnóstico, ejemplos concretos.** Si un patrón de interacción es
general (aplica a cualquier stack que use AngularJS o similar), va al
catálogo `catalogo-patrones-frontend.md`. Si hay algo verdaderamente agnóstico
de stack (un principio de jerarquía visual, por ejemplo), puede subir a un
archivo separado dentro de `agent-os/standards/frontend/` — pero solo si el
equipo lo confirma como convención transversal, no por economía de escritura.

**Procedimiento de destilado:** ver `agent-os/skills/destilar-standard/SKILL.md`
para el procedimiento completo paso a paso: confirmación de destino, recolección
de evidencia, estructura del archivo, indexación en `index.yml` y actualización
del work-record. Esta referencia no lo duplica — solo especifica el dominio
y el contenido propio de frontend.

## Anti-mentira

No documentar un patrón sin evidencia de uso real en el trabajo que lo
produjo. La regla operativa:

1. **Anclar en el trabajo.** Cada patrón o antipatrón nuevo lleva referencia
   al slug del work-record que lo produjo (`creado_por_work` en el frontmatter
   del standard, o una línea en la sección `Works que aplicaron este standard`).
   Sin esa referencia, el standard es aspiracional — describe lo que alguien
   quiso, no lo que el código hace.

2. **Dos sitios canónicos o no se destila.** Si el patrón solo se aplicó en
   un lugar en este trabajo y no se puede referenciar un segundo sitio en el
   código, registrar como candidato a destilar con `estado_destilado: diferido`
   en el work-record. Se destila cuando aparezca en el siguiente trabajo del
   mismo tipo.

3. **El antipatrón también necesita evidencia.** No se documenta un antipatrón
   con "suele verse" o "es frecuente": la entrada necesita al menos un archivo
   o fragmento de código real donde se observó, para que Quinn pueda
   referenciarlo en revisión como hallazgo concreto, no como opinión.

4. **Si se actualiza un standard existente:** verificar que los sitios
   canónicos previos siguen vigentes antes de agregar la nueva entrada. Un
   standard desactualizado que nadie corrige es peor que uno inexistente —
   engaña.
