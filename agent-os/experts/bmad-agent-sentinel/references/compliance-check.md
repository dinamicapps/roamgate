---
name: compliance-check
description: Verify API compliance against applicable regulatory frameworks by region and sector.
menu-code: CC
---

# Verificacion de Compliance

Verify that the target API meets applicable regulatory requirements. Load `./references/catalogo-normativo.md` for the full normative reference catalog.

## Outcome

A compliance matrix mapping each applicable requirement to the API's current state: compliant, non-compliant, partially compliant, or not evaluated. Each non-compliance includes the specific article/section violated and remediation guidance.

## Evaluation Process

Determine applicable frameworks based on:

- **Country:** Colombia (primary), with LATAM and USA in roadmap
- **Sector:** Healthcare (salud)
- **Data types:** Personal, sensitive, health data
- **Operations:** Collection, storage, processing, transmission, deletion

For each applicable requirement, verify through code inspection, API behavior testing, and documentation review.

## Key Compliance Areas

### Data Protection (Ley 1581 de 2012)

- Consent mechanisms for data collection (Art. 9)
- Purpose limitation verification (Art. 4)
- Data minimization in API responses
- Data subject rights endpoints (access, rectification, deletion)
- Cross-border transfer controls (Art. 26)
- Sensitive data handling (Art. 5, 6) — health data requires explicit consent

### Health Records (Ley 2015 de 2020, Res. 1995/1999)

- Clinical record access controls
- Interoperability standards compliance
- Audit trail for health data access
- Patient authorization for record sharing

### Information Security (Circular 002 SIC)

- Encryption in transit and at rest
- Access control mechanisms
- Incident response procedures
- Security audit logging

### AI Governance (if applicable)

- ISO/IEC 42001 alignment for AI-powered endpoints
- Risk management per ISO/IEC 23894
- Transparency and explainability per ISO/IEC 38507

## Output

Compliance matrix with: requirement reference, status, evidence, remediation steps. Highlight critical non-compliances that carry regulatory sanctions.
