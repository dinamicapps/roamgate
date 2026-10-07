---
plantilla: manual-validacion
tipo: manual-usuario
descripcion: "Guion de validacion/aceptacion de funcionalidades: escenarios ejecutables con resultado esperado y registro de veredicto"
audiencia_sugerida: "Usuario validador / QA funcional del cliente, conoce el negocio"
destino_sugerido: "docs/manuales/validacion/"
capturas: recomendado
fuentes:
  - "ISO/IEC/IEEE 26514:2022 -- cl. 8.6 estructura de informacion instruccional"
  - "Diataxis (diataxis.fr) -- tipo dominante: guion instruccional (ejecuta y registra)"
  - "Estructura Fase 2 de verificacion E4 del flujo agent-os (pruebas guiadas con datos de prueba)"
---

# Guion de validacion: {alcance a validar} -- {nombre del sistema}

<!-- Plantilla del catalogo de la ruta documentacion. Punto de partida, no camisa de
     fuerza: Paige puede desviarse declarandolo en el discovery (E1).
     Sinergia: los escenarios con resultado esperado + receta de datos reflejan la Fase 2
     de verificacion (E4). Un work de manual de validacion puede nutrirse de la evidencia
     de E4 de los works que construyeron la funcionalidad (etapa-4/evidencia/). -->

## Metadatos

| Campo | Valor |
|---|---|
| Sistema documentado | {nombre y version del sistema} |
| Alcance a validar | {funcionalidad/modulo/release} |
| Validador | {nombre y rol de quien ejecuta} |
| Ambiente | {URL/instancia de pruebas — NUNCA produccion sin autorizacion} |
| Fecha de elaboracion | {YYYY-MM-DD} |

## Indice

{TOC del documento, generado al cierre.}

## 1. Introduccion

{Que se valida y que criterio global decide la aceptacion (ej: todos los escenarios
criticos en APROBADO). Convenciones: como registrar resultado y evidencia.}

## 2. Acceso y llegada

{Como el validador entra al ambiente de pruebas: URL, credenciales de prueba, rol con el
que valida. Prerequisitos de configuracion del ambiente.}

## 3. Precondiciones y datos de prueba

{Receta completa de datos: que registros deben existir antes de arrancar (clientes,
productos, saldos), con valores concretos. Si el repo maneja test-env.local.json u otro
inventario de datos de prueba, referenciarlo aqui.}

| Dato | Valor / como crearlo | Usado por escenarios |
|---|---|---|
| {entidad} | {valor concreto o pasos de alta} | {E-01, E-03} |

## 4. Escenarios de validacion

{Un escenario por subseccion, numerados E-NN. Ordenar: criticos primero.}

### E-01 {Nombre del escenario}

- **Contexto:** {situacion de negocio que el escenario reproduce}
- **Criticidad:** {critico | importante | deseable}

| Paso | Accion | Resultado esperado | Resultado obtenido | Veredicto |
|---|---|---|---|---|
| 1 | {una sola accion} | {que debe pasar} | {llenar al ejecutar} | {OK / FALLO} |

- **Veredicto del escenario:** {APROBADO / RECHAZADO / BLOQUEADO — llenar al ejecutar}
- **Evidencia:** {captura(s) del resultado, nombre {E-NN}-{paso}.png}

## 5. Registro de hallazgos

{Todo desvio observado, aunque el escenario haya aprobado.}

| # | Escenario | Descripcion del hallazgo | Severidad | Estado |
|---|---|---|---|---|
| 1 | {E-NN} | {que se observo vs que se esperaba} | {alta/media/baja} | {abierto/resuelto} |

## 6. Resolucion de problemas del ambiente

{Problemas tipicos del AMBIENTE de validacion (no del sistema): datos agotados, sesion
expirada, ambiente caido. Que hacer y a quien avisar.}

## 7. Glosario

{Terminos del negocio usados en los escenarios.}

## 8. Soporte durante la validacion

{Canal directo con el equipo durante la ventana de validacion.}

## 9. Aceptacion

| Campo | Valor |
|---|---|
| Escenarios ejecutados | {N de M} |
| Aprobados / rechazados / bloqueados | {conteos} |
| Decision | {ACEPTADO / ACEPTADO CON OBSERVACIONES / RECHAZADO} |
| Valido | {nombre, rol, fecha} |

## 10. Historial de este documento

| Fecha | Version | Cambio | Autor |
|---|---|---|---|
| {YYYY-MM-DD} | 1.0 | Version inicial | {autor} |
