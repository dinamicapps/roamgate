# reflexion-adn.md -- buffer drenable gestionado por agentos. NO editar a mano.
- arte: comunicar
  categoria: acierto-repetible
  causa_atribuida: T-003..T-007 cambiaron nombres y entradas respecto del brief.
  disparador: cuando se documenta una feature cuyo diseno cambio durante la implementacion
  evidencia:
    - ancla: docs/ARCHITECTURE.md:263
      tipo: codebase
    - ancla: 20261012-tab-archivos-vinculado/T-008
      tipo: work-record
  fecha: "2026-10-12"
  leccion_candidata: Documentar desde el codigo final y verificar cada texto visible contra su fuente antes de cerrar.
  observacion: La documentacion se escribio contrastando cada atajo y texto con el codigo (shortcutBindings.ts) en vez de copiar el diseno, y detecto una receta de captura y una etiqueta de atajo obsoletas.
  verificacion:
    detalle: el revisor no encuentra textos documentados que difieran de la UI
    tipo: humana
  work: "20261012-tab-archivos-vinculado"
