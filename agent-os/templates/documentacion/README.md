# Catalogo de plantillas de la ruta documentacion

> Fuente unica del contrato de plantilla. Lo leen Alfred (abordaje), Paige (E1 a E3 y
> curaduria, capacidad CP) y Quinn (E4). Este archivo no es una plantilla.

## Zonas

| Zona | Ruta | Dueno | Que contiene | En cada update del instalador |
|---|---|---|---|---|
| Sistema | `agent-os/templates/documentacion/` | agent-os | plantillas simples (`{slug}.md`) y este README | espejo: se reemplaza con cada version |
| Repo | `agent-os/plantillas/documentacion/` | el equipo, versionada en git | plantillas simples y kits, `_comun/`, `_curaduria.md`, `README.md` opcional | nunca se espeja, se borra ni se sobrescribe |

- Editar una semilla en la zona del sistema no sirve: el proximo update la sobrescribe. Para
  adaptarla, se **sombrea** (ver "Resolucion de un slug").
- Si el instalador encuentra en la zona del sistema algo que no distribuyo (una plantilla
  propia dejada ahi), lo **mueve** a la zona del repo antes de espejar; nunca lo borra. Si el
  nombre ya existe en la zona del repo, lo renombra `{base}-rescatada{ext}` (`-2`, `-3`...).
- La zona del sistema no distribuye kits: las semillas son multi-stack y no declaran vias.
- La zona del repo la crea el instalador al rescatar, o Paige al guardar la primera plantilla
  o la primera decision de curaduria.

## Formas

- **Simple:** `{zona}/{slug}.md`. Valida en las dos zonas.
- **Kit:** `{zona}/{slug}/plantilla.md`, con `metodo.md` y `generacion/` opcionales. Solo en la
  zona del repo.

```
agent-os/plantillas/documentacion/
  README.md                  # opcional: metodo general del equipo
  _curaduria.md              # registro de decisiones de curaduria
  _comun/                    # recursos compartidos por varios kits
    skills/{nombre}/SKILL.md
  {slug}/                    # kit
    plantilla.md             # estructura + descriptor
    metodo.md                # como se llena cada seccion
    generacion/              # scripts y recursos de las salidas
  {slug}.md                  # plantilla simple
```

## Slug

- Alfabeto: `^[a-z0-9]+(-[a-z0-9]+)*$` (ASCII en minuscula, kebab-case).
- Excluidos los nombres reservados de Windows: `con`, `prn`, `aux`, `nul`, `com1` a `com9`,
  `lpt1` a `lpt9`.
- Por el alfabeto quedan fuera del catalogo `README.md` y toda entrada que empiece con `_`.
- Los nombres se comparan **exactos** (sensible a mayusculas), tambien en Windows: `FOO.md`
  nunca resuelve el slug `foo`.

## Resolucion de un slug

Orden fijo:

1. Zona del repo: si existen a la vez `{slug}.md` y `{slug}/plantilla.md`, la plantilla es
   ambigua (`agentos work open` falla con `PLANTILLA_AMBIGUA`).
2. Zona del repo: kit o simple.
3. Zona del sistema: solo simple.
4. Nada: `PLANTILLA_NO_ENCONTRADA`. Un slug fuera del alfabeto es `USO`.

Si el slug existe en las dos zonas, gana la del repo: es una **sombra**.

Hay dos niveles:

- **Forma fisica** (lo que resuelve el runtime): el archivo existe en una de las formas de arriba.
  El runtime no lee el descriptor.
- **Plantilla ofrecible** (lo que ve Paige): forma fisica y descriptor valido (ver "Validez").
  Solo estas se ofrecen al usuario. Alfred solo envia `plantilla_documento` con un slug que
  Paige ofrecio.

## Descriptor

Frontmatter de `plantilla.md` (kit) o del `{slug}.md` (simple).

| Campo | Tipo | Regla |
|---|---|---|
| `plantilla` | string | igual al nombre de la carpeta (kit) o del archivo sin `.md` (simple) |
| `tipo` | string | familia, texto libre; varias plantillas pueden compartirla |
| `descripcion` | string | obligatoria |
| `audiencia_sugerida` | string | precarga la audiencia del documento |
| `destino_sugerido` | string | carpeta tipica del documento producido |
| `capturas` | `recomendado` \| `opcional` \| `no_aplica` | `recomendado` anticipa la invitacion de Tessa desde E2 |
| `fuentes` | lista | en que se basa la estructura |
| `version` | entero >= 1 | ausente = 1; sube con cada actualizacion |
| `derivado_de` | lista | cada elemento: `work:{slug}`, `doc:{ruta relativa al repo}` o `semilla:{slug}@{version}` |
| `llenado` | ruta | relativa al kit (normalmente `metodo.md`), o `_comun/...` relativa a la raiz de la zona cuando varios kits comparten el metodo; dice como se obtiene el contenido de cada seccion |
| `salidas` | lista | ausente = `[{formato: md}]` |
| `salidas[].formato` | string | `md`, `docx`, `pdf`, `html`... |
| `salidas[].via` | via | como se produce ese formato; ausente solo para `md` |
| `salidas[].recursos` | lista de rutas | relativas a la raiz de la zona del repo |
| `imagenes` | lista | `[{tipo: captura \| diagrama \| ilustracion, via: ...}]` |

- `capturas: recomendado` equivale a `imagenes: [{tipo: captura, via: experto:tessa}]`.
- Un modelo adoptado que traia `metodo:` lo normaliza a `llenado` (ver capacidad CP).

Al pie del cuerpo de la plantilla va su historial, desde que Paige la crea o la actualiza:

```markdown
## Historial de la plantilla

| Version | Fecha | Cambio | Decidido en |
|---|---|---|---|
| 1 | AAAA-MM-DD | Creacion desde {documentos} | work:{slug} |
```

## Vias

| Forma de `via` | Significado | Quien la ejecuta |
|---|---|---|
| `{ruta}` (relativa a la raiz de la zona del repo) | script o programa del repo | Paige en E3, con el flujo normal de permisos |
| `skill:{nombre}` | skill nativa disponible (del proyecto, del usuario o de un plugin) | el agente la invoca |
| `skill:{ruta}/SKILL.md` | skill dentro de la zona (por ejemplo `_comun/skills/x/SKILL.md`) | Paige la lee y la sigue |
| `experto:{nombre}` | un experto de agent-os (por ejemplo `experto:tessa`) | se invita al experto |
| `herramienta:{descripcion}` | paso manual o herramienta externa | el usuario, con instruccion explicita |

**Regla multi-stack:** las semillas y la prosa del sistema describen el contrato; nunca fijan
una herramienta concreta. Las vias concretas existen solo en los kits del repo.

## Validez

Paige considera invalida una plantilla (y no la ofrece) cuando:

- su nombre esta fuera del alfabeto de "Slug";
- el frontmatter falta o no se puede leer;
- el campo `plantilla` no coincide exactamente con su nombre;
- falta `descripcion`;
- un `llenado` o un `recursos[]` no existe;
- una via de ruta o `skill:{ruta}` no existe.

Las invalidas se reportan en el barrido de curaduria. El runtime no valida el descriptor: una
forma fisica con descriptor roto pasa `agentos work open`, y eso se acepta porque solo llega
ahi un slug que Paige ofrecio.

## Registro de curaduria

`agent-os/plantillas/documentacion/_curaduria.md`, append-only. Si no existe, Paige lo crea con
este encabezado y agrega una fila por decision:

```markdown
# Registro de curaduria de plantillas

| Fecha | Decidido en | Senal | Firma | Decision | Plantilla | Razon |
|---|---|---|---|---|---|---|
```

| Columna | Contenido |
|---|---|
| Fecha | AAAA-MM-DD |
| Decidido en | `work:{slug}` o `maintain` |
| Senal | `S1`..`S4`, `U1`..`U4`, `validez` (plantilla invalida o nombre a normalizar) o `pedido` (el usuario pidio crear una plantilla en el abordaje) |
| Firma | destino + documentos involucrados, en orden alfabetico; la familia se anota como etiqueta y no entra en la comparacion |
| Decision | `creada` \| `actualizada` \| `adoptada` \| `sombreada` \| `normalizada` \| `consolidada` \| `via-creada` \| `descartada` \| `diferida` |
| Plantilla | `{slug}@{version}` resultante, si aplica |
| Razon | una linea |

- Una firma con decision `descartada` no se vuelve a proponer mientras la firma no cambie. Se
  compara destino y conjunto de documentos; la familia es solo una etiqueta y puede variar
  entre corridas. Un documento nuevo en la serie cambia la firma.
- Es el unico estado propio de la curaduria: un descarte es una decision humana que ninguna
  derivacion reconstruye.
