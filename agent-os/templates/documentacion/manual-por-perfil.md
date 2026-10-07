---
plantilla: manual-por-perfil
tipo: manual-usuario
descripcion: "Manual transversal de las funcionalidades que un perfil/rol de usuario opera en el sistema"
audiencia_sugerida: "Usuario final del rol objetivo, nivel operativo"
destino_sugerido: "docs/manuales/"
capturas: recomendado
fuentes:
  - "ISO/IEC/IEEE 26514:2022 -- Design and development of information for users (cl. 8.6 instruccional, 8.9 troubleshooting, 8.11 glosario, 8.16 FAQ)"
  - "Diataxis (diataxis.fr) -- tipo dominante: how-to (orientado a tareas del rol)"
  - "TechSmith / Slite -- componentes envolventes del manual de usuario"
---

# Manual de usuario -- {rol}: {nombre del sistema}

<!-- Plantilla del catalogo de la ruta documentacion. Punto de partida, no camisa de
     fuerza: Paige puede desviarse declarandolo en el discovery (E1).
     Unidad reproducible (ISO 26514 cl. 8.6): cada tarea del rol se documenta como
     PROCEDIMIENTO: objetivo -> precondiciones -> pasos numerados (una accion por
     paso) -> captura anotada cuando la pantalla cambia -> resultado esperado. -->

## Metadatos

| Campo | Valor |
|---|---|
| Sistema documentado | {nombre y version del sistema} |
| Perfil/rol | {rol exacto como existe en el sistema} |
| Audiencia | {audiencia_documento declarada en el work} |
| Fecha de elaboracion | {YYYY-MM-DD} |
| Vigente contra | {version/commit del sistema al validar el documento} |

## Indice

{TOC del documento, generado al cierre. Obligatorio: un manual se consulta, no se lee de corrido.}

## 1. Introduccion

{Proposito del manual en 2-3 parrafos: que cubre, para quien, que NO cubre (alcance).
Convenciones de lectura: como se marcan pasos, notas y advertencias; elementos de UI en **negrita**.}

## 2. Acceso y llegada

{Como el usuario del rol entra al sistema: aplicacion/URL, tipo de sesion, prerequisitos
(permisos del rol, configuracion previa). Si el repo tiene `agent-os/product/mapa-llegada.md`,
las rutas de llegada verificadas salen de alli — la primera pasada llega COMO USUARIO
(menus), no por URL directa.}

## 3. El rol y su contexto

{Quien es este usuario en el negocio: responsabilidades que cubre en el sistema, con que
otros roles interactua, momentos tipicos de uso (diario / quincenal / eventual).}

## 4. Mapa de funcionalidades del rol

{Tabla-resumen de todo lo que el rol puede hacer y donde. Cada fila enlaza al procedimiento.}

| Funcionalidad | Modulo/pantalla | Como llegar | Procedimiento |
|---|---|---|---|
| {que hace} | {donde} | {menu > submenu} | {link a seccion 5.N} |

## 5. Tareas frecuentes

{Una subseccion por tarea, ordenadas por frecuencia de uso (la mas comun primero).}

### 5.1 {Nombre de la tarea en verbo, ej: "Registrar un pago"}

- **Objetivo:** {que logra el usuario al completarla}
- **Precondiciones:** {que debe existir o estar hecho antes}

| Paso | Accion | Resultado esperado |
|---|---|---|
| 1 | {una sola accion; el elemento de UI en **negrita**} | {que ve el usuario} |
| 2 | {...} | {...} |

{Captura anotada cuando la pantalla cambia de forma sustantiva. Nombre sugerido:
{slug-tarea}-paso-{N}.png, junto al documento.}

## 6. Casos especiales del rol

{Excepciones y flujos alternos: falta de permiso, aprobaciones de otro rol, periodos de
cierre, etc. Mismo formato de procedimiento cuando requieren pasos.}

## 7. Resolucion de problemas

{Errores y situaciones comunes del rol (ISO 26514 cl. 8.9/8.10).}

| Sintoma | Causa probable | Que hacer |
|---|---|---|
| {mensaje o comportamiento} | {causa} | {accion del usuario o a quien acudir} |

## 8. Preguntas frecuentes

{Preguntas reales del rol con respuesta breve. Sin historial de soporte, derivarlas de los
casos especiales.}

## 9. Glosario

{Terminos del dominio del negocio que el manual usa, definidos en lenguaje del lector.}

## 10. Soporte

{A quien acudir y como: canal, horario, que informacion adjuntar al reportar.}

## 11. Historial de este documento

| Fecha | Version | Cambio | Autor |
|---|---|---|---|
| {YYYY-MM-DD} | 1.0 | Version inicial | {autor} |
