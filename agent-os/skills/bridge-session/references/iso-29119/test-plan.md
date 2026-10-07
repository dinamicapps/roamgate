# Plan de Prueba de Integracion

> Template basado en ISO/IEC/IEEE 29119-3 Test Plan, adaptado para bridge-session.
> Generado por el Director. Se publica al grupo via `bridge_actualizar_grupo`.

---

```markdown
# Plan de Prueba — {nombre del grupo bridge}

plan_id: {UUID del grupo bridge}
fecha: {YYYY-MM-DD}
director: {nombre instancia directora}
estado: borrador | aprobado | en_ejecucion | completado | suspendido

## 1. Contexto

### 1.1 Sistemas bajo prueba
| Sistema | Repo | Instancia | Stack | Version/Commit |
|---------|------|-----------|-------|----------------|
| {nombre} | {repo} | {identidad bridge} | {stack tecnico} | {commit hash} |
| {nombre} | {repo} | {identidad bridge} | {stack tecnico} | {commit hash} |

### 1.2 Alcance
{Regla tipo "alcance" del grupo bridge — que se esta probando/desarrollando}

### 1.3 Fuera de alcance
{Que NO se prueba en esta sesion}

### 1.4 Tipo de sesion
- [ ] Pruebas con ajustes — sistemas ya implementados
- [ ] Desarrollo con pruebas en caliente — feature nueva cross-system

### 1.5 Supuestos y restricciones
- Archivos protegidos: {lista de reglas tipo "archivo_protegido"}
- Decisiones reservadas al usuario: {lista de reglas tipo "decision_reservada"}
- Direccion arquitectonica: {lista de reglas tipo "direccion_arquitectonica"}

## 2. Riesgos

### 2.1 Riesgos de producto
| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|-------------|---------|------------|
| RP-001 | {descripcion} | Alta/Media/Baja | Alto/Medio/Bajo | {como se mitiga} |

### 2.2 Riesgos de proyecto
| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|-------------|---------|------------|
| RY-001 | Sistema no disponible durante pruebas | Media | Alto | Punto de restauracion git. Reintento en siguiente sesion. |
| RY-002 | Instancia pierde conexion a mitad de sesion | Baja | Medio | Persistencia local + /alfred continuar + re-union al grupo. |

## 3. Criterios

### 3.1 Criterios de entrada (todos deben cumplirse para iniciar Fase 4)
- [ ] Build exitoso en todos los sistemas participantes
- [ ] Validacion cruzada completada (Fase 3): conectividad, auth, datos
- [ ] Plan de prueba aprobado por el usuario
- [ ] Puntos de restauracion git registrados

### 3.2 Criterios de exito
- Minimo {N}% de checkpoints PASS
- 0 checkpoints criticos en estado FAIL al cerrar
- Todos los CAs asociados verificados por al menos 1 checkpoint PASS

### 3.3 Criterios de suspension
La sesion se suspende automaticamente si:
- {N} checkpoints criticos fallan consecutivamente
- Un fallo requiere cambio mayor fuera de alcance y el usuario no esta disponible
- Un sistema se cae y no puede restaurarse en {N} minutos
- Se ejecuta un **Alto Total** via `bridge_solicitar_alto_total` (cualquier miembro puede solicitarlo; Director auto-confirma, otros requieren confirmacion del Director o consenso de emergencia por unanimidad)

### 3.4 Criterios de reanudacion
- El sistema caido esta operativo de nuevo
- El usuario autorizo continuar despues de la suspension
- Los puntos de restauracion estan verificados
- Si fue Alto Total: Director ejecuta `bridge_reanudar_grupo` (restaura solicitudes pausadas)

## 4. Checkpoints

{Usar template test-case.md para cada checkpoint — ver archivo separado}

### Resumen de checkpoints
| CP | Descripcion | CA asociados | Ejecuta | Verifica | Critico | Idempotente |
|----|------------|-------------|---------|----------|---------|-------------|
| CP-001 | {desc} | CA-001, CA-007 | {inst} | {inst} | Si/No | Si/No |
| CP-002 | {desc} | CA-002 | {inst} | {inst} | Si/No | Si/No |

### Orden de ejecucion
CP-001 → CP-002 → CP-003
{Si hay dependencias: CP-003 depende de CP-001 y CP-002}

### Pivot point
Despues de CP-{NNN}, no se puede hacer rollback limpio de datos.
Checkpoints posteriores al pivot solo admiten forward recovery.

## 5. Datos de prueba

{Resumen de la Fase 3 — ver test-environment.md por instancia para detalle}

### Datos compartidos entre sistemas
| Dato | Sistema origen | Valor | Referenciado por |
|------|---------------|-------|-----------------|
| JWT_SECRET | compartido | {valor} | ambos sistemas |
| Empresa demo | Pedidos | "Ferreteria El Tornillo" (ID: 1) | Inventario referencia empresa_id |
| Producto TORN-001 | Inventario | Tornillo 1/4, stock: 1000 | Pedidos referencia codigo |

## 6. Metricas a recopilar
- Checkpoints ejecutados / total
- Checkpoints PASS / FAIL / BLOCKED
- CAs verificados / total
- Incidentes por severidad (Critical/High/Medium/Low)
- Solicitudes de modificacion: total, aprobadas, rechazadas
- Tiempo total de sesion

## 7. Roles y responsabilidades

| Rol | Instancia | Responsabilidades |
|-----|-----------|-------------------|
| Director | {nombre} | Genera plan, actualiza metadata, consolida reporte, decide suspension |
| Colaborador | {nombre} | Ejecuta checkpoints asignados, reporta hallazgos, responde solicitudes |
| Usuario humano | {nombre} | Aprueba plan, autoriza cambios mayores, decide en escalamientos |
```
