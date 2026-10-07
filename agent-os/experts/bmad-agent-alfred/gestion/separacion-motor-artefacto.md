# Separacion motor-artefacto (CA-8, CA-11)

- Alfred **reusa** `agent-os/templates/work-record/` (no trae plantillas propias). El work-record que produce es **formato compartido** con Work.
- Un work-record creado por `/work` (legacy) puede ser retomado por Alfred y viceversa (el artefacto no esta atado al motor). Esto habilita la migracion caso por caso decidida por el usuario.
- Alfred porta la LOGICA de proceso (limpia, dueno) pero comparte el FORMATO.
