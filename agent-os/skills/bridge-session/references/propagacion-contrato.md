# Propagacion de contrato acordado al repo

Los contratos viven en dos lugares:
- **En discusion:** `grupo-{nombre}/contratos/borradores/` y `grupo-{nombre}/contratos/acordados/`.
- **Estable en repo:** `.documentacion/contratos-externos/{sistema-destino}/{endpoint}.yml`.

La propagacion de `acordados/` al repo es un paso explicito del cierre de sesion.

## Cuando propagar

Al cerrar una sesion del grupo con:
- `resultado: aprobada`
- `ambos_lados_confirmaron: true` (hay evidencia de director y colaboradores en `ejecucion.md`)
- Contratos con version acordada en `contratos/acordados/`

## Pasos de propagacion

1. Para cada contrato en `contratos/acordados/{endpoint}-v{N}.yml`:
   a. Ubicar archivo destino en `.documentacion/contratos-externos/{sistema-destino}/{endpoint}.yml` (crear si no existe).
   b. Si existe: leer `contrato_version` actual, verificar que `N > version_actual`.
   c. Sobrescribir archivo con contenido del acordado, manteniendo `changelog` acumulado (merge: agregar nueva entrada al tope).
   d. Rellenar `ultima_prueba_exitosa`:
      - `fecha`: fecha de cierre de sesion
      - `work`: nombre del work-record director
      - `grupo`: nombre del grupo
      - `sesion`: slug de la sesion
      - `ambos_lados_confirmaron: true`
   e. Agregar entrada al `changelog` con `ultima_prueba_exitosa_en_v{N}: {fecha}`.

2. Actualizar `.documentacion/contratos-externos/_indice.yml`:
   a. Si el endpoint ya existe: actualizar `version_actual` y `ultima_prueba_exitosa`.
   b. Si es nuevo: agregar entrada completa.

3. Registrar en `sesiones/{slug}/reporte.md` tabla "Contratos acordados en esta sesion" con columna `Propagado al repo: si`.

4. Registrar en `grupo-{nombre}/bitacora.md`: "Contrato {endpoint} v{N} propagado al repo. Commit: {hash}".

## Gate

Si al cerrar sesion quedan contratos en `acordados/` sin propagar, reportar al usuario y pedir decision:
- Propagar ahora (ejecuta pasos 1-4).
- Diferir al cierre de Etapa 4 del work.
- Rechazar propagacion (documentar razon en `reporte.md`).

## Commit

La propagacion se commitea como parte del cierre de sesion con mensaje:

```
docs(contratos): propagar {endpoint} v{N} al repo tras sesion {slug}

Sesion: grupo-{nombre}/sesiones/{slug}
Evidencia ambos lados: director + {colaboradores}
```
