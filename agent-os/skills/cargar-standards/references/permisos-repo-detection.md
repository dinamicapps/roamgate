# Heuristica de deteccion de "documento sustantivo" para `permisos-repo.md`

Esta referencia documenta el algoritmo exacto que el abordaje (Fase 2) aplica al archivo `agent-os/standards/security/permisos-repo.md` (o al archivo apuntado por `permisos_repo_path` cuando `permisos_repo_estado: documentado_externo`) para clasificarlo como `documentado` o `no_documentado`. La heuristica esta diseñada para minimizar falsos positivos (archivo presente pero vacio se cuenta como ausente) y falsos negativos (variaciones razonables de formato no descalifican).

## Reglas, en orden

Una falla en cualquiera de estas reglas degrada el archivo a `no_documentado`. Las reglas se evaluan en orden; si la primera falla, no es necesario evaluar las siguientes.

### Regla 1 — Existencia del archivo

El archivo debe existir como archivo regular en la ruta declarada (no symlink roto, no directorio).

### Regla 2 — No conserva encabezado de stub-template

El archivo NO debe contener la cadena literal `STUB NO DOCUMENTADO` (case-sensitive, en cualquier parte del documento). Esta cadena es el marcador que el stub instalado (`agent-os/standards/security/permisos-repo.md`) trae en su cabecera para senalizar "no llenado". Eliminar el bloque de cabecera del stub es senal explicita de que el repo asumio el archivo.

### Regla 3 — Contenido sustantivo > 300 caracteres no-template

Tras eliminar:
- Lineas en blanco.
- Marcadores de markdown puros (`---`, encabezados sin texto adicional).
- Cadenas tipo `(STUB —` (cualquier seccion que conserve el placeholder del template).

El conteo de caracteres restante debe ser estrictamente mayor que 300. Este umbral es bajo intencionalmente: un standard minimo viable para un repo simple debe poder caber arriba de 300 caracteres reales; bajo eso, es plausiblemente una cabecera + stub.

### Regla 4 — Secciones 3 y 5 pobladas

El archivo debe contener:

- Una seccion cuyo encabezado nivel 2 (`##`) contenga el patron `Codigo` o `codigo` con la idea de "permiso" (regex aproximada: `^##\s+.*[Cc]odigos?\s+de\s+permis`). El cuerpo de esa seccion (hasta el siguiente `^##` o EOF) debe tener al menos 80 caracteres no-template tras la limpieza descrita en regla 3.
- Una seccion cuyo encabezado nivel 2 (`##`) refleje "Como aplicar un permiso" o equivalente (regex aproximada: `^##\s+.*[Cc]omo\s+aplicar`). El cuerpo de esa seccion debe tener al menos 80 caracteres no-template y, idealmente, contener al menos un bloque de codigo (` ``` `). El bloque de codigo no es estrictamente obligatorio (el repo puede explicar el patron en prosa), pero su ausencia degrada la confianza.

Si el repo usa nombres de seccion diferentes pero las dos ideas estan presentes con cuerpo sustantivo, el evaluador puede aceptar mediante inspeccion humana. La regla automatica privilegia los nombres canonicos.

## Heuristica completa, en pseudo-codigo

```
def es_documento_sustantivo(ruta):
    if not file_exists(ruta) or not is_regular_file(ruta):
        return False  # Regla 1

    contenido = read(ruta)

    if "STUB NO DOCUMENTADO" in contenido:
        return False  # Regla 2

    contenido_limpio = remove_blank_lines(contenido)
    contenido_limpio = remove_pure_markers(contenido_limpio)
    contenido_limpio = remove_stub_placeholders(contenido_limpio)

    if len(contenido_limpio) <= 300:
        return False  # Regla 3

    seccion_codigos = extract_section(contenido, regex=r"^##\s+.*[Cc]odigos?\s+de\s+permis")
    seccion_aplicar = extract_section(contenido, regex=r"^##\s+.*[Cc]omo\s+aplicar")

    if not seccion_codigos or len(clean(seccion_codigos)) < 80:
        return False  # Regla 4 (sub-condicion seccion 3)

    if not seccion_aplicar or len(clean(seccion_aplicar)) < 80:
        return False  # Regla 4 (sub-condicion seccion 5)

    return True
```

## Cuando dudar, dudar a favor de `no_documentado`

Si el evaluador encuentra ambiguedad (regla 4 aproximada, archivo a punto de cumplir el umbral, secciones con nombres no canonicos), tratar como `no_documentado` y disparar la pregunta al usuario. Falsos positivos generan trabajo innecesario; falsos negativos en seguridad son riesgo material. Preferir el costo del primero.

## Quien aplica esta heuristica

- `agent-os/experts/bmad-agent-alfred/abordaje/fase-2-recolectar.md` seccion "Validaciones que Fase 2 puede accionar" — aplicacion automatica dentro de Fase 2 del abordaje cuando la ruta probable es `bugfix`/`acotado`/`diseno`. Si la heuristica falla (`no_documentado`), abordaje agrega a la propuesta de Fase 4 que Sentinel sera invitado como co-anfitrion en el flujo posterior con mision `[DP]`. Para rutas `responder`/`investigacion`/`documentacion`, esta validacion no aplica.
- `agent-os/experts/bmad-agent-sentinel/references/documentar-patron-permisos.md` (capacidad `[DP]`) — aplicacion en el paso 4 ("Validar contra la heuristica") tras producir el archivo, para confirmar que pasa antes de cerrar la etapa donde Sentinel fue invitado como co-anfitrion.
- `agent-os/experts/bmad-agent-sentinel/references/verificar-permisos-aplicados.md` (capacidad `[VP]`) — aplicacion implicita: si la heuristica fallaria, CS-3 reporta que el catalogo no esta sincronizado de manera fiable.

## Si el repo declara `permisos_repo_path` (caso `documentado_externo`)

Aplicar la misma heuristica al archivo apuntado. Si el archivo apuntado tampoco pasa, volver a preguntar al usuario dentro del abordaje (Fase 2) y reformular la ruta. La ruta puede ser absoluta o relativa al `project-root`; en cualquier caso debe estar dentro del repo (rechazar rutas fuera).
