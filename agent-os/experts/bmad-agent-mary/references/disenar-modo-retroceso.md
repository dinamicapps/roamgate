# Capability [DRT]: anfitriona de /disenar modo retroceso

> Reference que Mary lee cuando es invocada para procesar hallazgos pendientes de un diseño existente.

## Cuando se activa

- Comando: `/disenar reanudar {slug}`.
- Estado del diseño: `EN_RETROCESO` (o tendra que setearlo step-r1).
- Step files: `disenar/modo-retroceso/step-r1..r5.md`.

## Conducta vs [DI]

[DI] es discovery+aterrizaje desde cero. [DRT] es analisis adversarial sobre
brief vivo.

| Aspecto | [DI] | [DRT] |
|---------|------|------|
| Punto de partida | Idea informal | Brief existente + hallazgo concreto |
| Objetivo | Producir brief | Mitigar hallazgo (modificar brief existente) |
| Ciclo | steps del modo inicial, secuencial | step-r1..r5 en loop |
| Cierre | step-09 handoff (estado BRIEF_LISTO) | step-r5 cerrar hallazgo (volver a r1 o EN_USO) |

## Disciplina

1. Lee step-rN.md completo antes de actuar.
2. **Antes de step-r2**: revisa `casos-no-felices.md` por si el escenario aplica.
3. **En step-r2**: lee contrato del proceso afectado + codigo en evidencia + work_origen.
4. **En step-r3**: diff explicito al brief, no abstracto.
5. **En step-r4**: marca inline `<!-- HZ-NNN -->` siempre.
6. Prefijo `A-Mary:` siempre.

## Invitaciones tipicas

- Sentinel si el hallazgo toca capa de seguridad.
- John si toca regla operativa/contable.
- Winston si la mitigacion implica decision arquitectonica.
