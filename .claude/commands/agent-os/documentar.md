# Documentar

Comando para producir y mantener documentacion estructurada de modulos y procesos del proyecto en `.documentacion/`.

Estilo `subcomandos` consistente con `/alfred` y `/disenar`. Cada subcomando vive en `agent-os/skills/documentar/references/{subcomando}.md`.

## Uso

```
/documentar                              # Equivalente a /documentar status
/documentar status                       # Progreso de documentacion por modulo
/documentar explorar [modulo]            # Arqueologo lanza exploracion autonoma
/documentar explorar [modulo] --desde-work {work-id}   # Parte del work-record cerrado
/documentar sesion [tema]                # Sesion interactiva de descubrimiento con usuario
/documentar sesion [tema] --desde-work {work-id}       # Agenda inicial desde work-record
/documentar consolidar [modulo]          # Technical-writer consolida hallazgos
/documentar consolidar [modulo] --desde-work {work-id} # Consolida con cita al work-id
/documentar manual [modulo] [rol]        # Manual de usuario por rol (clinico/admin/tecnico)
/documentar tests [modulo]               # Casos de prueba desde documentacion tecnica
/documentar retomar [archivo-sesion]     # Retomar sesion pausada
```

## Subcomandos

### `/documentar explorar [modulo] [--desde-work {work-id}]`

Lanza el agente arqueologo `doc-system-archaeologist` para explorar autonomamente un modulo del codebase y producir hallazgos + preguntas pendientes en `.claude/rol-documentacion/workflows/{slug}/01-exploracion/`.

Ver: `agent-os/skills/documentar/references/explorar.md`.

### `/documentar sesion [tema] [--desde-work {work-id}]`

Inicia sesion interactiva de descubrimiento con el usuario sobre un tema, conducida por `doc-knowledge-session`. Resuelve preguntas pendientes del arqueologo o explora areas no cubiertas.

Ver: `agent-os/skills/documentar/references/sesion.md`.

### `/documentar consolidar [modulo] [--desde-work {work-id}]`

Consolida hallazgos del modulo en documentacion estructurada en `.documentacion/02-dominios-negocio/{modulo}/`, conducido por `doc-technical-writer`.

Con `--desde-work`: actualiza `cosecha.documentacion` en el README del work al completar.

Ver: `agent-os/skills/documentar/references/consolidar.md`.

### `/documentar manual [modulo] [rol]`

Genera manual de usuario del modulo para el rol especificado, conducido por `doc-manual-writer`. Roles: `clinico`, `administrativo`, `tecnico`.

Ver: `agent-os/skills/documentar/references/manual.md`.

### `/documentar tests [modulo]`

Disena casos de prueba desde la documentacion tecnica del modulo.

Ver: `agent-os/skills/documentar/references/tests.md`.

### `/documentar retomar [archivo-sesion]`

Retoma una sesion de conocimiento pausada (preserva contexto previo).

Ver: `agent-os/skills/documentar/references/retomar.md`.

### `/documentar status`

Muestra progreso de documentacion por modulo: que esta cubierto, que esta pendiente, que sesiones hay activas.

Ver: `agent-os/skills/documentar/references/status.md`.

## Modo `--desde-work {work-id}` (aplica a `explorar`, `sesion`, `consolidar`)

1. Verificar que el work esta `COMPLETADO`. Si no, detener.
2. Para `consolidar`: verificar `cosecha.documentacion.ejecutado` en frontmatter del README del work. Si es `true`, AskUserQuestion: re-ejecutar (acumula) o saltar.
3. Leer work-record completo + identificar modulos afectados (frontmatter `modulos[]` o derivar de archivos modificados en tareas).
4. Para cada modulo afectado:
   - **`explorar --desde-work`**: el arqueologo arranca con el work-record como punto de entrada (en vez de "explora el modulo X desde cero"). Detecta huecos de documentacion en `.documentacion/02-dominios-negocio/{modulo}/` para lo que el work toco.
   - **`sesion --desde-work`**: la sesion de descubrimiento usa el work-record como agenda inicial (preguntas pendientes especificas a lo que el work revelo).
   - **`consolidar --desde-work`**: el technical-writer consolida en `.documentacion/02-dominios-negocio/{modulo}/` el conocimiento generado por el work, marcando explicitamente las secciones nuevas/actualizadas con cita al work-id.
5. Para `consolidar`: al completar exitosamente, actualizar `cosecha.documentacion` del README del work:
   ```yaml
   cosecha:
     documentacion:
       ejecutado: true
       fecha: "{fecha de hoy}"
       por: "{dev-name}"
       archivos_actualizados: [{lista de paths actualizados en .documentacion/}]
       nota: "string corta opcional"
   ```

**Sin flag**: comportamiento de los `~/.claude/commands/doc/*` originales (parte de "nombre de modulo" o tema).
