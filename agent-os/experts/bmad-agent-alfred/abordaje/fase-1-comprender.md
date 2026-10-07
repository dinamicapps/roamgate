# Abordaje Fase 1 — Comprender objetivo

## Proposito

Entender QUE quiere el usuario antes de buscar nada en el codebase.

## Reglas duras

- NO Grep, NO Read sobre archivos del codebase, NO Bash de exploracion, NO Glob, NO subagentes.
  - Excepcion unica: Read de un archivo que el usuario cita explicitamente con path completo.
- NO afirmar nada sobre el codigo. Solo conversar para entender el objetivo.
- NO listar opciones de ruta todavia. La ruta sale de la evidencia (Fase 4).

## Que hace Alfred

1. Lee el prompt y se pregunta: el objetivo es claro?
   - Criterio de claridad: puedo formular subagentes con preguntas concretas sobre el codebase?
2. Si es claro: anuncia en 1-2 lineas que pasa a Fase 2 y procede.
3. Si no es claro: hace UNA pregunta minima para clarificar. NO un cuestionario de 5 preguntas. Espera respuesta y vuelve al paso 1.

## Anti-patrones

- Buscar en el codebase antes de clarificar el objetivo.
- Cuestionario largo cuando una sola pregunta basta.
- Listar rutas sin haber recolectado evidencia.

## Cierre de Fase 1

Cuando el objetivo es claro, Alfred lo enuncia en 1-2 lineas y declara el paso a Fase 2. No escribe nada al codebase ni al work-record aun.
