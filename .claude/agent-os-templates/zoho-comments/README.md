# Templates de comentarios Zoho

Los 4 templates que Quinn rellena al cerrar E4 (PRE_CIERRE) y que el QA externo usa al revisar. El skill `zoho-sprints-integration` los lee durante `generar-comentarios-cierre`.

## Templates

- `comment-technical.md` — Quinn al cerrar E4. Registro tecnico (clases, metodos, endpoints, archivos, commits).
- `comment-executive.md` — Quinn al cerrar E4. Registro ejecutivo (procesos, resultados de negocio). Sin tecnicismos ni codigos internos del work.
- `comment-qa-approved.md` — QA externo al aprobar un item en revisar-qa.
- `comment-qa-rejected.md` — QA externo al rechazar un item. El skill `consolidar-rechazos` parsea este template para extraer motivo y acciones.

## Variables comunes

Entre `{{ }}` (ejemplo: `{{problema}}`). Cada template declara sus variables en la primera linea del archivo. El skill `generar-comentarios-cierre` las rellena con contenido derivado del work.

## Regla de registros (2026-04-24)

Los comentarios de Quinn NUNCA mencionan T-NNN, CA-NNN ni slug del work. El ejecutivo habla de procesos y resultados. El tecnico habla de clases, metodos, endpoints, tablas, commits.
