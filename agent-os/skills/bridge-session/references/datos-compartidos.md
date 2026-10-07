# Fase 3: Entorno de Prueba Coordinado

## Objetivo

Cada sistema tiene su propia base de datos y sus propios datos. Lo que se coordina en esta fase es que cada instancia conozca como acceder al otro sistema y con que datos de prueba trabajar. Sin esto, las instancias adivinan URLs, inventan credenciales, o asumen que ciertos datos existen.

**Lo que se comparte NO son datos** — es el conocimiento de:
- Como accedo a tu sistema (URL, puerto, protocolo)
- Con que credenciales me autentico en tu sistema (usuario, password, token, API key)
- Con que empresa/tenant vamos a trabajar en ambos lados
- Que datos de prueba existen en tu BD que yo voy a referenciar desde mi sistema
- Que configuracion de integracion necesitamos alinear (JWT_SECRET, endpoints, etc.)

## Flujo

### 1. Cada instancia publica su ficha de entorno

Cada instancia publica al grupo una ficha completa de su sistema para que la otra sepa como conectarse y que datos tiene disponibles:

```
bridge_publicar(id_grupo, "contexto", "{ficha de entorno}", metadata: '{"subtipo": "entorno-prueba"}')
```

**Ficha de entorno:**

```markdown
## Ficha de entorno — {nombre del sistema}

### A. Acceso al sistema
- URL base: {url local/staging}
- Puerto: {puerto}
- Protocolo: HTTP | HTTPS
- Health check: {endpoint de verificacion, ej: GET /health}

### B. Autenticacion que este sistema REQUIERE
Como se autentica un sistema externo para consumir mis APIs:
- Metodo: {JWT | API Key | Basic Auth | Token en header | Sin auth}
- Header: {nombre del header, ej: Authorization: Bearer {token}}
- Como obtener credenciales: {endpoint de login, o token fijo, o JWT_SECRET compartido}
- JWT_SECRET (si es compartido): {valor}

### C. Autenticacion que este sistema CONSUME
Que necesito del otro sistema para autenticarme:
- Endpoint de login: {url}
- Credenciales: {usuario/password que debo usar}
- Token/API Key: {si el otro sistema me da un token fijo}

### D. Empresa de prueba
- Nombre: {nombre de la empresa/tenant en MI BD}
- ID en mi BD: {id}
- Identificacion fiscal: {NIT/RUC}
- Configuracion relevante: {modulos activos, licencias, etc.}
- Nota: {esta empresa debe coincidir logicamente con la del otro sistema, o son independientes}

### E. Usuario de prueba
- Email/username: {credencial}
- Password: {password}
- Rol: {admin/operador/etc.}
- Permisos: {que puede hacer este usuario}
- Nota: {este usuario puede autenticarse en el otro sistema? o cada sistema tiene su propio usuario?}

### F. Datos de prueba existentes en MI BD
Datos que el otro sistema va a referenciar o necesitar:
- {Entidad}: {nombre, ID, datos clave}
  Ejemplo: Producto "TORN-001" (Tornillo 1/4), stock: 1000, precio: $150
- {Entidad}: {nombre, ID, datos clave}
  Ejemplo: Paciente "DEMO-001" (Juan Perez), evento: EVT-123

### G. Endpoints/APIs que EXPONGO para integracion
Lo que el otro sistema puede consumir de mi:
- {metodo} {endpoint}: {descripcion}
  Ejemplo: POST /api/reservas — Reservar stock para un pedido
- {metodo} {endpoint}: {descripcion}
  Ejemplo: GET /api/productos/:codigo — Consultar stock disponible

### H. Endpoints/APIs que CONSUMO del otro sistema
Lo que necesito del otro sistema:
- {metodo} {endpoint}: {descripcion}
  Ejemplo: POST /api/auth/login — Obtener JWT para autenticarme
- {metodo} {endpoint}: {descripcion}
```

### 2. Director consolida y alinea

El Director lee las fichas de todos los participantes y verifica alineacion:

**Verificaciones de alineacion:**
- La empresa de prueba es logicamente la misma en ambos lados? (ej: "Ferreteria El Tornillo" en Pedidos y el mismo concepto en Inventario)
- Las credenciales cruzadas son correctas? (lo que A dice que necesita de B coincide con lo que B ofrece)
- Los endpoints que A dice consumir de B coinciden con lo que B dice exponer?
- El JWT_SECRET es el mismo en ambos sistemas?
- Los datos de referencia cruzada existen? (ej: los codigos de producto que Pedidos referencia existen en Inventario)

Si hay desalineaciones, publicar al grupo para resolver ANTES de avanzar:
```
bridge_publicar(id_grupo, "request", "Desalineacion detectada: {detalle}. {instancia}, confirma/corrige.")
```

El Director consolida en metadata del grupo:
```
bridge_actualizar_grupo(id_grupo, metadata: '{"entorno_prueba": {"instancia1": {...ficha...}, "instancia2": {...ficha...}, "alineacion": "verificada"}}')
```

### 3. Validacion cruzada en vivo

Antes de avanzar a los checkpoints, cada instancia verifica que puede acceder al otro sistema con los datos publicados:

**Verificaciones obligatorias:**
1. **Conectividad:** Llamar al health check del otro sistema. OK/FAIL.
2. **Autenticacion:** Usar las credenciales publicadas para autenticarse en el otro sistema. OK/FAIL.
3. **Datos de referencia:** Consultar al menos un dato que voy a necesitar (ej: GET /api/productos/TORN-001). OK/FAIL.

Publicar resultado de validacion al grupo:
```
bridge_publicar(id_grupo, "contexto", "Validacion cruzada desde {mi instancia}: Conectividad={OK/FAIL}, Auth={OK/FAIL}, Datos={OK/FAIL}. Detalle: {si hay fallos}", metadata: '{"subtipo": "validacion-cruzada"}')
```

**Si alguna validacion falla:** Resolver ANTES de avanzar a Fase 4. No se pueden ejecutar checkpoints sin acceso verificado entre sistemas. Esto puede requerir:
- Levantar un sistema que no esta corriendo
- Crear datos de prueba que no existen
- Corregir configuracion (CORS, puertos, JWT_SECRET)
- Crear/activar usuarios de prueba

### 4. Registrar puntos de restauracion

El Director actualiza la metadata del grupo con los commits actuales de todos los participantes:

```
bridge_actualizar_grupo(id_grupo, metadata: '{"puntos_restauracion": {"instancia1": {"commit": "abc123", "branch": "main"}, "instancia2": {"commit": "def456", "branch": "feature/x"}}}')
```

Cada instancia registra en su bitacora local el commit y branch como punto de rollback.
