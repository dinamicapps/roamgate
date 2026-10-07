# Ficha de Entorno (Test Environment Requirements + Readiness)

> Template basado en ISO/IEC/IEEE 29119-3 Test Environment Requirements y Test Environment Readiness Report, adaptados para bridge-session.
> Cada instancia genera uno y lo publica al grupo en Fase 3.

---

```markdown
# Ficha de Entorno — {nombre del sistema}

instancia: {identidad en el bridge}
repo: {nombre del repositorio}
rol: director | colaborador
fecha: {YYYY-MM-DD}

## A. Acceso al sistema

| Campo | Valor |
|-------|-------|
| URL base | {url local/staging} |
| Puerto | {puerto} |
| Protocolo | HTTP | HTTPS |
| Health check | {endpoint, ej: GET /health} |
| Estado | Operativo | No disponible |

## B. Autenticacion que este sistema REQUIERE

Como se autentica un sistema externo para consumir mis APIs:

| Campo | Valor |
|-------|-------|
| Metodo | JWT | API Key | Basic Auth | Token fijo | Sin auth |
| Header | {nombre del header, ej: Authorization: Bearer {token}} |
| Como obtener credenciales | {endpoint de login, o "token fijo compartido", o "JWT_SECRET compartido"} |
| JWT_SECRET (si compartido) | {valor — SENSIBLE, no commitear} |
| Expiracion de token | {tiempo, ej: 1 hora} |

## C. Autenticacion que este sistema CONSUME

Que necesito del otro sistema para autenticarme en el:

| Campo | Valor |
|-------|-------|
| Endpoint de login | {url del otro sistema} |
| Credenciales | {usuario/password que debo usar} |
| Token/API Key | {si el otro sistema me da un token fijo} |

## D. Empresa de prueba

| Campo | Valor |
|-------|-------|
| Nombre | {nombre de la empresa/tenant} |
| ID en mi BD | {id} |
| Identificacion fiscal | {NIT/RUC} |
| Config relevante | {modulos activos, licencias} |
| Coincide con otro sistema | {Si/No — si la empresa es logicamente la misma en ambos lados} |

## E. Usuario de prueba

| Campo | Valor |
|-------|-------|
| Email/username | {credencial} |
| Password | {password} |
| Rol | {admin/operador/etc.} |
| Permisos | {que puede hacer} |
| Cross-system | {puede autenticarse en el otro sistema? o cada sistema tiene usuario propio} |

## F. Datos de prueba existentes en MI BD

Datos que el otro sistema va a referenciar o necesitar:

| Entidad | Identificador | Datos clave | Referenciado por |
|---------|--------------|-------------|-----------------|
| {ej: Producto} | {ej: TORN-001} | {ej: Tornillo 1/4, stock: 1000, precio: 150} | {ej: Pedidos usa codigo} |
| {ej: Paciente} | {ej: PAC-DEMO} | {ej: Juan Perez, CC 12345678} | {ej: DinamicCOM usa eventoKey} |

## G. Endpoints que EXPONGO para integracion

| Metodo | Endpoint | Descripcion | Auth requerida | Request body (schema) | Response (schema) |
|--------|----------|------------|----------------|----------------------|-------------------|
| {POST} | {/api/reservas} | {Reservar stock} | {JWT} | {pedido_id: number, items: [{codigo, cantidad}]} | {reserva_id: string, estado: string} |

## H. Endpoints que CONSUMO del otro sistema

| Metodo | Endpoint | Descripcion | Auth que uso | Request body | Response esperada |
|--------|----------|------------|-------------|-------------|------------------|
| {POST} | {/api/auth/login} | {Obtener JWT} | {Basic} | {email, password} | {token: string} |

## I. Validacion cruzada (completar en Fase 3.3)

| Verificacion | Resultado | Detalle |
|-------------|-----------|---------|
| Conectividad (health check) | OK / FAIL | {detalle si falla} |
| Autenticacion | OK / FAIL | {detalle si falla} |
| Datos de referencia | OK / FAIL | {detalle si falla} |
| Endpoints disponibles | OK / FAIL | {detalle si falla} |

## J. Punto de restauracion

| Campo | Valor |
|-------|-------|
| Commit | {hash} |
| Branch | {nombre} |
| Fecha | {timestamp} |
```
