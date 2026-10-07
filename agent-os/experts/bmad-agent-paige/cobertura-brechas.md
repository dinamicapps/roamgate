# cobertura-brechas.md -- libro-mayor de brechas de cobertura del experto (subconjunto del contrato de alta). Nebulosa-only. NO carga al activar.
- efecto_esperado: experto evaluar-cobertura --experto paige deja de reportar la brecha del punto 6 (la re-evaluacion ya no la lista)
  estado: cerrada
  evidencia: 'SKILL.md de Paige sin seccion ## Capabilities; sus 6 capacidades (DP/WD/MG/VD/EC/SM) viven solo en el menu On Activation (lineas 80-89), no en el formato canonico que C6-4 y el evaluador buscan'
  fecha: "2026-07-15"
  id: B-paige-001
  propuesta: 'Agregar seccion ## Capabilities tras ## Principles en agent-os/experts/bmad-agent-paige/SKILL.md, transcribiendo las 6 capacidades del menu On Activation en formato | Code | Description | Route | (modelo Tessa), Route=Load ./references/{archivo}.md. Conservar el menu On Activation (coexisten: tabla=declaracion canonica, menu=presentacion interactiva). No tocar el registry (Paige no declara codigos alli; C6 sigue limpio).'
  punto: 6
  revision:
    evidencia: standard/cobertura-paige-p6
    fecha: "2026-07-15"
    razon: 'aplicada la tabla ## Capabilities (6 filas DP/WD/MG/VD/EC/SM); re-evaluacion da brechas vacio para el punto 6; lint 0 C1..C6'
    resultado: cerrada
