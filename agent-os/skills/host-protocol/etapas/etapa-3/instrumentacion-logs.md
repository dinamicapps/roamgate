# Etapa 3 — Instrumentacion temporal de logs

> Tarjeta consultable de Etapa 3. Se carga en el prompt del **ejecutor** (subagente) que esta a punto de escribir codigo nuevo o modificar codigo existente no trivial en modo `normal` (incl. legacy `evolucion`); en `nivel: minima` la carga el anfitrion mismo, porque ejecuta en la sesion principal sin subagentes. Movido desde `etapas/etapa-3.md` (Ola 5 T9, doctrina AI-friendly).

## Instrumentacion temporal de logs (modo normal, incl. legacy evolucion)

Quien escribe el codigo —el **ejecutor** despachado como subagente en `nivel: normal`/`maxima`, o el anfitrion (Amelia/Atlas) mismo cuando ejecuta en la sesion principal en `nivel: minima`— **debe instrumentar logs temporales** en los puntos clave del flujo afectado. Estos logs sirven para que Quinn pueda diagnosticar comportamiento durante las pruebas guiadas de E4 sin tener que detenerse a agregar prints. Son **temporales por contrato**: E4 los retira al cerrar pruebas exitosamente (ver `agent-os/skills/host-protocol/etapas/etapa-4/evidencia.md`).
<!-- FUENTE: agent-os/skills/host-protocol/references/despacho-subagentes.md seccion "Contrato del ejecutor". Quien instrumenta bajo despacho (el ejecutor) y como devuelve la lista al anfitrion viven alli. Aqui solo el QUE instrumentar y el formato. NO duplicar la regla — para modificar, editar la fuente. -->

### Que instrumentar

Por tarea con `tipo_tarea: codigo`, quien escribe el codigo identifica puntos donde un log temporal aporta valor diagnostico:

- **Entradas y salidas de metodos nuevos o modificados** — nivel `Information` con valores clave de entrada (sin PII) y resumen de salida.
- **Ramas condicionales no triviales** — nivel `Information` con la rama tomada y la razon (ej. valor del flag o permiso que la determino).
- **Llamadas a servicios externos o BL relevantes** — nivel `Information` con el servicio invocado y resumen de respuesta.
- **Casos de error capturados** — nivel `Warning` o `Error` segun severidad, con contexto suficiente para diagnostico sin filtrar datos sensibles.
- **Para tareas con `capa_seguridad.aplica: true` o `naturaleza: modulacion-comportamiento`:** el log sigue las mismas reglas de la capacidad `[IL]` de Sentinel (`agent-os/experts/bmad-agent-sentinel/references/instrumentacion-logs.md`).

### Marcadores obligatorios de reversibilidad

Todos los logs instrumentados se envuelven en regiones marcadas para que E4 pueda removerlos por grep. Dos marcadores segun proposito:

| Marcador | Cuando usarlo | Removible por |
|----------|----------------|----------------|
| `#region SENTINEL-SECURITY-LOG` / `#endregion` | Logs introducidos para auditar auth, permisos, sesiones, datos sensibles. | Capacidad `[IL]` de Sentinel (procedimiento "Removal" del reference). |
| `#region WORK-DEBUG-LOG` / `#endregion` | Logs de debug funcional para soportar verificacion en E4: entradas/salidas, ramas, errores capturados. | Anfitrion de E4 al cierre exitoso (grep + remove). |

Cada region debe llevar comentario interno con: fecha de inyeccion, work-record que la introdujo (slug), y proposito en una linea. Ejemplo:

```csharp
#region WORK-DEBUG-LOG
// Inyectado: 2026-04-26 — work 20260426-aprobacion-facturas-lote
// Proposito: trazar decision de aprobacion masiva para verificacion E4.
_logger.LogInformation("AprobarLote: {Cantidad} facturas, usuarioId={UserId}, permisoVerificado={Permiso}",
    facturas.Count, usu.Id, "EA047");
#endregion
```

### Registro en frontmatter de la tarea

Al cerrar cada tarea con `tipo_tarea: codigo` que haya instrumentado logs, el anfitrion agrega al frontmatter de la tarea un campo `logs_temporales_instrumentados` con la lista de archivos tocados. Bajo despacho (`nivel: normal`/`maxima`), el anfitrion **no instrumenta**: **recibe** esta lista del ejecutor y la **persiste** tal cual al frontmatter, sin re-derivarla. En `nivel: minima` el anfitrion la agrega directamente porque el mismo instrumento.

```yaml
logs_temporales_instrumentados:
  - archivo: "src/Controllers/Empresa/FacturasController.cs"
    marcador: "WORK-DEBUG-LOG"
    cantidad_regiones: 2
  - archivo: "src/BL/AprobacionMasivaBL.cs"
    marcador: "WORK-DEBUG-LOG"
    cantidad_regiones: 1
  - archivo: "src/Auth/SessionExtractor.cs"
    marcador: "SENTINEL-SECURITY-LOG"
    cantidad_regiones: 1
```

Quinn lee este campo al iniciar E4 y lo usa como mapa para verificar (durante pruebas) y remover (al cierre).

### Cuando NO instrumentar

- Tareas triviales sin logica nueva (ej. ajuste de constantes, cambio de strings de UI).
- Codigo en zonas calientes (loops apretados, paths de alta frecuencia) donde los logs degradarian rendimiento perceptiblemente — en ese caso, instrumentar fuera del loop o usar nivel `Debug` con flag controlable.
- Areas donde el sistema **no admite logging** (ej. ciertos jobs sin acceso al logger configurado). En ese caso, registrar en frontmatter `logs_temporales_instrumentados: [{archivo: "...", marcador: "N/A", razon: "sin logger disponible en este contexto"}]` para que Quinn lo sepa.
