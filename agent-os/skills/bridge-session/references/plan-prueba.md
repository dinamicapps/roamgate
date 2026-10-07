# Fase 2: Plan de Prueba Coordinado

## Objetivo

Antes de ejecutar NADA, definir que se va a probar, en que orden, y que esperar. Solo el Director genera el plan. Los participantes aportan informacion y el Director consolida.

## Solo el Director ejecuta esta fase

Si esta instancia es Colaborador, esperar a que el Director publique el plan al grupo. Al recibirlo, confirmar que se entendio.

## Flujo (Director)

### 1. Solicitar aportes de los participantes

Publicar al grupo pidiendo que cada instancia comparta los puntos de integracion de su lado:

```
bridge_publicar(id_grupo, "request", "Para el plan de prueba necesito que cada participante comparta: 1) Endpoints/APIs que expone para integracion, 2) Endpoints/APIs que consume del otro sistema, 3) Flujos de negocio que cruzan ambos sistemas, 4) Precondiciones de su lado (sistema levantado, datos necesarios)")
```

Las respuestas llegan por push (modo channel) como `<channel ...>`; procesarlas al
llegar. Solo en modo polling, o si `bridge_estado` reporta el channel degradado, jalar
con `bridge_leer` (fallback). NO montar `/loop` para recibir en channel.

### 2. Definir checkpoints de integracion

Con la informacion de los participantes, generar la lista ordenada de checkpoints. Cada checkpoint:

```markdown
### CP-{NNN}: {descripcion corta}
- **Descripcion:** {que se prueba exactamente}
- **Ejecuta:** {instancia responsable de ejecutar la accion}
- **Verifica:** {instancia responsable de verificar desde su lado}
- **Precondiciones:** {que debe estar listo antes — sistemas, datos, configuracion}
- **Accion:** {paso a paso de que hacer}
- **Resultado esperado:** {que se considera PASS}
- **Evidencia requerida:** {que capturar — log, screenshot, response body, network request}
```

### 3. Definir orden de ejecucion

- **Lineal:** CP-001 → CP-002 → CP-003 (por defecto)
- **Con dependencias:** CP-003 depende de CP-001 y CP-002
- **Criticos:** marcar checkpoints que si fallan, detienen toda la sesion

### 4. Presentar plan al usuario

AskUserQuestion:
  question: "=== PLAN DE PRUEBA === {N} checkpoints definidos. Criticos: {lista}. Revisar y aprobar."
  options:
    - label: "Aprobar plan"
      description: "El plan esta correcto. Avanzar a datos compartidos."
    - label: "Ajustar"
      description: "Necesito modificar checkpoints, orden o criterios."
    - label: "Debatir [P]"
      description: "Party Mode para que los expertos revisen el plan."

### 5. Publicar plan al grupo

Una vez aprobado por el usuario:

```
bridge_actualizar_grupo(id_grupo, metadata: '{"plan_de_prueba": {"checkpoints": [...], "escenario": "...", "criterios_exito": "...", "checkpoints_criticos": [...]}}}')
```

Publicar notificacion al grupo:
```
bridge_publicar(id_grupo, "contexto", "Plan de prueba publicado con {N} checkpoints. Revisar metadata del grupo.", metadata: '{"subtipo": "plan-de-prueba"}')
```

### 6. Confirmacion de participantes

Cada participante debe confirmar que leyo y entendio el plan. Esperar confirmaciones antes de avanzar a Fase 3.
