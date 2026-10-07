---
name: documentar-patron-permisos
description: Produce or update the repo's permission pattern standard at agent-os/standards/security/permisos-repo.md based on codebase grep + guided user interview.
menu-code: DP
---

# Documentar Patron de Permisos del Repo

Produce or update `agent-os/standards/security/permisos-repo.md` so it becomes the operative source of truth for how this repo applies permissions. This standard is consumed by Bob (E2 validation), Amelia/Atlas (E3 application), and Quinn+Sentinel (E4 verification).

## When to use

- Activated in the plan piece (E2) of the governed flow (`/alfred`) when the abordaje (Fase 2) classified `permisos_repo_estado: no_documentado` (mission as co-host with prefix `A-Sentinel:`, invited by whoever hosts the plan piece — Winston, or Bob by default).
- Activated standalone by the user (`/run-skill bmad-agent-sentinel DP`) outside of the governed flow, to bootstrap the standard for the first time.
- Activated to update an existing standard when the repo introduces a new authentication mechanism, session type, or domain prefix.

## Outcome

`agent-os/standards/security/permisos-repo.md` exists in the repo and passes the "documento sustantivo" heuristic (>300 chars no-template, sections 3 and 5 substantively populated) defined in `agent-os/skills/cargar-standards/references/permisos-repo-detection.md`. Sections 1-7 are filled (8 is optional). The file is committed in the same branch as the work that produced it.

## Procedure

### 1. Discovery via codebase grep

Run focused searches to detect the actual pattern in code (not what the user thinks the pattern is — what the code says it is):

- **Authentication mechanism:**
  - `[Authorize]` decorations and their arguments.
  - Custom session extraction methods (`obtenerUsuarioEmpresaSesion`, `obtenerUsuarioTerceroSesion`, equivalents in other naming).
  - JWT bearer setup in startup configuration.
  - Custom middleware or action filters that touch authentication.

- **Permission check pattern:**
  - `TienePermiso\("([A-Z0-9]+)"\)` and variants (`HasPermission`, `Authorize(Roles = ...)`).
  - String literals matching common code formats (`^[A-Z]{2}\d{3}$`, `^[A-Z]+_[A-Z]+$`, etc.).

- **Session types:**
  - Class names in session contexts (`UsuarioEmpresaSesion`, `UsuarioTerceroSesion`, `UserSession`, `AdminSession`).
  - Where each session type is extracted (controller subdirectory, attribute, etc.).

- **Server-to-server / public exceptions:**
  - `[RegistryEndpoint]`, `[AllowAnonymous]`, webhooks routes, healthchecks.
  - Files with public routes that lack permission checks.

- **Permission storage:**
  - Where the user's permissions are stored (`CRM_PERFIL.opciones`, `User.Claims`, dedicated tables).
  - How they are loaded into the session.

Report findings to the user inline as a draft outline before writing the file. The user confirms or corrects.

### 2. Guided interview to fill ambiguities

For any aspect that grep cannot answer with confidence, ask the user one question at a time, in order:

1. "When the user is not authenticated, what does this repo return — 401, 403, redirect, or something else?"
2. "How are session types separated in your codebase — by route prefix, by controller subdirectory, by attribute, or none?"
3. "What is the format of permission codes in this repo? (regex)"
4. "Which prefixes are vigentes today, and what dominio does each represent?"
5. "Are there public endpoints (no session required) that you consider legitimate? Webhooks, healthchecks, callbacks?"
6. "Does the repo have permissions that *modulate behavior* in BL/service (not deny access, just change the result)? If yes, give one example."

Each answer maps to one section of the output file.

### 3. Write the standard

Produce `agent-os/standards/security/permisos-repo.md` with sections 1-7 populated (section 8 optional). Use the structure documented in `agent-os/standards/security/permisos-repo.template.md` as reference.

Critical content per section:

- **Section 1 — Mecanismo de autenticacion:** describe how the user is identified per request, where the session lives, and the convention for handling absence of session.
- **Section 2 — Sesiones disponibles:** list session types and when each applies. Mixing rules.
- **Section 3 — Codigos de permiso:** format (regex), prefixes, where stored, how consulted.
- **Section 4 — Catalogo vivo:** seed table with permissions found in code. One row per permission discovered via grep. The table is maintained over time (every work that creates a new permission appends here in the same commit).
- **Section 5 — Como aplicar un permiso:** snippet representativo. Where the check lives by default (controller).
- **Section 6 — Reglas de decision reutilizar vs nuevo:** rules concrete to this repo, not generic. Refine the user's answer.
- **Section 7 — Excepciones documentadas:** public endpoints with justification.
- **Section 8 — Restriccion vs modulacion:** include only if the user confirmed in question 6 that the repo distinguishes both. Otherwise skip.

### 4. Validate against the heuristic

Run mentally: does sections 3 and 5 have non-stub content? Is the file >300 chars without the template scaffold? If yes, the file passes the heuristic (`agent-os/skills/cargar-standards/references/permisos-repo-detection.md`).

### 5. Commit

The file is committed as part of the active work branch (or as a standalone commit if invoked outside the governed flow). Commit message: `docs(security): documentar patron de permisos del repo`.

If invoked from the governed flow (`/alfred`) as co-host of the plan piece (E2), the commit happens before E2 closes. Sentinel sets `permisos_repo_estado: documentado` in the README **via the runtime**, not by hand: `echo '{"permisos_repo_estado":"documentado"}' | agentos work set-fm --slug <slug>` (add `"permisos_repo_path":"<ruta>"` if the pattern lives outside the canonical path → use `documentado_externo` instead). See `bmad-agent-alfred/gestion/set-fm.md`. If the binary returns `ok:false`, surface `error.mensaje` and do not close E2.

## Failure modes

- **Codebase has multiple inconsistent patterns** (legacy + new) → document both with explicit "vigente desde fecha X" markers. Section 6 (decision rules) addresses how to choose.
- **User cannot answer questions** → register what is known, mark unanswered sections with `(STUB — pendiente: {pregunta})`. The file does NOT pass the heuristic until those sections are completed. T-001 INDISPENSABLE-PRE-EJECUCION remains pending.
- **No permission system exists** in the repo (everything is public or only authentication) → document this explicitly. Section 3: "este repo no usa sistema de permisos granular; toda accion autenticada es legitima". The work proceeding under this standard MUST register `capa_seguridad.aplica: false` with this justification, or override `permisos_no_aplica: true` during the abordaje (Fase 2).

## Outputs

- `agent-os/standards/security/permisos-repo.md` — the file itself.
- Verbal summary to the plan piece host (Winston or Bob) under the governed flow, or to the user in standalone: sections produced, pending questions if any, suggestion of next step.
