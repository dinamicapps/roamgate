# Plantilla: mockup HTML estatico

**Uso:** Sally usa este template como base cuando elige "HTML estatico" en el arbol de decision de medio del prototipo (Sub-fase 5.a del guion).

**Caracteristicas del HTML resultante:**
- Autocontenido (Bootstrap 5 o Tailwind desde CDN — Sally elige segun `project-context.md` del proyecto)
- Dos secciones lado a lado o toggle: **Antes** (reconstruccion de la UI actual) y **Despues** (propuesta)
- Sin JavaScript real — las interacciones se describen en tooltips o notas al pie
- Comentarios HTML inline explicando cada cambio visible

## Template

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rediseno: {nombre del scope}</title>
  <!-- Sally elige Bootstrap 5 o Tailwind segun project-context.md del proyecto -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { padding: 1rem; }
    .prototipo-header { background: #f8f9fa; padding: 1rem; margin-bottom: 1rem; border-left: 4px solid #0d6efd; }
    .comparativa { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .version { border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem; }
    .version-antes { background: #fff3cd; }
    .version-despues { background: #d1e7dd; }
    .nota-cambio { font-size: 0.85em; color: #6c757d; font-style: italic; margin-top: 0.5rem; }
    @media (max-width: 992px) { .comparativa { grid-template-columns: 1fr; } }
  </style>
</head>
<body>

  <div class="prototipo-header">
    <h1>Rediseno: {scope}</h1>
    <p><strong>Direccion aprobada:</strong> {titulo de la short-list}</p>
    <p><strong>Metricas objetivo:</strong> {lista}</p>
  </div>

  <div class="comparativa">

    <!-- VERSION ANTES -->
    <div class="version version-antes">
      <h2>Antes</h2>
      <!-- Reconstruccion de la UI actual. Sally descompone campo por campo. -->
      <!-- ... -->
      <p class="nota-cambio">Observa: {punto critico de la UI actual — ej: "28 controles visibles simultaneamente"}</p>
    </div>

    <!-- VERSION DESPUES -->
    <div class="version version-despues">
      <h2>Despues</h2>
      <!-- Propuesta visual. Cada cambio lleva comentario HTML inline:
           <!-- CAMBIO: campo "Fecha" pasa a mascara automatica — antes era 3 campos separados (dd, mm, yyyy) -->
      -->
      <!-- ... -->
      <p class="nota-cambio">Resultado: {metricas alcanzadas — ej: "17 controles visibles; primeros 3 cubren el 80% del uso"}</p>
    </div>

  </div>

  <!-- Notas y decisiones -->
  <div class="mt-4">
    <h3>Decisiones visibles en este prototipo</h3>
    <ul>
      <li><strong>A-001 Boton Guardar — MANTENER:</strong> accion critica, sin cambio.</li>
      <li><strong>A-003 Tab Historial — FUSIONAR con Tab Auditoria:</strong> un solo tab con filtro por tipo de evento.</li>
      <!-- ... una linea por decision relevante -->
    </ul>
  </div>

</body>
</html>
```

## Reglas de uso

- **Responsive:** la rejilla comparativa colapsa a una columna en <992px.
- **Sin JS:** el prototipo es visual. Si una interaccion es critica, describela en la nota al pie del bloque.
- **Comentarios HTML inline:** cada cambio visible va acompanado de `<!-- CAMBIO: ... -->` para que el dev vea la intencion al leer el codigo.
- **Tailwind como alternativa:** si el proyecto usa Tailwind, sustituir el link de Bootstrap por `<script src="https://cdn.tailwindcss.com"></script>` y adaptar clases.
