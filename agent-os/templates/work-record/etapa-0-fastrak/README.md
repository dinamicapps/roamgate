# Plantilla: etapa-0 fastrak (colaborador)

Carpeta plantilla para `etapa-0/` de un work-record tipo `colaborador-fastrak`. Se usa cuando una skill de bridge-session crea el work-record en el repo colaborador.

## Archivos

- `manifiesto-recibido.yml` - copia del manifiesto descargado del bridge. Cada nueva version se guarda como `manifiesto-recibido.v{N}.yml`.
- `evaluacion-expertos.md` - consolidado de hallazgos de los expertos del colaborador (Patron B) que evaluaron el manifiesto. Las posturas individuales viven en `experto-{nombre}.md` (un archivo por experto).
- `clasificacion.yml` - estado de cada item del manifiesto: aprobado | rechazado | pendiente_autorizacion_a | pendiente_autorizacion_b.
- `publicaciones/` - archivos versionados que se suben al bridge con destinatario explicito (director / colaborador:X).
- `autorizaciones/` - historial de solicitudes Tipo A (director) y Tipo B (usuario local).

Ver tambien:
- `agent-os/skills/bridge-session/references/fase-7-work-colaborador.md`
- `agent-os/skills/bridge-session/references/autorizacion-dual.md`
