---
name: visual-documentation
description: Documentacion visual automatizada con screenshots anotados y PDF
menu-code: DOC
---

# Documentacion Visual Automatizada

**Goal:** Capturar screenshots anotados de cada paso de un flujo de usuario y generar documentacion visual completa (Markdown con imagenes, PDF con headers/footers). Producir manuales de usuario automatizados que cuenten una narrativa, no una galeria de capturas.

## Contexto del usuario

Antes de documentar, entender:

- Flujos a documentar (o explorar la app para proponerlos)
- Audiencia del documento: usuario final, soporte tecnico, QA, stakeholders
- Formato de salida: Markdown con imagenes, PDF, o ambos
- Branding: headers/footers corporativos, logo, colores (para PDF)
- Dispositivos: desktop solo, o incluir mobile/tablet
- Datos sensibles a enmascarar (nombres, emails, datos medicos, etc.)

## Herramientas de captura

### Screenshots via MCP

- `browser_take_screenshot(raw?)` -- captura completa de la pagina visible
- Para elementos especificos, usar `browser_evaluate()` para inyectar highlight CSS antes de capturar

### Anotacion de screenshots

Antes de capturar, inyectar anotaciones visuales via `browser_evaluate()`:

- **Highlights:** Bordes de color alrededor del elemento activo del paso
- **Badges numerados:** Circulos con numeros (1, 2, 3...) indicando orden de accion
- **Tooltips:** Texto explicativo cerca de elementos clave

Patron de inyeccion:
```javascript
// Ejemplo: highlight + badge en un elemento
const el = document.querySelector('#submit-btn');
el.style.outline = '3px solid #FF0000';
const badge = document.createElement('div');
badge.textContent = '3';
badge.style.cssText = 'position:absolute;...';
el.parentElement.appendChild(badge);
```

Remover anotaciones despues de capturar para no contaminar el siguiente paso.

### Masking de datos sensibles

Antes de capturar, usar `browser_evaluate()` para reemplazar contenido sensible con placeholders:
- Nombres: "Juan Perez" -> "[Nombre Usuario]"
- Emails: "juan@email.com" -> "[email@ejemplo.com]"
- Datos medicos, financieros, etc.

El usuario define que datos enmascarar. En caso de duda, preguntar.

### Multi-device

Para documentacion que incluya multiples dispositivos:
1. Documentar flujo completo en desktop (`browser_resize(1280, 720)`)
2. Repetir pasos clave en mobile (`browser_resize(375, 812)`)
3. Incluir ambas versiones en el documento con etiquetas claras

## Estructura del documento

### Markdown con imagenes

```markdown
# Manual de Usuario: {Nombre del Flujo}

## Descripcion general
{Que logra el usuario con este flujo y cuando lo necesita}

## Requisitos previos
{Que necesita el usuario antes de empezar}

## Paso 1: {Accion del usuario}
{Descripcion de lo que el usuario debe hacer y por que}

![Paso 1 - {descripcion}](./screenshots/flujo-paso-01.png)

## Paso 2: {Accion del usuario}
...

## Resultado esperado
{Que ve el usuario al completar el flujo exitosamente}

## Problemas comunes
{Errores frecuentes y como resolverlos}
```

### Generacion de PDF

Usando `browser_evaluate()` y `browser_navigate()` para renderizar el Markdown como HTML y luego capturar, o usando Playwright API directamente:

- `page.pdf()` para documentos completos (requiere Chromium headless)
- Opciones: format (A4/Letter), margins, headerTemplate, footerTemplate, printBackground, displayHeaderFooter
- Clases especiales en templates: `pageNumber`, `totalPages`, `date`, `title`, `url`
- PDF accesible: `tagged: true` para tags de accesibilidad, `outline: true` para TOC desde headings

### Definicion de flujos en YAML

Para flujos recurrentes, definir la secuencia documentable:

```yaml
flow:
  name: "Registro de paciente"
  audience: "Personal administrativo"
  steps:
    - navigate: "https://app.example.com/patients/new"
      description: "Acceder al formulario de nuevo paciente"
      highlight: "#patient-form"
    - fill: "#name"
      value: "[Nombre Paciente]"
      description: "Ingresar nombre completo"
    - click: "#save-btn"
      description: "Guardar el registro"
      wait_for: ".success-message"
  mask:
    - "#patient-ssn"
    - ".patient-email"
```

## Calidad de la documentacion

- Cada screenshot tiene un proposito claro -- no capturar por capturar
- Las descripciones explican el "por que", no solo el "que"
- Los pasos siguen la perspectiva del usuario, no la del desarrollador
- Estados de error documentados: que ve el usuario si algo sale mal
- Consistencia visual: mismo viewport, mismas anotaciones, mismo estilo

## Output

Documentacion generada en la ubicacion configurada (o `{project-root}/_bmad/docs/visual/` por defecto):

> **Flujo documentado:** {nombre}
> **Audiencia:** {quien lo va a leer}
> **Formato:** Markdown / PDF / ambos
> **Pasos capturados:** {N} con {X} screenshots
> **Dispositivos:** desktop / mobile / ambos
> **Datos enmascarados:** si/no

Actualizar memoria con flujos documentados y ubicacion de los artefactos.
