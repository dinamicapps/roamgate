# Plantilla: Data flow back-trace (TR-10)

## Contexto

El brief declara datos criticos (entidades, actores, sesiones) y dependencias reusables (services, contextos, helpers). Cada uno asume invariantes implicitos del codigo existente. Cuando el brief contradice un invariante implicito sin declararlo, el work consumidor lo descubre tarde (E3/E4) con costo alto.

**Esta tecnica mira hacia ADENTRO del codigo existente, no hacia afuera.** Complementa red-team (que busca superficie no cubierta hacia afuera) cazando contradicciones internas entre brief y codigo real.

## Cuando se invoca

- **Bloqueante en cierre de step-01 (el FOCO; step-02 en el regimen `lineal`)** cuando el modelo o el brief declara >=1 dependencia reusable o >=2 actores distintos.
- Ad-hoc en step-05 cuando una decision arquitectonica reusa codigo existente.
- Ad-hoc en step-06 si red-team levanta dudas sobre invariantes tecnicos.

## Pasos

### Paso 1 — Listar datos criticos del brief

Mary extrae del brief en construccion:

- **Entidades** mencionadas (tablas, agregados, value objects).
- **Actores** declarados (usuario empresa, operador soporte, sistema externo, job).
- **Sesiones / contextos de ejecucion** (cookie X, header Y, identidad Z).

Output parcial:

```
Datos criticos detectados:
  - Entidad: Empresa, Configuracion, Transaccion, ...
  - Actor: Operador BackOffice-ERI (correo @dinamicapps.co)
  - Actor: Usuario empresa cliente
  - Sesion: cookie eri_token (tabla SesionBackofficeCentral)
  - Sesion: header Authorization (tenant resolution)
```

### Paso 2 — Listar dependencias reusables del brief

Buscar en el brief la seccion "dependencias inyectadas existentes (reusables)" o equivalente. Listar cada `IXxxService`, `IXxxContext`, helper, middleware mencionado como reusable.

Output parcial:

```
Dependencias reusables declaradas:
  - IhceDbContext
  - IEncryptionService
  - IEmpresaService
  - IActivacionService
  - ITenantContext
  - IGranjaState
  - TokenOfuscadorAuthHandler
  - RegistryAuthHandler
  - TenantResolutionMiddleware
```

### Paso 3 — Grep en el repo huesped (y reusables relevantes)

Para cada dato critico y cada dependencia reusable:

```bash
# Definicion de cada dependencia reusable
rg --type=cs "(class|interface)\s+IhceDbContext\b" {repo}
rg --type=cs "(class|interface)\s+ITenantContext\b" {repo}
# ... idem para cada uno

# Uso de cada dependencia para detectar invariantes implicitos
rg --type=cs "_tenantContext\." {repo} | head -20
rg --type=cs "TenantResuelto" {repo}

# Definicion de actores (sesiones, identidades, claims)
rg --type=cs "SesionBackofficeCentral\b" {repo}
rg --type=cs "ClaimsPrincipal" {repo}/Auth/
```

Reportar para cada item:

- Archivo:linea de la definicion.
- Asunciones de actor / sesion / contexto detectadas (firmas que requieren tenant resuelto, query filters globales que filtran por idEmpresa, middleware que setea contexto solo para ciertos paths, etc.).
- Invariantes implicitos no declarados en el brief.

### Paso 4 — Cruzar y declarar invariantes-puente

Para cada dato critico del brief, preguntarse:

> "Cuando el actor X invoca la dependencia reusable Y, ¿la asuncion implicita del codigo de Y se cumple?"

Si la respuesta es "no" o "no esta claro": **invariante-puente** que el brief debe declarar.

Output esperado: tabla anexada al brief en seccion `## Invariantes-puente`.

```
## Invariantes-puente (de TR-10 data flow back-trace)

| ID | Actor | Dependencia | Invariante implicito del codigo | Brief lo cumple? | Decision |
|----|-------|-------------|--------------------------------|------------------|----------|
| INV-PUENTE-01 | Operador BackOffice-ERI | ITenantContext + Global Query Filter | El query filter de IhceDbContext filtra por _tenantContext.IdEmpresa. Asume TenantResuelto = true. | NO — operador ERI no resuelve TenantContext (no es tenant) | Todo service del panel ERI que toque entidades multi-tenant DEBE usar IBackOfficeQueryService o IgnoreQueryFilters() explicito. Services legacy reusables que dependen de ITenantContext NO son reusables sin envoltura. |
| INV-PUENTE-02 | ... | ... | ... | ... | ... |
```

### Paso 5 — Propagacion al brief y al gate de cierre del work consumidor

Cada `INV-PUENTE-NN` declarado:

- Se incorpora al brief en seccion `## Invariantes-puente`.
- Genera CA explicito que el work consumidor debe verificar en E4 (Quinn).
- Si afecta a una dependencia reusable, esta se reclasifica como "reusable con envoltura: {regla}" en el brief, no como "reusable directo".

## Salida esperada

1. Bloque anexado al brief:

```
## Invariantes-puente (de TR-10 data flow back-trace)

(tabla del paso 4)
```

2. Entrada en `bitacora.md`:

```
## YYYY-MM-DD — TR-10 Data flow back-trace aplicado en step-{02|05|06}

Mary aplico la tecnica sobre {N} datos criticos y {M} dependencias reusables.
Detecto {K} invariantes-puente (INV-PUENTE-01 a INV-PUENTE-{K}).
Anexados al brief en seccion "Invariantes-puente".
```

3. Si TR-10 NO levanta invariantes-puente nuevos, registrar igualmente en bitacora con frase explicita: *"TR-10 ejecutado, 0 invariantes-puente nuevos detectados. Razon: {por que el brief ya cubre todas las contradicciones potenciales}."* Esto previene "ejecutado en automatico sin pensar".

## Cierre

Mary presenta los `INV-PUENTE-NN` al usuario:

```
A-Mary: Apliqué TR-10 data flow back-trace sobre {N} datos criticos y {M}
        dependencias reusables del brief. Detecte {K} invariantes-puente que
        el brief no declaraba explicitamente:

  INV-PUENTE-01: {resumen breve, 2-3 lineas}
  INV-PUENTE-02: ...

  Cada uno genera regla nueva en el brief y CA verificable por Quinn en E4
  del work consumidor. ¿Procedo a anexarlos?
```

Usuario aprueba / edita / descarta con razon. Decisiones registradas en `bitacora.md`.

## Anti-patron a evitar

**Aplicar TR-10 sobre cada nombre del brief sin priorizar.** El catalogo es: actores + sesiones + dependencias reusables explicitas. Aplicarlo sobre cada entidad de BD, cada controller, cada flag, infla el cierre y diluye el foco. Si una entidad no cruza con un actor o una dependencia reusable, no genera invariante-puente — saltarla.

**Confundir TR-10 con red-team.** Red-team busca superficie no cubierta hacia afuera (escenarios, regulaciones, edge funcionales). TR-10 busca contradicciones hacia adentro (brief vs codigo). Son complementarias; aplicar las dos al cierre del brief.

**Saltar TR-10 cuando hay >=1 dependencia reusable.** Es bloqueante de cierre del step-01 (el FOCO; step-02 en el regimen `lineal`) cuando aplica. Saltarlo requiere override explicito del usuario con razon en bitacora.
