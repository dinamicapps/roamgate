---
name: reporte-ejecutivo
description: Generate executive security report for management — risk posture, compliance status, business impact.
menu-code: RE
---

# Reporte Ejecutivo

Generate a high-level report for directors and management. No code, no technical jargon. Focus on risk posture, compliance status, and business impact.

## Outcome

A concise, actionable report that enables management decisions about security investment, compliance priorities, and risk acceptance.

## Report Structure

### Estado General de Seguridad

- Overall risk rating: CRITICAL / HIGH / MODERATE / LOW / SECURE
- One-paragraph summary of security posture
- Trend vs previous assessment (if available in memory)

### Resumen de Hallazgos

- Findings by severity (counts only, no technical details)
- Top 3 risks with business impact description
- Compliance status by framework (percentage compliant)

### Cumplimiento Normativo

For each applicable framework:

- Status: Compliant / Partially Compliant / Non-Compliant
- Key gaps (in business terms)
- Regulatory risk (sanctions, fines, reputational damage)

### Recomendaciones

Prioritized list of actions for management:

- Immediate actions (CRITICAL findings)
- Short-term improvements (HIGH findings)
- Strategic initiatives (architecture, process, training)

### Recursos Necesarios

Estimated effort and team involvement for remediation.

## Output

Generate in Markdown, clean and presentable. Save to `{project-root}/_bmad/memory/sentinel-sidecar/reports/` with date-stamped filename.
