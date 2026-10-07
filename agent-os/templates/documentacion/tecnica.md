---
plantilla: tecnica
tipo: doc-tecnica
descripcion: "Documentacion tecnica del proyecto/repo: descripcion, modulos, funcionalidades, procesos y capas"
audiencia_sugerida: "Desarrolladores y arquitectos del equipo, nivel tecnico"
destino_sugerido: "docs/tecnica/"
capturas: no_aplica
fuentes:
  - "ISO/IEC/IEEE 26514:2022 -- cl. 8.2 modularidad, 8.3 estructuracion por funcion, 8.5 informacion conceptual, 8.7 referencia"
  - "Diataxis (diataxis.fr) -- tipos dominantes: explicacion + referencia"
---

# Documentacion tecnica: {nombre del sistema}

<!-- Plantilla del catalogo de la ruta documentacion. Punto de partida, no camisa de
     fuerza: Paige puede desviarse declarandolo en el discovery (E1).
     GUIA DE FRAGMENTACION: esta plantilla define la ESTRUCTURA de un arbol de documentos.
     El documento producido NO debe ser un monolito: cada seccion de nivel 2 marcada con
     [archivo] se materializa como archivo propio bajo el destino (ej. docs/tecnica/),
     enlazado desde un README indice que replica este TOC. Archivos pequeños y enlazados
     — se carga solo lo aplicable. Preferir diagramas Mermaid a prosa cuando el concepto
     es flujo, jerarquia o relacion. -->

## Metadatos

| Campo | Valor |
|---|---|
| Sistema documentado | {nombre del sistema} |
| Repo | {nombre del repo} |
| Audiencia | {audiencia_documento declarada en el work} |
| Fecha de elaboracion | {YYYY-MM-DD} |
| Vigente contra | {version/commit del sistema al validar} |

## Indice

{TOC = indice del arbol producido. Cada entrada enlaza a su archivo.}

## 1. Descripcion del sistema [archivo: 01-descripcion.md]

{Que es el sistema, que problema de negocio resuelve, quienes lo usan. Resumen que un
dev nuevo lee en 3 minutos. Stack tecnologico en tabla (lenguajes, frameworks, BD,
infraestructura). Diagrama de contexto (Mermaid) con sistemas externos.}

## 2. Modulos [archivo: 02-modulos/{modulo}.md, uno por modulo]

{Por cada modulo: proposito, responsabilidades, dependencias con otros modulos,
entidades principales que maneja, rutas de codigo donde vive. Diagrama de dependencias
entre modulos (Mermaid) en el indice de la seccion.}

## 3. Funcionalidades [archivo: 03-funcionalidades.md]

{Catalogo de funcionalidades visibles: que hace el sistema, en que modulo vive cada una,
que roles la usan. Tabla funcionalidad -> modulo -> roles -> estado (activa/deprecada).}

## 4. Procesos de negocio [archivo: 04-procesos/{proceso}.md, uno por proceso]

{Por cada proceso transversal (ej. facturacion, cierre diario): diagrama de secuencia o
flujo (Mermaid), actores, modulos involucrados, reglas de negocio aplicadas, estados por
los que pasa la entidad principal.}

## 5. Capas [archivo: 05-capas/{capa}.md, uno por capa]

### 5.1 Base de datos [05-capas/db.md]

{Motor y version, esquemas, entidades principales con relaciones (diagrama ER Mermaid),
convenciones de nombres, stored procedures criticos, estrategia de migraciones.}

### 5.2 Logica de negocio [05-capas/logica-negocio.md]

{Donde vive la logica (servicios/BL/dominios), patrones usados, reglas transversales,
manejo de transacciones y errores.}

### 5.3 APIs y endpoints [05-capas/api-endpoints.md]

{Estilo (REST/RPC), convenciones de rutas y respuestas, catalogo de endpoints por modulo
(tabla: verbo, ruta, proposito, permiso requerido), versionado, contratos externos.}

### 5.4 Seguridad [05-capas/seguridad.md]

{Autenticacion (mecanismo, sesiones/tokens), autorizacion (modelo de permisos/roles,
donde se valida), catalogo de permisos si existe, superficie publica declarada.}

### 5.5 Frontend [05-capas/frontend.md]

{Framework y estructura, convenciones de componentes/vistas, manejo de estado, como se
conecta con la API, assets y build.}

## 6. Integraciones [archivo: 06-integraciones.md]

{Sistemas externos: que se integra, protocolo, contratos (referenciar
.documentacion/contratos-externos/ si el repo los tiene), manejo de fallas.}

## 7. Glosario tecnico [archivo: 07-glosario.md]

{Terminos del dominio y del sistema con definicion breve.}

## 8. Historial de este documento

| Fecha | Version | Cambio | Autor |
|---|---|---|---|
| {YYYY-MM-DD} | 1.0 | Version inicial | {autor} |
