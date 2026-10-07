# Patron de permisos del repo (STUB NO DOCUMENTADO)

> ATENCION — este archivo es un stub-template. Mientras conserve este encabezado y las secciones esten vacias, las heuristicas del flujo `/alfred` lo trataran como `permisos_repo_estado: no_documentado`. Para activarlo, completa al menos las secciones 3 ("Codigos de permiso") y 5 ("Como aplicar un permiso"), y elimina este bloque de cabecera.

Este standard describe **como aplica permisos este repo en particular**. Sentinel lo lee al activarse en cualquier work, Mary lo consulta en E1, Bob lo usa para validar cada bloque `capa_seguridad` en E2, Amelia/Atlas lo aplica al implementar en E3, y Quinn ejecuta pruebas activas contra el patron declarado en E4.

Reglas guia para llenarlo:

- Es un **standard del repo**, no de un profile generico. Es el repo quien decide su mecanismo (extraccion manual de token, `[Authorize]`, RBAC, ACL, claims, etc.).
- Mantenelo **vivo**: la seccion 4 (catalogo) se actualiza cada vez que un work crea un permiso nuevo, en el mismo commit que el codigo que lo introduce.
- Es **autocontenido**: cualquier desarrollador o experto que lea este archivo debe entender el patron sin leer codigo fuente del repo.

---

## 1. Mecanismo de autenticacion

> Como se identifica al usuario en cada request. Donde vive la sesion (header, cookie, token JWT, custom). Si hay multiples mecanismos coexistiendo, listalos y di cuando aplica cada uno.

(STUB — describe aqui el mecanismo de autenticacion del repo.)

---

## 2. Sesiones disponibles

> Tipos de sesion que existen en el repo. Que controladores/endpoints usan cual. Si hay reglas de mezcla (ej. "nunca mezclar sesion empresa con sesion tercero en un mismo controller"), declaralas.

(STUB — lista los tipos de sesion y su contexto de uso.)

---

## 3. Codigos de permiso

> Formato del codigo (regex), prefijos vigentes por dominio, donde se almacenan los permisos del usuario, como se consultan. Esta seccion debe estar poblada para que el flujo `/alfred` valide bloques `capa_seguridad`.

(STUB — declara el formato y prefijos vigentes.)

---

## 4. Catalogo vivo de permisos

> Tabla mantenida en sincronia con el codigo. Cada vez que un work crea un permiso nuevo en E3, lo agrega aqui en el mismo commit. Sentinel verifica en E1/E4 que el catalogo coincida con el grep del codebase.

| Codigo | Descripcion | Sesion aplicable | Modulo / Subdirectorio | Origen (work) |
|--------|-------------|------------------|------------------------|----------------|
| (vacio) | (vacio) | (vacio) | (vacio) | (vacio) |

---

## 5. Como aplicar un permiso en una accion nueva

> Snippet de referencia: como un endpoint nuevo valida sesion + permiso. Donde se hace el chequeo (controller, filter, middleware). Ejemplo concreto. Esta seccion debe estar poblada para que el flujo `/alfred` valide bloques `capa_seguridad`.

(STUB — incluye un snippet representativo y donde vive el chequeo.)

---

## 6. Reglas de decision: reutilizar vs crear nuevo permiso

> Cuando un work introduce una accion nueva, ¿cuando se crea un permiso nuevo y cuando se reutiliza uno existente? Reglas concretas (no genericas).

(STUB — lista las reglas de decision.)

---

## 7. Excepciones documentadas

> Endpoints publicos legitimos (webhooks, healthchecks, callbacks de proveedores). Cada uno con justificacion. Sin esta seccion, Sentinel asume que toda accion publica es un descuido.

(STUB — declara las excepciones legitimas conocidas.)

---

## 8. Permisos como restriccion de acceso vs como modulacion de comportamiento (opcional pero recomendado)

> La regla por defecto es que un permiso es una **restriccion de acceso** y vive en el endpoint/controller (`if (!TienePermiso(...)) return 403`). En algunos casos, un permiso **modula el comportamiento** de un proceso ya autorizado: vive en BL/service, no niega el acceso, solo cambia el resultado (ej. tarifa preferencial vs estandar).
>
> Si tu repo distingue ambos casos, documentalo aqui con un ejemplo de cada. Si solo usa el primero, puedes omitir esta seccion.

(STUB — opcional.)
