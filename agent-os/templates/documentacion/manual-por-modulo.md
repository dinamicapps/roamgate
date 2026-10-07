---
plantilla: manual-por-modulo
tipo: manual-usuario
descripcion: "Manual de referencia y operacion de un modulo del sistema (pantallas, operaciones, reglas visibles)"
audiencia_sugerida: "Usuarios del modulo, todos los roles que lo operan"
destino_sugerido: "docs/manuales/"
capturas: recomendado
fuentes:
  - "ISO/IEC/IEEE 26514:2022 -- cl. 8.3 estructuracion por funcion, 8.6 instruccional, 8.7 referencia"
  - "Diataxis (diataxis.fr) -- tipo dominante: referencia + how-to"
  - "TechSmith / Slite -- componentes envolventes del manual de usuario"
---

# Manual del modulo {nombre del modulo}: {nombre del sistema}

<!-- Plantilla del catalogo de la ruta documentacion. Punto de partida, no camisa de
     fuerza: Paige puede desviarse declarandolo en el discovery (E1).
     Diataxis: separar REFERENCIA (seccion 4, que hay en cada pantalla) de HOW-TO
     (seccion 5, como se opera). No mezclar ambos en la misma seccion. -->

## Metadatos

| Campo | Valor |
|---|---|
| Sistema documentado | {nombre y version del sistema} |
| Modulo | {nombre del modulo como aparece en el menu} |
| Audiencia | {audiencia_documento declarada en el work} |
| Fecha de elaboracion | {YYYY-MM-DD} |
| Vigente contra | {version/commit del sistema al validar el documento} |

## Indice

{TOC del documento, generado al cierre.}

## 1. Introduccion

{Proposito del manual, alcance (este modulo, no el sistema completo), convenciones de lectura.}

## 2. Acceso y llegada

{Como se llega al modulo: menu, permisos requeridos por rol, prerequisitos de datos.
Si existe `agent-os/product/mapa-llegada.md`, usar las llegadas verificadas.}

## 3. Proposito del modulo

{Que resuelve el modulo en el negocio y para quienes. Roles que lo usan y para que
(tabla rol -> uso tipico si son varios).}

## 4. Recorrido de pantallas (referencia)

{Una subseccion por pantalla del modulo. Referencia pura: que hay, no como operar.}

### 4.1 {Nombre de la pantalla}

{Captura de la pantalla completa, anotada.}

| Elemento | Tipo | Que es / que valida |
|---|---|---|
| {campo o boton} | {campo texto / combo / boton / grilla} | {significado, valores posibles, validacion visible} |

## 5. Operaciones del modulo

{Una subseccion por operacion, como procedimiento (ISO 26514 cl. 8.6).}

### 5.1 {Nombre de la operacion en verbo}

- **Objetivo:** {que logra}
- **Precondiciones:** {que debe existir antes}

| Paso | Accion | Resultado esperado |
|---|---|---|
| 1 | {una sola accion} | {que ve el usuario} |

## 6. Reglas de negocio visibles al usuario

{Validaciones y restricciones que el usuario PERCIBE al operar (mensajes, campos
bloqueados, montos limite) y su porque operativo. No documentar aqui logica interna
que el usuario no ve — eso es doc tecnica.}

| Regla | Donde se manifiesta | Comportamiento |
|---|---|---|
| {regla} | {pantalla/operacion} | {que ve el usuario cuando aplica} |

## 7. Resolucion de problemas

| Sintoma | Causa probable | Que hacer |
|---|---|---|
| {mensaje o comportamiento} | {causa} | {accion o a quien acudir} |

## 8. Preguntas frecuentes del modulo

{Preguntas recurrentes con respuesta breve.}

## 9. Glosario

{Terminos del dominio que el modulo maneja.}

## 10. Soporte

{A quien acudir y como.}

## 11. Historial de este documento

| Fecha | Version | Cambio | Autor |
|---|---|---|---|
| {YYYY-MM-DD} | 1.0 | Version inicial | {autor} |
