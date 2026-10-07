---
name: expediente
description: Conduce la fase investigativa de cumplimiento normativo. Mary anfitriona; Dexter (BD) y Sentinel (compliance) invitados. El runtime gobierna estado/versionado/trazas.
---

# Skill: expediente (cumplimiento normativo)

> Anfitriona: Mary (`A-Mary:`). Invitados: Dexter (gap BD, lectura prod P-D4), Sentinel (compliance).
> El binario gobierna forma/estado; Mary produce el contenido. Invocar el binario via Bash (sin BOM).

## Subcomando `iniciar`

### Step 1: Semilla + identificacion de la fuente normativa

Mary pregunta/confirma: que norma(s) aplican, donde estan las fuentes crudas (path), y la
cadena de vigencia conocida (que deroga/modifica que). Registra en bitacora.

### Step 2: Crear el expediente

`agentos expediente crear --slug {slug} --dominio "{dominio}"`.

### Step 3: Ingestar la(s) fuente(s)

Por cada norma, `agentos expediente ingestar-fuente --slug {slug}` con JSON por stdin
(norma, tipo, fecha_vigencia, deroga[], modifica[], fuente_cruda). Una version por ingesta.

### Step 4: Descomponer en requisitos atomicos

Mary lee la norma (usando domain-research / external-context para contexto) y materializa
un requisito por exigencia atomica, anclado a articulo/anexo:
`agentos expediente requisito add --slug {slug}` (JSON por stdin). La norma del requisito
DEBE estar en fuentes[] (el binario lo valida).

### Step 5: Gap analysis (Dexter + Sentinel)

Por cada requisito, confrontar contra repo + BD. **Dexter invitado** (lectura prod, P-D4):
existe la columna/tabla/SP que el requisito exige? **Sentinel** si toca seguridad/compliance.
Poblar `estado_gap` / `accion` / `severidad` con `expediente requisito set` y la prosa del gap
en `gap/` + cuerpo del R-NNN.

### Step 6: Trazado (si ya hay diseños/works)

`agentos expediente trazar --slug {slug} --requisito R-NNN --diseno {slug}` (o --work/--test).
El binario rechaza trazas a diseños/works inexistentes.

### Step 7: Cierre

`agentos expediente transition --slug {slug} --a VIGENTE` cuando el primer analisis esta completo.

## Subcomando `ingestar-norma` (mantenibilidad — el corazon)

1. `expediente ingestar-fuente` (norma posterior; versiona + actualiza cadena).
2. `expediente diff --desde {v_anterior} --hasta {v_nueva}` (nacen/derogados).
3. Mary interpreta el diff semanticamente; re-fecha requisitos que cambian (`nacido_en_version`)
   y declara cuales se derogan.
4. `expediente marcar-revision --requisito R-NNN[,...]` (cascada como reporte; NO muta diseños/works).
5. Presentar el reporte de impacto al usuario (diseños/works afectados).

## Subcomando `revisar`

Por cada requisito en `requiere_revision`: Mary decide vigente / derogado / ajustar, via
`expediente requisito set`. Al terminar, `expediente sincronizar` deriva VIGENTE.

## Prohibiciones

- NO mutar el frontmatter de diseños/works ajenos desde el expediente (la cascada es reporte).
- NO duplicar las fuentes crudas dentro del expediente (se referencian por path).
- NO escribir estado/version a mano: usar los verbos del binario.
