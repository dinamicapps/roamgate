---
name: security-audit
description: Auditoria de seguridad web con Playwright MCP
menu-code: SEC
---

# Auditoria de Seguridad Web

**Goal:** Ejecutar validaciones de seguridad web usando Playwright MCP: headers HTTP, cookies, XSS, CSRF, accesibilidad (axe-core), OWASP Top 10 patterns, GDPR compliance. Producir un reporte accionable con hallazgos priorizados por severidad y evidencia concreta.

## Contexto del usuario

Antes de auditar, entender:

- URL de la aplicacion y entorno (desarrollo/staging -- NUNCA produccion sin autorizacion explicita)
- Alcance: auditoria completa o areas especificas (headers, auth, XSS, etc.)
- Credenciales de prueba si la app requiere autenticacion
- Modelo de amenazas: que tipo de datos maneja (salud, financieros, PII) -- esto cambia la prioridad de hallazgos
- Normativa aplicable: OWASP, GDPR, HIPAA, ley local de proteccion de datos

## Areas de auditoria

### 1. Headers de seguridad

Verificar presencia y configuracion correcta via `browser_network_requests`:

| Header | Expectativa | Severidad si falta |
|--------|------------|-------------------|
| Content-Security-Policy | Presente, restrictivo | Alta |
| Strict-Transport-Security | `max-age>=31536000; includeSubDomains` | Alta |
| X-Content-Type-Options | `nosniff` | Media |
| X-Frame-Options | `DENY` o `SAMEORIGIN` | Media |
| Referrer-Policy | `strict-origin-when-cross-origin` o mas restrictivo | Media |
| Permissions-Policy | Presente, restringido | Baja |
| X-XSS-Protection | `0` (o ausente si CSP activo) | Baja (legacy) |

Verificar via `browser_evaluate()`:
```javascript
// Obtener headers de respuesta
const response = await fetch(window.location.href);
const headers = Object.fromEntries(response.headers.entries());
```

### 2. Cookies de seguridad

Inspeccionar cookies via `browser_evaluate()`:

```javascript
document.cookie; // cookies accesibles desde JS
```

Validar para cada cookie de sesion:
- `httpOnly` -- debe ser true (si es accesible desde JS, es explotable via XSS)
- `secure` -- debe ser true en HTTPS
- `sameSite` -- debe ser `Strict` o `Lax`
- Expiracion razonable para el tipo de sesion

### 3. XSS (Cross-Site Scripting)

Usar `browser_type()` para inyectar payloads en campos de entrada y `browser_handle_dialog()` para detectar ejecucion:

**Payloads basicos a probar:**
- `<script>alert('xss')</script>`
- `<img src=x onerror=alert('xss')>`
- `"><script>alert('xss')</script>`
- `javascript:alert('xss')`
- `<svg onload=alert('xss')>`

**Flujo:** Inyectar payload -> submit -> verificar si el payload se ejecuta (dialog aparece) o se renderiza sin sanitizar en el DOM.

**Tipos a cubrir:**
- Reflected: payload en parametros de URL
- Stored: payload guardado y renderizado en otra pagina
- DOM-based: payload manipula el DOM directamente

### 4. CSRF (Cross-Site Request Forgery)

Verificar:
- Presencia de tokens CSRF en formularios (buscar en snapshot: inputs hidden con nombres como `_csrf`, `_token`, `csrf_token`)
- Tokens cambian entre requests
- Servidor rechaza requests sin token o con token invalido (probar via `browser_evaluate` con fetch)
- Cookie SameSite como segunda linea de defensa

### 5. Autenticacion y sesiones

- **Login:** Probar mensajes de error genericos (no revelar si el usuario existe)
- **Brute force:** Verificar rate limiting o lockout despues de N intentos fallidos
- **Session management:** Verificar que la sesion expira, que el logout invalida la sesion
- **JWT (si aplica):** Verificar que tokens expiran, que la firma se valida
- **Privilege escalation:** Si hay roles, verificar que un usuario basico no accede a rutas de admin

### 6. OWASP Top 10 patterns

Evaluacion rapida de los patrones mas criticos:

- **A01 Broken Access Control:** Probar URLs de admin sin autenticacion, manipular IDs en URLs
- **A02 Cryptographic Failures:** Verificar HTTPS, buscar datos sensibles en URLs o localStorage
- **A03 Injection:** SQL injection basico en campos de busqueda/filtro, command injection si hay inputs que ejecutan
- **A05 Security Misconfiguration:** Headers faltantes, error pages verbose, directorios listados
- **A07 Authentication Failures:** Cubierto en seccion 5
- **A09 Security Logging:** Verificar que acciones sensibles generan entradas observables

### 7. Accesibilidad como seguridad

Usar `browser_snapshot()` para evaluar el accessibility tree:

- Campos de formulario sin labels (impacta usabilidad Y seguridad -- usuarios con screen reader pueden enviar datos al campo equivocado)
- Links sin texto descriptivo
- Contraste insuficiente para elementos criticos
- Formularios sin autocomplete apropiado (password managers no pueden ayudar = passwords debiles)
- Falta de focus management en modals/dialogs (tab trapping)

Para evaluacion completa con axe-core, inyectar via `browser_evaluate()`:
```javascript
// Si axe-core esta disponible o se puede cargar
const results = await axe.run();
```

### 8. Network y datos sensibles

Via `browser_network_requests`:
- Datos sensibles en URLs (tokens en query params, PII en GET requests)
- Mixed content (HTTP resources en pagina HTTPS)
- APIs que retornan mas datos de los necesarios (over-fetching)
- Requests sin autenticacion a endpoints que deberian requerirla

### 9. GDPR / Privacidad

- Banner de cookies presente y funcional
- Respeta la eleccion: si se rechazan cookies, no hay tracking
- Politica de privacidad accesible
- Opcion de eliminar cuenta / datos del usuario

## Clasificacion de hallazgos

| Severidad | Criterio | Accion |
|-----------|----------|--------|
| Critica | Explotable inmediatamente, compromete datos | Fix urgente |
| Alta | Explotable con esfuerzo moderado | Fix en el sprint actual |
| Media | Debilidad que facilita ataques combinados | Planificar fix |
| Baja | Mejora de defensa en profundidad | Backlog |
| Info | Observacion, best practice | Documentar |

## Output

Reporte de auditoria con:

> **URL auditada:** {url}
> **Entorno:** {dev/staging}
> **Alcance:** {areas auditadas}
> **Hallazgos:** {N criticos} / {N altos} / {N medios} / {N bajos} / {N info}
>
> ### Hallazgos criticos y altos
> {Cada uno con: descripcion, evidencia, impacto, remediacion sugerida}
>
> ### Resumen de headers y cookies
> {Tabla de compliance}
>
> ### Proximos pasos recomendados
> {Priorizado por riesgo}

Guardar reporte en `{work_output_path}` o `{project-root}/_bmad/docs/security/` por defecto.

Actualizar memoria con resultados de la auditoria, hallazgos pendientes de remediacion, y proximas areas a revisar.
