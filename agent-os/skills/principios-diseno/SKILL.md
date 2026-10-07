---
name: principios-diseno
description: Doctrina del sistema sobre principios SOLID y criterio para aplicar patrones de diseno (Singleton, Observer, Factory, Strategy, Decorator, Builder). Fuente unica consultada por expertos codificadores (Amelia, Atlas) y analiticos (Winston, Alfred) al escribir codigo nuevo o al refactorizar. Lente proactiva no bloqueante.
---

# Principios de diseno

## Proposito

Lente compartida de buenas practicas estructurales. Da a los expertos un criterio
explicito para: (1) detectar violaciones de SOLID en codigo nuevo o existente, y
(2) decidir el mejor momento para aplicar un patron de diseno, distinguiendolo del
momento en que el patron seria sobre-ingenieria.

Doctrina agnostica (aplica a cualquier stack). Los ejemplos aterrizan en .NET/C# y el
patron MVC (Controllers / BL / Views) por ser el stack dominante de los proyectos
consumidores, pero el criterio es portable.

## Cuando consultar

- **Codigo nuevo** (caso principal): al disenar la estructura (Winston) y en la fase
  refactor del ciclo TDD tras tener los tests en verde (Amelia, Atlas).
- **Refactoring:** cuando el usuario lo solicita, o cuando aparecen senales de deuda
  estructural (smell, "reestructurar", clase que crece sin limite, switch por tipo).
- **Code review:** al evaluar mantenibilidad (Amelia, Atlas -- Lente 2).
- **Analisis de rumbo:** al proponer ruta para trabajo de codigo significativo (Alfred).

## Contrato de intensidad

- **Proactiva:** el experto propone el principio o patron pertinente sin que el usuario
  lo pida, cuando el codigo lo amerita.
- **No bloqueante:** una violacion de SOLID o un anti-patron se reporta como hallazgo
  con severidad (tipicamente medio/bajo) y entra al triage normal. NUNCA bloquea el
  cierre del work. El humano decide.
- **Con criterio, no dogmatica:** cada propuesta declara el dolor concreto que resuelve.

## Regla de oro

**Un patron sin un dolor concreto que lo justifique es deuda, no calidad.** Aplicar un
patron "por si acaso" o "porque es elegante" anade indireccion sin pagar su costo. La
lente favorece la solucion mas simple que resuelve el problema de hoy, con puntos de
extension claros para cuando el dominio demuestre que hacen falta.

## Referencias

- `references/solid.md` -- los 5 principios: definicion, sintoma de violacion, como se
  ve en MVC/C#, refactor sugerido.
- `references/patrones.md` -- los 6 patrones: problema, cuando aplica, cuando NO,
  smell, ejemplo MVC/C#, nota .NET nativa. Cierra con patrones vecinos.
