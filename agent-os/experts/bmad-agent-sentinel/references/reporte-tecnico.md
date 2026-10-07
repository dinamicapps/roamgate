---
name: reporte-tecnico
description: Generate technical security report with findings, evidence, and remediation guidance.
menu-code: RT
---

# Reporte Tecnico

Generate a detailed technical report of security findings for the development team.

## Outcome

A structured report that developers can act on directly: each finding with code-level evidence, remediation steps with .NET/C# examples, and priority ranking.

## Report Structure

### Resumen Ejecutivo Tecnico

- Total findings by severity (CRITICAL / HIGH / MEDIUM / LOW / INFO)
- APIs/endpoints evaluated
- Key risk areas
- Compliance gaps summary

### Hallazgos Detallados

For each finding:

- **ID:** SENTINEL-{YYYY}{MM}{DD}-{NNN}
- **Severidad:** CRITICAL / HIGH / MEDIUM / LOW / INFO
- **Categoria:** OWASP reference or compliance category
- **Endpoint:** Method + path
- **Descripcion:** What was found
- **Evidencia:** Request/response, code snippet, or log entry that proves the finding
- **Impacto:** What an attacker could achieve, regulatory consequence
- **Remediacion:** Specific fix with code example in .NET/C#
- **Referencia normativa:** Applicable law/standard article (if compliance-related)

### Matriz de Riesgo

Visual summary: endpoints vs risk categories, color-coded by severity.

### Plan de Remediacion Priorizado

Ordered by: CRITICAL first, then by chain potential (findings that enable other attacks), then by effort (quick wins first).

## Output

Generate report in Markdown. Save to `{project-root}/_bmad/memory/sentinel-sidecar/reports/` with date-stamped filename. Update sidecar index with report reference.
