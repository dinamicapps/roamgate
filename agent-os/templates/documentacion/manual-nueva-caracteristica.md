---
plantilla: manual-nueva-caracteristica
tipo: manual-usuario
descripcion: "Manual delta de una funcionalidad nueva o modificada: que cambio, a quien afecta y como se usa"
audiencia_sugerida: "Usuarios existentes de los flujos afectados"
destino_sugerido: "docs/manuales/novedades/"
capturas: recomendado
fuentes:
  - "ISO/IEC/IEEE 26514:2022 -- cl. 8.5 informacion conceptual, 8.6 instruccional"
  - "Diataxis (diataxis.fr) -- tipo dominante: explicacion + tutorial (delta sobre lo existente)"
  - "Slite -- notas de version como componente de la documentacion de usuario"
---

# Novedad: {nombre de la caracteristica} -- {nombre del sistema}

<!-- Plantilla del catalogo de la ruta documentacion. Punto de partida, no camisa de
     fuerza: Paige puede desviarse declarandolo en el discovery (E1).
     Este manual es un DELTA: asume que el lector ya conoce el sistema. Documentar el
     cambio, no re-documentar lo que ya existia. -->

## Metadatos

| Campo | Valor |
|---|---|
| Sistema documentado | {nombre y version del sistema} |
| Caracteristica | {nombre corto} |
| Disponible desde | {version / fecha de despliegue} |
| Audiencia | {audiencia_documento declarada en el work} |
| Fecha de elaboracion | {YYYY-MM-DD} |

## Indice

{TOC del documento, generado al cierre.}

## 1. Que cambio y por que

{2-3 parrafos en lenguaje de valor: que hace la caracteristica nueva y que problema del
usuario resuelve. Explicacion, no instruccion.}

## 2. A quien afecta

| Perfil/rol | Modulo/flujo afectado | Como le cambia el trabajo |
|---|---|---|
| {rol} | {donde} | {1 linea} |

## 3. Antes y despues

{Comparacion visual del flujo previo vs el nuevo. Un par de capturas por pantalla afectada:
{pantalla}-antes.png / {pantalla}-despues.png, con las diferencias anotadas. Si la
caracteristica es totalmente nueva (no habia "antes"), decirlo y mostrar solo el despues.}

## 4. Como se usa

{Procedimiento paso a paso (ISO 26514 cl. 8.6).}

- **Objetivo:** {que logra el usuario}
- **Precondiciones:** {permisos, configuracion o datos necesarios}

| Paso | Accion | Resultado esperado |
|---|---|---|
| 1 | {una sola accion} | {que ve el usuario} |

## 5. Impacto en flujos existentes

{Que sigue funcionando igual, que cambio de lugar, que quedo deprecado. Tabla si hay
varios flujos tocados. Esta seccion evita la pregunta #1 del usuario existente:
"donde quedo lo que yo usaba".}

## 6. Resolucion de problemas

| Sintoma | Causa probable | Que hacer |
|---|---|---|
| {mensaje o comportamiento} | {causa} | {accion o a quien acudir} |

## 7. Preguntas frecuentes del cambio

{Preguntas anticipadas de usuarios existentes.}

## 8. Glosario

{Solo terminos NUEVOS que introduce esta caracteristica.}

## 9. Soporte

{A quien acudir y como.}

## 10. Historial de este documento

| Fecha | Version | Cambio | Autor |
|---|---|---|---|
| {YYYY-MM-DD} | 1.0 | Version inicial | {autor} |
