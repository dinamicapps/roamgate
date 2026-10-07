# Party Mode — {tema}

**Trabajo**: {YYYYMMDD-nombre-del-trabajo}
**Fecha**: {YYYY-MM-DD}
**Agentes**: {lista de participantes}
**Activacion**: automatica (conflicto) / manual (usuario)

---

<!-- Esta plantilla es referencia del formato de party mode.
     El contenido real se distribuye asi:
     - Respuestas de cada experto -> experto-{nombre}.md (entradas tipo "Party Mode — R{N}")
     - Metadata de flujo -> bitacora.md (entradas tipo "Party Mode iniciado/completada/cerrado")
     
     Work construye el contexto de cada ronda leyendo los archivos de expertos.
     NO se crea un archivo party-{timestamp}.md separado — la bitacora y los archivos
     de experto son suficientes. -->

## Modelo de rondas

### Ronda 1 (Paralela): Perspectivas independientes
- Todos los agentes se lanzan en paralelo (Agent tool calls en un solo mensaje)
- Cada uno da su perspectiva SIN ver a los demas
- Garantiza diversidad genuina de pensamiento
- Respuestas se presentan al usuario inmediatamente
- Se guardan en experto-{nombre}.md de cada participante

### Ronda 2 (Automatica): Escucha y replica
- Work lee los archivos de experto de R1 y construye el contexto cruzado
- Cada agente recibe las respuestas COMPLETAS de R1 de todos los demas
- Reacciona: cambia posicion, refuerza, senala desacuerdos, pregunta a otro
- Solo aporta lo NUEVO (no repite R1)
- Tambien paralelo (todos leen el mismo contexto)
- Se puede saltar con --no-reply

### Ronda 3+ (Condicional): Solo si hay tension no resuelta
- Auto-trigger si: pregunta directa entre agentes o contradiccion sin resolver
- NO auto-trigger si: convergencia, respuestas cortas, "mantengo mi posicion"
- Maximo 3 rondas automaticas. Despues, el usuario decide.

## Cierre

Work registra en bitacora.md:
- Acuerdos
- Tensiones no resueltas
- Preguntas abiertas

## Opciones del usuario al cerrar

| Opcion | Accion |
|--------|--------|
| De acuerdo | Aceptar sintesis y continuar flujo |
| Otra ronda | Lanzar nueva ronda con contexto acumulado |
| Profundizar con {agente} | Spawn individual con contexto completo |
| Debatir punto especifico | Nueva sesion party sobre subtema |
