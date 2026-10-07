---
description: Crear snapshot limpio brief.v{N+1}.md preservando hallazgos como historial. Comando manual; Mary sugiere automaticamente cuando >10 hallazgos aplicados en un proceso.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# /disenar consolidar-brief {slug}

Pre-requisitos:

- Diseño existe.
- Estado: `EN_USO` o `BRIEF_LISTO` (no funciona en `EN_RETROCESO` ni `OBSOLETO`).
- Existen >=3 hallazgos en estado `aplicado` (umbral minimo para que valga la pena consolidar).

## Flujo

1. Determinar version siguiente: leer `brief_version` del frontmatter, +1.
2. Crear `brief.v{N+1}.md` con contenido aplicado limpio (sin marcas inline `<!-- HZ-NNN -->`).
3. Mover `brief.md` a `brief.v{N}.md` (preservar version anterior).
4. Hacer simbolico `brief.md` -> `brief.v{N+1}.md`. Si el sistema operativo no soporta symlink (Windows sin permisos): copiar y dejar README explicando que `brief.md` siempre es la version vigente.
5. Mover archivos de hallazgos aplicados con marca de version a `hallazgos/archive/v{N}/`.
6. Actualizar frontmatter de cada hallazgo movido: agregar `consolidado_en: v{N+1}`.
7. Anotar en bitacora.

## Salida

```
A-Mary: Diseño {slug} consolidado.

brief_version: {N} -> {N+1}.
Hallazgos archivados: {K}.
Brief actual (limpio sin marcas): brief.md (-> brief.v{N+1}.md).
Historial preservado: brief.v{N}.md, hallazgos/archive/v{N}/.

Works consumidores con brief por path siguen viendo brief.md sin
sincronizar — apunta a la version vigente.
```
