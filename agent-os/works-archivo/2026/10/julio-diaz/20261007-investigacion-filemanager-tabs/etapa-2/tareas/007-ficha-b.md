---
cas:
  - CA-01
  - CA-03
  - CA-09
  - CA-10
depende_de:
  - T-003
ejecutor: mary
file_type: tarea-etapa-2
status: done
tipo_tarea: frente-investigacion
verificador: quinn
---
# Tarea 007: Ficha B: panel independiente (mover y coexistir)

Producir la ficha de 9 campos de B en variantes mover y coexistir, mas T-F4 vistas del Inspector. Frente F4.

## Subtareas

1. Llenar los 9 campos de la ficha por variante.
2. Construir T-F4 para Files, Changes, Commits e History.
3. Derivar la talla con la regla de dos pasos de CA-03.

## Dev Notes

- **Regla de evidencia**: toda afirmacion lleva estado `verificado` (cita path:linea o URL/commit), `inferencia` (cita las afirmaciones de origen), `hipotesis` o `por-definir`; estas dos ultimas con pregunta bloqueada, fuentes revisadas (fecha y ref) y condicion de cierre. Ver `etapa-1/cas-cobertura-insumo.md`.
- **No adelantar el hallazgo**: esta tarea es el encargo, no el resultado.
- **Filas minimas**: las tablas con filas minimas obligatorias (ver `etapa-1/cas-cobertura-insumo.md`, seccion "Filas minimas obligatorias") deben clasificarlas todas como `cubierta`, `no-aplica` (con razon) o `por-definir`.

## Fuentes y entregable

- Fuentes tentativas: salidas de T-001 y T-003; web/src/App.tsx, web/src/components/WorkspaceInspectorHost.tsx, web/src/workspaceResource.ts, web/src/components/workspaceInspectorLayout.ts, web/src/styles/layout/app.css.
- Entregable: `etapa-3/frentes/T-007-ficha-b.md: ficha B (mover/coexistir) + T-F4.`

## Verificacion

1. `agentos citas verificar` sobre el entregable: toda fila `verificado` pasa.
2. Las filas minimas y campos exigidos por los CAs de la tarea estan presentes y clasificados.

## CAs que implementa

| ID | Origen |
|----|--------|
| CA-01 | Mary (E1) |
| CA-03 | Mary (E1) |
| CA-09 | Mary (E1) |
| CA-10 | Mary (E1) |

## Ejecutor: mary

### Que hizo

- Ficha B (mover/coexistir) + T-F4 (4/4 vistas) en etapa-3/frentes/T-007-ficha-b.md: mover L (6-8 modulos), coexistir M (4-5 modulos + contrato cliente).
- 123 citas ok; supuestos de definicion S1 y S2 declarados para que la talla sea estimable.

### Hallazgos

| # | Hallazgo | Solucion | Decidio |
|---|----------|----------|---------|
| 1 | Files y Changes acoplados: la sub-vista de cambios usa diffViewerRef de Changes (WorkspaceInspectorHost.tsx:772); el panel debe re-hogar esa dependencia | Cambio confirmado en ambas variantes de B; candidato a nucleo comun con A1 | mary |
| 2 | Coexistir sube a L si el panel como nuevo emisor de tab.focus/workspace.focus en shared se considera cambio del ciclo de vida del foco compartido | Sensibilidad declarada; la resuelve T-008 o el consumidor | mary |
| 3 | terminalFocus.ts:12 y AnnotationComposerPopover.tsx:88 dependen de clases del Inspector; sin ampliarlas, la terminal roba el foco al panel | Cambio confirmado en la ficha | mary |

## Verificador: quinn

### Que verifico

- Ficha B con 9 campos en ambas variantes y T-F4 4/4 (CA-03, CA-09, CA-10): PASS tras correccion H-1/H-10.
- B coexistir M con alternativas que la llevan a L declaradas.

### Hallazgos de verificacion

(ninguno)
